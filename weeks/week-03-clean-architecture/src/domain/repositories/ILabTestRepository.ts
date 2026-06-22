/**
 * ILabTestRepository.ts — Interfaz del repositorio de LabTest
 * DÍA 3 / DÍA 5: SOLID (D - Dependency Inversion) + Infrastructure Layer
 *
 * CONCEPTOS CLAVE:
 * - Repository Interface: el DOMINIO define el contrato, la infraestructura lo cumple
 * - Dependency Inversion: los Use Cases dependen de esta interfaz, no de Prisma/SQLite
 * - Port: esta interfaz es el "puerto" en arquitectura Hexagonal (Ports & Adapters)
 */

import { LabTest } from '../entities/LabTest';

// ============================================================================
// TAREA 3.1: REPOSITORY INTERFACE — Contrato del dominio
// ============================================================================

/**
 * ILabTestRepository — define QUÉ operaciones existen, no CÓMO se implementan
 *
 * ¿Por qué vive en el dominio y no en la infraestructura?
 * Porque el dominio NECESITA saber que puede guardar y buscar LabTests.
 * Lo que NO le importa al dominio es si se usa PostgreSQL, SQLite, o un Map en memoria.
 * La interfaz vive aquí; la implementación concreta vive en infrastructure/.
 *
 * Aplicación Healthcare:
 * El sistema clínico puede cambiar de base de datos (SQLite en dev → PostgreSQL en prod)
 * sin tocar NINGUNA regla de negocio. Solo se cambia el "adaptador" de infraestructura.
 */

// EJERCICIO 1: Define la interfaz del repositorio
//
// Pista: una interfaz en TypeScript describe el CONTRATO — qué métodos existen
// y qué tipos reciben/retornan. No tiene implementación.
//
// ¿Qué operaciones necesita el sistema sobre LabTests?
// - Guardar un LabTest nuevo (o actualizar uno existente)
// - Buscar un LabTest por su ID
// - Buscar todos los LabTests de un paciente
// - (opcional) Eliminar un LabTest
//
// Todos retornan Promises porque las operaciones de BD son asíncronas.
//
// Completar la interfaz con los métodos correctos
export interface ILabTestRepository {
  save(labTest: LabTest): Promise<void>;
  findById(id: string): Promise<LabTest | null>; // null si no existe
  findByPatientId(patientId: string): Promise<LabTest[]>; // [] si no hay resultados
  // EJERCICIO 1B: ¿qué otros métodos agregarías?
  // Pista: ¿necesitas poder eliminar? ¿listar todos? ¿buscar por fecha?
  searchByPatientIdAndTestName(patientId: string, testName: string): Promise<LabTest[]>;
  searchByDateRange(patientId: string, start: Date, end: Date): Promise<LabTest[]>;
  listAll(): Promise<LabTest[]>;
  deleteById(id: string): Promise<void>;
}

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * PREGUNTA CLAVE para reflexionar:
 * ¿Por qué ILabTestRepository vive en `domain/` y no en `infrastructure/`?
 * Respuesta: Por que aquí se nombran los métodos que se pueden utilizar en el dominio, pero aquí no se define como se guardan o recuperan, eso es responsabilidad de la infraestructura. 
 * El dominio solo define el contrato, la infraestructura lo cumple.
 *
 * CONEXIÓN CON SOLID:
 * - ¿Qué principio SOLID aplica aquí directamente?
 * - Respuesta: El principio de inversión de dependencias (D) - los casos de uso depeden de esta interfaz, no de una implementación concreta.
 * 
 * que es domain? Es la identidad o lógica de negocio de la aplicación, es el corazón de la aplicación, lo que define su propósito y sus reglas fundamentales. 
 * Es donde se encuentran las entidades, los casos de uso y las interfaces que definen cómo interactuar con el mundo exterior (como repositorios). 
 * El dominio es independiente de cualquier tecnología o framework específico, lo que permite que la lógica de negocio sea reutilizable y fácil de mantener a lo largo del tiempo.
 * 
 * que es Infrastructure? Son las Herramientas, servidores y software que lo soportan, es decir, la capa que se encarga de la implementación concreta de las interfaces definidas en el dominio.
 * Aquí es donde se implementan los detalles técnicos, como la conexión a bases de datos, la comunicación con APIs externas, el manejo de archivos, etc. 
 * La infraestructura es la parte que puede cambiar sin afectar la lógica de negocio, lo que permite que el dominio permanezca limpio y enfocado en su propósito.
 */
