// DÍA 1-7: Generador determinista de datos clínicos de prueba
// CONCEPTOS CLAVE: tipos TypeScript, generación seed-based, datos reproducibles
//
// Datos deterministas: el mismo seed siempre produce los mismos datos.
// Esto garantiza consistencia entre los demos de performance.

export type PatientStatus = 'stable' | 'critical' | 'monitoring';
export type Ward = 'UCI' | 'Cardiología' | 'Neurología' | 'Oncología' | 'Pediatría' | 'Urgencias';

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  ward: Ward;
  vitals: {
    hr: number;    // Frecuencia cardiaca (bpm)
    bp: string;    // Presión arterial (mmHg)
    spo2: number;  // Saturación de oxígeno (%)
    temp: number;  // Temperatura (°C)
  };
  status: PatientStatus;
}

// Linear congruential generator — simple pero determinista
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const FIRST_NAMES = [
  'María', 'Carlos', 'Ana', 'José', 'Laura',
  'Miguel', 'Elena', 'David', 'Sofía', 'Juan',
  'Isabel', 'Pedro', 'Carmen', 'Luis', 'Rosa',
  'Antonio', 'Lucía', 'Manuel', 'Sara', 'Pablo',
];

const LAST_NAMES = [
  'García', 'Martínez', 'López', 'González', 'Rodríguez',
  'Hernández', 'Torres', 'Flores', 'Rivera', 'Morales',
  'Jiménez', 'Díaz', 'Sánchez', 'Ruiz', 'Ramírez',
];

const WARDS: Ward[] = ['UCI', 'Cardiología', 'Neurología', 'Oncología', 'Pediatría', 'Urgencias'];

// Más pacientes "stable" que "critical" para reflejar la realidad clínica
const STATUSES: PatientStatus[] = ['stable', 'stable', 'stable', 'monitoring', 'critical'];

export function generatePatients(count: number, seed = 42): Patient[] {
  const rand = createRng(seed);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

  return Array.from({ length: count }, (_, i) => {
    const firstName = pick(FIRST_NAMES);
    const lastName1 = pick(LAST_NAMES);
    const lastName2 = pick(LAST_NAMES);
    const hr = 55 + Math.floor(rand() * 65);
    const sysBP = 100 + Math.floor(rand() * 70);
    const diaBP = 60 + Math.floor(rand() * 30);
    const temp = Math.round((36.0 + rand() * 2.0) * 10) / 10;
    const spo2 = 91 + Math.floor(rand() * 9);

    return {
      id: `PAT-${String(i + 1).padStart(5, '0')}`,
      name: `${firstName} ${lastName1} ${lastName2}`,
      mrn: `MRN-${(100000 + Math.floor(rand() * 900000)).toString()}`,
      age: 18 + Math.floor(rand() * 70),
      ward: pick(WARDS),
      vitals: { hr, bp: `${sysBP}/${diaBP}`, spo2, temp },
      status: pick(STATUSES),
    };
  });
}
