/**
 * types/branded.ts - Branded Types y Type Safety Avanzado
 * DÍA 5: Type Safety Avanzado - Branded Types, Template Literals, Conditional Types
 */

// ============================================================================
// TAREA 5.1: BRANDED TYPES
// ============================================================================

/**
 * Brand<T, B> crea un tipo "branded" (nominal)
 *
 * El problema: En TypeScript, tipos estructuralmente iguales son intercambiables
 * ```typescript
 * type UserId = string;
 * type TaskId = string;
 *
 * const userId: UserId = 'user-123';
 * const taskId: TaskId = userId; // ✅ Compila! Pero es un bug
 * ```
 *
 * Branded types previenen esto agregando una "marca" invisible
 */
declare const __brand: unique symbol;

export type Brand<T, B> = T & { readonly [__brand]: B };

/**
 * Crear branded type para UserId
 *
 * @example
 * ```typescript
 * const userId: UserId = 'user-123' as UserId;
 * const taskId: TaskId = userId; // ❌ Error! Tipos incompatibles
 * ```
 */
// Definir UserId usando Brand<T, B>
export type UserId = Brand<string, 'UserId'>;

/**
 * Crear branded type para TaskId
 */
// Definir TaskId usando Brand<T, B>
export type TaskId = Brand<string, 'TaskId'>;

/**
 * Crear branded type para ProjectId
 */
// Definir ProjectId usando Brand<T, B>
export type ProjectId = Brand<string, 'ProjectId'>;

/**
 * Crear branded type para CommentId
 */
// Definir CommentId usando Brand<T, B>
export type CommentId = Brand<string, 'CommentId'>;

/**
 * Helper para crear IDs branded de forma segura
 *
 * @example
 * ```typescript
 * const userId = createUserId('user-123');
 * // userId tiene tipo UserId, no string
 * ```
 */
export function createUserId(id: string): UserId {
  if(id.startsWith('user-')) {
    return id as UserId;
  }
  throw new Error('Invalid user ID format');
}

export function createTaskId(id: string): TaskId {
  if(id.startsWith('task-')) {
    return id as TaskId;
  }
  throw new Error('Invalid task ID format');
}

export function createProjectId(id: string): ProjectId {
  if(id.startsWith('project-')) {
    return id as ProjectId;
  }
  throw new Error('Invalid project ID format');
}

/**
 * Crear EmailAddress branded type con validación
 *
 * @example
 * ```typescript
 * const email = createEmail('invalid'); // ❌ Lanza error
 * const email = createEmail('user@example.com'); // ✅ EmailAddress
 * ```
 */
// Definir EmailAddress branded type
export type EmailAddress = Brand<string, 'EmailAddress'>;

export function createEmail(email: string): EmailAddress {
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return email as EmailAddress;
  }
  throw new Error('Invalid email format');
}

/**
 * Crear ISODateString branded type
 *
 * @example
 * ```typescript
 * const date: ISODateString = '2024-01-15T10:30:00Z' as ISODateString;
 * // Garantiza que el string es una fecha ISO válida
 * ```
 */
export type ISODateString = Brand<string, 'ISODateString'>;

export function createISODateString(date: Date): ISODateString {
  const isoString = date.toISOString();
  if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(isoString)) {
    return isoString as ISODateString;
  }
  throw new Error('Invalid ISO date format');
}

export function parseISODateString(str: string): ISODateString {
  const date = new Date(str);
  if(isNaN(date.getTime())) {
    throw new Error('Invalid date string');
  }
  return createISODateString(date);
}

/**
 * Crear PositiveNumber branded type
 *
 * @example
 * ```typescript
 * const hours: PositiveNumber = createPositive(5); // ✅
 * const invalid: PositiveNumber = createPositive(-1); // ❌ Error
 * ```
 */
export type PositiveNumber = Brand<number, 'PositiveNumber'>;

export function createPositive(n: number): PositiveNumber {
  if (n <= 0) {
    throw new Error(`Number must be positive: ${n}`);
  }
  return n as PositiveNumber;
}

/**
 * Crear NonEmptyString branded type
 */
