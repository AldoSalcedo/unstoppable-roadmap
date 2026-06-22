# AGENTS.md

## Project Overview

This is an **advanced TypeScript learning project** — a task management system (similar to Jira/Linear) built as a week-long intensive sprint. It has **zero runtime dependencies**; it exists purely to teach and demonstrate advanced TypeScript patterns. The codebase is written in Spanish comments/docs but code identifiers are in English.

## Tech Stack

- **TypeScript** ^5.3.0 with **all strict flags enabled**
- **Node.js** with ES2022 modules (`NodeNext` module resolution)
- **ESLint** with `@typescript-eslint` (strict rules, no `any` allowed)
- **Prettier** for formatting
- **TSD** for type-level testing
- **type-coverage** for annotation coverage (goal: >95%)

## Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Compile TypeScript (`tsc`) |
| `npm run dev` | Watch mode (`tsc --watch`) |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run tests (`node --test`) |
| `npm run test:types` | Run type tests (`tsd`) |
| `npm run type-coverage` | Check type coverage (>95%) |

## Project Structure

```
src/
├── types/
│   ├── base.ts            # Fundamental types: Result<T,E>, Entity<T>, Maybe<T>, AsyncResult
│   ├── entities.ts         # Domain models: User, Task, Comment, Notification, Project
│   ├── utilities.ts        # Custom utility types: DeepPartial, DeepReadonly, DTOs, Permissions
│   └── branded.ts          # Branded types, template literals, conditional types
├── repositories/
│   └── base.ts             # Generic Repository<T> interface + InMemoryRepository<T>
├── builders/
│   └── query.ts            # Type-safe QueryBuilder<T> with fluent API
├── guards/
│   └── type-guards.ts      # Type guards, assertion functions, exhaustive checks
├── api/
│   ├── handlers.ts         # Type-safe API handlers with RequestContext
│   └── middleware.ts        # Middleware chain, validation schemas, rate limiting
├── plugins/
│   └── system.ts           # Plugin registry, lifecycle hooks, PluginBuilder
└── index.ts
tests/
└── types.test-d.ts          # TSD type-level tests
```

## Architecture

The project follows a **layered architecture**:

1. **Domain Layer** (`types/`) — entities, value objects, type system foundations
2. **Data Access Layer** (`repositories/`) — generic Repository pattern with in-memory storage
3. **Business Logic Layer** (`builders/`, `guards/`, `plugins/`) — query building, type narrowing, extensibility
4. **Presentation Layer** (`api/`) — handlers, middleware, routing types

## Code Conventions

### Naming

- **Types/Interfaces**: PascalCase (`User`, `Result<T, E>`, `TaskStatus`)
- **Enums**: PascalCase with PascalCase members (`UserRole.ADMIN`)
- **Functions**: camelCase (`mapResult`, `createUser`)
- **Type predicates**: camelCase with `is` prefix (`isString`, `isTaskComplete`)
- **Assertion functions**: camelCase with `assert` prefix (`assertDefined`, `assertValidTask`)
- **Generic parameters**: single letter or `T`-prefixed (`T`, `TBody`, `TParams`)
- **Private fields**: underscore prefix (`_filters`, `_metadata`)
- **Factory helpers**: PascalCase (`Ok()`, `Err()`, `Some()`, `None()`)

### Patterns in Use

- **Result type** for error handling (no throwing exceptions) — `Result<T, E>`
- **Discriminated unions** for variants (`TaskStatus`, `NotificationType`, `ApiResponse`)
- **Builder pattern** with fluent APIs returning `this` (`QueryBuilder`, `PluginBuilder`)
- **Repository pattern** with generic constraints (`Repository<T extends Entity<unknown>>`)
- **Branded types** for nominal typing (`UserId`, `TaskId`, `EmailAddress`)
- **Template literal types** for type-safe strings (`EventName`, `Route`, `Permission`)
- **Middleware chain** with composition pattern

### Style Rules

- Semicolons: **yes**
- Quotes: **single quotes**
- Trailing commas: **ES5 style**
- Print width: **80 characters**
- Indentation: **2 spaces** (no tabs)
- Arrow parens: **avoid** when possible (`x => x` not `(x) => x`)
- Prefer `const` over `let`; never use `var`
- Explicit return types on all functions (enforced by ESLint)
- No `any` — use `unknown` with type guards instead
- No non-null assertions (`!`) — use assertion functions or guards

## Key Types to Know

```typescript
// Error handling — use these instead of try/catch
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Entity wrapper — all domain objects extend this
type Entity<T> = T & { id: string; createdAt: Date; updatedAt: Date };

// Optional values
type Maybe<T> = { type: 'some'; value: T } | { type: 'none' };
```

## Important Constraints

- **No `any`** — this is enforced by ESLint and is a core learning objective
- **Strict mode is mandatory** — all strict compiler flags are enabled in tsconfig.json
- **No runtime dependencies** — this is a type-system learning project
- **Result types over exceptions** — use `Result<T, E>` pattern for error handling
- **Type guards over type assertions** — narrow with `is` predicates, not `as` casts
- **`noUnusedLocals` and `noUnusedParameters` are intentionally disabled** — some files contain exercise stubs with incomplete code
- **`exactOptionalPropertyTypes` is enabled** — optional properties cannot be set to `undefined` explicitly
- **`noUncheckedIndexedAccess` is enabled** — index access returns `T | undefined`

## Exercise Sections

Many files contain `// EJERCICIO` (exercise) sections with TODO comments. These are intentional learning exercises for the project author. When modifying these files:

- Do not complete exercises unless explicitly asked
- Preserve exercise comments and hints
- Keep the pedagogical structure intact

## File Documentation Style

Each source file follows this structure:

1. Header comment with day number and topic
2. Imports
3. Type definitions
4. Implementations
5. Exercise sections (marked with `EJERCICIO`)
6. Learning notes at the end (detailed explanations in Spanish)
