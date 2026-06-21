import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Ban,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CircleDashed,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  Layers3,
  LockKeyhole,
  Play,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  WalletCards,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getDemoState, getHealth, resetDemo, runDemo } from "./api";
import { formatCurrency, formatDateTime, formatPercent, humanize } from "./format";
import type {
  AgentOutput,
  DemoEvent,
  DemoState,
  HealthResponse,
  HermesMetadata,
  LedgerEntry,
  LedgerTotals,
  OrchestrationCall,
  PlanningRun,
  PolicyCheck,
  PolicySummary,
  StripeEvent,
  StripeSummary,
} from "./types";

type BusyAction = "initial" | "refresh" | "run" | "reset" | null;
type StageStatus = "pending" | "current" | "complete" | "blocked" | "error";
type Tone = "emerald" | "sky" | "amber" | "rose" | "teal" | "violet" | "slate";

interface PipelineStage {
  name: string;
  status: StageStatus;
  timestamp: string | null;
  modeLabel: string;
  proof: string;
  icon: LucideIcon;
}

interface MoneySnapshot {
  actual: boolean;
  revenueCents: number | null;
  approvedSpendCents: number | null;
  blockedSpendCents: number | null;
  grossProfitCents: number | null;
  marginPercent: number | null;
  policyViolations: number | null;
  spendCapCents: number | null;
  marginFloorPercent: number | null;
}

const LOCKED_DEMO_BLOCKED_SPEND_CENTS = 75_000;

const PLAYBACK_STEPS = [
  "Intake",
  "Hermes plan",
  "Stripe test invoice",
  "Payment status",
  "Policy gate",
  "Spend decisions",
  "Agent outputs",
  "Profit report",
];

const stageStatusMeta: Record<
  StageStatus,
  { label: string; icon: LucideIcon; className: string; railClassName: string }
> = {
  pending: {
    label: "Pending",
    icon: CircleDashed,
    className: "border-zinc-200 bg-zinc-50 text-zinc-600",
    railClassName: "border-zinc-200 bg-white",
  },
  current: {
    label: "Current",
    icon: Clock3,
    className: "border-amber-300 bg-amber-50 text-amber-800",
    railClassName: "border-amber-300 bg-amber-50",
  },
  complete: {
    label: "Complete",
    icon: CheckCircle2,
    className: "border-emerald-300 bg-emerald-50 text-emerald-800",
    railClassName: "border-emerald-300 bg-emerald-50",
  },
  blocked: {
    label: "Guardrail block",
    icon: ShieldAlert,
    className: "border-rose-300 bg-rose-50 text-rose-800",
    railClassName: "border-rose-300 bg-rose-50",
  },
  error: {
    label: "Error",
    icon: AlertTriangle,
    className: "border-rose-300 bg-rose-50 text-rose-800",
    railClassName: "border-rose-300 bg-rose-50",
  },
};

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [state, setState] = useState<DemoState | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>("initial");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const isBusy = busyAction !== null;
  const pipeline = useMemo(() => buildPipeline(state), [state]);
  const money = useMemo(() => moneySnapshot(state), [state]);
  const auditRows = useMemo(() => auditRowCount(state), [state]);
  const runStatus = runStatusLabel(state, busyAction, error);

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (busyAction !== "run") {
      return undefined;
    }

    setPlaybackIndex(0);
    const timer = window.setInterval(() => {
      setPlaybackIndex((current) =>
        current >= PLAYBACK_STEPS.length - 1 ? current : current + 1,
      );
    }, 700);

    return () => window.clearInterval(timer);
  }, [busyAction]);

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
      setNotice("Command center refreshed from the local backend.");
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
      if (response.status === "completed") {
        setNotice("Demo lifecycle completed with API proof loaded.");
      } else {
        setError(String(response.decision?.error ?? `Run ended with status ${response.status}.`));
      }
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
    <main className="min-h-screen bg-stone-100 text-zinc-950">
      <section className="border-b border-zinc-900 bg-zinc-950 text-white">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-100">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  ScaleX Command Center
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-zinc-200">
                  <Activity className="h-4 w-4 text-sky-200" aria-hidden="true" />
                  {runStatus}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold uppercase text-emerald-200">
                Live AI Business Operator
              </p>
              <h1 className="mt-2 max-w-5xl text-3xl font-semibold text-white lg:text-5xl">
                ScaleX turns one client invoice into a guarded AI execution loop.
              </h1>
              <p className="mt-3 max-w-4xl text-base leading-7 text-zinc-300">
                Hermes plans. Stripe invoices. Policy blocks risky spend. SQLite audits
                every step. No spend executes unless margin and payment rules pass.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-zinc-500"
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-zinc-500"
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

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatusBadge
                icon={Target}
                label="Active client"
                value={state?.job?.client_name ?? "Harbor Fleet Services"}
                tone="sky"
              />
              <StatusBadge
                icon={BrainCircuit}
                label="Hermes"
                value={state?.hermes?.used_real_hermes ? "Real Hermes" : "Test or pending"}
                tone={state?.hermes?.used_real_hermes ? "emerald" : "amber"}
              />
              <StatusBadge
                icon={CreditCard}
                label="Stripe"
                value={stripeBadgeValue(state?.stripe ?? null)}
                tone={state?.stripe?.used_real_stripe ? "emerald" : "amber"}
              />
              <StatusBadge
                icon={Database}
                label="SQLite audit ledger"
                value={health?.database_exists ? "Active" : "Not initialized"}
                tone={health?.database_exists ? "teal" : "slate"}
              />
            </div>

            <MoneyFlow money={money} compact />
          </div>

          {busyAction === "run" ? (
            <ExecutionPlayback playbackIndex={playbackIndex} />
          ) : null}

          {notice ? (
            <div className="mt-4 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-300/40 bg-rose-400/10 p-4 text-sm text-rose-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <div>
                <p className="font-semibold">API request failed</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_420px]">
          <LivePipeline stages={pipeline} />

          <HermesCommandPanel
            hermes={state?.hermes ?? null}
            planningRun={state?.planning_run ?? null}
            calls={state?.orchestration_calls ?? []}
            busy={busyAction === "run"}
          />

          <ProofColumn
            money={money}
            stripe={state?.stripe ?? null}
            stripeEvents={state?.stripe_events ?? []}
            policySummary={state?.policy.summary ?? null}
            policyChecks={state?.policy_checks ?? []}
          />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_420px]">
          <AgentOutputsPanel outputs={state?.agent_outputs ?? []} />
          <JudgeProofPanel
            state={state}
            health={health}
            auditRows={auditRows}
          />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <AuditLedgerPanel
            entries={state?.ledger.entries ?? []}
            totals={state?.ledger.totals ?? null}
            databasePath={state?.database.path ?? health?.database_path ?? null}
            auditRows={auditRows}
          />
          <TimelinePanel events={state?.timeline_events ?? state?.events ?? []} />
        </section>
      </div>
    </main>
  );
}

