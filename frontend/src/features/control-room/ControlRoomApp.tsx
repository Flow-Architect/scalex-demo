import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  Database,
  FileText,
  Play,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatCurrency, formatPercent } from "../../format";
import type { BusyAction, MoneySnapshot } from "../../lib/demoSelectors";
import { isApproved } from "../../lib/demoSelectors";
import type { AppView } from "../../layout/navigation";
import type { AuthStatus, DemoState, HealthResponse, PolicyCheck } from "../../types";

type Tone = "green" | "red" | "amber" | "blue" | "purple" | "cyan" | "muted" | "white";
type DrawerTab = "summary" | "operation" | "control";
type RunVisualState = "idle" | "running" | "complete";

interface ControlRoomAppProps {
  activeView: AppView;
  auth: AuthStatus | null;
  auditRows: number;
  busyAction: BusyAction;
  displayCustomer: string;
  displayJob: string;
  error: string | null;
  health: HealthResponse | null;
  money: MoneySnapshot;
  notice: string | null;
  onNavigate: (view: AppView) => void;
  onRefresh: () => void;
  onReset: () => void;
  onLogout: () => void;
  onRun: () => void;
  runCompletedMoment: boolean;
  runStatus: string;
  state: DemoState | null;
}

interface RailView {
  actor: string;
  badge: string;
  detail: string;
  evidence: string;
  id: string;
  name: string;
  proofTag: string;
  riskTag: string;
  status: string;
  subline: string;
  tone: Tone;
}

interface StatPill {
  label: string;
  value: string;
  tone?: Tone;
}

