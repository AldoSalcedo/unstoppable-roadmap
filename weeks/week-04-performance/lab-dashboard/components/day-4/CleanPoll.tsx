// DÍA 4: Componente SIN memory leak — cleanup correcto en useEffect
// CONCEPTOS CLAVE: useEffect return cleanup, clearInterval, referencia estable

'use client';
import { useEffect, useState, useRef } from 'react';

interface Props {
  label: string;
}

// Nivel de módulo: persiste entre remontajes (useRef se destruiría en cada remount)
let cleanMountCycles = 0;

// ✅ CORRECTO: el intervalo se limpia cuando el componente se desmonta
export function CleanPoll({ label }: Props) {
  const [count, setCount] = useState(0);
  const mountBadgeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Incrementa el contador de montajes y actualiza el DOM directamente
    cleanMountCycles++;
    if (mountBadgeRef.current) {
      mountBadgeRef.current.textContent = `Ciclos de montaje: ${cleanMountCycles}`;
    }

    // ✅ Guardamos el ID para cancelarlo en el cleanup
    const intervalId = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    // ✅ CLEANUP: se ejecuta cuando el componente se desmonta o el efecto se re-ejecuta
    // Sin importar cuántas veces montes/desmontes: siempre hay exactamente 1 intervalo.
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="border-2 border-green-300 bg-green-50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✅</span>
        <h3 className="font-semibold text-green-800">{label} — Sin Fuga</h3>
      </div>

      <div className="text-4xl font-mono font-bold text-green-700 mb-2">{count}</div>
      <p className="text-sm text-green-600 mb-3">actualizaciones recibidas</p>

      <div className="bg-green-100 rounded-lg p-3 space-y-1">
        <p ref={mountBadgeRef} className="text-xs text-green-700 font-medium">
          Ciclos de montaje: 0
        </p>
        <p className="text-xs text-green-600">
          Sin importar cuántas veces se desmonte, el contador
          siempre reinicia y el ritmo es constante (1/seg).
        </p>
      </div>
    </div>
  );
}
