# GUÍA DE CONCEPTOS — Clean Architecture en TypeScript
## Semana 03: Domain Layer, Use Cases, Repositories, SOLID, Dependency Injection

---

## 1. LA ARQUITECTURA LIMPIA EXPLICADA

### Las 4 Capas

```
         ╔════════════════════════════════════════╗
         ║    PRESENTATION (Controllers/UI)      ║
         ║    React Components, REST Controllers  ║
         ║    - Maneja HTTP requests/responses   ║
         ║    - NO contiene lógica de negocio   ║
         ╚════════════════════════════════════════╝
                          ↓ Depende de
         ╔════════════════════════════════════════╗
         ║     APPLICATION (Use Cases)            ║
         ║     Orchestración de Domain            ║
         ║     - Define el "workflow"             ║
         ║     - Usa Domain para reglas           ║
         ║     - Usa Repositories para datos      ║
         ╚════════════════════════════════════════╝
                          ↓ Depende de
         ╔════════════════════════════════════════╗
         ║       DOMAIN (Business Logic)          ║
         ║       Entities, Value Objects          ║
         ║       - Cálculos puros                 ║
         ║       - SIN dependencias               ║
         ║       - Testeable sin mocks            ║
         ╚════════════════════════════════════════╝
                          ↓ Implementada por
         ╔════════════════════════════════════════╗
         ║   INFRASTRUCTURE (Technical Details)   ║
         ║   Database, APIs, File System          ║
         ║   - Implementa interfaces de Domain   ║
         ║   - Abstrae detalles técnicos         ║
         ╚════════════════════════════════════════╝
```

### El Dependency Rule

**Las dependencias SIEMPRE fluyen HACIA ADENTRO, nunca hacia afuera.**

```
✅ CORRECTO:
Presentation → Application → Domain
Infrastructure → Domain

❌ INCORRECTO (nunca hagas):
Domain → Application (Domain no depende de nadie)
Application → Presentation (Application es agnóstico de UI)
```

### Regla de Oro

> **Domain NO debe conocer sobre Presentation, Application, o Infrastructure.**

Domain contiene la lógica de negocio pura. El resto del sistema se construye ALREDEDOR de Domain.

---

## 2. LA CAPA DOMAIN

### Qué va en Domain?

- **Entities**: Objetos con identidad única
- **Value Objects**: Objetos sin identidad (values)
- **Domain Events**: Cosas que pasaron en el dominio
- **Domain Services**: Lógica que no "pertenece" a una entidad
- **Domain Rules**: Las reglas de negocio

### Qué NO va en Domain?

- ❌ Imports de frameworks (React, Express, NestJS)
- ❌ Imports de bases de datos (typeorm, prisma)
- ❌ Imports de librerías externas (excepto tipos)
- ❌ HTTP requests
- ❌ File I/O

### Ejemplo: Entity LabTest

```typescript
// domain/lab-test.ts
// NO imports de frameworks. SOLO TypeScript puro.

export class LabTest {
  readonly id: string;
  readonly testName: string;
  readonly value: number;
  readonly normalRange: NormalRange;
  readonly timestamp: Date;
  readonly patientId: string;

  constructor(
    id: string,
    testName: string,
    value: number,
    normalRange: NormalRange,
    timestamp: Date,
    patientId: string
  ) {
    this.id = id;
    this.testName = testName;
    this.value = value;
    this.normalRange = normalRange;
    this.timestamp = timestamp;
    this.patientId = patientId;
  }

  // ╔═══════════════════════════════════════════╗
  // ║ DOMAIN LOGIC (Business Rules)            ║
  // ╚═══════════════════════════════════════════╝

  /**
   * ¿Este resultado está dentro del rango normal?
   */
  isNormal(): boolean {
    return this.value >= this.normalRange.min &&
           this.value <= this.normalRange.max;
  }

  /**
   * ¿Está anormal pero no crítico?
   */
  isAbnormal(): boolean {
    return !this.isNormal();
  }

  /**
   * ¿Es crítico? (fuera de rango por >20%)
   * Requiere atención INMEDIATA del doctor
   */
  isCritical(): boolean {
    const margin = (this.normalRange.max - this.normalRange.min) * 0.2;
    return this.value < (this.normalRange.min - margin) ||
           this.value > (this.normalRange.max + margin);
  }

  /**
   * ¿Requiere seguimiento?
   * Anormal pero no crítico = necesita seguimiento
   */
  requiresFollowUp(): boolean {
    return this.isAbnormal() && !this.isCritical();
  }
}

export class NormalRange {
  constructor(
    readonly min: number,
    readonly max: number
  ) {}

  contains(value: number): boolean {
    return value >= this.min && value <= this.max;
  }
}
```

