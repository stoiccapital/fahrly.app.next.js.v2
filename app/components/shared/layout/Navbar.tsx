export function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Fahrly
        </span>
        <span className="text-xs text-slate-400">v2</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>All systems normal</span>
        </span>
      </div>
    </header>
  );
}

