# RECURSOS — Week 7: Authentication + Payments

Comprehensive resource guide for building production-grade SaaS auth and payment systems.

## Authentication Frameworks

### Auth.js (NextAuth v5)
- **Official Site**: https://authjs.dev
- **GitHub**: https://github.com/nextauthjs/next-auth
- **Quick Start**: https://authjs.dev/getting-started
- **Configuration**: https://authjs.dev/guides/configuring-nextauth
- **Callbacks**: https://authjs.dev/guides/callbacks
- **Database Adapter**: https://authjs.dev/getting-started/database
- **TypeScript Types**: https://authjs.dev/getting-started/typescript
- **Session Strategies**: https://authjs.dev/concepts/session-strategies
- **Security**: https://authjs.dev/concepts/security

### Clerk
- **Official Site**: https://clerk.com
- **Documentation**: https://clerk.com/docs
- **React Components**: https://clerk.com/docs/components/overview
- **Next.js Integration**: https://clerk.com/docs/nextjs/overview
- **API Reference**: https://clerk.com/docs/reference/sdk-js
- **HIPAA Compliance**: https://clerk.com/docs/security/hipaa-compliance (check current status)
- **SSO/SAML**: https://clerk.com/docs/authentication/enterprise

### Supabase Auth
- **Official Site**: https://supabase.com/auth
- **Documentation**: https://supabase.com/docs/guides/auth
- **Next.js Guide**: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- **PostgreSQL Included**: All user data in your database

## OAuth 2.0 Providers

### Google OAuth
- **Google Cloud Console**: https://console.cloud.google.com
- **OAuth Setup Guide**: https://developers.google.com/identity/protocols/oauth2
- **Next.js Auth.js Provider**: https://authjs.dev/providers/google
- **Scopes Documentation**: https://developers.google.com/identity/protocols/oauth2/scopes

### Microsoft (Entra ID / Azure AD)
- **Azure Portal**: https://portal.azure.com
- **App Registration**: https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app
- **Auth.js Provider**: https://authjs.dev/providers/azure-ad-b2c
- **OAuth Flows**: https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

### GitHub OAuth (For Developer Auth)
- **GitHub Developer Settings**: https://github.com/settings/developers
- **OAuth Documentation**: https://docs.github.com/en/developers/apps/building-oauth-apps
- **Auth.js Provider**: https://authjs.dev/providers/github

### Okta (Enterprise SSO)
- **Okta Developer**: https://developer.okta.com
- **OAuth Configuration**: https://developer.okta.com/docs/guides/implement-oauth-for-okta/main/
- **Auth.js Provider**: https://authjs.dev/providers/okta
- **HIPAA Compliance**: https://www.okta.com/security/hipaa-compliance/

## Payment Processing

### Stripe
- **Official Documentation**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Webhook Events**: https://stripe.com/docs/api/events
- **Webhook Testing**: https://stripe.com/docs/webhooks/test
- **Checkout Sessions**: https://stripe.com/docs/payments/checkout
- **Subscriptions**: https://stripe.com/docs/billing/subscriptions/overview
- **Customer Portal**: https://stripe.com/docs/billing/subscriptions/customer-portal
- **Test Card Numbers**: https://stripe.com/docs/testing
- **Billing Portal Guide**: https://stripe.com/docs/billing/subscriptions/checkout

### Stripe Libraries
- **Stripe.js (Frontend)**: https://stripe.com/docs/stripe-js
- **Stripe Node.js**: https://github.com/stripe/stripe-node
- **TypeScript Types**: https://github.com/stripe/stripe-node#typescript-support

### Lemon Squeezy (Stripe Alternative)
- **Official Site**: https://www.lemonsqueezy.com
- **Documentation**: https://docs.lemonsqueezy.com
- **Pricing Tiers**: https://docs.lemonsqueezy.com/api/products-and-variants
- **Webhooks**: https://docs.lemonsqueezy.com/help/webhooks

