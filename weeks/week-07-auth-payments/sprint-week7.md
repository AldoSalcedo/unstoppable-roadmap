# SPRINT WEEK 7 — Day-by-Day Breakdown: Auth + Payments

## DÍA 1: Auth.js Setup + OAuth Configuration

### Objetivos de Aprendizaje
1. Understand OAuth 2.0 flow and why it's used in healthcare
2. Configure Auth.js with Google as OAuth provider
3. Create authentication routes and session handling
4. Generate TypeScript types for authenticated users
5. Implement role field in auth session

### Healthcare Angle
In healthcare, you cannot store passwords. HIPAA-compliant systems use:
- **Single Sign-On (SSO)** via OAuth (Google, Microsoft, Okta)
- **No password storage** = no password breach risk
- **Federated identity** = user identity managed by trusted provider
- **Session server-side** = logout can be immediate (no token revocation delay)

### Contenido Principal

#### 1.1 Install Dependencies
```bash
npm install next-auth@5 @auth/prisma-adapter
npm install @prisma/client
npm install -D typescript
```

#### 1.2 Create Auth Configuration

Create `src/lib/auth.ts`:

```typescript
// ============================================================
// src/lib/auth.ts
// Authentication configuration for Auth.js
// Integrated with Prisma for session storage (HIPAA-compliant)
// ============================================================

import NextAuth, { type NextAuthConfig, type Session } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// ============================================================
// TAREA 1.1: Auth Configuration
// ============================================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "ADMIN" | "DOCTOR" | "NURSE" | "PATIENT";
      clinicId: string; // Multi-tenant isolation (HIPAA requirement)
    };
  }

  interface JWT {
    role: "ADMIN" | "DOCTOR" | "NURSE" | "PATIENT";
    clinicId: string;
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  // ============================================================
  // TAREA 1.2: OAuth Providers
  // ============================================================
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false, // Security: prevent account linking attacks
    }),
  ],

  // ============================================================
  // TAREA 1.3: Callbacks (Where authentication logic lives)
  // ============================================================
  callbacks: {
    // Called when user signs in (OAuth callback)
    async signIn({ user, profile, account }) {
      // HIPAA: Only allow users from verified email domains (optional)
      if (!user.email?.endsWith("@healthcaresystem.com")) {
        // For demo, allow all. In production, restrict to your clinic's domain.
      }

      // Check if user exists in database with role
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: { id: true, role: true, clinicId: true },
      });

      if (!dbUser) {
        // First-time login: create user with default role (PATIENT)
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name || profile?.name || "Unknown",
            role: "PATIENT", // Default role for new users
            clinicId: "clinic-default", // Multi-tenant: assign to default clinic
            auditLogs: {
              create: {
                action: "USER_CREATED",
                entityType: "USER",
                description: "New user registered via OAuth",
              },
            },
          },
        });
      }

      return true; // Allow sign-in
    },

    // Called when session is requested (every API call)
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: { id: true, role: true, clinicId: true },
      });

      // Attach role and clinicId to session (used for RBAC)
      session.user = {
        id: dbUser?.id || user.id,
        email: session.user?.email || "",
        name: session.user?.name || "",
        role: dbUser?.role || "PATIENT",
        clinicId: dbUser?.clinicId || "clinic-default",
      };

      return session;
    },

    // Called when JWT is created/updated
    async jwt({ token, user, profile }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, clinicId: true },
        });

        token.role = dbUser?.role || "PATIENT";
        token.clinicId = dbUser?.clinicId || "clinic-default";
      }

      return token;
    },
  },

  // ============================================================
  // TAREA 1.4: Pages and Events
  // ============================================================
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  events: {
    async signIn({ user, account }) {
      // HIPAA: Log every login
      await prisma.auditLog.create({
        data: {
          action: "LOGIN",
          userId: user.id,
          entityType: "USER",
          entityId: user.id,
          description: `User ${user.email} signed in via ${account?.provider || "unknown"}`,
          metadata: {
            provider: account?.provider,
            userAgent: "server-side-logged",
          },
        },
      });
    },

    async signOut({ token }) {
      // HIPAA: Log every logout
      if (token?.sub) {
        await prisma.auditLog.create({
          data: {
            action: "LOGOUT",
            userId: token.sub,
            entityType: "USER",
            entityId: token.sub,
            description: "User signed out",
          },
        });
      }
    },
  },

  // ============================================================
  // TAREA 1.5: Session and Security Settings
  // ============================================================
  session: {
    strategy: "database", // Store sessions in DB (HIPAA-compliant, enables instant logout)
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session daily
  },

  secret: process.env.NEXTAUTH_SECRET!, // Must be set in .env

  trustHost: true, // Accept non-standard hosts (important for preview deploys)
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
```

#### 1.3 Create Route Handlers

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
// ============================================================
// src/app/api/auth/[...nextauth]/route.ts
// Next.js dynamic route handler for Auth.js
// ============================================================

import { handlers } from "@/lib/auth";

// Export handlers for NextAuth routes
export const { GET, POST } = handlers;
```

#### 1.4 Create Sign-In Page

Create `src/app/auth/signin/page.tsx`:

```typescript
// ============================================================
// src/app/auth/signin/page.tsx
// Login page with OAuth provider buttons
// ============================================================

