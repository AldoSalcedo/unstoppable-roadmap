/**
 * prompt-builder.ts — Constructor tipado de system prompts
 * DÍA 2: System Prompts — El pilar más ignorado y más poderoso
 *
 * CONCEPTOS CLAVE:
 * - El system prompt define la "personalidad base" para toda la conversación
 * - 4 pilares: Rol, Constraints, Formato, Tono
 * - Especificidad > Genericidad en todos los pilares
 * - Un system prompt bien diseñado reemplaza docenas de instrucciones repetidas
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const MODEL = 'claude-3-5-haiku-20241022' as const;

// ============================================================================
// TAREA 2.1: TIPOS PARA LOS 4 PILARES
// ============================================================================

/**
 * MedicalSpecialty — Especialidades médicas soportadas
 * Usar un union type en lugar de string previene typos en el rol
 */
export type MedicalSpecialty =
  | 'hospitalista'
  | 'urgenciologo'
  | 'internista'
  | 'pediatra'
  | 'cardiologo'
  | 'neumólogo'
  | 'nefrologo'
  | 'endocrinologo';

/**
 * OutputFormat — Formatos de respuesta soportados
 */
export type OutputFormat =
  | { kind: 'json'; schema: Record<string, string> }
  | { kind: 'structured_text'; sections: string[] }
  | { kind: 'free_text' };

/**
 * UrgencyLevel — Escala Manchester de triaje
 */
export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * SystemPromptConfig — Configuración completa de los 4 pilares
 *
 * El problema (sin tipos):
 * ```typescript
 * const prompt = `Eres un médico. Responde en JSON. No diagnostiques.`;
 * // ¿Qué especialidad? ¿Qué JSON? ¿Qué más no debe hacer?
 * ```
 *
 * Con SystemPromptConfig:
 * ```typescript
 * const config: SystemPromptConfig = {
 *   role: { specialty: 'hospitalista', yearsExperience: 15, context: 'UCI adultos' },
 *   constraints: ['NUNCA emitir diagnóstico definitivo', ...],
 *   outputFormat: { kind: 'json', schema: { ... } },
 *   tone: 'directo',
 *   language: 'es',
 * };
 * ```
 *
 * Aplicación Healthcare:
 * La configuración tipada previene que un desarrollador nuevo configure mal
 * un asistente clínico — el compilador detecta el error antes del deploy.
 */
export interface SystemPromptConfig {
  role: {
    specialty: MedicalSpecialty;
    yearsExperience: number;
    context: string; // ej: "hospital de tercer nivel en CDMX"
    additionalExpertise?: string[];
  };
  constraints: string[];     // lista de lo que NO debe hacer
  outputFormat: OutputFormat;
  tone: 'formal' | 'directo' | 'pedagogico';
  language: 'es' | 'en';
}

// ============================================================================
// TAREA 2.2: SYSTEM PROMPT BUILDER
// ============================================================================

/**
 * SystemPromptBuilder — Construye system prompts desde configuración tipada
 *
 * Ventajas:
 * - Los 4 pilares siempre están presentes (no se pueden olvidar)
 * - El output es un string optimizado para el modelo
 * - Fácil de versionar y auditar cambios
 * - TypeScript garantiza que la config es válida
 */
export class SystemPromptBuilder {
  constructor(private readonly config: SystemPromptConfig) {}

  /**
   * buildRoleSection — Genera la sección de rol
   * Pista: especificidad es clave. "15 años de experiencia en UCI adultos en CDMX"
   * es mucho mejor que "médico con experiencia".
   */
  private buildRoleSection(): string {
    // EJERCICIO: implementar
    // Pista: usa todos los campos de config.role para construir una descripción específica
    throw new Error('TODO: implementar buildRoleSection');
  }

  /**
   * buildConstraintsSection — Genera la sección de constraints
   * Pista: usa lista numerada. Los constraints son reglas que no se pueden romper.
   */
  private buildConstraintsSection(): string {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar buildConstraintsSection');
  }

  /**
   * buildFormatSection — Genera las instrucciones de formato
   * Pista: para JSON, incluye el schema exacto que esperas
   */
  private buildFormatSection(): string {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar buildFormatSection');
  }

  /**
   * buildToneSection — Genera las instrucciones de tono
   */
  private buildToneSection(): string {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar buildToneSection');
  }

  /**
   * build — Ensambla el system prompt completo
   *
   * El orden importa: Rol → Constraints → Formato → Tono
   * Los constraints van después del rol para que sean explícitamente
   * restricciones al rol, no reglas genéricas.
   */
  build(): string {
    // EJERCICIO: implementar
    // Pista: une las 4 secciones con separadores claros
    throw new Error('TODO: implementar build');
  }

  /**
   * estimateTokens — Estima el costo en tokens del system prompt generado
   */
  estimateTokens(): number {
    const prompt = this.build();
    // Aproximación: ~4 caracteres por token
    return Math.ceil(prompt.length / 4);
  }
}

