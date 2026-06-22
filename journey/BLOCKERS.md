# 🚧 BLOCKERS — Problemas & Soluciones

*Cuando te trances, documéntalo aquí. Bloquea tiempo para resolver. Cierra cuando esté resuelto. Patrones de blockers = áreas para aprender más.*

---

## Estructura de un blocker

```
Problem: [1 línea clara del problema]
Context: [¿Dónde ocurrió? Qué estabas haciendo?]
Attempted: [Qué intentaste]
Solution (or Next Step): [Cómo lo resolviste O qué intentarás mañana]
Date Resolved: [YYYY-MM-DD o "pending"]
Time Investment: [Cuántos minutos pasaste aquí]
```

---

## Ejemplo: Blocker resuelto

```
Problem: DeepPartial<T> no compila recursivamente con arrays
Context: Task 3-3.4, línea 15 del archivo solution.ts
Attempted:
  1. Type<Partial<T>> — no tuvo efecto en nested
  2. Busqué en TypeScript docs (no explícito para recursión)
  3. Pregunté en Discord, alguien mencionó conditional types
Solution: Usé un conditional type `T extends Array<infer U> ? Array<DeepPartial<U>> : ...`
Date Resolved: 2026-04-02
Time Investment: 45 minutos
Learning: Conditional types + recursión = poderoso. Ahora entiendo Pattern<T extends X ? Y : Z>
```

---

## Week 1 Blockers

### [Pending] Blocker Template
```
Problem:
Context:
Attempted:
Solution / Next Step:
Date Resolved:
Time Investment:
```

---

## Cómo usar este archivo

1. **Cuando te trances** (>5 min sin avance): Abre este archivo, documenta el blocker en la sección de esta semana
2. **Durante la resolución**: Actualiza "Attempted" mientras pruebas soluciones
3. **Cuando resuelves**: Completa "Solution" y "Date Resolved"
4. **Fin de semana**: Revisa todos los blockers. ¿Hay un patrón? (ej. siempre te trancas en recursión → estúdia recursión el próximo bloque)

---

## Patrones a observar

Después de varias semanas, podrás ver:
- **Áreas frecuentes de bloqueo**: Si te trancas 3+ veces en lo mismo, es un área para aprender más
- **Tiempo promedio de resolución**: ¿Cuánto tarda típicamente resolver?
- **Soluciones comunes**: ¿Cuál es tu estrategia más efectiva? (ej. "debuggear con console.log", "buscar en docs", "preguntar en Discord")

---

## Tips para resolver blockers rápido

1. **Documenta el problema PRIMERO** (3-5 min). No saltes directamente a intentos.
2. **Intenta 2-3 cosas** antes de pedir ayuda (aprendes más así)
3. **Si llevas >20 min sin avance**: Busca ayuda (Discord, StackOverflow, mentor)
4. **Después de resolver**: Escribe 1 línea en tu DAILY-LOG.md (celebra el win)

---

## Blockers resueltos (archivados)

*Al final de cada semana, mueve los blockers resueltos a una sección "Archived".*

Mantén los pendientes visibles arriba para presión positiva.

---

**Recuerda**: Resolver blockers es progreso. No es "estoy tranc
ado", es "estoy aprendiendo".
