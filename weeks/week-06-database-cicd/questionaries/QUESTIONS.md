# QUESTIONS — Week 06 Self-Assessment

## Day 1: Schema Design

### Conceptual Questions

1. **Why do we use CUID instead of auto-increment IDs?**
   - [ ] A) CUID is smaller
   - [ ] B) CUID is collision-resistant and works across distributed systems
   - [ ] C) CUID is faster
   - [ ] D) CUID is required by Prisma

2. **What is the purpose of the `createdBy` field?**
   - [ ] A) Improve database performance
   - [ ] B) Satisfy HIPAA audit requirements (who changed what)
   - [ ] C) Enable user authentication
   - [ ] D) Store timezone information

3. **Why is the MRN field unique?**
   - [ ] A) Database requirement
   - [ ] B) Prevents duplicate medical record numbers (business rule)
   - [ ] C) Improves query performance
   - [ ] D) Required by HIPAA

### Practical Exercises

4. **Extend the schema**: Add a Contact model with fields: id, patientId (FK), contactType (enum), value (phone/email), preferred (boolean). What indexes would you add?

5. **Audit fields**: Which tables in the schema are MISSING audit fields? (Hint: check User, AuditLog)

6. **Relationships**: Draw the relationship diagram:
   - Patient → LabTest (one-to-many)
   - Patient → AuditLog (one-to-many)
   - User → AuditLog (one-to-many)
   What type of relationship is this? (Hint: LabTest → AuditLog)

---

## Day 2: Migrations

### Conceptual Questions

7. **What is a migration?**
   - [ ] A) A database backup
   - [ ] B) A versioned SQL script that evolves schema
   - [ ] C) A TypeScript file
   - [ ] D) A test runner

8. **Why must migrations be reversible?**
   - [ ] A) Database best practice
   - [ ] B) HIPAA compliance (audit trail)
   - [ ] C) Enables rollback if production breaks
   - [ ] D) All of the above

9. **What does `npx prisma migrate deploy` do?**
   - [ ] A) Creates a new migration
   - [ ] B) Applies pending migrations to database
   - [ ] C) Deletes old migrations
   - [ ] D) Generates TypeScript types

### Practical Exercises

10. **Rollback scenario**: A migration added a NOT NULL column without default, breaking production. How do you rollback?
    - [ ] A) Delete the migration file
    - [ ] B) Revert the git commit
    - [ ] C) Run `npx prisma migrate resolve --rolled-back`
    - [ ] D) Drop the entire database

11. **Zero-downtime**: You need to add a new column to a table with 10M rows. What's the safest approach?
    - [ ] A) Add column with NOT NULL DEFAULT
    - [ ] B) Add nullable column, backfill in background, add constraint
    - [ ] C) Use `ALTER TABLE` directly (don't use Prisma)
    - [ ] D) Create new table, copy data, drop old table

12. **Migration naming**: You're adding a `specialty` field to User. What's a good migration name?
    - [ ] A) `add_field`
    - [ ] B) `add_specialty_to_user`
    - [ ] C) `20240220_migration`
    - [ ] D) `prisma_update`

---

## Day 3: Query Optimization

### Conceptual Questions

13. **What is the N+1 problem?**
    - [ ] A) SQL syntax error
    - [ ] B) Loading 1 entity, then loading N related entities separately (1 + N queries)
    - [ ] C) Database table has 1 column and N rows
    - [ ] D) Security vulnerability

14. **How do you solve N+1 in Prisma?**
    - [ ] A) Use raw SQL
    - [ ] B) Use `include()` to join in one query
    - [ ] C) Create multiple indexes
    - [ ] D) Split into multiple databases

15. **When should you use `select` instead of `include`?**
    - [ ] A) Never, `include` is always better
    - [ ] B) When you only need specific fields (avoid over-fetching)
    - [ ] C) For backward compatibility
    - [ ] D) To improve type safety

### Practical Exercises

16. **Optimize this query**:
    ```typescript
    const patients = await db.patient.findMany();
    const result = patients.map(p => ({
      ...p,
      testCount: db.labTest.count({ where: { patientId: p.id } })
    }));
    ```
    How many queries does this run? (Hint: 1 + N)

17. **Index strategy**: You frequently search by patientId AND status (both PENDING and COMPLETED). What index is best?
    - [ ] A) Single index on patientId
    - [ ] B) Two separate indexes: patientId, status
    - [ ] C) Compound index: (patientId, status)
    - [ ] D) No index needed

