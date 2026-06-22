/**
 * multi-agent.ts — Orquestación multi-agente con handoffs tipados
 * DÍA 3: Multi-Agent Orchestration — Patrones de coordinación
 *
 * CONCEPTOS CLAVE:
 * - Orchestrator: sabe QUÉ hacer, delega el CÓMO
 * - Subagente: experto en un dominio, ejecuta una tarea específica
 * - Handoff tipado: contexto estructurado entre agentes, sin pérdida de información
 * - Human-in-the-loop: pausa para revisión humana antes de acciones de alto impacto
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const MODEL = 'claude-3-5-haiku-20241022' as const;

// ============================================================================
// TAREA 3.1: TIPOS DE HANDOFF
// ============================================================================

/**
 * OrchestratorPlan — El plan que el Orchestrator entrega a los subagentes
 *
 * El Orchestrator NO ejecuta la tarea — crea el plan y delega.
 * Cada subtarea en el plan es independiente y ejecutable por un subagente.
 */
export interface OrchestratorPlan {
  originalRequest: string;
  subtasks: Array<{
    id: string;
    description: string;
    assignedAgent: string;     // qué tipo de agente debe ejecutar esto
    dependencies: string[];    // IDs de subtareas que deben completarse antes
    priority: number;          // orden de ejecución (1 = primero)
    context: string;           // información necesaria para ejecutar esta subtask
  }>;
  expectedOutput: string;      // descripción del output final esperado
  orchestratorReasoning: string;
}

/**
 * SubagentResult — El resultado de un subagente completando su subtask
 */
export interface SubagentResult {
  subtaskId: string;
  agentName: string;
  output: string;
  success: boolean;
  latencyMs: number;
  tokens: { input: number; output: number };
  error?: string;
}

/**
 * AggregatedResult — El resultado final después de agregar todos los subagentes
 */
export interface AggregatedResult {
  originalRequest: string;
  subtaskResults: SubagentResult[];
  finalSynthesis: string;
  requiresHumanReview: boolean;
  confidence: number;
}

// ============================================================================
// TAREA 3.2: ORCHESTRATOR
// ============================================================================

/**
 * Orchestrator — Descompone tareas y coordina subagentes
 *
 * El problema (sin Orchestrator):
 * ```typescript
 * // Un solo agente hace todo — mezcla de responsabilidades,
 * // difícil de debuggear, no escala a tareas complejas
 * const result = await bigAgent.doEverything(request);
 * ```
 *
 * Con Orchestrator:
 * ```typescript
 * const plan = await orchestrator.plan(request);
 * const results = await Promise.all(plan.subtasks.map(t => subagent.execute(t)));
 * const final = await orchestrator.aggregate(results);
 * ```
 *
 * Aplicación Healthcare:
 * "Evalúa si este paciente puede ser dado de alta" puede descomponerse en:
 * - Revisar signos vitales estables (SubagentA)
 * - Verificar que el dolor está controlado (SubagentB)
 * - Confirmar que tiene red de apoyo en casa (SubagentC)
 * - Verificar que entiende su tratamiento (SubagentD)
 */
export class Orchestrator {
  private readonly systemPrompt = `Eres un orquestador de tareas clínicas.
Tu función es descomponer solicitudes médicas complejas en subtareas
específicas y asignables a agentes especializados.

REGLAS:
1. Genera 2-4 subtareas máximo por solicitud
2. Cada subtarea debe ser ejecutable de forma independiente
3. Define las dependencias entre subtareas explícitamente
4. Asigna cada subtarea al tipo de agente más apropiado
5. Responde SIEMPRE con JSON válido`;

  /**
   * plan — Crea el plan de ejecución para una solicitud
   */
  async plan(request: string): Promise<OrchestratorPlan> {
    // EJERCICIO: implementar
    // 1. Llamar al modelo con el request y systemPrompt
    // 2. Parsear el JSON de respuesta
    // 3. Retornar OrchestratorPlan
    throw new Error('TODO: implementar Orchestrator.plan()');
  }

