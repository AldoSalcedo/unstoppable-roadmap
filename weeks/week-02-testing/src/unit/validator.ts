/**
 * validator.ts — Lógica de Validación de Resultados de Laboratorio
 * DÍA 5: Coverage Reports — Separar implementación de tests para medir cobertura real
 *
 * ¿Por qué separar implementación de tests?
 * - Vitest solo mide cobertura de archivos IMPORTADOS por los tests
 * - Si la lógica está dentro del test file, coverage = 0%
 * - En proyectos reales, implementación y tests siempre van en archivos distintos
 */

// ============================================================================
// TIPOS Y INTERFACES (Dominio Clínico)
// ============================================================================

export type NormalRange = {
  min: number;
  max: number;
};

export type LabResult = {
  testName: string;
  value: number;
  unit: string;
  normalRange: NormalRange;
  timestamp: Date;
  patientId: string;
};

export type ValidationResult = {
  isValid: boolean;
  isAbnormal: boolean;
  isCritical: boolean;
  message: string;
};

// ============================================================================
// IMPLEMENTACIÓN
// ============================================================================

/**
 * Valida si un resultado de laboratorio está dentro del rango normal.
 *
 * REGLAS DE NEGOCIO:
 * - Normal:   valor >= min AND valor <= max
 * - Anormal:  fuera de rango pero dentro del margen crítico
 * - Crítico:  valor < (min - 20%) OR valor > (max + 20%)
 */
export function validateLabResult(
  result: LabResult,
  logger?: (message: string) => void
): ValidationResult {
  const isInRange =
    result.value >= result.normalRange.min &&
    result.value <= result.normalRange.max;

  const margin = (result.normalRange.max - result.normalRange.min) * 0.2;
  const isCritical =
    result.value < result.normalRange.min - margin ||
    result.value > result.normalRange.max + margin;

  const validationResult: ValidationResult = {
    isValid: isInRange,
    isAbnormal: !isInRange,
    isCritical,
    message: isInRange
      ? `OK: ${result.testName} en rango normal`
      : isCritical
        ? `⚠️ CRÍTICO: ${result.testName} requiere atención inmediata`
        : `⚡ ANORMAL: ${result.testName} fuera de rango`,
  };

  logger?.(`[${result.patientId}] ${validationResult.message}`);

  return validationResult;
}

/**
 * Calcula el promedio móvil de una serie de valores usando Sliding Window.
 * Complejidad: O(n) vs O(n*m) del método de fuerza bruta.
 *
 * Contexto clínico: permite ver tendencias de un valor a lo largo del tiempo
 * sin que fluctuaciones aisladas generen falsas alarmas.
 */
export function calculateMovingAverage(
  values: number[],
  windowSize: number
): number[] {
  if (values.length < windowSize) return [];

  const result: number[] = [];
  let windowSum = 0;
  let windowStart = 0;

  for (let windowEnd = 0; windowEnd < values.length; windowEnd++) {
    windowSum += values[windowEnd];

    if (windowEnd >= windowSize - 1) {
      result.push(windowSum / windowSize);
      windowSum -= values[windowStart];
      windowStart++;
    }
  }

  return result;
}
