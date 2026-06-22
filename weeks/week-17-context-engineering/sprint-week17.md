// ============================================================
// SEMANA 17: Context Engineering Sprint
// De "usar IA" a "diseñar sistemas de IA"
// ============================================================

# Sprint Week 17: Context Engineering para Healthcare AI

## Resumen Ejecutivo

Esta semana construirás una **Clinical Prompt Library** — un módulo TypeScript de producción con prompts tipados, gestión de contexto, y evals automáticos para sistemas de IA en healthcare. Al terminar, tendrás la habilidad de diseñar, medir y mantener sistemas de IA que médicos podrían usar con confianza.

---

// TAREA 1: DÍA 1 — Mental Models + Token Budget Utility

## DÍA 1: Cómo Piensa un LLM (Lo que Importa para Ingeniería)

### Objetivos de Aprendizaje
- Entender tokens vs palabras con números reales
- Medir el costo en tokens de tus prompts clínicos
- Construir intuición sobre context windows y temperatura
- Crear la utility `TokenBudget` que usarás toda la semana

### Healthcare Angle
Cada llamada a la API en producción cuesta dinero y tiempo. Un sistema clínico que analiza 1,000 resultados de laboratorio al día necesita ser eficiente en tokens. No es premature optimization — es ingeniería responsable.

### Conceptos del Día
- 1 token ≈ 4 caracteres en inglés, más en español
- Context window = memoria de trabajo, no disco duro
- Temperatura 0 para extracción, 0.3-0.5 para análisis
- Posición importa: inicio y fin del contexto se recuerdan más

### Tareas del Día

#### EJERCICIO 1.1: Exploración de Tokens

```bash
# Setup inicial
cd weeks/week-17-context-engineering
pnpm install
cp .env.example .env  # crear este archivo con tu ANTHROPIC_API_KEY
```

Abre `src/dia1-mental-models/token-budget.ts` y completa los ejercicios:

1. Usa `client.messages.countTokens()` para medir el costo de 5 strings clínicos distintos
2. Compara tokens en inglés vs español para el mismo texto médico
3. Predice el costo antes de medir, luego verifica — ¿qué tan lejos estuviste?

#### EJERCICIO 1.2: Construir TokenBudget

Implementa la clase `TokenBudget` que:
- Recibe un límite máximo de tokens
- Tiene métodos `canFit(text: string)`, `remaining()`, `addUsed(tokens: number)`
- Lanza un warning tipado cuando estás al 80% del límite
- Exporta un tipo `TokenBudgetReport` con el estado actual

#### EJERCICIO 1.3: Experimento de Temperatura

Haz la misma pregunta clínica con temperatura 0, 0.5, y 1.0 cinco veces cada una.
Observa y documenta: ¿cuándo varían los outputs? ¿Cuándo son idénticos?

### Métricas de Éxito del Día
- [ ] `TokenBudget` compila sin errores en modo strict
- [ ] Puedes predecir el costo de un prompt con ±20% de precisión
- [ ] Documentaste diferencias de temperatura con ejemplos reales

---

// TAREA 2: DÍA 2 — System Prompts y SystemPromptBuilder

## DÍA 2: El Poder del System Prompt

### Objetivos de Aprendizaje
- Dominar los 4 pilares: Rol, Constraints, Formato, Tono
- Medir objetivamente la diferencia entre prompts débiles y fuertes
- Construir `SystemPromptBuilder` con TypeScript estricto

### Healthcare Angle
El system prompt es la diferencia entre un asistente que dice "el potasio está elevado" y uno que dice "K+ 6.8 mEq/L — hipercalemia severa, riesgo de arritmia, considerar ECG inmediato y protocolo de emergencia". El primero informa. El segundo salva vidas.

### Tareas del Día

#### EJERCICIO 2.1: Comparación de Prompts

Escribe 3 versiones de un system prompt para un analizador de lab results:
- Versión A: genérica (2-3 líneas)
- Versión B: con rol específico y constraints (10-15 líneas)
- Versión C: con los 4 pilares completos (20-25 líneas)

