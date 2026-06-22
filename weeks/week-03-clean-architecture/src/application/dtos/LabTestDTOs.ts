/**
 * LabTestDTOs.ts — Data Transfer Objects para la capa de aplicación
 * DÍA 4: Application Layer — DTOs
 *
 * CONCEPTOS CLAVE:
 * - DTO: objeto plano que mueve datos entre capas sin lógica de negocio
 * - Input DTO: lo que llega desde la Presentation (formulario, API request)
 * - Output DTO: lo que regresa hacia la Presentation (respuesta al cliente)
 * - Los DTOs NO son entidades — son solo datos, sin métodos de dominio
 */

// ============================================================================
// TAREA 4.1: DTOs DE ENTRADA Y SALIDA
// ============================================================================

/**
 * ¿Por qué necesitamos DTOs si ya tenemos LabTestProps?
 *
 * LabTestProps = lo que la entidad necesita internamente (con tipos de dominio)
 * DTO = lo que llega desde afuera (strings crudos, números sin validar)
 *
 * Ejemplo:
 * - El formulario manda `patientId: "123"` y `takenAt: "2026-06-15"` (string)
 * - La entidad necesita `patientId: string` y `takenAt: Date` (objeto Date)
 * - El Use Case hace la conversión en el medio
 */

// EJERCICIO 1: DTO de entrada para procesar un lab test
//
// Pista: lo que llega desde un formulario o API request.
// Los tipos son simples (string, number) — sin tipos de dominio como NormalRange.
// La fecha puede llegar como string ISO ("2026-06-15T10:00:00Z").
//
// Completar los campos
export type ProcessLabTestInput = {
  patientId: string;
  testName: string;
  value: number;
  unit: string;
  // El rango normal llega como datos crudos, no como NormalRange
  normalRangeMin: number;
  normalRangeMax: number;
  takenAt: string; // ISO date string — el use case lo convierte a Date
};

// EJERCICIO 2: DTO de salida — lo que retorna el Use Case al cliente
//
// Pista: no exponemos la entidad entera — solo los datos que el cliente necesita.
// Esto protege el dominio de quedar acoplado a la presentación.
//
// ¿Qué querría saber el médico/sistema después de procesar un resultado?
// - El ID generado
// - Si el resultado es anormal o crítico
// - Si requiere seguimiento
//
// TODO: completar los campos
export type ProcessLabTestOutput = {
  labTestId: string;
  isAbnormal: boolean;
  isCritical: boolean;
  requiresFollowUp: boolean;
  // EJERCICIO 2B: ¿agregarías algo más? ¿un mensaje descriptivo para el médico?
  message: string;
};

// EJERCICIO 3: DTO para buscar tests de un paciente
//
// Pista: simple — solo necesita el patientId
export type GetPatientLabTestsInput = {
  patientId: string;
};

// EJERCICIO 4: DTO de salida para la lista de tests de un paciente
//
// Pista: un resumen de cada test — no toda la entidad.
// Piensa en qué necesitaría mostrar una tabla en la UI clínica.
//
// Completar los campos
export type LabTestSummary = {
  id: string;
  testName: string;
  value: number;
  unit: string;
  isAbnormal: boolean;
  isCritical: boolean;
  takenAt: string; // convertido de Date a string para serialización
  message: string; // un mensaje breve para el médico, basado en el resultado
};

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * PREGUNTA CLAVE:
 * ¿Por qué NO retornamos la entidad LabTest directamente desde el Use Case?
 * Respuesta: por que la entidad tiene lógica de dominio, métodos y tipos específicos que no queremos exponer a la capa de presentación.
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: los DTOs son como los "formatos estandarizados" de un informe —
 *   solo incluyes los campos relevantes para el receptor, no todo el expediente.
 */