export type NonEmptyString = Brand<string, 'NonEmptyString'>;

export function createNonEmptyString(str: string): NonEmptyString {
  if (str.trim().length === 0) { // utilizamos una propiedad numérica que el string ya tiene guardada ya que es menos costoso a niver computacional
    throw new Error('String cannot be empty');
  }
  return str as NonEmptyString;
}

// ============================================================================
// TAREA 5.2: TEMPLATE LITERAL TYPES
// ============================================================================

/**
 * Template Literal Types permiten crear tipos basados en strings
 *
 * @example
 * ```typescript
 * type Greeting = `Hello, ${string}!`;
 * const valid: Greeting = 'Hello, World!'; // ✅
 * const invalid: Greeting = 'Hi there'; // ❌
 * ```
 */

/**
 * Crear EventName con prefijos validados
 *
 * Eventos deben seguir el patrón: 'dominio:acción'
 *
 * @example
 * ```typescript
 * const event1: EventName = 'task:created'; // ✅
 * const event2: EventName = 'user:deleted'; // ✅
 * const event3: EventName = 'invalid'; // ❌
 * ```
 */
export type EventDomain = 'task' | 'user' | 'project' | 'comment' | 'system';
export type EventAction = 'created' | 'updated' | 'deleted' | 'viewed' | 'error';

export type EventName = `${EventDomain}:${EventAction}`;

/**
 * Mapa de handlers de eventos - type-safe
 */
export type EventHandlers = {
  [K in EventName]?: (payload: unknown) => void;
};

/**
 * Crear Route paths tipados
 *
 * @example
 * ```typescript
 * const route1: Route = '/api/users/:id'; // ✅
 * const route2: Route = '/api/tasks/:taskId/comments/:commentId'; // ✅
 * const route3: Route = '/invalid//path'; // ❌ Doble slash
 * ```
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiVersion = 'v1' | 'v2';
export type ResourceName = 'users' | 'tasks' | 'projects' | 'comments';

// Rutas base
export type BaseRoute = `/api/${ApiVersion}/${ResourceName}`;

// Rutas con parámetros
export type RouteWithId = `${BaseRoute}/:id`;

// Rutas anidadas
export type NestedRoute = `${RouteWithId}/${ResourceName}`;

// Todas las rutas válidas
export type Route = BaseRoute | RouteWithId | NestedRoute;

/**
 * Tipo para endpoint completo con método y ruta
 */
export type Endpoint = `${HttpMethod} ${Route}`;

/**
 * Crear CSSProperty type-safe
 *
 * @example
 * ```typescript
 * const color: CSSColor = '#FF5733'; // ✅
 * const color2: CSSColor = 'rgb(255, 87, 51)'; // ✅
 * const invalid: CSSColor = 'not-a-color'; // ❌
 * ```
 */
export type HexColor = `#${string}`;
export type RGBColor = `rgb(${number}, ${number}, ${number})`;
export type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;
export type CSSColor = HexColor | RGBColor | RGBAColor;

/**
 * CSS Units
 */
export type CSSUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw';
export type CSSLength = `${number}${CSSUnit}`;

// ============================================================================
// TAREA 5.3: CONDITIONAL TYPES
// ============================================================================

/**
 * Conditional types permiten lógica a nivel de tipos
 *
 * Sintaxis: T extends U ? X : Y
 * - Si T extiende U, el tipo es X
 * - Si no, el tipo es Y
 */

/**
 * Implementar Awaited<T> custom
 * Extrae el tipo de una Promise
 *
 * @example
 * ```typescript
 * type A = Awaited<Promise<string>>; // string
 * type B = Awaited<Promise<Promise<number>>>; // number (recursive)
 * type C = Awaited<string>; // string (no es promise)
 * ```
 */