function StatusBadge({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: Tone;
}) {
  return (
    <div className={`rounded-lg border p-3 ${softToneClass(tone)}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
        <p className="truncate text-xs font-semibold uppercase">{label}</p>
      </div>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function ExecutionPlayback({ playbackIndex }: { playbackIndex: number }) {
  return (
    <div className="mt-4 rounded-lg border border-white/15 bg-white/10 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">POST /api/demo/run in progress</p>
          <p className="mt-1 text-xs text-zinc-300">
            Frontend playback is active while the API returns the audited run state.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[680px] lg:grid-cols-8">
          {PLAYBACK_STEPS.map((step, index) => {
            const active = index === playbackIndex;
            const complete = index < playbackIndex;
            return (
              <div
                className={`rounded-md border px-2 py-2 text-xs ${
                  active
                    ? "border-emerald-300 bg-emerald-300/20 text-emerald-100"
                    : complete
                      ? "border-white/20 bg-white/10 text-zinc-200"
                      : "border-white/10 bg-zinc-950/20 text-zinc-400"
                }`}
                key={step}
              >
                <span
                  className={`mb-1 block h-1.5 w-full rounded-full ${
                    active ? "animate-pulse bg-emerald-300" : complete ? "bg-zinc-300" : "bg-zinc-700"
                  }`}
                />
                {step}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LivePipeline({ stages }: { stages: PipelineStage[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Live Run Pipeline</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Intake to profit report with proof pulled from API state.
          </p>
        </div>
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          {stages.filter((stage) => stage.status !== "pending").length}/{stages.length}
        </span>
      </div>

      <ol className="mt-4 space-y-3">
        {stages.map((stage, index) => {
          const StatusIcon = stageStatusMeta[stage.status].icon;
          const StageIcon = stage.icon;
          return (
            <li className="grid grid-cols-[2rem_1fr] gap-3" key={stage.name}>
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md border ${stageStatusMeta[stage.status].className}`}
                >
                  <StageIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                {index < stages.length - 1 ? (
                  <span className="mt-2 h-full min-h-9 w-px bg-zinc-200" />
                ) : null}
              </div>
              <article
                className={`rounded-lg border p-3 ${stageStatusMeta[stage.status].railClassName}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-950">{stage.name}</p>
                    <p className="mt-1 text-xs font-medium uppercase text-zinc-500">
                      {stage.modeLabel}
                    </p>
                  </div>
                  <span
                    className={`inline-flex flex-none items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${stageStatusMeta[stage.status].className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {stageStatusMeta[stage.status].label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-zinc-700">{stage.proof}</p>
                <p className="mt-2 text-xs text-zinc-500">{formatDateTime(stage.timestamp)}</p>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function HermesCommandPanel({
  hermes,
  planningRun,
  calls,
  busy,
}: {
  hermes: HermesMetadata | null;
  planningRun: PlanningRun | null;
  calls: OrchestrationCall[];
  busy: boolean;
}) {
  const plan = planningRun?.result_json ?? null;
  const failed = Boolean(planningRun?.error || hermes?.failure_reason || hermes?.error);
  const summary = plan?.executive_summary ?? planningRun?.summary ?? "Run the demo to load the Hermes operating plan.";
  const phases = operatingPlanPhases(plan);
  const tasks = taskRows(plan?.agent_task_list ?? []);
  const proposedTools = plan?.proposed_tool_sequence ?? [];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
                failed
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : busy
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-violet-300 bg-violet-50 text-violet-700"
              }`}
            >
              <BrainCircuit className={`h-6 w-6 ${busy ? "animate-pulse" : ""}`} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Active Execution / Agent Brain / Orchestration
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Hermes plans; ScaleX executes guarded payment, policy, ledger, and report steps.
              </p>
            </div>
          </div>
        </div>
        <span
          className={`inline-flex w-fit rounded-md border px-3 py-2 text-xs font-semibold uppercase ${
            failed
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : planningRun
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
          }`}
        >
          {failed ? "Hermes error" : planningRun ? humanize(planningRun.status) : "Pending"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Fact label="used_real_hermes" value={String(Boolean(hermes?.used_real_hermes))} />
        <Fact label="Provider" value={hermes?.provider ?? planningRun?.provider ?? "Pending"} />
        <Fact label="Model" value={hermes?.model ?? planningRun?.model ?? "Pending"} />
        <Fact
          label="Skill / toolsets"
          value={`${hermes?.skill_name ?? "Pending"} / ${hermes?.toolsets_used?.join(", ") || "none"}`}
        />
      </div>

      {failed ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <div>
            <p className="font-semibold">Hermes integration error</p>
            <p className="mt-1">{planningRun?.error ?? hermes?.failure_reason ?? hermes?.error}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase text-zinc-500">Operating plan summary</p>
          <p className="mt-2 text-sm leading-6 text-zinc-800">{summary}</p>
          {phases.length > 0 ? (
            <div className="mt-4 space-y-2">
              {phases.map((phase, index) => (
                <div className="flex gap-2 text-sm text-zinc-700" key={`${phase}-${index}`}>
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md bg-teal-100 text-xs font-semibold text-teal-800">
                    {index + 1}
                  </span>
                  <span>{phase}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-zinc-500">Agent task list</p>
          {tasks.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">Tasks appear after Hermes returns a plan.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {tasks.map((task) => (
                <div className="rounded-md border border-violet-200 bg-violet-50 p-3" key={task.agent}>
                  <p className="text-sm font-semibold text-violet-950">{task.agent}</p>
                  <p className="mt-1 text-xs leading-5 text-violet-900">{task.task}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-zinc-700" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-zinc-950">Proposed tool sequence</h3>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
            {proposedTools.length || 0} proposed
          </span>
        </div>
        {proposedTools.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
            Hermes proposed tools appear after the planning run.
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {proposedTools.map((toolName, index) => (
              <span
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700"
                key={`${toolName}-${index}`}
              >
                <span className="text-teal-700">#{index + 1}</span>
                {toolName}
              </span>
            ))}
          </div>
        )}
      </div>

      <ExecutionFeed calls={calls} />
    </section>
  );
}

function ExecutionFeed({ calls }: { calls: OrchestrationCall[] }) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-zinc-950">Live execution feed</h3>
        </div>
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          {calls.length} calls
        </span>
      </div>

      {calls.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Orchestration calls appear after the demo runs.
        </div>
      ) : (
        <ol className="mt-3 max-h-[34rem] space-y-2 overflow-auto pr-1">
          {calls.map((call) => {
            const failed = call.status === "failed";
            return (
              <li
                className={`rounded-lg border p-3 ${
                  failed ? "border-rose-200 bg-rose-50" : "border-zinc-200 bg-zinc-50"
                }`}
                key={call.id}
              >
                <div className="grid gap-3 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
                  <p className="font-mono text-sm font-semibold text-zinc-500">#{call.sequence}</p>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-zinc-950">
                      {call.tool_name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{formatDateTime(call.created_at)}</p>
                    {call.error ? (
                      <p className="mt-2 text-xs leading-5 text-rose-700">{call.error}</p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
                      failed
                        ? "border-rose-300 bg-white text-rose-800"
                        : "border-emerald-300 bg-white text-emerald-800"
                    }`}
                  >
                    {failed ? (
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {humanize(call.status)} · {call.duration_ms}ms
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function ProofColumn({
  money,
  stripe,
  stripeEvents,
  policySummary,
  policyChecks,
}: {
  money: MoneySnapshot;
  stripe: StripeSummary | null;
  stripeEvents: StripeEvent[];
  policySummary: PolicySummary | null;
  policyChecks: PolicyCheck[];
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">
              Money, Policy, and Profit Proof
            </h2>
          </div>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
            {money.actual ? "Actual run" : "Locked target"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          One invoice, controlled spend, blocked unsafe automation, audited profit.
        </p>
        <MoneyFlow money={money} />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ProofChip
            icon={TrendingUp}
            label="Protected margin"
            value={formatOptionalPercent(money.marginPercent)}
            tone="teal"
          />
          <ProofChip
            icon={Ban}
            label="Blocked unsafe spend"
            value={formatOptionalCurrency(money.blockedSpendCents)}
            tone="rose"
          />
          <ProofChip
            icon={WalletCards}
            label="Approved under cap"
            value={`${formatOptionalCurrency(money.approvedSpendCents)} / ${formatOptionalCurrency(money.spendCapCents)}`}
            tone="sky"
          />
          <ProofChip
            icon={ShieldCheck}
            label="Policy violations"
            value={money.policyViolations === null ? "Pending" : String(money.policyViolations)}
            tone="emerald"
          />
        </div>
      </section>

      <StripeProofPanel summary={stripe} events={stripeEvents} />
      <GuardrailDecisionsPanel summary={policySummary} checks={policyChecks} />
    </aside>
  );
}

function MoneyFlow({ money, compact = false }: { money: MoneySnapshot; compact?: boolean }) {
  const items = [
    {
      label: "Invoice",
      value: formatOptionalCurrency(money.revenueCents),
      tone: "emerald" as Tone,
    },
    {
      label: "Approved spend",
      value: formatOptionalCurrency(money.approvedSpendCents),
      tone: "sky" as Tone,
    },
    {
      label: "Blocked unsafe spend",
      value: formatOptionalCurrency(money.blockedSpendCents),
      tone: "rose" as Tone,
    },
    {
      label: "Gross profit",
      value: formatOptionalCurrency(money.grossProfitCents),
      tone: "teal" as Tone,
    },
    {
      label: "Margin",
      value: formatOptionalPercent(money.marginPercent),
      tone: "amber" as Tone,
    },
  ];

  return (
    <div className={compact ? "rounded-lg border border-white/15 bg-white/10 p-3" : "mt-4"}>
      {compact ? (
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-white">
            $1,200 invoice to guarded profit report
          </span>
          <span className="text-xs text-zinc-300">
            {money.actual ? "API proof loaded" : "Awaiting run proof"}
          </span>
        </div>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-5">
        {items.map((item, index) => (
          <div className="min-w-0" key={item.label}>
            <div
              className={`min-h-[5.25rem] rounded-lg border p-3 ${
                compact ? darkToneClass(item.tone) : softToneClass(item.tone)
              }`}
            >
              <p className="truncate text-xs font-semibold uppercase">{item.label}</p>
              <p className="mt-2 truncate text-xl font-semibold">{item.value}</p>
            </div>
            {index < items.length - 1 ? (
              <ArrowRight
                className={`mx-auto my-1 hidden h-4 w-4 sm:block ${
                  compact ? "text-zinc-400" : "text-zinc-400"
                }`}
                aria-hidden="true"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StripeProofPanel({
  summary,
  events,
}: {
  summary: StripeSummary | null;
  events: StripeEvent[];
}) {
  const failed = Boolean(summary?.error);
  const invoiceOpenUnpaid = summary?.invoice_status === "open" && summary.paid === false;
  const latestInvoice = latestWhere(events, (event) => Boolean(event.invoice_id));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Stripe Test Proof</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            {summary?.used_real_stripe
              ? "Real Stripe test-mode customer and finalized invoice records."
              : summary?.stripe_mode === "test_double"
                ? "Stripe test-double mode is labeled for tests or diagnostics."
                : "Stripe test-mode proof appears after the demo run."}
          </p>
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-xs font-semibold ${
            failed
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : summary?.used_real_stripe
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-amber-300 bg-amber-50 text-amber-800"
          }`}
        >
          {failed ? "Error" : humanize(summary?.stripe_mode ?? "pending")}
        </span>
      </div>

      {failed ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">Stripe integration error</p>
          <p className="mt-1">{summary?.error}</p>
        </div>
      ) : null}

      {invoiceOpenUnpaid ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Stripe test invoice finalized and open - not marked paid.
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Fact label="used_real_stripe" value={String(Boolean(summary?.used_real_stripe))} />
        <Fact
          label="livemode"
          value={summary?.livemode === null || summary?.livemode === undefined ? "Pending" : String(summary.livemode)}
        />
        <Fact label="customer ID" value={summary?.customer_id ?? "Pending"} />
        <Fact label="invoice ID" value={summary?.invoice_id ?? "Pending"} />
        <Fact label="invoice_status" value={summary?.invoice_status ?? "Pending"} />
        <Fact
          label="paid"
          value={summary?.paid === null || summary?.paid === undefined ? "Pending" : String(summary.paid)}
        />
      </div>

      {summary?.hosted_invoice_url ? (
        <a
          className="mt-4 flex items-center justify-between gap-3 rounded-lg border-2 border-sky-300 bg-sky-50 p-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
          href={summary.hosted_invoice_url}
          rel="noreferrer"
          target="_blank"
        >
          <span className="min-w-0">
            <span className="block text-xs uppercase text-sky-700">Hosted invoice URL</span>
            <span className="mt-1 block break-all">{summary.hosted_invoice_url}</span>
          </span>
          <ExternalLink className="h-5 w-5 flex-none" aria-hidden="true" />
        </a>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-600">
          Hosted invoice link appears after Stripe creates the invoice.
        </div>
      )}

      {summary?.diagnostic_reason ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">{summary.diagnostic_reason}</p>
      ) : null}
      {latestInvoice ? (
        <p className="mt-3 text-xs text-zinc-500">
          Latest Stripe proof recorded {formatDateTime(latestInvoice.created_at)}.
        </p>
      ) : null}
    </section>
  );
}

function GuardrailDecisionsPanel({
  summary,
  checks,
}: {
  summary: PolicySummary | null;
  checks: PolicyCheck[];
}) {
  const approvedChecks = checks.filter(isApproved);
  const blockedChecks = checks.filter((check) => !isApproved(check));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Guardrail Decisions</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Local Policy currently active until Goal 8 safety integration.
          </p>
        </div>
        <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
          Local Policy
        </span>
      </div>

      {summary ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ProofChip
            icon={Gauge}
            label="Spend cap"
            value={formatCurrency(summary.max_job_spend_usd * 100)}
            tone="sky"
          />
          <ProofChip
            icon={TrendingUp}
            label="Margin floor"
            value={formatPercent(summary.margin_floor_percent)}
            tone="teal"
          />
          <ProofChip
            icon={LockKeyhole}
            label="Payment before spend"
            value={summary.require_payment_before_spend ? "Required" : "Not required"}
            tone="amber"
          />
          <ProofChip
            icon={ShieldAlert}
            label="Vendor list"
            value={`${summary.approved_vendors.length} allowed / ${summary.blocked_vendors.length} blocked`}
            tone="emerald"
          />
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {checks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-600">
            Spend decisions appear after the demo run.
          </div>
        ) : (
          checks.map((check) => {
            const approved = isApproved(check);
            const Icon = approved ? CheckCircle2 : Ban;
            return (
              <article
                className={`rounded-lg border p-3 ${
                  approved ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                }`}
                key={check.id}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`mt-0.5 h-5 w-5 flex-none ${
                      approved ? "text-emerald-700" : "text-rose-700"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-950">{check.vendor}</p>
                        <p className="mt-1 text-xs font-semibold uppercase text-zinc-500">
                          {approved ? "Approved vendor spend" : "Blocked unsafe spend"}
                        </p>
                      </div>
                      <p className="flex-none text-sm font-semibold text-zinc-950">
                        {formatCurrency(check.requested_amount_cents)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-zinc-700">{check.reason}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
                      <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                        Margin after {formatPercent(check.margin_after_spend_percent)}
                      </span>
                      <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                        Action {check.required_action}
                      </span>
                      <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                        {formatDateTime(check.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {summary ? (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
          Approved vendors: {summary.approved_vendors.join(", ")}. Blocked vendor:
          {" "}
          {summary.blocked_vendors.join(", ")}.
        </div>
      ) : null}
      {approvedChecks.length > 0 || blockedChecks.length > 0 ? (
        <p className="mt-3 text-xs text-zinc-500">
          Decisions recorded: {approvedChecks.length} approved, {blockedChecks.length} blocked.
        </p>
      ) : null}
    </section>
  );
}

function AgentOutputsPanel({ outputs }: { outputs: AgentOutput[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-violet-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Agent Outputs</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Finance, Marketing, Research, and Ops deliverables for the Harbor Fleet workflow.
          </p>
        </div>
        <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">
          {outputs.length}/4 done
        </span>
      </div>

      {outputs.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Agent outputs appear after the demo run.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {outputs.map((output) => (
            <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4" key={output.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-950">{output.agent_name} Agent</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-600">{output.summary}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 flex-none text-emerald-700" aria-hidden="true" />
              </div>
              <MarkdownPreview markdown={output.output_markdown} />
              <p className="mt-3 text-xs text-zinc-500">
                Completed {formatDateTime(output.created_at)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function JudgeProofPanel({
  state,
  health,
  auditRows,
}: {
  state: DemoState | null;
  health: HealthResponse | null;
  auditRows: number;
}) {
  const hermes = state?.hermes ?? null;
  const stripe = state?.stripe ?? null;
  const policy = state?.policy.summary ?? null;
  const sqlitePath = state?.database.path ?? health?.database_path ?? "Pending";

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-950">Judge Proof</h2>
      </div>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        Required stack proof is surfaced directly from the running app state.
      </p>

      <div className="mt-4 space-y-3">
        <ProofRow
          icon={BrainCircuit}
          label="Hermes Agent"
          status={hermes?.used_real_hermes ? "Real" : "Test or pending"}
          detail={`${hermes?.provider ?? "Pending"} / ${hermes?.model ?? "Pending"} / ${hermes?.skill_name ?? "Pending"}`}
          tone={hermes?.used_real_hermes ? "emerald" : "amber"}
        />
        <ProofRow
          icon={CreditCard}
          label="Stripe"
          status={stripe?.used_real_stripe ? "Real test mode" : humanize(stripe?.stripe_mode ?? "pending")}
          detail={`livemode=${stripe?.livemode === null || stripe?.livemode === undefined ? "pending" : String(stripe.livemode)}`}
          tone={stripe?.used_real_stripe ? "emerald" : "amber"}
        />
        <ProofRow
          icon={Database}
          label="SQLite"
          status={health?.database_exists ? "Active ledger" : "Pending"}
          detail={`${auditRows} audit rows · ${sqlitePath}`}
          tone={health?.database_exists ? "teal" : "slate"}
        />
        <ProofRow
          icon={ShieldCheck}
          label="Policy engine"
          status="Local guardrails"
          detail={policy ? `${policy.name}: cap, payment, margin, vendor checks` : "Pending"}
          tone="emerald"
        />
        <ProofRow
          icon={ShieldAlert}
          label="Future"
          status="NemoClaw Goal 8"
          detail="Not claimed as wired yet; next goal is safety integration and presentation."
          tone="violet"
        />
      </div>
    </section>
  );
}

function AuditLedgerPanel({
  entries,
  totals,
  databasePath,
  auditRows,
}: {
  entries: LedgerEntry[];
  totals: LedgerTotals | null;
  databasePath: string | null;
  auditRows: number;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">SQLite Audit Ledger</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Revenue, approved spend, policy checks, Stripe records, and orchestration calls.
          </p>
        </div>
        <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
          {auditRows} rows
        </span>
      </div>
      <p className="mt-3 break-all rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
        {databasePath ?? "Ledger path pending"}
      </p>

      {entries.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Ledger entries appear after revenue and approved spend are recorded.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Label</th>
                <th className="px-3 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-3">
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700">
                      {humanize(entry.entry_type)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-zinc-950">{entry.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {entry.source} · {formatDateTime(entry.created_at)}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-zinc-950">
                    {formatCurrency(entry.amount_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totals ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <ProofChip
            icon={CircleDollarSign}
            label="Revenue"
            value={formatCurrency(totals.revenue_cents)}
            tone="emerald"
          />
          <ProofChip
            icon={WalletCards}
            label="Approved spend"
            value={formatCurrency(totals.approved_spend_cents)}
            tone="sky"
          />
          <ProofChip
            icon={Gauge}
            label="Remaining cap"
            value={formatCurrency(totals.remaining_spend_cap_cents)}
            tone="amber"
          />
        </div>
      ) : null}
    </section>
  );
}

function TimelinePanel({ events }: { events: DemoEvent[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-zinc-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Audit Timeline</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Human-readable events generated during the compressed lifecycle.
          </p>
        </div>
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          {events.length} events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Timeline events appear after the demo runs.
        </div>
      ) : (
        <ol className="mt-4 max-h-[32rem] space-y-3 overflow-auto pr-1">
          {events.map((event) => {
            const Icon = iconForEvent(event.type);
            return (
              <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-3" key={event.id}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-950">{event.title}</p>
                        <p className="mt-1 text-xs font-semibold uppercase text-zinc-500">
                          {humanize(event.type)}
                        </p>
                      </div>
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${eventStatusClass(event.status)}`}>
                        {humanize(event.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-zinc-700">{event.detail}</p>
                    <p className="mt-2 text-xs text-zinc-500">{formatDateTime(event.created_at)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function ProofChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: Tone;
}) {
  return (
    <div className={`rounded-lg border p-3 ${softToneClass(tone)}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
        <p className="truncate text-xs font-semibold uppercase">{label}</p>
      </div>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function ProofRow({
  icon: Icon,
  label,
  status,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  status: string;
  detail: string;
  tone: Tone;
}) {
  return (
    <article className={`rounded-lg border p-3 ${softToneClass(tone)}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-950">{label}</p>
          <p className="mt-1 text-sm font-semibold">{status}</p>
          <p className="mt-1 break-words text-xs leading-5">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-t border-zinc-200 pt-3">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-700">
      {markdown
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          if (line.startsWith("# ")) {
            return (
              <h3 className="text-sm font-semibold text-zinc-950" key={`${line}-${index}`}>
                {line.replace("# ", "")}
              </h3>
            );
          }

          if (line.startsWith("- ")) {
            return (
              <p className="pl-4 text-zinc-700" key={`${line}-${index}`}>
                <span className="mr-2 text-zinc-400">-</span>
                {line.replace("- ", "")}
              </p>
            );
          }

          return <p key={`${line}-${index}`}>{line}</p>;
        })}
    </div>
  );
}

function buildPipeline(state: DemoState | null): PipelineStage[] {
  const job = state?.job ?? null;
  const planningRun = state?.planning_run ?? null;
  const hermes = state?.hermes ?? null;
  const stripe = state?.stripe ?? null;
  const events = state?.events ?? [];
  const checks = state?.policy_checks ?? [];
  const stripeEvents = state?.stripe_events ?? [];
  const outputs = state?.agent_outputs ?? [];
  const report = state?.report ?? null;
  const blockedChecks = checks.filter((check) => !isApproved(check));
  const approvedChecks = checks.filter(isApproved);
  const latestPolicyCheck = checks[checks.length - 1] ?? null;
  const latestStripeInvoice = latestWhere(stripeEvents, (event) => Boolean(event.invoice_id));
  const latestPayment = latestWhere(stripeEvents, (event) => event.paid !== null);

  return [
    {
      name: "Intake",
      status: job ? "complete" : "pending",
      timestamp: job?.created_at ?? eventByType(events, "job_intake")?.created_at ?? null,
      modeLabel: "sample workflow",
      proof: job
        ? `${job.client_name}: ${job.job_name}. Invoice ${formatCurrency(job.invoice_amount_cents)}.`
        : "Harbor Fleet Services job appears after the demo starts.",
      icon: Target,
    },
    {
      name: "Hermes Plan",
      status: hermesFailed(hermes, planningRun)
        ? "error"
        : planningRun?.status === "completed"
          ? "complete"
          : planningRun
            ? "current"
            : "pending",
      timestamp: planningRun?.completed_at ?? planningRun?.created_at ?? eventByType(events, "hermes_planning")?.created_at ?? null,
      modeLabel: hermes?.used_real_hermes ? "real Hermes" : planningRun?.source ?? "pending",
      proof: planningRun
        ? `${hermes?.provider ?? planningRun.provider} / ${hermes?.model ?? planningRun.model}; skill ${hermes?.skill_name ?? "pending"}; toolsets ${hermes?.toolsets_used?.join(", ") || "none"}.`
        : "Hermes planning proof appears after POST /api/demo/run.",
      icon: BrainCircuit,
    },
    {
      name: "Stripe Test Invoice",
      status: stripe?.error ? "error" : stripe?.invoice_id ? "complete" : "pending",
      timestamp: latestStripeInvoice?.created_at ?? eventByType(events, "stripe_test")?.created_at ?? null,
      modeLabel: stripeModeLabel(stripe),
      proof: stripe?.invoice_id
        ? `${stripe.customer_id ?? "customer pending"} / ${stripe.invoice_id}; livemode=${String(stripe.livemode)}.`
        : stripe?.error ?? "Stripe test customer and finalized invoice appear after the run.",
      icon: CreditCard,
    },
    {
      name: "Payment Status",
      status: stripe?.error
        ? "error"
        : stripe?.paid === true
          ? "complete"
          : stripe?.paid === false
            ? "current"
            : "pending",
      timestamp: latestPayment?.created_at ?? eventByType(events, "payment_confirmed")?.created_at ?? null,
      modeLabel: stripe?.paid === false ? "open/unpaid" : stripe?.paid === true ? "paid" : "pending",
      proof:
        stripe?.paid === true
          ? "Stripe reports paid=true; revenue can be labeled Stripe-paid."
          : stripe?.paid === false
            ? "Stripe test invoice finalized and open - not marked paid."
            : "Payment status appears after Stripe invoice finalization.",
      icon: ReceiptText,
    },
    {
      name: "Policy Gate",
      status: state?.policy.summary ? "complete" : "pending",
      timestamp: eventByType(events, "policy_gate")?.created_at ?? null,
      modeLabel: "local policy",
      proof: state?.policy.summary
        ? `Payment-before-spend=${String(state.policy.summary.require_payment_before_spend)}, margin floor ${formatPercent(state.policy.summary.margin_floor_percent)}.`
        : "Policy configuration appears after state loads.",
      icon: ShieldCheck,
    },
    {
      name: "Spend Approval",
      status: blockedChecks.length > 0 ? "blocked" : approvedChecks.length > 0 ? "complete" : "pending",
      timestamp: latestPolicyCheck?.created_at ?? null,
      modeLabel: "guardrail decisions",
      proof:
        checks.length > 0
          ? `${approvedChecks.length} approved, ${blockedChecks.length} blocked. ${blockedChecks[0]?.vendor ?? "Unsafe spend"} blocked if unsafe.`
          : "Spend decisions appear after policy checks run.",
      icon: WalletCards,
    },
    {
      name: "Agent Outputs",
      status: outputs.length >= 4 ? "complete" : outputs.length > 0 ? "current" : "pending",
      timestamp: outputs[outputs.length - 1]?.created_at ?? eventByType(events, "agent_work")?.created_at ?? null,
      modeLabel: "deterministic agent outputs",
      proof: outputs.length > 0 ? `${outputs.length} agent deliverables recorded.` : "Finance, Marketing, Research, and Ops outputs appear after policy decisions.",
      icon: Layers3,
    },
    {
      name: "Profit Report",
      status: report ? "complete" : "pending",
      timestamp: report?.created_at ?? eventByType(events, "profit_report")?.created_at ?? null,
      modeLabel: "SQLite report",
      proof: report
        ? `${formatCurrency(report.gross_profit_cents)} gross profit, ${formatPercent(report.actual_margin_percent)} margin, ${report.policy_violations} policy violations.`
        : "Final profit report appears after agent work completes.",
      icon: FileText,
    },
  ];
}

function moneySnapshot(state: DemoState | null): MoneySnapshot {
  const report = state?.report ?? null;
  const totals = state?.ledger.totals ?? null;
  const placeholder = state?.report_placeholder ?? null;
  const job = state?.job ?? null;
  const hasLedgerRevenue = Boolean(totals && totals.revenue_cents > 0);
  const hasPolicyChecks = Boolean(state && state.policy_checks.length > 0);

  return {
    actual: Boolean(report || hasLedgerRevenue),
    revenueCents:
      report?.revenue_cents ??
      (hasLedgerRevenue ? totals?.revenue_cents ?? null : placeholder?.expected_revenue_cents ?? null),
    approvedSpendCents:
      report?.approved_spend_cents ??
      (hasPolicyChecks ? totals?.approved_spend_cents ?? null : placeholder?.expected_approved_spend_cents ?? null),
    blockedSpendCents:
      report?.blocked_spend_cents ??
      (hasPolicyChecks ? totals?.blocked_spend_cents ?? null : placeholder ? LOCKED_DEMO_BLOCKED_SPEND_CENTS : null),
    grossProfitCents:
      report?.gross_profit_cents ??
      (hasLedgerRevenue ? totals?.gross_profit_cents ?? null : placeholder?.expected_gross_profit_cents ?? null),
    marginPercent:
      report?.actual_margin_percent ??
      report?.margin_percent ??
      (hasLedgerRevenue ? totals?.actual_margin_percent ?? null : placeholder?.expected_margin_percent ?? null),
    policyViolations: report?.policy_violations ?? null,
    spendCapCents: job?.spend_cap_cents ?? null,
    marginFloorPercent: job?.margin_floor_percent ?? state?.policy.summary.margin_floor_percent ?? null,
  };
}

function auditRowCount(state: DemoState | null): number {
  if (!state) {
    return 0;
  }

  return (
    state.events.length +
    state.ledger.entries.length +
    state.policy_checks.length +
    state.stripe_events.length +
    state.agent_outputs.length +
    state.reports.length +
    state.planning_runs.length +
    state.orchestration_calls.length
  );
}

function runStatusLabel(
  state: DemoState | null,
  busyAction: BusyAction,
  error: string | null,
): string {
  if (busyAction === "initial") {
    return "Loading backend state";
  }
  if (busyAction === "run") {
    return "Running demo lifecycle";
  }
  if (busyAction === "reset") {
    return "Resetting demo state";
  }
  if (busyAction === "refresh") {
    return "Refreshing proof";
  }
  if (error) {
    return "Action needed";
  }
  if (state?.report) {
    return "Run complete";
  }
  if (state?.job) {
    return humanize(state.job.status);
  }
  return "Ready";
}

function stripeBadgeValue(stripe: StripeSummary | null): string {
  if (!stripe) {
    return "Pending";
  }
  if (stripe.error) {
    return "Integration error";
  }
  if (stripe.used_real_stripe) {
    return "Real Stripe Test";
  }
  if (stripe.stripe_mode === "test_double") {
    return "Test-double";
  }
  return humanize(stripe.stripe_mode);
}

function stripeModeLabel(stripe: StripeSummary | null): string {
  if (!stripe) {
    return "pending";
  }
  if (stripe.error) {
    return "integration error";
  }
  if (stripe.used_real_stripe) {
    return "real Stripe test";
  }
  if (stripe.stripe_mode === "test_double") {
    return "test-double";
  }
  return stripe.stripe_mode || "pending";
}

function hermesFailed(hermes: HermesMetadata | null, planningRun: PlanningRun | null): boolean {
  return Boolean(planningRun?.error || hermes?.failure_reason || hermes?.error);
}

function isApproved(check: PolicyCheck): boolean {
  return Boolean(check.approved);
}

function eventByType(events: DemoEvent[], type: string): DemoEvent | null {
  return latestWhere(events, (event) => event.type === type);
}

function latestWhere<T>(items: T[], predicate: (item: T) => boolean): T | null {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return items[index];
    }
  }
  return null;
}

function operatingPlanPhases(plan: PlanningRun["result_json"]): string[] {
  if (!plan || !isRecord(plan.operating_plan)) {
    return [];
  }
  const phases = plan.operating_plan.phases;
  if (Array.isArray(phases)) {
    return phases.map(displayValue).filter(Boolean).slice(0, 5);
  }

  const keyedPhases = Object.entries(plan.operating_plan)
    .filter(([key]) => key.startsWith("phase_"))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => displayValue(value))
    .filter(Boolean);
  if (keyedPhases.length > 0) {
    return keyedPhases.slice(0, 6);
  }

  const objective = plan.operating_plan.objective;
  return typeof objective === "string" ? [objective] : [];
}

function taskRows(tasks: unknown[]): Array<{ agent: string; task: string }> {
  return tasks.slice(0, 6).map((task, index) => {
    if (isRecord(task)) {
      const taskList = Array.isArray(task.tasks)
        ? task.tasks.map(displayValue).filter(Boolean).join(" ")
        : "";
      return {
        agent: displayValue(task.agent) || `Task ${index + 1}`,
        task:
          displayValue(task.task) ||
          taskList ||
          displayValue(task.summary) ||
          "Task detail pending",
      };
    }

    return {
      agent: `Task ${index + 1}`,
      task: displayValue(task) || "Task detail pending",
    };
  });
}

function displayValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function formatOptionalCurrency(cents: number | null | undefined): string {
  return cents === null || cents === undefined ? "Pending" : formatCurrency(cents);
}

function formatOptionalPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? "Pending" : formatPercent(value);
}

function softToneClass(tone: Tone): string {
  switch (tone) {
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "sky":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "teal":
      return "border-teal-200 bg-teal-50 text-teal-900";
    case "violet":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "slate":
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

function darkToneClass(tone: Tone): string {
  switch (tone) {
    case "emerald":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
    case "sky":
      return "border-sky-300/30 bg-sky-300/10 text-sky-100";
    case "amber":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100";
    case "rose":
      return "border-rose-300/30 bg-rose-300/10 text-rose-100";
    case "teal":
      return "border-teal-300/30 bg-teal-300/10 text-teal-100";
    case "violet":
      return "border-violet-300/30 bg-violet-300/10 text-violet-100";
    case "slate":
      return "border-zinc-300/20 bg-zinc-300/10 text-zinc-100";
    default:
      return "border-zinc-300/20 bg-zinc-300/10 text-zinc-100";
  }
}

function iconForEvent(type: string): LucideIcon {
  switch (type) {
    case "job_intake":
      return Target;
    case "hermes_planning":
      return BrainCircuit;
    case "margin_plan":
      return TrendingUp;
    case "policy_gate":
    case "policy_check":
      return ShieldCheck;
    case "stripe_test":
    case "stripe_test_double":
    case "stripe_integration_error":
    case "payment_confirmed":
      return CreditCard;
    case "agent_work":
      return Layers3;
    case "profit_report":
      return FileText;
    case "job_complete":
      return LockKeyhole;
    default:
      return CircleDashed;
  }
}

function eventStatusClass(status: string): string {
  if (status === "blocked" || status === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }
  if (status === "complete" || status === "paid" || status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (status === "guarded" || status === "planned" || status === "local_test_confirmed") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (status === "stripe_test" || status === "test_double") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function errorMessage(caught: unknown): string {
  if (caught instanceof Error) {
    return caught.message;
  }

  return "Unexpected local API error.";
}
