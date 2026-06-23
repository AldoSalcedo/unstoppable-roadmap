# 🗓️ Sprint Week 05 — Next.js & Server Components

**Proyecto:** `task-manager-nextjs` — Task Manager Clínico  
**Stack:** Next.js 16.2.9 · React 19 · TypeScript 5 · Tailwind CSS 4  
**Duración:** 7 días  
**Objetivo:** Dominar el paradigma RSC (React Server Components) y full-stack con App Router

---

## ⚠️ Breaking Changes: Next.js 16 vs 14

| Patrón | Next.js 14 (viejo) | Next.js 16 (actual) |
|--------|-------------------|---------------------|
| `params` | `{ params: { id: string } }` | `{ params: Promise<{ id: string }> }` |
| `searchParams` | `{ searchParams: { q: string } }` | `{ searchParams: Promise<{ q: string }> }` |
| `cookies()` | `cookies().get('name')` | `(await cookies()).get('name')` |
| `headers()` | `headers().get('x-foo')` | `(await headers()).get('x-foo')` |
| `PageProps` helper | N/A | `PageProps<'/tasks/[id]'>` (global, sin import) |

**Regla:** En Next.js 16, todo lo que sea "contexto de request" es async → siempre `await`.

---

## ✅ DAY 1: App Router Fundamentals ← COMPLETADO

**Fecha:** 2026-06-23  
**Tiempo estimado:** 3-4 horas

### Archivos creados:
- [lib/types.ts](task-manager-nextjs/lib/types.ts) — Tipos de dominio (Task, TaskStatus, TaskPriority)
- [lib/data.ts](task-manager-nextjs/lib/data.ts) — Capa de datos mock (async, simula Prisma)
- [app/layout.tsx](task-manager-nextjs/app/layout.tsx) — Root layout + Metadata API + Geist fonts
- [app/page.tsx](task-manager-nextjs/app/page.tsx) — Home page con estadísticas del servidor
- [app/tasks/layout.tsx](task-manager-nextjs/app/tasks/layout.tsx) — Layout anidado con sidebar
- [app/tasks/page.tsx](task-manager-nextjs/app/tasks/page.tsx) — Lista de tareas con filtro por status
- [app/tasks/loading.tsx](task-manager-nextjs/app/tasks/loading.tsx) — Skeleton UI (CLS-safe)
- [app/tasks/error.tsx](task-manager-nextjs/app/tasks/error.tsx) — Error boundary ('use client')
- [app/tasks/[id]/page.tsx](task-manager-nextjs/app/tasks/[id]/page.tsx) — Detalle con await params
- [app/tasks/new/page.tsx](task-manager-nextjs/app/tasks/new/page.tsx) — Form stub (se activa Day 3)

### Conceptos aprendidos:
- ✅ File-based routing: `page.tsx` crea rutas, `layout.tsx` envuelve, `loading.tsx` es el Suspense
- ✅ Rutas dinámicas `[id]` vs rutas estáticas `new` — Next.js prefiere la específica
- ✅ `params` en Next.js 16 es `Promise` → `await params` siempre
- ✅ `searchParams` en Next.js 16 es `Promise` → `await searchParams`
- ✅ Server Components pueden ser `async` y hacer fetch directamente
- ✅ `error.tsx` REQUIERE `'use client'` — los Error Boundaries son React client-only
- ✅ `notFound()` de `next/navigation` activa el 404 más cercano

### Ejercicios pendientes (en los archivos):
- [ ] `lib/types.ts` EJERCICIO 1: Define `TaskSummary` con `Pick<Task, ...>`
- [ ] `lib/data.ts` EJERCICIO 2: Implementa `getTasksByAssignee(assignee: string)`
- [ ] `app/tasks/[id]/page.tsx` EJERCICIO 3: Botón "Editar" → `/tasks/[id]/edit`

---

## 📋 DAY 2: Server vs Client Components

**Fecha estimada:** 2026-06-24  
**Tiempo estimado:** 3-4 horas

### Objetivos:
- [ ] Entender el RSC payload y cómo viaja del servidor al cliente
- [ ] Crear `components/` con Server y Client components bien separados
- [ ] Implementar el patrón "Server wrapper → Client leaf"
- [ ] Agregar `TaskStatusToggle` como primer Client Component interactivo
- [ ] Agregar `SearchBar` con `useSearchParams` para filtrar tareas

### Archivos a crear:
- `components/TaskStatusToggle.tsx` — Client Component con useState
- `components/SearchBar.tsx` — Client Component con useSearchParams
- `components/TaskList.tsx` — Server Component que recibe tasks como props
- `app/tasks/page.tsx` — Refactor para separar Server/Client logic

### Conceptos clave:
- Boundary de Server/Client — `'use client'` contagia a todos los imports del archivo
- `children` pattern para pasar Server Components a un Client Component
- `useSearchParams` en Client Component vs `searchParams` prop en Server Component
- Por qué NO hay `useState` en Server Components

---

## 📋 DAY 3: Server Actions & Forms

**Fecha estimada:** 2026-06-25  
**Tiempo estimado:** 3-4 horas

### Objetivos:
- [ ] Implementar `createTask` Server Action en `app/tasks/actions.ts`
- [ ] Activar el formulario de `/tasks/new` con `action={createTask}`
- [ ] Crear `SubmitButton` Client Component con `useFormStatus`
- [ ] Implementar `updateTaskStatus` y `deleteTask` Server Actions
- [ ] Usar `revalidatePath` después de cada mutación

### Archivos a crear/modificar:
- `app/tasks/actions.ts` — Server Actions con `'use server'`
- `app/tasks/new/page.tsx` — Activar form con el Server Action
- `components/SubmitButton.tsx` — Client Component con useFormStatus
- `components/DeleteButton.tsx` — Client Component con form + Server Action

