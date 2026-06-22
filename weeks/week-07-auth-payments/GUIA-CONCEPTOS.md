# GUÍA DE CONCEPTOS — Week 07: Authentication + Payments

## Conceptos Fundamentales

### Authentication Concepts

#### OAuth 2.0 Flow
**El problema**: How do you let users login without storing passwords?

**Solución**: OAuth 2.0 delegates authentication to a trusted provider (Google, Microsoft).

```
┌──────────────────────────────────────────────────┐
│ OAUTH 2.0 FLOW                                   │
│                                                  │
│ 1. User clicks "Sign in with Google"             │
│ 2. Your app → redirects to Google                │
│ 3. Google → user logs in (Google's server)       │
│ 4. Google → redirects back with authorization    │
│    code (NOT password)                           │
│ 5. Your app (backend) → exchanges code for token │
│ 6. Your app → creates session with user          │
│ 7. User sees authenticated dashboard             │
│                                                  │
│ Key benefit: YOU never see the password!         │
│ Google handles security, not your app.           │
└──────────────────────────────────────────────────┘
```

#### JWT (JSON Web Tokens) vs Session Cookies
**El problema**: How do you prove user is logged in on every request?

**JWT Solution**:
```
┌──────────────────────────────────────────────────┐
│ JWT (Stateless)                                  │
│                                                  │
│ Token format: [header].[payload].[signature]    │
│                                                  │
│ Payload contains:                                │
│ {                                                │
│   "sub": "user-id",                              │
│   "email": "user@example.com",                   │
│   "role": "DOCTOR",                              │
│   "exp": 1234567890                              │
│ }                                                │
│                                                  │
│ Pros:                                            │
│ ✅ Stateless: no database query needed           │
│ ✅ Scalable: works across multiple servers       │
│ ✅ Fast: cryptographic verification only        │
│                                                  │
│ Cons:                                            │
│ ❌ Revocation hard: token valid until expiry     │
│ ❌ Data in token: never put secrets here         │
│ ❌ Size: grows with claims (slows requests)      │
└──────────────────────────────────────────────────┘
```

**Session Cookies Solution**:
```
┌──────────────────────────────────────────────────┐
│ SESSION COOKIES (Stateful)                       │
│                                                  │
│ Browser stores:                                  │
│ Cookie: "sessionId=abc123xyz"                    │
│                                                  │
│ Server stores:                                   │
│ sessions: { "abc123xyz": { userId, role, etc }} │
│                                                  │
│ Pros:                                            │
│ ✅ Revocation instant: delete session → logout   │
│ ✅ Logout works immediately (HIPAA!)            │
│ ✅ No sensitive data in browser                 │
│ ✅ CSRF protection easy (SameSite=Strict)       │
│                                                  │
│ Cons:                                            │
│ ❌ Stateful: requires database lookup            │
│ ❌ Scaling: session affinity needed (sticky)    │
│ ❌ Storage: sessions table can grow large        │
└──────────────────────────────────────────────────┘
```

**For Healthcare**: Use **session cookies**. You need instant logout (HIPAA requirement).

#### JWT Security Mistakes
**❌ NEVER DO THIS**:
```typescript
// ❌ BAD: Storing secrets in JWT
const token = jwt.sign({
  userId: "123",
  patientSsn: "123-45-6789", // PHI (Protected Health Info)!
  clinicPassword: "secret123", // Database credential!
}, secret);
```

**✅ DO THIS INSTEAD**:
```typescript
// ✅ GOOD: Only non-sensitive claims
const token = jwt.sign({
  sub: userId,
  email: userEmail,
  role: userRole,
  iat: Date.now(),
  exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
}, secret);

// Sensitive data lives in session (database), not token
```

---

### RBAC (Role-Based Access Control)

#### RBAC Pattern
**El problema**: Different users need different data access. How do you prevent PATIENT from seeing other patients?

**Solución**: Check role before returning data.