export type CustomAwaited<T> = T extends Promise<infer U>
  ? CustomAwaited<U>
  : T;

  /**
   * Cuando usas infer U, le estás diciendo a TypeScript: 
   * "Si esto es una Promesa, no sé qué hay dentro, pero lo que sea que encuentres, atrapalo y llámalo U".
   * El proceso paso a paso>
   * Tenemos esto: CustomAwaited<Promise<Promise<string>>>
   * Primer nivel: ¿Es una Promise? Sí.
   * infer U: TypeScript "adivina" que dentro de la primera promesa hay otra Promise<string>. Así que U es Promise<string>.
   * Recursividad: Llama a CustomAwaited<U> (es decir, vuelve a empezar con la parte interna).
   * Segundo nivel: ¿Es una Promise? Sí.
   * infer U: Ahora "adivina" que dentro hay un string. U es string.
   * Tercer nivel: ¿Es una Promise? No, es un string.
   * Resultado final: Devuelve T (que ahora es el string limpio).
   */

/**
 * Implementar ExtractArrayType<T>
 * Extrae el tipo de elementos de un array
 *
 * @example
 * ```typescript
 * type A = ExtractArrayType<string[]>; // string
 * type B = ExtractArrayType<number[]>; // number
 * type C = ExtractArrayType<string>; // never
 * ```
 */
export type ExtractArrayType<T> = T extends (infer U)[] ? U : never;

/**
 * raciocinio:
 * si T encaja con el tipo de dato que tiene U guardado en el array, 
 * regresaremos el tipo de dato, ejemplo: string, pero si no encaja, 
 * regresaremos never
 * como pregunta: ¿Es T una lista de algo?
 * La Captura (infer U): "Si es una lista, toma el tipo de los elementos que están dentro y llámalos U"
 */

/**
 * Implementar FunctionReturnType<T> custom
 *
 * @example
 * ```typescript
 * type A = FunctionReturnType<() => string>; // string
 * type B = FunctionReturnType<(x: number) => boolean>; // boolean
 * ```
 */
export type FunctionReturnType<T> = T extends (...args: infer _) => infer R
  ? R
  : never;

/**
 * Implementar FunctionParameters<T> custom
 *
 * @example
 * ```typescript
 * type A = FunctionParameters<(a: string, b: number) => void>;
 * // [string, number]
 * ```
 */
export type FunctionParameters<T> = T extends (...args: infer P) => unknown
  ? P
  : never;

/**
 * Implementar PromiseType<T>
 * Si T es Promise, extrae el tipo. Si no, retorna T.
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : T;

/**
 * Implementar IsArray<T>
 * Retorna true si T es array, false si no
 *
 * @example
 * ```typescript
 * type A = IsArray<string[]>; // true
 * type B = IsArray<string>; // false
 * ```
 */
export type IsArray<T> = T extends unknown[] ? true : false;

/**
 * Implementar IsPromise<T>
 */
export type IsPromise<T> = T extends Promise<unknown> ? true : false;

/**
 * Conditional type para construír campos opcionales basados en condición
 *
 * @example
 * ```typescript
 * type WithOptionalAge<HasAge extends boolean> = {
 *   name: string;
 * } & ConditionalField<HasAge, 'age', number>;
 * ```
 */
export type ConditionalField<
  Condition extends boolean,
  Key extends string,
  Value
> = Condition extends true ? { [K in Key]: Value } : { [K in Key]?: Value };

// ============================================================================
// TIPOS AVANZADOS COMBINADOS
// ============================================================================

/**
 * Tipo que extrae todas las keys de funciones de un objeto
 */
export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends ((...args: unknown[]) => unknown) ? K : never;
}[keyof T];

/**
 * Tipo que extrae todas las keys NO funciones de un objeto
 */
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends ((...args: unknown[]) => unknown) ? never : K;
}[keyof T];

/**
 * Tipo que hace algunos campos required y otros optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * export type PartialBy<T, K extends keyof T> Dame un objeto T y dime cuáles de sus llaves K quieres volver opcionales
 * Omit<T, K> Paso 1: Crea un objeto que tenga todo lo de T, excepto las llaves que me pediste cambiar. 
 * Todo lo que queda aquí sigue siendo obligatorio.
 * & Paso 2: fusiona lo anterior con lo que viene después
 * Partial<Pick<T, K>> Paso 3: Primero "seleccionamos" (Pick) solo las llaves que queremos cambiar. 
 * Luego, les aplicamos Partial para ponerles el signo ?.
 * Resultado final: Un nuevo tipo que tiene las llaves que querías cambiar como opcionales, y el resto sigue siendo obligatorio.
 * 
 * En TypeScript, no podemos "editar" una propiedad de una interfaz directamente; 
 * tenemos que extraer lo que no queremos cambiar y unirlo con la versión modificada de lo que sí queríamos cambiar.
 */

