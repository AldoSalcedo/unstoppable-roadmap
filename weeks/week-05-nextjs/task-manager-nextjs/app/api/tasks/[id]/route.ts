/**
 * route.ts — API Route Handler para /api/tasks/[id]
 * DÍA 6: Route Handlers & Middleware
 *
 * CONCEPTOS CLAVE:
 * - Ruta dinámica en un Route Handler: la carpeta [id] funciona igual que en pages
 * - En Route Handlers, `params` también es Promise en Next.js 16
 * - PATCH vs PUT: PATCH modifica campos parcialmente, PUT reemplaza el objeto completo
 *
 * URLs manejadas:
 * GET    /api/tasks/:id  → obtener una tarea
 * PATCH  /api/tasks/:id  → actualizar campos de una tarea
 * DELETE /api/tasks/:id  → eliminar una tarea
 *
 * DIFERENCIA CON SERVER ACTIONS:
 * - deleteTask (Server Action): úsalo desde el UI del browser
 * - DELETE /api/tasks/:id: úsalo desde apps móviles, scripts, o integraciones
 * - Ambos modifican MOCK_TASKS — en producción ambos llamarían a la misma DB
 */

import { NextResponse } from 'next/server';
import { getTaskById, MOCK_TASKS } from '@/lib/data';

// ============================================================================
// TAREA 6.3: GET /api/tasks/[id]
// ============================================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  // EJERCICIO 6.3: Implementa el GET por ID
  // Pista 1: const { id } = await params  ← igual que en page.tsx
  // Pista 2: const task = await getTaskById(id)
  // Pista 3: si !task → return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  // Pista 4: si existe → return NextResponse.json(task)

  return NextResponse.json({ message: 'EJERCICIO 6.3: Implementa GET /api/tasks/[id]' }, { status: 501 });
}

// ============================================================================
// TAREA 6.4: PATCH /api/tasks/[id]
// ============================================================================

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  // EJERCICIO 6.4: Implementa el PATCH (actualización parcial)
  // Pista 1: await params, leer body con request.json()
  // Pista 2: busca la tarea en MOCK_TASKS con .findIndex()
  // Pista 3: si no existe → 404
  // Pista 4: actualiza solo los campos que vengan en el body:
  //   MOCK_TASKS[index] = { ...MOCK_TASKS[index], ...body, updatedAt: new Date().toISOString() }
  // Pista 5: retorna la tarea actualizada con 200

  return NextResponse.json({ message: 'EJERCICIO 6.4: Implementa PATCH /api/tasks/[id]' }, { status: 501 });
}

// ============================================================================
// TAREA 6.5: DELETE /api/tasks/[id]
// ============================================================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  // EJERCICIO 6.5: Implementa el DELETE
  // Pista 1: await params, busca el índice en MOCK_TASKS
  // Pista 2: si no existe → 404
  // Pista 3: MOCK_TASKS.splice(index, 1)
  // Pista 4: retorna 204 No Content (sin body):
  //   return new Response(null, { status: 204 })

  return NextResponse.json({ message: 'EJERCICIO 6.5: Implementa DELETE /api/tasks/[id]' }, { status: 501 });
}

// NOTAS DE APRENDIZAJE — Día 6 (Route Handlers con params)
// - params es Promise<{ id: string }> igual que en page.tsx — mismo patrón
// - 204 No Content es el código correcto para DELETE exitoso (no hay body)
// - PATCH modifica parcialmente; PUT reemplaza completamente — en healthcare usa PATCH
// - Puedes probar estos endpoints con curl o con la extensión REST Client de VSCode
