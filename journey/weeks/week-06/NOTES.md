# Week 6 Live Notes — Database & CI/CD Infrastructure

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras configuras Prisma, PostgreSQL, y GitHub Actions. No tiene que estar pulido.*

---

## Day 1 — Prisma ORM & Schema Definition

**Concepto**: Prisma mapea base de datos a tipos TypeScript. Schema = single source of truth.

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]   // Relation
  createdAt DateTime @default(now())
}

model Post {
  id    Int     @id @default(autoincrement())
  title String
  author User @relation(fields: [authorId], references: [id])
  authorId Int
}

// Generated in node_modules/@prisma/client
// Complete type safety: User, Post, Prisma...
```

**Patrón observado**: Prisma genera tipos. Cambias schema → ejecutas migration → tipos actualizan.

**Pregunta que surgió**: ¿Prisma vs SQL directo? Respuesta: Prisma para CRUD + relations. Raw SQL para queries complejas.

---

## Day 2 — Database Migrations & Versioning

**Concepto**: Migrations son cambios de schema versionados. Reversibles.

```bash
# Crear migration
npx prisma migrate dev --name add_user_role

# Genera archivo de migration
# prisma/migrations/[timestamp]_add_user_role/migration.sql

# Migration automática y segura
# Prisma:
# 1. Previene pérdida de data
# 2. Checks conflictos
# 3. Rollback automático si falla

# En producción
npx prisma migrate deploy

# Verifica migrations
npx prisma migrate status
```

**Patrón**: Migrations = git commits para database. Versionadas, auditables, reversibles.

---

## Day 3 — GitHub Actions & CI Pipeline

**Concepto**: Automatiza tests, builds, deploys con GitHub Actions.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm test
      - run: npm run build

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
```

**Patrón**: PR no se mergetea hasta CI pasee. Bloquea bugs.

---

## Day 4 — AWS Deployment Architecture

**Concepto**: Deploy a AWS para production. Escalable, confiable, monitoreado.

```typescript
// Typical AWS architecture
// Route 53 (DNS)
//   ↓
// CloudFront (CDN)
//   ↓
// ALB (Application Load Balancer)
//   ↓
// ECS (container orchestration)
//   ↓
// RDS (Managed PostgreSQL)
// S3 (File storage)
// CloudWatch (Monitoring)

// Environment variables for AWS
DATABASE_URL=postgresql://user:pass@rds-instance.aws:5432/db
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

**Patrón observado**: AWS RDS > self-managed database. Automático backups, scaling, patching.

---

## Day 5 — Monitoring, Logging, Alerting

**Concepto**: Production > development. Necesitas visibility.

```typescript
// CloudWatch logging
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const cloudwatch = new CloudWatchClient({ region: "us-east-1" });

// Log errors
console.error('[DB_ERROR]', error);
// CloudWatch picks up and alertas

// Custom metrics
await cloudwatch.send(new PutMetricDataCommand({
  Namespace: 'MyApp',
  MetricData: [
    {
      MetricName: 'UserSignups',
      Value: 42,
      Unit: 'Count'
    }
  ]
}));

// Alerts (SNS)
// If ErrorRate > 5% → alert via email
// If DbLatency > 1000ms → page on-call
```

**Patrón**: Logging (CloudWatch) + Metrics + Alerts = production readiness.

---

## Patrones descubiertos

**Pattern 1: Infrastructure as Code**
GitHub Actions + AWS CDK = reproducible infrastructure.

**Pattern 2: Blue-Green Deployment**
Run old + new version. Switch traffic when new passes health checks.

**Pattern 3: Database Replication**
Primary (writes) + Replica (reads). Read from replica, scale easily.

---

## Conexión con background

**De Auditoría**: CI/CD = automated controls. Every commit is audited. Migrations are audit trail.

**De QBP**: Infrastructure cost optimization. RDS auto-scaling = pay for what use.

**De Ventas**: 99.9% uptime = reputation + revenue protection.

---

## Notas Adicionales

- Prisma + PostgreSQL: pairing clásico, muy robusto
- CI/CD bloquea bugs temprano (cheaper)
- AWS RDS vs self-managed: RDS + 100 horas/year de ops savings

---

**Última entrada**: 2026-05-07
**Próxima sesión**: 2026-05-08
