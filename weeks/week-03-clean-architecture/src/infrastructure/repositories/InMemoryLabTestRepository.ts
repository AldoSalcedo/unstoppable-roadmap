/**
 * InMemoryLabTestRepository.ts — Implementación en memoria del repositorio
 * DÍA 5: Infrastructure Layer — Repository Implementation
 *
 * CONCEPTOS CLAVE:
 * - Adapter: implementa el "puerto" (ILabTestRepository) definido en el dominio
 * - En memoria: guarda datos en un Map — perfecto para tests y desarrollo
 * - Intercambiable: mañana puedes swapear por PrismaLabTestRepository sin tocar el dominio
 * - Dependency Rule: este archivo importa del dominio, nunca al revés
 */

import { LabTest } from '../../domain/entities/LabTest';
import { ILabTestRepository } from '../../domain/repositories/ILabTestRepository';

// ============================================================================
// TAREA 5.1: REPOSITORY IMPLEMENTATION — InMemory
// ============================================================================

/**
 * InMemoryLabTestRepository — implementación del repositorio usando un Map
 *
 * ¿Por qué implementar en memoria primero?
 * - Sin setup de base de datos
 * - Tests rápidos (sin I/O)
 * - Valida que la interfaz es correcta antes de conectar Prisma/SQLite
 *
 * Aplicación Healthcare:
 * En desarrollo puedes cargar datos de prueba (fixtures) en memoria
 * y hacer demos sin necesitar acceso a la base de datos del hospital.
 */
export class InMemoryLabTestRepository implements ILabTestRepository {

  // EJERCICIO 1: Almacenamiento interno
  //
  // Pista: usa un Map<string, LabTest> donde la clave es el ID del LabTest.
  // Map es más eficiente que un array para búsquedas por ID (O(1) vs O(n)).
  //
  // Declarar el Map privado
  // private readonly store = new Map<string, LabTest>();
  private readonly store: Map<string, LabTest>;

  constructor() {
    this.store = new Map<string, LabTest>();
  }

  // EJERCICIO 2: save(labTest: LabTest): Promise<void>
  //
  // Pista: guarda el labTest en el Map usando su ID como clave.
  // Si ya existe un LabTest con ese ID, lo sobreescribe (upsert).
  //
  // Implementar save()
  async save(labTest: LabTest): Promise<void> {
    this.store.set(labTest.id, labTest);
  }

  // EJERCICIO 3: findById(id: string): Promise<LabTest | null>
  //
  // Pista: busca en el Map por ID.
  // Si no existe, retorna null (no lanzar error — null es válido aquí).
  //
  // Ejemplo esperado:
  // ```typescript
  // await repo.findById('id-inexistente'); // null
  // await repo.save(labTest);
  // await repo.findById(labTest.id);      // el mismo labTest
  // ```
  //
  // Implementar findById()
  async findById(id: string): Promise<LabTest | null> {
    return this.store.get(id) ?? null;
  }

  // EJERCICIO 4: searchByPatientIdAndTestName(patientId: string, testName: string): Promise<LabTest[]>
  //
  // Pista: filtra todos los valores del Map donde labTest.patientId === patientId y labTest.testName === testName.
  // Map tiene el método `.values()` que retorna todos los valores.
  //
  // Ejemplo esperado:
  // ```typescript
  // await repo.searchByPatientIdAndTestName('patient-sin-tests', 'test-name'); // []
  // await repo.save(labTestDelPacienteA);
  // await repo.save(labTestDelPacienteA2);
  // await repo.searchByPatientIdAndTestName('patient-A', 'test-name'); // [labTest1, labTest2]
  // ```
  //
  // Implementar searchByPatientIdAndTestName()
  async searchByPatientIdAndTestName(patientId: string, testName: string): Promise<LabTest[]> {
    return Array.from(this.store.values()).filter(labTest => labTest.patientId === patientId && labTest.testName === testName);
  }

  async findByPatientId(patientId: string): Promise<LabTest[]> {
    return Array.from(this.store.values()).filter(labTest => labTest.patientId === patientId);
  }

  async searchByDateRange(patientId: string, start: Date, end: Date): Promise<LabTest[]> {
    return Array.from(this.store.values()).filter(labTest => {
      return labTest.patientId === patientId && labTest.takenAt >= start && labTest.takenAt <= end;
    });
  }

  async listAll(): Promise<LabTest[]> {
    return Array.from(this.store.values());
  }

  async deleteById(id: string): Promise<void> {
    this.store.delete(id);
  }

  // EJERCICIO 5 (opcional): clear() — útil para limpiar entre tests
  //
  // Pista: los tests necesitan empezar con un repositorio vacío.
  // Este método no forma parte de ILabTestRepository (es solo para testing).
  //
  // TODO: implementar clear()
  clear(): void {
    this.store.clear();
  }
}

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * PREGUNTA CLAVE:
 * Este archivo importa de `../../domain/` — ¿viola eso la Dependency Rule?
 * no, por que la dependencia va del dominio a la infraestructura, no alreves. El dominio no sabe nada de la infraestructura, pero la infraestructura sí conoce el dominio para implementar sus interfaces.
 *
 * PREGUNTA DE DISEÑO:
 * ¿Cuándo cambiarías InMemoryLabTestRepository por PrismaLabTestRepository?
 * Respuesta: Cuando quieras conectar con una base de datos real (SQLite) usando Prisma. InMemory es perfecto para desarrollo y tests rápidos, pero no persiste datos entre ejecuciones ni soporta consultas complejas. 
 * PrismaLabTestRepository implementará la misma interfaz (ILabTestRepository) pero con lógica para interactuar con la base de datos. 
 * Al mantener la interfaz, el resto del sistema no necesita cambiar nada — solo swapear la implementación en el punto de inyección de dependencias.
 * 
 * ¿Qué tendrías que modificar en el resto del sistema?
 * Respuesta: Idealmente, nada. Si el resto del sistema depende solo de ILabTestRepository, puedes cambiar la implementación sin tocar el dominio ni los casos de uso. 
 * Solo necesitas actualizar la configuración de tu contenedor de dependencias (o el lugar donde instancias el repositorio) para usar PrismaLabTestRepository en lugar de InMemoryLabTestRepository.
 */
