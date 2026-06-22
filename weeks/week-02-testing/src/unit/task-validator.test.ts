/**
 * task-validator.test.ts — Validación de Resultados de Laboratorio
 * DÍA 1-2: Testeo Unitario con Vitest | Lab Result Validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
// DÍA 5: Importar desde archivo separado — así Vitest puede medir cobertura real
import {
  validateLabResult,
  calculateMovingAverage,
  type LabResult,
} from './validator';

// ============================================================================
// TAREA 1.1: VALIDACIÓN BÁSICA — HAPPY PATH
// ============================================================================

describe('validateLabResult — Casos Normales', () => {
  let normalResult: LabResult;

  beforeEach(() => {
    // Setup: Un resultado normal de hemoglobina
    // Hemoglobina normal en mujeres: 12-17 g/dL
    normalResult = {
      testName: 'Hemoglobina',
      value: 14.5,        // En rango
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-001',
    };
  });

  it('debería retornar isValid: true para un valor dentro de rango', () => {
    const validation = validateLabResult(normalResult);
    expect(validation.isValid).toBe(true);
  });

  it('debería retornar isAbnormal: false para un valor dentro de rango', () => {
    const validation = validateLabResult(normalResult);
    expect(validation.isAbnormal).toBe(false);
  });

  it('debería retornar isCritical: false para un valor normal', () => {
    const validation = validateLabResult(normalResult);
    expect(validation.isCritical).toBe(false);
  });

  it('debería generar un mensaje positivo para resultado normal', () => {
    const validation = validateLabResult(normalResult);
    expect(validation.message).toContain('OK');
  });
});

// ============================================================================
// TAREA 1.2: VALIDACIÓN CON VALORES ANORMALES
// ============================================================================

describe('validateLabResult — Valores Anormales', () => {
  let abnormalLow: LabResult;
  let abnormalHigh: LabResult;

  beforeEach(() => {
    // Resultado bajo (anemia leve): hemoglobina 11.5 (rango: 12-17)
    // 11.5 < 12 → anormal, pero 11.5 > 11 (umbral crítico) → no crítico
    abnormalLow = {
      testName: 'Hemoglobina',
      value: 11.5,
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-002',
    };

    // Resultado alto (policitemia): hemoglobina 19.2 (rango: 12-17)
    abnormalHigh = {
      testName: 'Hemoglobina',
      value: 19.2,
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-003',
    };
  });

  it('debería detectar valor anormalmente bajo', () => {
    const validation = validateLabResult(abnormalLow);
    expect(validation.isValid).toBe(false);
    expect(validation.isAbnormal).toBe(true);
  });

  it('debería detectar valor anormalmente alto', () => {
    const validation = validateLabResult(abnormalHigh);
    expect(validation.isValid).toBe(false);
    expect(validation.isAbnormal).toBe(true);
  });

  it('debería generar mensaje de alerta para valores anormales', () => {
    const validation = validateLabResult(abnormalLow);
    expect(validation.message).toContain('ANORMAL');
  });
});

// ============================================================================
// TAREA 1.3: VALIDACIÓN CRÍTICA (BOUNDARY CONDITIONS)
// ============================================================================

/**
 * EJERCICIO 1: Implementa un test que verifique valores CRÍTICOS
 *
 * Un valor es crítico si está fuera de rango por más de 20%
 * Rango: 12-17, entonces:
 *   - Mínimo crítico: 12 - (5 * 0.2) = 11 → si value < 9.6
 *   - Máximo crítico: 17 + (5 * 0.2) = 18 → si value > 20.4
 *
 * Pista: Usa fixture `criticalLow` y `criticalHigh` como en tests anteriores
 * Pista: Verifica que isCritical sea true y el mensaje contenga "CRÍTICO"
 */
