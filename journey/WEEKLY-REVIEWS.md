# Weekly Reviews — Reflexión de cada semana

*Llena UNA revisión por semana, al final (domingo noche o lunes mañana). Esto consolida lo que aprendiste y planifica lo siguiente.*

---

## Week 2 Review — Testing Fundamentals

**Week Theme**: Vitest · React Testing Library · MSW · Playwright · Coverage

**Resultado final**: 39/39 tests pasando | 100% coverage en validator.ts | E2E implementado

---

### Goals vs Reality

| Goal | Planned | Actual | Notes |
|------|---------|--------|-------|
| Unit tests con Vitest | ✅ | ✅ | 26 tests, mocks, spies, sliding window |
| Integration tests con RTL + MSW | ✅ | ✅ | 13 tests, fake timers, error handling |
| E2E con Playwright | ✅ | ✅ | 6 suites implementadas, requiere app |
| Coverage >= 80% | ✅ | 100% | Separar validator.ts fue la clave |
| Benchmarks de performance | ✅ | ✅ | 10k resultados en ~1ms |

---

### Lo que aprendí esta semana

**Conceptos técnicos:**
- La diferencia real entre `vi.fn()` (mock) y `vi.spyOn()` (spy)
- Por qué `vi.useFakeTimers()` necesita `vi.useRealTimers()` en cleanup — si no, rompe todos los tests siguientes
- Por qué `results.map(validateLabResult)` es un bug cuando la función tiene parámetros opcionales — `.map()` pasa `(item, index, array)` y el índice se cuela como segundo argumento
- `server.use(handler)` vs `server.use()` — el handler va DENTRO de los paréntesis
- Coverage solo mide archivos importados, no código dentro de test files
- `toBeCloseTo(valor, decimales)` — el segundo parámetro es precisión, no rango de tolerancia

**Bugs que encontré y resolví:**
1. `vi.useFakeTimers()` sin cleanup → 6 tests con timeout en cascada
2. `getByText(/Hemoglobina/)` devuelve el `<strong>`, no el `<li>` → usar `getByTestId`
3. `validateLabResult.message` antes de construir el objeto → ReferenceError
4. MSW v1 (`rest`) instalado como v2 (`http`) → migración de API completa

---

### Mi guía personal: ¿Cuándo agrego qué tipo de test?

**UNIT TEST** — cuando:
- Tengo una función pura con lógica de negocio (`validateLabResult`, `calculateMovingAverage`)
- Necesito testear todos los edge cases rápido (boundary conditions, valores críticos)
- La función no depende de base de datos, red, ni UI
- Regla: si puedes llamarla con un valor y verificar el retorno → es unit test

**INTEGRATION TEST** — cuando:
- Un componente React hace fetch y renderiza datos
- Quiero verificar que el estado (loading → success → error) funciona
- Necesito mockear la API sin tocar el código del componente (MSW)
- Quiero verificar interacciones del usuario (click → POST → cambio visual)
- Regla: si involucra 2+ capas juntas (UI + fetch + state) → es integration test

**E2E TEST** — cuando:
- El flujo es CRÍTICO para el negocio (login → ver resultados → marcar revisado)
- Necesito verificar que todo funciona en un navegador real
- Quiero verificar persistencia (recargar y que siga guardado)
- Regla: si falla, el usuario no puede hacer su trabajo → merece E2E

**BENCHMARK** — cuando:
- La función procesa volumen alto (>1000 items)
- Tengo dos algoritmos y quiero comparar cuál es más rápido
- Hay un SLA de performance (validar 10k resultados en <100ms)
- Regla: si el código lento impacta directamente al usuario → benchmark

---

### Conexión con mi background

**QBP (Biología Clínica):**
Los tests de boundary conditions son exactamente como verificar los rangos de referencia en el laboratorio. Un valor de 11.9 g/dL de hemoglobina es anormal pero no crítico — igual que en el validador, donde `isAbnormal: true` pero `isCritical: false`. En el lab también tienes "niveles de alerta" que corresponden al flag `isCritical`.

**Auditoría:**
Los mocks y spies son el equivalente a documentos de prueba en auditoría. No trabajas con datos reales (sería destructivo), sino con documentos controlados que te permiten verificar que el proceso funciona correctamente. `vi.fn()` = documento de prueba. El spy = auditor que observa pero no interfiere.

**Ventas/UX:**
El test de performance (10k resultados en ~1ms) es el argumento de venta: "nuestro sistema valida 10,000 resultados en menos de 2 milisegundos". El benchmark lo convierte en un número concreto que puedes mostrar a un cliente clínico.