```
┌──────────────────────────────────────────────────┐
│ RBAC: DATA ACCESS BY ROLE                        │
│                                                  │
│ PATIENT role                                     │
│ ├─ GET /api/patients/me         ✅ allowed      │
│ ├─ GET /api/patients/{otherId}  ❌ denied       │
│ └─ GET /api/tasks/me            ✅ allowed      │
│                                                  │
│ DOCTOR role                                      │
│ ├─ GET /api/patients            ✅ all clinic   │
│ ├─ POST /api/patients/{id}/task ✅ allowed      │
│ ├─ DELETE /api/users            ❌ no delete    │
│ └─ GET /api/billing             ❌ no billing   │
│                                                  │
│ ADMIN role                                       │
│ ├─ GET /api/users               ✅ all users    │
│ ├─ POST /api/users/{id}/role    ✅ change role  │
│ ├─ GET /api/billing             ✅ all billing  │
│ └─ DELETE /api/users/{id}       ✅ can delete   │
└──────────────────────────────────────────────────┘
```

#### RBAC Implementation
```typescript
// ============================================================
// Key principle: Check auth on EVERY request
// ============================================================

// ❌ NEVER trust frontend role
const role = request.headers.get("X-User-Role");
// Attacker can change this header!

// ✅ ALWAYS verify backend
const session = await auth(); // Get from database/JWT
const userRole = session.user.role;

if (userRole !== "DOCTOR") {
  return response.forbidden();
}
```

#### Common RBAC Patterns
```
┌──────────────────────────────────────────────────┐
│ PATTERN 1: Hardcoded Role Checks                 │
│                                                  │
│ if (session.user.role !== "ADMIN") {            │
│   throw error("Access denied");                  │
│ }                                                │
│                                                  │
│ Pro: Simple, fast                               │
│ Con: Scattered throughout code                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ PATTERN 2: Permission Matrix                     │
│                                                  │
│ const permissions = {                            │
│   PATIENT: ["view_own_tasks"],                   │
│   DOCTOR: ["view_patients", "edit_tasks"],       │
│   ADMIN: ["manage_users", "manage_billing"],     │
│ };                                               │
│                                                  │
│ if (!permissions[role].includes(action)) {      │
│   throw error("Permission denied");              │
│ }                                                │
│                                                  │
│ Pro: Centralized, easier to audit               │
│ Con: Slight performance overhead                │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ PATTERN 3: Attribute-Based (ABAC)               │
│                                                  │
│ Can user access this patient's data?            │
│ - Is user a DOCTOR? (role)                      │
│ - Does patient consent? (attribute)             │
│ - Is patient in same clinic? (context)          │
│                                                  │
│ Pro: Fine-grained, flexible                     │
│ Con: Complex, needs careful design              │
└──────────────────────────────────────────────────┘
```

#### Query Filtering by Role
```typescript
// ❌ WRONG: Load all patients, filter in code
const patients = await db.patients.findMany();
const myPatients = patients.filter(p => p.clinicId === userId);
// Problem: Loads millions of rows, filters in memory

// ✅ RIGHT: Filter in database query
const myPatients = await db.patients.findMany({
  where: {
    clinicId: user.clinicId, // Only clinic's data
  },
});
// Problem solved: database only returns relevant rows
```

---

### Payments + Subscriptions

#### Stripe Subscription Lifecycle
**El problema**: How does recurring billing work?

**Solución**: Stripe manages the subscription state machine.

```
┌──────────────────────────────────────────────────┐
│ STRIPE SUBSCRIPTION LIFECYCLE                    │
│                                                  │
│   User → Checkout → ACTIVE → Renewal → ACTIVE   │
│                       ↓                            │
│                    Payment fails                 │
│                       ↓                            │
│                    PAST_DUE                       │
│                       ↓ (retries 3x)              │
│                   Payment succeeds?              │
│                   / ↓                            │
│            YES /  ↓ NO                           │
│               /   CANCELED                       │
│            ACTIVE                                │
│                                                  │
│ States:                                          │
│ - ACTIVE: Subscription is current, payment OK    │
│ - PAST_DUE: Payment failed, retrying             │
│ - CANCELED: Subscription ended                   │
│ - UNPAID: Payment failed after retries           │
│ - ENDED: Natural expiration (yearly plans)       │
└──────────────────────────────────────────────────┘
```

#### Stripe Webhook Events
**El problema**: Your database needs to stay in sync with Stripe.

**Solución**: Webhooks = Stripe calling you when events happen.