### Paddle (Another Alternative)
- **Official Site**: https://www.paddle.com
- **Documentation**: https://developer.paddle.com
- **Subscription Management**: https://developer.paddle.com/reference/subscription-api

## PCI Compliance

### PCI DSS Standards
- **PCI Security Council**: https://www.pcisecuritystandards.org/
- **PCI DSS Requirements**: https://www.pcisecuritystandards.org/documents/PCI_DSS_v3-2-1.pdf
- **Compliance Checklist**: https://www.pcisecuritystandards.org/perspectives-articles/pcidss-v4-0-implementation-roadmap
- **Self-Assessment Questionnaires**: https://www.pcisecuritystandards.org/assessments/self-assessment

### Tokenization
- **Stripe Tokenization**: https://stripe.com/docs/tokens
- **Payment Method Tokens**: https://stripe.com/docs/payments/payment-methods
- **Card Tokenization**: https://stripe.com/docs/stripe-js/elements/payment-request-button

### Payment Security Best Practices
- **OWASP Payment Security**: https://cheatsheetseries.owasp.org/cheatsheets/Sensitive_Data_Exposure_Cheat_Sheet.html
- **Stripe Security**: https://stripe.com/docs/security
- **Never Store Raw Card Data**: https://stripe.com/docs/security/pci-compliance#what-to-send-to-stripe

## HIPAA Compliance

### HIPAA Technical Safeguards
- **HHS HIPAA Overview**: https://www.hhs.gov/hipaa/for-professionals/index.html
- **Security Rule**: https://www.hhs.gov/hipaa/for-professionals/security/index.html
- **Privacy Rule**: https://www.hhs.gov/hipaa/for-professionals/privacy/index.html
- **Breach Notification**: https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html

### HIPAA Authentication Requirements
- **Unique User ID**: https://www.ecfr.gov/current/title-45/part-164#164.312
- **Emergency Access Log**: https://www.ecfr.gov/current/title-45/section-164.312(a)(2)(i)
- **Encryption & Decryption**: https://www.ecfr.gov/current/title-45/section-164.312(a)(2)(ii)
- **Session Management**: https://www.ecfr.gov/current/title-45/section-164.312(a)(2)(i)

### HIPAA Business Associate Agreements
- **BAA Requirements**: https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html
- **Stripe's HIPAA Compliance**: Stripe does NOT sign BAAs (they handle payments, not PHI)
- **AWS Compliance**: https://aws.amazon.com/compliance/hipaa-eligible-services-reference/
- **PostgreSQL on AWS RDS**: Can be HIPAA-eligible with proper configuration

### HIPAA Security Audit Logging
- **Audit Control Requirements**: https://www.ecfr.gov/current/title-45/section-164.312(b)
- **Integrity Controls**: https://www.ecfr.gov/current/title-45/section-164.312(c)(1)
- **Minimum Necessary Principle**: https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/minimum-necessary/index.html

## Role-Based Access Control (RBAC)

### RBAC Concepts
- **Auth0 RBAC Guide**: https://auth0.com/docs/manage-users/access-control/rbac
- **OWASP RBAC**: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- **AWS IAM Roles**: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_understand-roles.html

### Attribute-Based Access Control (ABAC)
- **ABAC vs RBAC**: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#attribute-based-access-control-abac
- **Casbin (Policy Engine)**: https://casbin.org/
- **OPA (Open Policy Agent)**: https://www.openpolicyagent.org/

### Policy-as-Code
- **Oso (Authorization Library)**: https://www.osohq.com
- **Permit.io**: https://www.permit.io
- **FusionAuth**: https://fusionauth.io

## JWT Security

### JWT Standards
- **JWT RFC 7519**: https://tools.ietf.org/html/rfc7519
- **JSON Web Signature (JWS)**: https://tools.ietf.org/html/rfc7515
- **JSON Web Encryption (JWE)**: https://tools.ietf.org/html/rfc7516

