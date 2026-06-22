// DÍA 7: Laboratorio de Monitoring & CI
// Las optimizaciones solo valen si se mantienen. Configura monitoreo continuo.

import { VitalsMonitor } from '@/components/day-7/VitalsMonitor';
import Link from 'next/link';

export default function Day7Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-3 inline-block">
          ← Volver al Hub
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Día 7: Monitoring & CI</h1>
        <p className="text-slate-500 mt-1">
          Una regresión de performance sin monitoreo puede pasar desapercibida semanas.
          Configura alertas automáticas con Lighthouse CI y Real User Monitoring.
        </p>
      </div>

      {/* Monitor en vivo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-1">Performance Budget Monitor — Sesión Actual</h2>
        <p className="text-sm text-slate-500 mb-4">
          Métricas reales capturadas por <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">web-vitals</code>.
          Navega entre páginas e interactúa para capturar INP.
        </p>
        <VitalsMonitor />
      </div>

      {/* Performance Budget */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-3">Performance Budget en CI (lighthouserc.js)</h2>
        <p className="text-sm text-slate-600 mb-3">
          Si alguna métrica supera el budget, el CI falla y bloquea el merge del PR.
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p className="text-slate-400">{'// lighthouserc.js'}</p>
          <p>{'module.exports = {'}</p>
          <p>{'  ci: {'}</p>
          <p>{'    collect: { numberOfRuns: 3 },'}</p>
          <p>{'    assert: {'}</p>
          <p>{'      assertions: {'}</p>
          <p className="text-green-400">{"        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],"}</p>
          <p className="text-green-400">{"        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],"}</p>
          <p className="text-green-400">{"        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],"}</p>
          <p className="text-green-400">{"        'total-blocking-time': ['warn', { maxNumericValue: 300 }],"}</p>
          <p className="text-green-400">{"        'interactive': ['error', { maxNumericValue: 3500 }],"}</p>
          <p>{'      },'}</p>
          <p>{'    },'}</p>
          <p>{'  },'}</p>
          <p>{'};'}</p>
        </div>
      </div>

      {/* RUM */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-3">Real User Monitoring (RUM)</h2>
        <p className="text-sm text-slate-600 mb-3">
          Lighthouse mide en condiciones controladas. RUM mide a usuarios reales con conexiones reales.
          Usa <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">navigator.sendBeacon</code> para no bloquear la navegación.
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p className="text-slate-400">{"// app/components/Analytics.tsx — cliente"}</p>
          <p>{"'use client';"}</p>
          <p>{"import { useEffect } from 'react';"}</p>
          <p>{"import { onCLS, onINP, onLCP } from 'web-vitals';"}</p>
          <br />
          <p>{"export function Analytics() {"}</p>
          <p>{"  useEffect(() => {"}</p>
          <p>{"    const send = ({ name, value, id }) => {"}</p>
          <p>{"      const body = JSON.stringify({ name, value, id });"}</p>
          <p className="text-green-400">{"      // sendBeacon no bloquea unload de la página"}</p>
          <p>{"      navigator.sendBeacon?.('/api/vitals', body)"}</p>
          <p>{"        ?? fetch('/api/vitals', { body, method: 'POST', keepalive: true });"}</p>
          <p>{"    };"}</p>
          <p>{"    onCLS(send); onINP(send); onLCP(send);"}</p>
          <p>{"  }, []);"}</p>
          <p>{"  return null;"}</p>
          <p>{"}"}</p>
        </div>
      </div>

      {/* GitHub Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-3">GitHub Actions — Lighthouse CI en cada PR</h2>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p className="text-slate-400">{'# .github/workflows/lighthouse.yml'}</p>
          <p>{'name: Lighthouse CI'}</p>
          <p>{'on: [pull_request]'}</p>
          <p>{'jobs:'}</p>
          <p>{'  lhci:'}</p>
          <p>{'    runs-on: ubuntu-latest'}</p>
          <p>{'    steps:'}</p>
          <p>{'      - uses: actions/checkout@v4'}</p>
          <p>{'      - uses: actions/setup-node@v4'}</p>
          <p>{'      - run: npm ci && npm run build'}</p>
          <p>{'      - name: Run Lighthouse CI'}</p>
          <p>{'        run: |'}</p>
          <p>{'          npm install -g @lhci/cli'}</p>
          <p className="text-green-400">{'          lhci autorun  # Lee lighthouserc.js y falla si no cumple budgets'}</p>
        </div>
      </div>

      {/* Ejercicio */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">EJERCICIO</span>
          <h2 className="font-semibold text-slate-800">Configura Lighthouse CI localmente</h2>
        </div>
        <ol className="space-y-2">
          {[
            { cmd: 'npm install -g @lhci/cli@latest', desc: 'Instala la CLI globalmente' },
            { cmd: 'npm run build', desc: 'Construye la app en modo producción' },
            { cmd: 'lhci wizard', desc: 'Asistente de configuración interactivo' },
            { cmd: 'lhci autorun', desc: 'Corre Lighthouse CI (usa lighthouserc.js)' },
          ].map(({ cmd, desc }, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 font-mono text-amber-600 font-bold">{i + 1}.</span>
              <div>
                <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">{cmd}</code>
                <span className="text-slate-600 ml-2">— {desc}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sm text-slate-600 mt-4">
          Al final, compara tu score actual con el baseline del Día 1.
          Documenta todas las optimizaciones aplicadas durante la semana.
        </p>
      </div>
    </div>
  );
}
