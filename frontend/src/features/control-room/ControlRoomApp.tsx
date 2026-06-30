import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
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
import type { AuthStatus, CommandCenterCostBasisLineItem, DemoState, HealthResponse, PolicyCheck } from "../../types";

type Tone = "brand" | "green" | "red" | "amber" | "blue" | "purple" | "cyan" | "muted" | "white";
type DrawerTab = "summary" | "operation" | "control";
type RunVisualState = "idle" | "running" | "complete";

const RUN_START_DELAY_MS = 260;
const RAIL_GAP_MS = 90;
const DEFAULT_RAIL_DELAY_MS = 2200;
const INTAKE_RAIL_HOLD_MS = 2200;
const COST_BASIS_RAIL_HOLD_MS = 2200;
const HERMES_RAIL_HOLD_MS = 2400;
const STRIPE_RAIL_HOLD_MS = 3200;
const POLICY_RAIL_HOLD_MS = 3200;
const APPROVED_SPEND_RAIL_HOLD_MS = 2400;
const BLOCKED_RAIL_HOLD_MS = 4800;
const EVIDENCE_RAIL_HOLD_MS = 2600;
const PROFIT_RAIL_HOLD_MS = 3200;
const DETAIL_TRANSITION_MS = 550;
const BLOCKED_COUNT_DURATION_MS = 1800;
const BLOCKED_FLASH_DURATION_MS = 1200;
const DETAIL_TRANSITION_STYLE = {
  "--detail-transition-ms": `${DETAIL_TRANSITION_MS}ms`,
} as CSSProperties;

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
  sublabel?: string;
  value: string;
  tone?: Tone;
}

interface LaborWorkerView {
  cost: string;
  hours: string;
  rate: string;
  role: string;
  worker: string;
}

interface CostBasisRowView {
  amountLabel: string;
  id: string;
  itemLabel: string;
  percentLabel: string;
  status: string;
  tone: Tone;
}

type DecisionSystemId = "hermes" | "stripe" | "policy" | "scalex";

interface DecisionSystemCardView {
  compactDetail?: string;
  compactSubtitle?: string;
  detail: string;
  fallbackIcon: LucideIcon;
  id: DecisionSystemId;
  logoSrc?: string;
  mark?: string;
  role: string;
  subtitle: string;
  title: string;
  tone: Tone;
}

interface ToolActionView {
  name: string;
  status: string;
  tone: Tone;
}

interface ToolActionGroupView {
  actions: ToolActionView[];
  title: string;
}

