# GUÍA DE CONCEPTOS — Testing en TypeScript
## Semana 02: Unit, Integration, E2E | Vitest, RTL, Playwright, MSW

---

## 1. LA PIRÁMIDE DE TESTING

```
              ┌─────────────┐
              │  E2E Tests  │  5-10%
              │   Lentos    │
              │   Frágiles  │
            ╱─┴─────────────┴─╲
          ╱                     ╲
      ┌──────────────────────────┐
      │ Integration Tests        │  15-20%
      │ Medianos (velocidad)     │
      │ Middling (brittleness)   │
    ╱─┴──────────────────────────┴─╲
  ╱                                  ╲
┌────────────────────────────────────┐
│      Unit Tests                    │  70-75%
│      Rápidos                       │
│      Aislados (mocked deps)        │
│      Específicos (1 función)       │
└────────────────────────────────────┘
```

### ¿Por qué esta pirámide?

**VELOCIDAD**: Unit tests < Integration tests < E2E tests
- Un unit test corre en ~1-5ms
- Un integration test corre en ~20-100ms
- Un E2E test corre en ~500ms-2s

En CI/CD, necesitas feedback rápido.
Si esperas 30 minutos para saber si el código anda, pierdes momentum.

**CONFIABILIDAD**: Unit tests > Integration tests > E2E tests
- Unit tests: casi nunca son "flaky" (a veces pasan, a veces no)
- Integration tests: pueden fallar por timing (API lenta)
- E2E tests: super frágiles a cambios de UI

**COSTO**: Unit tests < Integration tests < E2E tests
- Unit test: 10 líneas de código
- Integration test: 30-50 líneas
- E2E test: 100+ líneas, muchas dependencias

### Consecuencia

**NO escribas solo unit tests**.
Si solo testes funciones aisladas, nunca sabes si los módulos funcionan juntos.

**NO escribas solo E2E tests**.
Serían lentos, caros, y detectarías bugs tarde (en prod).

**MEZCLA ESTRATÉGICA**: 70% unit + 20% integration + 10% E2E = confianza máxima.

---

## 2. TIPOS DE TESTS

### A. UNIT TESTS

Definición: Testing de **UNA función/componente en aislamiento**.
- Dependencies: todas mockeadas
- Scope: 1 unidad de código (función, clase)
- Tiempo: <10ms

#### Ejemplo: Test de función de validación

```typescript
import { describe, it, expect } from 'vitest';
import { validateLabResult } from './validator';

describe('validateLabResult', () => {
  it('debería retornar true si el valor está en rango normal', () => {
    const result = {
      testName: 'Hemoglobina',
      value: 14.5,
      normalRange: { min: 12, max: 17 },
    };

    expect(validateLabResult(result)).toBe(true);
  });

  it('debería retornar false si el valor está fuera de rango', () => {
    const result = {
      testName: 'Hemoglobina',
      value: 25,
      normalRange: { min: 12, max: 17 },
    };

    expect(validateLabResult(result)).toBe(false);
  });
});
```

#### Ventajas
- Rápidos: instant feedback
- Específicos: sé exactamente qué falló
- Bajo costo: fácil escribir y mantener

#### Desventajas
- No prueban integración
- Pueden pasar aunque el sistema se rompa

### B. INTEGRATION TESTS

Definición: Testing de **múltiples módulos trabajando juntos**.
- Dependencies: algunas reales, algunas mockeadas
- Scope: 2+ componentes / función + dependencias
- Tiempo: ~50-200ms

#### Ejemplo: Test de componente React + API mock

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { PatientDashboard } from './PatientDashboard';

const server = setupServer(
  rest.get('/api/patients/:id/results', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, testName: 'Hemoglobina', value: 14.5 },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PatientDashboard', () => {
  it('debería mostrar resultados de lab cuando se carga', async () => {
    render(<PatientDashboard patientId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobina')).toBeInTheDocument();
    });
  });
});
```

#### Ventajas
- Prueban flujos reales
- Detectan bugs de integración
- Punto medio: velocidad + confianza

#### Desventajas
- Más lentos que unit tests
- Más frágiles (timing issues)

### C. E2E TESTS (End-to-End)

Definición: Testing de **workflows completos del usuario**.
- Dependencies: todas reales (app + backend + DB)
- Scope: flujo completo (login → acción → logout)
- Tiempo: ~500ms-2s

#### Ejemplo: Playwright test

```typescript
import { test, expect } from '@playwright/test';