### Conceptos clave:
- `'use server'` en función o en archivo completo
- `FormData` como parámetro automático del Server Action
- `revalidatePath('/tasks')` para limpiar la caché después de mutaciones
- `redirect('/tasks')` después de crear — lanza excepción de control flow
- `useFormStatus()` para el estado `pending` del submit

---

## 📋 DAY 4: Streaming & Suspense

**Fecha estimada:** 2026-06-26  
**Tiempo estimado:** 3-4 horas

### Objetivos:
- [ ] Convertir el dashboard en una página con múltiples Suspense boundaries
- [ ] Hacer que estadísticas y lista carguen en paralelo (no waterfall)
- [ ] Crear skeletons individuales por sección
- [ ] Medir la diferencia de tiempo con y sin streaming

### Archivos a crear:
- `app/dashboard/page.tsx` — Dashboard con múltiples Suspense
- `components/TaskStatsServer.tsx` — Stats como async Server Component
- `components/TaskListServer.tsx` — Lista como async Server Component
- `app/dashboard/loading.tsx` — Skeleton del shell del dashboard

### Conceptos clave:
- Diferencia entre waterfall y parallel fetching
- `<Suspense fallback={<Skeleton />}>` para cada sección independiente
- `Promise.all([fetchA(), fetchB()])` para fetching paralelo en un solo componente
- El shell (header, sidebar) llega al browser antes que los datos

---

## 📋 DAY 5: Metadata API & SEO

**Fecha estimada:** 2026-06-27  
**Tiempo estimado:** 3-4 horas

### Objetivos:
- [ ] Completar metadata dinámica en todas las rutas con params
- [ ] Generar Open Graph images con `ImageResponse` de `next/og`
- [ ] Crear `app/sitemap.ts` para el sitemap XML
- [ ] Crear `app/robots.ts` para el robots.txt
- [ ] Verificar con las DevTools que el `<head>` es correcto

### Archivos a crear:
- `app/opengraph-image.tsx` — OG image raíz con next/og
- `app/tasks/[id]/opengraph-image.tsx` — OG image dinámica por tarea
- `app/sitemap.ts` — Sitemap XML generado dinámicamente
- `app/robots.ts` — robots.txt programático

### Conceptos clave:
- `export const metadata` (estático) vs `export async function generateMetadata` (dinámico)
- `title.template` en root layout para formateo consistente
- `ImageResponse` de `next/og` genera imágenes PNG en Edge Runtime
- Sitemap y robots generados con funciones — no archivos estáticos

---

## 📋 DAY 6: Route Handlers & API

**Fecha estimada:** 2026-06-28  
**Tiempo estimado:** 4-5 horas

### Objetivos:
- [ ] Crear `app/api/tasks/route.ts` con GET y POST
- [ ] Crear `app/api/tasks/[id]/route.ts` con GET, PATCH, DELETE
- [ ] Implementar middleware de autenticación básico con cookies
- [ ] Conectar Server Actions con los Route Handlers donde tenga sentido

### Archivos a crear:
- `app/api/tasks/route.ts` — Colección (GET, POST)
- `app/api/tasks/[id]/route.ts` — Ítem (GET, PATCH, DELETE)
- `middleware.ts` — Auth check en rutas protegidas
- `lib/auth.ts` — Helpers de autenticación mock

### Conceptos clave:
- `NextRequest` y `NextResponse` en Route Handlers
- Cuándo usar Route Handler vs Server Action (external consumers vs internal forms)
- `middleware.ts` corre en Edge Runtime — sin Node.js APIs pesadas
- `request.cookies`, `request.headers` para leer contexto de request

---

## 📋 DAY 7: Advanced Patterns & Deployment

**Fecha estimada:** 2026-06-29  
**Tiempo estimado:** 4-5 horas

### Objetivos:
- [ ] Implementar Parallel Routes para un dashboard con múltiples slots
- [ ] Implementar Intercepting Routes para un modal de detalle de tarea
- [ ] Organizar con Route Groups `(marketing)` y `(app)`
- [ ] Deploy a Vercel y verificar Web Vitals en producción

### Archivos a crear:
- `app/(app)/dashboard/@stats/page.tsx` — Slot de estadísticas
- `app/(app)/dashboard/@tasks/page.tsx` — Slot de tareas
- `app/(app)/dashboard/layout.tsx` — Layout con parallel routes
- `app/@modal/(.)tasks/[id]/page.tsx` — Intercepting route modal

### Conceptos clave:
- `@slot` — carpetas de slot para parallel routes
- `(.)` interceptor para shallow routing (mantiene URL padre)
- Route groups `(nombre)` no afectan la URL
- Vercel Analytics + Web Vitals en producción real

---

## 📊 Progreso

| Día | Tema | Estado |
|-----|------|--------|
| 1 | App Router Fundamentals | ✅ Completado |
| 2 | Server vs Client Components | ⏳ Pendiente |
| 3 | Server Actions & Forms | ⏳ Pendiente |
| 4 | Streaming & Suspense | ⏳ Pendiente |
| 5 | Metadata API & SEO | ⏳ Pendiente |
| 6 | Route Handlers & API | ⏳ Pendiente |
| 7 | Advanced Patterns & Deployment | ⏳ Pendiente |

---

## 🎯 Criterios de Éxito

- [ ] Proyecto corre con `npm run dev` sin errores de TypeScript
- [ ] Server y Client Components correctamente separados (sin `'use client'` innecesario)
- [ ] Server Actions funcionando para crear/actualizar/eliminar tareas
- [ ] Streaming con Suspense implementado en el dashboard
- [ ] Metadata dinámica en todas las rutas con params
- [ ] Deployed a Vercel con Lighthouse score > 90
- [ ] Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
