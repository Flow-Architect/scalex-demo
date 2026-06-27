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
    <header className="border-b border-zinc-200 bg-white px-4 py-4 text-zinc-950 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge icon={ShieldCheck} label="ScaleX Governed ClientOps" tone="emerald" />
            <StatusBadge icon={Activity} label={runStatus} tone="sky" />
          </div>
          <div className="mt-3 min-w-0">
            <p className="text-xs font-semibold uppercase text-zinc-500">Active client operation</p>
            <p className="mt-1 truncate text-base font-semibold text-zinc-950">
              {displayCustomer}
            </p>
            <p className="mt-1 truncate text-sm text-zinc-600">{displayJob}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
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
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
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
