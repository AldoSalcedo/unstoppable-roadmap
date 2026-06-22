# WEEK 11 SPRINT — Critical Week Breakdown

## DÍA 1-3: System Design Interview Mastery

### DÍA 1: Scalability Patterns

#### Morning: Fundamentals
- Load balancing (round-robin, least connections, consistent hashing)
- Caching layers (CDN, Redis, in-memory)
- Database optimization (indexing, sharding, replication)

#### Afternoon: Healthcare Application
- Design patient search for 100k patients (how to scale)
- Caching lab results (most accessed, frequently updated)
- Sharding by clinic ID (data locality + compliance)

### DÍA 2: Healthcare EMR System Design

#### Morning: Architecture
- API layer (REST endpoints for patient data)
- Database layer (PostgreSQL + Redis)
- File storage (for medical documents)
- Audit logging (HIPAA compliance)

#### Afternoon: Write Complete Design Document
- System components diagram
- Data flow (patient data → database → API → frontend)
- Scalability decisions (why sharding, why caching)
- HIPAA compliance measures

### DÍA 3: Interview Mock Sessions + System Design Drilling

#### Morning: Practice "Design a Clinical EMR"
- 45-minute timed interview simulation
- Interviewer asks follow-up questions
- Record your answers

#### Afternoon: Review & Iterate
- Weak areas identified
- Practice answers refined
- Confidence increased

---

## DÍA 4: AZURE AI-102 EXAM

### Morning: Final Review
- 2 hours practice test
- Review weak areas
- Confidence check

### Afternoon: EXAM (2 hours)
- 52-60 multiple choice questions
- Topics: Azure services, Responsible AI, HIPAA, cost optimization
- Target score: 700/1000 (70%)

### Post-Exam: Celebrate! 🎉
- You passed! (Assuming successful)
- Update resume with Azure AI-102 certification
- LinkedIn headline: "Azure AI-102 Certified"

---

## DÍA 5-7: Proof of Work SaaS Build

### DÍA 5: Foundation & Setup

#### Morning: Project Setup
- Create GitHub repo
- Set up Next.js project
- Configure PostgreSQL + Redis
- CI/CD pipeline (GitHub Actions)

#### Afternoon: Authentication
- User registration/login
- JWT tokens
- Role-based access (clinic admin, doctor, patient)

### DÍA 6: Core Features

#### Morning: Patient Management
- Create patient record
- Upload medical documents
- Search patients by name/ID

#### Afternoon: AI Decision Support
- Call Azure OpenAI API
- Input: patient symptoms → Output: decision support
- Display results with evidence
- Clinical disclaimer

### DÍA 7: Payment + Launch

#### Morning: Stripe Integration
- Payment processing
- Subscription plans (clinic monthly subscription)
- Invoice generation

#### Afternoon: Launch
- Deploy to AWS/Azure
- DNS setup (yoursaasdomain.com)
- Get first customer willing to pay
- Write case study

---

## Daily Time Allocation

| Day | System Design | Azure AI | SaaS Build | Total |
|-----|---------------|----------|-----------|-------|
| 1 | 6h | 1h | - | 7h |
| 2 | 6h | 1h | - | 7h |
| 3 | 5h | 2h | - | 7h |
| 4 | - | 2h (exam) | - | 2h |
| 5 | - | 1h | 6h | 7h |
| 6 | - | - | 7h | 7h |
| 7 | - | - | 7h | 7h |