Envía el mismo caso clínico a las 3 versiones. Documenta las diferencias en output.

#### EJERCICIO 2.2: Implementar SystemPromptBuilder

Completa `src/dia2-system-prompts/prompt-builder.ts`:

```typescript
// La interfaz que debes implementar (no modificar)
interface SystemPromptConfig {
  role: {
    specialty: string;
    yearsExperience: number;
    context: string; // "hospital de tercer nivel en CDMX"
  };
  constraints: string[];      // lista de lo que NO debe hacer
  outputFormat: OutputFormat; // tipo que defines tú
  tone: 'formal' | 'directo' | 'pedagogico';
  language: 'es' | 'en';
}
```

#### EJERCICIO 2.3: Prompt para Triaje Hospitalario

Usando tu `SystemPromptBuilder`, construye el system prompt para un asistente de triaje que:
- Clasifica urgencia en escala Manchester (1-5)
- NUNCA diagnostica, solo clasifica urgencia
- Siempre indica si necesita ver al médico en < 15 min
- Responde en JSON parseable

Pruébalo con 5 casos reales (puedes inventarlos): angina, fractura, cefalea, fiebre en niño, herida de baja gravedad.

### Métricas de Éxito del Día
- [ ] `SystemPromptBuilder` compila y produce prompts diferentes según config
- [ ] Puedes medir con números la diferencia entre Versión A y C
- [ ] Tu prompt de triaje clasifica correctamente los 5 casos de prueba

---

// TAREA 3: DÍA 3 — Few-Shot Prompting y FewShotTemplate

## DÍA 3: Enseñar con Ejemplos

### Objetivos de Aprendizaje
- Diseñar ejemplos que cubren el espacio del problema
- Implementar Chain-of-Thought para razonamiento clínico
- Construir `FewShotTemplate<TInput, TOutput>` genérico y reutilizable

### Healthcare Angle
Un médico residente aprende viendo casos. Tu LLM aprende lo mismo — pero tienes que elegir cuidadosamente qué casos mostrarle. Un ejemplo mal elegido puede sesgar todos los outputs.

### Tareas del Día

#### EJERCICIO 3.1: Diseño de Ejemplos

Para un prompt de análisis de gasometría arterial, diseña:
- 3 ejemplos de casos clínicos reales (normal, acidosis, alcalosis)
- 1 ejemplo negativo: qué NO debe responder y por qué
- 1 ejemplo de Chain-of-Thought: razonamiento paso a paso antes de concluir

Evalúa tu prompt con 5 casos nuevos. ¿Funciona? ¿Dónde falla?

#### EJERCICIO 3.2: Implementar FewShotTemplate

Completa `src/dia3-few-shot/few-shot-template.ts`:

```typescript
// Clase genérica que debes implementar
class FewShotTemplate<TInput, TOutput> {
  constructor(
    private systemPrompt: string,
    private examples: Array<{ input: TInput; output: TOutput; reasoning?: string }>,
    private formatter: (input: TInput) => string,
    private outputParser: (raw: string) => TOutput,
  ) {}

  async run(input: TInput): Promise<TOutput> {
    // TODO: construir el prompt con los ejemplos y ejecutar
  }

  addExample(example: { input: TInput; output: TOutput; reasoning?: string }): this {
    // TODO: implementar (retorna this para chaining)
  }
}
```

#### EJERCICIO 3.3: Template para Notas SOAP

SOAP = Subjetivo, Objetivo, Análisis, Plan — el formato estándar de notas médicas.

Construye un `FewShotTemplate` que convierte una descripción libre de consulta en una nota SOAP estructurada. Mínimo 3 ejemplos variados.

### Métricas de Éxito del Día
- [ ] `FewShotTemplate` es genérico y compila con cualquier TInput/TOutput
- [ ] Tu template de SOAP produce notas que un médico reconocería como válidas
- [ ] Agregaste un ejemplo negativo y documentaste qué mejoró

---

// TAREA 4: DÍA 4 — Context Window y ContextManager

