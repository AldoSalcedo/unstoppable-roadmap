# SPRINT WEEK 6 — Day-by-Day Breakdown

## DÍA 1: Prisma Schema Design — Modeling Healthcare Data

### Morning Session: Schema Fundamentals
Learn the Prisma schema syntax and why it matters for auditing:

```prisma
// schema.prisma
// A Prisma schema is a declarative, type-safe way to define your database structure
// Benefits:
// 1. Type generation: Prisma generates TypeScript types automatically
// 2. Auditability: Every field has a rationale (comments)
// 3. Consistency: All developers use the same schema language

model Patient {
  // Unique identifier: UUID (not auto-increment)
  // Why UUID? Auditing perspective: harder to guess sequential IDs, supports distributed systems
  id String @id @default(cuid())

  // Medical Record Number: unique, indexed, required for patient lookup
  // Index: speeds up "find patient by MRN" queries
  mrn String @unique @db.VarChar(20)

  // Clinical identification
  firstName String
  lastName String
  dateOfBirth DateTime

  // Audit fields (HIPAA requirement)
  // These exist on EVERY table to track who created/modified data
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String // Foreign key to User.id

  // Relations
  labTests LabTest[]
  auditLogs AuditLog[] @relation("PatientAudit")

  @@index([mrn]) // Speed up patient lookups by MRN
  @@index([createdAt]) // For audit trail queries
  @@map("patients")
}

model LabTest {
  id String @id @default(cuid())
  patientId String
  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  // Test classification
  testType TestType // enum: BLOOD, IMAGING, PATHOLOGY

  // Clinical results (JSON for flexibility, but tracked in audit log)
  results Json?

  // Workflow status
  status TestStatus // enum: PENDING, COMPLETED, REVIEWED
  performedAt DateTime
  reviewedBy String? // nullable: pending tests have no reviewer yet

  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String

  // Relations
  auditLogs AuditLog[] @relation("LabTestAudit")

  @@index([patientId, status]) // Compound index: find pending tests for patient
  @@index([performedAt]) // Find recent tests
  @@map("lab_tests")
}

model User {
  id String @id @default(cuid())
  email String @unique
  role Role // enum: ADMIN, CLINICIAN, LAB_TECH
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  auditLogs AuditLog[] @relation("UserAudit")
  @@map("users")
}

model AuditLog {
  id String @id @default(cuid())

  // What entity changed?
  entityType String // PATIENT, LABTEST, USER
  entityId String

  // What happened?
  action Action // enum: CREATE, UPDATE, DELETE, READ

  // Who did it?
  userId String
  user User @relation("UserAudit", fields: [userId], references: [id])

  // When?
  timestamp DateTime @default(now())

  // Before/after values (for compliance audits)
  oldValues Json?
  newValues Json?

  // Optional: link to specific entities
  patient Patient? @relation("PatientAudit", fields: [entityId], references: [id], onDelete: SetNull)
  labTest LabTest? @relation("LabTestAudit", fields: [entityId], references: [id], onDelete: SetNull)

  @@index([userId, timestamp]) // Find all actions by user in time range
  @@index([entityType, entityId]) // Find all changes to specific entity
  @@map("audit_logs")
}

enum TestType {
  BLOOD
  IMAGING
  PATHOLOGY
}

enum TestStatus {
  PENDING
  COMPLETED
  REVIEWED
}

enum Role {
  ADMIN
  CLINICIAN
  LAB_TECH
}

enum Action {
  CREATE
  UPDATE
  DELETE
  READ
}
```

### Key Design Decisions
1. **UUIDs instead of auto-increment**: Supports distributed systems, harder to enumerate
2. **Audit fields on every table**: `createdBy`, `createdAt`, `updatedAt` are mandatory
3. **Compound indexes**: `(patientId, status)` is faster than indexing them separately
4. **JSON fields for flexibility**: `results` can vary by test type
5. **Soft delete pattern**: Consider adding `deletedAt` for compliance

