# WEEK 11 — System Design + Azure AI Exam + Proof of Work SaaS
## Sprint Overview: The Most Critical Week

**Duration:** 7 days  
**Critical Events:**
- Days 1-3: System Design Mastery (interview prep)
- Day 4: AZURE AI-102 EXAM (official certification)
- Days 5-7: Proof of Work SaaS Build (show employers you can ship)

**Target:** Pass Azure AI exam + deploy production SaaS MVP

---

## Why Week 11 is Critical

### Azure AI-102 Exam (Day 4)
- Official Microsoft certification
- Required for many Azure healthcare roles
- Demonstrates AI expertise
- Interview talking point: "Passed Azure AI-102 exam during intensive bootcamp"

### System Design Interview Mastery (Days 1-3 + 5-7)
- Amazon/Google/Microsoft ask system design questions
- Healthcare specialization makes you standout
- Design an EMR system: shows healthcare + scalability knowledge
- Your interview answer: "I designed a HIPAA-compliant EMR for 100k patients"

### Proof of Work SaaS (Days 5-7)
- Employers want to see you can ship
- Build: Clinical Decision Support Tool
- Stack: Next.js (web) + React Native (mobile) + AWS/Azure (backend) + Stripe (payments)
- Launch with 1 paying customer = proof you can build real products

---

## System Design Topics

### Week 11 Checklist
1. **Scalability Patterns**
   - Load balancing, caching (Redis), database sharding
   - Horizontal vs vertical scaling
   - CAP theorem trade-offs

2. **Healthcare EMR Design**
   - Patient records database design
   - FHIR/HL7 standards overview
   - Encryption at rest + in transit
   - Audit logs for HIPAA compliance

3. **Microservices vs Monolith**
   - When to split services
   - Service discovery
   - API gateways

4. **Interview Questions**
   - "Design Instagram" (your answer + healthcare variant)
   - "Design Uber" (your answer + healthcare variant)
   - "Design a Clinical Decision Support system" (YOUR SPECIALTY)

---

## Proof of Work SaaS Stack

### Frontend (Web)
- Next.js 14 with App Router
- TypeScript
- Shadcn/ui for healthcare components
- Stripe integration for payments

### Mobile
- React Native (code sharing with web)
- Push notifications
- Document scanning

### Backend
- Node.js + Express OR Python + FastAPI
- PostgreSQL for relational data
- Redis for caching
- JWT authentication

### Deployment
- AWS: EC2 + RDS + S3 + Lambda
- OR Azure: App Service + Azure SQL + Storage
- CI/CD: GitHub Actions

### Features MVP
- User authentication + clinic management
- Patient record creation/viewing
- AI-powered decision support (call Azure OpenAI)
- Payment processing (Stripe)
- Documentation

---

## Success Criteria

- [ ] Azure AI-102 exam passed (70%+ score)
- [ ] System design interview answers documented
- [ ] EMR system design document complete
- [ ] Proof of Work SaaS deployed (minimum 1 paying customer)
- [ ] Codebase publicly visible (GitHub)
- [ ] Ready to interview at healthcare tech companies

