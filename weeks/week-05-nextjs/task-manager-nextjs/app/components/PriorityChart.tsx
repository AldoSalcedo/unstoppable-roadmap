/**
 * PriorityChart.tsx — Gráfico de barras de prioridades
 * DÍA 4: Streaming & Suspense
 *
 * CONCEPTOS CLAVE:
 * - Segundo async leaf: carga en PARALELO con TaskStatsPanel gracias a Suspense
 * - Sin Suspense paralelo: esperaría a que TaskStatsPanel termine antes de cargar
 * - Con Suspense paralelo: ambos componentes hacen su fetch simultáneamente
 *
 * VISUALIZACIÓN:
 * Un "gráfico de barras" con CSS puro (no necesitas Chart.js ni D3):
 *
 *   CRITICAL ████████░░ 40%
 *   HIGH     ██████░░░░ 30%
 *   MEDIUM   ████░░░░░░ 20%
 *   LOW      ██░░░░░░░░ 10%
 *
 * Cada barra es un div con width calculado como porcentaje del total.
 */

import { getTasks } from '@/lib/data';
import { PRIORITY_LABELS } from '@/lib/types';

// ============================================================================
// TAREA 4.6: GRÁFICO DE PRIORIDADES CON CSS PURO
// ============================================================================

/**
 * PriorityChart — distribución de tareas por prioridad
 *
 * Usa getTasks() (400ms latencia) — carga en paralelo con TaskStatsPanel (500ms).
 * El componente más lento es TaskStatsPanel → tiempo total ≈ 500ms en paralelo.
 */
export default async function PriorityChart() {
  // EJERCICIO 4.6: Implementa el gráfico de prioridades
  // Pista 1: const tasks = await getTasks()
  // Pista 2: cuenta cuántas tareas hay de cada prioridad:
  //          const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  //          tasks.forEach(t => counts[t.priority]++)
  // Pista 3: calcula el porcentaje de cada prioridad: (count / tasks.length) * 100
  // Pista 4: renderiza una barra por prioridad:
  //   <div className="flex items-center gap-3">
  //     <span className="w-20 text-sm">{PRIORITY_LABELS[priority]}</span>
  //     <div className="flex-1 bg-slate-100 rounded-full h-4">
  //       <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${pct}%` }} />
  //     </div>
  //     <span className="w-8 text-sm text-right">{count}</span>
  //   </div>
  // Pista 5: usa colores distintos por prioridad (CRITICAL=red, HIGH=orange, etc.)

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribución por Prioridad</h3>
      <p className="text-slate-500 text-sm">
        EJERCICIO 4.6: Implementa PriorityChart con await getTasks()
      </p>
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 4 (Parallel Streaming)
// - Dos componentes async en Suspense paralelos = fetching simultáneo
// - El HTML llega al browser en chunks — primero el shell, luego cada sección
// - CSS puro para gráficas simples: width en % + bg-color es suficiente en dashboards clínicos
// - Para gráficas complejas en producción: Recharts, Victory, o Chart.js (en Client Components)
