import {
  Play,
} from "lucide-react";

import { BrandLogo } from "../components/BrandLogo";
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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[200px] flex-col border-r border-[#232834] bg-[#050505] p-3 text-white">
      <div className="border-b border-[#232834] bg-transparent pb-4">
        <BrandLogo variant="sidebar" />
        <div className="mt-3 h-px w-full bg-[#fcba03]/70" aria-hidden="true" />
        <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-wide text-[#A1A1AA]">
          Governed ClientOps
        </p>
      </div>

      <nav className="mt-4 grid gap-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.view;
          return (
            <button
              className={`flex min-h-10 items-center gap-2 rounded-md border px-2.5 text-left text-sm font-semibold transition ${
                active
                  ? "border-[#fcba03]/45 bg-[#fcba03]/10 text-white shadow-[inset_3px_0_0_#fcba03]"
                  : "border-transparent text-zinc-400 hover:border-[#343A46] hover:bg-[#111318] hover:text-white"
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

      <div className="mt-auto rounded-md border border-[#232834] bg-[#111318] p-3 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.64rem] font-semibold uppercase tracking-wide text-zinc-500">
            Active Operation
          </p>
          <span className="active-operation-dot" aria-hidden="true" />
        </div>
        <p className="mt-2 text-sm font-semibold leading-5 text-white">{displayCustomer}</p>
        <p className="mt-1 text-xs leading-4 text-zinc-400">{displayJob}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-[#232834] bg-[#0D0E12] p-2">
            <p className="text-zinc-500">Revenue</p>
            <p className="mt-1 font-semibold text-white">{revenueLabel}</p>
          </div>
          <div className="rounded-md border border-[#10B981]/30 bg-[#10B981]/10 p-2">
            <p className="text-[#10B981]">Profit</p>
            <p className="mt-1 font-semibold text-white">{profitLabel}</p>
          </div>
        </div>
        <button
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[#fcba03] bg-[#fcba03] px-3 text-sm font-semibold text-[#050505] transition hover:bg-[#ffd257] disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-400"
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
