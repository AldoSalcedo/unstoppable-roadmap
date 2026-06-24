'use client';

import { useSearchParams } from "next/navigation"
import Link from "next/link";

export default function TaskNav() {
    const searchParams = useSearchParams();

    function buildHref(status?: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (status) {
            params.set('status', status)
        } else {
            params.delete('status')
        }
        return `/tasks?${params.toString()}`
    }

    return (
        <nav className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Filtrar por estado
            </p>
            {NAV_LINKS.map((link) => (
                <Link
                    key={link.label}
                    href={buildHref(link.href)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                    <span>{link.icon}</span>
                    {link.label}
                </Link>
            ))}
        </nav>
    )
}

// Links del sidebar con íconos de estado
const NAV_LINKS = [
  { href: undefined, label: 'Todas', icon: '📋' },
  { href: 'TODO', label: 'Pendientes', icon: '⏳' },
  { href: 'IN_PROGRESS', label: 'En progreso', icon: '🔄' },
  { href: 'DONE', label: 'Completadas', icon: '✅' },
  { href: 'BLOCKED', label: 'Bloqueadas', icon: '🚫' },
] as const;