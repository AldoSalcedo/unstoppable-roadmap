// DÍA 1: Visualización de Core Web Vitals en tiempo real
// CONCEPTOS CLAVE: web-vitals library, LCP, INP, CLS, FCP, TTFB, Real User Monitoring

'use client';
import { useEffect, useState, memo } from 'react';

interface VitalEntry {
  name: string;
  value: number;
}

const METRICS = [
  { name: 'LCP',  label: 'Largest Contentful Paint',   unit: 'ms', good: 2500, poor: 4000 },
  { name: 'INP',  label: 'Interaction to Next Paint',   unit: 'ms', good: 200,  poor: 500  },
  { name: 'CLS',  label: 'Cumulative Layout Shift',     unit: '',   good: 0.1,  poor: 0.25 },
  { name: 'FCP',  label: 'First Contentful Paint',      unit: 'ms', good: 1800, poor: 3000 },
  { name: 'TTFB', label: 'Time to First Byte',          unit: 'ms', good: 600,  poor: 1500 },
] as const;

function classify(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const m = METRICS.find(m => m.name === name);
  if (!m) return 'good';
  if (value <= m.good) return 'good';
  if (value <= m.poor) return 'needs-improvement';
  return 'poor';
}

const STATUS_STYLE = {
  'good':             'bg-green-50 border-green-200 text-green-800',
  'needs-improvement':'bg-amber-50 border-amber-200 text-amber-800',
  'poor':             'bg-red-50 border-red-200 text-red-800',
  'pending':          'bg-slate-50 border-slate-200 text-slate-400',
};

const STATUS_DOT = {
  'good':             'bg-green-400',
  'needs-improvement':'bg-amber-400',
  'poor':             'bg-red-400',
  'pending':          'bg-slate-300',
};

export const VitalsDisplay = memo(function VitalsDisplay() {
  const [vitals, setVitals] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    // Carga web-vitals dinámicamente para no bloquear el bundle inicial
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      if (!mounted) return;
      const report = ({ name, value }: VitalEntry) => {
        if (mounted) setVitals(prev => ({ ...prev, [name]: value }));
      };
      onCLS(report, { reportAllChanges: true });
      onFCP(report);
      onLCP(report, { reportAllChanges: true });
      onTTFB(report);
      onINP(report, { reportAllChanges: true });
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {METRICS.map(({ name, label, unit, good }) => {
        const value = vitals[name] ?? null;
        const status = value !== null ? classify(name, value) : 'pending';

        return (
          <div key={name} className={`border rounded-xl p-4 ${STATUS_STYLE[status]}`}>
            <div className="flex items-center justify-between mb-2">
              <code className="text-xs font-bold uppercase tracking-wide">{name}</code>
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
            </div>
            <div className="text-2xl font-mono font-bold mb-1">
              {value !== null
                ? name === 'CLS'
                  ? value.toFixed(3)
                  : Math.round(value)
                : '—'}
              {value !== null && unit && (
                <span className="text-sm font-normal ml-0.5 opacity-70">{unit}</span>
              )}
            </div>
            <p className="text-xs opacity-70 leading-tight">{label}</p>
            <p className="text-xs opacity-50 mt-1">Target: ≤{good}{unit}</p>
          </div>
        );
      })}
    </div>
  )
});

/**
 * NOTAS PERSONALES:
 * Este componente utiliza la librería web-vitals para medir y mostrar métricas de rendimiento en tiempo real. 
 * Se definen las métricas clave (LCP, INP, CLS, FCP, TTFB) con sus valores de referencia para clasificar el estado de cada métrica como "good", "needs-improvement" o "poor". 
 * La visualización se actualiza dinámicamente a medida que se reciben los datos de las métricas.
 * 
 * para generar el reporte del bundle, se puede usar la herramienta de análisis de Webpack o Vite para identificar el tamaño de los módulos y optimizar la carga de la librería web-vitals.
 * cd weeks/week-04-performance/lab-dashboard
 * npm run analyze
 * 
 * INP: nteraction to Next Paint (Interacción con el Siguiente Pintado).
 * métrica más nueva y avanzada de las Core Web Vitals de Google (reemplazó oficialmente a la métrica FID en marzo de 2024). Su trabajo es medir la capacidad de respuesta o interactividad de tu aplicación.
 * el INP mide cuánto tiempo pasa desde que el usuario hace un clic (o presiona una tecla) hasta que el navegador realmente dibuja el resultado en la pantalla.
 * 
 */