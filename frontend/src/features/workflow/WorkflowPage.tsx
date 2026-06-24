import {
  AlertTriangle,
  Play,
  RefreshCw,
  RotateCcw,
  Users,
} from "lucide-react";

import { formatOptionalCurrency, formatOptionalPercent } from "../../lib/demoSelectors";
import type { BusyAction, MoneySnapshot } from "../../lib/demoSelectors";
import type { DemoState, HealthResponse, WorkflowConfig } from "../../types";
import { NodeInspector } from "./NodeInspector";
import { WorkflowCanvas } from "./WorkflowCanvas";
import {
  buildWorkflowModel,
  WORKFLOW_NODE_ORDER,
  type WorkflowInspectorKey,
} from "./workflowModel";

export function WorkflowPage({
  activeWorkflow,
  auditRows,
  busyAction,
  displayCustomer,
  displayJob,
  error,
  health,
  isBusy,
  money,
  notice,
  onOpenCustomers,
  onRefresh,
  onReset,
  onRun,
  onSelectNode,
  playbackIndex,
  runStatus,
  selectedNodeKey,
  state,
}: {
  activeWorkflow: WorkflowConfig | null;
  auditRows: number;
  busyAction: BusyAction;
  displayCustomer: string;
  displayJob: string;
  error: string | null;
  health: HealthResponse | null;
  isBusy: boolean;
  money: MoneySnapshot;
  notice: string | null;
  onOpenCustomers: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onRun: () => void;
  onSelectNode: (key: WorkflowInspectorKey) => void;
  playbackIndex: number;
  runStatus: string;
  selectedNodeKey: WorkflowInspectorKey;
  state: DemoState | null;
}) {
  const model = buildWorkflowModel({
    auditRows,
    busy: busyAction === "run",
    health,
    money,
    progressIndex: Math.min(playbackIndex, WORKFLOW_NODE_ORDER.length - 1),
    state,
  });

  return (
    <section className="min-h-screen bg-zinc-950 text-white">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5">
          <WorkflowHeader
            activeWorkflow={activeWorkflow}
            busyAction={busyAction}
            displayCustomer={displayCustomer}
            displayJob={displayJob}
            isBusy={isBusy}
            money={money}
            onOpenCustomers={onOpenCustomers}
            onRefresh={onRefresh}
            onReset={onReset}
            onRun={onRun}
            runStatus={runStatus}
          />

          {notice ? (
            <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="flex items-start gap-3 rounded-lg border border-rose-300/40 bg-rose-400/10 p-4 text-sm text-rose-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <div>
                <p className="font-semibold">API request failed</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : null}

          {!activeWorkflow ? (
            <div className="flex flex-col gap-3 rounded-lg border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
              <span>Create or select a local workflow in Customers before starting a run.</span>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-amber-200/50 bg-white/10 px-3 font-semibold text-white transition hover:bg-white/15"
                onClick={onOpenCustomers}
                type="button"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                Open Customers
              </button>
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <WorkflowCanvas
              model={model}
              onSelect={onSelectNode}
              selectedKey={selectedNodeKey}
            />
            <NodeInspector
              activeWorkflow={activeWorkflow}
              health={health}
              model={model}
              money={money}
              onSelect={onSelectNode}
              runStatus={runStatus}
              selectedKey={selectedNodeKey}
              state={state}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowHeader({
  activeWorkflow,
  busyAction,
  displayCustomer,
  displayJob,
  isBusy,
  money,
  onOpenCustomers,
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
  money: MoneySnapshot;
  onOpenCustomers: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onRun: () => void;
  runStatus: string;
}) {
  return (
    <header className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-zinc-950/20">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase text-emerald-200">
            Enterprise function template
          </p>
          <h1 className="mt-2 break-words text-2xl font-semibold text-white lg:text-3xl">
            {displayCustomer}
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">{displayJob}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-emerald-100">
              {runStatus}
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-zinc-300">
              {activeWorkflow ? "Workflow selected" : "Needs workflow"}
            </span>
            <span className="rounded-md border border-violet-300/30 bg-violet-300/10 px-2 py-1 text-violet-100">
              Local policy now - NeMo Goal 8 planned
            </span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[30rem]">
          <SummaryMetric label="Revenue" value={formatOptionalCurrency(money.revenueCents)} />
          <SummaryMetric label="Approved spend" value={formatOptionalCurrency(money.approvedSpendCents)} />
          <SummaryMetric label="Gross profit" value={formatOptionalCurrency(money.grossProfitCents)} />
          <SummaryMetric label="Blocked spend" value={formatOptionalCurrency(money.blockedSpendCents)} />
          <SummaryMetric label="Margin" value={formatOptionalPercent(money.marginPercent)} />
          <SummaryMetric
            label="Run proof"
            value={money.actual ? "Loaded" : "Pending"}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
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
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-zinc-500"
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
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-zinc-500"
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
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          onClick={onOpenCustomers}
          type="button"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Customers
        </button>
      </div>
    </header>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-[4.25rem] rounded-md border border-white/10 bg-zinc-950/40 p-3">
      <p className="truncate text-[0.68rem] font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
