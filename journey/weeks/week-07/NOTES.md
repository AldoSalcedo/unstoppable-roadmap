# Week 7 Live Notes — Authentication & Payments

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras implementas Auth.js, RBAC, y Stripe. No tiene que estar pulido.*

---

## Day 1 — Authentication with Auth.js (formerly NextAuth)

**Concepto**: Auth.js maneja OAuth, JWT, sesiones. Integración segura con providers (Google, GitHub).

```typescript
// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Custom claims
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
});

// Middleware
export { auth as middleware } from "./auth";
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Patrón observado**: OAuth delegada a providers. Tú storages JWT + custom claims.

**Pregunta que surgió**: ¿JWT vs sesiones? Respuesta: JWT para móvil/SPA. Sesiones para server-side render.

---

## Day 2 — Role-Based Access Control (RBAC)

**Concepto**: No todos los usuarios tienen acceso a todo. Define roles y permisos.

```typescript
// auth/permissions.ts
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

const permissions: Record<Role, string[]> = {
  [Role.USER]: ['read:posts', 'create:post'],
  [Role.ADMIN]: ['read:posts', 'create:post', 'delete:post', 'manage:users'],
  [Role.MODERATOR]: ['read:posts', 'delete:post'],
};

// Middleware para proteger rutas
export async function withRole(
  req: NextRequest,
  requiredRoles: Role[]
) {
  const session = await auth();

  if (!session?.user?.role) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!requiredRoles.includes(session.user.role)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return null; // OK
}

// En Server Action
'use server';

import { auth } from '@/auth';

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session || !['admin', 'moderator'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }

  await db.post.delete({ where: { id: postId } });
}
```

**Patrón**: RBAC en el servidor. Cliente solo UI hints.

---

## Day 3 — Payment Processing with Stripe

**Concepto**: Stripe maneja procesamiento de pagos. Tú orchestras flujo.

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Server Action: crear checkout session
'use server';

export async function createCheckoutSession(priceId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const stripeSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
  });

  return { url: stripeSession.url };
}

// Webhook: verificar pago
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await updateUserSubscription(session.customer_email, session.metadata.planId);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

**Patrón**: Checkout session → Stripe hosted page → Webhook confirmation.

---

## Day 4 — Subscription Management

**Concepto**: Stripe maneja renovación automática. Tú controlas acceso.

```typescript
// Check subscription en middleware
export async function checkSubscription(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  // Válido si pagó y no está cancelado
  return subscription?.status === 'active' &&
         subscription.renew_date > new Date();
}

// Server Action: cancelar subscription
'use server';

export async function cancelSubscription() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    { cancel_at_period_end: true }
  );

  await db.subscription.update({
    where: { id: subscription.id },
    data: { canceledAt: new Date() },
  });
}
```

**Patrón**: Stripe = single source of truth para pagos. Tú syncs a base de datos.

---

## Day 5 — Security Best Practices

**Concepto**: Authentication y payments = alto riesgo. No confíes en el cliente.

```typescript
// Bad: confiar en cliente
const response = fetch('/api/upgrade', {
  method: 'POST',
  body: JSON.stringify({ newPlan: 'premium' }) // ← Cliente puede mentir
});

// Good: validar en servidor
'use server';

export async function upgradePlan(newPlan: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Validar que plan existe
  const plan = await db.plan.findUnique({ where: { id: newPlan } });
  if (!plan) throw new Error('Invalid plan');

  // Validar que usuario no tiene subscripción
  const existing = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (existing?.status === 'active') throw new Error('Already subscribed');

  // Crear sesión de checkout
  const session = await stripe.checkout.sessions.create({ ... });

  return { url: session.url };
}

// HTTPS obligatorio
// secrets = environment variables (no en código)
// CSRF protection = Auth.js incluida
// Rate limiting = protege contra ataques
```

**Patrón**: Nunca confíes en el cliente. Valida todo en servidor.

---

## Patrones descubiertos

**Pattern 1: Idempotency**
Mismo request dos veces = mismo resultado. Previene duplicados.

**Pattern 2: Webhook Verification**
Verifica firma de Stripe. Evita ataques.

**Pattern 3: Graceful Degradation**
Si Stripe cae, user can still use app (degraded mode).

---

## Conexión con background

**De Auditoría**: Auth = acceso control. Payments = transacción audit trail.

**De QBP**: Fraud prevention = cost control.

**De Ventas**: Subscription = recurring revenue = predictable.

---

## Notas Adicionales

- Auth.js >= NextAuth (nombre cambió)
- Stripe webhook = asíncrono, verifica signature siempre
- RBAC en servidor, no cliente

---

**Última entrada**: 2026-05-14
**Próxima sesión**: 2026-05-15
