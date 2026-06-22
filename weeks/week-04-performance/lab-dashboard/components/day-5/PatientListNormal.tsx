// DÍA 5: Lista SIN virtualización — renderiza TODOS los elementos
// CONCEPTOS CLAVE: DOM nodes, render all items, performance degradation
//
// ❌ PROBLEMA: Con 10,000 pacientes, React crea 10,000 nodos DOM.
// Esto consume memoria, hace lento el scroll y degrada el rendimiento.
// El usuario solo ve ~8-10 items a la vez, pero todos están en memoria.

'use client';
import type { Patient } from '@/lib/mock-data';

const STATUS_STYLES = {
  stable:     'bg-green-100 text-green-800',
  critical:   'bg-red-100 text-red-800',
  monitoring: 'bg-amber-100 text-amber-800',
} as const;

interface Props {
  patients: Patient[];
}

export function PatientListNormal({ patients }: Props) {
  return (
    <div className="h-[600px] overflow-y-auto border border-slate-200 rounded-xl bg-white">
      <div className="p-2 space-y-0.5">
        {/* ❌ Se renderizan TODOS los pacientes de una vez */}
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {patient.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 leading-tight">{patient.name}</p>
                <p className="text-xs text-slate-500">{patient.mrn} · {patient.ward}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono text-slate-500 hidden sm:block">
                {patient.vitals.hr}bpm · {patient.vitals.spo2}%
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[patient.status]}`}>
                {patient.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
