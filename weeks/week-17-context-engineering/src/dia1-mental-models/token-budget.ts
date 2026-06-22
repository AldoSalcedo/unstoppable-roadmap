/**
 * token-budget.ts — Gestión de presupuesto de tokens
 * DÍA 1: Mental Models — Cómo piensa un LLM en términos de ingeniería
 *
 * CONCEPTOS CLAVE:
 * - Un token ≠ una palabra: en español ~1 token por 3-4 caracteres
 * - El context window es un límite estricto de tokens, no de palabras
 * - Medir antes de llamar es parte del diseño, no una optimización prematura
 * - `countTokens` de Anthropic SDK te dice el costo exacto ANTES de la llamada
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

// Modelo base para los ejercicios (Haiku es el más económico para aprender)
const MODEL = 'claude-3-5-haiku-20241022' as const;

// ============================================================================
// TAREA 1.1: EXPLORACIÓN DE TOKENS
// ============================================================================

/**
 * countClinicalTokens — Mide el costo en tokens de strings clínicos
 *
 * El problema (sin medir):
 * ```typescript
 * // Enviamos texto sin saber cuánto cuesta
 * const response = await client.messages.create({ ... });
 * // ¿Cuántos tokens usamos? No sabemos hasta después.
 * ```
 *
 * Con countTokens:
 * ```typescript
 * const count = await countClinicalTokens(texto);
 * // Sabemos el costo ANTES de ejecutar — podemos decidir si vale la pena
 * ```
 *
 * Aplicación Healthcare:
 * Un expediente clínico completo puede tener 50,000+ tokens.
 * Medir antes de enviar permite implementar estrategias de compresión
 * antes de que sea tarde (y costoso).
 */
export const countClinicalTokens = async (text: string): Promise<number> => {
  const response = await client.messages.countTokens({
    model: MODEL,
    messages: [{ role: 'user', content: text }],
  });
  return response.input_tokens;
};

// ============================================================================
// TAREA 1.2: TOKEN BUDGET UTILITY
// ============================================================================

/**
 * TokenBudgetWarning — Tipo discriminado para warnings de presupuesto
 *
 * Usa tipos discriminados en lugar de strings genéricos para que el
 * compilador pueda verificar que manejamos todos los casos.
 */
export type TokenBudgetWarning =
  | { kind: 'approaching_limit'; percentUsed: number; remaining: number }
  | { kind: 'exceeded_limit'; overBy: number }
  | { kind: 'ok'; remaining: number };

/**
 * TokenBudgetReport — Snapshot del estado actual del presupuesto
 */
export interface TokenBudgetReport {
  limit: number;
  used: number;
  remaining: number;
  percentUsed: number;
  warning: TokenBudgetWarning;
}

/**
 * TokenBudget — Gestiona el presupuesto de tokens para una llamada al API
 *
 * El problema (sin presupuesto):
 * ```typescript
 * // Acumulamos contexto sin control
 * const context = history.join('\n'); // podría ser 200K tokens
 * await client.messages.create({ messages: [...] }); // error o truncación
 * ```
 *
 * Con TokenBudget:
 * ```typescript
 * const budget = new TokenBudget(4000);
 * if (budget.canFit(newChunk)) {
 *   budget.addUsed(await countTokens(newChunk));
 *   context.add(newChunk);
 * }
 * ```
 *
 * Aplicación Healthcare:
 * En un sistema de análisis clínico, el presupuesto de tokens determina
 * cuánto historial del paciente podemos incluir en cada consulta.
 * Sin control, corremos el riesgo de truncar información crítica.
 */
export class TokenBudget {
  private used: number = 0;
  private readonly warningThreshold = 0.8; // avisar al 80%

  constructor(private readonly limit: number) {}

  /**
   * canFit — Verifica si un texto cabe en el presupuesto restante
   *
   * Pista: necesitas estimar los tokens del texto. Puedes usar
   * la aproximación de ~4 caracteres por token como heurística rápida,
   * o llamar a countClinicalTokens para precisión exacta.
   */
  canFit(text: string): boolean {
    // EJERCICIO: implementar
    // Pista: estima tokens del texto y compara con this.remaining()
    throw new Error('TODO: implementar canFit');
  }

  /**
   * addUsed — Registra tokens consumidos
   */
  addUsed(tokens: number): void {
    // EJERCICIO: implementar
    // Pista: acumula en this.used, no puede exceder this.limit
    throw new Error('TODO: implementar addUsed');
  }

  /**
   * remaining — Tokens disponibles en el presupuesto
   */
  remaining(): number {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar remaining');
  }

