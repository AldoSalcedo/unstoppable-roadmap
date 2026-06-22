/**
 * ProcessLabTestUseCase.ts — Caso de uso: procesar un resultado de laboratorio
 * DÍA 4: Application Layer — Use Cases
 *
 * CONCEPTOS CLAVE:
 * - Use Case: orquesta el dominio para cumplir UNA regla de aplicación
 * - No tiene lógica de negocio propia — delega al dominio (LabTest)
 * - Depende de interfaces (ILabTestRepository), no de implementaciones concretas
 * - Es el "director de orquesta": coordina pero no toca los instrumentos
 */

import { LabTest, LabTestProps } from '../../domain/entities/LabTest';
import { NormalRange } from '../../domain/value-objects/NormalRange';
import { ILabTestRepository } from '../../domain/repositories/ILabTestRepository';
import { randomUUID } from 'crypto';
import {
  ProcessLabTestInput,
  ProcessLabTestOutput,
} from '../dtos/LabTestDTOs';

// ============================================================================
// TAREA 4.2: USE CASE — ProcessLabTestUseCase
// ============================================================================

/**
 * ProcessLabTestUseCase — procesa y persiste un resultado de lab test
 *
 * Flujo de trabajo (orquestación):
 * 1. Recibe datos crudos (DTO de entrada)
 * 2. Construye los objetos de dominio (NormalRange, LabTest)
 * 3. Aplica lógica de dominio (isAbnormal, isCritical)
 * 4. Persiste via repositorio
 * 5. Retorna un DTO de salida con el resultado
 *
 * Aplicación Healthcare:
 * Cuando un analizador manda un resultado al sistema, este Use Case
 * es el punto de entrada: valida, crea la entidad, la guarda, y determina
 * si se debe disparar una alerta para el médico.
 */
export class ProcessLabTestUseCase {

  // EJERCICIO 1: Constructor con Dependency Injection
  //
  // Pista: el Use Case necesita el repositorio para guardar el LabTest.
  // Recibe la INTERFAZ (ILabTestRepository), no la implementación concreta.
  // Esto permite testearlo con un repositorio en memoria (sin base de datos real).
  //
  // Completar el constructor
  constructor(
    private readonly labTestRepository: ILabTestRepository
  ) {}

  // EJERCICIO 2: Método execute() — el corazón del Use Case
  //
  // Pista: sigue el flujo de 5 pasos descrito arriba.
  //
  // Paso 1: generar un ID único para el nuevo LabTest
  //         (usa crypto.randomUUID() — disponible en Node.js 14.17+)
  //
  // Paso 2: construir NormalRange con los datos del DTO
  //         (normalRangeMin, normalRangeMax, unit)
  //
  // Paso 3: construir la entidad LabTest con todos sus props
  //         (convierte takenAt de string a Date con `new Date(input.takenAt)`)
  //
  // Paso 4: persistir con this.labTestRepository.save(labTest)
  //
  // Paso 5: retornar el output DTO con los resultados del dominio
  //
  // Implementar execute()
  async execute(input: ProcessLabTestInput): Promise<ProcessLabTestOutput> {
    // Paso 1: ID único
    // const id = ???
    const id = randomUUID();

    // Paso 2: Value Object
    // const normalRange = new NormalRange(???, ???, ???);
    const normalRange = new NormalRange(input.normalRangeMin, input.normalRangeMax, input.unit);

    // Paso 3: Entidad
    // const props: LabTestProps = { ... };
    // const labTest = new LabTest(props);
    const props: LabTestProps = {
      id,
      patientId: input.patientId,
      testName: input.testName,
      value: input.value,
      unit: input.unit,
      normalRange,
      takenAt: new Date(input.takenAt)
    }
    const labTest = new LabTest(props);

    // Paso 4: Persistir
    // await this.labTestRepository.save(???);
    await this.labTestRepository.save(labTest);

    // Paso 5: Retornar DTO
    // return { ... };
    return {
      labTestId: labTest.id,
      isAbnormal: labTest.isAbnormal(),
      isCritical: labTest.isCritical(),
      requiresFollowUp: labTest.requiresFollowUp(),
      message: labTest.isCritical() ? 'Resultado crítico - requiere atención médica inmediata' 
      : labTest.isAbnormal() ? 'Resultado anormal - se recomienda seguimiento'
      : 'Resultado dentro de rango normal'
    };
  }
}

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * PREGUNTA CLAVE:
 * El Use Case llama `labTest.isAbnormal()` — ¿eso es lógica de aplicación
 * o lógica de dominio? ¿Dónde debería vivir y por qué?
 * 
 * Es lógica de dominio, por que es una regla que depende de los datos del LabTest (value, normalRange) y no de factores externos o de la aplicación en sí. 
 * Por eso, tiene sentido que esta lógica resida dentro de la entidad LabTest, manteniendo el Use Case enfocado en la orquestación y delegando la lógica específica al dominio.
 * debe vivir en la entidad LabTest, porque es una regla que depende de los datos del LabTest (value, normalRange) y no de factores externos o de la aplicación en sí.
 *
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología: el Use Case es como el "procedimiento estándar de operación" (SOP)
 *   del laboratorio — define los pasos a seguir cuando llega una muestra,
 *   sin importar qué analizador o sistema de BD se use.
 */
