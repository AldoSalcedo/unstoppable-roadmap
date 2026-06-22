# Guía de Conceptos — Week 18: Agentic Systems

---

## DÍA 1: El Loop ReAct — Qué es Realmente un Agente

### La Definición Honesta

Un agente NO es "una IA que hace cosas sola". Un agente es un programa que:
1. Recibe un objetivo
2. Razona sobre qué acción tomar
3. Ejecuta la acción (llama un tool)
4. Observa el resultado
5. Vuelve al paso 2 hasta completar el objetivo

```
┌─────────────────────────────────────────────────┐
│              LOOP ReAct                         │
│                                                 │
│  OBJETIVO → [RAZONAR] → [ACTUAR] → [OBSERVAR]  │
│                  ↑__________________________|   │
│                                                 │
│  El loop termina cuando:                        │
│  • stop_reason === 'end_turn' (tarea completa)  │
│  • Se alcanza el límite de iteraciones          │
│  • El agente declara que no puede continuar     │
└─────────────────────────────────────────────────┘
```

### Tool Use en el Anthropic SDK

```typescript
// 1. Defines los tools disponibles
const tools: Anthropic.Tool[] = [{
  name: 'get_lab_results',
  description: 'Obtiene los resultados de laboratorio más recientes de un paciente por su ID',
  input_schema: {
    type: 'object',
    properties: {
      patient_id: { type: 'string', description: 'ID único del paciente en el sistema' },
      days_back: { type: 'number', description: 'Cuántos días hacia atrás buscar (default: 7)' },
    },
    required: ['patient_id'],
  },
}];

// 2. El modelo decide si usar el tool
const response = await client.messages.create({
  model: MODEL,
  max_tokens: 1024,
  tools,
  messages: [{ role: 'user', content: '¿Cuáles son los labs del paciente P-12345?' }],
});

// 3. Si el modelo quiere usar el tool:
if (response.stop_reason === 'tool_use') {
  const toolUse = response.content.find(b => b.type === 'tool_use');
  // toolUse.name === 'get_lab_results'
  // toolUse.input === { patient_id: 'P-12345', days_back: 7 }

  // 4. Ejecutas el tool y le devuelves el resultado
  const toolResult = await executeLabQuery(toolUse.input);

  // 5. Continúas el loop con el resultado
  // ... (ver código en dia1-react-loop/simple-agent.ts)
}
```

### Cuándo NO usar un Agente

Los agentes añaden complejidad y latencia. Úsalos solo cuando:
- La tarea requiere múltiples pasos dependientes de resultados previos
- El "plan" no se puede conocer de antemano (depende de lo que se encuentre)
- Hay herramientas externas que consultar (bases de datos, APIs, archivos)

Si el problema puede resolverse con un buen prompt de una sola llamada, hazlo así.

---

## DÍA 2: Diseño de Tools

### La Regla de Oro: El Modelo Lee Tu Descripción

```typescript
// ❌ Descripción vaga — el modelo no sabe cuándo ni cómo usar esto
{
  name: 'get_data',
  description: 'Gets data from the system',
  input_schema: { type: 'object', properties: { id: { type: 'string' } } }
}

// ✅ Descripción específica — el modelo sabe exactamente cuándo y cómo usarlo
{
  name: 'get_patient_lab_results',
  description: `Recupera los resultados de laboratorio de un paciente específico.
Úsalo cuando el usuario pregunta sobre valores de laboratorio, análisis clínicos,
o resultados de estudios de un paciente. Retorna los N resultados más recientes
dentro del período especificado. Si no se especifica período, retorna los últimos 7 días.`,
  input_schema: {
    type: 'object',
    properties: {
      patient_id: {
        type: 'string',
        description: 'ID único del paciente (formato: P-XXXXX, ej: P-12345)'
      },
      days_back: {
        type: 'number',
        description: 'Días hacia atrás para buscar (1-365, default: 7)'
      },
      lab_types: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filtrar por tipo de estudio (ej: ["hemograma", "quimica"]). Omitir para todos.'
      }
    },
    required: ['patient_id'],
  }
}
```

### Manejo de Errores en Tools

```typescript
// El tool SIEMPRE debe retornar algo — nunca lanzar uncaught exception
const executeGetLabResults = async (input: { patient_id: string; days_back?: number }) => {
  try {
    const results = await labDatabase.query(input);
    return { success: true, data: results };
  } catch (error) {
    // Retornar el error de forma estructurada para que el agente pueda manejarlo
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      suggestion: 'Verifica que el patient_id sea válido (formato P-XXXXX)',
    };
  }
};
```

---

## DÍA 3: Orquestación Multi-Agente

### El Problema del Teléfono Descompuesto

