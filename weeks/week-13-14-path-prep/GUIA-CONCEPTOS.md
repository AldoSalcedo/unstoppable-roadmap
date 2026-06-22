# 📚 GUIA DE CONCEPTOS: Week 13-14

## Table of Contents
1. System Design Interview Framework (STAR)
2. Healthcare EMR System Design Deep Dive
3. Networking Funnel
4. The Three Paths Comparison Matrix
5. Consulting Rate Calculation
6. Engineering Management Fundamentals
7. SaaS Validation Framework

---

## 1. System Design Interview Framework: STAR

The STAR method for system design interviews (not to be confused with STAR behavioral questions):

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM DESIGN: STAR                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  S - SCOPE                                                 │
│  ├─ Clarify the problem (don't assume)                     │
│  ├─ Define scale (users, data, geography)                 │
│  ├─ Identify non-functional requirements                  │
│  │  (availability, latency, consistency)                  │
│  └─ Ask: "Should I focus on read-heavy or write-heavy?"   │
│                                                             │
│  T - THINK (Sketch on Whiteboard/Paper)                    │
│  ├─ List components (servers, DBs, cache, queues)        │
│  ├─ Draw relationships (APIs, data flow)                  │
│  ├─ Identify bottlenecks (SPOF, scaling issues)          │
│  └─ Consider trade-offs (SQL vs NoSQL, etc.)             │
│                                                             │
│  A - ARCHITECT (Deep Dive 1-2 Components)                  │
│  ├─ Pick 1-2 critical components                          │
│  ├─ Dive deep (algorithms, data structures, DB schema)   │
│  ├─ Explain your choices (why this DB? why this caching?)│
│  └─ Consider edge cases (failures, hotspots)              │
│                                                             │
│  R - REVIEW (Iterate & Handle Concerns)                    │
│  ├─ Did I meet the requirements?                          │
│  ├─ What if [failure scenario]?                           │
│  ├─ How would this scale 10x?                             │
│  └─ Trade-offs: what am I sacrificing?                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Example Conversation Flow

```
Interviewer: "Design a healthcare EMR system for 1M patients."

YOU:
Step 1 - SCOPE:
"Let me clarify requirements. You said 1M patients. Are we talking
about 100k concurrent users viewing/updating records? Is this read
or write heavy? What about HIPAA compliance - is that a must-have?"

Interviewer: "Yes, 100k concurrent. Both read and write. HIPAA mandatory."

YOU:
Step 2 - THINK:
[Draw on whiteboard]
- API layer (node/python) - load balanced
- Cache layer (Redis) - for frequently accessed records
- Primary DB (PostgreSQL) - encrypted at rest, HIPAA compliant
- Audit log service - immutable, encrypted
- Notification service (for alerts)

Step 3 - ARCHITECT:
"Let me dive deeper on the database design.
Each patient record contains..."
[Define schema: Patient, MedicalRecord, Encounter, etc.]

Step 4 - REVIEW:
"This handles 100k concurrent users with <500ms latency.
If we need 10x scale, we'd implement read replicas and sharding
by patient_id. HIPAA compliance is met via encryption,
access controls, and audit logs."
```

### Key Interview Principles

1. **Clarify first** - Never assume. Ask about scale, traffic patterns, requirements
2. **Trade-offs matter** - Don't design for 10M users if you only have 1M. Be efficient.
3. **Show your thinking** - Interviewer wants to see how you approach problems
4. **Focus > Perfection** - Better to dive deep on 1-2 components than surface-level on everything
5. **Handle failures** - What happens when the cache goes down? A server dies?

---

## 2. Healthcare EMR System Design Deep Dive

### Requirements Analysis

```
┌──────────────────────────────────────────────────────────────┐
│             EMR System: Requirements Framework              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FUNCTIONAL REQUIREMENTS                                    │
│  ├─ Patient management (create, read, update records)      │
│  ├─ Medical history (diagnoses, medications, allergies)   │
│  ├─ Appointments (scheduling, reminders)                   │
│  ├─ Prescriptions (order, track, pharmacy integration)    │
│  ├─ Lab results (upload, display, trends)                 │
│  └─ Reporting (provider reports, analytics)               │
│                                                              │
│  NON-FUNCTIONAL REQUIREMENTS                               │
│  ├─ Availability: 99.95% uptime (SLA)                      │
│  ├─ Latency: <500ms for patient record retrieval          │
│  ├─ Consistency: Strong (medical data can't be stale)     │
│  ├─ Scalability: 1M patients, 100k concurrent users       │
│  ├─ Security: HIPAA compliance (encryption, audit logs)   │
│  └─ Performance: <2s for complex queries                  │
│                                                              │
│  CONSTRAINTS                                                │
│  ├─ Geographic: Multi-region (50 hospitals)               │
│  ├─ Regulatory: HIPAA, state regulations                  │
│  ├─ Legacy: Must integrate with existing systems         │
│  └─ Cost: Optimize for long-term affordability            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Architecture Deep Dive

```
┌────────────────────────────────────────────────────────────────────┐
│                     EMR System Architecture                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CLIENT LAYER                                                     │
│  ├─ Web (React/Vue) - doctor portal, patient portal             │
│  ├─ Mobile (React Native) - iOS/Android for patients            │
│  └─ External integrations (pharmacy, labs)                      │
│                                                                    │
│                         ↓ (HTTPS/TLS)                            │
│                                                                    │
│  API GATEWAY                                                      │
│  ├─ Load balancer (50k-100k concurrent connections)             │
│  ├─ Rate limiting & DDoS protection                             │
│  ├─ Request validation & authentication                         │
│  └─ Routing to microservices                                    │
│                                                                    │
│                         ↓                                         │
│                                                                    │
│  MICROSERVICES LAYER                                             │
│  ├─ PatientService (CRUD operations)                            │
│  ├─ MedicalRecordService (diagnoses, history)                  │
│  ├─ PrescriptionService (order, track)                          │
│  ├─ AppointmentService (scheduling)                             │
│  ├─ LabService (results, trends)                                │
│  ├─ NotificationService (alerts, reminders)                     │
│  └─ AuditLogService (HIPAA compliance)                          │
│                                                                    │
│                         ↓                                         │
│                                                                    │
│  CACHE LAYER (Redis)                                             │
│  ├─ Patient records (frequently accessed)                        │
│  ├─ User sessions                                                │
│  ├─ Medication/allergy lists (reference data)                   │
│  └─ TTL: 1-4 hours depending on data freshness needs           │
│                                                                    │
│                         ↓                                         │
│                                                                    │
│  DATABASE LAYER                                                   │
│  ├─ Primary DB: PostgreSQL (ACID, strong consistency)           │
│  │  ├─ Schema: Patient, MedicalRecord, Encounter, etc.          │
│  │  ├─ Encryption: at-rest (AES-256) & in-transit (TLS)        │
│  │  └─ Replication: 3x for high availability                    │
│  │                                                                │
│  ├─ Time-Series DB: InfluxDB (lab results trends)               │
│  │  └─ Optimized for time-series queries                        │
│  │                                                                │
│  └─ Document Store: MongoDB (flexible schemas for notes)        │
│     └─ For unstructured clinical notes                          │
│                                                                    │
│                         ↓                                         │
│                                                                    │
│  AUDIT & SECURITY                                                │
│  ├─ Immutable audit log (every patient record access)          │
│  ├─ Access control (role-based: doctor, nurse, admin)          │
│  ├─ Encryption keys (AWS KMS or HashiCorp Vault)               │
│  └─ Monitoring (CloudWatch, Datadog)                           │
│                                                                    │
│  MESSAGE QUEUE (Kafka)                                           │
│  ├─ Async processing (notifications, audit logs)                │
│  ├─ Decoupling services                                          │
│  └─ Event streaming (patient events for analytics)              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Database Schema (Simplified)

```sql
-- Patient Table
CREATE TABLE patients (
  patient_id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  encrypted_ssn VARCHAR(255), -- encrypted
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone)
);

-- Medical Record
CREATE TABLE medical_records (
  record_id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients,
  encounter_id UUID NOT NULL,
  diagnosis VARCHAR(500),
  symptoms TEXT,
  treatment_plan TEXT,
  provider_id UUID,
  encrypted_notes TEXT, -- sensitive data
  created_at TIMESTAMP,
  INDEX idx_patient_id (patient_id),
  INDEX idx_encounter_id (encounter_id)
);

-- Medications
CREATE TABLE medications (
  med_id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients,
  drug_name VARCHAR(255),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  start_date DATE,
  end_date DATE,
  INDEX idx_patient_id (patient_id)
);

-- Audit Log (immutable)
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50), -- 'READ', 'WRITE', 'DELETE'
  resource_type VARCHAR(100), -- 'patient_record', 'medication'
  resource_id UUID,
  timestamp TIMESTAMP NOT NULL,
  ip_address INET,
  INDEX idx_timestamp (timestamp),
  INDEX idx_resource_id (resource_id)
);
```

### HIPAA Compliance Checklist

```
┌─────────────────────────────────────────────────┐
│     HIPAA Requirements & Implementation         │
├─────────────────────────────────────────────────┤
│                                                 │
│ ✓ ENCRYPTION                                   │
│   ├─ At rest: AES-256                         │
│   └─ In transit: TLS 1.2+                     │
│                                                 │
│ ✓ ACCESS CONTROL                              │
│   ├─ Role-based (RBAC)                        │
│   ├─ Principle of least privilege              │
│   └─ Audit all access (immutable log)         │
│                                                 │
│ ✓ AUTHENTICATION                              │
│   ├─ Strong passwords (12+ chars, complexity) │
│   ├─ Multi-factor authentication (MFA)        │
│   └─ Session timeout (15 min inactivity)      │
│                                                 │
│ ✓ AUDIT LOGGING                               │
│   ├─ Log all patient record access            │
│   ├─ Immutable audit trail (cannot delete)    │
│   ├─ Retention: min 6 years                   │
│   └─ Include: user, action, timestamp, IP     │
│                                                 │
│ ✓ DATA INTEGRITY                              │
│   ├─ Checksums for data validation            │
│   ├─ Version control for records              │
│   └─ No unauthorized modification             │
│                                                 │
│ ✓ INCIDENT RESPONSE                           │
│   ├─ Breach notification plan (<60 days)      │
│   ├─ Incident logging & investigation        │
│   └─ Regular security assessments             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Scaling to 1M Patients, 100k Concurrent Users

```
Issue 1: Database bottleneck
Solution: Sharding
├─ Shard by patient_id (consistent hash)
├─ 10 database shards (shard_id = hash(patient_id) % 10)
└─ Lookup: Given patient_id, always hit same shard

Issue 2: Read latency (100k concurrent reads)
Solution: Read replicas + caching
├─ 3x read replicas per primary
├─ Redis cache for hot data (80/20 rule)
└─ Cache invalidation strategy (TTL + event-driven)

Issue 3: Write scaling (concurrent updates)
Solution: Write-ahead logging + async processing
├─ Primary writes to WAL (fast, durable)
├─ Kafka queue for async operations
└─ Audit log written asynchronously

Issue 4: Multi-region failover
Solution: Active-active replication
├─ 2 primary regions (US-East, US-West)
├─ Async replication between regions
├─ DNS failover (Route53) in <5 min
└─ RTO: <5min, RPO: <1min
```

---

## 3. Networking Funnel

The networking funnel shows how connections become opportunities:

```
┌──────────────────────────────────────────────────────────────┐
│                  NETWORKING FUNNEL                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TIER 1: CONNECTIONS (Awareness)                            │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Send 50+ LinkedIn messages/week                │        │
│  │ Goal: Get to 500+ relevant connections        │        │
│  │ Effort: 5-10 min per message (personalized)    │        │
│  └─────────────────────────────────────────────────┘        │
│              ↓ ~40% response rate                            │
│                                                              │
│  TIER 2: CONVERSATIONS (Engagement)                         │
│  ┌─────────────────────────────────────────────────┐        │
│  │ 20 coffee chats scheduled                      │        │
│  │ Goal: Deep conversations about their journey  │        │
│  │ Effort: 30 min call + 10 min follow-up        │        │
│  └─────────────────────────────────────────────────┘        │
│              ↓ ~30% lead to opportunity                      │
│                                                              │
│  TIER 3: OPPORTUNITIES (Action)                             │
│  ┌─────────────────────────────────────────────────┐        │
│  │ 6 meaningful opportunities emerge              │        │
│  │ (consulting gig, job lead, intro to investor) │        │
│  │ Effort: Follow up, apply, pitch yourself      │        │
│  └─────────────────────────────────────────────────┘        │
│              ↓ ~50% convert to real engagement                │
│                                                              │
│  TIER 4: CONVERSION (Result)                                │
│  ┌─────────────────────────────────────────────────┐        │
│  │ 3 real engagements (job offer, consulting gig,│        │
│  │ investor intro, board seat, etc.)             │        │
│  │ Outcome: Career momentum + relationships      │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
│  SUMMARY: 50 connections → 20 calls → 6 opportunities      │
│            → 3 real outcomes                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Messaging Formula (Per Tier)

**Tier 1: Connection Message** (Goal: Get "yes" to coffee chat)

```
Subject: [Specific thing they did] + [Your credibility]

Hi [Name],

[Hook - Reference something specific they did]
I really appreciated your post on [topic] at [company].

[Credential - Why you're worth 20 minutes]
I'm [your title] with [relevant background], and I've been
working on [similar domain] at [company/project].

[Ask - Clear, specific, low-friction]
Would you be open for a 20-min coffee chat about your
experience building [specific thing]?

[CTA]
I'm available [2-3 specific times this week].

Best,
[Name]
```

**Tier 2: Coffee Chat** (Goal: Extract insights, build relationship)

```
Conversation flow:
1. Warm-up (2 min): "Thanks for taking time. How's your week?"
2. Their story (8 min): "Can you walk me through your journey?"
3. Deep dive (5 min): "What surprised you most?"
4. Your context (3 min): Share briefly what you're exploring
5. Ask for help (2 min): "Would you be willing to [specific ask]?"
   Examples:
   - "...introduce me to someone at [company]?"
   - "...review my consulting positioning?"
   - "...read my SaaS idea and poke holes?"
```

**Tier 3: Follow-up** (Goal: Convert opportunity)

```
Email after coffee chat:

Hi [Name],

Thanks again for the chat yesterday. I really resonated with
your point about [specific insight].

I'm going to [specific action you'll take]. Would you be open
to [ask from conversation]?

[Attach: your resume / positioning doc / SaaS pitch]

[Optional] I'd love to reconnect in [time frame].

Best,
[Name]
```

---

## 4. The Three Paths Comparison Matrix

```
┌────────────────────────────────────────────────────────────────────┐
│        COMPARISON: Specialist vs Leader vs Builder                │
├────────────────────────────────────────────────────────────────────┤
│ Criterion           │ SPECIALIST      │ LEADER          │ BUILDER    │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Income (Year 5)     │ $150-200k/yr    │ $200-400k/yr    │ $0-1M+/yr  │
│                     │ $100-150/hr     │ or equity       │ (volatile) │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Financial Stability │ HIGH            │ HIGH            │ LOW        │
│                     │ (predictable)   │ (salary base)   │ (risk)     │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Autonomy            │ VERY HIGH       │ MODERATE        │ VERY HIGH  │
│                     │ (choose clients)│ (org structure) │ (own vision)│
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Learning Curve      │ STEEP           │ STEEP           │ VERY STEEP │
│                     │ (tech mastery)  │ (people skill)  │ (all-in)   │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Time to Impact      │ 2-3 years       │ 5-7 years       │ 3-5 years  │
│                     │ (become expert) │ (earn trust)    │ (find PMF) │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Schedule Control    │ HIGH            │ LOW             │ VERY LOW   │
│                     │ (pick projects) │ (meetings)      │ (24/7)     │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Technical Growth    │ VERY HIGH       │ MODERATE        │ HIGH       │
│                     │ (stay sharp)    │ (context shift) │ (broad)    │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ People Impact       │ MODERATE        │ VERY HIGH       │ HIGH       │
│                     │ (1-1 advising)  │ (whole teams)   │ (customers)│
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Risk Level          │ LOW             │ LOW             │ VERY HIGH  │
│                     │ (always in need)│ (solid careers) │ (binary)   │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Lifestyle          │ BALANCED        │ BUSY            │ INTENSE    │
│                     │ (project-based) │ (on-call)       │ (all-in)   │
├─────────────────────┼─────────────────┼─────────────────┼────────────┤
│ Best For            │ Domain experts  │ Team builders   │ Visionaries│
│                     │ (healthcare)    │ (systems thinkers)          │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. Consulting Rate Calculation

How to price yourself as a specialist consultant:

```
┌────────────────────────────────────────────────────────────┐
│          CONSULTING RATE = Desired Income / Billable Hours │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  STEP 1: Desired Annual Income                           │
│  Example: $150,000/year                                  │
│                                                            │
│  STEP 2: Billable Hours per Year                         │
│  Assumption: 20 hrs/week * 50 weeks = 1000 hrs           │
│  (Reality: 60-70% utilization, so 1200 hrs available)   │
│                                                            │
│  STEP 3: Calculate Base Rate                             │
│  $150,000 / 1000 = $150/hour                             │
│                                                            │
│  STEP 4: Add Margin (for non-billable time)              │
│  Non-billable: sales, admin, vacation, training          │
│  Margin: 20-30%                                          │
│  $150 * 1.25 = $187.50/hour                              │
│                                                            │
│  STEP 5: Market Adjustment                               │
│  Is healthcare specialist market paying $200+/hr?        │
│  YES → price at market rate                              │
│  NO → price at your calculated rate                      │
│                                                            │
│  FINAL: $150-200/hour (for senior healthcare engineer)  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Rate-Setting by Expertise Level

```
Junior (1-2 yrs): $40-60/hr
Mid-level (3-5 yrs): $75-100/hr
Senior (5-10 yrs): $100-150/hr
Principal (10+ yrs): $150-250/hr
Expert/Domain Leader: $250+/hr
```

### Pricing Models (Not Just Hourly)

```
1. HOURLY (Simple)
   Pro: Predictable, easy to quote
   Con: Doesn't reward efficiency
   Example: $150/hr

2. PROJECT-BASED (Better)
   Pro: Rewards efficiency, customer clarity
   Con: Requires scoping
   Example: "Healthcare auth integration: $5,000"

3. VALUE-BASED (Best)
   Pro: Aligns incentives, captures value
   Con: Requires deep understanding of customer problem
   Example: "Reduce payment processing errors from 5% to <1%: $50,000"
            (if customer saves $200k/year, you capture 25%)

4. RETAINER (Ongoing)
   Pro: Predictable revenue
   Con: Requires long-term commitment
   Example: "$8,000/month for on-call advisory + 40 hrs/month"
```

---

## 6. Engineering Management Fundamentals

Key frameworks for the Leader path:

```
┌──────────────────────────────────────────────────────────┐
│      ENGINEERING MANAGEMENT: Core Competencies          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. HIRING & BUILDING TEAM                              │
│     ├─ How to screen for cultural fit + technical skill│
│     ├─ Interview loops that predict success             │
│     ├─ Onboarding that builds confidence (30/60/90)    │
│     └─ Retention: Why people stay (or leave)            │
│                                                          │
│  2. 1-ON-1 MANAGEMENT                                   │
│     ├─ Structure: 30 min weekly, same time/place        │
│     ├─ Format:                                          │
│     │  1. How are you? (5 min)                         │
│     │  2. Last week recap (5 min)                      │
│     │  3. This week preview (5 min)                    │
│     │  4. Growth/development (10 min)                  │
│     │  5. Concerns/blockers (5 min)                    │
│     └─ Key: Listen more than you talk                   │
│                                                          │
│  3. FEEDBACK & PERFORMANCE MANAGEMENT                   │
│     ├─ Real-time feedback (within 24 hrs)              │
│     ├─ Framework: Situation → Behavior → Impact        │
│     │  Example: "In yesterday's meeting, when you       │
│     │  interrupted Sarah, she stopped contributing     │
│     │  ideas. How can we handle disagreements better?"  │
│     ├─ Annual reviews (look back + plan forward)        │
│     └─ Growth conversations (skills, gaps, trajectory) │
│                                                          │
│  4. TEAM DYNAMICS & CULTURE                             │
│     ├─ Psychological safety (can people take risks?)    │
│     ├─ Clarity (everyone knows OKRs, their role)       │
│     ├─ Ownership (decisions, autonomy)                  │
│     ├─ Accountability (consequences for missing goals)  │
│     └─ Communication (over-communicate vs overwhelm)   │
│                                                          │
│  5. TECHNICAL CREDIBILITY                               │
│     ├─ Stay hands-on (code review, architecture)       │
│     ├─ Understand system design deeply                  │
│     ├─ Make smart technical decisions                   │
│     └─ Advocate for engineering excellence              │
│                                                          │
│  6. DELEGATION & TRUST                                  │
│     ├─ When to delegate (almost always)                 │
│     ├─ How to stretch people (challenge vs overwhelm)  │
│     ├─ Giving autonomy without abandonment             │
│     └─ Building trust through follow-through            │
│                                                          │
│  7. CONFLICT RESOLUTION                                 │
│     ├─ Address issues early (don't let fester)         │
│     ├─ Separate person from problem                    │
│     ├─ Listen to understand (not to reply)             │
│     └─ Focus on shared goals (not blame)               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### The Spotify Model (How to Scale Engineering)

Spotify doesn't have managers, they have "Tribes, Squads, Chapters, Guilds":

```
TRIBE (aligned to business area)
├─ Squad (cross-functional team: 6-8 people)
│  ├─ Product Owner (what to build)
│  ├─ Scrum Master (how to work)
│  └─ Engineers (5-6 people)
├─ Squad (another team)
└─ Squad (another team)

CHAPTER (functional alignment)
├─ All Backend engineers across squads (share knowledge)
├─ Led by Tech Lead (career development)
└─ Regular syncs (technical decisions, best practices)

GUILD (optional, community of interest)
├─ Testing Guild (QA best practices)
├─ Security Guild (security culture)
└─ DevOps Guild (infrastructure)
```

**Why it works:**
- Squads have autonomy (teams own products)
- Chapters maintain technical excellence
- Guilds share knowledge across teams
- No manager bottleneck

---

## 7. SaaS Validation Framework

The right way to validate before building:

```
┌────────────────────────────────────────────────────────────┐
│        SAAS VALIDATION: From Problem to Paying Customers  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  PHASE 1: PROBLEM VALIDATION (Week 1-2)                  │
│  Goal: Confirm the problem exists & people care          │
│                                                            │
│  ├─ Interview 10 people in your target market            │
│  ├─ Script:                                               │
│  │  "Tell me about how you currently [solve problem]"     │
│  │  "What's hard about that?"                             │
│  │  "Have you tried [alternative solutions]?"             │
│  │  "Would you pay for something that [your solution]?"  │
│  │                                                         │
│  ├─ Listen for:                                           │
│  │  ✓ Pain is recurring (not one-time)                   │
│  │  ✓ Pain costs them time or money                      │
│  │  ✓ They've tried other solutions                      │
│  │  ✓ They ask when they can use it                      │
│  │                                                         │
│  └─ Red flags:                                            │
│     ✗ "That would be nice to have"                       │
│     ✗ No urgency in tone                                 │
│     ✗ They've never tried a solution                     │
│     ✗ They don't know who else has this problem          │
│                                                            │
│  PHASE 2: SOLUTION VALIDATION (Week 3-4)                 │
│  Goal: Confirm your solution solves their problem        │
│                                                            │
│  ├─ Create mockup (design, not code)                     │
│  ├─ Show to 5 people from phase 1                        │
│  ├─ Ask:                                                  │
│  │  "Would you use this?"                                │
│  │  "Would you pay $X/month?"                            │
│  │  "What's missing?"                                    │
│  │                                                         │
│  ├─ Look for:                                             │
│  │  ✓ "Yes, I'd use this"                               │
│  │  ✓ "I'd pay $X without hesitation"                   │
│  │  ✓ Specific feature feedback                          │
│  │  ✓ Volunteers to be beta users                        │
│  │                                                         │
│  └─ Red flag:                                             │
│     ✗ "Interesting, but..."                              │
│     ✗ "Maybe someday"                                    │
│     ✗ Generic feedback (could apply to any app)         │
│                                                            │
│  PHASE 3: MARKET VALIDATION (Week 5-6)                   │
│  Goal: Confirm there's a big enough market               │
│                                                            │
│  ├─ Calculate TAM (Total Addressable Market):             │
│  │  Target user count × Annual revenue per user          │
│  │  Example: 10,000 healthcare admins × $10k/yr = $100M │
│  │                                                         │
│  ├─ Research competitors:                                 │
│  │  ├─ Direct (solves same problem)                      │
│  │  ├─ Indirect (alternative solutions)                  │
│  │  └─ What's your advantage?                            │
│  │                                                         │
│  └─ Validation signals:                                   │
│     ✓ TAM > $50M (ideally $500M+)                        │
│     ✓ 3-5 direct competitors (proves market)             │
│     ✓ Growing market (new regulations, new use cases)    │
│                                                            │
│  PHASE 4: GO-TO-MARKET VALIDATION (Week 7-8)             │
│  Goal: Confirm you can acquire customers                 │
│                                                            │
│  ├─ Ask: "How do customers find solutions like this?"    │
│  │  ├─ Word of mouth? (long sales cycle)                │
│  │  ├─ Google search? (build SEO)                        │
│  │  ├─ Sales? (enterprise)                               │
│  │  └─ Conferences? (events in industry)                 │
│  │                                                         │
│  ├─ Test at least one channel:                            │
│  │  ├─ Write 3 blog posts (get search traffic)           │
│  │  ├─ Network at 1 conference                           │
│  │  ├─ Reach out to 10 potential customers              │
│  │  └─ What's your cost per customer?                    │
│  │                                                         │
│  └─ Validation:                                           │
│     ✓ You can identify and reach customers              │
│     ✓ Cost per customer < lifetime value                │
│     ✓ Customers eager to meet/chat                      │
│                                                            │
│  PHASE 5: WILLINGNESS TO PAY (Week 9)                    │
│  Goal: Confirm revenue model                             │
│                                                            │
│  ├─ Ask customers: How much would you pay?               │
│  │  ├─ "Too cheap?" ← go higher                         │
│  │  ├─ "Too expensive?" ← go lower                      │
│  │  └─ "Just right?" ← that's your price               │
│  │                                                         │
│  ├─ Pricing models to test:                              │
│  │  ├─ Per-user ($10/user/month)                        │
│  │  ├─ Usage-based ($0.10 per API call)                 │
│  │  ├─ Tiered (Starter $99, Pro $299, Enterprise custom)│
│  │  └─ Annual commitment (30% discount)                 │
│  │                                                         │
│  └─ Validation:                                           │
│     ✓ Customers name a price without negotiating       │
│     ✓ Price is 10-30% of their savings                 │
│     ✓ Multiple customers willing to pay                 │
│                                                            │
│  PHASE 6: MVP DEFINITION (Week 10)                       │
│  Goal: Define minimum viable product                     │
│                                                            │
│  ├─ List all features customers asked for               │
│  ├─ Prioritize: Must-have vs Nice-to-have               │
│  ├─ 80/20 Rule: Which 20% of features deliver 80% value?│
│  ├─ MVP scope:                                           │
│  │  ├─ Only must-haves                                  │
│  │  ├─ Rough, but functional                            │
│  │  ├─ Doable in 4-8 weeks with 1-2 engineers          │
│  │  └─ Enough to get paying customers                   │
│  │                                                         │
│  └─ Validation:                                           │
│     ✓ 3-5 paying customers willing to use MVP          │
│     ✓ Roadmap aligned with customer requests           │
│     ✓ You feel confident building it                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### SaaS Metrics That Matter

```
ACQUISITION:
├─ CAC (Customer Acquisition Cost): Total marketing spend / new customers
├─ Payback period: How long until customer revenue > CAC
└─ Growth: MoM growth rate (target: 5-10% for bootstrapped)

RETENTION:
├─ Churn: % of customers who cancel each month
│  └─ Target: <5% monthly churn (or <50% annual)
├─ LTV (Lifetime Value): ARPU / Monthly churn
│  └─ Formula: $100/month ARPU ÷ 5% churn = $2,000 LTV
└─ NRR (Net Revenue Retention): Revenue from existing customers + expansion

EFFICIENCY:
├─ ARPU (Average Revenue Per User): Total revenue / total users
├─ CAC:LTV ratio: Should be 1:3 or better (CAC recovers in 3 months)
└─ Burn rate: How much capital you're spending monthly
```

---

## Quick Reference: Which Framework When?

```
Preparing for SPECIALIST interview?
→ Use STAR system design framework
→ Deep dive: EMR system design + HIPAA
→ Show: "I know healthcare compliance deeply"

Preparing for LEADER interview?
→ Use engineering management frameworks
→ Case study: How you'd build a team
→ Show: "I think about people, culture, growth"

Preparing for BUILDER interview (with investors)?
→ Use SaaS validation framework
→ Present: Problem → Solution → Market → Unit economics
→ Show: "This problem matters, people will pay"

Networking to accelerate?
→ Use networking funnel
→ Message templates for each path
→ Goal: 50 connections → 3 opportunities
```

---

**End of GUIA-CONCEPTOS. These frameworks are your foundation. Master them.**
