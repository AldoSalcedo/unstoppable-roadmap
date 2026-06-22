/**
 * few-shot-template.ts — Template genérico para few-shot prompting
 * DÍA 3: Few-Shot Prompting — Enseñar con ejemplos
 *
 * CONCEPTOS CLAVE:
 * - Few-shot funciona en TODOS los modelos — es la técnica más portable
 * - Los ejemplos negativos (qué NO hacer) son tan valiosos como los positivos
 * - Chain-of-thought: pedir razonamiento mejora la precisión en tareas complejas
 * - Diversidad en ejemplos > cantidad de ejemplos
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const MODEL = 'claude-3-5-haiku-20241022' as const;

// ============================================================================
// TAREA 3.1: TIPOS PARA FEW-SHOT
// ============================================================================

/**
 * FewShotExample — Un ejemplo individual con input, output y razonamiento opcional
 *
 * El campo `reasoning` implementa Chain-of-Thought:
 * mostrar el razonamiento paso a paso mejora dramáticamente la calidad
 * en tareas que requieren múltiples pasos lógicos (como análisis clínico).
 */
export interface FewShotExample<TInput, TOutput> {
  input: TInput;
  output: TOutput;
  reasoning?: string;   // Chain-of-Thought: el modelo verá cómo "pensar"
  isNegative?: boolean; // si es true, es un ejemplo de qué NO hacer
  negativeExplanation?: string; // por qué este output es incorrecto
  tags?: string[];      // para filtrar ejemplos: ['critico', 'normal', 'edge-case']
}

/**
 * FewShotConfig — Configuración del template
 */
export interface FewShotConfig {
  systemPrompt: string;
  taskDescription: string;
  useChainOfThought: boolean;
  chainOfThoughtInstructions?: string;
  outputInstructions?: string;
}

// ============================================================================
// TAREA 3.2: FEW-SHOT TEMPLATE GENÉRICO
// ============================================================================

/**
 * FewShotTemplate — Clase genérica para few-shot prompting
 *
 * El problema (sin template):
 * ```typescript
 * // Construir el prompt manualmente cada vez
 * const prompt = `${ejemplo1}\n${ejemplo2}\n${nuevoInput}`;
 * // Frágil, no reutilizable, difícil de mantener
 * ```
 *
 * Con FewShotTemplate:
 * ```typescript
 * const template = new FewShotTemplate<LabInput, AnalysisOutput>({ ... });
 * template.addExample({ input: labData, output: analysis });
 * const result = await template.run(newLabData);
 * // Siempre el mismo formato, fácil de agregar ejemplos
 * ```
 *
 * Aplicación Healthcare:
 * Un template reutilizable para análisis de gasometría puede usarse
 * tanto en urgencias como en UCI — los ejemplos se adaptan al contexto
 * pero la lógica del template es siempre la misma.
 */
export class FewShotTemplate<TInput, TOutput> {
  private examples: Array<FewShotExample<TInput, TOutput>> = [];

  constructor(
    private readonly config: FewShotConfig,
    private readonly formatter: (input: TInput) => string,
    private readonly outputParser: (raw: string) => TOutput,
  ) {}

  /**
   * addExample — Agrega un ejemplo al template (retorna this para chaining)
   *
   * Pista: el orden de los ejemplos importa. Considera ordenar:
   * normal → anomalía leve → anomalía severa → edge case
   */
  addExample(example: FewShotExample<TInput, TOutput>): this {
    // EJERCICIO: implementar
    // Pista: simplemente agrega a this.examples — retorna this para chaining
    throw new Error('TODO: implementar addExample');
  }

