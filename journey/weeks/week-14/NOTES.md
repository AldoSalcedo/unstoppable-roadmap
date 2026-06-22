# Week 14 Live Notes — Path Deep Dive + Interview Marathon (Part 2 of 2)

*Escribe aquí las ideas, patrones, y preguntas que surgen en tu segunda semana de prep intensiva. No tiene que estar pulido.*

---

## Day 8 — Path-Specific Deep Work

**Concepto**: Committed to your path. Now go deep.

```typescript
// Path: Specialist → Healthcare Software Engineer
// Deep work this week:
// - HIPAA technical safeguards (audit controls, encryption at rest/transit)
// - HL7 FHIR standard basics (how healthcare data is structured)
// - Clinical decision support system architecture
// - EHR integration patterns (Epic SMART on FHIR)
```

**Insight**: Your QBP background = you already speak clinical. Most engineers don't. That's moat.

**Pregunta que surgió**: ¿Cuánto cobra un consultant de HIPAA compliance? → Respuesta: $150-250/hr. 😳

---

## Day 9 — System Design Marathon

**Concepto**: Design a telemedicine platform end-to-end.

```
System: TeleHealth Platform
Scale: 10k concurrent consultations

Components:
├── API Gateway (Kong/Nginx)
├── Video Service (Daily.co/Twilio Video)
├── Auth Service (Clerk + HIPAA BAA)
├── Patient Records (PostgreSQL + encryption)
├── Notifications (Firebase + APNS)
└── Audit Log (append-only, immutable)

Key decisions:
- Video: third-party (Daily.co) vs build own
  → Third-party: faster, HIPAA BAA available
- Data: multi-tenant vs separate DBs per clinic
  → Row-level security (faster than separate DBs)
- Audit: sync vs async logging
  → Async (Kafka) for performance, but ensure durability
```

**Lo que aprendí**: Siempre start with clarifying questions antes de dibujar.

---

## Day 10 — Mock Interview: Live Coding

**Problema practicado**: Two-pointer + sliding window en healthcare context.

```typescript
// Find maximum patients seen in any K-hour window
function maxPatientsInWindow(timestamps: number[], k: number): number {
  let left = 0;
  let maxCount = 0;

  for (let right = 0; right < timestamps.length; right++) {
    // Shrink window if outside K hours
    while (timestamps[right] - timestamps[left] >= k * 3600) {
      left++;
    }
    maxCount = Math.max(maxCount, right - left + 1);
  }

  return maxCount;
}
```

**Qué salió bien**: Verbalizé mi proceso antes de codear. El entrevistador dijo "exactly what I wanted."
**Qué mejorar**: Edge cases (empty array, single element) — tardé en recordarlos.

---

## Day 11 — Behavioral Interview Prep

**Framework**: STAR (Situation, Task, Action, Result)

```
Situación difícil que resolví:
S: Legacy code sin tests, cliente quería nueva feature urgente
T: Agregar feature sin romper funcionalidad existente
A: Wrote characterization tests first, then refactored, then feature
R: Entregué a tiempo + suite de tests que protege el código

Aplicando a healthcare:
S: Sistema de lab results con race condition (concurrencia)
T: Fix sin downtime (hospital en producción)
A: Feature flag → new atomic write → canary deploy → full rollout
R: 0 downtime, 0 data corruption, +200ms performance improvement
```

**Insight**: Mis historias de auditoría son GOLD para behavioral interviews. "I was responsible for compliance tracking for 50+ clients" — eso impresiona.

---

## Day 12 — Networking & Warm Connections

**Lo que aprendí**: LinkedIn outreach de cold → warm funciona con este patrón:

```
1. Follow target engineer
2. Like/comment 2-3 de sus posts (3 días)
3. Send connection + note: "I follow your work on [topic]..."
4. Wait for accept (80% rate with this approach)
5. Send value message (not ask): "I wrote a post on [related topic]..."
6. After rapport: "Would you have 15 min to share your experience at [Company]?"
```

**Resultado esta semana**: 12 connections accepted, 3 calls scheduled. 🔥

---

## Day 13 — Offer Framework

**Concepto**: Cómo evaluar una oferta de trabajo objetivamente.

```typescript
type OfferScore = {
  compensation: number;   // 0-100 (base + equity + bonus)
  growth: number;         // 0-100 (trajectory, promotions, learning)
  mission: number;        // 0-100 (do you care about what they build?)
  culture: number;        // 0-100 (team quality, management style)
  stability: number;      // 0-100 (runway, revenue, market position)
};

function scoreOffer(offer: OfferScore, weights = {
  compensation: 0.30,
  growth: 0.25,
  mission: 0.20,
  culture: 0.15,
  stability: 0.10,
}): number {
  return Object.entries(weights).reduce((total, [key, weight]) => {
    return total + offer[key as keyof OfferScore] * weight;
  }, 0);
}
```

**Regla**: No aceptes nada debajo de 70/100. Tu BATNA (freelance) es real.

---

## Notas Adicionales

**Insight de la semana**: Mock interviews duelen. Eso es el punto. Cada error en mock = error prevenido en real.

**Pattern reconocido**: El mejor prep no es leer — es hacer. 5 mock interviews > 50 horas de lectura.

**Motivación**: Estás a 2 semanas del objetivo que empezaste hace 14 semanas. No pares.
