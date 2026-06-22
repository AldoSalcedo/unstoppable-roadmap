/**
 * types/base.ts - Tipos fundamentales del sistema
 * DÍA 1: Generics básicos y tipos de error
 */

// ============================================================================
// RESULT TYPE - Para manejo de errores type-safe (sin exceptions)
// ============================================================================

/**
 * Result<T, E> representa el resultado de una operación que puede fallar
 * Similar a Result en Rust o Either en Haskell
 * 
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return { ok: false, error: 'Division by zero' };
 *   }
 *   return { ok: true, value: a / b };
 * }
 * ```
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Helper para crear un Result exitoso
 */
export const Ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

/**
 * Helper para crear un Result con error
 */
export const Err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

// ============================================================================
// ENTITY TYPE - Base para todas las entidades con timestamps
// ============================================================================

/**
 * Entity<T> agrega timestamps automáticos a cualquier tipo
 * Útil para tracking de creación y modificación
 * 
 * @example
 * ```typescript
 * type User = Entity<{
 *   name: string;
 *   email: string;
 * }>;
 * // Resultado: { id: string; name: string; email: string; createdAt: Date; updatedAt: Date }
 * ```
 */
export type Entity<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Para entidades que pueden ser soft-deleted(para mantener registros históricos sin eliminarlos físicamente)
 */
export type SoftDeletable<T> = T & {
  deletedAt: Date | null;
};

// ============================================================================
// PAGINATED RESPONSE - Para APIs con paginación
// ============================================================================

/**
 * Respuesta paginada genérica
 * Útil para listas largas de cualquier tipo
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
};

// ============================================================================
// MAYBE TYPE - Para valores opcionales explícitos
// ============================================================================

/**
 * Maybe<T> representa un valor que puede existir o no
 * Más explícito que T | undefined
 * 
 * DÍA 1: Completa este tipo como ejercicio
 * Pista: Usa discriminated union con 'type' field
 */
export type Maybe<T> = 
  | { type: 'some'; value: T }
  | { type: 'none' };

/**
 * Helpers para Maybe
 */
export const Some = <T>(value: T): Maybe<T> => ({
  type: 'some',
  value,
});

export const None = <T = never>(): Maybe<T> => ({
  type: 'none',
});

// ============================================================================
// ASYNC RESULT - Combina Result con Promises
// ============================================================================

/**
 * AsyncResult es una Promise que resuelve a Result
 * Útil para operaciones async que pueden fallar
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// ============================================================================
// ID TYPES - Base para branded types (Día 5)
// ============================================================================

/**
 * Tipo base para IDs
 * En Día 5 lo convertiremos en branded type
 */
export type ID = string;

// ============================================================================
// VALIDATION - Para validación de datos
// ============================================================================

/**
 * Resultado de una validación
 */
export type ValidationResult<T> = Result<T, ValidationError[]>;

export type ValidationError = {
  field: string;
  message: string;
  code: string;
};

// ============================================================================
// EJERCICIOS DÍA 1
// ============================================================================

/**
 * EJERCICIO 1: Implementa una función que trabaje con Result
 * 
 * La función debe:
 * - Recibir un Result<number, string>
 * - Si ok: duplicar el valor
 * - Si error: retornar el mismo error
 * 
 * @example
 * ```typescript
 * const result1 = doubleResult(Ok(5)); // Ok(10)
 * const result2 = doubleResult(Err("error")); // Err("error")
 * ```
 */
export function doubleResult(
  result: Result<number, string>
): Result<number, string> {
  if (result.ok) {
    return Ok(result.value * 2);
  }
  return result;
}

