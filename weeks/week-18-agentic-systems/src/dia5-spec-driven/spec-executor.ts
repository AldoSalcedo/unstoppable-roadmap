/**
 * spec-executor.ts — Spec-Driven Development con TypeScript + Claude
 * DÍA 5: Spec-Driven Development — Escribir specs que una IA puede ejecutar
 *
 * CONCEPTOS CLAVE:
 * - Un spec bien escrito elimina la ambigüedad que lleva a código incorrecto
 * - Tipos TypeScript exactos en el spec guían al modelo mejor que descripciones en prosa
 * - Edge cases explícitos previenen sorpresas en producción
 * - Architecture hints ("usa el componente X de Y") eliminan duplicación de código
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const MODEL = 'claude-3-5-sonnet-20241022' as const; // Sonnet para mejor code generation

// ============================================================================
// TAREA 5.1: ANATOMÍA DE UN SPEC EJECUTABLE
// ============================================================================

/**
 * Spec — La estructura de un spec ejecutable
 *
 * Un spec ejecutable no es documentación — es una especificación
 * tan precisa que el modelo puede convertirla en código correcto
 * en la primera (o segunda) iteración.
 */
export interface Spec {
  functionName: string;
  purpose: string;                   // qué hace en 2-3 líneas
  imports: string[];                 // qué debe importar
  inputTypes: Record<string, string>; // tipos TypeScript exactos de los parámetros
  outputType: string;                // tipo TypeScript del return value
  edgeCases: Array<{
    description: string;             // caso específico
    expectedBehavior: string;        // qué debe hacer exactamente
  }>;
  architectureHints: string[];       // qué componentes existentes debe reutilizar
  exampleInputOutput?: {
    input: string;
    output: string;
  };
  constraints: string[];             // restricciones explícitas
}

// ============================================================================
// TAREA 5.2: EL SPEC DEL ANALYSIS AGENT
// ============================================================================

/**
 * analysisAgentSpec — Spec completo para AnalysisAgent.synthesize()
 *
 * Este spec está diseñado para que Claude pueda implementar
 * el Analysis Agent del capstone correctamente en la primera iteración.
 *
 * EJERCICIO: Evalúa este spec — ¿qué agregarías o cambiarías?
 * Después de leer el spec, implementa el código y compara cuántas
 * iteraciones necesitaste.
 */
