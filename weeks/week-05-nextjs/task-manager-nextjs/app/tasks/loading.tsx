/**
 * loading.tsx — UI de Carga para /tasks
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - `loading.tsx` envuelve automáticamente el page en un <Suspense>
 * - Se muestra mientras TasksPage hace `await getTasks()`
 * - Skeleton UI: estructura visual que imita el contenido real (reduce layout shift)
 * - El usuario ve algo inmediatamente en vez de una pantalla en blanco
 *
 * FLUJO:
 * 1. Usuario navega a /tasks
 * 2. Next.js muestra este loading.tsx INMEDIATAMENTE
 * 3. En paralelo, el servidor ejecuta TasksPage async
 * 4. Cuando TasksPage termina, reemplaza el skeleton con el contenido real
 *
 * TIP: El skeleton debe tener las mismas dimensiones que el contenido real
 * para evitar Cumulative Layout Shift (CLS). Meta: CLS < 0.1
 */

// ============================================================================
// TAREA 1.16: SKELETON UI — MISMO LAYOUT QUE EL CONTENIDO REAL
// ============================================================================

export default function TasksLoading() {
  return (
    <div>
      {/* Header skeleton — mismas dimensiones que el header real */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Lista de skeletons — mismo número aproximado de tarjetas */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * TaskCardSkeleton — replica la estructura de TaskCard con bloques grises
 *
 * `animate-pulse` de Tailwind hace la animación de "latido" que indica carga.
 * Las dimensiones intentan coincidir con las de TaskCard real.
 */
function TaskCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Título */}
          <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse mb-2" />
          {/* Descripción */}
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse mb-1" />
          <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-2">
          <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Metadata */}
      <div className="flex gap-4 mt-3">
        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
