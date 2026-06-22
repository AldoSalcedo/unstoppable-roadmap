/**
 * process-lab-test.test.ts — Test de integración: flujo completo de procesamiento
 * DÍA 7: Integration & Review
 *
 * Qué verifica este test:
 * - Las 4 capas están conectadas correctamente (Domain → Application → Infrastructure)
 * - El Use Case orquesta bien: crea la entidad, la persiste, retorna el DTO correcto
 * - La lógica de dominio funciona (isAbnormal, isCritical, requiresFollowUp)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestContainer } from '../../src/infrastructure/di/container';

// ============================================================================
// DATOS DE PRUEBA — casos clínicos reales de glucosa (mg/dL)
// Rango normal: 70–100 mg/dL
// ============================================================================

const GLUCOSE_RANGE = { min: 70, max: 100, unit: 'mg/dL' };

const baseInput = {
  patientId: 'patient-001',
  testName: 'Glucosa',
  unit: GLUCOSE_RANGE.unit,
  normalRangeMin: GLUCOSE_RANGE.min,
  normalRangeMax: GLUCOSE_RANGE.max,
  takenAt: '2026-06-15T10:00:00Z',
};

// ============================================================================
// TESTS
// ============================================================================

describe('ProcessLabTestUseCase — integración completa', () => {

  // CASO 1: Resultado normal
  it('retorna isAbnormal=false para glucosa dentro del rango (85 mg/dL)', async () => {
    const { processLabTestUseCase } = buildTestContainer();

    const result = await processLabTestUseCase.execute({ ...baseInput, value: 85 });

    assert.equal(result.isAbnormal, false);
    assert.equal(result.isCritical, false);
    assert.equal(result.requiresFollowUp, false);
  });

  // CASO 2: Resultado anormal (sobre el límite)
  it('retorna isAbnormal=true para glucosa sobre el rango (130 mg/dL)', async () => {
    const { processLabTestUseCase } = buildTestContainer();

    const result = await processLabTestUseCase.execute({ ...baseInput, value: 130 });

    assert.equal(result.isAbnormal, true);
    assert.equal(result.isCritical, false);
  });

  // CASO 3: Resultado crítico (>2x el máximo = >200 mg/dL)
  it('retorna isCritical=true y requiresFollowUp=true para glucosa crítica (300 mg/dL)', async () => {
    const { processLabTestUseCase } = buildTestContainer();

    const result = await processLabTestUseCase.execute({ ...baseInput, value: 300 });

    assert.equal(result.isAbnormal, true);
    assert.equal(result.isCritical, true);
    assert.equal(result.requiresFollowUp, true);
  });

  // CASO 4: El LabTest se persiste correctamente en el repositorio
  it('guarda el LabTest en el repositorio y se puede recuperar por patientId', async () => {
    const { processLabTestUseCase, labTestRepository } = buildTestContainer();

    await processLabTestUseCase.execute({ ...baseInput, value: 95 });

    const saved = await labTestRepository.findByPatientId('patient-001');
    assert.equal(saved.length, 1);
    assert.equal(saved[0]?.testName, 'Glucosa');
    assert.equal(saved[0]?.value, 95);
  });

  // CASO 5: El output DTO tiene el labTestId generado (no vacío)
  it('retorna un labTestId único y no vacío', async () => {
    const { processLabTestUseCase } = buildTestContainer();

    const result = await processLabTestUseCase.execute({ ...baseInput, value: 85 });

    assert.ok(result.labTestId.length > 0);
  });

  // CASO 6: Dos ejecuciones generan IDs distintos
  it('genera IDs únicos en cada ejecución', async () => {
    const { processLabTestUseCase } = buildTestContainer();

    const result1 = await processLabTestUseCase.execute({ ...baseInput, value: 85 });
    const result2 = await processLabTestUseCase.execute({ ...baseInput, value: 90 });

    assert.notEqual(result1.labTestId, result2.labTestId);
  });

});
