# AWS Certified Developer (Associate) — Study Plan

**Target Exam Date**: End of Week 7 (2026-05-20)

**Investment**: 70 hours (study + labs + practice exams)

**Strategy**: Read When Needed (RWN) — Learn each service while building it in the healthcare project, not in isolation.

---

## Exam Overview

**AWS Certified Developer Associate (DVA-C02)**
- Duration: 130 minutes
- Questions: 65 multiple choice
- Passing score: 72% (minimum)
- Cost: $150 USD

**Key domains**:
1. Deployment (22%)
2. Security (26%)
3. Development with AWS Services (30%)
4. Refactoring (10%)
5. Monitoring & Troubleshooting (12%)

---

## Study Plan by Week

### Week 5: Core Services Setup

**Learning objectives**: Understand IAM, EC2, S3, Elastic Beanstalk basics. Deploy first app.

| Day | Topic | RWN Applied To | Study Time |
|-----|-------|----------------|-----------|
| 1 | IAM fundamentals (users, roles, policies) | Create IAM user for healthcare app deployment | 90 min |
| 2 | EC2 basics (instances, security groups, AMIs) | Launch EC2 instance, SSH into it | 120 min |
| 3 | S3 (buckets, objects, permissions) | Create S3 bucket for patient file uploads | 90 min |
| 4 | Elastic Beanstalk deployment | Deploy Next.js app from Week 4 to EB | 120 min |
| 5 | CloudFront & CDN | Setup CDN for static assets (images, JS) | 90 min |
| 6 | VPC basics (subnets, gateways, routing) | Understand network setup for EB deployment | 60 min |
| 7 | Practice exam 1 | Full mock exam | 120 min |

**Week 5 total**: ~10 hours

**Key deliverables**:
- [ ] Healthcare app deployed to Elastic Beanstalk
- [ ] User files stored in S3
- [ ] Static assets served via CloudFront
- [ ] IAM roles properly configured (principle of least privilege)

---

### Week 6: Backend & Databases

**Learning objectives**: Lambda, API Gateway, DynamoDB, RDS, CloudWatch. Build serverless layer.

| Day | Topic | RWN Applied To | Study Time |
|-----|-------|----------------|-----------|
| 1 | Lambda basics (functions, triggers, permissions) | Create Lambda function for data validation | 120 min |
| 2 | API Gateway (REST APIs, CORS, authorizers) | Build REST API endpoint in front of Lambda | 120 min |
| 3 | DynamoDB (tables, items, queries, indexes) | Store non-critical data (audit logs) | 90 min |
| 4 | RDS (MySQL/PostgreSQL, snapshots, backups) | Setup main healthcare database | 120 min |
| 5 | DynamoDB vs RDS (when to use each) | Compare for your healthcare schema | 60 min |
| 6 | CloudWatch (logs, metrics, alarms) | Setup app monitoring + log aggregation | 90 min |
| 7 | Practice exam 2 | Full mock exam, review weak areas | 120 min |

**Week 6 total**: ~11 hours

**Key deliverables**:
- [ ] Serverless API (Lambda + API Gateway)
- [ ] Database layer: RDS for main data, DynamoDB for audit logs
- [ ] CloudWatch monitoring active
- [ ] Logs viewable in CloudWatch console

---

### Week 7: Deployment, Security & Polish

**Learning objectives**: CodeDeploy, CI/CD, KMS, Secrets Manager, SQS. Real production-ready setup.

| Day | Topic | RWN Applied To | Study Time |
|-----|-------|----------------|-----------|
| 1 | Deployment strategies (blue/green, canary) | Understand options for healthcare app | 90 min |
| 2 | CodeDeploy (automated deployments) | Setup automated deployment pipeline | 90 min |
| 3 | KMS & encryption (at-rest, in-transit) | Encrypt sensitive patient data | 90 min |
| 4 | Secrets Manager (API keys, DB passwords) | Securely store credentials | 90 min |
| 5 | SQS (message queues, async processing) | Queue patient notifications | 90 min |
| 6 | SNS (publish/subscribe) | Send alerts to admins | 60 min |
| 7 | FINAL EXAM PREP + Practice exam 3 | Review all domains, take final mock | 180 min |

**Week 7 total**: ~12 hours

**Key deliverables**:
- [ ] CI/CD pipeline setup (automated testing + deployment)
- [ ] Encryption enabled for patient data
- [ ] Secrets Manager active (no hardcoded passwords)
- [ ] Queue system for async tasks
- [ ] All exam domains covered

---

## Practice Exam Schedule

| Exam | Week | Format | Target Score | When to Take |
|------|------|--------|---------------|-------------|
| **Mock 1** (Tutorials Dojo) | 5 | Full, timed | 70%+ | End of Day 7 |
| **Mock 2** (A Cloud Guru) | 6 | Full, timed | 80%+ | Mid-week |
| **Mock 3** (Udemy) | 7 | Full, timed | 85%+ | 2 days before exam |
| **REAL EXAM** | 7 | Official AWS test center | 72%+ | End of week |

