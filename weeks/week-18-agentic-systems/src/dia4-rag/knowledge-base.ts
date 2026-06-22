/**
 * knowledge-base.ts — Knowledge base con embeddings para RAG
 * DÍA 4: RAG — Darle memoria al agente
 *
 * CONCEPTOS CLAVE:
 * - Embeddings: representación vectorial del significado semántico
 * - Cosine similarity: mide qué tan "parecidos" son dos vectores
 * - Chunking semántico: dividir documentos en unidades de significado
 * - Retrieval quality: medir si recuperamos los chunks correctos
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const EMBEDDING_MODEL = 'voyage-3' as const; // Modelo de embeddings de Anthropic

// ============================================================================
// TAREA 4.1: TIPOS PARA LA KNOWLEDGE BASE
// ============================================================================

/**
 * DocumentMetadata — Metadatos de un documento clínico
 */
export interface DocumentMetadata {
  id: string;
  title: string;
  source: string;              // "AHA Guidelines 2024", "IMSS Protocolo", etc.
  publicationDate: string;
  evidenceLevel: 'A' | 'B' | 'C';  // A=alto, B=medio, C=bajo
  specialty: string[];         // ["cardiología", "medicina interna"]
  lastUpdated: string;
}

/**
 * DocumentChunk — Un chunk de documento con embedding
 */
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];        // vector de embedding (generado por Anthropic)
  tokenCount: number;
  chunkIndex: number;          // posición dentro del documento original
}

/**
 * SearchResult — Resultado de búsqueda semántica
 */
export interface SearchResult {
  chunk: DocumentChunk;
  similarity: number;          // cosine similarity: 0-1
  rank: number;                // posición en el ranking
}

/**
 * RetrievalTestCase — Caso de prueba para medir calidad del retrieval
 */
export interface RetrievalTestCase {
  query: string;
  expectedDocumentId: string;  // el documento que debería aparecer primero
  description: string;
}

/**
 * RetrievalQualityReport — Reporte de calidad del sistema de retrieval
 */
export interface RetrievalQualityReport {
  totalCases: number;
  correctAtK1: number;         // % de veces que el doc correcto fue el #1
  correctAtK3: number;         // % de veces que el doc correcto estuvo en top 3
  averageSimilarity: number;   // similarity promedio del resultado correcto
  failedCases: Array<{
    query: string;
    expectedId: string;
    actualTopResult: string;
    similarity: number;
  }>;
}

// ============================================================================
// TAREA 4.2: FUNCIONES DE EMBEDDING Y SIMILARIDAD
// ============================================================================

/**
 * generateEmbedding — Genera el embedding de un texto usando Anthropic
 *
 * El embedding convierte texto en un vector numérico que captura
 * el significado semántico. Textos similares tendrán vectores similares.
 *
 * Aplicación Healthcare:
 * "insuficiencia cardíaca tratamiento" y "manejo de IC con FE reducida"
 * tendrán embeddings muy similares aunque usen palabras distintas.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  // EJERCICIO: implementar usando el API de Anthropic
  // Nota: Anthropic usa el modelo 'voyage-3' para embeddings a través de su API
  // Ver: https://docs.anthropic.com/en/docs/build-with-claude/embeddings
  // Pista: client.beta.messages... o usa la API directamente
  throw new Error('TODO: implementar generateEmbedding');
};

/**
 * cosineSimilarity — Calcula la similitud coseno entre dos vectores
 *
 * Retorna un valor entre -1 y 1, donde:
 * - 1.0 = vectores idénticos (textos con el mismo significado)
 * - 0.0 = vectores ortogonales (textos sin relación)
 * - -1.0 = vectores opuestos (raramente ocurre en embeddings de texto)
 *
 * Pista matemática: similarity = (A · B) / (|A| × |B|)
 */
export const cosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
  // EJERCICIO: implementar
  // Pista: producto punto / (magnitud A × magnitud B)
  throw new Error('TODO: implementar cosineSimilarity');
};

// ============================================================================
// TAREA 4.3: MEDICAL KNOWLEDGE BASE
// ============================================================================

