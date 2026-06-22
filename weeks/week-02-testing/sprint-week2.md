# WEEK 02 — Testing Fundamentals
## 7-Day Intensive Sprint: Vitest, RTL, Playwright, MSW

**Goal**: Master the Testing Pyramid. Learn to write unit, integration, and E2E tests for clinical applications. Integrate DS&A (two-pointer, sliding-window patterns) into test scenarios.

**Healthcare Focus**: We'll build tests for a **Lab Result Validation** module—a critical component in any clinical software system.

---

## DÍA 1: Testing Fundamentals & Vitest Setup
**Tema**: La Pirámide de Testing | Unit Tests con Vitest

### Objetivos de Aprendizaje
- Entender la pirámide de testing (Unit > Integration > E2E)
- Diferencia entre testing tradicional (Jest) y modern tooling (Vitest)
- Setup de Vitest en el proyecto
- Escribir tu primer unit test con cobertura

### Healthcare Angle
Laboratorios clínicos registran decenas de miles de resultados diarios. Cada resultado:
- Tiene rangos normales que varían por edad, sexo, laboratorio
- Requiere validación antes de mostrar al médico
- Si falla la validación, se pierde tiempo y confianza del paciente

**Tu tarea**: Crear un validador robusto de resultados de lab.

### Contenido Principal
1. **La Pirámide de Testing**
   - Unit (70%): Tests rápidos, aislados, específicos
   - Integration (20%): Tests que verifican múltiples módulos juntos
   - E2E (10%): Tests que simulan workflows reales de usuarios

2. **¿Por qué Vitest?**
   - Desarrollado para Vite (bundler moderno)
   - 10x más rápido que Jest
   - Compatible con ES modules nativo
   - Mejor DX para desarrollo local

3. **Estructura de un test en Vitest**
   ```typescript
   import { describe, it, expect, beforeEach } from 'vitest';

   describe('validateLabResult', () => {
     it('debería rechazar un resultado con valor fuera de rango', () => {
       const result = { value: 200, normalRange: [0, 150] };
       expect(isAbnormal(result)).toBe(true);
     });
   });
   ```

4. **Red-Green-Refactor (TDD)**
   - **RED**: Escribe un test que falla
   - **GREEN**: Implementa lo mínimo para que pase
   - **REFACTOR**: Mejora el código manteniendo los tests en verde

### Ejercicio Principal
- [ ] Crear archivo `src/unit/task-validator.test.ts`
- [ ] Implementar 5 tests para validación de resultados de lab
- [ ] Alcanzar 80%+ cobertura en el módulo validador

### DS&A Focus: Two-Pointer Pattern
En tests, usaremos two-pointer para verificar si un valor está en rango:
```typescript
// Dado un array de rangos [min, max], ¿está value en rango?
function isInRange(value: number, ranges: number[]): boolean {
  // Dos punteros: inicio y fin del array
}
```

---

## DÍA 2: Integration Testing con RTL + MSW
**Tema**: Tests de Integración | Mocking de APIs

### Objetivos
- React Testing Library (RTL): testing del punto de vista del usuario
- Mock Service Worker (MSW): interceptar requests sin modificar el código
- Testing Hooks y Context API
- Diferencia entre `shallow` vs `deep` rendering

### Healthcare Angle
Un dashboard clínico muestra resultados de pacientes en tiempo real. Debemos:
- Renderizar componentes React sin API real
- Simular respuestas del servidor (éxito, error, delay)
- Verificar que el UI refleje el estado correcto

### Contenido
1. **React Testing Library Philosophy**
   - NO testes detalles de implementación
   - SÍ testa el comportamiento visible para el usuario
   - Busca por: `getByRole`, `getByLabelText`, `getByPlaceholderText`

2. **Mock Service Worker (MSW)**
   ```typescript
   import { setupServer } from 'msw/node';
   import { rest } from 'msw';

   const server = setupServer(
     rest.get('/api/lab-results/:patientId', (req, res, ctx) => {
       return res(ctx.json([{ id: 1, value: 95, unit: 'mg/dL' }]));
     })
   );
   ```

3. **User-Centric Testing**
   - El usuario no ve "props" ni "state"
   - El usuario ve: botones, textos, inputs
   - Testa: clicks, inputs, assertions visuales

