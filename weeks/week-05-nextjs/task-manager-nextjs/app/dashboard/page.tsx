/**
 * page.tsx — Dashboard con Parallel Suspense Boundaries
 * DÍA 4: Streaming & Suspense
 *
 * CONCEPTOS CLAVE:
 * - Suspense en Next.js 16: envuelve componentes async para mostrar skeleton mientras cargan
 * - Parallel data fetching: múltiples awaits en el mismo nivel → cargan SIMULTÁNEAMENTE
 * - Sequential vs Parallel:
 *
 *   SECUENCIAL (lento — espera uno tras otro):
 *   const stats = await getTaskStats()    // 500ms
 *   const tasks = await getTasks()        // 400ms — empieza después del primero
 *   // Total: 900ms
 *
 *   PARALELO (rápido — corren al mismo tiempo):
 *   const [stats, tasks] = await Promise.all([getTaskStats(), getTasks()])
 *   // Total: 500ms (el más lento)
 *
 * - Streaming con Suspense: cada sección puede cargarse independientemente.
 *   El servidor envía el HTML de la página con los skeletons, y va reemplazando
 *   cada sección a medida que sus datos están listos.
 *
 * ARQUITECTURA DEL DASHBOARD:
 *
 *   DashboardPage (Server Component — no await, solo orquesta)
 *     ├── <Suspense fallback={<StatsSkeleton />}>
 *     │     <TaskStatsPanel />   ← async Server Component
 *     └── <Suspense fallback={<ChartSkeleton />}>
 *           <PriorityChart />    ← async Server Component
 *
 * Cada sección carga su propio data sin bloquear a las demás.
 */

import { Suspense } from 'react';
import TaskStatsPanel from '@/app/components/TaskStatsPanel';
import PriorityChart from '@/app/components/PriorityChart';

// ============================================================================
// TAREA 4.1: DASHBOARD CON PARALLEL SUSPENSE
// ============================================================================

/**
 * Skeleton para el panel de estadísticas mientras carga
 */
function StatsSkeleton() {
  // EJERCICIO 4.1: Implementa el skeleton de estadísticas
  // Pista 1: usa divs con animate-pulse y bg-slate-200 como hiciste en loading.tsx
  // Pista 2: el skeleton debe tener la misma altura aproximada que TaskStatsPanel
  //          para evitar layout shift (CLS — Cumulative Layout Shift)
  // Pista 3: 4 cards de ~80px de altura, en grid de 2x2 o fila de 4

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

/**
 * Skeleton para el gráfico de prioridades mientras carga
 */
function ChartSkeleton() {
  // EJERCICIO 4.2: Implementa el skeleton del gráfico
  // Pista: un div rectangular alto con animate-pulse

  return <div className="h-48 bg-slate-200 rounded-xl animate-pulse" />;
}

/**
 * DashboardPage — orquesta los componentes con Suspense independientes
 *
 * Nota: este componente NO tiene await. Solo organiza los Suspense boundaries.
 * El fetching ocurre dentro de TaskStatsPanel y PriorityChart.
 */
export default function DashboardPage() {
  // EJERCICIO 4.3: Organiza el layout del dashboard
  // Pista 1: envuelve <TaskStatsPanel /> con <Suspense fallback={<StatsSkeleton />}>
  // Pista 2: envuelve <PriorityChart /> con <Suspense fallback={<ChartSkeleton />}>
  // Pista 3: ambos Suspense son hermanos — cargan EN PARALELO (esto es streaming)
  // Pista 4: agrega un <h1> y descripción del dashboard arriba

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      {/* Implementa los Suspense boundaries aquí */}
      <p className="text-slate-500 text-sm">
        EJERCICIO 4.3: Agrega los Suspense boundaries con TaskStatsPanel y PriorityChart
      </p>
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 4 (Streaming & Suspense)
// - Suspense + async Server Components = streaming automático
// - No necesitas useState ni useEffect para loading states en Server Components
// - Promise.all() dentro de componentes async = parallel data fetching
// - El skeleton debe tener las mismas dimensiones que el contenido → sin layout shift
// - En producción real: React Suspense + React 19 async Server Components hacen esto nativo
