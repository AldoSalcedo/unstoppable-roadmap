/**
 * page.tsx — Detalle de Tarea (Ruta: /tasks/[id])
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - Ruta dinámica: la carpeta `[id]` captura cualquier valor en esa posición
 * - `params` en Next.js 16 ES UN PROMISE — debes hacer `await params`
 * - `notFound()` de next/navigation: muestra not-found.tsx (o 404 genérico)
 * - `generateMetadata`: genera SEO dinámico a partir de los datos de la tarea
 *
 * ⚠️  BREAKING CHANGE Next.js 16:
 * Antes (Next.js 14): `{ params }: { params: { id: string } }`
 * Ahora (Next.js 16): `{ params }: { params: Promise<{ id: string }> }`
 *
 * Si usas el patrón viejo, TypeScript lanza un error y el build falla.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTaskById } from '@/lib/data';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types';

// ============================================================================
// TAREA 1.18: METADATA DINÁMICA POR TAREA
// ============================================================================

/**
 * generateMetadata — genera el <title> y <description> de cada tarea
 *
 * Se llama ANTES que el page component.
 * Si la tarea no existe, retorna metadata genérica (no lanza 404 aquí).
 * La lógica de 404 vive en el page component.
 *
 * ⚠️  params también es Promise aquí — mismo patrón que en el page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  // Await params antes de usar — Next.js 16
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    return {
      title: 'Tarea no encontrada',
      description: 'La tarea que buscas no existe o fue eliminada.',
    };
  }

  return {
    title: task.title,
    description: task.description,
  };
}

// ============================================================================
// TAREA 1.19: PAGE COMPONENT CON PARAMS COMO PROMISE
// ============================================================================

/**
 * TaskDetailPage — página de detalle de una tarea clínica
 *
 * Patrón Next.js 16 para rutas dinámicas:
 * 1. Recibe `params` como `Promise<{ id: string }>`
 * 2. Hace `await params` para extraer el id
 * 3. Usa el id para buscar la tarea
 * 4. Si no existe → `notFound()` activa el not-found.tsx más cercano
 */
export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ⚠️  OBLIGATORIO en Next.js 16: await params antes de desestructurar
  const { id } = await params;

  const task = await getTaskById(id);

  // `notFound()` interrumpe el render y muestra la UI de 404
  if (!task) {
    notFound();
  }

  const priorityConfig: Record<
    typeof task.priority,
    { label: string; className: string; icon: string }
  > = {
    LOW: { label: PRIORITY_LABELS.LOW, className: 'bg-slate-100 text-slate-600', icon: '🔵' },
    MEDIUM: { label: PRIORITY_LABELS.MEDIUM, className: 'bg-blue-100 text-blue-700', icon: '🟡' },
    HIGH: { label: PRIORITY_LABELS.HIGH, className: 'bg-amber-100 text-amber-700', icon: '🟠' },
    CRITICAL: { label: PRIORITY_LABELS.CRITICAL, className: 'bg-red-100 text-red-700', icon: '🔴' },
  };

  const statusConfig: Record<
    typeof task.status,
    { className: string }
  > = {
    TODO: { className: 'bg-slate-100 text-slate-600' },
    IN_PROGRESS: { className: 'bg-blue-100 text-blue-700' },
    DONE: { className: 'bg-green-100 text-green-700' },
    BLOCKED: { className: 'bg-red-100 text-red-700' },
  };

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/tasks" className="hover:text-slate-600 transition-colors">
          Tareas
        </Link>
        <span>›</span>
        <span className="text-slate-600 truncate max-w-xs">{task.title}</span>
      </nav>

      {/* Contenido de la tarea */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Header de la tarea */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex-1">
            {task.title}
          </h2>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${status.className}`}>
              {STATUS_LABELS[task.status]}
            </span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${priority.className}`}>
              {priority.icon} {priority.label}
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Descripción
          </h3>
          <p className="text-slate-700 leading-relaxed">{task.description}</p>
        </div>

        {/* Metadata en grid */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
          {task.assignee && (
            <MetaField label="Asignado a" value={task.assignee} icon="👤" />
          )}
          {task.patientId && (
            <MetaField label="Paciente" value={`#${task.patientId}`} icon="🏥" />
          )}
          {task.dueDate && (
            <MetaField
              label="Fecha límite"
              value={new Date(task.dueDate).toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              icon="📅"
            />
          )}
          <MetaField
            label="Creada"
            value={new Date(task.createdAt).toLocaleDateString('es-MX')}
            icon="🕐"
          />
        </div>

        {/* Acciones — en Day 3 se implementarán con Server Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
          {/* EJERCICIO 3: Agrega un botón "Editar" que navegue a /tasks/[id]/edit */}
          {/* Pista: usa <Link href={`/tasks/${task.id}/edit`}> */}
          <Link
            href="/tasks"
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            ← Volver a tareas
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR
// ============================================================================

function MetaField({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {icon} {label}
      </dt>
      <dd className="text-sm text-slate-700">{value}</dd>
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 1 (Rutas Dinámicas)
// - La carpeta `[id]` captura cualquier segmento: /tasks/1, /tasks/abc-123, etc.
// - `params` es Promise<{ id: string }> en Next.js 16 — await siempre
// - `notFound()` es una función especial que activa el error boundary de 404
// - `generateMetadata` puede hacer sus propias queries — Next.js las deduplica automáticamente
// - Si llamas `getTaskById(id)` en generateMetadata Y en el page, Next.js hace solo UNA llamada
