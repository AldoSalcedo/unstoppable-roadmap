// DÍA 2: Laboratorio interactivo de memoización
// CONCEPTOS CLAVE: render comparison, useCallback para props estables, useMemo para cálculos

'use client';
import { useState, useCallback, useMemo } from 'react';
import { PatientCard } from './PatientCard';
import { PatientCardMemo } from './PatientCardMemo';
import type { Patient } from '@/lib/mock-data';

const DISPLAY_COUNT = 5;

export function MemoLab({ patients }: { patients: Patient[] }) {
  const [query, setQuery] = useState('');
  const [forceCount, setForceCount] = useState(0);

  const displayPatients = patients.slice(0, DISPLAY_COUNT);

  // useCallback: referencia estable para onDischarge
  // Sin useCallback → nueva función en cada render del padre
  // → memo del hijo compara las props y ve una función diferente → re-renderiza igual
  // Con useCallback → misma referencia → memo puede saltar el re-render correctamente
  const handleDischarge = useCallback((id: string) => {
    console.log('[Día 2] Alta médica solicitada:', id);
  }, []);

  // EJERCICIO 3: Este filtrado se recalcula en cada render del padre
  // aunque `query` y `patients` no hayan cambiado.
  // Optimiza con: useMemo(() => patients.filter(...).length, [patients, query])
  const filteredCount = useMemo(() => { 
    return patients.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    ).length;
  }, [patients, query]);

  return (
    <div className="space-y-5">
      {/* Controles */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-100 rounded-xl">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar paciente... (cambia estado del padre)"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[220px] bg-white"
        />
        <button
          onClick={() => setForceCount(c => c + 1)}
          className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors font-medium"
        >
          Forzar Re-render Padre ({forceCount})
        </button>
        <span className="text-sm text-slate-600">
          Resultados: <strong>{filteredCount}</strong>
        </span>
      </div>

      {/* Explicación visual */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="font-semibold text-red-700 mb-1">Sin React.memo ❌</p>
          <p className="text-red-600 text-xs">
            Re-renderiza siempre que el padre cambia, aunque las props no cambien.
            El flash amarillo y el contador suben en cada acción.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="font-semibold text-green-700 mb-1">Con React.memo ✅ (tu ejercicio)</p>
          <p className="text-green-600 text-xs">
            Después de agregar memo(), el contador no sube al presionar
            `&quot;Forzar Re-render&quot;` porque las props no cambiaron.
          </p>
        </div>
      </div>

      {/* Comparación lado a lado */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            PatientCard (sin memo)
          </h3>
          <div className="space-y-2">
            {displayPatients.map(p => (
              <PatientCard key={p.id} patient={p} onDischarge={handleDischarge} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            PatientCardMemo (agregar memo aquí)
          </h3>
          <div className="space-y-2">
            {displayPatients.map(p => (
              <PatientCardMemo key={p.id} patient={p} onDischarge={handleDischarge} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
