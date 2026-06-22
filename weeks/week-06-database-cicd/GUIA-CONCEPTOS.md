# GUÍA DE CONCEPTOS — Week 06 Database + CI/CD + AWS

## Conceptos Fundamentales

### Database Concepts

#### Schema Design
**El problema**: How do you structure data such that queries are fast, data is consistent, and audit trails are complete?

**Solución**: Normalized relational schema with indexes and audit fields.

```
┌──────────────────────────────────────────────────┐
│ SCHEMA DESIGN PRINCIPLES                         │
│                                                  │
│ 1. Normalize: Avoid data duplication             │
│    ❌ Patient.bloodType + Patient.testResults    │
│    ✅ Patient → LabTest (separate tables)        │
│                                                  │
│ 2. Index: Speed up WHERE clauses                 │
│    ❌ SELECT * FROM patients WHERE mrn = 'X'     │
│       (scans all rows: O(n) = slow)              │
│    ✅ CREATE INDEX on mrn                        │
│       (uses B-tree: O(log n) = fast)             │
│                                                  │
│ 3. Audit: Track WHO changed WHAT WHEN            │
│    ❌ No createdBy, updatedAt fields             │
│    ✅ Every table: createdAt, updatedAt, createdBy│
│                                                  │
│ 4. Constraints: Prevent invalid data             │
│    ❌ testType can be anything                   │
│    ✅ testType ∈ {BLOOD, IMAGING, PATHOLOGY}   │
└──────────────────────────────────────────────────┘
```

#### N+1 Problem
**El problema**: Loading 1 patient + then loading N tests separately.

```typescript
// ❌ N+1 PROBLEM
const patient = await db.patient.findUnique({ where: { id } });
const tests = await db.labTest.findMany({ where: { patientId: id } });
// Result: 2 queries. Scale to 100 patients = 100 + 100 = 200 queries!

// ✅ SOLUTION: Use include() to JOIN in one query
const patient = await db.patient.findUnique({
  where: { id },
  include: { labTests: true } // Single query with JOIN
});
// Result: 1 query. Scale to 100 patients = 100 queries total!
```

#### Indexes
**El problema**: Queries without indexes scan all rows (O(n) = slow).

```sql
-- ❌ Without index: scan 1,000,000 rows
SELECT * FROM patients WHERE mrn = '12345';
-- Time: 5 seconds

-- ✅ With index: use B-tree (O(log n) = fast)
CREATE INDEX idx_patients_mrn ON patients(mrn);
SELECT * FROM patients WHERE mrn = '12345';
-- Time: <1ms

-- ✅ Compound index: faster for common queries
CREATE INDEX idx_lab_tests_patient_status ON lab_tests(patientId, status);
-- Covers: "find PENDING tests for patient X"
```

#### Connection Pooling
**El problema**: Each request opens a new database connection (expensive).

```
┌─────────────────────────────────────────────────┐
│ CONNECTION POOLING                              │
│                                                 │
│ Without pooling:                                │
│ Request 1: Open connection → Query → Close      │
│ Request 2: Open connection → Query → Close      │
│ (Opening/closing = network overhead)            │
│                                                 │
│ With pooling (PgBouncer):                      │
│ Pool: [conn1, conn2, conn3, ..., conn20]       │
│ Request 1: Get conn1 → Query → Return to pool  │
│ Request 2: Get conn2 → Query → Return to pool  │
│ (No open/close overhead, reuse connections)    │
└─────────────────────────────────────────────────┘
```

### CI/CD Concepts

#### CI vs CD
**CI (Continuous Integration)**: Automated tests on every commit
- ✅ Tests run automatically
- ✅ Lint checks code style
- ✅ Coverage gates ensure quality
- ❌ Code isn't deployed yet

**CD (Continuous Delivery)**: Build ready for deployment (manual approval)
- ✅ Build artifacts created
- ✅ Ready for production
- ⚠️ Requires manual approval before deploy

**CD (Continuous Deployment)**: Automatic deployment (risky)
- ✅ Automatic deployment to production
- ❌ Risky for healthcare (FDA approval required)

