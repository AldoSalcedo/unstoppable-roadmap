# 🎯 Conceptos Clave: Next.js & Server Components

Guía visual de los patrones fundamentales de Next.js 14+ App Router y React Server Components (RSC).

---

## 1. SERVER COMPONENTS vs CLIENT COMPONENTS

The fundamental paradigm shift: moving computation from client to server.

```
┌─────────────────────────────────────────────────────────────────────────┐
│           SERVER COMPONENTS vs CLIENT COMPONENTS                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────┐                               │
│  │ SERVER COMPONENT (Default)           │                               │
│  ├──────────────────────────────────────┤                               │
│  │                                      │                               │
│  │ // app/tasks/page.tsx               │                               │
│  │ export default async function TasksPage() {                          │
│  │   const tasks = await db.query(...) │                               │
│  │   return <TaskList tasks={tasks} />│                               │
│  │ }                                    │                               │
│  │                                      │                               │
│  │ EXECUTION:                           │                               │
│  │ ┌────────────────────────────────┐   │                               │
│  │ │ Server (Node.js)               │   │                               │
│  │ │ 1. Fetch from database         │   │                               │
│  │ │ 2. Process data                │   │                               │
│  │ │ 3. Render to HTML              │   │                               │
│  │ │ 4. Send HTML to browser        │   │                               │
│  │ └────────────────────────────────┘   │                               │
│  │         ↓ (HTML)                     │                               │
│  │ ┌────────────────────────────────┐   │                               │
│  │ │ Browser                        │   │                               │
│  │ │ Display HTML (no JS needed!)   │   │                               │
│  │ └────────────────────────────────┘   │                               │
│  │                                      │                               │
│  │ BENEFITS:                            │                               │
│  │ ✅ Database logic hidden from client │                               │
│  │ ✅ API keys safe (never exposed)     │                               │
│  │ ✅ Large dependencies not sent       │                               │
│  │ ✅ Better for SEO (HTML first)       │                               │
│  │ ✅ Reduced JavaScript bundle        │                               │
│  │ ✅ Direct database access           │                               │
│  │                                      │                               │
│  │ RULES:                               │                               │
│  │ • Can be async                       │                               │
│  │ • Can access database directly       │                               │
│  │ • Can use secrets (API keys, etc.)   │                               │
│  │ • No React hooks (useState, etc.)    │                               │
│  │ • No event listeners                 │                               │
│  │ • No browser APIs                    │                               │
│  │                                      │                               │
│  └──────────────────────────────────────┘                               │
│                                                                           │
│  ┌──────────────────────────────────────┐                               │
│  │ CLIENT COMPONENT                     │                               │
│  ├──────────────────────────────────────┤                               │
│  │                                      │                               │
│  │ 'use client';                        │                               │
│  │                                      │                               │
│  │ import { useState } from 'react';    │                               │
│  │                                      │                               │
│  │ export function TaskActions({ id }) {│                               │
│  │   const [loading, setLoading] =      │                               │
│  │     useState(false);                 │                               │
│  │                                      │                               │
│  │   const handleClick = async () => {  │                               │
│  │     setLoading(true);                │                               │
│  │     await completeTask(id);          │                               │
│  │     setLoading(false);               │                               │
│  │   };                                 │                               │
│  │                                      │                               │
│  │   return (                           │                               │
│  │     <button onClick={handleClick}>   │                               │
│  │       {loading ? '...' : 'Complete'} │                               │
│  │     </button>                        │                               │
│  │   );                                 │                               │
│  │ }                                    │                               │
│  │                                      │                               │
│  │ EXECUTION:                           │                               │
│  │ ┌────────────────────────────────┐   │                               │
│  │ │ Server                         │   │                               │
│  │ │ 1. Bundle component code       │   │                               │
│  │ │ 2. Send to browser (JS)        │   │                               │
│  │ └────────────────────────────────┘   │                               │
│  │         ↓ (JavaScript)               │                               │
│  │ ┌────────────────────────────────┐   │                               │
│  │ │ Browser (Runtime)              │   │                               │
│  │ │ 1. Run JavaScript              │   │                               │
│  │ │ 2. Handle state (useState)     │   │                               │
│  │ │ 3. Listen to events            │   │                               │
│  │ │ 4. Update DOM interactively    │   │                               │
│  │ └────────────────────────────────┘   │                               │
│  │                                      │                               │
│  │ BENEFITS:                            │                               │
│  │ ✅ Interactive (hooks, events)       │                               │
│  │ ✅ Real-time updates (state)         │                               │
│  │ ✅ Browser APIs (localStorage, etc.) │                               │
│  │ ✅ Event listeners                   │                               │
│  │                                      │                               │
│  │ RULES:                               │                               │
│  │ • Can use hooks (useState, etc.)     │                               │
│  │ • Can use browser APIs               │                               │
│  │ • Can listen to events               │                               │
│  │ • Added to bundle (increases size)   │                               │
│  │ • Cannot access database directly    │                               │
│  │ • Cannot use secrets                 │                               │
│  │                                      │                               │
│  └──────────────────────────────────────┘                               │
│                                                                           │
│  DECISION TREE:                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  "Should this component be Server or Client?"                            │
│  │                                                                       │
│  ├─ Does it need interactivity (onClick, onChange, useState)?            │
│  │  └─ YES: Use CLIENT COMPONENT ('use client')                         │
│  │                                                                       │
│  ├─ Does it use browser APIs (localStorage, window)?                    │
│  │  └─ YES: Use CLIENT COMPONENT ('use client')                         │
│  │                                                                       │
│  ├─ Does it need direct database access?                                │
│  │  └─ YES: Use SERVER COMPONENT (default)                              │
│  │                                                                       │
│  ├─ Does it contain sensitive data (API keys, secrets)?                 │
│  │  └─ YES: Use SERVER COMPONENT (default)                              │
│  │                                                                       │
│  └─ If NO to all above: Use SERVER COMPONENT (lighter, faster)          │
│                                                                           │
│  PATTERN: Server → Client Composition                                    │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  // app/tasks/page.tsx (SERVER)                                          │
│  import { TaskActions } from '@/components/TaskActions'                  │
│                                                                           │
│  export default async function TasksPage() {                             │
│    const tasks = await fetchTasks()  // Server-only code                 │
│                                                                           │
│    return (                                                              │
│      <div>                                                               │
│        {tasks.map(task => (                                              │
│          <div key={task.id}>                                             │
│            <h3>{task.title}</h3>                                         │
│            {/* Embed client component here */}                           │
│            <TaskActions taskId={task.id} />                              │
│          </div>                                                          │
│        ))}                                                               │
│      </div>                                                              │
│    )                                                                     │
│  }                                                                       │
│                                                                           │
│  // components/TaskActions.tsx (CLIENT)                                  │
│  'use client'                                                            │
│                                                                           │
│  import { completeTask } from '@/app/tasks/actions'                      │
│  import { useFormStatus } from 'react-dom'                               │
│                                                                           │
│  export function TaskActions({ taskId }) {                               │
│    return (                                                              │
│      <button                                                             │
│        onClick={() => completeTask(taskId)}                              │
│      >                                                                   │
│        Complete Task                                                     │
│      </button>                                                           │
│    )                                                                     │
│  }                                                                       │
│                                                                           │
│  RESULT:                                                                  │
│  ✅ Heavy data fetching on server                                        │
│  ✅ Secrets never exposed                                                │
│  ✅ Minimal JavaScript sent to browser                                   │
│  ✅ Interactive components still work                                    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. APP ROUTER FILE CONVENTIONS

Next.js 14 file-based routing system with special files.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    APP ROUTER FILE STRUCTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  app/                                                                     │
│  ├─ layout.tsx              Root layout (always rendered)                │
│  ├─ page.tsx                Home page (/)                                │
│  ├─ loading.tsx             Loading UI (shows while page loads)          │
│  ├─ error.tsx               Error boundary (catches errors)              │
│  │                                                                        │
│  ├─ tasks/                  Folder = route segment                       │
│  │  ├─ layout.tsx           Tasks section layout                         │
│  │  ├─ page.tsx             Tasks list (/tasks)                          │
│  │  ├─ loading.tsx          Loading skeleton while TasksList renders     │
│  │  ├─ error.tsx            Error state for tasks page                   │
│  │  │                                                                     │
│  │  ├─ [id]/                Dynamic route segment                        │
│  │  │  ├─ page.tsx          Single task detail (/tasks/123)              │
│  │  │  ├─ layout.tsx        Task detail layout                           │
│  │  │  └─ loading.tsx       Loading skeleton for detail page             │
│  │  │                                                                     │
│  │  ├─ new/                 Another route                                │
│  │  │  └─ page.tsx          New task form (/tasks/new)                   │
│  │  │                                                                     │
│  │  └─ actions.ts           Server Actions (mutations)                   │
│  │                                                                        │
│  ├─ api/                    API routes (traditional backend)             │
│  │  └─ tasks/route.ts       GET /api/tasks                               │
│  │                                                                        │
│  └─ (marketing)/            Route group (doesn't affect URL)             │
│     ├─ about/page.tsx       About page (/about, not /(marketing)/about)  │
│     └─ layout.tsx           Marketing layout (different from app)        │
│                                                                           │
│                                                                           │
│  FILE PURPOSE REFERENCE:                                                 │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  page.tsx                 → The actual page component (required)         │
│  ├─ Only file that creates a route                                      │
│  ├─ Can be Server or Client component                                   │
│  └─ Receives params and searchParams                                    │
│                                                                           │
│  layout.tsx               → Wrapper for pages in this folder             │
│  ├─ Applied to all child pages                                          │
│  ├─ Usually contains navigation, sidebars                               │
│  └─ Persists state across navigations                                   │
│                                                                           │
│  loading.tsx              → Fallback UI while page loads                 │
│  ├─ Wraps in Suspense boundary                                          │
│  ├─ Show skeleton/spinner while fetching                                │
│  ├─ Automatically replaces with page when ready                         │
│  └─ Don't need explicit <Suspense>                                      │
│                                                                           │
│  error.tsx                → Error boundary for page                      │
│  ├─ Catches errors from page and children                               │
│  ├─ Must be Client component                                            │
│  ├─ Receives error and reset function                                   │
│  └─ Provides fallback UI                                                │
│                                                                           │
│  not-found.tsx            → 404 page for this segment                    │
│  ├─ Catch when resource not found                                       │
│  ├─ notFound() function triggers it                                     │
│  └─ User-friendly 404 UI                                                │
│                                                                           │
│  [param]/                 → Dynamic route segment                        │
│  ├─ [id] matches anything: /tasks/123, /tasks/abc, etc.                 │
│  ├─ params = { id: "123" } in page component                            │
│  ├─ [[...slug]] = catch-all (optional)                                  │
│  └─ [...slug] = required catch-all                                      │
│                                                                           │
│  @slot/                   → Parallel route (advanced)                    │
│  ├─ Render multiple pages simultaneously                                │
│  ├─ Used for modals, sidebars                                           │
│  └─ Requires layout.tsx to use slots                                    │
│                                                                           │
│  middleware.ts            → Run before request handled                   │
│  ├─ Authentication checks                                               │
│  ├─ Redirect unauthenticated users                                      │
│  └─ Modify request headers                                              │
│                                                                           │
│                                                                           │
│  ROUTING EXAMPLES:                                                        │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  File structure:                    → URL:                               │
│  app/page.tsx                       → /                                  │
│  app/tasks/page.tsx                 → /tasks                             │
│  app/tasks/new/page.tsx             → /tasks/new                         │
│  app/tasks/[id]/page.tsx            → /tasks/123 (id=123)                │
│  app/tasks/[id]/edit/page.tsx       → /tasks/123/edit                    │
│  app/(marketing)/about/page.tsx     → /about (group hidden)              │
│  app/(app)/dashboard/page.tsx       → /dashboard (group hidden)          │
│  app/@modal/(.)tasks/[id]/page.tsx  → Modal interceptor                  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SERVER ACTIONS: MUTATIONS WITHOUT API ROUTES

Direct database mutations from forms, no API routes needed.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVER ACTIONS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  BEFORE (Traditional API Route):                                         │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  // Step 1: Create API route                                             │
│  // app/api/tasks/route.ts                                               │
│  export async function POST(request) {                                    │
│    const data = await request.json()                                     │
│    const task = await db.task.create(data)                               │
│    return NextResponse.json(task)                                        │
│  }                                                                        │
│                                                                           │
│  // Step 2: Client component calls it                                     │
│  // components/CreateTaskForm.tsx                                        │
│  'use client'                                                            │
│  export function CreateTaskForm() {                                      │
│    const handleSubmit = async (formData) => {                            │
│      const response = await fetch('/api/tasks', {                        │
│        method: 'POST',                                                   │
│        body: JSON.stringify(formData)                                    │
│      })                                                                  │
│      const task = await response.json()                                  │
│    }                                                                     │
│  }                                                                        │
│                                                                           │
│  PROBLEMS:                                                               │
│  ❌ Extra boilerplate (API route + client code)                          │
│  ❌ No type safety between client & server                               │
│  ❌ Manual error handling                                                │
│  ❌ Need to manage loading states yourself                               │
│                                                                           │
│                                                                           │
│  AFTER (Server Actions):                                                 │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  // Step 1: Create Server Action (just a function!)                      │
│  // app/tasks/actions.ts                                                 │
│  'use server'                                                            │
│                                                                           │
│  export async function createTask(formData: FormData) {                  │
│    // This runs on SERVER, not exposed to client                         │
│    const title = formData.get('title')                                   │
│                                                                           │
│    // Direct database access (secrets safe!)                             │
│    const task = await db.task.create({                                   │
│      title,                                                              │
│      userId: getCurrentUserId(),                                         │
│    })                                                                    │
│                                                                           │
│    // Revalidate cache                                                   │
│    revalidatePath('/tasks')                                              │
│    redirect(`/tasks/${task.id}`)                                         │
│  }                                                                        │
│                                                                           │
│  // Step 2: Use in form (automatically wired!)                            │
│  // app/tasks/new/page.tsx                                               │
│  import { createTask } from '@/app/tasks/actions'                        │
│                                                                           │
│  export default function NewTaskPage() {                                 │
│    return (                                                              │
│      <form action={createTask}>                                          │
│        {/* Form fields */}                                               │
│        <input name="title" />                                            │
│        <textarea name="description" />                                   │
│        <button type="submit">Create</button>                             │
│      </form>                                                             │
│    )                                                                     │
│  }                                                                        │
│                                                                           │
│  BENEFITS:                                                               │
│  ✅ No API routes needed                                                 │
│  ✅ Type-safe (TypeScript inferred)                                      │
│  ✅ Direct database access                                               │
│  ✅ Automatic loading states (useFormStatus)                             │
│  ✅ Built-in error handling                                              │
│  ✅ Automatic redirect/revalidation                                      │
│                                                                           │
│                                                                           │
│  PATTERN: Server Action with Loading State                               │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  // app/tasks/actions.ts                                                 │
│  'use server'                                                            │
│  export async function deleteTask(taskId: string) {                      │
│    await db.task.delete({ where: { id: taskId } })                       │
│    revalidatePath('/tasks')                                              │
│  }                                                                        │
│                                                                           │
│  // components/DeleteButton.tsx                                          │
│  'use client'                                                            │
│  import { useFormStatus } from 'react-dom'                               │
│  import { deleteTask } from '@/app/tasks/actions'                        │
│                                                                           │
│  function SubmitButton() {                                               │
│    const { pending } = useFormStatus()  // Automatic!                    │
│    return (                                                              │
│      <button disabled={pending}>                                         │
│        {pending ? 'Deleting...' : 'Delete'}                              │
│      </button>                                                           │
│    )                                                                     │
│  }                                                                        │
│                                                                           │
│  export function DeleteButton({ taskId }) {                              │
│    return (                                                              │
│      <form action={() => deleteTask(taskId)}>                            │
│        <SubmitButton />                                                  │
│      </form>                                                             │
│    )                                                                     │
│  }                                                                        │
│                                                                           │
│  DATA FLOW:                                                               │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  User submits form                                                       │
│       ↓                                                                   │
│  Browser sends FormData (native HTML)                                    │
│       ↓                                                                   │
│  Next.js routes to Server Action (no fetch needed!)                      │
│       ↓                                                                   │
│  Server Action runs (database access, secrets safe)                      │
│       ↓                                                                   │
│  Revalidate/redirect (automatic cache invalidation)                      │
│       ↓                                                                   │
│  Browser updated with new data                                           │
│                                                                           │
│  TYPESCRIPT SAFETY:                                                       │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  const result = await createTask(formData)  // Type-checked!             │
│  // TypeScript knows return type, parameters, etc.                       │
│                                                                           │
│  No more: await response.json() | as unknown                             │
│  No more: Manual type guards                                             │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. STREAMING WITH SUSPENSE: PROGRESSIVE RENDERING

Send content to user as it becomes ready, don't wait for everything.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   STREAMING WITH SUSPENSE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  WITHOUT STREAMING (Traditional):                                        │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  User requests /dashboard                                                │
│  │                                                                        │
│  ├─ Fetch header data (100ms)                                            │
│  ├─ Fetch tasks data (500ms) ← WAIT FOR THIS                             │
│  ├─ Fetch stats data (1000ms) ← AND THIS                                 │
│  └─ Fetch recommendations (2000ms) ← AND THIS TOO!                       │
│                                                                           │
│  Result: User sees blank page for 2 full seconds!                        │
│  ──────────────────────────────────────────────                          │
│   0ms ─── 500ms ─── 1000ms ─── 1500ms ─── 2000ms                         │
│   [............... WAITING ...................]                          │
│   [USER FRUSTRATION ❌]                                                   │
│                                                                           │
│                                                                           │
│  WITH STREAMING + SUSPENSE (Next.js RSC):                                │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  export default function Dashboard() {                                   │
│    return (                                                              │
│      <div>                                                               │
│        {/* Send immediately (server-side) */}                            │
│        <Header />                                                        │
│                                                                           │
│        {/* Stream when ready (200ms) */}                                 │
│        <Suspense fallback={<TasksSkeleton />}>                           │
│          <TasksList />                                                   │
│        </Suspense>                                                       │
│                                                                           │
│        {/* Stream independently (1000ms) */}                             │
│        <Suspense fallback={<StatsSkeleton />}>                           │
│          <Stats />                                                       │
│        </Suspense>                                                       │
│                                                                           │
│        {/* Stream last (2000ms) */}                                      │
│        <Suspense fallback={<RecommendationsSkeleton />}>                 │
│          <Recommendations />                                             │
│        </Suspense>                                                       │
│      </div>                                                              │
│    )                                                                     │
│  }                                                                        │
│                                                                           │
│  Result: User sees content progressively!                                │
│  ─────────────────────────────────────────                               │
│   0ms ────────► 200ms ────► 1000ms ────► 2000ms                          │
│   [Header]     [+ Tasks]   [+ Stats]   [+ Recommend]                     │
│   [ENGAGING ✅]                                                          │
│                                                                           │
│  USER EXPERIENCE:                                                         │
│  1. Instant: Header appears (navigation, title)                          │
│  2. 200ms: Skeleton for tasks appears (perceived load)                   │
│  3. Task list replaces skeleton (ready!)                                 │
│  4. Same for stats and recommendations                                   │
│                                                                           │
│  TECHNICAL FLOW:                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  Browser                 Network                  Server                 │
│    │                        │                        │                  │
│    │─────────────────────── GET /dashboard ──────────>                  │
│    │<─────────────────────── HTML chunk 1 ─────────────                 │
│    │                     (Header component)                              │
│    │                   [Render immediately]                              │
│    │                                                                      │
│    │<─────────────────────── HTML chunk 2 ─────────────                 │
│    │                   (Tasks component)                                 │
│    │             [Replace skeleton with tasks]                           │
│    │                                                                      │
│    │<─────────────────────── HTML chunk 3 ─────────────                 │
│    │                   (Stats component)                                 │
│    │             [Replace skeleton with stats]                           │
│    │                                                                      │
│    │<─────────────────────── HTML chunk 4 ─────────────                 │
│    │              (Recommendations component)                            │
│    │        [Replace skeleton with recommendations]                      │
│    │                                                                      │
│  WATERFALL vs PARALLEL:                                                   │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  WATERFALL (Bad): Each fetch waits for previous                          │
│  ┌────────────────────────────────────────────┐                          │
│  │ Fetch Header                               │ 100ms                     │
│  │ ├─ Fetch Tasks (wait for header) │ 100+500ms │                      │
│  │ ├─ Fetch Stats (wait for tasks)  │ 600+400ms │                      │
│  │ └─ Fetch Recs (wait for stats)   │ 1000+1000ms│                     │
│  └────────────────────────────────────────────┘                          │
│  TOTAL: 2100ms ❌                              │                          │
│                                                │                          │
│  PARALLEL (Good): Fetch all at once with Suspense                       │
│  ┌────────────────────────────────────────────┐                          │
│  │ Header .......................... 100ms     │                          │
│  │ Tasks ........................... 500ms     │                          │
│  │ Stats ........................... 400ms     │                          │
│  │ Recommendations ................. 1000ms    │                          │
│  └────────────────────────────────────────────┘                          │
│  TOTAL: 1000ms (max of all, not sum!) ✅     │                          │
│                                                │                          │
│  CODE PATTERN:                                 │                          │
│  ────────────────────────────────────────────│                          │
│                                                │                          │
│  // app/dashboard/page.tsx                     │                          │
│  async function TasksList() {                  │                          │
│    const tasks = await fetchTasks()  // 500ms  │                          │
│    return <div>{tasks}</div>                   │                          │
│  }                                             │                          │
│                                                │                          │
│  async function Stats() {                      │                          │
│    const stats = await fetchStats()   // 400ms │                          │
│    return <div>{stats}</div>                   │                          │
│  }                                             │                          │
│                                                │                          │
│  export default function Dashboard() {         │                          │
│    return (                                    │                          │
│      <div>                                     │                          │
│        <Suspense fallback={<Spinner />}>       │                          │
│          <TasksList />                         │                          │
│        </Suspense>                             │                          │
│        <Suspense fallback={<Spinner />}>       │                          │
│          <Stats />                             │                          │
│        </Suspense>                             │                          │
│      </div>                                    │                          │
│    )                                           │                          │
│  }                                             │                          │
│                                                │                          │
│  // Start both fetches IMMEDIATELY             │                          │
│  // User sees skeletons while fetching         │                          │
│  // Page updates as each finishes              │                          │
│                                                │                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. DATA FETCHING STRATEGIES

Different caching and revalidation modes for different use cases.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   DATA FETCHING STRATEGIES                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ 1. STATIC (Prerendered at build time)                        │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │ Use Case: Blog posts, documentation, public content          │        │
│  │                                                               │        │
│  │ // app/blog/[slug]/page.tsx                                   │        │
│  │ export async function generateStaticParams() {                │        │
│  │   const posts = await fetchAllPosts()                         │        │
│  │   return posts.map(post => ({                                 │        │
│  │     slug: post.slug                                           │        │
│  │   }))                                                         │        │
│  │ }                                                             │        │
│  │                                                               │        │
│  │ export default async function BlogPost({ params }) {          │        │
│  │   const post = await fetch(                                   │        │
│  │     `https://api.example.com/posts/${params.slug}`,           │        │
│  │     { cache: 'force-cache' }  // Cache forever               │        │
│  │   )                                                           │        │
│  │   return <article>{post.content}</article>                    │        │
│  │ }                                                             │        │
│  │                                                               │        │
│  │ BUILD TIME:                                                   │        │
│  │  npm run build                                                │        │
│  │  │                                                             │        │
│  │  ├─ Fetch all blog posts                                      │        │
│  │  ├─ Generate /blog/post-1.html                                │        │
│  │  ├─ Generate /blog/post-2.html                                │        │
│  │  ├─ Generate /blog/post-3.html                                │        │
│  │  └─ ...                                                        │        │
│  │                                                               │        │
│  │ SERVING:                                                      │        │
│  │  User requests /blog/post-1                                   │        │
│  │  │                                                             │        │
│  │  └─> Instant HTML (pre-generated) ⚡                           │        │
│  │                                                               │        │
│  │ BENEFITS:                                                     │        │
│  │  ✅ Instant (no computation)                                   │        │
│  │  ✅ Perfect SEO (complete HTML)                                │        │
│  │  ✅ No server load                                             │        │
│  │  ✅ Can serve from CDN                                         │        │
│  │                                                               │        │
│  │ TRADEOFF:                                                     │        │
│  │  ❌ Requires rebuild for new content                           │        │
│  │  ❌ Not suitable for frequently changing data                  │        │
│  │                                                               │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ 2. DYNAMIC (Fetch on every request)                          │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │ Use Case: User-specific data, real-time content               │        │
│  │                                                               │        │
│  │ // app/dashboard/page.tsx                                     │        │
│  │ export const dynamic = 'force-dynamic'  // Always fresh       │        │
│  │                                                               │        │
│  │ export default async function Dashboard() {                   │        │
│  │   const data = await fetch(                                   │        │
│  │     'https://api.example.com/user-data',                      │        │
│  │     { cache: 'no-store' }  // No caching                      │        │
│  │   )                                                           │        │
│  │                                                               │        │
│  │   return <div>{data}</div>                                    │        │
│  │ }                                                             │        │
│  │                                                               │        │
│  │ EVERY REQUEST:                                                │        │
│  │  User requests /dashboard                                     │        │
│  │  │                                                             │        │
│  │  ├─ Server runs page component                                │        │
│  │  ├─ Fetches latest user data                                  │        │
│  │  ├─ Renders HTML                                              │        │
│  │  └─> Fresh response ✅                                         │        │
│  │                                                               │        │
│  │ BENEFITS:                                                     │        │
│  │  ✅ Always fresh data                                          │        │
│  │  ✅ Real-time updates                                          │        │
│  │  ✅ Supports personalization                                   │        │
│  │                                                               │        │
│  │ TRADEOFF:                                                     │        │
│  │  ❌ Slower (database query per request)                        │        │
│  │  ❌ Higher server load                                         │        │
│  │  ❌ Cannot use CDN                                             │        │
│  │                                                               │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ 3. ISR (Incremental Static Regeneration)                      │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │ Use Case: Blog posts, product listings (update hourly/daily)  │        │
│  │                                                               │        │
│  │ // app/blog/[slug]/page.tsx                                   │        │
│  │ export const revalidate = 3600  // Revalidate every 1 hour    │        │
│  │                                                               │        │
│  │ export default async function BlogPost({ params }) {          │        │
│  │   const post = await fetch(                                   │        │
│  │     `https://api.example.com/posts/${params.slug}`,           │        │
│  │     { next: { revalidate: 3600 } }                            │        │
│  │   )                                                           │        │
│  │                                                               │        │
│  │   return <article>{post.content}</article>                    │        │
│  │ }                                                             │        │
│  │                                                               │        │
│  │ TIMELINE:                                                     │        │
│  │  Build:           Prerender all blog posts                    │        │
│  │  0h                                                           │        │
│  │  │                                                             │        │
│  │  ├─ User requests /blog/post-1                                │        │
│  │  │  └─> Serve cached HTML (instant)                           │        │
│  │  │                                                             │        │
│  │  ├─ 1 hour passes...                                          │        │
│  │  │                                                             │        │
│  │  └─ User requests /blog/post-1                                │        │
│  │     │  Cache expired, regenerate in background               │        │
│  │     │                                                          │        │
│  │     ├─ Serve old cached version (stale-while-revalidate)     │        │
│  │     └─ Regenerate new version in background                  │        │
│  │                                                               │        │
│  │ BENEFITS:                                                     │        │
│  │  ✅ Fast (uses cached version)                                 │        │
│  │  ✅ Fresh (revalidates periodically)                           │        │
│  │  ✅ Best of both worlds                                        │        │
│  │  ✅ Low server load (batch regeneration)                       │        │
│  │                                                               │        │
│  │ TRADEOFF:                                                     │        │
│  │  ❌ Stale data until revalidation                              │        │
│  │  ❌ Slight delay on first request after expiry                 │        │
│  │                                                               │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  DECISION MATRIX:                                                         │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  Data Type             Update Frequency       Strategy                   │
│  ─────────────────────────────────────────────────────────────────      │
│  Blog posts            Weeks/months           STATIC                    │
│  Product catalog       Daily                  ISR (revalidate: 86400)   │
│  User dashboard        Real-time              DYNAMIC                    │
│  Homepage              Hourly                 ISR (revalidate: 3600)     │
│  Settings              On change              DYNAMIC                    │
│  Public API data       Daily                  ISR                        │
│  Stock prices          Minutes                DYNAMIC                    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. METADATA API FOR SEO

