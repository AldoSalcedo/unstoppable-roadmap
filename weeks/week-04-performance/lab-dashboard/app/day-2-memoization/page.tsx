// DÍA 2: Laboratorio de Memoización
// Los re-renders innecesarios son el mayor desperdicio de CPU en apps React.

import { generatePatients } from '@/lib/mock-data';
import { MemoLab } from '@/components/day-2/MemoLab';
import Link from 'next/link';

const patients = generatePatients(20);

export default function Day2Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-3 inline-block">
          ← Volver al Hub
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Día 2: Memoización</h1>
        <p className="text-slate-500 mt-1">
          Cada re-render innecesario consume CPU. Aprende cuándo y cómo prevenirlos.
        </p>
      </div>

      {/* Conceptos */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            tool: 'React.memo',
            color: 'text-violet-700',
            description: 'Envuelve un componente para que solo re-renderice cuando sus props cambian (shallow comparison).',
            when: 'Componente hijo que recibe props que cambian poco, desde un padre que re-renderiza frecuentemente.',
          },
          {
            tool: 'useCallback',
            color: 'text-violet-700',
            description: 'Memoiza la referencia de una función. Sin esto, memo no funciona cuando se pasan funciones como props.',
            when: 'Al pasar callbacks como props a componentes memoizados con React.memo.',
          },
          {
            tool: 'useMemo',
            color: 'text-violet-700',
            description: 'Memoiza el resultado de un cálculo costoso. Solo recalcula cuando sus dependencias cambian.',
            when: 'Filtrado, ordenamiento o transformaciones que procesan muchos datos en cada render.',
          },
        ].map(({ tool, color, description, when }) => (
          <div key={tool} className="bg-white border border-slate-200 rounded-xl p-4">
            <code className={`text-sm font-bold ${color}`}>{tool}</code>
            <p className="text-sm text-slate-600 mt-2 mb-3 leading-relaxed">{description}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-500">Cuándo:</strong> {when}
            </p>
          </div>
        ))}
      </div>

      {/* Lab interactivo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            EJERCICIO 1
          </span>
          <h2 className="font-semibold text-slate-800">Agrega React.memo a PatientCardMemo</h2>
        </div>
        <p className="text-sm text-slate-600 mb-5">
          Edita{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-xs">
            components/day-2/PatientCardMemo.tsx
          </code>{' '}
          y sigue los pasos en los comentarios. El flash amarillo y el contador de renders
          deben dejar de subir cuando presionas `Forzar Re-render`.
        </p>
        <MemoLab patients={patients} />
      </div>

      {/* Ejercicio 2: useCallback */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            EJERCICIO 2
          </span>
          <h2 className="font-semibold text-slate-800">¿Por qué necesitamos useCallback?</h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          En{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">MemoLab.tsx</code>,
          elimina el <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">useCallback</code> de{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">handleDischarge</code>.
          Observa que aunque hayas agregado memo, los cards siguen re-renderizando.
          Restaura useCallback para entender por qué es necesario.
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p className="text-red-400">{'// ❌ Sin useCallback → nueva referencia cada render → memo falla'}</p>
          <p>{'const handleDischarge = (id: string) => console.log(id);'}</p>
          <br />
          <p className="text-green-400">{'// ✅ Con useCallback → referencia estable → memo funciona'}</p>
          <p>{'const handleDischarge = useCallback((id: string) => console.log(id), []);'}</p>
        </div>
      </div>

      {/* Ejercicio 3: useMemo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            EJERCICIO 3
          </span>
          <h2 className="font-semibold text-slate-800">Optimiza el filtrado con useMemo</h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          En{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">MemoLab.tsx</code>,
          el cálculo de <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">filteredCount</code>{' '}
          recorre todos los pacientes en cada render, aunque query no cambie.
          Envuélvelo con <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">useMemo</code>.
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p className="text-red-400">{'// ❌ Recalcula en cada render'}</p>
          <p>{'const filteredCount = patients.filter(p => ...).length;'}</p>
          <br />
          <p className="text-green-400">{'// ✅ Solo recalcula cuando patients o query cambian'}</p>
          <p>{'const filteredCount = useMemo('}</p>
          <p>{'  () => patients.filter(p => ...).length,'}</p>
          <p>{'  [patients, query]'}</p>
          <p>{');'}</p>
        </div>
      </div>

      {/* Árbol de decisión */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Árbol de decisión: ¿cuándo usar cada uno?</h2>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono leading-relaxed">
          <p>¿Quiero optimizar un re-render?</p>
          <p className="text-slate-400 ml-2">│</p>
          <p className="ml-2">├─ ¿Es un componente hijo que re-renderiza?  → <span className="text-violet-300">React.memo()</span></p>
          <p className="ml-2">├─ ¿Paso una función como prop?             → <span className="text-violet-300">useCallback()</span></p>
          <p className="ml-2">└─ ¿Tengo un cálculo costoso?               → <span className="text-violet-300">useMemo()</span></p>
        </div>
      </div>
    </div>
  );
}
