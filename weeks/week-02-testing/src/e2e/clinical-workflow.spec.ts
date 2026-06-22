/**
 * clinical-workflow.spec.ts — Playwright E2E Tests
 * DÍA 3-4: End-to-End Testing | Doctor Clinical Workflow | Full Browser Automation
 *
 * Este archivo contiene tests que automatizan un navegador REAL
 * y prueban workflows completos (login → buscar → ver → actuar)
 *
 * IMPORTANTE: E2E tests son LENTOS (500ms-2s por test)
 * Por eso solo testeamos happy paths críticos, no todos los casos
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// TEST SETUP Y FIXTURES
// ============================================================================

/**
 * URL base de la aplicación
 * En desarrollo local: http://localhost:3000
 * En staging: https://staging.app.example.com
 * En producción: https://app.example.com
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Credenciales de test para diferentes roles
 * En producción, estas vendrían de un servidor seguro de test
 */
const TEST_CREDENTIALS = {
  doctor: {
    email: 'doctor@hospital.test',
    password: 'TestPassword123!',
  },
  nurse: {
    email: 'nurse@hospital.test',
    password: 'TestPassword123!',
  },
};

/**
 * IDs de pacientes de prueba en la base de datos
 * Estos son pacientes fixtures creados específicamente para tests
 */
const TEST_PATIENTS = {
  normalResults: 'PAT-TEST-001',      // Paciente con resultados normales
  abnormalResults: 'PAT-TEST-002',    // Paciente con resultados anormales
  criticalResults: 'PAT-TEST-003',    // Paciente con resultados críticos
};

// ============================================================================
// FUNCIONES AUXILIARES (Helper Functions)
// ============================================================================

/**
 * Helper: Login en la aplicación
 * Reutilizable en múltiples tests
 *
 * @param page - Objeto Page de Playwright
 * @param email - Email para login
 * @param password - Contraseña
 */
async function loginAsDoctor(page: Page, email: string, password: string) {
  // Navega a login
  await page.goto(`${BASE_URL}/login`);

  // Verifica que estamos en la página de login
  await expect(page.locator('text=Doctor Portal Login')).toBeVisible();

  // Llena el formulario
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Haz click en login
  await page.click('button:has-text("Sign In")');

  // Espera a que se redirija al dashboard
  await page.waitForURL(`${BASE_URL}/dashboard`);

  // Verifica que estamos en el dashboard
  await expect(page.locator('text=Dashboard')).toBeVisible();
}

/**
 * Helper: Buscar un paciente
 *
 * @param page - Objeto Page de Playwright
 * @param patientId - ID del paciente a buscar
 */
async function searchPatient(page: Page, patientId: string) {
  // Encuentra el input de búsqueda
  const searchInput = page.locator('input[placeholder="Search patient ID"]');

  // Llena el input
  await searchInput.fill(patientId);

  // Presiona Enter o haz click en Search
  await page.click('button:has-text("Search")');

  // Espera a que cargue la página de paciente
  // (el URL debería cambiar a /patients/:id)
  await page.waitForURL(`**/patients/${patientId}`);
}

/**
 * Helper: Obtener el estado de un resultado de lab
 * Retorna si está marcado como anormal
 */
async function getResultStatus(page: Page, testName: string): Promise<string | null> {
  const resultRow = page.locator(`text=${testName}`).first();
  const statusBadge = resultRow.locator('.status-badge');
  return statusBadge.textContent() || null;
}

// ============================================================================
// TEST SUITE 1: LOGIN Y AUTENTICACIÓN
// ============================================================================

test.describe('Doctor Login & Authentication', () => {
  test('debería permitir login exitoso con credenciales válidas', async ({ page }) => {
    // ARRANGE: Setup (implícito - page ya está lista)

    // ACT: Realizar login
    await loginAsDoctor(
      page,
      TEST_CREDENTIALS.doctor.email,
      TEST_CREDENTIALS.doctor.password
    );

    // ASSERT: Verificar que login fue exitoso
    // 1. URL debe ser dashboard
    expect(page.url()).toContain('/dashboard');

    // 2. Elemento de bienvenida debe estar visible
    const welcomeText = page.locator('text=Welcome');
    await expect(welcomeText).toBeVisible();

    // 3. El menú de navegación debe estar presente
    const navMenu = page.locator('nav');
    await expect(navMenu).toBeVisible();
  });

  test('debería rechazar login con contraseña incorrecta', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Intenta login con contraseña incorrecta
    await page.fill('input[name="email"]', TEST_CREDENTIALS.doctor.email);
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button:has-text("Sign In")');

    // Debe mostrar error
    const errorMessage = page.locator('text=Invalid credentials');
    await expect(errorMessage).toBeVisible();

    // Debe seguir en la página de login
    expect(page.url()).toContain('/login');
  });

  test('debería redirigir a login si intenta acceder a dashboard sin autenticar', async ({
    page,
  }) => {
    // Intenta ir directo al dashboard
    await page.goto(`${BASE_URL}/dashboard`);

    // Debe redirigir a login
    expect(page.url()).toContain('/login');
  });
});

