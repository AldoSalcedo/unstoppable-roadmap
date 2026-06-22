/**
 * builders/query.ts - Query Builder con Generics
 * DÍA 2: Generics Avanzados - Builders con Fluent API
 */

import { Entity } from '../types/base.js';

// ============================================================================
// TAREA 2.2: QUERY BUILDER CON GENERICS
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FILTER OPERATORS - Operadores de comparación para filtros              │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Un Union Type de strings literales que define todas las operaciones    │
 * │ de comparación válidas para nuestros filtros.                          │
 * │                                                                         │
 * │ ¿Por qué Union Type en lugar de enum?                                  │
 * │ - Más ligero (no genera código JavaScript adicional)                   │
 * │ - Mejor inferencia de tipos                                            │
 * │ - Autocomplete funciona igual de bien                                  │
 * │                                                                         │
 * │ Ejemplo de uso:                                                        │
 * │   const op: FilterOperator = 'equals';     // ✅ Válido                │
 * │   const op: FilterOperator = 'invalid';    // ❌ Error de compilación  │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEquals'
  | 'lessThanOrEquals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn';

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FILTER TYPE - Tipo para un filtro individual                           │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │ GENERIC PARAMETERS:                                                     │
 * │   T = El tipo de entidad que estamos filtrando (ej: User, Task)        │
 * │   K = Una key específica de T (ej: 'name', 'email', 'status')          │
 * │                                                                         │
 * │ ┌─────────────────────────────────────────────────────────────────────┐ │
 * │ │ KEYOF OPERATOR                                                      │ │
 * │ ├─────────────────────────────────────────────────────────────────────┤ │
 * │ │ "keyof T" extrae todas las keys de T como un Union Type.            │ │
 * │ │                                                                     │ │
 * │ │ Si T = { id: string; name: string; age: number }                    │ │
 * │ │ Entonces keyof T = 'id' | 'name' | 'age'                            │ │
 * │ │                                                                     │ │
 * │ │ "K extends keyof T" significa: K debe ser una de las keys de T      │ │
 * │ └─────────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │ ┌─────────────────────────────────────────────────────────────────────┐ │
 * │ │ INDEXED ACCESS TYPES: T[K]                                          │ │
 * │ ├─────────────────────────────────────────────────────────────────────┤ │
 * │ │ T[K] accede al TIPO de la propiedad K en T.                         │ │
 * │ │                                                                     │ │
 * │ │ Si T = { name: string; age: number }                                │ │
 * │ │   T['name'] = string                                                │ │
 * │ │   T['age'] = number                                                 │ │
 * │ │                                                                     │ │
 * │ │ Esto permite que el valor del filtro coincida con el tipo del campo │ │
 * │ └─────────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │ EJEMPLO:                                                                │
 * │   type User = { name: string; age: number; active: boolean }           │
 * │   type NameFilter = Filter<User, 'name'>                               │
 * │   // = { field: 'name', operator: FilterOperator, value: string }      │
 * │                                                                         │
 * │   type AgeFilter = Filter<User, 'age'>                                 │
 * │   // = { field: 'age', operator: FilterOperator, value: number }       │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type Filter<T, K extends keyof T = keyof T> = {
  field: K;
  operator: FilterOperator;
  value: T[K] | T[K][];  // Permite valor único o array (para 'in', 'notIn')
};

/**
 * Dirección de ordenamiento
 */
export type SortDirection = 'asc' | 'desc';

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SORT TYPE - Configuración de ordenamiento                              │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Similar a Filter, usa keyof T para garantizar que solo puedes          │
 * │ ordenar por campos que existen en la entidad.                          │
 * │                                                                         │
 * │ EJEMPLO:                                                                │
 * │   type UserSort = Sort<User>                                           │
 * │   const sort: UserSort = { field: 'name', direction: 'asc' };  // ✅   │
 * │   const sort: UserSort = { field: 'foo', direction: 'asc' };   // ❌   │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type Sort<T> = {
  field: keyof T;
  direction: SortDirection;
};

/**
 * Opciones de paginación
 */
