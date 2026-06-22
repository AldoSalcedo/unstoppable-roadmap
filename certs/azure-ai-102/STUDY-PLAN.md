# Azure AI Engineer Associate (AI-102) — Study Plan

**Target Exam Date**: End of Week 11 (2026-06-17)

**Investment**: 70 hours (study + labs + practice exams)

**Strategy**: Read When Needed (RWN) — Learn each Azure AI service while building healthcare AI features into your project.

---

## Exam Overview

**Azure AI Engineer Associate (AI-102)**
- Duration: 120 minutes
- Questions: 60 multiple choice
- Passing score: 70% (minimum)
- Cost: $165 USD
- Format: Scenario-based questions (practical, not trivia)

**Key domains**:
1. Plan & manage Azure AI solutions (25%)
2. Implement content moderation solutions (10%)
3. Implement computer vision solutions (15%)
4. Implement natural language processing solutions (30%)
5. Implement knowledge mining solutions (10%)
6. Implement generative AI solutions (10%)

---

## Study Plan by Week

### Week 8: Computer Vision & Setup

**Learning objectives**: Setup Azure AI account, Computer Vision API, image analysis, OCR basics.

| Day | Topic | RWN Applied To | Study Time |
|-----|-------|----------------|-----------|
| 1 | Azure setup & authentication | Create Azure resource group for healthcare AI | 90 min |
| 2 | Computer Vision API basics | Analyze medical document images | 120 min |
| 3 | Image classification | Tag patient X-rays, medical documents | 120 min |
| 4 | OCR (Optical Character Recognition) | Extract text from patient forms | 120 min |
| 5 | Face detection & recognition | HIPAA considerations, demo (no real data) | 90 min |
| 6 | Video analysis | Analyze appointment recordings (consent req) | 60 min |
| 7 | Practice exam 1 | Full mock exam | 120 min |

**Week 8 total**: ~10.5 hours

**Key deliverables**:
- [ ] Azure resource group + API keys secured
- [ ] Computer Vision API integrated into healthcare app
- [ ] Image upload + analysis pipeline working
- [ ] OCR extraction tested

---

### Week 9: Natural Language Processing

**Learning objectives**: Text Analytics, Language Understanding, LUIS, Entity extraction, sentiment analysis.

| Day | Topic | RWN Applied To | Study Time |
|-----|-------|----------------|-----------|
| 1 | Text Analytics basics | Analyze patient feedback/surveys | 120 min |
| 2 | Entity extraction | Extract diagnoses, medications from notes | 120 min |
| 3 | Sentiment analysis | Analyze patient satisfaction data | 90 min |
| 4 | Language Understanding (LUIS) | Medical chatbot intents | 120 min |
| 5 | Named entity recognition (NER) | Healthcare NER models | 120 min |
| 6 | Translation services | Multi-language patient support | 90 min |
| 7 | Practice exam 2 | Full mock exam, review weak areas | 120 min |

**Week 9 total**: ~12 hours

**Key deliverables**:
- [ ] Text Analytics pipeline for patient data
- [ ] Entity extraction for medical concepts
- [ ] Chatbot with LUIS intents (appointment booking, FAQ)
- [ ] Sentiment tracking of patient satisfaction

---

### Week 10: Knowledge Mining & Search

**Learning objectives**: Form Recognizer, Azure Search, document indexing, semantic search.

| Day | Topic | RWN Applied To | Study Time |
|-----|-------|----------------|-----------|
| 1 | Form Recognizer setup | Automate insurance form processing | 120 min |
| 2 | Custom form models | Train on patient intake forms | 120 min |
| 3 | Azure Cognitive Search setup | Full-text search of medical records | 90 min |
| 4 | Indexing & querying | Performance tuning, search relevance | 120 min |
| 5 | Semantic search | Medical literature search | 90 min |
| 6 | Document Intelligence | Advanced document processing | 90 min |
| 7 | Practice exam 3 | Full mock exam | 120 min |

**Week 10 total**: ~11.5 hours

**Key deliverables**:
- [ ] Form Recognizer extracting patient forms automatically
- [ ] Azure Search indexed with healthcare data
- [ ] Search API working (medical record lookup)
- [ ] Semantic search for research docs

---

### Week 11: Deployment, Security & Final Prep

**Learning objectives**: Deployment, monitoring, security (HIPAA compliance), content moderation, generative AI (OpenAI integration).

| Day | Topic | RWN Applied To | Study Time |
|-----|-------|----------------|-----------|
| 1 | Deployment & scaling | Container deployment of AI models | 90 min |
| 2 | Monitoring & logging | Application Insights setup | 90 min |
| 3 | Content Moderation API | Screen patient-generated content | 90 min |
| 4 | Azure OpenAI (ChatGPT) | Medical Q&A chatbot, documentation summarizer | 120 min |
| 5 | Security & HIPAA compliance | Data encryption, access controls, audit logs | 120 min |
| 6 | Cost optimization | Azure budgeting for healthcare solutions | 60 min |
| 7 | FINAL EXAM PREP + Practice exam 4 | Review all domains, take final mock | 180 min |

**Week 11 total**: ~12 hours

**Key deliverables**:
- [ ] All AI services deployed to production (Azure Container Registry)
- [ ] Monitoring dashboard active
- [ ] HIPAA compliance checklist completed
- [ ] OpenAI integration for documentation/Q&A
- [ ] All exam domains covered

---

## Practice Exam Schedule

