/**
 * page.tsx — Lista de Tareas (Ruta: /tasks)
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - Server Component async: fetch directo sin useEffect ni useState
 * - `searchParams` en Next.js 16 es un Promise — debe awaitearse
 * - Renderizado dinámico: al leer searchParams, la página no se cachea (siempre fresca)
 * - Las tarjetas de tarea son Server Components → cero JS al cliente
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getTasks, getTasksByStatus } from '@/lib/data';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types';
import type { Task, TaskStatus } from '@/lib/types';
import { Suspense } from 'react';
import SearchBar from '../components/SearchBar';

export const metadata: Metadata = {
  title: 'Tareas',
};

// ============================================================================
// TAREA 1.13: PAGE CON SEARCHPARAMS (NEXT.JS 16)
// ============================================================================

/**
 * TasksPage — lista de tareas con filtro por status
 *
 * CAMBIO IMPORTANTE Next.js 16:
 * `searchParams` ya NO es un objeto plano — es una Promise.
 * Debes hacer `await searchParams` antes de leer sus valores.
 *
 * Por qué cambió:
 * El equipo de Next.js lo hizo para soportar mejor el streaming y PPR
 * (Partial Pre-Rendering). Ahora Next.js puede prerender el shell de la
 * página y resolver los searchParams de forma lazy.
 */
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string, q?: string }>;
}) {
  // ⚠️ Next.js 16: searchParams ES un Promise — await obligatorio
  const { status, q } = await searchParams;

  // Fetch condicional: con filtro o sin filtro
  const tasks = isValidStatus(status)
    ? await getTasksByStatus(status)
    : await getTasks();

  const filteredTasks = q
    ? tasks.filter((tasks) => 
        tasks.title.toLowerCase().includes(q.toLowerCase()) ||
        tasks.description.toLowerCase().includes(q.toLowerCase())
      )
    : tasks;

  const title = status && isValidStatus(status)
    ? `Tareas — ${STATUS_LABELS[status]}`
    : 'Todas las Tareas';

  return (
    <div>
      {/* Header de la lista */}
      <div className="flex items-center justify-between mb-6">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-500 text-sm mt-1">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'} encontradas
          </p>
        </div>
      </div>

      {/* Lista de tareas */}
      {filteredTasks.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAREA 1.14: TASK CARD — SERVER COMPONENT
// ============================================================================

/**
 * TaskCard — tarjeta de resumen de una tarea
 *
 * Server Component: no tiene onClick ni useState.
 * Solo renderiza HTML. No va al bundle de JavaScript del cliente.
 *
 * `<Link>` es el único elemento interactivo — ya viene con Next.js y
 * su pequeño JS de prefetching ya está incluido en el framework.
 */
function TaskCard({ task }: { task: Task }) {
  const priorityColors: Record<Task['priority'], string> = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };

  const statusColors: Record<Task['status'], string> = {
    TODO: 'bg-slate-100 text-slate-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DONE: 'bg-green-100 text-green-700',
    BLOCKED: 'bg-red-100 text-red-700',
  };

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate mb-1">
            {task.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2">
            {task.description}
          </p>
        </div>

        {/* Badges de estado y prioridad */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[task.status]}`}
          >
            {STATUS_LABELS[task.status]}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityColors[task.priority]}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </div>

      {/* Metadata de la tarea */}
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
        {task.assignee && (
          <span>👤 {task.assignee}</span>
        )}
        {task.dueDate && (
          <span>📅 {new Date(task.dueDate).toLocaleDateString('es-MX')}</span>
        )}
        {task.patientId && (
          <span>🏥 Paciente #{task.patientId}</span>
        )}
      </div>
    </Link>
  );
}

// ============================================================================
// TAREA 1.15: EMPTY STATE
// ============================================================================

function EmptyState({ status }: { status?: string }) {
  return (
    <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl">
      <p className="text-4xl mb-3">📋</p>
      <p className="text-slate-500 font-medium">No hay tareas</p>
      <p className="text-slate-400 text-sm mt-1">
        {status ? `No se encontraron tareas con estado "${status}"` : 'Crea tu primera tarea clínica'}
      </p>
      <Link
        href="/tasks/new"
        className="inline-block mt-4 text-blue-600 text-sm font-medium hover:underline"
      >
        + Crear primera tarea
      </Link>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

const VALID_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'];

function isValidStatus(value: string | undefined): value is TaskStatus {
  return value !== undefined && VALID_STATUSES.includes(value as TaskStatus);
}

// NOTAS DE APRENDIZAJE — Día 1 (Page con searchParams)
// - En Next.js 16, searchParams es un Promise — SIEMPRE await antes de usar
// - Al leer searchParams, la página se vuelve dinámica (no se cachea en CDN)
// - `isValidStatus` como type guard previene inyección de valores inválidos
// - Componentes auxiliares (TaskCard, EmptyState) son Server Components implícitamente