18. **Repository pattern**: Why encapsulate queries in a repository class?
    - [ ] A) It's required by Prisma
    - [ ] B) Optimize centrally, reuse queries, easier to test
    - [ ] C) Makes code shorter
    - [ ] D) All of the above

---

## Day 4: Full-Text Search

### Conceptual Questions

19. **What is better for text search: LIKE or Full-Text Search?**
    - [ ] A) LIKE (simpler)
    - [ ] B) Full-Text Search (faster, uses indexes)
    - [ ] C) They're equivalent
    - [ ] D) Depends on database

20. **What does tsvector do in PostgreSQL?**
    - [ ] A) Type vector (math)
    - [ ] B) Text search vector (converts text into searchable format)
    - [ ] C) Time vector (temporal data)
    - [ ] D) None of above

21. **Search for 'John Smith' in patient names. Which is efficient?**
    - [ ] A) `LIKE '%John%'` (scan all rows)
    - [ ] B) `search_vector @@ to_tsquery('John & Smith')` (use tsvector)
    - [ ] C) Load all patients into memory, search in code
    - [ ] D) Create full text search twice

### Practical Exercises

22. **Implement full-text search**: Create a tsvector column combining firstName + lastName + mrn. Write the SQL to generate the index.

23. **Ranking**: When you search for patients, should results be ranked by relevance? Why?
    - [ ] A) Yes, most relevant results first (better UX)
    - [ ] B) No, alphabetical order is standard
    - [ ] C) Results don't need sorting
    - [ ] D) Ranking is not possible

24. **Performance**: You have 1M patients. Search for "John" takes 5 seconds. How do you optimize?
    - [ ] A) Buy more RAM
    - [ ] B) Add full-text search index (O(log n) instead of O(n))
    - [ ] C) Shard database across servers
    - [ ] D) Use caching layer

---

## Day 5: CI/CD Pipeline

### Conceptual Questions

25. **What is CI/CD?**
    - [ ] A) Continuous Integration / Continuous Deployment
    - [ ] B) Computer Infrastructure / Cloud Database
    - [ ] C) Compiler / Compiler (Debugging)
    - [ ] D) None of above

26. **What does ">80% coverage" mean?**
    - [ ] A) 80% of computers have test coverage
    - [ ] B) 80% of code paths are tested
    - [ ] C) 80% of tests pass
    - [ ] D) 80% performance improvement

27. **When should you use manual approval in CI/CD?**
    - [ ] A) Never, automation is always better
    - [ ] B) For staging (test environment)
    - [ ] C) For production (real users)
    - [ ] D) For every commit

28. **What is the purpose of security scanning (npm audit)?**
    - [ ] A) Check code style
    - [ ] B) Find vulnerable dependencies (CVEs)
    - [ ] C) Type checking
    - [ ] D) Performance testing

### Practical Exercises

29. **Write a GitHub Actions step** that:
    - Runs `npm test`
    - Fails if coverage < 80%
    - Outputs coverage percentage

30. **CI/CD stages**: Order these stages correctly:
    - [ ] Test, Deploy, Lint, Build
    - [ ] Build, Test, Lint, Deploy
    - [ ] Lint, Build, Test, Deploy
    - [ ] Deploy, Test, Lint, Build

31. **Healthcare CI/CD**: Why do we require >80% coverage for healthcare software?
    - [ ] A) It's a nice standard
    - [ ] B) FDA/HIPAA expect rigorous testing
    - [ ] C) Bugs in clinical software can harm patients
    - [ ] D) All of above

---

## Day 6: AWS Exam Prep

### Conceptual Questions

32. **What is RDS?**
    - [ ] A) Relational Database Service (managed PostgreSQL/MySQL)
    - [ ] B) Remote Data Storage
    - [ ] C) Rapid Deployment System
    - [ ] D) Random Device Service

33. **What is IAM?**
    - [ ] A) Identity & Access Management
    - [ ] B) Integrated Architecture Management
    - [ ] C) Intelligent Alert Monitoring
    - [ ] D) Infrastructure as Code

34. **What is the principle of least privilege?**
    - [ ] A) Give everyone admin access
    - [ ] B) Give specific permissions, nothing more
    - [ ] C) Use default permissions
    - [ ] D) Disable security

