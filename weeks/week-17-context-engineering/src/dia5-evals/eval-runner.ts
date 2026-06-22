/**
 * eval-runner.ts — Sistema de evaluación automática de prompts
 * DÍA 5: Evals — La habilidad que nadie enseña, la más crítica
 *
 * CONCEPTOS CLAVE:
 * - Un eval es un test para tu prompt, igual que un unit test es para tu código
 * - LLM-as-judge: usar un segundo modelo para evaluar el output del primero
 * - Golden dataset: casos de referencia con outputs esperados
 * - Regression testing: si cambias un prompt, corre evals antes de deploy
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

// Modelo para la tarea principal (más económico)
const TASK_MODEL = 'claude-3-5-haiku-20241022' as const;
// Modelo para el juez (más capaz para evaluar)
const JUDGE_MODEL = 'claude-3-5-sonnet-20241022' as const;

// ============================================================================
// TAREA 5.1: TIPOS PARA EL SISTEMA DE EVALS
// ============================================================================

/**
 * EvalCase — Un caso de evaluación con input y output esperado
 */
export interface EvalCase<TInput, TOutput> {
  id: string;
  description: string;
  input: TInput;
  expectedOutput: TOutput;
  tags: string[];    // ['critico', 'normal', 'edge-case', 'multi-anomalia']
}

/**
 * EvalCriteria — Criterios de evaluación para el juez
 *
 * Aplicación Healthcare:
 * Los criterios deben reflejar lo que importa clínicamente:
 * - Identificar valores críticos: riesgo de vida si falla → peso alto
 * - Formato correcto: importa para integración pero no es crítico → peso bajo
 */
export interface EvalCriteria {
  name: string;
  description: string;
  maxScore: number;
  weight: number;  // peso relativo (0-1, deben sumar 1.0)
}

/**
 * EvalResult — Resultado de evaluar un caso individual
 */
export interface EvalResult {
  caseId: string;
  actualOutput: string;
  score: number;           // 0-10 normalizado
  criteriaScores: Record<string, number>;
  passed: boolean;
  reasoning: string;       // explicación del juez
  suggestions: string[];   // cómo mejorar el prompt
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  judgeTokens: number;     // tokens del LLM-as-judge
}

/**
 * EvalReport — Reporte completo de una ejecución de evals
 */
export interface EvalReport {
  timestamp: Date;
  promptVersion: string;
  totalCases: number;
  averageScore: number;
  passRate: number;             // % de casos que pasan el threshold
  failedCases: EvalResult[];
  passingCases: EvalResult[];
  byTag: Record<string, { averageScore: number; passRate: number }>;
  totalCostUSD: number;
  totalLatencyMs: number;
  recommendation: 'DEPLOY' | 'REVIEW' | 'BLOCK';
  blockReason?: string;
}

// ============================================================================
// TAREA 5.2: EL JUEZ (LLM-as-Judge)
// ============================================================================

/**
 * ClinicalEvalJudge — Usa un LLM para evaluar outputs clínicos
 *
 * El problema (sin juez):
 * ```typescript
 * // Comparación exacta de strings — demasiado rígida para lenguaje natural
 * const passed = actualOutput === expectedOutput; // siempre false
 * ```
 *
 * Con LLM-as-judge:
 * ```typescript
 * const result = await judge.evaluate(actualOutput, expectedOutput, criteria);
 * // Evalúa semánticamente: ¿el output es clínicamente equivalente?
 * ```
 *
 * Aplicación Healthcare:
 * El juez debe usar el JUDGE_MODEL (más capaz) para tener criterio clínico
 * real. Un juez débil producirá evaluaciones poco confiables.
 */
export class ClinicalEvalJudge {
  private readonly judgeSystemPrompt = `Eres un médico evaluador con 20 años de experiencia clínica
y conocimiento profundo de sistemas de IA en salud. Tu tarea es evaluar
la calidad de respuestas generadas por un asistente de IA médico.

Evalúa con rigor científico y clínico. No seas condescendiente con errores
que podrían causar daño al paciente — esos deben penalizarse severamente.
Responde siempre en formato JSON válido.`;