```
┌──────────────────────────────────────────────────┐
│ WEBHOOK FLOW                                     │
│                                                  │
│ 1. User's credit card is charged on Stripe      │
│ 2. Stripe: "Payment succeeded!"                 │
│ 3. Stripe → HTTP POST to /api/webhooks/stripe   │
│ 4. Your app: receive webhook                    │
│ 5. Your app: update clinic.subscriptionStatus   │
│ 6. Your app: send Stripe response (200 OK)      │
│ 7. Stripe: webhook delivered successfully       │
│                                                  │
│ If you don't respond (timeout):                 │
│ 8. Stripe retries after 5 seconds, 5 minutes... │
│ 9. Retries for 3 days until gives up            │
│                                                  │
│ Key: Webhooks are eventual consistency          │
│      Not instant, but reliable (3-day retry)    │
└──────────────────────────────────────────────────┘
```

#### Webhook Security: Signature Verification
**El problema**: Anyone can call /api/webhooks/stripe. How do you know it's really Stripe?

**Solución**: Cryptographic signature verification.

```
┌──────────────────────────────────────────────────┐
│ WEBHOOK SIGNATURE VERIFICATION                   │
│                                                  │
│ Stripe creates:                                 │
│ - message = raw webhook body                    │
│ - timestamp = request timestamp                 │
│ - signature = HMAC_SHA256(                       │
│     webhook_secret,                             │
│     "{timestamp}.{message}"                     │
│   )                                              │
│                                                  │
│ Stripe sends:                                   │
│ Header: "stripe-signature: t=timestamp,         │
│   v1=signature"                                 │
│                                                  │
│ You verify:                                     │
│ 1. Get timestamp and signature from header      │
│ 2. Check timestamp is recent (< 5 min old)      │
│ 3. Recalculate HMAC with webhook_secret         │
│ 4. Compare: calculated == received?             │
│ 5. If match: webhook is authentic from Stripe   │
│                                                  │
│ ❌ NEVER skip this check!                        │
│ Attacker could send fake webhook to free        │
│ your clinic from subscription.                  │
└──────────────────────────────────────────────────┘
```

#### Subscription Tiers
```
┌──────────────────────────────────────────────────┐
│ PRICING STRATEGY FOR SAAS                        │
│                                                  │
│ Tier           Features           Price          │
│ ────────────────────────────────────────────     │
│ FREE           5 users, 25 patients  $0/mo       │
│ PROFESSIONAL   50 users, 1K patients $99/mo      │
│ ENTERPRISE     Unlimited            Custom       │
│                                                  │
│ Design principles:                              │
│ 1. Clear separation: easy to compare            │
│ 2. Upsell path: FREE → PROFESSIONAL → ENT       │
│ 3. Feature gating: higher tier = more features  │
│ 4. Value-aligned: price matches value           │
│                                                  │
│ For healthcare:                                 │
│ - Never use "pay-per-patient" (liability!)      │
│ - Use "per-clinic/team" subscription            │
│ - Include support level (critical for MD/RN)    │
│ - Clear audit logging in all tiers              │
└──────────────────────────────────────────────────┘
```

---

### PCI Compliance

#### PCI DSS Basics
**El problema**: If you store credit card data, you need PCI compliance (expensive, complex).

**Solución**: Let Stripe handle it. You never see card numbers.

```
┌──────────────────────────────────────────────────┐
│ PCI DSS (Payment Card Industry Data Security)    │
│                                                  │
│ ❌ DON'T DO THIS:                                │
│ - Store credit card numbers (PCI Level 1 audit) │
│ - Send card data through your server            │
│ - Store CVV/expiry in database                  │
│ Cost: $1000s per month for compliance           │
│ Risk: If hacked, liable for millions            │
│                                                  │
│ ✅ DO THIS INSTEAD:                              │
│ - Use Stripe checkout (card stays on Stripe)    │
│ - Use Stripe Elements (client-side encryption)  │
│ - Never handle raw card data                    │
│ Cost: Stripe's % fee (2.9% + $0.30)            │
│ Risk: Stripe is PCI Level 1 certified           │
│                                                  │
│ Key principle:                                  │
│ "Don't own the data, don't own the risk"        │
└──────────────────────────────────────────────────┘
```

