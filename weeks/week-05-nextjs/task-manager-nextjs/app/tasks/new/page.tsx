/**
 * page.tsx — Formulario de Nueva Tarea (Ruta: /tasks/new)
 * DÍA 3: Server Actions & Forms
 *
 * CONCEPTOS CLAVE:
 * - `action={createTask}` conecta el <form> directamente al Server Action
 * - No necesitas un API route, no necesitas fetch(), no necesitas useState para loading
 * - El <form> envía un POST nativo al servidor — funciona SIN JavaScript
 * - SubmitButton usa useFormStatus para mostrar "Creando..." mientras procesa
 *
 * CÓMO FUNCIONA:
 * 1. Usuario llena el form y hace click en "Crear Tarea"
 * 2. HTML envía un POST con FormData al servidor
 * 3. Next.js ejecuta createTask(formData) en el servidor
 * 4. createTask valida, agrega a MOCK_TASKS, llama revalidatePath + redirect
 * 5. Usuario es redirigido a /tasks con la nueva tarea visible
 *
 * ORDEN DE RESOLUCIÓN DE RUTAS (recordatorio):
 * /tasks/new → app/tasks/new/page.tsx  (estático, gana)
 * /tasks/1   → app/tasks/[id]/page.tsx (dinámico, [id] = "1")
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { createTask } from '@/app/tasks/actions';
import SubmitButton from '@/app/components/SubmitButton';

export const metadata: Metadata = {
  title: 'Nueva Tarea',
};

// ============================================================================
// TAREA 3.6: CONECTAR EL FORMULARIO AL SERVER ACTION
// ============================================================================

/**
 * NewTaskPage — formulario conectado al Server Action createTask
 *
 * Ya tienes los imports listos arriba (createTask y SubmitButton).
 * Tu tarea: completar el EJERCICIO 3.1 en actions.ts para que
 * al hacer submit la tarea se cree y te redirija a /tasks.
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
         * `action={createTask}` pasa la función del Server Action directamente.
         * Next.js la convierte en un endpoint POST automáticamente.
         * Funciona sin JavaScript — progressive enhancement real.
         */}
        <form action={createTask} className="space-y-5">
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
             * SubmitButton usa useFormStatus para detectar cuando createTask está corriendo.
             * Muestra "Creando..." y deshabilita el botón automáticamente.
             * Esto funciona porque SubmitButton es un hijo del <form>.
             *
             * IMPORTANTE: primero debes implementar EJERCICIO 3.4 en SubmitButton.tsx
             * y EJERCICIO 3.1 en actions.ts para que todo el flujo funcione.
             */}
            <SubmitButton label="Crear Tarea" pendingLabel="Creando..." />
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

// NOTAS DE APRENDIZAJE — Día 3 (Forms + Server Actions)
// - `action={createTask}` en un <form> es suficiente — no necesitas onSubmit ni fetch
// - SubmitButton DEBE ser hijo del <form> para que useFormStatus lo detecte
// - El flujo: submit → createTask(formData) → revalidatePath → redirect
// - Sin JS: el browser hace el POST nativo directamente — progressive enhancement real
