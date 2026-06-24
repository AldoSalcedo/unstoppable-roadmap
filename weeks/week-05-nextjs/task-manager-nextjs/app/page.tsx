/**
 * page.tsx — Home Page (Ruta: /)
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - El archivo `page.tsx` es lo único que crea una URL en Next.js
 * - Server Component por defecto: corre en el servidor, sin JS al cliente
 * - `<Link>` de next/link: prefetching automático al hacer hover
 * - Metadata puede ser static (aquí) o dynamic (en páginas con params)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getTaskStats } from '@/lib/data';

// ============================================================================
// TAREA 1.9: METADATA ESTÁTICA DE LA HOME
// ============================================================================

// Esta metadata sobreescribe el `default` del root layout
// El `template` del root layout la formateará como: "Inicio | Task Manager Clínico"
export const metadata: Metadata = {
  title: 'Inicio',
  description: 'Panel principal del sistema de gestión de tareas clínicas.',
};

// ============================================================================
// TAREA 1.10: HOME PAGE — SERVER COMPONENT ASYNC
// ============================================================================

/**
 * HomePage — página principal de la aplicación
 *
 * Observa: es `async` aunque no use `await` directamente en el JSX.
 * Los Server Components pueden ser async para hacer fetching en el servidor.
 *
 * `getTaskStats()` corre AQUÍ en el servidor, no en el browser.
 * El cliente solo recibe el HTML ya renderizado con los números.
 */
export default async function HomePage() {
  // Fetch de estadísticas directo desde el Server Component
  // En producción esto sería una query a PostgreSQL vía Prisma
  const stats = await getTaskStats();

  return (
    <div className="min-h-full flex flex-col">
      {/* Header de navegación */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Ícono de salud como identidad visual */}
            <span className="text-2xl">🏥</span>
            <h1 className="text-xl font-semibold text-slate-900">
              Task Manager Clínico
            </h1>
          </div>
          <nav className="flex gap-4 text-sm font-medium">
            <Link
              href="/tasks"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver Tareas
            </Link>
            <Link
              href="/tasks/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nueva Tarea
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Panel de Control
          </h2>
          <p className="text-slate-500">
            Resumen de actividad del equipo clínico
          </p>
        </div>

        {/* Tarjetas de estadísticas — datos del servidor */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Tareas"
            value={stats.total}
            color="blue"
          />
          <StatCard
            label="En Progreso"
            value={stats.byStatus.IN_PROGRESS}
            color="amber"
          />
          <StatCard
            label="Completadas"
            value={stats.byStatus.DONE}
            color="green"
          />
          <StatCard
            label="Críticas"
            value={stats.critical}
            color="red"
          />
        </div>

        {/* CTA(Call To Action) principal */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            Gestiona las tareas de tu equipo
          </h3>
          <p className="text-blue-600 mb-6 max-w-md mx-auto">
            Prioriza, asigna y da seguimiento a todas las actividades clínicas
            desde un solo lugar.
          </p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ver todas las tareas →
          </Link>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// TAREA 1.11: COMPONENTE AUXILIAR — SERVER COMPONENT
// ============================================================================

/**
 * StatCard — tarjeta de estadística
 *
 * Este es un Server Component (sin 'use client').
 * Solo renderiza HTML estático, sin interactividad → no va al bundle JS.
 *
 * Patrón: componentes simples de presentación = Server Components.
 * Solo necesitan 'use client' si tienen onClick, useState, etc.
 */
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'amber' | 'green' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    red: 'bg-red-50 border-red-100 text-red-700',
  };

  return (
    <div className={`border rounded-xl p-5 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-75 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

/**
 * NOTAS PERSONALES — Día 1
 * - `page.tsx` y `layout.tsx` son Server Components por defecto
 * - `export const metadata` funciona solo en Server Components
 * - `async` en un Server Component es normal y poderoso
 * - `<Link>` prefetchea la ruta al hacer hover, sin recargar la página
 * - Los componentes auxiliares dentro de un Server Component
 * también son Server Components — no se mandan al cliente
 * Server Components: estos componentes se ejecutan e integran exclusivamente en el servidor, y al navegador solo le llega el resultado final listo para empaquetarse en la pantalla.
 * Server vs. Client Components:
 * Se ejecutan únicamente en el servidor. Pueden conectarse directamente a tu base de datos, leer archivos del sistema y realizar peticiones HTTP pesadas de forma segura y ultra rápida porque están en el mismo centro de datos.
 * No tienen acceso al navegador. No puedes usar eventos como onClick, ni hooks de estado o efectos como useState o useEffect.
 * 
 * Client Components (Los tradicionales): Se envían y ejecutan en el navegador (se activan escribiendo "use client" al inicio del archivo).
 * Tienen interactividad total. Manejan el estado, formularios, animaciones, clics, y hooks de React.
 * 
 * URL (Uniform Resource Locator): dirección única para localiår y acceder a recursos específicos como sitios web, imágenes o documentos en internet.
 * 
 * Prefetching (en español, Pre-recuperación o Pre-carga) es una técnica de optimización de rendimiento que consiste en descargar recursos (como páginas, código, imágenes o datos) antes de que el usuario los solicite explícitamente.
 * 
 * Metadata (datos sobre otros datos): no es el contenido principal en sí, sino toda la información oculta, descriptiva y estructural que sirve para identificar, clasificar, organizar y entender ese contenido principal.
 * Ejemplo analógico: Un Libro > El dato principal: Es la historia, el texto completo de los capítulos que vas a leer.
 * La metadata: Es la información que viene en la portada y en la ficha bibliográfica: el nombre del autor, el título, el año de publicación, la editorial, el número de páginas y el código de barras (ISBN).
 * Tú no lees el libro por el código de barras, pero las librerías y las computadoras necesitan ese código (esa metadata) para poder encontrar el libro en una base de datos en un segundo.
 * Metadata en la Web (SEO y Navegadores): es toda la información que pones dentro de la etiqueta <head> de tu HTML. Los usuarios no la ven directamente en la página, pero es vital para los buscadores (como Google) y los navegadores.
 * Metadata en Archivos (Fotos, Videos, PDFs): La metadata (datos EXIF): El archivo guarda oculto el modelo de tu teléfono, la hora exacta en la que tomaste la foto, la apertura del lente y, si tienes el GPS encendido, las coordenadas geográficas exactas de dónde estabas parado.
 * Metadata en Bases de Datos: es el Esquema de la base de datos. Te dice cómo se llaman las columnas, si el dato debe ser un número o un texto, cuál es la clave primaria y cómo se relacionan las tablas entre sí, pero no contiene los registros de los pacientes reales.
 * 
 * 
*/