### Ejercicio
- [ ] Crear `src/integration/api.test.ts`
- [ ] Renderizar un componente que fetch resultados de lab
- [ ] Mockear la API con MSW
- [ ] Verificar que el componente muestra datos correctamente

### DS&A Focus: Sliding Window Pattern
Para tests de múltiples resultados en una ventana de tiempo:
```typescript
// Dado un array de resultados, ¿cuál es el promedio móvil en ventanas de 3?
function movingAverage(results: number[], windowSize: number): number[] {
  // Sliding window
}
```

---

## DÍA 3: E2E Testing con Playwright
**Tema**: End-to-End Tests | Flujos completos de usuario

### Objetivos
- Playwright: automatización del navegador para tests
- Diferencia entre unit/integration/E2E
- Cuándo cada tipo es apropiado
- Best practices para E2E

### Healthcare Angle
Un médico realiza este workflow:
1. Inicia sesión
2. Busca paciente por ID
3. Ve resultados recientes de lab
4. Marca alguno para seguimiento
5. Guarda anotaciones

Debemos probar este flujo completo, sin mocks.

### Contenido
1. **Playwright vs Selenium vs Cypress**
   - Playwright: multi-browser, rápido, mejor API
   - E2E: tests lentos, prueba flujos reales, máxima confianza
   - Úsalo para: happy paths críticos, no para todo

2. **Estructura de un test E2E**
   ```typescript
   import { test, expect } from '@playwright/test';

   test('doctor can view patient lab results', async ({ page }) => {
     await page.goto('https://app.example.com/login');
     await page.fill('input[type="email"]', 'doctor@hospital.com');
     // ...
   });
   ```

3. **Mejores Prácticas**
   - Testa solo happy paths (los esenciales)
   - No testes todo lo que cubre unit testing
   - Usa fixtures y helpers para reutilizar setup
   - Mantén tests independientes

### Ejercicio
- [ ] Crear `src/e2e/clinical-workflow.spec.ts`
- [ ] Implementar un flujo de login → ver resultados → marcar seguimiento
- [ ] Ejecutar con `pnpm test:e2e`

---

## DÍA 4: Mocks, Stubs, Spies
**Tema**: Técnicas avanzadas de testing

### Objetivos
- Cuándo usar mock vs stub vs spy
- Verificar que funciones se llamaron correctamente
- Testing de side effects (logs, analytics, API calls)
- Cobertura de branches (if/else)

### Healthcare Angle
Nuestro validador de lab puede:
- ✅ Validar resultados normales
- ❌ Rechazar anormales (log + alert)
- 🔁 Reintentar si hay error temporal

Debemos testear TODAS las rutas.

### Contenido
1. **Mock = Reemplazo completo**
   ```typescript
   const loggerMock = vi.fn();
   // El logger nunca hace log real, vi.fn() lo intercepta
   validateResult(result, loggerMock);
   expect(loggerMock).toHaveBeenCalledWith('ABNORMAL');
   ```

2. **Stub = Fake implementation**
   - Implementación falsa que siempre devuelve lo mismo
   - Útil para APIs o servicios

3. **Spy = Observer**
   - Permite que el código original ejecute
   - Pero registra cómo fue llamado
   ```typescript
   const spy = vi.spyOn(console, 'log');
   validateResult(abnormalResult);
   expect(spy).toHaveBeenCalledWith('Alert');
   ```

### Ejercicio
- [ ] Expandir `task-validator.test.ts` con mocks/spies
- [ ] Verificar logs correctos para cada rama
- [ ] Alcanzar 100% branch coverage

---

## DÍA 5: Coverage Reports & CI/CD
**Tema**: Métricas de cobertura | Automatización en CI/CD

### Objetivos
- Leer reportes de cobertura (line, branch, function)
- Establecer mínimos de cobertura (80%+)
- Integrar tests en CI/CD (GitHub Actions, GitLab CI)
- Automatizar testing en cada push

### Healthcare Angle
En clínicas, **100% de confianza** en el software es crítico.
- Regulaciones: cada cambio debe ser testeado
- Auditoría: logs completos de qué se testió
- Confianza clínica: médicos necesitan saber que el software es seguro

### Contenido
1. **Métricas de Cobertura**
   - **Line Coverage**: % de líneas ejecutadas
   - **Branch Coverage**: % de if/else ejecutados
   - **Function Coverage**: % de funciones llamadas
   - **Statement Coverage**: similar a line