// ============================================================================
// TEST SUITE 2: BÚSQUEDA Y VISUALIZACIÓN DE PACIENTES
// ============================================================================

test.describe('Patient Search & Lab Results Display', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await loginAsDoctor(
      page,
      TEST_CREDENTIALS.doctor.email,
      TEST_CREDENTIALS.doctor.password
    );
  });

  test('debería encontrar paciente por ID y mostrar resultados', async ({ page }) => {
    // ARRANGE: Ya logueado (beforeEach)

    // ACT: Buscar paciente
    await searchPatient(page, TEST_PATIENTS.normalResults);

    // ASSERT: Verificar que se mostró el paciente y resultados
    // 1. El nombre del paciente debe estar visible
    const patientName = page.locator('h1').first();
    await expect(patientName).toContainText('Patient');

    // 2. La sección de resultados debe estar visible
    const resultsSection = page.locator('text=Lab Results').first();
    await expect(resultsSection).toBeVisible();

    // 3. Debe haber resultados listados
    const resultRows = page.locator('tr[data-test-id*="result-"]');
    const count = await resultRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('debería mostrar indicador de "Anormal" para resultados fuera de rango', async ({
    page,
  }) => {
    // Buscar paciente con resultados anormales
    await searchPatient(page, TEST_PATIENTS.abnormalResults);

    // Verifica que hay al menos un resultado marcado como anormal
    const abnormalBadges = page.locator('text=⚠️ Anormal');
    const count = await abnormalBadges.count();
    expect(count).toBeGreaterThan(0);

    // Verifica que los normales tienen el icono correcto
    const normalBadges = page.locator('text=✓ Normal');
    const normalCount = await normalBadges.count();
    expect(normalCount).toBeGreaterThan(0);
  });

  // Implementar - Test para paciente no encontrado
  // Verifica que se muestra mensaje de error cuando busca PAT-INVALID
  test('debería mostrar paciente no encontrado para ID inválido', async ({ page }) => {
    await searchPatient(page, 'PAT-INVALID');

    const errorMessage = page.locator('text=Patient not found');
    await expect(errorMessage).toBeVisible();
  });
});

// ============================================================================
// TEST SUITE 3: INTERACCIONES DEL DOCTOR — MARCAR COMO REVISADO
// ============================================================================

/**
 * EJERCICIO 1: Test de interacción crítica
 *
 * Workflow:
 * 1. Doctor abre página de paciente
 * 2. Ve una lista de resultados
 * 3. Hace click en "Marcar como revisado" para un resultado anormal
 * 4. El botón debe cambiar de estado (o la fila debe cambiar color)
 * 5. Se debe guardar en la base de datos
 *
 * Pista: Después de hacer click, usa waitFor() para verificar cambio visual
 * Pista: El tiempo es importante — ¿cuánto tarda el servidor en responder?
 */
