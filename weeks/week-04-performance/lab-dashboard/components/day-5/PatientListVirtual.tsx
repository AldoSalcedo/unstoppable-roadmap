// DÍA 5: Lista CON virtualización usando react-window
// CONCEPTOS CLAVE: windowing, FixedSizeList, solo renderiza items visibles
//
// ✅ SOLUCIÓN: FixedSizeList solo mantiene ~10 nodos DOM en memoria,
// independientemente de cuántos items haya en total.
// El scroll es 60fps porque el trabajo de render es constante.

'use client';
import { VariableSizeList } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import type { Patient } from '@/lib/mock-data';
import Image from 'next/image';

const STATUS_STYLES = {
  stable:     'bg-green-100 text-green-800',
  critical:   'bg-red-100 text-red-800',
  monitoring: 'bg-amber-100 text-amber-800',
} as const;

// Componente de fila definido FUERA del componente principal
// para evitar que se recree en cada render de la lista padre
function PatientRow({ index, style, data }: ListChildComponentProps<Patient[]>) {
  const patient = data[index];
  return (
    <div style={style} className="px-2">
      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 h-full">
        <div className="flex items-center gap-3">
          <Image
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.name}`}
            alt={patient.name}
            width={32}
            height={32}
            loading="lazy"
            unoptimized // Evita optimización para imágenes dinámicas
            className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0"
          />
          <div>
            <p className="text-sm font-medium text-slate-800 leading-tight">{patient.name}</p>
            <p className="text-xs text-slate-500">{patient.mrn} · {patient.ward}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-slate-500 hidden sm:block">
            {patient.vitals.hr}bpm · {patient.vitals.spo2}%
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[patient.status]}`}>
            {patient.status}
          </span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  patients: Patient[];
}

// ✅ Solo ~10-12 filas en el DOM en cualquier momento
export function PatientListVirtual({ patients }: Props) {
  const itemSize = (index: number) => patients[index].status === 'critical' ? 80 : 52;
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <VariableSizeList
        height={600}
        itemCount={patients.length}
        itemSize={itemSize}      // Altura de cada fila en px
        width="100%"
        itemData={patients}
        overscanCount={3}  // Filas extra renderizadas fuera del viewport para scroll suave
      >
        {PatientRow}
      </VariableSizeList>
    </div>
  );
}

/**
 * MIS NOTAS PERSONALES:
 * que son los NODOS DOM?
 * Elementos HTML que React crea para mostrar la UI. Cada paciente renderizado es un nodo DOM.
 * 
 * render all items?
 * Sin virtualización, React renderiza TODOS los pacientes (10,000 nodos DOM).
 * 
 * performance degradation?
 * Con muchos nodos DOM, el navegador se ralentiza, el scroll es lento y la experiencia de usuario empeora.
 * 
 * windowing (Ventanado o Virtualización)?
 * Es una técnica de optimización que consiste en crear una "ventana" virtual. En lugar de renderizar los 10,000 elementos en el DOM, 
 * el sistema solo renderiza los elementos que están actualmente visibles en la pantalla del usuario (más uno o dos arriba y abajo como colchón).
 * A medida que el usuario hace scroll hacia abajo, los elementos que van saliendo de la pantalla se destruyen y se eliminan del DOM, y los nuevos elementos que van entrando se crean dinámicamente, 
 * reutilizando el espacio. De esta forma, el DOM siempre se mantiene ligero, conteniendo únicamente unos 10 o 15 nodos en total, sin importar si tu lista tiene 10,000 o 1,000,000 de registros.
 * 
 * viewport?
 * Área visible del contenedor. Solo los items dentro de esta área se renderizan.
 * 
 * FixedSizeList?
 * Componente de react-window para listas con filas de tamaño fijo. Solo renderiza lo visible + overscan.
 * 
 * VariableSizeList?
 * Similar a FixedSizeList pero permite filas de diferentes tamaños, útil para destacar pacientes críticos.
 * 
 * overscanCount?
 * Número de filas adicionales renderizadas fuera del viewport para mejorar la fluidez del scroll.
 */