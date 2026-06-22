/**
 * clinical-research-assistant.ts — Sistema multi-agente completo
 * DÍA 7: Capstone — De componentes sueltos a sistema de producción
 *
 * CONCEPTOS CLAVE:
 * - 4 agentes especializados: Planner → Retrieval → Analysis → Writer
 * - Handoffs tipados entre cada agente (sin pérdida de contexto)
 * - Human-in-the-loop antes del Writer si hay hallazgos controversiales
 * - Evals del Week 17 aplicados al output final
 * - AgentTrace para observabilidad completa del pipeline
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

// Modelos por agente — balance entre capacidad y costo
const PLANNER_MODEL = 'claude-3-5-haiku-20241022' as const;    // planificación: haiku es suficiente
const RETRIEVAL_MODEL = 'claude-3-5-haiku-20241022' as const;  // búsqueda: haiku
const ANALYSIS_MODEL = 'claude-3-5-sonnet-20241022' as const;  // síntesis: necesita más capacidad
const WRITER_MODEL = 'claude-3-5-sonnet-20241022' as const;    // redacción clínica: sonnet

// ============================================================================
// TAREA 7.1: TIPOS DE HANDOFF ENTRE AGENTES
// ============================================================================

/**
 * ClinicalQuestion — La pregunta inicial del médico
 */
export interface ClinicalQuestion {
  question: string;
  context?: string;           // contexto del paciente si aplica
  urgency: 'routine' | 'urgent';
  requestedBy: string;        // médico solicitante
}

/**
 * PlannerToRetrievalHandoff — Output del Planner, input del Retrieval Agent
 *
 * El Planner descompone la pregunta en subtareas concretas de búsqueda.
 * El Retrieval Agent NO tiene que entender la pregunta original — solo las subtareas.
 */
export interface PlannerToRetrievalHandoff {
  originalQuestion: string;
  subtasks: Array<{
    id: string;
    searchQuery: string;       // qué buscar exactamente
    rationale: string;         // por qué esta subtarea es relevante
    priority: 'high' | 'medium' | 'low';
    expectedEvidenceType: string;  // "guía clínica", "meta-análisis", "consenso de expertos"
  }>;
  patientContext?: string;
  plannerReasoning: string;    // el razonamiento del Planner (para trazabilidad)
}

/**
 * RetrievalToAnalysisHandoff — Output del Retrieval, input del Analysis Agent
 */
export interface RetrievalToAnalysisHandoff {
  originalQuestion: string;
  retrievedEvidence: Array<{
    subtaskId: string;
    subtaskQuery: string;
    findings: Array<{
      documentId: string;
      documentTitle: string;
      relevantText: string;
      evidenceLevel: string;
      publicationDate: string;
      similarity: number;
    }>;
    hasEvidence: boolean;
    gapReason?: string;        // si hasEvidence es false
  }>;
  totalDocumentsSearched: number;
}

/**
 * AnalysisToWriterHandoff — Output del Analysis, input del Writer Agent
 */
export interface AnalysisToWriterHandoff {
  originalQuestion: string;
  synthesis: string;           // la síntesis del Analysis Agent
  keyFindings: string[];       // hallazgos principales
  evidenceGaps: string[];      // dónde faltó evidencia
  controversialAreas: string[]; // áreas donde la evidencia no es clara
  citations: Array<{
    documentId: string;
    title: string;
    date: string;
    relevantFor: string;
  }>;
  requiresHumanReview: boolean;  // si hay hallazgos controvertidos o críticos
  analysisConfidence: number;    // 0-1
}

/**
 * ResearchReport — Output final del sistema
 */
export interface ResearchReport {
  question: string;
  summary: string;             // resumen ejecutivo para el médico
  mainRecommendations: string[];
  evidenceBase: string;        // qué fuentes se usaron
  limitations: string[];       // qué no pudimos responder
  citations: string[];
  confidence: number;
  generatedAt: string;
  pipelineTrace: PipelineTrace;
}

/**
 * PipelineTrace — Trazabilidad completa del pipeline
 */
export interface PipelineTrace {
  totalLatencyMs: number;
  totalCostUSD: number;
  steps: Array<{
    agent: string;
    latencyMs: number;
    inputTokens: number;
    outputTokens: number;
    costUSD: number;
    success: boolean;
  }>;
}