## DÍA 4: Gestión Inteligente del Contexto

### Objetivos de Aprendizaje
- Detectar y prevenir truncación silenciosa
- Implementar chunking semántico (no por caracteres)
- Construir `ContextManager` con ventana deslizante y summarización

### Healthcare Angle
Un expediente médico completo puede tener 20 años de historia. No cabe en ningún context window. Necesitas una estrategia inteligente que preserve la información crítica (alergias, diagnósticos crónicos, medicamentos actuales) mientras comprime la historia lejana.

### Tareas del Día

#### EJERCICIO 4.1: Detectar Truncación

Crea un expediente médico ficticio de 50,000 tokens (puedes generar texto con el mismo modelo). Envíalo completo al modelo y pídele que mencione cuándo nació el paciente. Luego verifica si el modelo "olvidó" datos del inicio.

¿Cuándo empieza a perder información?

#### EJERCICIO 4.2: Implementar ContextManager

Completa `src/dia4-context-manager/context-manager.ts`:

```typescript
interface ContextChunk {
  id: string;
  content: string;
  tokenCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  type: 'allergy' | 'chronic_condition' | 'medication' | 'lab_result' | 'note';
}

class ContextManager {
  // TODO: implementar
  // - addChunk(chunk: ContextChunk): void
  // - buildContext(budget: TokenBudget): string
  //   (prioriza critical > high > medium > low, luego por recencia)
  // - summarizeOlderChunks(olderThan: Date): Promise<string>
  //   (usa el modelo para resumir lo que no cabe)
}
```

#### EJERCICIO 4.3: Estrategia para Historial Clínico

Usando tu `ContextManager`, diseña la estrategia para un expediente de paciente crónico con 5 años de historia:
- ¿Qué va en `critical` siempre?
- ¿Qué se puede resumir?
- ¿Qué se puede descartar del contexto?

Implementa y prueba con un paciente ficticio diabético con hipertensión.

### Métricas de Éxito del Día
- [ ] `ContextManager` prioriza correctamente por `priority` y recencia
- [ ] Puedes manejar un "expediente" de 20,000 tokens en un contexto de 4,000
- [ ] La información crítica (alergias) SIEMPRE está presente en el contexto

---

// TAREA 5: DÍA 5 — Evals y EvalRunner

## DÍA 5: Medir si el Output es Realmente Bueno

### Objetivos de Aprendizaje
- Diseñar rubrics de evaluación para sistemas clínicos
- Implementar LLM-as-judge con Anthropic SDK
- Construir `EvalRunner` que produce reportes accionables

### Healthcare Angle
En un sistema que asiste diagnósticos médicos, "se ve bien" no es un criterio de aceptación. Necesitas saber: ¿identifica el 100% de los valores críticos? ¿Cuántas veces falló en los últimos 30 días? Los evals son tus controles de calidad — como los que usabas en auditoría, pero para IA.

### Tareas del Día

#### EJERCICIO 5.1: Diseñar tu Golden Dataset

Crea `src/dia5-evals/golden-dataset.ts` con 15 casos de análisis de laboratorio:
- 3 normales
- 3 con anomalías leves
- 3 con valores críticos
- 3 con múltiples anomalías
- 3 con datos incompletos o ambiguos

Para cada caso: input (texto de lab), output esperado, y justificación.

#### EJERCICIO 5.2: Implementar EvalRunner

Completa `src/dia5-evals/eval-runner.ts`:

```typescript
interface EvalCase<TInput, TOutput> {
  id: string;
  input: TInput;
  expectedOutput: TOutput;
  tags: string[]; // ['critico', 'normal', 'edge-case']
}

interface EvalResult {
  caseId: string;
  score: number;        // 0-10
  passed: boolean;      // score >= threshold
  reasoning: string;    // del LLM-as-judge
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

interface EvalReport {
  timestamp: Date;
  promptVersion: string;
  averageScore: number;
  passRate: number;         // % de casos que pasan el threshold
  failedCases: EvalResult[];
  costUSD: number;          // costo total de correr el eval
  recommendation: 'DEPLOY' | 'REVIEW' | 'BLOCK';
}

class EvalRunner<TInput, TOutput> {
  // TODO: implementar run(cases, promptFn, threshold) => EvalReport
}
```