#### Tokenization Flow
```
┌──────────────────────────────────────────────────┐
│ STRIPE TOKENIZATION                              │
│                                                  │
│ 1. Customer enters card on checkout.stripe.com  │
│ 2. Stripe encrypts card → generates token       │
│    Token: pm_1PK2p5Kk4Yp9X5X5X5X5               │
│ 3. Token sent to your server (safe!)            │
│ 4. You store token in database (not card!)      │
│ 5. Future charges: use token, no card needed    │
│                                                  │
│ Token is:                                       │
│ ✅ Safe: only valid on your Stripe account      │
│ ✅ Reusable: for recurring charges              │
│ ✅ Short-lived: expires after period            │
│ ❌ Can't be decoded: no card data inside        │
└──────────────────────────────────────────────────┘
```

---

### HIPAA Compliance for Auth

#### Session Management HIPAA Requirements
```
┌──────────────────────────────────────────────────┐
│ HIPAA REQUIREMENTS FOR AUTH                      │
│                                                  │
│ 1. UNIQUE USER ID                               │
│    ✅ Each user must have unique identifier     │
│    ❌ Can't use SSN (too much privacy exposure) │
│                                                  │
│ 2. EMERGENCY ACCESS LOG                         │
│    ✅ Log every access to PHI                   │
│    ✅ Track who, what, when, why               │
│    ❌ No "admin bypass" without approval        │
│                                                  │
│ 3. SESSION TERMINATION                          │
│    ✅ Logout clears session immediately         │
│    ✅ Timeout after inactivity (15 min)        │
│    ❌ Sessions don't linger after logout        │
│                                                  │
│ 4. ENCRYPTION IN TRANSIT                        │
│    ✅ HTTPS only (not HTTP)                     │
│    ✅ TLS 1.2+ (not older SSL)                  │
│    ✅ Strong ciphers                            │
│                                                  │
│ 5. NO PHI IN TOKENS/LOGS                        │
│    ✅ Tokens contain: userId, role, clinic     │
│    ❌ Never put: SSN, MRN, patient names       │
│                                                  │
│ 6. AUDIT TRAIL                                  │
│    ✅ All authentication events logged          │
│    ✅ Logs retained for 6 years minimum         │
│    ✅ Log tampering detection (immutable log)   │
└──────────────────────────────────────────────────┘
```

#### Multi-Tenant Isolation (HIPAA Requirement)
```
┌──────────────────────────────────────────────────┐
│ CLINIC A                                         │
│ ├─ Users: dr-alice@clinica.com                  │
│ ├─ Patients: 250 (clinic A only)                │
│ └─ Cannot see: clinic B's patients              │
│                                                  │
│ CLINIC B                                         │
│ ├─ Users: dr-bob@clinicb.com                    │
│ ├─ Patients: 180 (clinic B only)                │
│ └─ Cannot see: clinic A's patients              │
│                                                  │
│ Database isolation:                             │
│ SELECT * FROM patients                          │
│ WHERE clinicId = session.user.clinicId          │
│                                                  │
│ This ensures:                                   │
│ ✅ Clinic A doctor can't see clinic B patients  │
│ ✅ Patient data is isolated by clinic           │
│ ✅ Query filters enforce isolation              │
│ ❌ Never let user specify clinicId (use session)│
└──────────────────────────────────────────────────┘
```

---

### Auth.js vs Clerk

#### Auth.js
```
┌──────────────────────────────────────────────────┐
│ AUTH.JS (OPEN SOURCE)                            │
│                                                  │
│ Pros:                                            │
│ ✅ Open source (audit security yourself)        │
│ ✅ Self-hosted options available                │
│ ✅ Full control over data (on-prem possible)    │
│ ✅ No vendor lock-in                            │
│ ✅ Works with any database                      │
│                                                  │
│ Cons:                                            │
│ ❌ More setup required                          │
│ ❌ You manage: OAuth config, sessions, emails   │
│ ❌ Scaling: need session database               │
│ ❌ Support: community-driven                    │
│                                                  │
│ Best for: Teams with engineering resources     │
│           Companies needing full control        │
│           Open-source projects                  │
└──────────────────────────────────────────────────┘
```