Cuando el contexto pasa de agente a agente como texto libre, se degrada:

```
Orchestrator: "Analiza los labs del paciente con diabetes"
    ↓ texto libre
Subagente 1: "El paciente tiene diabetes tipo 2 y sus labs están mal"
    ↓ texto libre (perdió detalles específicos)
Subagente 2: "El paciente tiene labs anormales"
    ↓ texto libre (perdió el tipo de diabetes)
Writer: genera un resumen vago e incorrecto
```

### La Solución: Handoffs Tipados

```typescript
// Tipo de handoff entre Planner y Retrieval Agent
interface PlannerToRetrievalHandoff {
  originalQuestion: string;
  subtasks: Array<{
    id: string;
    query: string;       // qué buscar exactamente
    priority: 'high' | 'medium' | 'low';
    context: string;     // por qué es relevante esta búsqueda
  }>;
  patientContext?: {
    conditions: string[];
    medications: string[];
  };
}

// El handoff es un tipo, no texto libre — el compilador verifica su validez
const handoff: PlannerToRetrievalHandoff = await plannerAgent.plan(question);
const evidence = await retrievalAgent.retrieve(handoff);
// evidence tiene el contexto completo del plan, no solo el texto crudo
```

### Human-in-the-Loop

Para acciones de alto impacto, el orquestador debe pausar:

```typescript
// Antes de que el Writer genere el reporte final
if (analysisResult.hasCriticalFindings) {
  const approval = await requestHumanReview(analysisResult);
  if (!approval.confirmed) {
    return { status: 'cancelled', reason: approval.reason };
  }
}
// Solo genera el reporte si el médico aprobó el análisis
```

---

## DÍA 4: RAG — Retrieval Augmented Generation

### Por Qué RAG en Healthcare

Las guías clínicas se actualizan constantemente. El modelo de Claude fue entrenado hasta una fecha específica. RAG permite que el agente consulte conocimiento actualizado en tiempo de ejecución:

```
Sin RAG:
  Pregunta → Claude (conocimiento hasta su fecha de corte) → Respuesta
  Riesgo: el modelo usa guías desactualizadas

Con RAG:
  Pregunta → [Buscar en Knowledge Base actualizada] → Claude + evidencia actual → Respuesta
  El modelo razona sobre guías de 2025, no de 2023
```

### El Pipeline RAG Completo

```
1. INDEXACIÓN (se hace una vez, fuera de línea):
   Guía clínica PDF → Chunks semánticos → Embeddings → Vector Store

2. RECUPERACIÓN (en tiempo de ejecución):
   Pregunta → Embedding de la pregunta → Cosine Similarity → Top K chunks

3. GENERACIÓN:
   System prompt + chunks recuperados + pregunta → Respuesta con citas
```

### Cosine Similarity: Intuición

```
Embedding("diabetes tipo 2 tratamiento"):    [0.2, 0.8, 0.1, ...]
Embedding("manejo de glucemia en adultos"):  [0.3, 0.7, 0.2, ...]
Cosine similarity: 0.92 — muy similares ✅

Embedding("diabetes tipo 2 tratamiento"):    [0.2, 0.8, 0.1, ...]
Embedding("fractura de cadera rehabilitación"): [0.9, 0.1, 0.8, ...]
Cosine similarity: 0.12 — muy diferentes ✅
```

---

## DÍA 5: Spec-Driven Development

### Anatomía de un Spec Ejecutable

```typescript
/**
 * SPEC: analyzeLabResults
 *
 * PROPÓSITO:
 * Analiza resultados de laboratorio y retorna una interpretación clínica
 * estructurada con valores críticos y nivel de urgencia.
 *
 * INPUTS:
 * - labResults: string — texto libre con los valores de laboratorio
 *   Ejemplo: "K+: 6.8 mEq/L, Na+: 135 mEq/L, Creatinina: 4.2 mg/dL"
 * - clinicalContext?: string — contexto del paciente (opcional)
 *   Ejemplo: "Paciente diabético tipo 2 con hipertensión"
 *
 * OUTPUTS:
 * - Retorna Promise<LabAnalysis> donde LabAnalysis es:
 *   { interpretacion: string, valores_criticos: string[],
 *     nivel_urgencia: 'bajo'|'medio'|'alto'|'critico', confianza: number }
 *
 * EDGE CASES:
 * - Si labResults está vacío: lanzar Error('No se proporcionaron resultados')
 * - Si los valores no son reconocibles: retornar confianza < 0.3
 * - Si hay valores críticos: nivel_urgencia debe ser 'alto' o 'critico'
 *
 * ARCHITECTURE:
 * - Usar el SystemPromptBuilder de dia2-system-prompts/prompt-builder.ts
 * - Usar la configuración labAnalysisConfig existente
 * - Validar output con ClinicalAnalysisSchema de dia6-failure-modes/defensive-prompt.ts
 * - NO duplicar lógica — reutilizar componentes de Week 17
 *
 * TESTS:
 * - K+ 6.8 → nivel_urgencia === 'critico'
 * - Hemograma normal → valores_criticos.length === 0
 * - String vacío → Error lanzado
 */
```

