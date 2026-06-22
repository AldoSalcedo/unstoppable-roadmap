# AWS Developer Resources — Curated Study Materials

**Goal**: 70 hours of focused learning to pass AWS Certified Developer (DVA-C02) by end of Week 7.

---

## Official AWS Resources (FREE)

### 1. AWS Skill Builder
**URL**: https://skillbuilder.aws/
**What**: Official AWS training platform with videos, labs, and certifications
**Cost**: FREE (with AWS account) or $300/year for unlimited
**Best for**: Official, up-to-date content
**Content**:
- ~20 videos on developer topics
- ~15 hands-on labs (free tier eligible)
- Practice exam (free)
**Time commitment**: 15-20 hours
**When to use**: Weeks 5-7, alongside courses below

---

### 2. AWS Documentation
**URL**: https://docs.aws.amazon.com/
**What**: Official service documentation
**Cost**: FREE
**Best for**: Deep dives, reference during labs
**Key sections**:
- IAM User Guide
- EC2 User Guide
- S3 Developer Guide
- Lambda Developer Guide
- API Gateway Developer Guide
- DynamoDB Developer Guide
**Time commitment**: 10 hours (referenced, not linear)
**When to use**: During hands-on labs, to understand details

---

### 3. AWS Free Tier
**URL**: https://aws.amazon.com/free/
**What**: 12 months free AWS services (EC2, Lambda, S3, RDS, etc.)
**Cost**: FREE
**Best for**: Hands-on labs without cost concerns
**Included services** (for 12 months):
- EC2: 750 hours/month
- S3: 5 GB storage
- Lambda: 1 million free requests/month
- RDS: 750 hours/month (t2.micro)
- CloudWatch: Free logs (5 GB ingested)
**Time commitment**: Use throughout Weeks 5-7
**When to use**: Deploy your healthcare app here!

---

## Video Courses (RECOMMENDED)

### 4. A Cloud Guru AWS Developer Course
**URL**: https://acloudguru.com/
**What**: Video course + hands-on labs + practice exams
**Cost**: $25-30/month (or ~$300/year)
**Instructor quality**: ⭐⭐⭐⭐⭐ (Highly recommended)
**Content coverage**: All exam domains (deployment, security, services, monitoring)
**Best for**: Structured learning + labs + confidence building
**Labs included**: 30+ hands-on labs (EC2, Lambda, RDS, etc.)
**Practice exams**: 3 full-length mocks
**Time commitment**: 15-20 hours video + 10 hours labs
**When to use**: Main course, Week 5-7
**Why pick this**: Best instructor quality, labs included, practice exams included

### 5. Udemy AWS Developer Course
**URL**: https://udemy.com/ (search "AWS Developer Associate DVA-C02")
**What**: Video course + practice exams
**Cost**: $15-20 (often on sale)
**Instructor quality**: ⭐⭐⭐⭐ (varies by instructor)
**Recommended instructors**:
- Jon Bonso (Tutorials Dojo author)
- Stephane Maarek (very popular)
- Neal Davis (detailed)
**Content**: 20-30 hours video
**Practice exams**: 3-6 included (depending on course)
**Best for**: Budget-friendly, specific weak areas
**When to use**: Supplement to A Cloud Guru or standalone if budget-limited

---

## Practice Exams (CRITICAL)

### 6. Tutorials Dojo Practice Exams
**URL**: https://tutorialsdojo.com/aws-certified-developer-associate-dva-c02/
**What**: High-quality practice exams (closest to real exam format)
**Cost**: $9 per exam × 3 = $27 (very cheap!)
**Quality**: ⭐⭐⭐⭐⭐ (Mock exams are very similar to real)
**Content**: 65 questions each, timed, with detailed explanations
**Best for**: Final confidence check
**Difficulty**: Matches or exceeds real exam difficulty
**When to use**: Week 6 (exam 1), Week 6 mid-week (exam 2), Week 7 (exam 3)
**Why pick this**: Most exam-representative, best value

### 7. AWS Official Practice Exam
**URL**: https://aws.amazon.com/certification/practices/
**What**: Official AWS practice exam
**Cost**: FREE (with AWS Skill Builder)
**Quality**: ⭐⭐⭐⭐ (Official but shorter format)
**Content**: ~40 questions, no time limit
**Best for**: Early confidence check (Week 5)
**When to use**: Week 5, before paid exams

---

## Hands-On Labs (ESSENTIAL)

### 8. A Cloud Guru Labs (INCLUDED with ACG subscription)
**Content**: 30+ structured labs covering all services
**Examples**:
- "Deploy EC2 instance and SSH into it"
- "Create RDS database and connect via CLI"
- "Build Lambda function triggered by S3"
- "Setup API Gateway REST API"
**Time per lab**: 30-60 min
**When to use**: During Week 5-7, after watching each video