#### GitHub Actions Anatomy
```yaml
name: CI Pipeline        # Workflow name

on:
  push:
    branches: [main]     # Trigger: when pushing to main

jobs:
  test:                  # Job name
    runs-on: ubuntu-latest  # Where this runs

    steps:               # Individual commands
      - run: npm test    # Step: run test command
```

**Key Concepts**:
- **Trigger**: When does workflow run? (push, PR, schedule, etc.)
- **Job**: Unit of work (test, lint, deploy)
- **Step**: Individual command (npm test, npm run lint)
- **Artifact**: Output (coverage reports, build files)

#### Healthcare-Specific CI/CD
For healthcare software:
- [ ] Test coverage >80% (FDA requirement)
- [ ] Security scanning (npm audit)
- [ ] HIPAA compliance check (no hardcoded secrets)
- [ ] Manual approval for production (not automatic)
- [ ] Audit trail of deployments (who, when, what changed)

### AWS Concepts (Exam Focus)

#### RDS (Relational Database Service)
**What**: Managed PostgreSQL/MySQL in AWS

**Use Cases**:
- ✅ Healthcare: HIPAA-compliant managed database
- ✅ Backups: Automatic daily snapshots
- ✅ Failover: Multi-AZ for high availability
- ✅ Monitoring: CloudWatch metrics built-in

**Key Metrics**:
- RTO (Recovery Time Objective): How fast can we restore after failure? (goal: <5 minutes)
- RPO (Recovery Point Objective): How much data can we lose? (goal: <5 minutes)
- Read replicas: Scale read capacity (replicate to another region)

#### IAM (Identity & Access Management)
**What**: AWS service for permissions and access control

**Principle of Least Privilege**:
```
┌─────────────────────────────────────────────────┐
│ LEAST PRIVILEGE PRINCIPLE                       │
│                                                 │
│ ❌ BadPolicy:                                   │
│ {                                               │
│   "Effect": "Allow",                            │
│   "Action": "*",                                │
│   "Resource": "*"                               │
│ }                                               │
│ (Allows EVERYTHING! Huge security risk)         │
│                                                 │
│ ✅ GoodPolicy:                                  │
│ {                                               │
│   "Effect": "Allow",                            │
│   "Action": ["rds:DescribeDBInstances"],       │
│   "Resource": "arn:aws:rds:*:*:db/mydb"        │
│ }                                               │
│ (Allows ONLY specific action on specific DB)   │
└─────────────────────────────────────────────────┘
```

#### Secrets Manager
**What**: Secure storage for database passwords, API keys, etc.

**Features**:
- Encryption at rest (KMS)
- Automatic rotation (change password without downtime)
- Audit trail (who accessed secret, when)
- No secrets in code (safer)

**Example**:
```typescript
// ❌ Bad: Secret in code
const dbUrl = "postgresql://admin:password@db.example.com";

// ✅ Good: Secret in AWS Secrets Manager
const secretValue = await secretsManager.getSecretValue("db-url");
const dbUrl = secretValue.SecretString; // Retrieved at runtime
```

#### CodePipeline
**What**: Orchestrates build, test, and deployment stages

```
Source → Build → Test → Approval → Deploy
  ↓        ↓       ↓        ↓        ↓
GitHub  CodeBuild Vitest  Manual   CodeDeploy
Commit  compile           approval   to EC2/ECS
```

#### CloudWatch
**What**: AWS monitoring and logging service

**Use Cases**:
- Database metrics: CPU, storage, connections
- Query logs: Slow query log analysis
- Alarms: Alert if metrics exceed threshold
- Audit logs: Track API calls, deployments

**Example Metrics**:
- DatabaseConnections: Current active connections
- CPUUtilization: Database CPU usage (should be <80%)
- ReadLatency: How long reads take (should be <5ms)

---

## Deep Dives

### Prisma Migrations Strategy

