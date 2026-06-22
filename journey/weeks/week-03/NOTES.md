# Week 3 Live Notes — Clean Architecture & Domain-Driven Design

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras implementas DDD, repositories, y use cases. No tiene que estar pulido.*

---

## Day 1 — Domain-Driven Design Fundamentals

**Concepto**: DDD organiza código alrededor de problemas del negocio (dominios), no tecnología.

```typescript
// BAD: Technology-first
// src/database/users.ts
// src/api/controllers/users.ts
// src/utils/validation.ts

// GOOD: Domain-first (DDD)
// src/domains/user/User.ts (Entity)
// src/domains/user/UserRepository.ts (Interface)
// src/domains/user/CreateUserUseCase.ts (Use case)
// src/domains/user/UserValidation.ts (Validation)
```

**Patrón observado**: Agrupa por dominio, no por técnica. "User" es un dominio, no una tabla.

**Pregunta que surgió**: ¿Cuántos dominios tengo? Respuesta: Tantos como problemas de negocio distintos tengas.

---

## Day 2 — Entities & Value Objects

**Concepto**: Entities tienen identidad única. Value Objects son iguales si sus valores son iguales.

```typescript
// Entity: tiene ID
class User {
  id: UserId;
  email: Email;
  password: Password;

  constructor(id: UserId, email: Email, password: Password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }

  isEmailVerified(): boolean {
    return this.email.isVerified;
  }
}

// Value Object: sin ID, inmutable
class Email {
  value: string;

  constructor(value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email');
    }
    this.value = value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

**Patrón**: Entities contienen Value Objects. Value Objects contienen validaciones.

---

## Day 3 — Repositories & Data Access Abstraction

**Concepto**: Repository abstrae la persistencia. El dominio no sabe si guardas en SQL o NoSQL.

```typescript
// Abstract interface (dominio no ve implementación)
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}

// Prisma implementation (detalles técnicos)
class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id.value },
      update: { email: user.email.value },
      create: { id: user.id.value, email: user.email.value }
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id: id.value }
    });
    return data ? new User(new UserId(data.id), new Email(data.email), ...) : null;
  }
}
```

**Insight**: Cambias de Prisma a MongoDB sin tocar código del dominio.

---

## Day 4 — Use Cases & Application Services

**Concepto**: Use Case encapsula una acción del usuario. Coordina Entity, Repository, Domain Services.

```typescript
// Application service (orquesta flujo de negocio)
class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(email: string, password: string): Promise<{ userId: string }> {
    // 1. Validación (crea Value Objects)
    const userEmail = new Email(email);
    const userPassword = new Password(password);

    // 2. Lógica de negocio (¿ya existe?)
    const existing = await this.userRepository.findByEmail(userEmail);
    if (existing) {
      throw new UserAlreadyExistsError(email);
    }

    // 3. Crea Entity
    const user = new User(
      UserId.generate(),
      userEmail,
      userPassword
    );

    // 4. Persiste
    await this.userRepository.save(user);

    // 5. Side effects (envía email)
    await this.emailService.sendWelcome(user.email);

    return { userId: user.id.value };
  }
}
```

**Patrón**: Use Case = una acción en la UI. Coordinador de colaboradores.

---

## Day 5 — Dependency Injection & Testing Benefits

**Concepto**: Inyecta dependencias en vez de crearlas. Permite testing sin mocks complejos.

```typescript
// Avec DI: fácil de testear
class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private paymentService: PaymentService
  ) {}
}

// Test: inyecta mocks
const mockRepo = { save: vi.fn() };
const mockPayment = { charge: vi.fn() };
const useCase = new CreateOrderUseCase(mockRepo, mockPayment);

// Sin DI: acoplado, difícil de testear
class CreateOrderUseCase {
  orderRepository = new PrismaOrderRepository(); // ← hardcoded
  paymentService = new StripePaymentService();   // ← hardcoded
}
```

**Insight**: DDD + DI = testeable automáticamente.

---

## Patrones descubiertos

**Pattern 1: Aggregate Root**
Un Entity es "aggregate root" si contiene otras entities. Accedes a nested entities a través del root.

**Pattern 2: Value Object Equality**
Dos Value Objects son iguales si tienen los mismos valores, no si son la misma instancia.

**Pattern 3: Repository Interface Segregation**
No expongas todos los métodos. Inyecta solo lo que necesita el use case.

---

## Conexión con background

**De Auditoría**: DDD es como diseñar estructura organizacional. Dominios = departamentos. Aggregate roots = jefes de departamento. Repository = central de archivos.

**De QBP**: Use cases = procesos de negocio documentados. El código es la documentación.

**De Ventas**: Hablas con clientes en su lenguaje de negocio. DDD código habla el mismo lenguaje.

---

## Notas Adicionales

- DDD es overhead si proyecto es pequeño. Usa para sistemas medianos+.
- Entities con lógica (métodos), no anemic models.
- Repositories abstraen, no reemplazan, ORM. Úsalas como interfaz.

---

**Última entrada**: 2026-04-16
**Próxima sesión**: 2026-04-17
