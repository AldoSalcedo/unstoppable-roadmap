# Week 11 Live Notes — System Design + Azure AI Exam + Proof of Work

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras estudias system design, Azure AI, y construyes proof of work project. No tiene que estar pulido.*

---

## Day 1 — System Design Fundamentals

**Concepto**: Diseñar sistemas escalables que soportan millones de usuarios.

```typescript
// Twitter-like system design

// Requirements
// - Post tweets (280 chars)
// - Read timeline (real-time)
// - 500M users, 100M DAU
// - 5000 writes/second, 50k reads/second

// Architecture
// Frontend: React web + React Native mobile
// API: Load balanced (ELB) across regions
// Cache: Redis (hot tweets)
// Queue: Kafka (async processing)
// DB: PostgreSQL (primary), Cassandra (timeline)
// Search: Elasticsearch (full-text)
// Storage: S3 (media)
// CDN: CloudFront (static assets)

// Traffic distribution
const region1_users = 200_000_000;
const region2_users = 200_000_000;
const region3_users = 100_000_000;

// Sharding strategy
const user_id = 1;
const shard_key = user_id % num_shards; // consistent hashing
```

**Patrón observado**: Start with requirements. Scale comes after.

**Pregunta que surgió**: ¿Cuándo shardear? Respuesta: Cuando single DB no aguanta volumen.

---

## Day 2 — Scalability & CAP Theorem

**Concepto**: Consistency, Availability, Partition tolerance. Elige dos.

```typescript
// CP: Consistent + Partition tolerant (no availability if partition)
// PostgreSQL + strong consistency
interface StrongConsistency {
  write_acks_all_replicas: true;
  read_from_leader: true;
  lost_updates: never;
}

// AP: Available + Partition tolerant (eventual consistency)
// DynamoDB + Cassandra
interface EventualConsistency {
  write_accepted_immediately: true;
  read_stale_data: possible;
  heal_over_time: true;
}

// Trade-offs en práctica
// Stock trading: CP (consistency crucial)
// Social media timeline: AP (eventual consistency OK)
// Email: AP + persistence (recover from failures)
```

**Patrón**: Different services, different consistency models.

---

## Day 3 — Azure AI Certification Prep

**Concepto**: Azure AI Fundamentals (AI-900) + Applied Azure AI (AI-102).

```typescript
// Azure AI services
// - Cognitive Services (Vision, Language, Speech)
// - Azure OpenAI (GPT, DALL-E)
// - Azure Bot Service
// - Azure Metrics Advisor
// - Azure Anomaly Detector

// Example: Imagen classification con Computer Vision
import { ComputerVisionClient } from "@azure/cognitiveservices-vision-computervision";

const client = new ComputerVisionClient(
  { credentials: creds },
  endpoint
);

const analysis = await client.analyzeImageByUrl({
  url: imageUrl,
  visualFeatures: ["Categories", "Tags", "Description"],
});

// Exam topics
// - Responsible AI (fairness, transparency, privacy)
// - Machine Learning concepts
// - Azure AI architecture
// - Data privacy in cloud
```

**Patrón**: Azure = cloud AI infrastructure. OpenAI = generative models.

---

## Day 4 — Healthcare AI Proof of Work Project

**Concepto**: Demostrar experiencia con healthcare domain.

```typescript
// Healthcare diagnosis assistant
// Integra: Azure AI + OpenAI + HealthKit data

// Use case
// - Patient logs symptoms
// - AI suggests possible conditions
// - Recommend specialist
// - Comply with HIPAA

interface DiagnosisAssistant {
  analyzeSymptoms(symptoms: string[]): Promise<Diagnosis[]>;
  recommendSpecialists(diagnosis: Diagnosis): Doctor[];
  auditLog(action: string): Promise<void>; // HIPAA compliance
}

// Implementation
'use server';

export async function analyzeSymptomsWithAI(
  symptoms: string[],
  patientId: string
): Promise<Diagnosis[]> {
  // 1. Encrypt patient data
  const encryptedSymptoms = encrypt(symptoms);

  // 2. Call Azure AI (de-identified)
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a medical AI assistant. Suggest conditions based on symptoms.'
      },
      {
        role: 'user',
        content: `Patient reports: ${symptoms.join(', ')}`
      }
    ],
    functions: [{
      name: 'return_diagnosis',
      parameters: {
        type: 'object',
        properties: {
          condition: { type: 'string' },
          confidence: { type: 'number' },
          specialists: { type: 'array' }
        }
      }
    }]
  });

  // 3. Log for audit trail
  await auditLog({
    action: 'DIAGNOSIS_ANALYSIS',
    patientId,
    timestamp: new Date()
  });

  return parseDiagnosis(response);
}
```

**Patrón**: Healthcare = regulated. Audit trail + encryption crítico.

---

## Day 5 — Interview Preparation & Mock Sessions

**Concepto**: System design interviews son preguntas abiertas. Comunica tus trade-offs.

```typescript
// Interview framework

// 1. UNDERSTAND requirements (1-2 min)
// "What's the scale? QPS? Latency requirements?"

// 2. PROPOSE high-level design (5 min)
// "I'd use load balancers → APIs → databases"
// [Draw on whiteboard]

// 3. DEEP DIVE into components (10 min)
// "Let's discuss database sharding strategy..."
// "For caching, I'd use Redis because..."

// 4. DISCUSS trade-offs (5 min)
// "We could use MongoDB for flexibility, but PostgreSQL for consistency"
// "We chose Kafka because..."

// Sample answer structure
const system_design_answer = {
  requirements: {
    functional: ['post', 'read_timeline', 'like'],
    non_functional: ['scale_500m_users', 'low_latency', 'high_availability']
  },
  architecture: {
    frontend: 'React',
    api: 'Node.js (load balanced)',
    cache: 'Redis',
    database: 'PostgreSQL (primary) + Cassandra (timeline)',
    queue: 'Kafka',
    search: 'Elasticsearch'
  },
  trade_offs: {
    consistency_vs_availability: 'Chose AP for timeline (eventual)',
    sql_vs_nosql: 'PostgreSQL for transactional, Cassandra for time series',
    cache_invalidation: 'TTL + event-based invalidation'
  }
};
```

**Patrón**: System design = communication. Show your thinking.

---

## Patrones descubiertos

**Pattern 1: Scaling Pyramid**
Vertical (more CPU/RAM) → Horizontal (more servers) → Data partitioning → Regional distribution

**Pattern 2: Reliability Patterns**
Retries + exponential backoff, circuit breaker, health checks, fallbacks

**Pattern 3: Caching Strategy**
L1 (in-memory), L2 (Redis), L3 (CDN). Different TTLs.

---

## Conexión con background

**De Auditoría**: System design = control architecture. Where's the audit trail?

**De QBP**: Scalability = cost. Distributed = expensive. Choose wisely.

**De Ventas**: System uptime = customer trust. Design for reliability.

---

## Notas Adicionales

- System design: no single right answer. Communicate trade-offs.
- Azure AI: focus on responsible AI + data privacy
- Healthcare: HIPAA compliance non-negotiable

---

**Última entrada**: 2026-06-11
**Próxima sesión**: 2026-06-12
