/**
 * simple-agent.ts — Primer agente con loop ReAct completo
 * DÍA 1: El Loop ReAct — Qué es un Agente de Verdad
 *
 * CONCEPTOS CLAVE:
 * - ReAct = Reason → Act → Observe → repeat
 * - El loop continúa mientras stop_reason === 'tool_use'
 * - Siempre tener un límite de iteraciones (evitar loops infinitos)
 * - Trazar cada paso para entender el razonamiento del agente
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const MODEL = 'claude-3-5-sonnet-20241022' as const;
const MAX_ITERATIONS = 10; // límite de seguridad

// ============================================================================
// TAREA 1.1: DATOS MOCK DEL HOSPITAL (simula una base de datos)
// ============================================================================

/**
 * BASE DE DATOS MOCK — En producción, estos serían llamadas reales a la API del hospital
 * Por ahora, usamos datos ficticios para aprender el patrón del agente.
 */
const mockPatients: Record<string, { name: string; age: number; conditions: string[] }> = {
  'P-001': { name: 'Juan García', age: 67, conditions: ['Diabetes Mellitus Tipo 2', 'Hipertensión arterial'] },
  'P-002': { name: 'María López', age: 45, conditions: ['Asma bronquial'] },
  'P-003': { name: 'Carlos Ruiz', age: 72, conditions: ['Insuficiencia renal crónica', 'Anemia'] },
};

const mockLabResults: Record<string, Array<{ test: string; value: string; unit: string; normalRange: string; date: string }>> = {
  'P-001': [
    { test: 'Glucosa', value: '285', unit: 'mg/dL', normalRange: '70-110', date: '2025-05-05' },
    { test: 'HbA1c', value: '9.8', unit: '%', normalRange: '< 7.0', date: '2025-05-05' },
    { test: 'Creatinina', value: '1.4', unit: 'mg/dL', normalRange: '0.6-1.2', date: '2025-05-05' },
    { test: 'K+', value: '5.8', unit: 'mEq/L', normalRange: '3.5-5.0', date: '2025-05-05' },
  ],
  'P-002': [
    { test: 'Hemoglobina', value: '14.2', unit: 'g/dL', normalRange: '12-16', date: '2025-05-04' },
    { test: 'Leucocitos', value: '8500', unit: '/mm³', normalRange: '4500-11000', date: '2025-05-04' },
  ],
  'P-003': [
    { test: 'Creatinina', value: '6.8', unit: 'mg/dL', normalRange: '0.6-1.2', date: '2025-05-06' },
    { test: 'K+', value: '6.9', unit: 'mEq/L', normalRange: '3.5-5.0', date: '2025-05-06' },
    { test: 'BUN', value: '95', unit: 'mg/dL', normalRange: '7-25', date: '2025-05-06' },
    { test: 'pH', value: '7.19', unit: '', normalRange: '7.35-7.45', date: '2025-05-06' },
  ],
};

const criticalFlags: string[] = [];

// ============================================================================
// TAREA 1.2: DEFINICIÓN DE TOOLS
// ============================================================================

/**
 * clinicalTools — Los tools que el agente puede usar
 *
 * NOTA PEDAGÓGICA: Observa cómo cada descripción responde:
 * - ¿Qué hace este tool exactamente?
 * - ¿Cuándo debo usarlo?
 * - ¿Qué parámetros necesita y en qué formato?
 */