test('doctor can view and update patient results', async ({ page }) => {
  // 1. Login
  await page.goto('https://app.example.com/login');
  await page.fill('input[type="email"]', 'doctor@hospital.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Login")');

  // 2. Buscar paciente
  await page.fill('input[placeholder="Patient ID"]', 'PAT-12345');
  await page.click('button:has-text("Search")');

  // 3. Verificar resultados visibles
  await expect(page.locator('text=Hemoglobina')).toBeVisible();

  // 4. Marcar resultado como revisado
  await page.click('button[aria-label="Mark reviewed"]');
  await expect(page.locator('text=Reviewed')).toBeVisible();
});
```

#### Ventajas
- Máxima confianza: tests exactamente lo que el usuario hace
- Detectan bugs que unit tests no ven (navegación, permissions)

#### Desventajas
- LENTOS: 10 tests E2E = 10-30 segundos
- FRÁGILES: cambio pequeño en UI rompe el test
- CAROS: setup complejo, dependencias múltiples

---

## 3. VITEST vs JEST vs OTROS

### Comparación rápida

| Característica | Vitest | Jest | Playwright |
|---|---|---|---|
| **Tipo** | Unit/Integration | Unit/Integration | E2E |
| **Basado en** | Vite | V8 | Chromium/Firefox/WebKit |
| **Velocidad** | ⚡⚡⚡ Rápido | ⚡⚡ Moderado | 🐢 Lento |
| **ES Modules** | Nativo ✅ | Require | N/A |
| **Snapshots** | ✅ | ✅ | ❌ |
| **API familiar** | Jest-compatible | Industry standard | Playwright |
| **Mejor para** | Desarrollo local rápido | Proyectos grandes | Flujos de usuario |

### ¿Cuándo usar cada uno?

- **Vitest**: Tu proyecto usa Vite. Necesitas iteración rápida en desarrollo.
- **Jest**: Proyecto legacy que usa Webpack. Necesitas stabilidad.
- **Playwright**: Tests de "puedo hacer X sin entrar en el navegador".

**En 2025, Vitest es la opción recomendada para nuevos proyectos.**

---

## 4. CICLO RED-GREEN-REFACTOR (TDD)

Test-Driven Development es una disciplina:

```
1. RED: Escribe un test que FALLA
   └─> El código que testa no existe todavía

2. GREEN: Implementa lo mínimo para que PASE
   └─> Código hacky, no importa si es bonito

3. REFACTOR: Mejora el código
   └─> Todos los tests siguen pasando
```

#### Ejemplo práctico

**PASO 1: RED** — Escribe el test primero

```typescript
describe('validateLabResult', () => {
  it('rechaza valores fuera de rango', () => {
    expect(validateLabResult({ value: 200, range: [0, 150] })).toBe(false);
  });
});
// ❌ FALLA: `validateLabResult` no existe
```

**PASO 2: GREEN** — Implementa lo mínimo

```typescript
function validateLabResult(data) {
  return true; // ❌ Tramposo, pero el test pasa
}
// ✅ PASA (aunque es tonta)
```

**PASO 3: REFACTOR** — Implementa la lógica real

```typescript
function validateLabResult(data) {
  return data.value >= data.range[0] && data.value <= data.range[1];
}
// ✅ PASA + código real
```

### Ventajas de TDD
1. **Claridad**: escribir el test primero = claridad sobre qué hacer
2. **Cobertura**: 100% del código tiene un test
3. **Diseño**: fuerza a escribir código testeable (y por tanto, mejor)

### Desventajas
- Requiere disciplina
- Más tiempo inicial (menos código después)

---

## 5. MOCK vs STUB vs SPY

Tres formas de controlar dependencies en tests:

### A. MOCK (Reemplazo completo)

**Qué es**: Reemplazar una función completamente. El código original NO ejecuta.

```typescript
import { vi } from 'vitest';
import { validateAndLog } from './validator';

const logMock = vi.fn(); // Función mockeada

validateAndLog({ value: 200, range: [0, 150] }, logMock);

expect(logMock).toHaveBeenCalledWith('ABNORMAL: value is 200');
```

**Cuándo usar**: Cuando quieres verificar que se llamó una función (sin ejecutarla realmente).

**Ejemplo clínico**: Mockear un "envío de email de alerta al médico". No queremos mandar emails en tests.

### B. STUB (Fake implementation)

**Qué es**: Implementación falsa que siempre devuelve un valor específico.

```typescript
import { vi } from 'vitest';

const mockDatabase = {
  getPatient: vi.fn(() => ({
    id: 'PAT-123',
    name: 'Juan',
    age: 45,
  })),
};

