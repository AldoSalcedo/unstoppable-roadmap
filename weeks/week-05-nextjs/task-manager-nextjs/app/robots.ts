/**
 * robots.ts — Configuración del robots.txt
 * DÍA 5: Metadata & SEO
 *
 * CONCEPTOS CLAVE:
 * - Next.js genera /robots.txt automáticamente desde este archivo
 * - robots.txt dice a los crawlers de buscadores qué páginas indexar
 * - En una app clínica real: bloquear rutas con datos de pacientes (/api/, /admin/)
 *
 * URL GENERADA: GET /robots.txt
 *
 * ARCHIVO GENERADO:
 * User-Agent: *
 * Allow: /
 * Disallow: /api/
 * Sitemap: https://task-manager.health/sitemap.xml
 *
 * POR QUÉ IMPORTA EN HEALTHCARE:
 * HIPAA y regulaciones similares requieren que datos de pacientes NO sean indexables.
 * Bloquear /api/, /admin/, y rutas con IDs de pacientes en robots.txt es
 * una primera línea de defensa (aunque no reemplaza autenticación real).
 */

import type { MetadataRoute } from 'next';

// ============================================================================
// TAREA 5.2: ROBOTS.TXT PARA APP CLÍNICA
// ============================================================================

/**
 * robots — configura qué puede indexar los motores de búsqueda
 */
export default function robots(): MetadataRoute.Robots {
  // EJERCICIO 5.2: Configura robots para una app de salud
  // Pista 1: la estructura básica es:
  //   return {
  //     rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/tasks/new'] },
  //     sitemap: 'https://task-manager.health/sitemap.xml',
  //   }
  // Pista 2: en una app clínica real también bloquearías:
  //          /admin/, /patient-records/, /reports/, cualquier ruta con datos sensibles
  // Pista 3: ¿debería /tasks/ ser indexable? Piénsalo: son tareas internas del staff.
  //          Probablemente NO — solo la home y el dashboard público deberían indexarse.

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // EJERCICIO 5.2: ajusta qué rutas bloquear para una app clínica real
      disallow: '/api/',
    },
    sitemap: 'https://task-manager.health/sitemap.xml',
  };
}

// NOTAS DE APRENDIZAJE — Día 5 (robots.txt)
// - robots.txt es solo una CONVENCIÓN — los crawlers maliciosos lo ignoran
// - Para protección real: autenticación + autorización (Week 9: NextAuth)
// - En producción clínica: revisa con el equipo legal qué rutas son indexables
// - HIPAA no requiere robots.txt, pero sí prohíbe que datos de pacientes sean públicos