### JWT Best Practices
- **OWASP JWT Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
- **JWT Best Practices (Auth0)**: https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/
- **JWT Debugger**: https://jwt.io/

### JWT Libraries
- **jsonwebtoken (Node.js)**: https://github.com/auth0/node-jsonwebtoken
- **jose (TypeScript)**: https://github.com/panva/jose
- **PyJWT (Python)**: https://github.com/jpadilla/pyjwt

## Session Management

### Session Storage
- **Redis (Session Store)**: https://redis.io
- **ioredis (Node.js Redis Client)**: https://github.com/luin/ioredis
- **Prisma Adapter**: https://authjs.dev/reference/adapter/prisma
- **Database Sessions**: Use PostgreSQL/MySQL (already in Week 6)

### Session Security
- **OWASP Session Fixation**: https://owasp.org/www-community/attacks/Session_fixation
- **HttpOnly Cookies**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#httponly
- **SameSite Cookies**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesiteSameSite
- **Secure Flag**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#secure

## Multi-Tenant Architecture

### Multi-Tenancy Patterns
- **Row-Level Security (RLS)**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Tenant Isolation**: https://aws.amazon.com/blogs/saas/multi-tenant-saas-applications-isolation/
- **Data Isolation**: https://cheatsheetseries.owasp.org/cheatsheets/Multi-Tenant_SaaS_API_Design_Cheat_Sheet.html

### Prisma Multi-Tenant Patterns
- **Prisma Multi-Tenancy**: https://www.prisma.io/blog/multi-tenancy-guide-tutorial
- **RLS with Prisma**: https://www.prisma.io/docs/concepts/data-platform/data-proxy#fine-grained-access-control-with-row-level-security

## TypeScript for Auth

### TypeScript with Auth.js
- **Auth.js TypeScript Guide**: https://authjs.dev/getting-started/typescript
- **Session Types**: https://authjs.dev/reference/types#session
- **JWT Types**: https://authjs.dev/reference/types#jwt

### NextAuth Type Declarations
```typescript
// Extend session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      clinicId: string;
    };
  }
}
```
- **Type Definitions**: https://authjs.dev/reference/types

## Testing Auth & Payments

### E2E Testing
- **Playwright**: https://playwright.dev
- **Cypress**: https://www.cypress.io
- **Testing Library**: https://testing-library.com

### Testing Stripe
- **Stripe Testing Guide**: https://stripe.com/docs/testing
- **Stripe Test Cards**: https://stripe.com/docs/testing#cards
- **Stripe Test Clock**: https://stripe.com/docs/testing/test-clocks
- **Mock Stripe**: https://github.com/epixa/mock-stripe

### Jest Unit Testing
- **Jest Documentation**: https://jestjs.io
- **Testing Auth Functions**: https://testing-library.com/docs/user-event/intro
- **Mocking Auth.js**: https://github.com/nextauthjs/next-auth/discussions/4700

## Security Guides

### OWASP Resources
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **Authorization Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- **Session Management Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

### Password Security
- **NIST Password Guidelines**: https://pages.nist.gov/800-63-3/sp800-63b.html
- **Password Hashing**: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- **bcrypt Library**: https://github.com/kelektiv/node.bcrypt.js
- **Argon2 (Recommended)**: https://github.com/ranisalt/node-argon2

## Industry Standards

### OAuth 2.0 & OpenID Connect
- **OAuth 2.0 RFC 6749**: https://tools.ietf.org/html/rfc6749
- **OpenID Connect**: https://openid.net/specs/openid-connect-core-1_0.html
- **Authorization Code Flow**: https://auth0.com/docs/get-started/authentication-and-authorization-flow
- **Proof Key for Public Clients (PKCE)**: https://tools.ietf.org/html/rfc7636

### SAML (Enterprise SSO)
- **SAML Specification**: https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language
- **SAML with Auth0**: https://auth0.com/docs/protocols/saml
- **SAML Debugger**: https://www.samltool.com/

## Deployment & Infrastructure

