/**
 * DeleteButton.tsx — Botón de eliminar con Server Action
 * DÍA 3: Server Actions & Forms
 *
 * CONCEPTOS CLAVE:
 * - Un <form> puede tener `action` que sea una Server Action con argumentos
 * - `action={() => deleteTask(taskId)}` es un closure que pasa el ID al servidor
 * - `useFormStatus` dentro de SubmitButton detecta el estado del form padre
 * - Patrón completo: form → Server Action → revalidatePath → UI actualizada
 *
 * POR QUÉ UN <form> Y NO UN <button onClick>:
 * - Funciona sin JavaScript (progressive enhancement)
 * - No necesitas manejar el estado de loading manualmente (useFormStatus lo hace)
 * - Next.js optimiza la actualización del UI automáticamente
 *
 * COMPARACIÓN:
 *
 * Con fetch() tradicional (Client Component):          Con Server Action:
 * ─────────────────────────────────────────           ──────────────────
 * const [loading, setLoading] = useState(false)       <form action={() => deleteTask(id)}>
 * const handleClick = async () => {                     <SubmitButton
 *   setLoading(true)                                      label="Eliminar"
 *   await fetch('/api/tasks/' + id, {                     pendingLabel="Eliminando..."
 *     method: 'DELETE'                                  />
 *   })                                                </form>
 *   setLoading(false)
 *   router.refresh()
 * }
 * <button onClick={handleClick} disabled={loading}>
 *   {loading ? 'Eliminando...' : 'Eliminar'}
 * </button>
 */

'use client';

import { deleteTask } from '@/app/tasks/actions';
import SubmitButton from './SubmitButton';

// ============================================================================
// TAREA 3.5: DELETE BUTTON — FORM CON SERVER ACTION
// ============================================================================

/**
 * DeleteButton — botón de eliminación que usa un <form> con Server Action
 *
 * Recibe el taskId como prop para pasarlo al Server Action via closure.
 */
export default function DeleteButton({ taskId }: { taskId: string }) {
  // EJERCICIO 3.5: Implementa el DeleteButton
  // Pista 1: usa un <form> con action={() => deleteTask(taskId)}
  // Pista 2: dentro del form, usa <SubmitButton label="Eliminar" pendingLabel="Eliminando..." />
  // Pista 3: añade estilos al form o al botón para que se vea como botón de danger (rojo)
  // Pista 4: considera agregar una confirmación antes de eliminar (window.confirm en un onClick
  //          en el form con e.preventDefault() si el usuario cancela)

  // Tu implementación aquí:
  return (
    <div>
      {/* Implementa el form con deleteTask */}
    </div>
  );
}

// NOTAS DE APRENDIZAJE — Día 3 (Composición de Server Actions)
// - El closure `() => deleteTask(taskId)` captura el taskId del componente
// - Next.js serializa el taskId y lo envía al servidor de forma segura
// - SubmitButton reutilizable: lo usarás en todos los forms de la app
// - window.confirm es la validación más simple — en producción usa un modal
