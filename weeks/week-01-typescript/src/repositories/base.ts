/**
 * repositories/base.ts - Repository pattern con Generics
 * DÍA 2: Implementar después de completar ejercicios del Día 1
 */

import { Result, AsyncResult, ID, Entity } from '../types/base.js';

// ============================================================================
// REPOSITORY INTERFACE - Patrón Repository genérico
// ============================================================================

/**
 * Repository<T> define operaciones CRUD para cualquier entidad
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ GENERIC CONSTRAINT: T extends Entity<unknown>                           │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Esta restricción garantiza que T siempre tendrá:                        │
 * │   - id: string                                                          │
 * │   - createdAt: Date                                                     │
 * │   - updatedAt: Date                                                     │
 * │                                                                         │
 * │ Sin esta restricción, no podríamos usar Omit<T, 'id' | ...> de forma    │
 * │ segura porque TypeScript no sabría si T tiene esos campos.              │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * // ✅ Esto funciona porque User extends Entity
 * class UserRepository implements Repository<User> { ... }
 *
 * // ❌ Esto NO compila porque string no extends Entity
 * class BadRepository implements Repository<string> { ... }
 * ```
 */
export interface Repository<T extends Entity<unknown>> {
  findById(id: ID): AsyncResult<T, string>;
  findAll(): AsyncResult<T[], string>;

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ OMIT UTILITY TYPE                                                   │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Omit<T, 'id' | 'createdAt' | 'updatedAt'> crea un nuevo tipo        │
   * │ que tiene todas las propiedades de T EXCEPTO las listadas.          │
   * │                                                                     │
   * │ Si T = User { id, createdAt, updatedAt, name, email }               │
   * │ Entonces Omit<T, 'id'|'createdAt'|'updatedAt'> = { name, email }    │
   * │                                                                     │
   * │ Esto es perfecto para create() porque el repositorio genera         │
   * │ id, createdAt, y updatedAt automáticamente.                         │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): AsyncResult<T, string>;

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ PARTIAL UTILITY TYPE                                                │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Partial<T> hace TODOS los campos de T opcionales.                   │
   * │                                                                     │
   * │ Si T = User { id: string, name: string, email: string }             │
   * │ Entonces Partial<T> = { id?: string, name?: string, email?: string }│
   * │                                                                     │
   * │ Esto permite actualizar solo los campos que cambian:                │
   * │ update(id, { name: "Nuevo nombre" }) // solo actualiza name         │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  update(id: ID, data: Partial<T>): AsyncResult<T, string>;

  delete(id: ID): AsyncResult<void, string>;
}

