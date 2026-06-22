// DÍA 1: Laboratorio de Profiling y Medición
// Principio clave: nunca optimices lo que no has medido primero.

import { VitalsDisplay } from '@/components/day-1/VitalsDisplay';
import Link from 'next/link';

export default function Day1Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-3 inline-block">
          ← Volver al Hub
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Día 1: Profiling & Medición</h1>
        <p className="text-slate-500 mt-1">
          Establece el baseline antes de optimizar. Sin datos, no hay dirección.
        </p>
      </div>

      {/* Web Vitals en vivo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-1">Core Web Vitals — Esta Página (en vivo)</h2>
        <p className="text-sm text-slate-500 mb-4">
          Métricas capturadas en tiempo real por <code className="bg-slate-100 px-1 py-0.5 rounded">web-vitals</code>.
          INP requiere interacción del usuario (haz clic en algo).
        </p>
        <VitalsDisplay />
        <p className="text-xs text-slate-400 mt-3">
          Tip: abre DevTools → Performance → graba y navega entre páginas para ver un flamegraph completo.
        </p>
      </div>

      {/* Herramientas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {[
          {
            title: 'React DevTools Profiler',
            color: 'bg-blue-50 border-blue-200',
            steps: [
              'Instala la extensión React Developer Tools en Chrome/Firefox',
              'Abre DevTools → pestaña "⚛ React" → "Profiler"',
              'Haz clic en "Record" (círculo rojo)',
              'Interactúa con la app (navega, filtra, escribe)',
              'Detén la grabación y analiza el flame chart',
              'Identifica componentes que tardan > 5ms en renderizar',
            ],
            action: 'Objetivo: encontrar el componente más lento',
          },
          {
            title: 'Lighthouse Audit',
            color: 'bg-emerald-50 border-emerald-200',
            steps: [
              'DevTools → pestaña "Lighthouse"',
              'Selecciona "Performance" y "Mobile"',
              'Haz clic en "Analyze page load"',
              'Revisa el score y las "Opportunities"',
              'Documenta: LCP, TBT, CLS y Score total',
              'Guarda el reporte (botón "Export") para comparar al final',
            ],
            action: 'Objetivo: score > 85 al final de la semana',
          },
        ].map(({ title, color, steps, action }) => (
          <div key={title} className={`border rounded-xl p-5 ${color}`}>
            <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
            <ol className="space-y-1.5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600">
                  <span className="shrink-0 font-mono text-slate-400 tabular-nums">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm font-medium text-slate-700">→ {action}</p>
          </div>
        ))}
      </div>

      {/* Bundle analysis */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-3">Bundle Analysis</h2>
        <p className="text-sm text-slate-600 mb-3">
          Visualiza qué librerías están inflando tu JavaScript inicial.
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono space-y-1">
          <p className="text-slate-400"># Instala el analizador (solo una vez)</p>
          <p>npm install -D @next/bundle-analyzer</p>
          <br />
          <p className="text-slate-400"># Actualiza next.config.ts para habilitarlo</p>
          <p className="text-green-400">{'const withBundleAnalyzer = require("@next/bundle-analyzer")({'}</p>
          <p className="text-green-400">{'  enabled: process.env.ANALYZE === "true",'}</p>
          <p className="text-green-400">{'});'}</p>
          <p className="text-green-400">{'module.exports = withBundleAnalyzer(nextConfig);'}</p>
          <br />
          <p className="text-slate-400"># Genera el reporte visual</p>
          <p>ANALYZE=true npm run build</p>
        </div>
      </div>

      {/* Tabla de baseline */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">EJERCICIO</span>
          <h2 className="font-semibold text-slate-800">Establece el Baseline</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Documenta los valores actuales en la tabla de la semana. Estos son tu punto de partida.
        </p>
        <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100">
              <tr>
                {['Métrica', 'Antes (mídelo)', 'Target', 'Después (al final)'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-amber-800 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {[
                { metric: 'Lighthouse Score', target: '> 85' },
                { metric: 'LCP',              target: '< 2.5s' },
                { metric: 'INP',              target: '< 200ms' },
                { metric: 'CLS',              target: '< 0.1' },
                { metric: 'Bundle Size (gz)', target: '< 400 KB' },
              ].map(({ metric, target }) => (
                <tr key={metric}>
                  <td className="px-4 py-2.5 font-medium text-slate-700">{metric}</td>
                  <td className="px-4 py-2.5 text-slate-400 italic">—</td>
                  <td className="px-4 py-2.5 text-slate-600 font-mono">{target}</td>
                  <td className="px-4 py-2.5 text-slate-400 italic">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