#### EJERCICIO 5.3: Regresión Testing

Cambia algo en tu prompt de análisis de lab (intencional — empeóralo un poco). Corre los evals antes y después. Verifica que el `EvalRunner` detecta la regresión.

Luego mejora el prompt y verifica que los evals mejoran.

### Métricas de Éxito del Día
- [ ] `EvalRunner` produce reportes con score, latencia y costo
- [ ] El golden dataset cubre todos los tipos de casos clínicos
- [ ] Detectaste una regresión exitosamente con tu suite de evals

---

// TAREA 6: DÍA 6 — Failure Modes y Prompting Defensivo

## DÍA 6: Lo que Puede Salir Mal (y Cómo Defenderte)

### Objetivos de Aprendizaje
- Reproducir intencionalmente cada failure mode
- Implementar mitigaciones con prompting y validación Zod
- Construir `DefensivePrompt` con output validation automática

### Healthcare Angle
En un sistema clínico, cada failure mode tiene consecuencias reales. Hallucination puede significar un valor de referencia inventado. Sycophancy puede confirmar un diagnóstico erróneo. Prompt injection podría comprometer datos de pacientes. No son bugs abstractos — son riesgos de pacientes.

### Tareas del Día

#### EJERCICIO 6.1: Reproducir Hallucination

Haz estas preguntas al modelo sin contexto suficiente y documenta las respuestas:
1. "¿Cuál es el rango normal de troponina en el Hospital General de México?"
2. "¿Qué dosis de amoxicilina recomienda el protocolo IMSS para neumonía leve en adultos?"
3. "¿Cuántos casos de dengue se reportaron en CDMX el mes pasado?"

Ahora diseña prompts que hagan que el modelo diga "no tengo esa información" en lugar de inventar.

#### EJERCICIO 6.2: Reproducir Sycophancy

```typescript
// Secuencia para reproducir sycophancy:
// 1. Haz una pregunta clínica
// 2. El modelo responde correctamente
// 3. Dile "¿Estás seguro? Creo que estás equivocado"
// 4. Observa si cambia su respuesta (sycophancy) o la mantiene (bien calibrado)
```

Diseña un constraint en el system prompt que reduzca sycophancy. Verifica que funciona.

#### EJERCICIO 6.3: Implementar DefensivePrompt

Completa `src/dia6-failure-modes/defensive-prompt.ts`:

```typescript
class DefensivePrompt<TOutput> {
  constructor(
    private systemPrompt: string,
    private outputSchema: z.ZodType<TOutput>,
    private options: {
      maxRetries: number;           // reintentar si el output es inválido
      injectionPatterns: string[];  // patrones de prompt injection a detectar
      requireConfidence: boolean;   // el output debe incluir confidence score
    }
  ) {}

  async run(userInput: string): Promise<
    | { success: true; output: TOutput; confidence: number }
    | { success: false; reason: 'invalid_output' | 'injection_detected' | 'low_confidence' }
  > {
    // TODO: implementar con sanitización de input y validación de output
  }
}
```

### Métricas de Éxito del Día
- [ ] Reprodujiste los 3 failure modes con ejemplos documentados
- [ ] Tu `DefensivePrompt` detecta y rechaza prompt injection básico
- [ ] El schema Zod valida correctamente outputs y detecta formatos inválidos

---

// TAREA 7: DÍA 7 — Sprint de Integración: Clinical Prompt Library

## DÍA 7: Construir la Clinical Prompt Library Completa

### Objetivos de Aprendizaje
- Integrar todos los componentes de la semana
- Construir un PromptRegistry centralizado con versioning
- Crear un CI-style eval runner que bloquea deployments fallidos

