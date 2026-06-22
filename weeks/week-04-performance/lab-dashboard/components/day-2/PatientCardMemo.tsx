// DÍA 2: EJERCICIO — Agrega React.memo para prevenir re-renders innecesarios
// CONCEPTOS CLAVE: React.memo, shallow comparison(comparación superficial), referential equality(igualdad referencial)
//
// ============================================================
// INSTRUCCIONES:
//
// 1. Descomenta el import de `memo` en la línea indicada
// 2. Envuelve la función con memo() y actualiza el export
// 3. Fuerza re-renders del padre (botón "Forzar Re-render") y observa
//    que el contador de renders YA NO incrementa en este componente
//
// ANTES (sin optimizar):
//   export function PatientCardMemo(props) { ... }
//
// DESPUÉS (optimizado):
//   export const PatientCardMemo = memo(function PatientCardMemo(props) { ... })
//
// PISTA: memo hace una comparación shallow de props.
//   → Si `patient` y `onDischarge` no cambiaron → no re-renderiza.
//   → Si `onDischarge` es una función nueva en cada render → sí re-renderiza.
//   → Por eso el padre usa useCallback en handleDischarge.
// ============================================================

'use client';
// PASO 1: Descomenta esta línea
import { memo } from 'react';
import { useRef, useLayoutEffect } from 'react';
import type { Patient } from '@/lib/mock-data';

interface Props {
  patient: Patient;
  onDischarge: (id: string) => void;
}

const STATUS_STYLES = {
  stable:     'bg-green-100 text-green-800',
  critical:   'bg-red-100 text-red-800',
  monitoring: 'bg-amber-100 text-amber-800',
} as const;

// PASO 2: Reemplaza `export function PatientCardMemo` por:
//   export const PatientCardMemo = memo(function PatientCardMemo
// PASO 3: Agrega el cierre `);` al final del componente
export const PatientCardMemo = memo(function PatientCardMemo(props: Props) {
  const { patient, onDischarge } = props;
  const renderCount = useRef(0);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    renderCount.current++;
    if (badgeRef.current) {
      badgeRef.current.textContent = `render #${renderCount.current}`;
    }
    const el = containerRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'render-flash 0.6s ease-out';
  });

  return (
    <div ref={containerRef} className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium text-slate-800 text-sm">{patient.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{patient.mrn} · {patient.ward}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[patient.status]}`}>
            {patient.status}
          </span>
          <span ref={badgeRef} className="text-xs font-mono bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            render #0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-xs mb-3">
        {[
          { label: 'FC',   value: `${patient.vitals.hr}bpm` },
          { label: 'PA',   value: patient.vitals.bp },
          { label: 'SpO₂', value: `${patient.vitals.spo2}%` },
          { label: 'Temp', value: `${patient.vitals.temp}°C` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded p-1.5 text-center">
            <div className="text-slate-400 font-medium">{label}</div>
            <div className="text-slate-700 font-mono">{value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onDischarge(patient.id)}
        className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
      >
        Alta médica →
      </button>
    </div>
  )
});


/**
 * NOTAS PERSONALES:
 * Referential Equality (Igualdad Referencial):
 * En JavaScript, existen dos tipos de datos: los primitivos (como string, number, boolean) y los objetos (como object, array, function).
 * Los primitivos se comparan por su VALOR: Si dos variables guardan el número 5, son exactamente iguales.
 * Los objetos se comparan por su REFERENCIA (su dirección en memoria): Cuando creas un objeto, JavaScript le asigna un lugar único en la memoria. No importa si dos objetos tienen exactamente las mismas propiedades; si están en ubicaciones de memoria distintas, no son iguales.
 * 
 * // Comparación de primitivos (por valor)
 * const a = "hola";
 * const b = "hola";
 * console.log(a === b); // true
 * 
 * // Comparación de objetos (por referencia)
 * const objeto1 = { id: 1 };
 * const objeto2 = { id: 1 };
 * console.log(objeto1 === objeto2); // false
 * 
 * const objeto3 = objeto1; // Apuntan al mismo lugar
 * console.log(objeto1 === objeto3); //  true
 * 
 * En React, cada vez que un componente se renderiza (se vuelve a ejecutar), todas las funciones y objetos declarados dentro de él se vuelven a crear en una nueva dirección de memoria, perdiendo la igualdad referencial con el render anterior.
 * 
 * Shallow Comparison (Comparación Superficial):
 * Es un Método para verificar si dos objetos son iguales solo en su primer nivel de profundidad, no entra a comparar objetos anidados.
 * 
 * Cuando haces una comparación superficial entre dos objetos, el sistema hace un ciclo for...in y compara cada propiedad individual utilizando el operador === (que, como acabamos de ver, usa igualdad referencial para los objetos).
 * 
 * Regla de oro: La comparación superficial solo funciona perfectamente si las propiedades del objeto son tipos primitivos (string, number, boolean).
 * 
 * React.memo:
 * Es una Función de Orden Superior (HOC) que utilizas para envolver un componente, lo que haces es "memoizarlo" esto significa que React almacenará el resultado del renderizado del componente y solo lo volverá a renderizar si las props cambian (según una comparación superficial).
 * 
 * como funciona?
 * Antes de Renderizar el componente, React.memo hace una comparación superficial entre las props anteriores y las nuevas. Si todas las props son iguales (usando ===), React reutiliza el resultado del renderizado anterior, evitando así un nuevo render.
 * 
 * Peligro de juntar los 3 conceptos?
 * Si tus props incluyen objetos o funciones que se crean dentro del componente padre, cada render del padre generará nuevas referencias para esos objetos o funciones, lo que hará que React.memo piense que las props han cambiado, incluso si los valores son los mismos. Esto puede llevar a re-renders innecesarios.
 * Para evitar esto, puedes usar useCallback para funciones y useMemo para objetos/arrays, asegurándote de que mantengan la misma referencia a menos que sus dependencias cambien.
 * 
 * Árbol de decisiones para usar React.memo:
 * 1. ¿El componente es funcional y se beneficia de evitar re-renders? → Sí → Considera usar React.memo.
 * 2. ¿Las props del componente son principalmente tipos primitivos? → Sí → React.memo funcionará bien con la comparación superficial.
 * 3. ¿Las props incluyen objetos o funciones que se crean en el padre? → Sí → Necesitarás usar useMemo o useCallback para mantener referencias estables, de lo contrario, React.memo no evitará los re-renders.
 * 4. ¿El componente tiene un render costoso? → Sí → React.memo puede mejorar el rendimiento al evitar renders innecesarios.
 * 5. ¿El componente es pequeño y se renderiza rápidamente? → Sí → El overhead de React.memo podría superar los beneficios, así que úsalo con precaución.
 * 
 * React.memo o useMemo?
 * React.memo se utiliza para memoizar un componente completo, evitando que se vuelva a renderizar si sus props no cambian.
 * useMemo se utiliza para memoizar el resultado de una función o cálculo dentro de un componente, evitando que se vuelva a calcular si sus dependencias no cambian.
 * En resumen, React.memo es para componentes, mientras que useMemo es para valores o cálculos dentro de un componente.
 */