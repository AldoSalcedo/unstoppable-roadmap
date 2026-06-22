# WEEK 06 — Database + CI/CD + AWS Certification Exam

## Sprint Overview

**Goal**: Build a production-ready PostgreSQL database layer with Prisma, implement a full CI/CD pipeline with GitHub Actions, and pass the AWS Certified Developer exam on Day 7.

**Aldo's Context**:
- Your **auditing background** makes this week crucial—databases are where audit trails live
- Healthcare data requires **HIPAA-compliant schema** (createdBy, updatedAt, audit logs on every table)
- AWS exam tests your ability to deploy healthcare software securely and scalably

---

## Weekly Roadmap

| Day | Focus | Deliverable | AWS Exam Readiness |
|-----|-------|-------------|-------------------|
| **1** | Prisma Schema Design | Healthcare-optimized schema.prisma | ECS/RDS knowledge |
| **2** | Database Migrations | Migration system + rollback strategy | DynamoDB vs RDS |
| **3** | Query Optimization | N+1 problem, indexes, repositories | CloudWatch monitoring |
| **4** | Full-Text Search | Postgres FTS + search repository | ElasticSearch on AWS |
| **5** | CI/CD Pipeline | GitHub Actions workflow | CodePipeline/CodeDeploy |
| **6** | AWS Final Prep | Mock exams + weak areas | Exam cram session |
| **7** | **AWS EXAM DAY** | Certified Developer badge | **REAL EXAM** |

---

## Week 06 Schema: Patient Clinical System

```
Patient
├── id (UUID)
├── mrn (Medical Record Number)
├── firstName, lastName
├── dateOfBirth
├── createdAt, updatedAt
├── createdBy (userId)
└── AuditLog[]

LabTest
├── id (UUID)
├── patientId (FK)
├── testType (enum: BLOOD, IMAGING, PATHOLOGY)
├── results (JSON)
├── status (enum: PENDING, COMPLETED, REVIEWED)
├── performedAt
├── reviewedBy (userId)
└── auditTrail[]

User
├── id (UUID)
├── email
├── role (enum: ADMIN, CLINICIAN, LAB_TECH)
└── AuditLog[]

AuditLog
├── id (UUID)
├── entityType (PATIENT | LABTEST)
├── entityId (UUID)
├── action (CREATE | UPDATE | READ | DELETE)
├── userId (FK)
├── timestamp
└── oldValues, newValues (JSON)
```

### HIPAA Audit Requirements
- ✅ Every table has `createdAt`, `updatedAt`, `createdBy`
- ✅ Sensitive data (results) logged separately in AuditLog
- ✅ All mutations tracked with userId
- ✅ Timestamps on all events

---

## Key Learning Objectives

### Database
- [ ] Design a normalized, audit-friendly relational schema
- [ ] Understand Prisma schema language and type generation
- [ ] Write safe migrations with rollback strategies
- [ ] Identify and fix N+1 queries with indexes
- [ ] Implement full-text search for clinical data

### CI/CD
- [ ] Understand CI vs CD vs CD (continuous deployment)
- [ ] Write GitHub Actions workflows from scratch
- [ ] Test coverage requirements (>80% for healthcare)
- [ ] Lint and type-check in CI pipeline
- [ ] Deploy to staging automatically on PR

### AWS
- [ ] RDS: When to use managed PostgreSQL
- [ ] IAM: Principle of least privilege for database credentials
- [ ] Secrets Manager: Store connection strings securely
- [ ] CodePipeline: Orchestrate builds and deployments
- [ ] CloudWatch: Monitor database queries in production

---

## Files to Create

```
week-06-database-cicd/
├── README.md (this file)
├── sprint-week6.md
├── GUIA-CONCEPTOS.md
├── RECURSOS.md
├── AGENTS.md
├── questionaries/
│   └── QUESTIONS.md
├── src/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── repositories/
│   │   └── patient.repository.ts
│   └── migrations/
│       └── README.md
├── .github/
│   └── workflows/
│       └── ci.yml
└── package.json
```

---

## Daily Breakdown

### Day 1: Prisma Schema Design
**Topic**: Translating clinical requirements into a normalized schema

Learn:
- Prisma schema syntax (models, relations, enums)
- Why HIPAA requires audit trails
- Indexing strategy for queries (MRN, patientId, performedAt)
- UUID vs auto-increment (security perspective)

Exercise:
```ts
// EJERCICIO 1.1: Extend the Patient model
// Add a 'contact' relation to a new Contact model
// Add indexes for firstName + lastName + dateOfBirth (for patient search)
```

---

### Day 2: Database Migrations
**Topic**: How to safely evolve your schema in production