### EJERCICIO 1.1: Extend the Schema
Add a Contact model:
```ts
// TODO: Create Contact model with:
// - id (UUID)
// - patientId (FK to Patient)
// - type (enum: EMERGENCY, PRIMARY_CARE, PHARMACY)
// - value (phone number or email)
// - preferred (boolean)
// - createdAt, updatedAt, createdBy
// Hint: What index would make "get patient's contacts" fast?
```

### EJERCICIO 1.2: Identify Missing Audit Fields
```ts
// TODO: Review the schema above.
// Which tables are MISSING audit fields? Add them.
// Why is createdBy important for healthcare?
```

### Connection to Your Background
**Auditoría**: Every field is an audit event waiting to happen. Your audit background means you understand:
- Who changed it? (createdBy, userId)
- When? (createdAt, updatedAt, timestamp)
- What changed? (oldValues, newValues)
- Why? (context in audit log description)

**QBP Biología**: You know that lab tests have:
- Reference ranges (normal vs abnormal)
- Patient-specific factors (age, weight affect ranges)
- Specimen types (serum vs plasma = different storage)
- Your schema flexibility (JSON results) supports this domain knowledge

---

## DÍA 2: Database Migrations — Evolving Production Schema

### Morning: Prisma Migrations Workflow

**Problem**: How do you update the database schema without losing data or breaking production?

**Solution**: Prisma migrations create reversible SQL scripts that evolve your schema.

```bash
# 1. Add a new field to your schema.prisma
# Edit schema.prisma: add `specialty String?` to User model

# 2. Create a migration
npx prisma migrate dev --name add_user_specialty
# Prisma generates: prisma/migrations/[timestamp]_add_user_specialty/migration.sql

# 3. What did it generate?
cat prisma/migrations/[timestamp]_add_user_specialty/migration.sql
# Output:
# -- AlterTable
# ALTER TABLE "users" ADD COLUMN "specialty" TEXT;

# 4. Rollback (if needed)
npx prisma migrate resolve --rolled-back [timestamp]_add_user_specialty

# 5. Deploy to production
# In CI/CD: npx prisma migrate deploy
```

### Key Concepts

**Migration Safety**:
```
Development:        Production:
┌─────────────┐     ┌─────────────┐
│ schema.prisma     │ database v1  │
├─────────────┤     ├─────────────┤
│ prisma     │     │ migration    │
│ migrate dev │     │ history      │
├─────────────┤     ├─────────────┤
│ database v2 │     │ apply safely │
└─────────────┘     │ no downtime  │
                    └─────────────┘
```

**Why Migrations Matter** (Auditoría Connection):
- Every schema change is traceable: `[timestamp]_description`
- Reversible: if a migration breaks production, `migrate resolve --rolled-back` undoes it
- Compliance: migrations are your audit trail of data structure changes
- If regulators ask "when was MRN field added?", you have the exact migration timestamp

### Zero-Downtime Migrations

For large tables (millions of rows), avoid long locks:

```sql
-- ❌ Bad (locks table during migration)
ALTER TABLE lab_tests ADD COLUMN priority INT DEFAULT 0;

-- ✅ Good (non-blocking, multi-step)
-- Step 1: Add column with default (non-blocking)
ALTER TABLE lab_tests ADD COLUMN priority INT DEFAULT 0;

-- Step 2: Backfill in batches (doesn't lock)
-- Requires custom SQL in migration

-- Step 3: Make NOT NULL after backfill
ALTER TABLE lab_tests ALTER COLUMN priority SET NOT NULL;
```

### EJERCICIO 2.1: Write a Safe Migration

Scenario: You need to add a new field `clinicalNotes` to LabTest without breaking production.

```sql
-- TODO: Write a migration that:
-- 1. Adds clinicalNotes as nullable TEXT field
-- 2. Includes a comment explaining why it's nullable
-- 3. Adds an index if needed
-- Hint: Check the Prisma migration docs for custom SQL
```

### EJERCICIO 2.2: Connection to Auditoría

```ts
// TODO: Answer these questions:
// 1. How would you audit WHO made a schema change?
// 2. Where is the audit trail for your migrations?
// 3. If a clinician asks "was patient email tracked in 2024?",
//    how would you find the answer?
// Hint: Your migration file names and timestamps are the answer
```

