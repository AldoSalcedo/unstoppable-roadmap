/**
 * error.tsx — Error Boundary para /tasks
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - `error.tsx` DEBE ser Client Component ('use client')
 * - Captura errores lanzados en el page o sus hijos dentro de esta ruta
 * - Props: `error` (el Error), `reset` (función para reintentar)
 * - `reset()` re-renderiza el segmento sin recargar la página completa
 *
 * ¿Por qué 'use client'?
 * Los error boundaries de React (ErrorBoundary) solo funcionan en el cliente.
 * Next.js genera el error.tsx como cliente automáticamente.
 * Sin 'use client', el build falla con un error claro.
 */

'use client';

import { useEffect } from 'react';

// ============================================================================
// TAREA 1.17: ERROR BOUNDARY DE RUTA
// ============================================================================

/**
 * TasksError — UI de error para la sección /tasks
 *
 * Se activa cuando:
 * - getTasks() lanza un error (ej: DB caída)
 * - Un componente hijo lanza un error durante el render
 * - Un Server Action falla y no maneja su propio error
 *
 * Aplicación Healthcare: en sistemas clínicos, los errores deben ser claros
 * y proporcionar un camino de recuperación sin perder datos del paciente.
 */
export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log del error para monitoreo (en producción: Sentry, Datadog, etc.)
  useEffect(() => {
    console.error('[TasksError]', error.message, error.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Ícono de error */}
      <div className="text-5xl mb-4">⚠️</div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Error al cargar las tareas
      </h2>

      <p className="text-slate-500 max-w-sm mb-6">
        Ocurrió un problema al obtener las tareas clínicas. Puedes intentar de
        nuevo o contactar al equipo de soporte si el problema persiste.
      </p>

      {/* Código de error para diagnóstico (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-4 mb-6 max-w-md text-left overflow-auto">
          {error.message}
          {error.digest && `\nDigest: ${error.digest}`}
        </pre>
      )}

      {/* `reset()` le dice a React que vuelva a intentar renderizar el page */}
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 1 (Error Boundaries)
// - error.tsx SIEMPRE necesita 'use client' — no hay excepciones
// - `reset()` es la forma de recuperarse sin recargar la página completa
// - `error.digest` es un hash que ayuda a correlacionar el error en los logs del servidor
// - En producción, el `error.message` no llega al cliente por seguridad
//   (el servidor solo envía el digest). Por eso el bloque NODE_ENV === 'development'.