#### Clerk
```
┌──────────────────────────────────────────────────┐
│ CLERK (SAAS)                                     │
│                                                  │
│ Pros:                                            │
│ ✅ Fully managed (Clerk handles scaling)        │
│ ✅ Pre-built UI components                      │
│ ✅ 2FA, passwordless, recovery codes built-in   │
│ ✅ Enterprise features (SAML, SSO)              │
│ ✅ 24/7 support                                 │
│                                                  │
│ Cons:                                            │
│ ❌ Vendor lock-in (data on Clerk's servers)     │
│ ❌ Paid (free tier limited)                     │
│ ❌ Less customization (pre-built = limited UX)  │
│ ❌ For healthcare: must verify HIPAA compliance │
│                                                  │
│ Best for: Startups, rapid development           │
│           Teams without auth expertise          │
│           Need managed infrastructure           │
└──────────────────────────────────────────────────┘
```

#### Comparison
| Feature | Auth.js | Clerk |
|---------|---------|-------|
| Cost | Free | Free tier + paid |
| Setup time | 4-8 hours | 1-2 hours |
| Control | High | Medium |
| Scaling | Manual (add DB) | Automatic |
| Support | Community | Premium |
| OAuth providers | Many | Many + more |
| 2FA | Manual | Built-in |
| Audit logs | Your DB | Clerk's DB |

**For healthcare Week 7**: We'll use Auth.js since it gives you full control over audit logs (HIPAA requirement).

---

## Advanced Concepts

### Session Storage Strategies

#### In-Memory Sessions (❌ Don't use in production)
```typescript
// ❌ WRONG
const sessions = {}; // Sessions lost on restart!
sessions["abc123"] = { userId: "user1", role: "DOCTOR" };
// Problem: Reboot server → all users logged out!
```

#### Database Sessions (✅ HIPAA-compliant)
```typescript
// ✅ CORRECT
// Database: sessions table
// session_id: "abc123"
// user_id: "user1"
// role: "DOCTOR"
// createdAt: timestamp
// expiresAt: timestamp

// Lookup: SELECT * FROM sessions WHERE session_id = 'abc123'
// Logout: DELETE FROM sessions WHERE session_id = 'abc123'
```

#### Redis Sessions (✅ Fast alternative)
```typescript
// ✅ ALSO GOOD
// Redis: key-value store (in-memory but persistent)
// Key: "session:abc123"
// Value: { userId: "user1", role: "DOCTOR" }
// Expiry: 7 days (auto-delete after expiry)

// Pros: Faster than database (in-memory)
// Cons: Another service to manage
```

### Concurrent Session Management

```
┌──────────────────────────────────────────────────┐
│ PROBLEM: Multiple Active Sessions                │
│                                                  │
│ Scenario:                                       │
│ 1. Doctor logs in on iPhone                     │
│ 2. Doctor logs in on laptop (same email)        │
│ 3. Two active sessions for same user            │
│                                                  │
│ Options:                                        │
│                                                  │
│ OPTION 1: Allow multiple (default)              │
│ ✅ User can work on multiple devices            │
│ ❌ Security: attacker could login too           │
│                                                  │
│ OPTION 2: One session per user                  │
│ ✅ Security: new login invalidates old          │
│ ❌ Inconvenient: login on phone logs out laptop │
│                                                  │
│ OPTION 3: Limit to N sessions                   │
│ ✅ Balance: allow 3 devices, remove oldest      │
│ ✅ Security + convenience                       │
│                                                  │
│ For healthcare: OPTION 3 (limit to 3 sessions)  │
└──────────────────────────────────────────────────┘
```

### Token Refresh

```
┌──────────────────────────────────────────────────┐
│ PROBLEM: Tokens expire for security              │
│                                                  │
│ Solution: Refresh token flow                    │
│                                                  │
│ 1. User logs in                                 │
│    → access_token (15 min expiry)               │
│    → refresh_token (7 days expiry)              │
│                                                  │
│ 2. API call with expired access_token → 401     │
│                                                  │
│ 3. Client sends refresh_token                   │
│    → Server validates refresh_token             │
│    → Server returns new access_token            │
│                                                  │
│ 4. API call retried with new access_token       │
│                                                  │
│ Benefit: If access_token leaked, expires fast   │
│          Refresh_token harder to steal (httpOnly)│
└──────────────────────────────────────────────────┘
```

