# AGENTS.md — Project Overview for AI Assistants
## Week 02: Testing Frameworks Integration

**Context**: This week focuses on building comprehensive testing infrastructure for a clinical healthcare application. Aldo has a QBP (clinical biology) background, auditing experience, and sales/UX knowledge. The goal is to prepare him for senior-level positions with $70k USD+.

---

## PROJECT SCOPE

### Technology Stack
- **Vitest** — Unit/Integration testing framework (faster than Jest)
- **React Testing Library (RTL)** — Testing React components from user perspective
- **Playwright** — End-to-end browser automation testing
- **Mock Service Worker (MSW)** — API request mocking
- **TypeScript** — Type-safe tests

### Project Structure
```
week-02-testing/
├── src/
│   ├── unit/
│   │   ├── task-validator.test.ts          ← Unit tests for lab result validator
│   │   └── ... (more unit tests)
│   ├── integration/
│   │   ├── api.test.ts                     ← RTL + MSW integration tests
│   │   └── ... (more integration tests)
│   └── e2e/
│       ├── clinical-workflow.spec.ts       ← Playwright E2E tests
│       └── ... (more E2E tests)
├── questionaries/
│   └── QUESTIONS.md                        ← 7-day question guide
├── sprint-week2.md                         ← Detailed daily plan
├── GUIA-CONCEPTOS.md                       ← Pedagogical guide (Spanish)
├── RECURSOS.md                             ← Curated resource list
└── package.json                            ← Dependencies & scripts
```

### Key Commands
```bash
# Run all tests in watch mode (development)
pnpm test

# Run tests once (CI/CD)
pnpm test:run

# Generate coverage report
pnpm test:coverage

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Run only E2E tests
pnpm test:e2e

# Run specific test file
pnpm test src/unit/task-validator.test.ts

# Interactive UI for test debugging
pnpm test:ui
```

### Package Dependencies
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@playwright/test": "^1.40.0",
    "msw": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## PEDAGOGICAL GUIDELINES

### File Comment Style
Every source file (.ts/.tsx) follows this structure:

1. **Header Comment**
   ```typescript
   /** filename.ts — Topic Name
    * DÍA X: Topic Name — Subtitle
    */
   ```

2. **Section Dividers**
   ```typescript
   // ============================================================================
   // TAREA X.Y: TASK NAME
   // ============================================================================
   ```

3. **Exercise Blocks** (with hints)
   ```typescript
   /** EJERCICIO N: Description of what to implement
    * Pista: Hint about how to approach this
    */
   // TODO: Implementar
   ```

4. **Learning Notes Section** (at end of file)
   ```typescript
   // ============================================================================
   // NOTAS DE APRENDIZAJE
   // ============================================================================
   // Key concepts explained in Spanish
   ```

### Language Rules
- **Code identifiers** (variable/function names, class names): **English**
- **Comments and explanations**: **Spanish**
- **All pedagogical content**: **Spanish**

### Domain Context (Healthcare)
Every test should have a healthcare angle:
- Lab result validation
- Patient data consistency
- Doctor workflow efficiency
- Compliance with medical standards

### Connection to Aldo's Background
Each week includes sections for:
- **QBP (Biology)**: How clinical knowledge applies
- **Auditoría (Auditing)**: How testing maps to audit trails
- **Ventas/UX (Sales/UX)**: How this sells the product

---

## FILES TO CREATE / MODIFY

### 1. UNIT TEST FILE: `src/unit/task-validator.test.ts`
**Purpose**: Unit tests for a lab result validator function.

**Content Requirements**:
- 5+ test cases covering happy path + error paths
- Exercise sections with `TODO` markers
- Coverage: validation logic, boundary conditions, edge cases
- Tests DS&A: two-pointer pattern for range checking
- Healthcare: lab result ranges (normal, abnormal, critical)

**Example Structure**:
```typescript
/** task-validator.test.ts — Validación de Resultados de Lab
 * DÍA 1: Testeo Unitario con Vitest
 */

import { describe, it, expect } from 'vitest';
import { validateLabResult, LabResult, NormalRange } from './validator';

// ============================================================================
// TAREA 1.1: VALIDACIÓN BÁSICA
// ============================================================================

describe('validateLabResult', () => {
  it('debería retornar true para valores dentro de rango', () => {
    // ...
  });

  it('debería retornar false para valores fuera de rango', () => {
    // ...
  });

  /** EJERCICIO 1: Implementa un test para valores críticos
   * Pista: Un valor crítico es < min - 10% o > max + 10%
   */
  // TODO: Implementar
});

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================
```

### 2. INTEGRATION TEST FILE: `src/integration/api.test.ts`
**Purpose**: Test React components + MSW API mocking.

**Content Requirements**:
- Test a component that fetches lab results
- Use MSW to mock API endpoints
- Test loading, success, error states
- Exercise: implement error boundary tests
- Healthcare: patient dashboard showing results

### 3. E2E TEST FILE: `src/e2e/clinical-workflow.spec.ts`
**Purpose**: Playwright tests for full clinical workflows.

**Content Requirements**:
- Test complete user flow (login → view results → take action)
- Doctor logs in, searches patient, views lab results, marks for follow-up
- Exercise: implement assertion for result consistency
- Healthcare: realistic doctor workflow