35. **What is Secrets Manager?**
    - [ ] A) Password manager for individuals
    - [ ] B) AWS service for secure credential storage (database passwords, API keys)
    - [ ] C) Encryption algorithm
    - [ ] D) Backup service

### Exam Strategy Questions

36. **You have 2 hours for 130 questions. What's your pace?**
    - [ ] A) 1 minute per question (130 minutes total)
    - [ ] B) 30 seconds per question (65 minutes, review later)
    - [ ] C) 5 minutes per question (too slow)
    - [ ] D) No time limit

37. **What score do you need to pass AWS Certified Developer?**
    - [ ] A) 100% (1000/1000)
    - [ ] B) 90% (900/1000)
    - [ ] C) 72% (~720/1000)
    - [ ] D) 50% (500/1000)

38. **What should you do on exam day?**
    - [ ] A) Last-minute cramming
    - [ ] B) Get sleep, eat breakfast, arrive early
    - [ ] C) Take stimulants to stay alert
    - [ ] D) Review all 1000 AWS services

### Practical Questions

39. **Scenario**: Your RDS database needs to handle 10x more read traffic. What do you use?
    - [ ] A) Buy larger instance
    - [ ] B) Create read replicas
    - [ ] C) Switch to DynamoDB
    - [ ] D) Nothing (RDS auto-scales)

40. **Scenario**: Database credentials are hardcoded in your application. What's the risk?
    - [ ] A) No risk (it's just a database)
    - [ ] B) High risk (anyone reading code has database access)
    - [ ] C) Use Secrets Manager instead (rotate credentials automatically)
    - [ ] D) B and C

---

## Day 7: AWS Exam

(No practice questions; you'll be taking the real exam)

---

## Answer Key

### Quick Reference (Don't peek until you answer!)

1. **B** — UUIDs work across distributed systems
2. **B** — HIPAA audit requirement
3. **B** — Prevents duplicate MRNs (business rule)
4. **Practice**: Contact model with patientId FK, indexes on patientId + preferred
5. **Practice**: User is missing audit fields; AuditLog has them
6. **Practice**: One-to-many relationships; LabTest → AuditLog is one-to-many
7. **B** — Versioned SQL script
8. **D** — All of above
9. **B** — Applies pending migrations
10. **C** — `npx prisma migrate resolve --rolled-back`
11. **B** — Nullable column, backfill, add constraint (zero-downtime)
12. **B** — Descriptive migration name
13. **B** — Loading 1 + N entities separately
14. **B** — Use `include()` to join in one query
15. **B** — Avoid over-fetching unnecessary fields
16. **Practice**: 1 + N queries (1 findMany + N counts)
17. **C** — Compound index faster for common queries
18. **B** — Centralize queries, reuse, easier to test
19. **B** — Full-Text Search is faster
20. **B** — Text search vector for searching
21. **B** — tsvector with index (fast)
22. **Practice**: Create tsvector combining fields, create GIN index
23. **A** — Relevant results first (better UX)
24. **B** — Add full-text search index
25. **A** — Continuous Integration / Continuous Deployment
26. **B** — 80% of code paths are tested
27. **C** — Manual approval for production
28. **B** — Find vulnerable dependencies
29. **Practice**: Write GitHub Actions YAML for coverage check
30. **C** — Lint, Build, Test, Deploy
31. **D** — All of above (FDA/HIPAA/patient safety)
32. **A** — Relational Database Service
33. **A** — Identity & Access Management
34. **B** — Give specific permissions only
35. **B** — Secure credential storage
36. **B** — 30 seconds per question (~65 min), review later
37. **C** — ~720/1000 (~72%)
38. **B** — Sleep, breakfast, arrive early
39. **B** — Create read replicas
40. **D** — High risk + use Secrets Manager

---

## Self-Assessment Scoring

- **0-10 correct**: Review Week 06 materials thoroughly
- **11-20 correct**: Solid understanding, ready for next week
- **21-30 correct**: Excellent grasp of database concepts
- **31-40 correct**: Ready for AWS exam with confidence

---

## How to Use This Guide

1. **Day 1-2**: Answer questions as you learn
2. **Day 3-4**: Self-test before starting
3. **Day 5**: Review all questions before CI/CD implementation
4. **Day 6**: Take a full mock exam (time yourself)
5. **Day 7**: You'll be taking the REAL AWS exam

Good luck! 💪