### Entity Factory

Para crear entities de forma segura:

```typescript
export class LabTestFactory {
  static create(
    testName: string,
    value: number,
    normalRange: NormalRange,
    patientId: string
  ): LabTest {
    // Validaciones de construcción
    if (value < 0) throw new Error('Value cannot be negative');
    if (normalRange.min >= normalRange.max) {
      throw new Error('Invalid range');
    }

    return new LabTest(
      generateId(),      // Genera ID único
      testName,
      value,
      normalRange,
      new Date(),
      patientId
    );
  }
}
```

---

## 3. LA CAPA APPLICATION

### Qué va en Application?

- **Use Cases**: Workflows del sistema
- **Application Services**: Orquestadores
- **DTOs**: Data Transfer Objects
- **Mappers**: Convertir entre capas

### Use Case Anatomy

```typescript
// application/process-lab-test.use-case.ts

import { LabTest } from '../domain/lab-test';
import { ILabTestRepository } from '../domain/repositories';
import { IAlertService } from '../domain/services';

export type ProcessLabTestInput = {
  testName: string;
  value: number;
  normalRangeMin: number;
  normalRangeMax: number;
  patientId: string;
};

export type ProcessLabTestOutput = {
  success: boolean;
  labTestId?: string;
  message: string;
};

export class ProcessLabTestUseCase {
  constructor(
    private repository: ILabTestRepository,
    private alertService: IAlertService
  ) {}

  async execute(input: ProcessLabTestInput): Promise<ProcessLabTestOutput> {
    try {
      // 1. CREAR ENTITY (Domain)
      const labTest = LabTest.create(
        input.testName,
        input.value,
        input.normalRangeMin,
        input.normalRangeMax,
        input.patientId
      );

      // 2. VALIDAR (Domain)
      if (labTest.isCritical()) {
        // 3. ALERTAR (Infrastructure)
        await this.alertService.sendCriticalAlert(labTest);
      }

      // 4. PERSISTIR (Infrastructure)
      await this.repository.save(labTest);

      return {
        success: true,
        labTestId: labTest.id,
        message: labTest.isCritical()
          ? 'Critical result - alert sent'
          : labTest.isAbnormal()
            ? 'Abnormal result - follow-up needed'
            : 'Normal result',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process lab test: ${error.message}`,
      };
    }
  }
}
```

### DTOs (Data Transfer Objects)

DTOs son objetos que carry datos entre capas. No tienen lógica.

```typescript
// Entrada (Presentation → Application)
export type CreateLabTestDTO = {
  testName: string;
  value: number;
  normalRangeMin: number;
  normalRangeMax: number;
  patientId: string;
};

// Salida (Application → Presentation)
export type LabTestResponseDTO = {
  id: string;
  testName: string;
  value: number;
  status: 'normal' | 'abnormal' | 'critical';
  requiresFollowUp: boolean;
  message: string;
};
```

---

## 4. LA CAPA INFRASTRUCTURE

### Repository Pattern

Abstrae la persistencia de datos:

```typescript
// domain/repositories/lab-test.repository.ts
export interface ILabTestRepository {
  save(labTest: LabTest): Promise<void>;
  findById(id: string): Promise<LabTest | null>;
  findByPatientId(patientId: string): Promise<LabTest[]>;
  delete(id: string): Promise<void>;
}

// infrastructure/repositories/postgres-lab-test.repository.ts
export class PostgresLabTestRepository implements ILabTestRepository {
  constructor(private db: Database) {}

  async save(labTest: LabTest): Promise<void> {
    await this.db.query(
      `INSERT INTO lab_tests (id, testName, value, patientId)
       VALUES ($1, $2, $3, $4)`,
      [labTest.id, labTest.testName, labTest.value, labTest.patientId]
    );
  }