export type Pagination = {
  page: number;
  pageSize: number;
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ QUERY TYPE - Query completa construida por el builder                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Este tipo representa el resultado final del QueryBuilder.              │
 * │ Contiene todos los filtros, ordenamientos y opciones configuradas.     │
 * │                                                                         │
 * │ PROPIEDADES:                                                            │
 * │   filters: Filter<T>[]     - Array de filtros a aplicar                │
 * │   sorts: Sort<T>[]         - Array de ordenamientos                    │
 * │   pagination?: Pagination  - Paginación (opcional)                     │
 * │   select?: (keyof T)[]     - Campos a seleccionar (opcional)           │
 * │                                                                         │
 * │ Nota: "(keyof T)[]" es un array de keys de T, permitiendo              │
 * │ seleccionar qué campos incluir en el resultado.                        │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type Query<T> = {
  filters: Filter<T>[];
  sorts: Sort<T>[];
  pagination?: Pagination;
  select?: (keyof T)[];
};

// ============================================================================
// DÍA 2: IMPLEMENTAR QUERY BUILDER
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ QUERY BUILDER - Patrón Builder con Fluent API                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │ ┌─────────────────────────────────────────────────────────────────────┐ │
 * │ │ FLUENT API / METHOD CHAINING                                        │ │
 * │ ├─────────────────────────────────────────────────────────────────────┤ │
 * │ │ El patrón Fluent API permite encadenar llamadas a métodos:          │ │
 * │ │                                                                     │ │
 * │ │   builder.where(...).orderBy(...).paginate(...).build()             │ │
 * │ │                                                                     │ │
 * │ │ ¿Cómo funciona?                                                     │ │
 * │ │ Cada método retorna "this" (la instancia actual del builder).       │ │
 * │ │ Esto permite llamar otro método inmediatamente sobre el resultado.  │ │
 * │ │                                                                     │ │
 * │ │ ¿Por qué "this" y no "QueryBuilder<T>"?                             │ │
 * │ │ Si alguien extiende la clase, "this" mantiene el tipo correcto      │ │
 * │ │ de la subclase. Es más flexible para herencia.                      │ │
 * │ └─────────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │ ┌─────────────────────────────────────────────────────────────────────┐ │
 * │ │ GENERIC CONSTRAINT: T extends Entity<unknown>                       │ │
 * │ ├─────────────────────────────────────────────────────────────────────┤ │
 * │ │ Esta restricción garantiza que T siempre tiene:                     │ │
 * │ │   - id: string                                                      │ │
 * │ │   - createdAt: Date                                                 │ │
 * │ │   - updatedAt: Date                                                 │ │
 * │ │                                                                     │ │
 * │ │ Esto permite que el builder funcione solo con entidades válidas.    │ │
 * │ │                                                                     │ │
 * │ │ EJEMPLO:                                                            │ │
 * │ │   new QueryBuilder<User>()     // ✅ User extends Entity            │ │
 * │ │   new QueryBuilder<string>()   // ❌ string no extends Entity       │ │
 * │ └─────────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │ EJEMPLO DE USO COMPLETO:                                                │
 * │ ```typescript                                                          │
 * │ const query = new QueryBuilder<User>()                                 │
 * │   .where('status', 'equals', UserStatus.ACTIVE)                        │
 * │   .where('role', 'in', [UserRole.ADMIN, UserRole.MANAGER])             │
 * │   .orderBy('createdAt', 'desc')                                        │
 * │   .paginate(1, 10)                                                     │
 * │   .select(['id', 'name', 'email'])                                     │
 * │   .build();                                                            │
 * │ ```                                                                    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export class QueryBuilder<T extends Entity<unknown>> {
  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ PRIVATE STATE                                                       │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Estas propiedades privadas almacenan la configuración de la query.  │
   * │ Se inicializan con valores vacíos/undefined y se llenan mediante    │
   * │ los métodos del builder.                                            │
   * │                                                                     │
   * │ El prefijo "_" es una convención para indicar campos privados       │
   * │ internos que no deben accederse directamente.                       │
   * │                                                                     │
   * │ ┌─────────────────────────────────────────────────────────────────┐ │
   * │ │ ¿POR QUÉ "| undefined" EN LUGAR DE "?"?                         │ │
   * │ ├─────────────────────────────────────────────────────────────────┤ │
   * │ │ Con `exactOptionalPropertyTypes: true`:                         │ │
   * │ │                                                                 │ │
   * │ │   _pagination?: Pagination                                      │ │
   * │ │   // ❌ No puedes hacer: this._pagination = undefined           │ │
   * │ │   // El "?" significa "puede estar ausente", no "puede ser      │ │
   * │ │   // undefined"                                                 │ │
   * │ │                                                                 │ │
   * │ │   _pagination: Pagination | undefined                           │ │
   * │ │   // ✅ Puedes hacer: this._pagination = undefined              │ │
   * │ │   // Explícitamente aceptas undefined como valor válido         │ │
   * │ │                                                                 │ │
   * │ │ Para propiedades de clase que necesitas resetear, usa           │ │
   * │ │ "Type | undefined" en lugar de "Type?".                         │ │
   * │ └─────────────────────────────────────────────────────────────────┘ │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  private _filters: Filter<T>[] = [];
  private _sorts: Sort<T>[] = [];
  private _pagination: Pagination | undefined = undefined;
  private _select: (keyof T)[] | undefined = undefined;

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ IMPLEMENTAR where()                                           │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Agrega un filtro a la query.                                        │
   * │                                                                     │
   * │ FIRMA DEL MÉTODO:                                                   │
   * │   where<K extends keyof T>(                                         │
   * │     field: K,                                                       │
   * │     operator: FilterOperator,                                       │
   * │     value: T[K] | T[K][]                                            │
   * │   ): this                                                           │
   * │                                                                     │
   * │ ┌─────────────────────────────────────────────────────────────────┐ │
   * │ │ ¿POR QUÉ <K extends keyof T> EN EL MÉTODO?                      │ │
   * │ ├─────────────────────────────────────────────────────────────────┤ │
   * │ │ Este generic adicional K captura el campo ESPECÍFICO que se     │ │
   * │ │ está filtrando. Esto permite que TypeScript infiera el tipo     │ │
   * │ │ correcto para el valor.                                         │ │
   * │ │                                                                 │ │
   * │ │ Si User = { name: string; age: number }                         │ │
   * │ │   .where('name', 'equals', 'Aldo')  // value debe ser string    │ │
   * │ │   .where('age', 'equals', 25)       // value debe ser number    │ │
   * │ │   .where('name', 'equals', 25)      // ❌ Error: 25 no es string│ │
   * │ └─────────────────────────────────────────────────────────────────┘ │
   * │                                                                     │
   * │ PASOS PARA IMPLEMENTAR:                                             │
   * │ 1. Crear un objeto Filter con field, operator y value              │
   * │ 2. Agregarlo al array _filters usando push()                       │
   * │ 3. Retornar "this" para permitir method chaining                   │
   * │                                                                     │
   * │ NOTA SOBRE TYPE ASSERTION:                                          │
   * │ Necesitarás usar "as Filter<T>" al crear el filtro porque          │
   * │ TypeScript no puede inferir que Filter<T, K> es asignable a        │
   * │ Filter<T> (donde K es keyof T por defecto).                        │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  where<K extends keyof T>(
    field: K,
    operator: FilterOperator,
    value: T[K] | T[K][]
  ): this {
    // Implementar
    this._filters.push({ field, operator, value } as Filter<T>);
    return this;
  }

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ IMPLEMENTAR orderBy()                                         │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Agrega un ordenamiento a la query.                                  │
   * │                                                                     │
   * │ FIRMA DEL MÉTODO:                                                   │
   * │   orderBy(field: keyof T, direction: SortDirection = 'asc'): this  │
   * │                                                                     │
   * │ PASOS PARA IMPLEMENTAR:                                             │
   * │ 1. Crear un objeto Sort con field y direction                      │
   * │ 2. Agregarlo al array _sorts usando push()                         │
   * │ 3. Retornar "this" para permitir method chaining                   │
   * │                                                                     │
   * │ NOTA: El parámetro direction tiene valor por defecto 'asc',        │
   * │ lo que significa que es opcional al llamar el método.              │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  orderBy(field: keyof T, direction: SortDirection = 'asc'): this {
    // Implementar
    this._sorts.push({ field, direction });
    return this;
  }

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ IMPLEMENTAR paginate()                                        │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Configura la paginación de la query.                                │
   * │                                                                     │
   * │ FIRMA DEL MÉTODO:                                                   │
   * │   paginate(page: number, pageSize: number): this                   │
   * │                                                                     │
   * │ PASOS PARA IMPLEMENTAR:                                             │
   * │ 1. Crear un objeto Pagination con page y pageSize                  │
   * │ 2. Asignarlo a _pagination                                         │
   * │ 3. Retornar "this" para permitir method chaining                   │
   * │                                                                     │
   * │ NOTA: A diferencia de filters y sorts (que son arrays y pueden     │
   * │ tener múltiples valores), pagination es un solo objeto que se      │
   * │ sobrescribe si se llama múltiples veces.                           │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  paginate(page: number, pageSize: number): this {
    // Implementar
    this._pagination = { page, pageSize };
    return this;
  }

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ IMPLEMENTAR select()                                          │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Selecciona qué campos incluir en el resultado.                      │
   * │                                                                     │
   * │ FIRMA DEL MÉTODO:                                                   │
   * │   select(fields: (keyof T)[]): this                                │
   * │                                                                     │
   * │ ¿QUÉ SIGNIFICA (keyof T)[]?                                         │
   * │ Es un array donde cada elemento debe ser una key válida de T.      │
   * │                                                                     │
   * │ Si T = User { id, name, email, password }                          │
   * │   .select(['id', 'name', 'email'])  // ✅ Válido                   │
   * │   .select(['id', 'foo'])            // ❌ 'foo' no existe en User  │
   * │                                                                     │
   * │ PASOS PARA IMPLEMENTAR:                                             │
   * │ 1. Asignar el array fields a _select                               │
   * │ 2. Retornar "this" para permitir method chaining                   │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  select(fields: (keyof T)[]): this {
    // Implementar
    this._select = fields;
    return this;
  }

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ IMPLEMENTAR build()                                           │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Construye y retorna el objeto Query final.                          │
   * │                                                                     │
   * │ FIRMA DEL MÉTODO:                                                   │
   * │   build(): Query<T>                                                │
   * │                                                                     │
   * │ Este es el método "terminal" del builder - no retorna "this"       │
   * │ sino el objeto Query<T> construido.                                │
   * │                                                                     │
   * │ ┌─────────────────────────────────────────────────────────────────┐ │
   * │ │ ⚠️  EXACTOPTIONALPROPERTYTYPES                                  │ │
   * │ ├─────────────────────────────────────────────────────────────────┤ │
   * │ │ Si tienes `exactOptionalPropertyTypes: true` en tsconfig,       │ │
   * │ │ hay una diferencia importante:                                  │ │
   * │ │                                                                 │ │
   * │ │   pagination?: Pagination  // Propiedad AUSENTE está OK         │ │
   * │ │   pagination: undefined    // ❌ Explícitamente undefined NO    │ │
   * │ │                                                                 │ │
   * │ │ INCORRECTO (con exactOptionalPropertyTypes):                    │ │
   * │ │   return {                                                      │ │
   * │ │     filters: this._filters,                                     │ │
   * │ │     pagination: this._pagination,  // ❌ Puede ser undefined    │ │
   * │ │   };                                                            │ │
   * │ │                                                                 │ │
   * │ │ CORRECTO - Usar conditional spreading:                          │ │
   * │ │   return {                                                      │ │
   * │ │     filters: this._filters,                                     │ │
   * │ │     ...(this._pagination && { pagination: this._pagination }),  │ │
   * │ │   };                                                            │ │
   * │ │                                                                 │ │
   * │ │ Esto OMITE la propiedad si es undefined, en lugar de            │ │
   * │ │ asignarle explícitamente undefined.                             │ │
   * │ └─────────────────────────────────────────────────────────────────┘ │
   * │                                                                     │
   * │ ┌─────────────────────────────────────────────────────────────────┐ │
   * │ │ CONDITIONAL SPREADING vs TYPE NARROWING                         │ │
   * │ ├─────────────────────────────────────────────────────────────────┤ │
   * │ │ ¿Es esto type narrowing? Sí y no.                               │ │
   * │ │                                                                 │ │
   * │ │ El operador && SÍ usa type narrowing internamente:              │ │
   * │ │   this._pagination && { ... }                                   │ │
   * │ │   // Después del &&, TS sabe que _pagination es Pagination      │ │
   * │ │                                                                 │ │
   * │ │ Pero el patrón completo se llama "CONDITIONAL SPREADING":       │ │
   * │ │   ...(condition && { prop: value })                             │ │
   * │ │                                                                 │ │
   * │ │ ¿Por qué no usamos if tradicional (type narrowing clásico)?     │ │
   * │ │                                                                 │ │
   * │ │   // Alternativa con type narrowing clásico:                    │ │
   * │ │   const query: Query<T> = { filters, sorts };                   │ │
   * │ │   if (this._pagination) {                                       │ │
   * │ │     query.pagination = this._pagination;  // Narrowed!          │ │
   * │ │   }                                                             │ │
   * │ │   return query;                                                 │ │
   * │ │                                                                 │ │
   * │ │ Ambos son válidos. Conditional spreading es más conciso para    │ │
   * │ │ construir objetos; if/else es mejor para lógica compleja.       │ │
   * │ └─────────────────────────────────────────────────────────────────┘ │
   * │                                                                     │
   * │ PASOS PARA IMPLEMENTAR:                                             │
   * │ 1. Retornar un objeto con filters y sorts directamente             │
   * │ 2. Usar conditional spreading para pagination y select             │
   * │    ...(this._pagination && { pagination: this._pagination })       │
   * │    ...(this._select && { select: this._select })                   │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  build(): Query<T> {
    // Implementar
    return {
      filters: this._filters,
      sorts: this._sorts,
      ...(this._pagination && { pagination: this._pagination }),
      ...(this._select && { select: this._select }),
    };
  }

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ IMPLEMENTAR reset()                                           │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Resetea el builder a su estado inicial.                             │
   * │ Útil para reusar la misma instancia para múltiples queries.         │
   * │                                                                     │
   * │ FIRMA DEL MÉTODO:                                                   │
   * │   reset(): this                                                    │
   * │                                                                     │
   * │ PASOS PARA IMPLEMENTAR:                                             │
   * │ 1. Reiniciar _filters a un array vacío []                          │
   * │ 2. Reiniciar _sorts a un array vacío []                            │
   * │ 3. Reiniciar _pagination a undefined                               │
   * │ 4. Reiniciar _select a undefined                                   │
   * │ 5. Retornar "this" para permitir method chaining                   │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  reset(): this {
    this._filters = [];
    this._sorts = [];
    this._pagination = undefined;
    this._select = undefined;
    return this;
  }
}

// ============================================================================
// EJERCICIO OPCIONAL: TASK BUILDER CON VALIDACIÓN EN COMPILE-TIME
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TASK BUILDER - Patrón Builder con Estado Genérico                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Este es un ejercicio AVANZADO que combina varios conceptos.            │
 * │ Complétalo después de dominar el QueryBuilder.                         │
 * │                                                                         │
 * │ ┌─────────────────────────────────────────────────────────────────────┐ │
 * │ │ GENERIC STATE PATTERN                                               │ │
 * │ ├─────────────────────────────────────────────────────────────────────┤ │
 * │ │ La idea es usar un tipo genérico para trackear el "estado" del     │ │
 * │ │ builder - qué campos ya se han establecido.                         │ │
 * │ │                                                                     │ │
 * │ │ type State = { hasTitle: boolean; hasReporter: boolean }            │ │
 * │ │                                                                     │ │
 * │ │ Cuando llamas .title(), el tipo cambia:                             │ │
 * │ │   TaskBuilder<{hasTitle: false, hasReporter: false}>                │ │
 * │ │   → TaskBuilder<{hasTitle: true, hasReporter: false}>               │ │
 * │ │                                                                     │ │
 * │ │ El método build() solo está disponible cuando:                      │ │
 * │ │   State extends { hasTitle: true, hasReporter: true }               │ │
 * │ └─────────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │ OBJETIVO:                                                               │
 * │ Crear un builder donde TypeScript IMPIDE llamar build() si faltan     │
 * │ campos requeridos. El error ocurre en COMPILE-TIME, no en runtime.    │
 * │                                                                         │
 * │ EJEMPLO:                                                                │
 * │ ```typescript                                                          │
 * │ // ❌ Error de compilación: build() no existe en este tipo             │
 * │ const task = new TaskBuilder()                                         │
 * │   .description('Solo descripción')                                     │
 * │   .build();  // Error: falta title y reportedBy                        │
 * │                                                                         │
 * │ // ✅ Compila correctamente                                            │
 * │ const task = new TaskBuilder()                                         │
 * │   .title('Mi tarea')                                                   │
 * │   .reportedBy('user-123')                                              │
 * │   .build();  // OK: tiene los campos requeridos                        │
 * │ ```                                                                    │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Si quieres intentar este ejercicio, necesitarás:
 *
 * 1. Definir tipos para el estado del builder:
 *    - EmptyTaskState = { hasTitle: false; hasReporter: false }
 *    - CompleteTaskState = { hasTitle: true; hasReporter: true }
 *
 * 2. Crear la clase TaskBuilder<State extends TaskBuilderState>
 *
 * 3. Implementar métodos que cambien el tipo:
 *    - title(t: string): TaskBuilder<State & { hasTitle: true }>
 *    - reportedBy(id: string): TaskBuilder<State & { hasReporter: true }>
 *
 * 4. Usar "this: TaskBuilder<CompleteTaskState>" en build() para
 *    restringir cuándo puede llamarse.
 *
 * HINT: Revisa la documentación de TypeScript sobre "this parameters"
 */
export type TaskBuilderState = { hasTitle: boolean; hasReporter: boolean };
export type EmptyTaskState = { hasTitle: false; hasReporter: false };
export type CompleteTaskState = { hasTitle: true; hasReporter: true };

/**
 * TaskBuilder con validación en tiempo de compilación.
 *
 * Usa un constructor privado + factory estático para garantizar
 * que el builder siempre inicie con EmptyTaskState.
 */
export class TaskBuilder<State extends TaskBuilderState = EmptyTaskState> {
  private _title: string | undefined = undefined;
  private _description: string | undefined = undefined;
  private _reportedBy: string | undefined = undefined;

  /**
   * Constructor privado previene: new TaskBuilder<CompleteTaskState>()
   * lo cual permitiría llamar build() sin establecer los campos requeridos.
   */
  private constructor() {}

  /**
   * Método factory - la ÚNICA forma de crear un TaskBuilder.
   * Siempre retorna TaskBuilder<EmptyTaskState>, asegurando que build()
   * no esté disponible hasta que se llamen title() y reportedBy().
   */
  static create(): TaskBuilder<EmptyTaskState> {
    return new TaskBuilder();
  }

  title(title: string): TaskBuilder<State & { hasTitle: true }> {
    this._title = title;
    return this as TaskBuilder<State & { hasTitle: true }>;
  }

  description(description: string): this {
    this._description = description;
    return this;
  }

  reportedBy(reportedBy: string): TaskBuilder<State & { hasReporter: true }> {
    this._reportedBy = reportedBy;
    return this as TaskBuilder<State & { hasReporter: true }>;
  }

  /**
   * build() SOLO está disponible cuando State extiende CompleteTaskState.
   * El parámetro "this" restringe cuándo se puede llamar este método.
   *
   * Si intentas llamar build() sin title() y reportedBy():
   *   TaskBuilder.create().build()  // ❌ Error de compilación!
   *
   * TypeScript mostrará un error como:
   *   "The 'this' context of type 'TaskBuilder<EmptyTaskState>'
   *    is not assignable to type 'TaskBuilder<CompleteTaskState>'"
   */
  build(this: TaskBuilder<CompleteTaskState>): {
    title: string;
    description?: string;
    reportedBy: string;
  } 
  {
    const title = this._title;
    const reportedBy = this._reportedBy;

    if (title === undefined || reportedBy === undefined) {
      // Unreachable at runtime — 'this' parameter guarantees both are set
      throw new Error('Invariant violated: build() called without required fields');
    }

    return {
      title,
      reportedBy,
      ...(this._description !== undefined && { description: this._description }),
    };
  }
}
// ============================================================================
// EJEMPLOS DE USO - ¡Descomenta para probar!
// ============================================================================

// ❌ Esto NO compilará - build() no está disponible
// const invalid = TaskBuilder.create().description('test').build();

// ❌ Esto NO compilará - falta reportedBy()
// const invalid2 = TaskBuilder.create().title('Mi Tarea').build();

// ✅ Esto SÍ compilará - ambos campos requeridos están establecidos
// const validTask = TaskBuilder.create()
//   .title('Completar curso de TypeScript')
//   .description('Aprender generics avanzados') // opcional
//   .reportedBy('user-123')
//   .build();

// ✅ El orden no importa - el sistema de tipos rastrea lo que se ha establecido
// const validTask2 = TaskBuilder.create()
//   .reportedBy('user-456')
//   .title('Otra tarea')
//   .build();

// ============================================================================
// NOTAS DE APRENDIZAJE DÍA 2
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ RESUMEN DE CONCEPTOS                                                    │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * 1. FLUENT API / METHOD CHAINING
 *    ─────────────────────────────
 *    - Cada método retorna 'this' (la instancia actual)
 *    - Permite encadenar llamadas: builder.a().b().c()
 *    - Muy común en builders, query builders, y DSLs
 *    - TypeScript mantiene el tipo correcto a través de la cadena
 *
 * 2. KEYOF OPERATOR
 *    ───────────────
 *    - keyof T extrae las keys de T como un Union Type
 *    - Si T = { a: string, b: number }, keyof T = 'a' | 'b'
 *    - Útil para crear tipos dinámicos basados en las propiedades
 *    - Permite autocomplete en el IDE
 *
 * 3. INDEXED ACCESS TYPES (T[K])
 *    ───────────────────────────
 *    - T[K] accede al tipo de la propiedad K en T
 *    - Permite mantener relación tipo-valor en tiempo de compilación
 *    - Ejemplo: si field es 'name', value debe ser del tipo de T['name']
 *
 * 4. GENERIC CONSTRAINTS
 *    ────────────────────
 *    - <T extends Entity<unknown>> restringe qué tipos son válidos para T
 *    - Garantiza que T tiene ciertas propiedades
 *    - TypeScript verifica esto en compile-time
 *
 * 5. METHOD-LEVEL GENERICS
 *    ──────────────────────
 *    - Los métodos pueden tener sus propios parámetros genéricos
 *    - <K extends keyof T> en where() captura el campo específico
 *    - Permite que TypeScript infiera tipos más precisos
 *
 * 6. GENERIC STATE PATTERN (Avanzado)
 *    ─────────────────────────────────
 *    - Usa generics para trackear estado en tiempo de compilación
 *    - El tipo cambia con cada operación
 *    - Permite validación en compile-time (no runtime)
 *    - Ejemplo: build() solo disponible cuando State es completo
 *
 * PARA MAÑANA (DÍA 3):
 * - Profundizaremos en Utility Types avanzados
 * - Crearemos tipos como DeepPartial, StrictPick, etc.
 * - Usaremos estos patrones para crear DTOs type-safe
 */

/**
 * MIS NOTAS PERSONALES:
 * Conditional spreading es una técnica súper útil para construir objetos de forma concisa.
 * this parameters (etiqueta de seguridad) en TypeScript es una herramienta poderosa para controlar el contexto de "this" y restringir cuándo se pueden llamar ciertos métodos.
 * this parameters llamados también fake parameters, son una forma de especificar el tipo de parametro de "this" en un método, lo que permite validación en tiempo de compilación sobre el estado del objeto.
 * no-unnecessary-condition de ESLint quiere checks explicitos de undefined en lugar de truthy/falsy en strings lo cual provocaba errores en build() porque TypeScript ya garantiza que _pagination y _select no son undefined en ese punto,
 * se tuvo que colocar narrowing explicito por los campos privados, typescript no deja hacer el narrowing de los campos privados, por lo que se tuvo que usar un if para hacer el narrowing y luego retornar el objeto query.
 */