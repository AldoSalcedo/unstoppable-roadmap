/**
 * clinical-prompt-library.ts — Clinical Prompt Library completa
 * DÍA 7: Sprint de Integración — De componentes sueltos a sistema de producción
 *
 * CONCEPTOS CLAVE:
 * - PromptRegistry: catálogo central con versioning, evals y schemas
 * - CI-style evals: detectar regresiones antes de deploy
 * - Iteración guiada por datos: mejorar prompts con evidencia, no intuición
 * - Portfolio-grade: código que un equipo real podría mantener
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

// ============================================================================
// TAREA 7.1: TIPOS DEL PROMPT REGISTRY
// ============================================================================

/**
 * PromptEntry — Una entrada del registro de prompts
 *
 * Cada prompt en producción debe tener:
 * - Su propio schema de validación
 * - Su golden dataset de evals
 * - Un threshold de calidad mínima
 * - Un número de versión para tracking de cambios
 */
export interface PromptEntry<TInput, TOutput> {
  name: string;
  version: string;
  description: string;
  systemPrompt: string;
  buildUserMessage: (input: TInput) => string;
  outputSchema: z.ZodType<TOutput>;
  evalDataset: Array<{
    input: TInput;
    expectedOutput: TOutput;
    tags: string[];
  }>;
  evalThreshold: number;       // score mínimo para DEPLOY (0-10)
  model: string;
  maxTokens: number;
  temperature: number;
}

/**
 * RegistryRunResult — Resultado de ejecutar un prompt del registry
 */
export type RegistryRunResult<TOutput> =
  | { success: true; output: TOutput; tokens: { input: number; output: number }; latencyMs: number }
  | { success: false; reason: string };

// ============================================================================
// TAREA 7.2: PROMPT REGISTRY
// ============================================================================

/**
 * PromptRegistry — Catálogo central de todos los prompts del sistema
 *
 * El problema (sin registry):
 * ```typescript
 * // Prompts dispersos por toda la aplicación
 * // src/lab/analyzer.ts: const PROMPT = "Analiza este lab..."
 * // src/notes/generator.ts: const PROMPT = "Genera nota SOAP..."
 * // Sin versioning, sin evals, sin schema tipado
 * ```
 *
 * Con PromptRegistry:
 * ```typescript
 * const result = await registry.run('lab.analysis', labData);
 * // Un punto de entrada, validación automática, evals integrados
 * ```
 *
 * Aplicación Healthcare:
 * En un sistema clínico con 10+ prompts distintos, el registry es
 * la única forma de garantizar que todos están siendo evaluados,
 * versionados y mantenidos de forma consistente.
 */
export class PromptRegistry {
  private entries: Map<string, PromptEntry<unknown, unknown>> = new Map();

  /**
   * register — Registra un nuevo prompt en el catálogo
   */
  register<TInput, TOutput>(
    key: string,
    entry: PromptEntry<TInput, TOutput>,
  ): void {
    // EJERCICIO: implementar
    // Pista: guarda en this.entries con el key como identificador
    // Valida que no exista un entry con el mismo key (sino lanza error)
    throw new Error('TODO: implementar register');
  }

  /**
   * run — Ejecuta un prompt del registry
   */
  async run<TInput, TOutput>(
    key: string,
    input: TInput,
  ): Promise<RegistryRunResult<TOutput>> {
    // EJERCICIO: implementar
    // 1. Buscar el entry en el registry
    // 2. Construir el mensaje del usuario
    // 3. Llamar al API con el model, maxTokens y temperature del entry
    // 4. Parsear y validar el output con outputSchema
    // 5. Retornar resultado tipado
    throw new Error('TODO: implementar run');
  }

  /**
   * listPrompts — Lista todos los prompts registrados con metadata
   */
  listPrompts(): Array<{ key: string; name: string; version: string; description: string }> {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar listPrompts');
  }
}

// ============================================================================
// TAREA 7.3: DEFINICIÓN DE PROMPTS CLÍNICOS
// ============================================================================

// Schemas de output
const LabAnalysisOutputSchema = z.object({
  interpretacion: z.string().min(10),
  valores_criticos: z.array(z.string()),
  recomendaciones: z.array(z.string()).min(1),
  nivel_urgencia: z.enum(['bajo', 'medio', 'alto', 'critico']),
  confianza: z.number().min(0).max(1),
});

const SoapNoteSchema = z.object({
  subjetivo: z.string().min(10),
  objetivo: z.string().min(10),
  analisis: z.string().min(10),
  plan: z.string().min(10),
});

const TriageSchema = z.object({
  nivel_manchester: z.number().int().min(1).max(5),
  descripcion_nivel: z.string(),
  tiempo_maximo_espera_minutos: z.number().positive(),
  requiere_medico_inmediato: z.boolean(),
  sintomas_alarma: z.array(z.string()),
});

