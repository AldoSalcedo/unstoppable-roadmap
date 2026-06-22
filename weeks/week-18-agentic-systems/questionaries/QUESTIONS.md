# Preguntas de Comprensión — Week 18: Agentic Systems

---

## Día 1: ReAct Loop

1. ¿Qué significan las letras ReAct? Describe cada fase con un ejemplo clínico concreto.
2. ¿Cómo sabe tu agente que debe dejar de iterar? ¿Qué campo de la respuesta del API indica que terminó?
3. ¿Qué pasa si no implementas el loop de observación y solo haces una llamada al modelo con tools?
4. ¿Cuándo usarías un agente en lugar de un prompt simple? Da un ejemplo donde el agente claramente gana.
5. ¿Cuándo NO usarías un agente? ¿Qué problema resuelven menos bien que un prompt directo?

---

## Día 2: Tool Design

1. ¿Por qué es tan importante la descripción del tool? ¿Qué pasa si es vaga?
2. Escribe la descripción de un tool `get_patient_vitals(patientId)`. Ahora escribe una versión mejorada. ¿Qué cambió?
3. ¿Cuál es la diferencia entre parámetros requeridos y opcionales en el schema de un tool? ¿Cuándo usar cada uno?
4. Diseña 3 tools para un sistema de análisis de laboratorio: ¿qué hace cada uno? ¿Qué NO debería hacer?
5. ¿Cómo manejas el caso en que un tool falla? ¿Debe el agente reintentar, reportar o continuar sin ese dato?

---

## Día 3: Multi-Agent Orchestration

1. ¿Cuál es la diferencia entre un Orchestrator y un Subagente? ¿Por qué esa separación importa?
2. ¿Qué información debe incluir un Handoff entre agentes? ¿Por qué texto libre es insuficiente?
3. ¿Qué es human-in-the-loop y cuándo es necesario en un pipeline clínico?
4. ¿Cómo evitas que el contexto se "degrade" (telephone game) entre agentes?
5. Diseña en papel (o en texto) la arquitectura multi-agente para automatizar el alta de un paciente hospitalizado.

---

## Día 4: RAG

1. ¿Qué es un embedding en términos simples? ¿Por qué "perro" y "gato" tienen embeddings similares?
2. ¿Por qué el chunking es importante? ¿Qué pasa si los chunks son demasiado pequeños? ¿Demasiado grandes?
3. ¿Cuándo usar RAG en lugar de simplemente poner toda la información en el contexto?
4. ¿Cómo mides si tu sistema de RAG está recuperando los chunks correctos?
5. Diseña la estrategia de chunking para una guía clínica de 80 páginas sobre diabetes tipo 2.

---

## Día 5: Spec-Driven Development

1. ¿Qué diferencia hay entre un spec bien escrito y una descripción informal? ¿Qué elementos no pueden faltar?
2. ¿Por qué incluir los tipos TypeScript exactos en el spec ayuda al modelo?
3. Escribe un spec de 10 líneas para la función `analyzeLabResults(input: LabInput): LabAnalysis`. ¿Qué incluyes?
4. ¿Cuántas iteraciones necesitó tu spec antes de que el código generado fuera correcto? ¿Qué faltaba?
5. ¿Cuándo el spec-driven development NO es la mejor estrategia? ¿Qué tipo de tareas le cuestan más trabajo?

---

## Día 6: Producción

1. ¿Cuál es el componente de mayor latencia en tu pipeline del día 7? ¿Cómo lo reducirías?
2. Modela el costo mensual de tu Clinical Research Assistant si procesa 100 consultas al día.
3. ¿Qué información debe incluir un AgentTrace para ser útil en debugging y auditoría?
4. Diseña la estrategia de fallback si el modelo principal está caído o excede el rate limit.
5. ¿Por qué el streaming es importante para la experiencia del usuario en sistemas agénticos?

---

## Día 7: Capstone

1. Describe el flujo completo del Clinical Research Assistant para una pregunta clínica. ¿Dónde puede fallar?
2. ¿Cómo aplicaste los evals de Week 17 al output del capstone? ¿Qué criterios usaste?
3. ¿Cuál fue el paso más difícil del pipeline y por qué?
4. Si el Retrieval Agent no encuentra evidencia relevante, ¿cómo debería responder el Writer Agent?
5. Reflexión final: ¿Qué aprendiste esta semana que cambió cómo piensas sobre los "agentes de IA" que ves en noticias?
