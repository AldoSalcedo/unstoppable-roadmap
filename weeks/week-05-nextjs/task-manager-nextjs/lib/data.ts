/**
 * data.ts — Capa de datos con mock en memoria
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - Por qué usamos async/await incluso con datos en memoria:
 *   simula la misma API que tendremos con Prisma en Week 6
 * - Server Components pueden hacer `await` directamente — no necesitan useEffect
 * - `setTimeout` con Promise simula la latencia real de base de datos
 *
 * NOTA: En Week 6 (Prisma + PostgreSQL), estas funciones se reemplazarán
 * con llamadas reales a la base de datos. La firma de las funciones no cambia.
 */

import type { Task, CreateTaskInput, UpdateTaskInput } from './types';

// ============================================================================
// TAREA 1.4: DATOS MOCK
// ============================================================================

// Tareas de ejemplo con contexto clínico real
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Revisar resultados de laboratorio — Paciente #4521',
    description:
      'Panel metabólico completo recibido. Valores de glucosa fuera de rango normal. Requiere revisión urgente del médico tratante.',
    status: 'TODO',
    priority: 'CRITICAL',
    assignee: 'Dr. García',
    patientId: '4521',
    dueDate: '2026-06-24',
    createdAt: '2026-06-23T08:00:00Z',
    updatedAt: '2026-06-23T08:00:00Z',
  },
  {
    id: '2',
    title: 'Programar cita de seguimiento post-cirugía',
    description:
      'Paciente #3892 fue dado de alta el 20 de junio. Requiere revisión a los 7 días para evaluar cicatrización.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignee: 'Enfermera Rodríguez',
    patientId: '3892',
    dueDate: '2026-06-25',
    createdAt: '2026-06-22T14:30:00Z',
    updatedAt: '2026-06-23T09:15:00Z',
  },
  {
    id: '3',
    title: 'Actualizar plan de tratamiento — Diabetes tipo 2',
    description:
      'Revisar medicación de metformina para paciente #2104. La última HbA1c fue 8.2%, se requiere ajuste de dosis.',
    status: 'TODO',
    priority: 'HIGH',
    assignee: 'Dr. Martínez',
    patientId: '2104',
    dueDate: '2026-06-26',
    createdAt: '2026-06-21T11:00:00Z',
    updatedAt: '2026-06-21T11:00:00Z',
  },
  {
    id: '4',
    title: 'Completar documentación de alta — Paciente #5670',
    description:
      'Paciente listo para ser dado de alta. Pendiente firma de documentos y entrega de receta de medicamentos.',
    status: 'BLOCKED',
    priority: 'MEDIUM',
    assignee: 'Administrativo López',
    patientId: '5670',
    createdAt: '2026-06-23T07:00:00Z',
    updatedAt: '2026-06-23T10:30:00Z',
  },
  {
    id: '5',
    title: 'Revisión de protocolo de vacunación infantil',
    description:
      'Actualizar el protocolo de vacunación para los niños de 0-5 años según las nuevas guías de la SSA 2026.',
    status: 'DONE',
    priority: 'LOW',
    assignee: 'Dra. Hernández',
    createdAt: '2026-06-20T09:00:00Z',
    updatedAt: '2026-06-22T16:00:00Z',
  },
];

// ============================================================================
// TAREA 1.5: FUNCIONES DE ACCESO A DATOS (ASYNC)
// ============================================================================

/**
 * Simula la latencia de una consulta a base de datos.
 * En producción con Prisma, esto será una query real.
 */
function simulateDbLatency(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * getTasks — obtiene todas las tareas
 *
 * En un Server Component puedes hacer:
 * ```tsx
 * const tasks = await getTasks()  // No necesitas useEffect ni useState
 * ```
 *
 * La magia del RSC: el await ocurre en el servidor,
 * el cliente solo recibe el HTML resultante.
 */
export async function getTasks(): Promise<Task[]> {
  await simulateDbLatency(400);
  // Retorna copia para evitar mutaciones accidentales del array
  return [...MOCK_TASKS];
}

/**
 * getTaskById — obtiene una tarea por su ID
 *
 * Retorna `undefined` si no existe (no lanza error).
 * El page component decidirá si mostrar 404 con `notFound()`.
 */
export async function getTaskById(id: string): Promise<Task | undefined> {
  await simulateDbLatency(200);
  return MOCK_TASKS.find((t) => t.id === id);
}

/**
 * getTasksByStatus — filtra tareas por estado
 */
export async function getTasksByStatus(status: Task['status']): Promise<Task[]> {
  await simulateDbLatency(300);
  return MOCK_TASKS.filter((t) => t.status === status);
}

/**
 * getTaskStats — estadísticas para el dashboard
 */
export async function getTaskStats(): Promise<{
  total: number;
  byStatus: Record<Task['status'], number>;
  critical: number;
}> {
  await simulateDbLatency(500);

  const byStatus = MOCK_TASKS.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<Task['status'], number>,
  );

  return {
    total: MOCK_TASKS.length,
    byStatus: {
      TODO: byStatus.TODO ?? 0,
      IN_PROGRESS: byStatus.IN_PROGRESS ?? 0,
      DONE: byStatus.DONE ?? 0,
      BLOCKED: byStatus.BLOCKED ?? 0,
    },
    critical: MOCK_TASKS.filter((t) => t.priority === 'CRITICAL').length,
  };
}

// Las funciones de mutación (createTask, updateTask, deleteTask)
// se implementarán en el Día 3 como Server Actions.

// EJERCICIO 2: Implementa `getTasksByAssignee(assignee: string)` que filtre
// las tareas por el campo `assignee`. Simula 250ms de latencia.
// export async function getTasksByAssignee(assignee: string): Promise<Task[]> {
//   // Tu implementación aquí
// }
