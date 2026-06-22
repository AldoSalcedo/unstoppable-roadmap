# WEEK 03 — Clean Architecture
## 7-Day Intensive Sprint: Domain Layer, Use Cases, Repositories, Dependency Injection

**Goal**: Structure code that scales, is testable, and maintainable. Build a professional healthcare application with separation of concerns using Clean Architecture principles + SOLID.

**Healthcare Focus**: Refactor a **Lab Test Module** using clean architecture to demonstrate how domain logic, application rules, and infrastructure concerns are separated.

---

## DÍA 1: Clean Architecture Fundamentals
**Tema**: Las 4 Capas | Dependency Rule | Por qué la estructura importa

### Objetivos de Aprendizaje
- Las 4 capas de Clean Architecture (Domain, Application, Infrastructure, Presentation)
- El Dependency Rule: las dependencias apuntan hacia adentro
- Beneficios: testabilidad, mantenibilidad, escalabilidad
- Comparación: arquitectura caótica vs feature-based vs clean

### Healthcare Angle
En un laboratorio clínico:
- **Reglas de negocio**: ¿Cuándo es un resultado "crítico"?
- **Procesos de aplicación**: ¿Cómo se procesa un resultado (validar → alertar → guardar)?
- **Persistencia**: ¿Dónde se guardan los resultados?
- **Interfaces**: ¿Cómo los doctoress ven esto en la UI?

Con Clean Architecture, cada capa tiene una responsabilidad clara.

### Contenido Principal
1. **La Pirámide de Capas**
   ```
   ┌─────────────────────────────────────┐
   │      PRESENTATION (UI, Controllers) │
   │      Frameworks: React, Vue, Angular │
   ├─────────────────────────────────────┤
   │    APPLICATION (Use Cases)          │
   │    Orchestration, Business Workflows │
   ├─────────────────────────────────────┤
   │      DOMAIN (Entities, Value Objects)│
   │      Pure Business Rules            │
   ├─────────────────────────────────────┤
   │   INFRASTRUCTURE (DB, APIs, Cache)  │
   │   Implementation Details            │
   └─────────────────────────────────────┘
   ```

2. **El Dependency Rule**
   - Las dependencias SIEMPRE apuntan hacia adentro (Domain)
   - Domain NO depende de nada
   - Application depende de Domain
   - Infrastructure depende de Application + Domain
   - Presentation depende de Application + Domain

   ```
   MALO (circular dependency):
   Domain → Application → Infrastructure → Domain ❌

   BUENO (unidirectional):
   Presentation → Application → Domain ✓
   Infrastructure → Domain ✓
   ```

3. **Comparación de Arquitecturas**
   - Caótica: todo mezclado en una carpeta
   - Modular: código agrupado por función (utils, components)
   - Feature-based: código por feature (lab-test/, patient/)
   - Clean: código por capa (domain/, application/, infrastructure/)

