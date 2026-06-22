# Week 5 Live Notes — Next.js & React Server Components

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras trabajas con App Router, RSC, Server Actions. No tiene que estar pulido.*

---

## Day 1 — App Router vs Pages Router

**Concepto**: Next.js App Router (2023+) es más flexible. Usa file-based routing con carpetas.

```typescript
// Pages Router (old, still works)
// pages/users/[id].tsx
export default function UserPage({ userId }) { ... }

// App Router (new, recommended)
// app/users/[id]/page.tsx
export default function UserPage({ params }: { params: { id: string } }) { ... }

// Difference: App Router supports
// - Layouts (shared UI across routes)
// - Server Components (default, not useState)
// - Server Actions (form handling on server)
// - Streaming (progressive rendering)
```

**Patrón observado**: App Router = React 18 first. Server by default.

**Pregunta que surgió**: ¿Cuándo uso Client Components? Respuesta: Solo cuando necesitas interactividad.

---

## Day 2 — React Server Components (RSC)

**Concepto**: Componentes que ejecutan en el servidor. No envían JavaScript al cliente.

```typescript
// Server Component (default in App Router)
// app/users/UserList.tsx
export default async function UserList() {
  const users = await db.user.findAll(); // Server-only query

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Client Component (when you need useState, event handlers)
'use client'; // Mark as client-side

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// Composing them
// app/users/page.tsx
import UserList from './UserList'; // Server Component
import UserFilter from './UserFilter'; // Client Component

export default function Page() {
  return (
    <>
      <UserList />
      <UserFilter />
    </>
  );
}
```

**Patrón**: Server components por defecto. Agrega 'use client' solo cuando necesites.

---

## Day 3 — Server Actions

**Concepto**: Funciones que ejecutan en el servidor. Como "endpoints" pero type-safe.

```typescript
// Server Action
// app/users/actions.ts
'use server';

import { db } from '@/lib/db';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');

  // Validation
  if (!name || !email) throw new Error('Missing fields');

  // Create user
  const user = await db.user.create({ data: { name, email } });

  // Revalidate
  revalidatePath('/users');

  return user;
}

// Usage in Client Component
'use client';

import { createUser } from './actions';

export function UserForm() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Name" required />
      <input name="email" placeholder="Email" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Patrón**: Use Server Actions para POST/PUT/DELETE. Más seguro que API routes expuestos.

---

## Day 4 — Layouts & Nested Routing

**Concepto**: Layouts envuelven múltiples páginas. No se rerenderizar al navegar entre páginas.

```typescript
// app/layout.tsx (root layout)
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx (nested layout)
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar /> {/* persists across dashboard pages */}
      <main>{children}</main>
    </div>
  );
}

// Pages
// app/dashboard/page.tsx → renders DashboardLayout + children
// app/dashboard/analytics/page.tsx → same layout, different page
```

**Patrón**: Layouts persisten. Perfecto para sidebars, navegación, context.

---

## Day 5 — Streaming & Progressive Rendering

**Concepto**: Renderiza la página progresivamente. Usuario ve contenido mientras se carga.

```typescript
import { Suspense } from 'react';
import UserList from './UserList';
import UserListSkeleton from './UserListSkeleton';

// Streaming: UserListSkeleton se muestra mientras UserList carga
export default function Page() {
  return (
    <div>
      <h1>Users</h1>
      <Suspense fallback={<UserListSkeleton />}>
        <UserList />
      </Suspense>
    </div>
  );
}

// Result:
// 1. HTML con skeleton se envía inmediatamente
// 2. Usuario ve skeleton (fast)
// 3. UserList se renderiza en el servidor
// 4. Se envía HTML actualizado
// 5. React hydra la página
```

**Patrón**: Suspense + Server Components = streaming. Mejor UX.

---

## Patrones descubiertos

**Pattern 1: Progressive Enhancement**
Funciona sin JavaScript. Server Actions funcionan sin `<script>` si es form.

**Pattern 2: Server Component Composition**
Server Components llaman Server Actions. Clean separation.

**Pattern 3: Data Fetching in Components**
Async/await en Server Components. Sin useEffect, useState.

---

## Conexión con background

**De Auditoría**: Server Actions = controles server-side. Auditable, no se puede saltear.

**De QBP**: Menos JavaScript en cliente = menos complejidad = más confiable.

**De Ventas**: Mejor performance + SEO = mejor conversión.

---

## Notas Adicionales

- App Router es el futuro de Next.js. Pages Router deprecated.
- Server Components son default. Menos JavaScript = faster.
- Server Actions más seguro que API routes. Secret keys no expuestas.

---

**Última entrada**: 2026-04-30
**Próxima sesión**: 2026-05-01
