// DÍA 3: Laboratorio de Code Splitting
// El bundle inicial debe ser lo más pequeño posible.
// Carga código solo cuando el usuario lo necesita.

'use client';
import { useState, lazy, Suspense } from 'react';
import { generatePatients } from '@/lib/mock-data';
import Link from 'next/link';

const patients = generatePatients(500);

// React.lazy: HeavyPatientChart NO está en el bundle inicial.
// Se descarga solo cuando showChart pasa a true.
// Abre DevTools → Network y observa la nueva request al hacer clic.
const HeavyPatientChart = lazy(() => import('@/components/day-3/HeavyPatientChart'));

function ChartSkeleton() {
  return (
    // Mismo border color que el chart real (emerald-200) → sin salto visual al cargar
    <div className="bg-white border border-emerald-200 rounded-xl p-6 animate-pulse">
      {/* Header: misma estructura que el chart (título + badge) */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-56 bg-slate-200 rounded" />
        <div className="h-5 w-28 bg-emerald-100 rounded-full" />
      </div>

      {/* 4 stat cards — mismo layout que bg-slate-50 rounded-lg p-3 text-center */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="h-7 w-16 bg-slate-200 rounded mx-auto mb-1" />
            <div className="h-3 w-20 bg-slate-100 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Barras: 3 columnas igual que el chart real (ward | bar | count) */}
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-28 shrink-0 bg-slate-100 rounded" />
            <div className="flex-1 bg-slate-100 rounded-full h-5" />
            <div className="h-4 w-8 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Day3Page() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-3 inline-block">
          ← Volver al Hub
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Día 3: Code Splitting</h1>
        <p className="text-slate-500 mt-1">
          Reduce el bundle inicial. Descarga código solo cuando el usuario lo necesita.
        </p>
      </div>

      {/* Comparación conceptual */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          {
            title: 'Sin Code Splitting',
            color: 'bg-red-50 border-red-200',
            textColor: 'text-red-700',
            code: ["import HeavyChart from './HeavyChart';", "// Se descarga siempre, lo use o no"],
            description: 'Todo el código en un solo bundle. El usuario descarga código que quizás nunca usa.',
          },
          {
            title: 'Con Code Splitting',
            color: 'bg-green-50 border-green-200',
            textColor: 'text-green-700',
            code: ["const HeavyChart = lazy(() => import('./HeavyChart'));", "// Se descarga solo cuando se renderiza"],
            description: 'Chunks separados por ruta o componente. Bundle inicial más pequeño = carga más rápida.',
          },
        ].map(({ title, color, textColor, code, description }) => (
          <div key={title} className={`border rounded-xl p-5 ${color}`}>
            <h3 className={`font-semibold mb-2 ${textColor}`}>{title}</h3>
            <p className="text-sm text-slate-600 mb-3">{description}</p>
            <div className="bg-slate-900 rounded-lg p-3">
              {code.map((line, i) => (
                <p key={i} className="text-xs font-mono text-slate-200">{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Demo interactivo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-2">Demo: Carga bajo demanda</h2>
        <p className="text-sm text-slate-600 mb-4">
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">HeavyPatientChart</code> no está en el bundle inicial.
          Abre DevTools → Network y observa la nueva request al hacer clic.
        </p>
        <button
          onClick={() => setShowChart(true)}
          disabled={showChart}
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-5 font-medium"
        >
          {showChart ? '✅ Componente cargado' : 'Cargar Analytics de Pacientes →'}
        </button>

        {showChart && (
          <Suspense fallback={<ChartSkeleton />}>
            <HeavyPatientChart patients={patients} />
          </Suspense>
        )}
      </div>

      {/* Next.js App Router splitting automático */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-3">Route-Based Splitting (gratis en Next.js)</h2>
        <p className="text-sm text-slate-600 mb-3">
          El App Router de Next.js genera un chunk por página automáticamente.
          Cada ruta es su propio chunk que solo se descarga al navegar a ella.
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p className="text-slate-400">{'# Chunks generados automáticamente'}</p>
          <p>app/</p>
          <p className="ml-4 text-blue-300">{'├─ page.tsx              → chunk: /'}</p>
          <p className="ml-4 text-green-300">{'├─ day-1-profiling/page  → chunk: /day-1-profiling'}</p>
          <p className="ml-4 text-amber-300">{'└─ day-5-virtualization/ → chunk: /day-5-virtualization'}</p>
          <br />
          <p className="text-slate-400">{'# Cada chunk se descarga solo al navegar a esa ruta'}</p>
        </div>
      </div>

      {/* Ejercicio */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">EJERCICIO</span>
          <h2 className="font-semibold text-slate-800">Mejora el Skeleton de carga</h2>
        </div>
        <p className="text-sm text-slate-600">
          El skeleton actual es genérico. Crea un skeleton más fiel al layout real de{' '}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">HeavyPatientChart</code>.
          Un skeleton que coincide con el layout reduce la percepción de tiempo de carga (CLS = 0).
        </p>
      </div>
    </div>
  );
}
