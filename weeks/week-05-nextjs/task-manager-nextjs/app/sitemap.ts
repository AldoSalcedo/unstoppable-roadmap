/**
 * sitemap.ts — Generación dinámica del sitemap XML
 * DÍA 5: Metadata & SEO
 *
 * CONCEPTOS CLAVE:
 * - Next.js genera /sitemap.xml automáticamente desde este archivo
 * - MetadataRoute.Sitemap es el tipo que Next.js espera
 * - Combinas rutas estáticas (hardcoded) con rutas dinámicas (de la DB)
 *
 * URL GENERADA: GET /sitemap.xml
 * Next.js lo sirve automáticamente en producción y desarrollo.
 *
 * POR QUÉ IMPORTA EN HEALTHCARE:
 * Los portales de salud pública necesitan SEO para que pacientes encuentren
 * información sobre servicios, horarios, y ubicaciones de clínicas.
 * Un sitemap bien construido mejora la indexación en Google.
 *
 * FORMATO DEL SITEMAP (lo que Next.js genera desde tu array):
 * <?xml version="1.0" encoding="UTF-8"?>
 * <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 *   <url>
 *     <loc>https://tu-app.com/</loc>
 *     <lastmod>2026-06-24</lastmod>
 *     <priority>1</priority>
 *   </url>
 *   <url>
 *     <loc>https://tu-app.com/tasks/1</loc>
 *     <lastmod>2026-06-23</lastmod>
 *     <priority>0.8</priority>
 *   </url>
 *   ...
 * </urlset>
 */

import type { MetadataRoute } from 'next';
import { getTasks } from '@/lib/data';

// ============================================================================
// TAREA 5.1: SITEMAP DINÁMICO
// ============================================================================

/**
 * sitemap — genera el sitemap XML de la aplicación
 *
 * Retorna un array de objetos con url, lastModified, changeFrequency, priority.
 * Next.js los convierte automáticamente a XML.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // EJERCICIO 5.1: Implementa el sitemap dinámico
  // Pista 1: define las rutas estáticas primero (home, /tasks, /dashboard)
  //   const staticRoutes: MetadataRoute.Sitemap = [
  //     { url: 'https://task-manager.health/', lastModified: new Date(), priority: 1 },
  //     { url: 'https://task-manager.health/tasks', lastModified: new Date(), priority: 0.9 },
  //     { url: 'https://task-manager.health/dashboard', lastModified: new Date(), priority: 0.8 },
  //   ]
  //
  // Pista 2: obtén las tareas dinámicamente con getTasks()
  // Pista 3: mapea cada tarea a un entry del sitemap:
  //   const taskRoutes = tasks.map(task => ({
  //     url: `https://task-manager.health/tasks/${task.id}`,
  //     lastModified: new Date(task.updatedAt),
  //     priority: task.priority === 'CRITICAL' ? 0.9 : 0.7,
  //   }))
  //
  // Pista 4: retorna [...staticRoutes, ...taskRoutes]

  // Implementación mínima para que el sitemap sea válido (reemplaza con la tuya):
  const tasks = await getTasks();

  return [
    { url: 'https://task-manager.health/', lastModified: new Date(), priority: 1 },
    // EJERCICIO 5.1: agrega las rutas estáticas restantes y las dinámicas de tasks
    ...tasks.map(task => ({
      url: `https://task-manager.health/tasks/${task.id}`,
      lastModified: new Date(task.updatedAt),
      priority: 0.7 as number,
    })),
  ];
}

// NOTAS DE APRENDIZAJE — Día 5 (Sitemap)
// - sitemap.ts puede ser async — ideal para rutas dinámicas de la DB
// - Next.js auto-sirve /sitemap.xml en producción
// - priority es un hint para los crawlers (1=más importante, 0=menos)
// - changeFrequency: 'daily' | 'weekly' | 'monthly' — ayuda a los crawlers a planear
