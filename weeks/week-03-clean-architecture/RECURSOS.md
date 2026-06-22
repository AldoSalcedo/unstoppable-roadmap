# RECURSOS — Week 3: Clean Architecture

## Clean Architecture & DDD

- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design (DDD) — Eric Evans (book)](https://domainlanguage.com/ddd/)
- [DDD Reference](https://www.domainlanguage.com/ddd/reference/)
- [Implementing DDD — Vaughn Vernon](https://vaughnvernon.com/?page_id=168)

## SOLID Principles

- [SOLID Principles — Digital Ocean](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [SOLID in TypeScript — refactoring.guru](https://refactoring.guru/design-patterns/typescript)
- [Open/Closed Principle with TypeScript](https://khalilstemmler.com/articles/solid-principles/solid-typescript/)

## TypeScript Patterns

- [Khalil Stemmler — DDD in TypeScript](https://khalilstemmler.com/articles/categories/domain-driven-design/)
- [Repository Pattern in TypeScript](https://khalilstemmler.com/articles/typescript-domain-driven-design/repository-dto-mapper/)
- [Value Objects in TypeScript](https://khalilstemmler.com/articles/typescript-domain-driven-design/value-objects/)

## Dependency Injection

- [Dependency Injection in TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [InversifyJS — IoC container](https://inversify.io/)
- [Manual DI (without decorators)](https://khalilstemmler.com/articles/software-design-architecture/dependency-injection-inversion-explained/)

## Testing Clean Architecture

- [Testing Use Cases](https://khalilstemmler.com/articles/test-driven-development/how-to-test-code-coupled-to-a-database/)
- [Unit Testing Domain Objects](https://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html)
- [Vitest docs](https://vitest.dev)

## Healthcare Domain Reference

- [HL7 FHIR — Patient Resource](https://hl7.org/fhir/patient.html)
- [HIPAA Minimum Necessary Standard](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/minimum-necessary-requirement/index.html)
- [Clinical Data Modeling](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5070521/)

## Quick Reference

```typescript
// Layer import rules (strict):
// ✅ Infrastructure imports Application
// ✅ Application imports Domain
// ❌ Domain NEVER imports Application or Infrastructure
// ❌ Application NEVER imports Infrastructure (only interfaces)

// Circular dependency check:
// npx madge --circular --extensions ts src/
```