  /**
   * aggregate — Sintetiza los resultados de todos los subagentes
   *
   * El Orchestrator no solo delega — también tiene que integrar los resultados
   * en una respuesta coherente para el usuario final.
   */
  async aggregate(
    originalRequest: string,
    results: SubagentResult[],
  ): Promise<AggregatedResult> {
    // EJERCICIO: implementar
    // 1. Construir un prompt que incluya todos los resultados de los subagentes
    // 2. Pedirle al modelo que los sintetice en una respuesta final
    // 3. Determinar si requiresHumanReview basado en el contenido
    throw new Error('TODO: implementar Orchestrator.aggregate()');
  }
}

// ============================================================================
// TAREA 3.3: SUBAGENTE ESPECIALIZADO
// ============================================================================

/**
 * ClinicalSubagent — Un subagente especializado en un dominio clínico
 *
 * Los subagentes son simples — reciben una subtarea y la ejecutan.
 * No conocen el plan completo, solo su parte.
 */
export class ClinicalSubagent {
  constructor(
    private readonly specialty: string,
    private readonly systemPrompt: string,
  ) {}

  /**
   * execute — Ejecuta una subtarea del plan del Orchestrator
   */
  async execute(subtask: OrchestratorPlan['subtasks'][number]): Promise<SubagentResult> {
    // EJERCICIO: implementar
    // 1. Construir el mensaje con el contexto de la subtarea
    // 2. Llamar al modelo con el systemPrompt de especialidad
    // 3. Retornar SubagentResult con latencia y tokens
    throw new Error('TODO: implementar ClinicalSubagent.execute()');
  }
}

// ============================================================================
// TAREA 3.4: HUMAN-IN-THE-LOOP CHECKPOINT
// ============================================================================

/**
 * HumanReviewCheckpoint — Pausa el pipeline para revisión humana
 *
 * Aplicación Healthcare:
 * Antes de generar un reporte que llegará a un médico real,
 * el sistema puede pausar y mostrar el análisis preliminar para
 * que el médico lo valide o enriquezca con contexto clínico adicional.
 */
export class HumanReviewCheckpoint {
  /**
   * review — Presenta el análisis y espera la decisión del usuario
   */
  async review(analysisData: {
    title: string;
    summary: string;
    concerningFindings?: string[];
    proposedActions?: string[];
  }): Promise<{
    decision: 'approve' | 'reject' | 'modify';
    additionalContext?: string;
    modificationNotes?: string;
  }> {
    // EJERCICIO: implementar usando readline para leer input del usuario
    console.log('\n' + '═'.repeat(60));
    console.log('⚠️  REVISIÓN HUMANA REQUERIDA');
    console.log('═'.repeat(60));
    console.log(`\n📋 ${analysisData.title}`);
    console.log(`\nResumen: ${analysisData.summary}`);

    if (analysisData.concerningFindings && analysisData.concerningFindings.length > 0) {
      console.log('\n🔍 Hallazgos que requieren atención:');
      analysisData.concerningFindings.forEach(f => console.log(`  • ${f}`));
    }

    if (analysisData.proposedActions && analysisData.proposedActions.length > 0) {
      console.log('\n📝 Acciones propuestas:');
      analysisData.proposedActions.forEach(a => console.log(`  → ${a}`));
    }

    // EJERCICIO: leer la decisión del usuario por consola
    // Opciones: [A]probar, [R]echazar, [M]odificar con contexto adicional
    // Por ahora retornamos approve para no bloquear el ejercicio
    console.log('\n→ Implementa la lectura de input con readline');
    console.log('  Por ahora: auto-aprobando para continuar el ejercicio');

    return { decision: 'approve' };
  }
}

// ============================================================================
// MAIN — Demostrar el patrón Orchestrator/Subagente
// ============================================================================