**Strategy**:
1. After each mock, review WRONG answers for 45 min
2. Add weak areas to daily study (30 min extra focus)
3. Before real exam: review your notes on 5 weak topics for 1 hour

---

## Weak Areas Tracker

After each practice exam, identify and track weak areas here.

| Domain | Topic | Mock 1 | Mock 2 | Mock 3 | Status |
|--------|-------|--------|--------|--------|--------|
| Deployment | CodeDeploy strategies | ? | ? | ? | — |
| Security | IAM policy syntax | ? | ? | ? | — |
| Services | DynamoDB queries | ? | ? | ? | — |
| Refactoring | Lambda optimization | ? | ? | ? | — |
| Monitoring | CloudWatch alarms | ? | ? | ? | — |

---

## Applied Learning Map

This table shows WHERE each service is applied in your healthcare project.

| AWS Service | What You Learn | Project Applied To | Code File |
|-------------|----------------|-------------------|-----------|
| **IAM** | Users, roles, policies, MFA | Deployment permissions | `.github/workflows/deploy.yml` |
| **EC2** | Instances, AMIs, security groups | App server (if using traditional) | `terraform/ec2.tf` |
| **S3** | Buckets, objects, versioning, lifecycle | Patient file storage | `src/services/s3-upload.ts` |
| **Elastic Beanstalk** | Deploy, monitor, scale web apps | Main app deployment | `.ebextensions/` |
| **Lambda** | Serverless functions, triggers | Data validation, notifications | `src/lambda/validate.ts` |
| **API Gateway** | REST/HTTP APIs, CORS, auth | Backend API | `serverless.yml` (Serverless framework) |
| **DynamoDB** | NoSQL, queries, indexes | Audit logs, cache | `src/services/dynamodb.ts` |
| **RDS** | SQL databases, backups, failover | Patient records (production DB) | `src/models/patient.ts` |
| **CloudWatch** | Logs, metrics, alarms, dashboards | App monitoring | `monitoring/dashboard.json` |
| **CloudFront** | CDN, caching, edge locations | Static assets + API acceleration | `terraform/cloudfront.tf` |
| **KMS** | Encryption keys, rotation | Data encryption | `src/services/encryption.ts` |
| **Secrets Manager** | Secret storage, rotation | API keys, DB passwords | `.env.production` (via Lambda) |
| **SQS** | Message queues, FIFO | Async notifications | `src/services/queue.ts` |

---

## Study Resources

### Official AWS
- **AWS Certified Developer Study Guide** (free PDF): https://aws.amazon.com/training/
- **AWS Documentation** (free): https://docs.aws.amazon.com/
- **AWS Free Tier**: For hands-on labs (EC2, Lambda, etc. are free for 12 months)
- **AWS Skill Builder**: Free developer courses (included with AWS account)

### Online Courses
- **A Cloud Guru** (recommended): $25-30/month, video + labs + practice exams
- **Udemy Developer Course**: $15-20 (search "AWS Developer DVA-C02")
- **Linux Academy**: Alternative to ACG

### Practice Exams
- **Tutorials Dojo**: $9/practice exam × 3 = $27 (high quality, similar to real)
- **AWS Practice Exam**: Free via AWS Skill Builder
- **Udemy bundle exams**: Often included with course

### Hands-on Labs
- **A Cloud Guru labs**: Step-by-step (recommended)
- **AWS Skill Builder labs**: Official, free with account
- **Pluralsight labs**: Alternative
- **Your own project**: Build healthcare app (BEST learning)

---

## Daily Study Routine (Weeks 5-7)

**Recommended schedule** (to hit 10-12 hours/week):

| Session | Duration | What |
|---------|----------|------|
| Morning (30 min) | 30 min | Watch 1 AWS service video |
| Mid-day (90 min) | 90 min | Hands-on lab (build/deploy the service) |
| Evening (30 min) | 30 min | Read AWS docs + take notes |
| Weekend (4-6 hours) | Flexible | Practice exam OR deep dive on weak area |

**Total**: ~5-6 hours weekdays + 4-6 hours weekend = 9-12 hours/week

---

## Exam Day Checklist

1. **Week 7, 3 days before**: Final mock exam (full timed, no interruptions)
2. **Week 7, 1 day before**: Review 5 weak topics for 1 hour each
3. **Day of exam**:
   - Get 7-8 hours sleep night before
   - Eat good breakfast
   - Arrive 15 min early to exam center
   - Skip the tutorial (you know it)
   - Read each question carefully (35 questions × 130 min = 3.7 min/question)
   - Flag difficult questions, come back at end
   - Submit with 5 min left

---

## Success Metrics

| Milestone | Target | Status |
|-----------|--------|--------|
| Mock exam 1 score | 70%+ | — |
| Mock exam 2 score | 80%+ | — |
| Mock exam 3 score | 85%+ | — |
| Real exam score | 72%+ (passing) | — |
| **PASS EXAM** | End Week 7 | — |

---

**Last updated**: 2026-04-02
**Next update**: End of Week 5
