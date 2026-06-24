# DÍA 7: Advanced Patterns & Deploy

## Ejercicios del día

### EJERCICIO 7.1 — Formulario de edición (`/tasks/[id]/edit`)
El formulario ya está en `app/tasks/[id]/edit/page.tsx`.
Tu tarea: implementar `updateTask` en `app/tasks/actions.ts` (EJERCICIO 7.2).

### EJERCICIO 7.2 — Server Action `updateTask` con `.bind()`
Implementa `updateTask(taskId, formData)` en `app/tasks/actions.ts`.
Sigue las pistas dentro del archivo.

---

## Conceptos avanzados (para explorar, no obligatorios esta semana)

### Parallel Routes (`@slot`)
Permiten renderizar múltiples páginas en el mismo layout simultáneamente.

```
app/
├── @modal/
│   └── tasks/[id]/
│       └── page.tsx    ← modal de detalle
└── layout.tsx          ← recibe { children, modal } como props
```

Caso de uso: abrir el detalle de una tarea en un modal sin salir de la lista.

### Intercepting Routes (`(.)`)
Interceptan una ruta para mostrarla diferente dependiendo del contexto:
- Navegar desde la lista → modal
- Acceder directo a la URL → página completa

### `use cache` (React 19 / Next.js 16)
Directiva experimental para cachear el resultado de un Server Component:

```tsx
async function ExpensiveComponent() {
  'use cache';  // Next.js cachea el resultado
  const data = await fetch('https://api.hospital.com/stats')
  return <StatsPanel data={data} />
}
```

---

## Checklist de Deploy a Vercel

### Antes de hacer push
- [ ] `pnpm build` corre sin errores TypeScript
- [ ] `pnpm lint` pasa sin warnings
- [ ] Todos los EJERCICIOS implementados (o marcados como pendientes con comentario)
- [ ] Revisa que `MOCK_TASKS` está exportado en `lib/data.ts` ✅
- [ ] El form de nueva tarea (`/tasks/new`) tiene `action={createTask}` ✅
- [ ] El form de edición (`/tasks/[id]/edit`) tiene `action={updateTaskWithId}` ✅

### Variables de entorno para producción
En una app real, moverías estas a `.env.local`:
```bash
DATABASE_URL="postgresql://..."  # Week 6: Prisma
NEXTAUTH_SECRET="..."            # Week 9: Auth
NEXTAUTH_URL="https://tu-app.vercel.app"
```

### Cómo deployar a Vercel
```bash
# Opción 1: Vercel CLI
npx vercel                # preview deploy
npx vercel --prod         # production deploy

# Opción 2: Conecta el repo en vercel.com
# Settings → Root Directory → weeks/week-05-nextjs/task-manager-nextjs
```

### Post-deploy checks
- [ ] `/` carga y muestra estadísticas
- [ ] `/tasks` muestra las tareas con filtros funcionando
- [ ] `/tasks/new` crea una tarea y redirige
- [ ] `/tasks/[id]` muestra detalle
- [ ] `/tasks/[id]/edit` edita y redirige
- [ ] `/dashboard` carga con Suspense (verás los skeletons brevemente)
- [ ] `/api/tasks` retorna JSON (prueba en el browser o con curl)
- [ ] `/sitemap.xml` retorna XML válido
- [ ] `/robots.txt` retorna el archivo

---

## Resumen de la semana

| Día | Concepto | Archivo clave |
|-----|----------|---------------|
| 1 | App Router, Layouts, Rutas dinámicas | `app/layout.tsx`, `app/tasks/[id]/page.tsx` |
| 2 | Client Components, URL como estado | `components/SearchBar.tsx`, `components/TaskNav.tsx` |
| 3 | Server Actions, Forms, useFormStatus | `app/tasks/actions.ts`, `components/SubmitButton.tsx` |
| 4 | Streaming, Suspense, Parallel fetch | `app/dashboard/page.tsx`, `components/TaskStatsPanel.tsx` |
| 5 | Metadata API, SEO, OG tags | `app/sitemap.ts`, `app/robots.ts` |
| 6 | Route Handlers, Middleware | `app/api/tasks/route.ts`, `middleware.ts` |
| 7 | .bind() pattern, deploy | `app/tasks/[id]/edit/page.tsx` |
