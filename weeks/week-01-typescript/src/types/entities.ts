/**
 * types/entities.ts - Entidades del dominio
 * DÍA 1-2: Modelos principales del sistema
 */

import { Entity, ID, SoftDeletable } from './base.js';

// ============================================================================
// USER - Sistema de usuarios
// ============================================================================

/**
 * Roles disponibles en el sistema
 * Cada rol tiene diferentes permisos
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
  VIEWER = 'VIEWER',
}

/**
 * Estado de un usuario
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Tipo base de Usuario sin timestamps
 * Lo envolvemos con Entity<T> para agregar id, createdAt, updatedAt
 */
export type UserBase = {
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
};

/**
 * Usuario completo con Entity
 * Automáticamente incluye: id, createdAt, updatedAt
 */
export type User = Entity<UserBase>;

/**
 * Usuario con soft delete
 */
export type UserWithDeletion = SoftDeletable<User>;

// ============================================================================
// TASK - Sistema de tareas
// ============================================================================

/**
 * Prioridad de una tarea
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Estados posibles de una tarea
 * IMPORTANTE: Esto es una Discriminated Union que usaremos en Día 4
 */
export type TaskStatus =
  | { type: 'TODO'; assignedAt?: Date }
  | { type: 'IN_PROGRESS'; startedAt: Date; progress: number }
  | { type: 'IN_REVIEW'; reviewerId: ID; reviewStartedAt: Date }
  | { type: 'BLOCKED'; reason: string; blockedAt: Date; blockedBy?: ID }
  | { type: 'COMPLETED'; completedAt: Date; completedBy: ID }
  | { type: 'CANCELLED'; cancelledAt: Date; cancelledBy: ID; reason: string };

/**
 * Tipo base de Tarea
 */
export type TaskBase = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: ID;
  reporterId: ID;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dueDate?: Date;
};

/**
 * Tarea completa
 */
export type Task = Entity<TaskBase>;

// ============================================================================
// COMMENT - Comentarios en tareas
// ============================================================================

export type CommentBase = {
  taskId: ID;
  authorId: ID;
  content: string;
  mentions: ID[]; // IDs de usuarios mencionados
  edited: boolean;
  editedAt?: Date;
};

export type Comment = Entity<CommentBase>;

// ============================================================================
// NOTIFICATION - Sistema de notificaciones
// ============================================================================

/**
 * Tipos de notificaciones (Discriminated Union)
 * Cada tipo tiene diferentes campos
 * DÍA 4: Usaremos type narrowing para manejar estos tipos
 */
export type NotificationType =
  | {
      kind: 'TASK_ASSIGNED';
      taskId: ID;
      taskTitle: string;
      assignedBy: ID;
    }
  | {
      kind: 'TASK_COMPLETED';
      taskId: ID;
      taskTitle: string;
      completedBy: ID;
    }
  | {
      kind: 'COMMENT_MENTION';
      commentId: ID;
      taskId: ID;
      mentionedBy: ID;
    }
  | {
      kind: 'DUE_DATE_APPROACHING';
      taskId: ID;
      taskTitle: string;
      dueDate: Date;
      hoursRemaining: number;
    }
  | {
      kind: 'TASK_BLOCKED';
      taskId: ID;
      taskTitle: string;
      reason: string;
      blockedBy: ID;
    };

export type NotificationBase = {
  userId: ID;
  type: NotificationType;
  read: boolean;
  readAt?: Date;
};

export type Notification = Entity<NotificationBase>;

// ============================================================================
// PROJECT - Proyectos que agrupan tareas
// ============================================================================

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export type ProjectBase = {
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: ID;
  memberIds: ID[];
  startDate: Date;
  endDate?: Date;
};

export type Project = Entity<ProjectBase>;

// ============================================================================
// ACTIVITY LOG - Auditoría de cambios
// ============================================================================

/**
 * Tipos de eventos que se registran
 */
export type ActivityEventType =
  | { action: 'TASK_CREATED'; taskId: ID }
  | { action: 'TASK_UPDATED'; taskId: ID; changes: Record<string, unknown> }
  | { action: 'TASK_DELETED'; taskId: ID }
  | { action: 'USER_JOINED'; userId: ID }
  | { action: 'USER_LEFT'; userId: ID }
  | { action: 'PROJECT_CREATED'; projectId: ID }
  | { action: 'COMMENT_ADDED'; commentId: ID; taskId: ID };

export type ActivityLogBase = {
  userId: ID;
  event: ActivityEventType;
  metadata?: Record<string, unknown>;
};

export type ActivityLog = Entity<ActivityLogBase>;

// ============================================================================
// EJERCICIOS DÍA 1
// ============================================================================