Este nivel de especificidad permite que Claude genere código correcto en la primera iteración.

---

## DÍA 6: Producción — Latencia, Costo, Observabilidad

### Modelo de Costo para tu Pipeline

```
Clinical Research Assistant — Estimación por query:

Planner Agent:    ~1,500 tokens input + 500 output = 0.0017 USD (Haiku)
Retrieval (x3):   ~2,000 tokens input + 200 output = 0.0006 USD (Haiku) x3 = 0.0018 USD
Analysis Agent:   ~8,000 tokens input + 1,500 output = 0.012 USD (Sonnet)
Writer Agent:     ~5,000 tokens input + 2,000 output = 0.008 USD (Sonnet)
Evals (LLM-judge): ~3,000 tokens input + 500 output = 0.004 USD (Haiku)

Total por query: ~0.026 USD
A 100 queries/día: ~$2.60/día = ~$78/mes

Ajuste de modelo:
Si usas Haiku para todo: ~$8/mes
Si usas Sonnet para todo: ~$280/mes
```

### AgentTrace: Pista de Auditoría

```typescript
// Cada paso del pipeline emite un trace:
{
  traceId: "trace-abc-123",
  agentName: "AnalysisAgent",
  step: 3,
  timestamp: "2025-05-06T14:23:01.234Z",
  inputTokens: 8245,
  outputTokens: 1502,
  latencyMs: 3421,
  model: "claude-3-5-sonnet-20241022",
  costUSD: 0.0118,
  toolCalls: [],
  success: true,
}

// El trace completo del pipeline:
// Planner (450ms) → Retrieval x3 (1200ms) → Analysis (3421ms) → Writer (2100ms)
// Total: 7171ms | Costo: $0.023
```

---

## DÍA 7: Capstone — Clinical Research Assistant

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│              CLINICAL RESEARCH ASSISTANT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT: "¿Cuál es el tratamiento de primera línea para          │
│          insuficiencia cardíaca con FE reducida en 2025?"       │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────┐                               │
│  │ PLANNER AGENT               │                               │
│  │ Descompone en 3-5 subtareas │                               │
│  │ con queries específicas     │                               │
│  └────────────┬────────────────┘                               │
│               │ PlannerToRetrievalHandoff                       │
│               ▼                                                 │
│  ┌─────────────────────────────┐                               │
│  │ RETRIEVAL AGENT             │                               │
│  │ Busca en MedicalKnowledgeBase│                              │
│  │ 3-5 chunks por subtarea     │                               │
│  └────────────┬────────────────┘                               │
│               │ RetrievalToAnalysisHandoff                      │
│               ▼                                                 │
│  ┌─────────────────────────────┐                               │
│  │ ANALYSIS AGENT              │──── Human Review Checkpoint   │
│  │ Sintetiza evidencia         │     (si hay hallazgos críticos)│
│  │ Identifica gaps y conflictos│                               │
│  └────────────┬────────────────┘                               │
│               │ AnalysisToWriterHandoff                         │
│               ▼                                                 │
│  ┌─────────────────────────────┐                               │
│  │ WRITER AGENT                │                               │
│  │ Produce resumen clínico     │                               │
│  │ con citas verificables      │                               │
│  └────────────┬────────────────┘                               │
│               │                                                 │
│               ▼                                                 │
│  OUTPUT: Resumen estructurado + evaluación del EvalRunner       │
└─────────────────────────────────────────────────────────────────┘
```

### Cómo Aplicar los Evals de Week 17

El Writer Agent produce texto. ¿Cómo lo evalúas?

```typescript
// Criteria para el Clinical Research Assistant
const researchCriteria: EvalCriteria[] = [
  { name: 'evidencia_relevante', description: '¿La evidencia citada responde la pregunta?', weight: 0.35 },
  { name: 'citas_verificables', description: '¿Cada afirmación tiene una fuente citada?', weight: 0.30 },
  { name: 'actualidad', description: '¿La evidencia es de los últimos 5 años?', weight: 0.20 },
  { name: 'formato_clinico', description: '¿El resumen sigue estructura clínica?', weight: 0.15 },
];

// El EvalRunner de Week 17 funciona igual para este output
const report = await evalRunner.run(testCases, researchAssistant.run, 'v1.0.0');
```
