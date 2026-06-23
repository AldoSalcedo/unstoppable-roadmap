/**
 * types.ts — Tipos de dominio para el Task Manager clínico
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - `type` para uniones de literales (status, priority)
 * - `interface` para objetos con estructura fija
 * - Tipos utilitarios: Pick, Omit, Partial para derivar tipos
 * - 'as const' para objetos de lookup inmutables
 */

// ============================================================================
// TAREA 1.1: TIPOS DE ESTADO Y PRIORIDAD
// ============================================================================

/**
 * TaskStatus — estados posibles de una tarea clínica
 *
 * Usamos un union type de literales en lugar de un enum:
 * - Más liviano (no genera JS extra)
 * - Se serializa directo como string en JSON
 * - Más fácil de usar con Prisma (Week 6)
 */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Labels en español para mostrar en la UI
export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  DONE: 'Completado',
  BLOCKED: 'Bloqueado',
} as const;

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
} as const;

// ============================================================================
// TAREA 1.2: ENTIDAD PRINCIPAL
// ============================================================================

/**
 * Task — entidad principal del sistema de tareas clínicas
 *
 * Aplicación Healthcare:
 * En un SaaS clínico, las tareas representan acciones del equipo médico:
 * - "Revisar resultados de laboratorio del paciente #1234"
 * - "Programar cita de seguimiento post-cirugía"
 * - "Actualizar plan de tratamiento — diabetes tipo 2"
 *
 * El campo `assignee` puede ser un médico, enfermero o administrativo.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  patientId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TAREA 1.3: TIPOS DERIVADOS CON UTILITARIOS
// ============================================================================

/**
 * CreateTaskInput — datos necesarios para crear una nueva tarea
 *
 * `Pick` selecciona solo los campos que el usuario provee al crear.
 * `id`, `createdAt`, `updatedAt` los genera el servidor.
 */
export type CreateTaskInput = Pick<Task, 'title' | 'description' | 'priority'> & {
  assignee?: string;
  patientId?: string;
  dueDate?: string;
};

/**
 * UpdateTaskInput — todos los campos son opcionales en un update
 *
 * `Omit` excluye los campos que nunca deben actualizarse directamente.
 * `Partial` hace todos los campos opcionales.
 */
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;

// EJERCICIO 1: Define un tipo `TaskSummary` con solo id, title, status y priority.
// Pista: usa Pick<Task, ...>
// type TaskSummary = ...