  /**
   * buildPrompt — Construye el prompt completo con todos los ejemplos
   *
   * Pista: el formato recomendado es:
   * [descripción de tarea]
   * [ejemplo 1 con razonamiento si existe]
   * [ejemplo 2...]
   * [instrucciones de output]
   * Input: [nuevo input]
   * Output:
   */
  private buildPrompt(input: TInput): string {
    // EJERCICIO: implementar
    // Considera:
    // 1. Agregar config.taskDescription
    // 2. Por cada ejemplo: formatear input, mostrar reasoning si existe, mostrar output
    // 3. Para ejemplos negativos: mostrar el output incorrecto y por qué es malo
    // 4. Agregar chain-of-thought instructions si config.useChainOfThought
    // 5. Agregar el nuevo input
    throw new Error('TODO: implementar buildPrompt');
  }

  /**
   * run — Ejecuta el template con un nuevo input
   */
  async run(input: TInput): Promise<{
    output: TOutput;
    reasoning: string | null;
    promptTokens: number;
    outputTokens: number;
  }> {
    // EJERCICIO: implementar
    // Pista: usa client.messages.create con el system prompt y el prompt construido
    // Si useChainOfThought es true, extrae el razonamiento del output antes de parsearlo
    throw new Error('TODO: implementar run');
  }

  /**
   * getExampleCount — Cuántos ejemplos tiene el template actualmente
   */
  getExampleCount(): number {
    return this.examples.length;
  }

  /**
   * filterExamples — Filtra ejemplos por tags para inspección
   */
  filterExamples(tag: string): Array<FewShotExample<TInput, TOutput>> {
    return this.examples.filter(e => e.tags?.includes(tag) ?? false);
  }
}

// ============================================================================
// TAREA 3.3: TEMPLATE PARA NOTAS SOAP
// ============================================================================

/**
 * Tipos para el template SOAP
 * SOAP = Subjetivo, Objetivo, Análisis, Plan
 */
export interface ConsultaInput {
  descripcion: string;  // descripción libre de la consulta
  vitales?: {
    temperatura?: number;
    presionArterial?: string;
    frecuenciaCardiaca?: number;
    saturacion?: number;
  };
}

export interface NotaSOAP {
  subjetivo: string;    // síntomas y quejas del paciente
  objetivo: string;     // signos vitales y hallazgos físicos
  analisis: string;     // interpretación clínica
  plan: string;         // próximos pasos diagnósticos y terapéuticos
}

/**
 * soapExamples — Ejemplos para el template SOAP
 *
 * Aplicación Healthcare:
 * Las notas SOAP son el estándar internacional de documentación médica.
 * Un LLM que las genera correctamente puede ahorrar horas de documentación
 * a médicos — pero SOLO si los ejemplos son clínicamente correctos.
 */
export const soapExamples: Array<FewShotExample<ConsultaInput, NotaSOAP>> = [
  {
    input: {
      descripcion: 'Paciente femenina de 45 años con dolor de garganta de 3 días de evolución, fiebre de 38.5°C y dificultad para tragar.',
      vitales: { temperatura: 38.5, presionArterial: '120/80', frecuenciaCardiaca: 92, saturacion: 98 },
    },
    output: {
      subjetivo: 'Paciente femenina de 45 años refiere dolor faríngeo de 3 días de evolución, odinofagia y fiebre subjetiva. Niega tos, rinorrea o dificultad respiratoria.',
      objetivo: 'Signos vitales: T 38.5°C, TA 120/80 mmHg, FC 92/min, SpO2 98%. A la exploración: faringe eritematosa con exudado blanquecino en amígdalas, adenopatías cervicales anteriores dolorosas bilaterales.',
      analisis: 'Cuadro compatible con faringoamigdalitis bacteriana. Puntaje CENTOR 3/4 (fiebre, exudado amigdalino, adenopatías, ausencia de tos). Alta probabilidad de etiología estreptocócica.',
      plan: '1. Cultivo faríngeo y prueba rápida para Streptococcus pyogenes\n2. Considerar inicio de antibioticoterapia según resultado\n3. Antipirético: paracetamol 500mg c/8h\n4. Revisión en 48-72h o antes si empeora',
    },
    reasoning: 'El puntaje CENTOR guía la decisión: con 3 puntos hay probabilidad intermedia de infección estreptocócica, lo que justifica estudios confirmatorios antes de antibiótico.',
    tags: ['normal', 'infeccion'],
  },
  {
    // EJERCICIO: agregar un segundo ejemplo — caso con valores críticos
    // Sugerencia: paciente con disnea, taquicardia, y saturación baja
    input: {
      descripcion: 'TODO: crear segundo ejemplo',
    },
    output: {
      subjetivo: 'TODO',
      objetivo: 'TODO',
      analisis: 'TODO',
      plan: 'TODO',
    },
    tags: ['urgente'],
  },
  {
    // EJERCICIO: agregar un tercer ejemplo — caso normal sin hallazgos
    input: {
      descripcion: 'TODO: crear tercer ejemplo (consulta preventiva normal)',
    },
    output: {
      subjetivo: 'TODO',
      objetivo: 'TODO',
      analisis: 'TODO',
      plan: 'TODO',
    },
    tags: ['normal', 'preventivo'],
  },
];

