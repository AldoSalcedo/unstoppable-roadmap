# 🔐 WEEK 7: Authentication + Payments

**Duración:** 7 días | **Nivel:** Avanzado | **Pre-requisitos:** Weeks 1-6

## 🎯 Overview
Build a production-grade SaaS authentication and payment system using Auth.js/Clerk + Stripe. Healthcare-focused: HIPAA-compliant auth patterns, subscription management for clinical software, PCI compliance for payment processing.

This week transforms your clinical task manager into a multi-tenant SaaS platform where:
- Users authenticate via OAuth (Google, Microsoft) or email/password
- Role-based access control protects patient data
- Subscription tiers (Free, Professional, Enterprise) manage features
- Stripe webhooks sync payments with your database
- Compliance logging tracks every authentication event

## 📚 Learning Objectives
- Auth.js or Clerk integration with multiple OAuth providers
- Role-Based Access Control (RBAC) for healthcare roles (Admin, Doctor, Nurse, Patient)
- HIPAA-compliant session management and data isolation
- Stripe subscription workflows and webhook security
- Billing portal integration for self-service management
- PCI compliance basics for payment processing
- Session invalidation and token revocation strategies

## 📅 Day-by-Day Breakdown

| Día | Focus | Deliverable |
|-----|-------|-------------|
| **DAY 1** | Auth.js/Clerk setup + OAuth configuration | Google OAuth login working |
| **DAY 2** | Protected routes + middleware authentication | Middleware protecting all /app routes |
| **DAY 3** | Role-Based Access Control (RBAC) | Doctor/Nurse/Admin/Patient roles enforced |
| **DAY 4** | Stripe setup + pricing plans | Stripe Dashboard with 3 subscription tiers |
| **DAY 5** | Subscription checkout + payment flow | Complete checkout → payment processing |
| **DAY 6** | Webhooks + billing events (sync) | Webhooks handling payment/renewal events |
| **DAY 7** | Billing portal + integration testing | User self-service billing + E2E tests |

## ✅ Success Criteria
- [ ] OAuth login with Google (and optionally Microsoft) fully working
- [ ] RBAC middleware restricts routes based on user role
- [ ] Protected API endpoints return 401 for unauthenticated users
- [ ] Stripe subscriptions functional with webhook events
- [ ] Billing portal accessible and users can manage subscriptions
- [ ] Session tokens include user role and subscription tier
- [ ] Audit logging tracks all auth events (login, logout, role changes)
- [ ] E2E tests verify complete auth flow

## 🏥 Healthcare Context
This week's code patterns assume a **clinical task management system** with these user roles:

```
PATIENT (Base User)
├─ Can view own profile
├─ Can see assigned tasks from doctors
└─ Cannot see other patients' data

NURSE
├─ Can manage patient tasks
├─ Can view patient charts
├─ Cannot prescribe medications
└─ Cannot access billing

DOCTOR (CLINICIAN)
├─ Can manage patients
├─ Can prescribe treatments
├─ Can view all patient data (with consent)
└─ Cannot access billing

ADMIN
├─ Can manage users
├─ Can manage subscriptions
├─ Can view audit logs
└─ Can configure system settings
```

**HIPAA-Compliant Auth Patterns**:
1. **Session isolation**: Each user session is tied to a specific tenant/clinic
2. **No PHI in tokens**: JWT tokens don't contain Protected Health Information
3. **Audit logging**: Every login/logout/data access is logged
4. **Consent tracking**: Access to patient data requires explicit consent
5. **Encryption**: Sessions stored server-side, not in browser cookies alone

## 🔗 Integration Points
- **Database**: User roles, subscription tiers, audit logs (from Week 6)
- **Frontend**: Login page, dashboard, billing page (from Weeks 2-3)
- **API**: Protected endpoints checking auth middleware (Week 5)
- **DevOps**: Auth secrets in environment variables (Week 6)

## 🎯 Week 8 Preview
**AI Integration + AI Agents**: OpenAI/Claude API integration, streaming responses, RAG (Retrieval-Augmented Generation) for healthcare knowledge base, AI-powered clinical decision support.

## 📊 Pricing Tiers (You'll Build These in Day 4)

| Feature | Free | Professional | Enterprise |
|---------|------|--------------|------------|
| Users | 5 | Unlimited | Unlimited |
| Patients | 25 | 1,000 | Custom |
| API Calls | 10K/mo | 1M/mo | Custom |
| Support | Email | Priority | 24/7 |
| Price | $0 | $99/mo | Custom |

---

## 🛠️ Tech Stack for Week 7

**Authentication**:
- Auth.js (next-auth) or Clerk (cloud-based alternative)
- OAuth 2.0 (Google, Microsoft providers)
- JWT or session cookies for client auth

**Payments**:
- Stripe API (subscriptions, checkout sessions)
- Stripe CLI for local webhook testing
- Stripe Billing Portal (customer self-service)

**Compliance**:
- HIPAA audit logging
- PCI DSS (Don't store card data - Stripe handles it)
- Session management best practices

**Testing**:
- Jest for unit tests
- Stripe test credentials (pk_test_*, sk_test_*)
- E2E tests with test user accounts

---

## 📖 Expected Reading Time
- This README: 10 minutes
- Day-by-day sprint: 2-3 hours to read + skim code
- Concept guide: 45 minutes
- Implementation per day: 3-5 hours

## ❓ Before You Start
Ensure you have:
1. A Stripe account (https://dashboard.stripe.com)
2. Auth.js or Clerk documentation open
3. TypeScript knowledge from Week 2
4. Database schema from Week 6
5. An existing Next.js project (Week 2)

Good luck, and remember: **secure auth is no accident—it's built with intention!**
