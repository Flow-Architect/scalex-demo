import {
  Activity,
  LogOut,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import type { BusyAction } from "../lib/demoSelectors";
import type { WorkflowConfig } from "../types";
import { StatusBadge } from "../components/ui/StatusBadge";

export function TopCommandBar({
  activeWorkflow,
  authEnabled,
  busyAction,
  displayCustomer,
  displayJob,
  isBusy,
  onLogout,
  onRefresh,
  onReset,
  onRun,
  runStatus,
}: {
  activeWorkflow: WorkflowConfig | null;
  authEnabled: boolean;
  busyAction: BusyAction;
  displayCustomer: string;
  displayJob: string;
  isBusy: boolean;
  onLogout: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onRun: () => void;
  runStatus: string;
}) {
  return (
    <header className="scalex-grid-surface sticky top-0 z-30 border-b border-white/10 bg-zinc-950 px-4 py-3 text-white shadow-lg shadow-zinc-950/20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 rounded-md border border-white/10 bg-white/10 px-3 py-2 shadow-sm lg:max-w-[28rem]">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge icon={ShieldCheck} label="ScaleX Governed ClientOps" tone="emerald" />
            <StatusBadge icon={Activity} label={runStatus} tone="sky" />
          </div>
          <div className="mt-2 min-w-0">
            <p className="text-xs font-semibold uppercase text-zinc-400">Active client operation</p>
            <p className="mt-1 truncate text-base font-semibold text-white">
              {displayCustomer}
            </p>
            <p className="mt-1 truncate text-sm text-zinc-300">{displayJob}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/10 p-2 shadow-sm sm:flex-row sm:flex-wrap lg:justify-end">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-3.5 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
            disabled={isBusy || !activeWorkflow}
            onClick={onRun}
            type="button"
          >
            {busyAction === "run" ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            {busyAction === "run" ? "Running governed run..." : "Start Governed Run"}
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-3.5 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:text-zinc-500"
            disabled={isBusy}
            onClick={onReset}
            type="button"
          >
            {busyAction === "reset" ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            )}
            Reset Data
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-3.5 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:text-zinc-500"
            disabled={isBusy}
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw
              className={`h-4 w-4 ${busyAction === "refresh" ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh
          </button>
          {authEnabled ? (
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-3.5 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:text-zinc-500"
              disabled={isBusy}
              onClick={onLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
