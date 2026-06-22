/**
 * NormalRange.ts — Value Object para rangos de referencia de lab tests
 * DÍA 2: Domain Layer — Value Objects
 *
 * CONCEPTOS CLAVE:
 * - Value Object: no tiene identidad propia, solo importa su valor
 * - Inmutabilidad: una vez creado, no cambia (readonly)
 * - Pure functions: sus métodos no tienen side effects (sin DB, sin logs)
 */

// ============================================================================
// TAREA 2.1: VALUE OBJECT — NormalRange
// ============================================================================

/**
 * NormalRange — representa el rango normal de referencia de un lab test
 *
 * El problema (sin Value Object):
 * ```typescript
 * // Pasamos min/max/unit sueltos por todas partes
 * function isAbnormal(value: number, min: number, max: number, unit: string) {
 *   // ¿qué pasa si alguien pasa min y max en orden equivocado?
 *   // ¿qué pasa si unit no coincide entre value y range?
 * }
 * ```
 *
 * Con NormalRange:
 * ```typescript
 * const range = new NormalRange(70, 100, 'mg/dL');
 * range.contains(85); // true — la lógica vive en un solo lugar
 * ```
 *
 * Ventajas:
 * - Validación centralizada (no se puede crear un rango inválido)
 * - Inmutable: una vez creado, min/max/unit no cambian
 * - Reutilizable en cualquier entidad que necesite un rango
 *
 * Aplicación Healthcare:
 * Cada lab test (glucosa, hemoglobina, etc.) tiene un rango de referencia
 * distinto. NormalRange encapsula "¿qué significa normal para este test?"
 * sin acoplarse a la entidad LabTest.
 */
export class NormalRange {
  // PASO 1: Declarar las propiedades.
  // `readonly` significa que nadie puede cambiar min/max/unit después de creado.
  readonly min: number;
  readonly max: number;
  readonly unit: string;

  // PASO 2: Constructor — recibe los valores y los asigna a `this`.
  // `this.min = min` significa: "guarda el parámetro `min` en la propiedad `min` de esta instancia".
  // Sin `this.min = min`, el valor llega al constructor y desaparece.
  //
  // Validación: si min > max, el rango no tiene sentido (ej: rango de 100 a 70).
  // Usamos `throw` aquí porque un NormalRange inválido es un error de programación,
  // no un caso de negocio esperado.
  constructor(min: number, max: number, unit: string) {
    if (min > max) {
      throw new Error(`NormalRange inválido: min (${min}) no puede ser mayor que max (${max})`);
    }
    this.min = min;
    this.max = max;
    this.unit = unit;
  }

  // PASO 3: contains() — ¿está el valor dentro del rango (inclusive)?
  // Esta es una "pure function": dado el mismo input, siempre retorna el mismo output.
  // No toca la DB, no hace logs, no depende de nada externo.
  contains(value: number): boolean {
    return value >= this.min && value <= this.max;
  }

  // PASO 4: equals() — compara dos NormalRange por VALOR, no por referencia.
  // En JavaScript, `a === b` entre dos objetos solo es `true` si son el MISMO objeto en memoria.
  // Un Value Object necesita comparación por valor: ¿tienen los mismos datos?
  equals(other: NormalRange): boolean {
    return (
      this.min === other.min &&
      this.max === other.max &&
      this.unit === other.unit
    );
  }
}

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 2:
 *
 * 1. VALUE OBJECT:
 *    - ¿Qué es? 
 * Es un objeto que no tiene identidad propia, se identifica por sus atributos, son inmutables, tienen autovalidación y lógica de negocio relacionada.
 *    - ¿Cuándo usarlo? 
 * Cuando necesitas representar un concepto del dominio que se define por sus atributos y no por su identidad, como un rango de referencia, una dirección, un dinero, etc. Es especialmente útil para encapsular validación y lógica relacionada con ese concepto.
 *    - ¿Cuándo NO usarlo?
 * Cuando el objeto tiene una identidad única que importa (como un paciente, un usuario, un producto), o cuando necesitas mutabilidad para representar cambios a lo largo del tiempo.
 *
 * 2. INMUTABILIDAD:
 *    - ¿Por qué es importante?
 * Facilita el razonamiento sobre el código, evita efectos secundarios inesperados, y hace que los objetos sean seguros para compartir entre diferentes partes del sistema sin preocuparse por cambios no deseados.
 *   - ¿Cómo lograrla en TypeScript?
 * Usando `readonly` en las propiedades, y evitando métodos que modifiquen el estado del objeto. En lugar de modificar, puedes crear nuevos objetos con los cambios necesarios.
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología:
 * Se relaciona con la idea de "modelado de conceptos del dominio". En biología, conceptos como "rango normal de referencia" son fundamentales para interpretar resultados de lab tests. Un Value Object como NormalRange permite modelar este concepto de manera precisa y consistente en el software.
 * - Auditoría: 
 * Se Relaciona con la idea de "control interno" y "validación de datos". Un Value Object como NormalRange asegura que los datos relacionados con los rangos de referencia sean válidos y consistentes en todo el sistema, lo que es crucial para la integridad de la información en un contexto de auditoría.
 * - Ventas/UX: 
 * Se relaciona con la idea de "customer journey" y "user experience" en el sentido de que un Value Object mejora la experiencia del desarrollador al proporcionar una API clara y segura para trabajar con conceptos del dominio, lo que a su vez puede llevar a un software más robusto y fácil de mantener.
 *
 * PARA PRACTICAR:
 * - [completar]
 */
