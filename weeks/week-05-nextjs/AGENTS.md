# 🤖 AGENTS: Next.js & Server Components

## Context
Master Next.js 14+ App Router and React Server Components (RSC) for clinical SaaS platform. Focus on full-stack development with server-first architecture.

---

## Key Principles

### 1. Server-First Thinking
- **Default to Server Components** - They're more secure and smaller bundles
- **Use Client Components only when needed** - Interactivity, hooks, browser APIs
- **Server Actions for mutations** - No API routes required for simple operations
- **Think about data flow** - Where should fetching happen? On server or client?

### 2. The Server/Client Boundary
```
┌─────────────────────┐
│  Server Side        │
│  - Database access  │
│  - Secrets safe     │
│  - Heavy libraries  │
│  - Data processing  │
└─────────────────────┘
         ↓ (props)
┌─────────────────────┐
│  Client Side        │
│  - Interactivity    │
│  - State (useState) │
│  - Event handlers   │
│  - Browser APIs     │
└─────────────────────┘
```

### 3. File Structure Awareness
- **page.tsx** = A route (only file that creates URLs)
- **layout.tsx** = Persistent wrapper (state persists across navigations)
- **loading.tsx** = Show skeleton while page loads
- **error.tsx** = Error boundary UI
- **actions.ts** = Server Actions (mutations)

### 4. Common Mistakes to Avoid
- ❌ Using `useState` in Server Components (won't work!)
- ❌ Creating API routes for simple data fetching (use Server Components)
- ❌ Not cleaning up Suspense boundaries (causes layout shift)
- ❌ Fetching same data in multiple components (do it once at parent)
- ❌ Putting `'use client'` at root (defeats RSC benefits)

---

## Essential Commands

### Development
```bash
# Start dev server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Analyze bundle
ANALYZE=true npm run build
```

### Deployment (Vercel - recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Testing & Linting
```bash
# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

---

## Debugging Checklist

### When pages render on server
- [ ] Is this Server Component (no `'use client'`)?
- [ ] Can I see database queries? (console output in terminal, not browser)
- [ ] Are secrets visible only in terminal? (not in Network tab)

### When components need interactivity
- [ ] Is `'use client'` at top of file?
- [ ] Does it use hooks? (useState, useEffect, etc.)
- [ ] Are event handlers properly bound?
- [ ] Is state in correct component (not parent)?

### When data fetching is slow
- [ ] Should this be Static or Dynamic?
- [ ] Can you use ISR for periodic updates?
- [ ] Are you fetching in parallel with Suspense?
- [ ] Can you move heavy computation to Server Action?

### When deployments fail
- [ ] Check build logs: `vercel logs`
- [ ] Are you using Node.js APIs in Client Components?
- [ ] Are you accessing browser APIs on Server?
- [ ] Do you have required environment variables?

---

## Performance Optimization Patterns

### 1. Minimize Client Component Boundary
```typescript
// ❌ Bad: Entire form is client
'use client'
export function TaskList() {
  const tasks = await fetchTasks()  // Can't await in client!
}

// ✅ Good: Keep server logic on server
export async function TaskList() {  // Server by default
  const tasks = await fetchTasks()
  return <TaskListClient initialTasks={tasks} />
}

'use client'
function TaskListClient({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks)
}
```

### 2. Parallel Data Fetching
```typescript
// ❌ Sequential (slow)
const user = await fetchUser()
const tasks = await fetchTasks()  // Waits for user!

// ✅ Parallel (fast)
const [user, tasks] = await Promise.all([
  fetchUser(),
  fetchTasks()
])
```

### 3. Progressive Enhancement with Server Actions
```typescript
// Simple form that works without JavaScript
<form action={createTask}>
  <input name="title" required />
  <button type="submit">Create</button>
</form>

// Enhanced with client-side loading state
<form action={createTask}>
  <input name="title" required />
  <SubmitButton />  {/* 'use client' */}
</form>
```

---

## Common Patterns

### Pattern: Protected Route
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (!request.cookies.get('auth')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/tasks/:path*', '/admin/:path*']
}
```

### Pattern: Dynamic Metadata
```typescript
export async function generateMetadata({ params }) {
  const task = await db.task.findUnique({
    where: { id: params.id }
  })
  return { title: task.title }
}
```

### Pattern: Error Handling
```typescript
// error.tsx
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Pattern: Streaming with Suspense
```typescript
<Suspense fallback={<Skeleton />}>
  <TasksList />
</Suspense>

async function TasksList() {
  const tasks = await fetchTasks()  // Can be slow
  return <div>{tasks}</div>
}
```

---

## Type Safety Tips

### Keep TypeScript strict in tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  }
}
```

### Type Server Actions
```typescript
'use server'

export async function createTask(formData: FormData): Promise<Task> {
  const title = formData.get('title') as string
  // TypeScript knows return type!
}
```

---

## Monitoring & Analytics

### Real User Monitoring
```typescript
import { getAnalytics } from 'firebase/analytics'

export function trackPageView() {
  // Track which pages users visit
  // Track time on page
  // Track errors
}
```

### Deployment Health
- Use Vercel Analytics dashboard
- Monitor Web Vitals (LCP, FID, CLS)
- Track error rates in Sentry or similar
- Monitor database query performance

---

## Performance Targets

- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Interaction to Next Paint (INP):** < 200ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Bundle Size (main):** < 250KB gzipped
- **Build Time:** < 2 minutes

---

## When to Use What

| Need | Solution | Why |
|------|----------|-----|
| Fetch user tasks | Server Component | Direct DB access, SEO |
| Show/hide modal | Client Component | useState required |
| Form submission | Server Action | Automatic, no API route |
| Real-time updates | useEffect + fetch | Client-side interactivity |
| Blog post | Static/ISR | Pre-rendered for speed |
| Dashboard data | Dynamic | Always fresh |
| Product catalog | ISR (daily) | Balance of fresh + fast |

---

## Troubleshooting

**"Can't use hooks in Server Component"**
- Add `'use client'` at top of file

**"Database query in Client Component"**
- Move to Server Component or Server Action

**"Page layout shifts when loading"**
- Use loading.tsx skeletons with proper dimensions

**"API route works but Server Action doesn't"**
- Make sure Server Action is marked with `'use server'`
- Check dependency array if used in useEffect

**"Slow build times"**
- Use `generateStaticParams` for dynamic routes
- Reduce data fetching in build time
- Check for unnecessary bundled dependencies

---

## Documentation Links
- Next.js App Router: https://nextjs.org/docs/app
- Server Components: https://react.dev/reference/rsc/server-components
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Deployment: https://vercel.com/docs

---

**Status:** Week 5 focus is on mastering the RSC paradigm shift and full-stack development.
