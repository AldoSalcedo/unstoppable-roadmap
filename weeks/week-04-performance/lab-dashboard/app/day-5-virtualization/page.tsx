// DÍA 5: Laboratorio de Virtualización de Listas
// Solo renderiza lo que el usuario puede ver.

'use client';
import { useState } from 'react';
import { generatePatients } from '@/lib/mock-data';
import { PatientListNormal } from '@/components/day-5/PatientListNormal';
import { PatientListVirtual } from '@/components/day-5/PatientListVirtual';
import Link from 'next/link';

const PATIENT_COUNT = 10_000;
const patients = generatePatients(PATIENT_COUNT);

type Mode = 'virtual' | 'normal';

export default function Day5Page() {
  const [mode, setMode] = useState<Mode>('virtual');

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-3 inline-block">
          ← Volver al Hub
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Día 5: Virtualización de Listas</h1>
        <p className="text-slate-500 mt-1">
          Renderizar 10,000 elementos DOM es lento e innecesario.
          La virtualización mantiene solo los items visibles en el DOM.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total de pacientes', value: PATIENT_COUNT.toLocaleString('es'), color: 'text-slate-800' },
          { label: 'Nodos DOM sin virtual.', value: `${PATIENT_COUNT.toLocaleString('es')}`, color: 'text-red-600' },
          { label: 'Nodos DOM con virtual.', value: '~10–12', color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-sm text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setMode('virtual')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'virtual'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ✅ Lista Virtualizada (react-window)
        </button>
        <button
          onClick={() => setMode('normal')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'normal'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ❌ Lista Normal (todos en DOM)
        </button>
      </div>

      {mode === 'normal' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
          <strong>⚠️ Advertencia:</strong> Esto va a crear {PATIENT_COUNT.toLocaleString('es')} nodos DOM simultáneamente.
          Es intencional para que compares el rendimiento del scroll con la versión virtualizada.
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          {mode === 'virtual' ? 'Lista Virtualizada' : 'Lista Normal'}
        </h2>
        <span className={`text-sm font-medium ${mode === 'virtual' ? 'text-green-600' : 'text-red-600'}`}>
          {mode === 'virtual'
            ? `${PATIENT_COUNT.toLocaleString('es')} pacientes, ~10–12 nodos en DOM`
            : `${PATIENT_COUNT.toLocaleString('es')} pacientes, ${PATIENT_COUNT.toLocaleString('es')} nodos en DOM`}
        </span>
      </div>

      {mode === 'virtual'
        ? <PatientListVirtual patients={patients} />
        : <PatientListNormal patients={patients} />}

      {/* Cómo funciona */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mt-5 mb-4">
        <h2 className="font-semibold text-slate-800 mb-3">Cómo funciona la virtualización</h2>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p className="text-slate-400">{'// FixedSizeList de react-window'}</p>
          <p>{'<FixedSizeList'}</p>
          <p>{'  height={600}          // Altura visible del contenedor'}</p>
          <p>{'  itemCount={10_000}    // Total de items'}</p>
          <p>{'  itemSize={52}         // Altura de cada fila (px)'}</p>
          <p>{'  width="100%"'}</p>
          <p>{'  itemData={patients}   // Datos accesibles en la fila'}</p>
          <p>{'  overscanCount={3}     // Filas extra fuera del viewport'}</p>
          <p>{'>'}</p>
          <p>{'  {PatientRow}          // Solo renderiza filas visibles + overscan'}</p>
          <p>{'</FixedSizeList>'}</p>
        </div>
      </div>

      {/* Ejercicio */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">EJERCICIO</span>
          <h2 className="font-semibold text-slate-800">Implementa VariableSizeList</h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          La lista actual usa <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">FixedSizeList</code> (todas las filas miden 52px).
          Modifica <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">PatientListVirtual.tsx</code> para que los pacientes{' '}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">critical</code> tengan una fila de 80px
          que muestre también su presión arterial y temperatura completas.
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p className="text-slate-400">{'// Cambia a VariableSizeList'}</p>
          <p>{"import { VariableSizeList } from 'react-window';"}</p>
          <br />
          <p className="text-slate-400">{'// Define tamaño dinámico por índice'}</p>
          <p>{'const getItemSize = (index: number) =>'}</p>
          <p>{'  patients[index].status === "critical" ? 80 : 52;'}</p>
        </div>
      </div>
    </div>
  );
}
