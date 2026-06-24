/**
 * middleware.ts — Middleware global de Next.js
 * DÍA 6: Route Handlers & Middleware
 *
 * CONCEPTOS CLAVE:
 * - El middleware corre ANTES de que Next.js procese cualquier request
 * - Corre en el Edge Runtime — muy rápido, pero sin acceso a Node.js APIs ni DB
 * - Casos de uso: auth checks, redirects, headers de seguridad, logging, rate limiting
 *
 * FLUJO CON MIDDLEWARE:
 *
 *   Request del browser
 *        ↓
 *   middleware.ts (Edge Runtime — milliseconds)
 *        ↓
 *   Next.js routing (encuentra el page/route handler)
 *        ↓
 *   Server Component / Route Handler (Node.js runtime)
 *
 * EDGE RUNTIME vs NODE.JS RUNTIME:
 *   Edge: más rápido, global distribution, pero no puede usar:
 *     - Prisma, MySQL drivers, Node.js crypto, fs, etc.
 *   Node.js: acceso completo a Node APIs y DB drivers
 *
 * EN ESTA APP:
 * El middleware simula una verificación de API key para proteger /api/
 * En producción (Week 9): usarás NextAuth.js para JWT real
 *
 * ARCHIVO DE CONFIGURACIÓN:
 * El `config.matcher` es OBLIGATORIO — sin él, el middleware corre en TODAS las rutas
 * incluyendo los assets estáticos (_next/static, images) lo que es muy ineficiente.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// TAREA 6.6: MIDDLEWARE DE SEGURIDAD PARA /api/
// ============================================================================

/**
 * middleware — verifica requests antes de que lleguen a los Route Handlers
 *
 * En esta implementación: protege /api/tasks con un API key simple.
 * Agrega headers de seguridad a todas las respuestas.
 */
export function middleware(request: NextRequest): NextResponse {
  // EJERCICIO 6.6: Implementa el middleware
  //
  // PARTE A — Proteger /api/ con API Key:
  // Pista 1: const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  // Pista 2: si es una ruta API, lee el header de autorización:
  //   const apiKey = request.headers.get('x-api-key')
  // Pista 3: si no hay API key o es incorrecta, retorna 401:
  //   if (!apiKey || apiKey !== 'demo-key-12345') {
  //     return NextResponse.json({ error: 'API key requerida' }, { status: 401 })
  //   }
  //
  // PARTE B — Headers de seguridad para todas las respuestas:
  // Pista 1: const response = NextResponse.next()
  // Pista 2: añade headers de seguridad estándar:
  //   response.headers.set('X-Content-Type-Options', 'nosniff')
  //   response.headers.set('X-Frame-Options', 'DENY')
  //   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Pista 3: return response

  // Implementación básica sin protección aún:
  const response = NextResponse.next();
  // EJERCICIO 6.6: agrega los headers de seguridad y la verificación de API key
  return response;
}

/**
 * config.matcher — define en qué rutas aplica el middleware
 *
 * IMPORTANTE: excluir _next/static y _next/image para no interceptar assets.
 * Sin esta exclusión, el middleware correría en CADA imagen y CSS — muy lento.
 */
export const config = {
  matcher: [
    // EJERCICIO 6.7: Ajusta el matcher para que:
    // 1. Aplique el middleware a /api/* (para el API key check)
    // 2. Aplique a todas las páginas (para los security headers)
    // 3. Excluya _next/static, _next/image, favicon.ico
    //
    // Patrón recomendado (copia esto cuando lo implementes):
    // '/((?!_next/static|_next/image|favicon.ico).*)'
    '/api/:path*',
  ],
};

// NOTAS DE APRENDIZAJE — Día 6 (Middleware)
// - El archivo se llama middleware.ts y va en la raíz del proyecto (junto a package.json)
// - Solo puede importar módulos compatibles con Edge Runtime (no Prisma, no Node crypto)
// - Para auth real: leer el JWT del cookie y verificar su firma con jose (compatible con Edge)
// - En Week 9: NextAuth maneja este middleware automáticamente
// - Los security headers son buenas prácticas — considera agregarlos en producción siempre
