# ⚛️ WEEK 5: Next.js & Server Components - Sprint Guide

**Duration:** 7 days  
**Level:** Intermediate to Advanced  
**Prerequisites:** Weeks 1-4  
**Goal:** Master Next.js 14+ App Router and Server Components for production SaaS

---

## 🎯 Overview

Transform from client-only React to full-stack Next.js with Server Components, streaming, and SEO optimization.

### Why Next.js:
- **SEO-Friendly**: Server-side rendering out of the box
- **Performance**: Automatic code splitting, image optimization
- **DX**: File-based routing, built-in API routes
- **Production-Ready**: Used by Vercel, Netflix, TikTok

---

## 📚 Learning Objectives

### Core Concepts:
- ✅ **App Router**: File-based routing system
- ✅ **Server Components**: RSC architecture
- ✅ **Server Actions**: Form mutations without API routes
- ✅ **Streaming & Suspense**: Progressive rendering
- ✅ **Metadata API**: Dynamic SEO optimization
- ✅ **Route Handlers**: API endpoints

### Advanced Patterns:
- ✅ **Parallel Routes**: Multiple pages simultaneously
- ✅ **Intercepting Routes**: Modal workflows
- ✅ **Route Groups**: Organize without affecting URL
- ✅ **Middleware**: Request interception
- ✅ **Edge Runtime**: Deploy globally

---

## 📅 Sprint Plan

### **DAY 1: App Router Fundamentals**

**Setup & Basic Routing** (3-4 hours)

```bash
npx create-next-app@latest task-manager-nextjs --typescript --app
```

```typescript
// app/layout.tsx - Root layout
export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/page.tsx - Home page
export default function HomePage() {
  return <h1>Task Manager</h1>;
}

// app/tasks/page.tsx - Tasks page
export default function TasksPage() {
  return <div>All Tasks</div>;
}

// app/tasks/[id]/page.tsx - Dynamic route
export default function TaskDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <div>Task {params.id}</div>;
}

// app/tasks/layout.tsx - Nested layout
export default function TasksLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <div>
      <TasksSidebar />
      <main>{children}</main>
    </div>
  );
}
```

**Resources:**
- [Next.js App Router](https://nextjs.org/docs/app)
- [Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)

---

### **DAY 2: Server Components vs Client Components**

**Understanding RSC** (3-4 hours)

```typescript
// app/tasks/page.tsx - SERVER Component (default)
import { prisma } from '@/lib/prisma';

export default async function TasksPage() {
  // Direct database access in Server Component!
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

// components/TaskCard.tsx - SERVER Component
export function TaskCard({ task }: { task: Task }) {
  return (
    <div>
      <h3>{task.title}</h3>
      <TaskActions taskId={task.id} />
    </div>
  );
}

// components/TaskActions.tsx - CLIENT Component
'use client'; // This directive makes it a Client Component

import { useState } from 'react';

export function TaskActions({ taskId }: { taskId: string }) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    await completeTask(taskId);
    setIsCompleting(false);
  };

  return (
    <button onClick={handleComplete} disabled={isCompleting}>
      {isCompleting ? 'Completing...' : 'Complete'}
    </button>
  );
}
```

**When to use each:**
- **Server Components**: Data fetching, heavy computations, sensitive logic
- **Client Components**: Interactivity, hooks, event handlers, browser APIs

**Resources:**
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

---

### **DAY 3: Server Actions & Forms**

**Mutations without API routes** (3-4 hours)

```typescript
// app/tasks/actions.ts - Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  await prisma.task.create({
    data: {
      title,
      description,
      status: 'TODO',
      reporterId: getCurrentUserId(),
    }
  });

  revalidatePath('/tasks');
}

export async function completeTask(taskId: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    }
  });

  revalidatePath('/tasks');
  revalidatePath(`/tasks/${taskId}`);
}

export async function deleteTask(taskId: string) {
  await prisma.task.delete({
    where: { id: taskId }
  });

  revalidatePath('/tasks');
}

// app/tasks/new/page.tsx - Form using Server Action
import { createTask } from '../actions';

export default function NewTaskPage() {
  return (
    <form action={createTask}>
      <input type="text" name="title" required />
      <textarea name="description" />
      <button type="submit">Create Task</button>
    </form>
  );
}

// components/DeleteTaskButton.tsx - Progressive enhancement
'use client';

import { deleteTask } from '@/app/tasks/actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  );
}

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  return (
    <form action={() => deleteTask(taskId)}>
      <SubmitButton />
    </form>
  );
}
```

**Resources:**
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)

---

### **DAY 4: Streaming & Suspense**

**Progressive Rendering** (3-4 hours)

