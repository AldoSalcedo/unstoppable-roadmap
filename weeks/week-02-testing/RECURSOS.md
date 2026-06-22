# RECURSOS — Testing Frameworks & Tools
## Week 02: Curated Resources by Day

---

## DÍA 1: Vitest + Unit Testing Setup

### Official Documentation
- **[Vitest Guide](https://vitest.dev/guide/)** — Start here. Covers setup, CLI, configuration.
- **[Vitest API Reference](https://vitest.dev/api/)** — `describe`, `it`, `expect`, `beforeEach`, `afterEach`.

### Key Reading
- **[Testing Pyramid (Martin Fowler)](https://martinfowler.com/articles/practical-test-pyramid.html)**
  - Why 70% unit, 20% integration, 10% E2E makes sense
  - Trade-offs in testing strategy

- **[Jest vs Vitest (2024 Comparison)](https://github.com/vitest-dev/vitest)**
  - Why Vitest is faster (Vite-native)
  - ES Modules support out of the box

### Tutorials
- **[Vitest Getting Started](https://vitest.dev/guide/getting-started.html)**
  - 5-minute setup guide
  - First test walkthrough

### Tools
- **Vitest CLI**
  ```bash
  # Run tests in watch mode (ideal for development)
  pnpm vitest

  # Run once
  pnpm vitest --run

  # Coverage report
  pnpm vitest --coverage
  ```

### Video (Optional)
- YouTube: "Vitest Crash Course" by WebDevSimplified (15 min)

---

## DÍA 2: React Testing Library (RTL) + Integration Testing

### Official Documentation
- **[React Testing Library Intro](https://testing-library.com/docs/react-testing-library/intro)**
  - Core philosophy: "Test behavior, not implementation"
  - Query priority: `getByRole` > `getByLabelText` > `getByPlaceholderText`

- **[RTL Queries Reference](https://testing-library.com/docs/queries/about)**
  - Which query to use when
  - Accessibility-first approach

- **[RTL Best Practices](https://testing-library.com/docs/queries/priority)**

### Mock Service Worker (MSW)
- **[MSW Official Docs](https://mswjs.io/)**
- **[MSW Setup Guide](https://mswjs.io/docs/getting-started)**
  - How to intercept HTTP requests in tests
  - Server setup for Node.js tests

- **[MSW Handlers](https://mswjs.io/docs/basics/request-handler)**
  - `rest.get()`, `rest.post()`, `rest.put()`, `rest.delete()`
  - Response mocking patterns

### Tutorials
- **[React Testing Library Tutorial](https://testing-library.com/docs/react-testing-library/example-intro)**
  - Step-by-step example
  - Common queries with explanations

- **[Testing Components with RTL & Vitest](https://vitest.dev/guide/features.html#dom-environment)**

### Code Examples
```typescript
// Example: Test a component that fetches data
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/patients', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', name: 'John Doe', lastTest: '2024-04-02' }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays patient list', async () => {
  render(<PatientList />);

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Tools
```bash
# Install MSW
pnpm add -D msw

# Generate types for better DX
pnpm msw init
```

---

## DÍA 3: Playwright E2E Testing

### Official Documentation
- **[Playwright Documentation](https://playwright.dev/docs/intro)**
  - Multi-browser support (Chromium, Firefox, WebKit)
  - Installation and setup

- **[Playwright Test Guide](https://playwright.dev/docs/writing-tests)**
  - `test()`, `expect()`, assertions
  - Page navigation and interaction

- **[Playwright Selectors](https://playwright.dev/docs/locators)**
  - CSS selectors, text matching, accessibility
  - Best practices for robust selectors

- **[Playwright API Reference](https://playwright.dev/docs/api/class-playwright)**
  - Methods: `page.goto()`, `page.fill()`, `page.click()`, `page.waitFor()`

### Tutorials
- **[Playwright Getting Started](https://playwright.dev/docs/intro)**
  - Installation in 2 minutes
  - First test example

- **[Playwright Best Practices](https://playwright.dev/docs/best-practices)**
  - How to write robust, maintainable tests
  - Avoiding flaky tests

### Code Example
```typescript
import { test, expect } from '@playwright/test';

test('complete patient workflow', async ({ page }) => {
  // Navigate
  await page.goto('https://app.example.com/login');

  // Fill form
  await page.fill('input[type="email"]', 'doctor@hospital.com');
  await page.fill('input[type="password"]', 'password123');

  // Click and wait for navigation
  await page.click('button:has-text("Login")');
  await page.waitForNavigation();

  // Verify page content
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

### Tools
```bash
# Install Playwright
pnpm add -D @playwright/test

# Run tests with UI
pnpm playwright test --ui

# Record tests (interactive)
pnpm playwright codegen https://app.example.com
```

### Videos
- YouTube: "Playwright Testing Tutorial" by Edureka (20 min)

---

## DÍA 4: Advanced Mocking & Vitest Features

### Official Documentation
- **[Vitest Mocking](https://vitest.dev/guide/mocking.html)**
  - `vi.fn()`, `vi.spyOn()`, `vi.mock()`
  - Mock implementation, return values

- **[Vitest Mocking Examples](https://vitest.dev/guide/mocking.html#functions)**

### Mock Patterns
```typescript
import { vi, describe, it, expect } from 'vitest';

// 1. Mock a function
const mockFn = vi.fn();
mockFn('test');
expect(mockFn).toHaveBeenCalledWith('test');

// 2. Mock with return value
const mockDB = vi.fn(() => ({ id: '1', name: 'John' }));
const result = mockDB();
expect(result.name).toBe('John');

// 3. Spy on real function
const consoleSpy = vi.spyOn(console, 'log');
console.log('test');
expect(consoleSpy).toHaveBeenCalledWith('test');

// 4. Restore after test
consoleSpy.mockRestore();
```

### Module Mocking
- **[Vitest Mock Modules](https://vitest.dev/guide/mocking.html#modules)**
  - Mock entire modules: `vi.mock('./path')`
  - Mock specific functions within modules

### Testing Async Code
- **[Vitest Async Testing](https://vitest.dev/guide/features.html#async)**
  - `async/await` in tests
  - Promise resolution

### Tutorials
- **[Testing with Mocks (Testing Library)](https://testing-library.com/docs/dom-testing-library/setup)**

---

## DÍA 5: Coverage & CI/CD Integration

### Coverage Configuration
- **[Vitest Coverage](https://vitest.dev/guide/coverage.html)**
  - Coverage providers: `v8`, `istanbul`, `c8`
  - Configuration in `vitest.config.ts`

### Configuration Example
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist'],
    },
  },
});
```

### CI/CD Tools
- **[GitHub Actions with Vitest](https://vitest.dev/guide/ci.html#github-actions)**
  - Sample workflow
  - Parallel testing

- **[GitHub Actions Starter](https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml)**

### Sample GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm vitest --coverage
      - uses: codecov/codecov-action@v3
```

### Tools
- **[Codecov](https://codecov.io/)** — Track coverage over time
- **[Coveralls.io](https://coveralls.io/)** — Alternative coverage tool

### Reading
- **[The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html#ContinuousIntegration)**
  - Why CI/CD matters for testing

---

## DÍA 6: Performance Testing & Benchmarking

### Vitest Benchmarking
- **[Vitest Bench](https://vitest.dev/guide/features.html#benchmarking)**
  - Built-in `bench()` API
  - Compare performance across versions

### Benchmark Example
```typescript
import { bench, describe } from 'vitest';
import { validateLabResult } from './validator';

describe('performance', () => {
  bench('validate 1000 lab results', () => {
    const results = Array.from({ length: 1000 }, (_, i) => ({
      value: 100 + i,
      range: [0, 150],
    }));
    results.forEach(validateLabResult);
  });
});
```

### React Performance Testing
- **[React DevTools Profiler](https://react.dev/learn/react-dev-tools)**
  - Measure render times
  - Identify expensive re-renders

- **[Web Vitals](https://web.dev/vitals/)**
  - Performance metrics that matter
  - LCP, FID, CLS

### Tools
- **[Lighthouse](https://developers.google.com/web/tools/lighthouse)** — Performance audits
- **[Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)** — See what's in your bundle

---

## DÍA 7: Integration & Project Setup

### Full Testing Setup Checklist
- [ ] Vitest configured in `vitest.config.ts`
- [ ] React Testing Library installed
- [ ] Playwright installed and configured
- [ ] MSW setup for API mocking
- [ ] Coverage configured (80%+ target)
- [ ] CI/CD workflow created
- [ ] Git hooks for pre-commit testing (optional but recommended)

### Pre-commit Hooks (Optional)
- **[Husky](https://typicode.github.io/husky/)** — Run tests before commit
  ```bash
  pnpm add -D husky
  npx husky install
  npx husky add .husky/pre-commit "pnpm test"
  ```

### Best Practices Summary
1. **Unit tests** for business logic
2. **Integration tests** for component + API interaction
3. **E2E tests** for critical user workflows only
4. **Coverage** >= 80% across the board
5. **CI/CD** runs all tests on every push

### Documentation
- **[Testing Best Practices (Vitest)](https://vitest.dev/guide/best-practices.html)**
- **[Testing Best Practices (RTL)](https://testing-library.com/docs/queries/about#priority)**

---

## EXTRA: Recommended Books & Articles

### Books
1. **"Test Driven Development: By Example"** — Kent Beck (Classic)
2. **"The Pragmatic Programmer"** — Hunt & Thomas (Ch. Testing)
3. **"Clean Code"** — Robert Martin (Ch. Testing)

### Articles
- **[Why Most Unit Testing is Waste](https://rbcs-us.com/documents/Why-Most-Unit-Testing-is-Waste.pdf)** — James O Coplien (controversial but thought-provoking)
- **[Test Naming Conventions](https://testingjavascript.com/blog/test-naming-conventions)** — Kent C. Dodds

### Online Courses
- **[Testing JavaScript](https://testingjavascript.com/)** — Kent C. Dodds (Comprehensive)
- **[Test Automation University](https://testautomationu.applitools.com/)** — Free courses by Applitools

---

## QUICK REFERENCE

### Command Cheat Sheet

```bash
# Vitest
pnpm vitest                    # Watch mode
pnpm vitest --run              # Single run
pnpm vitest --coverage         # With coverage
pnpm vitest src/unit/          # Only unit tests
pnpm vitest --reporter=verbose # Detailed output

# Playwright
pnpm playwright test           # Run all tests
pnpm playwright test --ui      # Interactive UI
pnpm playwright codegen        # Record test

# Coverage Analysis
open coverage/index.html       # Open coverage report
```

### Key Imports

```typescript
// Vitest
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// React Testing Library
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// MSW
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Playwright
import { test, expect } from '@playwright/test';
```

---

**Next Week**: Clean Architecture with Testing integrated into domain layer testing.
