import {
  Play,
  ShieldCheck,
} from "lucide-react";

import { NAV_ITEMS } from "./navigation";
import type { AppView } from "./navigation";

export function Sidebar({
  activeView,
  busy,
  displayCustomer,
  displayJob,
  onNavigate,
  onRun,
  profitLabel,
  revenueLabel,
}: {
  activeView: AppView;
  busy: boolean;
  displayCustomer: string;
  displayJob: string;
  onNavigate: (view: AppView) => void;
  onRun: () => void;
  profitLabel: string;
  revenueLabel: string;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[200px] flex-col border-r border-[#1e2128] bg-[#0a0b0e] p-3 text-white">
      <div className="flex items-center gap-2 border-b border-[#1e2128] pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#00d084]/40 bg-[#00d084]/10 text-[#00d084]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-semibold leading-5">ScaleX</p>
          <p className="text-[0.62rem] font-semibold uppercase tracking-wide text-[#00d084]">
            Control Plane
          </p>
        </div>
      </div>

      <nav className="mt-4 grid gap-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.view;
          return (
            <button
              className={`flex min-h-10 items-center gap-2 rounded-md border px-2.5 text-left text-sm font-semibold transition ${
                active
                  ? "border-[#00d084]/50 bg-[#00d084]/10 text-white"
                  : "border-transparent text-zinc-400 hover:border-[#1e2128] hover:bg-[#111318] hover:text-white"
              }`}
              key={item.view}
              onClick={() => onNavigate(item.view)}
              type="button"
            >
              <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-md border border-[#1e2128] bg-[#111318] p-3 shadow-xl shadow-black/30">
        <p className="text-[0.64rem] font-semibold uppercase tracking-wide text-zinc-500">
          Active Operation
        </p>
        <p className="mt-2 text-sm font-semibold leading-5 text-white">{displayCustomer}</p>
        <p className="mt-1 text-xs leading-4 text-zinc-400">{displayJob}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-[#1e2128] bg-[#0a0b0e] p-2">
            <p className="text-zinc-500">Revenue</p>
            <p className="mt-1 font-semibold text-white">{revenueLabel}</p>
          </div>
          <div className="rounded-md border border-[#00d084]/30 bg-[#00d084]/10 p-2">
            <p className="text-[#00d084]">Profit</p>
            <p className="mt-1 font-semibold text-white">{profitLabel}</p>
          </div>
        </div>
        <button
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#00d084] px-3 text-sm font-semibold text-[#07110d] transition hover:bg-[#28e39b] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          disabled={busy}
          onClick={onRun}
          type="button"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Start Governed Run
        </button>
      </div>
    </aside>
  );
}
