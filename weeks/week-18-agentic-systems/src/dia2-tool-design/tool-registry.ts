/**
 * tool-registry.ts — Registro tipado de tools con validación Zod
 * DÍA 2: Tool Design — La interfaz que el agente usa
 *
 * CONCEPTOS CLAVE:
 * - La descripción del tool es tan importante como su implementación
 * - El modelo lee tu descripción para decidir SI y CÓMO usar el tool
 * - Validar inputs con Zod previene errores silenciosos en producción
 * - Los tools nunca deben lanzar excepciones — siempre retornan resultado estructurado
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// TAREA 2.1: TIPOS DEL TOOL REGISTRY
// ============================================================================

/**
 * ToolResult — Resultado tipado de la ejecución de un tool
 *
 * Los tools nunca fallan silenciosamente — siempre retornan éxito o error estructurado.
 * Esto permite que el agente maneje el error y decida qué hacer.
 */
export type ToolResult<TOutput> =
  | { success: true; data: TOutput; latencyMs: number }
  | { success: false; error: string; suggestion?: string; latencyMs: number };

/**
 * ToolDefinition — Definición completa de un tool tipado
 */
export interface ToolDefinition<TInput, TOutput> {
  name: string;
  description: string;  // CRÍTICO: el modelo lee esto para decidir si usar el tool
  inputSchema: z.ZodType<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
  anthropicSchema: Anthropic.Tool['input_schema'];  // el schema que va al API
}

// ============================================================================
// TAREA 2.2: TOOL REGISTRY
// ============================================================================

/**
 * ToolRegistry — Catálogo tipado de tools disponibles para el agente
 *
 * El problema (sin registry):
 * ```typescript
 * // Tools definidos como arrays de objetos sin tipos
 * const tools = [{ name: 'search', ... }];
 * const result = await executeSearch(input); // ¿qué tipo es input? ¿y result?
 * ```
 *
 * Con ToolRegistry:
 * ```typescript
 * const registry = new ToolRegistry();
 * registry.register('search_guidelines', searchTool);
 * const result = await registry.execute('search_guidelines', rawInput);
 * // result es ToolResult<SearchOutput> — completamente tipado
 * ```
 *
 * Aplicación Healthcare:
 * Un sistema clínico puede tener 15+ tools distintos. Sin registry,
 * mantener la coherencia entre definiciones y ejecutores es imposible.
 */
export class ToolRegistry {
  private tools = new Map<string, ToolDefinition<unknown, unknown>>();

  /**
   * register — Registra un tool con su definición completa
   */
  register<TInput, TOutput>(
    name: string,
    tool: ToolDefinition<TInput, TOutput>,
  ): this {
    // EJERCICIO: implementar
    // Pista: guarda en this.tools, retorna this para chaining
    // Valida que el nombre del tool coincide con tool.name
    throw new Error('TODO: implementar register');
  }

  /**
   * execute — Ejecuta un tool con validación de input y manejo de errores
   *
   * Flujo:
   * 1. Buscar el tool por nombre
   * 2. Validar el input con el schema Zod del tool
   * 3. Ejecutar el tool y medir latencia
   * 4. Retornar ToolResult (nunca lanzar excepciones)
   */
  async execute(name: string, rawInput: unknown): Promise<ToolResult<unknown>> {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar execute');
  }

  /**
   * getAnthropicTools — Retorna los tools en el formato que espera el API de Anthropic
   */
  getAnthropicTools(): Anthropic.Tool[] {
    // EJERCICIO: implementar
    // Pista: itera this.tools y construye el array de Anthropic.Tool
    throw new Error('TODO: implementar getAnthropicTools');
  }

  /**
   * listTools — Lista los tools registrados (para debugging)
   */
  listTools(): string[] {
    return Array.from(this.tools.keys());
  }
}

// ============================================================================
// TAREA 2.3: TOOLS PARA EL CLINICAL RESEARCH ASSISTANT
// ============================================================================