### 4. QUESTIONS FILE: `questionaries/QUESTIONS.md`
**Purpose**: Daily reflection questions to deepen learning.

**Structure**:
```markdown
# QUESTIONS — Week 02 Testing

## DÍA 1: Testing Fundamentals
1. ¿Cuál es la razón principal de tener 70% unit tests vs 10% E2E?
2. ...

## DÍA 2: React Testing Library
1. ¿Qué diferencia hay entre `getByRole` y `getByTestId`?
2. ...
```

### 5. PACKAGE.JSON
**Purpose**: NPM/PNPM scripts for running tests.

**Scripts**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest --run",
    "test:coverage": "vitest --coverage",
    "test:unit": "vitest src/unit/",
    "test:integration": "vitest src/integration/",
    "test:e2e": "playwright test",
    "test:ui": "vitest --ui"
  }
}
```

---

## WHAT NOT TO DO

### Do NOT
1. **Complete exercises for Aldo** — Leave `// TODO: Implementar` sections
2. **Write overly simple tests** — Tests should be educational and realistic
3. **Skip healthcare context** — Every test should relate to clinical scenarios
4. **Ignore comments** — Comments are teaching moments, not clutter
5. **Use only English** — Comments must be Spanish (per the convention)
6. **Create overly complex tests** — Keep individual tests focused and clear
7. **Mock everything** — Mix mocked + real dependencies appropriately
8. **Skip NOTAS DE APRENDIZAJE section** — Learning notes are crucial for understanding

### Do NOT mess with structure
- Don't remove the pedagogical comment style
- Don't flatten the directory structure
- Don't change language conventions (EN for code, ES for comments)

---

## DO's

1. **Follow the pedagogical style** — Be generous with explanations
2. **Include healthcare examples** — Lab results, patient workflows, doctor actions
3. **Create realistic tests** — Not toy examples, but realistic clinical scenarios
4. **Integrate DS&A** — Two-pointer, sliding window patterns in test scenarios
5. **Provide hints** — Each EJERCICIO must have a `Pista: ...` comment
6. **Reference connections** — Link back to QBP, Auditoría, Sales/UX
7. **Make tests pass initially** — The scaffolds should pass (so learning can begin)
8. **Document assumptions** — Comments should explain WHY tests are written a certain way

---

## LEARNING OUTCOMES (Week 02)

By the end of this week, Aldo should:

1. **Understand the testing pyramid** and when to use each type
2. **Write unit tests** with Vitest for business logic
3. **Mock APIs** with MSW for integration tests
4. **Test React components** with React Testing Library
5. **Automate workflows** with Playwright E2E tests
6. **Measure coverage** and understand what it means
7. **Integrate testing into CI/CD** for automated quality gates
8. **Think like a senior engineer** about test strategy

---

## SUCCESS CRITERIA

✅ All unit tests pass
✅ All integration tests pass
✅ All E2E tests pass
✅ Coverage >= 80%
✅ Comments clearly explain concepts in Spanish
✅ Exercises are appropriately challenging (not too easy, not impossible)
✅ Healthcare angle is integrated naturally
✅ DS&A patterns are demonstrated in tests

---

## NOTES FOR AGENTS

### If you're asked to "help Aldo with week 02":
1. **DON'T complete the exercises** — Ask guiding questions instead
2. **DO explain concepts** — Use the GUIA-CONCEPTOS.md as reference
3. **DO review code** — Aldo's code should follow the style guide
4. **DO suggest improvements** — Coverage gaps, missing edge cases
5. **DO connect to his background** — "Remember your lab work at the clinic..."

### If creating new tests:
- Use the pedagogical template
- Include healthcare scenarios
- Add `EJERCICIO` sections with hints
- End with `NOTAS DE APRENDIZAJE`
- Ensure tests are passing (but can be enhanced)

### If Aldo is stuck:
- Direct him to RECURSOS.md for the relevant day
- Ask "What's the user trying to do?"
- Remind him: tests describe behavior, not implementation
- Use his clinical background: "What would a lab technician do?"

---

## INTEGRATION WITH MASTER PLAN

- **Aldo's Goal**: $70k USD+ remote / 100k+ MXN/month
- **Required skills**: Testing, architecture, performance, deployment
- **This week**: Testing fundamentals (foundation for senior roles)
- **Next week**: Clean Architecture (how to structure code for testability)
- **Final weeks**: Systems design, portfolio, interview prep

Testing is non-negotiable for senior positions. This week builds that muscle.

---

## QUICK REFERENCE

| Command | Purpose |
|---------|---------|
| `pnpm test` | Watch mode development |
| `pnpm test:run` | CI/CD (single run) |
| `pnpm test:coverage` | Check coverage % |
| `pnpm test:e2e` | Playwright E2E tests |

| Component | Technology |
|-----------|-----------|
| Unit tests | Vitest |
| Integration | RTL + MSW |
| E2E | Playwright |
| Mocking | MSW, Vitest |
| Coverage | Vitest coverage |

---

**Updated**: April 2026
**For**: Aldo Salcedo | QBP + Auditing + Sales/UX Background
**Goal**: Senior-level testing expertise