interface FlowStepView {
  detail: string;
  label: string;
  status: string;
  tone: Tone;
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
  const [runVisualState, setRunVisualState] = useState<RunVisualState>("idle");
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
    let cursorMs = RUN_START_DELAY_MS;
    model.rails.forEach((_, index) => {
      const rail = model.rails[index];
      const durationMs = railHoldMs(rail.id);
      timers.push(window.setTimeout(() => {
        setActiveRailId(rail.id);
        if (rail.id === "blocked-spend") {
          setBlockedFlash(true);
          Array.from({ length: 16 }).forEach((__, stepIndex) => {
            timers.push(window.setTimeout(() => {
              setDisplayedBlockedRiskCents(Math.round(blockedTarget * ((stepIndex + 1) / 16)));
            }, stepIndex * (BLOCKED_COUNT_DURATION_MS / 16)));
          });
          timers.push(window.setTimeout(() => setBlockedFlash(false), BLOCKED_FLASH_DURATION_MS));
        }
      }, cursorMs));

      timers.push(window.setTimeout(() => {
        setCompletedRailIds((current) => (current.includes(rail.id) ? current : [...current, rail.id]));
        setEvidenceRevealStep(index + 1);
        if (index === model.rails.length - 1) {
          setActiveRailId(null);
          setRunVisualState("complete");
        } else {
          setActiveRailId(null);
        }
      }, cursorMs + durationMs));
      cursorMs += durationMs + RAIL_GAP_MS;
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [busyAction, model.blockedSpendCents, model.rails]);

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

    if (runCompletedMoment || (runVisualState === "complete" && state?.report)) {
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
    <div className="flex h-screen min-w-0 flex-col overflow-hidden bg-[#050505] text-white">
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
      <div className="min-h-0 flex-1 overflow-x-hidden p-4">
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
        {activeView === "integrations" ? <ConnectionHubView model={model} runVisualState={runVisualState} /> : null}
        {activeView === "settings" ? <SettingsView auth={auth} health={health} model={model} runVisualState={runVisualState} state={state} /> : null}
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
  const hasCompletedRun = runVisualState === "complete";
  const evidenceRowsLabel = hasCompletedRun ? `${model.auditRows} evidence rows` : "0 evidence rows";
  const crumbByView: Record<string, string> = {
    audit: `Evidence Ledger / ${evidenceRowsLabel}`,
    dashboard: "Governed execution for revenue-backed client operations",
    integrations: "Connection Hub / active systems · governed demo",
    settings: "Settings / Boundaries & Runtime",
    workflow: `Governed Run Studio / ${model.clientName} · ${model.operationName}`,
  };
  const subline =
    error ??
    notice ??
    (activeView === "dashboard"
      ? "Hermes plans. Stripe proves money. NemoClaw/NeMo checks risk. ScaleX blocks, records, protects profit."
      : runStatus);
  const statusLabel = runVisualState === "running"
    ? "Running"
    : hasCompletedRun
      ? "Complete"
      : "Ready";
  const buttonLabel = runVisualState === "running"
    ? "Executing governed run..."
    : "Start Governed Run";

  return (
    <header className="flex h-14 flex-none items-center justify-between gap-3 overflow-hidden border-b border-[#232834] bg-[#0D0E12] px-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{crumbByView[activeView] ?? crumbByView.dashboard}</p>
        <p className={`mt-0.5 truncate text-xs ${error ? "text-[#ef4444]" : "text-[#A1A1AA]"}`}>
          {subline}
        </p>
      </div>
      <div className="flex flex-none items-center gap-2">
        <StatusBadge label="Judge Demo Mode" tone={model.primaryModeTone} />
        <StatusBadge label={statusLabel} tone={runVisualState === "running" ? "blue" : hasCompletedRun ? "green" : "muted"} />
        <button className="control-btn" onClick={() => onNavigate("audit")} type="button">Review Ledger</button>
        <button className="control-btn-primary" disabled={runActive} onClick={onRun} type="button">
          {runActive ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {buttonLabel}
        </button>
        <button className="control-btn hidden xl:inline-flex" onClick={onRefresh} type="button">Refresh</button>
        <button className="control-btn hidden xl:inline-flex" onClick={onReset} type="button">Reset</button>
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
  const dashboardRunning = runVisualState === "running";
  const dashboardDetailCompact = dashboardRunning || runVisualState === "idle";
  const displayMetrics = displayMetricsForRunState(model, runVisualState);

  return (
    <section
      className={`dashboard-view ${dashboardRunning ? "dashboard-view-running" : ""}`}
      style={DETAIL_TRANSITION_STYLE}
    >
      <OperationIdentityBar compact={dashboardRunning} model={model} />
      <MetricStrip
        activeRailId={activeRailId}
        blockedFlash={blockedFlash}
        blockedRiskDisplayValue={formatCurrency(displayedBlockedRiskCents)}
        compact={dashboardRunning}
        completedRailIds={completedRailIds}
        metrics={displayMetrics}
        runActive={runActive}
        runVisualState={runVisualState}
      />
      <div className={`dashboard-active-grid ${dashboardRunning ? "dashboard-active-grid-running" : ""}`}>
        <Panel
          compact={dashboardRunning}
          title="Governed Run"
          eyebrow="execution rails"
          action={<StatusBadge label={runVisualState === "running" ? "running" : runVisualState === "complete" ? "complete" : "ready"} tone={runVisualState === "running" ? "blue" : runVisualState === "complete" ? "green" : "brand"} />}
        >
          <RailList
            activeRailId={activeRailId}
            blockedFlash={blockedFlash}
            compact
            completedRailIds={completedRailIds}
            hideSecondary={dashboardRunning}
            model={model}
            runningCompact={dashboardRunning}
          />
        </Panel>
        <Panel compact={dashboardDetailCompact} title="Live Run Detail" eyebrow="active decision context" action={<button className="control-link" onClick={() => onNavigate("audit")} type="button">Open Ledger</button>}>
          <LiveRunDetail
            activeRailId={activeRailId}
            blockedFlash={blockedFlash}
            compact={dashboardDetailCompact}
            completedRailIds={completedRailIds}
            model={model}
            onRun={onRun}
            runActive={runActive}
            runVisualState={runVisualState}
          />
        </Panel>
        {!dashboardRunning ? (
          <Panel title="Enterprise Rails" eyebrow="intake · tools · guardrails" action={<StatusBadge label="MCP-ready" tone="blue" />}>
            <EnterpriseControlPanel model={model} runVisualState={runVisualState} />
          </Panel>
        ) : null}
      </div>
      {dashboardRunning ? (
        <div className="dashboard-support-lower">
          <Panel title="Enterprise Rails" eyebrow="supporting modules below active run" action={<StatusBadge label="MCP-ready" tone="blue" />}>
            <EnterpriseControlPanel model={model} runVisualState={runVisualState} />
          </Panel>
        </div>
      ) : null}
    </section>
  );
}

function OperationIdentityBar({ compact = false, model }: { compact?: boolean; model: ControlRoomModel }) {
  return (
    <div className={`operation-identity-bar ${compact ? "operation-identity-bar-compact" : ""}`}>
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-[#fcba03]">Active operation</p>
        <div className="mt-1 flex min-w-0 flex-wrap items-end gap-x-3 gap-y-1">
          <h1 className="truncate text-2xl font-semibold text-white">{model.clientName}</h1>
          <p className="truncate text-sm font-semibold text-[#A1A1AA]">{model.operationName}</p>
        </div>
        <div className="operation-support-chips">
          {["Intake reviewed", "Stripe sandbox/test finance", "NemoClaw boundary", "Labor cost included", "Evidence ledger active"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="after-sale-strip" aria-label="After the sale operating model">
        <div>
          <span className="after-sale-label">Before ScaleX</span>
          <p>Sales → Finance → Ops → Vendors → Legal/Security → CS → Leadership → Audit</p>
        </div>
        <div>
          <span className="after-sale-label after-sale-label-green">With ScaleX</span>
          <p>Paid client operation → governed run → blockers + protected profit</p>
        </div>
      </div>
    </div>
  );
}

function displayMetricsForRunState(model: ControlRoomModel, runVisualState: RunVisualState): StatPill[] {
  if (runVisualState === "complete") {
    return model.metrics;
  }

  const revenue = model.metrics.find((metric) => metric.label === "Revenue secured")?.value ?? "$8,500";
  return [
    { label: "Revenue secured", sublabel: "client revenue context loaded", value: revenue, tone: "white" },
    { label: "Approved costs", sublabel: "pending governed approval", value: formatCurrency(0), tone: "muted" },
    { label: "Risk contained", sublabel: "no risky action evaluated yet", value: formatCurrency(0), tone: "red" },
    { label: "Protected profit", sublabel: "pending profit outcome", value: formatCurrency(0), tone: "muted" },
    { label: "Protected margin", sublabel: "reported after run", value: "Pending", tone: "amber" },
  ];
}

function operationFactsForRunState(model: ControlRoomModel, runVisualState: RunVisualState): StatPill[] {
  if (runVisualState === "complete") {
    return model.operationFacts;
  }

  return [
    { label: "Client", value: model.clientName },
    { label: "Operation", value: model.operationName },
    { label: "Revenue", value: model.metrics.find((metric) => metric.label === "Revenue secured")?.value ?? "$8,500", tone: "white" },
    { label: "Cost basis", value: model.approvedCostsLabel, tone: "amber" },
    { label: "Risk to contain", value: "Pending", tone: "muted" },
    { label: "Profit", value: "Pending", tone: "muted" },
    { label: "Margin", value: "Pending", tone: "muted" },
    { label: "Floor", value: model.marginFloorLabel, tone: "amber" },
  ];
}

function prototypeFactsForRunState(model: ControlRoomModel, runVisualState: RunVisualState): StatPill[] {
  if (runVisualState === "complete") {
    return [
      { label: "Approved costs", value: model.approvedCostsLabel, tone: "green" },
      { label: "Protected profit", value: model.protectedProfitLabel, tone: "green" },
      { label: "Protected margin", value: model.marginLabel, tone: "green" },
      { label: "Blocked risk", value: model.blockedRiskLabel, tone: "red" },
    ];
  }

  return [
    { label: "Planned cost basis", value: model.approvedCostsLabel, tone: "amber" },
    { label: "Protected profit", value: "Pending", tone: "muted" },
    { label: "Protected margin", value: "Pending", tone: "muted" },
    { label: "Blocked risk", value: "Not evaluated", tone: "muted" },
  ];
}

function auditPillsForRunState(model: ControlRoomModel, runVisualState: RunVisualState): StatPill[] {
  if (runVisualState === "complete") {
    return model.auditPills;
  }

  return model.auditPills.map((pill) => ({ ...pill, value: "0", tone: "muted" as Tone }));
}

function connectionCardsForRunState(model: ControlRoomModel, runVisualState: RunVisualState): ConnectorCardModel[] {
  if (runVisualState === "complete") {
    return model.connectionCards;
  }

  return model.connectionCards.map((card) => {
    if (card.title !== "SQLite Evidence Ledger") {
      return card;
    }

    return {
      ...card,
      badges: [{ label: "ready", tone: "muted" }, { label: "demo mode", tone: "amber" }, { label: "0 evidence rows", tone: "muted" }],
      facts: [
        { label: "Ledger entries", value: "0", tone: "muted" },
        { label: "Evidence rows", value: "0", tone: "muted" },
        { label: "Reports", value: "0", tone: "muted" },
        { label: "Blocked spend rows", value: "0", tone: "green" },
      ],
    };
  });
}

function toolActionGroupsForRunState(model: ControlRoomModel, runVisualState: RunVisualState): ToolActionGroupView[] {
  if (runVisualState === "complete") {
    return model.toolActionGroups;
  }

  return model.toolActionGroups.map((group) => ({
    ...group,
    actions: group.actions.map((action) => {
      if (/ledger|block_unapproved_spend|retrieve_payment_status|create_invoice|send_invoice|create_customer|guardrail|policy/i.test(action.name)) {
        return { ...action, status: "Ready", tone: "muted" as Tone };
      }
      if (/hermes/i.test(action.name)) {
        return { ...action, status: "Proposed", tone: "blue" as Tone };
      }
      return action;
    }),
  }));
}

function stripeFlowStepsForRunState(model: ControlRoomModel, runVisualState: RunVisualState): FlowStepView[] {
  if (runVisualState === "complete") {
    return model.stripeFlowSteps;
  }

  return model.stripeFlowSteps.map((step) => ({
    ...step,
    detail: step.label === "Record finance state" ? "Finance evidence records when the governed run executes." : step.detail,
    status: step.label === "Retrieve invoice/payment status" ? "Pending" : "Ready",
    tone: "muted" as Tone,
  }));
}

function railProofForRunState(rail: RailView, runVisualState: RunVisualState, active: boolean, complete: boolean): { detail: string; evidence: string } {
  if (runVisualState === "complete" || active || complete) {
    return { detail: rail.detail, evidence: rail.evidence };
  }

  switch (rail.id) {
    case "approved-spend":
      return {
        detail: "Setup spend approval has not been executed yet. Cost basis is prepared for the governed run.",
        evidence: "Spend approval pending",
      };
    case "blocked-spend":
      return {
        detail: "Risky vendor action has not been evaluated yet. Start the governed run to record the policy decision.",
        evidence: "Risk decision pending",
      };
    case "evidence":
      return {
        detail: "Audit rows are recorded during the governed run. No completed evidence is shown before execution.",
        evidence: "Ledger recording pending",
      };
    case "profit":
      return {
        detail: "Protected profit and margin are reported only after the governed run completes.",
        evidence: "Profit outcome pending",
      };
    case "cost-basis":
      return {
        detail: "Prepared delivery cost basis is loaded for the run; governed approval is recorded during execution.",
        evidence: "Cost basis prepared",
      };
    default:
      return { detail: "Rail is ready and will record evidence when the governed run executes.", evidence: "Rail ready" };
  }
}

function proofArtifactDetailForRunState(artifact: ProofArtifactModel, queued: boolean): string {
  if (!queued) {
    return artifact.detail;
  }

  switch (artifact.railId) {
    case "approved-spend":
      return "Prepared for governed approval during the run.";
    case "blocked-spend":
      return "Risk decision pending until the policy rail evaluates the vendor action.";
    case "evidence":
      return "Ledger record pending until the governed run records evidence.";
    case "profit":
      return "Profit and margin outcome pending until the final rail completes.";
    case "cost-basis":
      return "Planned delivery cost basis prepared for execution.";
    default:
      return "Ready to record non-secret evidence when this rail runs.";
  }
}

function RunSignals({ completedRailIds, runVisualState }: { completedRailIds: string[]; runVisualState: RunVisualState }) {
  const isComplete = (railId: string) => completedRailIds.includes(railId) || runVisualState === "complete";
  const signals = [
    { label: "Intake loaded", ready: isComplete("input"), tone: "green" as Tone },
    { label: "Finance verified", ready: isComplete("stripe-status"), tone: "purple" as Tone },
    { label: "Guardrails checked", ready: isComplete("policy"), tone: "cyan" as Tone },
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
  compact = false,
  completedRailIds,
  model,
  onRun,
  runActive,
  runVisualState,
}: {
  activeRailId: string | null;
  blockedFlash: boolean;
  compact?: boolean;
  completedRailIds: string[];
  model: ControlRoomModel;
  onRun: () => void;
  runActive: boolean;
  runVisualState: RunVisualState;
}) {
  const focusId = activeRailId ?? (runVisualState === "complete" || completedRailIds.includes("profit") ? "profit" : "idle");
  const startCompact = compact && focusId === "idle";
  const marginFloor = model.operationFacts.find((fact) => fact.label === "Floor")?.value ?? "50%";
  const invoiceId = model.state?.stripe?.invoice_id ?? "in_demo_northstar";
  const livemode = String(model.state?.stripe?.livemode ?? false);
  const paid = String(model.state?.stripe?.paid ?? false);
  const decisionSystemCards = <DecisionSystemCards focusId={focusId} prominent={startCompact} runVisualState={runVisualState} />;
  const renderDetail = () => {
    if (focusId === "input" || focusId === "cost-basis") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#A1A1AA]">Business Intake & Cost Basis</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{focusId === "input" ? "Client context is reviewed" : "Labor cost is loaded"}</h2>
            </div>
            <StatusBadge label={focusId === "input" ? "reviewed" : "costed"} tone="green" />
          </div>
          {decisionSystemCards}
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <FactRow label="Client" value={model.clientName} tone="white" />
            <FactRow label="Total costs" value={model.approvedCostsLabel} tone="green" />
            <FactRow label="Labor cost" value={model.laborCostLabel} tone="green" />
            <FactRow label="Margin floor" value={model.marginFloorLabel} tone="amber" />
          </dl>
          <p className="mt-3 rounded-md border border-[#232834] bg-[#0a0b0e] p-3 text-xs leading-5 text-[#A1A1AA]">
            Approved delivery costs include setup/tool spend, labor, campaign/media, materials, fees, QA/compliance overhead, and reserve before Hermes proposes tool actions.
          </p>
        </section>
      );
    }

    if (focusId === "hermes") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#A1A1AA]">Hermes Plan</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Implementation plan is being created</h2>
            </div>
            <StatusBadge label="created" tone="blue" />
          </div>
          {decisionSystemCards}
          <pre className="proof-terminal mt-3">
{model.hermesTasks.slice(0, 5).map((task, index) => `$ ${index + 1}. ${task}`).join("\n")}
{"\n"}$ boundary: Hermes proposes. ScaleX governs.
          </pre>
        </section>
      );
    }

    if (focusId === "stripe-invoice" || focusId === "stripe-status") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#A1A1AA]">Stripe Finance State</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{focusId === "stripe-invoice" ? "Invoice tool action is prepared" : "Payment state is checked honestly"}</h2>
            </div>
            <StatusBadge label="livemode=false" tone="green" />
          </div>
          {decisionSystemCards}
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <FactRow label="Mode" value={model.stripeLabel} tone="purple" />
            <FactRow label="Invoice" value={invoiceId} tone="white" />
            <FactRow label="livemode" value={livemode} tone="green" />
            <FactRow label="paid" value={paid} tone={paid === "true" ? "green" : "amber"} />
          </dl>
          <p className="mt-3 rounded-md border border-[#232834] bg-[#0a0b0e] p-3 text-xs leading-5 text-[#A1A1AA]">
            Judge Demo Mode uses deterministic/test finance state. Stripe Sandbox Prototype can create real test-mode objects only when configured safely.
          </p>
        </section>
      );
    }

    if (focusId === "policy" || focusId === "approved-spend") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#A1A1AA]">NemoClaw / NeMo Guardrails</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{focusId === "approved-spend" ? "Allowed setup spend can proceed" : "Risk is checked before execution"}</h2>
            </div>
            <StatusBadge label={focusId === "approved-spend" ? "approved" : "checked"} tone={focusId === "approved-spend" ? "green" : "cyan"} />
          </div>
          {decisionSystemCards}
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <FactRow label="Guardrail mode" value={model.guardrailLabel} tone="cyan" />
            <FactRow label="Vendor gate" value="allowlist enforced" tone="green" />
            <FactRow label="Setup spend" value={model.setupSpendLabel} tone="green" />
            <FactRow label="Margin floor" value={marginFloor} tone="amber" />
          </dl>
          <p className="mt-3 rounded-md border border-[#232834] bg-[#0a0b0e] p-3 text-xs leading-5 text-[#A1A1AA]">
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
            <FactRow label="Current margin" value={model.marginLabel} tone="green" />
            <FactRow label="If approved" value={model.marginIfBlockedApprovedLabel} tone="red" />
            <FactRow label="Margin floor" value={model.marginFloorLabel} tone="amber" />
            <FactRow label="Spend row" value="not created" tone="green" />
          </dl>
          <p className="mt-4 rounded-md border border-[#ef4444]/35 bg-[#ef4444]/10 p-3 text-sm font-semibold leading-6 text-[#f87171]">
            ScaleX did not just block a vendor. It protected the operation from margin collapse and recorded proof.
          </p>
          {decisionSystemCards}
        </section>
      );
    }

