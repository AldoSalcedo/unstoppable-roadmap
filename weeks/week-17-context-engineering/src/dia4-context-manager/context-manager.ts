/**
 * context-manager.ts — Gestión inteligente del context window
 * DÍA 4: Context Window Management — El error más común en producción
 *
 * CONCEPTOS CLAVE:
 * - Truncación silenciosa: el modelo no avisa cuando se queda sin contexto
 * - Chunking semántico: respetar unidades de información, no cortar por caracteres
 * - Ventana deslizante: mantener contexto reciente + resumen del pasado
 * - Prioridad: la información crítica (alergias, dx crónicos) siempre debe caber
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const MODEL = 'claude-3-5-haiku-20241022' as const;

// ============================================================================
// TAREA 4.1: TIPOS DE CONTEXTO CLÍNICO
// ============================================================================

/**
 * ContextPriority — Niveles de prioridad para chunks de contexto
 *
 * En un sistema clínico, no todo el contexto tiene el mismo valor.
 * Las alergias son información crítica que NUNCA se puede perder.
 * Las notas de evolución de hace 2 años pueden resumirse.
 */
export type ContextPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * ClinicalContextType — Tipos de información clínica
 */
export type ClinicalContextType =
  | 'allergy'            // CRÍTICO: nunca debe perderse
  | 'chronic_condition'  // ALTO: diagnósticos crónicos del paciente
  | 'current_medication' // ALTO: medicamentos actuales
  | 'recent_lab'         // MEDIO: labs de los últimos 30 días
  | 'recent_note'        // MEDIO: notas de los últimos 7 días
  | 'historical_lab'     // BAJO: labs de más de 30 días
  | 'historical_note';   // BAJO: notas antiguas

/**
 * ContextChunk — Una unidad de información clínica
 */
export interface ContextChunk {
  id: string;
  content: string;
  type: ClinicalContextType;
  priority: ContextPriority;
  timestamp: Date;
  estimatedTokens: number;    // estimación para evitar llamadas al API
  summary?: string;           // versión resumida (generada por IA si disponible)
}

/**
 * ContextBuildResult — Resultado de construir el contexto para una llamada
 */
export interface ContextBuildResult {
  context: string;
  includedChunks: string[];   // IDs de chunks incluidos
  excludedChunks: string[];   // IDs de chunks excluidos (no cabían)
  totalTokens: number;
  wasConstrained: boolean;    // si se tuvo que excluir algo
}

// ============================================================================
// TAREA 4.2: CONTEXT MANAGER
// ============================================================================

/**
 * ContextManager — Gestiona el contexto clínico de un paciente
 *
 * El problema (sin ContextManager):
 * ```typescript
 * // Enviamos todo el expediente sin control
 * const context = patientHistory.join('\n'); // podría ser 80,000 tokens
 * await callClaude(context); // falla o trunca silenciosamente
 * ```
 *
 * Con ContextManager:
 * ```typescript
 * const manager = new ContextManager(4000); // presupuesto de tokens
 * manager.addChunk({ type: 'allergy', priority: 'critical', ... });
 * manager.addChunk({ type: 'historical_note', priority: 'low', ... });
 * const { context } = await manager.buildContext();
 * // Solo incluye lo que cabe, priorizando lo crítico
 * ```
 *
 * Aplicación Healthcare:
 * Un paciente crónico con 10 años de historia en el sistema tiene más
 * contexto del que cabe en cualquier context window. El ContextManager
 * garantiza que las alergias y medicamentos actuales siempre estén
 * presentes, aunque el historial remoto quede fuera.
 */
export class ContextManager {
  private chunks: Map<string, ContextChunk> = new Map();
  private readonly CRITICAL_BUDGET_RESERVE = 0.3; // reservar 30% para critical

  constructor(
    private readonly tokenBudget: number,
    private readonly summaryModel: string = MODEL,
  ) {}

  /**
   * addChunk — Agrega un chunk de información al manager
   */
  addChunk(chunk: ContextChunk): void {
    // EJERCICIO: implementar
    // Pista: si ya existe un chunk con el mismo id, reemplázalo
    // Estima tokens si no se proporcionaron (usa ~4 chars/token)
    throw new Error('TODO: implementar addChunk');
  }

  /**
   * removeChunk — Elimina un chunk del manager
   */
  removeChunk(id: string): void {
    this.chunks.delete(id);
  }

  /**
   * buildContext — Construye el string de contexto optimizado
   *
   * Algoritmo de priorización:
   * 1. Incluir TODOS los chunks 'critical' (siempre, sin importar tokens)
   * 2. Con el presupuesto restante: 'high' → 'medium' → 'low'
   * 3. Dentro del mismo nivel de prioridad: más reciente primero
   * 4. Si un chunk no cabe completo, usar su summary si existe
   *
   * Pista: el 30% del presupuesto está reservado para critical.
   * Si los critical exceden ese 30%, permiten el overflow hasta 50%.
   * Si exceden el 50%, es un error de configuración — los críticos deben caber.
   */
  buildContext(): ContextBuildResult {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar buildContext');
  }

