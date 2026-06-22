// DÍA 6: Laboratorio de Optimización de Imágenes y Assets
// Las imágenes son el mayor contribuyente al LCP(Largest contentful paint). Optimizarlas tiene el mayor impacto.

import Image from 'next/image';
import Link from 'next/link';

export default function Day6Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-3 inline-block">
          ← Volver al Hub
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Día 6: Imágenes & Assets</h1>
        <p className="text-slate-500 mt-1">
          Las imágenes suelen ser el mayor contribuyente al LCP(Largest contentful paint) y al CLS(Cumulative Layout stability).
          Optimizarlas es la mejora de performance más visible para el usuario.
        </p>
      </div>

      {/* img vs Image */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-4">HTML &lt;img&gt; vs Next.js &lt;Image&gt;</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded mb-3 inline-block">
              ❌ HTML img — sin optimizar
            </span>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/next.svg" alt="Logo sin optimizar" width={120} height={24} />
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono">
              <p className="text-slate-300">{'<img'}</p>
              <p className="text-slate-300">{'  src="/logo.png"'}</p>
              <p className="text-slate-300">{'  alt="Logo"'}</p>
              <p className="text-red-400">{'  // ❌ Sin width/height → CLS'}</p>
              <p className="text-red-400">{'  // ❌ Sin lazy loading'}</p>
              <p className="text-red-400">{'  // ❌ Sin conversión WebP'}</p>
              <p className="text-red-400">{'  // ❌ Sin srcset responsivo'}</p>
              <p className="text-slate-300">{'>'}</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded mb-3 inline-block">
              ✅ Next.js Image — optimizado
            </span>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3 flex justify-center">
              <Image
                src="/next.svg"
                alt="Logo optimizado"
                width={120}
                height={24}
                quality={85}
              />
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono">
              <p className="text-slate-300">{'<Image'}</p>
              <p className="text-slate-300">{'  src="/logo.png"'}</p>
              <p className="text-slate-300">{'  alt="Logo"'}</p>
              <p className="text-green-400">{'  width={120} height={24}'}</p>
              <p className="text-green-400">{'  // ✅ Reserva espacio → CLS = 0'}</p>
              <p className="text-green-400">{'  // ✅ Lazy loading automático'}</p>
              <p className="text-green-400">{'  // ✅ Convierte a WebP/AVIF'}</p>
              <p className="text-green-400">{'  // ✅ srcset responsivo generado'}</p>
              <p className="text-slate-300">{'>'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Técnicas */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          {
            title: 'priority — LCP hero',
            description: 'La imagen más grande above-the-fold debe cargarse con prioridad. Añade <link rel="preload"> automáticamente.',
            code: '<Image\n  src="/hero-scan.jpg"\n  priority   // ← preload, mejora LCP\n  alt="Scan"\n  width={1200}\n  height={600}\n/>',
            when: 'La imagen hero, el logo del header, o cualquier imagen grande visible al cargar.',
          },
          {
            title: 'loading="lazy" — below-the-fold',
            description: 'Las imágenes fuera del viewport inicial no se descargan hasta que el usuario hace scroll.',
            code: '<Image\n  src="/patient-profile.jpg"\n  loading="lazy"  // ← default en Image\n  alt="Paciente"\n  width={64}\n  height={64}\n/>',
            when: 'Imágenes en listas, tablas, o cualquier contenido debajo del fold.',
          },
          {
            title: 'sizes — responsivo',
            description: 'Indica al browser qué tamaño de imagen necesita según el viewport. Evita descargar 1200px para un thumbnail de 64px.',
            code: '<Image\n  src="/ward-photo.jpg"\n  fill\n  sizes="\n    (max-width: 768px) 100vw,\n    50vw\n  "\n  alt="Sala"\n/>',
            when: 'Imágenes en layouts de grilla o columnas responsivas.',
          },
          {
            title: 'placeholder="blur"',
            description: 'Muestra un placeholder difuminado mientras la imagen de alta resolución carga. Reduce el CLS percibido.',
            code: "// Para imágenes locales: automático\n// Para imágenes remotas: genera blurDataURL\nimport { getBase64 } from 'plaiceholder';\n\n<Image\n  src={src}\n  placeholder=\"blur\"\n  blurDataURL={blurBase64}\n  alt=\"Scan\"\n/>",
            when: 'Imágenes above-the-fold donde la carga es visible al usuario.',
          },
        ].map(({ title, description, code, when }) => (
          <div key={title} className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-800 text-sm mb-2">{title}</h3>
            <p className="text-sm text-slate-600 mb-3">{description}</p>
            <pre className="bg-slate-900 text-slate-200 rounded-lg p-3 text-xs font-mono overflow-x-auto mb-3 whitespace-pre-wrap">
              {code}
            </pre>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-500">Cuándo:</strong> {when}
            </p>
          </div>
        ))}
      </div>

      {/* Formatos */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-3">Formatos de imagen: JPEG → WebP → AVIF</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-slate-600 font-semibold">Formato</th>
                <th className="text-left py-2 pr-4 text-slate-600 font-semibold">Tamaño relativo</th>
                <th className="text-left py-2 pr-4 text-slate-600 font-semibold">Soporte</th>
                <th className="text-left py-2 text-slate-600 font-semibold">Recomendación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { fmt: 'JPEG',    size: '100%', support: 'Universal', rec: 'Baseline, evitar en lo posible' },
                { fmt: 'WebP',    size: '25-35% menos', support: '95%+ navegadores', rec: '✅ Usar como formato principal' },
                { fmt: 'AVIF',    size: '50% menos', support: 'Chrome, Firefox, Safari 16+', rec: '✅ Usar con fallback a WebP' },
                { fmt: 'SVG',     size: 'Variable', support: 'Universal', rec: '✅ Para logos e iconos (siempre)' },
              ].map(({ fmt, size, support, rec }) => (
                <tr key={fmt}>
                  <td className="py-2.5 pr-4 font-mono font-bold text-slate-700">{fmt}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{size}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{support}</td>
                  <td className="py-2.5 text-slate-600">{rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Next.js Image convierte automáticamente a WebP/AVIF según el soporte del navegador.
          Solo especifica JPEG/PNG en src; Next.js sirve el formato óptimo.
        </p>
      </div>

      {/* Ejercicio */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">EJERCICIO</span>
          <h2 className="font-semibold text-slate-800">Agrega avatares a la lista de pacientes</h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          En <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">components/day-5/PatientListVirtual.tsx</code>,
          reemplaza el div con la inicial del nombre por un{' '}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">{'<Image>'}</code> con lazy loading.
          Usa un servicio de avatares como placeholder:
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono">
          <p>{'<Image'}</p>
          <p>{"  src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.name}`}"}</p>
          <p>{'  alt={patient.name}'}</p>
          <p>{'  width={32}'}</p>
          <p>{'  height={32}'}</p>
          <p>{'  loading="lazy"'}</p>
          <p>{'  className="rounded-full"'}</p>
          <p>{'/>'}</p>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Recuerda agregar el hostname del servicio a <code className="bg-slate-100 px-1 py-0.5 rounded">next.config.ts</code>{' '}
          en <code className="bg-slate-100 px-1 py-0.5 rounded">images.remotePatterns</code>.
        </p>
      </div>
    </div>
  );
}


/**
 * NOTAS PERSONALES:
 * La Ubicación: Above-the-fold vs. Below-the-fold(dónde está ubicada respecto a la pantalla del usuario.):
 * Above-the-fold (Por encima del pliegue): Es la porción de la página web que el usuario ve inmediatamente apenas entra, sin necesidad de hacer scroll. Deben cargarse lo más rápido posible
 * Below-the-fold (Por debajo del pliegue): Es todo el contenido que está oculto hacia abajo y que el usuario solo descubrirá si decide hacer scroll. No hay prisa por cargarlas.
 * 
 * La Evolución: Formatos de imagen
 * SVG > Tipo: Vectorial > Uso: Logos, iconos, gráficas simples. > No está hecho de píxeles, sino de fórmulas matemáticas. Puedes agrandarlo al tamaño de un edificio y jamás se pixelará. Su peso es minúsculo (son solo líneas de código).
 * JPEG > Tipo: Mapa de bits (raster) > Uso: Fotografías antiguas / Compatibilidad. > El rey del pasado. Compresión con pérdida de calidad. No soporta transparencias. Hoy en día se considera un formato pesado para la web.
 * WebP > Tipo: Raster Moderno > Uso: Fotografías optimizadas e ilustraciones > Creado por Google. Es el estándar actual de la web. Es entre un 25% y un 34% más ligero que un JPEG idéntico (Sai, 2024) y sí soporta transparencias (reemplazando también al viejo y pesado PNG).
 * AVIF > Tipo: Raster de nueva Generación > Uso: Fotografías de altísima calidad. > El formato del futuro (con soporte ya en casi todos los navegadores). Ofrece una compresión todavía un 20% superior a WebP, manteniendo un nivel de detalle espectacular en los colores.
 * 
 * Raster (Rasterización):
 * El Raster (o rasterización) es el proceso interno mediante el cual el motor del navegador toma los elementos vectoriales y lógicos (HTML, CSS, formas, fuentes) y los convierte en pizarras de píxeles individuales de color para que tu monitor o la pantalla de tu teléfono los puedan mostrar.
 * Cuando una imagen es Raster (como un JPEG, PNG o WebP), significa que ya está hecha de una cuadrícula fija de píxeles. Si la estiras, se pixela.
 * En el rendimiento, la rasterización ocurre en hilos de procesamiento específicos (usualmente delegados a la GPU o tarjeta gráfica). Si tu CSS es demasiado complejo (sombras gigantes, filtros de desenfoque, animaciones pesadas), obligarás al navegador a re-rasterizar la pantalla constantemente, lo que provocará caídas de frames y lentitud visual.
 * 
 * Las Técnicas de Carga Inteligente: Lazy Load y Srcset:
 * Lazy Load (Carga diferida): Es una técnica que retrasa la carga de imágenes que no son visibles en el viewport inicial. Solo se descargan cuando el usuario hace scroll hacia ellas. Esto reduce el tiempo de carga inicial y mejora el LCP.
 * Facilisimo de implementes de forma nativa en HTML con el atributo loading="lazy", o automáticamente al usar el componente Image de Next.js.
 * 
 * Srcset (Imágenes responsivas): te permite pasarle al navegador un catálogo de diferentes tamaños de la misma imagen. El navegador, de forma inteligente, revisa el tamaño de la pantalla del dispositivo y descarga únicamente la que mejor se adapte.
 * Esto evita que un usuario en un móvil descargue una imagen de 1200px de ancho cuando solo necesita una de 400px, ahorrando ancho de banda y acelerando la carga.
 * 
 * Combinando todo en el código moderno (La etiqueta <picture>):
 * <picture>
  <source srcset="hospital.avif" type="image/avif" />
  
  <source srcset="hospital.webp" type="image/webp" />
  
  <img src="hospital.jpg" alt="Fachada del hospital" loading="lazy" />
</picture>

  * Dominar esta combinación asegura que tu aplicación cargue instantáneamente en el primer segundo (aligerando el contenido above-the-fold), ahorre datos móviles al usuario (lazy load) y consuma el menor ancho de banda posible utilizando compresión moderna (WebP/AVIF y SVG).
  * En Next.js, el componente Image abstrae gran parte de esta complejidad, pero es crucial entender lo que sucede bajo el capó para optimizar al máximo tus imágenes y assets.
  * Recuerda que la optimización de imágenes no solo mejora el rendimiento, sino que también reduce costos de hosting y ancho de banda, y contribuye a una experiencia de usuario más fluida y satisfactoria.
 */