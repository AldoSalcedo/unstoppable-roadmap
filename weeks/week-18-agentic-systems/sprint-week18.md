// ============================================================
// SEMANA 18: Agentic Systems Sprint
// De prompts individuales a sistemas que piensan
// ============================================================

# Sprint Week 18: Agentic Systems para Healthcare AI

## Resumen Ejecutivo

Construirás el **Clinical Research Assistant** — un sistema multi-agente que descompone preguntas clínicas complejas, busca evidencia en una knowledge base, sintetiza los hallazgos y produce resúmenes con citas verificables. Al terminar, tendrás un sistema portfolio-grade que un equipo de salud podría usar en producción.

---

// TAREA 1: DÍA 1 — El Loop ReAct: Qué es un Agente de Verdad

## DÍA 1: El Loop ReAct

### Objetivos de Aprendizaje
- Entender el ciclo Reason → Act → Observe → repeat
- Implementar el loop completo con Anthropic SDK Tool Use
- Establecer límites de iteración y condiciones de parada
- Distinguir cuándo usar un agente vs un prompt directo

### Healthcare Angle
Un médico de urgencias no diagnostica con una sola observación — examina al paciente, pide estudios, recibe resultados, ajusta su hipótesis, pide más estudios si es necesario. El loop ReAct es exactamente ese proceso: razonar, actuar, observar, repetir.

### Tareas del Día

#### EJERCICIO 1.1: Tu Primer Agente

Abre `src/dia1-react-loop/simple-agent.ts`. Implementa un agente clínico que puede:
- `search_patient` — busca información básica de un paciente por ID
- `get_lab_results` — obtiene los últimos labs del paciente
- `flag_critical_value` — marca un valor como crítico y notifica

El agente debe completar el task: "Revisa los últimos labs del paciente P-001 e identifica si hay valores que requieran atención inmediata."

Observa cuántos turnos necesita el agente para completar la tarea. ¿3? ¿5?

#### EJERCICIO 1.2: Implementar el Loop Completo

Tu loop debe:
1. Enviar el mensaje inicial
2. Si `stop_reason === 'tool_use'`: ejecutar el tool y continuar
3. Si `stop_reason === 'end_turn'`: el agente terminó
4. Si iteraciones > `maxIterations`: lanzar error controlado

Trazar cada iteración con `console.log` para ver el razonamiento del agente.

#### EJERCICIO 1.3: Comparación Agente vs Prompt

Resuelve el mismo problema (revisar labs, identificar críticos) con:
A) Un prompt directo de una sola llamada (dando los datos directamente)
B) El agente del ejercicio 1.1 (que busca los datos él mismo)

¿Cuánto más tarda el agente? ¿Cuándo vale la pena esa latencia?

### Métricas de Éxito del Día
- [ ] El agente completa el loop ReAct de mínimo 3 iteraciones
- [ ] El loop detecta `end_turn` y `tool_use` correctamente
- [ ] Tienes un límite de iteraciones que previene loops infinitos
- [ ] Documentaste: ¿cuándo preferirías el agente sobre el prompt directo?

---

// TAREA 2: DÍA 2 — Tool Design: La Interfaz que el Agente Usa

## DÍA 2: Diseño de Tools

### Objetivos de Aprendizaje
- Escribir descripciones de tools que guían correctamente al modelo
- Diseñar schemas de parámetros que no son ambiguos
- Manejar errores de tools de forma que el agente puede recuperarse

### Healthcare Angle
Un tool mal descrito es como una orden médica ambigua — el ejecutor (enfermera, residente, modelo) no sabe exactamente qué hacer y improvisa. En medicina, la ambigüedad en órdenes es una causa de error. En tools de IA, también.

### Tareas del Día

#### EJERCICIO 2.1: Medir el Impacto de las Descripciones

Crea 2 versiones del mismo tool `search_drug_interactions`:
- Versión A: descripción genérica (3 líneas)
- Versión B: descripción específica con ejemplos de uso y no-uso

Prueba ambas con el mismo agente en 5 casos distintos. ¿En cuántos casos el modelo usa el tool correctamente con cada versión?

#### EJERCICIO 2.2: Implementar ToolRegistry

Completa `src/dia2-tool-design/tool-registry.ts`. El registry debe:
- Almacenar tools con su implementación TypeScript tipada
- Validar inputs con Zod antes de ejecutar
- Capturar errores y retornar resultados estructurados (nunca lanzar)
- Registrar latencia de cada ejecución