// Schemas de input para los 3 tools del capstone

const SearchGuidelinesInputSchema = z.object({
  query: z.string().min(5, 'La query debe tener al menos 5 caracteres').max(500),
  topK: z.number().int().min(1).max(10).default(3),
  evidenceLevel: z.enum(['todos', 'alta', 'media']).default('todos'),
});

const GetEvidenceMetadataInputSchema = z.object({
  documentId: z.string(),
});

const FlagEvidenceGapInputSchema = z.object({
  subtaskId: z.string(),
  query: z.string(),
  reason: z.string().min(10, 'Explica por qué no hay evidencia suficiente'),
  searchedTerms: z.array(z.string()),
});

type SearchGuidelinesInput = z.infer<typeof SearchGuidelinesInputSchema>;
type GetEvidenceMetadataInput = z.infer<typeof GetEvidenceMetadataInputSchema>;
type FlagEvidenceGapInput = z.infer<typeof FlagEvidenceGapInputSchema>;

interface SearchGuidelinesOutput {
  results: Array<{
    documentId: string;
    title: string;
    relevantChunk: string;
    similarity: number;
    evidenceLevel: string;
  }>;
  totalFound: number;
}

interface EvidenceMetadata {
  documentId: string;
  title: string;
  source: string;
  publicationDate: string;
  evidenceLevel: 'A' | 'B' | 'C';
  lastUpdated: string;
}

interface EvidenceGapFlag {
  flagged: boolean;
  subtaskId: string;
  message: string;
}

/**
 * searchGuidelinesTool — Busca en la knowledge base de guías clínicas
 *
 * EJERCICIO: Implementa la descripción completa con:
 * - Qué hace el tool exactamente
 * - Cuándo usarlo (y cuándo no)
 * - Qué retorna y en qué formato
 *
 * Pista: la descripción debe responder: ¿qué es evidenceLevel? ¿qué significa topK?
 */
export const searchGuidelinesTool: ToolDefinition<SearchGuidelinesInput, SearchGuidelinesOutput> = {
  name: 'search_clinical_guidelines',
  description: `// EJERCICIO: escribir descripción completa y específica
// La descripción VAGA causará que el agente no sepa cuándo usar este tool
// La descripción ESPECÍFICA guiará al agente a usarlo correctamente`,

  inputSchema: SearchGuidelinesInputSchema,

  execute: async (input) => {
    // EJERCICIO: implementar usando MedicalKnowledgeBase del día 4
    // Por ahora retorna mock data para poder probar el registry
    await new Promise(r => setTimeout(r, 100)); // simular latencia de búsqueda
    return {
      results: [
        {
          documentId: 'guideline-ic-001',
          title: 'Guía de Insuficiencia Cardíaca 2024',
          relevantChunk: `Chunk relevante para: "${input.query}"...`,
          similarity: 0.87,
          evidenceLevel: 'A',
        },
      ],
      totalFound: 1,
    };
  },

  anthropicSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Término o pregunta clínica a buscar en las guías',
      },
      topK: {
        type: 'number',
        description: 'Número de resultados a retornar (1-10, default: 3)',
      },
      evidenceLevel: {
        type: 'string',
        enum: ['todos', 'alta', 'media'],
        description: 'Filtrar por nivel de evidencia: "todos", "alta" (nivel A), "media" (nivel B)',
      },
    },
    required: ['query'],
  },
};

/**
 * getEvidenceMetadataTool — Obtiene metadatos de un documento de la knowledge base
 *
 * EJERCICIO: implementar descripción, execute y anthropicSchema completos
 */