/**
 * EJERCICIO 2: Implementa un helper para mapear Result
 * 
 * @example
 * ```typescript
 * const result = Ok(5);
 * const mapped = mapResult(result, x => x * 2); // Ok(10)
 * ```
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return Ok(fn(result.value));
  }
  return result;
}

/**
 * flatMapResult (también conocido como chain, bind, o andThen)
 *
 * Permite encadenar operaciones que retornan Result.
 * A diferencia de mapResult, "aplana" el resultado evitando Result anidados.
 *
 * @example
 * ```typescript
 * // Con mapResult tendríamos Result<Result<number, string>, string> ❌
 * // Con flatMapResult tenemos Result<number, string> ✅
 *
 * const parseNumber = (s: string): Result<number, string> => {
 *   const n = Number(s);
 *   return isNaN(n) ? Err(`"${s}" is not a number`) : Ok(n);
 * };
 *
 * const validatePositive = (n: number): Result<number, string> => {
 *   return n > 0 ? Ok(n) : Err(`${n} must be positive`);
 * };
 *
 * // Encadenar validaciones
 * const result = flatMapResult(
 *   parseNumber("42"),
 *   validatePositive
 * ); // Ok(42)
 * ```
 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

/**
 * EJERCICIO 3: Implementa un helper para Maybe
 * 
 * @example
 * ```typescript
 * const value = Some(5);
 * const mapped = mapMaybe(value, x => x * 2); // Some(10)
 * ```
 */
export function mapMaybe<T, U>(
  maybe: Maybe<T>,
  fn: (value: T) => U
): Maybe<U> {
  if (maybe.type === 'some') {
    return Some(fn(maybe.value));
  }
  return None();
}

/**
 * flatMapMaybe - Encadena operaciones que retornan Maybe
 *
 * @example
 * ```typescript
 * const findUser = (id: string): Maybe<User> => { ... };
 * const getUserEmail = (user: User): Maybe<string> => { ... };
 *
 * // Encadenar
 * const email = flatMapMaybe(findUser("123"), getUserEmail);
 * ```
 */
export function flatMapMaybe<T, U>(
  maybe: Maybe<T>,
  fn: (value: T) => Maybe<U>
): Maybe<U> {
  if (maybe.type === 'some') {
    return fn(maybe.value);
  }
  return None();
}

// ============================================================================
// RESULT CHAIN - Fluent API para encadenar operaciones
// ============================================================================

/**
 * ResultChain permite encadenar operaciones con sintaxis fluida
 *
 * @example
 * ```typescript
 * const parseNumber = (s: string): Result<number, string> => { ... };
 * const validatePositive = (n: number): Result<number, string> => { ... };
 * const validateMax = (max: number) => (n: number): Result<number, string> => { ... };
 *
 * // Encadenamiento fluido
 * const result = ResultChain.from(parseNumber("42"))
 *   .flatMap(validatePositive)
 *   .flatMap(validateMax(100))
 *   .map(n => n * 2)
 *   .unwrap();
 *
 * // result: Result<number, string>
 * ```
 */
export class ResultChain<T, E> {
  private constructor(private readonly result: Result<T, E>) {}

  /**
   * Crea un ResultChain desde un Result existente
   */
  static from<T, E>(result: Result<T, E>): ResultChain<T, E> {
    return new ResultChain(result);
  }

  /**
   * Crea un ResultChain exitoso
   */
  static ok<T, E = never>(value: T): ResultChain<T, E> {
    return new ResultChain(Ok(value));
  }

  /**
   * Crea un ResultChain con error
   */
  static err<T = never, E = Error>(error: E): ResultChain<T, E> {
    return new ResultChain(Err(error));
  }

  /**
   * Transforma el valor si es Ok
   */
  map<U>(fn: (value: T) => U): ResultChain<U, E> {
    return new ResultChain(mapResult(this.result, fn));
  }

  /**
   * Encadena con otra operación que retorna Result
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): ResultChain<U, E> {
    return new ResultChain(flatMapResult(this.result, fn));
  }

  /**
   * Transforma el error si es Err
   */
  mapError<F>(fn: (error: E) => F): ResultChain<T, F> {
    if (this.result.ok) {
      return new ResultChain(Ok(this.result.value));
    }
    return new ResultChain(Err(fn(this.result.error)));
  }

  /**
   * Ejecuta un efecto secundario si es Ok (no modifica el valor)
   */
  tap(fn: (value: T) => void): ResultChain<T, E> {
    if (this.result.ok) {
      fn(this.result.value);
    }
    return this;
  }

  /**
   * Ejecuta un efecto secundario si es Err
   */
  tapError(fn: (error: E) => void): ResultChain<T, E> {
    if (!this.result.ok) {
      fn(this.result.error);
    }
    return this;
  }

  /**
   * Retorna el Result subyacente
   */
  unwrap(): Result<T, E> {
    return this.result;
  }

