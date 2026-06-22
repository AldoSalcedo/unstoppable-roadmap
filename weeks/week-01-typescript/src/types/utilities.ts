/**
 * types/utilities.ts - Custom Utility Types
 * DÍA 3: Utility Types - Transformación y manipulación de tipos
 */

import { User, UserRole, Task } from './entities.js';

// ============================================================================
// TAREA 3.1: TRANSFORMACIÓN DE TIPOS DE USUARIO
// ============================================================================

/**
 * Partial<T> - Hace todos los campos opcionales
 * Ya existe en TypeScript, pero veamos cómo usarlo
 *
 * @example
 * ```typescript
 * type UserUpdate = Partial<User>;
 * // Todos los campos son opcionales, útil para updates
 * const update: UserUpdate = { name: 'Nuevo nombre' };
 * ```
 */

/**
 * Crear tipo para update de usuario
 * Solo debe permitir actualizar ciertos campos (no id, createdAt)
 */
export type UserUpdateDTO = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Crear tipo para crear usuario
 * Omite campos auto-generados
 */
export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Crear tipo para respuesta pública de usuario
 * Excluye información sensible
 */
export type PublicUserDTO = Pick<User,'id' | 'name' | 'email' | 'role' | 'avatarUrl'>;

/**
 * Crear tipo que requiere ciertos campos
 * Útil para validaciones
 */
export type RequiredUserFields = Required<Pick<User, 'email' | 'name' | 'role'>>;

// ============================================================================
// TAREA 3.2: CUSTOM UTILITY TYPES
// ============================================================================

/**
 * DeepPartial<T> - Hace todos los campos opcionales recursivamente
 *
 *
 *
 * @example
 * ```typescript
 * type Nested = { a: { b: { c: number } } };
 * type DP = DeepPartial<Nested>;
 * // { a?: { b?: { c?: number } } }
 *
 * const value: DP = { a: { b: {} } }; // ✅ Válido
 * ```
 */
export type DeepPartial<T> = T extends object //Paso 1: ¿Lo que estoy analizando es un objeto?. Si, pasa al siguiente paso.
  ? T extends readonly unknown[] | Date | ((...args: unknown[]) => unknown) | RegExp //Paso 2: ¿Es un objeto "especial" (como una Fecha, una Función o una Lista)? No, Es un objeto común (como { nombre: "Juan" }). Pasa al último paso.
    ? T           //Si es caso especial, entonces no lo toques, déjalo igual. No queremos hacer opcionales las funciones o las fechas, solo los objetos normales.
    : { [K in keyof T]?: DeepPartial<T[K]> } //Paso 3: La Magia (Recursividad). Aquí le decimos: "Toma cada propiedad (K) del objeto, ponle un signo de interrogación (?) para que sea opcional, y luego vuelve a aplicar DeepPartial a lo que haya adentro".
  : T; //No: Es caso base(Es un simple número o texto). Entonces déjalo igual.

/**
 * DeepRequired<T> - Hace todos los campos requeridos recursivamente
 * ((...args: unknown[]) => unknown) es el tipo de cualquier función, sin importar sus argumentos o su retorno.
 *
 */
export type DeepRequired<T> = T extends object
  ? T extends readonly unknown[] | Date | ((...args: unknown[]) => unknown) | RegExp
    ? T
    : { [K in keyof T]-?: DeepRequired<T[K]> } //Paso 3 ({ [K in keyof T]-?: ... }): Entra en el objeto y, sin importar qué tan profundo esté un campo, le quita el carácter opcional. El resultado es que todos los campos, incluso los anidados, se vuelven requeridos.
  : T;

/**
 * DeepReadonly<T> - Hace todos los campos readonly recursivamente
 * En este caso también queremos que las funciones, fechas, etc. sean readonly, porque no queremos que se modifiquen.
 * @example
 * ```typescript
 * const user: DeepReadonly<User> = { ... };
 * user.name = 'otro'; // ❌ Error: readonly
 * user.status.value = 'x'; // ❌ Error: readonly nested
 * ```
 */