type LabAnalysisOutput = z.infer<typeof LabAnalysisOutputSchema>;
type SoapNote = z.infer<typeof SoapNoteSchema>;
type Triage = z.infer<typeof TriageSchema>;

/**
 * labAnalysisPrompt — Prompt de análisis de laboratorio
 *
 * EJERCICIO: Este prompt debe estar completamente implementado al final del día.
 * Usa todo lo que construiste en los días 1-6.
 */
export const labAnalysisPrompt: PromptEntry<{ resultados: string; contexto?: string }, LabAnalysisOutput> = {
  name: 'Analizador de Resultados de Laboratorio',
  version: '1.0.0',
  description: 'Analiza resultados de laboratorio e identifica valores críticos con nivel de urgencia',
  systemPrompt: `Eres un hospitalista certificado con 15 años de experiencia en UCI adultos
en hospital de tercer nivel en Ciudad de México. Tu especialidad es interpretar
resultados de laboratorio en contexto clínico.

CONSTRAINTS CRÍTICOS:
1. NUNCA emitas diagnóstico definitivo — usa lenguaje de posibilidad
2. SIEMPRE identifica valores fuera de rango normal con su rango de referencia
3. SIEMPRE indica que el médico tratante debe confirmar cualquier interpretación
4. Si hay valores potencialmente mortales, indícalo claramente como CRÍTICO
5. NO proporciones dosis de medicamentos
6. Cuando tengas incertidumbre, exprésala explícitamente — no inventes

FORMATO: Responde SIEMPRE con JSON válido con esta estructura exacta:
{
  "interpretacion": "resumen clínico de los hallazgos",
  "valores_criticos": ["valor fuera de rango: descripción"],
  "recomendaciones": ["recomendación 1", "recomendación 2"],
  "nivel_urgencia": "bajo | medio | alto | critico",
  "confianza": 0.0 a 1.0
}`,

  buildUserMessage: ({ resultados, contexto }) => {
    // EJERCICIO: construir el mensaje que incluye los resultados y el contexto
    throw new Error('TODO: implementar buildUserMessage');
  },

  outputSchema: LabAnalysisOutputSchema,

  evalDataset: [
    // EJERCICIO: agregar mínimo 10 casos del golden dataset del día 5
    {
      input: { resultados: 'K+: 6.8 mEq/L, Na+: 135 mEq/L, Creatinina: 4.2 mg/dL, pH: 7.18' },
      expectedOutput: {
        interpretacion: 'Hallazgos compatibles con insuficiencia renal aguda severa con hipercalemia y acidosis metabólica',
        valores_criticos: ['K+ 6.8 mEq/L (hipercalemia severa, riesgo de arritmia)', 'pH 7.18 (acidosis severa)', 'Creatinina 4.2 mg/dL (elevada)'],
        recomendaciones: ['ECG inmediato para evaluación de hipercalemia', 'Valorar diálisis de urgencia', 'Monitoreo continuo'],
        nivel_urgencia: 'critico',
        confianza: 0.9,
      },
      tags: ['critico', 'renal', 'hipercalemia'],
    },
  ],

  evalThreshold: 8.0,
  model: 'claude-3-5-haiku-20241022',
  maxTokens: 600,
  temperature: 0.1,
};

/**
 * soapNotePrompt — Prompt para generación de notas SOAP
 * EJERCICIO: Implementar completamente usando el FewShotTemplate del día 3
 */
export const soapNotePrompt: PromptEntry<{ descripcion: string; vitales?: string }, SoapNote> = {
  name: 'Generador de Notas SOAP',
  version: '1.0.0',
  description: 'Convierte descripciones de consulta en notas SOAP estructuradas',
  systemPrompt: `// EJERCICIO: escribir el system prompt para el generador de notas SOAP
// Usar los 4 pilares: Rol, Constraints, Formato, Tono`,
  buildUserMessage: ({ descripcion, vitales }) => {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar buildUserMessage para SOAP');
  },
  outputSchema: SoapNoteSchema,
  evalDataset: [
    // EJERCICIO: agregar mínimo 8 casos
  ],
  evalThreshold: 8.0,
  model: 'claude-3-5-haiku-20241022',
  maxTokens: 800,
  temperature: 0.2,
};

/**
 * triagePrompt — Prompt para clasificación de triaje Manchester
 * EJERCICIO: Implementar completamente
 */
export const triagePrompt: PromptEntry<{ sintomas: string }, Triage> = {
  name: 'Clasificador de Triaje Manchester',
  version: '1.0.0',
  description: 'Clasifica la urgencia de consulta según la Escala de Triaje Manchester (1-5)',
  systemPrompt: `// EJERCICIO: escribir el system prompt para triaje Manchester
// CRÍTICO: NUNCA diagnosticar, solo clasificar urgencia
// Nivel 1 = inmediato, Nivel 5 = no urgente`,
  buildUserMessage: ({ sintomas }) => {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar buildUserMessage para triaje');
  },
  outputSchema: TriageSchema,
  evalDataset: [
    // EJERCICIO: agregar mínimo 10 casos (incluir casos de distintos niveles Manchester)
  ],
  evalThreshold: 8.0,
  model: 'claude-3-5-haiku-20241022',
  maxTokens: 400,
  temperature: 0.0,  // triaje debe ser determinista
};

