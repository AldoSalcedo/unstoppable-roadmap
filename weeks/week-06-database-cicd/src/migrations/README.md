# Migrations Guide — Understanding Prisma Migrations

## What Are Migrations?

A migration is a versioned SQL script that evolves your database schema over time.

```
Version 1:           Version 2:          Version 3:
┌─────────────┐      ┌─────────────┐     ┌──────────────┐
│ patients    │      │ patients    │     │ patients     │
│ ├─ id       │  →   │ ├─ id       │  →  │ ├─ id        │
│ ├─ firstName│      │ ├─ firstName│     │ ├─ firstName │
│ └─ lastName │      │ ├─ lastName │     │ ├─ lastName  │
│             │      │ ├─ mrn      │     │ ├─ mrn       │
│             │      │ └─ createdAt│     │ ├─ createdAt │
│             │      │             │     │ ├─ createdBy │
│             │      │             │     │ └─ specialty │
└─────────────┘      └─────────────┘     └──────────────┘

Migration 1:         Migration 2:        Migration 3:
"001_init"          "002_add_mrn"       "003_add_audit"
```

## Why Migrations Matter

### For Development
```
schema.prisma (your source of truth)
        ↓
npx prisma migrate dev
        ↓
generates SQL migration
        ↓
applies to local database
        ↓
TypeScript types regenerated
```

### For Production
```
CI/CD triggered (push to main)
        ↓
builds application
        ↓
runs: npx prisma migrate deploy
        ↓
applies pending migrations
        ↓
database schema updated
        ↓
application uses new schema
```

### For Compliance (Your Auditing Background)
Every migration is a **timestamped audit event**.

```
prisma/migrations/
├── 20240101_001_init/
│   ├── migration.sql
│   └── timestamp: 2024-01-01 09:00:00
├── 20240115_002_add_mrn/
│   ├── migration.sql
│   └── timestamp: 2024-01-15 14:30:00
└── 20240220_003_add_audit_fields/
    ├── migration.sql
    └── timestamp: 2024-02-20 11:45:00
```

**Question**: "When was the createdBy field added?"
**Answer**: February 20, 2024, 11:45 AM (from migration filename)

---

## Migration Workflow

### Step 1: Modify Schema

Edit `schema.prisma`:
```prisma
model Patient {
  id String @id @default(cuid())
  firstName String
  lastName String
  specialty String  // NEW FIELD
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String

  @@map("patients")
}
```

### Step 2: Create Migration

```bash
npx prisma migrate dev --name add_specialty_field
```

Prisma generates:
```
prisma/migrations/20240220_add_specialty_field/
├── migration.sql
└── .prisma-migrations

# migration.sql contains:
ALTER TABLE "patients" ADD COLUMN "specialty" TEXT;
```

### Step 3: Review Migration

```bash
cat prisma/migrations/20240220_add_specialty_field/migration.sql
```

Verify:
- [ ] Syntax is correct (review SQL)
- [ ] Change is what you expected
- [ ] No data loss (adding nullable column is safe)

### Step 4: Apply to Database

```bash
npx prisma migrate dev
```

Prisma:
1. Applies migration to local database
2. Regenerates Prisma Client types
3. Updates `prisma/migrations/.prsm-migrations` (lock file)

### Step 5: Commit to Git

```bash
git add prisma/migrations/
git commit -m "feat: add specialty field to User"
```

---

## Safe Migration Patterns

### Pattern 1: Adding Columns (Safe)

```prisma
// Before
model User {
  id String @id
  email String
}

// After (adding nullable column)
model User {
  id String @id
  email String
  specialty String?  // Nullable = safe
}
```

Generated migration:
```sql
ALTER TABLE "users" ADD COLUMN "specialty" TEXT;
```