/**
 * MedicalKnowledgeBase — Base de conocimiento con búsqueda semántica
 *
 * El problema (sin RAG):
 * ```typescript
 * // El modelo solo sabe lo que aprendió en su entrenamiento
 * const response = await claude.ask('¿Cuál es el tratamiento de IC según guías 2024?');
 * // El modelo puede dar información desactualizada o inventar detalles
 * ```
 *
 * Con MedicalKnowledgeBase:
 * ```typescript
 * const chunks = await kb.search('tratamiento IC 2024', 3);
 * const response = await claude.ask(`Basado en esta evidencia: ${chunks}...`);
 * // El modelo razona sobre evidencia real y actualizada
 * ```
 *
 * Aplicación Healthcare:
 * Las guías clínicas se actualizan cada 2-3 años. Un sistema que usa
 * guías indexadas siempre tiene acceso a evidencia actualizada,
 * independiente de la fecha de entrenamiento del modelo.
 */
export class MedicalKnowledgeBase {
  private chunks: Map<string, DocumentChunk> = new Map();

  /**
   * chunkDocument — Divide un documento en chunks semánticos
   *
   * EJERCICIO: implementar chunking semántico
   * NO cortes por caracteres — respeta límites naturales:
   * - Por sección (###, ----, números de sección)
   * - Por párrafos (doble salto de línea)
   * - Por oraciones si un párrafo es muy largo
   *
   * Target: 200-400 tokens por chunk (aproximadamente 800-1600 caracteres)
   */
  chunkDocument(
    content: string,
    metadata: DocumentMetadata,
    targetChunkSize: number = 300, // tokens aproximados
  ): DocumentChunk[] {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar chunkDocument');
  }

  /**
   * addDocument — Indexa un documento en la knowledge base
   *
   * Este método:
   * 1. Divide el documento en chunks
   * 2. Genera embeddings para cada chunk
   * 3. Almacena los chunks con sus embeddings
   */
  async addDocument(
    content: string,
    metadata: DocumentMetadata,
  ): Promise<{ chunksAdded: number; documentId: string }> {
    // EJERCICIO: implementar
    // Pista: usa chunkDocument y generateEmbedding
    // Puede tardar varios segundos si el documento tiene muchos chunks
    throw new Error('TODO: implementar addDocument');
  }

  /**
   * search — Busca los chunks más relevantes para una query
   *
   * Algoritmo:
   * 1. Generar embedding de la query
   * 2. Calcular cosine similarity con todos los chunks indexados
   * 3. Retornar los topK chunks más similares
   */
  async search(query: string, topK: number = 3): Promise<SearchResult[]> {
    // EJERCICIO: implementar
    throw new Error('TODO: implementar search');
  }

  /**
   * measureRetrievalQuality — Mide qué tan bien funciona el sistema de retrieval
   *
   * Aplicación Healthcare:
   * Antes de usar la knowledge base en producción, debes saber si
   * recupera los chunks correctos. Un sistema con 60% de retrieval
   * accuracy no es confiable para decisiones clínicas.
   */
  async measureRetrievalQuality(
    testCases: RetrievalTestCase[],
  ): Promise<RetrievalQualityReport> {
    // EJERCICIO: implementar
    // Para cada caso: buscar con la query y verificar si el doc esperado está en top K
    throw new Error('TODO: implementar measureRetrievalQuality');
  }

  /**
   * getStats — Estadísticas de la knowledge base
   */
  getStats(): { totalChunks: number; totalDocuments: number; documentsById: string[] } {
    const documentIds = new Set(Array.from(this.chunks.values()).map(c => c.documentId));
    return {
      totalChunks: this.chunks.size,
      totalDocuments: documentIds.size,
      documentsById: Array.from(documentIds),
    };
  }
}

// ============================================================================
// TAREA 4.4: GUÍAS CLÍNICAS DE PRUEBA
// ============================================================================

/**
 * clinicalGuidelines — 5 guías clínicas ficticias para indexar
 *
 * EJERCICIO: estas son guías simplificadas para aprender.
 * Cada una tiene 200-500 palabras de contenido clínico relevante.
 */
