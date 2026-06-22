/**
 * LabTest.ts — Entity del dominio para resultados de laboratorio
 * DÍA 2: Domain Layer — Entities
 *
 * CONCEPTOS CLAVE:
 * - Entity: objeto con identidad única (ID), a diferencia del Value Object
 * - Domain Logic: las reglas de negocio viven aquí, no en la UI ni en la DB
 * - Dependency Rule: esta entidad importa SOLO de su propia capa (domain)
 */

import { NormalRange } from '../value-objects/NormalRange';

// ============================================================================
// TAREA 2.2: ENTITY — LabTest
// ============================================================================

/**
 * LabTest — entidad que representa un resultado de laboratorio clínico
 *
 * ¿Por qué es una Entity y no un Value Object?
 * Porque dos LabTests con los mismos valores (mismo paciente, mismo test,
 * mismo resultado) siguen siendo instancias DISTINTAS — cada análisis de
 * laboratorio tiene su propio ID, su propia fecha, su propio historial.
 * La identidad importa.
 *
 * Aplicación Healthcare:
 * Un paciente puede tener 10 resultados de glucosa a lo largo del año.
 * Cada uno es un LabTest diferente con su propio ID, aunque el valor
 * medido sea el mismo. El médico necesita distinguirlos por fecha e ID.
 */

// EJERCICIO 1: Define los tipos de las propiedades
//
// Pista: TypeScript permite definir un tipo separado para las props de una
// entidad. Esto hace el constructor más legible y permite reutilizar el tipo.
//
// ¿Qué datos necesita un LabTest?
// - id: identificador único (string es suficiente por ahora)
// - patientId: quién es el paciente (referencia, no el objeto Patient completo)
// - testName: nombre del test (ej. "Glucosa", "Hemoglobina")
// - value: valor medido (número)
// - unit: unidad del valor medido (ej. "mg/dL", "g/dL")
// - normalRange: el rango de referencia — ¿qué tipo usamos aquí?
// - takenAt: cuándo se tomó la muestra
//
// Completar con los tipos correctos
export type LabTestProps = {
  id: string;
  patientId: string;
  testName: string;
  value: number;
  unit: string;
  normalRange: NormalRange;
  takenAt: Date;
};

export class LabTest {
  // EJERCICIO 2: Declara las propiedades usando LabTestProps
  //
  // Pista: podrías declarar cada propiedad por separado (como en NormalRange),
  // o podrías guardar todas las props en un solo campo privado `props`.
  // La segunda forma es común en DDD porque agrupa todo bajo `this.props`.
  //
  // Ejemplo:
  // ```typescript
  // private readonly props: LabTestProps;
  // ```
  // Luego accedes con `this.props.value`, `this.props.patientId`, etc.
  //
  // declarar el campo de props aquí
  private readonly props: LabTestProps;

  // EJERCICIO 3: Constructor
  //
  // Pista: recibe un LabTestProps y lo asigna a `this.props`.
  // No necesitas validar mucho aquí — la validación de rango ya la hace
  // NormalRange en su propio constructor.
  //
  // Implementar constructor
  constructor(props: LabTestProps) {
    this.props = props;
  }

  // EJERCICIO 4: Getters para exponer las propiedades
  //
  // Pista: las propiedades son `private`, pero necesitamos leerlas desde afuera.
  // Los getters permiten exponer datos sin permitir modificación.
  //
  // Ejemplo:
  // ```typescript
  // get id(): string { return this.props.id; }
  // get value(): number { return this.props.value; }
  // ```
  //
  // agregar getters para id, patientId, testName, value, unit, takenAt
  get id(): string {
    return this.props.id;
  }
  get patientId(): string {
    return this.props.patientId;
  }
  get testName(): string {
    return this.props.testName;
  }
  get value(): number {
    return this.props.value;
  }
  get unit(): string {
    return this.props.unit;
  }
  get takenAt(): Date {
    return this.props.takenAt;
  }

  // EJERCICIO 5: isAbnormal(): boolean
  //
  // Pista: ya tienes NormalRange con su método contains().
  // Si el valor NO está contenido en el rango → es anormal.
  //
  // Ejemplo esperado:
  // ```typescript
  // const range = new NormalRange(70, 100, 'mg/dL');
  // const test = new LabTest({ ..., value: 130, normalRange: range });
  // test.isAbnormal(); // true — 130 está fuera de [70, 100]
  // ```
  //
  // Implementar isAbnormal()
  isAbnormal(): boolean {
    return !this.props.normalRange.contains(this.props.value);
  }

  // EJERCICIO 6: isCritical(): boolean
  //
  // Pista: "anormal" no es lo mismo que "crítico".
  // Un valor crítico es uno que requiere atención INMEDIATA — está muy por
  // encima o muy por debajo del rango (por ejemplo, >2x el máximo o <0.5x el mínimo).
  //
  // Tú defines el umbral. ¿Qué tiene sentido clínicamente?
  // Recuerda tu background QBP — ¿cuándo un resultado de glucosa en 300 mg/dL
  // es urgente vs uno en 110?
  //
  // Implementar isCritical()
  isCritical(): boolean {
    const { value, normalRange } = this.props;
    const criticalHigh = normalRange.max *2;
    const criticalLow = normalRange.min *0.5;
    return value > criticalHigh || value < criticalLow;
  }

  // EJERCICIO 7: requiresFollowUp(): boolean
  //
  // Pista: ¿en qué casos un test requiere seguimiento?
  // - Si es crítico, definitivamente sí
  // - Si es anormal... ¿siempre? ¿o depende de qué tan anormal?
  // Define tu propia lógica de negocio aquí.
  //
  // Implementar requiresFollowUp()
  requiresFollowUp(): boolean {
    return this.isCritical()
  }
}

// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA 2:
 *
 * 1. ENTITY vs VALUE OBJECT:
 *    - ¿Cuál es la diferencia fundamental?
 * Las entidades tienen identidad única (ID) que las distingue, incluso si sus propiedades son iguales. Los Value Objects se definen por sus propiedades y no tienen identidad propia.
 *    - ¿Cómo decide si algo es Entity o Value Object?
 * Si la identidad importa y necesitas distinguir instancias, es una Entity. Si solo importan los valores y no necesitas distinguir instancias, es un Value Object.
 *
 * 2. DOMAIN LOGIC:
 *    - ¿Por qué isAbnormal() vive en LabTest y no en un componente React?
 * Porque es una regla de negocio que depende de los datos del LabTest. La UI solo muestra datos, no debería contener lógica de negocio.
 *    - ¿Qué pasaría si la lógica estuviera en la UI?
 * Tendrías lógica de negocio mezclada con presentación, lo que hace el código más difícil de mantener y probar. Además, si cambias la UI (ej. a móvil), tendrías que reimplementar la lógica.
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología: 
 * Se relaciona con los datos documentados de laboratorios clínicos, el traducir esos datos a una lógica de negocio que determine si un resultado es anormal o crítico, y cómo esto afecta el seguimiento del paciente.
 * - Auditoría: 
 * Se relaciona con la importancia de la integridad de los datos y la trazabilidad. Cada LabTest tiene un ID único y una fecha, lo que permite auditar cuándo se tomó el test y qué resultados se obtuvieron.
 *
 * PARA PRACTICAR:
 * - [completar]
 */