export function ControlRoomApp({
  activeView,
  auth,
  auditRows,
  busyAction,
  displayCustomer,
  displayJob,
  error,
  health,
  money,
  notice,
  onNavigate,
  onRefresh,
  onReset,
  onLogout,
  onRun,
  runCompletedMoment,
  runStatus,
  state,
}: ControlRoomAppProps) {
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("summary");
  const [expandedRailId, setExpandedRailId] = useState("blocked-spend");
  const [runVisualState, setRunVisualState] = useState<RunVisualState>(state?.report ? "complete" : "idle");
  const [activeRailId, setActiveRailId] = useState<string | null>(null);
  const [completedRailIds, setCompletedRailIds] = useState<string[]>([]);
  const [blockedFlash, setBlockedFlash] = useState(false);
  const [displayedBlockedRiskCents, setDisplayedBlockedRiskCents] = useState(0);
  const [evidenceRevealStep, setEvidenceRevealStep] = useState(0);

  const model = useMemo(() => buildControlRoomModel(state, money, auditRows, displayCustomer, displayJob), [
    auditRows,
    displayCustomer,
    displayJob,
    money,
    state,
  ]);

  useEffect(() => {
    if (busyAction !== "run") {
      return undefined;
    }

    setRunVisualState("running");
    setActiveRailId(null);
    setCompletedRailIds([]);
    setEvidenceRevealStep(0);
    setBlockedFlash(false);
    setDisplayedBlockedRiskCents(0);
    const blockedTarget = model.blockedSpendCents;
    const timers: number[] = [];
    let cursorMs = 120;
    model.rails.forEach((_, index) => {
      const rail = model.rails[index];
      const durationMs = rail.id === "blocked-spend" ? 920 : 580;
      timers.push(window.setTimeout(() => {
        setActiveRailId(rail.id);
      }, cursorMs));

      timers.push(window.setTimeout(() => {
        setCompletedRailIds((current) => (current.includes(rail.id) ? current : [...current, rail.id]));
        setEvidenceRevealStep(index + 1);
        if (rail.id === "blocked-spend") {
          setBlockedFlash(true);
          Array.from({ length: 16 }).forEach((__, stepIndex) => {
            timers.push(window.setTimeout(() => {
              setDisplayedBlockedRiskCents(Math.round(blockedTarget * ((stepIndex + 1) / 16)));
            }, stepIndex * 34));
          });
          timers.push(window.setTimeout(() => setBlockedFlash(false), 1100));
        }
        if (index === model.rails.length - 1) {
          setActiveRailId(null);
          setRunVisualState("complete");
        } else {
          setActiveRailId(null);
        }
      }, cursorMs + durationMs));
      cursorMs += durationMs + (rail.id === "blocked-spend" ? 220 : 110);
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [busyAction, model.blockedSpendCents, model.rails.length]);

  useEffect(() => {
    if (busyAction === "run" || runVisualState === "running") {
      return;
    }

    setDisplayedBlockedRiskCents(model.blockedSpendCents);
    setBlockedFlash(false);
  }, [busyAction, model.blockedSpendCents]);

  useEffect(() => {
    if (busyAction === "run") {
      return;
    }

    if (state?.report || runCompletedMoment) {
      setRunVisualState("complete");
      setActiveRailId(null);
      setCompletedRailIds(model.rails.map((rail) => rail.id));
      setEvidenceRevealStep(model.rails.length);
      return;
    }

    setRunVisualState("idle");
    setActiveRailId(null);
    setCompletedRailIds([]);
    setEvidenceRevealStep(0);
  }, [busyAction, model.rails.length, runCompletedMoment, runVisualState, state?.report]);

  const runActive = busyAction === "run" || runVisualState === "running";

  return (
    <div className="flex h-screen min-w-0 flex-col overflow-hidden bg-[#0a0b0e] text-[#f0f0f0]">
      <ControlTopbar
        activeView={activeView}
        error={error}
        auth={auth}
        model={model}
        notice={notice}
        onLogout={onLogout}
        onRefresh={onRefresh}
        onReset={onReset}
        onNavigate={onNavigate}
        onRun={onRun}
        runActive={runActive}
        runVisualState={runVisualState}
        runStatus={runStatus}
      />
      <div className="min-h-0 flex-1 overflow-hidden p-4">
        {activeView === "dashboard" ? (
          <DashboardView
            model={model}
            blockedFlash={blockedFlash}
            displayedBlockedRiskCents={displayedBlockedRiskCents}
            activeRailId={activeRailId}
            completedRailIds={completedRailIds}
            onNavigate={onNavigate}
            onRun={onRun}
            runActive={runActive}
            runVisualState={runVisualState}
          />
        ) : null}
        {activeView === "workflow" ? (
          <GovernedRunView
            drawerTab={drawerTab}
            expandedRailId={expandedRailId}
            model={model}
            blockedFlash={blockedFlash}
            activeRailId={activeRailId}
            completedRailIds={completedRailIds}
            evidenceRevealStep={evidenceRevealStep}
            setDrawerTab={setDrawerTab}
            setExpandedRailId={setExpandedRailId}
            runVisualState={runVisualState}
          />
        ) : null}
        {activeView === "audit" ? <EvidenceLedgerView model={model} runVisualState={runVisualState} /> : null}
        {activeView === "integrations" ? <ConnectionHubView model={model} /> : null}
        {activeView === "settings" ? <SettingsView auth={auth} health={health} model={model} state={state} /> : null}
      </div>
    </div>
  );
}

function ControlTopbar({
  activeView,
  auth,
  error,
  model,
  notice,
  onLogout,
  onNavigate,
  onRefresh,
  onReset,
  onRun,
  runActive,
  runVisualState,
  runStatus,
}: {
  activeView: AppView;
  auth: AuthStatus | null;
  error: string | null;
  model: ControlRoomModel;
  notice: string | null;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  onRefresh: () => void;
  onReset: () => void;
  onRun: () => void;
  runActive: boolean;
  runVisualState: RunVisualState;
  runStatus: string;
}) {
  const crumbByView: Record<string, string> = {
    audit: `Evidence Ledger / ${model.auditRows} evidence rows`,
    dashboard: "Governed execution for revenue-backed client operations",
    integrations: "Connection Hub / active systems · governed demo",
    settings: "Settings / Boundaries & Runtime",
    workflow: `Governed Run Studio / ${model.clientName} · ${model.operationName}`,
  };
  const subline =
    error ??
    notice ??
    (activeView === "dashboard"
      ? "Hermes plans. Stripe verifies finance state. NeMo Guardrails or local policy checks risk. ScaleX controls execution and records the audit trail."
      : runStatus);
  const statusLabel = runVisualState === "running"
    ? "Running"
    : runVisualState === "complete" || model.hasReport
      ? "Complete"
      : "Ready";
  const buttonLabel = runVisualState === "running"
    ? "Executing governed run..."
    : runVisualState === "complete" || model.hasReport
      ? "Run Again"
      : "Start Governed Run";

  return (
    <header className="flex h-14 flex-none items-center justify-between border-b border-[#1e2128] bg-[#0d0e12] px-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#f0f0f0]">{crumbByView[activeView] ?? crumbByView.dashboard}</p>
        <p className={`mt-0.5 truncate text-xs ${error ? "text-[#ef4444]" : "text-[#8a8f9e]"}`}>
          {subline}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge label="Judge Demo Mode" tone={model.primaryModeTone} />
        <StatusBadge label={statusLabel} tone={runVisualState === "running" ? "blue" : runVisualState === "complete" || model.hasReport ? "green" : "muted"} />
        <button className="control-btn" onClick={() => onNavigate("audit")} type="button">Review Ledger</button>
        <button className="control-btn-primary" disabled={runActive} onClick={onRun} type="button">
          {runActive ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {buttonLabel}
        </button>
        <button className="control-btn" onClick={onRefresh} type="button">Refresh</button>
        <button className="control-btn" onClick={onReset} type="button">Reset</button>
        {auth?.auth_enabled ? <button className="control-btn" onClick={onLogout} type="button">Logout</button> : null}
      </div>
    </header>
  );
}

function DashboardView({
  activeRailId,
  blockedFlash,
  completedRailIds,
  displayedBlockedRiskCents,
  model,
  onNavigate,
  onRun,
  runActive,
  runVisualState,
}: {
  activeRailId: string | null;
  blockedFlash: boolean;
  completedRailIds: string[];
  displayedBlockedRiskCents: number;
  model: ControlRoomModel;
  onNavigate: (view: AppView) => void;
  onRun: () => void;
  runActive: boolean;
  runVisualState: RunVisualState;
}) {
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-4">
      <OperationIdentityBar model={model} />
      <MetricStrip
        activeRailId={activeRailId}
        blockedFlash={blockedFlash}
        blockedRiskDisplayValue={formatCurrency(displayedBlockedRiskCents)}
        completedRailIds={completedRailIds}
        metrics={model.metrics}
        runActive={runActive}
        runVisualState={runVisualState}
      />
      <div className="grid min-h-0 grid-cols-2 gap-4">
        <Panel title="Governed Run" eyebrow="execution rails" action={<StatusBadge label={runVisualState === "running" ? "running" : runVisualState === "complete" ? "complete" : "ready"} tone={runVisualState === "running" ? "blue" : "green"} />}>
          <RailList activeRailId={activeRailId} blockedFlash={blockedFlash} compact completedRailIds={completedRailIds} model={model} />
        </Panel>
        <Panel title="Live Run Detail" eyebrow="active decision context" action={<button className="control-link" onClick={() => onNavigate("audit")} type="button">Open Ledger</button>}>
          <LiveRunDetail
            activeRailId={activeRailId}
            blockedFlash={blockedFlash}
            completedRailIds={completedRailIds}
            model={model}
            onRun={onRun}
            runActive={runActive}
            runVisualState={runVisualState}
          />
        </Panel>
      </div>
    </section>
  );
}

function OperationIdentityBar({ model }: { model: ControlRoomModel }) {
  return (
    <div className="operation-identity-bar">
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-[#00d084]">Active operation</p>
        <div className="mt-1 flex min-w-0 flex-wrap items-end gap-x-3 gap-y-1">
          <h1 className="truncate text-2xl font-semibold text-white">{model.clientName}</h1>
          <p className="truncate text-sm font-semibold text-[#8a8f9e]">{model.operationName}</p>
        </div>
      </div>
      <div className="operation-chain" aria-label="ScaleX control stack">
        {["Hermes plan", "Stripe finance", "NeMo policy", "ScaleX audit"].map((item, index) => (
          <div className="operation-chain-step" key={item}>
            <span>{item}</span>
            {index < 3 ? <span className="operation-chain-arrow" aria-hidden="true">→</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function RunSignals({ completedRailIds, runVisualState }: { completedRailIds: string[]; runVisualState: RunVisualState }) {
  const isComplete = (railId: string) => completedRailIds.includes(railId) || runVisualState === "complete";
  const signals = [
    { label: "Input loaded", ready: isComplete("input"), tone: "green" as Tone },
    { label: "Finance verified", ready: isComplete("stripe") || isComplete("revenue"), tone: "purple" as Tone },
    { label: "Risk contained", ready: isComplete("blocked-spend"), tone: "red" as Tone },
    { label: "Profit protected", ready: isComplete("profit"), tone: "green" as Tone },
  ];
  return (
    <div className="run-signals-grid">
      {signals.map((signal) => (
        <div className={`run-signal run-signal-${signal.tone} ${signal.ready ? "run-signal-ready" : ""}`} key={signal.label}>
          <span className="run-signal-dot" />
          <span>{signal.label}</span>
          <StatusBadge label={signal.ready ? "done" : "ready"} tone={signal.ready ? signal.tone : "muted"} />
        </div>
      ))}
    </div>
  );
}

function LiveRunDetail({
  activeRailId,
  blockedFlash,
  completedRailIds,
  model,
  onRun,
  runActive,
  runVisualState,
}: {
  activeRailId: string | null;
  blockedFlash: boolean;
  completedRailIds: string[];
  model: ControlRoomModel;
  onRun: () => void;
  runActive: boolean;
  runVisualState: RunVisualState;
}) {
  const focusId = activeRailId ?? (runVisualState === "complete" || completedRailIds.includes("profit") ? "profit" : "idle");
  const marginFloor = model.operationFacts.find((fact) => fact.label === "Floor")?.value ?? "50%";
  const invoiceId = model.state?.stripe.invoice_id ?? "in_demo_northstar";
  const livemode = String(model.state?.stripe.livemode ?? false);
  const paid = String(model.state?.stripe.paid ?? false);
  const hermesRuntime = model.state?.execution.hermes_runtime ?? "isolated_cli";
  const nemoRuntimeVerified = Boolean(model.state?.guardrails.used_real_nemo);
  const renderDetail = () => {
    if (focusId === "hermes" || focusId === "planning") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#8a8f9e]">Hermes Plan</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Implementation plan is being created</h2>
            </div>
            <StatusBadge label={focusId === "planning" ? "approved" : "created"} tone="blue" />
          </div>
          <pre className="proof-terminal mt-3">
{model.hermesTasks.slice(0, 5).map((task, index) => `$ ${index + 1}. ${task}`).join("\n")}
{"\n"}$ boundary: Hermes proposes. ScaleX governs.
          </pre>
        </section>
      );
    }

    if (focusId === "stripe" || focusId === "revenue") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#8a8f9e]">Stripe Finance State</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Revenue gate is financially grounded</h2>
            </div>
            <StatusBadge label="livemode=false" tone="green" />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <FactRow label="Mode" value={model.stripeLabel} tone="purple" />
            <FactRow label="Invoice" value={invoiceId} tone="white" />
            <FactRow label="livemode" value={livemode} tone="green" />
            <FactRow label="paid" value={paid} tone={paid === "true" ? "green" : "amber"} />
          </dl>
          <p className="mt-3 rounded-md border border-[#1e2128] bg-[#0a0b0e] p-3 text-xs leading-5 text-[#8a8f9e]">
            ScaleX keeps the run finance-aware without live-money movement in Judge Demo Mode.
          </p>
        </section>
      );
    }

    if (focusId === "policy" || focusId === "approved-spend") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#8a8f9e]">NeMo Guardrails / Local Policy</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{focusId === "approved-spend" ? "Allowed setup spend can proceed" : "Risk is checked before execution"}</h2>
            </div>
            <StatusBadge label={focusId === "approved-spend" ? "approved" : "checked"} tone={focusId === "approved-spend" ? "green" : "cyan"} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <FactRow label="Guardrail mode" value={model.guardrailLabel} tone="cyan" />
            <FactRow label="Vendor gate" value="allowlist enforced" tone="green" />
            <FactRow label="Margin floor" value={marginFloor} tone="amber" />
            <FactRow label="NemoClaw route" value={hermesRuntime} tone="white" />
          </dl>
          <p className="mt-3 rounded-md border border-[#1e2128] bg-[#0a0b0e] p-3 text-xs leading-5 text-[#8a8f9e]">
            Real NeMo Guardrails is shown only when runtime verification is present. Local policy remains active otherwise; NemoClaw/NemoHermes routing is explicit and fail-closed.
          </p>
        </section>
      );
    }

    if (focusId === "blocked-spend") {
      return (
        <section className={`live-detail-card live-detail-danger live-detail-enter ${blockedFlash ? "blocked-card-flash" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#f87171]">Risk stop</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Data broker enrichment</h2>
            </div>
            <StatusBadge label="BLOCKED" tone="red" />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <FactRow label="Requested" value={model.blockedRiskLabel} tone="red" />
            <FactRow label="Decision" value="Blocked by policy" tone="red" />
            <FactRow label="Spend row" value="not created" tone="green" />
            <FactRow label="Audit" value="record created" tone="green" />
          </dl>
          <p className="mt-4 rounded-md border border-[#ef4444]/35 bg-[#ef4444]/10 p-3 text-sm font-semibold leading-6 text-[#f87171]">
            {model.blockedRiskLabel} risk contained · unsafe vendor action blocked · margin protected.
          </p>
        </section>
      );
    }

    if (focusId === "evidence") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#8a8f9e]">ScaleX Audit Record</p>
              <h2 className="mt-1 text-xl font-semibold text-white">What happened is now ledgered</h2>
            </div>
            <StatusBadge label="recorded" tone="green" />
          </div>
          <div className="mt-3 grid gap-2">
            {[
              "Hermes plan, finance state, and guardrail decision are linked.",
              "Approved setup spend is recorded with policy context.",
              "Risk stop is stored without secrets or live-money credentials.",
            ].map((line) => (
              <p className="rounded-md border border-[#1e2128] bg-[#0a0b0e] px-3 py-2 text-sm text-[#f0f0f0]" key={line}>{line}</p>
            ))}
          </div>
        </section>
      );
    }

    if (focusId === "profit") {
      return (
        <section className="live-detail-card live-detail-enter live-detail-profit">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#00d084]">Profit Outcome</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{model.protectedProfitLabel}</h2>
            </div>
            <StatusBadge label="protected" tone="green" />
          </div>
          <dl className="live-profit-facts mt-3 grid gap-2">
            {model.metrics.map((metric) => (
              <FactRow key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
            ))}
          </dl>
          <p className="mt-3 rounded-md border border-[#00d084]/30 bg-[#00d084]/10 p-3 text-sm font-semibold text-[#00d084]">
            Protected margin: {model.marginLabel}. Formula: revenue - approved spend - labor cost.
          </p>
        </section>
      );
    }

    return (
      <section className="live-detail-card live-detail-enter">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase text-[#8a8f9e]">Ready to govern</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Start the Northstar operation</h2>
          </div>
          <StatusBadge label={nemoRuntimeVerified ? "NeMo verified" : "local policy active"} tone={nemoRuntimeVerified ? "green" : "cyan"} />
        </div>
        <div className="mt-3 grid gap-2">
          {[
            "Hermes will create the implementation plan.",
            "Stripe will verify finance state with livemode=false.",
            "NeMo Guardrails or local policy will check risky actions.",
            "ScaleX will record the audit trail and report protected margin.",
          ].map((line) => (
            <p className="rounded-md border border-[#1e2128] bg-[#0a0b0e] px-3 py-2 text-sm text-[#f0f0f0]" key={line}>{line}</p>
          ))}
        </div>
        <button className="control-btn-primary mt-4 w-full" disabled={runActive} onClick={onRun} type="button">
          {runActive ? "Executing governed run..." : runVisualState === "complete" ? "Run Again" : "Start Governed Run"}
        </button>
      </section>
    );
  };

  return (
    <div className="live-run-shell">
      <ControlStackChain activeRailId={activeRailId} completedRailIds={completedRailIds} model={model} />
      <RunSignals completedRailIds={completedRailIds} runVisualState={runVisualState} />
      <div className="mt-3" key={focusId}>
        {renderDetail()}
      </div>
    </div>
  );
}

function GovernedRunView({
  activeRailId,
  blockedFlash,
  completedRailIds,
  drawerTab,
  evidenceRevealStep,
  expandedRailId,
  model,
  runVisualState,
  setDrawerTab,
  setExpandedRailId,
}: {
  activeRailId: string | null;
  blockedFlash: boolean;
  completedRailIds: string[];
  drawerTab: DrawerTab;
  evidenceRevealStep: number;
  expandedRailId: string;
  model: ControlRoomModel;
  runVisualState: RunVisualState;
  setDrawerTab: (tab: DrawerTab) => void;
  setExpandedRailId: (id: string) => void;
}) {
  return (
    <section className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4">
      <div className="grid min-h-0 grid-cols-[220px_minmax(0,1fr)_260px] gap-4">
        <Panel title="Operation Details" eyebrow="Northstar run">
          <dl className="grid gap-2 text-sm">
            {model.operationFacts.map((fact) => (
              <FactRow key={fact.label} label={fact.label} value={fact.value} tone={fact.tone} />
            ))}
          </dl>
        </Panel>
        <Panel title="Rail Map" eyebrow="click rail for detail">
          <div className="grid gap-2">
            {model.rails.map((rail, index) => {
              const expanded = expandedRailId === rail.id;
              const active = activeRailId === rail.id;
              const complete = completedRailIds.includes(rail.id);
              const result = railResult(rail, active, complete);
              return (
                <button
                  className={`rail-card text-left ${active ? "rail-running" : ""} ${complete ? "rail-complete" : ""} ${rail.id === "blocked-spend" && (active || complete) ? "rail-card-blocked" : ""} ${rail.id === "blocked-spend" && blockedFlash ? "blocked-card-flash danger-pulse-on-visible" : ""}`}
                  key={rail.id}
                  onClick={() => setExpandedRailId(expanded ? "" : rail.id)}
                  type="button"
                >
                  <div className="flex min-h-12 items-center gap-3">
                    <span className="rail-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#f0f0f0]">{rail.name}</p>
                      <p className="truncate text-xs text-[#8a8f9e]">{rail.subline}</p>
                    </div>
                    <StatusBadge label={result.label} tone={result.tone} />
                  </div>
                  {expanded ? (
                    <div className="mt-2 rounded-md border border-[#1e2128] bg-[#0a0b0e] p-3 text-xs leading-5 text-[#8a8f9e]">
                      <p className="font-semibold text-[#f0f0f0]">{rail.evidence}</p>
                      <p className="mt-1">{rail.detail}</p>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel title="Evidence Drawer" eyebrow="run audit">
          <SegmentedTabs
            active={drawerTab}
            items={[
              { id: "summary", label: "Run Summary" },
              { id: "operation", label: "Active Operation" },
              { id: "control", label: "Control Path" },
            ]}
            onChange={(id) => setDrawerTab(id as DrawerTab)}
          />
          <div className="mt-3">
            {drawerTab === "summary" ? (
              <dl className="grid gap-2">
                {model.metrics.slice(0, 5).map((metric) => (
                  <FactRow key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
                ))}
              </dl>
            ) : null}
            {drawerTab === "operation" ? (
              <div className="space-y-3 text-sm leading-6 text-[#8a8f9e]">
                <p className="font-semibold text-[#f0f0f0]">{model.clientName}</p>
                <p>{model.operationName}</p>
                <p>Synthetic B2B implementation only. No patient data, no PHI, no live money.</p>
              </div>
            ) : null}
            {drawerTab === "control" ? (
              <ProofArtifactGrid activeRailId={activeRailId} compact completedRailIds={completedRailIds} evidenceRevealStep={evidenceRevealStep} model={model} runVisualState={runVisualState} />
            ) : null}
          </div>
        </Panel>
      </div>
      <RailActivityTimeline activeRailId={activeRailId} completedRailIds={completedRailIds} model={model} runVisualState={runVisualState} />
    </section>
  );
}

function EvidenceLedgerView({ model, runVisualState }: { model: ControlRoomModel; runVisualState: RunVisualState }) {
  return (
    <section className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_240px] gap-4">
      <Panel
        title="Enterprise Audit Ledger"
        eyebrow="actor · action · evidence · safety"
        action={<div className="flex flex-wrap gap-2">{model.auditPills.map((pill) => <StatusBadge key={pill.label} label={`${pill.label}: ${pill.value}`} tone={pill.tone ?? "muted"} />)}</div>}
      >
        <div className="h-[calc(100vh-174px)] overflow-auto rounded-md border border-[#1e2128]">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 bg-[#0d0e12] text-left text-xs uppercase text-[#8a8f9e]">
              <tr>
                {["Order", "Actor", "Action", "Evidence Type", "Safety Note", "Status"].map((header) => (
                  <th className="border-b border-[#1e2128] px-3 py-3 font-semibold" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {model.auditRowsData.map((row, index) => (
                <tr
                  className={`ledger-row-enter bg-[#111318] ${row.order === "005" ? "ledger-row-blocked border-l-4 border-[#ef4444]" : ""} ${row.order === "010" ? "ledger-row-profit" : ""}`}
                  key={row.order}
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <td className={`border-b border-[#1e2128] px-3 py-3 font-mono text-xs ${row.order === "005" ? "border-l-4 border-l-[#ef4444]" : ""}`}>{row.order}</td>
                  <td className="border-b border-[#1e2128] px-3 py-3 font-semibold text-[#f0f0f0]">{row.actor}</td>
                  <td className="border-b border-[#1e2128] px-3 py-3 text-[#8a8f9e]">{row.action}</td>
                  <td className="border-b border-[#1e2128] px-3 py-3 font-mono text-xs text-[#8a8f9e]">{row.evidenceType}</td>
                  <td className="border-b border-[#1e2128] px-3 py-3 text-[#8a8f9e]">{row.safetyNote}</td>
                  <td className="border-b border-[#1e2128] px-3 py-3"><StatusBadge label={row.status} tone={row.tone} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Audit Safety" eyebrow="demo boundaries">
        <div className="grid gap-3">
          {model.safetyProof.map((proof) => (
            <div className="flex items-start gap-2 text-sm text-[#f0f0f0]" key={proof}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#00d084]" />
              <span>{proof}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-[#8a8f9e]">Control Artifacts</p>
          <ProofArtifactGrid
            activeRailId={null}
            compact
            completedRailIds={runVisualState === "complete" ? model.rails.map((rail) => rail.id) : []}
            evidenceRevealStep={runVisualState === "complete" ? model.rails.length : 0}
            model={model}
            runVisualState={runVisualState}
          />
        </div>
        <div className="mt-5 rounded-md border border-[#00d084]/30 bg-[#00d084]/10 p-3">
          <p className="text-xs font-semibold uppercase text-[#00d084]">Profit Outcome</p>
          <p className="mt-2 text-3xl font-semibold text-white">{model.protectedProfitLabel}</p>
          <p className="mt-1 text-sm text-[#8a8f9e]">{model.marginLabel} protected margin</p>
        </div>
      </Panel>
    </section>
  );
}

function ConnectionHubView({ model }: { model: ControlRoomModel }) {
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-4">
      <div className="flex items-center justify-between rounded-md border border-[#1e2128] bg-[#111318] p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-[#00d084]">Connection Hub</p>
          <h1 className="text-2xl font-semibold text-white">Allowed Systems & Truth Boundaries</h1>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {["Governed demo mode", model.hermesLabel, model.stripeLabel, model.guardrailLabel].map((label) => (
            <StatusBadge key={label} label={label} tone="green" />
          ))}
        </div>
      </div>
      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_320px] gap-4">
        <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-4">
        {model.connectionCards.map((card) => (
          <ConnectorCard key={card.title} card={card} />
        ))}
        </div>
        <Panel title="Prototype Modes" eyebrow="truthful execution">
          <div className="grid gap-3">
            {model.modeCards.map((mode) => (
              <article className={`mode-card mode-card-${mode.tone}`} key={mode.title}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{mode.title}</p>
                  <StatusBadge label={mode.status} tone={mode.tone} />
                </div>
                <p className="mt-2 text-xs leading-5 text-[#8a8f9e]">{mode.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-[#1e2128] bg-[#0a0b0e] p-3">
            <p className="text-xs font-semibold uppercase text-[#00d084]">NemoClaw / NeMo Guardrails</p>
            <p className="mt-2 text-xs leading-5 text-[#8a8f9e]">
              NeMo Guardrails is shown only when runtime verification passes. NemoClaw /
              NemoHermes planning is optional routing and remains explicit in runtime status.
            </p>
          </div>
        </Panel>
      </div>
      <div className="rounded-md border border-[#1e2128] bg-[#111318] p-4">
        <p className="text-xs font-semibold uppercase text-[#8a8f9e]">Full Proof Capable</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Isolated Hermes planning", "Stripe test-mode finance", "Real NeMo only when verified", "NemoClaw Docker not invoked in demo"].map((item) => (
            <StatusBadge label={item} tone="blue" key={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SettingsView({
  auth,
  health,
  model,
  state,
}: {
  auth: AuthStatus | null;
  health: HealthResponse | null;
  model: ControlRoomModel;
  state: DemoState | null;
}) {
  const rows = [
    ["Prototype auth", auth?.auth_enabled ? auth.authenticated ? `Signed in as ${auth.username ?? "operator"}` : "Enabled" : "Disabled for local judge demo", "Local prototype auth only; not production identity."],
    ["Execution mode", state?.execution.label ?? "Judge Demo Mode", state?.execution.truthfulness_note ?? "Demo mode and Full Proof Mode stay explicitly labeled."],
    ["Judge Demo Mode", model.modeCards[0]?.status ?? "Judge Demo active", model.modeCards[0]?.detail ?? "Deterministic local path."],
    ["Stripe Sandbox Prototype", model.modeCards[1]?.status ?? "Prototype ready", model.modeCards[1]?.detail ?? "Real test-mode only when configured safely."],
    ["Verified Live Mode", model.modeCards[2]?.status ?? "Verified Live locked", model.modeCards[2]?.detail ?? "Future live-money path, not enabled."],
    ["Runtime", `${health?.mode ?? state?.mode ?? "local"} / ${state?.execution.hermes_runtime ?? "isolated_cli"}`, "Local API and SQLite-backed product workspace."],
    ["Active operation", `${model.clientName} / ${model.operationName}`, "Synthetic Northstar B2B implementation operation only."],
    ["Data", "Synthetic sample", "No patient data, no PHI, no healthcare compliance or HIPAA claim."],
    ["Money movement", model.stripeLabel, "No live-money support; future live execution requires Verified Live Mode."],
    ["Guardrails", `${state?.guardrails.mode ?? "local_policy"} / used_real_nemo=${String(Boolean(state?.guardrails.used_real_nemo))}`, state?.guardrails.truthfulness_note ?? "Local policy active now; real NeMo requires runtime proof."],
    ["Records", `${state?.runs.length ?? 0} runs / ${model.auditRows} evidence rows`, "SQLite evidence is local; no production customer workflow claim."],
  ];

  return (
    <section className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_320px] gap-4">
      <Panel title="Boundaries & Runtime" eyebrow="confidence view">
        <div className="overflow-hidden rounded-md border border-[#1e2128]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#0d0e12] text-left text-xs uppercase text-[#8a8f9e]">
              <tr>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Current value</th>
                <th className="px-4 py-3">Boundary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([area, value, boundary]) => (
                <tr className="border-t border-[#1e2128] bg-[#111318]" key={area}>
                  <td className="px-4 py-4 font-semibold text-white">{area}</td>
                  <td className="px-4 py-4 text-[#f0f0f0]">{value}</td>
                  <td className="px-4 py-4 text-[#8a8f9e]">{boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Supporting Modules" eyebrow="kept behind story">
        <div className="grid gap-3">
          {model.supportingModules.map((module) => (
            <article className="rounded-md border border-[#1e2128] bg-[#0a0b0e] p-3" key={module.title}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">{module.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[#8a8f9e]">{module.description}</p>
                </div>
                <StatusBadge label={module.status} tone={module.tone} />
              </div>
              <p className="mt-3 rounded-md border border-[#1e2128] bg-[#111318] px-3 py-2 text-xs font-semibold text-[#f0f0f0]">
                {module.value}
              </p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function MetricStrip({
  activeRailId,
  blockedFlash,
  blockedRiskDisplayValue,
  completedRailIds,
  metrics,
  runActive,
  runVisualState,
}: {
  activeRailId: string | null;
  blockedFlash: boolean;
  blockedRiskDisplayValue: string;
  completedRailIds: string[];
  metrics: StatPill[];
  runActive: boolean;
  runVisualState: RunVisualState;
}) {
  const approvedActive = activeRailId === "approved-spend" || completedRailIds.includes("approved-spend");
  const blockedActive = activeRailId === "blocked-spend" || completedRailIds.includes("blocked-spend") || blockedFlash;
  const profitActive = activeRailId === "profit" || completedRailIds.includes("profit") || runVisualState === "complete";

  return (
    <div className="grid grid-cols-5 gap-3">
      {metrics.map((metric) => {
        const isApprovedMetric = metric.label === "Approved spend";
        const isRiskMetric = metric.label === "Risk contained";
        const isProfitMetric = metric.label === "Protected profit";
        const displayLabel = isRiskMetric && runActive && !blockedActive ? "Risk pending" : metric.label;
        return (
          <article
            className={`metric-card ${isApprovedMetric && approvedActive ? "metric-glow-green" : ""} ${isRiskMetric && blockedActive ? "metric-flash-red" : ""} ${isProfitMetric ? "metric-hero" : ""} ${isProfitMetric && profitActive ? "metric-glow-green" : ""}`}
            key={metric.label}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9e]">{displayLabel}</p>
            <p className={`mt-2 font-semibold tabular-nums ${metricClass(metric.tone)} ${isProfitMetric ? "text-4xl" : isRiskMetric ? "text-3xl" : "text-2xl"}`}>
              {isRiskMetric && runActive ? blockedRiskDisplayValue : metric.value}
            </p>
            {metric.label === "Revenue secured" ? <p className="mt-2 text-xs font-semibold text-[#8a8f9e]">client revenue context loaded</p> : null}
            {isApprovedMetric ? <p className="mt-2 text-xs font-semibold text-[#00d084]">allowed setup spend</p> : null}
            {isRiskMetric ? <p className="mt-2 text-xs font-semibold text-[#f87171]">unsafe vendor exposure contained</p> : null}
            {metric.label === "Labor cost" ? <p className="mt-2 text-xs font-semibold text-[#8a8f9e]">delivery cost included</p> : null}
            {isProfitMetric ? <p className="mt-2 text-xs font-semibold text-[#00d084]">revenue minus approved spend and labor</p> : null}
          </article>
        );
      })}
    </div>
  );
}

function RailList({
  activeRailId,
  blockedFlash = false,
  compact,
  completedRailIds,
  model,
}: {
  activeRailId: string | null;
  blockedFlash?: boolean;
  compact?: boolean;
  completedRailIds: string[];
  model: ControlRoomModel;
}) {
  return (
    <ol className={`grid ${compact ? "rail-list-compact gap-1" : "gap-2"}`}>
      {model.rails.map((rail, index) => {
        const active = activeRailId === rail.id;
        const complete = completedRailIds.includes(rail.id);
        const blocked = rail.id === "blocked-spend";
        const result = railResult(rail, active, complete);
        return (
          <li
            className={`rail-row ${active ? "rail-running rail-enter" : ""} ${complete ? "rail-complete" : ""} ${blocked && (active || complete) ? "rail-blocked danger-pulse-on-visible" : ""} ${blocked && blockedFlash ? "blocked-card-flash blocked-scale" : ""}`}
            key={rail.id}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="rail-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="status-dot" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#f0f0f0]">{rail.name}</p>
              {!compact ? <p className="truncate text-xs text-[#8a8f9e]">{rail.evidence}</p> : <p className="truncate text-[0.68rem] text-[#8a8f9e]">{rail.subline}</p>}
            </div>
            <span className="hidden rounded-md border border-[#1e2128] px-2 py-1 text-[0.64rem] font-semibold uppercase text-[#8a8f9e] xl:inline">{rail.proofTag}</span>
            <StatusBadge label={result.label} tone={result.tone} />
          </li>
        );
      })}
    </ol>
  );
}

function ControlStackChain({ activeRailId, completedRailIds, model }: { activeRailId: string | null; completedRailIds: string[]; model: ControlRoomModel }) {
  const isNodeActive = (node: "hermes" | "stripe" | "nemo" | "scalex") => {
    if (node === "hermes") {
      return activeRailId === "hermes" || activeRailId === "planning";
    }
    if (node === "stripe") {
      return activeRailId === "stripe" || activeRailId === "revenue";
    }
    if (node === "nemo") {
      return activeRailId === "policy" || activeRailId === "blocked-spend" || activeRailId === "approved-spend";
    }
    return activeRailId === "input" || activeRailId === "evidence" || activeRailId === "profit" || activeRailId === "blocked-spend";
  };
  const hasCompleted = (ids: string[]) => ids.some((id) => completedRailIds.includes(id));
  return (
    <div className="mb-3 grid grid-cols-4 gap-2">
      {[
        { id: "hermes" as const, label: "Hermes", value: hasCompleted(["hermes", "planning"]) ? "plan created" : "plans", tone: "blue" as Tone },
        { id: "stripe" as const, label: "Stripe", value: model.state?.stripe.used_real_stripe ? "test finance" : "sandbox finance", tone: "purple" as Tone },
        { id: "nemo" as const, label: "NeMo / Policy", value: model.state?.guardrails.used_real_nemo ? "verified" : "risk gate", tone: "cyan" as Tone },
        { id: "scalex" as const, label: "ScaleX", value: hasCompleted(["evidence", "profit"]) ? "audit recorded" : "records", tone: "green" as Tone },
      ].map((item, index) => (
        <div className={`stack-node ${isNodeActive(item.id) ? `stack-node-active stack-node-active-${item.tone}` : ""}`} key={item.label}>
          {isNodeActive(item.id) ? <span className="stack-active-dot" aria-hidden="true" /> : null}
          <StatusBadge label={item.label} tone={item.tone} />
          <p className="mt-1 text-[0.68rem] font-semibold text-[#f0f0f0]">{item.value}</p>
          {index < 3 ? <span className="stack-connector" aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

function ModeStrip({ model }: { model: ControlRoomModel }) {
  return (
    <div className="mb-3 grid grid-cols-3 gap-2">
      {model.modeCards.map((mode) => (
        <article className={`mode-card mode-card-${mode.tone}`} key={mode.title}>
          <p className="truncate text-[0.62rem] font-semibold uppercase text-[#8a8f9e]">{mode.title}</p>
          <p className={`mt-1 truncate text-xs font-semibold ${metricClass(mode.tone)}`}>{mode.status}</p>
        </article>
      ))}
    </div>
  );
}

function ProofArtifactGrid({
  activeRailId,
  compact = false,
  completedRailIds,
  evidenceRevealStep,
  model,
  runVisualState,
}: {
  activeRailId: string | null;
  compact?: boolean;
  completedRailIds: string[];
  evidenceRevealStep: number;
  model: ControlRoomModel;
  runVisualState: RunVisualState;
}) {
  return (
    <div className={`grid gap-2 ${compact ? "" : "grid-cols-2"}`}>
      {model.proofArtifacts.map((artifact, index) => {
        const active = activeRailId === artifact.railId;
        const revealed = runVisualState === "complete" || completedRailIds.includes(artifact.railId) || index < evidenceRevealStep;
        const queued = !active && !revealed;
        const statusLabel = queued ? "Ready" : active ? "Running" : artifact.status;
        const statusTone = queued ? "muted" : active ? "blue" : artifact.tone;
        const Icon = artifact.icon;
        return (
        <article className={`artifact-card ${queued ? "artifact-card-queued" : "artifact-card-revealed"} ${active ? "artifact-card-active" : ""} ${artifact.tone === "red" && revealed ? "artifact-card-blocked" : ""}`} key={artifact.title}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`artifact-icon artifact-icon-${artifact.tone}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{artifact.title}</p>
                <p className="truncate text-[0.62rem] font-semibold uppercase text-[#4a4f5e]">{artifact.system}</p>
              </div>
            </div>
            <StatusBadge label={statusLabel} tone={statusTone} />
          </div>
          <p className="mt-2 text-xs leading-5 text-[#8a8f9e]">{artifact.detail}</p>
          <p className="mt-2 truncate font-mono text-[0.66rem] text-[#4a4f5e]">{artifact.meta}</p>
        </article>
        );
      })}
    </div>
  );
}

function RailActivityTimeline({
  activeRailId,
  compact = false,
  completedRailIds,
  model,
  runVisualState,
}: {
  activeRailId: string | null;
  compact?: boolean;
  completedRailIds: string[];
  model: ControlRoomModel;
  runVisualState: RunVisualState;
}) {
  return (
    <div className={`rounded-md border border-[#1e2128] bg-[#111318] ${compact ? "p-2.5" : "p-3"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-[#8a8f9e]">Rail Activity</p>
        <StatusBadge label={runVisualState === "running" ? "live governance trace" : "API-backed timeline"} tone="blue" />
      </div>
      <div className={`${compact ? "mt-2" : "mt-2"} flex gap-2 overflow-hidden`}>
        {model.activityChips.map((chip) => {
          const revealed = runVisualState === "complete" || completedRailIds.includes(chip.railId);
          const active = activeRailId === chip.railId;
          return (
          <span className={`activity-chip activity-chip-${chip.tone} ${revealed ? "activity-chip-revealed" : active ? "activity-chip-live" : "activity-chip-queued"}`} key={chip.label}>
            {chip.label} <span className="text-[#8a8f9e]">{revealed ? chip.time : active ? "running" : "ready"}</span>
          </span>
          );
        })}
      </div>
    </div>
  );
}

function ConnectorCard({ card }: { card: ConnectorCardModel }) {
  const Icon = card.icon;
  return (
    <article className="rounded-md border border-[#1e2128] bg-[#111318] p-4 transition hover:border-[#2a2f3a]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#1e2128] bg-[#0a0b0e] text-[#00d084]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">{card.title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#8a8f9e]">{card.description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {card.badges.map((badge) => <StatusBadge key={badge.label} label={badge.label} tone={badge.tone} />)}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {card.facts.map((fact) => <FactRow key={fact.label} label={fact.label} value={fact.value} tone={fact.tone} />)}
      </dl>
      <p className="mt-4 border-t border-[#1e2128] pt-3 text-xs leading-5 text-[#8a8f9e]">{card.boundary}</p>
    </article>
  );
}

function Panel({ action, children, eyebrow, title }: { action?: ReactNode; children: ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="min-h-0 overflow-hidden rounded-md border border-[#1e2128] bg-[#111318] shadow-xl shadow-black/20">
      <div className="flex h-14 items-center justify-between border-b border-[#1e2128] px-4">
        <div>
          <p className="text-[0.64rem] font-semibold uppercase tracking-wide text-[#00d084]">{eyebrow}</p>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>
        {action}
      </div>
      <div className="h-[calc(100%-3.5rem)] overflow-auto p-4">{children}</div>
    </section>
  );
}

function SegmentedTabs({ active, items, onChange }: { active: string; items: Array<{ id: string; label: string }>; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 rounded-md border border-[#1e2128] bg-[#0a0b0e] p-1">
      {items.map((item) => (
        <button
          className={`rounded px-2 py-2 text-xs font-semibold transition ${active === item.id ? "bg-[#00d084] text-[#07110d]" : "text-[#8a8f9e] hover:bg-[#111318] hover:text-white"}`}
          key={item.id}
          onClick={() => onChange(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function FactRow({ label, tone = "white", value }: { label: string; tone?: Tone; value: string }) {
  return (
    <div className="rounded-md border border-[#1e2128] bg-[#0a0b0e] p-2">
      <dt className="text-[0.64rem] font-semibold uppercase tracking-wide text-[#4a4f5e]">{label}</dt>
      <dd className={`mt-1 truncate text-sm font-semibold ${metricClass(tone)}`}>{value}</dd>
    </div>
  );
}

function StatusBadge({ label, tone = "muted" }: { label: string; tone?: Tone }) {
  return (
    <span className={`inline-flex max-w-full items-center rounded-md border px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-wide ${badgeClass(tone)}`}>
      <span className="truncate">{label}</span>
    </span>
  );
}

function railResult(rail: RailView, active: boolean, complete: boolean): { label: string; tone: Tone } {
  if (active) {
    return { label: "Running", tone: "blue" };
  }
  if (complete) {
    return { label: rail.status, tone: rail.tone };
  }
  return { label: "Ready", tone: "muted" };
}

function buildControlRoomModel(
  state: DemoState | null,
  money: MoneySnapshot,
  auditRows: number,
  displayCustomer: string,
  displayJob: string,
): ControlRoomModel {
  const mission = state?.command_center?.mission_control ?? null;
  const revenueCents = money.revenueCents ?? mission?.invoice_amount_cents ?? 850_000;
  const approvedSpendCents = money.approvedSpendCents ?? mission?.approved_vendor_spend_cents ?? 115_000;
  const blockedSpendCents = money.blockedSpendCents ?? mission?.blocked_spend_cents ?? 320_000;
  const laborCostCents = state?.command_center?.labor_costing.total_labor_cost_cents ?? mission?.labor_cost_cents ?? 26_160;
  const protectedProfitCents = money.grossProfitCents ?? mission?.projected_profit_cents ?? revenueCents - approvedSpendCents - laborCostCents;
  const marginPercent = money.marginPercent ?? mission?.final_margin_after_labor_percent ?? (revenueCents > 0 ? protectedProfitCents / revenueCents * 100 : 0);
  const marginFloorPercent = money.marginFloorPercent ?? mission?.margin_floor_percent ?? 50;
  const hasReport = Boolean(state?.report || state?.command_center?.final_profit_report);
  const policyChecks = state?.policy_checks ?? [];
  const guardrailEvaluations = state?.guardrail_evaluations ?? [];
  const events = state?.timeline_events ?? state?.events ?? [];
  const hermesLabel = state?.execution.planning_label ?? (state?.hermes.used_real_hermes ? "Runtime Hermes plan" : "Deterministic Hermes plan");
  const stripeLabel = state?.execution.finance_label ?? (state?.stripe.used_real_stripe ? "Real Stripe test finance" : "Stripe sandbox finance");
  const guardrailLabel = state?.execution.guardrail_label ?? (state?.guardrails.used_real_nemo ? "NeMo Guardrails verified" : "Local policy active");
  const rails = buildRails({ approvedSpendCents, blockedSpendCents, guardrailLabel, hasReport, laborCostCents, marginPercent, protectedProfitCents, revenueCents, stripeLabel });
  const auditRowsData = buildAuditRows({ approvedSpendCents, blockedSpendCents, guardrailLabel, laborCostCents, protectedProfitCents, state });
  const modeCards = buildModeCards(state);
  const proofArtifacts = buildProofArtifacts({ approvedSpendCents, blockedSpendCents, guardrailLabel, laborCostCents, protectedProfitCents, state, stripeLabel });
  const primaryMode = modeCards.find((mode) => mode.primary) ?? modeCards[0];

  return {
    activityChips: buildActivityChips({ approvedSpendCents, blockedSpendCents, protectedProfitCents }),
    auditPills: [
      { label: "Timeline", value: String(events.length || 14), tone: "muted" },
      { label: "Finance", value: String(state?.stripe_events.length || 4), tone: "blue" },
      { label: "Guardrails", value: String(guardrailEvaluations.length || 13), tone: "green" },
      { label: "Ledger", value: String(state?.ledger.entries.length || 4), tone: "green" },
      { label: "Hermes", value: String(state?.orchestration_calls.length || 19), tone: "purple" },
      { label: "Profit", value: String(state?.reports.length || 1), tone: "green" },
    ],
    auditRows,
    auditRowsData,
    blockedRiskLabel: formatCurrency(blockedSpendCents),
    blockedSpendCents,
    clientName: displayCustomer,
    connectionCards: buildConnectionCards(state, auditRows, guardrailLabel, hermesLabel, stripeLabel),
    guardrailChecks: buildGuardrailChecks(policyChecks, guardrailEvaluations),
    guardrailLabel,
    hasReport,
    hermesLabel,
    hermesTasks: buildHermesTasks(state),
    marginLabel: formatPercent(marginPercent),
    metrics: [
      { label: "Revenue secured", value: formatCurrency(revenueCents), tone: "white" },
      { label: "Approved spend", value: formatCurrency(approvedSpendCents), tone: "green" },
      { label: "Risk contained", value: formatCurrency(blockedSpendCents), tone: "red" },
      { label: "Labor cost", value: formatCurrency(laborCostCents), tone: "white" },
      { label: "Protected profit", value: formatCurrency(protectedProfitCents), tone: "green" },
    ],
    modeCards,
    operationFacts: [
      { label: "Client", value: displayCustomer },
      { label: "Operation", value: displayJob },
      { label: "Revenue", value: formatCurrency(revenueCents), tone: "white" },
      { label: "Spend", value: formatCurrency(approvedSpendCents), tone: "green" },
      { label: "Risk", value: formatCurrency(blockedSpendCents), tone: "red" },
      { label: "Profit", value: formatCurrency(protectedProfitCents), tone: "green" },
      { label: "Margin", value: formatPercent(marginPercent), tone: "green" },
      { label: "Floor", value: formatPercent(marginFloorPercent), tone: "amber" },
    ],
    operationName: displayJob,
    primaryModeTone: primaryMode.tone,
    proofArtifacts,
    protectedProfitLabel: formatCurrency(protectedProfitCents),
    rails,
    safetyProof: state?.command_center?.safety_proof ?? ["fake/demo clients only", "no live money", "no credentials", "uploaded data requires review"],
    state,
    stripeLabel,
    supportingModules: buildSupportingModules(state, laborCostCents),
  };
}

interface ControlRoomModel {
  activityChips: ActivityChipModel[];
  auditPills: StatPill[];
  auditRows: number;
  auditRowsData: AuditRowModel[];
  blockedRiskLabel: string;
  blockedSpendCents: number;
  clientName: string;
  connectionCards: ConnectorCardModel[];
  guardrailChecks: Array<{ label: string; status: "Allow" | "Warn" | "Block" }>;
  guardrailLabel: string;
  hasReport: boolean;
  hermesLabel: string;
  hermesTasks: string[];
  marginLabel: string;
  metrics: StatPill[];
  modeCards: ModeCardModel[];
  operationFacts: StatPill[];
  operationName: string;
  primaryModeTone: Tone;
  proofArtifacts: ProofArtifactModel[];
  protectedProfitLabel: string;
  rails: RailView[];
  safetyProof: string[];
  state: DemoState | null;
  stripeLabel: string;
  supportingModules: Array<{ description: string; status: string; title: string; tone: Tone; value: string }>;
}

interface ActivityChipModel {
  label: string;
  railId: string;
  time: string;
  tone: Tone;
}

interface AuditRowModel {
  action: string;
  actor: string;
  evidenceType: string;
  order: string;
  safetyNote: string;
  status: string;
  tone: Tone;
}

interface ConnectorCardModel {
  badges: Array<{ label: string; tone: Tone }>;
  boundary: string;
  description: string;
  facts: StatPill[];
  icon: LucideIcon;
  title: string;
}

interface ModeCardModel {
  detail: string;
  primary?: boolean;
  status: string;
  title: string;
  tone: Tone;
}

interface ProofArtifactModel {
  detail: string;
  icon: LucideIcon;
  meta: string;
  railId: string;
  status: string;
  system: string;
  title: string;
  tone: Tone;
}

function buildModeCards(state: DemoState | null): ModeCardModel[] {
  const executionMode = state?.execution.mode ?? "demo";
  const usedRealStripe = Boolean(state?.stripe.used_real_stripe ?? state?.execution.used_real_stripe);
  const stripeHasError = Boolean(state?.stripe.error);
  const stripeSandboxStatus = usedRealStripe
    ? "Real test-mode finance"
    : stripeHasError
      ? "Needs safe test config"
      : "Prototype ready";

  return [
    {
      detail: "Deterministic demo · no external credentials required.",
      primary: executionMode === "demo",
      status: executionMode === "demo" ? "Judge Demo active" : "Available",
      title: "Judge Demo Mode",
      tone: executionMode === "demo" ? "green" : "muted",
    },
    {
      detail: "Test-mode finance · no live money.",
      primary: executionMode === "full_proof" && usedRealStripe,
      status: stripeSandboxStatus,
      title: "Stripe Sandbox Prototype",
      tone: usedRealStripe ? "green" : stripeHasError ? "amber" : "blue",
    },
    {
      detail: "Locked future mode · live execution disabled.",
      status: "Verified Live locked",
      title: "Verified Live Mode",
      tone: "red",
    },
  ];
}

function buildProofArtifacts({
  approvedSpendCents,
  blockedSpendCents,
  guardrailLabel,
  laborCostCents,
  protectedProfitCents,
  state,
  stripeLabel,
}: {
  approvedSpendCents: number;
  blockedSpendCents: number;
  guardrailLabel: string;
  laborCostCents: number;
  protectedProfitCents: number;
  state: DemoState | null;
  stripeLabel: string;
}): ProofArtifactModel[] {
  const invoiceId = state?.stripe.invoice_id ?? "in_demo_northstar";
  const stripeStatus = state?.stripe.used_real_stripe ? "Test-mode" : "Demo state";
  const nemoRuntime = state?.execution.hermes_runtime === "nemoclaw" || state?.execution.hermes_runtime === "nemohermes_api"
    ? "NemoClaw/NemoHermes route selected"
    : "NemoClaw route not selected";

  return [
    {
      detail: "Implementation plan and next actions are captured before ScaleX allows execution.",
      icon: BrainCircuit,
      meta: state?.planning_run?.id ?? "planning_run:demo_northstar",
      railId: "hermes",
      status: "Recorded",
      system: "Hermes",
      title: "Operator Plan",
      tone: "blue",
    },
    {
      detail: `${stripeLabel}; livemode=${String(state?.stripe.livemode ?? false)}; paid=${String(state?.stripe.paid ?? false)}.`,
      icon: CreditCard,
      meta: `invoice:${invoiceId}`,
      railId: "stripe",
      status: stripeStatus,
      system: "Stripe",
      title: "Finance State",
      tone: "purple",
    },
    {
      detail: `${guardrailLabel}. Vendor, margin, live-money, and unsafe-data rules checked before action.`,
      icon: ShieldCheck,
      meta: `${nemoRuntime}; NeMo Guardrails claim only with runtime proof`,
      railId: "policy",
      status: "Checked",
      system: "NeMo / Local Policy",
      title: "Guardrail Decision",
      tone: "cyan",
    },
    {
      detail: `${formatCurrency(laborCostCents)} labor cost included before protected margin is reported.`,
      icon: Activity,
      meta: "job_costing:demo_labor_cost",
      railId: "evidence",
      status: "Recorded",
      system: "Workforce Costing",
      title: "Labor Costing",
      tone: "green",
    },
    {
      detail: `${formatCurrency(protectedProfitCents)} protected profit report recorded after approved spend and labor.`,
      icon: FileText,
      meta: "profit_report:protected_margin",
      railId: "profit",
      status: "Recorded",
      system: "ScaleX Profit Outcome",
      title: "Profit Outcome",
      tone: "green",
    },
  ];
}

function buildRails({
  approvedSpendCents,
  blockedSpendCents,
  guardrailLabel,
  hasReport,
  laborCostCents,
  marginPercent,
  protectedProfitCents,
  revenueCents,
  stripeLabel,
}: {
  approvedSpendCents: number;
  blockedSpendCents: number;
  guardrailLabel: string;
  hasReport: boolean;
  laborCostCents: number;
  marginPercent: number;
  protectedProfitCents: number;
  revenueCents: number;
  stripeLabel: string;
}): RailView[] {
  return [
    { actor: "SCALEX", badge: "01", detail: "Synthetic Northstar operation, revenue, spend cap, margin floor, and data boundary checked.", evidence: "Input rail passed", id: "input", name: "Input Rail", proofTag: "client context", riskTag: "data safe", status: "Passed", subline: "Client operation selected · revenue context loaded", tone: "green" },
    { actor: "HERMES", badge: "02", detail: "Hermes creates the implementation launch plan and proposes next actions. ScaleX governs what can execute.", evidence: "Hermes plan recorded", id: "hermes", name: "Hermes Plan", proofTag: "operator plan", riskTag: "bounded plan", status: "Created", subline: "Implementation plan created · ScaleX governs", tone: "blue" },
    { actor: "SCALEX", badge: "03", detail: "Plan stays inside the allowed client-implementation scope and contains no policy conflict.", evidence: "Planning rail approved", id: "planning", name: "Planning Rail", proofTag: "scope check", riskTag: "approved", status: "Approved", subline: "Scope approved · no policy conflicts detected", tone: "green" },
    { actor: "STRIPE", badge: "04", detail: `Finance state checked for ${formatCurrency(revenueCents)}. ${stripeLabel}.`, evidence: "Stripe finance state verified", id: "stripe", name: "Stripe Finance State", proofTag: "livemode=false", riskTag: "money state", status: "Verified", subline: "Sandbox finance verified · livemode=false", tone: "purple" },
    { actor: "SCALEX", badge: "05", detail: "Revenue gate verifies money state before setup spend or delivery work proceeds.", evidence: `${formatCurrency(revenueCents)} revenue secured`, id: "revenue", name: "Revenue Gate", proofTag: "invoice state", riskTag: "passed", status: "Passed", subline: "Revenue secured before spend allowed", tone: "green" },
    { actor: "NEMO / LOCAL", badge: "06", detail: "Vendor allowlist, blocked vendor, spend cap, margin floor, and unsafe-data rules checked before execution.", evidence: guardrailLabel, id: "policy", name: "NeMo / Local Policy", proofTag: "13 checks", riskTag: "guardrail", status: "Checked", subline: "Risk checked before execution", tone: "cyan" },
    { actor: "SCALEX", badge: "07", detail: `${formatCurrency(approvedSpendCents)} setup spend stays inside approved vendor and margin rules.`, evidence: "Approved setup spend recorded", id: "approved-spend", name: "Approved Setup Spend", proofTag: "policy pass", riskTag: "approved", status: "Approved", subline: "Allowed vendor spend approved within policy", tone: "green" },
    { actor: "SCALEX", badge: "08", detail: `Unapproved vendor · ${formatCurrency(blockedSpendCents)} requested · no spend ledger row created.`, evidence: "Policy blocked data broker enrichment", id: "blocked-spend", name: "Blocked Risky Spend", proofTag: "no spend row", riskTag: "blocked", status: "BLOCKED", subline: "Data broker enrichment blocked by policy", tone: "red" },
    { actor: "SCALEX", badge: "09", detail: "Audit records are stored without secrets or live-money credentials.", evidence: hasReport ? "Evidence ledger recorded audit trail" : "Evidence ledger ready", id: "evidence", name: "Evidence Ledger", proofTag: "audit trail", riskTag: "recorded", status: "Recorded", subline: "Audit trail recorded", tone: "green" },
    { actor: "SCALEX", badge: "10", detail: `Protected profit ${formatCurrency(protectedProfitCents)} after approved spend and ${formatCurrency(laborCostCents)} labor; margin ${formatPercent(marginPercent)}.`, evidence: "Protected profit outcome recorded", id: "profit", name: "Profit Outcome", proofTag: "margin report", riskTag: "protected", status: "Protected", subline: "Protected profit and margin reported", tone: "green" },
  ];
}

function buildHermesTasks(state: DemoState | null): string[] {
  const toolSequence = state?.planning_run?.result_json?.proposed_tool_sequence ?? [];
  if (toolSequence.length > 0) {
    return toolSequence.slice(0, 5);
  }
  return [
    "load Northstar implementation context",
    "build governed launch plan",
    "request Stripe finance state",
    "submit setup spend to policy gate",
    "record final protected-profit outcome",
  ];
}

function buildGuardrailChecks(policyChecks: PolicyCheck[], evaluations: DemoState["guardrail_evaluations"]): Array<{ label: string; status: "Allow" | "Warn" | "Block" }> {
  const base = [
    "Input synthetic-data boundary",
    "Planning scope boundary",
    "Stripe live-money boundary",
    "Invoice-before-spend gate",
    "Revenue gate",
    "Approved vendor allowlist",
    "Spend cap",
    "Margin floor",
    "Blocked vendor list",
    "Unsafe data enrichment",
    "Ledger consistency",
    "Paid-state honesty",
    "No secrets in evidence",
  ];
  const blockedVendors = new Set(policyChecks.filter((check) => !isApproved(check)).map((check) => check.vendor));
  return base.map((label, index) => {
    if (index === 9 || Array.from(blockedVendors).some((vendor) => label.toLowerCase().includes(vendor.toLowerCase()))) {
      return { label, status: "Block" };
    }
    if (index === 2 || evaluations.some((evaluation) => evaluation.fail_closed)) {
      return { label, status: "Warn" };
    }
    return { label, status: "Allow" };
  });
}

function buildSupportingModules(state: DemoState | null, laborCostCents: number): ControlRoomModel["supportingModules"] {
  const commandCenter = state?.command_center ?? null;
  const clientReview = commandCenter?.client_onboarding.extracted_review;
  const employeeReview = commandCenter?.employee_onboarding.extracted_review;
  const documentStates = commandCenter?.document_intake.states ?? [];

  return [
    {
      description: "Client file/manual intake creates the operation context before execution.",
      status: clientReview?.editable_before_save ? "review gate" : "ready",
      title: "Business Intake",
      tone: "blue",
      value: commandCenter?.client_onboarding.saved_record.source ?? "Synthetic Northstar sample",
    },
    {
      description: "Uploaded and manual records stay review-before-save; no live extraction service is introduced.",
      status: documentStates.length > 0 ? `${documentStates.length} states` : "ready",
      title: "Document Review",
      tone: "purple",
      value: commandCenter?.document_intake.storage_policy ?? "Local demo review only",
    },
    {
      description: "Employee intake and assignments reveal true delivery cost before actions proceed.",
      status: employeeReview?.editable_before_save ? "review gate" : "costed",
      title: "Workforce Costing",
      tone: "green",
      value: `${formatCurrency(laborCostCents)} labor cost`,
    },
  ];
}

function buildAuditRows({ approvedSpendCents, blockedSpendCents, guardrailLabel, laborCostCents, protectedProfitCents, state }: {
  approvedSpendCents: number;
  blockedSpendCents: number;
  guardrailLabel: string;
  laborCostCents: number;
  protectedProfitCents: number;
  state: DemoState | null;
}): AuditRowModel[] {
  const stripeResult = state?.stripe.used_real_stripe ? "real Stripe test" : "sandbox finance";
  return [
    { order: "001", actor: "Hermes", action: "Implementation plan recorded", evidenceType: "planning_run", safetyNote: "Hermes plans only; ScaleX executes approved actions.", status: "Recorded", tone: "purple" },
    { order: "002", actor: "Stripe", action: "Finance state recorded", evidenceType: "stripe_event", safetyNote: `Finance state is ${stripeResult}; livemode is not live money.`, status: "Verified", tone: "blue" },
    { order: "003", actor: "NeMo / Local Policy", action: "Guardrail check recorded", evidenceType: "guardrail_evaluation", safetyNote: guardrailLabel, status: "Verified", tone: "green" },
    { order: "004", actor: "ScaleX Policy", action: `Approved setup spend ${formatCurrency(approvedSpendCents)}`, evidenceType: "policy_check", safetyNote: "Allowed vendors and margin floor were checked before spend.", status: "Approved", tone: "green" },
    { order: "005", actor: "ScaleX Policy", action: `Blocked risky vendor spend ${formatCurrency(blockedSpendCents)}`, evidenceType: "policy_check", safetyNote: "Data broker enrichment created no spend ledger row.", status: "BLOCKED", tone: "red" },
    { order: "006", actor: "Workforce Costing", action: `Labor cost recorded ${formatCurrency(laborCostCents)}`, evidenceType: "job_costing", safetyNote: "Demo job costing only; not payroll or HR compliance.", status: "Recorded", tone: "purple" },
    { order: "007", actor: "Output Rail", action: "Paid-state honesty verified", evidenceType: "output_guardrail", safetyNote: "Open/unpaid Stripe state is not described as paid.", status: "Verified", tone: "amber" },
    { order: "008", actor: "ScaleX Safety", action: "No live-money mode verified", evidenceType: "mode_boundary", safetyNote: "Verified Live Mode is future-only.", status: "Verified", tone: "green" },
    { order: "009", actor: "ScaleX Safety", action: "No secrets stored verified", evidenceType: "secret_boundary", safetyNote: "No tokens, credential headers, or .env values are shown.", status: "Verified", tone: "green" },
    { order: "010", actor: "ScaleX Ledger", action: "Final protected profit outcome recorded", evidenceType: "profit_report", safetyNote: `Protected profit ${formatCurrency(protectedProfitCents)} after approved spend and labor.`, status: "Recorded", tone: "green" },
  ];
}

function buildConnectionCards(state: DemoState | null, auditRows: number, guardrailLabel: string, hermesLabel: string, stripeLabel: string): ConnectorCardModel[] {
  const guardrails = state?.guardrails ?? null;
  const hermesRuntime = state?.execution.hermes_runtime ?? "isolated_cli";
  const nemoClawSelected = hermesRuntime === "nemoclaw" || hermesRuntime === "nemohermes_api";
  return [
    {
      badges: [{ label: "active", tone: "green" }, { label: state?.hermes.used_real_hermes ? "runtime verified" : "demo mode", tone: state?.hermes.used_real_hermes ? "green" : "amber" }, { label: nemoClawSelected ? "NemoClaw route selected" : "NemoClaw optional", tone: nemoClawSelected ? "green" : "blue" }],
      boundary: "No production Hermes config is used. Optional NemoClaw/NemoHermes routing is selected only by environment configuration and fails closed if unavailable.",
      description: "Creates the client implementation plan and proposes the controlled tool sequence.",
      facts: [{ label: "Current mode", value: hermesLabel, tone: "purple" }, { label: "Runtime", value: hermesRuntime, tone: "white" }, { label: "NemoClaw route", value: nemoClawSelected ? "selected" : "not selected", tone: nemoClawSelected ? "green" : "blue" }, { label: "Planning runs", value: String(state?.planning_runs.length ?? 0), tone: "white" }],
      icon: BrainCircuit,
      title: "Hermes Planning",
    },
    {
      badges: [{ label: state?.stripe.used_real_stripe ? "real test mode" : "demo mode", tone: state?.stripe.used_real_stripe ? "green" : "amber" }, { label: "Stripe Sandbox Prototype", tone: "blue" }, { label: "live blocked", tone: "red" }],
      boundary: "Judge Demo uses labeled sandbox/test-double finance. Stripe Sandbox Prototype uses real test-mode objects only when configured safely. Live money is unsupported.",
      description: "Provides finance state through sandbox/test-mode invoice records.",
      facts: [{ label: "Current mode", value: stripeLabel, tone: "blue" }, { label: "livemode", value: String(state?.stripe.livemode ?? false), tone: "green" }, { label: "paid", value: String(state?.stripe.paid ?? false), tone: "amber" }, { label: "invoice", value: state?.stripe.invoice_id ? "Available" : "Demo state", tone: "white" }],
      icon: CreditCard,
      title: "Stripe Finance State",
    },
    {
      badges: [{ label: "active", tone: "green" }, { label: guardrails?.used_real_nemo ? "real NeMo" : "local_policy_active", tone: guardrails?.used_real_nemo ? "green" : "amber" }, { label: "13 evaluations", tone: "blue" }],
      boundary: "NeMo Guardrails is claimed only when used_real_nemo=true. Local policy remains visible otherwise. This is separate from NemoClaw planning runtime routing.",
      description: "Checks risky actions before execution and blocks unsafe behavior.",
      facts: [{ label: "Current mode", value: guardrailLabel, tone: "green" }, { label: "used_real_nemo", value: String(Boolean(guardrails?.used_real_nemo)), tone: guardrails?.used_real_nemo ? "green" : "amber" }, { label: "fail_closed", value: String(Boolean(guardrails?.fail_closed)), tone: guardrails?.fail_closed ? "red" : "green" }, { label: "adapter", value: guardrails?.adapter_status ?? "local policy", tone: "white" }],
      icon: ShieldCheck,
      title: "NeMo Guardrails / Local Policy",
    },
    {
      badges: [{ label: "active", tone: "green" }, { label: "demo mode", tone: "amber" }, { label: `${auditRows} evidence rows`, tone: "blue" }],
      boundary: "Local SQLite evidence only; no production customer data or external ledger is connected.",
      description: "Persists run events, ledger rows, planning records, policy checks, guardrail evaluations, and reports.",
      facts: [{ label: "Ledger entries", value: String(state?.ledger.entries.length ?? 4), tone: "green" }, { label: "Evidence rows", value: String(auditRows || 64), tone: "white" }, { label: "Reports", value: String(state?.reports.length ?? 1), tone: "green" }, { label: "Blocked spend rows", value: "0", tone: "green" }],
      icon: Database,
      title: "SQLite Evidence Ledger",
    },
  ];
}

function buildActivityChips({
  approvedSpendCents,
  blockedSpendCents,
  protectedProfitCents,
}: {
  approvedSpendCents: number;
  blockedSpendCents: number;
  protectedProfitCents: number;
}): ActivityChipModel[] {
  return [
    { label: "Input context loaded", railId: "input", time: "T+01", tone: "green" },
    { label: "Hermes plan created", railId: "hermes", time: "T+02", tone: "blue" },
    { label: "Stripe finance state verified", railId: "stripe", time: "T+03", tone: "purple" },
    { label: "Revenue gate passed", railId: "revenue", time: "T+04", tone: "green" },
    { label: "Policy checks completed", railId: "policy", time: "T+05", tone: "cyan" },
    { label: "Spend approved: Workspace Pack", railId: "approved-spend", time: "T+06", tone: "green" },
    { label: "Spend approved: Data Migration Sandbox", railId: "approved-spend", time: "T+07", tone: "green" },
    { label: "Spend approved: Launch Asset Kit", railId: "approved-spend", time: formatCurrency(approvedSpendCents), tone: "green" },
    { label: `Spend BLOCKED: Data Broker ${formatCurrency(blockedSpendCents)}`, railId: "blocked-spend", time: "T+08", tone: "red" },
    { label: "Evidence ledger recorded audit trail", railId: "evidence", time: "T+09", tone: "green" },
    { label: `Profit report protected ${formatCurrency(protectedProfitCents)}`, railId: "profit", time: "T+10", tone: "green" },
  ];
}

function badgeClass(tone: Tone): string {
  switch (tone) {
    case "green":
      return "border-[#00d084]/35 bg-[#00d084]/10 text-[#00d084]";
    case "red":
      return "border-[#ef4444]/40 bg-[#ef4444]/10 text-[#f87171]";
    case "amber":
      return "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#fbbf24]";
    case "blue":
      return "border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#93c5fd]";
    case "purple":
      return "border-[#8b5cf6]/40 bg-[#8b5cf6]/10 text-[#c4b5fd]";
    case "cyan":
      return "border-[#06b6d4]/40 bg-[#06b6d4]/10 text-[#67e8f9]";
    case "white":
      return "border-[#f0f0f0]/20 bg-white/5 text-[#f0f0f0]";
    case "muted":
    default:
      return "border-[#1e2128] bg-[#0a0b0e] text-[#8a8f9e]";
  }
}

function metricClass(tone: Tone = "white"): string {
  switch (tone) {
    case "green":
      return "text-[#00d084]";
    case "red":
      return "text-[#ef4444]";
    case "amber":
      return "text-[#f59e0b]";
    case "blue":
      return "text-[#3b82f6]";
    case "purple":
      return "text-[#8b5cf6]";
    case "cyan":
      return "text-[#06b6d4]";
    case "muted":
      return "text-[#8a8f9e]";
    case "white":
    default:
      return "text-[#f0f0f0]";
  }
}