/**
 * InMemoryRepository<T> - Implementación en memoria del Repository
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ IMPLEMENTANDO UNA INTERFACE GENÉRICA                                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Cuando una clase implementa Repository<T>, debe:                        │
 * │ 1. Declarar su propio parámetro genérico T                              │
 * │ 2. Pasar ese T a la interface: implements Repository<T>                 │
 * │ 3. Usar el mismo constraint: T extends Entity<unknown>                  │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export class InMemoryRepository<T extends Entity<unknown>>
  implements Repository<T> {

  /**
   * STORAGE CON GENERICS
   * ────────────────────
   * Map<ID, T> significa: un Map donde las keys son ID y los values son T
   * Como T es genérico, este Map puede almacenar cualquier tipo de Entity
   */
  private items: Map<ID, T> = new Map();

  findById(id: ID): AsyncResult<T, string> {
    // Map.get() retorna T | undefined (porque el id podría no existir)
    const item = this.items.get(id);

    // TYPE NARROWING: después de este check, TypeScript sabe que item NO es undefined
    if (!item) {
      return Promise.resolve({ ok: false, error: `Item with id ${id} not found` });
    }

    // Aquí TypeScript infiere que item es T (no T | undefined) gracias al narrowing
    return Promise.resolve({ ok: true, value: item });
  }

  findAll(): AsyncResult<T[], string> {
    // Array.from convierte el iterator de values a un array
    // El tipo inferido es T[] porque items es Map<ID, T>
    return Promise.resolve({ ok: true, value: Array.from(this.items.values()) });
  }

  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): AsyncResult<T, string> {
    const id = crypto.randomUUID();
    const now = new Date();

    /**
     * ┌─────────────────────────────────────────────────────────────────────┐
     * │ ⚠️ TYPE ASSERTION: as T                                             │
     * ├─────────────────────────────────────────────────────────────────────┤
     * │ ¿Qué ve TypeScript?                                                 │
     * │   { ...data, id, createdAt: now, updatedAt: now }                   │
     * │                                                                     │
     * │ TypeScript lo infiere como:                                         │
     * │   Omit<T, 'id'|'createdAt'|'updatedAt'> &                           │
     * │   { id: string; createdAt: Date; updatedAt: Date }                  │
     * │                                                                     │
     * │ Lógicamente esto ES igual a T. Pero TypeScript no puede probarlo    │
     * │ porque T es un tipo genérico desconocido en compile-time.           │
     * │                                                                     │
     * │ El problema: TypeScript no puede simplificar:                       │
     * │   Omit<T, K> & K === T  (para un T genérico)                        │
     * │                                                                     │
     * │ ¿Es seguro usar "as T" aquí?                                        │
     * │ ✅ SÍ - estamos reconstruyendo exactamente los campos que omitimos. │
     * │                                                                     │
     * │ ¿Cuándo "as" es PELIGROSO?                                          │
     * │ ❌ const user = { name: "Aldo" } as User; // Faltan campos!         │
     * └─────────────────────────────────────────────────────────────────────┘
     */
    const newItem = { ...data, id, createdAt: now, updatedAt: now } as T;

    this.items.set(id, newItem);
    return Promise.resolve({ ok: true, value: newItem });
  }

  async update(id: ID, data: Partial<T>): AsyncResult<T, string> {
    const item = this.items.get(id);
    if (!item) {
      return Promise.resolve({ ok: false, error: `Item with id ${id} not found` });
    }

    /**
     * ┌─────────────────────────────────────────────────────────────────────┐
     * │ DESTRUCTURING PARA SEGURIDAD                                        │
     * ├─────────────────────────────────────────────────────────────────────┤
     * │ Partial<T> incluye id y createdAt como opcionales.                  │
     * │ Si alguien llama: update(id, { id: 'hacked', createdAt: new Date }) │
     * │ esos valores se sobrescribirían!                                    │
     * │                                                                     │
     * │ Solución: Extraemos id y createdAt y los descartamos (_id, _created)│
     * │ El rest operator (...safeData) captura solo los campos seguros.     │
     * │                                                                     │
     * │ "as Partial<T> & Record<string, unknown>" es necesario porque       │
     * │ TypeScript no puede probar que Partial<T> tiene id/createdAt        │
     * │ (aunque sabemos que T extends Entity, los hace opcionales en        │
     * │ Partial<T>, y TS no puede verificar que existan para destructuring) │
     * └─────────────────────────────────────────────────────────────────────┘
     */
    const { id: _id, createdAt: _createdAt, ...safeData } = data as Partial<T> & Record<string, unknown>;

    /**
     * ⚠️ TYPE ASSERTION: as T (mismo razonamiento que en create)
     * Estamos combinando el item existente (T) con datos parciales seguros.
     */
    const updatedItem = { ...item, ...safeData, updatedAt: new Date() } as T;

    this.items.set(id, updatedItem);
    return { ok: true, value: updatedItem };
  }

  delete(id: ID): AsyncResult<void, string> {
    // Map.delete() retorna boolean: true si existía, false si no
    const existed = this.items.delete(id);

    if (!existed) {
      return Promise.resolve({ ok: false, error: `Item with id ${id} not found` });
    }

    // AsyncResult<void, string> - cuando ok es true, value es void/undefined
    return Promise.resolve({ ok: true, value: undefined });
  }

  // Método protegido para filtrar items según un predicado, patrón común para consultas personalizadas llamado "template method"
  protected async findWhere(predicate: (item: T) => boolean): AsyncResult<T[], string> {
    const result = await this.findAll();
    if (!result.ok) return result; // Si findAll falla, retornamos el error directamente
    return { ok: true, value: result.value.filter(predicate) };
  }
}