describe('validateLabResult — Valores Críticos', () => {
  let criticalLow: LabResult;
  let criticalHigh: LabResult;

  beforeEach(() => {
    // Rango de hemoglobina: 12-17 (ancho: 5)
    // Crítico bajo: < 12 - (5*0.2) = 11 → 9.5 es crítico
    criticalLow = {
      testName: 'Hemoglobina',
      value: 9.0,     // Crítico: anemia severa
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-CRITICAL-1',
    };

    // Crítico alto: > 17 + (5*0.2) = 18 → 21 es crítico
    criticalHigh = {
      testName: 'Hemoglobina',
      value: 21.0,    // Crítico: policitemia severa
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-CRITICAL-2',
    };
  });

  // Implementar - Test para valor crítico bajo
  // Verifica que isCritical sea true
  it('debería detectar valor crítico bajo', () => {
    const result = validateLabResult(criticalLow);
    expect(result.isCritical).toBe(true);
    expect(result.isAbnormal).toBe(true);
    expect(result.isValid).toBe(false);
  })

  // Implementar - Test para valor crítico alto
  // Verifica que isCritical sea true
  it('debería detectar valor crítico alto', () => {
    const result = validateLabResult(criticalHigh);
    expect(result.isCritical).toBe(true);
    expect(result.isAbnormal).toBe(true);
    expect(result.isValid).toBe(false);
  })

  it('debería generar mensaje de alerta crítica', () => {
    const validation = validateLabResult(criticalLow);
    expect(validation.message).toContain('CRÍTICO');
  });
});

// ============================================================================
// TAREA 1.4: EDGE CASES (BOUNDARIES EXACTOS)
// ============================================================================

describe('validateLabResult — Edge Cases', () => {
  it('debería aceptar valor exactamente en mínimo', () => {
    const result: LabResult = {
      testName: 'Hemoglobina',
      value: 12.0,      // Exactamente en mínimo
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-EDGE-1',
    };

    expect(validateLabResult(result).isValid).toBe(true);
  });

  it('debería aceptar valor exactamente en máximo', () => {
    const result: LabResult = {
      testName: 'Hemoglobina',
      value: 17.0,      // Exactamente en máximo
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-EDGE-2',
    };

    expect(validateLabResult(result).isValid).toBe(true);
  });

  // Implementar - Test para valor 0.1 debajo del mínimo
  // Verifica que isValid sea false pero isCritical sea false (solo anormal)
  it('debería detectar valor anormal bajo, descartando crítico y que sea válido', () => {
    const result: LabResult = {
      testName: 'Hemoglobina',
      value: 11.9,
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-EDGE-3',
    };
    const validation = validateLabResult(result);

    expect(validation.isValid).toBe(false);
    expect(validation.isCritical).toBe(false);
  })

  // Implementar - Test para valor 0.1 encima del máximo
  // Verifica que isValid sea false pero isCritical sea false (solo anormal)
  it('debería detectar valor anormal alto, descartando crítico y que sea válido', () => {
    const result: LabResult = {
      testName: 'Hemoglobina',
      value: 17.1,
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-EDGE-4',
    };
    const validation = validateLabResult(result);

    expect(validation.isValid).toBe(false);
    expect(validation.isCritical).toBe(false);
  })
});

// ============================================================================
// TAREA 2.1: DS&A — SLIDING WINDOW PATTERN (Two-Pointer Technique)
// ============================================================================

/**
 * En clínicas, los doctores ven el PROMEDIO MÓVIL de un valor a lo largo del tiempo
 * Ejemplo: "¿Cuál fue el promedio de glucosa en los últimos 7 días?"
 *
 * Sliding window es un patrón clásico de algoritmos que optimiza esto:
 * - Sin sliding window: O(n*m) — lento
 * - Con sliding window: O(n) — rápido
 *
 * Aquí practicamos con hemoglobinas de una semana
 */
describe('calculateMovingAverage — Sliding Window Pattern', () => {
  it('debería calcular promedio móvil de ventana 3', () => {
    // Hemoglobinas diarias durante una semana
    const hemoglobins = [14.5, 14.2, 14.8, 15.1, 14.9, 15.2, 14.6];

    // Promedio móvil de 3 días
    const averages = calculateMovingAverage(hemoglobins, 3);

    // Esperado: [14.5, 14.7, 14.93, 15.07, 15.07, 14.9]
    expect(averages).toHaveLength(5);
    expect(averages[0]).toBeCloseTo(14.5, 1);  // (14.5+14.2+14.8)/3
    expect(averages[1]).toBeCloseTo(14.7, 1);  // (14.2+14.8+15.1)/3
  });

  it('debería retornar array vacío si window es mayor que datos', () => {
    const values = [1, 2, 3];
    const averages = calculateMovingAverage(values, 5);
    expect(averages).toEqual([]);
  });

  // Implementar - Test para window size de 1
  // Debería retornar el mismo array (cada promedio es el valor mismo)
  it('debería retornar cada valor como su propio promedio cuando window es 1', () => {
    const values = [3, 4 ,5, 3.7, 5.5];
    const averages = calculateMovingAverage(values, 1);
    expect(averages).toEqual(values);
  })

  // Implementar - Test para window size igual a array length
  // Debería retornar un array con un solo elemento: el promedio total
  it('debería retornar el promedio total de todo el array', () => {
    const values = [10, 5, 7, 4.5, 9.9, 2.6];
    const averages = calculateMovingAverage(values, values.length);
    expect(averages).toHaveLength(1);
    expect(averages[0]).toBeCloseTo(6.5);
  })
});

