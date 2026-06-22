/**
 * agent-trace.ts — Observabilidad y cost modeling para sistemas agénticos
 * DÍA 6: Producción — Latencia, Costo, Observabilidad
 *
 * CONCEPTOS CLAVE:
 * - Cada LLM call en un pipeline agéntico debe ser trazado
 * - Costo = tokens × precio por modelo
 * - Latencia en agentes: el 80% es I/O (API calls), no cómputo
 * - Fallbacks: si el modelo primario falla, tienes un plan B
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

// ============================================================================
// TAREA 6.1: PRICING POR MODELO (USD por millón de tokens)
// ============================================================================

/**
 * ModelPricing — Precios aproximados para cost modeling
 *
 * NOTA: Estos precios son aproximados a mayo 2025.
 * Verificar en https://www.anthropic.com/pricing para precios actualizados.
 */
export const MODEL_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'claude-3-5-haiku-20241022': { inputPerMillion: 0.80, outputPerMillion: 4.00 },
  'claude-3-5-sonnet-20241022': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-opus-4-6': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
};

/**
 * calculateCost — Calcula el costo en USD de una llamada al API
 */
export const calculateCost = (
  model: string,
  inputTokens: number,
  outputTokens: number,
): number => {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  return (inputTokens * pricing.inputPerMillion + outputTokens * pricing.outputPerMillion) / 1_000_000;
};

// ============================================================================
// TAREA 6.2: TIPOS DEL AGENT TRACE
// ============================================================================

/**
 * StepTrace — Traza de un paso individual del pipeline
 */
export interface StepTrace {
  stepId: string;
  agentName: string;
  description: string;
  startTime: number;          // Date.now()
  endTime?: number;
  latencyMs?: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  toolCallCount: number;      // cuántas veces usó tools este paso
  success: boolean;
  error?: string;
}

/**
 * PipelineTrace — Traza completa del pipeline multi-agente
 */
export interface PipelineTrace {
  traceId: string;
  pipelineName: string;
  question: string;           // la pregunta que disparó el pipeline
  startTime: number;
  endTime?: number;
  totalLatencyMs?: number;
  totalCostUSD: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  steps: StepTrace[];
  success: boolean;
  budgetExceeded: boolean;
}

// ============================================================================
// TAREA 6.3: AGENT TRACE
// ============================================================================

/**
 * AgentTrace — Sistema de observabilidad para pipelines agénticos
 *
 * El problema (sin tracing):
 * ```typescript
 * // Pipeline que tarda 30 segundos y cuesta $0.50
 * // pero no sabes dónde está el cuello de botella
 * await runPipeline(question);
 * ```
 *
 * Con AgentTrace:
 * ```typescript
 * const trace = new AgentTrace('research-pipeline', question);
 * const step1 = trace.startStep('PlannerAgent', 'Descomponer pregunta');
 * // ... ejecutar planner ...
 * step1.complete({ inputTokens: 500, outputTokens: 200, success: true });
 * console.log(trace.getSummary()); // latencia, costo, breakdown por agente
 * ```
 *
 * Aplicación Healthcare:
 * En un entorno regulado, el trace es tu pista de auditoría —
 * documenta cada decisión del sistema con su contexto y costo.
 */
export class AgentTrace {
  private steps: StepTrace[] = [];
  private readonly startTime: number;
  private totalCost = 0;
  private readonly budgetLimitUSD: number;

  constructor(
    private readonly pipelineName: string,
    private readonly question: string,
    budgetLimitUSD: number = 0.10,  // $0.10 USD por defecto
  ) {
    this.startTime = Date.now();
    this.budgetLimitUSD = budgetLimitUSD;
  }

  /**
   * startStep — Inicia el trazado de un paso del pipeline
   * Retorna un StepTracer que se usa para completar el paso
   */
  startStep(agentName: string, description: string, model: string): StepTracer {
    // EJERCICIO: implementar
    // Crear un StepTrace con los datos iniciales y retornar un StepTracer
    throw new Error('TODO: implementar startStep');
  }

  /**
   * isBudgetExceeded — Verifica si el costo actual excedió el límite
   */
  isBudgetExceeded(): boolean {
    return this.totalCost > this.budgetLimitUSD;
  }

  /**
   * addStepCost — Registra el costo de un paso completado (llamado internamente por StepTracer)
   */
  addStepCost(step: StepTrace): void {
    this.steps.push(step);
    this.totalCost += step.costUSD;
  }

  /**
   * getReport — Genera el reporte completo del pipeline
   */
  getReport(): PipelineTrace {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar getReport');
  }

  /**
   * printSummary — Imprime un resumen legible del pipeline
   */
  printSummary(): void {
    // EJERCICIO: implementar
    // Formato esperado:
    // 🔍 Pipeline: research-pipeline
    // ─────────────────────────────────────
    // ✅ PlannerAgent      450ms   $0.0003   500/200 tokens
    // ✅ RetrievalAgent    1200ms  $0.0009   1500/300 tokens (x3 calls)
    // ✅ AnalysisAgent     3400ms  $0.0118   8000/1500 tokens
    // ✅ WriterAgent       2100ms  $0.0080   5000/2000 tokens
    // ─────────────────────────────────────
    // Total: 7150ms | $0.021 USD | 15000 input + 4000 output tokens
    throw new Error('TODO: implementar printSummary');
  }
}

