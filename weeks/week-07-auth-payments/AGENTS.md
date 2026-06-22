# AGENTS.md — Week 7: Authentication + Payments

## Context

This week builds the SaaS authentication and payment layer for the clinical task manager. You're implementing:

1. **User authentication** via OAuth (Google/Microsoft) or email
2. **Role-based access control (RBAC)** with 4 healthcare roles: ADMIN, DOCTOR, NURSE, PATIENT
3. **Multi-tenant isolation** — each clinic sees only its own data
4. **Stripe subscriptions** — pricing tiers (Free, Professional, Enterprise)
5. **Webhook processing** — automatic subscription status updates
6. **Audit logging** — HIPAA-compliant tracking of all auth events

## Key Files to Know

### Documentation
- `README.md` — Week overview, learning objectives, success criteria
- `sprint-week7.md` — 7-day breakdown with code examples for each day
- `GUIA-CONCEPTOS.md` — Conceptual reference for OAuth, RBAC, Stripe, HIPAA
- `RECURSOS.md` — Links to official documentation and guides

### Source Code Structure (You'll Create These)
```
src/
├── lib/
│   ├── auth.ts              # Auth.js configuration + callbacks
│   ├── rbac.ts              # RBAC helper functions
│   ├── stripe.ts            # Stripe client initialization
│   └── stripe-plans.ts      # Pricing tiers definition
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # Auth routes (Day 1)
│   │   ├── me/route.ts                    # Current user endpoint (Day 2)
│   │   ├── patients/route.ts              # Protected patients list (Day 3)
│   │   ├── admin/users/route.ts           # Admin user management (Day 3)
│   │   ├── checkout/route.ts              # Create checkout session (Day 4-5)
│   │   ├── webhooks/stripe/route.ts       # Webhook handler (Day 6)
│   │   └── billing-portal/route.ts        # Billing portal redirect (Day 7)
│   ├── auth/
│   │   └── signin/page.tsx               # Login page with OAuth (Day 1)
│   └── app/
│       ├── layout.tsx                    # Protected layout (Day 2)
│       ├── dashboard/page.tsx            # User dashboard (Day 2)
│       ├── admin/users/page.tsx          # Admin user management (Day 3)
│       └── billing/page.tsx              # Billing/pricing page (Day 4+)
├── components/
│   └── RoleGuard.tsx         # Component to protect by role (Day 3)
├── hooks/
│   └── useAuth.ts            # Custom hook for auth checks (Day 2)
└── middleware.ts             # Protect /app/* routes (Day 2)

prisma/
├── schema.prisma             # Database schema with User, Clinic, Subscription
└── migrations/               # Database migrations
```

### Database Models You'll Create
- `User` — with `role` (ADMIN, DOCTOR, NURSE, PATIENT) and `clinicId` for multi-tenant
- `Clinic` — with `subscriptionTier` and Stripe customer info
- `Subscription` — Stripe subscription records
- `AuditLog` — HIPAA-compliant audit trail

## When Working on Week 7