const clinicalTools: Anthropic.Tool[] = [
  {
    name: 'search_patient',
    description: `Busca información básica de un paciente en el sistema hospitalario por su ID.
Úsalo cuando necesites verificar que el paciente existe o conocer sus datos demográficos
y condiciones médicas registradas. No retorna laboratorios — usa get_lab_results para eso.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: {
          type: 'string',
          description: 'ID único del paciente en formato P-XXXXX (ejemplo: P-001, P-123)',
        },
      },
      required: ['patient_id'],
    },
  },
  {
    name: 'get_lab_results',
    description: `Obtiene los resultados de laboratorio más recientes de un paciente.
Retorna valores con sus rangos de referencia para identificar anomalías.
Úsalo después de search_patient cuando necesites analizar resultados de laboratorio.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: {
          type: 'string',
          description: 'ID único del paciente (mismo formato que search_patient)',
        },
        days_back: {
          type: 'number',
          description: 'Cuántos días hacia atrás buscar resultados (1-30, default: 7)',
        },
      },
      required: ['patient_id'],
    },
  },
  {
    name: 'flag_critical_value',
    description: `Registra y notifica un valor de laboratorio crítico que requiere atención médica inmediata.
Úsalo cuando encuentres valores fuera del rango que puedan ser peligrosos para el paciente.
Ejemplo de valores críticos: K+ > 6.0 mEq/L, glucosa > 500 mg/dL, pH < 7.2.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: {
          type: 'string',
          description: 'ID del paciente con el valor crítico',
        },
        test_name: {
          type: 'string',
          description: 'Nombre del estudio con el valor crítico (ej: "K+", "pH", "Glucosa")',
        },
        value: {
          type: 'string',
          description: 'Valor encontrado con su unidad (ej: "6.9 mEq/L", "7.19")',
        },
        severity: {
          type: 'string',
          enum: ['urgente', 'critico'],
          description: '"urgente" = requiere atención en < 30 min, "critico" = atención inmediata',
        },
        clinical_note: {
          type: 'string',
          description: 'Nota clínica breve explicando el riesgo (máximo 100 palabras)',
        },
      },
      required: ['patient_id', 'test_name', 'value', 'severity'],
    },
  },
];

// ============================================================================
// TAREA 1.3: IMPLEMENTACIÓN DE TOOLS (los "ejecutores" reales)
// ============================================================================

/**
 * executeTool — Despacha la ejecución al tool correcto
 *
 * En producción, cada case llamaría una API real.
 * Por ahora, usamos los datos mock del sistema hospitalario ficticio.
 */
const executeTool = (
  toolName: string,
  toolInput: Record<string, unknown>,
): string => {
  switch (toolName) {
    case 'search_patient': {
      const patientId = toolInput['patient_id'] as string;
      const patient = mockPatients[patientId];
      if (!patient) {
        return JSON.stringify({ error: `Paciente ${patientId} no encontrado en el sistema` });
      }
      return JSON.stringify({ patient_id: patientId, ...patient, found: true });
    }

    case 'get_lab_results': {
      const patientId = toolInput['patient_id'] as string;
      const labs = mockLabResults[patientId];
      if (!labs) {
        return JSON.stringify({ error: `No se encontraron laboratorios para ${patientId}` });
      }
      return JSON.stringify({ patient_id: patientId, results: labs, count: labs.length });
    }

    case 'flag_critical_value': {
      const flag = {
        patient_id: toolInput['patient_id'] as string,
        test_name: toolInput['test_name'] as string,
        value: toolInput['value'] as string,
        severity: toolInput['severity'] as string,
        clinical_note: toolInput['clinical_note'] as string ?? '',
        timestamp: new Date().toISOString(),
      };
      criticalFlags.push(JSON.stringify(flag));
      console.log(`  🚨 VALOR CRÍTICO REGISTRADO: ${flag.test_name} = ${flag.value} (${flag.severity})`);
      return JSON.stringify({ success: true, flagged: flag, notification_sent: true });
    }

    default:
      return JSON.stringify({ error: `Tool desconocido: ${toolName}` });
  }
};

// ============================================================================
// TAREA 1.4: EL LOOP ReAct
// ============================================================================

/**
 * AgentStep — Un paso del loop ReAct para trazabilidad
 */
interface AgentStep {
  iteration: number;
  type: 'reasoning' | 'tool_call' | 'tool_result' | 'final_answer';
  content: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
}

/**
 * runClinicalAgent — Ejecuta el agente clínico con loop ReAct
 *
 * El problema (sin loop):
 * ```typescript
 * // Una sola llamada — el agente no puede usar los resultados de tools
 * const response = await client.messages.create({ tools, messages });
 * // Si el modelo quiere usar un tool, no puede — termina aquí
 * ```
 *
 * Con el loop ReAct:
 * ```typescript
 * // El agente puede: razonar → usar tool → ver resultado → razonar de nuevo
 * while (response.stop_reason === 'tool_use') {
 *   // ejecutar tools, agregar resultados, continuar
 * }
 * ```
 *
 * Aplicación Healthcare:
 * Un agente de diagnóstico necesita buscar datos del paciente, analizar labs,
 * y potencialmente buscar guías clínicas — todo en un solo flujo autónomo.
 */
export const runClinicalAgent = async (
  task: string,
  systemPrompt?: string,
): Promise<{ finalResponse: string; steps: AgentStep[]; iterations: number }> => {
  // EJERCICIO: implementar el loop ReAct completo
  // Pasos:
  // 1. Inicializar messages con el task del usuario
  // 2. Llamar al modelo con los tools disponibles
  // 3. Si stop_reason === 'tool_use': ejecutar tools y agregar resultados
  // 4. Si stop_reason === 'end_turn': retornar la respuesta final
  // 5. Si iteraciones > MAX_ITERATIONS: lanzar error controlado
  // 6. Trazar cada paso en el array `steps`
  throw new Error('TODO: implementar runClinicalAgent');
};

// ============================================================================
// MAIN — Prueba el agente con casos clínicos
// ============================================================================

const AGENT_SYSTEM_PROMPT = `Eres un asistente clínico de soporte para médicos de hospital.
Tu función es revisar datos de pacientes e identificar valores de laboratorio que
requieran atención médica inmediata.

REGLAS:
1. Siempre busca primero la información del paciente antes de revisar labs
2. Identifica todos los valores fuera de rango normal
3. Registra TODOS los valores críticos usando flag_critical_value
4. Clasifica como "critico" si el valor pone en riesgo inmediato la vida
5. Al final, da un resumen conciso de los hallazgos al médico
6. NUNCA inventas datos — solo usas lo que retornan los tools`;

const main = async () => {
  console.log('=== DÍA 1: Loop ReAct — Agente Clínico ===\n');

  const task = 'Revisa los últimos laboratorios del paciente P-003 e identifica si hay valores que requieran atención inmediata. Registra cualquier valor crítico.';
  console.log('📋 Tarea:', task);
  console.log('─'.repeat(60));

  try {
    const result = await runClinicalAgent(task, AGENT_SYSTEM_PROMPT);
    console.log('\n✅ Respuesta final del agente:');
    console.log(result.finalResponse);
    console.log(`\n📊 Estadísticas: ${result.iterations} iteraciones, ${result.steps.length} pasos`);

    if (criticalFlags.length > 0) {
      console.log('\n🚨 Valores críticos registrados:', criticalFlags.length);
    }
  } catch (error) {
    console.log('→ Implementa runClinicalAgent primero');
    console.log('  Pista: el agente debe hacer al menos 3 llamadas a tools:');
    console.log('  1. search_patient (buscar P-003)');
    console.log('  2. get_lab_results (obtener labs de P-003)');
    console.log('  3. flag_critical_value (K+ 6.9 es crítico, pH 7.19 también)');
  }
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 1:
 *
 * 1. LOOP ReAct:
 *    - ¿Cuántas iteraciones usó el agente para el paciente P-003?
 *    - ¿Qué razonamiento mostró entre cada tool call?
 *    - ¿Cuándo decidió que había terminado?
 *
 * 2. TOOL USE EN ANTHROPIC SDK:
 *    - ¿Qué campo del response indica que el modelo quiere usar un tool?
 *    - ¿Cómo le devuelves el resultado del tool al modelo?
 *
 * 3. AGENTE VS PROMPT DIRECTO:
 *    - ¿Cuánto tardó el agente vs el prompt directo?
 *    - ¿En qué caso usarías el agente en producción?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología: El loop ReAct es análogo al método científico —
 *   hipótesis → experimento → observación → nueva hipótesis
 * - Healthcare: El agente simula el pensamiento clínico iterativo:
 *   "veamos al paciente → pido estudios → reviso resultados → decido"
 */