const patient = mockDatabase.getPatient('PAT-123');
expect(patient.name).toBe('Juan');
```

**Cuándo usar**: Cuando quieres simular una API o BD sin usarla realmente.

**Ejemplo clínico**: Stubear la BD de pacientes. Devuelves datos fake instantáneamente.

### C. SPY (Observer)

**Qué es**: Permite que el código real ejecute, pero registra cómo fue llamado.

```typescript
import { vi } from 'vitest';

const consoleSpy = vi.spyOn(console, 'log');

validateAndLog({ value: 200, range: [0, 150] });

expect(consoleSpy).toHaveBeenCalledWith('ABNORMAL');
console.log.mockRestore(); // Limpiar
```

**Cuándo usar**: Cuando quieres verificar efectos secundarios (logs, analytics, eventos).

### Resumen

| Técnica | Usa real? | Para qué | Ejemplo |
|---|---|---|---|
| **Mock** | ❌ No | Verificar que se llamó | Verificar que se envió alerta |
| **Stub** | ❌ No | Simular respuesta | Simular respuesta de API |
| **Spy** | ✅ Sí | Observar efectos | Verificar que se loguea |

---

## 6. ¿POR QUÉ TESTING IMPORTA PARA SENIOR ENGINEERS?

### El diferenciador

- **Junior**: "El código funciona" (porque lo probaron manualmente 1 vez)
- **Senior**: "El código está diseñado para ser testeable, y probablemente ningún cambio futuro romperá esto"

### Impacto comercial

**Bugs en producción** = dinero perdido + cliente molesto.

En clínicas:
- Bug en validación de lab = médico desconfia del sistema
- Bug en cálculo de dosis = paciente sale dañado (legal liability)
- Bug en reportes = auditoría falla = hospital puede perder licencia

**Solución**: Testing comprehensivo como prevención.

### Confianza arquitectónica

Tests te permiten:
1. **Refactorizar sin miedo**
2. **Agregar features sin romper lo viejo**
3. **Escalar el código** (pasar de 10k a 1M líneas)
4. **Delegar** (otros pueden trabajar en el código sin romper)

### Señal al mercado

Cuando apliques a posiciones de $70k USD:
- Preguntarán por coverage
- Preguntarán por estrategia de testing
- Preguntarán por cómo lidias con bugs

**Tener testing = sé que eres serio.**

---

## 7. TESTING EN CONTEXTO CLÍNICO

### Regulaciones

En EU: **GDPR** + regulatory compliance exige logs de quién hizo qué.
En USA: **HIPAA** exige auditoría completa de cambios.

Solución: Testing + CI/CD logs = evidencia de calidad.

### Ejemplos de qué testear

1. **Validación de datos** (unit)
   - ¿Rango normal correcto?
   - ¿Manejo de valores extremos?

2. **Flujos de usuario** (integration)
   - ¿Doctor puede filtrar resultados?
   - ¿Paciente ve sus datos sin ver ajenos?

3. **Workflows críticos** (E2E)
   - Doctor logs in → busca paciente → ve resultados → descarga reporte
   - Esto NO puede fallar. Nunca.

### Red flags en testing clínico

❌ Cobertura < 70%
❌ No hay E2E tests
❌ Tests manuales (si, existen clínicas así)
❌ No hay CI/CD
❌ Cambios directos a producción sin testing

---

## 8. COMMON PITFALLS

### Pitfall 1: Testear detalles de implementación

❌ **MALO**:
```typescript
it('should create internal state object', () => {
  const component = new Validator();
  expect(component._internalState).toBeDefined(); // ❌ Detalle impl
});
```

✅ **BUENO**:
```typescript
it('should validate correctly', () => {
  expect(validate({ value: 150, range: [0, 150] })).toBe(true);
});
```

**Por qué**: Si refactorizas internals (mismo resultado), el test viejo rompe.

### Pitfall 2: Demasiados mocks = no tests reales

❌ **MALO** (todoe mockeado):
```typescript
const mockDB = vi.fn();
const mockAPI = vi.fn();
const mockLogger = vi.fn();
// Ahora nada es real. ¿Qué estoy testeando?
```

✅ **BUENO** (mezcla):
```typescript
// Código real, solo API mockeada
const validator = new RealValidator();
const mockAPI = vi.fn(); // Solo la parte externa
```

### Pitfall 3: Tests "flaky" (a veces pasan, a veces no)

❌ **MALO**:
```typescript
it('loads data', async () => {
  fetchData();
  await sleep(1000); // ¿Y si tarda 1.1s?
  expect(data).toBeDefined();
});
```

✅ **BUENO**:
```typescript
it('loads data', async () => {
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

---

## PRÓXIMA SEMANA

**Clean Architecture** = Testing + Diseño = Código que escala.

Aquí aprenderás por qué la estructura importa.