  async findById(id: string): Promise<LabTest | null> {
    const row = await this.db.query(
      'SELECT * FROM lab_tests WHERE id = $1',
      [id]
    );
    return row ? this.mapToEntity(row) : null;
  }

  private mapToEntity(row: any): LabTest {
    return new LabTest(
      row.id,
      row.testName,
      row.value,
      new NormalRange(row.normalRangeMin, row.normalRangeMax),
      row.timestamp,
      row.patientId
    );
  }
}
```

### Beneficio: Intercambiabilidad

```typescript
// En tests:
const mockRepository = new MockLabTestRepository();

// En desarrollo:
const devRepository = new SQLiteLabTestRepository();

// En producción:
const prodRepository = new PostgresLabTestRepository();

// El resto del código NO CAMBIA
const useCase = new ProcessLabTestUseCase(
  devRepository, // o mockRepository, o prodRepository
  alertService
);
```

---

## 5. SOLID PRINCIPLES

### S — Single Responsibility Principle

**Una clase debería tener una sola razón para cambiar.**

```typescript
// ❌ MALO: Múltiples responsabilidades
class LabTestProcessor {
  processLabTest(data) {
    // Validar
    if (data.value < 0) throw new Error('Invalid');

    // Crear entity
    const labTest = new LabTest(data);

    // Persistir
    database.save(labTest);

    // Enviar email
    emailService.send(`Lab test ${labTest.id} created`);

    // Loguear
    console.log(`Processed ${labTest.id}`);
  }
}
// Si cambias validación, persistencia, email, O logging → cambias esta clase

// ✅ BUENO: Una responsabilidad por clase
class ProcessLabTestUseCase {
  constructor(
    private labTestRepository: ILabTestRepository,
    private alertService: IAlertService
  ) {}

  async execute(input): Promise<void> {
    const labTest = LabTest.create(input);
    await this.labTestRepository.save(labTest);
    if (labTest.isCritical()) {
      await this.alertService.sendAlert(labTest);
    }
  }
}
// Si cambias persistencia → cambias repository
// Si cambias alerting → cambias alertService
// El use case NO cambia
```

### O — Open/Closed Principle

**Abierto para extensión, cerrado para modificación.**

```typescript
// ❌ MALO: Requiere modificar para agregar nuevo test type
class LabTestValidator {
  validate(test) {
    if (test.type === 'hemoglobin') {
      return test.value >= 12 && test.value <= 17;
    }
    if (test.type === 'glucose') {
      return test.value >= 70 && test.value <= 100;
    }
    // Agregar nuevo test type? Modificar esta función
  }
}

// ✅ BUENO: Extensible sin modificación
interface TestValidator {
  validate(value: number): boolean;
}

class HemoglobinValidator implements TestValidator {
  validate(value: number): boolean {
    return value >= 12 && value <= 17;
  }
}

class GlucoseValidator implements TestValidator {
  validate(value: number): boolean {
    return value >= 70 && value <= 100;
  }
}

class LabTest {
  constructor(
    testName: string,
    value: number,
    private validator: TestValidator  // Inyectable
  ) {}

  isValid(): boolean {
    return this.validator.validate(this.value);
  }
}
// Agregar nuevo test type? Solo crea HemoglobinA1cValidator, implementa TestValidator
// LabTest NO cambia
```

### L — Liskov Substitution Principle

**Subtipos deben ser intercambiables por sus supertypes.**

```typescript
// Si EmailAlertService es subtipo de IAlertService:
interface IAlertService {
  sendAlert(labTest: LabTest): Promise<void>;
}

class EmailAlertService implements IAlertService {
  async sendAlert(labTest: LabTest): Promise<void> {
    // Envia por email
  }
}

class SMSAlertService implements IAlertService {
  async sendAlert(labTest: LabTest): Promise<void> {
    // Envia por SMS
  }
}

// Ambas pueden ser usadas del mismo manera:
const alertService: IAlertService =
  mode === 'email' ? new EmailAlertService() : new SMSAlertService();