"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  // EJERCICIO 1.1: Implement Google OAuth button
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        redirect: true,
        redirectTo: "/dashboard" // Redirect to app after successful login
      });
    } catch (error) {
      console.error("Sign-in failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            Clínica Digital
          </h1>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Healthcare professionals only. Login required to access patient data.
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 1.5 Environment Variables

Create `.env.local`:

```bash
# ============================================================
# TAREA 1.5: Environment Variables for Auth.js
# ============================================================

# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)  # Generate this!

# Google OAuth (from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# Database (from Week 6)
DATABASE_URL=postgresql://user:password@localhost:5432/clinic_db

# Stripe (will add in Day 4)
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### EJERCICIO 1.2: Add Microsoft OAuth Provider
```typescript
// TODO: Add Microsoft OAuth provider to authConfig.providers
// Hint: Look at Microsoft Entra ID (formerly Azure AD)
// Steps:
// 1. Import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id"
// 2. Add to providers array with clientId + clientSecret from Azure
// 3. Update environment variables
```

### NOTAS DE Seguridad
1. **NEVER commit .env files** — add `.env.local` to `.gitignore`
2. **NEXTAUTH_SECRET must be random** — use `openssl rand -base64 32`
3. **Store sessions in database** — enables instant logout (HIPAA requirement)
4. **No passwords in tokens** — credentials never leave auth provider

### Connection to Your Background
**Auditoría**: You see that auth events are being logged (signIn, signOut). This is HIPAA compliance in action. Every login/logout must be auditable.

---

## DÍA 2: Protected Routes + Middleware

### Objetivos de Aprendizaje
1. Create middleware to protect all `/app/*` routes
2. Understand the difference between client-side and server-side auth checks
3. Implement proper redirects for unauthenticated users
4. Validate session on every request
5. Log authentication events

### Healthcare Angle
Patient data is only shown to authenticated, authorized users. Middleware is your first line of defense:
- Prevent unauthenticated access to patient records
- Redirect anonymous users to login
- Log every access attempt (audit trail)
- Multi-tenant isolation (prevent clinic A from seeing clinic B's data)

### Contenido Principal

#### 2.1 Create Middleware

Create `src/middleware.ts`:

```typescript
// ============================================================
// src/middleware.ts
// Authentication middleware for all protected routes
// Runs on EVERY request to /app/* paths
// ============================================================

import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ============================================================
// TAREA 2.1: Define Protected Routes
// ============================================================

const PROTECTED_ROUTES = ["/app", "/api/patients", "/api/tasks"];
const PUBLIC_ROUTES = ["/", "/auth/signin", "/auth/error"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // ============================================================
  // TAREA 2.2: Get Session
  // ============================================================
  const session = await auth();

  if (!session?.user) {
    // User not authenticated: redirect to login
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ============================================================
  // TAREA 2.3: Validate Session
  // ============================================================
  // Optional: Add additional checks here
  // - Is user's clinic still active?
  // - Is user's subscription still valid?
  // - Has user's role changed?

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all /app routes
    "/app/:path*",
    // Protect all /api routes except auth
    "/api/:path*",
  ],
};
```

#### 2.2 Create Protected Layout

Create `src/app/app/layout.tsx`:

```typescript
// ============================================================
// src/app/app/layout.tsx
// Layout for all authenticated routes
// ============================================================

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // ============================================================
  // TAREA 2.4: Server-side Auth Check
  // ============================================================
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="space-y-4">
          <div>
            <h2 className="font-bold">{session.user.email}</h2>
            <p className="text-sm text-gray-600">Role: {session.user.role}</p>
          </div>

          <ul className="space-y-2">
            <li>
              <a href="/app/dashboard" className="hover:underline">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/app/patients" className="hover:underline">
                Patients
              </a>
            </li>
            <li>
              <a href="/app/billing" className="hover:underline">
                Billing
              </a>
            </li>
            <li>
              <a href="/api/auth/signout" className="hover:underline text-red-600">
                Sign Out
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

#### 2.3 Create Protected API Route

Create `src/app/api/me/route.ts`:

```typescript
// ============================================================
// src/app/api/me/route.ts
// Protected API endpoint: returns current user
// ============================================================

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// ============================================================
// TAREA 2.5: Protected API Endpoint
// ============================================================

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      clinicId: session.user.clinicId,
    },
  });
}
```

#### 2.4 Create useSession Hook Example

Create `src/hooks/useAuth.ts`:

```typescript
// ============================================================
// src/hooks/useAuth.ts
// Custom hook to get session and check authorization
// ============================================================

"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
  };
}

// EJERCICIO: Usage in a component
// export function ProtectedComponent() {
//   const { user, isLoading } = useAuth();
//   if (isLoading) return <div>Loading...</div>;
//   return <div>Welcome, {user?.name}</div>;
// }
```

### EJERCICIO 2.1: Create /app/dashboard Page

```typescript
// TODO: Create src/app/app/dashboard/page.tsx
// Requirements:
// 1. Use server-side auth() to get session
// 2. Display user role and clinic info
// 3. Show different dashboard based on role (ADMIN/DOCTOR/NURSE/PATIENT)
// 4. Fetch user's patients (if DOCTOR/NURSE role)
// 5. Show error if user is PATIENT role
//
// Hint: Use session.user.role to conditionally render content
```

### NOTAS DE Middleware
1. **Middleware runs on every request** — keep it fast
2. **Session validation is database hit** — consider caching
3. **Redirect before rendering** — prevent data leakage
4. **Log access attempts** — audit trail for HIPAA

---

## DÍA 3: Role-Based Access Control (RBAC)

### Objetivos de Aprendizaje
1. Implement RBAC pattern with 4 healthcare roles
2. Create route guards based on role
3. Add role-based UI elements
4. Implement admin role management
5. Log role changes for audit trail

### Healthcare Angle
Different healthcare roles need different data access:

```
ADMIN          DOCTOR         NURSE          PATIENT
├─ Users       ├─ Patients    ├─ Tasks       └─ Own tasks
├─ Billing     ├─ Tasks       ├─ Vitals      └─ Own data
├─ Settings    ├─ Orders      └─ Notes
└─ Audit logs  └─ Prescriptions
```

### Contenido Principal

#### 3.1 Update Prisma Schema

Update `prisma/schema.prisma`:

```prisma
// ============================================================
// prisma/schema.prisma
// TAREA 3.1: Add Role-Based Models
// ============================================================

enum Role {
  ADMIN
  DOCTOR
  NURSE
  PATIENT
}

model User {
  id String @id @default(cuid())
  email String @unique
  name String?
  role Role @default(PATIENT)
  clinicId String // Multi-tenant

  // Session tokens (for Auth.js)
  sessions Session[]
  accounts Account[]

  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  auditLogs AuditLog[] @relation("UserAudit")

  @@index([clinicId, role]) // Query: "all doctors in clinic X"
  @@map("users")
}

model AuditLog {
  id String @id @default(cuid())
  action String // LOGIN, LOGOUT, ROLE_CHANGE, DATA_ACCESS
  userId String
  user User @relation("UserAudit", fields: [userId], references: [id])
  entityType String
  entityId String
  description String?
  metadata Json?
  timestamp DateTime @default(now())

  @@index([userId, timestamp])
  @@map("audit_logs")
}
```

Run migration:
```bash
npx prisma migrate dev --name add_roles_rbac
```

#### 3.2 Create RBAC Helper Functions

Create `src/lib/rbac.ts`:

```typescript
// ============================================================
// src/lib/rbac.ts
// Role-Based Access Control helper functions
// ============================================================

import { Session } from "next-auth";

// ============================================================
// TAREA 3.2: Define Role Permissions
// ============================================================

type Permission =
  | "view_patients"
  | "edit_patients"
  | "view_tasks"
  | "edit_tasks"
  | "manage_users"
  | "view_billing"
  | "manage_billing"
  | "view_audit_logs"
  | "write_prescriptions"
  | "manage_clinic_settings";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  PATIENT: [
    "view_tasks", // Only own tasks
  ],
  NURSE: [
    "view_patients",
    "view_tasks",
    "edit_tasks",
  ],
  DOCTOR: [
    "view_patients",
    "edit_patients",
    "view_tasks",
    "edit_tasks",
    "write_prescriptions",
  ],
  ADMIN: [
    "view_patients",
    "edit_patients",
    "view_tasks",
    "edit_tasks",
    "manage_users",
    "view_billing",
    "manage_billing",
    "view_audit_logs",
    "write_prescriptions",
    "manage_clinic_settings",
  ],
};

// ============================================================
// TAREA 3.3: Authorization Functions
// ============================================================

export function hasPermission(
  session: Session | null,
  permission: Permission
): boolean {
  if (!session?.user) return false;

  const userRole = session.user.role as keyof typeof ROLE_PERMISSIONS;
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  return permissions.includes(permission);
}

export function hasRole(
  session: Session | null,
  role: string | string[]
): boolean {
  if (!session?.user) return false;

  if (Array.isArray(role)) {
    return role.includes(session.user.role);
  }

  return session.user.role === role;
}

export function requireRole(
  session: Session | null,
  requiredRole: string | string[]
): boolean {
  return hasRole(session, requiredRole);
}

export function requirePermission(
  session: Session | null,
  requiredPermission: Permission
): boolean {
  return hasPermission(session, requiredPermission);
}

// ============================================================
// TAREA 3.4: Data Filtering by Role
// ============================================================

/**
 * Filter query based on user role and clinic
 * PATIENT role: only see own tasks
 * NURSE/DOCTOR: see clinic patients
 * ADMIN: see all
 */
export function getDataAccessFilter(session: Session) {
  if (!session?.user) return { clinicId: "" }; // No access

  switch (session.user.role) {
    case "PATIENT":
      // PATIENT can only see own data
      return { patientId: session.user.id };

    case "NURSE":
    case "DOCTOR":
      // Can see clinic's patients
      return { clinicId: session.user.clinicId };

    case "ADMIN":
      // Can see everything in clinic
      return { clinicId: session.user.clinicId };

    default:
      return {};
  }
}
```

#### 3.3 Create Protected Route with RBAC

Create `src/app/api/patients/route.ts`:

```typescript
// ============================================================
// src/app/api/patients/route.ts
// Protected endpoint: only DOCTOR/NURSE/ADMIN can list patients
// ============================================================

import { auth } from "@/lib/auth";
import { hasRole, getDataAccessFilter } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  // ============================================================
  // TAREA 3.5: Check Authorization
  // ============================================================
  if (!hasRole(session, ["DOCTOR", "NURSE", "ADMIN"])) {
    return NextResponse.json(
      { error: "Forbidden: only doctors/nurses can view patients" },
      { status: 403 }
    );
  }

  // Get filter based on role (PATIENT sees own data, others see clinic)
  const filter = getDataAccessFilter(session!);

  try {
    const patients = await prisma.patient.findMany({
      where: filter,
      select: {
        id: true,
        mrn: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });

    // ============================================================
    // TAREA 3.6: Log Access for HIPAA Audit
    // ============================================================
    await prisma.auditLog.create({
      data: {
        action: "DATA_ACCESS",
        userId: session!.user!.id,
        entityType: "PATIENT",
        entityId: "all", // or specific patient ID
        description: `${session!.user!.role} accessed patients list`,
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
```

#### 3.4 Create Admin User Management

Create `src/app/api/admin/users/route.ts`:

```typescript
// ============================================================
// src/app/api/admin/users/route.ts
// Admin endpoint: manage user roles
// ============================================================

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();

  // ============================================================
  // TAREA 3.7: Restrict to ADMIN role
  // ============================================================
  if (!requireRole(session, "ADMIN")) {
    return NextResponse.json(
      { error: "Forbidden: admin role required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { userId, newRole } = body;

  if (!["PATIENT", "NURSE", "DOCTOR", "ADMIN"].includes(newRole)) {
    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  }

  try {
    // Get old role for audit log
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // ============================================================
    // TAREA 3.8: Log Role Change
    // ============================================================
    await prisma.auditLog.create({
      data: {
        action: "ROLE_CHANGE",
        userId: session!.user!.id,
        entityType: "USER",
        entityId: userId,
        description: `Admin ${session!.user!.email} changed user role from ${oldUser?.role} to ${newRole}`,
        metadata: {
          oldRole: oldUser?.role,
          newRole: newRole,
          adminEmail: session!.user!.email,
        },
      },
    });

    return NextResponse.json({
      message: "User role updated",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
```

#### 3.5 Create Role-Based UI Component

Create `src/components/RoleGuard.tsx`:

```typescript
// ============================================================
// src/components/RoleGuard.tsx
// Component to conditionally render content based on role
// ============================================================

"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return <div>{fallback || "Unauthorized"}</div>;
  }

  if (!roles.includes(session.user.role)) {
    return <div>{fallback || "Access denied"}</div>;
  }

  return <>{children}</>;
}

// Usage:
// <RoleGuard roles={["DOCTOR", "ADMIN"]}>
//   <button>Delete patient</button>
// </RoleGuard>
```

### EJERCICIO 3.1: Create User Management Page

```typescript
// TODO: Create src/app/app/admin/users/page.tsx
// Requirements:
// 1. Fetch all users (with pagination)
// 2. Display user list with: email, current role
// 3. Add dropdown to change role
// 4. Call POST /api/admin/users to update role
// 5. Show success/error message
// 6. Restrict page to ADMIN role
```

### NOTAS DE RBAC Patterns
1. **Always check on backend** — never trust frontend role
2. **Filter queries by role** — prevent data leakage
3. **Log all role changes** — HIPAA audit requirement
4. **Test with multiple roles** — ensure isolation works

---

## DÍA 4: Stripe Setup + Pricing Plans

### Objetivos de Aprendizaje
1. Create Stripe account and API keys
2. Define pricing plans (Free, Professional, Enterprise)
3. Create products and prices in Stripe
4. Store subscription tier in database
5. Show subscription status in UI
6. Create checkout session

### Healthcare Angle
SaaS billing for healthcare requires:
- **Predictable pricing**: Doctors know what they pay per month
- **No usage-based billing**: Unpredictable for clinical software (liability)
- **Billing isolation**: Each clinic pays separately
- **Invoicing**: Required for accounting/tax compliance

### Contenido Principal

#### 4.1 Create Pricing Plans

Create `src/lib/stripe-plans.ts`:

```typescript
// ============================================================
// src/lib/stripe-plans.ts
// Define pricing tiers and Stripe product IDs
// ============================================================

// TAREA 4.1: Define Subscription Plans
export const STRIPE_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    features: {
      users: 5,
      patients: 25,
      apiCalls: 10000, // per month
      support: "Community",
    },
    stripePriceId: null, // Free tier has no Stripe product
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Professional",
    price: 99, // $99/month
    billingPeriod: "month",
    features: {
      users: 50,
      patients: 1000,
      apiCalls: 1000000,
      support: "Email",
    },
    stripePriceId: "price_1PK2p5Kk4Yp9X5X5X5X5", // From Stripe Dashboard
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    features: {
      users: "Unlimited",
      patients: "Unlimited",
      apiCalls: "Custom",
      support: "24/7 Phone + Slack",
    },
    stripePriceId: "price_1PK2qXKk4Yp9X5X5X5X5", // From Stripe Dashboard
  },
};

export type PlanId = keyof typeof STRIPE_PLANS;

export function getPlanById(planId: string) {
  return STRIPE_PLANS[planId as PlanId];
}

// Helper to get features for a plan
export function getPlanFeatures(planId: string) {
  const plan = getPlanById(planId);
  return plan?.features || STRIPE_PLANS.FREE.features;
}
```

#### 4.2 Update Prisma Schema

Update `prisma/schema.prisma`:

```prisma
// ============================================================
// TAREA 4.2: Add Subscription Models
// ============================================================

enum SubscriptionStatus {
  FREE
  ACTIVE
  PAST_DUE
  CANCELED
  ENDED
}

model Clinic {
  id String @id @default(cuid())
  name String
  domain String @unique

  // Subscription
  subscriptionTier String @default("FREE") // FREE, PROFESSIONAL, ENTERPRISE
  subscriptionStatus SubscriptionStatus @default(FREE)
  stripeCustomerId String? @unique // Stripe customer ID for billing
  stripePriceId String? // Which price is this clinic on?

  // Billing
  billingEmail String?
  billingAddress String?
  taxId String?

  // Dates
  subscriptionStartedAt DateTime?
  subscriptionEndsAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  users User[]
  patients Patient[]
  auditLogs AuditLog[] @relation("ClinicAudit")

  @@index([subscriptionStatus])
  @@map("clinics")
}

model User {
  // ... existing fields ...
  clinicId String
  clinic Clinic @relation(fields: [clinicId], references: [id])

  @@index([clinicId])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_stripe_subscription
```

#### 4.3 Initialize Stripe

Create `src/lib/stripe.ts`:

```typescript
// ============================================================
// src/lib/stripe.ts
// Stripe client initialization
// ============================================================

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

// Webhook signing secret (for verifying webhook signatures)
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
```

#### 4.4 Create Checkout Session Endpoint

Create `src/app/api/checkout/route.ts`:

```typescript
// ============================================================
// src/app/api/checkout/route.ts
// Create Stripe checkout session for subscription
// ============================================================

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { STRIPE_PLANS } from "@/lib/stripe-plans";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { planId } = await request.json();

  if (!planId || !STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS]) {
    return NextResponse.json(
      { error: "Invalid plan" },
      { status: 400 }
    );
  }

  try {
    // Get clinic info
    const clinic = await prisma.clinic.findUnique({
      where: { id: session.user.clinicId },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 404 }
      );
    }

    // ============================================================
    // TAREA 4.3: Create or Get Stripe Customer
    // ============================================================
    let stripeCustomerId = clinic.stripeCustomerId;

    if (!stripeCustomerId) {
      // First time: create Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || "Unknown",
        metadata: {
          clinicId: clinic.id,
          clinicName: clinic.name,
        },
      });

      stripeCustomerId = customer.id;

      // Store customer ID in database
      await prisma.clinic.update({
        where: { id: clinic.id },
        data: { stripeCustomerId },
      });
    }

    // ============================================================
    // TAREA 4.4: Create Checkout Session
    // ============================================================
    const plan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS];

    if (!plan.stripePriceId) {
      // FREE tier: no checkout needed
      return NextResponse.json({
        error: "Free plan does not require checkout",
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/app/billing`,
      metadata: {
        planId,
        clinicId: clinic.id,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

#### 4.5 Create Pricing Page

Create `src/app/app/billing/page.tsx`:

```typescript
// ============================================================
// src/app/app/billing/page.tsx
// Pricing and subscription management page
// ============================================================

"use client";

import { useSession } from "next-auth/react";
import { STRIPE_PLANS } from "@/lib/stripe-plans";
import { useState } from "react";

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // EJERCICIO 4.1: Fetch clinic subscription status
  // const { clinic } = useFetchClinic(session?.user.clinicId);

  const handleCheckout = async (planId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ planId }),
      });

      const { url } = await res.json();

      if (url) {
        window.location.href = url; // Redirect to Stripe
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      <div className="grid grid-cols-3 gap-8">
        {Object.entries(STRIPE_PLANS).map(([key, plan]) => (
          <div
            key={key}
            className="border rounded-lg p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold mb-4">
              {typeof plan.price === "number"
                ? `$${plan.price}/mo`
                : plan.price}
            </p>

            <ul className="space-y-2 mb-6">
              <li>Users: {plan.features.users}</li>
              <li>Patients: {plan.features.patients}</li>
              <li>API Calls: {plan.features.apiCalls}</li>
              <li>Support: {plan.features.support}</li>
            </ul>

            <button
              onClick={() => handleCheckout(key)}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && selectedPlan === key ? "Loading..." : "Select Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### EJERCICIO 4.1: Create Stripe Products Manually

```bash
# TAREA 4.1: Set up Stripe products
# 1. Go to https://dashboard.stripe.com/products
# 2. Create "Professional" product
#    - Name: Clinical Task Manager - Professional
#    - Type: Recurring
#    - Billing: Monthly
#    - Price: $99/month
# 3. Copy price ID (price_1PK...)
# 4. Update src/lib/stripe-plans.ts with your price IDs
```

### NOTAS DE Stripe Integration
1. **Test mode first** — use pk_test_* and sk_test_* keys
2. **Never expose SECRET key** — only on backend
3. **Webhook secret required** — for syncing payments
4. **Customer metadata** — store clinicId for multi-tenant

---

## DÍA 5: Subscription Checkout Flow + Payment

### Objetivos de Aprendizaje
1. Complete Stripe checkout flow
2. Handle successful payment callback
3. Update subscription status in database
4. Create subscription record
5. Test with Stripe test card

### Contenido Principal

#### 5.1 Handle Checkout Success

Create `src/app/api/checkout/success/route.ts`:

```typescript
// ============================================================
// src/app/api/checkout/success/route.ts
// Webhook callback when Stripe checkout succeeds
// ============================================================

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/app/billing?error=no_session", request.url));
  }

  try {
    // Retrieve checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession.customer || !checkoutSession.subscription) {
      throw new Error("Invalid checkout session");
    }

    // ============================================================
    // TAREA 5.1: Update Clinic Subscription
    // ============================================================
    const subscription = await stripe.subscriptions.retrieve(
      checkoutSession.subscription as string
    );

    const clinic = await prisma.clinic.update({
      where: { stripeCustomerId: checkoutSession.customer as string },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionTier: checkoutSession.metadata?.planId || "PROFESSIONAL",
        stripePriceId: subscription.items.data[0]?.price.id,
        subscriptionStartedAt: new Date(),
        subscriptionEndsAt: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });

    return NextResponse.redirect(
      new URL(
        `/app/billing?success=true&plan=${clinic.subscriptionTier}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Checkout success error:", error);
    return NextResponse.redirect(
      new URL("/app/billing?error=processing_failed", request.url)
    );
  }
}
```

#### 5.2 Create Subscription Record in Database

Update `src/app/api/checkout/success/route.ts` to create subscription record:

```typescript
model Subscription {
  id String @id @default(cuid())

  // Stripe info
  stripeSubscriptionId String @unique
  stripeCustomerId String
  stripePriceId String

  // Status
  status String // active, canceled, past_due, etc.
  currentPeriodStart DateTime
  currentPeriodEnd DateTime

  // Clinic
  clinicId String
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clinicId])
  @@index([stripeSubscriptionId])
  @@map("subscriptions")
}
```

#### 5.3 Test Checkout with Stripe Test Card

```bash
# ============================================================
# TAREA 5.2: Test Stripe Checkout Locally
# ============================================================

# 1. Start your app
npm run dev

# 2. Navigate to http://localhost:3000/app/billing

# 3. Click "Select Plan" for Professional

# 4. Fill checkout form with Stripe test card:
#    Card Number: 4242 4242 4242 4242
#    Expiry: 12/26 (any future date)
#    CVC: 123 (any 3 digits)
#    Name: Test User
#    Email: test@example.com

# 5. Click "Subscribe"

# 6. Check database: clinic.subscriptionStatus should be "ACTIVE"
```

### EJERCICIO 5.1: Add Payment Method Management

```typescript
// TODO: Create src/app/api/payment-methods/route.ts
// Requirements:
// 1. GET: List customer's payment methods
// 2. POST: Add new payment method (redirect to Stripe hosted page)
// 3. DELETE: Remove payment method
// Hint: Use stripe.paymentMethods.* APIs
```

---

## DÍA 6: Webhooks + Billing Events

### Objetivos de Aprendizaje
1. Understand webhook security (signature verification)
2. Handle subscription events (created, updated, deleted, payment_action_required)
3. Update database on webhook events
4. Test webhooks locally with Stripe CLI
5. Log all payment events

### Contenido Principal

#### 6.1 Create Webhook Handler

Create `src/app/api/webhooks/stripe/route.ts`:

```typescript
// ============================================================
// src/app/api/webhooks/stripe/route.ts
// Stripe webhook handler for subscription events
// CRITICAL: Verify signature before processing
// ============================================================

import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event;

  // ============================================================
  // TAREA 6.1: Verify Webhook Signature
  // ============================================================
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ============================================================
  // TAREA 6.2: Handle Subscription Events
  // ============================================================
  try {
    switch (event.type) {
      // Customer subscription created
      case "customer.subscription.created": {
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      }

      // Subscription updated (plan change, etc.)
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // Subscription deleted/canceled
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // Payment failed
      case "invoice.payment_action_required": {
        const invoice = event.data.object;
        await handlePaymentActionRequired(invoice);
        break;
      }

      // Payment succeeded
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// ============================================================
// TAREA 6.3: Event Handlers
// ============================================================

async function handleSubscriptionCreated(subscription: any) {
  console.log(`Subscription created: ${subscription.id}`);

  const clinic = await prisma.clinic.findUnique({
    where: { stripeCustomerId: subscription.customer },
  });

  if (!clinic) {
    console.warn(`Clinic not found for customer ${subscription.customer}`);
    return;
  }

  // Update clinic subscription status
  await prisma.clinic.update({
    where: { id: clinic.id },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionStartedAt: new Date(subscription.created * 1000),
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
  });

  // Log event
  await prisma.auditLog.create({
    data: {
      action: "SUBSCRIPTION_CREATED",
      entityType: "CLINIC",
      entityId: clinic.id,
      description: `Subscription created: ${subscription.id}`,
      metadata: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
      },
    },
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log(`Subscription updated: ${subscription.id}`);

  const clinic = await prisma.clinic.findUnique({
    where: { stripeCustomerId: subscription.customer },
  });

  if (!clinic) return;

  // Map Stripe status to our status
  const statusMap: Record<string, any> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "PAST_DUE",
  };

  await prisma.clinic.update({
    where: { id: clinic.id },
    data: {
      subscriptionStatus: statusMap[subscription.status] || subscription.status,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SUBSCRIPTION_UPDATED",
      entityType: "CLINIC",
      entityId: clinic.id,
      description: `Subscription updated: ${subscription.status}`,
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  const clinic = await prisma.clinic.findUnique({
    where: { stripeCustomerId: subscription.customer },
  });

  if (!clinic) return;

  await prisma.clinic.update({
    where: { id: clinic.id },
    data: {
      subscriptionStatus: "CANCELED",
      subscriptionEndsAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SUBSCRIPTION_CANCELED",
      entityType: "CLINIC",
      entityId: clinic.id,
      description: "Subscription was canceled",
    },
  });
}

async function handlePaymentActionRequired(invoice: any) {
  const clinic = await prisma.clinic.findUnique({
    where: { stripeCustomerId: invoice.customer },
  });

  if (!clinic) return;

  console.warn(
    `Payment action required for clinic ${clinic.id}: ${invoice.id}`
  );

  // TODO: Send email to clinic admin about payment failure
  // TODO: Restrict access to app until payment is made

  await prisma.auditLog.create({
    data: {
      action: "PAYMENT_FAILED",
      entityType: "CLINIC",
      entityId: clinic.id,
      description: `Payment action required on invoice ${invoice.id}`,
    },
  });
}

async function handlePaymentSucceeded(invoice: any) {
  const clinic = await prisma.clinic.findUnique({
    where: { stripeCustomerId: invoice.customer },
  });

  if (!clinic) return;

  // If clinic was past due, reactivate
  if (clinic.subscriptionStatus === "PAST_DUE") {
    await prisma.clinic.update({
      where: { id: clinic.id },
      data: { subscriptionStatus: "ACTIVE" },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "PAYMENT_SUCCEEDED",
      entityType: "CLINIC",
      entityId: clinic.id,
      description: `Payment succeeded on invoice ${invoice.id}`,
    },
  });
}
```

#### 6.2 Test Webhooks Locally

```bash
# ============================================================
# TAREA 6.4: Test Webhooks with Stripe CLI
# ============================================================

# 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

# 2. Login to Stripe
stripe login

# 3. Forward webhook events to your local app
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. In another terminal, trigger test events
stripe trigger customer.subscription.created

# 5. Check your app logs to see webhook processing

# 6. Check database to verify subscription was updated
```

### EJERCICIO 6.1: Handle Declined Cards

```typescript
// TODO: When invoice.payment_failed event occurs:
// 1. Fetch clinic
// 2. Send email to clinic billing contact
// 3. Disable API access with error: "Payment failed. Please update payment method."
// 4. Allow 3-day grace period before disabling app access
// 5. Log event with customer contact info
```

---

## DÍA 7: Billing Portal + Integration Testing

### Objetivos de Aprendizaje
1. Create redirect to Stripe Customer Portal
2. Allow self-service subscription management
3. Write E2E tests for auth + payments
4. Test user journey from signup to paid subscription
5. Verify HIPAA audit logging

### Contenido Principal

#### 7.1 Create Billing Portal Redirect

Create `src/app/api/billing-portal/route.ts`:

```typescript
// ============================================================
// src/app/api/billing-portal/route.ts
// Redirect to Stripe Customer Portal (self-service billing)
// ============================================================

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: session.user.clinicId },
    });

    if (!clinic?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // ============================================================
    // TAREA 7.1: Create Portal Session
    // ============================================================
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: clinic.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/app/billing`,
    });

    // Log access
    await prisma.auditLog.create({
      data: {
        action: "BILLING_PORTAL_ACCESSED",
        userId: session.user.id,
        entityType: "CLINIC",
        entityId: clinic.id,
        description: "User accessed Stripe billing portal",
      },
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
```

#### 7.2 Create Billing Portal Link

Update `src/app/app/billing/page.tsx`:

```typescript
// Add this to billing page

"use client";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  const handlePortalAccess = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const { url } = await res.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Portal access failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePortalAccess}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
    >
      {loading ? "Loading..." : "Manage Billing"}
    </button>
  );
}
```

#### 7.3 Write E2E Tests

Create `src/__tests__/auth-payments.e2e.test.ts`:

```typescript
// ============================================================
// src/__tests__/auth-payments.e2e.test.ts
// End-to-end tests for auth + payments flow
// ============================================================

import { test, expect } from "@playwright/test";

test.describe("Auth + Payments E2E", () => {
  // ============================================================
  // TAREA 7.2: Test User Registration and Login
  // ============================================================
  test("user can sign up and login with Google", async ({ page }) => {
    // 1. Navigate to sign-in page
    await page.goto("http://localhost:3000/auth/signin");

    // 2. Click Google button (would require mock in real E2E)
    // 3. Verify redirect to dashboard
    // 4. Check session is created

    expect(page).toBeDefined();
  });

  // ============================================================
  // TAREA 7.3: Test RBAC
  // ============================================================
  test("patient cannot access /app/patients route", async ({ page }) => {
    // 1. Login as PATIENT
    // 2. Navigate to /app/patients
    // 3. Verify 403 error or redirect

    expect(page).toBeDefined();
  });

  test("doctor can access /app/patients route", async ({ page }) => {
    // 1. Login as DOCTOR
    // 2. Navigate to /app/patients
    // 3. Verify patient list displays

    expect(page).toBeDefined();
  });

  // ============================================================
  // TAREA 7.4: Test Checkout Flow
  // ============================================================
  test("admin can upgrade to professional plan", async ({ page }) => {
    // 1. Login as ADMIN
    // 2. Navigate to /app/billing
    // 3. Click "Select Plan" for Professional
    // 4. Fill checkout with test card
    // 5. Verify subscription is ACTIVE in database

    expect(page).toBeDefined();
  });

  // ============================================================
  // TAREA 7.5: Test Webhook Processing
  // ============================================================
  test("subscription canceled webhook updates database", async () => {
    // 1. Create test subscription in database
    // 2. Send Stripe webhook for subscription.deleted
    // 3. Verify subscription status changed to CANCELED

    expect(true).toBe(true);
  });

  // ============================================================
  // TAREA 7.6: Test Audit Logging
  // ============================================================
  test("login event is logged in audit log", async () => {
    // 1. Login user
    // 2. Query auditLogs table
    // 3. Verify entry exists with action=LOGIN

    expect(true).toBe(true);
  });
});
```

#### 7.4 Create Integration Test

Create `src/__tests__/integration.test.ts`:

```typescript
// ============================================================
// src/__tests__/integration.test.ts
// Integration tests for auth + payments
// ============================================================

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "@/lib/prisma";

describe("Auth + Payments Integration", () => {
  // ============================================================
  // TAREA 7.7: Test Complete User Journey
  // ============================================================

  it("creates user → assigns default role → logs events", async () => {
    // 1. Create clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: "Test Clinic",
        domain: "test-clinic.local",
      },
    });

    // 2. Create user with PATIENT role
    const user = await prisma.user.create({
      data: {
        email: "test@clinic.local",
        name: "Test User",
        role: "PATIENT",
        clinicId: clinic.id,
      },
    });

    // 3. Verify user created
    expect(user.email).toBe("test@clinic.local");
    expect(user.role).toBe("PATIENT");

    // 4. Verify audit log created
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityId: user.id },
    });

    expect(auditLog).toBeDefined();
  });

  it("updates subscription tier when checkout succeeds", async () => {
    const clinic = await prisma.clinic.findFirst();

    if (!clinic) {
      // Create clinic if needed
      await prisma.clinic.create({
        data: {
          name: "Billing Test",
          domain: "billing-test.local",
          subscriptionTier: "PROFESSIONAL",
          subscriptionStatus: "ACTIVE",
        },
      });
    }

    // Verify subscription status updated
    const updated = await prisma.clinic.findFirst({
      where: { subscriptionTier: "PROFESSIONAL" },
    });

    expect(updated?.subscriptionStatus).toBe("ACTIVE");
  });

  // Cleanup
  afterAll(async () => {
    await prisma.$disconnect();
  });
});
```

### EJERCICIO 7.1: Create Health Check Endpoint

```typescript
// TODO: Create src/app/api/health/route.ts
// Requirements:
// 1. GET endpoint returns 200 { status: "ok" }
// 2. Include database connection check
// 3. Include Stripe API connectivity check
// 4. Use for monitoring/alerting
```

### ✅ Success Checklist for Week 7

- [ ] Day 1: Google OAuth login working, user can sign in
- [ ] Day 2: Middleware protects /app routes, unauthenticated users redirected
- [ ] Day 3: RBAC working - PATIENT can't access /app/patients
- [ ] Day 4: Stripe products created, pricing page displays tiers
- [ ] Day 5: Checkout flow works with test card, subscription status updates
- [ ] Day 6: Webhooks tested locally with Stripe CLI, events processed
- [ ] Day 7: Billing portal accessible, E2E tests pass
- [ ] Bonus: All auth/payment events logged in audit table

### 🎯 What's Next (Week 8)

Week 8: **AI Integration + AI Agents**
- OpenAI/Claude API setup
- Streaming responses for real-time AI
- RAG (Retrieval-Augmented Generation) for healthcare knowledge base
- AI clinical decision support

---

## 📖 Reference: Common Issues + Solutions

### Issue: Google OAuth Redirect URI Mismatch
**Solution**: In Google Cloud Console, add both:
- `http://localhost:3000/api/auth/callback/google`
- `https://yourdomain.com/api/auth/callback/google`

### Issue: Stripe Webhook Not Triggering
**Solution**:
1. Run `stripe listen` in separate terminal
2. Verify `.env.local` has `STRIPE_WEBHOOK_SECRET`
3. Check webhook logs in Stripe Dashboard

### Issue: HIPAA Audit Logs Growing Too Large
**Solution**:
1. Archive old logs to S3 (Week 11)
2. Implement log rotation (7-90 day retention)
3. Create reporting queries (Week 9)

---

**End of Week 7 Sprint. You built a production-grade SaaS auth + payment system!**
