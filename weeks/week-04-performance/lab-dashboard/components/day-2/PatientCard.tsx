// DÍA 2: Componente SIN optimizar — re-renderiza siempre
// CONCEPTOS CLAVE: render innecesario, visualización de re-renders, render counter
//
// Este componente NO tiene React.memo, por lo que se re-renderiza cada vez
// que el padre cambia estado, aunque sus props no hayan cambiado en absoluto.
// Observa el contador de renders y el flash amarillo en cada re-render.

'use client';
import { useRef, useLayoutEffect } from 'react';
import type { Patient } from '@/lib/mock-data';

interface Props {
  patient: Patient;
  onDischarge: (id: string) => void;
}

const STATUS_STYLES = {
  stable:     'bg-green-100 text-green-800',
  critical:   'bg-red-100 text-red-800',
  monitoring: 'bg-amber-100 text-amber-800',
} as const;

// Sin memo — re-renderiza siempre que el padre cambia estado
export function PatientCard({ patient, onDischarge }: Props) {
  const renderCount = useRef(0);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // React 19 prohíbe mutar refs durante el render.
  // Hacemos todo en useLayoutEffect: corre de forma síncrona antes del paint,
  // así el usuario nunca ve un valor desactualizado.
  useLayoutEffect(() => {
    renderCount.current++;

    // Actualizamos el badge directamente por DOM (igual que la animación)
    // para no llamar setState y no provocar renders extra.
    if (badgeRef.current) {
      badgeRef.current.textContent = `render #${renderCount.current}`;
    }

    const el = containerRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight; // Fuerza reflow para reiniciar la animación
    el.style.animation = 'render-flash 0.6s ease-out';
  });

  return (
    <div ref={containerRef} className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium text-slate-800 text-sm">{patient.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{patient.mrn} · {patient.ward}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[patient.status]}`}>
            {patient.status}
          </span>
          <span ref={badgeRef} className="text-xs font-mono bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            render #0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-xs mb-3">
        {[
          { label: 'FC',   value: `${patient.vitals.hr}bpm` },
          { label: 'PA',   value: patient.vitals.bp },
          { label: 'SpO₂', value: `${patient.vitals.spo2}%` },
          { label: 'Temp', value: `${patient.vitals.temp}°C` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded p-1.5 text-center">
            <div className="text-slate-400 font-medium">{label}</div>
            <div className="text-slate-700 font-mono">{value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onDischarge(patient.id)}
        className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
      >
        Alta médica →
      </button>
    </div>
  );
}
