import {
  Activity,
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
  busyAction,
  displayCustomer,
  displayJob,
  isBusy,
  onRefresh,
  onReset,
  onRun,
  runStatus,
}: {
  activeWorkflow: WorkflowConfig | null;
  busyAction: BusyAction;
  displayCustomer: string;
  displayJob: string;
  isBusy: boolean;
  onRefresh: () => void;
  onReset: () => void;
  onRun: () => void;
  runStatus: string;
}) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge icon={ShieldCheck} label="ScaleX Command Center" tone="emerald" />
            <StatusBadge icon={Activity} label={runStatus} tone="sky" />
          </div>
          <div className="mt-3 min-w-0">
            <p className="text-xs font-semibold uppercase text-zinc-400">Active workflow</p>
            <p className="mt-1 truncate text-base font-semibold text-white">
              {displayCustomer}
            </p>
            <p className="mt-1 truncate text-sm text-zinc-300">{displayJob}</p>
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
            Start Run
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-zinc-500"
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-zinc-500"
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
        </div>
      </div>
    </header>
  );
}