// ============================================================================
// TAREA 7.4: CI EVAL RUNNER
// ============================================================================

/**
 * runCIEvals — Script de evaluación estilo CI/CD
 *
 * Este script es el equivalente a `npm test` pero para tus prompts.
 * Debe correr ANTES de hacer deploy de cualquier cambio a prompts.
 */
export const runCIEvals = async (registry: PromptRegistry): Promise<void> => {
  const evalResultsDir = path.join(process.cwd(), 'eval-results');
  if (!fs.existsSync(evalResultsDir)) {
    fs.mkdirSync(evalResultsDir, { recursive: true });
  }

  const date = new Date().toISOString().split('T')[0];
  const reportPath = path.join(evalResultsDir, `${date}.json`);

  console.log('\n🔍 Corriendo evals — Clinical Prompt Library');
  console.log('━'.repeat(60));

  const allResults: Array<{
    key: string;
    name: string;
    score: number;
    threshold: number;
    passed: boolean;
    casesRun: number;
    casesPassed: number;
  }> = [];

  let totalFailed = 0;

  for (const { key, name } of registry.listPrompts()) {
    // EJERCICIO: para cada prompt, correr su eval dataset
    // y mostrar el resultado formateado con ✅ / ❌
    // Pista: usa el EvalRunner del día 5

    console.log(`  Evaluando ${name}...`);
    // TODO: implementar la lógica de eval para cada prompt
  }

  console.log('━'.repeat(60));

  // Guardar reporte
  fs.writeFileSync(reportPath, JSON.stringify({ date, results: allResults }, null, 2));
  console.log(`\n📄 Reporte guardado en: ${reportPath}`);

  // Salir con error si algún prompt falló
  if (totalFailed > 0) {
    console.log(`\n🚫 DEPLOY BLOQUEADO — ${totalFailed} prompt(s) por debajo del threshold`);
    process.exit(1);
  } else {
    console.log('\n✅ TODOS LOS PROMPTS PASAN — DEPLOY AUTORIZADO');
  }
};

// ============================================================================
// MAIN
// ============================================================================

const main = async () => {
  console.log('=== DÍA 7: Clinical Prompt Library — Sprint de Integración ===\n');

  const registry = new PromptRegistry();

  // Registrar los 3 prompts clínicos
  try {
    registry.register('lab.analysis', labAnalysisPrompt);
    registry.register('notes.soap', soapNotePrompt);
    registry.register('triage.manchester', triagePrompt);
    console.log('✅ Prompts registrados:', registry.listPrompts().map(p => p.name).join(', '));
  } catch {
    console.log('→ Implementa PromptRegistry.register() primero');
    return;
  }

  // Probar un análisis de laboratorio
  console.log('\n🔬 Probando análisis de laboratorio...');
  const testLab = await registry.run('lab.analysis', {
    resultados: 'Glucosa: 450 mg/dL, Cetonas: positivas, pH: 7.25, HCO3-: 14 mEq/L',
    contexto: 'Paciente diabético tipo 1 de 22 años, sin antecedentes de episodios previos',
  });

  if (testLab.success) {
    console.log('Resultado:', JSON.stringify(testLab.output, null, 2));
  } else {
    console.log('Error:', testLab.reason);
  }

  // Correr CI evals
  console.log('\n🚀 Corriendo CI evals...');
  await runCIEvals(registry);
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 7 (resumen de la semana):
 *
 * 1. PROMPT REGISTRY:
 *    - ¿Qué problema resuelve?
 *    - ¿Qué pasa sin él?
 *
 * 2. CI-STYLE EVALS:
 *    - ¿Cómo cambia tu workflow con evals automáticos?
 *    - ¿Qué encontraste que no esperabas en los resultados?
 *
 * 3. ITERACIÓN GUIADA POR DATOS:
 *    - ¿Qué prompt mejoró más en el proceso iterativo?
 *    - ¿Qué cambio tuvo mayor impacto en el score?
 *
 * REFLEXIÓN FINAL DE LA SEMANA:
 * Antes de esta semana, yo creía que Context Engineering era...
 * Después de esta semana, ahora entiendo que...
 * La habilidad más importante que adquirí fue...
 * El concepto que me cuesta más trabajo es...
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: El PromptRegistry es como un sistema de gestión de
 *   políticas — centralizado, versionado, auditado
 * - Healthcare: El CI eval runner es tu control de calidad clínico
 *   automatizado — si cae por debajo del estándar, se bloquea el deploy
 */
