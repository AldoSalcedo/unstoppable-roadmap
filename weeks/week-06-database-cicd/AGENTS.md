# AGENTS — Week 06 Tools & Requirements

## Week 06 Toolset

### Database Tools
- **Prisma Client**: TypeScript ORM for database queries
  - Command: `npx prisma generate` → Generate TypeScript types from schema
  - Command: `npx prisma migrate dev` → Create migrations
  - Command: `npx prisma migrate deploy` → Deploy migrations to production
  - File: `schema.prisma` → Database schema definition

- **PostgreSQL**: Open-source relational database
  - Port: 5432 (default)
  - Adapter: postgresql:// connection string
  - Testing: Docker container in CI/CD

### Testing Tools
- **Vitest**: TypeScript testing framework
  - Command: `npm run test` → Run tests
  - Command: `npm run test:coverage` → Generate coverage report
  - Requirement: >80% coverage for healthcare
  - Reporter: HTML, JSON, text formats

### Linting & Type Checking
- **ESLint**: Code style checking
  - Command: `npm run lint` → Run linter
  - File: `.eslintrc.json` → Linting rules

- **TypeScript**: Type checking
  - Command: `npm run typecheck` → Check types
  - File: `tsconfig.json` → Compiler options

- **Prettier**: Code formatting
  - Command: `npx prettier --write src/` → Format code
  - File: `.prettierrc` → Format rules

### CI/CD Tools
- **GitHub Actions**: Continuous integration
  - File: `.github/workflows/ci.yml` → Pipeline definition
  - Triggers: push, pull_request
  - Services: PostgreSQL container

### AWS Tools
- **AWS CLI**: Command-line AWS management
  - Command: `aws rds describe-db-instances` → List databases
  - Command: `aws secretsmanager get-secret-value` → Retrieve secrets
  - Requires: AWS credentials (access key + secret)

- **AWS CodePipeline**: Orchestrate build/test/deploy
  - Console: https://console.aws.amazon.com/codesuite/
  - Stages: Source → Build → Deploy

- **AWS CodeDeploy**: Deploy to EC2/on-premises
  - Agent: Installed on EC2 instances
  - Deployment groups: Target instances

- **AWS Secrets Manager**: Store database credentials
  - Console: https://console.aws.amazon.com/secretsmanager/
  - Rotation: Automatic password rotation

- **AWS CloudWatch**: Monitoring & logging
  - Metrics: Database CPU, connections, queries
  - Logs: Application logs, error logs
  - Alarms: Alert on metric thresholds

---

## Critical Milestones

### Day 1: Schema Design
**Deliverable**: `src/prisma/schema.prisma` complete
- [ ] Patient model with audit fields
- [ ] LabTest model with relationships
- [ ] User and AuditLog models
- [ ] All enums (TestType, TestStatus, Role, Action)
- [ ] Indexes on frequently-searched columns
- [ ] Comments explaining design decisions

**Verification**: `npx prisma generate` succeeds (no syntax errors)

### Day 2: Migrations
**Deliverable**: Prisma migrations created and tested
- [ ] Initial migration from schema
- [ ] Tested locally with `npx prisma migrate dev`
- [ ] Tested in CI/CD (PostgreSQL container)
- [ ] `src/migrations/README.md` with migration strategy

**Verification**: `npx prisma migrate status` shows no pending migrations

### Day 3: Query Optimization
**Deliverable**: `src/repositories/patient.repository.ts` with optimized queries
- [ ] findWithTests() using include()
- [ ] findWithCompletedTests() with filtering
- [ ] findManyWithTestCount() using select
- [ ] findWithPendingTests() using some()
- [ ] searchPatients() with case-insensitive search
- [ ] All methods have JSDoc comments

**Verification**: All methods return expected data types (TypeScript)

### Day 4: Full-Text Search
**Deliverable**: FTS implementation in repository
- [ ] tsvector column added (or raw SQL query)
- [ ] searchPatients() method optimized
- [ ] Search index created in PostgreSQL
- [ ] Ranked results by relevance

**Verification**: Query runs <500ms on 10k+ patients

### Day 5: CI/CD Pipeline
**Deliverable**: `.github/workflows/ci.yml` complete and passing
- [ ] Test job: runs vitest with coverage
- [ ] Coverage gate: fails if <80%
- [ ] Lint job: ESLint + TypeScript check
- [ ] Security job: npm audit
- [ ] Deploy job: pushes to staging (if main branch)
- [ ] All jobs pass on every commit

**Verification**: GitHub Actions workflow shows "All checks passed"

### Day 6: AWS Exam Prep
**Deliverable**: Mock exams taken, weak areas identified
- [ ] Take 2x full-length practice exams (130 questions each)
- [ ] Score >70% on both
- [ ] Identify weak domains (likely: IAM, DynamoDB)
- [ ] Watch targeted videos on weak topics
- [ ] Review all missed questions

**Verification**: Scores trending upward, confidence increasing

### Day 7: AWS EXAM DAY
**Deliverable**: AWS Certified Developer badge earned
- [ ] Score ≥720/1000 (passing)
- [ ] Add badge to LinkedIn
- [ ] Update resume with certification

**Verification**: Certification visible on AWS training console

---

## Important Notes

⚠️ **THIS WEEK HAS A REAL EXAM**

**Day 7 is not a practice exercise.** It's a proctored AWS Certified Developer exam.

