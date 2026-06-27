import { Activity, ShieldCheck } from "lucide-react";

import type { HealthResponse } from "../types";

interface HeaderProps {
  health: HealthResponse | null;
  loading: boolean;
}

export function Header({ health, loading }: HeaderProps) {
  const isHealthy = health?.status === "ok";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              ScaleX Governed ClientOps
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Governed execution for revenue-backed client operations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
            <Activity className="h-4 w-4 text-sky-700" aria-hidden="true" />
            {loading
              ? "Checking backend"
              : isHealthy
                ? "Backend online"
                : "Backend offline"}
          </span>
          <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-medium text-emerald-800">
            Judge demo mode
          </span>
        </div>
      </div>
    </header>
  );
}