### 9. AWS Skill Builder Labs (FREE with account)
**Content**: ~15 official labs
**Examples**:
- "Create and manage IAM users"
- "Launch RDS instance"
- "Build serverless API with Lambda + API Gateway"
**Time per lab**: 30-45 min
**When to use**: Weeks 5-7, to replace paid labs if budget-limited

### 10. Your Healthcare Project
**What**: Apply each service to your real project
**Cost**: FREE (time only)
**Best for**: Real-world application, portfolio building
**Examples**:
- Deploy Next.js app to Elastic Beanstalk (Week 5)
- Store files in S3 (Week 5)
- Build Lambda API (Week 6)
- Setup RDS database (Week 6)
- Add monitoring with CloudWatch (Week 6)
**Time commitment**: 15+ hours (integrated with project work)
**When to use**: Weeks 5-7, throughout

---

## Books & Deep Dives

### 11. AWS Certified Developer Study Guide (Amazon official)
**Author**: Amazon (various authors)
**Format**: PDF download from AWS training
**Cost**: FREE
**Best for**: Reference, comprehensive
**Content**: Covers all domains in detail
**Time commitment**: 20+ hours (if read thoroughly)
**When to use**: As reference during courses/labs

---

## Study Strategies & Tools

### 12. Notion/Obsidian Notes Template
**Purpose**: Track key concepts, formulas, AWS-specific quirks
**Suggested sections**:
- IAM policy syntax (confusing, worth noting)
- Lambda limitations (concurrency, timeout, size)
- DynamoDB vs RDS decision matrix
- CloudWatch metric names
- Common exam trick questions
**When to use**: Capture learning from each video/lab

### 13. Flashcard App
**Tools**: Anki, Quizlet
**Purpose**: Quick recall of service facts (e.g., "EC2 lifecycle states", "DynamoDB read units")
**Time commitment**: 5-10 min/day
**When to use**: Week 6-7 for review

---

## Recommended Learning Path (3-week sprint)

### Week 5: Core Setup (10-12 hours)
1. **Mon-Tue**: A Cloud Guru modules 1-2 (IAM, EC2) + labs
2. **Wed-Thu**: ACG modules 3-4 (S3, Elastic Beanstalk) + deploy your app
3. **Fri**: ACG module 5 (CloudFront, VPC) + review
4. **Sat-Sun**: AWS practice exam #1 (free), review wrong answers (2 hours)

### Week 6: Backend & Databases (11-13 hours)
1. **Mon-Tue**: ACG modules 6-7 (Lambda, API Gateway) + build serverless API
2. **Wed-Thu**: ACG modules 8-9 (DynamoDB, RDS) + setup databases
3. **Fri**: ACG module 10 (CloudWatch) + monitoring
4. **Sat**: Tutorials Dojo Practice Exam #1 (75 min exam + 45 min review)
5. **Sun**: Review weak areas + extra lab

### Week 7: Deployment & Final Prep (12-14 hours)
1. **Mon-Tue**: ACG modules 11-12 (CodeDeploy, KMS, Secrets) + CI/CD setup
2. **Wed-Thu**: ACG module 13 (SQS, SNS) + queue implementation
3. **Fri**: Tutorials Dojo Practice Exam #2 (75 min exam + 45 min review)
4. **Sat**: Review all weak areas (2 hours focused study)
5. **Sat-Sun**: Tutorials Dojo Practice Exam #3 (full exam + review)
6. **Mon (exam day)**: 1 hour final review of 5 hardest topics

---

## Total Cost Breakdown

| Item | Cost | When |
|------|------|------|
| A Cloud Guru (1 month) | $30 | Week 5 |
| Tutorials Dojo exams (3×$9) | $27 | Week 6-7 |
| AWS exam fee | $150 | Week 7 |
| Udemy course (optional) | $15-20 | If using instead of ACG |
| **TOTAL** | **$207** | Weeks 5-7 |

---

## Success Checklist

- [ ] Week 5: All IAM, EC2, S3, EB labs done + app deployed + free practice exam passed (70%+)
- [ ] Week 6: All Lambda, DynamoDB, RDS labs done + Tutorials Dojo exam 1 passed (70%+)
- [ ] Week 6-7: All CloudWatch, CodeDeploy, KMS labs done + Tutorials Dojo exam 2 passed (80%+)
- [ ] Week 7: Weak areas drilled + Tutorials Dojo exam 3 passed (85%+)
- [ ] Week 7: Real AWS exam passed (72%+) ✅

---

**Last updated**: 2026-04-02
**Next update**: Start of Week 5