    if (focusId === "evidence") {
      return (
        <section className="live-detail-card live-detail-enter">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase text-[#A1A1AA]">ScaleX Audit Record</p>
              <h2 className="mt-1 text-xl font-semibold text-white">What happened is now ledgered</h2>
            </div>
            <StatusBadge label="recorded" tone="green" />
          </div>
          {decisionSystemCards}
          <div className="mt-3 grid gap-2">
            {[
              "Hermes plan, finance state, and guardrail decision are linked.",
              "Approved setup spend is recorded with policy context.",
              "Risk stop is stored without secrets or live-money credentials.",
            ].map((line) => (
              <p className="rounded-md border border-[#232834] bg-[#0a0b0e] px-3 py-2 text-sm text-[#FFFFFF]" key={line}>{line}</p>
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
              <p className="text-[0.68rem] font-semibold uppercase text-[#10B981]">Profit Outcome</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{model.protectedProfitLabel}</h2>
            </div>
            <StatusBadge label="protected" tone="green" />
          </div>
          {decisionSystemCards}
          <dl className="live-profit-facts mt-3 grid gap-2">
            {model.metrics.map((metric) => (
              <FactRow key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
            ))}
          </dl>
          <p className="mt-3 rounded-md border border-[#10B981]/30 bg-[#10B981]/10 p-3 text-sm font-semibold text-[#10B981]">
            Protected margin: {model.marginLabel}. Formula: Revenue - Total Approved Costs.
          </p>
        </section>
      );
    }

    return (
      <section className={`live-detail-card live-detail-enter ${startCompact ? "live-detail-start-compact" : ""}`}>
        <PreRunDecisionStage decisionSystemCards={decisionSystemCards} model={model} />
        <button className="control-btn-primary mt-4 w-full" disabled={runActive} onClick={onRun} type="button">
          {runActive ? "Executing governed run..." : "Start Governed Run"}
        </button>
      </section>
    );
  };

  return (
    <div className={`live-run-shell ${compact ? "live-run-shell-compact" : ""} ${startCompact ? "live-run-shell-start-compact" : ""}`}>
      {!startCompact ? <ControlStackChain activeRailId={activeRailId} completedRailIds={completedRailIds} model={model} /> : null}
      {!startCompact ? <RunSignals completedRailIds={completedRailIds} runVisualState={runVisualState} /> : null}
      <div className={startCompact ? "h-full" : "mt-3"} key={focusId}>
        {renderDetail()}
      </div>
    </div>
  );
}

function PreRunDecisionStage({ decisionSystemCards, model }: { decisionSystemCards: ReactNode; model: ControlRoomModel }) {
  const revenue = model.metrics.find((metric) => metric.label === "Revenue secured")?.value ?? "$8,500";

  return (
    <div className="pre-run-stage" aria-label="Ready to govern decision stage">
      <div className="pre-run-stage-head">
        <div className="min-w-0">
          <p>Decision stage</p>
          <h3>Ready to govern Northstar operation</h3>
        </div>
        <div className="pre-run-stage-meta" aria-label="Pre-run operation context">
          <span>{revenue} revenue</span>
          <span>Profit pending</span>
        </div>
      </div>
      <p className="pre-run-stage-subtitle">
        ScaleX will inspect the client operation through proof, policy, money control, and audit before execution.
      </p>
      <div className="pre-run-stack-block" aria-label="Governance Stack">
        <div className="pre-run-stack-heading">
          <span>Governance Stack</span>
          <b>controlled execution stack</b>
        </div>
        {decisionSystemCards}
      </div>
    </div>
  );
}

function DecisionSystemCards({ focusId, prominent = false, runVisualState }: { focusId: string; prominent?: boolean; runVisualState: RunVisualState }) {
  const activeSystemId = decisionSystemForFocus(focusId, runVisualState);
  const complete = runVisualState === "complete";

  return (
    <div className="decision-system-grid" aria-label="Governed execution systems">
      {decisionSystemCardData.map((card) => (
        <DecisionSystemCard
          active={activeSystemId === card.id}
          card={card}
          complete={complete}
          key={card.id}
          prominent={prominent}
        />
      ))}
    </div>
  );
}

function DecisionSystemCard({ active, card, complete, prominent }: { active: boolean; card: DecisionSystemCardView; complete: boolean; prominent: boolean }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const Icon = card.fallbackIcon;
  const showLogo = Boolean(card.logoSrc && !logoFailed);
  const subtitle = prominent ? card.subtitle : card.compactSubtitle ?? card.subtitle;
  const detail = prominent ? card.detail : card.compactDetail ?? card.detail;

  return (
    <article className={`decision-system-card decision-system-card-${card.tone} ${active ? "decision-system-card-active" : ""} ${complete ? "decision-system-card-complete" : ""}`}>
      <div className="decision-system-topline">
        <span className="decision-system-logo-frame">
          {showLogo ? (
            <img alt="" className="decision-system-logo-img" onError={() => setLogoFailed(true)} src={card.logoSrc} />
          ) : card.mark ? (
            <span className="decision-system-mark">{card.mark}</span>
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0">
          <h3>{card.title}</h3>
          {prominent ? <p className="decision-system-role">{card.role}</p> : null}
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="decision-system-detail">
        <span className="decision-system-dot" />
        <span>{detail}</span>
      </div>
    </article>
  );
}

const decisionSystemCardData: DecisionSystemCardView[] = [
  {
    compactSubtitle: "Creates the implementation plan.",
    detail: "Hermes proposes · ScaleX governs",
    fallbackIcon: BrainCircuit,
    id: "hermes",
    logoSrc: "/brand/connections/hermes_agent_nous_square_white.png",
    role: "Planner / Operator Brain",
    subtitle: "Creates the implementation plan",
    title: "Hermes Planning",
    tone: "blue",
  },
  {
    compactDetail: "livemode=false · no live money",
    compactSubtitle: "Verifies sandbox finance state.",
    detail: "Sandbox/test · livemode=false · no live money",
    fallbackIcon: CreditCard,
    id: "stripe",
    logoSrc: "/brand/connections/stripe_square_s_mark.png",
    role: "Finance State",
    subtitle: "Prepares invoice and payment-state check",
    title: "Stripe Finance",
    tone: "purple",
  },
  {
    compactDetail: "Local policy active",
    compactSubtitle: "Checks vendor, margin, and tool risk.",
    detail: "Local policy active · NemoClaw boundary visible",
    fallbackIcon: ShieldCheck,
    id: "policy",
    logoSrc: "/brand/connections/nvidia_square_mark.png",
    role: "Guardrail Runtime",
    subtitle: "Checks vendor, margin, and tool risk",
    title: "NemoClaw / NeMo Policy",
    tone: "cyan",
  },
  {
    compactDetail: "Evidence ledger active",
    compactSubtitle: "Records audit evidence and protected margin.",
    detail: "Evidence ledger ready · profit outcome pending",
    fallbackIcon: Database,
    id: "scalex",
    logoSrc: "/brand/connections/sx_logo.png",
    mark: "SX",
    role: "Execution Control",
    subtitle: "Blocks unsafe action and records audit",
    title: "ScaleX Control Plane",
    tone: "brand",
  },
];

function decisionSystemForFocus(focusId: string, runVisualState: RunVisualState): DecisionSystemId | null {
  if (runVisualState === "complete") {
    return "scalex";
  }
  if (focusId === "hermes") {
    return "hermes";
  }
  if (focusId === "stripe-invoice" || focusId === "stripe-status") {
    return "stripe";
  }
  if (focusId === "policy" || focusId === "approved-spend" || focusId === "blocked-spend") {
    return "policy";
  }
  if (focusId === "evidence" || focusId === "profit") {
    return "scalex";
  }
  return null;
}

function EnterpriseControlPanel({ model, runVisualState }: { model: ControlRoomModel; runVisualState: RunVisualState }) {
  return (
    <div className="enterprise-control-stack">
      <BusinessCostBasisCard model={model} runVisualState={runVisualState} />
      <ToolActionRailCard model={model} runVisualState={runVisualState} />
      <StripeFinanceFlowCard model={model} runVisualState={runVisualState} />
      <NemoGuardrailLayerCard model={model} />
    </div>
  );
}

function BusinessCostBasisCard({ model, runVisualState }: { model: ControlRoomModel; runVisualState: RunVisualState }) {
  const clientSource = model.state?.command_center?.client_onboarding?.saved_record?.source ?? "manual_entry";
  const reviewEditable = model.state?.command_center?.client_onboarding?.extracted_review?.editable_before_save ?? true;
  const complete = runVisualState === "complete";
  const costBasisRows = complete
    ? model.costBasisRows
    : model.costBasisRows.map((item) => ({
      ...item,
      status: item.id === "labor_cost" ? "Loaded" : "Prepared",
      tone: item.id === "labor_cost" ? "blue" as Tone : "muted" as Tone,
    }));
  return (
    <article className="enterprise-card">
      <div className="enterprise-card-head">
        <div>
          <p className="enterprise-eyebrow">Cost Basis / Delivery Cost Stack</p>
          <h2>{complete ? "Approved delivery costs" : "Planned delivery cost basis"}</h2>
        </div>
        <StatusBadge label={complete ? "approved" : "prepared"} tone={complete ? "green" : "amber"} />
      </div>
      <dl className="enterprise-fact-grid">
        <FactRow label={complete ? "Total approved costs" : "Planned cost basis"} value={model.approvedCostsLabel} tone={complete ? "green" : "amber"} />
        <FactRow label="Profit outcome" value={complete ? model.protectedProfitLabel : "Pending"} tone={complete ? "green" : "muted"} />
        <FactRow label="Margin outcome" value={complete ? model.marginLabel : "Pending"} tone={complete ? "green" : "muted"} />
        <FactRow label="Margin floor" value={model.marginFloorLabel} tone="amber" />
      </dl>
      <table className="cost-basis-table cost-basis-table-enterprise" aria-label={complete ? "Approved delivery cost basis" : "Planned delivery cost basis"}>
        <colgroup>
          <col className="cost-basis-col-item" />
          <col className="cost-basis-col-amount" />
          <col className="cost-basis-col-percent" />
          <col className="cost-basis-col-status" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Cost item</th>
            <th className="numeric-cell" scope="col">Amount</th>
            <th className="numeric-cell" scope="col">% revenue</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {costBasisRows.map((item) => (
            <tr key={item.id}>
              <td className="cost-item-cell">{item.itemLabel}</td>
              <td className="numeric-cell">{item.amountLabel}</td>
              <td className="numeric-cell">{item.percentLabel}</td>
              <td><span className={`cost-status cost-status-${item.tone}`}>{item.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="enterprise-note">{complete ? "Protected profit is calculated after approved delivery costs, not just labor." : "Cost basis is prepared before the governed run reports profit."}</p>
      <details className="enterprise-details">
        <summary>
          <span>View Labor Job Costing</span>
          <span>Job costing only · not payroll</span>
        </summary>
        <dl className="enterprise-fact-grid">
          <FactRow label="Source" value={clientSource.includes("manual") ? "manual + document" : clientSource} tone="white" />
          <FactRow label="Editable" value={reviewEditable ? "yes" : "locked"} tone={reviewEditable ? "green" : "amber"} />
          <FactRow label="Workers" value={`${model.laborWorkers.length} workers`} tone="white" />
          <FactRow label="Labor cost" value={model.laborCostLabel} tone="green" />
        </dl>
        <table className="cost-basis-table labor-cost-table" aria-label="Labor job costing">
          <thead>
            <tr>
              <th scope="col">Worker</th>
              <th scope="col">Role</th>
              <th className="numeric-cell" scope="col">Loaded rate</th>
              <th className="numeric-cell" scope="col">Hours</th>
              <th className="numeric-cell" scope="col">Cost</th>
            </tr>
          </thead>
          <tbody>
            {model.laborWorkers.map((worker) => (
              <tr key={worker.worker}>
                <td>{worker.worker}</td>
                <td>{worker.role}</td>
                <td className="numeric-cell">{worker.rate}</td>
                <td className="numeric-cell">{worker.hours}</td>
                <td className="numeric-cell">{worker.cost}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={4} scope="row">Loaded labor total{" "}</th>
              <td className="numeric-cell">{model.laborCostLabel}</td>
            </tr>
          </tfoot>
        </table>
      </details>
    </article>
  );
}

function ToolActionRailCard({ model, runVisualState }: { model: ControlRoomModel; runVisualState: RunVisualState }) {
  const toolActionGroups = toolActionGroupsForRunState(model, runVisualState);

  return (
    <article className="enterprise-card">
      <div className="enterprise-card-head">
        <div>
          <p className="enterprise-eyebrow">ScaleX tool action rail / MCP-ready skill path</p>
          <h2>Governed tool sequence</h2>
        </div>
        <StatusBadge label="not real MCP" tone="amber" />
      </div>
      <div className="tool-action-groups">
        {toolActionGroups.map((group) => (
          <div className="tool-action-group" key={group.title}>
            <p>{group.title}</p>
            <div>
              {group.actions.map((action) => (
                <div className="tool-action-row" key={action.name}>
                  <span>{action.name}</span>
                  <StatusBadge label={action.status} tone={action.tone} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="enterprise-note">Hermes proposes tool calls; ScaleX governs, routes, blocks, and records.</p>
    </article>
  );
}

function StripeFinanceFlowCard({ model, runVisualState }: { model: ControlRoomModel; runVisualState: RunVisualState }) {
  const hasCompletedRun = runVisualState === "complete";
  const invoiceId = hasCompletedRun ? model.state?.stripe?.invoice_id ?? "test-double/local finance state" : "pending governed run";
  const stripeFlowSteps = stripeFlowStepsForRunState(model, runVisualState);
  return (
    <article className="enterprise-card">
      <div className="enterprise-card-head">
        <div>
          <p className="enterprise-eyebrow">Stripe Finance Flow</p>
          <h2>Invoice and payment state</h2>
        </div>
        <StatusBadge label={model.state?.stripe?.used_real_stripe ? "test mode" : "demo/test-double"} tone="purple" />
      </div>
      <ol className="finance-flow-list">
        {stripeFlowSteps.map((step, index) => (
          <li key={step.label}>
            <span className="finance-flow-index">{index + 1}</span>
            <div>
              <p>{step.label}</p>
              <span>{step.detail}</span>
            </div>
            <StatusBadge label={step.status} tone={step.tone} />
          </li>
        ))}
      </ol>
      <p className="enterprise-note">Invoice: {invoiceId}. Invoice exists/open only when backend says so; paid=true is never claimed unless returned by Stripe state.</p>
    </article>
  );
}

function NemoGuardrailLayerCard({ model }: { model: ControlRoomModel }) {
  const guardrails = model.state?.guardrails;
  const hermesRuntime = model.state?.execution?.hermes_runtime ?? "isolated_cli";
  const usedRealNemo = Boolean(guardrails?.used_real_nemo ?? model.state?.execution?.used_real_nemo);
  const checks = [
    "live money attempt",
    "PHI/client sensitive data",
    "vendor allowlist",
    "margin floor",
    "payment-state honesty",
    "tool/action policy",
    "output claims",
  ];
  return (
    <article className="enterprise-card">
      <div className="enterprise-card-head">
        <div>
          <p className="enterprise-eyebrow">NemoClaw / NeMo Guardrail Layer</p>
          <h2>{usedRealNemo ? "NeMo runtime verified" : "Boundary visible; local policy active"}</h2>
        </div>
        <StatusBadge label={usedRealNemo ? "real NeMo" : "local policy"} tone={usedRealNemo ? "green" : "amber"} />
      </div>
      <dl className="enterprise-fact-grid">
        <FactRow label="Guardrail mode" value={guardrails?.mode ?? "local_policy"} tone="cyan" />
        <FactRow label="used_real_nemo" value={String(usedRealNemo)} tone={usedRealNemo ? "green" : "amber"} />
        <FactRow label="NemoClaw route" value={hermesRuntime} tone="white" />
        <FactRow label="Fail closed" value={String(Boolean(guardrails?.fail_closed))} tone={guardrails?.fail_closed ? "red" : "green"} />
      </dl>
      <div className="guardrail-checks">
        {checks.map((check) => <span key={check}>{check}</span>)}
      </div>
      <p className="enterprise-note">NemoHermes API runtime is available only when configured; local policy remains deterministic fallback. Docker/NemoClaw commands are not invoked in demo.</p>
    </article>
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
  const operationFacts = operationFactsForRunState(model, runVisualState);
  const drawerMetrics = displayMetricsForRunState(model, runVisualState);

  return (
    <section className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4">
      <div className="grid min-h-0 grid-cols-[220px_minmax(0,1fr)_260px] gap-4">
        <Panel title="Operation Details" eyebrow="Northstar run">
          <dl className="grid gap-2 text-sm">
            {operationFacts.map((fact) => (
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
              const proof = railProofForRunState(rail, runVisualState, active, complete);
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
                      <p className="truncate text-sm font-semibold text-[#FFFFFF]">{rail.name}</p>
                      <p className="truncate text-xs text-[#A1A1AA]">{rail.subline}</p>
                    </div>
                    <StatusBadge label={result.label} tone={result.tone} />
                  </div>
                  {expanded ? (
                    <div className="mt-2 rounded-md border border-[#232834] bg-[#0a0b0e] p-3 text-xs leading-5 text-[#A1A1AA]">
                      <p className="font-semibold text-[#FFFFFF]">{proof.evidence}</p>
                      <p className="mt-1">{proof.detail}</p>
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
                {drawerMetrics.slice(0, 5).map((metric) => (
                  <FactRow key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
                ))}
              </dl>
            ) : null}
            {drawerTab === "operation" ? (
              <div className="space-y-3 text-sm leading-6 text-[#A1A1AA]">
                <p className="font-semibold text-[#FFFFFF]">{model.clientName}</p>
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
      <RailActivityTimeline activeRailId={activeRailId} completedRailIds={completedRailIds} runVisualState={runVisualState} />
    </section>
  );
}

function EvidenceLedgerView({ model, runVisualState }: { model: ControlRoomModel; runVisualState: RunVisualState }) {
  const hasCompletedRun = runVisualState === "complete";
  const auditPills = auditPillsForRunState(model, runVisualState);
  const auditRows = hasCompletedRun ? model.auditRowsData : [];

  return (
    <section className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_240px] gap-4">
      <Panel
        title="Enterprise Audit Ledger"
        eyebrow="actor · action · evidence · safety"
        action={<div className="flex flex-wrap gap-2">{auditPills.map((pill) => <StatusBadge key={pill.label} label={`${pill.label}: ${pill.value}`} tone={pill.tone ?? "muted"} />)}</div>}
      >
        <div className="h-[calc(100vh-174px)] overflow-auto rounded-md border border-[#232834]">
          {hasCompletedRun ? (
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 bg-[#0d0e12] text-left text-xs uppercase text-[#A1A1AA]">
              <tr>
                {["Order", "Actor", "Action", "Evidence Type", "Safety Note", "Status"].map((header) => (
                  <th className="border-b border-[#232834] px-3 py-3 font-semibold" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditRows.map((row, index) => (
                <tr
                  className={`ledger-row-enter bg-[#111318] ${row.order === "005" ? "ledger-row-blocked border-l-4 border-[#ef4444]" : ""} ${row.order === "010" ? "ledger-row-profit" : ""}`}
                  key={row.order}
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <td className={`border-b border-[#232834] px-3 py-3 font-mono text-xs ${row.order === "005" ? "border-l-4 border-l-[#ef4444]" : ""}`}>{row.order}</td>
                  <td className="border-b border-[#232834] px-3 py-3 font-semibold text-[#FFFFFF]">{row.actor}</td>
                  <td className="border-b border-[#232834] px-3 py-3 text-[#A1A1AA]">{row.action}</td>
                  <td className="border-b border-[#232834] px-3 py-3 font-mono text-xs text-[#A1A1AA]">{row.evidenceType}</td>
                  <td className="border-b border-[#232834] px-3 py-3 text-[#A1A1AA]">{row.safetyNote}</td>
                  <td className="border-b border-[#232834] px-3 py-3"><StatusBadge label={row.status} tone={row.tone} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
            <div className="flex h-full min-h-[22rem] flex-col justify-center bg-[#111318] p-8">
              <p className="text-xs font-semibold uppercase text-[#fcba03]">No audit evidence recorded yet</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Start the governed run to create the audit trail.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A1A1AA]">
                Planning, finance state, guardrail decisions, blocked risk, and protected profit outcome remain pending until ScaleX executes the run.
              </p>
              <div className="mt-5 grid max-w-3xl grid-cols-2 gap-2">
                {["Hermes plan pending", "Stripe finance state pending", "NemoClaw/local policy decision pending", "Blocked risk pending", "Profit outcome pending"].map((item) => (
                  <div className="rounded-md border border-[#232834] bg-[#0a0b0e] px-3 py-2 text-sm font-semibold text-[#A1A1AA]" key={item}>{item}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Panel>
      <Panel title="Audit Safety" eyebrow="demo boundaries">
        <div className="grid gap-3">
          {model.safetyProof.map((proof) => (
            <div className="flex items-start gap-2 text-sm text-[#FFFFFF]" key={proof}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#10B981]" />
              <span>{proof}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-[#A1A1AA]">Control Artifacts</p>
          <ProofArtifactGrid
            activeRailId={null}
            compact
            completedRailIds={runVisualState === "complete" ? model.rails.map((rail) => rail.id) : []}
            evidenceRevealStep={runVisualState === "complete" ? model.rails.length : 0}
            model={model}
            runVisualState={runVisualState}
          />
        </div>
        <div className="mt-5 rounded-md border border-[#10B981]/30 bg-[#10B981]/10 p-3">
          <p className="text-xs font-semibold uppercase text-[#10B981]">Profit Outcome</p>
          <p className="mt-2 text-3xl font-semibold text-white">{hasCompletedRun ? model.protectedProfitLabel : "Pending"}</p>
          <p className="mt-1 text-sm text-[#A1A1AA]">{hasCompletedRun ? `${model.marginLabel} protected margin` : "Protected margin reports after run"}</p>
        </div>
      </Panel>
    </section>
  );
}

function ConnectionHubView({ model, runVisualState }: { model: ControlRoomModel; runVisualState: RunVisualState }) {
  const connectionCards = connectionCardsForRunState(model, runVisualState);
  const prototypeFacts = prototypeFactsForRunState(model, runVisualState);

  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-4">
      <div className="flex items-center justify-between rounded-md border border-[#232834] bg-[#111318] p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-[#fcba03]">Connection Hub</p>
          <h1 className="text-2xl font-semibold text-white">Allowed Systems & Truth Boundaries</h1>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {[
            { label: "Governed demo mode", tone: "brand" as Tone },
            { label: model.hermesLabel, tone: "blue" as Tone },
            { label: model.stripeLabel, tone: "purple" as Tone },
            { label: model.guardrailLabel, tone: "cyan" as Tone },
          ].map((item) => (
            <StatusBadge key={item.label} label={item.label} tone={item.tone} />
          ))}
        </div>
      </div>
      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_320px] gap-4">
        <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-4">
        {connectionCards.map((card) => (
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
                <p className="mt-2 text-xs leading-5 text-[#A1A1AA]">{mode.detail}</p>
              </article>
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            {prototypeFacts.map((fact) => (
              <FactRow key={fact.label} label={fact.label} value={fact.value} tone={fact.tone} />
            ))}
          </dl>
          <div className="mt-4 rounded-md border border-[#232834] bg-[#0a0b0e] p-3">
            <p className="text-xs font-semibold uppercase text-[#06B6D4]">NemoClaw / NeMo Guardrails</p>
            <p className="mt-2 text-xs leading-5 text-[#A1A1AA]">
              NeMo Guardrails is shown only when runtime verification passes. NemoClaw /
              NemoHermes planning is optional routing and remains explicit in runtime status.
            </p>
          </div>
        </Panel>
      </div>
      <div className="rounded-md border border-[#232834] bg-[#111318] p-4">
        <p className="text-xs font-semibold uppercase text-[#A1A1AA]">Full Proof Capable</p>
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
  runVisualState,
  state,
}: {
  auth: AuthStatus | null;
  health: HealthResponse | null;
  model: ControlRoomModel;
  runVisualState: RunVisualState;
  state: DemoState | null;
}) {
  const hasCompletedRun = runVisualState === "complete";
  const economicsValue = hasCompletedRun
    ? `${model.approvedCostsLabel} approved costs / ${model.protectedProfitLabel} profit / ${model.marginLabel} margin`
    : `${model.approvedCostsLabel} planned cost basis / profit Pending / margin Pending`;
  const blockedRiskValue = hasCompletedRun
    ? `${model.blockedRiskLabel} blocked / ${model.marginIfBlockedApprovedLabel} margin if approved`
    : "Blocked risk Pending / margin impact Pending";
  const recordsValue = `${state?.runs?.length ?? 0} runs / ${hasCompletedRun ? model.auditRows : 0} evidence rows`;
  const rows = [
    ["Prototype auth", auth?.auth_enabled ? auth.authenticated ? `Signed in as ${auth.username ?? "operator"}` : "Enabled" : "Disabled for local judge demo", "Local prototype auth only; not production identity."],
    ["Execution mode", state?.execution?.label ?? "Judge Demo Mode", state?.execution?.truthfulness_note ?? "Demo mode and Full Proof Mode stay explicitly labeled."],
    ["Judge Demo Mode", model.modeCards[0]?.status ?? "Judge Demo active", model.modeCards[0]?.detail ?? "Deterministic local path."],
    ["Stripe Sandbox Prototype", model.modeCards[1]?.status ?? "Prototype ready", model.modeCards[1]?.detail ?? "Real test-mode only when configured safely."],
    ["Verified Live Mode", model.modeCards[2]?.status ?? "Verified Live locked", model.modeCards[2]?.detail ?? "Future live-money path, not enabled."],
    ["MCP-ready tool path", "ScaleX tool action rail / skill path", "No real MCP server execution is claimed in the current app."],
    ["Runtime", `${health?.mode ?? state?.mode ?? "local"} / ${state?.execution?.hermes_runtime ?? "isolated_cli"}`, "Local API and SQLite-backed product workspace."],
    ["Active operation", `${model.clientName} / ${model.operationName}`, "Synthetic Northstar B2B implementation operation only."],
    ["Protected economics", economicsValue, "Protected profit is revenue minus approved delivery costs."],
    ["Blocked risk impact", blockedRiskValue, "Risky vendor spend remains blocked before execution."],
    ["Data", "Synthetic sample", "No patient data, no PHI, no healthcare compliance or HIPAA claim."],
    ["Stripe test mode only", model.stripeLabel, "Judge Demo uses deterministic/test-double finance; real Stripe test objects only when safely configured."],
    ["Money movement", `livemode=${String(Boolean(state?.stripe?.livemode))}`, "No live-money support; future live execution requires Verified Live Mode."],
    ["NemoClaw / NeMo truth", `${state?.guardrails?.mode ?? "local_policy"} / used_real_nemo=${String(Boolean(state?.guardrails?.used_real_nemo))}`, state?.guardrails?.truthfulness_note ?? "Local policy active now; real NeMo requires runtime proof."],
    ["NemoClaw commands", "not invoked", "No Docker, NemoClaw, or production sandbox commands are run by this demo."],
    ["Production Hermes", "not used", "Optional NemoHermes/Hermes runtime routing is configuration-gated and fail-closed."],
    ["Secrets", "not displayed", "No tokens, .env values, credential headers, or live keys are shown or stored in UI state."],
    ["Records", recordsValue, "SQLite evidence is local; no production customer workflow claim."],
  ];

  return (
    <section className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_320px] gap-4">
      <Panel title="Boundaries & Runtime" eyebrow="confidence view">
        <div className="overflow-hidden rounded-md border border-[#232834]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#0d0e12] text-left text-xs uppercase text-[#A1A1AA]">
              <tr>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Current value</th>
                <th className="px-4 py-3">Boundary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([area, value, boundary]) => (
                <tr className="border-t border-[#232834] bg-[#111318]" key={area}>
                  <td className="px-4 py-4 font-semibold text-white">{area}</td>
                  <td className="px-4 py-4 text-[#FFFFFF]">{value}</td>
                  <td className="px-4 py-4 text-[#A1A1AA]">{boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Supporting Modules" eyebrow="kept behind story">
        <div className="grid gap-3">
          {model.supportingModules.map((module) => (
            <article className="rounded-md border border-[#232834] bg-[#0a0b0e] p-3" key={module.title}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">{module.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[#A1A1AA]">{module.description}</p>
                </div>
                <StatusBadge label={module.status} tone={module.tone} />
              </div>
              <p className="mt-3 rounded-md border border-[#232834] bg-[#111318] px-3 py-2 text-xs font-semibold text-[#FFFFFF]">
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
  compact = false,
  completedRailIds,
  metrics,
  runActive,
  runVisualState,
}: {
  activeRailId: string | null;
  blockedFlash: boolean;
  blockedRiskDisplayValue: string;
  compact?: boolean;
  completedRailIds: string[];
  metrics: StatPill[];
  runActive: boolean;
  runVisualState: RunVisualState;
}) {
  const approvedActive = runVisualState === "complete" && (activeRailId === "approved-spend" || completedRailIds.includes("approved-spend"));
  const blockedActive = activeRailId === "blocked-spend" || completedRailIds.includes("blocked-spend") || blockedFlash;
  const profitActive = activeRailId === "profit" || completedRailIds.includes("profit") || runVisualState === "complete";

  return (
    <div className={`metric-strip-grid ${compact ? "metric-strip-grid-compact" : ""}`}>
      {metrics.map((metric) => {
        const isApprovedMetric = metric.label === "Approved costs";
        const isRiskMetric = metric.label === "Risk contained";
        const isProfitMetric = metric.label === "Protected profit";
        const displayLabel = isRiskMetric && runActive && !blockedActive ? "Risk pending" : metric.label;
        const defaultSublabel = metric.label === "Revenue secured"
          ? "client revenue context loaded"
          : isApprovedMetric
            ? "approved delivery cost basis"
            : isRiskMetric
              ? "unsafe vendor exposure contained"
              : metric.label === "Protected margin"
                ? "margin floor preserved"
                : isProfitMetric
                  ? "revenue minus approved delivery costs"
                  : null;
        const sublabel = isRiskMetric && runActive && blockedActive
          ? "unsafe vendor exposure contained"
          : metric.sublabel ?? defaultSublabel;
        return (
          <article
            className={`metric-card ${isApprovedMetric && approvedActive ? "metric-glow-green" : ""} ${isRiskMetric && blockedActive ? "metric-flash-red" : ""} ${isProfitMetric ? "metric-hero" : ""} ${isProfitMetric && profitActive ? "metric-glow-green" : ""}`}
            key={metric.label}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]">{displayLabel}</p>
            <p className={`mt-2 font-semibold tabular-nums ${metricClass(metric.tone)} ${isProfitMetric ? "text-4xl" : isRiskMetric ? "text-3xl" : "text-2xl"}`}>
              {isRiskMetric && runActive ? blockedRiskDisplayValue : metric.value}
            </p>
            {sublabel ? <p className={`mt-2 text-xs font-semibold ${metricSublabelClass(metric.tone)}`}>{sublabel}</p> : null}
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
  hideSecondary = false,
  model,
  runningCompact = false,
}: {
  activeRailId: string | null;
  blockedFlash?: boolean;
  compact?: boolean;
  completedRailIds: string[];
  hideSecondary?: boolean;
  model: ControlRoomModel;
  runningCompact?: boolean;
}) {
  return (
    <ol className={`grid ${compact ? "rail-list-compact gap-1" : "gap-2"} ${runningCompact ? "rail-list-dashboard-running" : ""}`}>
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
              <p className="truncate text-sm font-semibold text-[#FFFFFF]">{rail.name}</p>
              {hideSecondary ? null : !compact ? <p className="truncate text-xs text-[#A1A1AA]">{rail.evidence}</p> : <p className="truncate text-[0.68rem] text-[#A1A1AA]">{rail.subline}</p>}
            </div>
            {!compact ? <span className="hidden rounded border border-[#232834] px-2 py-1 text-[0.64rem] font-semibold uppercase text-[#A1A1AA] xl:inline">{rail.proofTag}</span> : null}
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
      return activeRailId === "hermes";
    }
    if (node === "stripe") {
      return activeRailId === "stripe-invoice" || activeRailId === "stripe-status";
    }
    if (node === "nemo") {
      return activeRailId === "policy" || activeRailId === "blocked-spend" || activeRailId === "approved-spend";
    }
    return activeRailId === "input" || activeRailId === "cost-basis" || activeRailId === "evidence" || activeRailId === "profit" || activeRailId === "blocked-spend";
  };
  const hasCompleted = (ids: string[]) => ids.some((id) => completedRailIds.includes(id));
  return (
    <div className="mb-3 grid grid-cols-4 gap-2">
      {[
        { id: "hermes" as const, label: "Hermes", value: hasCompleted(["hermes"]) ? "plan created" : "plans", tone: "blue" as Tone },
        { id: "stripe" as const, label: "Stripe", value: hasCompleted(["stripe-status"]) ? "state checked" : model.state?.stripe?.used_real_stripe ? "test finance" : "sandbox finance", tone: "purple" as Tone },
        { id: "nemo" as const, label: "NeMo / Policy", value: model.state?.guardrails?.used_real_nemo ? "verified" : "risk gate", tone: "cyan" as Tone },
        { id: "scalex" as const, label: "ScaleX", value: hasCompleted(["evidence", "profit"]) ? "audit recorded" : "records", tone: "brand" as Tone },
      ].map((item, index) => (
        <div className={`stack-node ${isNodeActive(item.id) ? `stack-node-active stack-node-active-${item.tone}` : ""}`} key={item.label}>
          {isNodeActive(item.id) ? <span className="stack-active-dot" aria-hidden="true" /> : null}
          <StatusBadge label={item.label} tone={item.tone} />
          <p className="mt-1 text-[0.68rem] font-semibold text-[#FFFFFF]">{item.value}</p>
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
          <p className="truncate text-[0.62rem] font-semibold uppercase text-[#A1A1AA]">{mode.title}</p>
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
        const detail = proofArtifactDetailForRunState(artifact, queued);
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
                <p className="truncate text-[0.62rem] font-semibold uppercase text-[#52525B]">{artifact.system}</p>
              </div>
            </div>
            <StatusBadge label={statusLabel} tone={statusTone} />
          </div>
          <p className="mt-2 text-xs leading-5 text-[#A1A1AA]">{detail}</p>
          <p className="mt-2 truncate font-mono text-[0.66rem] text-[#52525B]">{artifact.meta}</p>
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
  runVisualState,
}: {
  activeRailId: string | null;
  compact?: boolean;
  completedRailIds: string[];
  runVisualState: RunVisualState;
}) {
  const isComplete = (railId: string) => completedRailIds.includes(railId) || runVisualState === "complete";
  const signals = [
    { label: "Intake loaded", railId: "input", tone: "green" as Tone },
    { label: "Finance verified", railId: "stripe-status", tone: "purple" as Tone },
    { label: "Guardrails checked", railId: "policy", tone: "cyan" as Tone },
    { label: "Risk contained", railId: "blocked-spend", tone: "red" as Tone },
    { label: "Profit protected", railId: "profit", tone: "green" as Tone },
  ];
  return (
    <div className={`rounded-md border border-[#232834] bg-[#111318] ${compact ? "p-2.5" : "p-3"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-[#fcba03]">Run Signals</p>
        <StatusBadge label={runVisualState === "running" ? "live governance trace" : "API-backed"} tone={runVisualState === "running" ? "blue" : "brand"} />
      </div>
      <div className="run-signal-summary-grid mt-2">
        {signals.map((signal) => {
          const revealed = isComplete(signal.railId);
          const active = activeRailId === signal.railId;
          return (
          <span className={`activity-chip activity-chip-${signal.tone} ${revealed ? "activity-chip-revealed" : active ? "activity-chip-live" : "activity-chip-queued"}`} key={signal.label}>
            {signal.label} <span className="text-[#A1A1AA]">{revealed ? "done" : active ? "running" : "ready"}</span>
          </span>
          );
        })}
      </div>
    </div>
  );
}

function ConnectorCard({ card }: { card: ConnectorCardModel }) {
  const Icon = card.icon;
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(card.logoSrc && !logoFailed);
  return (
    <article className="rounded-md border border-[#232834] bg-[#111318] p-4 transition hover:border-[#343A46]">
      <div className="flex items-start gap-3">
        <span className="connector-logo-frame">
          {showLogo ? (
            <img alt="" className="connector-logo-img" onError={() => setLogoFailed(true)} src={card.logoSrc} />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">{card.title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#A1A1AA]">{card.description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {card.badges.map((badge) => <StatusBadge key={badge.label} label={badge.label} tone={badge.tone} />)}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {card.facts.map((fact) => <FactRow key={fact.label} label={fact.label} value={fact.value} tone={fact.tone} />)}
      </dl>
      <p className="mt-4 border-t border-[#232834] pt-3 text-xs leading-5 text-[#A1A1AA]">{card.boundary}</p>
    </article>
  );
}

function Panel({ action, children, compact = false, eyebrow, title }: { action?: ReactNode; children: ReactNode; compact?: boolean; eyebrow: string; title: string }) {
  return (
    <section className={`panel-shell ${compact ? "panel-shell-compact" : ""}`}>
      <div className="panel-head">
        <div className="min-w-0">
          <p className="truncate text-[0.64rem] font-semibold uppercase tracking-wide text-[#fcba03]">{eyebrow}</p>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>
        {action}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function SegmentedTabs({ active, items, onChange }: { active: string; items: Array<{ id: string; label: string }>; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 rounded-md border border-[#232834] bg-[#0D0E12] p-1">
      {items.map((item) => (
        <button
          className={`rounded px-2 py-2 text-xs font-semibold transition ${active === item.id ? "bg-[#fcba03] text-[#050505]" : "text-[#A1A1AA] hover:bg-[#111318] hover:text-white"}`}
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
    <div className="rounded-md border border-[#232834] bg-[#0a0b0e] p-2">
      <dt className="text-[0.64rem] font-semibold uppercase tracking-wide text-[#52525B]">{label}</dt>
      <dd className={`mt-1 truncate text-sm font-semibold ${metricClass(tone)}`}>{value}</dd>
    </div>
  );
}

function StatusBadge({ label, tone = "muted" }: { label: string; tone?: Tone }) {
  return (
    <span className={`status-badge inline-flex max-w-full items-center rounded border px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-wide ${badgeClass(tone)}`}>
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

function railHoldMs(railId: string): number {
  if (railId === "input") {
    return INTAKE_RAIL_HOLD_MS;
  }
  if (railId === "cost-basis") {
    return COST_BASIS_RAIL_HOLD_MS;
  }
  if (railId === "stripe-invoice" || railId === "stripe-status") {
    return STRIPE_RAIL_HOLD_MS;
  }
  if (railId === "policy") {
    return POLICY_RAIL_HOLD_MS;
  }
  if (railId === "blocked-spend") {
    return BLOCKED_RAIL_HOLD_MS;
  }
  if (railId === "evidence") {
    return EVIDENCE_RAIL_HOLD_MS;
  }
  if (railId === "profit") {
    return PROFIT_RAIL_HOLD_MS;
  }
  if (railId === "hermes") {
    return HERMES_RAIL_HOLD_MS;
  }
  if (railId === "approved-spend") {
    return APPROVED_SPEND_RAIL_HOLD_MS;
  }
  return DEFAULT_RAIL_DELAY_MS;
}

function buildControlRoomModel(
  state: DemoState | null,
  money: MoneySnapshot,
  auditRows: number,
  displayCustomer: string,
  displayJob: string,
): ControlRoomModel {
  const mission = state?.command_center?.mission_control ?? null;
  const costBasis = state?.command_center?.cost_basis ?? null;
  const revenueCents = money.revenueCents ?? mission?.invoice_amount_cents ?? 850_000;
  const setupSpendCents = costBasis?.setup_tool_spend_cents ?? mission?.approved_vendor_spend_cents ?? 115_000;
  const approvedCostsCents = costBasis?.total_approved_costs_cents ?? mission?.total_approved_costs_cents ?? money.approvedSpendCents ?? 393_500;
  const blockedSpendCents = money.blockedSpendCents ?? mission?.blocked_spend_cents ?? 320_000;
  const laborCostCents = costBasis?.labor_cost_cents ?? state?.command_center?.labor_costing?.total_labor_cost_cents ?? mission?.labor_cost_cents ?? 95_000;
  const protectedProfitCents = costBasis?.protected_profit_cents ?? money.grossProfitCents ?? mission?.protected_profit_cents ?? mission?.projected_profit_cents ?? revenueCents - approvedCostsCents;
  const marginPercent = costBasis?.protected_margin_percent ?? money.marginPercent ?? mission?.protected_margin_percent ?? mission?.final_margin_after_labor_percent ?? (revenueCents > 0 ? protectedProfitCents / revenueCents * 100 : 0);
  const marginFloorPercent = money.marginFloorPercent ?? mission?.margin_floor_percent ?? 50;
  const marginIfBlockedApprovedPercent = costBasis?.margin_if_blocked_approved_percent ?? mission?.margin_if_blocked_approved_percent ?? 16.1;
  const profitIfBlockedApprovedCents = costBasis?.profit_if_blocked_approved_cents ?? mission?.profit_if_blocked_approved_cents ?? 136_500;
  const totalCostsIfBlockedApprovedCents = costBasis?.total_costs_if_blocked_approved_cents ?? 713_500;
  const costBasisLineItems = costBasis?.line_items ?? [
    { id: "setup_tool_spend", label: "Setup/tool spend", amount_cents: setupSpendCents, category: "vendor_setup", evidence_type: "policy_approved_setup_spend" },
    { id: "labor_cost", label: "Labor cost", amount_cents: laborCostCents, category: "job_costing", evidence_type: "loaded_labor_cost" },
    { id: "campaign_media_cost", label: "Campaign/media cost", amount_cents: 60_000, category: "delivery", evidence_type: "delivery_cost_assumption" },
    { id: "materials_delivery_cost", label: "Materials/delivery cost", amount_cents: 37_500, category: "delivery", evidence_type: "delivery_cost_assumption" },
    { id: "platform_processing_fees", label: "Platform/processing fees", amount_cents: 28_500, category: "platform", evidence_type: "fee_cost_assumption" },
    { id: "qa_compliance_overhead", label: "QA/compliance overhead", amount_cents: 35_000, category: "governance", evidence_type: "qa_cost_assumption" },
    { id: "contingency_reserve", label: "Contingency reserve", amount_cents: 22_500, category: "reserve", evidence_type: "reserve_cost_assumption" },
  ];
  const hasReport = Boolean(state?.report || state?.command_center?.final_profit_report);
  const policyChecks = state?.policy_checks ?? [];
  const guardrailEvaluations = state?.guardrail_evaluations ?? [];
  const events = state?.timeline_events ?? state?.events ?? [];
  const hermesLabel = state?.execution?.planning_label ?? (state?.hermes?.used_real_hermes ? "Runtime Hermes plan" : "Deterministic Hermes plan");
  const stripeLabel = state?.execution?.finance_label ?? (state?.stripe?.used_real_stripe ? "Real Stripe test finance" : "Stripe sandbox finance");
  const guardrailLabel = state?.execution?.guardrail_label ?? (state?.guardrails?.used_real_nemo ? "NeMo Guardrails verified" : "Local policy active");
  const rails = buildRails({ approvedCostsCents, blockedSpendCents, guardrailLabel, hasReport, laborCostCents, marginIfBlockedApprovedPercent, marginFloorPercent, marginPercent, protectedProfitCents, revenueCents, setupSpendCents, stripeLabel });
  const auditRowsData = buildAuditRows({ approvedCostsCents, blockedSpendCents, guardrailLabel, laborCostCents, marginIfBlockedApprovedPercent, protectedProfitCents, setupSpendCents, state });
  const modeCards = buildModeCards(state);
  const proofArtifacts = buildProofArtifacts({ approvedCostsCents, blockedSpendCents, guardrailLabel, laborCostCents, protectedProfitCents, state, stripeLabel });
  const primaryMode = modeCards.find((mode) => mode.primary) ?? modeCards[0];
  const costBasisRows = buildCostBasisRows(costBasisLineItems, revenueCents);
  const laborWorkers = buildLaborWorkers(state);

  return {
    activityChips: buildActivityChips({ blockedSpendCents, protectedProfitCents, setupSpendCents }),
    auditPills: [
      { label: "Timeline", value: String(events.length || 14), tone: "muted" },
      { label: "Finance", value: String(state?.stripe_events?.length || 4), tone: "blue" },
      { label: "Guardrails", value: String(guardrailEvaluations.length || 13), tone: "green" },
      { label: "Ledger", value: String(state?.ledger?.entries?.length || 4), tone: "green" },
      { label: "Hermes", value: String(state?.orchestration_calls?.length || 19), tone: "purple" },
      { label: "Profit", value: String(state?.reports?.length || 1), tone: "green" },
    ],
    auditRows,
    auditRowsData,
    blockedRiskLabel: formatCurrency(blockedSpendCents),
    blockedSpendCents,
    clientName: displayCustomer,
    connectionCards: buildConnectionCards(state, auditRows, guardrailLabel, hermesLabel, stripeLabel),
    costBasisRows,
    guardrailChecks: buildGuardrailChecks(policyChecks, guardrailEvaluations),
    guardrailLabel,
    hasReport,
    hermesLabel,
    hermesTasks: buildHermesTasks(state),
    laborCostLabel: formatCurrency(laborCostCents),
    laborWorkers,
    marginLabel: formatPercent(marginPercent),
    marginImpactLabel: `${formatCurrency(approvedCostsCents)} approved delivery cost basis included in protected profit`,
    approvedCostsLabel: formatCurrency(approvedCostsCents),
    approvedCostsCents,
    marginFloorLabel: formatPercent(marginFloorPercent),
    marginIfBlockedApprovedLabel: formatPercent(marginIfBlockedApprovedPercent),
    profitIfBlockedApprovedLabel: formatCurrency(profitIfBlockedApprovedCents),
    setupSpendLabel: formatCurrency(setupSpendCents),
    totalCostsIfBlockedApprovedLabel: formatCurrency(totalCostsIfBlockedApprovedCents),
    metrics: [
      { label: "Revenue secured", value: formatCurrency(revenueCents), tone: "white" },
      { label: "Approved costs", value: formatCurrency(approvedCostsCents), tone: "green" },
      { label: "Risk contained", value: formatCurrency(blockedSpendCents), tone: "red" },
      { label: "Protected profit", value: formatCurrency(protectedProfitCents), tone: "green" },
      { label: "Protected margin", value: formatPercent(marginPercent), tone: "green" },
    ],
    modeCards,
    operationFacts: [
      { label: "Client", value: displayCustomer },
      { label: "Operation", value: displayJob },
      { label: "Revenue", value: formatCurrency(revenueCents), tone: "white" },
      { label: "Approved costs", value: formatCurrency(approvedCostsCents), tone: "green" },
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
    stripeFlowSteps: buildStripeFlowSteps(state),
    supportingModules: buildSupportingModules(state, laborCostCents),
    toolActionGroups: buildToolActionGroups(state),
  };
}

interface ControlRoomModel {
  activityChips: ActivityChipModel[];
  approvedCostsCents: number;
  approvedCostsLabel: string;
  auditPills: StatPill[];
  auditRows: number;
  auditRowsData: AuditRowModel[];
  blockedRiskLabel: string;
  blockedSpendCents: number;
  clientName: string;
  connectionCards: ConnectorCardModel[];
  costBasisRows: CostBasisRowView[];
  guardrailChecks: Array<{ label: string; status: "Allow" | "Warn" | "Block" }>;
  guardrailLabel: string;
  hasReport: boolean;
  hermesLabel: string;
  hermesTasks: string[];
  laborCostLabel: string;
  laborWorkers: LaborWorkerView[];
  marginLabel: string;
  marginImpactLabel: string;
  marginFloorLabel: string;
  marginIfBlockedApprovedLabel: string;
  metrics: StatPill[];
  modeCards: ModeCardModel[];
  operationFacts: StatPill[];
  operationName: string;
  primaryModeTone: Tone;
  profitIfBlockedApprovedLabel: string;
  proofArtifacts: ProofArtifactModel[];
  protectedProfitLabel: string;
  rails: RailView[];
  safetyProof: string[];
  setupSpendLabel: string;
  state: DemoState | null;
  stripeLabel: string;
  stripeFlowSteps: FlowStepView[];
  supportingModules: Array<{ description: string; status: string; title: string; tone: Tone; value: string }>;
  totalCostsIfBlockedApprovedLabel: string;
  toolActionGroups: ToolActionGroupView[];
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
  logoSrc?: string;
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
  const executionMode = state?.execution?.mode ?? "demo";
  const usedRealStripe = Boolean(state?.stripe?.used_real_stripe ?? state?.execution?.used_real_stripe);
  const stripeHasError = Boolean(state?.stripe?.error);
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
      tone: executionMode === "demo" ? "brand" : "muted",
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

function buildLaborWorkers(state: DemoState | null): LaborWorkerView[] {
  const employees = state?.command_center?.labor_costing?.employees
    ?? state?.command_center?.employee_onboarding?.saved_records
    ?? [
      { employee_name: "Maria Lopez", role_title: "ClientOps Lead", fully_loaded_hourly_rate_cents: 7000, assigned_hours: 6, labor_cost_cents: 42000 },
      { employee_name: "James Carter", role_title: "Implementation Specialist", fully_loaded_hourly_rate_cents: 5500, assigned_hours: 6, labor_cost_cents: 33000 },
      { employee_name: "Avery Smith", role_title: "QA / Handoff Support", fully_loaded_hourly_rate_cents: 5000, assigned_hours: 4, labor_cost_cents: 20000 },
    ];

  return employees.slice(0, 3).map((employee) => {
    const skillCategory = "skill_category" in employee && typeof employee.skill_category === "string" ? employee.skill_category : "";
    return {
      cost: formatCurrency(employee.labor_cost_cents),
      hours: `${employee.assigned_hours}h`,
      rate: `${formatCurrency(employee.fully_loaded_hourly_rate_cents)}/hr`,
      role: laborRoleLabel(employee.role_title, skillCategory),
      worker: employee.role_title,
    };
  });
}

function buildCostBasisRows(items: CommandCenterCostBasisLineItem[], revenueCents: number): CostBasisRowView[] {
  return items.map((item) => {
    const metadata = costBasisMetadata(item);
    return {
      amountLabel: formatCurrency(item.amount_cents),
      id: item.id,
      itemLabel: metadata.label,
      percentLabel: formatPercent(revenueCents > 0 ? item.amount_cents / revenueCents * 100 : 0),
      status: metadata.status,
      tone: metadata.tone,
    };
  });
}

function costBasisMetadata(item: CommandCenterCostBasisLineItem): { label: string; status: string; tone: Tone } {
  switch (item.id) {
    case "setup_tool_spend":
      return { label: "Setup / tool spend", status: "Approved", tone: "green" };
    case "labor_cost":
      return { label: "Loaded labor", status: "Included", tone: "blue" };
    case "campaign_media_cost":
      return { label: "Campaign / media", status: "Approved", tone: "green" };
    case "materials_delivery_cost":
      return { label: "Materials / delivery", status: "Approved", tone: "green" };
    case "platform_processing_fees":
      return { label: "Platform / processing fees", status: "Recorded", tone: "brand" };
    case "qa_compliance_overhead":
      return { label: "QA / compliance overhead", status: "Included", tone: "blue" };
    case "contingency_reserve":
      return { label: "Contingency reserve", status: "Reserved", tone: "amber" };
    default:
      return { label: item.label, status: item.category === "reserve" ? "Reserved" : "Recorded", tone: item.category === "reserve" ? "amber" : "muted" };
  }
}

function laborRoleLabel(roleTitle: string, skillCategory: string): string {
  if (/lead/i.test(roleTitle)) {
    return "Lead";
  }
  if (/specialist/i.test(roleTitle)) {
    return "Specialist";
  }
  if (/qa|handoff/i.test(roleTitle)) {
    return "QA";
  }
  return skillCategory || "Delivery";
}

function buildToolActionGroups(state: DemoState | null): ToolActionGroupView[] {
  const usedRealStripe = Boolean(state?.stripe?.used_real_stripe ?? state?.execution?.used_real_stripe);
  const usedRealNemo = Boolean(state?.guardrails?.used_real_nemo ?? state?.execution?.used_real_nemo);
  const hasReport = Boolean(state?.report || state?.command_center?.final_profit_report);
  const planningStatus = state?.planning_run || state?.planning_runs?.length ? "Executed in demo" : "Proposed";
  const stripeStatus = usedRealStripe ? "Sandbox-ready" : "Executed in demo";
  const guardrailStatus = usedRealNemo ? "Allowed" : "Executed in demo";

  return [
    {
      title: "Client / Intake",
      actions: [
        { name: "intake.parse_client_document", status: "Allowed", tone: "green" },
        { name: "intake.review_client_record", status: "Executed in demo", tone: "green" },
        { name: "workforce.calculate_labor_cost", status: "Executed in demo", tone: "green" },
        { name: "cost_basis.calculate_delivery_costs", status: "Executed in demo", tone: "green" },
      ],
    },
    {
      title: "Hermes / Planning",
      actions: [
        { name: "hermes.plan_operation", status: planningStatus, tone: "blue" },
        { name: "hermes.propose_tool_sequence", status: planningStatus, tone: "blue" },
      ],
    },
    {
      title: "Stripe / Finance",
      actions: [
        { name: "stripe.create_customer", status: stripeStatus, tone: "purple" },
        { name: "stripe.create_invoice", status: stripeStatus, tone: "purple" },
        { name: "stripe.send_invoice", status: stripeStatus, tone: "purple" },
        { name: "stripe.retrieve_payment_status", status: state?.stripe?.paid ? "Verified" : "Recorded", tone: state?.stripe?.paid ? "green" : "amber" },
      ],
    },
    {
      title: "Policy / NemoClaw",
      actions: [
        { name: usedRealNemo ? "nemo.guardrail_check" : "nemoclaw.guardrail_check", status: guardrailStatus, tone: "cyan" },
        { name: "policy.check_vendor", status: "Allowed", tone: "green" },
        { name: "policy.check_margin_floor", status: "Allowed", tone: "green" },
        { name: "policy.block_unapproved_spend", status: "Blocked", tone: "red" },
      ],
    },
    {
      title: "Ledger",
      actions: [
        { name: "ledger.record_finance_event", status: hasReport ? "Recorded" : "Ready", tone: hasReport ? "green" : "muted" },
        { name: "ledger.record_policy_decision", status: hasReport ? "Recorded" : "Ready", tone: hasReport ? "green" : "muted" },
        { name: "ledger.record_profit_outcome", status: hasReport ? "Recorded" : "Ready", tone: hasReport ? "green" : "muted" },
      ],
    },
  ];
}

function buildStripeFlowSteps(state: DemoState | null): FlowStepView[] {
  const usedRealStripe = Boolean(state?.stripe?.used_real_stripe ?? state?.execution?.used_real_stripe);
  const livemode = Boolean(state?.stripe?.livemode);
  const paid = Boolean(state?.stripe?.paid);
  const financeMode = usedRealStripe ? "Sandbox-ready" : "Demo/test-double";

  return [
    { label: "Create customer", status: financeMode, tone: usedRealStripe ? "purple" : "amber", detail: usedRealStripe ? "Real Stripe test object when configured." : "Deterministic local customer state." },
    { label: "Create invoice", status: financeMode, tone: usedRealStripe ? "purple" : "amber", detail: state?.stripe?.invoice_id ?? "test-double/local invoice object" },
    { label: "Send invoice / payment link", status: usedRealStripe ? "Sandbox-ready" : "Demo/test-double", tone: "purple", detail: state?.stripe?.hosted_invoice_url ? "Hosted invoice URL available." : "No live send in Judge Demo Mode." },
    { label: "Retrieve invoice/payment status", status: paid ? "Verified paid" : "Not paid", tone: paid ? "green" : "amber", detail: `paid=${String(state?.stripe?.paid ?? false)}` },
    { label: "Record finance state", status: "Recorded", tone: "green", detail: `livemode=${String(livemode)}; no live money.` },
    { label: "Gate spend on finance state", status: "Verified", tone: "green", detail: "Spend remains governed by invoice/payment state and policy." },
  ];
}

function buildProofArtifacts({
  approvedCostsCents,
  blockedSpendCents,
  guardrailLabel,
  laborCostCents,
  protectedProfitCents,
  state,
  stripeLabel,
}: {
  approvedCostsCents: number;
  blockedSpendCents: number;
  guardrailLabel: string;
  laborCostCents: number;
  protectedProfitCents: number;
  state: DemoState | null;
  stripeLabel: string;
}): ProofArtifactModel[] {
  const invoiceId = state?.stripe?.invoice_id ?? "in_demo_northstar";
  const stripeStatus = state?.stripe?.used_real_stripe ? "Test-mode" : "Demo state";
  const nemoRuntime = state?.execution?.hermes_runtime === "nemoclaw" || state?.execution?.hermes_runtime === "nemohermes_api"
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
      detail: `${stripeLabel}; livemode=${String(state?.stripe?.livemode ?? false)}; paid=${String(state?.stripe?.paid ?? false)}.`,
      icon: CreditCard,
      meta: `invoice:${invoiceId}`,
      railId: "stripe-status",
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
      detail: `${formatCurrency(approvedCostsCents)} approved delivery cost basis includes ${formatCurrency(laborCostCents)} labor before protected margin is reported.`,
      icon: Activity,
      meta: "job_costing:demo_labor_cost",
      railId: "evidence",
      status: "Recorded",
      system: "Workforce Costing",
      title: "Delivery Cost Basis",
      tone: "green",
    },
    {
      detail: `${formatCurrency(protectedProfitCents)} protected profit report recorded after the full approved delivery cost basis.`,
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
  approvedCostsCents,
  blockedSpendCents,
  guardrailLabel,
  hasReport,
  laborCostCents,
  marginFloorPercent,
  marginIfBlockedApprovedPercent,
  marginPercent,
  protectedProfitCents,
  revenueCents,
  setupSpendCents,
  stripeLabel,
}: {
  approvedCostsCents: number;
  blockedSpendCents: number;
  guardrailLabel: string;
  hasReport: boolean;
  laborCostCents: number;
  marginFloorPercent: number;
  marginIfBlockedApprovedPercent: number;
  marginPercent: number;
  protectedProfitCents: number;
  revenueCents: number;
  setupSpendCents: number;
  stripeLabel: string;
}): RailView[] {
  return [
    { actor: "SCALEX", badge: "01", detail: "Client onboarding and reviewed document intake load the synthetic Northstar operation before any agent action.", evidence: "Business intake loaded", id: "input", name: "Business Intake Loaded", proofTag: "intake", riskTag: "data safe", status: "Loaded", subline: "Client record reviewed · document intake supported", tone: "green" },
    { actor: "SCALEX", badge: "02", detail: `${formatCurrency(approvedCostsCents)} approved delivery cost basis is loaded, including ${formatCurrency(laborCostCents)} labor before execution begins.`, evidence: "Cost basis loaded", id: "cost-basis", name: "Cost Basis Loaded", proofTag: "delivery costs", riskTag: "margin basis", status: "Loaded", subline: "Full cost basis included in margin", tone: "green" },
    { actor: "HERMES", badge: "03", detail: "Hermes creates the implementation launch plan and proposes next tool actions. ScaleX governs what can execute.", evidence: "Hermes operation plan recorded", id: "hermes", name: "Hermes Operation Plan", proofTag: "operator plan", riskTag: "bounded plan", status: "Created", subline: "Implementation plan created · ScaleX governs", tone: "blue" },
    { actor: "STRIPE", badge: "04", detail: "Stripe customer, invoice, and payment-link actions are prepared as controlled tool calls, not raw agent autonomy.", evidence: "Stripe invoice tool prepared", id: "stripe-invoice", name: "Stripe Invoice Tool", proofTag: "tool call", riskTag: "sandbox", status: "Prepared", subline: "Invoice/payment-link action prepared", tone: "purple" },
    { actor: "STRIPE", badge: "05", detail: `Finance state checked for ${formatCurrency(revenueCents)}. ${stripeLabel}.`, evidence: "Stripe payment status retrieved", id: "stripe-status", name: "Stripe Payment Status", proofTag: "livemode=false", riskTag: "money state", status: "Verified", subline: "Invoice state retrieved · paid-state honest", tone: "purple" },
    { actor: "NEMOCLAW / NEMO", badge: "06", detail: "NemoClaw boundary is visible while NeMo Guardrails/local policy checks vendor, margin, live-money, data, and tool-action rules.", evidence: guardrailLabel, id: "policy", name: "NemoClaw / NeMo Check", proofTag: "risk decision", riskTag: "guardrail", status: "Checked", subline: "Policy checked before execution", tone: "cyan" },
    { actor: "SCALEX", badge: "07", detail: `${formatCurrency(setupSpendCents)} setup spend stays inside approved vendor and margin rules.`, evidence: "Approved setup spend recorded", id: "approved-spend", name: "Setup Spend Approved", proofTag: "policy pass", riskTag: "approved", status: "Approved", subline: "Allowed setup spend inside policy", tone: "green" },
    { actor: "SCALEX", badge: "08", detail: `Data Broker Enrichment requested ${formatCurrency(blockedSpendCents)}. If approved, margin would fall to ${formatPercent(marginIfBlockedApprovedPercent)} below the ${formatPercent(marginFloorPercent)} floor; no spend row created.`, evidence: "Policy blocked data broker enrichment", id: "blocked-spend", name: "Risky Vendor Action Blocked", proofTag: "no spend row", riskTag: "blocked", status: "BLOCKED", subline: "Blocked margin collapse", tone: "red" },
    { actor: "SCALEX", badge: "09", detail: "Audit records are stored without secrets, live-money credentials, or production customer data.", evidence: hasReport ? "Evidence ledger recorded audit trail" : "Evidence ledger ready", id: "evidence", name: "Evidence Ledger Recorded", proofTag: "audit trail", riskTag: "recorded", status: "Recorded", subline: "Audit trail recorded", tone: "green" },
    { actor: "SCALEX", badge: "10", detail: `Protected profit ${formatCurrency(protectedProfitCents)} after ${formatCurrency(approvedCostsCents)} approved delivery costs; margin ${formatPercent(marginPercent)}.`, evidence: "Protected profit outcome recorded", id: "profit", name: "Profit Outcome Reported", proofTag: "margin report", riskTag: "protected", status: "Protected", subline: "Protected profit and margin reported", tone: "green" },
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
  const clientReview = commandCenter?.client_onboarding?.extracted_review;
  const employeeReview = commandCenter?.employee_onboarding?.extracted_review;
  const documentStates = commandCenter?.document_intake?.states ?? [];

  return [
    {
      description: "Client file/manual intake creates the operation context before execution.",
      status: clientReview?.editable_before_save ? "review gate" : "ready",
      title: "Business Intake",
      tone: "blue",
      value: commandCenter?.client_onboarding?.saved_record?.source ?? "Synthetic Northstar sample",
    },
    {
      description: "Uploaded and manual records stay review-before-save; no live extraction service is introduced.",
      status: documentStates.length > 0 ? `${documentStates.length} states` : "ready",
      title: "Document Review",
      tone: "purple",
      value: commandCenter?.document_intake?.storage_policy ?? "Local demo review only",
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

function buildAuditRows({ approvedCostsCents, blockedSpendCents, guardrailLabel, laborCostCents, marginIfBlockedApprovedPercent, protectedProfitCents, setupSpendCents, state }: {
  approvedCostsCents: number;
  blockedSpendCents: number;
  guardrailLabel: string;
  laborCostCents: number;
  marginIfBlockedApprovedPercent: number;
  protectedProfitCents: number;
  setupSpendCents: number;
  state: DemoState | null;
}): AuditRowModel[] {
  const stripeResult = state?.stripe?.used_real_stripe ? "real Stripe test" : "sandbox finance";
  return [
    { order: "001", actor: "Hermes", action: "Implementation plan recorded", evidenceType: "planning_run", safetyNote: "Hermes plans only; ScaleX executes approved actions.", status: "Recorded", tone: "purple" },
    { order: "002", actor: "Stripe", action: "Finance state recorded", evidenceType: "stripe_event", safetyNote: `Finance state is ${stripeResult}; livemode is not live money.`, status: "Verified", tone: "blue" },
    { order: "003", actor: "NeMo / Local Policy", action: "Guardrail check recorded", evidenceType: "guardrail_evaluation", safetyNote: guardrailLabel, status: "Verified", tone: "green" },
    { order: "004", actor: "ScaleX Economics", action: `Cost basis calculated ${formatCurrency(approvedCostsCents)}`, evidenceType: "cost_basis", safetyNote: "Protected profit is calculated after approved delivery costs, not just labor.", status: "Recorded", tone: "green" },
    { order: "005", actor: "ScaleX Policy", action: `Approved setup spend recorded ${formatCurrency(setupSpendCents)}`, evidenceType: "policy_check", safetyNote: "Allowed vendors and setup spend cap were checked before spend.", status: "Approved", tone: "green" },
    { order: "006", actor: "Workforce Costing", action: `Labor cost proof recorded ${formatCurrency(laborCostCents)}`, evidenceType: "job_costing", safetyNote: "Demo job costing only; not payroll or HR compliance.", status: "Recorded", tone: "purple" },
    { order: "007", actor: "ScaleX Economics", action: "Campaign/media cost recorded $600", evidenceType: "cost_basis", safetyNote: "Delivery cost assumption is included before profit is reported.", status: "Recorded", tone: "green" },
    { order: "008", actor: "ScaleX Economics", action: "Materials/delivery cost recorded $375", evidenceType: "cost_basis", safetyNote: "Delivery materials are included in the approved cost basis.", status: "Recorded", tone: "green" },
    { order: "009", actor: "ScaleX Policy", action: `Blocked risky vendor spend ${formatCurrency(blockedSpendCents)}`, evidenceType: "policy_check", safetyNote: `Data broker enrichment would collapse margin to ${formatPercent(marginIfBlockedApprovedPercent)}; no spend ledger row created.`, status: "BLOCKED", tone: "red" },
    { order: "010", actor: "Output Rail", action: "Paid-state honesty verified", evidenceType: "output_guardrail", safetyNote: "Open/unpaid Stripe state is not described as paid.", status: "Verified", tone: "amber" },
    { order: "011", actor: "ScaleX Safety", action: "No live-money mode verified", evidenceType: "mode_boundary", safetyNote: "Verified Live Mode is future-only.", status: "Verified", tone: "green" },
    { order: "012", actor: "ScaleX Safety", action: "No secrets stored verified", evidenceType: "secret_boundary", safetyNote: "No tokens, credential headers, or .env values are shown.", status: "Verified", tone: "green" },
    { order: "013", actor: "ScaleX Ledger", action: "Final protected profit outcome recorded", evidenceType: "profit_report", safetyNote: `Protected profit ${formatCurrency(protectedProfitCents)} after approved delivery costs.`, status: "Recorded", tone: "green" },
  ];
}

function buildConnectionCards(state: DemoState | null, auditRows: number, guardrailLabel: string, hermesLabel: string, stripeLabel: string): ConnectorCardModel[] {
  const guardrails = state?.guardrails ?? null;
  const hermesRuntime = state?.execution?.hermes_runtime ?? "isolated_cli";
  const nemoClawSelected = hermesRuntime === "nemoclaw" || hermesRuntime === "nemohermes_api";
  return [
    {
      badges: [{ label: "active", tone: "green" }, { label: state?.hermes?.used_real_hermes ? "runtime verified" : "demo mode", tone: state?.hermes?.used_real_hermes ? "green" : "amber" }, { label: nemoClawSelected ? "NemoClaw route selected" : "NemoClaw optional", tone: nemoClawSelected ? "green" : "blue" }],
      boundary: "No production Hermes config is used. Optional NemoClaw/NemoHermes routing is selected only by environment configuration and fails closed if unavailable.",
      description: "Creates the client implementation plan and proposes the controlled tool sequence.",
      facts: [{ label: "Current mode", value: hermesLabel, tone: "purple" }, { label: "Runtime", value: hermesRuntime, tone: "white" }, { label: "NemoClaw route", value: nemoClawSelected ? "selected" : "not selected", tone: nemoClawSelected ? "green" : "blue" }, { label: "Planning runs", value: String(state?.planning_runs?.length ?? 0), tone: "white" }],
      icon: BrainCircuit,
      logoSrc: "/brand/connections/hermes_agent_nous_square_white.png",
      title: "Hermes Planning",
    },
    {
      badges: [{ label: state?.stripe?.used_real_stripe ? "real test mode" : "demo mode", tone: state?.stripe?.used_real_stripe ? "green" : "amber" }, { label: "Stripe Sandbox Prototype", tone: "blue" }, { label: "live blocked", tone: "red" }],
      boundary: "Judge Demo uses labeled sandbox/test-double finance. Stripe Sandbox Prototype uses real test-mode objects only when configured safely. Live money is unsupported.",
      description: "Provides finance state through sandbox/test-mode invoice records.",
      facts: [{ label: "Current mode", value: stripeLabel, tone: "blue" }, { label: "livemode", value: String(state?.stripe?.livemode ?? false), tone: "green" }, { label: "paid", value: String(state?.stripe?.paid ?? false), tone: "amber" }, { label: "invoice", value: state?.stripe?.invoice_id ? "Available" : "Demo state", tone: "white" }],
      icon: CreditCard,
      logoSrc: "/brand/connections/stripe_square_s_mark.png",
      title: "Stripe Finance State",
    },
    {
      badges: [{ label: "active", tone: "green" }, { label: guardrails?.used_real_nemo ? "real NeMo" : "local_policy_active", tone: guardrails?.used_real_nemo ? "green" : "amber" }, { label: "13 evaluations", tone: "blue" }],
      boundary: "NeMo Guardrails is claimed only when used_real_nemo=true. Local policy remains visible otherwise. This is separate from NemoClaw planning runtime routing.",
      description: "Checks risky actions before execution and blocks unsafe behavior.",
      facts: [{ label: "Current mode", value: guardrailLabel, tone: "green" }, { label: "used_real_nemo", value: String(Boolean(guardrails?.used_real_nemo)), tone: guardrails?.used_real_nemo ? "green" : "amber" }, { label: "fail_closed", value: String(Boolean(guardrails?.fail_closed)), tone: guardrails?.fail_closed ? "red" : "green" }, { label: "adapter", value: guardrails?.adapter_status ?? "local policy", tone: "white" }],
      icon: ShieldCheck,
      logoSrc: "/brand/connections/nvidia_square_mark.png",
      title: "NeMo Guardrails / Local Policy",
    },
    {
      badges: [{ label: "active", tone: "green" }, { label: "demo mode", tone: "amber" }, { label: `${auditRows} evidence rows`, tone: "blue" }],
      boundary: "Local SQLite evidence only; no production customer data or external ledger is connected.",
      description: "Persists run events, ledger rows, planning records, policy checks, guardrail evaluations, and reports.",
      facts: [{ label: "Ledger entries", value: String(state?.ledger?.entries?.length ?? 4), tone: "green" }, { label: "Evidence rows", value: String(auditRows || 64), tone: "white" }, { label: "Reports", value: String(state?.reports?.length ?? 1), tone: "green" }, { label: "Blocked spend rows", value: "0", tone: "green" }],
      icon: Database,
      logoSrc: "/brand/connections/sqlite_square_icon.png",
      title: "SQLite Evidence Ledger",
    },
  ];
}

function buildActivityChips({
  blockedSpendCents,
  protectedProfitCents,
  setupSpendCents,
}: {
  blockedSpendCents: number;
  protectedProfitCents: number;
  setupSpendCents: number;
}): ActivityChipModel[] {
  return [
    { label: "Business intake loaded", railId: "input", time: "T+01", tone: "green" },
    { label: "Cost basis loaded", railId: "cost-basis", time: "T+02", tone: "green" },
    { label: "Hermes plan created", railId: "hermes", time: "T+03", tone: "blue" },
    { label: "Stripe invoice action prepared", railId: "stripe-invoice", time: "T+04", tone: "purple" },
    { label: "Payment status retrieved", railId: "stripe-status", time: "T+05", tone: "purple" },
    { label: "NemoClaw/NeMo check completed", railId: "policy", time: "T+06", tone: "cyan" },
    { label: "Setup spend approved", railId: "approved-spend", time: formatCurrency(setupSpendCents), tone: "green" },
    { label: `Risk contained: Data Broker ${formatCurrency(blockedSpendCents)}`, railId: "blocked-spend", time: "T+08", tone: "red" },
    { label: "Evidence ledger recorded audit trail", railId: "evidence", time: "T+09", tone: "green" },
    { label: `Profit report protected ${formatCurrency(protectedProfitCents)}`, railId: "profit", time: "T+10", tone: "green" },
  ];
}

function badgeClass(tone: Tone): string {
  switch (tone) {
    case "brand":
      return "border-[#fcba03]/40 bg-[#fcba03]/10 text-[#fcba03]";
    case "green":
      return "border-[#10B981]/35 bg-[#10B981]/10 text-[#10B981]";
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
      return "border-[#FFFFFF]/20 bg-white/5 text-[#FFFFFF]";
    case "muted":
    default:
      return "border-[#232834] bg-[#0a0b0e] text-[#A1A1AA]";
  }
}

function metricClass(tone: Tone = "white"): string {
  switch (tone) {
    case "brand":
      return "text-[#fcba03]";
    case "green":
      return "text-[#10B981]";
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
      return "text-[#A1A1AA]";
    case "white":
    default:
      return "text-[#FFFFFF]";
  }
}

function metricSublabelClass(tone: Tone = "white"): string {
  switch (tone) {
    case "brand":
      return "text-[#fcba03]";
    case "green":
      return "text-[#10B981]";
    case "red":
      return "text-[#f87171]";
    case "amber":
      return "text-[#f59e0b]";
    case "blue":
      return "text-[#93c5fd]";
    case "purple":
      return "text-[#c4b5fd]";
    case "cyan":
      return "text-[#67e8f9]";
    case "muted":
    case "white":
    default:
      return "text-[#A1A1AA]";
  }
}
