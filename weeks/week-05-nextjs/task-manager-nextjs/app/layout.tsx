/**
 * layout.tsx — Root Layout del Task Manager Clínico
 * DÍA 1: App Router Fundamentals
 *
 * CONCEPTOS CLAVE:
 * - Root Layout: el único componente que envuelve TODA la app
 * - Metadata API: SEO centralizado en el servidor (sin react-helmet)
 * - Geist fonts: cargadas con `next/font` para evitar layout shift (CLS=0)
 * - `children`: así es como Next.js inyecta el page activo en el layout
 *
 * REGLA: El Root Layout DEBE tener <html> y <body>.
 * Si lo olvidas, Next.js muestra un error en build time.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// ============================================================================
// TAREA 1.6: FONTS CON ZERO LAYOUT SHIFT
// ============================================================================

// `next/font/google` descarga la fuente en build time y la sirve localmente.
// Sin esto: el browser pide la fuente a Google → se ve FOUT (Flash of Unstyled Text)
// Con esto: la fuente está lista antes de que el HTML se pinte → CLS = 0
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ============================================================================
// TAREA 1.7: METADATA API (SEO EN EL SERVIDOR)
// ============================================================================

/**
 * metadata — exportada desde un Server Component, nunca llega al bundle del cliente.
 *
 * Next.js inyecta estos valores en el <head> del HTML generado en servidor.
 * `title.template` permite que cada page haga: title: 'Mi Página'
 * y se vea como "Mi Página | Task Manager Clínico" automáticamente.
 */
export const metadata: Metadata = {
  title: {
    template: '%s | Task Manager Clínico',
    default: 'Task Manager Clínico',
  },
  description:
    'Sistema de gestión de tareas para equipos de salud. Organiza, prioriza y da seguimiento a las actividades clínicas.',
  keywords: ['healthcare', 'tareas', 'clínico', 'gestión', 'médico'],
  authors: [{ name: 'Aldo Salcedo' }],
};

// ============================================================================
// TAREA 1.8: ROOT LAYOUT COMPONENT
// ============================================================================

/**
 * RootLayout — envuelve TODA la aplicación
 *
 * Este es un Server Component por defecto (sin 'use client').
 * Puede acceder a cookies, headers, y hacer DB queries si fuera necesario.
 * Pero NO puede tener useState, useEffect, ni event handlers.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/*
       * `antialiased`: suaviza el texto en pantallas de alta densidad
       * `h-full`: necesario para que el body y los children puedan usar h-screen
       */}
      <body className="h-full bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