### NOTAS DE APRENDIZAJE
- Migrations are **declarative**: Prisma generates the SQL for you
- Migrations are **reversible**: every migration can be rolled back
- Migrations are **sequential**: they must be applied in order
- Production safety: `prisma migrate deploy` is idempotent (safe to run twice)

---

## DÍA 3: Query Optimization — Avoiding N+1 Problems

### Morning: The N+1 Problem

**What is N+1?**
```ts
// ❌ N+1 PROBLEM: Loads 1 patient + N queries for tests
async function getPatientWithTests(patientId: string) {
  // Query 1: Select patient
  const patient = await db.patient.findUnique({
    where: { id: patientId }
  });

  // Query N: Select tests (separate query!)
  const tests = await db.labTest.findMany({
    where: { patientId }
  });

  // Result: 2 queries total
  // But if you call this 100 times? 100 + 100 = 200 queries!
  return { patient, tests };
}

// ✅ SOLUTION 1: Use include/select
async function getPatientWithTestsOptimized(patientId: string) {
  // Single query with JOIN
  const patient = await db.patient.findUnique({
    where: { id: patientId },
    include: {
      labTests: true // Joins table in one query
    }
  });

  return patient; // includes patient.labTests
}

// ✅ SOLUTION 2: Use repository pattern
class PatientRepository {
  async findWithTestsByPatientId(patientId: string) {
    return db.patient.findUnique({
      where: { id: patientId },
      include: {
        labTests: {
          where: { status: 'COMPLETED' },
          orderBy: { performedAt: 'desc' }
        }
      }
    });
  }
}
```

### Indexing Strategy

**Without indexes**:
```
SELECT * FROM patients WHERE mrn = '12345'
→ Scan every row in the table (O(n) time)
→ With 1M patients: 1M comparisons
```

**With indexes**:
```
CREATE INDEX idx_patients_mrn ON patients(mrn);
SELECT * FROM patients WHERE mrn = '12345'
→ Use B-tree index (O(log n) time)
→ With 1M patients: ~20 comparisons
```

### Compound Indexes

```sql
-- Single index
CREATE INDEX idx_lab_tests_patient_id ON lab_tests(patientId);
CREATE INDEX idx_lab_tests_status ON lab_tests(status);

-- ✅ Better: compound index for common query
CREATE INDEX idx_lab_tests_patient_status ON lab_tests(patientId, status);
-- Covers: "find all COMPLETED tests for patient 123"
-- Much faster than two separate indexes
```

### EJERCICIO 3.1: Optimize Patient Repository

```ts
// patient.repository.ts

// TODO: Implement these methods with correct includes/selects:
export class PatientRepository {
  // Find patient + all their lab tests (completed first)
  async findWithTests(patientId: string) {
    // Hint: use include with where + orderBy
  }

  // Find patients by clinician (createdBy) with count of tests
  async findByClinician(clinicianId: string) {
    // Hint: use select instead of include to avoid large data
  }

  // Find high-priority patients (status = PENDING)
  async findWithPendingTests() {
    // Hint: filter on nested relation
  }
}
```

### EJERCICIO 3.2: Identify N+1 in Production

```ts
// TODO: This code is running slow. Find the N+1:
async function getDashboard(clinicianId: string) {
  const patients = await db.patient.findMany({
    where: { createdBy: clinicianId }
  });

  const dashboard = await Promise.all(
    patients.map(p =>
      db.labTest.count({ where: { patientId: p.id } })
    )
  );

  return { patients, dashboard };
}

// Answer: What's happening? How many queries?
// Fix: Rewrite using Prisma's _count feature
```

### NOTAS DE APRENDIZAJE
- **N+1 happens when**: you load 1 thing, then loop to load N related things
- **Solution**: use `include` or `select` to join in one query
- **Indexes**: make WHERE clauses fast, compound indexes are your friend
- **Repository pattern**: encapsulates query optimization so business logic doesn't leak

---

## DÍA 4: Full-Text Search — Finding Clinical Data Fast

### Morning: PostgreSQL Full-Text Search

**Problem**: How do you search patient names + diagnoses efficiently?

