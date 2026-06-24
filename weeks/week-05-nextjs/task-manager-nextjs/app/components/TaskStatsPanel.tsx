/**
 * TaskStatsPanel.tsx — Panel de estadísticas async para el Dashboard
 * DÍA 4: Streaming & Suspense
 *
 * CONCEPTOS CLAVE:
 * - Async Server Component: puede tener `await` directamente — no necesita useEffect
 * - Este componente es un "async leaf" — el nodo hoja que hace el fetching real
 * - Suspense en el padre (DashboardPage) muestra skeleton mientras este carga
 *
 * PATRÓN RECOMENDADO:
 *
 *   PageComponent (no async, orquesta)
 *     └── <Suspense fallback={skeleton}>
 *           <DataComponent />   ← async, hace el await aquí
 *
 * Por qué en el componente hijo y no en el page:
 * Si el page hiciera el await, bloquearía el render de TODO el page.
 * Con Suspense + async child, cada sección puede streamear independientemente.
 */

import { getTaskStats } from '@/lib/data';

// ============================================================================
// TAREA 4.5: PANEL DE ESTADÍSTICAS ASYNC
// ============================================================================

/**
 * TaskStatsPanel — async Server Component que obtiene y muestra estadísticas
 *
 * Usa getTaskStats() que simula 500ms de latencia.
 * El Suspense en DashboardPage mostrará StatsSkeleton durante ese tiempo.
 */
export default async function TaskStatsPanel() {
  // EJERCICIO 4.5: Implementa el panel de estadísticas
  // Pista 1: const stats = await getTaskStats()
  // Pista 2: muestra stats.total, stats.byStatus, stats.critical en cards
  // Pista 3: puedes reutilizar el diseño de las StatCards del home page (app/page.tsx)
  //          o crear un diseño diferente para el dashboard
  // Pista 4: usa PRIORITY_LABELS o STATUS_LABELS de lib/types si necesitas los labels

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <p className="text-slate-500 text-sm">
        EJERCICIO 4.5: Implementa TaskStatsPanel con await getTaskStats()
      </p>
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 4 (Async Server Components)
// - `async function Component()` es válido en React 19 / Next.js 16
// - El await ocurre en el servidor — el cliente nunca ve la promesa
// - Suspense boundary en el padre es OBLIGATORIO para que funcione el streaming
// - Si no hay Suspense, Next.js espera a que el componente resuelva antes de enviar HTML
