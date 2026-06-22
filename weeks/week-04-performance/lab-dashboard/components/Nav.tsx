import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-slate-200 bg-white px-6 py-3 flex items-center gap-3 shadow-sm">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-slate-800 hover:text-blue-600 transition-colors"
      >
        <span className="text-xl">⚕</span>
        <span>Clinical Perf Lab</span>
      </Link>
      <span className="text-slate-300">|</span>
      <span className="text-sm text-slate-500 font-medium">Semana 4: React Performance</span>
    </nav>
  );
}
