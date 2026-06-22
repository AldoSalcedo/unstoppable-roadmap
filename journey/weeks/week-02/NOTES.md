# Week 2 Live Notes — Testing Strategy

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras trabajas con Vitest, RTL, Playwright, y TDD. No tiene que estar pulido.*

---

## Day 1 — Vitest Setup & Unit Testing Fundamentals

**Concepto**: Vitest es un test runner moderno, optimizado para Vite projects. Más rápido que Jest en la mayoría de casos.

```typescript
// Example: Simple unit test with Vitest
import { describe, it, expect } from 'vitest';

const add = (a: number, b: number) => a + b;

describe('Math operations', () => {
  it('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
  });
});
```

**Patrón observado**: Vitest es Drop-in compatible con Jest. Si tienes Jest tests, Vitest corre sin cambios.

**Pregunta que surgió**: ¿Cuándo usas unit tests vs integration tests? Respuesta: Units = funciones aisladas. Integration = múltiples módulos juntos.

---

## Day 2 — React Testing Library & Component Testing

**Concepto**: RTL enfatiza testing como el usuario interactúa, no detalles de implementación.

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

it('should submit form when user clicks button', async () => {
  render(<LoginForm />);

  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole('button', { name: /login/i });

  await userEvent.type(emailInput, 'user@example.com');
  await userEvent.click(submitButton);

  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
```

**Patrón clave**: Query hierarchy: getByRole > getByLabelText > getByPlaceholderText. Nunca getByTestId a menos que sea necesario.

**Insight**: Testing como usuario es más fácil que testing implementation details. Cambia el código, tests siguen pasando.

---

## Day 3 — Test-Driven Development (TDD) Discipline

**Concepto**: Red → Green → Refactor cycle. Escribes test primero, luego código.

```typescript
// RED: Test primero
describe('User registration', () => {
  it('should reject password shorter than 8 chars', () => {
    const result = validatePassword('short');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be 8+ characters');
  });
});

// GREEN: Código mínimo para pasar
const validatePassword = (pwd: string) => ({
  isValid: pwd.length >= 8,
  errors: pwd.length < 8 ? ['Password must be 8+ characters'] : []
});

// REFACTOR: Mejorar sin romper tests
const validatePassword = (pwd: string): ValidationResult => {
  const errors: string[] = [];
  if (pwd.length < 8) errors.push('Password must be 8+ characters');
  if (!/[A-Z]/.test(pwd)) errors.push('Must contain uppercase letter');

  return { isValid: errors.length === 0, errors };
};
```

**Pregunta que surgió**: ¿Escribo tests para todo? No. Tests para lógica crítica, casos edge, y comportamiento público.

---

## Day 4 — Playwright & E2E Testing

**Concepto**: Playwright permite automatizar navegadores reales. Tests end-to-end en entornos de verdad.

```typescript
import { test, expect } from '@playwright/test';

test('complete checkout flow', async ({ page }) => {
  await page.goto('https://shop.example.com');

  // Add product to cart
  await page.click('[data-testid="add-to-cart"]');

  // Navigate to checkout
  await page.click('text=Checkout');

  // Fill shipping form
  await page.fill('[name="address"]', '123 Main St');

  // Verify order confirmation
  await expect(page).toHaveURL(/order-confirmation/);
  await expect(page.locator('text=Order confirmed')).toBeVisible();
});
```

**Patrón observado**: Playwright es más rápido que Cypress y soporta múltiples navegadores (Chrome, Firefox, Safari).

**Insight**: E2E tests son lentos pero valiosos. Usa juiciosamente para happy paths críticos.

---

## Day 5 — Coverage, Mocking, & Test Organization

**Concepto**: Coverage reporta qué porcentaje del código está siendo ejecutado en tests.

```typescript
// Mockear dependencias externas
import { describe, it, expect, vi } from 'vitest';
import { UserService } from './UserService';

describe('UserService', () => {
  it('should fetch user from API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => ({ id: 1, name: 'John' })
    });

    global.fetch = mockFetch;
    const user = await UserService.getUser(1);

    expect(mockFetch).toHaveBeenCalledWith('/api/users/1');
    expect(user.name).toBe('John');
  });
});
```

**Patrón**: Mock externas (APIs, databases). Test el tuyo.

**Pregunta**: ¿100% coverage? No necesariamente. 70-80% es realista + valioso.

---

## Patrones descubiertos

**Pattern 1: Test Isolation**
Cada test debe ser independiente. Usa beforeEach para setup común.

**Pattern 2: Assertion Clarity**
`expect(x).toBe(y)` es más claro que custom assertions. Usa mensajes descriptivos.

**Pattern 3: Async Handling**
RTL y Playwright requieren async/await. Nunca ignores Promises.

---

## Conexión con background

**De Auditoría**: Testing es como auditoría de código. Verificas que el código hace lo que promete. TDD = control preventivo.

**De QBP**: Coverage = data completeness. Si falta cobertura, es como dejar campos en blanco en reportes.

**De Ventas**: Quality = customer satisfaction. Menos bugs = clientes felices.

---

## Notas Adicionales

- Vitest >= Jest en velocidad, compatible API
- RTL queries: siempre prefer role queries
- TDD no es para todo (UI prototypes), pero crítico para lógica
- Playwright mejor que Cypress para cross-browser testing

---

**Última entrada**: 2026-04-09
**Próxima sesión**: 2026-04-10