  /**
   * evaluate — Evalúa un output contra el output esperado
   *
   * Pista: el judge prompt debe incluir:
   * 1. El output del modelo a evaluar
   * 2. El output esperado de referencia
   * 3. Los criterios de evaluación con sus pesos
   * 4. Instrucciones para responder con JSON
   */
  async evaluate(
    actualOutput: string,
    expectedOutput: string,
    criteria: EvalCriteria[],
  ): Promise<{
    totalScore: number;          // 0-10
    criteriaScores: Record<string, number>;
    reasoning: string;
    suggestions: string[];
    judgeTokens: number;
  }> {
    // EJERCICIO: implementar
    // Pista: construye un prompt que le dé al juez toda la información que necesita
    // para evaluar semánticamente (no comparación exacta de strings)
    throw new Error('TODO: implementar evaluate');
  }
}

// ============================================================================
// TAREA 5.3: EVAL RUNNER
// ============================================================================

/**
 * EvalRunner — Ejecuta una suite de evals y produce un reporte
 *
 * Ventajas:
 * - Detecta regresiones antes de deploy (como CI/CD para código)
 * - Proporciona métricas accionables, no solo "pasó/falló"
 * - Calcula el costo total de correr los evals (importante en producción)
 * - Agrupa resultados por tag para entender patrones de fallo
 */
export class EvalRunner<TInput, TOutput> {
  private readonly judge = new ClinicalEvalJudge();

  constructor(
    private readonly criteria: EvalCriteria[],
    private readonly threshold: number = 8.0,
    private readonly costPerToken = {
      input: 0.000001,   // USD por token de input (Haiku aproximado)
      output: 0.000005,  // USD por token de output
    },
  ) {
    // Validar que los pesos suman 1.0
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new Error(`Los pesos de los criterios deben sumar 1.0. Suma actual: ${totalWeight}`);
    }
  }

  /**
   * runSingle — Evalúa un caso individual
   */
  private async runSingle(
    evalCase: EvalCase<TInput, TOutput>,
    promptFn: (input: TInput) => Promise<string>,
  ): Promise<EvalResult> {
    // EJERCICIO: implementar
    // Pasos:
    // 1. Medir tiempo de inicio
    // 2. Ejecutar promptFn con el input del caso
    // 3. Medir latencia y tokens usados
    // 4. Pedir al juez que evalúe el output
    // 5. Retornar EvalResult completo
    throw new Error('TODO: implementar runSingle');
  }

  /**
   * run — Ejecuta todos los casos y produce el reporte final
   *
   * Pista: ejecuta los casos en paralelo (Promise.all) para ser eficiente,
   * pero considera un límite de concurrencia para no exceder rate limits del API.
   */
  async run(
    cases: Array<EvalCase<TInput, TOutput>>,
    promptFn: (input: TInput) => Promise<string>,
    promptVersion: string,
  ): Promise<EvalReport> {
    // EJERCICIO: implementar
    // 1. Ejecutar todos los casos (considera concurrencia limitada)
    // 2. Calcular métricas agregadas
    // 3. Agrupar por tags
    // 4. Determinar recommendation: DEPLOY | REVIEW | BLOCK
    // 5. Retornar EvalReport completo
    throw new Error('TODO: implementar run');
  }

  /**
   * printReport — Imprime el reporte de forma legible en consola
   *
   * Pista: usa colores con códigos ANSI para hacer el reporte más legible
   * ✅ verde para PASS, ❌ rojo para FAIL
   */
  printReport(report: EvalReport): void {
    // EJERCICIO: implementar
    // El output debería verse así:
    // 🔍 Corriendo evals — v1.0.0
    // ✅ caso-001: 9.2/10 — PASS
    // ❌ caso-007: 6.8/10 — FAIL — "No identificó hipercalemia crítica"
    // 📊 Score promedio: 8.3/10 | Costo: $0.045 | ⏱ 38s
    // ✅ RECOMENDACIÓN: DEPLOY
    throw new Error('TODO: implementar printReport');
  }
}