Dynamic and static SEO optimization.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        METADATA API                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  // app/layout.tsx (Root metadata)                                       │
│  export const metadata: Metadata = {                                     │
│    title: 'Task Manager - Professional Project Management',              │
│    description: 'Organize your work with our powerful task manager',     │
│    keywords: ['tasks', 'projects', 'productivity', 'management'],        │
│    authors: [{ name: 'Your Company' }],                                  │
│    openGraph: {                                                          │
│      type: 'website',                                                    │
│      locale: 'en_US',                                                    │
│      url: 'https://taskmanager.example.com',                             │
│      title: 'Task Manager',                                              │
│      description: 'Professional task management',                        │
│      siteName: 'Task Manager',                                           │
│      images: [{                                                          │
│        url: '/og-image.png',                                             │
│        width: 1200,                                                      │
│        height: 630,                                                      │
│      }],                                                                 │
│    },                                                                    │
│    twitter: {                                                            │
│      card: 'summary_large_image',                                        │
│      creator: '@yourhandle',                                             │
│      description: 'Professional task management',                        │
│    },                                                                    │
│  }                                                                       │
│                                                                           │
│  RENDERS IN HTML HEAD:                                                   │
│  <title>Task Manager - Professional Project Management</title>           │
│  <meta name="description" content="Organize your work..." />              │
│  <meta name="keywords" content="tasks, projects, ..." />                 │
│  <meta property="og:type" content="website" />                           │
│  <meta property="og:title" content="Task Manager" />                     │
│  <meta property="og:image" content="https://.../og-image.png" />         │
│  <meta name="twitter:card" content="summary_large_image" />              │
│                                                                           │
│                                                                           │
│  // app/tasks/[id]/page.tsx (Dynamic metadata)                           │
│  export async function generateMetadata({                                │
│    params                                                                │
│  }): Promise<Metadata> {                                                │
│    const task = await fetchTask(params.id)                               │
│                                                                           │
│    if (!task) {                                                          │
│      return { title: 'Task Not Found' }                                  │
│    }                                                                     │
│                                                                           │
│    return {                                                              │
│      title: task.title,                                                  │
│      description: task.description,                                      │
│      openGraph: {                                                        │
│        title: task.title,                                                │
│        description: task.description,                                    │
│        type: 'article',                                                  │
│        publishedTime: task.createdAt.toISOString(),                      │
│        authors: [task.author.name],                                      │
│      },                                                                  │
│    }                                                                     │
│  }                                                                       │
│                                                                           │
│  SOCIAL SHARING RESULT:                                                  │
│  ────────────────────────────────────────────────────────────────────   │
│  When user shares /tasks/123 on Twitter/LinkedIn:                       │
│                                                                          │
│  ┌────────────────────────────────────────────┐                         │
│  │                                             │                        │
│  │ "Build homepage redesign"                  │                        │
│  │ Implement new navigation and layout for...  │                        │
│  │                                             │                        │
│  │ example.com/tasks/123                       │                        │
│  │                                             │                        │
│  │ [Social preview image]                      │                        │
│  │                                             │                        │
│  └────────────────────────────────────────────┘                         │
│                                                                           │
│  All from generateMetadata() ✅                                           │
│                                                                           │
│  SEO BENEFITS:                                                            │
│  • Unique title/description per page                                     │
│  • Proper Open Graph for social sharing                                  │
│  • Twitter Card optimizations                                            │
│  • Article metadata for news sites                                       │
│  • Search engine snippet optimization                                    │
│                                                                           │
│  SITEMAP & ROBOTS:                                                        │
│  ────────────────────────────────────────────────────────────────────   │
│  // app/sitemap.ts                                                       │
│  export default async function sitemap() {                               │
│    const tasks = await fetchAllTasks()                                   │
│                                                                           │
│    return [                                                              │
│      {                                                                   │
│        url: 'https://example.com',                                       │
│        lastModified: new Date(),                                         │
│        changeFrequency: 'weekly',                                        │
│        priority: 1,                                                      │
│      },                                                                  │
│      ...tasks.map(task => ({                                             │
│        url: `https://example.com/tasks/${task.id}`,                      │
│        lastModified: task.updatedAt,                                     │
│        changeFrequency: 'daily',                                         │
│        priority: 0.8,                                                    │
│      })),                                                                │
│    ]                                                                     │
│  }                                                                       │
│                                                                           │
│  // app/robots.ts                                                        │
│  export default function robots() {                                      │
│    return {                                                              │
│      rules: {                                                            │
│        userAgent: '*',                                                   │
│        allow: '/',                                                       │
│        disallow: ['/admin/', '/api/'],                                   │
│      },                                                                  │
│      sitemap: 'https://example.com/sitemap.xml',                        │
│    }                                                                     │
│  }                                                                       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. MIDDLEWARE PATTERN