// ============================================================================
// NOTAS Y CONCEPTOS APRENDIDOS - DÍA 2
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ RESUMEN DE CONCEPTOS                                                    │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * 1. GENERIC CONSTRAINTS (T extends Entity<unknown>)
 *    ───────────────────────────────────────────────
 *    - Restringe qué tipos pueden usarse como T
 *    - Garantiza que T tiene id, createdAt, updatedAt
 *    - TypeScript verifica esto en compile-time
 *    - Si intentas usar un tipo que no cumple, obtienes error de compilación
 *
 * 2. OMIT UTILITY TYPE
 *    ──────────────────
 *    - Omit<T, K> crea un tipo con todas las propiedades de T excepto K
 *    - Útil para create(): el cliente no debe proporcionar id/timestamps
 *    - TypeScript verifica que K existe en T
 *
 * 3. PARTIAL UTILITY TYPE
 *    ─────────────────────
 *    - Partial<T> hace todos los campos opcionales
 *    - Útil para update(): solo enviar lo que cambia
 *    - Mantiene type safety pero permite flexibilidad
 *
 * 4. TYPE ASSERTION (as T) - CUÁNDO ES ACEPTABLE
 *    ────────────────────────────────────────────
 *    ✅ ACEPTABLE cuando:
 *       - Sabes más que TypeScript sobre el tipo
 *       - Estás reconstruyendo un objeto completo (como en create/update)
 *       - El patrón es común y bien entendido
 *
 *    ❌ PELIGROSO cuando:
 *       - Usas "as" para silenciar errores sin entenderlos
 *       - Conviertes tipos incompatibles: { a: 1 } as User
 *       - Lo usas porque "es más fácil"
 *
 *    REGLA: Si necesitas "as", pregúntate: ¿puedo probarlo lógicamente?
 *
 * 5. TYPE NARROWING
 *    ───────────────
 *    - TypeScript refina tipos basándose en control flow
 *    - Después de "if (!item)", TypeScript sabe que item existe
 *    - Permite acceso seguro a propiedades sin undefined checks
 *
 * RECURSOS:
 * - TypeScript Handbook - Generic Constraints
 * - TypeScript Handbook - Type Assertions
 * - Pattern: Repository Pattern
 * - Matt Pocock - "When to use 'as' in TypeScript"
 */