test.describe('Doctor Actions — Mark Results as Reviewed', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDoctor(
      page,
      TEST_CREDENTIALS.doctor.email,
      TEST_CREDENTIALS.doctor.password
    );
  });

  test('debería marcar resultado como revisado', async ({ page }) => {
    // Buscar paciente con resultados anormales
    await searchPatient(page, TEST_PATIENTS.abnormalResults);

    // Encontrar el primer resultado anormal
    const abnormalResult = page.locator('text=⚠️ Anormal').first();
    const resultRow = abnormalResult.locator('xpath=..').locator('xpath=..');

    // Haz click en el botón "Review"
    const reviewBtn = resultRow.locator('button:has-text("Mark Reviewed")');
    await reviewBtn.click();

    // Espera a que cambie el estado visual
    // (el botón debería desaparecer o cambiar a "Reviewed")
    await expect(reviewBtn).not.toBeVisible();

    // Verifica que se muestra "Reviewed"
    const reviewedBadge = resultRow.locator('text=✓ Reviewed');
    await expect(reviewedBadge).toBeVisible();
  });

  test('debería guardar el cambio en la base de datos', async ({ page }) => {
    // Implementar
    // 1. Marcar como revisado
    await searchPatient(page, TEST_PATIENTS.abnormalResults);
    const abnormalResult = page.locator('text=⚠️ Anormal').first();
    const resultRow = abnormalResult.locator('xpath=..').locator('xpath=..');

    // Haz click en el botón "Review"
    const reviewBtn = resultRow.locator('button:has-text("Mark Reviewed")');
    await reviewBtn.click();

    // Espera a que cambie el estado visual
    // (el botón debería desaparecer o cambiar a "Reviewed")
    await expect(reviewBtn).not.toBeVisible();

    // Verifica que se muestra "Reviewed"
    const reviewedBadge = resultRow.locator('text=✓ Reviewed');
    await expect(reviewedBadge).toBeVisible();

    // 2. Recargar la página (F5 o page.reload())
    await page.reload();

    // 3. Verificar que sigue marcado como revisado (persistencia)
    const reviewBadgeAfterReload = page.locator('text=✓ Reviewed').first();
    await expect(reviewBadgeAfterReload).toBeVisible();
  });
});

// ============================================================================
// TEST SUITE 4: FLUJO CRÍTICO COMPLETO
// ============================================================================

/**
 * EJERCICIO 2: El test más importante
 *
 * Este test representa el workflow real de un doctor:
 * 1. Login (autenticación)
 * 2. Buscar paciente (búsqueda)
 * 3. Ver resultados (lectura)
 * 4. Identificar anormales (análisis)
 * 5. Marcar para seguimiento (acción)
 * 6. Guardar anotación (persistencia)
 *
 * SI ESTE TEST FALLA, EL MÉDICO NO PUEDE TRABAJAR.
 *
 * Este es el test más importante para la salud clínica.
 *
 * Pista: Sigue este flow: login → search → verify → interact → verify saved
 * Pista: Cada paso debe ser robusto (usa retry, timeouts)
 * Pista: Documenta lo que el doctor espera en cada paso
 */
test.describe('CRITICAL WORKFLOW: Doctor Clinical Session', () => {
  test('debería completar flujo completo del doctor sin errores', async ({
    page,
  }) => {
    // =====================================================================
    // PASO 1: LOGIN
    // =====================================================================
    // El doctor abre la aplicación
    await page.goto(`${BASE_URL}/login`);

    // Implementar login
    await loginAsDoctor(page, TEST_CREDENTIALS.doctor.email, TEST_CREDENTIALS.doctor.password);

    // Verificar que está en dashboard
    // expect(page.url()).toContain('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // =====================================================================
    // PASO 2: BÚSQUEDA DE PACIENTE
    // =====================================================================
    // El doctor busca un paciente específico
    // Implementar búsqueda de paciente
    await searchPatient(page, TEST_PATIENTS.abnormalResults);

    // Verificar que se muestra información del paciente
    // await expect(page.locator('h1')).toContainText('Patient');
    await expect(page.locator('h1')).toContainText('Patient', { timeout: 5000});

    // =====================================================================
    // PASO 3: VER RESULTADOS
    // =====================================================================
    // El doctor ve una lista de resultados
    // Verificar que los resultados están visibles
    // await es obligatorio — sin él Playwright no reintenta si el elemento tarda en aparecer
    await expect(page.locator('text=Lab Results')).toBeVisible({ timeout: 5000 });
    const resultRows = page.locator('tr[data-test-id*="result-"]');
    const count = await resultRows.count();
    expect(count).toBeGreaterThan(0);

    // =====================================================================
    // PASO 4: IDENTIFICAR ANORMALES
    // =====================================================================
    // El doctor ve qué está anormal (visualmente destacado)
    // Verificar que hay al menos un resultado anormal
    const abnormalBadges = page.locator('text=⚠️ Anormal');
    const abnormalCount = await abnormalBadges.count();
    expect(abnormalCount).toBeGreaterThan(0);

    // =====================================================================
    // PASO 5: MARCAR PARA REVISIÓN
    // =====================================================================
    // El doctor hace click para marcar como revisado
    // Hacer click en un botón de revisión
    const firstAbnormalRow = abnormalBadges.first().locator('xpath=..').locator('xpath=..');
    const reviewBtn = firstAbnormalRow.locator('button:has-text("Mark Reviewed")');
    await reviewBtn.click();

    // =====================================================================
    // PASO 6: VERIFICAR CAMBIO
    // =====================================================================
    // El sistema debe reflejar que fue revisado
    // Verificar que el estado cambió (visualmente)
    await expect(reviewBtn).not.toBeVisible();
    const reviewedBadge = firstAbnormalRow.locator('text=✓ Reviewed');
    await expect(reviewedBadge).toBeVisible();

    // =====================================================================
    // PASO 7: VERIFICAR PERSISTENCIA
    // =====================================================================
    // El doctor recarga la página para verificar que el cambio se guardó
    await page.reload();

    // Verificar que sigue marcado como revisado después de recargar
    const reviewBadgeAfterReload = page.locator('text=✓ Reviewed').first();
    await expect(reviewBadgeAfterReload).toBeVisible();
  });

  test('debería manejar errores de forma graceful durante el workflow', async ({
    page,
  }) => {
    // Login
    await loginAsDoctor(
      page,
      TEST_CREDENTIALS.doctor.email,
      TEST_CREDENTIALS.doctor.password
    );

    // Intenta buscar paciente inválido
    // El sistema debería mostrar error, no crashear
    // Implementar búsqueda de paciente inválido
    await searchPatient(page, 'PAT-INVALID');
    // Verificar que se muestra error amigable al usuario
    await expect(page.locator('text=Patient not found')).toBeVisible();
  });
});