// ============================================================================
// TAREA 7.2: LOS 4 AGENTES
// ============================================================================

/**
 * PlannerAgent — Descompone la pregunta en subtareas de búsqueda
 *
 * Recibe: ClinicalQuestion
 * Retorna: PlannerToRetrievalHandoff
 *
 * Aplicación Healthcare:
 * "¿Cuál es el tratamiento de IC con FE reducida?" puede descomponerse en:
 * 1. Buscar guías sobre inhibidores RAAS en IC
 * 2. Buscar evidencia sobre betabloqueadores en IC-FEr
 * 3. Buscar criterios de hospitalización en IC descompensada
 */
export class PlannerAgent {
  private readonly systemPrompt = `Eres un planificador de investigación clínica.
Tu función es descomponer preguntas médicas complejas en subtareas de búsqueda
específicas que un agente de recuperación de información pueda ejecutar.

REGLAS:
- Genera 2-5 subtareas por pregunta (no más)
- Cada subtarea debe ser una búsqueda concreta y ejecutable
- Las subtareas no deben solaparse — cada una busca algo diferente
- Prioriza las subtareas más críticas para responder la pregunta principal
- Responde SIEMPRE con JSON válido

FORMATO DE RESPUESTA:
{
  "subtasks": [
    {
      "id": "st-001",
      "searchQuery": "string concreta para buscar",
      "rationale": "por qué esta búsqueda es relevante",
      "priority": "high | medium | low",
      "expectedEvidenceType": "tipo de evidencia esperada"
    }
  ],
  "plannerReasoning": "tu razonamiento para esta descomposición"
}`;

  /**
   * plan — Descompone la pregunta en subtareas
   */
  async plan(
    question: ClinicalQuestion,
  ): Promise<{ handoff: PlannerToRetrievalHandoff; latencyMs: number; tokens: { input: number; output: number } }> {
    // EJERCICIO: implementar
    // 1. Construir el mensaje con la pregunta clínica
    // 2. Llamar al PLANNER_MODEL
    // 3. Parsear el JSON del response
    // 4. Retornar el handoff con las subtareas
    throw new Error('TODO: implementar PlannerAgent.plan()');
  }
}

/**
 * RetrievalAgent — Busca evidencia para cada subtarea del Planner
 *
 * Recibe: PlannerToRetrievalHandoff
 * Retorna: RetrievalToAnalysisHandoff
 */
export class RetrievalAgent {
  /**
   * retrieve — Busca evidencia para todas las subtareas
   *
   * EJERCICIO: implementar usando MedicalKnowledgeBase del día 4
   * y los tools del día 2 (search_clinical_guidelines, flag_evidence_gap)
   */
  async retrieve(
    handoff: PlannerToRetrievalHandoff,
  ): Promise<{ handoff: RetrievalToAnalysisHandoff; latencyMs: number; tokens: { input: number; output: number } }> {
    // EJERCICIO: implementar
    // Para cada subtarea en handoff.subtasks:
    // 1. Buscar en MedicalKnowledgeBase con la searchQuery
    // 2. Si no hay resultados: usar flag_evidence_gap tool
    // 3. Agregar los findings al handoff de Analysis
    throw new Error('TODO: implementar RetrievalAgent.retrieve()');
  }
}

/**
 * AnalysisAgent — Sintetiza la evidencia encontrada
 *
 * Recibe: RetrievalToAnalysisHandoff
 * Retorna: AnalysisToWriterHandoff
 */
export class AnalysisAgent {
  private readonly systemPrompt = `Eres un experto en medicina basada en evidencia con 20 años de experiencia.
Tu función es sintetizar evidencia clínica de múltiples fuentes y extraer
los hallazgos más importantes para responder una pregunta clínica específica.

REGLAS:
1. Solo afirma lo que está respaldado por la evidencia proporcionada
2. Señala explícitamente los gaps (donde faltó evidencia)
3. Identifica áreas de controversia o evidencia conflictiva
4. Evalúa el nivel de confianza de 0-1 basado en la calidad de la evidencia
5. Si los hallazgos son controvertidos o críticos: marca requiresHumanReview = true
6. Responde SIEMPRE con JSON válido`;

