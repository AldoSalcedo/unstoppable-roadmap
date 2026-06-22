// DÍA 4: Componente CON memory leak — setInterval sin cleanup
// CONCEPTOS CLAVE: memory leak, setInterval, useEffect sin return
//
// ❌ PROBLEMA: El intervalo nunca se limpia cuando el componente se desmonta.
// Cada vez que montas y desmontas este componente, se acumula un nuevo intervalo.
// Después de 3 montajes: 3 intervalos corriendo simultáneamente.
// El contador incrementa cada vez más rápido.

'use client';
import { useEffect, useState, useRef } from 'react';

interface Props {
  label: string;
}

// Nivel de módulo: persiste entre remontajes (useRef se destruiría en cada remount)
let leakyMountCycles = 0;

export function LeakyPoll({ label }: Props) {
  const [count, setCount] = useState(0);
  const mountBadgeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Incrementa el contador de montajes y actualiza el DOM directamente
    leakyMountCycles++;
    if (mountBadgeRef.current) {
      mountBadgeRef.current.textContent = `Ciclos de montaje: ${leakyMountCycles}`;
    }

    // ❌ FUGA: el ID del intervalo no se guarda ni se limpia
    /*setInterval(() => {
      setCount(c => c + 1);
    }, 1000);*/

    // ❌ FALTA el return: () => clearInterval(intervalId)
    // Cada montaje agrega un intervalo que nunca se cancela.

    // CORRECTO:
    const intervalId = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    }
  }, []);

  return (
    <div className="border-2 border-red-300 bg-red-50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚠️</span>
        <h3 className="font-semibold text-red-800">{label} — Con Fuga</h3>
      </div>

      <div className="text-4xl font-mono font-bold text-red-700 mb-2">{count}</div>
      <p className="text-sm text-red-600 mb-3">actualizaciones recibidas</p>

      <div className="bg-red-100 rounded-lg p-3 space-y-1">
        <p ref={mountBadgeRef} className="text-xs text-red-700 font-medium">
          Ciclos de montaje: 0
        </p>
        <p className="text-xs text-red-600">
          Después de N montajes, hay N intervalos acumulados.
          El contador acelera con cada ciclo.
        </p>
      </div>
    </div>
  );
}
