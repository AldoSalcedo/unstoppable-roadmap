/**
 * SearchBar.tsx — Barra de búsqueda con filtro por texto
 * DÍA 2: Server vs Client Components
 *
 * CONCEPTOS CLAVE:
 * - `'use client'` es OBLIGATORIO aquí porque usamos hooks del browser
 * - `useSearchParams()` lee los query params actuales de la URL (?q=texto)
 * - `useRouter()` permite navegar sin recargar la página (client-side)
 * - `useRef` para debounce: guarda el timer entre renders sin causar re-render
 * - `URLSearchParams` para preservar otros query params al actualizar la URL
 *
 * POR QUÉ 'use client' AQUÍ Y NO EN tasks/page.tsx:
 * Si pusieramos 'use client' en page.tsx, TODO el árbol se volvería cliente
 * y perderíamos el fetch directo a la DB. El patrón correcto es:
 *
 *   TasksPage (Server) — fetch de tareas en el servidor
 *     └── SearchBar (Client) — solo maneja la interacción del input
 *
 * La frontera Server/Client está entre el page y este componente.
 */

'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ============================================================================
// TAREA 2.1: SEARCH BAR — CLIENT COMPONENT CON BEST PRACTICES
// ============================================================================

export default function SearchBar({ placeholder = 'Buscar tareas...' }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // useRef guarda el ID del setTimeout entre renders.
  // No usamos useState aquí porque cambiar el timer NO debe causar un re-render.
  // Si usáramos useState, cada tecla causaría 2 renders: uno del input, uno del estado.
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // Debounce manual: cancela el timer anterior antes de crear uno nuevo.
    // Sin esto: 7 navegaciones al escribir "glucosa" (una por letra).
    // Con esto: solo navega 300ms después de que el usuario DEJA de escribir.
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // URLSearchParams preserva los query params existentes.
      // Sin esto: si la URL es /tasks?status=TODO y el usuario escribe,
      // el filtro de status se borra. Con esto, ambos coexisten.
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set('q', value);       // agrega o actualiza ?q=
      } else {
        params.delete('q');           // limpia ?q= si el input está vacío
      }

      router.push(`/tasks?${params.toString()}`);
    }, 300);
  }

  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        // defaultValue inicializa el input con el ?q= actual de la URL.
        // Usamos defaultValue (no value) porque el input es "uncontrolled":
        // React no sincroniza su estado — el valor vive en el DOM directamente.
        // Si usáramos value, necesitaríamos useState para controlarlo.
        defaultValue={searchParams.get('q') ?? ''}
        onChange={handleSearch}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 2 (Client Components)
// - 'use client' convierte TODO el archivo en código del browser
// - useRef: persiste valores entre renders SIN causar re-renders (ideal para timers)
// - useState: persiste valores Y causa re-render al cambiar (ideal para UI state)
// - Debounce evita saturar el servidor con una request por cada tecla
// - URLSearchParams.toString() serializa { q: 'lab', status: 'TODO' } → 'q=lab&status=TODO'
// - defaultValue (uncontrolled) vs value (controlled) — con URL como fuente de verdad,
//   uncontrolled es más simple porque el estado ya vive en la URL, no en React

/**
 * Sin 'use client', todo componente es un Server Component. Eso significa que corre en el servidor, genera HTML, y ese HTML llega al browser. 
 * El browser solo recibe el resultado — nunca el código JavaScript del componente.
 * 'use client' le dice a Next.js: "este archivo y todo lo que importa forma parte del bundle del browser". El componente se envía como JavaScript al cliente y React lo ejecuta ahí.
 * Sin 'use client': Servidor genera HTML → Browser muestra HTML. El componente nunca existe en el browser como JS
 * Con 'use client': Servidor pre-renderiza HTML inicial → Browser recibe HTML + JS. React "hidrata" el JS → useSearchParams() puede leer la URL en vivo.
 * 
 */