### Ejercicio Principal
- [ ] Analizar un módulo existente (Week 02's validator)
- [ ] Identificar qué es "domain logic" vs "application logic"
- [ ] Planificar la arquitectura limpia

### DS&A Focus
Usaremos algoritmos eficientes en cada capa:
- Domain: Business logic (sin optimización prematura)
- Application: Orquestación (usa mejores patrones)
- Infrastructure: Query optimization (índices, cachés)

---

## DÍA 2: Domain Layer — El Corazón
**Tema**: Entidades | Value Objects | No Framework Dependencies

### Objetivos
- Entities: objetos con identidad única
- Value Objects: objetos sin identidad (intercambiables)
- Domain Logic: cálculos de negocio
- SIN dependencias de frameworks

### Healthcare Angle
En clínica:
- **Entity**: LabTest (tiene ID único: LAB-001)
- **Value Object**: NormalRange, TestResult (12.5 g/dL)
- **Domain Logic**: isAbnormal(), requiresFollowUp()

Una entidad de LabTest:
```typescript
class LabTest {
  id: string;
  testName: string;
  value: number;
  normalRange: NormalRange;
  timestamp: Date;

  // Domain logic (PURO NEGOCIO)
  isAbnormal(): boolean { ... }
  requiresFollowUp(): boolean { ... }
  isCritical(): boolean { ... }
}
```

### Contenido
1. **Entities vs Value Objects**
   - Entity: tiene ID, mutable, ciclo de vida (crear → modificar → borrar)
   - Value Object: no tiene ID, inmutable, solo el valor importa

2. **Domain Logic (¿De quién es responsabilidad?)**
   - "¿Cómo sé si un valor es crítico?" → Domain (LabTest entity)
   - "¿Cómo muestro esto en la UI?" → Presentation
   - "¿Cómo lo guardo en BD?" → Infrastructure

3. **Pure Functions vs Side Effects**
   - Pure: `isAbnormal(value, range): boolean` (sin DB, sin logs)
   - Impure: `validateAndLog(value, range, logger)` (con side effect: log)
   - Domain = pure functions (máximo)

### Ejercicio
- [ ] Crear `src/domain/lab-test.ts` con Entity LabTest
- [ ] Implementar `isAbnormal()`, `requiresFollowUp()`, `isCritical()`
- [ ] Tests: unit tests puros sin mocks

---

## DÍA 3: SOLID Principles
**Tema**: Single Responsibility | Open/Closed | Liskov | Interface Segregation | Dependency Inversion

### Objetivos
- Entender cada principio
- Aplicar cada uno al módulo de LabTest
- Evitar violaciones de SOLID (code smells)

### Healthcare Angle
¿Por qué SOLID en clínica?
- Cambios regulatorios: GDPR, HIPAA
- New features: nuevos tipos de tests
- Mantenibilidad: código que puede cambiar sin romperse

### Contenido
1. **S — Single Responsibility Principle**
   - Una clase = una razón para cambiar
   - ❌ LabTestValidator hace validación + logging + persistencia
   - ✅ LabTestValidator solo valida

2. **O — Open/Closed Principle**
   - Abierto para extensión, cerrado para modificación
   - ❌ Agregar nuevo tipo de test requiere cambiar LabTest class
   - ✅ Usar estrategia/polimorfismo

3. **L — Liskov Substitution**
   - Si S es subtipo de T, T puede ser reemplazado por S
   - Importante en herencia e interfaces

4. **I — Interface Segregation**
   - Muchas interfaces específicas > una interfaz gorda
   - ❌ IValidator { validate(), validateAndLog(), validateAndSave() }
   - ✅ IValidator { validate() }, ILogger { log() }

5. **D — Dependency Inversion**
   - Depender de abstracciones (interfaces), no de concreciones
   - ❌ new DatabaseRepository()
   - ✅ constructor(private repo: IRepository)

---

## DÍA 4: Application Layer — Use Cases
**Tema**: Orquestación | Workflows | Transacciones

### Objetivos
- Use Cases: qué hace el sistema (desde óptica de usuario)
- DTOs: Data Transfer Objects (comunicación entre capas)
- Error handling: manejo consistente de errores

### Healthcare Angle
Procesar un resultado de lab:
1. Validar formato (domain)
2. Verificar si es crítico (domain)
3. Guardar en BD (infrastructure)
4. Si es crítico: enviar alerta (infrastructure)
5. Registrar en audit log (infrastructure)

Esto es un **Use Case**: "Procesar Resultado de Lab"

### Contenido
1. **Use Case = Regla de Aplicación**
   - El "qué" del sistema desde óptica de usuario
   - No es "cómo" se implementa

   Ejemplo:
   ```typescript
   class ProcessLabTestUseCase {
     constructor(
       private labTestRepository: ILabTestRepository,
       private alertService: IAlertService,
       private auditLog: IAuditLog
     ) {}

     async execute(input: ProcessLabTestInput): Promise<ProcessLabTestOutput> {
       // 1. Crear entity
       const labTest = LabTest.create(input);

       // 2. Validar
       if (labTest.isCritical()) {
         await this.alertService.sendAlert(labTest);
       }

       // 3. Guardar
       await this.labTestRepository.save(labTest);

       // 4. Audit
       await this.auditLog.log('LabTest created', labTest.id);

       return { success: true, labTestId: labTest.id };
     }
   }
   ```

2. **DTOs (Data Transfer Objects)**
   - Seperan datos entre capas
   - Presentation → Application: input DTO
   - Application → Presentation: output DTO

---

## DÍA 5: Infrastructure Layer — Repositories
**Tema**: Persistencia | Interfaces | Database Agnostic

### Objetivos
- Repository Pattern: abstrae detalles de BD
- Interfaces: permite cambiar de BD sin cambiar el resto
- ORM vs Query Builder vs Raw SQL

### Healthcare Angle
¿Dónde guardamos lab results?
- Desarrollo: SQLite (local)
- Staging: PostgreSQL (cloud)
- Producción: PostgreSQL + Redis (cache)

Con Repository Pattern:
```typescript
interface ILabTestRepository {
  save(labTest: LabTest): Promise<void>;
  findById(id: string): Promise<LabTest | null>;
  findByPatient(patientId: string): Promise<LabTest[]>;
}

// SQLiteRepository implements ILabTestRepository
// PostgresRepository implements ILabTestRepository
// Ambas implementan la misma interfaz
```

---

## DÍA 6: Dependency Injection
**Tema**: IoC Container | Constructor Injection | Testability

### Objetivos
- Inversión de Control: quién crea las instancias?
- Inyección de dependencias: pasar dependencias en constructor
- Frameworks de DI: Awilix, InversifyJS, TypeDI

### Healthcare Angle
En producción:
```typescript
// DI Container
const container = new Container();
container.register('labTestRepository', PostgresRepository);
container.register('alertService', SendgridAlertService);
container.register('auditLog', FirebaseAuditLog);

// Get use case
const useCase = container.resolve(ProcessLabTestUseCase);
await useCase.execute(input);
```

En tests:
```typescript
// Mock dependencies
const mockRepository = new MockLabTestRepository();
const mockAlertService = new MockAlertService();

const useCase = new ProcessLabTestUseCase(
  mockRepository,
  mockAlertService
);
```

---

## DÍA 7: Integration & Review
**Tema**: Proyecto completo con Clean Architecture

### Objetivos
- Integrar todas las capas
- Escribir tests para cada capa
- Documentar decisiones de arquitectura

### Ejercicio Final
- [ ] Domain layer: entity + value objects + domain logic
- [ ] Application layer: 2+ use cases
- [ ] Infrastructure layer: repository implementation
- [ ] Presentation layer: stub/placeholder
- [ ] Tests: unit + integration
- [ ] Documentar: decisiones, trade-offs

---

## CONEXIÓN CON TU BACKGROUND

### QBP (Biología Clínica)
En el lab, procesos están claramente separados:
- **Técnica de recolección** (domain): cómo colectar muestra sin contaminar
- **Procedimiento de análisis** (application): paso 1, paso 2, paso 3
- **Reporte** (infrastructure): dónde guardar, quién ve

Clean Architecture mapea esto en código.

### Auditoría
En auditoría, verificas:
- Separación de responsabilidades: ¿quién hizo qué?
- Trazabilidad: ¿puedo seguir cada decisión?
- Control: ¿hay puntos de validación?

Clean Architecture PROPORCIONA esto automáticamente.

### Ventas/UX
Cuando vendas:
- "Nuestro código está diseñado para cambiar sin romperse"
- "Agregar nuevas features toma días, no meses"
- "Cada cambio tiene tests — confianza total"

Clean Architecture = escalabilidad = vende.

---

## PRÓXIMO PASO

**Week 04**: Performance Optimization
- Código está bien estructurado, pero ¿es rápido?
- Optimizar renders en React
- Optimizar queries en BD
- Medir y mejorar

La arquitectura es la base. El performance es la pulida.