**Solution**: PostgreSQL's built-in tsvector (text search vector) creates searchable indexes.

```sql
-- Enable tsvector support
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- trigram for ILIKE

-- Add tsvector column to patients
ALTER TABLE patients ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(first_name, '') || ' ' ||
    coalesce(last_name, '') || ' ' ||
    coalesce(mrn, '')
  )
) STORED;

-- Index the tsvector for fast search
CREATE INDEX idx_patients_search_vector ON patients USING GIN (search_vector);

-- Query: find patients matching "john smith"
SELECT * FROM patients
WHERE search_vector @@ to_tsquery('english', 'john & smith')
ORDER BY ts_rank(search_vector, to_tsquery('english', 'john & smith')) DESC;
```

### EJERCICIO 4.1: Build Clinical Search

```ts
// src/repositories/search.repository.ts

// TODO: Implement clinical search:
export class SearchRepository {
  // Search patients by name + MRN with ranking
  async searchPatients(query: string) {
    return db.$queryRaw`
      SELECT
        id,
        first_name,
        last_name,
        mrn,
        ts_rank(search_vector, to_tsquery('english', ${query})) as relevance
      FROM patients
      WHERE search_vector @@ to_tsquery('english', ${query})
      ORDER BY relevance DESC
      LIMIT 50
    `;
  }

  // Search lab tests by result keywords
  async searchLabResults(patientId: string, keyword: string) {
    // Hint: cast results JSON to searchable text
  }
}
```

### EJERCICIO 4.2: Connection to Healthcare

```ts
// TODO: Why is search important in clinical software?
// Example: Clinician needs to find "all patients with diabetes"
// Current data: results JSON contains diagnosis text
// Challenge: search across JSON requires ILIKE (slow) or FTS (fast)
// Your solution: create tsvector from diagnosis field

// Implement:
// Search patients whose lab results contain "diabetes"
```

### NOTAS DE APRENDIZAJE
- FTS is 10-100x faster than ILIKE for text search
- Trigram indexes (LIKE %pattern%) use gin/gist for fuzzy matching
- Ranking ensures most relevant results come first
- Healthcare search: diagnoses, test results, notes all need FTS

---

## DÍA 5: CI/CD Pipeline — Automating Safety

### Morning: GitHub Actions Workflow

**Problem**: How do you prevent bad code from reaching production?

**Solution**: CI/CD pipeline runs tests, linting, and deployments automatically.

```yaml
# .github/workflows/ci.yml
# This file runs on every push + PR
# Purpose: Ensure code quality before production

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Test
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      # Run database migrations
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db

      # Run tests with coverage
      - run: npm run test:coverage

      # Fail if coverage < 80%
      - run: |
          COVERAGE=$(grep -oP 'lines.*?\K[\d.]+' coverage/coverage-summary.json)
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% below 80% threshold"
            exit 1
          fi

  # Job 2: Lint + Type Check
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  # Job 3: Security Check
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=moderate

  # Job 4: Deploy (only on main branch)
  deploy:
    needs: [test, lint, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          echo "Deploying to AWS..."
          # Your deployment script here
```

### Key Concepts

**CI (Continuous Integration)**:
- ✅ Tests run automatically on every commit
- ✅ Code quality gates (lint, type check)
- ✅ Coverage thresholds

**CD (Continuous Delivery)**:
- ✅ Build artifacts created
- ✅ Ready for production, but requires manual approval

**CD (Continuous Deployment)**:
- ✅ Automatic deployment to production
- ⚠️ Risky for healthcare (FDA approval required)

### EJERCICIO 5.1: Add Migration Check

```yaml
# TODO: Add a step to ci.yml that:
# 1. Checks if schema.prisma matches migrations
# 2. Fails if migrations are missing
# Hint: npx prisma migrate status
```

### EJERCICIO 5.2: Connection to Auditoría

```yaml
# TODO: Add audit logging to CI/CD
# Requirements:
# 1. Log every deployment with timestamp
# 2. Log who triggered the deployment
# 3. Store in CloudWatch (we'll do this in Week 6)
# Why? Your CI/CD pipeline IS an audit event
```

