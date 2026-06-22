import Link from 'next/link';

const DAYS = [
  {
    day: 1,
    title: 'Profiling & Medición',
    objective: 'Establecer baseline con Lighthouse, Web Vitals y React DevTools Profiler',
    href: '/day-1-profiling',
    tools: ['Lighthouse', 'Web Vitals', 'React DevTools'],
    accent: 'bg-blue-50 border-blue-200 hover:border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
  },
  {
    day: 2,
    title: 'Memoización',
    objective: 'Prevenir re-renders innecesarios con memo, useMemo y useCallback',
    href: '/day-2-memoization',
    tools: ['React.memo', 'useMemo', 'useCallback'],
    accent: 'bg-violet-50 border-violet-200 hover:border-violet-300',
    badge: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-400',
  },
  {
    day: 3,
    title: 'Code Splitting',
    objective: 'Reducir bundle size con lazy loading y dynamic imports',
    href: '/day-3-code-splitting',
    tools: ['React.lazy', 'Suspense', 'Dynamic Import'],
    accent: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-400',
  },
  {
    day: 4,
    title: 'Memory Leaks',
    objective: 'Detectar y prevenir fugas de memoria con cleanup en useEffect',
    href: '/day-4-memory-leaks',
    tools: ['useEffect cleanup', 'AbortController', 'DevTools Memory'],
    accent: 'bg-red-50 border-red-200 hover:border-red-300',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-400',
  },
  {
    day: 5,
    title: 'Virtualización de Listas',
    objective: 'Renderizar 10,000+ ítems sin degradar el rendimiento con react-window',
    href: '/day-5-virtualization',
    tools: ['react-window', 'FixedSizeList', 'VariableSizeList'],
    accent: 'bg-amber-50 border-amber-200 hover:border-amber-300',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
  },
  {
    day: 6,
    title: 'Imágenes & Assets',
    objective: 'Optimizar imágenes con WebP, lazy load y el componente Next.js Image',
    href: '/day-6-images',
    tools: ['Next.js Image', 'WebP', 'srcset', 'lazy'],
    accent: 'bg-teal-50 border-teal-200 hover:border-teal-300',
    badge: 'bg-teal-100 text-teal-700',
    dot: 'bg-teal-400',
  },
  {
    day: 7,
    title: 'Monitoring & CI',
    objective: 'Monitoreo continuo con web-vitals, Lighthouse CI y performance budgets',
    href: '/day-7-monitoring',
    tools: ['web-vitals', 'Lighthouse CI', 'Performance Budget'],
    accent: 'bg-slate-50 border-slate-300 hover:border-slate-400',
    badge: 'bg-slate-200 text-slate-700',
    dot: 'bg-slate-400',
  },
] as const;

export default function HubPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Semana 4: Performance Optimization
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Sprint de 7 días para dominar React performance en una plataforma clínica SaaS.
          Cada día es un laboratorio interactivo con demos antes/después y ejercicios prácticos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {DAYS.map(({ day, title, objective, href, tools, accent, badge, dot }) => (
          <Link
            key={day}
            href={href}
            className={`block rounded-xl border p-5 hover:shadow-md transition-all ${accent}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Día {day}
              </span>
            </div>
            <h2 className="font-semibold text-slate-800 mb-1.5">{title}</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{objective}</p>
            <div className="flex flex-wrap gap-1.5">
              {tools.map(tool => (
                <span key={tool} className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>
                  {tool}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <strong>Objetivo de la semana:</strong> Lighthouse score &gt; 85 · LCP &lt; 2.5s · INP &lt; 200ms · CLS &lt; 0.1 · Bundle &lt; 400 KB
      </div>
    </div>
  );
}