#### EJERCICIO 2.3: 3 Tools para el Clinical Research Assistant

Diseña e implementa los tools que usará tu capstone:
1. `search_clinical_guidelines` — busca en la knowledge base por query semántico
2. `get_evidence_metadata` — obtiene metadatos de un documento (fecha, fuente, nivel de evidencia)
3. `flag_evidence_gap` — marca cuando no hay evidencia suficiente para una subtarea

Para cada tool: descripción completa, schema Zod, implementación, y prueba con el agente del día 1.

### Métricas de Éxito del Día
- [ ] El agente usa cada tool correctamente en > 90% de los casos con la Versión B
- [ ] `ToolRegistry` valida inputs con Zod y nunca lanza excepciones no controladas
- [ ] Los 3 tools del capstone están implementados y probados

---

// TAREA 3: DÍA 3 — Multi-Agent Orchestration

## DÍA 3: Orquestación Multi-Agente

### Objetivos de Aprendizaje
- Implementar el patrón Orchestrator/Subagente
- Diseñar handoffs tipados que no pierden información
- Agregar human-in-the-loop para acciones de alto impacto

### Healthcare Angle
Un equipo médico de alta complejidad es multi-agente: el intensivista coordina, el nefrólogo consulta sobre riñón, el cardiólogo sobre corazón, la enfermera ejecuta. Ninguno tiene toda la información — cada uno tiene su especialidad y hay handoffs claros entre ellos.

### Tareas del Día

#### EJERCICIO 3.1: Orchestrator Simple

Implementa un Orchestrator que recibe una pregunta clínica y la descompone en 2-3 subtareas, luego las delega a un solo subagente secuencialmente.

Objetivo: "¿Cuál es el manejo de la insuficiencia cardíaca descompensada?"
El Orchestrator debe producir: ["buscar guías de IC aguda", "buscar evidencia de diuréticos IV", "buscar criterios de hospitalización"]

#### EJERCICIO 3.2: Handoffs Tipados

Define los tipos de handoff para el capstone:
- `PlannerToRetrievalHandoff`: el plan descompuesto para el agente de búsqueda
- `RetrievalToAnalysisHandoff`: la evidencia encontrada para análisis
- `AnalysisToWriterHandoff`: el análisis sintetizado para el redactor

Cada tipo debe incluir suficiente contexto para que el receptor no necesite preguntar.

#### EJERCICIO 3.3: Human-in-the-Loop Checkpoint

Implementa un checkpoint que:
1. El Analysis Agent evalúa si los hallazgos son controversiales o tienen gaps importantes
2. Si es así, pausa y muestra un resumen al usuario
3. El usuario puede: aprobar (continuar), rechazar (parar), o enriquecer (agregar contexto)
4. Solo el flujo aprobado llega al Writer Agent

### Métricas de Éxito del Día
- [ ] El Orchestrator descompone correctamente 5 preguntas clínicas distintas
- [ ] Los tipos de handoff son suficientemente ricos — el receptor no necesita hacer preguntas adicionales
- [ ] El checkpoint captura la decisión del usuario antes de continuar

---

// TAREA 4: DÍA 4 — RAG: Darle Memoria al Agente

## DÍA 4: Retrieval Augmented Generation

### Objetivos de Aprendizaje
- Indexar documentos clínicos con embeddings de Anthropic
- Implementar búsqueda semántica con cosine similarity
- Medir la calidad del retrieval (¿recupera el chunk correcto?)

### Healthcare Angle
Las guías clínicas se actualizan cada 2-3 años en promedio. Claude fue entrenado hasta una fecha específica. Para un sistema clínico que necesita evidencia actualizada, RAG no es opcional — es mandatorio.

### Tareas del Día

#### EJERCICIO 4.1: Indexar Guías Clínicas

Crea `src/dia4-rag/clinical-guidelines.ts` con 5 "guías" clínicas ficticias (texto de 200-500 palabras cada una) sobre:
1. Insuficiencia cardíaca con fracción de eyección reducida
2. Manejo de hipercalemia severa
3. Diabetes tipo 2: control glucémico en hospitalización
4. Neumonía adquirida en la comunidad: criterios de hospitalización
5. Insuficiencia renal aguda: criterios de diálisis de urgencia

