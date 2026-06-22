# Week 18: Agentic Systems
## De Prompts Individuales a Sistemas que Piensan

**Duración:** 7 días | **Nivel:** Senior | **SDK:** Anthropic Claude (Tool Use API)

---

## Objetivo Principal

Diseñar, construir y operar sistemas multi-agente con Anthropic SDK. Al terminar, serás capaz de orquestar pipelines donde múltiples agentes colaboran, se especializan, y producen resultados que ninguno podría alcanzar solo.

> "Un prompt es una conversación. Un agente es un sistema. Un sistema multi-agente es una organización."

---

## Por Qué Esta Semana Importa

En Week 17 aprendiste a hacer una cosa bien: construir el contexto perfecto para una llamada al modelo. Esta semana aprendes a encadenar múltiples llamadas de forma inteligente, donde el output de un agente se convierte en el input del siguiente.

Esta distinción es la diferencia entre un AI Engineer y un AI Architect.

---

## Áreas de Enfoque

### 1. El Loop ReAct: Qué es un Agente (Día 1)
- Razonar → Actuar → Observar → repetir
- Tool use con Anthropic SDK
- Cuándo los agentes ayudan vs cuándo añaden complejidad

### 2. Diseño de Tools: La Interfaz que el Agente Usa (Día 2)
- Por qué las descripciones de tools son tan importantes como el código
- Schema design con Zod y TypeScript
- Manejo de errores de tools gracefully

### 3. Orquestación Multi-Agente (Día 3)
- Patrón Orchestrator/Subagente
- Handoffs tipados entre agentes
- Human-in-the-loop checkpoints

### 4. RAG: Darle Memoria al Agente (Día 4)
- Embeddings y búsqueda semántica
- Chunking de documentos clínicos
- Pipeline retrieval-then-generate

### 5. Spec-Driven Development (Día 5)
- Escribir specs tan claras que cualquier LLM puede ejecutarlas
- Inputs/Outputs/Edge Cases/Architecture
- El feedback loop entre calidad de spec y calidad de código

### 6. Producción: Latencia, Costo, Observabilidad (Día 6)
- Profiling de pipelines agénticos
- Cost modeling y presupuestos de tokens
- AgentTrace: logging estructurado de cada llamada

### 7. Capstone: Clinical Research Assistant (Día 7)
- Sistema completo multi-agente para investigación clínica
- Planner → Retrieval → Analysis → Writer
- Evals del día 5 (Week 17) aplicados al capstone

---

## Proyecto de la Semana

**Clinical Research Assistant** — Un sistema multi-agente que:
1. **Planner Agent:** Descompone una pregunta clínica compleja en subtareas
2. **Retrieval Agent:** Busca evidencia en una knowledge base de guías clínicas
3. **Analysis Agent:** Sintetiza la evidencia encontrada
4. **Writer Agent:** Produce un resumen clínico estructurado con citas

---

## Prerequisitos

- Week 17 completada (Context Engineering, EvalRunner)
- Familiaridad con el SDK de Anthropic (Week 8 + Week 17)
- TypeScript avanzado (Week 1)
- API key de Anthropic con acceso a Claude 3.5

---

## Configuración Inicial

```bash
cd weeks/week-18-agentic-systems
pnpm install
cp .env.example .env  # ANTHROPIC_API_KEY requerida
npx tsx src/dia1-react-loop/simple-agent.ts
```

---

## Estructura de Archivos

```
week-18-agentic-systems/
├── README.md
├── sprint-week18.md
├── GUIA-CONCEPTOS.md
├── AGENTS.md
├── RECURSOS.md
├── questionaries/QUESTIONS.md
└── src/
    ├── dia1-react-loop/simple-agent.ts
    ├── dia2-tool-design/tool-registry.ts
    ├── dia3-orchestration/multi-agent.ts
    ├── dia4-rag/knowledge-base.ts
    ├── dia5-spec-driven/spec-executor.ts
    ├── dia6-production/agent-trace.ts
    └── dia7-capstone/clinical-research-assistant.ts
```

---

## Métricas de Éxito

- [ ] Tu agente del día 1 completa un loop ReAct de 3+ pasos correctamente
- [ ] Tus tool descriptions son tan claras que el modelo nunca las usa mal
- [ ] El Orchestrator del día 3 delega correctamente a subagentes sin perder contexto
- [ ] Tu RAG del día 4 recupera el chunk correcto en > 80% de las queries
- [ ] Puedes escribir un spec que Claude ejecuta con < 2 iteraciones de corrección
- [ ] El AgentTrace del día 6 muestra costo y latencia por cada paso del pipeline
- [ ] El Clinical Research Assistant produce resúmenes con citas verificables

---

## Conexión con tu Background

**QBP/Biología:** Los sistemas multi-agente son como organismos multicelulares — cada agente es una célula especializada, el orquestador es el sistema nervioso, y el output es la respuesta coordinada del organismo.

**Auditoría:** El AgentTrace del día 6 es tu pista de auditoría — cada acción del agente está documentada, con costo, latencia y razonamiento. Exactamente lo que necesitarías para auditar un proceso de IA en un entorno regulado.

**Healthcare:** Un sistema de investigación clínica multi-agente puede procesar en minutos lo que un médico tardaría horas en revisar en literatura — pero requiere los mismos controles de calidad que cualquier proceso clínico.

---

**¡De prompts a sistemas. De sistemas a impacto.**
