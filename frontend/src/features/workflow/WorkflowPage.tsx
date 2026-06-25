import {
  AlertTriangle,
  BookOpenCheck,
  Building2,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { formatCurrency, formatDateTime, humanize } from "../../format";
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
    <section className="min-h-screen bg-stone-100 text-zinc-950">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[96rem] gap-6">
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
            <div className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <div>
                <p className="font-semibold">API request failed</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : null}

          {!activeWorkflow ? (
            <div className="flex flex-col gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <span>Create or select a local client operation before starting a run.</span>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-amber-300 bg-white px-3 font-semibold text-zinc-950 transition hover:bg-amber-100"
                onClick={onOpenCustomers}
                type="button"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                Open Client Operations
              </button>
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[19rem_minmax(0,1fr)_24rem]">
            <OperationBrief activeWorkflow={activeWorkflow} displayCustomer={displayCustomer} displayJob={displayJob} money={money} />
            <div className="min-w-0">
              <WorkflowCanvas
                model={model}
                onSelect={onSelectNode}
                selectedKey={selectedNodeKey}
              />
            </div>
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

          <StudioActivityTimeline state={state} />
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
    <header className="border-b border-zinc-200 pb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase text-emerald-700">
            ClientOps Function Studio
          </p>
          <h1 className="mt-2 break-words text-4xl font-semibold leading-tight text-zinc-950 lg:text-5xl">
            Function Studio
          </h1>
          <p className="mt-2 max-w-4xl text-base leading-7 text-zinc-600">
            Launch and inspect the {displayJob} function for {displayCustomer}.
          </p>
          <StudioFactStrip displayCustomer={displayCustomer} displayJob={displayJob} money={money} runStatus={runStatus} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
            disabled={isBusy || !activeWorkflow}
            onClick={onRun}
            type="button"
          >
            {busyAction === "run" ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            Start Run
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400" disabled={isBusy} onClick={onRefresh} type="button">
            <RefreshCw className={`h-4 w-4 ${busyAction === "refresh" ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400" disabled={isBusy} onClick={onReset} type="button">
            {busyAction === "reset" ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="h-4 w-4" aria-hidden="true" />}
            Reset Data
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50" onClick={onOpenCustomers} type="button">
            <Users className="h-4 w-4" aria-hidden="true" />
            Client operations
          </button>
        </div>
      </div>
    </header>
  );
}

function StudioFactStrip({
  displayCustomer,
  displayJob,
  money,
  runStatus,
}: {
  displayCustomer: string;
  displayJob: string;
  money: MoneySnapshot;
  runStatus: string;
}) {
  const facts = [
    { label: "Client", value: displayCustomer },
    { label: "Function", value: displayJob },
    { label: "Revenue", value: formatOptionalCurrency(money.revenueCents) },
    { label: "Protected profit", value: formatOptionalCurrency(money.grossProfitCents) },
    { label: "Guardrails", value: "Local policy active" },
    { label: "Run", value: runStatus },
  ];

  return (
    <dl className="mt-5 grid overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-zinc-200 sm:grid-cols-2 xl:grid-cols-6">
      {facts.map((fact) => (
        <div className="border-b border-zinc-200 px-4 py-3 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b-0" key={fact.label}>
          <dt className="text-xs font-semibold uppercase text-zinc-500">{fact.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-zinc-950">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function OperationBrief({
  activeWorkflow,
  displayCustomer,
  displayJob,
  money,
}: {
  activeWorkflow: WorkflowConfig | null;
  displayCustomer: string;
  displayJob: string;
  money: MoneySnapshot;
}) {
  return (
    <aside className="border-l-4 border-zinc-950 bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <p className="text-sm font-semibold uppercase text-zinc-500">Operation brief</p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-zinc-950">{displayJob}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{displayCustomer}</p>
      <div className="mt-5 space-y-3 text-sm">
        <BriefRow icon={Building2} label="Launch file" value={activeWorkflow ? "Selected" : "Needs selection"} />
        <BriefRow icon={ShieldCheck} label="Guardrails" value="Local policy active" />
        <BriefRow icon={BookOpenCheck} label="Evidence" value="SQLite ledger" />
        <BriefRow icon={TrendingUp} label="Margin" value={formatOptionalPercent(money.marginPercent)} />
      </div>
      <dl className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm">
        <BriefFact label="Revenue" value={formatOptionalCurrency(money.revenueCents)} />
        <BriefFact label="Setup spend" value={formatOptionalCurrency(money.approvedSpendCents)} />
        <BriefFact label="Blocked risk" value={formatOptionalCurrency(money.blockedSpendCents)} />
        <BriefFact label="Protected profit" value={formatOptionalCurrency(money.grossProfitCents)} />
      </dl>
    </aside>
  );
}

function BriefRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1.75rem_1fr] gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
        <p className="mt-0.5 font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

function BriefFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-semibold text-zinc-950">{value}</dd>
    </div>
  );
}

function StudioActivityTimeline({ state }: { state: DemoState | null }) {
  const events = state?.timeline_events ?? state?.events ?? [];

  return (
    <section className="border-t border-zinc-200 pt-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-zinc-500">Activity timeline</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">Client timeline</h2>
        </div>
        <p className="text-sm text-zinc-600">{events.length} lifecycle events</p>
      </div>
      {events.length === 0 ? (
        <div className="mt-4 border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-600">
          Activity appears after the operation starts.
        </div>
      ) : (
        <ol className="mt-4 grid gap-3 lg:grid-cols-3">
          {events.slice(-6).map((event) => (
            <li className="bg-white p-4 shadow-sm ring-1 ring-zinc-200" key={event.id}>
              <p className="text-xs font-semibold uppercase text-zinc-500">{humanize(event.status)}</p>
              <p className="mt-2 font-semibold text-zinc-950">{event.title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{event.detail}</p>
              <p className="mt-3 text-xs text-zinc-500">{formatDateTime(event.created_at)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