Usa la API de Anthropic para generar embeddings de cada chunk.

#### EJERCICIO 4.2: Implementar MedicalKnowledgeBase

Completa `src/dia4-rag/knowledge-base.ts`:

```typescript
class MedicalKnowledgeBase {
  // addDocument(doc: { id: string; content: string; metadata: DocMetadata }): Promise<void>
  // search(query: string, topK: number): Promise<SearchResult[]>
  // measureRetrievalQuality(testCases: RetrievalTestCase[]): RetrievalQualityReport
}
```

La búsqueda usa cosine similarity entre el embedding de la query y los embeddings indexados.

#### EJERCICIO 4.3: Medir Calidad del Retrieval

Diseña 10 casos de prueba: query → chunk esperado.
Ejemplo: "¿Cuál es la primera línea para IC con FE reducida?" → chunk de la guía de IC.

Ejecuta tus queries contra la knowledge base. ¿Recupera el chunk correcto en > 80% de los casos? Si no, ¿por qué? (Ajusta el chunking o la descripción de los docs.)

### Métricas de Éxito del Día
- [ ] Los embeddings se generan correctamente para los 5 documentos
- [ ] `MedicalKnowledgeBase.search()` retorna resultados en < 500ms
- [ ] La calidad del retrieval es > 70% en los 10 casos de prueba
- [ ] Documentaste: ¿dónde falló el retrieval y por qué?

---

// TAREA 5: DÍA 5 — Spec-Driven Development

## DÍA 5: Escribir Specs que una IA puede Ejecutar

### Objetivos de Aprendizaje
- Escribir specs con inputs, outputs, edge cases y architecture hints
- Medir cuántas iteraciones necesita el modelo para ejecutar el spec
- Identificar qué elementos del spec tienen mayor impacto en la calidad

### Healthcare Angle
Como auditor ya sabes que la calidad de los documentos de control determina la calidad del proceso. Un spec de software clínico es tu documento de control — si es ambiguo, el código será ambiguo.

### Tareas del Día

#### EJERCICIO 5.1: Spec para el Analysis Agent

Escribe un spec completo para el `AnalysisAgent.synthesize()` del capstone. Debe incluir:
- Descripción del propósito en 2-3 líneas
- Tipos TypeScript exactos de input y output
- 3 edge cases explícitos con la respuesta esperada
- Architecture hints: qué componentes de Week 17 debe reutilizar
- Ejemplo de input/output completo

#### EJERCICIO 5.2: Ejecutar el Spec

Usa el spec del ejercicio 5.1 para pedirle a Claude que implemente el `AnalysisAgent`. Mide:
- ¿Cuántas iteraciones necesitaste?
- ¿Qué elementos del spec generaron el código más correcto?
- ¿Qué tuviste que corregir manualmente?

#### EJERCICIO 5.3: Iterar el Spec

Basado en lo que faltó en la primera iteración, mejora el spec y vuelve a ejecutarlo. Documenta la diferencia. El objetivo: llegar a un spec que genere código correcto en la primera iteración.

### Métricas de Éxito del Día
- [ ] El spec del Analysis Agent lleva al código correcto en < 3 iteraciones
- [ ] Documentaste qué elementos del spec tuvieron mayor impacto
- [ ] Tienes una plantilla de spec reutilizable para el resto del capstone

---

// TAREA 6: DÍA 6 — Producción: Latencia, Costo, Observabilidad

## DÍA 6: Hacer que el Sistema Funcione en Producción

### Objetivos de Aprendizaje
- Modelar el costo por query del Clinical Research Assistant
- Implementar AgentTrace para logging estructurado de cada paso
- Diseñar fallbacks para cuando el modelo primario falla

### Healthcare Angle
Un sistema que funciona en notebook pero falla en producción no sirve a ningún médico. En healthcare, la observabilidad es además un requisito regulatorio — necesitas poder auditar qué decidió el sistema y por qué.

### Tareas del Día

#### EJERCICIO 6.1: Profiling del Pipeline

Ejecuta el pipeline completo del capstone (aún sin todos los agentes — usa mocks) y mide:
- Latencia de cada paso (Planner, Retrieval, Analysis, Writer)
- Tokens consumidos en cada paso
- Costo en USD de cada paso