// ============================================================================
// TAREA 2.3: CONFIGURACIONES PREDEFINIDAS PARA HEALTHCARE
// ============================================================================

/**
 * labAnalysisConfig — Configuración para el analizador de resultados de laboratorio
 *
 * Aplicación Healthcare:
 * Este es el prompt que usará el sistema de análisis clínico que construiste
 * en Week 8. Con esta semana, ya no es un string hardcodeado — es una
 * configuración versionada y tipada.
 */
export const labAnalysisConfig: SystemPromptConfig = {
  role: {
    specialty: 'hospitalista',
    yearsExperience: 15,
    context: 'hospital de tercer nivel en Ciudad de México',
    additionalExpertise: ['medicina interna', 'interpretación de laboratorio clínico'],
  },
  constraints: [
    'NUNCA emitas un diagnóstico definitivo — usa lenguaje de posibilidad',
    'SIEMPRE identifica valores críticos que requieren atención inmediata',
    'SIEMPRE indica que el médico tratante debe confirmar cualquier interpretación',
    'NO proporciones dosis específicas de medicamentos',
    'NO menciones marcas comerciales — solo nombres genéricos',
  ],
  outputFormat: {
    kind: 'json',
    schema: {
      interpretacion: 'string — resumen de los hallazgos en lenguaje clínico',
      valores_criticos: 'string[] — valores fuera de rango que requieren atención inmediata',
      recomendaciones: 'string[] — próximos pasos sugeridos al médico tratante',
      nivel_urgencia: '"bajo" | "medio" | "alto" | "critico"',
      confianza: 'number — 0 a 1, nivel de certeza de la interpretación',
    },
  },
  tone: 'directo',
  language: 'es',
};

/**
 * triageConfig — Configuración para el sistema de triaje Manchester
 */
export const triageConfig: SystemPromptConfig = {
  // EJERCICIO: completar la configuración para un asistente de triaje
  // que clasifica urgencia en escala Manchester 1-5
  // NUNCA diagnostica, solo clasifica urgencia
  // Siempre indica si el paciente debe ver al médico en < 15 minutos
  role: {
    specialty: 'urgenciologo',
    yearsExperience: 10,
    context: 'urgencias de hospital general',
  },
  constraints: [
    // EJERCICIO: definir constraints apropiados para triaje
  ],
  outputFormat: {
    // EJERCICIO: definir el formato de output para triaje Manchester
    kind: 'json',
    schema: {},
  },
  tone: 'directo',
  language: 'es',
};

// ============================================================================
// MAIN — Comparar versiones de prompts
// ============================================================================

const main = async () => {
  console.log('=== DÍA 2: System Prompts y SystemPromptBuilder ===\n');

  // --- Ejercicio 2.1: Comparar 3 versiones de prompt ---
  const casoClinico = `
    Paciente masculino, 67 años.
    Laboratorios: K+ 6.8 mEq/L, Creatinina 4.2 mg/dL, BUN 85 mg/dL,
    pH 7.18, HCO3- 12 mEq/L, pCO2 28 mmHg.
    Sin antecedentes documentados.
  `;

  const promptVersionA = 'Eres un asistente médico útil. Analiza estos laboratorios.';
  const promptVersionB = `Eres un médico hospitalista con experiencia en UCI.
    Analiza estos laboratorios e identifica valores críticos.
    No des diagnósticos definitivos.`;
  // Versión C: la generará el SystemPromptBuilder

  console.log('📊 Comparando versiones de system prompt:');
  console.log('  Versión A (genérica):', promptVersionA.length, 'chars');
  console.log('  Versión B (semi-específica):', promptVersionB.length, 'chars');

  // Cuando implementes el builder, descomenta esto:
  // const builder = new SystemPromptBuilder(labAnalysisConfig);
  // const promptVersionC = builder.build();
  // console.log('  Versión C (builder completo):', promptVersionC.length, 'chars');

  console.log('\n🏗️  Construyendo system prompt con SystemPromptBuilder...');
  console.log('  → Implementa SystemPromptBuilder y las configuraciones');
  console.log('  → Luego compara los outputs de las 3 versiones con el mismo caso clínico');
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 2:
 *
 * 1. ROL ESPECÍFICO:
 *    - ¿Qué es?
 *    - ¿Cuándo usarlo?
 *    - ¿Cuándo NO usarlo?
 *
 * 2. CONSTRAINTS:
 *    - ¿Qué es?
 *    - ¿Cuándo usarlo?
 *    - ¿Cuándo NO usarlo?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: Los constraints son como las políticas de control interno —
 *   definen lo que el sistema NO puede hacer, no solo lo que debe hacer
 * - Healthcare: En un asistente clínico, los constraints son tan importantes
 *   como el rol — previenen que el modelo cause daño
 */