await alertService.sendAlert(labTest); // Funciona igual
```

### I — Interface Segregation Principle

**Clientes no deberían depender de interfaces que no usan.**

```typescript
// ❌ MALO: Interface gorda
interface IDataService {
  save(): void;
  findById(): object;
  delete(): void;
  sendEmail(): void;  // Por qué el cliente debería conocer email?
  generateReport(): void;
}

// ✅ BUENO: Interfaces segregadas
interface IPersistence {
  save(): void;
  findById(): object;
  delete(): void;
}

interface INotification {
  sendEmail(): void;
}

interface IReporting {
  generateReport(): void;
}

// Cada cliente solo depende de lo que necesita
class ProcessLabTestUseCase {
  constructor(
    private persistence: IPersistence,
    private notification: INotification  // NO depende de IReporting
  ) {}
}
```

### D — Dependency Inversion Principle

**Depender de abstracciones (interfaces), no de concreciones.**

```typescript
// ❌ MALO: Acoplado a implementación
class ProcessLabTestUseCase {
  private repository = new PostgresLabTestRepository();
  private alertService = new SendgridAlertService();

  async execute(input) {
    // Si cambias BD a MongoDB: cambias THIS CLASS
    // Si cambias email a Twilio: cambias THIS CLASS
  }
}

// ✅ BUENO: Invertimos el control
class ProcessLabTestUseCase {
  constructor(
    private repository: ILabTestRepository,
    private alertService: IAlertService
  ) {}
  // Las dependencias son inyectadas
  // Esta clase es agnóstica a detalles de implementación
}

// Quien crea el use case decide qué implementaciones usar
const useCase = new ProcessLabTestUseCase(
  new PostgresLabTestRepository(),    // O SQLiteRepository
  new SendgridAlertService()          // O TwilioAlertService
);
```

---

## 6. DEPENDENCY INJECTION

### Sin DI (acoplado):

```typescript
class ProcessLabTestUseCase {
  private repository = new PostgresLabTestRepository();
  private alertService = new SendgridAlertService();

  execute(input) { ... }
}

// Problem: hardcoded, no testeable, inflexible
```

### Con DI (desacoplado):

```typescript
class ProcessLabTestUseCase {
  constructor(
    private repository: ILabTestRepository,
    private alertService: IAlertService
  ) {}

  execute(input) { ... }
}

// Uso en producción:
const useCase = new ProcessLabTestUseCase(
  new PostgresLabTestRepository(),
  new SendgridAlertService()
);

// Uso en tests:
const useCase = new ProcessLabTestUseCase(
  new MockLabTestRepository(),
  new MockAlertService()
);
```

### DI Container

Para proyectos grandes, usa un container:

```typescript
import { Container } from 'awilix';

const container = new Container();

// Registrar dependencias
container.register({
  labTestRepository: asClass(PostgresLabTestRepository).singleton(),
  alertService: asClass(SendgridAlertService).singleton(),
  processLabTestUseCase: asClass(ProcessLabTestUseCase).singleton(),
});

// Obtener use case (con todas sus dependencias resueltas)
const useCase = container.resolve('processLabTestUseCase');
await useCase.execute(input);
```

---

## 7. CÓMO APLICAR A CLÍNICA

### Cambio Real: Agregar nuevo tipo de alerta

**Sin Clean Architecture:**
- Modificas ProcessLabTestUseCase
- Modificas LabTest entity
- Modificas tests
- 30 líneas de cambios, 3 horas de testing

**Con Clean Architecture:**
- Creas nuevaAlertService implements IAlertService
- Actualizas DI container para inyectarla
- Tests existentes siguen pasando (gracias a interfaces)
- 10 líneas de cambios, 15 minutos

### Cambio Real: Migrar de PostgreSQL a MongoDB

**Sin Clean Architecture:**
- Cambias todo el código que accede a BD
- 100 cambios en 20 archivos

**Con Clean Architecture:**
- Creas MongoLabTestRepository implements ILabTestRepository
- Actualizas DI container
- TODO lo demás NO CAMBIA
- 50 líneas de código nuevo, nada que cambiar

---

## PRÓXIMO TEMA

La arquitectura está limpia. Ahora: **Performance**.
- ¿Qué tan rápido es?
- ¿Dónde está el cuello de botella?
- ¿Cómo optimizamos?
