export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">ScaleX</p>
          <p className="text-xs text-slate-500">Sandbox hackathon demo</p>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Local only
        </span>
      </div>
    </header>
  );
}