// ============================================================================
// TAREA 5.4: GOLDEN DATASET PARA ANÁLISIS DE LABORATORIO
// ============================================================================

/**
 * LabInput — Input para el análisis de laboratorio
 */
export interface LabInput {
  resultados: string;  // texto libre con los valores de laboratorio
  contextoClinico?: string;
}

/**
 * LabAnalysis — Output esperado del análisis
 */
export interface LabAnalysis {
  interpretacion: string;
  valores_criticos: string[];
  nivel_urgencia: 'bajo' | 'medio' | 'alto' | 'critico';
  confianza: number;
}

/**
 * labGoldenDataset — 15 casos para evaluar el prompt de análisis de lab
 *
 * Aplicación Healthcare:
 * Este dataset representa los casos reales que el sistema encontrará.
 * Un caso que no está en el dataset no está "cubierto" por los evals.
 */
export const labGoldenDataset: Array<EvalCase<LabInput, LabAnalysis>> = [
  // --- 3 casos normales ---
  {
    id: 'normal-001',
    description: 'Hemograma completamente normal en adulto sano',
    input: {
      resultados: 'Hemoglobina: 14.5 g/dL (VN: 13-17), Leucocitos: 6,800/mm³ (VN: 4,500-11,000), Plaquetas: 275,000/mm³ (VN: 150,000-400,000)',
    },
    expectedOutput: {
      interpretacion: 'Hemograma dentro de parámetros normales',
      valores_criticos: [],
      nivel_urgencia: 'bajo',
      confianza: 0.95,
    },
    tags: ['normal', 'hemograma'],
  },
  // EJERCICIO: agregar los 14 casos restantes:
  // 2 normales más, 3 con anomalías leves, 3 con valores críticos,
  // 3 con múltiples anomalías, 3 con datos incompletos
];

/**
 * clinicalCriteria — Criterios de evaluación para análisis de laboratorio
 */
export const clinicalCriteria: EvalCriteria[] = [
  {
    name: 'identificacion_criticos',
    description: 'Identifica correctamente todos los valores críticos que requieren atención inmediata',
    maxScore: 10,
    weight: 0.40,  // el más importante — una falla aquí puede costar una vida
  },
  {
    name: 'correctitud_medica',
    description: 'La interpretación médica es clínicamente correcta y no contiene errores factuales',
    maxScore: 10,
    weight: 0.30,
  },
  {
    name: 'nivel_urgencia',
    description: 'El nivel de urgencia clasificado es apropiado para el cuadro clínico',
    maxScore: 10,
    weight: 0.20,
  },
  {
    name: 'formato_json',
    description: 'El output sigue el formato JSON requerido con todos los campos',
    maxScore: 10,
    weight: 0.10,
  },
];

// ============================================================================
// MAIN — Ejecutar demo de evals
// ============================================================================

const main = async () => {
  console.log('=== DÍA 5: Evals y EvalRunner ===\n');
  console.log('Golden dataset preparado con', labGoldenDataset.length, 'casos');
  console.log('Criterios de evaluación:', clinicalCriteria.map(c => `${c.name} (${c.weight * 100}%)`).join(', '));
  console.log('\n→ Implementa EvalRunner y EvalJudge, luego ejecuta los evals');
  console.log('→ Recuerda: el objetivo es detectar regresiones cuando cambias un prompt');
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 5:
 *
 * 1. LLM-AS-JUDGE:
 *    - ¿Qué es?
 *    - ¿Cuándo usarlo?
 *    - ¿Cuándo NO usarlo? (cuidado con el sesgo del juez)
 *
 * 2. GOLDEN DATASET:
 *    - ¿Qué es?
 *    - ¿Cuántos casos necesitas?
 *    - ¿Cómo evitar que sea demasiado específico?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: Los evals son tus controles de calidad — exactamente como
 *   los que diseñabas para procesos financieros, pero para outputs de IA
 * - Healthcare: Un sistema sin evals en producción es como un lab sin
 *   controles de calidad — no sabes cuándo está fallando
 */
