// DÍA 7: Monitor de Web Vitals con performance budget
// CONCEPTOS CLAVE: Real User Monitoring (RUM), performance budget, web-vitals, sendBeacon

'use client';
import { useEffect, useState } from 'react';

interface VitalEntry {
  name: string;
  value: number;
}

const BUDGETS = {
  LCP:  { good: 2500,  poor: 4000,  unit: 'ms' },
  INP:  { good: 200,   poor: 500,   unit: 'ms' },
  CLS:  { good: 0.1,   poor: 0.25,  unit: '' },
  FCP:  { good: 1800,  poor: 3000,  unit: 'ms' },
  TTFB: { good: 600,   poor: 1500,  unit: 'ms' },
} as const;

type MetricName = keyof typeof BUDGETS;

function classify(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const b = BUDGETS[name];
  if (value <= b.good) return 'good';
  if (value <= b.poor) return 'needs-improvement';
  return 'poor';
}

const STATUS_CARD = {
  'good':             'bg-green-50 border-green-200',
  'needs-improvement':'bg-amber-50 border-amber-200',
  'poor':             'bg-red-50 border-red-200',
  'pending':          'bg-slate-50 border-slate-200',
};

const STATUS_LABEL = {
  'good':             '✅ Dentro del budget',
  'needs-improvement':'⚠️ Mejorable',
  'poor':             '❌ Fuera del budget',
  'pending':          '⏳ Esperando...',
};

const STATUS_TEXT = {
  'good':             'text-green-700',
  'needs-improvement':'text-amber-700',
  'poor':             'text-red-700',
  'pending':          'text-slate-400',
};

