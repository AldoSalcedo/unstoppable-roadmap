/**
 * layout.tsx — Layout de la sección /tasks
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - Layouts anidados: este layout se renderiza DENTRO del root layout
 * - Persistencia: el layout NO se re-renderiza al navegar entre /tasks, /tasks/1, /tasks/new
 * - Solo `children` cambia — el sidebar persiste sin parpadeo
 * - Server Component: puede tener su propia lógica de datos (ej: usuario activo)
 *
 * ÁRBOL DE RENDERS:
 * RootLayout (app/layout.tsx)
 *   └── TasksLayout (app/tasks/layout.tsx)  ← este archivo
 *         └── TasksPage / TaskDetailPage / NewTaskPage (children)
 */

import Link from 'next/link';
import TaskNav from '../components/TaskNav';
import { Suspense } from 'react';

// ============================================================================
// TAREA 1.12: LAYOUT ANIDADO CON SIDEBAR
// ============================================================================

/**
 * TasksLayout — estructura compartida de toda la sección /tasks
 *
 * `LayoutProps<'/tasks'>` es un helper global de Next.js 16 que infiere los
 * tipos de `children` y cualquier slot paralelo de esa ruta. Es generado por
 * `next dev` / `next build` / `next typegen` — no se importa, está en el scope
 * global una vez que el proyecto ha corrido. Aquí usamos el tipo explícito
 * mientras no hemos hecho el primer `npm run dev`.
 *
 * Ventaja del layout anidado:
 * Al navegar de /tasks → /tasks/1, el sidebar NO se desmonta ni vuelve a montar.
 * El estado del sidebar (si fuera cliente) se preservaría automáticamente.
 */
export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      {/* Header global de la sección tasks */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              ← Inicio
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span>🏥</span> Tareas Clínicas
            </h1>
          </div>
          <Link
            href="/tasks/new"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Nueva Tarea
          </Link>
        </div>
      </header>

      {/* Layout de dos columnas: sidebar + contenido */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex gap-6 px-6 py-6">
        {/* Sidebar de navegación — persiste entre navegaciones */}
        <aside className="w-48 flex-shrink-0">
          <Suspense>
            <TaskNav />
          </Suspense>
        </aside>

        {/* Área de contenido — aquí se inyecta el page activo */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 1 (Layouts)
// - El layout anidado se combina con el root layout automáticamente
// - `children` es el page activo; Next.js lo inyecta en la posición correcta
// - El sidebar solo se monta UNA VEZ aunque navegues entre /tasks y /tasks/1
// - En Day 7 aprenderemos Parallel Routes para renderizar múltiples pages a la vez
