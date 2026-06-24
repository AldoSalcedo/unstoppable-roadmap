/**
 * actions.ts — Server Actions para mutaciones de tareas
 * DÍA 3: Server Actions & Forms
 *
 * CONCEPTOS CLAVE:
 * - `'use server'` en la primera línea del archivo marca TODAS las funciones como Server Actions
 * - Server Actions corren exclusivamente en el servidor — nunca llegan al browser
 * - Reciben `FormData` automáticamente cuando se usan en un <form action={...}>
 * - `revalidatePath` limpia el cache de Next.js para que el UI refleje los cambios
 * - `redirect` redirige al usuario después de una mutación exitosa
 *
 * FLUJO DE UNA SERVER ACTION:
 *
 *   Usuario hace submit del form
 *        ↓
 *   Browser envía FormData al servidor (POST nativo de HTML)
 *        ↓
 *   Next.js ejecuta la Server Action en el servidor
 *        ↓
 *   La acción accede a la DB, valida, muta
 *        ↓
 *   revalidatePath() limpia el cache de /tasks
 *        ↓
 *   Next.js re-renderiza la página con datos frescos
 *        ↓
 *   UI actualizada sin recargar manualmente
 *
 * SIN SERVER ACTIONS necesitarías:
 *   1. Crear un API route (app/api/tasks/route.ts)
 *   2. Hacer fetch() desde el cliente
 *   3. Manejar loading/error states manualmente
 *   4. Llamar a router.refresh() para actualizar la UI
 *
 * CON SERVER ACTIONS: una sola función async hace todo eso.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { TaskStatus, TaskPriority } from '@/lib/types';
import { MOCK_TASKS } from '@/lib/data';

// ============================================================================
// TAREA 3.1: CREAR TAREA
// ============================================================================

/**
 * createTask — crea una nueva tarea clínica desde el formulario
 *
 * Recibe FormData automáticamente cuando se usa como:
 * <form action={createTask}>
 *   <input name="title" />
 *   <input name="description" />
 * </form>
 *
 * Pasos a implementar:
 * 1. Extraer campos del FormData con formData.get('campo')
 * 2. Validar que title y description no estén vacíos
 * 3. Agregar la nueva tarea a MOCK_TASKS (o a la DB en Week 6)
 * 4. Llamar revalidatePath('/tasks') para limpiar el cache
 * 5. Llamar redirect('/tasks') para volver a la lista
 *
 * NOTA: `redirect()` lanza una excepción internamente — cualquier código
 * después de él NO se ejecuta. Llama siempre a revalidatePath ANTES.
 */
export async function createTask(formData: FormData): Promise<void> {
  // EJERCICIO 3.1: Implementa la creación de tarea
  // Pista 1: const title = formData.get('title') as string
  // Pista 2: valida que title.trim() no sea vacío antes de continuar
  // Pista 3: para el mock, importa MOCK_TASKS de lib/data y usa .push()
  //          (en Week 6 esto será: await prisma.task.create({ data: {...} }))
  // Pista 4: revalidatePath('/tasks') → redirect('/tasks')

  throw new Error('EJERCICIO 3.1: Implementa createTask');
}

// ============================================================================
// TAREA 3.2: CAMBIAR ESTADO DE TAREA
// ============================================================================

/**
 * updateTaskStatus — cambia el status de una tarea existente
 *
 * Se usa desde un Client Component con un form:
 * <form action={() => updateTaskStatus(taskId, 'DONE')}>
 *   <button type="submit">Completar</button>
 * </form>
 *
 * Nota: cuando la Server Action recibe argumentos adicionales (taskId, newStatus),
 * se llama como una función closure, no directamente desde el action del form.
 */
export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
): Promise<void> {
  // EJERCICIO 3.2: Implementa el cambio de status
  // Pista 1: busca la tarea en MOCK_TASKS con .find(t => t.id === taskId)
  // Pista 2: si no existe, lanza un error: throw new Error('Tarea no encontrada')
  // Pista 3: muta task.status = newStatus y task.updatedAt = new Date().toISOString()
  // Pista 4: revalidatePath('/tasks') y revalidatePath(`/tasks/${taskId}`)

  throw new Error('EJERCICIO 3.2: Implementa updateTaskStatus');
}

// ============================================================================
// TAREA 3.3: ELIMINAR TAREA
// ============================================================================

/**
 * deleteTask — elimina una tarea por su ID
 *
 * Se usa desde DeleteButton (Client Component) como:
 * <form action={() => deleteTask(taskId)}>
 *   <SubmitButton />
 * </form>
 */
export async function deleteTask(taskId: string): Promise<void> {
  // EJERCICIO 3.3: Implementa la eliminación
  // Pista 1: encuentra el índice: MOCK_TASKS.findIndex(t => t.id === taskId)
  // Pista 2: si index === -1, lanza error
  // Pista 3: elimina con MOCK_TASKS.splice(index, 1)
  // Pista 4: revalidatePath('/tasks') → redirect('/tasks')

  throw new Error('EJERCICIO 3.3: Implementa deleteTask');
}

// ============================================================================
// TAREA 7.2: ACTUALIZAR TAREA COMPLETA (DÍA 7)
// ============================================================================

/**
 * updateTask — actualiza título, descripción, status y prioridad de una tarea
 *
 * Se usa con .bind() en el formulario de edición:
 *   const updateTaskWithId = updateTask.bind(null, task.id)
 *   <form action={updateTaskWithId}>
 *
 * Cuando el form hace submit, Next.js llama: updateTask(taskId, formData)
 * donde taskId viene del .bind() y formData del form.
 */
export async function updateTask(taskId: string, formData: FormData): Promise<void> {
  // EJERCICIO 7.2: Implementa la actualización de tarea
  // Pista 1: import MOCK_TASKS from '@/lib/data' en la sección de imports arriba
  // Pista 2: busca el índice: const index = MOCK_TASKS.findIndex(t => t.id === taskId)
  // Pista 3: si no existe → throw new Error('Tarea no encontrada')
  // Pista 4: extrae los campos del FormData:
  //   const title = formData.get('title') as string
  //   const description = formData.get('description') as string
  //   const status = formData.get('status') as TaskStatus
  //   const priority = formData.get('priority') as TaskPriority
  // Pista 5: valida que title y description no estén vacíos
  // Pista 6: actualiza la tarea:
  //   MOCK_TASKS[index] = { ...MOCK_TASKS[index], title, description, status, priority,
  //                          updatedAt: new Date().toISOString() }
  // Pista 7: revalidatePath('/tasks') → revalidatePath(`/tasks/${taskId}`) → redirect(`/tasks/${taskId}`)

  throw new Error('EJERCICIO 7.2: Implementa updateTask');
}

// NOTAS DE APRENDIZAJE — Día 3 (Server Actions)
// - 'use server' en el archivo = todas las exports son Server Actions
// - FormData.get() siempre retorna string | File | null — castea con `as string` y valida
// - revalidatePath ANTES de redirect — redirect lanza excepción y corta la ejecución
// - Los datos mock son mutables porque son un array en módulo — en producción usa DB
// - En Week 6 reemplazarás MOCK_TASKS.push() con prisma.task.create()
// - .bind(null, id) en el cliente pasa el id como primer arg sin `hidden input` en el HTML
