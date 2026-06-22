# AGENTS.md — Week 3: Clean Architecture

## Context

This week builds the structural foundation for the clinical SaaS: a Domain-Driven Design (DDD) layered architecture with strict separation of concerns. Every week after this builds on this layer cake.

## Architecture Layers

```
Presentation Layer  → components, API routes, Server Actions
Application Layer   → use cases, DTOs, orchestration
Domain Layer        → entities, value objects, repositories (interfaces)
Infrastructure Layer → Prisma, external APIs, file storage
```

**Rule**: Dependencies only point inward. Infra → App → Domain. Never outward.

## Key Files

- `sprint-week3.md` — day-by-day instructions with code examples
- `GUIA-CONCEPTOS.md` — conceptual reference with ASCII diagrams
- `src/` — implementation code organized by layer

## When Working Here

- **Domain entities** must have no framework dependencies (no Prisma, no Next.js)
- **Repository interfaces** live in domain; **implementations** live in infrastructure
- **Use cases** are the single source of business logic — no logic in components
- **DTOs** (Data Transfer Objects) are the boundary between layers
- Never import from outer layers into inner layers

## Healthcare Context

The clinical task manager models:
- `Patient` — domain entity (name, MRN, date of birth, allergies)
- `LabResult` — value object (value, unit, normalRange, status)
- `TaskRepository` — interface (findById, save, findByPatient)
- `CreateTaskUseCase` — application service (validate + persist)

## Useful Patterns

```typescript
// Repository pattern (domain interface)
export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByMRN(mrn: string): Promise<Patient | null>;
  save(patient: Patient): Promise<void>;
}

// Use case (application layer)
export class CreateLabResultUseCase {
  constructor(
    private patientRepo: PatientRepository,
    private labRepo: LabResultRepository,
  ) {}

  async execute(dto: CreateLabResultDTO): Promise<LabResult> {
    const patient = await this.patientRepo.findById(dto.patientId);
    if (!patient) throw new PatientNotFoundError(dto.patientId);
    // ... business logic
  }
}
```

## Commands

```bash
# Run tests
npm test

# Type check
npx tsc --noEmit

# Check for circular dependencies
npx madge --circular src/
```
