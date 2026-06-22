/**
 * guards/type-guards.ts - Type Guards y Assertions
 * DÍA 4: Type Narrowing - Refinamiento preciso de tipos
 */

import {
  User,
  UserRole,
  UserStatus,
  Task,
  TaskStatus,
  TaskPriority,
  NotificationType,
} from '../types/entities.js';
import { Result, Maybe } from '../types/base.js';

// ============================================================================
// TAREA 4.1: TYPE GUARDS BÁSICOS
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TYPE GUARDS (TYPE PREDICATES)                                           │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Un type guard es una función que retorna un "type predicate":           │
 * │                                                                         │
 * │   function isX(value: unknown): value is X { ... }                     │
 * │                                                                         │
 * │ ¿Qué significa "value is X"?                                            │
 * │ - Para JavaScript: es simplemente un boolean                            │
 * │ - Para TypeScript: es una INSTRUCCIÓN al compilador                     │
 * │   "Si esta función retorna true, el valor es de tipo X"                │
 * │                                                                         │
 * │ ¿Por qué no basta con retornar boolean?                                 │
 * │   function isString(v: unknown): boolean { return typeof v === 'string' }
 * │   if (isString(value)) {                                                │
 * │     value.toUpperCase(); // ❌ Error: value sigue siendo 'unknown'      │
 * │   }                                                                     │
 * │                                                                         │
 * │   function isString(v: unknown): v is string { ... }                   │
 * │   if (isString(value)) {                                                │
 * │     value.toUpperCase(); // ✅ TypeScript sabe que es string            │
 * │   }                                                                     │
 * │                                                                         │
 * │ IMPORTANTE: TypeScript CONFÍA en tu implementación.                     │
 * │ Si mientes en el predicate, el tipo será incorrecto:                    │
 * │   function isString(v: unknown): v is string {                         │
 * │     return typeof v === 'number'; // ⚠️ Mentira! Compila pero es bug   │
 * │   }                                                                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Type guard con typeof
 * Útil para primitivos: string, number, boolean, etc.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TYPEOF NARROWING                                                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TypeScript entiende typeof automáticamente en if/switch:                │
 * │                                                                         │
 * │   if (typeof x === 'string') {                                          │
 * │     x.toUpperCase(); // TS sabe que x es string                         │
 * │   }                                                                     │
 * │                                                                         │
 * │ Entonces, ¿por qué crear funciones como isString()?                     │
 * │ 1. Reutilización: usarlas en .filter(), .every(), callbacks            │
 * │ 2. Composición: combinar guards (isArrayOf(data, isString))            │
 * │ 3. Legibilidad: isString(x) es más claro que typeof x === 'string'    │
 * │                                                                         │
 * │ NOTA: typeof null === 'object' (quirk de JavaScript)                    │
 * │ Por eso isObject() necesita verificar !== null explícitamente.          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * function process(value: string | number) {
 *   if (isString(value)) {
 *     console.log(value.toUpperCase()); // TypeScript sabe que es string
 *   }
 * }
 *
 * // Uso en array methods - aquí es donde brillan los type guards:
 * const mixed: (string | number)[] = ['hello', 42, 'world'];
 * const strings: string[] = mixed.filter(isString);
 * // Sin type guard: mixed.filter(x => typeof x === 'string') retorna (string | number)[]
 * ```
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Guard para números.
 * Excluye NaN porque aunque typeof NaN === 'number',
 * NaN no se comporta como un número útil (NaN !== NaN, NaN + 1 === NaN).
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Implementar guard para funciones
 *
 * PISTA: typeof value === 'function'
 */
export function isFunction(value: unknown): value is ((...args: unknown[]) => unknown) {
  return typeof value === 'function';
}

/**
 * Implementar guard para objetos (no null, no array)
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ¿POR QUÉ Record<string, unknown>?                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ El tipo de retorno es Record<string, unknown> en lugar de object:       │
 * │                                                                         │
 * │   value is object                         → No permite acceso a props   │
 * │   value is Record<string, unknown>        → Permite data['key']         │
 * │                                                                         │
 * │ Record<string, unknown> significa:                                      │
 * │   "Un objeto con keys string y valores de tipo desconocido"            │
 * │                                                                         │
 * │ Esto permite hacer verificaciones posteriores:                          │
 * │   if (isObject(data)) {                                                 │
 * │     'email' in data;         // ✅ Puedes usar 'in'                     │
 * │     data['email'];           // ✅ Puedes acceder con index             │
 * │   }                                                                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * PISTA: Necesitas 3 checks:
 * - 'object'
 * - null
 * - !Array.isArray(value)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value ==='object' && value !== null && !Array.isArray(value);
}

/**
 * Implementar guard para arrays
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ LIMITACIÓN DE ESTE GUARD                                                │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ isArray<T> verifica que el valor ES un array, pero NO verifica          │
 * │ que los elementos sean de tipo T. El parámetro T es una "promesa"      │
 * │ del desarrollador, no una verificación real.                            │
 * │                                                                         │
 * │   isArray<string>([1, 2, 3]) // ✅ Retorna true! (solo verifica array) │
 * │                                                                         │
 * │ Para verificar el tipo de los elementos, usa isArrayOf() (Ejercicio 3) │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * PISTA: Array.isArray(value)
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function arrayTypesCheck<T>(value: unknown, itemGuard: (item: unknown) => item is T): value is T[] {
return Array.isArray(value) && value.every(itemGuard);
}


/**
 * Implementar guard para null/undefined
 *
 * PISTA: null || undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Implementar guard que verifica que el valor ESTÁ definido.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ NARROWING CON GENERICS                                                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ La firma usa un genérico T para preservar el tipo original:             │
 * │                                                                         │
 * │   isDefined<T>(value: T | null | undefined): value is T                │
 * │                                                                         │
 * │ Esto significa que el tipo se "estrecha" correctamente:                 │
 * │   const user: User | null = findUser(id);                              │
 * │   if (isDefined(user)) {                                                │
 * │     user.name; // ✅ TypeScript sabe que user es User (no null)         │
 * │   }                                                                     │
 * │                                                                         │
 * │ Sin el genérico, perderíamos la información del tipo original.          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * PISTA: Es lo opuesto a isNullish.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// ============================================================================
// TAREA 4.2: CUSTOM TYPE GUARDS
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ GUARDS CON DISCRIMINATED UNIONS Y Extract<>                             │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Los siguientes guards usan Extract<> en el tipo de retorno:             │
 * │                                                                         │
 * │   status is Extract<TaskStatus, { type: 'COMPLETED' }>                 │
 * │                                                                         │
 * │ ¿Qué hace Extract<T, U>?                                                │
 * │ Filtra los miembros de una union T que son asignables a U.             │
 * │                                                                         │
 * │ TaskStatus es una union de 6 variantes:                                 │
 * │   | { type: 'TODO'; assignedAt?: Date }                                │
 * │   | { type: 'IN_PROGRESS'; startedAt: Date; progress: number }         │
 * │   | { type: 'IN_REVIEW'; ... }                                         │
 * │   | { type: 'BLOCKED'; ... }                                           │
 * │   | { type: 'COMPLETED'; completedAt: Date; completedBy: ID }         │
 * │   | { type: 'CANCELLED'; ... }                                         │
 * │                                                                         │
 * │ Extract<TaskStatus, { type: 'COMPLETED' }> extrae SOLO:                │
 * │   { type: 'COMPLETED'; completedAt: Date; completedBy: ID }           │
 * │                                                                         │
 * │ ¿Por qué no escribir el tipo directamente?                              │
 * │ Podrías, pero Extract<> tiene ventajas:                                 │
 * │ - Si cambias la definición de TaskStatus, Extract se actualiza solo    │
 * │ - Menos código duplicado y menos errores                                │
 * │ - Patrón consistente y reconocible                                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Type guard para TaskStatus - verifica si una tarea está completada
 *
 * Después de este guard, TypeScript sabe que status tiene:
 * - status.completedAt (Date)
 * - status.completedBy (ID)
 *
 * @example
 * ```typescript
 * if (isTaskComplete(task.status)) {
 *   console.log(task.status.completedAt); // ✅ Type-safe
 *   console.log(task.status.completedBy); // ✅ Type-safe
 *   // task.status.progress  ❌ Error: no existe en COMPLETED
 * }
 * ```
 */
export function isTaskComplete(
  status: TaskStatus
): status is Extract<TaskStatus, { type: 'COMPLETED' }> {
  if (status.type === 'COMPLETED') {
    return true;
  }
  return false;
}

/**
 * Type guard para tarea en progreso.
 * Después del guard: status.startedAt y status.progress son accesibles.
 */
export function isTaskInProgress(
  status: TaskStatus
): status is Extract<TaskStatus, { type: 'IN_PROGRESS' }> {
  if (status.type === 'IN_PROGRESS') {
    return true;
  }
  return false;
}

/**
 * Type guard para tarea bloqueada.
 * Después del guard: status.reason, status.blockedAt, status.blockedBy son accesibles.
 */
export function isTaskBlocked(
  status: TaskStatus
): status is Extract<TaskStatus, { type: 'BLOCKED' }> {
  if (status.type === 'BLOCKED') {
    return true;
  }
  return false;
}

/**
 * Type guard para tarea en review.
 * Después del guard: status.reviewerId y status.reviewStartedAt son accesibles.
 */
export function isTaskInReview(
  status: TaskStatus
): status is Extract<TaskStatus, { type: 'IN_REVIEW' }> {
  if (status.type === 'IN_REVIEW') {
    return true;
  }
  return false;
}

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ GUARDS CON INTERSECTION: User & { role: UserRole.ADMIN }               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Los guards de usuario usan un patrón diferente a los de TaskStatus:     │
 * │                                                                         │
 * │   user is User & { role: UserRole.ADMIN }                              │
 * │                                                                         │
 * │ ¿Qué significa User & { role: UserRole.ADMIN }?                         │
 * │ Es una INTERSECCIÓN: el valor tiene todas las props de User,            │
 * │ PERO el campo 'role' se estrecha a solo UserRole.ADMIN.                │
 * │                                                                         │
 * │ Sin el guard:                                                            │
 * │   user.role  →  UserRole (ADMIN | MANAGER | DEVELOPER | VIEWER)        │
 * │                                                                         │
 * │ Después del guard:                                                       │
 * │   user.role  →  UserRole.ADMIN (solo este valor)                        │
 * │                                                                         │
 * │ ¿Por qué no usar Extract<> aquí?                                        │
 * │ Porque User NO es una discriminated union. Es un tipo simple.           │
 * │ Extract<> funciona sobre unions; & funciona sobre tipos individuales.   │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Type guard para verificar si un usuario es admin.
 * Después del guard, user.role se estrecha a UserRole.ADMIN.
 *
 * @example
 * ```typescript
 * if (isUserAdmin(user)) {
 *   user.role; // TypeScript sabe que es UserRole.ADMIN
 * }
 * ```
 */
export function isUserAdmin(
  user: User
): user is User & { role: UserRole.ADMIN } {
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  return false;
}

/**
 * Type guard para usuario manager o admin.
 * El tipo de retorno usa union en la intersección:
 *   User & { role: UserRole.ADMIN | UserRole.MANAGER }
 * Esto significa que después del guard, role puede ser ADMIN o MANAGER
 * pero NO DEVELOPER ni VIEWER.
 */
export function isUserManagerOrAbove(
  user: User
): user is User & { role: UserRole.ADMIN | UserRole.MANAGER } {
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return true;
  }

  return false;
}

export function isTaskHighPriority(
  task: Task
): task is Task & { priority: TaskPriority.HIGH } {
  if (task.priority === TaskPriority.HIGH) {
    return true;
  }
  return false;
}

/**
 * Type guard para usuario activo.
 * Estrecha user.status a UserStatus.ACTIVE.
 */
export function isUserActive(
  user: User
): user is User & { status: UserStatus.ACTIVE } {
  if (user.status === UserStatus.ACTIVE) {
    return true;
  }

  return false;
}

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ GUARDS PARA VALIDAR DATOS EXTERNOS (unknown → tipo concreto)           │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Estos guards son los más importantes en aplicaciones reales.            │
 * │ Validan datos que llegan del "mundo exterior":                          │
 * │ - Respuestas de APIs                                                    │
 * │ - Datos de formularios                                                  │
 * │ - JSON parseado                                                         │
 * │ - Query parameters                                                      │
 * │                                                                         │
 * │ El patrón general es:                                                    │
 * │ 1. Verificar que es un objeto: isObject(data)                          │
 * │ 2. Verificar que tiene los campos: 'email' in data                     │
 * │ 3. Verificar los tipos de cada campo: isString(data['email'])          │
 * │                                                                         │
 * │ ¿Por qué 'email' in data Y isString(data['email'])?                    │
 * │ - 'in' solo verifica EXISTENCIA (podría ser null, number, etc.)        │
 * │ - isString verifica el TIPO del valor                                   │
 * │ - Ambos son necesarios para garantizar seguridad total                  │
 * │                                                                         │
 * │ NOTA: El parámetro es unknown, no any.                                  │
 * │ unknown es el tipo seguro para datos externos porque OBLIGA             │
 * │ a verificar antes de usar. any permitiría acceso sin verificación.     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Type guard para validar datos de usuario desde una fuente externa.
 *
 * @example
 * ```typescript
 * const data: unknown = await fetchData();
 * if (isValidUserData(data)) {
 *   // data tiene tipo { email: string; name: string }
 *   console.log(data.email.toUpperCase()); // ✅ Type-safe
 * }
 * ```
 */
export function isValidUserData(
  data: unknown
): data is { email: string; name: string } {
  if (isObject(data) && 'email' in data && 'name' in data){
    if (isString(data['email']) && isString(data['name'])) {
      return true;
    }
  }
  return false;
}

/**
 * Type guard para validar datos de tarea desde una fuente externa.
 * Debe verificar que tiene 'title' y 'description' como strings.
 */
export function isValidTaskData(
  data: unknown
): data is { title: string; description: string } {
  if(isObject(data) && 'title' in data && 'description' in data) {
    if (isString(data['title']) && isString(data['description'])) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// TAREA 4.3: DISCRIMINATED UNIONS - NARROWING AVANZADO
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SWITCH NARROWING CON DISCRIMINATED UNIONS                               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Cuando usas switch sobre el campo discriminante (status.type),          │
 * │ TypeScript ESTRECHA automáticamente el tipo en cada case:               │
 * │                                                                         │
 * │   switch (status.type) {                                                │
 * │     case 'TODO':                                                        │
 * │       // TS sabe: status es { type: 'TODO'; assignedAt?: Date }         │
 * │       status.assignedAt;   // ✅ Accesible                              │
 * │       status.completedAt;  // ❌ Error: no existe en 'TODO'             │
 * │                                                                         │
 * │     case 'COMPLETED':                                                   │
 * │       // TS sabe: status es { type: 'COMPLETED'; completedAt: Date; ... }
 * │       status.completedAt;  // ✅ Accesible                              │
 * │       status.assignedAt;   // ❌ Error: no existe en 'COMPLETED'        │
 * │   }                                                                     │
 * │                                                                         │
 * │ Este narrowing automático es la principal ventaja de las                │
 * │ discriminated unions sobre enums simples o strings.                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Función que procesa TaskStatus usando narrowing en switch.
 *
 * Cada case tiene acceso type-safe a los campos específicos de esa variante.
 * El default usa assertNever() para exhaustiveness checking (ver Tarea 4.4).
 *
 * @example
 * ```typescript
 * const message = getTaskStatusMessage(task.status);
 * // TypeScript garantiza que manejamos todos los 6 casos
 * ```
 */
export function getTaskStatusMessage(status: TaskStatus): string {
  // Implementar con switch(status.type)
  //
  // Maneja los 6 casos: TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, COMPLETED, CANCELLED
  // En cada case, accede a los campos específicos de esa variante:
  //   case 'TODO':        → status.assignedAt (opcional)
  //   case 'IN_PROGRESS': → status.progress
  //   case 'IN_REVIEW':   → status.reviewerId
  //   case 'BLOCKED':     → status.reason
  //   case 'COMPLETED':   → status.completedAt
  //   case 'CANCELLED':   → status.reason
  //
  // Usa assertNever(status) en default para exhaustiveness checking.
  // Si olvidas un case, TypeScript te dará error de compilación.

  switch (status.type) { //discriminated union switch
    case 'TODO':
      return status.assignedAt ? `Assigned at ${status.assignedAt.toISOString()}` : 'Not assigned';
    case 'IN_PROGRESS':
      return `In progress: ${status.progress}% completed`;
    case 'IN_REVIEW':
      return `In review by user ${status.reviewerId}`;
    case 'BLOCKED':
      return `Blocked due to: ${status.reason}`;
    case 'COMPLETED':
      return `Completed at ${status.completedAt.toISOString()}`;
    case 'CANCELLED':
      return `Cancelled: ${status.reason}`;
    default:
      assertNever(status); // Exhaustiveness checking - si falta un case, TS da error aquí
  }
}

/**
 * Función que procesa NotificationType
 *
 * Implementar todos los casos
 */
export function getNotificationMessage(notification: NotificationType): string {
  // Implementar con switch(notification.kind)
  //
  // Maneja los 5 casos: TASK_ASSIGNED, TASK_COMPLETED, COMMENT_MENTION,
  // DUE_DATE_APPROACHING, TASK_BLOCKED
  //
  // Cada variante tiene campos específicos (mira NotificationType en entities.ts).
  // Usa assertNever(notification) en default.

  switch (notification.kind) {
    case 'TASK_ASSIGNED':
      return `You have been assigned to task ${notification.taskId}`;
    case 'TASK_COMPLETED':
      return `Task ${notification.taskId} has been completed`;
    case 'COMMENT_MENTION':
      return `You have been mentioned in a comment on task ${notification.taskId}`;
    case 'DUE_DATE_APPROACHING':
      return `Task ${notification.taskId} is due soon`;
    case 'TASK_BLOCKED':
      return `Task ${notification.taskId} is blocked`;
    default:
      assertNever(notification);
  }
}

/**
 * Type guard para Result
 *
 * @example
 * ```typescript
 * const result = await fetchUser(id);
 * if (isOk(result)) {
 *   console.log(result.value); // ✅ Type-safe
 * } else {
 *   console.log(result.error); // ✅ Type-safe
 * }
 * ```
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

/**
 * Type guards para Maybe
 */
export function isSome<T>(maybe: Maybe<T>): maybe is { type: 'some'; value: T } {
  return maybe.type === 'some'
}

export function isNone<T>(maybe: Maybe<T>): maybe is { type: 'none' } {
  return maybe.type === 'none' 
}

// ============================================================================
// TAREA 4.4: ASSERTION FUNCTIONS
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ASSERTION FUNCTIONS vs TYPE GUARDS                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Son dos mecanismos diferentes para narrowear tipos:                     │
 * │                                                                         │
 * │ TYPE GUARD (value is T):                                                │
 * │   - Retorna boolean                                                     │
 * │   - Se usa con if/else                                                  │
 * │   - NO lanza errores                                                    │
 * │   - El flujo continúa normalmente                                       │
 * │                                                                         │
 * │   if (isString(x)) {                                                    │
 * │     x.toUpperCase();  // ✅ x es string aquí dentro                     │
 * │   }                                                                     │
 * │   x.toUpperCase();  // ❌ x sigue siendo unknown fuera del if          │
 * │                                                                         │
 * │ ASSERTION FUNCTION (asserts value is T):                                │
 * │   - Retorna void (o lanza error)                                        │
 * │   - Se usa como sentencia (no en if)                                    │
 * │   - LANZA error si falla                                                │
 * │   - Narrowea el tipo para TODO el código posterior                      │
 * │                                                                         │
 * │   assertDefined(x);                                                     │
 * │   x.toUpperCase();  // ✅ x es string desde aquí en adelante           │
 * │                                                                         │
 * │ ¿Cuándo usar cada uno?                                                  │
 * │   Type guard: Cuando quieres MANEJAR ambos casos (if/else)             │
 * │   Assertion:  Cuando el caso negativo es un ERROR que debe abortar     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ EXHAUSTIVENESS CHECKING CON assertNever                                 │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ El tipo 'never' representa un valor que NUNCA puede existir.            │
 * │                                                                         │
 * │ En un switch sobre una discriminated union, si manejas TODOS los        │
 * │ casos, el default recibe tipo 'never' (no queda ninguna variante).     │
 * │                                                                         │
 * │ Si OLVIDAS un caso:                                                     │
 * │   switch (status.type) {                                                │
 * │     case 'TODO': ...                                                    │
 * │     case 'IN_PROGRESS': ...                                             │
 * │     // Falta 'COMPLETED', 'BLOCKED', etc.                              │
 * │     default:                                                            │
 * │       assertNever(status);                                              │
 * │       // ❌ Error de compilación!                                       │
 * │       // "Argument of type 'TaskStatus' is not assignable to 'never'"  │
 * │   }                                                                     │
 * │                                                                         │
 * │ Esto GARANTIZA que si agregas una nueva variante a TaskStatus,          │
 * │ TypeScript te forzará a manejarla en todos los switches.               │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

/**
 * assertDefined - Lanza error si el valor es null/undefined.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SINTAXIS: asserts value is T                                            │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ "asserts value is T" le dice a TypeScript:                              │
 * │ "Si esta función retorna sin lanzar error, value es de tipo T"         │
 * │                                                                         │
 * │ El narrowing aplica para TODO el código que sigue a la llamada:         │
 * │                                                                         │
 * │   const user: User | undefined = users.find(...);                      │
 * │   assertDefined(user, 'Not found');   // Lanza si undefined            │
 * │   // Desde aquí: user es User (sin undefined)                           │
 * │   console.log(user.name);             // ✅ Type-safe                   │
 * │   console.log(user.email);            // ✅ Type-safe                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message = 'Value is not defined'
): asserts value is T {
  // Si value es null o undefined, lanza new Error(message)
  // Si NO lanza, TypeScript narrowea value a T para todo el código posterior
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * assertCondition - Lanza error si la condición es falsa.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SINTAXIS: asserts condition                                             │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ A diferencia de "asserts value is T", "asserts condition" no            │
 * │ estrecha un valor específico. En su lugar, aserta que una               │
 * │ condición boolean es verdadera.                                         │
 * │                                                                         │
 * │ TypeScript usa esto para narrowear en ciertos contextos:                │
 * │   assertCondition(typeof x === 'string', 'Must be string');            │
 * │   // TS puede inferir que x es string después (en casos simples)       │
 * │                                                                         │
 * │ Pero su uso principal es como VALIDACIÓN TEMPRANA:                      │
 * │   assertCondition(user.role === 'ADMIN', 'Must be admin');             │
 * │   // Si llegamos aquí, la condición se cumplió                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export function assertCondition(
  condition: boolean,
  message = 'Assertion failed'
): asserts condition {
  // Si condition es false, lanza new Error(message)
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * assertValidTask - Valida y aserta que un valor unknown es una Task válida.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ COMPOSICIÓN DE ASSERTIONS                                               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Esta función compone múltiples assertCondition() para validar           │
 * │ progresivamente un valor unknown → Task.                                │
 * │                                                                         │
 * │ Cada assertCondition actúa como un "checkpoint":                        │
 * │   1. ¿Es un objeto?           → Si no, lanza error                     │
 * │   2. ¿Tiene id string?        → Si no, lanza error                     │
 * │   3. ¿Tiene title string?     → Si no, lanza error                     │
 * │   4. ¿Tiene status objeto?    → Si no, lanza error                     │
 * │                                                                         │
 * │ Si pasa todos los checkpoints, TypeScript confía en que es Task.       │
 * │                                                                         │
 * │ NOTA: Esta validación es parcial (no verifica todos los campos).       │
 * │ En producción, usarías una librería como Zod para validación completa. │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export function assertValidTask(task: unknown): asserts task is Task {
  // Implementar usando assertCondition() compuesto:
  // 1. assertCondition(isObject(task), 'Task must be an object');
  // 2. Verifica que tiene 'id' string
  // 3. Verifica que tiene 'title' string
  // 4. Verifica que tiene 'status' objeto
  assertCondition(isObject(task), 'Task must be an object');
  assertCondition(typeof task['id'] === 'string', 'Task must have an id string');
  assertCondition(typeof task['title'] === 'string', 'Task must have a title string');
  assertCondition(isObject(task['status']), 'Task must have a status object');
}

/**
 * assertValidUser - Valida y aserta que un valor unknown es un User válido.
 * Sigue el mismo patrón de composición de assertions que assertValidTask.
 *
 * Verifica: es objeto, tiene id string, tiene email string, tiene role.
 */
export function assertValidUser(user: unknown): asserts user is User {
  assertCondition(isObject(user), 'User must be an object');
  assertCondition(typeof user['id'] === 'string', 'User must have an id string');
  assertCondition(typeof user['email'] === 'string', 'User must have an email string');
  assertCondition('role' in user, 'User must have a role');
}

// ============================================================================
// GUARDS COMBINADOS - Patrones avanzados
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ COMPOSICIÓN DE TYPE GUARDS                                              │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Los type guards se pueden componer para crear verificaciones complejas. │
 * │                                                                         │
 * │ Hay dos enfoques:                                                       │
 * │                                                                         │
 * │ 1. RETORNA BOOLEAN (sin predicate):                                     │
 * │    function canUserCompleteTask(user, task): boolean                    │
 * │    - Combina múltiples guards internamente                              │
 * │    - El tipo no se estrecha fuera de la función                         │
 * │    - Útil cuando solo necesitas sí/no                                   │
 * │                                                                         │
 * │ 2. RETORNA PREDICATE (con narrowing):                                   │
 * │    function isTaskActive(status): status is Extract<...>                │
 * │    - Estrecha el tipo para el código que llama                          │
 * │    - Permite acceder a campos específicos después del if               │
 * │    - Más poderoso pero más limitado en lo que puedes verificar         │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Guard combinado que verifica si un usuario puede completar una tarea.
 *
 * Retorna boolean (no predicate) porque combina verificaciones de
 * dos valores diferentes (user Y task), y un type predicate solo puede
 * estrechar UN parámetro.
 *
 * @example
 * ```typescript
 * if (canUserCompleteTask(user, task)) {
 *   // Sabemos que el usuario tiene permiso, pero los tipos
 *   // de user y task no se estrechan (es solo boolean)
 * }
 * ```
 */
export function canUserCompleteTask(user: User, task: Task): boolean {
  // Lógica:
  // 1. Si el usuario NO está activo → return false
  // 2. Si el usuario es admin → return true (puede completar cualquiera)
  // 3. Solo el assignee puede completar su tarea → task.assigneeId === user.id
  //
  // Usa los guards que implementaste: isUserActive(), isUserAdmin()
  if (!isUserActive(user)) {
    return false;
  }
  if (isUserAdmin(user)) {
    return true;
  }
  return task.assigneeId === user.id;
}

/**
 * Verifica si una tarea puede ser editada.
 * Retorna boolean (no predicate).
 * Una tarea es editable si está en TODO o IN_PROGRESS.
 */
export function isTaskEditable(status: TaskStatus): boolean {
  if (status.type === 'TODO' || status.type === 'IN_PROGRESS') {
    return true;
  }
  return false;
}

/**
 * Type guard con Extract sobre MÚLTIPLES variantes de la union.
 *
 * Extract<TaskStatus, { type: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' }>
 * extrae las 3 variantes que tienen type 'TODO', 'IN_PROGRESS', o 'IN_REVIEW'.
 *
 * Después del guard, puedes distinguir entre las 3 con otro switch/if:
 * @example
 * ```typescript
 * if (isTaskActive(task.status)) {
 *   // status es TODO | IN_PROGRESS | IN_REVIEW (no BLOCKED, COMPLETED, CANCELLED)
 *   if (task.status.type === 'IN_PROGRESS') {
 *     task.status.progress; // ✅ Segundo nivel de narrowing
 *   }
 * }
 * ```
 */
export function isTaskActive(
  status: TaskStatus
): status is Extract<TaskStatus, { type: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' }> {
  if (status.type === 'TODO' || status.type === 'IN_PROGRESS' || status.type === 'IN_REVIEW') {
    return true;
  }
  return false;
}

// ============================================================================
// EJERCICIOS DÍA 4
// ============================================================================

/**
 * EJERCICIO 1: Implementa un sistema de estados de orden con narrowing
 *
 * @example
 * ```typescript
 * type OrderState =
 *   | { status: 'pending'; items: string[] }
 *   | { status: 'processing'; startedAt: Date }
 *   | { status: 'shipped'; trackingNumber: string }
 *   | { status: 'delivered'; deliveredAt: Date }
 *   | { status: 'cancelled'; reason: string };
 *
 * function processOrder(order: OrderState) {
 *   // Implementar con exhaustive checking
 * }
 * ```
 */
export type OrderState =
  | { status: 'pending'; items: string[] }
  | { status: 'processing'; startedAt: Date }
  | { status: 'shipped'; trackingNumber: string }
  | { status: 'delivered'; deliveredAt: Date }
  | { status: 'cancelled'; reason: string };

export function getOrderStatusMessage(order: OrderState): string {
  // Implementar con switch(order.status) y exhaustive checking
  switch (order.status) {
    case 'pending':
      return `Order is pending with items: ${order.items.join(',')}`
    case 'processing':
      return `Order is processing since ${order.startedAt.toISOString()}`
    case 'shipped':
      return `Order is shipped with tracking number: ${order.trackingNumber}`
    case 'delivered':
      return `Order is delivered at ${order.deliveredAt.toISOString()}`
    case 'cancelled':
      return `Order is cancelled with reason: ${order.reason}`
    default:
      assertNever(order);
  }
}

/**
 * EJERCICIO 2: Crea type guards para validar respuestas de API
 *
 * @example
 * ```typescript
 * type ApiResponse<T> =
 *   | { success: true; data: T }
 *   | { success: false; error: string };
 *
 * function isApiSuccess<T>(response: ApiResponse<T>): ...
 * ```
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is { success: true; data: T } {
  if (response.success === true) {
    return true;
  }
  return false;
}

export function isApiError<T>(
  response: ApiResponse<T>
): response is { success: false; error: string } {
  if (response.success === false) {
    return true;
  }
  return false;
}

/**
 * EJERCICIO 3: Guard que valida arrays con tipo específico.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ HIGHER-ORDER TYPE GUARD                                                 │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Este guard recibe OTRO guard como parámetro:                            │
 * │   guard: (item: unknown) => item is T                                  │
 * │                                                                         │
 * │ Y lo aplica a cada elemento del array con .every().                    │
 * │ Si TODOS los elementos pasan el guard, el array completo               │
 * │ se estrecha a T[].                                                      │
 * │                                                                         │
 * │ Esto es posible porque TypeScript propaga el type predicate            │
 * │ del guard individual al array completo.                                │
 * │                                                                         │
 * │ EJEMPLO:                                                                │
 * │   const data: unknown[] = JSON.parse(input);                           │
 * │   if (isArrayOf(data, isString)) {                                     │
 * │     data; // string[] - cada elemento verificado                        │
 * │   }                                                                     │
 * │   if (isArrayOf(data, isNumber)) {                                     │
 * │     data; // number[] - el guard T se infiere del guard pasado         │
 * │   }                                                                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export function isArrayOf<T>(
  array: unknown[],
  guard: (item: unknown) => item is T
): array is T[] {
  // PISTA: aplica el guard a cada elemento
  return array.every(guard);
}

// ============================================================================
// NOTAS DE APRENDIZAJE DÍA 4
// ============================================================================

/**
 * CONCEPTOS CLAVE:
 *
 * 1. TYPE PREDICATES:
 *    - Sintaxis: value is T
 *    - Retorna boolean pero también "narrowea" el tipo
 *    - TypeScript confía en tu implementación
 *    - Si mientes, el tipo será incorrecto (cuidado!)
 *
 * 2. TYPEOF GUARDS:
 *    - typeof value === 'string' | 'number' | 'boolean' | etc.
 *    - TypeScript entiende esto automáticamente
 *    - Útil para primitivos
 *    - No funciona bien para null (typeof null === 'object')
 *
 * 3. INSTANCEOF GUARDS:
 *    - value instanceof SomeClass
 *    - Útil para clases
 *    - No funciona con interfaces/types (solo existen en compile-time)
 *
 * 4. IN OPERATOR:
 *    - 'property' in object
 *    - Verifica si una propiedad existe
 *    - TypeScript narrowea basado en esto
 *
 * 5. DISCRIMINATED UNIONS:
 *    - Unions con un campo común (discriminante)
 *    - TypeScript puede narrowear por el discriminante
 *    - Permite exhaustive checking con never
 *
 * 6. ASSERTION FUNCTIONS:
 *    - Sintaxis: asserts value is T
 *    - Lanza error si la condición falla
 *    - Después de llamarla, el tipo es narroweado
 *    - Útil para validación temprana
 *
 * 7. EXHAUSTIVENESS CHECKING:
 *    - Usa assertNever(value) en default
 *    - Si value no es never, hay un error
 *    - Garantiza que manejas todos los casos
 *    - Si agregas variantes nuevas, TypeScript te avisa
 *
 * 8. CONTROL FLOW ANALYSIS:
 *    - TypeScript rastrea el tipo a través del código
 *    - if/switch/return afectan el tipo conocido
 *    - Ejemplo: después de if (x === null) return, x no es null
 *
 * PARA MAÑANA (DÍA 5):
 * - Branded Types para IDs seguros
 * - Template Literal Types
 * - Conditional Types avanzados
 * - Type-level programming
 */

/**
 * NOTAS PERSONALES:
 * - Type guards son fundamentales para trabajar con tipos complejos y datos externos.
 * que son los Type predicates? son funciones que retornan boolean pero también le dicen a TypeScript literalmente que el valor es de un tipo específico si la función retorna true con un: value is string(tipo de dato). 
 * Por ejemplo, function isString(value: unknown): value is string { return typeof value === 'string'; } Si esta función retorna true, TypeScript sabe que value es string dentro del bloque if.
 * 
 * typeof es un guard incorporado para tipos primitivos, pero no funciona bien con null (typeof null === 'object') ni con objetos complejos. Para eso usamos type predicates personalizados.
 * 
 * Assertion functions son diferentes a type guards porque lanzan error si la condición no se cumple. Por ejemplo, assertDefined(value) lanza error si value es null o undefined, y después de llamarla, TypeScript sabe que value no es null/undefined.
 * 
 * Exhaustiveness checking con assertNever es una técnica para garantizar que manejamos todos los casos de una discriminated union. Si olvidamos un caso, TypeScript nos dará un error de compilación.
 * 
 * Control flow analysis es la forma en que TypeScript rastrea el tipo de las variables a través del código. Por ejemplo, después de if (x === null) return;, TypeScript sabe que x no es null en el resto del código.
 * 
 * Discriminated unions ejemplos: TaskStatus, NotificationType, Result, Maybe. Son muy poderosos para modelar estados complejos y permiten un narrowing automático en switch/if.
 * 
 * Para validar datos externos, es crucial usar type guards con el tipo unknown. Esto obliga a verificar la estructura y tipos antes de usar los datos, evitando errores en tiempo de ejecución.
 * 
 * Composición de guards: podemos crear guards más complejos combinando otros guards. Por ejemplo, canUserCompleteTask combina isUserActive e isUserAdmin para determinar si un usuario puede completar una tarea.
 */