### Day 1: Auth.js Setup
- [ ] Configure `authConfig` in `src/lib/auth.ts`
- [ ] Add Google OAuth provider (get client_id/secret from Google Cloud Console)
- [ ] Create auth route handler at `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Create sign-in page with OAuth button
- [ ] Test: Login with Google should create user in database

**Key checks**:
- Session stored in database (not in-memory)
- OAuth redirect URLs match Google Console settings
- NEXTAUTH_SECRET is set (use `openssl rand -base64 32`)

### Day 2: Protected Routes + Middleware
- [ ] Create middleware in `src/middleware.ts` to protect `/app` routes
- [ ] Create protected layout at `src/app/app/layout.tsx`
- [ ] Create `/api/me` endpoint for current user
- [ ] Create custom `useAuth()` hook
- [ ] Test: Unauthenticated user → redirect to login

**Key checks**:
- Middleware runs on every request to `/app/*`
- Session validated server-side (not from frontend)
- Redirects use relative URLs (not absolute with domain)

### Day 3: RBAC
- [ ] Add `Role` enum to Prisma schema (ADMIN, DOCTOR, NURSE, PATIENT)
- [ ] Create `src/lib/rbac.ts` with permission helpers
- [ ] Implement role checks in `/api/patients` endpoint
- [ ] Create admin endpoint for user role management
- [ ] Create `RoleGuard.tsx` component for UI protection
- [ ] Test: PATIENT role cannot access `/app/patients`

**Key checks**:
- Always verify role on backend (never trust frontend)
- Query filters by role to prevent data leakage
- Role changes logged to audit table

### Day 4: Stripe Setup
- [ ] Create Stripe account and get API keys
- [ ] Create pricing plans in Stripe Dashboard (Free, Professional, Enterprise)
- [ ] Create `src/lib/stripe-plans.ts` with plan definitions
- [ ] Add `Clinic` and `Subscription` models to Prisma schema
- [ ] Create `/api/checkout` endpoint to generate checkout sessions
- [ ] Create pricing page showing all tiers
- [ ] Test: Can reach Stripe checkout from pricing page

**Key checks**:
- Stripe API keys in `.env.local` (NEVER in code)
- Free tier has `stripePriceId = null` (no checkout needed)
- Paid tiers have correct price IDs from Stripe Dashboard
- Checkout session includes `metadata` with `planId` and `clinicId`

### Day 5: Checkout Flow
- [ ] Complete checkout session creation (Day 4's `/api/checkout`)
- [ ] Create checkout success handler
- [ ] Update clinic subscription status when payment succeeds
- [ ] Test checkout with Stripe test card (4242 4242 4242 4242)
- [ ] Verify database: `clinic.subscriptionStatus` = "ACTIVE"

**Key checks**:
- Test card works: 4242 4242 4242 4242, any future expiry, any CVC
- Redirect URL after success points to `/app/billing?session_id={CHECKOUT_SESSION_ID}`
- Database updated with subscription tier and end date

### Day 6: Webhooks
- [ ] Create webhook handler at `/api/webhooks/stripe`
- [ ] Implement webhook signature verification (CRITICAL!)
- [ ] Handle subscription events: created, updated, deleted, payment_failed
- [ ] Update clinic subscription status based on webhook events
- [ ] Log all events to audit table
- [ ] Test with Stripe CLI locally

**Critical**: Always verify webhook signature before processing. Use `stripe.webhooks.constructEvent()`.

```bash
# Test webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger customer.subscription.created
```

### Day 7: Billing Portal + Testing
- [ ] Create `/api/billing-portal` redirect to Stripe Customer Portal
- [ ] Add "Manage Billing" button to billing page
- [ ] Write E2E tests for signup → login → subscribe flow
- [ ] Write integration tests for RBAC isolation
- [ ] Verify audit logging for all auth events
- [ ] Run full test suite

**Test coverage**:
- User signup creates user with PATIENT role
- Google OAuth creates session
- RBAC prevents PATIENT from viewing other patients
- Checkout creates subscription
- Webhooks update subscription status
- Billing portal accessible to users with subscription

## Code Standards for This Week

### Environment Variables
Never commit these. Always use `.env.local`:
```bash
# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_SECRET

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# Database
DATABASE_URL=postgresql://...
```

### RBAC Checks
**Always do this**:
```typescript
// Server-side auth check
const session = await auth();
if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Role check
if (session.user.role !== "DOCTOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

// Data filtering
const data = await db.patients.findMany({
  where: { clinicId: session.user.clinicId }, // Multi-tenant isolation
});
```

**Never do this**:
```typescript
// ❌ Don't trust frontend role
const role = req.headers.get("X-User-Role");

// ❌ Don't skip auth
if (process.env.NODE_ENV === "development") {
  // Still verify auth, even in dev!
}

// ❌ Don't return unfiltered data
const allPatients = await db.patients.findMany();
```

### Stripe Integration
**Always**:
- Use `stripe.webhooks.constructEvent()` to verify signatures
- Store Stripe customer ID in database (for recurring billing)
- Log all webhook events to audit table
- Handle idempotency (same webhook might arrive twice)

**Never**:
- Trust webhook data without signature verification
- Store credit card numbers (Stripe generates tokens)
- Hardcode Stripe keys in code

### Audit Logging
Every auth event must be logged:
```typescript
await db.auditLog.create({
  data: {
    action: "LOGIN", // or LOGOUT, ROLE_CHANGE, DATA_ACCESS, etc.
    userId: user.id,
    entityType: "USER",
    entityId: user.id,
    description: `User logged in via Google`,
    timestamp: new Date(),
  },
});
```

## Common Issues + Solutions

### Issue: "Google Client ID not found"
**Solution**:
1. Go to https://console.cloud.google.com
2. Create new project (or select existing)
3. Enable "Google+ API"
4. Create OAuth credentials (type: Web application)
5. Add redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   - https://yourdomain.com/api/auth/callback/google
6. Copy Client ID and Secret to `.env.local`

### Issue: "Webhook signature verification failed"
**Solution**:
1. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copy the webhook signing secret from terminal
3. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`
4. Restart dev server

### Issue: "Session not persisting across requests"
**Solution**:
1. Ensure `session.strategy = "database"` in authConfig
2. Run `npx prisma migrate dev` to create sessions table
3. Check `accounts` and `sessions` tables exist in database
4. Verify NEXTAUTH_SECRET is set (not empty)

### Issue: "PATIENT can access /app/patients"
**Solution**:
1. Check middleware is protecting the route (matchers correct)
2. Add role check to API endpoint: `if (session.user.role !== "DOCTOR") return 403`
3. Verify query filters by clinicId: `where: { clinicId: session.user.clinicId }`
4. Test with actual PATIENT user (not ADMIN in dev)

### Issue: "Stripe test card rejected"
**Solution**:
Use Stripe's test card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/26)
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Issue: "Webhook not triggering events"
**Solution**:
1. Verify endpoint URL: `https://yourdomain.com/api/webhooks/stripe` (must be HTTPS in production)
2. Check webhook secret matches in code
3. Test with: `stripe trigger customer.subscription.created`
4. Check server logs for webhook requests (should see POST to /api/webhooks/stripe)

## Useful Commands

```bash
# Generate auth secret
openssl rand -base64 32

# Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook event
stripe trigger customer.subscription.created

# Check Stripe test data
stripe customers list --limit 10
stripe subscriptions list --limit 10

# Prisma commands
npx prisma migrate dev --name add_auth_tables
npx prisma studio  # GUI to view/edit database

# Run tests
npm test  # Unit tests
npm run test:e2e  # E2E tests
```

## Useful Links

- [Auth.js Documentation](https://authjs.dev)
- [Google OAuth Setup](https://console.cloud.google.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhook Testing Guide](https://stripe.com/docs/webhooks/test)

## Success Criteria

By end of Week 7:
- [ ] User can sign up with OAuth
- [ ] RBAC prevents cross-clinic data access
- [ ] Stripe subscriptions work with real payments (test mode)
- [ ] Webhooks sync subscription status
- [ ] All auth events logged to audit table
- [ ] E2E tests pass (signup → login → subscribe)
- [ ] No hardcoded secrets in code
- [ ] HIPAA audit logging complete

## When Stuck

1. **Check the sprint-week7.md** for that day's code examples
2. **Read GUIA-CONCEPTOS.md** for conceptual understanding
3. **Review the auth.ts callbacks** — they're the most complex part
4. **Test webhook locally** with Stripe CLI (most common issue)
5. **Verify environment variables** (most auth failures are missing env vars)
6. **Check database schema** (ensure User has role field)

---

Good luck! This week is hard but builds the foundation for SaaS architecture.