/**
 * EJERCICIO 1: Crea una función que verifique si un usuario puede editar una tarea
 * 
 * Reglas:
 * - ADMIN puede editar cualquier tarea
 * - MANAGER puede editar tareas de su equipo
 * - DEVELOPER solo puede editar sus propias tareas asignadas
 * - VIEWER no puede editar ninguna tarea
 * 
 * @example
 * ```typescript
 * const canEdit = canUserEditTask(user, task);
 * ```
 */
export function canUserEditTask(user: User, task: Task): boolean {
  // Implementar
  if (user.role === UserRole.ADMIN) return true;
  if (user.role === UserRole.MANAGER) return true; // Simplificado
  if (user.role === UserRole.VIEWER) return false;
  return task.assigneeId === user.id;
}

/**
 * EJERCICIO 2: Implementa una función que calcule el progreso de un proyecto
 * 
 * @param tasks - Array de tareas del proyecto
 * @returns Porcentaje de completitud (0-100)
 */
export function calculateProjectProgress(tasks: Task[]): number {
  // Implementar
  // Contar tareas completadas vs total
  if (tasks.length === 0) return 0;
  
  const completed = tasks.filter(
    t => t.status.type === 'COMPLETED'
  ).length;
  
  return Math.round((completed / tasks.length) * 100);
}

/**
 * EJERCICIO 3: Crea un type guard para TaskStatus
 * (Esto lo profundizaremos en Día 4)
 * 
 * @example
 * ```typescript
 * if (isTaskCompleted(task.status)) {
 *   console.log(task.status.completedAt); // Type-safe!
 * }
 * ```
 */
export function isTaskCompleted(
  status: TaskStatus
): status is Extract<TaskStatus, { type: 'COMPLETED' }> {
  return status.type === 'COMPLETED';
}

export function isTaskInProgress(
  status: TaskStatus
): status is Extract<TaskStatus, { type: 'IN_PROGRESS' }> {
  return status.type === 'IN_PROGRESS';
}

// ============================================================================
// HELPERS DE CREACIÓN
// ============================================================================

/**
 * Helper para crear un usuario nuevo
 * Útil para tests y desarrollo
 */
export function createUser(
  data: UserBase & { id: string }
): User {
  const now = new Date();
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Helper para crear una tarea nueva
 */
export function createTask(
  data: TaskBase & { id: string }
): Task {
  const now = new Date();
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * CONCEPTOS CLAVE:
 * 
 * 1. DISCRIMINATED UNIONS:
 *    - TaskStatus y NotificationType son discriminated unions
 *    - Cada variante tiene un campo discriminante ('type' o 'kind')
 *    - TypeScript puede narrow el tipo basado en el discriminante
 *    - Permite exhaustive checking en switch/if
 * 
 * 2. ENTITY PATTERN:
 *    - Entity<T> es un Generic que envuelve tipos base
 *    - Agrega campos comunes (id, timestamps) automáticamente
 *    - Evita repetir estos campos en cada tipo
 *    - Type-safe composition
 * 
 * 3. ENUMS VS UNION TYPES:
 *    - Enums: UserRole, TaskPriority (valores simples)
 *    - Union types: TaskStatus (cada variante tiene datos diferentes)
 *    - Usa enums para categorías simples
 *    - Usa unions para tipos con diferentes shapes
 * 
 * 4. OPTIONAL FIELDS:
 *    - ?: indica que un campo puede ser undefined
 *    - Diferente a | undefined (más estricto)
 *    - TypeScript fuerza a verificar undefined antes de usar
 * 
 * PARA MAÑANA (DÍA 2):
 * - Crearemos Repository<T> para estas entidades
 * - Implementaremos QueryBuilder<T> con Generics
 * - Agregaremos Generic Constraints
 */

/** 
 * MIS NOTAS PERSONALES:
 * Enums: son tipos de datos que pueden tener un conjunto limitado de valores. En este caso, UserRole y TaskPriority 
 * son enums que definen los roles de usuario y las prioridades de las tareas, respectivamente.
 * Discriminated Unions: Son tipos de datos que pueden ser uno de varios tipos, pero cada tipo tiene un campo común que los distingue. 
 * En este caso, TaskStatus y NotificationType son discriminated unions que representan diferentes estados de una tarea o tipos de notificaciones, respectivamente.
 * Entity Pattern: Es un patrón de diseño que se utiliza para definir entidades en un sistema. En este caso, Entity<T> es un tipo genérico que agrega 
 * campos comunes como id, createdAt y updatedAt a cualquier tipo base T.
 * Type Guards: Son funciones que permiten verificar el tipo de una variable en tiempo de ejecución. 
 * En este caso, isTaskCompleted e isTaskInProgress son type guards que verifican el estado de una tarea.
 * Type-safe Composition: Es la práctica de combinar tipos de manera que se mantenga la seguridad de tipos.
 * En este caso, al usar Entity<T> y SoftDeletable<T>, podemos componer tipos de manera segura sin perder la información de tipo.
 */