export const clinicalGuidelines: Array<{ content: string; metadata: DocumentMetadata }> = [
  {
    content: `
# Guía de Insuficiencia Cardíaca con Fracción de Eyección Reducida (IC-FEr)
## Sociedad Mexicana de Cardiología — 2024

### Definición
La IC-FEr se define como insuficiencia cardíaca con fracción de eyección ventricular izquierda < 40%.
Es la forma más estudiada de IC y la que cuenta con mayor evidencia de tratamiento farmacológico.

### Pilares del Tratamiento Farmacológico (Terapia Cuádruple)

#### 1. Inhibidores RAAS (IECA/ARA-II o ARNI)
El sacubitril/valsartán (ARNI) es superior al enalapril en reducción de mortalidad y hospitalización.
Evidencia: PARADIGM-HF (2014). Reducción de riesgo relativo del 20% en mortalidad cardiovascular.
Dosis inicial: sacubitril/valsartán 24/26 mg c/12h, titular hasta 97/103 mg c/12h.
CONTRAINDICACIÓN: No usar con IECA en las 36 horas previas (riesgo de angioedema).

#### 2. Betabloqueadores
Carvedilol, metoprolol succinato o bisoprolol son los únicos con evidencia en IC-FEr.
Iniciar con dosis bajas y titular lentamente (cada 2 semanas).
CONTRAINDICACIÓN: No iniciar en IC descompensada aguda.

#### 3. Antagonistas de Mineralocorticoides (ARM)
Espironolactona o eplerenona reducen mortalidad y hospitalización.
PRECAUCIÓN: Monitorizar potasio (K+) y creatinina cada 1-2 semanas al inicio.
Contraindicado si K+ > 5.0 mEq/L o creatinina > 2.5 mg/dL.

#### 4. Inhibidores de SGLT2
Dapagliflozina o empagliflozina reducen hospitalización por IC independiente de diabetes.
Evidencia: DAPA-HF (2019), EMPEROR-Reduced (2020).
Iniciar con función renal: TFGe ≥ 20 mL/min/1.73m².

### Criterios de Hospitalización
- Disnea de reposo o mínimo esfuerzo
- Saturación O2 < 90% en reposo
- FC > 120 bpm o < 40 bpm
- TA sistólica < 90 mmHg
- Evidencia de hipoperfusión periférica
    `,
    metadata: {
      id: 'guideline-ic-001',
      title: 'Guía de IC con FE Reducida 2024',
      source: 'Sociedad Mexicana de Cardiología',
      publicationDate: '2024-01-15',
      evidenceLevel: 'A',
      specialty: ['cardiología', 'medicina interna'],
      lastUpdated: '2024-01-15',
    },
  },
  {
    content: `
# Protocolo de Manejo de Hipercalemia — Urgencias

## Clasificación por Severidad

### Hipercalemia Leve (K+ 5.1-5.9 mEq/L)
- Generalmente asintomática
- ECG: puede mostrar ondas T picudas
- Manejo: restricción dietética de K+, ajuste de medicamentos (espironolactona, IECA)
- Si está estable: manejo ambulatorio con seguimiento en 24-48h

### Hipercalemia Moderada (K+ 6.0-6.4 mEq/L)
- Requiere monitoreo cardíaco continuo
- ECG: ondas T picudas, PR prolongado
- Resinas de intercambio catiónico (patiromer o sulfonato de sodio)
- Evaluación de causa: insuficiencia renal, hipoaldosteronismo, medicamentos

### Hipercalemia Severa (K+ ≥ 6.5 mEq/L) — EMERGENCIA

#### Paso 1: Estabilización Cardíaca (INMEDIATO)
Gluconato de calcio 10% IV: 10-20 mL en 2-3 minutos
Efecto: estabiliza membrana cardíaca en 1-3 minutos
Duración: 30-60 minutos
REPETIR si ECG persiste anormal (intervalos PR > 0.2s, QRS > 0.12s)

#### Paso 2: Redistribución Intracelular de K+
Insulina + Glucosa: Insulina regular 10 UI IV + Dextrosa 50% 50 mL
Efecto: reduce K+ 0.5-1.0 mEq/L en 15-30 minutos
Albuterol nebulizado 10-20 mg: reduce K+ adicional 0.5-1.0 mEq/L
Bicarbonato de sodio: solo si hay acidosis metabólica severa (pH < 7.2)

#### Paso 3: Eliminación de K+
Furosemida IV si función renal preservada
Diálisis: si insuficiencia renal severa, hipercalemia refractaria, o cambios ECG persistentes
    `,
    metadata: {
      id: 'protocol-hyperkalemia-001',
      title: 'Protocolo de Hipercalemia en Urgencias',
      source: 'Hospital General de México',
      publicationDate: '2024-03-01',
      evidenceLevel: 'B',
      specialty: ['urgencias', 'nefrología', 'medicina interna'],
      lastUpdated: '2024-03-01',
    },
  },
  // EJERCICIO: agregar 3 guías más:
  // 1. Diabetes tipo 2: control glucémico en hospitalización
  // 2. Neumonía adquirida en la comunidad: criterios de hospitalización
  // 3. Insuficiencia renal aguda: criterios de diálisis de urgencia
];