2. **Configurar Vitest para Cobertura**
   ```typescript
   // vitest.config.ts
   export default defineConfig({
     test: {
       coverage: {
         provider: 'v8',
         reporter: ['text', 'html'],
         all: true,
         include: ['src/**/*.ts'],
         exclude: ['node_modules', 'dist'],
       },
     },
   });
   ```

3. **Ejecutar cobertura**
   ```bash
   pnpm vitest --coverage
   ```

### Ejercicio
- [ ] Generar reporte de cobertura
- [ ] Alcanzar 80%+ en todos los archivos de testing
- [ ] Documentar los gaps de cobertura

---

## DÍA 6: Performance Testing
**Tema**: Tests de velocidad | Benchmark

### Objetivos
- Medir tiempo de ejecución de funciones críticas
- Detectar regresiones de performance
- Benchmarking en Vitest

### Healthcare Angle
Validar 10,000 resultados de laboratorio NO puede tomar más de 100ms.
Si tarda más, el doctor ve "spinner" y se molesta.

### Contenido
1. **Benchmark en Vitest**
   ```typescript
   import { bench, describe } from 'vitest';

   describe('performance', () => {
     bench('validateLabResult - 1000 results', () => {
       const results = generateResults(1000);
       results.forEach(validateLabResult);
     });
   });
   ```

2. **Comparar rendimiento**
   - Antes del optimización: 500ms
   - Después del optimización: 50ms
   - Mejora: 10x

### Ejercicio
- [ ] Crear benchmark para validador de lab
- [ ] Medir performance actual
- [ ] Documen
tar resultados

---

## DÍA 7: Integration & Review
**Tema**: Proyecto completo de testing

### Objetivos
- Integrar unit + integration + E2E tests
- Revisar cobertura total
- Documentar estrategia de testing
- Preparar para code review

### Ejercicio Final
- [ ] Todos los tests pasan (unit + integration + E2E)
- [ ] Cobertura >= 80%
- [ ] Documentar: por qué cada test existe
- [ ] Escribir guía: cuándo agregar qué tipo de test

### Healthcare Connection
Tu estrategia de testing es ahora:
- **Unit**: Cada función de negocio (validación, cálculo) es testeada
- **Integration**: Los componentes React interactúan correctamente con APIs
- **E2E**: El doctor puede hacer su trabajo sin fricción

Esto es lo que diferencia a un junior (some tests) de un senior (comprehensive testing strategy).

---

## RECURSOS CLAVE

### Documentación Oficial
- [Vitest Documentation](https://vitest.dev)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Guide](https://playwright.dev/docs/intro)
- [Mock Service Worker](https://mswjs.io)

### Tutoriales Recomendados
- Testing Pyramid: [Martin Fowler's article](https://martinfowler.com/articles/practical-test-pyramid.html)
- TDD by Example: Kent Beck (libro clásico)

---

## CONEXIÓN CON TU BACKGROUND

### QBP (Biología Clínica)
En el lab, cuando reportas un resultado, ¿cuántas veces verificas antes de entregar?
Probablemente 2-3 veces: revisión manual, chequeo de rango normal, chequeo vs histórico del paciente.

Eso es **testing en la práctica clínica**.

En software, hacemos lo mismo:
- **Unit test**: ¿El rango normal es correcto para edad + sexo?
- **Integration test**: ¿El resultado se muestra bien en el portal?
- **E2E test**: ¿El doctor puede descargar el reporte sin problemas?

### Auditoría
La auditoría clínica pregunta: "¿Cómo sé que cada resultado que sale del sistema es válido?"

Respuesta: **Comprehensive testing con cobertura medible**.

En auditoría financiera, revisas transacciones al azar. En software, los tests son como esas revisiones: **automatizadas, repetibles, trazables**.

### Ventas/UX
La confianza del cliente = software que no falla.

Cuando cierres un deal con una clínica:
- "Tenemos cobertura de testing del 85%"
- "Cada cambio pasa por unit + integration + E2E antes de producción"
- "Documentamos cuál bug cada test previene"

Eso es lo que vende. Confianza.

---

## PRÓXIMO PASO

La próxima semana (Week 03) profundizaremos en **Clean Architecture**.
Aquí aplicaremos testing a arquitecturas más robustas:
- Repository Pattern
- Use Cases
- Dependency Injection

Los tests que escribas esta semana te preparan para arquitecturas profesionales.