/** 
 * MIS NOTAS PERSONALES:
 * CRUD: Create, Read, Update, Delete.
 * compile-time: el proceso de convertir TypeScript a JavaScript, donde se verifican los tipos y se generan los archivos .js.
 * runtime: el momento en que el código JavaScript se ejecuta en un entorno (navegador, Node.js, etc.).
 * TypeScript es un superset de JavaScript que añade tipado estático y otras características para mejorar la calidad del código.
 * 
 * Repository genérico es un patrón poderoso para manejar datos de forma consistente de manera abstracta. 
 * Las utility types como Omit y Partial son esenciales para mantener type safety sin sacrificar flexibilidad. 
 * Las type assertions deben usarse con cuidado, pero son herramientas valiosas cuando se entienden bien. 
 * 
 * <T extends Entity<unknown>> es una forma elegante de garantizar que cualquier tipo que usemos con Repository tenga las propiedades necesarias para funcionar correctamente.
 * siendo T el dato genérico.
 * Extends en este contexto no significa "herencia" (como en las clases de Programación Orientada a Objetos), sino "cumple con los requisitos de".
 * si se intenta pasar un tipo que no cumple con Entity, TypeScript lanzará un error de compilación, lo que nos protege de errores en tiempo de ejecución.
 * Entity<unknown> es una forma de decir "cualquier tipo de entidad", porque el tipo genérico dentro de Entity no es relevante para el Repository, 
 * lo importante es que tenga id, createdAt, y updatedAt.
 * Al poner Entity<unknown>, estás diciendo: "No me importa de qué tipo sea el ID de la entidad (puede ser un string, un number o un UUID), solo me importa que el objeto sea una Entidad".
 * En resumen SOLAMENTE los tipos que cumplen con Entity pueden ser usados con Repository, lo que garantiza que siempre tendremos las propiedades necesarias para nuestras operaciones CRUD.
 * 
 * Omit Permite crear un nuevo tipo de T omitiendo las propiedades listadas. Es útil para create() por que el cliente no debe proporcionar id, createdAt, ni updatedAt, ya que el repositorio los genera automáticamente.
 * Partial Hace que todos los campos de T sean opcionales. Es útil para update() porque solo queremos enviar los campos que cambian, sin tener que proporcionar todo el objeto.
 * Type Assertion (as T) es una forma de decirle a TypeScript "confía en mí, sé lo que estoy haciendo". Es aceptable usarlo cuando estás reconstruyendo un objeto completo y sabes que cumple con el tipo T, como en create() y update(). 
 * Sin embargo, debe usarse con precaución para evitar silenciar errores importantes.
 * 
 * Implements: Palabra clave que indica que una clase debe cumplir con la estructura definida por una interfasce. En este caso, InMemoryRepository debe implementar todos los métodos definidos en Repository<T>.
 * Map<ID, T>: Estructura de datos que almacena pares clave-valor, donde la clave es un ID y el valor es un objeto de tipo T. Es una forma eficiente de almacenar y acceder a los objetos en memoria.
 * private items: Map<ID, T> = new Map(); significa que la clase InMemoryRepository tiene una propiedad privada llamada items, que es un Map que asocia IDs con objetos de tipo T. Esta propiedad se inicializa como un nuevo Map vacío, es una encapsulación.
 * Type Narrowing (Estrechamiento de tipos) es la habilidad de TypeScript para "darse cuenta" de qué tipo específico es una variable en un momento determinado del código.
 * Ejemplo: tenemos una variable que puede ser de varios tipos (una Union Type). El Type Narrowing es el proceso de filtrar esas opciones hasta quedarte con una sola, permitiéndote usar las propiedades específicas de ese tipo sin que TypeScript se queje.
 * 
 * Type ASSERTION: as T cambia la forma en que typescript percibe el dato durante la compilación, en javascript el as desaparece.
 * Ejemplo de uso real: Cuando recibes datos de una fuente externa, Si usas crypto.randomUUID(), la función devuelve un string genérico. Pero si tú necesitas que sea de tipo ID (un tipo que tú inventaste), usas la aserción.
 * Al trabajar con el DOM, Cuando buscas un elemento en HTML, TypeScript solo sabe que es un Element genérico. Si tú sabes que es un botón, tienes que decírselo para poder acceder a sus propiedades específicas de HTMLButtonElement.
 * 
 * Type Narrowing (if, typeof): Es seguro. TypeScript comprueba el tipo mientras el código corre.
 * Type Assertion (as): Es forzado. Tú asumes la responsabilidad si el tipo no es el correcto.
 * 
 * desctructuring con rest operator: const { id: _id, createdAt: _createdAt, ...safeData } = data; es una técnica para extraer ciertas propiedades de un objeto y "descartarlas" (en este caso id y createdAt) mientras se captura el resto de las propiedades en un nuevo objeto (safeData).
 * en programación el _ significa Voy a sacar esto de aquí, pero no pienso usarlo
 * _id, _createdAt: Son convenciones para indicar que estas variables son "descartadas" o "no usadas". Esto es útil para evitar conflictos de nombres y para comunicar a otros desarrolladores que estas variables no deben ser utilizadas después del destructuring.
 * ...safeData: El operador rest (spread) captura cualquier otra propiedad que no haya sido extraída explícitamente.
 * as Partial<T> & Record<string, unknown> es una forma de decirle a TypeScript como debe tratar la variable data, objeto resultante del destructuring es un tipo que combina Partial<T> (todos los campos de T opcionales) con 
 * Record<string, unknown> (Esto es un refuerzo de seguridad. Permite que el objeto tenga cualquier otra propiedad extra (strings como llaves) sin que TypeScript de error de "propiedad no existe"). 
 * Esto es necesario porque TypeScript no puede garantizar que los campos id y createdAt existan en data, ya que son opcionales en Partial<T>.
 */