Learn:
- Prisma migration workflow (`prisma migrate dev`, `prisma migrate deploy`)
- Why migrations must be reversible (auditing perspective)
- Handling zero-downtime migrations for large tables
- Connection pooling with PgBouncer

Exercise:
```ts
// EJERCICIO 2.1: Write a migration that adds a new column without breaking production
// Hint: Shadow traffic, feature flags, gradual rollout
```

---

### Day 3: Query Optimization
**Topic**: Avoiding N+1 queries and designing repositories

Learn:
- N+1 problem: loading 1 patient + all lab tests sequentially
- Index strategy: (patientId, status) compound index
- Prisma select/include patterns
- Repository pattern for data access

Exercise:
```ts
// EJERCICIO 3.1: Optimize findPatientWithTests()
// Current: O(n) queries | Target: O(1) query with includes
```

---

### Day 4: Full-Text Search
**Topic**: PostgreSQL FTS for clinical search

Learn:
- Text search indexes (tsvector, tsquery)
- Ranking results by relevance
- Combining FTS with structured queries
- Healthcare use case: searching past diagnoses

Exercise:
```ts
// EJERCICIO 4.1: Search patients by name + diagnosis history
```

---

### Day 5: CI/CD Pipeline
**Topic**: Automating tests, linting, and deployments

Learn:
- GitHub Actions anatomy (triggers, jobs, steps)
- Matrix testing (Node 18, 20, 22)
- Coverage gates (require 80%+ for healthcare)
- Staging environment deployment on PR

Exercise:
```yaml
# EJERCICIO 5.1: Add a database migration check step
# Ensure migrations are committed before merge
```

---

### Day 6: AWS Final Prep
**Topic**: Last-minute exam review

Focus Areas:
- RDS: Read replicas, backups, failover
- IAM Policies: Least privilege for service accounts
- Secrets Manager: Rotation strategies
- CodePipeline: Artifact management
- CloudWatch: Query metrics and alerts

Mock Exams:
- [ ] Take 2x full practice exams (Whizlabs or Udemy)
- [ ] Review weak areas (likely: IAM + DynamoDB)
- [ ] Time management: 130 questions in 130 minutes

---

### Day 7: AWS EXAM DAY
**Topic**: Certified Developer Assessment

Logistics:
- 2 hours, 130 questions
- Passing score: ~720/1000
- Schedule: Morning exam (better focus)
- Location: Proctored center or online proctoring

Post-Exam:
- If pass: celebrate! 🎓 Add to LinkedIn
- If fail: analyze weak domains → retake in 2 weeks

---

## Pedagogical Connections

### Your Auditing Background
- Databases ARE audit trails
- Every mutation (CREATE, UPDATE, DELETE) must be logged with WHO, WHEN, WHAT changed
- HIPAA penalties: $100–$50,000 per violation → audit logs prevent this
- Your audit knowledge makes you uniquely qualified to design defensible systems

### Your Biology Degree (QBP)
- Clinical data modeling requires domain knowledge
- Lab test types, reference ranges, normal/abnormal thresholds
- Your QBP background makes you a better architect than someone who doesn't understand healthcare

### Sales/UX Background
- Database performance = user experience
- Slow queries = frustrated clinicians who abandon your app
- N+1 queries = 10-second patient search instead of 100ms
- This week you're selling reliability

---

## Success Criteria

By end of Day 5:
- [ ] Schema migrates without errors
- [ ] CI/CD pipeline is green on every commit
- [ ] 80%+ test coverage
- [ ] All queries optimized (no N+1)
- [ ] Full-text search works

By end of Day 7:
- [ ] AWS Certified Developer badge earned

---

## Resources

- Prisma Docs: https://www.prisma.io/docs/
- GitHub Actions: https://docs.github.com/en/actions
- AWS Certified Developer Study Guide: https://www.aws-skills.com/
- PostgreSQL Full-Text Search: https://www.postgresql.org/docs/current/textsearch.html
- HIPAA Compliance: https://www.hhs.gov/hipaa/

---

## Week 6 Agents & Tools

This week requires:
- **Database**: Prisma (schema + migrations)
- **Testing**: Vitest
- **CI/CD**: GitHub Actions
- **Monitoring**: AWS CloudWatch (from Day 5)
- **Real Deliverable**: AWS Certification Exam Pass

⚠️ **This is not a practice week.** Day 7 is a **real, proctored AWS exam**. All CI/CD work must function in production.

---

## Next Week Preview

Week 07 will build authentication and payment processing on top of this database:
- Auth.js for HIPAA-compliant sessions
- RBAC (role-based access control)
- Stripe subscriptions
- Webhook reliability (your CI/CD will trigger production code)

The database you design this week is the foundation for everything ahead.
