/**
 * page.tsx — Formulario de Nueva Tarea (Ruta: /tasks/new)
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - Ruta estática dentro de una sección dinámica: /tasks/new siempre va antes que /tasks/[id]
 *   Next.js da precedencia a las rutas estáticas sobre las dinámicas automáticamente.
 * - El formulario es un stub — en Day 3 se conectará con un Server Action real
 * - El botón de submit no tiene `onClick` aún — se implementa con 'use client' en Day 3
 *
 * ORDEN DE RESOLUCIÓN DE RUTAS:
 * /tasks/new → app/tasks/new/page.tsx  (estático, gana)
 * /tasks/1   → app/tasks/[id]/page.tsx (dinámico, [id] = "1")
 * /tasks/new nunca se confunde con [id] = "new"
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nueva Tarea',
};

// ============================================================================
// TAREA 1.20: FORMULARIO STUB (SE COMPLETA EN DÍA 3)
// ============================================================================

/**
 * NewTaskPage — formulario para crear una tarea clínica
 *
 * Por ahora es un Server Component sin interactividad.
 * En Day 3 agregaremos:
 * - `action={createTask}` conectado al Server Action
 * - `SubmitButton` con 'use client' y useFormStatus para el estado pending
 * - Validación con Zod en el Server Action
 */
export default function NewTaskPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/tasks" className="hover:text-slate-600 transition-colors">
          Tareas
        </Link>
        <span>›</span>
        <span className="text-slate-600">Nueva Tarea</span>
      </nav>

      {/* Formulario */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Crear Tarea Clínica
        </h2>

        {/*
         * `action` estará conectado a un Server Action en Day 3.
         * Por ahora el formulario no hace nada al submitear.
         *
         * El atributo `action` en un <form> con un Server Action
         * es progressive enhancement: funciona SIN JavaScript si es necesario.
         */}
        <form className="space-y-5">
          {/* Título */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Ej: Revisar resultados de laboratorio del paciente #1234"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Describe la tarea, contexto clínico relevante y pasos a seguir..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Fila: Prioridad + Asignado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                required
                defaultValue="MEDIUM"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">🔵 Baja</option>
                <option value="MEDIUM">🟡 Media</option>
                <option value="HIGH">🟠 Alta</option>
                <option value="CRITICAL">🔴 Crítica</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="assignee"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Asignar a
              </label>
              <input
                id="assignee"
                name="assignee"
                type="text"
                placeholder="Ej: Dr. García"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fila: Paciente + Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="patientId"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                ID Paciente
              </label>
              <input
                id="patientId"
                name="patientId"
                type="text"
                placeholder="Ej: 4521"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Fecha límite
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            {/*
             * TODO Day 3: Reemplazar este <button> con <SubmitButton />
             * que use 'use client' + useFormStatus para mostrar estado pending
             */}
            <button
              type="submit"
              disabled
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
              title="Se activa en el Día 3 con Server Actions"
            >
              Crear Tarea (Día 3)
            </button>
            <Link
              href="/tasks"
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

// NOTAS DE APRENDIZAJE — Día 1 (Rutas Estáticas vs Dinámicas)
// - /tasks/new y /tasks/[id] coexisten sin conflicto
// - Next.js siempre prefiere la ruta más específica (estática > dinámica)
// - El <form> sin action es válido en HTML — en Day 3 conectaremos el Server Action
// - `disabled` en el botón es un recordatorio visual de que falta implementar