/**
 * StepTracer — Interfaz para completar el trazado de un paso
 */
export class StepTracer {
  constructor(
    private readonly step: StepTrace,
    private readonly trace: AgentTrace,
  ) {}

  /**
   * complete — Registra la finalización del paso
   */
  complete(data: {
    inputTokens: number;
    outputTokens: number;
    toolCallCount?: number;
    success: boolean;
    error?: string;
  }): void {
    // EJERCICIO: implementar
    // 1. Calcular latencia (endTime - startTime)
    // 2. Calcular costo con calculateCost
    // 3. Actualizar this.step con los datos
    // 4. Registrar en this.trace
    throw new Error('TODO: implementar StepTracer.complete()');
  }
}

// ============================================================================
// TAREA 6.4: COST BUDGET Y FALLBACKS
// ============================================================================

/**
 * CostBudget — Monitorea el costo acumulado y detiene si excede el límite
 */
export class CostBudget {
  private spent = 0;

  constructor(private readonly limitUSD: number) {}

  /**
   * checkAndRecord — Verifica si hay presupuesto disponible y registra el gasto
   * Retorna false si el presupuesto fue excedido
   */
  checkAndRecord(costUSD: number): boolean {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar checkAndRecord');
  }

  remaining(): number {
    return Math.max(0, this.limitUSD - this.spent);
  }

  report(): { spent: number; limit: number; remaining: number; percentUsed: number } {
    return {
      spent: this.spent,
      limit: this.limitUSD,
      remaining: this.remaining(),
      percentUsed: (this.spent / this.limitUSD) * 100,
    };
  }
}

/**
 * withFallback — Ejecuta una llamada al API con fallback a un modelo más económico
 *
 * Aplicación Healthcare:
 * Si el modelo principal (Sonnet) está caído o excede el rate limit,
 * el sistema falla gracefully a Haiku para mantener el servicio disponible.
 */
export const withFallback = async <T>(
  primaryCall: () => Promise<T>,
  fallbackCall: () => Promise<T>,
  onFallback?: (error: Error) => void,
): Promise<{ result: T; usedFallback: boolean }> => {
  // EJERCICIO: implementar
  // 1. Intentar primaryCall
  // 2. Si falla con error 529 (overloaded), 529 (rate limit), o timeout: usar fallbackCall
  // 3. Si falla con error de autenticación (401): re-lanzar sin fallback
  throw new Error('TODO: implementar withFallback');
};

/**
 * withRetry — Retry con exponential backoff para rate limits
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryOn?: (error: unknown) => boolean;
  },
): Promise<T> => {
  // EJERCICIO: implementar
  // 1. Intentar fn()
  // 2. Si falla y retryOn(error) es true: esperar baseDelay × 2^intento
  // 3. Si se excede maxRetries: re-lanzar el último error
  // Pista: error de rate limit en Anthropic es status 429
  throw new Error('TODO: implementar withRetry');
};

// ============================================================================
// MAIN — Demo del sistema de observabilidad
// ============================================================================

const main = async () => {
  console.log('=== DÍA 6: AgentTrace + CostBudget + Fallbacks ===\n');

  // Demo de calculateCost
  console.log('💰 Modelo de costos:');
  for (const [model, pricing] of Object.entries(MODEL_PRICING)) {
    const cost1000 = calculateCost(model, 1000, 500);
    console.log(`  ${model}: $${cost1000.toFixed(4)} por 1K input + 500 output tokens`);
  }

  // Demo del AgentTrace
  console.log('\n📊 Simulando pipeline trace:');
  const trace = new AgentTrace('research-pipeline', '¿Cuál es el tratamiento de IC con FE reducida?', 0.10);

  // Simular 3 pasos del pipeline (sin implementación real)
  console.log('  → Implementa AgentTrace.startStep() y StepTracer.complete()');
  console.log('  → Luego intégralo en el pipeline del día 7');

  // Demo de CostBudget
  console.log('\n💳 Probando CostBudget:');
  const budget = new CostBudget(0.05); // $0.05 límite
  console.log('  Reporte inicial:', budget.report());
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 6:
 *
 * 1. LATENCIA EN SISTEMAS AGÉNTICOS:
 *    - ¿Qué paso del pipeline del capstone tardó más?
 *    - ¿Dónde está el cuello de botella real?
 *
 * 2. COST MODELING:
 *    - ¿Cuánto cuesta una query completa al Clinical Research Assistant?
 *    - ¿Qué modelo cambiarías para reducir costo sin sacrificar calidad?
 *
 * 3. FALLBACKS Y RESILENCIA:
 *    - ¿Cuándo activaste el fallback en las pruebas?
 *    - ¿El resultado del fallback fue aceptable?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: El AgentTrace es exactamente una pista de auditoría automatizada —
 *   cada acción documentada con quién la hizo, cuándo, con qué información
 *   y qué resultado produjo. ISO 27001 aplicado a IA.
 * - Healthcare: En un sistema clínico regulado, la trazabilidad no es opcional
 *   es un requisito de COFEPRIS/NOM para sistemas de apoyo a decisión clínica
 */