export const analysisAgentSpec: Spec = {
  functionName: 'AnalysisAgent.synthesize',

  purpose: `Sintetiza evidencia clínica de múltiples fuentes y produce un
handoff estructurado para el WriterAgent. Identifica gaps de evidencia
y áreas de controversia, y determina si el análisis requiere revisión humana.`,

  imports: [
    "import Anthropic from '@anthropic-ai/sdk'",
    "import type { RetrievalToAnalysisHandoff, AnalysisToWriterHandoff } from '../dia7-capstone/clinical-research-assistant'",
  ],

  inputTypes: {
    handoff: `RetrievalToAnalysisHandoff — incluye:
      - originalQuestion: string
      - retrievedEvidence: Array<{ subtaskId, subtaskQuery, findings[], hasEvidence, gapReason? }>
      - totalDocumentsSearched: number`,
  },

  outputType: `Promise<{
    handoff: AnalysisToWriterHandoff;
    latencyMs: number;
    tokens: { input: number; output: number };
  }>`,

  edgeCases: [
    {
      description: 'Ninguna subtarea tiene evidencia (todos los findings están vacíos)',
      expectedBehavior: 'Retornar handoff con synthesis indicando ausencia de evidencia, evidenceGaps con todas las subtareas, requiresHumanReview: true, confidence: 0.1',
    },
    {
      description: 'Una subtarea tiene evidencia conflictiva (dos documentos dicen cosas contrarias)',
      expectedBehavior: 'Incluir la subtarea en controversialAreas y setear requiresHumanReview: true',
    },
    {
      description: 'Evidencia de nivel C únicamente (baja calidad)',
      expectedBehavior: 'Reflejar en confidence: máximo 0.5, indicar en synthesis que la evidencia es de baja calidad',
    },
  ],

  architectureHints: [
    'Usar ANALYSIS_MODEL (claude-3-5-sonnet-20241022) — no usar Haiku para análisis clínico',
    'El system prompt está en la clase AnalysisAgent — no crear uno nuevo',
    'Para calcular costo: usar calculateCost() de src/dia6-production/agent-trace.ts',
    'Todos los tipos de handoff están en src/dia7-capstone/clinical-research-assistant.ts',
  ],

  exampleInputOutput: {
    input: `{
  originalQuestion: "¿Cuál es el tratamiento de IC con FE reducida?",
  retrievedEvidence: [
    { subtaskId: "st-001", hasEvidence: true,
      findings: [{ documentId: "guideline-ic-001", relevantText: "Sacubitril/valsartán...", evidenceLevel: "A" }] },
    { subtaskId: "st-002", hasEvidence: false, gapReason: "No se encontró evidencia sobre..." }
  ],
  totalDocumentsSearched: 15
}`,
    output: `{
  handoff: {
    originalQuestion: "¿Cuál es el tratamiento de IC con FE reducida?",
    synthesis: "La evidencia de alta calidad (nivel A) indica que la terapia cuádruple...",
    keyFindings: ["Sacubitril/valsartán superior a IECA en IC-FEr", "SGLT2 reduce hospitalización"],
    evidenceGaps: ["No se encontró evidencia sobre st-002"],
    controversialAreas: [],
    citations: [{ documentId: "guideline-ic-001", title: "Guía IC 2024", ... }],
    requiresHumanReview: false,
    analysisConfidence: 0.85
  },
  latencyMs: 3241,
  tokens: { input: 7800, output: 1400 }
}`,
  },

  constraints: [
    'NUNCA inventar evidencia — solo sintetizar lo que está en retrievedEvidence',
    'Si todas las findings tienen hasEvidence: false, NO intentar buscar información adicional',
    'requiresHumanReview debe ser true si confidence < 0.4 o hay controversialAreas no vacías',
    'analysisConfidence debe reflejar la calidad de la evidencia: A=0.85-0.95, B=0.6-0.8, C=0.3-0.5',
  ],
};

// ============================================================================
// TAREA 5.3: SPEC EXECUTOR — USA EL SPEC PARA GENERAR CÓDIGO
// ============================================================================

/**
 * SpecExecutor — Convierte un spec en código TypeScript usando Claude
 *
 * Este es el corazón del Spec-Driven Development:
 * 1. Convierte el spec en un prompt estructurado
 * 2. Solicita al modelo que implemente el código
 * 3. Mide cuántas iteraciones fueron necesarias
 * 4. Documenta qué elementos del spec tuvieron mayor impacto
 */
export class SpecExecutor {
  private readonly systemPrompt = `Eres un ingeniero de software senior especializado en TypeScript
y sistemas de IA. Tu tarea es implementar funciones a partir de especificaciones técnicas precisas.

REGLAS:
1. Implementa EXACTAMENTE lo que dice el spec, no más ni menos
2. Reutiliza los componentes indicados en architectureHints
3. Maneja todos los edge cases especificados
4. El código debe compilar en TypeScript strict mode sin errores
5. Incluye JSDoc en español para cada función exportada
6. No incluyas imports que no sean necesarios`;

  /**
   * execute — Genera código a partir de un spec
   *
   * EJERCICIO: implementar
   * 1. Convertir el spec en un prompt estructurado
   * 2. Llamar al modelo con el prompt
   * 3. Extraer el código TypeScript del response
   * 4. Retornar el código y las métricas
   */
  async execute(spec: Spec): Promise<{
    code: string;
    explanation: string;
    tokens: { input: number; output: number };
    latencyMs: number;
  }> {
    // EJERCICIO: implementar
    // El prompt debe incluir:
    // 1. El functionName y purpose
    // 2. Los tipos exactos de input y output
    // 3. Los edge cases a manejar
    // 4. Los architecture hints
    // 5. El example de input/output si existe
    // 6. Los constraints
    throw new Error('TODO: implementar SpecExecutor.execute()');
  }