// ============================================================================
// TAREA 2.2: INTEGRATION — VALIDACIÓN + PROMEDIO MÓVIL
// ============================================================================

/**
 * EJERCICIO 2: Implementa un test que valide una serie de resultados
 *
 * Escenario: Un paciente tiene estos resultados de glucosa en 5 días
 * Necesitas:
 *   1. Validar CADA resultado (normal, anormal, crítico)
 *   2. Calcular el promedio móvil de 3 días
 *   3. Verificar que el último promedio está en rango
 *
 * Pista: Usa un array de LabResult, valida cada uno, calcula promedios
 * Pista: En clínica, si el promedio móvil sube consistentemente = puede ser alerta
 */
describe('validateLabResult — Caso Integrado', () => {
  it('debería validar múltiples resultados de un paciente', () => {
    // Glucosa normal en ayunas: 70-100 mg/dL
    const results: LabResult[] = [
      {
        testName: 'Glucosa',
        value: 95,
        unit: 'mg/dL',
        normalRange: { min: 70, max: 100 },
        timestamp: new Date('2024-04-01'),
        patientId: 'PAT-004',
      },
      {
        testName: 'Glucosa',
        value: 98,
        unit: 'mg/dL',
        normalRange: { min: 70, max: 100 },
        timestamp: new Date('2024-04-02'),
        patientId: 'PAT-004',
      },
      {
        testName: 'Glucosa',
        value: 102,
        unit: 'mg/dL',
        normalRange: { min: 70, max: 100 },
        timestamp: new Date('2024-04-03'),
        patientId: 'PAT-004',
      },
    ];

    // Arrow function necesaria: .map() pasa (item, index, array) y el índice
    // sería interpretado como el logger si pasamos validateLabResult directamente
    const validations = results.map(result => validateLabResult(result));

    // Primeros dos son normales
    expect(validations[0].isValid).toBe(true);
    expect(validations[1].isValid).toBe(true);

    // Último es anormal (pero no crítico)
    expect(validations[2].isValid).toBe(false);
    expect(validations[2].isAbnormal).toBe(true);
    expect(validations[2].isCritical).toBe(false);
  });

  // Implementar - Test que calcula promedio móvil de resultados
  // Verifica que el promedio está en rango (incluso si los valores no)
  it('debería calcular el promedio movil de los resultados de un paciente', () => {
    const results: LabResult[] = [
      {
        testName: 'Glucosa',
        value: 95,
        unit: 'mg/dL',
        normalRange: { min: 70, max: 100 },
        timestamp: new Date('2024-04-01'),
        patientId: 'PAT-004',
      },
      {
        testName: 'Glucosa',
        value: 98,
        unit: 'mg/dL',
        normalRange: { min: 70, max: 100 },
        timestamp: new Date('2024-04-02'),
        patientId: 'PAT-004',
      },
      {
        testName: 'Glucosa',
        value: 102,
        unit: 'mg/dL',
        normalRange: { min: 70, max: 100 },
        timestamp: new Date('2024-04-03'),
        patientId: 'PAT-004',
      },
    ];

    const values = results.map(result => result.value);
    const averages = calculateMovingAverage(values, results.length)

    expect(averages).toHaveLength(1);
    expect(averages[0]).toBeCloseTo(98.33, 1);
    expect(averages[0]).toBeGreaterThanOrEqual(70);
    expect(averages[0]).toBeLessThanOrEqual(100);
  });
});