const main = async () => {
  console.log('=== DÍA 3: Multi-Agent Orchestration ===\n');

  const orchestrator = new Orchestrator();
  const checkpoint = new HumanReviewCheckpoint();

  // Subagentes especializados
  const vitalSignsAgent = new ClinicalSubagent(
    'signos vitales',
    'Eres un especialista en interpretación de signos vitales hospitalarios.',
  );

  const labResultsAgent = new ClinicalSubagent(
    'laboratorio',
    'Eres un especialista en interpretación de resultados de laboratorio clínico.',
  );

  // Solicitud de ejemplo
  const request = `
    Evalúa si el paciente P-001 (Juan García, 67 años, diabético e hipertenso)
    puede ser dado de alta hoy. Sus últimos signos vitales: TA 135/85, FC 78, T 36.8°C, SpO2 97%.
    Labs recientes: Glucosa 185 mg/dL, Creatinina 1.4 mg/dL, K+ 4.8 mEq/L.
  `;

  console.log('📋 Solicitud:', request.trim());
  console.log('─'.repeat(60));

  try {
    // 1. Planificar
    console.log('\n🎯 Creando plan de ejecución...');
    const plan = await orchestrator.plan(request);
    console.log(`Plan creado con ${plan.subtasks.length} subtareas:`);
    plan.subtasks.forEach(t => console.log(`  ${t.priority}. [${t.assignedAgent}] ${t.description}`));

    // 2. Ejecutar subagentes
    console.log('\n⚙️  Ejecutando subagentes...');
    const results: SubagentResult[] = [];
    for (const subtask of plan.subtasks.sort((a, b) => a.priority - b.priority)) {
      const agent = subtask.assignedAgent.includes('vital') ? vitalSignsAgent : labResultsAgent;
      const result = await agent.execute(subtask);
      results.push(result);
      console.log(`  ✅ [${result.agentName}] Completado en ${result.latencyMs}ms`);
    }

    // 3. Agregar resultados
    console.log('\n🔄 Sintetizando resultados...');
    const aggregated = await orchestrator.aggregate(request, results);

    // 4. Human review si es necesario
    if (aggregated.requiresHumanReview) {
      const reviewDecision = await checkpoint.review({
        title: 'Evaluación de Alta Hospitalaria',
        summary: aggregated.finalSynthesis.substring(0, 200),
      });
      console.log(`\n👤 Decisión del médico: ${reviewDecision.decision}`);
    }

    // 5. Output final
    console.log('\n✅ SÍNTESIS FINAL:');
    console.log(aggregated.finalSynthesis);
    console.log(`\nConfianza: ${(aggregated.confidence * 100).toFixed(0)}%`);

  } catch {
    console.log('→ Implementa Orchestrator.plan() y ClinicalSubagent.execute() primero');
  }
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 3:
 *
 * 1. ORQUESTACIÓN:
 *    - ¿Qué diferencia observaste entre el Orchestrator y los subagentes?
 *    - ¿Cómo manejas dependencias entre subtareas (A debe terminar antes que B)?
 *
 * 2. HANDOFFS TIPADOS:
 *    - ¿Qué información se perdería si usaras texto libre en lugar de tipos?
 *    - ¿Cómo te protegen los tipos de TypeScript contra errores en el handoff?
 *
 * 3. HUMAN-IN-THE-LOOP:
 *    - ¿En qué tipo de tareas clínicas es mandatorio el checkpoint humano?
 *    - ¿Cómo balanceas automatización con supervisión médica?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Healthcare: El patrón Orchestrator/Subagente es análogo a un equipo médico:
 *   el médico tratante (Orchestrator) coordina, el cardiólogo y nefrólogo
 *   (subagentes) dan su opinión especializada, y el tratante integra todo
 * - Auditoría: El human-in-the-loop es tu firma de aprobación —
 *   ningún proceso crítico se ejecuta sin revisión del responsable
 */
