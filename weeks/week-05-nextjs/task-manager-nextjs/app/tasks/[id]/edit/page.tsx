/**
 * page.tsx — Formulario de Edición de Tarea (Ruta: /tasks/[id]/edit)
 * DÍA 7: Advanced Patterns & Deploy
 *
 * CONCEPTOS CLAVE:
 * - Ruta dinámica anidada: /tasks/[id]/edit usa el mismo [id] de la carpeta padre
 * - Formulario de edición: pre-llena valores con `defaultValue={task.campo}`
 * - Server Action con argumentos: `action={() => updateTask(task.id, formData)}`
 *   ← No funciona directamente así — usa `bind`:
 *     const updateTaskWithId = updateTask.bind(null, task.id)
 *     <form action={updateTaskWithId}>
 *
 * PATRÓN .bind() CON SERVER ACTIONS:
 * El <form> pasa FormData automáticamente al Server Action.
 * Pero si quieres pasar argumentos adicionales (como el id), usas .bind():
 *
 *   // En el Server Action:
 *   export async function updateTask(taskId: string, formData: FormData) { ... }
 *
 *   // En el componente:
 *   const updateTaskWithId = updateTask.bind(null, task.id)
 *   <form action={updateTaskWithId}>  ← Next.js pasa taskId + FormData automáticamente
 *
 * DIFERENCIA CON NEW TASK:
 *   /tasks/new: form vacío → createTask(formData)
 *   /tasks/[id]/edit: form pre-llenado → updateTask(id, formData)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTaskById } from '@/lib/data';
import SubmitButton from '@/app/components/SubmitButton';
import { updateTask } from '@/app/tasks/actions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);
  return { title: task ? `Editar: ${task.title}` : 'Editar tarea' };
}

// ============================================================================
// TAREA 7.1: FORMULARIO DE EDICIÓN CON SERVER ACTION + .bind()
// ============================================================================

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) notFound();

  // .bind(null, task.id) crea una nueva función con task.id como primer argumento.
  // Cuando el form hace submit, Next.js llama: updateTask(task.id, formData)
  const updateTaskWithId = updateTask.bind(null, task.id);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/tasks" className="hover:text-slate-600 transition-colors">Tareas</Link>
        <span>›</span>
        <Link href={`/tasks/${task.id}`} className="hover:text-slate-600 transition-colors truncate max-w-xs">
          {task.title}
        </Link>
        <span>›</span>
        <span className="text-slate-600">Editar</span>
      </nav>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Editar Tarea</h2>

        {/* EJERCICIO 7.1: Conecta el form con updateTaskWithId */}
        {/* Pista: <form action={updateTaskWithId} className="space-y-5"> */}
        <form action={updateTaskWithId} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={task.title}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={task.description}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">
                Estado
              </label>
              <select
                id="status"
                name="status"
                defaultValue={task.status}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODO">⏳ Pendiente</option>
                <option value="IN_PROGRESS">🔄 En progreso</option>
                <option value="DONE">✅ Completada</option>
                <option value="BLOCKED">🚫 Bloqueada</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1.5">
                Prioridad
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue={task.priority}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">🔵 Baja</option>
                <option value="MEDIUM">🟡 Media</option>
                <option value="HIGH">🟠 Alta</option>
                <option value="CRITICAL">🔴 Crítica</option>
              </select>
            </div>
          </div>

          {/* EJERCICIO 7.1: Implementa updateTask en actions.ts para que esto funcione */}
          <div className="flex gap-3 pt-2">
            <SubmitButton label="Guardar Cambios" pendingLabel="Guardando..." />
            <Link
              href={`/tasks/${task.id}`}
              className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 7 (Server Actions con .bind())
// - .bind(null, id) es el patrón oficial de Next.js para pasar args extra a Server Actions
// - `defaultValue` pre-llena el campo SIN hacer el input "controlado" (no necesitas useState)
// - El valor del select con defaultValue funciona igual que el input — es uncontrolled
// - En producción: usa Zod para validar todos los campos en el Server Action