  /**
   * summarizeChunks — Genera resúmenes de chunks usando IA
   *
   * Pista: útil para comprimir historial antiguo antes de decidir
   * si incluirlo o descartarlo.
   */
  async summarizeChunks(chunkIds: string[]): Promise<void> {
    // EJERCICIO: implementar
    // Para cada chunk en chunkIds:
    // 1. Crear un prompt que pida al modelo resumir en máximo 100 palabras
    // 2. Guardar el resumen en chunk.summary
    // 3. Actualizar estimatedTokens del summary
    throw new Error('TODO: implementar summarizeChunks');
  }

  /**
   * getStats — Estadísticas del contexto actual
   */
  getStats(): {
    totalChunks: number;
    byPriority: Record<ContextPriority, number>;
    byType: Record<ClinicalContextType, number>;
    estimatedTotalTokens: number;
  } {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar getStats');
  }
}

// ============================================================================
// TAREA 4.3: PACIENTE FICTICIO DE PRUEBA
// ============================================================================

/**
 * createDiabeticPatientContext — Crea un contexto ficticio de paciente diabético
 *
 * EJERCICIO: Diseña la estrategia de priorización para este paciente:
 * - ¿Qué va en critical? (¿siempre en el contexto?)
 * - ¿Qué se puede resumir?
 * - ¿Qué se puede descartar?
 */
export const createDiabeticPatientContext = (): ContextChunk[] => [
  // CRÍTICO: alergias — jamás puede faltar
  {
    id: 'allergy-001',
    content: 'ALERGIA CONOCIDA: Penicilina — reacción anafiláctica documentada en 2018. Usar alternativas betalactámicas con extrema precaución.',
    type: 'allergy',
    priority: 'critical',
    timestamp: new Date('2018-03-15'),
    estimatedTokens: 40,
  },
  // CRÍTICO: condición crónica principal
  {
    id: 'chronic-001',
    content: 'Diabetes Mellitus Tipo 2 diagnosticada en 2015. Control glucémico subóptimo (HbA1c 8.2% en último control). En tratamiento con metformina 1g c/12h y glibenclamida 5mg c/8h.',
    type: 'chronic_condition',
    priority: 'critical',
    timestamp: new Date('2015-06-01'),
    estimatedTokens: 65,
  },
  // ALTO: medicamentos actuales
  {
    id: 'medication-001',
    content: 'Medicamentos actuales: Metformina 1g c/12h, Glibenclamida 5mg c/8h, Enalapril 10mg c/24h, Atorvastatina 20mg c/24h, AAS 100mg c/24h',
    type: 'current_medication',
    priority: 'high',
    timestamp: new Date(),
    estimatedTokens: 55,
  },
  // MEDIO: lab reciente
  {
    id: 'lab-recent-001',
    content: 'Labs 15/04/2025: Glucosa 198 mg/dL, HbA1c 8.2%, Creatinina 1.3 mg/dL, Colesterol Total 210 mg/dL, LDL 135 mg/dL, Microalbuminuria 45 mg/24h',
    type: 'recent_lab',
    priority: 'medium',
    timestamp: new Date('2025-04-15'),
    estimatedTokens: 65,
  },
  // BAJO: nota histórica (puede resumirse)
  {
    id: 'note-old-001',
    content: 'Nota 10/01/2023: Paciente acude a control rutinario. Refiere adecuado apego al tratamiento. Glucemia en ayuno 185 mg/dL. Se ajusta dosis de glibenclamida de 2.5 a 5mg. Se solicita perfil lipídico y microalbuminuria. Se refuerza educación sobre dieta y ejercicio.',
    type: 'historical_note',
    priority: 'low',
    timestamp: new Date('2023-01-10'),
    estimatedTokens: 80,
  },
  // EJERCICIO: agregar 5 chunks más variados para el experimento de priorización
];

// ============================================================================
// MAIN
// ============================================================================

const main = async () => {
  console.log('=== DÍA 4: Context Manager ===\n');

  const patientChunks = createDiabeticPatientContext();
  console.log(`Paciente ficticio: ${patientChunks.length} chunks de contexto`);

  const manager = new ContextManager(500); // presupuesto pequeño para forzar priorización

  patientChunks.forEach(chunk => {
    try {
      manager.addChunk(chunk);
    } catch {
      console.log('→ Implementa addChunk primero');
    }
  });

  console.log('\n→ Implementa ContextManager.buildContext() y observa qué queda fuera');
  console.log('→ Verifica que las alergias y medicamentos SIEMPRE están en el contexto');
  console.log('→ Experimenta con distintos tokenBudget values');
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 4:
 *
 * 1. TRUNCACIÓN SILENCIOSA:
 *    - ¿Qué es?
 *    - ¿Cuándo ocurre?
 *    - ¿Cómo la detecté en el ejercicio 4.1?
 *
 * 2. CHUNKING SEMÁNTICO:
 *    - ¿Qué es?
 *    - ¿Cómo difiere del chunking por caracteres?
 *
 * 3. PRIORIZACIÓN:
 *    - ¿Qué información puse en critical?
 *    - ¿Qué tuve que sacrificar cuando el presupuesto era limitado?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: El ContextManager es como un sistema de gestión de riesgos —
 *   clasifica la información por impacto y probabilidad, y gestiona los
 *   recursos (tokens) en consecuencia
 * - Healthcare: El triage de contexto es análogo al triage hospitalario —
 *   recursos limitados, priorizar por criticidad, no por orden de llegada
 */