export function VitalsMonitor() {
  const [vitals, setVitals] = useState<Partial<Record<MetricName, number>>>({});
  const [logEntries, setLogEntries] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      if (!mounted) return;
      const record = ({ name, value }: VitalEntry) => {
        if (!mounted) return;
        const metricName = name as MetricName;
        setVitals(prev => ({ ...prev, [metricName]: value }));

        // Simulación de envío a analytics (en producción usarías sendBeacon)
        const formatted = metricName === 'CLS' ? value.toFixed(4) : Math.round(value).toString();
        setLogEntries(prev => [
          `[RUM] ${metricName}: ${formatted}${BUDGETS[metricName]?.unit ?? ''} → enviado a /api/vitals`,
          ...prev.slice(0, 4),
        ]);
      };
      onCLS(record, { reportAllChanges: true });
      onFCP(record);
      onLCP(record, { reportAllChanges: true });
      onTTFB(record);
      onINP(record, { reportAllChanges: true });
    });
    return () => { mounted = false; };
  }, []);

  const entries = Object.keys(vitals) as MetricName[];
  const overBudget = entries.filter(n => classify(n, vitals[n]!) === 'poor').length;

  return (
    <div className="space-y-4">
      {/* Budget overview */}
      <div className={`border rounded-xl p-4 ${overBudget > 0 ? 'bg-red-50 border-red-200' : entries.length === 0 ? 'bg-slate-50 border-slate-200' : 'bg-green-50 border-green-200'}`}>
        <p className={`font-semibold text-sm ${overBudget > 0 ? 'text-red-800' : entries.length === 0 ? 'text-slate-500' : 'text-green-800'}`}>
          {entries.length === 0
            ? 'Esperando métricas... Interactúa con la página para capturar INP.'
            : overBudget > 0
              ? `${overBudget} métrica(s) fuera del performance budget`
              : `Todas las métricas dentro del budget ✅ (${entries.length}/5 capturadas)`}
        </p>
      </div>

      {/* Tarjetas individuales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(BUDGETS) as MetricName[]).map(name => {
          const value = vitals[name] ?? null;
          const status = value !== null ? classify(name, value) : 'pending';
          const { unit } = BUDGETS[name];

          return (
            <div key={name} className={`border rounded-xl p-4 ${STATUS_CARD[status]}`}>
              <code className="text-xs font-bold text-slate-700">{name}</code>
              <div className={`text-2xl font-mono font-bold mt-1 mb-1 ${STATUS_TEXT[status]}`}>
                {value !== null
                  ? name === 'CLS' ? value.toFixed(4) : Math.round(value)
                  : '—'}
                {value !== null && unit && (
                  <span className="text-sm font-normal ml-0.5 opacity-70">{unit}</span>
                )}
              </div>
              <p className={`text-xs ${STATUS_TEXT[status]}`}>{STATUS_LABEL[status]}</p>
              <p className="text-xs text-slate-400 mt-1">≤{BUDGETS[name].good}{unit}</p>
            </div>
          );
        })}
      </div>

      {/* Log de envíos simulados */}
      {logEntries.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-2 font-medium">Log de envíos a analytics:</p>
          {logEntries.map((entry, i) => (
            <p key={i} className="text-xs font-mono text-green-400">{entry}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * NOTAS PERSONALES:
 * Monitoreo en el mundo real: RUM vs. Lab Data
 * Real User Monitoring (RUM) - Monitoreo de Usuarios Reales
 * consiste en recolectar de forma anónima los tiempos de carga y rendimiento de los usuarios reales que entran a tu sitio web. 
 * No importa si usan un iPhone de última generación con Wi-Fi en Monterrey o un teléfono viejo con datos móviles deficientes en una zona rural; el RUM captura su experiencia real. 
 * Es la verdad absoluta de cómo funciona tu app en el mundo exterior.
 * 
 * El aliado del RUM: La librería web-vitals
 * Para hacer RUM con las métricas de Google (como el CLS que vimos antes, el LCP o el INP), Google creó la librería oficial web-vitals. Es un paquete minúsculo de JavaScript que integras en tu código para medir exactamente cuándo ocurren estos eventos en el navegador del usuario:
 * import { onCLS, onLCP, onINP } from 'web-vitals';

// Captura la métrica en vivo del usuario real
onLCP((metric) => {
  console.log(`El usuario vio el contenido principal en: ${metric.value} ms`);
  // Aquí enviarías este dato a tu servidor de analíticas
});

 * ¿Cómo enviar esos datos sin romper el rendimiento? sendBeacon
 * Si tu librería web-vitals detecta que un usuario está experimentando un rendimiento terrible justo cuando va a cerrar la pestaña o a salir de la página, necesitas enviar esa analítica a tu servidor inmediatamente.
 * Si usas un fetch() o axios tradicional, el navegador podría cancelar la petición a mitad de camino porque la pestaña se está cerrando, perdiendo el valioso dato. Peor aún, si fuerzas al navegador a esperar a que termine la petición, retrasarás la salida del usuario, arruinando su experiencia.
 * Para resolver esto nació navigator.sendBeacon(). Es un método nativo de JavaScript que envía datos al servidor de forma asíncrona y en segundo plano.
 * La API sendBeacon permite enviar datos al servidor de forma asíncrona, sin bloquear la navegación del usuario. Es perfecta para enviar métricas de rendimiento y analíticas justo antes de que el usuario abandone la página.
 * window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    const datosDeRendimiento = JSON.stringify({ clspoints: 0.05, userId: 'abc' });
    
    // El navegador garantiza que enviará esto, incluso si el usuario cierra la pestaña de golpe
    navigator.sendBeacon('/api/analytics', datosDeRendimiento);
  }
});

 * Prevención en el desarrollo: Performance Budget & Lighthouse CI
 * sabemos cómo optimizar y cómo medir a los usuarios en vivo. Pero, ¿cómo evitamos que un desarrollador de nuestro equipo suba por error una imagen de 10 MB a producción y destruya todo nuestro trabajo? Ponemos alarmas automatizadas.
 * 
 * Performance Budget (Presupuesto de Rendimiento):
 * Es un límite estricto que el equipo de desarrollo se autoimpone y que no se puede superar bajo ninguna circunstancia. Puedes definirlo de dos maneras:
 * Por tamaño de archivos: "El archivo JavaScript principal (bundle.js) no puede pesar más de 350 KB comprimido. Las imágenes del home no pueden sumar más de 1 MB".
 * Por métricas de tiempo: "La página debe ser interactiva en menos de 2 segundos en una red 3G simulada".
 * Si alguien intenta subir código que supera ese presupuesto, el sistema bloquea el despliegue.
 * 
 * Lighthouse CI (Lighthouse en Integración Continua):
 * Para automatizar este presupuesto en tu flujo de trabajo (en GitHub, GitLab o Bitbucket), utilizas Lighthouse CI.
 * Asi como la herramienta Lighthouse que utilizamos de forma manual haciendo clic en tus DevTools.
 * Lighthouse CI toma ese mismo motor de auditoría y lo ejecuta de forma invisible en la nube cada vez que subes un cambio de código (Pull Request).
 * Configuras un archivo de reglas (lighthouserc.json) con tu Performance Budget:
 * {
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.90}],
        "resource-sizes:script:size": ["error", {"maxSize": 350000}]
      }
    }
  }
}

 * Si el nuevo código del equipo baja la calificación de rendimiento de 95 a 88, o expande el peso del JavaScript más allá del límite establecido, Lighthouse CI fallará la prueba automáticamente, el botón de "Merge/Aceptar" en GitHub se pondrá en rojo y el código defectuoso jamás llegará a tus pacientes o médicos en producción.
 */