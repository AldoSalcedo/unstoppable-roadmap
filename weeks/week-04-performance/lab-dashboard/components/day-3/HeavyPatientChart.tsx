// DÍA 3: Componente "pesado" para demostrar lazy loading
// CONCEPTOS CLAVE: component-level code splitting, dynamic import, Suspense
//
// Este componente se carga bajo demanda con React.lazy.
// Al no estar en el bundle inicial, el tiempo de carga inicial es menor.
// Abre DevTools → Network y observa la nueva request al cargar este componente.

'use client';
import { useMemo } from 'react';
import type { Patient } from '@/lib/mock-data';

interface Props {
  patients: Patient[];
}

// Cómputo de estadísticas clínicas (simula procesamiento pesado de datos)
function computeStats(patients: Patient[]) {
  const byWard = patients.reduce<Record<string, number>>((acc, p) => {
    acc[p.ward] = (acc[p.ward] ?? 0) + 1;
    return acc;
  }, {});

  const avgHr   = patients.reduce((s, p) => s + p.vitals.hr, 0) / patients.length;
  const avgSpo2 = patients.reduce((s, p) => s + p.vitals.spo2, 0) / patients.length;
  const criticalCount   = patients.filter(p => p.status === 'critical').length;
  const monitoringCount = patients.filter(p => p.status === 'monitoring').length;

  return { byWard, avgHr, avgSpo2, criticalCount, monitoringCount };
}

// Default export requerido por React.lazy
export default function HeavyPatientChart({ patients }: Props) {
  const stats = useMemo(() => computeStats(patients), [patients]);

  return (
    <div className="bg-white border border-emerald-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-slate-800">Analytics: Distribución por Sala</h3>
        <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          cargado bajo demanda
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Pacientes',    value: patients.length.toLocaleString() },
          { label: 'FC Promedio',        value: `${stats.avgHr.toFixed(0)} bpm` },
          { label: 'SpO₂ Promedio',      value: `${stats.avgSpo2.toFixed(1)}%` },
          { label: 'Estado Crítico',     value: stats.criticalCount.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xl font-mono font-bold text-slate-800">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {Object.entries(stats.byWard)
          .sort(([, a], [, b]) => b - a)
          .map(([ward, count]) => {
            const pct = (count / patients.length) * 100;
            return (
              <div key={ward} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-28 shrink-0">{ward}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${pct}%` }}
                  >
                    <span className="text-xs text-white font-medium">{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500 w-8 text-right">{count}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/**
 * NOTAS PERSONALES:
 * - Este componente simula un procesamiento pesado de datos para justificar su carga bajo demanda.
 * - Al usar React.lazy, este código se separa en un chunk independiente que solo se descarga cuando se necesita.
 * - La función computeStats es memoizada para evitar cálculos innecesarios en re-renderizados.
 * - En un escenario real, podríamos cargar gráficos o visualizaciones más complejas aquí.
 * 
 * Dynamic Import (Importación Dinámica): Permite cargar módulos de JavaScript bajo demanda, en lugar de incluirlos en el bundle inicial. 
 * Esto mejora el rendimiento al reducir el tamaño del bundle que se descarga al cargar la página.
 * Tradicionalmente, en JavaScript utilizamos las importaciones estáticas al inicio de nuestro archivo,
 import { ReporteFinanciero } from './ReporteFinanciero'; // 📁 Carga inmediata
 * Esto significa que cuando el usuario entra a la página, su navegador se ve obligado a descargar el código de ReporteFinanciero, incluso si el usuario nunca hace clic en la sección de finanzas.
 * Un Dynamic Import cambia las reglas del juego. Es una función especial introducida en JavaScript moderno que te permite importar un archivo o módulo solo cuando ocurre una acción (como un clic en un botón).
 * 
 * // El código se descarga de internet SOLO cuando el usuario presiona el botón
botónFinanzas.addEventListener('click', async () => {
    const { ReporteFinanciero } = await import('./ReporteFinanciero');
    ReporteFinanciero.render();
});

  * Nota Tecnica: import() es una función que devuelve una promesa. Cuando se resuelve, te da acceso al módulo que has importado.
  * Esto es especialmente útil para cargar componentes de React bajo demanda usando React.lazy, lo que permite dividir tu aplicación en partes más pequeñas y mejorar el rendimiento.
  * 
  * Component-Level Code Splitting (División de Código a Nivel de Componente):
  * Cuando tu herramienta de empaquetado (como Vite, Webpack o Next.js) ve un import() dinámico en tu código, realiza un proceso llamado Code Splitting (División de Código).
  * En lugar de empaquetar toda tu aplicación en un solo archivo gigante (bundle.js), el empaquetador lo rompe en "pedacitos" independientes llamados chunks.
  * Cuando aplicamos esto específicamente a componentes de interfaz (por ejemplo, en React), se llama Component-Level Code Splitting. Significa que un componente pesado 
  * (como un editor de texto enriquecido, un mapa de Google Maps, o una gráfica compleja) se separa en su propio "pedacito" de archivo y no se descarga hasta que el componente se vaya a renderizar en la pantalla.
  * 
  * En React, esto se logra combinando el Dynamic Import con React.lazy y Suspense
  * 
  * Suspense: Es un componente nativo de React que actúa como un "placeholder" mientras de carga un componente que se ha importado dinámicamente.
  * Puedes Mostrar un spinner, un esqueleto de carga o cualquier otro indicador visual para mejorar la experiencia del usuario mientras espera que el componente pesado termine de cargar.
  * 
  * si el skeleton tiene las mismas dimensiones que el contenido real, cuando el componente carga no hay saltos de layout (CLS = 0). Si el skeleton es mucho más pequeño que el componente real, el contenido empuja la página hacia abajo al aparecer — eso es CLS.
  * CLS significa Cumulative Layout Shift (en español, Desplazamiento de Diseño Acumulado). Es una métrica de rendimiento web que mide la cantidad de cambio inesperado en el diseño de una página mientras se carga.
 */