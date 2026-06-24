/**
 * loading.tsx — Skeleton del Dashboard (Ruta: /dashboard)
 * DÍA 4: Streaming & Suspense
 *
 * CONCEPTOS CLAVE:
 * - Este archivo se activa automáticamente cuando /dashboard está cargando
 * - Es el "page-level Suspense" — cubre toda la página, no solo secciones
 * - Los Suspense granulares en page.tsx permiten que cada sección cargue independiente
 *
 * DIFERENCIA entre loading.tsx y <Suspense> en page.tsx:
 *
 *   loading.tsx: cubre la página ENTERA mientras el page.tsx inicial carga
 *   <Suspense> en page.tsx: cubre secciones ESPECÍFICAS → mejor UX (streaming)
 *
 * RECOMENDACIÓN:
 * loading.tsx es el fallback grueso (primera carga).
 * Suspense granular es el fallback fino (secciones que tardan más).
 * Úsalos en conjunto para la mejor experiencia.
 */

// ============================================================================
// TAREA 4.4: SKELETON DEL DASHBOARD COMPLETO
// ============================================================================

export default function DashboardLoading() {
  // EJERCICIO 4.4: Implementa el skeleton completo de la página
  // Pista 1: imita la estructura del DashboardPage (h1 skeleton + grids)
  // Pista 2: usa animate-pulse + bg-slate-200 como en tasks/loading.tsx
  // Pista 3: el h1 skeleton puede ser un div w-48 h-8 rounded

  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-slate-200 rounded-xl" />
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 4 (loading.tsx)
// - loading.tsx es un Server Component — no necesita 'use client'
// - Se exporta como default y Next.js lo maneja automáticamente
// - Aparece instantáneo porque no tiene data fetching — es HTML puro
// - CLS (Cumulative Layout Shift): el skeleton previene saltos visuales al cargar
