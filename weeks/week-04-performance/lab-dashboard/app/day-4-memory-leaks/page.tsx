// DÍA 4: Laboratorio de Memory Leaks
// Las fugas de memoria hacen que la app crezca hasta crashear.

'use client';
import { useState } from 'react';
import { LeakyPoll } from '@/components/day-4/LeakyPoll';
import { CleanPoll } from '@/components/day-4/CleanPoll';
import Link from 'next/link';

export default function Day4Page() {
  const [showLeaky, setShowLeaky] = useState(true);
  const [showClean, setShowClean] = useState(true);
  const [leakyKey, setLeakyKey] = useState(0);
  const [cleanKey, setCleanKey] = useState(0);

  const remountLeaky = () => {
    setShowLeaky(false);
    setTimeout(() => { setLeakyKey(k => k + 1); setShowLeaky(true); }, 150);
  };

  const remountClean = () => {
    setShowClean(false);
    setTimeout(() => { setCleanKey(k => k + 1); setShowClean(true); }, 150);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-3 inline-block">
          ← Volver al Hub
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Día 4: Memory Leaks</h1>
        <p className="text-slate-500 mt-1">
          Los recursos no liberados se acumulan indefinidamente.
          Aprende los 4 patrones de fuga más comunes y cómo prevenirlos.
        </p>
      </div>

      {/* Demo 1: setInterval */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-2">Demo 1: setInterval sin cleanup</h2>
        <p className="text-sm text-slate-600 mb-4">
          Haz clic en <strong>`Desmontar + Remontar`</strong> varias veces en el componente con fuga.
          Observa cómo el contador acelera con cada ciclo porque los intervalos se acumulan.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <button
              onClick={remountLeaky}
              className="mb-3 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Desmontar + Remontar ❌
            </button>
            {showLeaky && <LeakyPoll key={leakyKey} label="setInterval" />}
          </div>

          <div>
            <button
              onClick={remountClean}
              className="mb-3 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Desmontar + Remontar ✅
            </button>
            {showClean && <CleanPoll key={cleanKey} label="setInterval" />}
          </div>
        </div>
      </div>

      {/* Los 4 patrones */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          {
            title: '1. setInterval sin clearInterval',
            code: [
              '// ❌ FUGA',
              'useEffect(() => {',
              '  setInterval(fn, 1000);',
              '  // Falta: return () => clearInterval(id)',
              '}, []);',
              '',
              '// ✅ CORRECTO',
              'useEffect(() => {',
              '  const id = setInterval(fn, 1000);',
              '  return () => clearInterval(id);',
              '}, []);',
            ],
          },
          {
            title: '2. addEventListener sin removeEventListener',
            code: [
              '// ❌ FUGA',
              'useEffect(() => {',
              '  window.addEventListener("scroll", fn);',
              '  // Falta: return para remover',
              '}, []);',
              '',
              '// ✅ CORRECTO',
              'useEffect(() => {',
              '  window.addEventListener("scroll", fn);',
              '  return () => window.removeEventListener("scroll", fn);',
              '}, []);',
            ],
          },
          {
            title: '3. fetch sin AbortController',
            code: [
              '// ❌ FUGA: setState post-unmount',
              'useEffect(() => {',
              '  fetch("/api/patients")',
              '    .then(r => r.json())',
              '    .then(data => setState(data));',
              '}, []);',
              '',
              '// ✅ CORRECTO',
              'useEffect(() => {',
              '  const ctrl = new AbortController();',
              '  fetch("/api/patients", { signal: ctrl.signal })',
              '    .then(r => r.json())',
              '    .then(data => setState(data))',
              '    .catch(e => { if (e.name !== "AbortError") throw e; });',
              '  return () => ctrl.abort();',
              '}, []);',
            ],
          },
          {
            title: '4. Suscripción sin unsubscribe',
            code: [
              '// ❌ FUGA',
              'useEffect(() => {',
              '  const sub = store.subscribe(fn);',
              '  // Falta: return para cancelar',
              '}, []);',
              '',
              '// ✅ CORRECTO',
              'useEffect(() => {',
              '  const sub = store.subscribe(fn);',
              '  return () => sub.unsubscribe();',
              '}, []);',
            ],
          },
        ].map(({ title, code }) => (
          <div key={title} className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">{title}</h3>
            <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-x-auto">
              {code.map((line, i) => (
                <p key={i} className={line.startsWith('// ❌') ? 'text-red-400' : line.startsWith('// ✅') ? 'text-green-400' : line.startsWith('// ') ? 'text-slate-400' : ''}>
                  {line || ' '}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ejercicio */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">EJERCICIO</span>
          <h2 className="font-semibold text-slate-800">Arregla LeakyPoll.tsx</h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          Edita{' '}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">components/day-4/LeakyPoll.tsx</code>{' '}
          y agrega el cleanup correcto. Después de arreglarlo, el comportamiento debe
          ser idéntico a <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">CleanPoll.tsx</code>:
          el contador reinicia y el ritmo es constante al remontar.
        </p>
        <p className="text-sm text-slate-600">
          Bonus: abre DevTools → Memory y toma un heap snapshot antes y después de remontar
          el componente con fuga vs. el componente limpio. Compara el crecimiento de memoria.
        </p>
      </div>
    </div>
  );
}


/**
 * NOTAS PERSONALES:
 * Memory Leaks (Fugas de Memoria):
 * ocurre cuando tu aplicación reserva un espacio en la memoria RAM para guardar datos (un objeto, un array, una función) pero, cuando ya no los necesita, se le olvida liberarlos.
 * si dejas un "cable conectado" por accidente (por ejemplo, una función escuchando un evento para siempre), el Recolector de Basura pensará que todavía lo estás usando y jamás lo borrará.
 * Si el usuario pasa mucho tiempo navegando en tu aplicación y los Memory Leaks se acumulan, la app consumirá cada vez más memoria RAM hasta que el navegador se vuelva extremadamente lento o la pestaña simplemente se cierre por completo con un error de "Memoria Insuficiente".
 * 
 * useEffect Cleanup (Función de Limpieza):
 * el hook useEffect es el lugar principal donde se generan Memory Leaks si no somos cuidadosos. Cuando un componente nace (mounts), puedes configurar temporizadores (setInterval) o escuchar eventos globales (window.addEventListener).
 * Si el componente se destruye (unmounts) porque el usuario cambió de pantalla, ese temporizador o ese escuchador de eventos seguirá viviendo en la memoria del navegador, intentando actualizar un componente que ya no existe.
 * Para solucionar esto, useEffect te permite retornar una función de limpieza (cleanup function). React ejecutará esta función justo antes de que el componente desaparezca.
 * return () => {
      // Desconectamos el cable. Si no hacemos esto, ¡creamos un Memory Leak!
      window.removeEventListener('mousemove', manejarMovimiento);
    };
  *
  * En el caso de setInterval, el cleanup se encarga de llamar a clearInterval con el ID del intervalo que quieres cancelar. Así, aunque el usuario monte y desmonte el componente varias veces, siempre habrá exactamente un intervalo activo.
  * 
  * Abort Controller (Controlador de Aborto):
  * Uno de los causantes de fugas de memoria más comunes en aplicaciones HealthTech son las peticiones HTTP lentas.
  * usuario entra al perfil de un paciente. El componente inicia una petición a la base de datos (fetch('/paciente/123')) que tardará 5 segundos. Pero a los 2 segundos, el usuario se desespera y hace clic en otra pantalla. 
  * El componente del paciente se destruye... ¡pero la petición de internet sigue corriendo! Cuando el servidor responda, los datos llegarán a un componente muerto, causando un desperdicio de memoria y posibles errores en la consola.
  * El AbortController es una herramienta nativa de JavaScript que te permite cancelar peticiones de red en el momento exacto en que dejas de necesitarlas.
  * 
  * useEffect(() => {
  // 1. Creamos una instancia del controlador
  const controlador = new AbortController();
  const { signal } = controlador; // Esta es la "señal" de parada

  async function cargarDatosPaciente() {
    try {
      // 2. Le pasamos la señal a la petición fetch
      const respuesta = await fetch('/api/paciente/123', { signal });
      const datos = await respuesta.json();
      setPaciente(datos);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Petición cancelada exitosamente.');
      } else {
        // Manejar errores reales aquí
      }
    }
  }

  cargarDatosPaciente();

  // 3. Si el componente muere antes de que termine el fetch, ¡abortamos la misión!
  return () => {
    controlador.abort();
  };
}, []);

  * DevTool Memory (Pestaña de Memoria en las Herramientas de Desarrollador):
  * ¿Cómo sabes si tu código realmente tiene una fuga de memoria? Para eso existe la pestaña Memory dentro de las DevTools de tu navegador (Chrome, Edge, Brave, etc.).
  * Esta herramienta te permite tomar capturas del estado de la memoria RAM de tu aplicación en un momento preciso (llamadas Heap Snapshots). El flujo para cazar un Memory Leak suele ser el siguiente:
  * 1. Abres DevTools → Memory.
  * 2. Realizas la acción sospechosa en tu app (por ejemplo, entras a la sección de "Historial Clínico", abres 10 expedientes de pacientes y los cierras todos volviendo al inicio).
  * 3. Tomas un Heap Snapshot justo después de realizar esa acción.
  * 4. Comparas ambos snapshots: Si la memoria RAM subió drásticamente y no bajó después de cerrar los expedientes, la herramienta te mostrará una lista exacta de qué objetos (o Value Objects, Entidades, Clases) se quedaron atrapados en la memoria y en qué línea de código se originaron.
  * 
  * guía paso a paso para aprender a leerlos e interpretarlos como un profesional:
  * El Panel Principal: Las Columnas Clave:
  * Constructor: Es el "molde" o la clase del objeto. Por ejemplo, verás string, Array, Object, o nombres de tus propias clases si usas Programación Orientada a Objetos (como Paciente o PresionArterial).
  * Distance (Distancia): Indica qué tan lejos está ese objeto de la "raíz" de la aplicación (window o el nodo principal). Una distancia de 2 o 3 significa que está muy cerca de la raíz (fácilmente accesible). Si un objeto tiene una distancia muy alta, está anidado profundamente.
  * Shallow Size (Tamaño Superficial): Es el peso en bytes que ocupa únicamente ese objeto en sí mismo (sus propiedades primitivas inmediatas). No incluye el peso de otros objetos que tenga guardados adentro. Los strings y arrays grandes suelen tener un Shallow Size alto.
  * Retained Size (Tamaño Retenido): Este es el número más importante para cazar fugas. Es el tamaño total de memoria que se liberaría si destruyeras ese objeto. Incluye el peso del objeto más el de todos los objetos hijos que dependen exclusivamente de él.
  * El truco del Retained Size: Si ves un objeto pequeño (Shallow Size de 32 bytes) pero que tiene un Retained Size de 50 MB, significa que ese pequeño objeto es el "tapón" que mantiene vivos en memoria 50 megabytes de datos. Si eliminas ese objeto, liberarás los 50 MB de golpe.
  * 
  * Las Vistas de Inspección (Filtros):
  * En la parte superior de la pestaña, verás un menú desplegable que por defecto dice Summary (Resumen). Puedes cambiarlo para analizar la memoria desde diferentes ángulos:
  * Summary: Agrupa todos los objetos por su tipo de constructor. Es ideal para ver qué tipo de dato está consumiendo más memoria en total.
  * Comparison (Comparación): Esta es la vista estrella para buscar Memory Leaks. Te permite comparar el Snapshot 2 contra el Snapshot 1. Te mostrará exactamente cuántos objetos nuevos se crearon (# Delta) y cuánta memoria neta subió o bajó (Size Delta).
  * Containment (Contención): Te permite explorar la estructura de la memoria como si fuera el sistema de carpetas de tu computadora, empezando desde la raíz de la app (window).
  * 
  * El Árbol de Retenedores (Retainers):
  * Cuando haces clic en cualquier objeto de la lista superior, en la parte inferior de la pantalla se abrirá un segundo panel llamado Retainers (Retenedores).
  * Este panel se lee de abajo hacia arriba y te muestra la cadena exacta de referencias que mantiene vivo a ese objeto en memoria. Es como un mapa de "quién está sosteniendo a quién". Si quieres eliminar un objeto para liberar memoria, debes romper esta cadena de referencias.
  * Si ves que tu clase Paciente aparece en los retenedores amarrada a un EventListener o a una variable global dentro de un archivo de React, habrás encontrado la línea exacta que está causando la fuga de memoria.
  * 
  * Guía Práctica: Cómo cazar un Memory Leak en 3 pasos:
  * Paso 1: Establecer la línea base:
  * Entra a tu aplicación, quédate en la pantalla de inicio (Home) y toma el Snapshot 1.
  * Paso 2: Realizar la acción y salir:
  * Ve a la pantalla de "Historial Clínico", abre un par de expedientes, ciérralos y regresa exactamente a la pantalla de inicio (Home). Fuerza al navegador a limpiar la memoria haciendo clic en el icono del bote de basura (Collect Garbage) que está en la esquina superior izquierda de las DevTools. Luego, toma el Snapshot 2.
  * Paso 3: Analizar la comparación:
  * Selecciona el Snapshot 2 en la barra lateral.
  * Cambia la vista de "Summary" a Comparison y selecciona el Snapshot 1 como base.
  * Ordena la columna Delta (de mayor a menor).
  * El veredicto: Si tu pantalla está limpia, el Delta de objetos como Paciente o componentes visuales debería ser 0 (porque al volver al Home debieron destruirse). Si ves un Delta positivo (por ejemplo, +5 Pacientes), expande la lista, haz clic en uno de ellos y revisa el panel inferior de Retainers para ver qué función o callback se quedó con la referencia de memoria.
 */