// ============================================================================
// TEST SUITE 5: PERFORMANCE Y RESPONSIVENESS
// ============================================================================

/**
 * En clínicas, el tiempo es crítico
 * Si la aplicación es lenta, el doctor se molesta y no la usa
 * Por eso medimos tiempos de respuesta
 */
test.describe('Performance & Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDoctor(
      page,
      TEST_CREDENTIALS.doctor.email,
      TEST_CREDENTIALS.doctor.password
    );
  });

  test('debería cargar resultados en menos de 2 segundos', async ({ page }) => {
    // Mide el tiempo
    const start = Date.now();

    // Busca paciente
    await searchPatient(page, TEST_PATIENTS.normalResults);

    // Verifica que se cargó
    const resultsSection = page.locator('text=Lab Results');
    await expect(resultsSection).toBeVisible();

    // Calcula tiempo total
    const elapsed = Date.now() - start;

    // Debería tomar menos de 2000ms
    expect(elapsed).toBeLessThan(2000);
  });

  // Implementar - Test que verifica scroll smoothness
  // (tests de performance avanzado)
  test('debería cargar resultados sin bloquear la UI', async ({ page }) => {
    await searchPatient(page, TEST_PATIENTS.normalResults);

    // Intenta hacer scroll mientras carga resultados
    const resultsSection = page.locator('text=Lab Results');
    await expect(resultsSection).toBeVisible();

    // Has scroll hacia abajo
    await page.mouse.wheel(0, 500);

    // Verifica que el scroll se realizó (UI no Bloquea)
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
  });
});

// ============================================================================
// TEST SUITE 6: ACCESIBILIDAD (BONUS)
// ============================================================================

/**
 * Accesibilidad es importante en clínicas
 * Doctores pueden estar cansados, apurados, o tener discapacidades visuales
 */
test.describe('Accessibility', () => {
  test('debería ser navegable con teclado', async ({ page }) => {
    await loginAsDoctor(
      page,
      TEST_CREDENTIALS.doctor.email,
      TEST_CREDENTIALS.doctor.password
    );

    // Presiona Tab varias veces para navegar
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verifica que algún elemento tiene focus
    const focused = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focused).toBeTruthy();
  });

  test('debería tener labels accesibles para inputs', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Verifica que los inputs tienen labels o aria-labels
    const emailInput = page.locator('input[name="email"]');
    const ariaLabel = await emailInput.getAttribute('aria-label');

    expect(ariaLabel || (await emailInput.getAttribute('placeholder'))).toBeTruthy();
  });
});

// ============================================================================
// NOTAS DE APRENDIZAJE & CONFIGURACIÓN
// ============================================================================

