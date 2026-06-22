/**
 * container.ts — Contenedor de Dependency Injection
 * DÍA 6: Dependency Injection — IoC Container
 *
 * CONCEPTOS CLAVE:
 * - IoC (Inversion of Control): el container crea y conecta las dependencias
 * - Constructor Injection: las dependencias se pasan por constructor
 * - Single source of truth: un solo lugar que sabe cómo armar el sistema
 * - Testability: en tests, se arma el sistema con mocks en lugar de implementaciones reales
 */

import { InMemoryLabTestRepository } from '../repositories/InMemoryLabTestRepository';
import { ProcessLabTestUseCase } from '../../application/use-cases/ProcessLabTestUseCase';

// ============================================================================
// TAREA 6.1: DEPENDENCY INJECTION CONTAINER
// ============================================================================

/**
 * ¿Por qué necesitamos un container?
 *
 * Sin DI:
 * ```typescript
 * // En cada lugar que necesitas el use case:
 * const repo = new InMemoryLabTestRepository();
 * const useCase = new ProcessLabTestUseCase(repo);
 * ```
 * Problema: si cambias la implementación del repo, cambias en 20 lugares.
 *
 * Con DI Container:
 * ```typescript
 * // Un solo lugar:
 * const { processLabTest } = buildContainer();
 * // Todos los demás solo piden el use case listo
 * ```
 *
 * Aplicación Healthcare:
 * En producción el container conecta PrismaRepository + AlertService real.
 * En tests el container conecta InMemoryRepository + MockAlertService.
 * El código de negocio no cambia — solo la configuración del container.
 */

// EJERCICIO 1: Define el tipo del container (qué expone hacia afuera)
//
// Pista: el container solo expone los Use Cases — no los repositorios.
// La presentación solo necesita saber "puedo procesar un lab test",
// no "qué base de datos se usa".
//
// Completar el tipo
export type AppContainer = {
  processLabTestUseCase: ProcessLabTestUseCase;
  // EJERCICIO 1B: ¿qué otros use cases agregarías cuando los crees?
};

// EJERCICIO 2: Función factory que construye el container
//
// Pista: crea las instancias en el orden correcto:
// 1. Primero las dependencias más internas (repositorios)
// 2. Luego los use cases que dependen de ellas
//
// Esto es "Constructor Injection" — pasas las dependencias al constructor.
//
// TODO: completar la función
export function buildContainer(): AppContainer {
  // Paso 1: Infraestructura (las piezas más internas)
  const labTestRepository = new InMemoryLabTestRepository();

  // Paso 2: Use Cases (dependen de la infraestructura)
  const processLabTestUseCase = new ProcessLabTestUseCase(labTestRepository);

  // Paso 3: Retornar el container
  // return { processLabTestUseCase };
  return {processLabTestUseCase};
}

// ============================================================================
// BONUS: Container para testing
// ============================================================================

// TestContainer expone el repositorio además de los use cases —
// así los tests pueden leer el estado interno y verificar qué se guardó.
export type TestContainer = AppContainer & {
  labTestRepository: InMemoryLabTestRepository;
};

export function buildTestContainer(): TestContainer {
  const labTestRepository = new InMemoryLabTestRepository();
  const processLabTestUseCase = new ProcessLabTestUseCase(labTestRepository);

  return {
    processLabTestUseCase,
    labTestRepository, // expuesto para inspección en tests
  };
}


// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * PREGUNTA CLAVE:
 * ¿Qué es "Inversion of Control" y cómo lo resuelve este container?
 *
 * Sin IoC: ProcessLabTestUseCase crea su propio repositorio (control interno)
 * Con IoC: alguien externo le da el repositorio (control invertido al container)
 *
 * Respuesta con tus palabras: [completar]
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - Auditoría: el container es como el "manual de organización" de una empresa —
 *   define quién depende de quién y cómo se conectan los departamentos,
 *   sin que cada departamento tenga que saber cómo funciona el otro.
 */