```typescript
// app/tasks/page.tsx - Streaming with Suspense
import { Suspense } from 'react';

export default function TasksPage() {
  return (
    <div>
      <h1>Tasks</h1>
      
      {/* Show immediately */}
      <TasksHeader />
      
      {/* Stream when ready */}
      <Suspense fallback={<TasksSkeleton />}>
        <TasksList />
      </Suspense>
      
      {/* Stream independently */}
      <Suspense fallback={<StatsSkeleton />}>
        <TaskStats />
      </Suspense>
    </div>
  );
}

// components/TasksList.tsx - Async Server Component
async function TasksList() {
  // This can be slow, but won't block the page
  const tasks = await fetchTasks();

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

// components/TaskStats.tsx - Independent data fetching
async function TaskStats() {
  // Fetches independently, doesn't wait for TasksList
  const stats = await fetchStats();

  return (
    <div>
      <StatCard label="Total" value={stats.total} />
      <StatCard label="Completed" value={stats.completed} />
    </div>
  );
}

// Loading UI
function TasksSkeleton() {
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}
```

**Resources:**
- [Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Suspense](https://react.dev/reference/react/Suspense)

---

### **DAY 5: Metadata & SEO**

**Dynamic SEO optimization** (3-4 hours)

```typescript
// app/layout.tsx - Root metadata
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Task Manager',
    default: 'Task Manager'
  },
  description: 'Professional task management for teams',
  keywords: ['tasks', 'project management', 'productivity'],
  authors: [{ name: 'Aldo Salcedo' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://taskmanager.com',
    siteName: 'Task Manager',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@aldosalcedo',
  },
};

// app/tasks/[id]/page.tsx - Dynamic metadata
export async function generateMetadata({ 
  params 
}: {
  params: { id: string }
}): Promise<Metadata> {
  const task = await prisma.task.findUnique({
    where: { id: params.id }
  });

  if (!task) {
    return {
      title: 'Task Not Found'
    };
  }

  return {
    title: task.title,
    description: task.description,
    openGraph: {
      title: task.title,
      description: task.description,
      type: 'article',
      publishedTime: task.createdAt.toISOString(),
    },
  };
}

// app/sitemap.ts - Generate sitemap
export default async function sitemap() {
  const tasks = await prisma.task.findMany({
    select: { id: true, updatedAt: true }
  });

  return [
    {
      url: 'https://taskmanager.com',
      lastModified: new Date(),
    },
    {
      url: 'https://taskmanager.com/tasks',
      lastModified: new Date(),
    },
    ...tasks.map(task => ({
      url: `https://taskmanager.com/tasks/${task.id}`,
      lastModified: task.updatedAt,
    })),
  ];
}

// app/robots.ts - Generate robots.txt
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: 'https://taskmanager.com/sitemap.xml',
  };
}
```

**Resources:**
- [Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [SEO Optimization](https://nextjs.org/learn/seo/introduction-to-seo)

---

### **DAY 6: Route Handlers & API Routes**

**Backend API with Next.js** (4-5 hours)

```typescript
// app/api/tasks/route.ts - Collection endpoint
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  const tasks = await prisma.task.findMany({
    where: status ? { status } : undefined,
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      reporterId: getCurrentUserId(),
    }
  });

  return NextResponse.json(task, { status: 201 });
}

// app/api/tasks/[id]/route.ts - Item endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = await prisma.task.findUnique({
    where: { id: params.id }
  });

  if (!task) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const task = await prisma.task.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(task);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.task.delete({
    where: { id: params.id }
  });

  return NextResponse.json({ success: true });
}

// Middleware for authentication
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token && request.nextUrl.pathname.startsWith('/tasks')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tasks/:path*', '/api/:path*'],
};
```

**Resources:**
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

### **DAY 7: Advanced Patterns & Deployment**

**Production-ready features** (3-4 hours)

```typescript
// Parallel Routes
// app/dashboard/@analytics/page.tsx
export default function AnalyticsSlot() {
  return <AnalyticsDashboard />;
}

// app/dashboard/@tasks/page.tsx
export default function TasksSlot() {
  return <TasksList />;
}

// app/dashboard/layout.tsx
export default function DashboardLayout({
  analytics,
  tasks,
}: {
  analytics: React.ReactNode;
  tasks: React.ReactNode;
}) {
  return (
    <div>
      <div>{analytics}</div>
      <div>{tasks}</div>
    </div>
  );
}

// Intercepting Routes (Modals)
// app/tasks/[id]/page.tsx
export default function TaskPage() {
  return <TaskDetail />;
}

// app/@modal/(.)tasks/[id]/page.tsx
export default function TaskModal() {
  return (
    <Modal>
      <TaskDetail />
    </Modal>
  );
}

// Route Groups (organization without URL impact)
// app/(marketing)/about/page.tsx
// app/(marketing)/contact/page.tsx
// app/(app)/tasks/page.tsx
// app/(app)/projects/page.tsx

// Environment configuration
// .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_API_URL="https://api.example.com"

// Deploy to Vercel
npm install -g vercel
vercel deploy --prod
```

**Resources:**
- [Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- [Deploying](https://nextjs.org/docs/app/building-your-application/deploying)

---

## ✅ Success Criteria

- [ ] App Router project created
- [ ] Server/Client components understood
- [ ] Server Actions implemented
- [ ] Streaming with Suspense working
- [ ] SEO metadata configured
- [ ] API routes created
- [ ] Deployed to Vercel

---

## 🎯 Week 6 Preview

**Modern Database with Prisma**
- PostgreSQL setup
- Schema design
- Migrations
- Query optimization

---

**You're now a Next.js expert! ⚛️**
