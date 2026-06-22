# Week 17: Context Engineering
## El Arte y la Ciencia de Hablar con LLMs

**Duración:** 7 días | **Nivel:** Senior | **SDK:** Anthropic Claude

---

## Objetivo Principal

Dominar Context Engineering: la habilidad de construir, gestionar y evaluar el contexto que le das a un LLM para obtener resultados consistentes, medibles y confiables en entornos de producción.

> "La mayoría aprende a hacer preguntas. Los masters aprenden a construir contexto."

---

## Por Qué Esta Semana Importa

En Week 8 aprendiste a *llamar* la API de Claude y hacer streaming. Esta semana aprendes a *pensar* como un ingeniero de IA: no solo "¿qué le pregunto?" sino "¿qué información necesita el modelo para responder correctamente, y cómo lo sé con certeza?"

Esta distinción es la diferencia entre un desarrollador que usa IA y un AI Engineer.

---

## Áreas de Enfoque

### 1. Modelos Mentales del LLM (Día 1)
- Cómo funciona un LLM en términos que importan para ingeniería
- Tokens, context windows, temperatura — sin matemáticas, con intuición
- Por qué la posición en el contexto cambia el resultado

### 2. System Prompts y Diseño de Persona (Día 2)
- La palanca más poderosa y más ignorada
- Rol, constraints, formato, tono — los 4 pilares
- TypeScript: `SystemPromptBuilder` con tipos estrictos

### 3. Few-Shot Prompting (Día 3)
- La técnica que funciona en todos los modelos
- Cómo elegir ejemplos (diversidad, edge cases, negativos)
- TypeScript: `FewShotTemplate<TInput, TOutput>` genérico

### 4. Gestión de Context Window (Día 4)
- El error más común en producción: truncación silenciosa
- Estrategias de chunking, summarización y ventana deslizante
- TypeScript: `ContextManager` con presupuesto de tokens

### 5. Evals: Medir si el Output es Bueno (Día 5)
- La habilidad que nadie enseña — la más crítica
- LLM-as-judge, rubrics, golden datasets, regression testing
- TypeScript: `EvalRunner<TInput, TOutput>` con reportes

### 6. Failure Modes y Prompting Defensivo (Día 6)
- Nombres para lo que puede salir mal: hallucination, sycophancy, prompt injection
- Validación de output con Zod schemas
- TypeScript: `DefensivePrompt` con output validation

### 7. Sprint de Integración: Clinical Prompt Library (Día 7)
- Librería clínica de prompts probada y tipada
- CI-style eval runner que detecta regresiones
- Portfolio-grade: algo que usarías en producción real

---

## Proyecto de la Semana

**Clinical Prompt Library** — Un módulo TypeScript de prompts reutilizables para análisis de laboratorio, generación de notas clínicas y triage, con:
- `PromptRegistry`: catálogo tipado de prompts clínicos
- `ContextManager`: gestión de presupuesto de tokens
- `EvalRunner`: suite de evaluación automática
- Script CI que falla si la calidad baja de un umbral

---

## Prerequisitos

- Node.js 18+ instalado
- Cuenta de Anthropic con API key (obtener en console.anthropic.com)
- Completado Week 8 (familiaridad con el SDK de Anthropic)
- TypeScript sólido (Week 1)

---

## Configuración Inicial

```bash
# En la carpeta de esta semana
pnpm install

# Crear archivo de variables de entorno
cp .env.example .env
# Agregar tu ANTHROPIC_API_KEY en .env

# Ejecutar primer ejercicio
npx tsx src/dia1-mental-models/token-budget.ts
```

---

## Estructura de Archivos

```
week-17-context-engineering/
├── README.md                    (este archivo)
├── sprint-week17.md             (guía día a día)
├── GUIA-CONCEPTOS.md            (conceptos en profundidad)
├── AGENTS.md                    (contexto para Claude Code)
├── RECURSOS.md                  (links curados por día)
├── questionaries/
│   └── QUESTIONS.md             (preguntas de comprensión)
└── src/
    ├── dia1-mental-models/
    │   └── token-budget.ts
    ├── dia2-system-prompts/
    │   └── prompt-builder.ts
    ├── dia3-few-shot/
    │   └── few-shot-template.ts
    ├── dia4-context-manager/
    │   └── context-manager.ts
    ├── dia5-evals/
    │   └── eval-runner.ts
    ├── dia6-failure-modes/
    │   └── defensive-prompt.ts
    └── dia7-sprint/
        └── clinical-prompt-library.ts
```

---

## Métricas de Éxito

- [ ] Puedes explicar qué es un token sin buscar en Google
- [ ] Tu `SystemPromptBuilder` tiene 4+ campos tipados y produce prompts mejores que los manuales
- [ ] Tu `EvalRunner` puede comparar dos versiones de un prompt y decirte cuál es mejor
- [ ] Puedes nombrar y reproducir 5 failure modes distintos
- [ ] La Clinical Prompt Library pasa su propio eval con score > 80%
- [ ] Puedes diseñar un prompt clínico que un junior engineer pueda mantener sin romperse

---

## Conexión con tu Background

**QBP/Biología:** Los LLMs procesan información de manera análoga a cómo un médico lee un historial: el orden importa, el contexto reciente pesa más, y la especificidad del problema define la calidad del diagnóstico.

**Auditoría:** Los evals son tus controles internos. Un sistema de IA sin evals es como un proceso financiero sin reconciliación — puede estar fallando silenciosamente y no lo sabes.

**Healthcare:** Cada prompt de esta semana tiene contexto clínico real. No aprendes técnicas abstractas — aprendes a construir sistemas de IA que médicos podrían usar.

---

**¡A construir con intención, no con esperanza!**
