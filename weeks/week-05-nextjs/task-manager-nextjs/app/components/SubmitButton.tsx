/**
 * SubmitButton.tsx — Botón de submit con estado de carga
 * DÍA 3: Server Actions & Forms
 *
 * CONCEPTOS CLAVE:
 * - `useFormStatus` es un hook que SOLO funciona dentro de un <form>
 * - `pending`: true mientras el Server Action está ejecutándose en el servidor
 * - Progressive enhancement: el botón funciona SIN JavaScript (submit nativo de HTML)
 *   Con JavaScript: muestra el estado "Guardando..." mientras procesa
 *
 * POR QUÉ ES UN COMPONENTE SEPARADO:
 * `useFormStatus` solo puede leer el estado del <form> más cercano en el árbol.
 * Si lo usaras dentro del mismo componente que define el <form>, no funcionaría.
 * Debe ser un componente HIJO del <form>.
 *
 * ÁRBOL CORRECTO:
 *   <form action={createTask}>        ← define la acción
 *     <SubmitButton />               ← lee el estado del form con useFormStatus
 *   </form>
 *
 * ÁRBOL INCORRECTO:
 *   function NewTaskPage() {
 *     const { pending } = useFormStatus()  // ❌ no está dentro del form
 *     return <form>...</form>
 *   }
 */

'use client';

import { useFormStatus } from 'react-dom';

// ============================================================================
// TAREA 3.4: SUBMIT BUTTON CON ESTADO PENDING
// ============================================================================

/**
 * SubmitButton — botón de submit que se deshabilita mientras el form procesa
 *
 * Props:
 * - label: texto del botón en estado normal (ej: "Crear Tarea")
 * - pendingLabel: texto mientras procesa (ej: "Creando...")
 */
export default function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  // EJERCICIO 3.4: Implementa el botón con useFormStatus
  // Pista 1: const { pending } = useFormStatus()
  // Pista 2: el botón debe tener disabled={pending}
  // Pista 3: muestra `pendingLabel` cuando pending === true, `label` cuando false
  // Pista 4: cuando disabled, cambia el cursor y la opacidad para feedback visual

  // Tu implementación aquí — borra este return y escribe el tuyo:
  return (
    <button type="submit" disabled>
      {label}
    </button>
  );
}

// NOTAS DE APRENDIZAJE — Día 3 (useFormStatus)
// - useFormStatus() retorna { pending, data, method, action }
// - `pending` es el más útil: true desde que el user hace submit hasta que el server responde
// - DEBE ser componente hijo del <form> — no puede estar en el mismo nivel
// - Sin JavaScript: el botón hace submit HTML nativo igual (progressive enhancement)