/**
 * CONCEPTOS CLAVE — End-to-End Testing
 *
 * 1. PLAYWRIGHT vs CYPRESS vs SELENIUM
 *    - Playwright: más rápido, multi-browser, mejor API
 *    - Cypress: más fácil, pero más lento, single-browser
 *    - Selenium: antiguo, pero está en todas partes
 *    - Recomendación: Playwright (2024)
 *
 * 2. VELOCIDAD vs CONFIANZA
 *    - Unit test: 1ms, pero poca confianza
 *    - Integration: 50ms, confianza media
 *    - E2E test: 2s, máxima confianza (pero lento)
 *    - Por eso usamos pirámide: muchos unit, pocos E2E
 *
 * 3. FLAKY TESTS (tests que a veces pasan, a veces no)
 *    - ❌ MALO: await page.waitForTimeout(1000) — esperar tiempo fijo
 *    - ✅ BUENO: await expect(locator).toBeVisible() — esperar condición
 *    - ✅ BUENO: await page.waitForURL() — esperar evento
 *    - Playwright reintenta automáticamente
 *
 * 4. TEST ISOLATION (tests independientes)
 *    - Cada test debería ser independiente
 *    - Si test A falla, test B no debería fallar
 *    - Por eso tenemos test.beforeEach() — setup limpio
 *
 * 5. CONTEXTO CLÍNICO
 *    - Este workflow es CRÍTICO para el negocio
 *    - Si falla en producción, doctores no pueden trabajar
 *    - Pacientes podrían no recibir atención médica
 *    - Por eso E2E testing importa
 *
 * CONFIGURACIÓN PLAYWRIGHT:
 *
 * En playwright.config.ts:
 * ```typescript
 * export default defineConfig({
 *   testDir: './src/e2e',
 *   testMatch: '*.spec.ts',
 *   webServer: {
 *     command: 'pnpm dev',
 *     reuseExistingServer: !process.env.CI,
 *   },
 *   use: {
 *     baseURL: 'http://localhost:3000',
 *     trace: 'on-first-retry',
 *     screenshot: 'only-on-failure',
 *   },
 * });
 * ```
 *
 * COMANDOS ÚTILES:
 * ```bash
 * pnpm playwright test                    # Run all E2E tests
 * pnpm playwright test --ui               # Interactive mode
 * pnpm playwright test --debug            # Debug mode (paso a paso)
 * pnpm playwright codegen                 # Record tests (click y obtén código)
 * pnpm playwright test --headed           # Ver el navegador mientras corre
 * ```
 *
 * PRÓXIMOS PASOS:
 * - Implementa los TODOs en este archivo
 * - Ejecuta: pnpm playwright test
 * - Lee los failure messages cuidadosamente
 * - Observa cómo Playwright puede hacer screenshots en fallos
 */

/**
 * MIS NOTAS PERSONALES:
 * ¿Por qué se usa .first() en lugar de solo el texto?
 * Se suele usar por dos razones principales:
 * - Evitar el error de "Strict Mode": Como mencioné, Playwright prefiere fallar antes que interactuar con el elemento equivocado. .first() desactiva esa queja.
 * - Sistemas Dinámicos: A veces, al recargar una página (AfterReload), el elemento viejo todavía está "muriendo" en la memoria del navegador mientras el nuevo aparece. .first() ayuda a capturar la primera instancia disponible.
 * 
 * Regla para playwright: Toda aserción sobre el DOM necesita await. Sin await, Playwright evalúa el estado en ese instante exacto y no reintenta — si el elemento tarda 200ms en aparecer, el test falla aunque eventualmente aparecería. Con await expect(...), Playwright reintenta automáticamente hasta el timeout configurado.
 * 
 * En tests E2E, es común usar un mix de aserciones explícitas (expect) y verificaciones implícitas (como esperar a que un elemento esté visible antes de interactuar). Esto ayuda a asegurar que el test sea robusto y no falle por condiciones de carrera o tiempos de carga variables.
 * 
 * En tests de performance, medir el tiempo total del workflow es útil para detectar regresiones. Si un cambio en el código hace que el tiempo de carga aumente significativamente, es una señal de que algo podría estar mal (como una consulta ineficiente o un recurso pesado). 
 * En producción, los doctores necesitan que la aplicación sea rápida para poder atender a los pacientes sin frustración.
 * 
 * En tests de accesibilidad, verificar que los elementos sean navegables con teclado es crucial para usuarios con discapacidades o para situaciones donde el mouse no es práctico (como en quirófanos). 
 * Además, asegurarse de que los inputs tengan labels o aria-labels mejora la experiencia para usuarios de lectores de pantalla.
 */