// ============================================================================
// NOTAS DE APRENDIZAJE día 1-2: TESTING UNITARIO Y DS&A
// ============================================================================

/**
 * CONCEPTOS CLAVE — Testing Unitario
 *
 * 1. ARRANGE-ACT-ASSERT (AAA Pattern)
 *    - ARRANGE: Setup fixtures y datos
 *    - ACT: Llamar la función bajo test
 *    - ASSERT: Verificar resultados
 *
 *    Ejemplo:
 *    ```
 *    // ARRANGE
 *    const result = { value: 100, range: [0, 150] };
 *
 *    // ACT
 *    const validation = validateLabResult(result);
 *
 *    // ASSERT
 *    expect(validation.isValid).toBe(true);
 *    ```
 *
 * 2. FIXTURES (beforeEach)
 *    - Setup repetido antes de cada test
 *    - Evita duplicación
 *    - Mantiene tests secos (DRY)
 *
 * 3. TESTING BOUNDARY CONDITIONS
 *    - Testing en mínimo y máximo exactos
 *    - Testing justo afuera de los boundaries
 *    - Esto es donde bugs se esconden
 *
 * 4. DS&A EN TESTS
 *    - Sliding window pattern aquí verifica O(n) correctness
 *    - Tests documentan el algoritmo
 *    - Ejercicios refuerzan aprendizaje
 *
 * 5. HEALTHCARE CONTEXT
 *    - Cada test representa un caso clínico real
 *    - Valores críticos pueden indicar emergencia médica
 *    - El software NO PUEDE fallar aquí
 *
 * PRÓXIMO PASO:
 * - Ejecuta: pnpm test:run src/unit/task-validator.test.ts
 * - modo watch: pnpm test src/unit/task-validator.test.ts
 * - Implementa los ejercicios (sections con TODO)
 * - Alcanza 100% cobertura en este archivo
 * - Lee los mensajes de error; aprende de ellos
 */

/**
 * NOTAS PERSONALES:
 * que son los tests de DS&A y por qué son importantes?
 * - Son tests que verifican la lógica de algoritmos y estructuras de datos.
 * - Aseguran que tu implementación es correcta y eficiente.
 * - En este caso, el sliding window pattern reduce la complejidad de O(n*m) a O(n).
 * - Esto es crucial en sistemas clínicos donde el rendimiento puede afectar decisiones médicas.
 * 
 * Sliding window es un patrón que optimiza cálculos de promedios móviles.
 * lo podríamos considerar como "una ventana de oportunidad para descartar fluctuaciones mínimas". 
 * En ingeniería y análisis de datos, a esto le llamamos formalmente Low-pass Filter (Filtro de paso bajo), porque deja pasar las tendencias lentas y "bloquea" los cambios rápidos y nerviosos.
 * podríamos tomar windowSize como el zoom de una cámara:
 * Zoom muy cerca (Window pequeño): Ves cada bache y cada piedra en el camino. Útil si necesitas precisión milimétrica inmediata, pero agotador si solo quieres saber hacia dónde vas.
 * Zoom alejado (Window grande): Los baches desaparecen y solo ves la curva de la carretera. Es la "foto general".
 * a tomar en cuenta: cuanto más grande sea tu ventana para descartar esas fluctuaciones, más tardará el promedio en reaccionar cuando ocurra un cambio real y permanente.
 * en donde podemos ver esta lógica? 
 * Rate Limiting (cuántas peticiones permitimos por segundo).
 * Monitoreo de CPU (para no mandar alertas si el procesador sube a 100% solo por medio segundo).
 * Sensores de IoT (temperatura, humedad).
 *
 *
 */

// ============================================================================
// DÍA 4: MOCKS Y SPIES — VERIFICAR COMPORTAMIENTO DEL LOGGER
// ============================================================================

/**
 * ¿Qué es un Mock?
 * Un mock es una función FALSA que reemplaza a la real.
 * vi.fn() crea esa función falsa y además GRABA todo lo que le pasan.
 *
 * ¿Para qué sirve en clínica?
 * En un sistema real el logger enviaría alertas a enfermería.
 * En tests NO queremos mandar alertas reales — usamos un mock
 * que simula el logger y nos deja verificar que se llamó correctamente.
 *
 * Analogía de auditoría: es como hacer una auditoría con documentos de prueba
 * en lugar de documentos reales — verificas el proceso sin riesgo.
 */
