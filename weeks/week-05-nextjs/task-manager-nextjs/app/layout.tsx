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
