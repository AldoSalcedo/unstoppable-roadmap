/**
 * api.test.ts — Pruebas de Integración con React Testing Library + MSW
 * DÍA 2-3: Testing de Componentes | API Mocking | Patient Dashboard
 */

import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import React from 'react';

// ============================================================================
// TIPOS Y MOCK DATA
// ============================================================================

/**
 * Tipo de respuesta del API de resultados de lab
 * En producción, esto viene de tu servidor
 */
type ApiLabResult = {
  id: string;
  testName: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  timestamp: string;
  isAbnormal: boolean;
};

/**
 * Datos mockados para tests
 * En una prueba real, estos representan datos de la base de datos del hospital
 */
const mockLabResults: ApiLabResult[] = [
  {
    id: 'LAB-001',
    testName: 'Hemoglobina',
    value: 14.5,
    unit: 'g/dL',
    normalRange: { min: 12, max: 17 },
    timestamp: '2024-04-02T10:00:00Z',
    isAbnormal: false,
  },
  {
    id: 'LAB-002',
    testName: 'Glucosa',
    value: 105,
    unit: 'mg/dL',
    normalRange: { min: 70, max: 100 },
    timestamp: '2024-04-02T10:05:00Z',
    isAbnormal: true,  // Fuera de rango
  },
  {
    id: 'LAB-003',
    testName: 'Colesterol Total',
    value: 185,
    unit: 'mg/dL',
    normalRange: { min: 0, max: 200 },
    timestamp: '2024-04-02T10:10:00Z',
    isAbnormal: false,
  },
];

// ============================================================================
// SETUP MSW (Mock Service Worker) - API MOCKING
// ============================================================================

/**
 * MSW intercepta requests HTTP REALES sin tocar tu código
 * Es como un "stub de API" para tests
 *
 * Diferencia importante:
 * - MOCK: función que reemplazamos (vi.fn())
 * - STUB: endpoint que retorna datos falsos (MSW)
 * - SPY: observador de función real (vi.spyOn)
 *
 * Aquí usamos MSW porque:
 * - Tu componente hace fetch(/api/results)
 * - Queremos simular la respuesta sin servidor real
 * - MSW intercepta el request y retorna datos mock
 */