¿Cuál es el paso más caro? ¿El más lento? ¿Son el mismo?

#### EJERCICIO 6.2: Implementar AgentTrace

Completa `src/dia6-production/agent-trace.ts`:

```typescript
class AgentTrace {
  // startStep(agentName, stepDescription): StepTracer
  // StepTracer.complete(tokens, success): void
  // getFullTrace(): TraceReport
  // exportJSON(): string
}
```

Integra `AgentTrace` en el loop ReAct del día 1 — cada tool call debe emitir un trace.

#### EJERCICIO 6.3: Cost Budget y Fallbacks

Implementa:
1. Un `CostBudget` que detiene el pipeline si excede $0.10 USD por query
2. Un fallback que usa `claude-3-5-haiku-20241022` si `claude-3-5-sonnet-20241022` falla
3. Retry con exponential backoff para errores de rate limit (429)

### Métricas de Éxito del Día
- [ ] Tienes el costo estimado por query documentado
- [ ] `AgentTrace` registra latencia, tokens y costo de cada paso
- [ ] El fallback de modelo funciona correctamente en prueba

---

// TAREA 7: DÍA 7 — Capstone: Clinical Research Assistant

## DÍA 7: El Sistema Completo

### Objetivos de Aprendizaje
- Integrar todos los componentes de la semana en un pipeline funcional
- Aplicar los evals de Week 17 al output del capstone
- Iterar: analizar → mejorar → re-evaluar

### Healthcare Angle
Este es el entregable final. Un sistema que un equipo médico podría usar para acelerar revisiones de evidencia clínica — con trazabilidad completa, evals automáticos y human-in-the-loop donde se necesita.

### Tareas del Día

#### EJERCICIO 7.1: Integración Completa

Conecta los 4 agentes en `src/dia7-capstone/clinical-research-assistant.ts`:

```
PlannerAgent → [PlannerToRetrievalHandoff] → RetrievalAgent
→ [RetrievalToAnalysisHandoff] → AnalysisAgent
→ [Human Review Checkpoint] → WriterAgent
→ Output con citas
```

Prueba con 3 preguntas clínicas reales (las que más te interesen).

#### EJERCICIO 7.2: Aplicar EvalRunner de Week 17

Diseña 8 casos de prueba para el output del Writer Agent:
- 3 preguntas con evidencia clara en la knowledge base
- 3 preguntas con evidencia parcial (gaps esperados)
- 2 preguntas fuera del alcance de la knowledge base (el sistema debe decirlo)

Corre los evals y obtén el score. ¿Pasa el threshold de 8.0/10?

#### EJERCICIO 7.3: Iteración Final

Si no pasa los evals (probable en la primera versión), analiza los casos fallidos:
- ¿El Planner descompone mal la pregunta?
- ¿El Retrieval no encuentra los chunks correctos?
- ¿El Writer no cita correctamente?

Itera hasta pasar el threshold — o documenta honestamente por qué ciertas preguntas están fuera del alcance del sistema actual.

### Métricas de Éxito del Día
- [ ] El pipeline completo ejecuta de principio a fin sin errores no controlados
- [ ] El AgentTrace muestra el costo y latencia de cada paso
- [ ] Los evals del Writer Agent reportan score > 7.5/10
- [ ] Documentaste los límites del sistema: qué tipo de preguntas no puede responder bien

---

## Resumen de Entregables de la Semana

| Archivo | Descripción |
|---------|-------------|
| `dia1-react-loop/simple-agent.ts` | Loop ReAct completo con 3 tools |
| `dia2-tool-design/tool-registry.ts` | ToolRegistry con Zod + 3 tools del capstone |
| `dia3-orchestration/multi-agent.ts` | Orchestrator + handoffs tipados |
| `dia4-rag/knowledge-base.ts` | MedicalKnowledgeBase con embeddings |
| `dia5-spec-driven/spec-executor.ts` | Spec + implementación generada |
| `dia6-production/agent-trace.ts` | AgentTrace + CostBudget + fallbacks |
| `dia7-capstone/clinical-research-assistant.ts` | Sistema completo multi-agente |

---

**El sistema que construiste esta semana no es un toy project. Con datos reales y una knowledge base actualizada, es exactamente lo que diferencia a un AI Engineer de alguien que "usa chatbots".**

**¡Lo lograste. Ahora comparte lo que aprendiste.**
