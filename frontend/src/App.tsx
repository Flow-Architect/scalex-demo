import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import { API_BASE_URL, getDemoState, getHealth, resetDemo, runDemo } from "./api";
import { AgentWorkboard } from "./components/AgentWorkboard";
import { Header } from "./components/Header";
import { HermesPanel } from "./components/HermesPanel";
import { JobIntakeCard } from "./components/JobIntakeCard";
import { LedgerPanel } from "./components/LedgerPanel";
import { MetricsCards } from "./components/MetricsCards";
import { PolicyPanel } from "./components/PolicyPanel";
import { ProfitReport } from "./components/ProfitReport";
import { StripePanel } from "./components/StripePanel";
import { Timeline } from "./components/Timeline";
import { formatCurrency, formatPercent } from "./format";
import type { DemoState, HealthResponse } from "./types";

type BusyAction = "initial" | "refresh" | "run" | "reset" | null;

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [state, setState] = useState<DemoState | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>("initial");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const totals = state?.ledger.totals ?? null;
  const report = state?.report ?? null;
  const placeholder = state?.report_placeholder ?? null;
  const isBusy = busyAction !== null;

  const story = useMemo(
    () => [
      {
        label: "Job received",
        complete: Boolean(state?.job),
      },
      {
        label: "Hermes planned",
        complete: state?.planning_run?.status === "completed",
      },
      {
        label: "Mock payment confirmed",
        complete: hasEvent(state, "payment_confirmed"),
      },
      {
        label: "Safe spend approved",
        complete: (state?.policy_checks ?? []).some((check) => Boolean(check.approved)),
      },
      {
        label: "Unsafe spend blocked",
        complete: (state?.policy_checks ?? []).some((check) => !Boolean(check.approved)),
      },
      {
        label: "Agents completed",
        complete: (state?.agent_outputs ?? []).length >= 4,
      },
      {
        label: "Profit reported",
        complete: Boolean(report),
      },
    ],
    [report, state],
  );

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setBusyAction("initial");
    setError(null);
    try {
      const [healthResponse, stateResponse] = await Promise.all([
        getHealth(),
        getDemoState(),
      ]);
      setHealth(healthResponse);
      setState(stateResponse);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function refreshState() {
    setBusyAction("refresh");
    setError(null);
    try {
      const [healthResponse, stateResponse] = await Promise.all([
        getHealth(),
        getDemoState(),
      ]);
      setHealth(healthResponse);
      setState(stateResponse);
      setNotice("Dashboard refreshed from the local backend.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRunDemo() {
    setBusyAction("run");
    setError(null);
    setNotice(null);
    try {
      const response = await runDemo();
      setState(response.state);
      setHealth(await getHealth());
      setNotice("Demo lifecycle completed locally.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleResetDemo() {
    setBusyAction("reset");
    setError(null);
    setNotice(null);
    try {
      const response = await resetDemo();
      setState(response.state);
      setHealth(await getHealth());
      setNotice("Demo state reset.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header health={health} loading={busyAction === "initial"} />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                One-click local demo
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                Harbor Fleet Services fleet brake inspection workflow
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
                ScaleX is a profit-aware agent operations framework for service
                workflows. It lets agents confirm revenue, spend only inside
                policy, coordinate work, and produce an auditable profit report.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isBusy}
                onClick={handleRunDemo}
                type="button"
              >
                {busyAction === "run" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                Run Demo Job
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isBusy}
                onClick={handleResetDemo}
                type="button"
              >
                {busyAction === "reset" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                )}
                Reset Demo
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isBusy}
                onClick={refreshState}
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

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <StatusItem label="API base" value={API_BASE_URL} />
            <StatusItem
              label="Backend"
              value={health?.status === "ok" ? "Online" : "Not connected"}
            />
            <StatusItem
              label="Database"
              value={health?.database_exists ? "Initialized" : "No local DB yet"}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {story.map((item) => (
              <span
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  item.complete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
                key={item.label}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </div>

          {notice ? (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <div>
                <p className="font-semibold">API request failed</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">
            <MetricsCards totals={totals} report={report} placeholder={placeholder} />
            <div className="grid gap-6 lg:grid-cols-2">
              <JobIntakeCard job={state?.job ?? null} totals={totals} />
              <StripePanel events={state?.stripe_events ?? []} />
            </div>
          </div>

          <div className="space-y-6">
            <ProfitReport report={report} totals={totals} placeholder={placeholder} />
            <PolicyPanel
              summary={state?.policy.summary ?? null}
              checks={state?.policy_checks ?? []}
            />
          </div>
        </section>

        <HermesPanel
          hermes={state?.hermes ?? null}
          planningRun={state?.planning_run ?? null}
          calls={state?.orchestration_calls ?? []}
        />

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Timeline events={state?.timeline_events ?? state?.events ?? []} />
          <LedgerPanel
            entries={state?.ledger.entries ?? []}
            totals={state?.ledger.totals ?? null}
          />
        </section>

        <AgentWorkboard outputs={state?.agent_outputs ?? []} />

        {report ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Verified final state</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <StatusItem label="Revenue cents" value={String(report.revenue_cents)} />
              <StatusItem
                label="Approved spend cents"
                value={String(report.approved_spend_cents)}
              />
              <StatusItem
                label="Gross profit cents"
                value={String(report.gross_profit_cents)}
              />
              <StatusItem
                label="Actual margin"
                value={formatPercent(report.actual_margin_percent)}
              />
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Profit: {formatCurrency(report.gross_profit_cents)} after{" "}
              {formatCurrency(report.approved_spend_cents)} approved spend.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-t border-slate-200 pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function hasEvent(state: DemoState | null, type: string): boolean {
  return Boolean(state?.events.some((event) => event.type === type));
}

function errorMessage(caught: unknown): string {
  if (caught instanceof Error) {
    return caught.message;
  }

  return "Unexpected local API error.";
}
