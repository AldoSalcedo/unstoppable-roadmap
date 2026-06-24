/**
 * route.ts — API Route Handler para /api/tasks
 * DÍA 6: Route Handlers & Middleware
 *
 * CONCEPTOS CLAVE:
 * - Route Handlers reemplazan a las API Routes de Next.js 13 (pages/api/)
 * - Exportas funciones nombradas GET, POST, PUT, DELETE — Next.js las mapea automáticamente
 * - Reciben un `Request` nativo de Web API — no el Express req/res
 * - Retornan `Response` o `NextResponse` del Web API estándar
 *
 * CUÁNDO USAR ROUTE HANDLERS vs SERVER ACTIONS:
 *
 *   Server Actions:         Route Handlers:
 *   ───────────────         ──────────────────
 *   Forms / UI mutations    APIs consumidas por terceros
 *   Solo Next.js client     Mobile apps, CLIs, integraciones
 *   Menos boilerplate       Control total del HTTP response
 *   revalidatePath auto     Content-Type, headers manuales
 *
 * En esta app: las mutaciones del UI usan Server Actions (Day 3).
 * El Route Handler aquí es para una API pública (ej: app móvil del hospital).
 *
 * URL: GET /api/tasks    → lista de tareas en JSON
 *      POST /api/tasks   → crear tarea via JSON body
 */

import { NextResponse } from 'next/server';
import { getTasks, MOCK_TASKS } from '@/lib/data';
import type { Task } from '@/lib/types';

// ============================================================================
// TAREA 6.1: GET /api/tasks
// ============================================================================

/**
 * GET — retorna todas las tareas en formato JSON
 *
 * Respuesta esperada:
 * 200 OK
 * Content-Type: application/json
 * { tasks: Task[], total: number }
 */
export async function GET(request: Request): Promise<Response> {
  // EJERCICIO 6.1: Implementa el GET handler
  // Pista 1: const tasks = await getTasks()
  // Pista 2: retorna NextResponse.json({ tasks, total: tasks.length })
  //          o: return Response.json({ tasks, total: tasks.length })
  // Pista 3 (bonus): lee el searchParam `status` de la URL para filtrar:
  //   const { searchParams } = new URL(request.url)
  //   const status = searchParams.get('status')
  //   filtrar tasks si status existe

  // Stub — reemplaza con tu implementación:
  return NextResponse.json({ message: 'EJERCICIO 6.1: Implementa GET /api/tasks' }, { status: 501 });
}

// ============================================================================
// TAREA 6.2: POST /api/tasks
// ============================================================================

/**
 * POST — crea una nueva tarea desde JSON body
 *
 * Body esperado:
 * { title: string, description: string, priority?: TaskPriority, assignee?: string }
 *
 * Respuesta exitosa: 201 Created con la tarea creada
 * Respuesta de error: 400 Bad Request si faltan campos obligatorios
 */
export async function POST(request: Request): Promise<Response> {
  // EJERCICIO 6.2: Implementa el POST handler
  // Pista 1: const body = await request.json()
  // Pista 2: valida que body.title y body.description existan
  //   if (!body.title || !body.description) {
  //     return NextResponse.json({ error: 'title y description son requeridos' }, { status: 400 })
  //   }
  // Pista 3: crea la tarea:
  //   const newTask: Task = {
  //     id: Date.now().toString(),
  //     title: body.title,
  //     description: body.description,
  //     status: 'TODO',
  //     priority: body.priority ?? 'MEDIUM',
  //     assignee: body.assignee,
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   }
  // Pista 4: MOCK_TASKS.push(newTask)
  // Pista 5: return NextResponse.json(newTask, { status: 201 })

  return NextResponse.json({ message: 'EJERCICIO 6.2: Implementa POST /api/tasks' }, { status: 501 });
}

// NOTAS DE APRENDIZAJE — Día 6 (Route Handlers)
// - Los Route Handlers usan Web API nativo: Request, Response — no Express
// - NextResponse.json() es un helper que setea Content-Type: application/json automáticamente
// - Response.json() también funciona en Next.js 16 (estándar moderno)
// - Para auth: leer el header 'Authorization' con request.headers.get('Authorization')
// - En producción: usar Zod para validar el body en lugar de checks manuales
