# Agent Context: Week 18 — Agentic Systems

## Resumen

Esta semana convierte a un AI Engineer en un AI Architect — alguien que diseña sistemas donde múltiples agentes colaboran para resolver problemas que ninguno podría solo. El foco es el Anthropic SDK Tool Use API, orquestación multi-agente, RAG, y observabilidad en producción.

## Tecnologías

- **SDK:** `@anthropic-ai/sdk` — Tool Use API
- **Validación:** `zod` para schemas de tools y outputs
- **Runtime:** Node.js 18+ con TypeScript strict
- **Modelo principal:** `claude-3-5-sonnet-20241022` (mejor para razonamiento agéntico)
- **Modelo para tareas simples:** `claude-3-5-haiku-20241022` (costo reducido)

## Conceptos Clave por Día

### Día 1: ReAct Loop
- ReAct = Reason → Act → Observe → repeat
- El loop termina cuando `stop_reason === 'end_turn'` (no hay más tool calls)
- Un agente sin loop de observación es solo un prompt con herramientas
- Tools en Anthropic SDK: `tools[]` en el request, `tool_use` en el response

### Día 2: Tool Design
- La descripción del tool es tan importante como su implementación
- El modelo lee tu descripción para decidir SI y CÓMO usar el tool
- Descripción vaga = uso incorrecto o ningún uso
- Parámetros opcionales vs requeridos: piensa en cómo el modelo los infiere

### Día 3: Multi-Agent Orchestration
- Orchestrator: sabe QUÉ hacer pero delega el CÓMO
- Subagente: experto en un dominio específico, no conoce el plan completo
- Handoff tipado: el contexto entre agentes debe ser estructurado, no texto libre
- Human-in-the-loop: el orquestador pausa y pide confirmación antes de acciones irreversibles

### Día 4: RAG
- Embeddings: representación vectorial del significado (no de las palabras)
- Cosine similarity: qué tan "cercanos" son dos vectores de embedding
- Chunking: los documentos se dividen en partes manejables con contexto suficiente
- Retrieve-then-generate: primero busca la evidencia, luego genera con ella

### Día 5: Spec-Driven Development
- Un spec bien escrito elimina la ambigüedad que lleva a código incorrecto
- Inputs/Outputs tipados: el modelo entiende TypeScript si le das el tipo exacto
- Edge cases explícitos: el modelo no puede asumir lo que no le dices
- Architecture hints: dile DÓNDE va el código, no solo QUÉ hace

### Día 6: Production
- Latencia: el 80% del tiempo en pipelines agénticos es I/O (API calls)
- Costo: modela el costo POR QUERY antes de entrar a producción
- Observabilidad: cada step debe emitir un trace con timing y tokens
- Fallbacks: si el modelo primario falla, ¿tienes un plan B?

### Día 7: Capstone
- Planner → Retrieval → Analysis → Writer: el pipeline completo
- Los evals de Week 17 se aplican al output final
- Human-in-the-loop en el paso de Analysis antes de generar el reporte final

## Estructura de Proyecto

```
src/
├── dia1-react-loop/simple-agent.ts          — ReAct loop básico con 3+ tools
├── dia2-tool-design/tool-registry.ts         — ToolRegistry con Zod schemas
├── dia3-orchestration/multi-agent.ts         — Orchestrator + 2 subagentes
├── dia4-rag/knowledge-base.ts                — MedicalKnowledgeBase con embeddings
├── dia5-spec-driven/spec-executor.ts         — Spec → código con validación
├── dia6-production/agent-trace.ts            — AgentTrace + cost modeling
└── dia7-capstone/clinical-research-assistant.ts — Sistema completo
```

## Errores Comunes a Evitar

1. **Agente sin loop de observación** → siempre procesar el `tool_use` result
2. **Descriptions vagas en tools** → el modelo no usará el tool correctamente
3. **Contexto perdido entre agentes** → usar tipos estructurados en handoffs
4. **Sin fallback en tool errors** → el agente se cuelga si un tool falla
5. **Sin limit de iteraciones** → un agente puede entrar en loop infinito
6. **Costo sin modelar** → en producción, un pipeline mal modelado puede costar $$$