export const getEvidenceMetadataTool: ToolDefinition<GetEvidenceMetadataInput, EvidenceMetadata> = {
  name: 'get_evidence_metadata',
  description: `// EJERCICIO: descripción específica para metadatos de documentos`,
  inputSchema: GetEvidenceMetadataInputSchema,
  execute: async (input) => {
    // EJERCICIO: implementar (retornar metadata mock por ahora)
    throw new Error(`TODO: implementar getEvidenceMetadata para ${input.documentId}`);
  },
  anthropicSchema: {
    type: 'object' as const,
    properties: {
      documentId: { type: 'string', description: 'ID del documento (obtenido de search_clinical_guidelines)' },
    },
    required: ['documentId'],
  },
};

/**
 * flagEvidenceGapTool — Marca cuando no hay evidencia suficiente para una subtarea
 *
 * EJERCICIO: implementar descripción, execute y anthropicSchema completos
 */
export const flagEvidenceGapTool: ToolDefinition<FlagEvidenceGapInput, EvidenceGapFlag> = {
  name: 'flag_evidence_gap',
  description: `// EJERCICIO: descripción para gaps de evidencia`,
  inputSchema: FlagEvidenceGapInputSchema,
  execute: async (input) => {
    console.log(`⚠️  Gap de evidencia para subtarea "${input.subtaskId}": ${input.reason}`);
    return {
      flagged: true,
      subtaskId: input.subtaskId,
      message: `Gap registrado: no se encontró evidencia para "${input.query}" usando términos: ${input.searchedTerms.join(', ')}`,
    };
  },
  anthropicSchema: {
    type: 'object' as const,
    properties: {
      subtaskId: { type: 'string', description: 'ID de la subtarea sin evidencia' },
      query: { type: 'string', description: 'Query que no produjo resultados relevantes' },
      reason: { type: 'string', description: 'Explicación de por qué no hay evidencia suficiente' },
      searchedTerms: { type: 'array', items: { type: 'string' }, description: 'Términos de búsqueda ya intentados' },
    },
    required: ['subtaskId', 'query', 'reason', 'searchedTerms'],
  },
};

// ============================================================================
// MAIN — Probar el ToolRegistry
// ============================================================================

const main = async () => {
  console.log('=== DÍA 2: Tool Registry ===\n');

  const registry = new ToolRegistry();

  try {
    registry
      .register('search_clinical_guidelines', searchGuidelinesTool)
      .register('get_evidence_metadata', getEvidenceMetadataTool)
      .register('flag_evidence_gap', flagEvidenceGapTool);

    console.log('✅ Tools registrados:', registry.listTools());

    // Prueba de validación
    console.log('\n🔍 Probando validación de input...');
    const result = await registry.execute('search_clinical_guidelines', {
      query: 'tratamiento insuficiencia cardíaca',
      topK: 3,
    });

    if (result.success) {
      console.log('✅ Tool ejecutado en', result.latencyMs, 'ms');
    } else {
      console.log('❌ Error:', result.error);
    }

    // Prueba de input inválido
    console.log('\n🔍 Probando input inválido...');
    const invalidResult = await registry.execute('search_clinical_guidelines', {
      query: 'ab', // demasiado corto — debería fallar la validación Zod
    });
    console.log('Resultado con input inválido:', invalidResult.success ? 'PASS (inesperado)' : `FAIL correcto: ${invalidResult.error}`);

  } catch {
    console.log('→ Implementa ToolRegistry.register() y execute() primero');
  }
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 2:
 *
 * 1. DESCRIPCIONES DE TOOLS:
 *    - ¿Qué diferencia observaste entre la descripción vaga y la específica?
 *    - ¿En cuántos casos el modelo usó el tool correctamente con cada versión?
 *
 * 2. VALIDACIÓN ZOD EN TOOLS:
 *    - ¿Qué errores atrapó Zod que habrían sido silenciosos sin validación?
 *    - ¿Qué es más importante: validar input o output del tool?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: El ToolRegistry es como un catálogo de controles —
 *   cada control (tool) tiene una descripción, responsable y forma de ejecutarse
 * - Healthcare: Las órdenes médicas tienen el mismo problema que los tool descriptions —
 *   la ambigüedad en la especificación lleva a errores en la ejecución
 */