  /**
   * Retorna el valor o un valor por defecto si es Err
   */
  unwrapOr(defaultValue: T): T {
    return this.result.ok ? this.result.value : defaultValue;
  }

  /**
   * Retorna el valor o ejecuta una función para obtener el default
   */
  unwrapOrElse(fn: (error: E) => T): T {
    return this.result.ok ? this.result.value : fn(this.result.error);
  }

  /**
   * Retorna true si es Ok
   */
  isOk(): boolean {
    return this.result.ok;
  }

  /**
   * Retorna true si es Err
   */
  isErr(): boolean {
    return !this.result.ok;
  }
}

export function validationOk<T>(value: T): Result<T, ValidationError[]> {
  return Ok(value);
}

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 1:
 *
 * 1. GENERICS BÁSICOS:
 *    - Los generics permiten crear tipos reutilizables
 *    - <T> es una variable de tipo que se sustituye en uso
 *    - Permiten mantener type safety sin duplicar código
 *
 * 2. DISCRIMINATED UNIONS:
 *    - Result<T, E> usa 'ok' como discriminante
 *    - TypeScript puede "narrow" el tipo basado en ok
 *    - Fuerza a manejar ambos casos (ok y error)
 *
 * 3. TYPE INFERENCE:
 *    - TypeScript infiere T y E automáticamente
 *    - Ok(5) infiere Result<number, never>
 *    - Err("error") infiere Result<never, string>
 *
 * 4. NEVER TYPE:
 *    - 'never' representa un valor que nunca puede existir
 *    - Útil en unions para eliminar casos imposibles
 *    - Ok<T> tiene error: never porque nunca puede tener error
 *
 * 5. MAP VS FLATMAP:
 *    - map: Transforma el valor interno (T -> U)
 *    - flatMap: Encadena operaciones que retornan Result (T -> Result<U, E>)
 *    - map produce Result<U, E>, flatMap "aplana" Result<Result<U,E>, E> a Result<U, E>
 *    - También conocido como: chain, bind, andThen
 *
 * 6. FLUENT API / METHOD CHAINING:
 *    - ResultChain permite encadenar operaciones
 *    - Cada método retorna una nueva instancia
 *    - Más legible que funciones anidadas
 *    - Patrón común en builders y DSLs
 *
 * PARA PRACTICAR:
 * - Experimenta en TypeScript Playground
 * - Prueba diferentes tipos con Result
 * - Observa cómo TypeScript infiere los tipos
 * - Intenta romper el type safety (TypeScript te detendrá!)
 * - Encadena validaciones con flatMap
 * - Compara la legibilidad de flatMapResult vs ResultChain
 */