  /**
   * report — Estado actual completo del presupuesto
   */
  report(): TokenBudgetReport {
    // EJERCICIO: implementar
    // Pista: calcula percentUsed y determina el tipo de warning apropiado
    throw new Error('TODO: implementar report');
  }
}

// ============================================================================
// TAREA 1.3: EXPERIMENTO DE TEMPERATURA
// ============================================================================

/**
 * TemperatureExperiment — Compara outputs a distintas temperaturas
 *
 * Aplicación Healthcare:
 * Para extracción de valores numéricos de laboratorio: temperatura 0
 * Para generar variantes de notas clínicas: temperatura 0.5
 * Para brainstorming de diagnósticos diferenciales: temperatura 0.7
 */
export interface TemperatureExperimentResult {
  temperature: number;
  outputs: string[];           // múltiples ejecuciones del mismo prompt
  areIdentical: boolean;       // ¿todos los outputs son iguales?
  uniqueOutputCount: number;   // cuántos outputs distintos hubo
}

export const runTemperatureExperiment = async (
  prompt: string,
  temperatures: number[],
  runsPerTemperature: number = 3,
): Promise<TemperatureExperimentResult[]> => {
  // EJERCICIO: implementar
  // Para cada temperatura, ejecuta el prompt N veces y compara resultados
  // Pista: usa client.messages.create con el parámetro temperature
  throw new Error('TODO: implementar runTemperatureExperiment');
};

// ============================================================================
// MAIN — Ejecutar los ejercicios del día
// ============================================================================

const main = async () => {
  console.log('=== DÍA 1: Mental Models + Token Budget ===\n');

  // --- Ejercicio 1.1: Exploración de tokens ---
  const textosClinicos = [
    'análisis de laboratorio',
    'Lab analysis', // misma frase en inglés
    'El paciente presenta fiebre de 38.5°C, cefalea intensa y rigidez de nuca.',
    'K+: 6.8 mEq/L, Na+: 135 mEq/L, Cl-: 98 mEq/L, HCO3-: 18 mEq/L',
    'Hemograma completo: Hemoglobina 13.5 g/dL, Leucocitos 7,200/mm³, Plaquetas 285,000/mm³, VCM 88 fL',
  ];

  console.log('📊 Conteo de tokens por texto clínico:');
  for (const texto of textosClinicos) {
    const tokens = await countClinicalTokens(texto);
    const chars = texto.length;
    console.log(`  "${texto.substring(0, 40)}..." → ${tokens} tokens (${chars} chars, ratio: ${(chars / tokens).toFixed(1)} chars/token)`);
  }

  // --- Ejercicio 1.2: TokenBudget ---
  console.log('\n💰 Probando TokenBudget:');
  const budget = new TokenBudget(1000);
  console.log('  Reporte inicial:', budget.report());

  // --- Ejercicio 1.3: Temperatura ---
  console.log('\n🌡️  Experimento de temperatura:');
  const promptClinoco = '¿Cuál es el valor normal de hemoglobina en un adulto masculino?';
  // EJERCICIO: descomenta cuando hayas implementado runTemperatureExperiment
  // const results = await runTemperatureExperiment(promptClinoco, [0, 0.5, 1.0]);
  // results.forEach(r => console.log(`  Temperatura ${r.temperature}: ${r.uniqueOutputCount} outputs únicos de ${r.outputs.length}`));
  console.log(`  Prompt de prueba: "${promptClinoco}"`);
  console.log('  → Implementa runTemperatureExperiment y descomenta las líneas de arriba');
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 1:
 *
 * 1. TOKENS:
 *    - ¿Qué es? La unidad básica de procesamiento del LLM
 *    - ¿Cuándo importa? Siempre que construyas contexto dinámico
 *    - ¿Cuándo NO importa? Prompts cortos y fijos
 *
 * 2. CONTEXT WINDOW:
 *    - ¿Qué es?
 *    - ¿Cuándo usarlo?
 *    - ¿Cuándo NO usarlo?
 *
 * 3. TEMPERATURA:
 *    - ¿Qué es?
 *    - ¿Cuándo usarlo?
 *    - ¿Cuándo NO usarlo?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología: Los tokens son como codones en el ADN — unidades
 *   discretas de información que el sistema procesa, no las letras individuales
 * - Auditoría: Medir antes de actuar es control preventivo, no corrección
 * - Healthcare: Un token de diferencia puede cambiar si un valor entra en el contexto
 *
 * PARA PRACTICAR:
 * - Mide el costo de tokens de 10 expedientes clínicos ficticios distintos
 * - Experimenta con distintas temperaturas para el mismo análisis de lab
 */