- **Cost**: ~$150 USD (your responsibility)
- **Schedule**: Book exam slot now (don't wait until Day 7)
- **Location**: Proctored center or online proctoring
- **Duration**: 2 hours (130 questions, 1 minute per question)
- **Passing Score**: ~720/1000 (57% is passing rate)

### Exam Logistics
1. **Schedule now** (not Day 7 morning!)
   - Pearson VUE: https://www.pearsonvue.com/aws
   - Choose date/time that works for you

2. **Before exam**
   - Government-issued photo ID required
   - Quiet room (no interruptions)
   - Clear desk (nothing but ID)
   - Webcam + microphone (for online proctoring)

3. **During exam**
   - 130 questions in 130 minutes (1 minute each)
   - Flag difficult questions (review later)
   - Don't spend 5 minutes on one question
   - Read all options (sometimes 2 seem correct)

4. **After exam**
   - Results available immediately
   - Badge added to AWS account within 24 hours
   - Can retake if failed (wait 14 days)

---

## Healthcare-Specific Requirements

### HIPAA Compliance
This week ensures:
- ✅ **Audit trails**: Every table has createdBy, updatedAt, createdBy
- ✅ **Immutability**: AuditLog records never modified (only created)
- ✅ **Encryption**: Database credentials in AWS Secrets Manager
- ✅ **Access control**: RBAC foundation (Week 07)
- ✅ **Data retention**: Soft deletes preserve audit trail

### FDA-Style Testing Requirements
Healthcare software expects:
- ✅ **>80% test coverage**: This pipeline enforces it
- ✅ **Automated testing**: Every commit tested
- ✅ **Security scanning**: npm audit checks vulnerabilities
- ✅ **Type safety**: TypeScript prevents whole classes of bugs
- ✅ **Deployment audit trail**: Who deployed what, when

### CI/CD Must Actually Work
- ❌ Not theoretical
- ❌ Not "optional"
- ❌ Not "nice to have"
- ✅ **MUST work in production**

Your Week 07 deployments depend on this Week 06 pipeline.

---

## Key Connections to Your Background

### Auditoría (Your Audit Background)
- **Why this matters**: Audit logs are your audit trail
- **Your advantage**: You understand createdBy + oldValues + newValues = complete audit trail
- **Your responsibility**: Design the AuditLog such that compliance officers can query it

### Biología (Your QBP Background)
- **Why this matters**: Lab test results require domain knowledge
- **Your advantage**: You know what "abnormal glucose" means (non-chemists don't)
- **Your responsibility**: Design flexible results JSON to accommodate different test types

### Sales/UX (Your Sales Background)
- **Why this matters**: Database performance = user experience
- **Your advantage**: You understand that slow searches = clinicians leaving your app
- **Your responsibility**: Optimize queries such that patient search is <100ms

---

## Success Criteria for Week 06

### By End of Day 5
- [ ] Schema is complete and migrated
- [ ] CI/CD pipeline is fully automated
- [ ] All tests passing (>80% coverage)
- [ ] All linting passing (0 errors)
- [ ] Security scanning passing (0 vulnerabilities)
- [ ] Staging deployment working

### By End of Day 7
- [ ] AWS Certified Developer badge earned
- [ ] Badge visible on LinkedIn
- [ ] Resume updated

### Overall Health
- [ ] No technical debt (will pay for it later)
- [ ] Code is readable (comments explain "why", not "what")
- [ ] Tests are maintainable (fixtures don't break with schema changes)
- [ ] Documentation is complete (README, GUIA, RECURSOS)

---

## Week 06 Dependency Chart

```
Day 1: Schema
  ↓
Day 2: Migrations (depends on schema)
  ↓
Day 3: Repositories (depends on migrations)
  ↓
Day 4: Full-Text Search (depends on repositories)
  ↓
Day 5: CI/CD Pipeline (tests all of the above)
  ↓
Day 6: AWS Exam Prep (studies independently)
  ↓
Day 7: AWS EXAM (real certification)
```

**If Day 1 fails**: You can't progress to Day 2+

**If Day 5 fails**: Your CI/CD won't work, Day 6+ blocked

**If Day 6 prep insufficient**: Day 7 exam will be hard

---

## Post-Week-06 Checklist

Before moving to Week 07:
- [ ] AWS certification badge earned and verified
- [ ] GitHub Actions workflow showing "All checks passed"
- [ ] Test coverage >80% (check in codecov or vitest report)
- [ ] Schema is documented (comments on every table)
- [ ] Repository queries are optimized (no N+1)
- [ ] All 11 files created (README, sprint, GUIA, RECURSOS, AGENTS, schema, repository, migrations, ci.yml, questionaries, package.json)

---

## Resources for This Week

### Documentation
- Prisma: https://www.prisma.io/docs/
- GitHub Actions: https://docs.github.com/en/actions
- AWS Certified Developer: https://aws.amazon.com/certification/certified-developer-associate/
- HIPAA: https://www.hhs.gov/hipaa/

### Practice Exams
- AWS Skill Builder: https://skillbuilder.aws/
- Whizlabs: https://www.whizlabs.com/aws-developer-associate/
- Udemy: Search "AWS Certified Developer Associate"

### Community
- Prisma Slack: https://slack.prisma.io/
- AWS Forums: https://forums.aws.amazon.com/
- Stack Overflow: Tag "prisma", "github-actions", "postgresql"

---

## Next Week Preview

Week 07 builds on this foundation:
- Auth.js for secure sessions (depends on User model)
- RBAC (depends on Role enum)
- Stripe payments (needs secure credential storage)

**Do not skip this week.** The database you design now is the foundation for everything ahead.

You've got this. 💪