/**
 * MIS NOTAS PERSONALES:
 * Result<T, E> Es una manera genérica de manejar errores sin usar exceptions. Es como un contenedor que puede tener un valor exitoso (ok: true) o un error (ok: false). Esto obliga a los desarrolladores a manejar ambos casos explícitamente, lo que mejora la robustez del código.
 * 
 * Combinado con los Helpers Ok y Err, es fácil crear resultados exitosos
 * o con error sin preocuparse por la syntaxis de objetos.
 * Además, si lo combinamos con helpers como mapResult y flatMapResult, 
 * podemos transformar y encadenar operaciones de manera limpia y legible.
 * 
 * la U de flatMapResult es especialmente útil para evitar el "callback hell" o "pyramid of doom" 
 * que ocurre cuando anidamos múltiples operaciones que pueden fallar. 
 * En lugar de tener Result<Result<T, E>, E>, obtenemos un Result<T, E> plano.
 * En mapResult<T, U, E> la T significa el tipo del valor original, U es el tipo del valor transformado, y E es el tipo del error.
 * 
 * Entity<T> agrega campos comunes como id, createdAt y updatedAt a cualquier tipo T.
 * Esto es útil para mantener consistencia en nuestras entidades sin repetir código.
 * 
 * SoftDeletable<T> (borrado lógico) Es un type que agrega un campo deletedAt para marcar cuando un dato ha sido "eliminado"
 * sin borrarlo físicamente de la base de datos. Esto mantiene un historial de los datos y permite restaurarlos si es necesario.
 * ejemplo: Si tenemos un User que es SoftDeletable, en lugar de eliminarlo, simplemente ponemos deletedAt a la fecha actual.
 * Luego, al consultar usuarios, podemos filtrar aquellos con deletedAt no nulo para excluirlos.
 * Cuando ejecutas la función de borrado lógico, además de poner la fecha en deletedAt, modificas el campo único agregándole un prefijo o sufijo.
 * Esto es para evitar conflictos de unicidad en la base de datos, ya que el registro sigue existiendo pero no debería ser considerado activo.
 * Ejemplo: juan@correo.com se convierte en borrado_1712512800_juan@correo.com.
 * Esto aplica más en casos de registras de transacciones o logs donde no quieres perder el registro pero tampoco quieres que sea considerado activo.
 * 
 * PaginatedResponse<T> es un tipo genérico para manejar respuestas de APIs que devuelven listas de datos con paginación.
 * Incluye la lista de datos y la información de paginación como número de página, tamaño de página, total de páginas y total de items.
 * Esto es útil para estandarizar la forma en que manejamos respuestas paginadas en toda la aplicación.
 * 
 * Maybe<T> es un tipo que representa un valor que puede existir (Some) o no existir (None). 
 * Es más explícito que usar T | undefined, ya que obliga a manejar ambos casos de manera clara.
 * Ejemplo: Si tenemos Maybe<User>, podemos tener Some(user) si el usuario existe o None() si no existe.
 * Esto es útil para evitar errores de null/undefined y para hacer el código más legible y seguro.
 * 
 * AsyncResult<T, E> es simplemente una Promise que resuelve a un Result. 
 * Esto es útil para operaciones asíncronas que pueden fallar, como llamadas a APIs o consultas a bases de datos.
 * Al usar AsyncResult, podemos mantener la misma estructura de manejo de errores tanto para operaciones síncronas como asíncronas.
 * 
 * ID es un tipo base para identificadores. En el futuro, lo convertiremos en un branded type para mayor seguridad de tipos.
 * Esto es útil para evitar confusiones entre diferentes tipos de IDs (por ejemplo, UserID vs ProductID) y para mejorar la claridad del código.
 * 
 * ValidationResult<T> es un tipo específico para resultados de validación, que puede contener un valor válido o una lista de errores de validación.
 * Esto es útil para estandarizar la forma en que manejamos los resultados de validación en toda la aplicación.
 * Ejemplo: Si validamos un formulario, podemos retornar ValidationResult<FormData> que contenga el formulario válido o una lista de errores para cada campo.
 * 
 * ResultChain<T, E> nos permite limpiar el desorden de los try/catch e if anidados, funciona como una tubería donde cada operación puede transformar el valor o el error, 
 * iniciadores: from, ok, err.
 * Transformador: map. Como poner la primera caja en la cinta de producción, si todo va bien, cambia el contenido. 
 * Ejemplo: Tienes un número 2 y lo multiplicas por 2. Ahora tienes un 4. Solo ocurre si no hay errores previos.
 * Validador/encadenador: flatMap. Se utiliza cuando la siguiente operación también puede fallar. Si el resultado anterior es un error, se salta la función y se mantiene el error.
 * Ejemplo: "Ya sé que es un número, ahora voy a validar si es positivo". Si no es positivo, flatMap cambia la caja a estado Error y la tubería se detiene.
 * El Mirón: tap y tapError. Permiten ejecutar efectos secundarios sin modificar el valor o el error. Útil para logging o métricas.
 * Finalizador: unwrap, unwrapOr, unwrapOrElse. Es abrir la caja al final de la tubería para ver qué obtuviste: el premio (valor) o el aviso (error).
 * ResultChain es especialmente útil para operaciones complejas con múltiples pasos que pueden fallar, ya que mantiene el código limpio y fácil de seguir, evitando la anidación excesiva de ifs o try/catch.
 * Recomendación: 
 * Usa map si la función que vas a usar nunca falla.
 * Usa flatMap si la función que vas a usar puede devolver un error.
 * Usa tap para logs o efectos secundarios.
 * Al final, usa unwrap para sacar el resultado.
 * 
 * En resumen, el uso de tipos como Result, Maybe, Entity y ResultChain nos permite escribir código más robusto, legible y mantenible, al forzar a manejar casos de éxito y error de manera explícita y estructurada.
 */