  /**
   * synthesize — Sintetiza la evidencia y produce el handoff para el Writer
   */
  async synthesize(
    handoff: RetrievalToAnalysisHandoff,
  ): Promise<{ handoff: AnalysisToWriterHandoff; latencyMs: number; tokens: { input: number; output: number } }> {
    // EJERCICIO: implementar usando ANALYSIS_MODEL (Sonnet)
    throw new Error('TODO: implementar AnalysisAgent.synthesize()');
  }
}

/**
 * WriterAgent — Produce el reporte clínico final con citas
 *
 * Recibe: AnalysisToWriterHandoff
 * Retorna: ResearchReport
 */
export class WriterAgent {
  private readonly systemPrompt = `Eres un redactor médico experto en comunicación clínica.
Tu función es convertir un análisis de evidencia en un reporte ejecutivo
claro y accionable para médicos.

REGLAS:
1. El resumen ejecutivo debe ser legible en < 2 minutos
2. Las recomendaciones deben ser concretas y accionables
3. Cita SIEMPRE las fuentes con año de publicación
4. Menciona explícitamente las limitaciones del análisis
5. Usa lenguaje clínico apropiado pero evita jerga innecesaria
6. Responde SIEMPRE con JSON válido`;

  /**
   * write — Produce el reporte final
   */
  async write(
    handoff: AnalysisToWriterHandoff,
  ): Promise<{ report: ResearchReport; latencyMs: number; tokens: { input: number; output: number } }> {
    // EJERCICIO: implementar usando WRITER_MODEL (Sonnet)
    throw new Error('TODO: implementar WriterAgent.write()');
  }
}

// ============================================================================
// TAREA 7.3: EL ORQUESTADOR — CONECTA LOS 4 AGENTES
// ============================================================================

/**
 * ClinicalResearchAssistant — Orquestador del pipeline multi-agente
 *
 * Flujo:
 * PlannerAgent → RetrievalAgent → [Human Review?] → AnalysisAgent → WriterAgent
 *
 * El orquestador NO ejecuta la lógica de cada agente.
 * Su responsabilidad es:
 * 1. Coordinar el orden de ejecución
 * 2. Pasar los handoffs entre agentes
 * 3. Gestionar el human-in-the-loop checkpoint
 * 4. Mantener el AgentTrace del pipeline completo
 * 5. Manejar errores de cualquier agente
 */
export class ClinicalResearchAssistant {
  private readonly planner = new PlannerAgent();
  private readonly retrieval = new RetrievalAgent();
  private readonly analysis = new AnalysisAgent();
  private readonly writer = new WriterAgent();

  /**
   * humanReviewCheckpoint — Pausa para revisión humana si es necesario
   *
   * En producción: enviar notificación al médico y esperar respuesta
   * En este ejercicio: imprimir el análisis y pedir input por consola
   */
  private async humanReviewCheckpoint(
    analysisHandoff: AnalysisToWriterHandoff,
  ): Promise<{ approved: boolean; additionalContext?: string }> {
    // EJERCICIO: implementar
    // Imprimir el análisis de forma legible
    // Pedir al usuario: ¿Aprobar? ¿Agregar contexto? ¿Cancelar?
    // Retornar la decisión
    console.log('\n⚠️  REVISIÓN HUMANA REQUERIDA');
    console.log('Áreas controversiales:', analysisHandoff.controversialAreas);
    console.log('\n→ Implementa el checkpoint interactivo');
    return { approved: true };
  }

  /**
   * research — Ejecuta el pipeline completo
   */
  async research(
    question: ClinicalQuestion,
    options?: { skipHumanReview?: boolean },
  ): Promise<ResearchReport> {
    // EJERCICIO: implementar el pipeline completo
    // 1. Planner: planificar las subtareas
    // 2. Retrieval: buscar evidencia para cada subtarea
    // 3. Analysis: sintetizar la evidencia
    // 4. Human review checkpoint (si analysisHandoff.requiresHumanReview)
    // 5. Writer: producir el reporte final
    // 6. Agregar el pipelineTrace con métricas de cada paso
    throw new Error('TODO: implementar ClinicalResearchAssistant.research()');
  }
}

// ============================================================================
// MAIN — Probar el Clinical Research Assistant
// ============================================================================