### NOTAS DE APRENDIZAJE
- CI/CD prevents broken code from reaching production
- Healthcare software requires 80%+ coverage (FDA likes tests)
- GitHub Actions runs on GitHub's servers, no cost for public repos
- Deployments are reversible: if Day 5 breaks production, Day 6 reverts

---

## DÍA 6: AWS Final Prep — Exam Review

### Topics to Review

**RDS (Relational Database Service)**
- [ ] Read replicas vs multi-AZ
- [ ] Backup strategy: automated snapshots
- [ ] Failover: RTO/RPO concepts
- [ ] Enhanced monitoring with CloudWatch

**IAM (Identity & Access Management)**
- [ ] Principle of least privilege
- [ ] Service roles for EC2 → RDS access
- [ ] Database credentials in Secrets Manager
- [ ] Policy documents (Allow/Deny)

**Secrets Manager**
- [ ] Auto-rotation of RDS passwords
- [ ] Encryption at rest (KMS)
- [ ] Audit trail of access

**CodePipeline**
- [ ] Pipeline stages: source, build, deploy
- [ ] Artifacts: passing data between stages
- [ ] Approval actions: manual gates

**CloudWatch**
- [ ] Database metrics: CPU, storage, connections
- [ ] Query logs: slow query log analysis
- [ ] Alarms: notify if metrics exceed thresholds

### Mock Exam Strategy
- [ ] Take 2 full-length practice exams
- [ ] Identify weak domains (typically IAM + DynamoDB)
- [ ] Review missed questions deeply
- [ ] Time management: 1 minute per question

### NOTAS DE APRENDIZAJE
- AWS exam is 130 questions, 130 minutes = 1 minute per question
- Passing score: ~720/1000 (57%)
- You need to pass (not get 95%)
- Focus on your weak areas, not your strong areas

---

## DÍA 7: AWS CERTIFIED DEVELOPER EXAM

### Exam Day Logistics
- **Duration**: 2 hours (strict)
- **Format**: Multiple choice + multiple select
- **Passing Score**: ~720/1000
- **Location**: Proctored center or online (your choice)
- **ID**: Government-issued photo ID required

### Pre-Exam Checklist
- [ ] Get plenty of sleep (not last-minute cramming)
- [ ] Eat a good breakfast
- [ ] Arrive 15 minutes early
- [ ] Bring water (if allowed)
- [ ] Clear workspace for online proctoring

### During Exam
- [ ] Flag difficult questions (return later)
- [ ] Don't overthink: if you're unsure, pick best answer
- [ ] Read all options (sometimes 2 seem correct)
- [ ] Don't change answers unless you're confident

### Post-Exam
- **Pass**: Congratulations! Add to LinkedIn. Your resume now says "AWS Certified Developer"
- **Fail**: Analyze weak domains. You can retake in 2 weeks. No shame; this exam is legitimately hard

---

## CONEXIÓN CON TU BACKGROUND

### Auditoría
This week IS auditing. Every section of the code tracks who did what, when, and why:
- `createdBy`: WHO created this patient record?
- `createdAt`: WHEN?
- `AuditLog`: WHAT changed from the old value to the new value?
- Your audit background makes you uniquely qualified to build defensible systems

### Biología (QBP)
- Lab tests require domain knowledge (reference ranges, specimen types)
- Your QBP background means you understand healthcare data better than most engineers
- This makes your schema design superior to someone guessing

### Sales/UX
- Fast databases = happy clinicians
- N+1 queries = slow searches = clinicians leaving your app
- This week you're ensuring your product is performant enough to sell

---

## Problemas Comunes

1. **"Migrations break production"**
   - Solution: Always test migrations in staging first
   - Use `prisma migrate dev` to test locally

2. **"N+1 queries killed my app performance"**
   - Solution: Use include/select patterns consistently
   - Monitor query count in logs

3. **"AWS exam is too hard"**
   - Solution: It's designed to be hard. 57% passing rate is normal.
   - You only need to pass, not get 95%

---

## Próxima Semana

Week 07 builds auth + payments on top of this database.
Everything you do this week is the foundation for everything ahead.

**You've got this.** 💪