/**
 * REACT-HELMET: librería clásica y muy popular del ecosistema de React diseñada para gestionar la metadata de tu sitio web de forma dinámica.
 * funciona como un "casco" (helmet) que le pones a tus componentes para proteger y definir lo que va en la "cabeza" de tu página web (la etiqueta <head> de HTML).
 * permite modificar el título de la pestaña, las descripciones de SEO y las etiquetas de redes sociales directamente desde tus componentes de React.
 * Puedes importar y colocar el componente <Helmet> en cualquier parte de tu árbol de componentes. React Helmet interceptará esas etiquetas y las "inyectará" de forma mágica en el <head> real del documento de tu navegador.
 * Si el médico pasa del perfil de Juan Pérez al perfil de María Sosa, React Helmet actualizará instantáneamente el título de la pestaña del navegador para que coincida con el paciente actual.
 * SEO dinámico: Los robots de los buscadores (como el de Google) leen la metadata para indexar tus páginas. Si toda tu app comparte el mismo título genérico, perderás mucho posicionamiento web. Con React Helmet, cada artículo, producto o sección pública tiene su propio título y descripción únicos.
 * Social Media Crawlers (Open Graph): Si un usuario copia el enlace de una sección de tu app y lo pega en WhatsApp, Twitter/X o Facebook, estas plataformas leen las etiquetas <meta property="og:..." /> inyectadas por Helmet para armar la tarjeta de previsualización visual (con foto, título y descripción atractivos).
 * 
 * React 19: Ya incluye soporte nativo para metadatos. Ahora puedes escribir directamente etiquetas <title> y <meta> dentro de tus componentes comunes y corrientes, y React se encarga de moverlos al <head> automáticamente sin librerías externas.
 * Next.js / Remix: Tienen sus propios sistemas integrados (como el objeto export const metadata = {} o el componente <Header />), optimizados para que esta metadata se renderice desde el servidor antes de que la página llegue al usuario, lo cual es mil veces mejor para el SEO.
 * 
 * Geist es una familia de fuentes tipográficas hermosa (diseñada por Vercel para interfaces de usuario y código). Sin embargo, al ser una fuente web personalizada (web font), si no se implementa con cuidado, se convierte en una de las causas principales de Layout Shift (CLS), la métrica de inestabilidad visual que revisamos hace un momento.
 * El Problema: El efecto FOUT (Flash of Unstyled Text): Cuando un desarrollador integra la fuente Geist (ya sea Geist Sans o Geist Mono), el navegador no la tiene instalada de forma nativa en su sistema operativo. Por lo tanto, tiene que descargar el archivo de la fuente (.woff2) desde internet.
 * Mientras el archivo de Geist viaja por la red, el navegador no quiere dejar la pantalla en blanco, así que aplica una estrategia llamada FOUT (Destello de texto sin estilo):
 * Renderiza el texto de tu aplicación usando una fuente del sistema de respaldo (como Arial o Times New Roman).
 * Cuando el archivo de la fuente Geist termina de descargarse, el navegador "reemplaza" la fuente vieja por Geist.
 * 
 * ¿Dónde ocurre el Layout Shift?
 * La tipografía Arial y la tipografía Geist tienen proporciones, grosores, alturas de línea y espaciados de letras completamente diferentes. Geist Sans suele ser un poco más ancha y estilizada.
 * Cuando ocurre el reemplazo, un párrafo que con Arial ocupaba exactamente 2 líneas, con Geist de repente se expande y ocupa 3 líneas. Al ocupar más espacio, ese párrafo empuja de golpe hacia abajo todos los elementos de la interfaz (botones, imágenes, inputs). ¡Felicidades, acabas de generar un Layout Shift detectable por Lighthouse!
 * 
 * ¿Cómo solucionarlo?
 * La solución automática: next/font (Si usas Next.js): Si estás en el ecosistema moderno de Vercel (Next.js), ellos ya resolvieron su propia fuente de forma nativa. La librería @next/font (o next/font/local en versiones recientes) hace magia tras bambalinas
 * Next.js calcula matemáticamente el tamaño de la fuente de respaldo del sistema (Arial) y le aplica un ajuste de tamaño automático por CSS (usando propiedades como size-adjust). Así, el texto en Arial ocupa exactamente los mismos píxeles que ocupará Geist cuando llegue. Cuando ocurre el cambio, el diseño no se mueve ni un solo píxel.
 * 
 * La solución en CSS puro: font-display: swap + Font Override: Si estás usando la fuente Geist en un proyecto de React tradicional, Vite o Angular mediante archivos .css, debes asegurarte de dos cosas en tu regla @font-face.
 * Para mitigar el brinco del tamaño, puedes usar herramientas modernas de CSS para "ajustar" la fuente de respaldo (como Arial) para que imite las dimensiones de Geist mientras se descarga.
 * 
 * Preload de la variante crítica: Si sabes que la fuente Geist se va a usar en el título principal de tu página (el contenido Above-the-fold), dile al navegador que la descargue con la máxima prioridad usando un Preload en el <head> de tu HTML (puedes inyectarlo con React Helmet o de forma nativa en React 19.
 * Al precargarla, el archivo de la fuente suele llegar antes de que el navegador termine de pintar la pantalla por primera vez, eliminando el parpadeo y el Layout Shift por completo.
 * 
 * Antialiasing o Suavizado de bordes: s un concepto fundamental en el diseño de interfaces y desarrollo Frontend que describe la técnica utilizada para eliminar o suavizar los bordes ásperos y "pixelados" (el famoso efecto de escalera o jaggies) en los elementos gráficos, especialmente en las tipografías e iconos vectoriales.
 * Sin Antialiasing: El navegador activa o desactiva los píxeles de forma binaria. Si la curva de la letra pasa por más de la mitad del píxel, lo pinta de negro; si no, lo deja blanco. Esto produce bordes toscos, duros y que dan la impresión de que la aplicación es vieja o de baja calidad.
 * Con Antialiasing: El navegador calcula qué tanto porcentaje de la curva pasa por cada píxel y lo pinta con un tono gris difuminado proporcional. Engaña al ojo humano haciéndole creer que hay una línea curva perfecta y suave donde en realidad solo hay cuadrados.
 * El Antialiasing en CSS: La propiedad font-smoothing: 
 * body {
 * Para navegadores basados en WebKit (Chrome, Safari, Edge)
 * -webkit-font-smoothing: antialiased;
 * Para Firefox
 * -moz-osx-font-smoothing: grayscale;
 * }
 * 
 * Le dice al sistema operativo y al navegador: "Oye, en lugar de usar el suavizado subpíxel tradicional (que a veces añade un pequeño halo de color rojo o azul alrededor de las letras), usa un suavizado basado en escala de grises".
 * 
 * En Tailwind la clase antialiased se añade directamente en la etiqueta <html> o <body> de toda la aplicación
 */