const main = async () => {
  console.log('=== DÍA 7: Clinical Research Assistant — Capstone ===\n');

  const assistant = new ClinicalResearchAssistant();

  const questions: ClinicalQuestion[] = [
    {
      question: '¿Cuál es el tratamiento de primera línea para insuficiencia cardíaca con fracción de eyección reducida en 2024?',
      urgency: 'routine',
      requestedBy: 'Dr. García - Cardiología',
    },
    {
      question: '¿Cuáles son los criterios para iniciar diálisis de urgencia en insuficiencia renal aguda?',
      urgency: 'urgent',
      requestedBy: 'Dr. López - Nefrología',
    },
    {
      question: '¿Cuál es el manejo de la hipercalemia severa (K+ > 6.5 mEq/L) en urgencias?',
      urgency: 'urgent',
      requestedBy: 'Dr. Ruiz - Urgencias',
    },
  ];

  // Probar con la primera pregunta
  const question = questions[0];
  if (!question) return;

  console.log('📋 Pregunta:', question.question);
  console.log('👨‍⚕️  Solicitado por:', question.requestedBy);
  console.log('─'.repeat(60));

  try {
    const report = await assistant.research(question, { skipHumanReview: false });

    console.log('\n📊 REPORTE GENERADO:');
    console.log('─'.repeat(60));
    console.log('RESUMEN:', report.summary);
    console.log('\nRECOMENDACIONES:');
    report.mainRecommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
    console.log('\nLIMITACIONES:');
    report.limitations.forEach(lim => console.log(`  • ${lim}`));
    console.log('\nCITAS:');
    report.citations.forEach(cite => console.log(`  - ${cite}`));
    console.log('\n📈 MÉTRICAS DEL PIPELINE:');
    console.log(`  Latencia total: ${report.pipelineTrace.totalLatencyMs}ms`);
    console.log(`  Costo total: $${report.pipelineTrace.totalCostUSD.toFixed(4)} USD`);
    report.pipelineTrace.steps.forEach(step => {
      console.log(`  ${step.agent}: ${step.latencyMs}ms, $${step.costUSD.toFixed(4)} USD`);
    });

  } catch {
    console.log('→ Implementa los 4 agentes y el orquestador');
    console.log('  Orden recomendado: PlannerAgent → RetrievalAgent → AnalysisAgent → WriterAgent → Orchestrator');
  }
};

main().catch(console.error);

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día — y de la semana)
// ============================================================================

/**
 * REFLEXIÓN FINAL DEL CAPSTONE (Week 18):
 *
 * 1. ARQUITECTURA MULTI-AGENTE:
 *    - ¿Cuál fue el paso más difícil del pipeline?
 *    - ¿Dónde perdiste contexto entre agentes?
 *    - ¿Cómo los handoffs tipados ayudaron vs texto libre?
 *
 * 2. OBSERVABILIDAD:
 *    - ¿Cuánto costó una query completa?
 *    - ¿Qué agente fue el más lento? ¿El más caro?
 *    - ¿Qué mejorarías en el pipeline para producción?
 *
 * 3. EVALS:
 *    - ¿Qué score obtuvo el Writer Agent en los 8 casos de prueba?
 *    - ¿Qué tipos de preguntas responde mejor el sistema?
 *    - ¿Cuáles están fuera de su alcance actual?
 *
 * REFLEXIÓN FINAL DE AMBAS SEMANAS (Week 17 + 18):
 * "Antes del Week 17-18, yo creía que AI Engineering era..."
 * "Después de estas dos semanas, entiendo que es..."
 * "La habilidad más valiosa que adquirí fue..."
 * "Lo que haré diferente en mi próximo proyecto de IA es..."
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología: Diseñaste un organismo multicelular de IA — cada agente
 *   es una célula especializada con función específica y comunicación
 *   tipada con sus vecinos. La coordinación emergente produce un
 *   comportamiento que ninguna célula podría lograr sola.
 * - Auditoría: El AgentTrace es tu pista de auditoría completa —
 *   cada decisión del sistema está documentada con su razonamiento,
 *   costo y resultado. Exactamente lo que necesitarías para auditar
 *   un proceso de IA en un entorno regulado como healthcare.
 * - Healthcare: El sistema que construiste puede acelerar revisiones
 *   de evidencia clínica de horas a minutos — con trazabilidad completa
 *   y human-in-the-loop donde la decisión clínica lo requiere.
 */