---

## Common Security Mistakes

### ❌ Mistake 1: Trusting the Frontend
```typescript
// ❌ WRONG
if (typeof window !== "undefined") {
  const role = localStorage.getItem("userRole");
  if (role !== "ADMIN") {
    return <Unauthorized />;
  }
}

// Problem: User edits localStorage → becomes ADMIN!
```

### ✅ Solution 1: Verify on Backend
```typescript
// ✅ RIGHT
export async function GET(req: NextRequest) {
  const session = await auth(); // From database/JWT

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  // Safe: user can't fake this
}
```

### ❌ Mistake 2: Storing Sensitive Data in JWT
```typescript
// ❌ WRONG
const token = jwt.sign({
  patientSsn: "123-45-6789", // PHI!
  bloodType: "O+", // Medical record!
  allergies: ["Penicillin"], // Clinical data!
}, secret);

// Problem: Token is readable (just Base64 encoded)
// Attacker can: read token, see all patient data
```

### ✅ Solution 2: Only Non-Sensitive Claims
```typescript
// ✅ RIGHT
const token = jwt.sign({
  sub: userId,
  role: userRole,
}, secret);

// Sensitive data stays in database
// Only fetched when authorized
```

### ❌ Mistake 3: No Logout
```typescript
// ❌ WRONG
// JWT tokens can't be revoked (they're self-contained)
// User gets token for 24 hours, no way to logout

// Problem: Even after logout, token still valid
// Risk: Computer stolen, token on disk still works
```

### ✅ Solution 3: Use Session Cookies
```typescript
// ✅ RIGHT
// Delete session from database on logout
await db.sessions.delete({ where: { sessionId } });

// Next request: session lookup returns null
// User sees: redirected to login page
// Logout is instant (HIPAA requirement!)
```

---

## Testing Checklist

```
┌──────────────────────────────────────────────────┐
│ AUTH + PAYMENTS TESTING CHECKLIST                │
│                                                  │
│ Authentication:                                  │
│ ☐ User can sign up with OAuth                    │
│ ☐ User can login with OAuth                      │
│ ☐ User cannot access /app without login          │
│ ☐ Login with invalid credentials fails          │
│ ☐ Logout clears session                         │
│ ☐ Session times out after 7 days                │
│ ☐ Concurrent sessions limited to 3              │
│                                                  │
│ RBAC:                                            │
│ ☐ PATIENT cannot access /app/patients           │
│ ☐ DOCTOR can access /app/patients               │
│ ☐ ADMIN can access /admin/users                 │
│ ☐ Role change logged to audit table             │
│ ☐ Query filters enforce role isolation          │
│                                                  │
│ Payments:                                        │
│ ☐ Checkout creates Stripe session               │
│ ☐ Successful payment → subscription ACTIVE      │
│ ☐ Webhook processes payment_succeeded event     │
│ ☐ Webhook processes subscription.canceled event │
│ ☐ Failed payment → subscription PAST_DUE        │
│ ☐ Billing portal accessible to customers       │
│                                                  │
│ Security:                                        │
│ ☐ Frontend role can't be faked (backend checks) │
│ ☐ No PHI in tokens                              │
│ ☐ HTTPS only (not HTTP)                         │
│ ☐ Webhook signatures verified                   │
│ ☐ No hardcoded secrets in code                  │
│ ☐ Environment variables for API keys            │
│                                                  │
│ HIPAA:                                           │
│ ☐ All auth events logged                        │
│ ☐ Multi-tenant isolation verified               │
│ ☐ Session termination immediate                 │
│ ☐ Audit logs retained 6+ years                  │
│ ☐ No PHI in logs (only IDs)                     │
└──────────────────────────────────────────────────┘
```

---

## References

- [OAuth 2.0 Spec](https://tools.ietf.org/html/rfc6749)
- [JWT Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [PCI Compliance Guide](https://www.pcisecuritystandards.org/)
- [Stripe Webhook Testing](https://stripe.com/docs/webhooks/test)

---

**Key Takeaway**: Authentication is the foundation of security. Get it right, and everything else becomes easier.