/**
 * Tipo que hace algunos campos optional y otros required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Tipo para construir queries type-safe
 * eq: equal, ne: not equal, in: in array
 */
export type WhereClause<T> = {
  [K in keyof T]?: T[K] | { $eq: T[K] } | { $ne: T[K] } | { $in: T[K][] };
};

// ============================================================================
// EJERCICIOS DÍA 5
// ============================================================================

/**
 * EJERCICIO 1: Crea un tipo que valide rutas de API
 *
 * @example
 * ```typescript
 * type ValidRoute = ValidateRoute<'/api/users/:id'>; // true
 * type InvalidRoute = ValidateRoute<'/api//invalid'>; // false
 * ```
 */
export type ValidateRoute<T extends string> = T extends `/api/${string}`
  ? T extends `${string}//${string}`
    ? false
    : true
  : false;
/**
 * raciocinio:
 * T extends `/api/${string}` ¿Empieza la ruta obligatoriamente con /api/?
 * Si escribes /users, el tipo devuelve false inmediatamente.
 * Si escribes /api/users, pasa al siguiente nivel.
 * T extends `${string}//${string}` ¿Contiene la ruta un doble slash?
 * Si el resultado es true (o sea, si sí tiene las dos barras), el tipo devuelve false, por lo tanto falla la validación.
 * Si el resultado es false (o sea, si no tiene las dos barras), el tipo devuelve true, por lo tanto pasa la validación.
 */

/**
 * EJERCICIO 2: Implementa un tipo PathParams que extraiga parámetros de una ruta
 *
 * @example
 * ```typescript
 * type Params = PathParams<'/api/users/:userId/tasks/:taskId'>;
 * // { userId: string; taskId: string }
 * ```
 */
export type PathParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & PathParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : Record<string, never>;
/**
 * raciocinio:
 * Buscamos un : y una / después del parámetro. Si los encontramos, inferimos el nombre del parámetro (Param) y el resto de la ruta (Rest).
 * ejemplo: Param = :userId y Rest = tasks/:taskId
 * Resultado parcial: { userId: string } & PathParams<"tasks/:taskId">.
 * Luego, el tipo se llama recursivamente con el resto de la ruta. En la siguiente iteración, Param = :taskId y Rest = "".
 * Resultado final: { userId: string } & { taskId: string } => { userId: string; taskId: string }
 */

/**
 * EJERCICIO 3: Crea un tipo que convierta un union a tuple
 * (Este es MUY avanzado)
 */
// export type UnionToTuple<T> = /* Muy complejo */
export type UnionToTuple<T, U = T> =
  [T] extends [never]
    ? []
    : T extends U
      ? [T, ...UnionToTuple<Exclude<U, T>>]
      : never;
/**
 * raciocinio:
 * [T] extends [never] - Si T es never, devuelve un array vacío
 * T extends U - Si T es una de las opciones de U, lo incluye en el tuple
 * Exclude<U, T> - Elimina T de U para la siguiente iteración
 * El resultado es un tuple que contiene cada miembro del union original, en orden de evaluación.
 */

/**
 * EJERCICIO 4: Implementa un tipo que aplane promises anidados
 */
export type FlattenPromise<T> = T extends Promise<infer U>
  ? FlattenPromise<U>
  : T;

/**
 * raciocinio:
 * T extends Promise<infer U> - Si T es una Promise, inferimos el tipo que resuelve (U).
 * Luego, llamamos recursivamente a FlattenPromise con U para seguir aplanando si U también es una Promise.
 * Si T no es una Promise, simplemente devolvemos T, que es el tipo final resuelto.
 */

/**
 * EJERCICIO 5: Crea branded types para diferentes unidades
 */