  /**
   * buildSpecPrompt — Convierte un Spec a un prompt estructurado
   *
   * EJERCICIO: implementar el formato del prompt
   * Pista: usa separadores claros entre secciones,
   * incluye los tipos TypeScript exactos para que el modelo los use directamente
   */
  private buildSpecPrompt(spec: Spec): string {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar buildSpecPrompt');
  }
}

// ============================================================================
// TAREA 5.4: MEDIR EL IMPACTO DEL SPEC
// ============================================================================

/**
 * SpecQualityMetrics — Métricas para evaluar la calidad de un spec
 *
 * Un spec de alta calidad produce código correcto en pocas iteraciones.
 * Estas métricas te ayudan a mejorar tu proceso de escritura de specs.
 */
export interface SpecQualityMetrics {
  specName: string;
  iterationsNeeded: number;    // cuántas iteraciones hasta código correcto
  manualCorrectionsNeeded: string[]; // qué tuviste que corregir manualmente
  mostImpactfulElements: string[];   // qué partes del spec ayudaron más
  improvementsForNextSpec: string[]; // qué agregarías la próxima vez
}

// ============================================================================
// MAIN — Ejecutar el spec del Analysis Agent
// ============================================================================

const main = async () => {
  console.log('=== DÍA 5: Spec-Driven Development ===\n');

  console.log('📋 Spec del Analysis Agent:');
  console.log(`  Función: ${analysisAgentSpec.functionName}`);
  console.log(`  Propósito: ${analysisAgentSpec.purpose.split('\n')[0].trim()}`);
  console.log(`  Edge cases: ${analysisAgentSpec.edgeCases.length}`);
  console.log(`  Architecture hints: ${analysisAgentSpec.architectureHints.length}`);
  console.log(`  Constraints: ${analysisAgentSpec.constraints.length}`);

  const executor = new SpecExecutor();

  console.log('\n🤖 Generando implementación a partir del spec...');
  try {
    const result = await executor.execute(analysisAgentSpec);
    console.log('\n✅ Código generado:');
    console.log('─'.repeat(60));
    console.log(result.code.substring(0, 500) + '...');
    console.log('─'.repeat(60));
    console.log(`\n📊 Tokens: ${result.tokens.input} input, ${result.tokens.output} output`);
    console.log(`⏱  Latencia: ${result.latencyMs}ms`);

    console.log('\n📝 EJERCICIO: Evalúa el código generado:');
    console.log('  1. ¿Compilaría en TypeScript strict mode?');
    console.log('  2. ¿Maneja todos los edge cases del spec?');
    console.log('  3. ¿Reutiliza los componentes indicados en architectureHints?');
    console.log('  4. ¿Cuántas correcciones manuales necesitarías hacer?');
    console.log('  5. Documenta en SpecQualityMetrics qué mejorarías en el spec');

  } catch {
    console.log('→ Implementa SpecExecutor.execute() y buildSpecPrompt() primero');
  }
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 5:
 *
 * 1. SPEC-DRIVEN DEVELOPMENT:
 *    - ¿Cuántas iteraciones necesitó el código del Analysis Agent?
 *    - ¿Qué elementos del spec tuvieron mayor impacto en la calidad?
 *    - ¿Qué agregarías al spec para reducir una iteración más?
 *
 * 2. TIPOS TYPESCRIPT EN SPECS:
 *    - ¿Cómo cambió el código cuando incluiste los tipos exactos?
 *    - ¿El modelo usó los tipos directamente o los interpretó?
 *
 * 3. ARCHITECTURE HINTS:
 *    - ¿El modelo reutilizó los componentes indicados?
 *    - ¿Cuánto código duplicado evitaste con los hints?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: Un spec es como un control de proceso documentado —
 *   define qué debe hacerse, cómo verificar que se hizo correctamente,
 *   y qué excepciones manejar. La calidad del control determina
 *   la calidad del output.
 * - QBP/Biología: En investigación, la calidad del protocolo determina
 *   la reproducibilidad del experimento. Un spec claro produce
 *   implementaciones reproducibles por diferentes modelos.
 */