**Why safe?**
- Existing rows get NULL for new column
- No data loss
- Non-blocking (doesn't lock table for long)

### Pattern 2: Making Columns Nullable (Safe)

```prisma
// Before
model Patient {
  dateOfBirth DateTime  // Required
}

// After
model Patient {
  dateOfBirth DateTime?  // Nullable
}
```

Generated migration:
```sql
ALTER TABLE "patients" ALTER COLUMN "date_of_birth" DROP NOT NULL;
```

**Why safe?**
- Relaxes constraint
- Existing data unaffected
- Non-blocking

### Pattern 3: Removing Columns (Risky!)

```prisma
// Before
model Patient {
  id String @id
  firstName String
  legacyField String  // Unused, want to remove
}

// After
model Patient {
  id String @id
  firstName String
}
```

Generated migration:
```sql
ALTER TABLE "patients" DROP COLUMN "legacy_field";
```

**Why risky?**
- Data is permanently lost
- Can't be undone (unless you have backups)
- Should use soft-delete (add deletedAt) instead

**Safer approach**: Soft-delete pattern

```prisma
// Before
model Patient {
  id String @id
  firstName String
  legacyField String
}

// After: mark as deleted, don't remove
model Patient {
  id String @id
  firstName String
  deletedAt DateTime?  // NULL = active, set = deleted
}
```

Migration:
```sql
ALTER TABLE "patients" ADD COLUMN "deleted_at" TIMESTAMP;
-- Legacy column can be removed in future migration after verification
```

### Pattern 4: Renaming Columns (Tricky)

```prisma
// Before
model Patient {
  dateOfBirth DateTime
}

// After
model Patient {
  dob DateTime
}
```

**Problem**: Prisma can't automatically detect rename (looks like delete + add).

**Solution**: Custom migration

```bash
npx prisma migrate dev --name rename_dob
# Opens editor for manual SQL entry
```

Enter:
```sql
ALTER TABLE "patients" RENAME COLUMN "date_of_birth" TO "dob";
```

---

## Handling Migration Conflicts

### Scenario: Two developers add different columns

**Developer A**:
```prisma
model Patient {
  specialty String?
}
```
Migration: `001_add_specialty`

**Developer B**:
```prisma
model Patient {
  phone String?
}
```
Migration: `002_add_phone`

**When merging**:
- [ ] Both migrations should exist in `prisma/migrations/`
- [ ] Git merge might create conflict in migration folders
- [ ] Resolve: keep both migrations, run `npx prisma migrate dev`

Prisma applies both migrations:
```sql
ALTER TABLE "patients" ADD COLUMN "specialty" TEXT;
ALTER TABLE "patients" ADD COLUMN "phone" TEXT;
```

---

## Rollback Strategies

### Local Rollback (Development)

```bash
# If migration was just created (not pushed)
# Delete the migration folder
rm -rf prisma/migrations/20240220_add_specialty_field/

# Then
npx prisma migrate resolve --rolled-back 20240220_add_specialty_field
```

### Production Rollback (After Deploy)

**Scenario**: Migration breaks production database

```bash
# Check migration status
npx prisma migrate status

# Rollback (creates reverse migration)
npx prisma migrate resolve --rolled-back 20240220_migration_name

# This generates a new migration that undoes the change
npx prisma migrate deploy  # Apply reverse migration
```

**Better approach**: Zero-downtime rollback

```bash
# If migration is not yet applied to production:
git revert <commit-hash>  # Revert commit
npx prisma migrate deploy  # Won't apply the reverted migration
```

---

## Zero-Downtime Migrations (Large Tables)

### Problem

```sql
-- ❌ This locks the table for minutes (bad for production)
ALTER TABLE "lab_tests" ADD COLUMN "priority" INT DEFAULT 0;
```

If table has 10M rows:
- Migration locks table
- All queries blocked
- Clinic software stops working
- Patients turn away

### Solution: Multi-Step Migration

**Step 1**: Add column with default (fast, non-blocking)

```bash
# schema.prisma
model LabTest {
  priority Int @default(0)
}

npx prisma migrate dev --name add_priority_column
```

Generates:
```sql
ALTER TABLE "lab_tests" ADD COLUMN "priority" INTEGER DEFAULT 0;
```

**Step 2**: Backfill data (doesn't lock, happens in background)

```sql
-- In separate transaction (doesn't lock entire table)
UPDATE lab_tests SET priority = 1 WHERE status = 'PENDING';
UPDATE lab_tests SET priority = 2 WHERE status = 'COMPLETED';
-- (done in batches via application code)
```

**Step 3**: Add constraints/indexes (once backfill complete)

```sql
ALTER TABLE "lab_tests" ADD CONSTRAINT check_priority CHECK (priority >= 1 AND priority <= 3);
CREATE INDEX idx_lab_tests_priority ON lab_tests(priority);
```

---

## Migration Best Practices

### Do's ✅

- [ ] Create descriptive migration names: `add_specialty_to_user`, not `fix`
- [ ] Test migrations locally first
- [ ] Review generated SQL before applying
- [ ] Keep migrations small (one logical change per migration)
- [ ] Commit migration files to git
- [ ] Document complex migrations with comments

### Don'ts ❌

- [ ] Don't manually edit `migration.sql` (let Prisma generate it)
- [ ] Don't skip migrations in production
- [ ] Don't merge branches with conflicting migrations
- [ ] Don't delete migration files (breaks history)
- [ ] Don't apply migrations outside of CI/CD (lose audit trail)

---

## Migration Examples

### Example 1: Add Audit Fields (Mandatory)

```bash
# 1. Edit schema
# Add to every model:
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
createdBy String

# 2. Create migration
npx prisma migrate dev --name add_audit_fields

# 3. Generated SQL (Prisma creates for each table)
ALTER TABLE "patients" ADD COLUMN "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "patients" ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "patients" ADD COLUMN "created_by" TEXT;

# 4. Deploy
npx prisma migrate deploy
```

### Example 2: Add Indexes (Performance)

```bash
# 1. Edit schema
model Patient {
  id String @id
  mrn String @unique

  @@index([createdAt])  // NEW
  @@index([lastName])   // NEW
}

# 2. Create migration
npx prisma migrate dev --name add_patient_indexes

# 3. Generated SQL
CREATE INDEX "patients_created_at_idx" ON "patients"("created_at");
CREATE INDEX "patients_last_name_idx" ON "patients"("last_name");

# 4. Deploy
npx prisma migrate deploy
```

### Example 3: Add Relationship (Foreign Key)

```bash
# 1. Edit schema
model LabTest {
  id String @id
  patientId String  // NEW
  patient Patient @relation(fields: [patientId], references: [id])
}

# 2. Create migration
npx prisma migrate dev --name add_labtest_patient_relation

# 3. Generated SQL
ALTER TABLE "lab_tests" ADD COLUMN "patient_id" TEXT;
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id");

# 4. Deploy
npx prisma migrate deploy
```

---

## Troubleshooting

### Issue: "Prisma can't detect the change"

```bash
# After editing schema.prisma
npx prisma migrate dev --name my_migration
# Error: "Migrations detected, but database schema is not in sync"

# Solution: Check what Prisma sees
npx prisma migrate status

# If database is ahead of migrations:
npx prisma migrate resolve --rolled-back <migration_name>
```

### Issue: Migration failed in production

```bash
# Check status
npx prisma migrate status

# If migration succeeded but application crashed:
# (just restart application, it will retry migration on startup)

# If migration failed:
npx prisma migrate resolve --rolled-back <migration_name>
# (removes from pending, requires manual schema fix)
```

### Issue: Can't apply migration (constraint violation)

```sql
-- Error: "UNIQUE constraint failed"
-- (new UNIQUE column has duplicate values in existing rows)

-- Solution: Add constraint with WHERE clause (for existing rows)
ALTER TABLE "patients" ADD UNIQUE (mrn) WHERE deleted_at IS NULL;
-- (only enforce unique for non-deleted rows)
```

---

## NOTAS DE APRENDIZAJE

1. **Migrations are your source of truth for production schema**
   - Database schema = migrations (not schema.prisma)
   - schema.prisma is documentation + development tool

2. **Migrations must be reversible**
   - Every migration can be rolled back
   - Soft deletes > hard deletes

3. **Migrations are audit events**
   - Timestamp = when change was deployed
   - Git history = why change was made

4. **Test migrations locally**
   - Run `npx prisma migrate dev` before pushing
   - Check generated SQL is correct

5. **Migrations in CI/CD must work**
   - Run `npx prisma migrate deploy` in CI pipeline
   - Fails if schema doesn't match pending migrations
   - This prevents "forgot to commit migration" bugs

---

## CONEXIÓN CON TU BACKGROUND

### Auditoría
Migrations ARE your audit trail.
- `001_init` (when created)
- `002_add_mrn` (when MRN field added)
- `003_add_audit_fields` (when audit tracking began)

Each timestamp answers: "When did this change happen?"

### Biología (QBP)
Lab test schema evolves as you learn new test types.
- First migration: BLOOD, IMAGING, PATHOLOGY
- Later migration: Add GENETIC_TESTING, PATHOGEN_TEST
- Schema evolution = domain knowledge evolution

### Sales/UX
Zero-downtime migrations = uninterrupted clinic operations.
- Bad migration = 30-second downtime = patients lose trust
- Good migration = invisible (they don't notice)
- Your migration strategy = customer satisfaction

---

## Next Steps

- [ ] Create initial migration from schema.prisma
- [ ] Test locally with `npx prisma migrate dev`
- [ ] Test in CI/CD with `npx prisma migrate deploy`
- [ ] Document any custom migrations
- [ ] Commit migration folder to git

You've got this!