export type Meters = Brand<number, 'Meters'>;
export type Kilometers = Brand<number, 'Kilometers'>;
export type Miles = Brand<number, 'Miles'>;

export function toKilometers(meters: Meters): Kilometers {
  return (meters / 1000) as unknown as Kilometers;
}

export function toMeters(km: Kilometers): Meters {
  return (km * 1000) as unknown as Meters;
}

// ============================================================================
// NOTAS DE APRENDIZAJE DÍA 5
// ============================================================================

/**
 * CONCEPTOS CLAVE:
 *
 * 1. BRANDED TYPES (NOMINAL TYPING):
 *    - TypeScript usa structural typing por defecto
 *    - Branded types agregan una "marca" invisible
 *    - Previenen mezclar tipos que son estructuralmente iguales
 *    - Útil para IDs, emails, unidades, etc.
 *    - Patrón: type X = string & { readonly __brand: 'X' }
 *
 * 2. TEMPLATE LITERAL TYPES:
 *    - Permiten crear tipos basados en strings
 *    - Sintaxis: `${Type1}:${Type2}`
 *    - Se expanden en compile-time
 *    - Muy útiles para event names, routes, etc.
 *    - TypeScript 4.1+
 *
 * 3. CONDITIONAL TYPES:
 *    - T extends U ? X : Y
 *    - Evaluados en compile-time
 *    - Permiten "if/else" a nivel de tipos
 *    - Base para muchos utility types
 *
 * 4. INFER KEYWORD:
 *    - Solo funciona en conditional types
 *    - Captura parte de un tipo
 *    - Ejemplo: T extends Promise<infer U> ? U : T
 *    - Muy poderoso para extraer tipos
 *
 * 5. DISTRIBUTIVE CONDITIONAL TYPES:
 *    - Cuando T es union, el conditional se distribuye
 *    - (A | B) extends U ? X : Y
 *    - Se evalúa como: (A extends U ? X : Y) | (B extends U ? X : Y)
 *    - A veces queremos evitar esto con [T]
 *
 * 6. MAPPED TYPES CON CONDITIONAL:
 *    - Combina mapped types con conditional types
 *    - { [K in keyof T]: T[K] extends X ? A : B }
 *    - Permite transformaciones complejas
 *
 * 7. RECURSIVE TYPES:
 *    - Un tipo puede referenciarse a sí mismo
 *    - Útil para DeepPartial, Awaited, etc.
 *    - TypeScript tiene límite de recursión
 *
 * 8. TYPE-LEVEL PROGRAMMING:
 *    - TypeScript es Turing-complete a nivel de tipos
 *    - Puedes implementar lógica compleja
 *    - Pero mantén los tipos legibles!
 *
 * PARA MAÑANA (DÍA 6):
 * - Integración de todos los conceptos
 * - API handlers tipados
 * - Sistema de plugins
 * - Tests de tipos
 */

/**
 * MIS NOTAS PERSONALES:
 * - Branded types son una forma elegante de agregar seguridad a tipos primitivos
 * __brand es un truco para hacer que el tipo sea nominal, el __brand no existe en runtime, solo es para el compilador.
 * .startsWith es una forma sencilla de validar el formato de los IDs antes de castear a branded type.
 * .test es una forma rápida de validar el formato de un email con regex.
 * APIVersion y ResourceName son ejemplos de cómo usar template literal types para construir rutas de API de forma segura.
 * V1 significaría que es la primera versión de la API, y ResourceName es el nombre del recurso que se está accediendo (users, tasks, etc).
 * 
 * que es un Tuple? Es un array con longitud fija y tipos específicos para cada posición. 
 * Por ejemplo, [string, number] es un tuple que espera un string en la primera posición y un number en la segunda.
 * En el ejercicio de UnionToTuple, la idea es convertir un union (que no tiene orden ni estructura) en un tuple (que sí tiene orden y estructura).
 * Esto es útil porque a veces queremos trabajar con tipos que son uniones, pero necesitamos tratarlos como listas ordenadas de tipos.
 * 
 * El tipo FlattenPromise es un ejemplo de cómo usar recursión en tipos para "aplanar" promesas anidadas y obtener el tipo final que se resuelve.
 */ 