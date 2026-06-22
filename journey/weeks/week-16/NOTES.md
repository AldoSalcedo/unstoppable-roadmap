# Week 16 Live Notes — The Launch 🚀

*La semana final. Escribe aquí todo lo que pasa: entrevistas, ofertas, freelance, emociones. Este documento es tuyo.*

---

## Day 8 (Week 16, Day 1) — Phone Screens + Follow-Ups

**Concepto**: El phone screen es un filtro de two-way fit. Ellos evalúan a ti, tú los evalúas a ellos.

```typescript
// Preguntas que DEBES hacer en cada phone screen:
const questionsToAsk = [
  "What does success look like in the first 90 days?",
  "How does the team handle technical debt?",
  "What's the biggest technical challenge you're facing right now?",
  "How much of the work is greenfield vs. maintaining existing systems?",
  "What does the on-call rotation look like?",
];

// Señales de alerta (red flags):
const redFlags = [
  "We work hard and play hard" // = culture fit is a mask
  "We move fast" // = no processes, constant firefighting
  "We're like a family" // = unhealthy boundaries
  "No estable answer on technical challenge" // = not being honest
];
```

**Resultado de hoy**: Phone screen con [Company]. Notas: [fill in]

---

## Day 9 — Technical Round Prep

**Problemas resueltos hoy en preparación**:

```typescript
// Problema 1: Merge K Sorted Patient Lists
// (clinical context: merge results from multiple hospital systems)

function mergeKSortedLists(lists: number[][]): number[] {
  const result: number[] = [];
  const heap = new MinHeap(); // min-heap by value

  // Initialize heap with first element of each list
  lists.forEach((list, i) => {
    if (list.length > 0) {
      heap.push({ value: list[0], listIndex: i, elemIndex: 0 });
    }
  });

  while (!heap.isEmpty()) {
    const { value, listIndex, elemIndex } = heap.pop();
    result.push(value);

    const nextElem = lists[listIndex][elemIndex + 1];
    if (nextElem !== undefined) {
      heap.push({ value: nextElem, listIndex, elemIndex: elemIndex + 1 });
    }
  }

  return result;
}
// Time: O(N log K) | Space: O(K)
// N = total elements, K = number of lists
```

**Insight**: Verbalizé el trade-off (por qué heap > sort todo) y el entrevistador lo notó.

---

## Day 10 — Primera Entrevista Técnica

**Formato**: 60 min. Live coding (30 min) + system design (30 min)

```
Live coding: [Describe the problem]
Approach tomado: [Describe your approach]
Resultado: [Passed / needs improvement]

System design: [Describe the prompt]
Cómo estructuré la respuesta:
1. Clarify scope (5 min)
2. Back-of-envelope scale (5 min)
3. High-level design (10 min)
4. Deep dive one component (7 min)
5. Trade-offs y preguntas (3 min)
Resultado: [Assessment]
```

**Feedback recibido** (si lo dieron): [fill in]

---

## Day 11 — Segunda Entrevista + Freelance First Pitch

**Freelance pitch enviado hoy**:

```
Empresa: [Healthcare startup via Upwork/direct]
Propuesta: [Healthcare mobile app / HIPAA compliance audit / clinical SaaS MVP]

Resultado: [Response / call scheduled / rejected]
Notas: [what worked, what didn't]
```

**Pattern reconocido**: Los clientes freelance en healthcare responden mejor cuando mencionas HIPAA + React Native + experiencia clínica juntos. Esa combinación es escasa.

---

## Day 12 — Evaluación de Oferta

**Oferta recibida de**: [Company]

```typescript
// Evaluación objetiva:

const offer = {
  baseSalary: 0,      // fill in (USD annual or MXN monthly)
  equity: "0%",       // fill in
  bonus: 0,           // fill in
  remote: true,       // fill in
  techStack: [],      // fill in
  teamSize: 0,        // fill in
};

// Scoring (0-100 per dimension):
const score = {
  compensation: 0,    // vs market + your BATNA
  growth: 0,          // trajectory, mentor quality
  mission: 0,         // do you care about what they build?
  culture: 0,         // management, team dynamics
  stability: 0,       // runway, revenue, market
};

// Weighted total:
// compensation(30%) + growth(25%) + mission(20%) + culture(15%) + stability(10%)
```

**Decisión**: [Accept / Negotiate / Decline]

**Negociación**: [Script used, outcome]

---

## Day 13 — Negociación Final + Freelance Client #1

**Resultado de negociación**:
```
Initial offer: [amount]
Counter: [amount + reasoning]
Final: [amount]
Delta: [how much you gained by negotiating]
```

**Lección**: Siempre negocia. El 90% de employers esperan un counter. No negociar = dejar dinero en la mesa.

**Freelance client #1 secured** (or update):
```
Client: [type of client]
Project: [brief description]
Rate: $[XX]/hr
Duration: [X weeks]
Monthly value: ~$[XX]
```

---

## Day 14 — DÍA DE LANZAMIENTO 🎉

**Hoy es el último día de las 16 semanas.**

```
LOGROS DE 16 SEMANAS:

Technical:
✅ TypeScript avanzado — utility types, generics, decorators
✅ Testing mastery — Vitest, RTL, Playwright, TDD
✅ Clean Architecture — DDD, repositories, SOLID
✅ Performance Optimization — Web Vitals, profiling, memoization
✅ Next.js — App Router, RSC, Server Actions, SEO
✅ Database — Prisma, PostgreSQL, migrations, query optimization
✅ Auth + Payments — Auth.js, RBAC, Stripe subscriptions
✅ React Native + AI — Expo, TanStack Query, OpenAI/Claude API
✅ Advanced Mobile — notifications, camera, deep links, offline
✅ Mobile Production — App Store submission, CI/CD, monitoring
✅ System Design — architecture patterns, scalability
✅ Portfolio — deployed, SEO-optimized, case studies live

Certifications:
✅/⏳ AWS Developer Associate
✅/⏳ Azure AI Engineer (AI-102)

Career:
✅ Portfolio deployed
✅ [X] applications sent
✅ [X] interviews completed
✅/⏳ Offer received
✅/⏳ Freelance client #1
```

**Reflexión del Día 112**:

[Escribe aquí tu reflexión personal sobre las 16 semanas. ¿Qué aprendiste sobre ti mismo? ¿Qué fue más difícil? ¿Qué te sorprendió? ¿Quién eres ahora que no eras en el Día 1?]

---

## Notas Adicionales

**El inicio del siguiente ciclo**: Las 16 semanas no son el fin — son el foundation. El siguiente ciclo empieza con más experiencia, mejores hábitos, y un track record probado.

**Qué hacer la semana 17**: Rest. Celebrate. Plan the next 16 weeks.