| Exam | Week | Format | Target Score | When to Take |
|------|------|--------|---------------|-------------|
| **Mock 1** (Microsoft Learn) | 8 | Full, timed | 70%+ | End of Day 7 |
| **Mock 2** (Pluralsight) | 9 | Full, timed | 75%+ | Mid-week |
| **Mock 3** (Udemy) | 10 | Full, timed | 80%+ | End of week |
| **Mock 4** (MeasureUp) | 11 | Full, timed | 85%+ | 2 days before exam |
| **REAL EXAM** | 11 | Official Microsoft test center | 70%+ | End of week |

**Strategy**:
1. After each mock, review WRONG answers for 45 min
2. Add weak areas to daily study (30 min extra focus)
3. Before real exam: review your notes on 5 weak topics for 1 hour

---

## Weak Areas Tracker

After each practice exam, identify and track weak areas here.

| Domain | Topic | Mock 1 | Mock 2 | Mock 3 | Mock 4 | Status |
|--------|-------|--------|--------|--------|--------|--------|
| Planning | Resource planning | ? | ? | ? | ? | — |
| Computer Vision | Image analysis | ? | ? | ? | ? | — |
| NLP | Entity extraction | ? | ? | ? | ? | — |
| Search | Indexing strategy | ? | ? | ? | ? | — |
| Generative AI | OpenAI integration | ? | ? | ? | ? | — |
| Security | HIPAA compliance | ? | ? | ? | ? | — |

---

## Applied Learning Map

This table shows WHERE each service is applied in your healthcare project.

| Azure Service | What You Learn | Project Applied To | Code File |
|---------------|----------------|-------------------|-----------|
| **Computer Vision** | Image classification, OCR | Medical document analysis | `src/services/vision.ts` |
| **Form Recognizer** | Document extraction | Insurance form automation | `src/services/form-recognizer.ts` |
| **Text Analytics** | Sentiment, entities, languages | Patient feedback analysis | `src/services/text-analytics.ts` |
| **Language Understanding** | Intents, entities | Appointment booking chatbot | `src/services/luis.ts` |
| **Azure Search** | Full-text & semantic search | Medical record search | `src/services/search.ts` |
| **Content Moderator** | Text/image moderation | Screen patient content | `src/services/moderator.ts` |
| **Azure OpenAI** | GPT-4, embeddings, fine-tuning | Documentation summarizer, Q&A | `src/services/openai.ts` |
| **Application Insights** | Monitoring, logging, alerts | App health dashboard | `terraform/monitoring.tf` |
| **Azure Key Vault** | Secrets, encryption keys | Secure API keys, DB passwords | `src/services/keyvault.ts` |
| **Azure Container Registry** | Image registry, deployment | Deploy AI models as containers | `docker/Dockerfile` |

---

## Study Resources

### Official Microsoft
- **Microsoft Learn AI-102 Path** (free): https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/
- **Azure AI Services Documentation** (free): https://learn.microsoft.com/en-us/azure/ai-services/
- **Azure AI Sandbox** (free credits): Free tier of most services for 12 months
- **Microsoft Learn modules**: Free, official, highly detailed

### Online Courses
- **Pluralsight Azure AI course** ($30/month)
- **Udemy AI-102 prep course** ($15-20)
- **Azure Microsoft Learn sandbox labs** (free)

### Practice Exams
- **Microsoft Learn Practice Test** (free)
- **Udemy practice exams** (usually included with course)
- **MeasureUp exams** ($99 for bundle, but highest quality)
- **AzureStudyGuides practice exams** (sometimes free)

### Hands-on Labs
- **Microsoft Learn sandbox labs**: Official, free
- **Pluralsight hands-on labs**: Included with subscription
- **Your healthcare project**: BEST learning (apply services)

---

## Daily Study Routine (Weeks 8-11)

**Recommended schedule** (to hit 10-12 hours/week):

| Session | Duration | What |
|---------|----------|------|
| Morning (30 min) | 30 min | Watch 1 Azure AI service video |
| Mid-day (90 min) | 90 min | Hands-on lab (build/deploy the service) |
| Evening (30 min) | 30 min | Read Azure docs + take notes |
| Weekend (4-6 hours) | Flexible | Practice exam OR deep dive on weak area |

**Total**: ~5-6 hours weekdays + 4-6 hours weekend = 9-12 hours/week

---

## Exam Day Checklist

1. **Week 11, 3 days before**: Final mock exam (MeasureUp, full timed)
2. **Week 11, 1 day before**: Review 5 weak topics for 1 hour each
3. **Day of exam**:
   - Get 7-8 hours sleep night before
   - Eat good breakfast
   - Arrive 15 min early to exam center
   - Skip the tutorial
   - Read questions carefully (60 questions × 120 min = 2 min/question)
   - Some questions are scenarios (1-2 min to read, then answer 3-4 sub-questions)
   - Flag difficult questions, come back at end
   - Submit with 5 min left

---

## Success Metrics

| Milestone | Target | Status |
|-----------|--------|--------|
| Mock exam 1 score | 70%+ | — |
| Mock exam 2 score | 75%+ | — |
| Mock exam 3 score | 80%+ | — |
| Mock exam 4 score | 85%+ | — |
| Real exam score | 70%+ (passing) | — |
| **PASS EXAM** | End Week 11 | — |

---

## HIPAA Compliance Notes (Healthcare Angle)

As you build AI features, ensure:
- [ ] Patient data encrypted at rest (Azure Key Vault)
- [ ] APIs use HTTPS (in-transit encryption)
- [ ] No PII in logs (Application Insights filter)
- [ ] Access controls via Azure RBAC
- [ ] Audit trail of who accessed what
- [ ] Data residency compliance (data stays in region)
- [ ] Vendor contract (Business Associate Agreement)

**Week 11 focus**: Document how your AI app is HIPAA-compliant.

---

**Last updated**: 2026-04-02
**Next update**: Start of Week 8