**Safe Migration Workflow**:
```
1. Development:
   - Edit schema.prisma
   - Run: npx prisma migrate dev --name add_field
   - Review generated SQL
   - Test locally

2. Staging:
   - Push to GitHub
   - CI/CD runs migrations automatically
   - Test on staging database

3. Production:
   - Manual approval
   - Run: npx prisma migrate deploy
   - Verify: npx prisma migrate status
   - Rollback if needed: npx prisma migrate resolve --rolled-back
```

### Full-Text Search Implementation

**PostgreSQL FTS vs LIKE**:
```
LIKE Pattern (Slow):
  SELECT * FROM patients
  WHERE first_name LIKE '%John%'
  -- Scans all rows: O(n) = slow

Full-Text Search (Fast):
  SELECT * FROM patients
  WHERE search_vector @@ to_tsquery('english', 'John')
  -- Uses tsvector index: O(log n) = fast

Trigram Search (Medium):
  CREATE INDEX idx_name_trigram ON patients USING GIN (first_name gin_trgm_ops);
  SELECT * FROM patients
  WHERE first_name % 'John'  -- SIMILAR TO operator
```

### HIPAA Compliance Checklist

- [ ] **Authentication**: Only authorized users can access
- [ ] **Encryption**: Data encrypted in transit (HTTPS) and at rest (database)
- [ ] **Audit Logs**: Every access logged (who, what, when)
- [ ] **Data Retention**: Delete old data according to policy
- [ ] **Access Control**: RBAC prevents unauthorized access
- [ ] **Backup & Recovery**: Daily backups, tested recovery
- [ ] **Penetration Testing**: Annual security audit

---

## AWS Exam Topics (Day 6 Focus)

### Services Likely on Exam

1. **RDS**: Database management, failover, read replicas, backups
2. **IAM**: Policies, roles, principle of least privilege
3. **Secrets Manager**: Credential rotation, encryption
4. **CodePipeline**: Build, test, deploy stages
5. **CodeDeploy**: Deploy to EC2, on-premises, Lambda
6. **CloudWatch**: Monitoring, alarms, logs
7. **Lambda**: Serverless compute (increasingly important)
8. **DynamoDB**: NoSQL database (likely on exam)
9. **S3**: Object storage, bucket policies
10. **VPC**: Virtual network, security groups, subnets

### Exam Question Pattern

**Question Type**: Scenario-based

"Your healthcare application stores patient records in RDS. You need to ensure:
- Read replicas can handle increased query load
- Data is encrypted at rest
- Database credentials are rotated quarterly
- All access is audited

Which combination of services solves this?"

**Answer Strategy**:
1. Identify the requirement (read capacity, encryption, rotation, audit)
2. Match to AWS service
3. Eliminate wrong answers

---

## Problemas Comunes en Week 06

### Problem 1: Migrations Fail in CI/CD
**Cause**: schema.prisma doesn't match migrations directory

**Fix**:
```bash
# Check migration status
npx prisma migrate status

# If it says "pending", run:
npx prisma migrate dev

# Add migration file to git
git add prisma/migrations/
git commit -m "chore: add migration"
```

### Problem 2: Tests Timeout (Database Connection)
**Cause**: PostgreSQL container not starting in time

**Fix**:
```yaml
# In ci.yml, increase container startup timeout
services:
  postgres:
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 10  # Increase retries
```

### Problem 3: Coverage Report Not Found
**Cause**: Vitest not writing coverage to expected directory

**Fix**:
```bash
# Ensure vitest config includes coverage
# vitest.config.ts:
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage'
    }
  }
});
```

### Problem 4: AWS Exam Too Hard
**Reality**: 57% pass rate on AWS Developer exam is normal.

**Strategy**:
- You only need ~720/1000 points (72%)
- Focus on weak areas (typically: IAM, DynamoDB, Lambda)
- Don't memorize everything; understand concepts
- Practice exams are your best resource

---

## Próxima Semana (Week 07)

This database is the foundation for:
- **Authentication**: Users logging in
- **RBAC**: Determining who can see what data
- **Payments**: Stripe subscriptions
- **Webhooks**: Handling events reliably

Build it right this week, and Week 07 is easy.
