/**
 * validator.bench.ts — Benchmarks de Performance del Validador
 * DÍA 6: Performance Testing | Medir velocidad en escenarios clínicos reales
 *
 * ¿Por qué medir performance en clínica?
 * Un laboratorio grande procesa ~10,000 resultados por turno.
 * Si la validación es lenta, el médico espera → pacientes esperan → riesgo clínico.
 *
 * Regla de negocio: validar 10,000 resultados debe tomar < 100ms.
 *
 * ¿Qué es un benchmark vs un test?
 * - TEST: ¿El resultado es CORRECTO? (pass/fail)
 * - BENCHMARK: ¿El resultado es RÁPIDO? (ops/segundo, ms por operación)
 * Ambos son necesarios en software clínico.
 */

import { bench, describe } from 'vitest';
import { validateLabResult, calculateMovingAverage, type LabResult } from './validator';

// ============================================================================
// FIXTURES DE DATOS (Generadores de datos clínicos)
// ============================================================================

/**
 * Genera N resultados de lab con valores variados
 * Mezcla de normales, anormales y críticos para simular carga real
 */
function generateLabResults(count: number): LabResult[] {
  return Array.from({ length: count }, (_, i) => ({
    testName: 'Hemoglobina',
    // Alterna entre normal (14.5), anormal (11.5) y crítico (9.0)
    value: i % 3 === 0 ? 14.5 : i % 3 === 1 ? 11.5 : 9.0,
    unit: 'g/dL',
    normalRange: { min: 12, max: 17 },
    timestamp: new Date(),
    patientId: `PAT-${i.toString().padStart(4, '0')}`,
  }));
}

// ============================================================================
// BENCHMARK 1: validateLabResult — Escalabilidad
// ============================================================================

describe('validateLabResult — Performance', () => {
  /**
   * Benchmark base: un solo resultado
   * Nos dice el costo por operación unitaria
   */
  bench('validar 1 resultado', () => {
    const result = generateLabResults(1)[0];
    validateLabResult(result);
  });

  /**
   * Benchmark de carga moderada: 100 resultados
   * Simula una consulta pequeña (un paciente hospitalizado, resultados del día)
   */
  bench('validar 100 resultados', () => {
    const results = generateLabResults(100);
    results.forEach(result => validateLabResult(result));
  });

  /**
   * Benchmark de carga alta: 1,000 resultados
   * Simula un turno de laboratorio de clínica mediana
   */
  bench('validar 1,000 resultados', () => {
    const results = generateLabResults(1000);
    results.forEach(result => validateLabResult(result));
  });

  /**
   * Benchmark de carga máxima: 10,000 resultados
   * REGLA DE NEGOCIO: debe completarse en < 100ms
   * Si este benchmark supera 100ms, hay un problema de performance
   */
  bench('validar 10,000 resultados (límite clínico)', () => {
    const results = generateLabResults(10_000);
    results.forEach(result => validateLabResult(result));
  });
});

// ============================================================================
// BENCHMARK 2: calculateMovingAverage — Sliding Window vs Fuerza Bruta
// ============================================================================

/**
 * Aquí comparamos el algoritmo de Sliding Window (O(n)) contra
 * la alternativa de fuerza bruta (O(n*m)) para demostrar la diferencia.
 *
 * Contexto clínico: calcular promedios móviles de glucosa en 30 días
 * para 500 pacientes simultáneamente.
 */
describe('calculateMovingAverage — Sliding Window vs Fuerza Bruta', () => {
  const glucoseReadings = Array.from({ length: 1000 }, () =>
    70 + Math.random() * 50 // Glucosa aleatoria entre 70-120 mg/dL
  );

  bench('sliding window — 1,000 valores, ventana 7 días', () => {
    calculateMovingAverage(glucoseReadings, 7);
  });

  bench('fuerza bruta — 1,000 valores, ventana 7 días', () => {
    // Mismo cálculo pero con slice + reduce (O(n*m))
    const windowSize = 7;
    const result: number[] = [];
    for (let i = 0; i <= glucoseReadings.length - windowSize; i++) {
      const sum = glucoseReadings
        .slice(i, i + windowSize)
        .reduce((acc, val) => acc + val, 0);
      result.push(sum / windowSize);
    }
  });
});

// ============================================================================
// BENCHMARK 3: Con Logger vs Sin Logger
// ============================================================================

/**
 * Mide el overhead de tener un logger activo.
 * En producción, el logger envía alertas a enfermería — ¿cuánto cuesta?
 */
describe('validateLabResult — Overhead del Logger', () => {
  const results = generateLabResults(1000);
  const silentLogger = (_msg: string) => { /* no-op */ };

  bench('sin logger', () => {
    results.forEach(result => validateLabResult(result));
  });

  bench('con logger no-op (sin I/O)', () => {
    results.forEach(result => validateLabResult(result, silentLogger));
  });
});