// Casos de prueba para medir calidad del retrieval
export const retrievalTestCases: RetrievalTestCase[] = [
  {
    query: '¿Cuál es el tratamiento de primera línea para IC con FE reducida?',
    expectedDocumentId: 'guideline-ic-001',
    description: 'Pregunta directa sobre tratamiento de IC-FEr',
  },
  {
    query: 'gluconato de calcio hipercalemia urgencias',
    expectedDocumentId: 'protocol-hyperkalemia-001',
    description: 'Pregunta específica sobre manejo de hipercalemia',
  },
  {
    query: 'sacubitril valsartan PARADIGM-HF',
    expectedDocumentId: 'guideline-ic-001',
    description: 'Búsqueda por nombre de medicamento y estudio',
  },
  {
    query: 'potasio 6.5 emergencia cardíaca tratamiento inmediato',
    expectedDocumentId: 'protocol-hyperkalemia-001',
    description: 'Búsqueda por valor crítico de K+',
  },
  // EJERCICIO: agregar 6 casos más cuando tengas las 3 guías adicionales
];

// ============================================================================
// MAIN
// ============================================================================

const main = async () => {
  console.log('=== DÍA 4: Medical Knowledge Base con Embeddings ===\n');

  const kb = new MedicalKnowledgeBase();

  console.log('📚 Indexando guías clínicas...');
  for (const { content, metadata } of clinicalGuidelines) {
    try {
      const { chunksAdded } = await kb.addDocument(content, metadata);
      console.log(`  ✅ "${metadata.title}": ${chunksAdded} chunks indexados`);
    } catch {
      console.log(`  → Implementa addDocument y generateEmbedding primero`);
      break;
    }
  }

  console.log('\n🔍 Probando búsqueda semántica...');
  try {
    const results = await kb.search('tratamiento insuficiencia cardíaca betabloqueadores', 3);
    console.log(`  Encontrados: ${results.length} chunks relevantes`);
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. (${r.similarity.toFixed(3)}) ${r.chunk.metadata.title} — chunk ${r.chunk.chunkIndex}`);
    });
  } catch {
    console.log('  → Implementa search y cosineSimilarity primero');
  }

  console.log('\n📊 Estadísticas:', kb.getStats());
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 4:
 *
 * 1. EMBEDDINGS:
 *    - ¿Qué es un embedding en términos que le explicarías a un médico?
 *    - ¿Qué dimensión tiene el vector? ¿Por qué importa?
 *
 * 2. COSINE SIMILARITY:
 *    - ¿Qué valor de similarity considerarías "relevante"?
 *    - ¿Qué pares de queries/chunks tienen la similarity más alta?
 *
 * 3. RETRIEVAL QUALITY:
 *    - ¿Qué porcentaje de casos encontró el chunk correcto en top-1?
 *    - ¿Qué tipo de queries fallaron más?
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología: Los embeddings son como huellas moleculares —
 *   dos proteínas con función similar tienen estructuras similares,
 *   dos textos con significado similar tienen embeddings similares
 * - Auditoría: La retrieval quality es tu métrica de control —
 *   sin medirla no sabes si el sistema está funcionando correctamente
 */