export type DeepReadonly<T> = T extends object
  ? T extends readonly unknown[] | Date | ((...args: unknown[]) => unknown) | RegExp
    ? Readonly<T>
    : { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

/**
 * NonNullableFields<T> - Remueve null y undefined de todos los campos
 * Quitamos null y undefined de cada propiedad, pero también quitamos que puedan ser opcionales, porque si un campo es opcional, entonces su tipo ya incluye undefined. 
 * Al hacer el campo requerido (con -?) y remover null/undefined, garantizamos que el campo siempre tenga un valor válido.
 *
 * @example
 * ```typescript
 * type WithNulls = { a: string | null; b?: number };
 * type NoNulls = NonNullableFields<WithNulls>;
 * // { a: string; b: number }
 * ```
 */
export type NonNullableFields<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * StrictPick<T, K> - Como Pick pero con mejores errores
 * Falla en compile-time si K no existe en T
 *
 * PISTA: Pick<T, K> ya hace esto, pero a veces los errores pueden ser confusos. 
 * Al usar K extends keyof T, TypeScript te dará un error claro si intentas usar una key que no existe en T.
 *
 * @example
 * ```typescript
 * type A = StrictPick<User, 'name' | 'email'>; // ✅
 * type B = StrictPick<User, 'name' | 'invalid'>; // ❌ Error claro
 * ```
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/**
 * StrictOmit<T, K> - Como Omit pero con mejores errores
 *
 * PISTA: Igual que StrictPick, pero para Omit. Al usar K extends keyof T, 
 * garantizamos que solo puedas omitir keys que realmente existen en T, lo que mejora la seguridad de tipos y la experiencia de desarrollo.
 * 
 * @example
 * ```typescript
 * type A = StrictOmit<User, 'password' | 'createdAt'>; // ✅
 * type B = StrictOmit<User, 'invalid'>; // ❌ Error claro
 * ```
 */
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

/**
 * Mutable<T> - Remueve readonly de todos los campos
 *
 * PISTA: Usa mapped types con -readonly para quitar el modificador readonly de cada propiedad. 
 * Esto es útil cuando quieres transformar un tipo que es completamente readonly en uno que puedas modificar.
 */
export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * OptionalKeys<T> - Extrae solo las keys opcionales
 *
 * Record<string, never> Esta es la forma técnica y explícita de decir "un objeto que no puede tener ninguna propiedad" osease un objeto vacío {}.
 * PISTA: Usa un mapped type para iterar sobre las keys de T. 
 * Para cada key K, verifica si {} extends Pick<T, K>.
 *
 * @example
 * ```typescript
 * type T = { a: string; b?: number; c?: boolean };
 * type Opt = OptionalKeys<T>; // 'b' | 'c'
 * ```
 */
export type OptionalKeys<T> = {
  [K in keyof T]: Record<string, never> extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * RequiredKeys<T> - Extrae solo las keys requeridas
 *
 * PISTA: Similar a OptionalKeys, pero invirtiendo la condición. Si {} NO extends Pick<T, K>, entonces K es requerido.
 *
 * @example
 * ```typescript
 * type T = { a: string;
 */
export type RequiredKeys<T> = {
  [K in keyof T]: Record<string, never> extends Pick<T, K> ? never : K;
}[keyof T];

// ============================================================================
// TAREA 3.3: SISTEMA DE PERMISOS CON RECORD
// ============================================================================

/**
 * Acciones posibles en el sistema
 */
export type Action = 'create' | 'read' | 'update' | 'delete';

/**
 * Recursos del sistema
 */
export type Resource = 'users' | 'tasks' | 'projects' | 'comments';

/**
 * Tipo para una permission: "resource:action"
 */
export type Permission = `${Resource}:${Action}`;

/**
 * Tipo de permisos por rol usando Record
 *
 * Record<K, V> crea un objeto con keys K y valores V.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PISTA: Record<K, V>                                                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Record<K, V> crea un tipo donde:                                        │
 * │ - Cada valor de K se convierte en una key requerida                     │
 * │ - Cada key tiene valor de tipo V                                        │
 * │                                                                         │
 * │ Ejemplo:                                                                │
 * │   type Fruit = 'apple' | 'banana';                                     │
 * │   type FruitPrices = Record<Fruit, number>;                            │
 * │   // = { apple: number; banana: number }                               │
 * │                                                                         │
 * │ Para este TODO: Las keys deben ser los roles (UserRole)                │
 * │ y los valores deben ser arrays de Permission.                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * const permissions: RolePermissions = {
 *   ADMIN: ['users:create', 'users:read', ...],
 *   VIEWER: ['tasks:read', 'projects:read'],
 * };
 * ```
 */
// export type RolePermissions = DONE;
export type RolePermissions = Record<UserRole, Permission[]>;

/**
 * Tipo para verificar si un rol tiene un permiso
 *
 * PISTA: Es un tipo de función que recibe (role, permission) y retorna boolean.
 */
// export type PermissionChecker = DONE;
export type PermissionChecker = (role: UserRole, permission: Permission) => boolean;

/**
 * Usar Extract para obtener solo permisos de lectura
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PISTA: Extract<T, U>                                                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Extract filtra los miembros de una union T que son asignables a U.     │
 * │                                                                         │
 * │ Ejemplo:                                                                │
 * │   type T = 'a' | 'b' | 'c';                                           │
 * │   type OnlyA = Extract<T, 'a'>;     // 'a'                            │
 * │   type AorB = Extract<T, 'a' | 'b'>; // 'a' | 'b'                     │
 * │                                                                         │
 * │ Puedes combinar Extract con template literal types:                     │
 * │   Extract<Permission, `${...}:read`>                                   │
 * │ para filtrar solo los permisos que terminan en ':read'.                │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * type ReadPermissions = ReadOnlyPermissions;
 * // 'users:read' | 'tasks:read' | 'projects:read' | 'comments:read'
 * ```
 */
// export type ReadOnlyPermissions = DONE;
export type ReadOnlyPermissions = Extract<Permission, `${string}:read`>;

/**
 * Usar Exclude para obtener permisos que NO son de lectura
 *
 * PISTA: Exclude es lo opuesto de Extract. Exclude<T, U> remueve
 * los miembros de T que son asignables a U.
 */
// export type WritePermissions = DONE;
export type WritePermissions = Exclude<Permission, `${string}:read`>;

/**
 * Type que extraiga el resource de un permission
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PISTA: Template Literal Types + infer                                   │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Puedes "descomponer" un template literal type con infer:                │
 * │                                                                         │
 * │   type First<S> = S extends `${infer F}-${string}` ? F : never;       │
 * │   type X = First<'hello-world'>; // 'hello'                            │
 * │                                                                         │
 * │ Para este Ejercicio: El Permission tiene formato `${Resource}:${Action}`.   │
 * │ Usa infer para capturar la parte antes del ':'.                        │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * type R = ExtractResource<'users:create'>; // 'users'
 * ```
 */
// export type ExtractResource<P extends Permission> = DONE;
export type ExtractResource<P extends Permission> = P extends `${infer R}:${string}` ? R : never; 
// como se lee?: Requisito> El tipo que pases P debe ser un Permission (formato resource:action).
// Patrón de Busqueda> ${infer R}:${string} > Busca un string que tenga dos puntos (:), 
// infer R: "Toma todo lo que encuentres antes de los dos puntos y guárdalo en una variable temporal llamada R".
// ${string}: "Ignora todo lo que venga después de los dos puntos (no me importa qué acción sea)".
// ? R : never> "Si el string que pasaste encaja con el patrón (algo:otraCosa), entonces devuelve lo que capturaste en R (la parte antes de los dos puntos). 
// Si no encaja, devuelve never (porque no es un Permission válido)".

/**
 * Type que extraiga la action de un permission
 *
 * PISTA: Mismo patrón que ExtractResource, pero captura lo que está
 * DESPUÉS del ':' en lugar de antes.
 */
// export type ExtractAction<P extends Permission> = DONE;
export type ExtractAction<P extends Permission> = P extends `${string}:${infer A}` ? A : never;

// ============================================================================
// IMPLEMENTACIÓN DE PERMISOS
// ============================================================================

/**
 * Implementar el mapa de permisos por rol
 *
 * Crea un objeto donde cada UserRole tiene un array de Permission.
 * Piensa qué permisos debería tener cada rol:
 * - ADMIN: todos los permisos
 * - MANAGER: gestión de tareas y proyectos, lectura de usuarios
 * - DEVELOPER: crear/leer/actualizar tareas, leer proyectos
 * - VIEWER: solo lectura
 *
 */
const allPermissions: Permission[] = [
  'users:create',
  'users:read',
  'users:update',
  'users:delete',
  'tasks:create',
  'tasks:read',
  'tasks:update',
  'tasks:delete',
  'projects:create',
  'projects:read',
  'projects:update',
  'projects:delete',
  'comments:create',
  'comments:read',
  'comments:update',
  'comments:delete',
];

export const rolePermissions: RolePermissions = {
  ADMIN: allPermissions,
  MANAGER: [
    'users:read',
    'tasks:create',
    'tasks:read',
    'tasks:update',
    'projects:create',
    'projects:read',
    'projects:update',
  ],
  DEVELOPER: [
    'tasks:create',
    'tasks:read',
    'tasks:update',
    'projects:read',
  ],
  VIEWER: [
    'tasks:read',
    'projects:read',
    'comments:read',
  ],
};

/**
 * Implementar función para verificar permisos
 *
 * PISTA: Usa rolePermissions[role] para obtener el array de permisos
 * del rol, y luego verifica si incluye el permiso dado.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions.includes(permission);
}

/**
 * Implementar función para obtener todos los permisos de un rol
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return rolePermissions[role]
}

// ============================================================================
// EJERCICIOS DÍA 3
// ============================================================================

/**
 * EJERCICIO 1: Implementa FlattenObject<T>
 * Debe aplanar objetos nested usando dot notation
 *
 * @example
 * ```typescript
 * type Nested = { a: { b: { c: number }; d: string } };
 * type Flat = FlattenObject<Nested>;
 * // { 'a.b.c': number; 'a.d': string }
 * ```
 *
 * PISTA: Este es avanzado, usa recursive conditional types
 */
// export type FlattenObject<T, Prefix extends string = ''> =
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type FlattenObject<T, Prefix extends string = ''> = UnionToIntersection<{
  [K in keyof T]: T[K] extends Primitive | readonly unknown[] | ((...args: unknown[]) => unknown) | Date
    ? { [P in `${Prefix}${K & string}`]: T[K] }
    : FlattenObject<T[K], `${Prefix}${K & string}.`>;
} [keyof T]>;

/**
 * DESGLOSE: Transformar un objeto nested en uno plano con keys concatenadas.
 * PREFIX> Prefix extends string = '': Es como llevar un registro de dónde estamos en la estructura del objeto. 
 * Al principio es vacío(Raíz), pero a medida que entramos en objetos anidados, vamos agregando el nombre de la propiedad actual seguido de un punto (.).
 * T[K] extends Primitive | readonly unknown[] | ((...args: unknown[]) => unknown) | Date: Filtro para detenerse, si el valor es un primitivo no intenta aplanarlo más(entrar más), lo mismo para arrays, funciones y fechas. Solo aplanará objetos normales.
 * Crea la llave final: ${Prefix}${K & string} (por ejemplo: "perfil." + "nombre" = "perfil.nombre").
 * Recursividad: Si lo que encontró es otro objeto, entonces se llama a si mismo, ahora con un prefijo nuevo que incluye el nombre de la llave actual y un punto : FlattenObject<T[K], `${Prefix}${K & string}.`>;
 * [keyof T]: Esto es un indexed access type es lo que "extrae" los valores que acabamos de crear para que UnionToIntersection pueda trabajar con ellos.
 * UnionToIntersection: Al recorrer el objeto, TypeScript genera varias piezas pequeñas, este es el "pegamento" que agarra todas las piezas y las junta en un solo objeto sólido o plano. 
 * Sin esto, el resultado sería una unión de objetos pequeños en lugar de un solo objeto con todas las propiedades aplanadas.
 * 
 * Casos de Uso Reales:
 * Librerías de Formularios: (Como React Hook Form). Para poder referenciar un campo anidado usando un string: register("direccion.calle.numero").
 * Traducciones (i18n): Para buscar textos en archivos JSON gigantes usando rutas de puntos: t("errore`s.login.password_incorrecto").
 * Bases de Datos (MongoDB): Cuando quieres hacer un "update" de un campo específico sin pisar todo el objeto.
 * 
 * // Sin UnionToIntersection, el resultado es una Unión de objetos:
    type ResultadoSinPegar = 
      | { "home": string } 
      | { "admin.dashboard": string } 
      | { "admin.users.list": string };
    
    // Con UnionToIntersection, el resultado es una Intersección (un solo objeto):
    type ResultadoPegado = 
      { "home": string } & 
      { "admin.dashboard": string } & 
      { "admin.users.list": string };

    // Que para efectos prácticos es lo mismo que:
    type ObjetoFinal = {
      "home": string;
      "admin.dashboard": string;
      "admin.users.list": string;
    };
 */

/**
 * EJERCICIO 2: Implementa UnionToIntersection<U>
 * Convierte union a intersection
 *
 * @example
 * ```typescript
 * type U = { a: string } | { b: number };
 * type I = UnionToIntersection<U>;
 * // { a: string } & { b: number }
 * ```
 *
 * PISTA: Este es avanzado. Usa contravariant position para forzar
 * a TypeScript a inferir una intersection en lugar de union.
 * Investiga "distributive conditional types" y "contravariance".
 */
// export type UnionToIntersection<U> = 
type UnionToIntersection<U> =
    (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
/**
 * DESGLOSE: Convierte una unión de tipos en una intersección de tipos.
 * Utiliza Contravarianza para agarrar una unión (como A | B | C) y la "aplasta" hasta convertirla en una intersección (A & B & C).
 * Crea una Union de funciones: (U extends unknown ? (x: U) => void : never)> Si le pasas User | Admin, esto lo convierte en (x: User) => void | (x: Admin) => void.
 * Inferencia: Luego, al usar infer I, le decimos a TypeScript: "Mira todas esas funciones que acabas de crear, ¿puedes encontrar un tipo I que pueda ser asignado a todas ellas?".
 * El resultado es que I se convierte en la intersección de todos los tipos en la unión original. 
 * Si U es A | B, entonces el tipo resultante será A & B.
 */

/**
 * EJERCICIO 3: Implementa PickByValue<T, V>
 * Extrae keys cuyo valor sea de tipo V
 *
 * @example
 * ```typescript
 * type T = { a: string; b: number; c: string };
 * type S = PickByValue<T, string>;
 * // { a: string; c: string }
 * ```
 *
 * PISTA: Necesitas dos pasos:
 * 1. Un mapped type que para cada key K retorne K si T[K] extends V, o never
 * 2. Indexar ese mapped type con [keyof T] para obtener solo las keys válidas
 * 3. Pasar esas keys a Pick<T, ...>
 */
// export type PickByValue<T, V> = 
export type PickByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T]>;

// Intenta Explicarlo con tus palabras:
// el tipo recibe un objeto T y un tipo V, y devuelve una selección(Pick) de las propiedades de T
// estas propiedades K dentro de T, deben cumplir la condición de que el T[K] (el tipo de la propiedad K en T) sea asignable a V.
// Esto resulta en un nuevo tipo que incluye solo las propiedades de T compatibles con V.
// Por ejemplo, si T es { a: string; b: number; c: string } y V es string, entonces el resultado será { a: string; c: string }.

/**
 * EJERCICIO 4: Implementa OmitByValue<T, V>
 * Remueve keys cuyo valor sea de tipo V
 *
 * PISTA: Igual que PickByValue pero invirtiendo la condición.
 */
// export type OmitByValue<T, V> = 
export type OmitByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? never : K
}[keyof T]>;

// ============================================================================
// DTOs(Data Transfer Objects o Objetos de Transferencia de Datos) 
// PRÁCTICOS PARA EL PROYECTO
// ============================================================================

/**
 * DTO para crear una tarea
 *
 * Aplica el mismo patrón que CreateUserDTO: usa Omit para excluir
 * los campos auto-generados (id, createdAt, updatedAt).
 */
// export type CreateTaskDTO = 
export type CreateTaskDTO = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
/**
 * DTO para actualizar una tarea
 *
 * PISTA: Combina DeepPartial con Omit. Piensa qué campos NO deberían
 * poder actualizarse (id, timestamps, reporterId).
 */
// export type UpdateTaskDTO = 
export type UpdateTaskDTO = DeepPartial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'reporterId'>>;
/**
 * DTO para respuesta de tarea (sin campos internos)
 *
 * PISTA: ¿Qué campos quieres ocultar del frontend? updatedAt suele
 * ser un campo interno.
 */
// export type TaskResponseDTO = 
export type TaskResponseDTO = Omit<Task, 'updatedAt'>;

/**
 * Tipo para filtros de búsqueda de tareas
 *
 * PISTA: Usa Partial<{ ... }> para que todos los filtros sean opcionales.
 * Incluye campos como: assigneeId, reporterId, priority, statusType,
 * tags, dueDateBefore, dueDateAfter.
 *
 * Para el tipo de priority y statusType, puedes usar indexed access types:
 *   Task['priority']       → el tipo de priority en Task
 *   Task['status']['type'] → el tipo del campo type dentro de status
 */
// export type TaskFilters = 
export type TaskFilters = Partial<{
  asignedId: string;
  reportedId: string;
  priority: Task['priority'];
  statusType: Task['status']['type'];
  tags: string[];
  dueDateBefore: Date;
  dueDateAfter: Date;
}>;

// ============================================================================
// NOTAS DE APRENDIZAJE DÍA 3
// ============================================================================

/**
 * CONCEPTOS CLAVE:
 *
 * 1. UTILITY TYPES BUILT-IN:
 *    - Partial<T>: Todos opcionales
 *    - Required<T>: Todos requeridos
 *    - Readonly<T>: Todos readonly
 *    - Pick<T, K>: Seleccionar keys
 *    - Omit<T, K>: Excluir keys
 *    - Record<K, V>: Crear objeto
 *    - Extract<T, U>: Tipos que extienden U
 *    - Exclude<T, U>: Tipos que NO extienden U
 *    - NonNullable<T>: Remover null/undefined
 *
 * 2. MAPPED TYPES:
 *    - { [K in keyof T]: ... } itera sobre keys
 *    - Permite transformar cada propiedad
 *    - +/- modifiers: agregar/remover readonly/?
 *    - Ejemplo: { [K in keyof T]-?: T[K] } hace todo required
 *
 * 3. CONDITIONAL TYPES:
 *    - T extends U ? X : Y
 *    - Se evalúa en compile-time
 *    - Permite lógica en tipos
 *    - Base para utility types complejos
 *
 * 4. INFER KEYWORD:
 *    - Captura parte de un tipo
 *    - Solo funciona en conditional types
 *    - Ejemplo: T extends Array<infer U> ? U : never
 *    - Extrae el tipo del array
 *    - Primer extends actúa como filtro (Obliga a que cualquier cosa que pases como P sea compatible con el tipo Permission.)
 *    - Pattern Matching: Descomponer tipos complejos
 *    - intenta encajar el valor de P en un molde. Si P coincide con el patrón `${infer R}:${string}`, entonces R captura la parte antes de los dos puntos.
 *    - infer R: Es una forma de decirle a TypeScript: "Si el string tiene un formato algo:otracosa, guarda ese algo en una variable temporal llamada R".
 *
 * 5. TEMPLATE LITERAL TYPES:
 *    - `${A}:${B}` combina strings a nivel de tipo
 *    - Permite crear tipos como Permission
 *    - Type-safe string manipulation
 *
 * 6. RECURSIVE TYPES:
 *    - Un tipo puede referenciarse a sí mismo
 *    - DeepPartial es recursive
 *    - Útil para estructuras nested
 *    - Cuidado con depth infinita
 *
 * PARA MAÑANA (DÍA 4):
 * - Type Guards y Assertions
 * - Discriminated Unions en profundidad
 * - Control flow analysis
 * - Exhaustiveness checking
 */

/**
 * MIS NOTAS PERSONALES:
 * Template Literal Types: Permiten crear tipos basados en la combinación de strings. Son súper útiles para cosas como permisos, donde el formato es predecible (resource:action).
 * 
 * Pick: Permite seleccionar solo ciertas keys de un tipo. Es útil para crear tipos derivados que solo necesitan un subconjunto de las propiedades originales. 
 * Por ejemplo, si tienes un tipo User con muchas propiedades, puedes usar Pick<User, 'name' | 'email'> para crear un nuevo tipo que solo tenga name y email.
 * 
 * Build in significa que ya viene incluído en Typescript, no necesitas implementarlo tu mismo.
 * 
 * Custom utility types: Tipos que uno mismo puede crear usando las herramientas como los utility types, mapped types, conditional types, etc. 
 * Por ejemplo, DeepPartial es un custom utility type que hace todos los campos opcionales recursivamente. No viene con TypeScript, pero es muy útil para trabajar con objetos nested.
 * 
 * Recursivo se refiere a que un tipo puede hacer referencia a si mismo, esto permite crear tipos que pueden manejar estructuras de datos anidadas, como objetos dentro de objetos. 
 * Por ejemplo, DeepPartial<T> es recursivo porque llama a sí mismo para cada propiedad que es un objeto.
 * 
 * El -? en un mapped type se usa para quitar el carácter opcional de una propiedad. Por ejemplo, { [K in keyof T]-?: T[K] } hace que todas las propiedades de T sean requeridas, incluso si originalmente eran opcionales.
 * con el candado Readonly<T> se asegura de que no puedas reasignar la propiedad, pero si la propiedad es un objeto, aún podrías modificar sus campos internos. DeepReadonly se encarga de hacer todo readonly, incluso los objetos anidados.
 *
 * con StrictOmit y StrictPick garantizamos que solo puedas omitir/escoger keys que realmente existen en T y así obtenemos errores más claros en compile-time si intentamos usar una key inválida.
 * 
 * ((...args: unknown[]) => unknown) es el tipo de cualquier función, sin importar sus argumentos o su retorno. 
 * Es una forma de decir "esto es una función, no importa qué haga". Lo usamos en DeepRequired y DeepReadonly para asegurarnos de que las funciones no se modifiquen, 
 * ya que no queremos hacer opcionales o readonly los campos de una función, solo los objetos normales.
 * 
 * En OptionalKeys<T>, {} extends Pick<T, K> es una forma de verificar si la propiedad K es opcional. Si {} (un objeto vacío) puede ser asignado a Pick<T, K>, eso significa que K no es requerido, por lo tanto es opcional.
 * Pick<T, K> crea un objeto que contiene solo la propiedad K.
 * Si el objeto contiene una key opcional, entonces retorna K, si no es opcional retorna never. 
 * Al final, al indexar con [keyof T], obtenemos una unión de todas las keys que son opcionales.
 * [keyof T]. Esto se llama Indexed Access Type. Básicamente dice: "Dame todos los valores que están guardados dentro de este objeto".
 * Indexed access types es una forma de acceder a los tipos que están dentro de un objeto. 
 * En este caso, el objeto es el resultado del mapped type que verifica si cada propiedad es opcional o no. 
 * 
 * Record<K, V> es una forma de crear un tipo de objeto donde las keys son de un tipo específico K y los valores son de otro tipo V. 
 * Es útil para mapear un conjunto de keys a un tipo de valor. Por ejemplo, Record<UserRole, Permission[]> crea un objeto donde cada UserRole es una key y su valor es un array de Permission.
 * 
 * Extract<T, U> es un tipo que filtra los miembros de una unión T que son asignables a U. Es útil para crear subtipos basados en condiciones.
 * 
 * Inferer es una palabra clave que se usa dentro de los conditional types para capturar un tipo dentro de una estructura. 
 * Por ejemplo, en ExtractResource<P extends Permission>, usamos P extends `${infer R}:${string}` para decir: "Si P tiene el formato de algo:otraCosa, entonces captura lo que está antes de los dos puntos en R". 
 * Luego, el tipo resultante es R, que es la parte del recurso del permiso.
 * 
 * ques es una Union de tipos? Un tipo que puede ser uno de varios tipos. Por ejemplo, type A = 'a' | 'b' | 'c'; significa que A puede ser 'a', 'b' o 'c'.
 * que es una Intersection de tipos? Un tipo que combina varios tipos en uno solo. 
 * Por ejemplo, type A = { a: string } & { b: number }; significa que A tiene las propiedades de ambos tipos, es decir, debe tener una propiedad a de tipo string y una propiedad b de tipo number.
 * que es un conditional type? Es un tipo que se define en función de una condición. Se escribe como T extends U ? X : Y, lo que significa que si T es asignable a U, entonces el tipo resultante es X; de lo contrario, es Y.
 * 
 * distributive conditional types: Cuando tienes un conditional type aplicado a una unión, TypeScript lo distribuye sobre cada miembro de la unión. 
 * Por ejemplo, si tienes U = A | B y haces U extends X ? Y : Z, TypeScript lo evaluará como (A extends X ? Y : Z) | (B extends X ? Y : Z). 
 * Esto es importante para entender cómo funcionan tipos como FlattenObject, donde el conditional type se aplica a cada propiedad del objeto.
 * 
 * Contravariance: Es un concepto avanzado de tipos que se refiere a cómo los tipos se relacionan entre sí en términos de subtipos. 
 * En el caso de UnionToIntersection, usamos una función con un parámetro de tipo U para forzar a TypeScript a inferir una intersección en lugar de una unión. 
 * Esto se debe a que las funciones en TypeScript son contravariantes en sus parámetros, lo que significa que al usar U en la posición del parámetro, 
 * TypeScript intentará encontrar un tipo común que pueda ser asignado a todos los miembros de la unión, lo que resulta en una intersección.
 */