Run code before request is processed (authentication, redirects, logging).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE PATTERN                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  // middleware.ts (root of project, not in app/)                         │
│  import { NextResponse } from 'next/server'                              │
│  import type { NextRequest } from 'next/server'                          │
│                                                                           │
│  export function middleware(request: NextRequest) {                      │
│    // Check authentication                                               │
│    const token = request.cookies.get('auth-token')?.value               │
│                                                                           │
│    // Protect routes                                                     │
│    if (request.nextUrl.pathname.startsWith('/tasks')) {                  │
│      if (!token) {                                                       │
│        return NextResponse.redirect(new URL('/login', request.url))      │
│      }                                                                   │
│    }                                                                     │
│                                                                           │
│    // Add headers                                                        │
│    const response = NextResponse.next()                                  │
│    response.headers.set('X-Custom-Header', 'value')                      │
│                                                                           │
│    return response                                                       │
│  }                                                                       │
│                                                                           │
│  export const config = {                                                 │
│    matcher: [                                                            │
│      '/tasks/:path*',    // All /tasks routes                            │
│      '/api/:path*',      // All /api routes                              │
│      '/((?!_next).*)',   // All except _next (Next.js internals)        │
│    ],                                                                    │
│  }                                                                       │
│                                                                           │
│  REQUEST FLOW:                                                            │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                           │
│  Browser request                                                         │
│       ↓                                                                   │
│  Middleware runs (auth check, logging, etc.)                             │
│       ├─ Has token? Continue to handler                                  │
│       └─ No token? Redirect to /login                                    │
│       ↓                                                                   │
│  Route Handler or Page Component                                         │
│       ↓                                                                   │
│  Response sent to browser                                                │
│                                                                           │
│  USE CASES:                                                               │
│  ────────────────────────────────────────────────────────────────────   │
│  ✅ Authentication (check token)                                          │
│  ✅ Authorization (check user role)                                       │
│  ✅ Logging (track requests)                                              │
│  ✅ Redirects (old URLs to new)                                           │
│  ✅ Localization (set language)                                           │
│  ✅ Rate limiting (throttle requests)                                     │
│  ✅ Feature flags (enable/disable features)                               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Patterns Reference Table

| Concept | Purpose | When to Use |
|---------|---------|-------------|
| **Server Component** | Database access, server-only logic | Default for data fetching, auth |
| **Client Component** | Interactivity, hooks, browser APIs | Forms, real-time updates, state |
| **Server Action** | Mutations without API routes | Form submissions, delete/update |
| **Suspense** | Progressive rendering | Long-loading components |
| **Static ISR** | Prerendered with updates | Blog posts, product pages |
| **Dynamic** | Fresh on every request | Real-time data, user-specific |
| **Metadata** | SEO optimization | Every page for social sharing |
| **Middleware** | Request interception | Authentication, logging |

---

**Next Step:** Combine these patterns to build a full-stack clinical SaaS application!