### Healthcare Angle
Este es el entregable de portafolio. Una librería de prompts clínicos probada, tipada, y con evals automáticos es exactamente lo que diferencia un "vibe coder que usa Claude" de un AI Engineer que puede trabajar en un sistema de salud real.

### Tareas del Día

#### EJERCICIO 7.1: PromptRegistry

Completa `src/dia7-sprint/clinical-prompt-library.ts`:

```typescript
// El registry centraliza todos los prompts de la aplicación
const clinicalRegistry = new PromptRegistry({
  'lab.analysis.v1': {
    system: new SystemPromptBuilder({ /* ... */ }).build(),
    template: new FewShotTemplate(/* ... */),
    schema: LabAnalysisSchema,
    evalDataset: labGoldenDataset,
    threshold: 8.0,
  },
  'notes.soap.v1': {
    // ...
  },
  'triage.manchester.v1': {
    // ...
  },
});
```

#### EJERCICIO 7.2: CI Eval Runner

Crea `src/dia7-sprint/run-evals.ts` — un script ejecutable que:
1. Corre evals para todos los prompts del registry
2. Produce un reporte en consola con colores (✅ PASS / ❌ FAIL)
3. Sale con código de error (`process.exit(1)`) si algún prompt falla
4. Guarda el reporte en `eval-results/YYYY-MM-DD.json`

```bash
# Así debería verse el output:
npx tsx src/dia7-sprint/run-evals.ts

🔍 Corriendo evals — Clinical Prompt Library v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ lab.analysis.v1       9.2/10  (threshold: 8.0)  — 15/15 casos  — $0.023
✅ notes.soap.v1         8.7/10  (threshold: 8.0)  — 15/15 casos  — $0.018
❌ triage.manchester.v1  7.1/10  (threshold: 8.0)  — 11/15 casos  — $0.019
   └─ Falló en: casos con múltiples síntomas simultáneos (3/3 fallidos)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Score promedio: 8.3/10 | Costo total: $0.060 | ⏱ 47s
🚫 DEPLOY BLOQUEADO — 1 prompt por debajo del threshold
```

#### EJERCICIO 7.3: Mejora Iterativa

Tu triage prompt probablemente falló (o deberías hacer que falle). Itera:
1. Analiza qué casos fallaron y por qué (usa el reporte)
2. Mejora el prompt: más ejemplos, mejor constraint, formato diferente
3. Vuelve a correr los evals
4. Repite hasta que pase

Este ciclo iterativo con evals como feedback — no intuición — es el corazón del AI Engineering.

### Métricas de Éxito del Día
- [ ] `PromptRegistry` centraliza mínimo 3 prompts clínicos distintos
- [ ] El CI runner produce el reporte formateado y sale con error si hay fallas
- [ ] Hiciste al menos una iteración completa: analizar → mejorar → re-evaluar
- [ ] El código completa la semana con 0 errores TypeScript en modo strict

---

## Resumen de Entregables de la Semana

| Archivo | Descripción |
|---------|-------------|
| `dia1-mental-models/token-budget.ts` | `TokenBudget` utility + experimentos de temperatura |
| `dia2-system-prompts/prompt-builder.ts` | `SystemPromptBuilder` con 4 pilares |
| `dia3-few-shot/few-shot-template.ts` | `FewShotTemplate<TInput, TOutput>` genérico |
| `dia4-context-manager/context-manager.ts` | `ContextManager` con prioridades y summarización |
| `dia5-evals/eval-runner.ts` | `EvalRunner` con LLM-as-judge y reportes |
| `dia6-failure-modes/defensive-prompt.ts` | `DefensivePrompt` con Zod y anti-injection |
| `dia7-sprint/clinical-prompt-library.ts` | Capstone: librería clínica completa |
| `dia7-sprint/run-evals.ts` | CI script ejecutable |
| `eval-results/` | Historial de evals con fechas |

---

**Recuerda:** No estás aprendiendo a usar Claude más rápido — estás aprendiendo a diseñar sistemas con Claude que son confiables, medibles y mantenibles.

**¡Vamos a construir con ingeniería, no con esperanza!**
