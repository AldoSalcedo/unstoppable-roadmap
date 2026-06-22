# Agent Context: Week 17 — Context Engineering

## Resumen

Esta semana convierte a un desarrollador que *usa* IA en un ingeniero que *diseña* sistemas de IA. El foco es Context Engineering: la habilidad de construir, gestionar y evaluar el contexto que recibe un LLM para producir outputs confiables en producción.

## Tecnologías

- **SDK:** `@anthropic-ai/sdk` (oficial de Anthropic)
- **Validación:** `zod` para schemas de output
- **Runtime:** Node.js 18+ con TypeScript strict
- **Modelo principal:** `claude-3-5-haiku-20241022` para ejercicios (menor costo), `claude-3-5-sonnet-20241022` para evals críticos

## Conceptos Clave por Día

### Día 1: Mental Models
- Tokens ≠ palabras (1 token ≈ 4 caracteres en inglés, menos en español)
- Context window = memoria de trabajo del modelo — lo que no entra, no existe
- Temperatura 0 = determinista, temperatura 1 = creativo
- Posición importa: instrucciones al inicio Y al final del contexto

### Día 2: System Prompts
- El system prompt define la "personalidad base" del modelo para toda la conversación
- 4 pilares: Rol (quién es), Constraints (qué NO hace), Formato (cómo responde), Tono (cómo suena)
- Especificidad > Genericidad: "eres un médico" es peor que "eres un hospitalista con 15 años en UCI pediátrica"

### Día 3: Few-Shot Prompting
- Zero-shot: sin ejemplos | One-shot: 1 ejemplo | Few-shot: 2-5 ejemplos
- Ejemplos negativos (qué NO hacer) son tan importantes como los positivos
- Chain-of-thought: pide al modelo que "piense en voz alta" antes de responder

### Día 4: Context Management
- Truncación silenciosa: el modelo nunca avisa cuando se queda sin contexto
- Chunking ≠ cortar en X caracteres — chunking = respetar unidades semánticas
- Ventana deslizante: mantén contexto reciente + resumen del pasado

### Día 5: Evals
- LLM-as-judge: usa un segundo modelo para calificar el output del primero
- Golden dataset: 10-20 casos con outputs esperados, cubriendo edge cases
- Regression testing: si cambias un prompt, ejecuta los evals antes de hacer deploy

### Día 6: Failure Modes
- Hallucination: el modelo inventa hechos con confianza
- Sycophancy: el modelo te da la razón aunque estés equivocado
- Prompt injection: el usuario rompe tu system prompt con instrucciones en su mensaje
- Context poisoning: datos corruptos en el contexto contaminan todos los outputs

### Día 7: Integration Sprint
- PromptRegistry: catálogo centralizado de prompts con versioning
- CI-style evals: script que falla si la calidad baja de un threshold
- Clinical Prompt Library: entregable de portafolio

## Convenciones de Código

- Todos los identificadores en **inglés**
- Todos los comentarios y docs en **español**
- Sin `any` — usar tipos estrictos o `unknown` + type guards
- Cada archivo de `src/` sigue la estructura del PEDAGOGICAL-STYLE-GUIDE
- Las API keys van en `.env`, nunca hardcodeadas

## Variables de Entorno Requeridas

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Estructura de Proyecto

```
src/
├── dia1-mental-models/token-budget.ts      — TokenBudget utility + ejercicios de tokens
├── dia2-system-prompts/prompt-builder.ts   — SystemPromptBuilder tipado
├── dia3-few-shot/few-shot-template.ts      — FewShotTemplate<TInput,TOutput> genérico
├── dia4-context-manager/context-manager.ts — ContextManager con chunking
├── dia5-evals/eval-runner.ts               — EvalRunner con LLM-as-judge
├── dia6-failure-modes/defensive-prompt.ts  — DefensivePrompt con Zod validation
└── dia7-sprint/clinical-prompt-library.ts  — Capstone: librería clínica completa
```

## Errores Comunes a Evitar

1. **No calcular tokens antes de hacer la llamada** → usar `client.beta.messages.countTokens()`
2. **System prompt genérico** → siempre incluir rol específico + constraints
3. **Sin evals** → nunca cambiar un prompt sin medir el antes/después
4. **Hardcodear el modelo** → usar constante `MODEL` configurable
5. **Ignorar el `stop_reason`** → siempre verificar si fue `end_turn` o `max_tokens`