### Vercel (Recommended for Next.js)
- **Official Site**: https://vercel.com
- **Documentation**: https://vercel.com/docs
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **OAuth Redirect URLs**: Set on Vercel domain (e.g., https://myapp.vercel.app)

### Heroku
- **Documentation**: https://devcenter.heroku.com
- **Environment Config Vars**: https://devcenter.heroku.com/articles/config-vars
- **PostgreSQL on Heroku**: https://www.heroku.com/postgres

### AWS
- **Cognito (Managed Auth)**: https://aws.amazon.com/cognito/
- **Amplify**: https://aws.amazon.com/amplify/
- **ALB (for OAuth)**: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/

### Docker
- **Docker Documentation**: https://docs.docker.com
- **Docker Compose (for local dev)**: https://docs.docker.com/compose/
- **PostgreSQL Docker Image**: https://hub.docker.com/_/postgres

## Monitoring & Observability

### Logging
- **Winston (Node.js)**: https://github.com/winstonjs/winston
- **Pino (Fast Logger)**: https://getpino.io
- **Datadog**: https://www.datadoghq.com
- **CloudWatch (AWS)**: https://aws.amazon.com/cloudwatch/

### Error Tracking
- **Sentry**: https://sentry.io
- **Rollbar**: https://rollbar.com
- **Raygun**: https://raygun.com

### Analytics
- **PostHog**: https://posthog.com
- **Amplitude**: https://amplitude.com
- **Mixpanel**: https://mixpanel.com

## Useful Tools

### API Testing
- **Postman**: https://www.postman.com
- **Insomnia**: https://insomnia.rest
- **VS Code REST Client**: https://github.com/Huachao/vscode-restclient

### Database Tools
- **Prisma Studio**: Built-in GUI for database
- **pgAdmin**: https://www.pgadmin.org
- **DBeaver**: https://dbeaver.io

### Security Testing
- **OWASP ZAP**: https://www.zaproxy.org
- **Burp Suite**: https://portswigger.net/burp
- **npm audit**: Built-in security scanning

## Communities & Forums

### Discussion Spaces
- **Auth.js Discussions**: https://github.com/nextauthjs/next-auth/discussions
- **Stripe Community**: https://stripe.com/community
- **HIPAA Forum**: https://forum.hipaa.org
- **Reddit r/node**: https://reddit.com/r/node

### Conferences & Talks
- **NDC Conferences**: https://ndcconferences.com (Security talks)
- **OWASP AppSecCon**: https://owasp.org/www-project-appsec-conference/
- **CtrlaltConf**: https://ctrlaltconf.com (Security focused)

## Quick Reference Checklists

### Pre-Launch Checklist
- [ ] OAuth redirect URLs configured in Google/Microsoft/etc
- [ ] STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in production env
- [ ] NEXTAUTH_SECRET is strong random value (not hardcoded)
- [ ] Database backups configured
- [ ] HTTPS enforced (no HTTP)
- [ ] Error logging configured (Sentry/Datadog)
- [ ] Session timeout set (15-30 min for healthcare)
- [ ] Audit logging enabled for all auth events

### Security Checklist
- [ ] No hardcoded secrets in code
- [ ] All API endpoints check authentication
- [ ] RBAC enforced on backend (not frontend)
- [ ] Query filters isolate multi-tenant data
- [ ] Webhook signatures verified
- [ ] Passwords hashed with bcrypt/argon2
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured correctly

### HIPAA Readiness
- [ ] Audit logs captured for all auth events
- [ ] Session termination is immediate
- [ ] No PHI in tokens or logs
- [ ] Multi-tenant isolation verified
- [ ] Access controls enforce RBAC
- [ ] Encryption enabled (TLS for transit, at-rest)
- [ ] BAA reviewed with vendors (Stripe, Vercel, etc.)
- [ ] Incident response plan documented

---

**Last Updated**: April 2026
**Curated for**: Healthcare SaaS applications
**Level**: Advanced (assumes Weeks 1-6 knowledge)