---

### Próxima semana: Week 3 — Clean Architecture

Aplicar lo aprendido: el código que escribí esta semana (`validateLabResult`) va a refactorizarse a una arquitectura limpia con repositorios, casos de uso y entidades. Los tests que escribí esta semana serán la red de seguridad para ese refactor.

---

## Week 1 Review Template (fill at end of Week 1)

**Week Theme**: TypeScript Sprint — Utility Types & Generics

**Main Project**: Solving TypeScript challenges (3-3.4, etc.)

**Cert Progress**: N/A (comienza Week 5)

---

### Goals vs Reality

| Goal | Planned | Actual | Notes |
|------|---------|--------|-------|
| Complete 3-3.4 task | ✅ | ✅ | Task completado Day 3 |
| Understand DeepPartial<T> | ✅ | ? | Rellena fin de semana |
| 5+ hours deep work | ✅ | ? | Cuenta en DAILY-LOGs |
| 0 blockers sin resolver | 🔶 | ? | Documenta en BLOCKERS.md |

---

### Progress Metrics

- **Commits this week**: [X] (mira `git log --since="7 days ago"`)
- **Tests passing**: [X/Y]
- **Deep work hours** (focus sessions 45+ min): [X]
- **Days streak maintained**: [X/7]

---

### Key Learnings

**Technical**
- Utility Type 1: [Qué es, por qué importa, cuándo usar]
- Patrón recursivo: [Qué viste]

**Polymath Insights**
- De auditoría: ¿Cómo se mapea esta lógica a compliance?
- De negocios: ¿Dónde viste ROI en lo que codificaste?

**Business Understanding**
- Concepto aprendido: [ej. TypeScript reduce bugs = menos costo para clientes]
- Aplicación: [Cómo lo comunicarías a un VP of Engineering]

---

### Wins This Week

- ✅ [Win 1]
- ✅ [Win 2]
- ✅ [Win 3]

---

### Challenges & Solutions

| Challenge | What I tried | Result | Next step |
|-----------|-------------|--------|-----------|
| [Blocker] | [Approach 1] | [Qué pasó] | [Próximo intento] |
| [Blocker] | [Approach 1] | [Qué pasó] | [Próximo intento] |

---

### Adjustments for Next Week

**Keep**
- [Qué funcionó bien]

**Change**
- [Qué ajustaste]

**Stop**
- [Qué no funcionaba]

---

### Next Week Preview

**Week 2 Theme**: [Topic]
**Main Goal**: [1 línea]
**Why it matters**: [Connect to your journey]

---

### Polymath Reflection

*La pregunta clave:* **¿Cómo estoy usando mi unique background (auditoría/QBP/ventas) en mi aprendizaje?**

Reflexión (5-10 líneas):

---

### Energy & Sustainability

- **Energy trend**: 😴 → 😐 → 😊 → 🔥 (¿mejorando o empeorando?)
- **Sustainable pace**: ¿Puedo mantener esto 16 semanas?
- **Adjustments needed**: [Si algo no es sostenible, escribe qué ajustaría]

---

## Plantilla rápida para copiar

```markdown
## Week [X] Review

**Week Theme**: [...]
**Main Project**: [...]
**Cert Progress**: [...]

### Goals vs Reality
| Goal | Planned | Actual | Notes |
|------|---------|--------|-------|
| | | | |

### Progress Metrics
- **Commits**: [X]
- **Tests**: [X/Y]
- **Deep work hours**: [X]
- **Streak**: [X/7]

### Key Learnings

**Technical**
-
-

**Polymath Insights**
-
-

**Business Understanding**
-

### Wins This Week
-
-
-

### Challenges & Solutions
| Challenge | What I tried | Result | Next step |
|-----------|-------------|--------|-----------|
| | | | |

### Adjustments for Next Week

**Keep**
-

**Change**
-

**Stop**
-

### Next Week Preview
**Theme**:
**Goal**:
**Why**:

### Polymath Reflection
[5-10 líneas]

### Energy & Sustainability
- Trend:
- Sustainable:
- Adjustments:
```

---

## Notas importantes

1. **Sé honesto**: La revisión no es para impresionar, es para aprender.
2. **Conecta con tu background**: Si no puedes ver cómo tu auditoría/ventas/QBP entra aquí, pregúntate por qué.
3. **Proyección**: Al final, escribe: "Si sigo este ritmo, ¿llegaré a $100k+ en 16 semanas?" Sé realista.
4. **Momentum**: Los wins pequeños acumulan. Celebra.