// ============================================================================
// MAIN — Probar el template SOAP
// ============================================================================

const main = async () => {
  console.log('=== DÍA 3: Few-Shot Prompting y FewShotTemplate ===\n');

  const soapSystemPrompt = `Eres un médico hospitalista con 15 años de experiencia.
Tu tarea es convertir descripciones libres de consultas médicas en notas SOAP estructuradas.
Las notas deben ser clínicamente precisas, concisas y seguir el formato estándar SOAP.
NUNCA inventes datos que no estén en la descripción.
Responde SIEMPRE en formato JSON válido.`;

  // Cuando implementes FewShotTemplate, descomenta esto:
  // const soapTemplate = new FewShotTemplate<ConsultaInput, NotaSOAP>(
  //   {
  //     systemPrompt: soapSystemPrompt,
  //     taskDescription: 'Convierte la siguiente descripción de consulta en una nota SOAP estructurada.',
  //     useChainOfThought: true,
  //     chainOfThoughtInstructions: 'Antes de escribir la nota, analiza brevemente los hallazgos clave.',
  //     outputInstructions: 'Responde con JSON que tenga los campos: subjetivo, objetivo, analisis, plan',
  //   },
  //   (input) => JSON.stringify(input, null, 2),
  //   (raw) => JSON.parse(raw) as NotaSOAP,
  // );

  // soapExamples.forEach(example => soapTemplate.addExample(example));

  // const resultado = await soapTemplate.run({
  //   descripcion: 'Paciente masculino 55 años con dolor torácico de inicio súbito hace 2 horas, irradiado al brazo izquierdo, diaforesis y náusea.',
  //   vitales: { temperatura: 37.0, presionArterial: '160/100', frecuenciaCardiaca: 110, saturacion: 96 },
  // });

  // console.log('📋 Nota SOAP generada:');
  // console.log(JSON.stringify(resultado.output, null, 2));
  // console.log(`\n💭 Razonamiento: ${resultado.reasoning}`);
  // console.log(`📊 Tokens: ${resultado.promptTokens} input, ${resultado.outputTokens} output`);

  console.log('→ Implementa FewShotTemplate y soapExamples, luego descomenta el código de arriba');
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 3:
 *
 * 1. FEW-SHOT PROMPTING:
 *    - ¿Qué es?
 *    - ¿Cuándo usarlo?
 *    - ¿Cuándo NO usarlo?
 *
 * 2. CHAIN-OF-THOUGHT:
 *    - ¿Qué es?
 *    - ¿Cuándo usarlo?
 *    - ¿Cuándo NO usarlo?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología: Los ejemplos son como casos clínicos en la formación médica —
 *   el residente aprende viendo casos, no leyendo definiciones abstractas
 * - Auditoría: Los ejemplos negativos son como hallazgos de auditoría —
 *   documentar qué NO debe hacerse es tan importante como qué sí
 */