describe('validateLabResult — Mocks & Spies (DÍA 4)', () => {
  // Fixture compartido: resultado normal de hemoglobina
  let normalResult: LabResult;
  let abnormalResult: LabResult;
  let criticalResult: LabResult;

  beforeEach(() => {
    normalResult = {
      testName: 'Hemoglobina',
      value: 14.5,
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-001',
    };

    abnormalResult = {
      testName: 'Hemoglobina',
      value: 11.5,      // Anormal pero no crítico
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-002',
    };

    criticalResult = {
      testName: 'Hemoglobina',
      value: 9.0,       // Crítico: < 12 - (5*0.2) = 11
      unit: 'g/dL',
      normalRange: { min: 12, max: 17 },
      timestamp: new Date(),
      patientId: 'PAT-003',
    };
  });

  // --------------------------------------------------------------------------
  // CONCEPTO 1: vi.fn() — Mock básico
  // Un mock graba cuántas veces fue llamado y con qué argumentos
  // --------------------------------------------------------------------------

  it('debería llamar al logger UNA vez por validación', () => {
    // ARRANGE: Crear un mock — función falsa que graba sus llamadas
    const logger = vi.fn();

    // ACT: Llamar a validateLabResult CON el logger
    validateLabResult(normalResult, logger);

    // ASSERT: Verificar que el logger fue llamado exactamente una vez
    // toHaveBeenCalledOnce() — Vitest verifica el conteo de llamadas
    expect(logger).toHaveBeenCalledOnce();
  });

  it('debería NO llamar al logger si no se proporciona', () => {
    // ARRANGE: No pasamos logger (es opcional)
    // ACT: Llamar SIN logger — no debería crashear
    const result = validateLabResult(normalResult);

    // ASSERT: La función retorna correctamente aunque no haya logger
    expect(result.isValid).toBe(true);
    // Nota: no hay logger que verificar — simplemente no explotó
  });

  // --------------------------------------------------------------------------
  // CONCEPTO 2: toHaveBeenCalledWith — Verificar argumentos del mock
  // No solo importa QUE se llamó, sino CON QUÉ se llamó
  // --------------------------------------------------------------------------

  it('debería llamar al logger con mensaje OK para resultado normal', () => {
    // ARRANGE
    const logger = vi.fn();

    // ACT
    validateLabResult(normalResult, logger);

    // ASSERT: El mensaje debe contener "OK" y el ID del paciente
    // expect.stringContaining() verifica substring — no necesitas el mensaje exacto
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining('OK')
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining('PAT-001')
    );
  });

  it('debería llamar al logger con mensaje ANORMAL para resultado anormal', () => {
    const logger = vi.fn();

    validateLabResult(abnormalResult, logger);

    // El mensaje debe indicar ANORMAL (no CRÍTICO)
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining('ANORMAL')
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining('PAT-002')
    );
  });

  it('debería llamar al logger con mensaje CRÍTICO para resultado crítico', () => {
    const logger = vi.fn();

    validateLabResult(criticalResult, logger);

    // El mensaje debe indicar CRÍTICO — en clínica esto dispara alertas inmediatas
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining('CRÍTICO')
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining('PAT-003')
    );
  });

  // --------------------------------------------------------------------------
  // CONCEPTO 3: vi.spyOn — Spy sobre función REAL
  // A diferencia del mock, el spy deja que la función original ejecute
  // pero registra cómo fue llamada
  // --------------------------------------------------------------------------

  it('debería registrar todas las ramas del logger en una validación múltiple', () => {
    // ARRANGE: Un spy sobre console.log (función real del sistema)
    const consoleSpy = vi.spyOn(console, 'log');

    // Usar console.log como logger para los tres casos
    validateLabResult(normalResult, console.log);
    validateLabResult(abnormalResult, console.log);
    validateLabResult(criticalResult, console.log);

    // ASSERT: Se llamó 3 veces — una por cada resultado
    expect(consoleSpy).toHaveBeenCalledTimes(3);

    // Cleanup: restaurar console.log original
    consoleSpy.mockRestore();
  });
});