const server = setupServer(
  // Endpoint 1: GET /api/patients/:patientId/results
  http.get('/api/patients/:patientId/results', ({ params }) => {
    const { patientId } = params;

    // Simulamos que el servidor retorna diferentes datos por paciente
    if (patientId === 'PAT-404') {
      return HttpResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Success case
    return HttpResponse.json(mockLabResults);
  }),

  // Endpoint 2: POST /api/results/:resultId/mark-reviewed
  http.post('/api/results/:resultId/mark-reviewed', ({ params }) => {
    const { resultId } = params;

    return HttpResponse.json({
      id: resultId,
      reviewed: true,
      reviewedAt: new Date().toISOString(),
    });
  }),

  // Endpoint 3: GET /api/patients/:patientId (patient info)
  // NOTA: debe ir DESPUÉS de /results para que el router no lo capture primero
  http.get('/api/patients/:patientId', ({ params }) => {
    const { patientId } = params;

    return HttpResponse.json({
      id: patientId,
      name: 'Juan García López',
      age: 45,
      medicalRecord: 'MR-2024-001',
    });
  }),
);

// Levanta el server antes de todos los tests
beforeAll(() => server.listen());

// Resetea handlers después de cada test (para tests con comportamiento diferente)
afterEach(() => server.resetHandlers());

// Cierra el server al final
afterAll(() => server.close());

// ============================================================================
// COMPONENTES React A TESTEAR (Simplificados)
// ============================================================================

/**
 * PatientDashboard: Componente que muestra resultados de lab de un paciente
 *
 * COMPORTAMIENTO ESPERADO:
 * 1. Carga (muestra spinner)
 * 2. Fetch /api/patients/:id
 * 3. Fetch /api/patients/:id/results
 * 4. Renderiza lista de resultados
 * 5. Permite marcar como revisados
 */
function PatientDashboard({ patientId }: { patientId: string }) {
  const [patient, setPatient] = React.useState<any>(null);
  const [results, setResults] = React.useState<ApiLabResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch patient info
        const patientRes = await fetch(`/api/patients/${patientId}`);
        if (!patientRes.ok) throw new Error('Failed to load patient');
        const patientData = await patientRes.json();
        setPatient(patientData);

        // Fetch lab results
        const resultsRes = await fetch(`/api/patients/${patientId}/results`);
        if (!resultsRes.ok) throw new Error('Failed to load results');
        const resultsData = await resultsRes.json();
        setResults(resultsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  if (loading) return <div data-testid="loading-spinner">Cargando...</div>;
  if (error) return <div data-testid="error-message">Error: {error}</div>;

  return (
    <div data-testid="patient-dashboard">
      <h1>{patient?.name}</h1>
      <p>ID: {patient?.id}</p>

      <section data-testid="results-section">
        <h2>Resultados de Laboratorio</h2>
        {results.length === 0 ? (
          <p>No hay resultados disponibles</p>
        ) : (
          <ul>
            {results.map((result) => (
              <li key={result.id} data-testid={`result-${result.id}`}>
                <div>
                  <strong>{result.testName}</strong>: {result.value} {result.unit}
                </div>
                <div style={{ fontSize: '0.9em', color: result.isAbnormal ? 'red' : 'green' }}>
                  {result.isAbnormal ? '⚠️ Anormal' : '✓ Normal'}
                </div>
                <button
                  data-testid={`review-btn-${result.id}`}
                  onClick={() => markResultReviewed(result.id)}
                >
                  Marcar como revisado
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * Función auxiliar para marcar resultado como revisado
 * En producción, esto sería parte del componente
 */
async function markResultReviewed(resultId: string) {
  const res = await fetch(`/api/results/${resultId}/mark-reviewed`, {
    method: 'POST',
  });
  return res.json();
}

// ============================================================================
// TAREA 1.1: RENDERING Y LOADING STATE
// ============================================================================

describe('PatientDashboard — Rendering & Loading', () => {
  it('debería mostrar spinner mientras carga', async () => {
    render(<PatientDashboard patientId="PAT-001" />);

    // El spinner debe estar visible inicialmente
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveTextContent('Cargando...');
  });

  it('debería cargar datos y mostrar el dashboard', async () => {
    render(<PatientDashboard patientId="PAT-001" />);

    // Espera a que desaparezca el spinner
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Verifica que aparezca el nombre del paciente
    expect(screen.getByText('Juan García López')).toBeInTheDocument();

    // Verifica que aparezca la sección de resultados
    const resultsSection = screen.getByTestId('results-section');
    expect(resultsSection).toBeInTheDocument();
  });
});

// ============================================================================
// TAREA 1.2: DATA DISPLAY Y USER INTERACTIONS
// ============================================================================

describe('PatientDashboard — Data Display', () => {
  it('debería mostrar todos los resultados de lab', async () => {
    render(<PatientDashboard patientId="PAT-001" />);

    // Espera a que cargue
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Verifica que aparezcan todos los tests
    expect(screen.getByText('Hemoglobina')).toBeInTheDocument();
    expect(screen.getByText('Glucosa')).toBeInTheDocument();
    expect(screen.getByText('Colesterol Total')).toBeInTheDocument();
  });

  it('debería mostrar valores correctos para cada resultado', async () => {
    render(<PatientDashboard patientId="PAT-001" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Verifica valores específicos — usamos data-testid del <li>, no el <strong>
    // getByText(/Hemoglobina/) retornaría solo el <strong>, sin el valor
    const hemoglobinResult = screen.getByTestId('result-LAB-001');
    expect(hemoglobinResult).toHaveTextContent('14.5');
    expect(hemoglobinResult).toHaveTextContent('g/dL');
  });

  it('debería marcar resultados anormales con icono de alerta', async () => {
    render(<PatientDashboard patientId="PAT-001" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // La glucosa está anormal (105 > 100)
    const glucosaResult = screen.getByTestId('result-LAB-002');
    expect(glucosaResult).toHaveTextContent('⚠️ Anormal');

    // La hemoglobina está normal
    const hemResult = screen.getByTestId('result-LAB-001');
    expect(hemResult).toHaveTextContent('✓ Normal');
  });
});

// ============================================================================
// TAREA 1.3: ERROR HANDLING
// ============================================================================

/**
 * EJERCICIO 1: Test para manejo de errores
 *
 * Cuando el paciente no existe (PAT-404):
 * - El servidor retorna 404 (ya configurado en MSW)
 * - El componente debe mostrar un mensaje de error
 *
 * Pista: Usa server.use() para reemplazar el handler de PAT-001
 * Pista: Verifica que aparezca el elemento data-testid="error-message"
 * Pista: El error debería contener "Failed to load patient"
 */
describe('PatientDashboard — Error Handling', () => {
  it('debería mostrar mensaje de error para paciente no encontrado', async () => {
    // Implementar
    // Pista: Llamar con patientId="PAT-404" debería mostrar error
    render(<PatientDashboard patientId="PAT-404" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      // Debería haber un elemento de error
      // Debería contener "Failed to load"
    });
    const errorElement = screen.getByTestId('error-message');
    expect(errorElement).toBeInTheDocument();
    // El MSW retorna 404 en /results (no en /patients), así que el error es "Failed to load results"
    expect(errorElement).toHaveTextContent('Failed to load results');
  });

  // Test de timeout en su propio describe anidado para aislar el beforeEach/afterEach
  // Si va en el describe padre, los fake timers y el handler roto afectan el primer test también
  describe('API Timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      server.use(
        http.get('/api/patients/:patientId/results', () => {
          return new Promise(() => {}); // Nunca responde
        })
      );
    });

    afterEach(() => {
      vi.useRealTimers();
      server.resetHandlers();
    });

    it('debería mantener el spinner visible si la API no responde', () => {
      render(<PatientDashboard patientId="PAT-001" />);
      // Con fake timers activos y handler que nunca responde,
      // el spinner debe seguir visible
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// TAREA 2.1: API MOCKING - DIFERENTES RESPUESTAS
// ============================================================================

describe('PatientDashboard — MSW API Mocking', () => {
  it('debería hacer fetch a endpoints correctos', async () => {
    // Espiar los fetches (para verificar que se llamaron)
    const fetchSpy = vi.spyOn(global, 'fetch');

    render(<PatientDashboard patientId="PAT-001" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Verifica que se hizo fetch al endpoint de paciente
    expect(fetchSpy).toHaveBeenCalledWith('/api/patients/PAT-001');

    // Verifica que se hizo fetch al endpoint de resultados
    expect(fetchSpy).toHaveBeenCalledWith('/api/patients/PAT-001/results');

    fetchSpy.mockRestore();
  });

  it('debería mostrar resultados cuando la API retorna datos', async () => {
    render(<PatientDashboard patientId="PAT-001" />);

    // Espera a que cargue
    await waitFor(() => {
      expect(screen.getByText('Juan García López')).toBeInTheDocument();
    });

    // Verifica que se mostraron los 3 resultados
    const resultsList = screen.getByTestId('results-section');
    const items = within(resultsList).getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  // Implementar - Test que mockea una respuesta con datos vacíos
  // Verifica que se muestra "No hay resultados disponibles"
  it('debería mostrar una respuesta sin datos', async () => {
    // 1. ARRANGE: reemplazar el handler para que devuelva []
    // El handler va DENTRO de server.use(), no fuera
    server.use(
      http.get('/api/patients/:patientId/results', () => {
        return HttpResponse.json([]);
      })
    );
    // 2. ACT: renderizar el componente
    render(<PatientDashboard patientId="PAT-001" />);

    // 3. ASSERT: esperar a que cargue y verificar el texto vacío
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No hay resultados disponibles')).toBeInTheDocument();
  });
});

// ============================================================================
// TAREA 2.2: USER INTERACTIONS - MARCAR COMO REVISADO
// ============================================================================

/**
 * EJERCICIO 2: Test de interacción del usuario
 *
 * Cuando el usuario hace click en "Marcar como revisado":
 * 1. Se debe hacer POST a /api/results/:id/mark-reviewed
 * 2. El botón debe cambiar de estado (o desaparecer)
 * 3. Se debe mostrar un mensaje de éxito
 *
 * Pista: Usa userEvent.click() para simular el click
 * Pista: waitFor espera a que el servidor responda
 * Pista: Verifica que el estado del botón cambió
 */
describe('PatientDashboard — User Interactions', () => {
  it('debería marcar resultado como revisado cuando hace click', async () => {
    const user = userEvent.setup();

    render(<PatientDashboard patientId="PAT-001" />);

    // Espera a que cargue
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Obtén el botón para marcar como revisado
    const reviewBtn = screen.getByTestId('review-btn-LAB-001');

    // Haz click
    await user.click(reviewBtn);

    // Aquí podrías verificar que se hizo la llamada POST
    // (esto requeriría spyear el fetch nuevamente)
    expect(reviewBtn).toBeInTheDocument(); // El botón sigue ahí (no desaparece)
  });

  // Implementar - Test que verifica POST request al hacer click
  // Usa vi.spyOn(global, 'fetch') para verificar el método y URL
  it('debería hacer POST a la API al marcar como revisdo', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, 'fetch');

    render(<PatientDashboard patientId='PAT-001' />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    const reviewBtn = screen.getByTestId('review-btn-LAB-001');
    await user.click(reviewBtn);

    expect(fetchSpy).toHaveBeenCalledWith('/api/results/LAB-001/mark-reviewed', {
      method: 'POST',
    });

    fetchSpy.mockRestore(); // Limpia el spy después del test
  })
});

// ============================================================================
// TAREA 3.1: INTEGRATION COMPLETA - FLUJO CRÍTICO
// ============================================================================

/**
 * EJERCICIO 3: Test de flujo completo
 *
 * Un doctor abre el dashboard de un paciente:
 * 1. Ve el spinner mientras carga
 * 2. Ve el nombre del paciente
 * 3. Ve los resultados de lab (3 items)
 * 4. Ve que 1 resultado es anormal
 * 5. Hace click para marcar como revisado
 * 6. El botón cambia de estado (o desaparece)
 *
 * Este es el flujo real del doctor. Debe funcionar SIN FALLAR.
 *
 * Pista: Sigue el patrón AAA (Arrange, Act, Assert)
 * Pista: Usa waitFor para esperar datos asincronos
 * Pista: userEvent.setup() para interacciones realistas
 */
describe('PatientDashboard — Full Doctor Workflow', () => {
  it('debería permitir al doctor ver y marcar resultados', async () => {
    // Implementar flujo completo
    // 1. Render component
    render(<PatientDashboard patientId='PAT-001' />);
    // 2. Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    // 3. Verify patient name appears
    expect(screen.getByText('Juan García López')).toBeInTheDocument();
    // 4. Verify results are displayed
    const resultsList = screen.getByTestId('results-section');
    const items = within(resultsList).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    // 5. Verify abnormal results are marked
    const glucosaResult = screen.getByTestId('result-LAB-002');
    expect(glucosaResult).toHaveTextContent('⚠️ Anormal');
    // 6. Click review button
    // El spy debe crearse ANTES del click para capturar la llamada
    const fetchSpy = vi.spyOn(global, 'fetch');
    const user = userEvent.setup();
    const reviewBtn = screen.getByTestId('review-btn-LAB-002');
    await user.click(reviewBtn);
    // 7. Verify post request was made
    expect(fetchSpy).toHaveBeenCalledWith('/api/results/LAB-002/mark-reviewed', {
      method: 'POST',
    });
    fetchSpy.mockRestore();
  });
});

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================

/**
 * CONCEPTOS CLAVE — Integration Testing
 *
 * 1. DIFERENCIA UNIT vs INTEGRATION:
 *    - Unit: testea validateLabResult() aisladamente
 *    - Integration: testea PatientDashboard + fetch + MSW juntos
 *
 * 2. MSW (Mock Service Worker)
 *    - Intercepta HTTP requests REALES
 *    - Tu código no cambia (no necesita saber que es mock)
 *    - Setup en beforeAll, reset en afterEach, cleanup en afterAll
 *    - Más realista que stubear fetch directamente
 *
 * 3. WAITFOR Y ASYNC
 *    - waitFor espera a que una condición sea verdadera
 *    - Útil para datos que vienen de fetch/promesas
 *    - NO hagas sleep() — waitFor es más inteligente
 *
 * 4. TESTING BEHAVIOR vs IMPLEMENTATION
 *    - NO testes que se hizo fetch (eso es implementación)
 *    - SÍ testa que aparece el nombre del paciente (eso es behavior)
 *    - Excepción: cuando necesitas verificar que se hizo POST
 *
 * 5. CONTEXTO CLÍNICO
 *    - PatientDashboard representa la interfaz que el doctor usa
 *    - Resultados anormales DEBEN estar marcados visualmente
 *    - El flujo debe ser fluido (sin errores)
 *    - Si esto falla, el doctor no puede trabajar
 *
 * 6. SPYEAR vs MOCKEAR
 *    - Mock: reemplaza completamente (vi.fn())
 *    - Spy: observa función real (vi.spyOn)
 *    - Aquí espiamos fetch() para verificar que se llamó correctamente
 *
 * PRÓXIMOS PASOS:
 * - Implementa los TODOs en este archivo
 * - Ejecuta: pnpm vitest src/integration/api.test.ts
 * - Verifica que todos los tests pasan
 * - Luego aprenderás E2E testing con Playwright
 */

/**
 * MIS NOTAS PERSONALES:
 * 
 */
