import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Ban,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  Database,
  FileText,
  Play,
  RefreshCw,
  ShieldCheck,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatCurrency, formatDateTime, formatPercent, humanize } from "../../format";
import type { BusyAction, MoneySnapshot } from "../../lib/demoSelectors";
import { isApproved } from "../../lib/demoSelectors";
import type { AppView } from "../../layout/navigation";
import type { AuthStatus, DemoState, HealthResponse, PolicyCheck } from "../../types";

type Tone = "green" | "red" | "amber" | "blue" | "purple" | "muted" | "white";
type ProofTab = "hermes" | "stripe" | "guardrails";
type DrawerTab = "summary" | "operation" | "proof";

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
  status: string;
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
  const [proofTab, setProofTab] = useState<ProofTab>("hermes");
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("summary");
  const [expandedRailId, setExpandedRailId] = useState("blocked-spend");
  const [animatedCount, setAnimatedCount] = useState(0);
  const [hasAnimatedRun, setHasAnimatedRun] = useState(Boolean(state?.report));

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

    setHasAnimatedRun(false);
    setAnimatedCount(0);
    const timers = model.rails.map((_, index) => (
      window.setTimeout(() => {
        setAnimatedCount(index + 1);
        if (index === model.rails.length - 1) {
          setHasAnimatedRun(true);
        }
      }, (index + 1) * 500)
    ));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [busyAction, model.rails.length]);

  useEffect(() => {
    if (busyAction === "run") {
      return;
    }

    if (state?.report || runCompletedMoment) {
      setAnimatedCount(model.rails.length);
      setHasAnimatedRun(true);
      return;
    }

    setAnimatedCount(0);
    setHasAnimatedRun(false);
  }, [busyAction, model.rails.length, runCompletedMoment, state?.report]);

  const runActive = busyAction === "run";
  const visibleRailCount = runActive || hasAnimatedRun ? animatedCount : 0;

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
        onRun={onRun}
        runActive={runActive}
        runStatus={runStatus}
      />
      <div className="min-h-0 flex-1 overflow-hidden p-4">
        {activeView === "dashboard" ? (
          <DashboardView
            model={model}
            onNavigate={onNavigate}
            onRun={onRun}
            proofTab={proofTab}
            runActive={runActive}
            setProofTab={setProofTab}
            visibleRailCount={visibleRailCount}
          />
        ) : null}
        {activeView === "workflow" ? (
          <GovernedRunView
            drawerTab={drawerTab}
            expandedRailId={expandedRailId}
            model={model}
            setDrawerTab={setDrawerTab}
            setExpandedRailId={setExpandedRailId}
            visibleRailCount={visibleRailCount}
          />
        ) : null}
        {activeView === "audit" ? <EvidenceLedgerView model={model} /> : null}
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
  onRefresh,
  onReset,
  onRun,
  runActive,
  runStatus,
}: {
  activeView: AppView;
  auth: AuthStatus | null;
  error: string | null;
  model: ControlRoomModel;
  notice: string | null;
  onLogout: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onRun: () => void;
  runActive: boolean;
  runStatus: string;
}) {
  const crumbByView: Record<string, string> = {
    audit: `Evidence Ledger / ${model.auditRows} evidence rows`,
    dashboard: `Dashboard / ${model.clientName}`,
    integrations: "Connection Hub / active systems · demo proof mode",
    settings: "Settings / Boundaries & Runtime",
    workflow: `Governed Run Studio / ${model.clientName} · ${model.operationName}`,
  };

  return (
    <header className="flex h-14 flex-none items-center justify-between border-b border-[#1e2128] bg-[#0d0e12] px-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#f0f0f0]">{crumbByView[activeView] ?? crumbByView.dashboard}</p>
        <p className={`mt-0.5 truncate text-xs ${error ? "text-[#ef4444]" : "text-[#8a8f9e]"}`}>
          {error ?? notice ?? runStatus}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge label={runActive ? "Run in progress..." : model.hasReport ? "Run complete · protected profit" : "Ready"} tone={runActive ? "blue" : "green"} />
        <button className="control-btn-primary" disabled={runActive} onClick={onRun} type="button">
          {runActive ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {runActive ? "Executing..." : model.hasReport ? "Run Again" : "Start Governed Run"}
        </button>
        <button className="control-btn" onClick={onRefresh} type="button">Refresh</button>
        <button className="control-btn" onClick={onReset} type="button">Reset</button>
        {auth?.auth_enabled ? <button className="control-btn" onClick={onLogout} type="button">Logout</button> : null}
      </div>
    </header>
  );
}

function DashboardView({
  model,
  onNavigate,
  onRun,
  proofTab,
  runActive,
  setProofTab,
  visibleRailCount,
}: {
  model: ControlRoomModel;
  onNavigate: (view: AppView) => void;
  onRun: () => void;
  proofTab: ProofTab;
  runActive: boolean;
  setProofTab: (tab: ProofTab) => void;
  visibleRailCount: number;
}) {
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4">
      <MetricStrip metrics={model.metrics} runActive={runActive} visibleRailCount={visibleRailCount} />
      <div className="grid min-h-0 grid-cols-2 gap-4">
        <Panel title="Governed Run" eyebrow="execution rails" action={<StatusBadge label={runActive ? "running" : model.hasReport ? "complete" : "ready"} tone={runActive ? "blue" : "green"} />}>
          <RailList compact model={model} visibleRailCount={visibleRailCount} />
        </Panel>
        <Panel title="Proof Panel" eyebrow="Hermes · Stripe · NeMo" action={<button className="control-link" onClick={() => onNavigate("audit")} type="button">Open Ledger</button>}>
          <ProofTabs active={proofTab} model={model} onChange={setProofTab} />
          <div className="mt-3">
            {proofTab === "hermes" ? <HermesProof model={model} /> : null}
            {proofTab === "stripe" ? <StripeProof model={model} /> : null}
            {proofTab === "guardrails" ? <GuardrailProof model={model} /> : null}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-md border border-[#1e2128] bg-[#0a0b0e] p-3">
            <p className="text-sm text-[#8a8f9e]">Blocked vendor spend is stopped before ledger write.</p>
            <button className="control-btn-primary" disabled={runActive} onClick={onRun} type="button">
              {runActive ? "Executing..." : "Start Governed Run"}
            </button>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function GovernedRunView({
  drawerTab,
  expandedRailId,
  model,
  setDrawerTab,
  setExpandedRailId,
  visibleRailCount,
}: {
  drawerTab: DrawerTab;
  expandedRailId: string;
  model: ControlRoomModel;
  setDrawerTab: (tab: DrawerTab) => void;
  setExpandedRailId: (id: string) => void;
  visibleRailCount: number;
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
        <Panel title="Rail Map" eyebrow="click rail for proof">
          <div className="grid gap-2">
            {model.rails.map((rail, index) => {
              const expanded = expandedRailId === rail.id;
              const visible = visibleRailCount === 0 || index < visibleRailCount;
              return (
                <button
                  className={`rail-card text-left ${rail.tone === "red" ? "rail-card-blocked" : ""} ${visible ? "rail-enter" : "opacity-60"}`}
                  key={rail.id}
                  onClick={() => setExpandedRailId(expanded ? "" : rail.id)}
                  type="button"
                >
                  <div className="flex min-h-12 items-center gap-3">
                    <span className="rail-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#f0f0f0]">{rail.name}</p>
                      <p className="truncate text-xs text-[#8a8f9e]">{rail.actor}</p>
                    </div>
                    <StatusBadge label={rail.status} tone={rail.tone} />
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
        <Panel title="Evidence Drawer" eyebrow="run proof">
          <SegmentedTabs
            active={drawerTab}
            items={[
              { id: "summary", label: "Run Summary" },
              { id: "operation", label: "Active Operation" },
              { id: "proof", label: "Proof Path" },
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
            {drawerTab === "proof" ? (
              <div className="flex flex-wrap gap-2">
                {["Stripe test-double proof", "Local policy setup spend gate", "API-backed economics"].map((tag) => (
                  <span className="rounded-md border border-[#1e2128] bg-[#0a0b0e] px-3 py-2 text-xs font-semibold text-[#f0f0f0]" key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
      <RailActivityTimeline model={model} />
    </section>
  );
}

function EvidenceLedgerView({ model }: { model: ControlRoomModel }) {
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
              {model.auditRowsData.map((row) => (
                <tr className={`bg-[#111318] ${row.order === "005" ? "border-l-4 border-[#ef4444]" : ""}`} key={row.order}>
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
      <Panel title="Audit Safety Proof" eyebrow="demo boundaries">
        <div className="grid gap-3">
          {model.safetyProof.map((proof) => (
            <div className="flex items-start gap-2 text-sm text-[#f0f0f0]" key={proof}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#00d084]" />
              <span>{proof}</span>
            </div>
          ))}
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
          {["Demo proof mode", model.hermesLabel, model.stripeLabel, model.guardrailLabel].map((label) => (
            <StatusBadge key={label} label={label} tone="green" />
          ))}
        </div>
      </div>
      <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-4">
        {model.connectionCards.map((card) => (
          <ConnectorCard key={card.title} card={card} />
        ))}
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
    ["Execution mode", state?.execution.label ?? "Judge Demo Mode", state?.execution.truthfulness_note ?? "Demo proof and Full Proof Mode stay explicitly labeled."],
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

function MetricStrip({ metrics, runActive, visibleRailCount }: { metrics: StatPill[]; runActive: boolean; visibleRailCount: number }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {metrics.map((metric) => (
        <article
          className={`metric-card ${metric.label === "Blocked Risk" && visibleRailCount >= 8 ? "metric-flash-red" : ""} ${metric.label === "Protected Profit" ? "metric-hero" : ""}`}
          key={metric.label}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9e]">{metric.label}</p>
          <p className={`mt-2 font-semibold tabular-nums ${metricClass(metric.tone)} ${metric.label === "Protected Profit" ? "text-4xl" : metric.label === "Blocked Risk" ? "text-3xl" : "text-2xl"}`}>
            {metric.label === "Blocked Risk" && runActive && visibleRailCount < 8 ? "$0" : metric.value}
          </p>
        </article>
      ))}
    </div>
  );
}

function RailList({ compact, model, visibleRailCount }: { compact?: boolean; model: ControlRoomModel; visibleRailCount: number }) {
  return (
    <ol className="grid gap-2">
      {model.rails.map((rail, index) => {
        const visible = visibleRailCount === 0 || index < visibleRailCount;
        const active = visibleRailCount > 0 && index < visibleRailCount;
        const blocked = rail.id === "blocked-spend";
        return (
          <li
            className={`rail-row ${active ? "rail-enter" : ""} ${!visible ? "opacity-55" : ""} ${blocked && active ? "rail-blocked danger-pulse-on-visible" : blocked ? "rail-blocked" : ""}`}
            key={rail.id}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="rail-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="status-dot" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#f0f0f0]">{rail.name}</p>
              {!compact ? <p className="truncate text-xs text-[#8a8f9e]">{rail.evidence}</p> : null}
            </div>
            <span className="hidden rounded-md border border-[#1e2128] px-2 py-1 text-[0.64rem] font-semibold uppercase text-[#8a8f9e] xl:inline">{rail.actor}</span>
            <StatusBadge label={active ? rail.status : "ready"} tone={active ? rail.tone : "muted"} />
          </li>
        );
      })}
    </ol>
  );
}

function ProofTabs({ active, model, onChange }: { active: ProofTab; model: ControlRoomModel; onChange: (tab: ProofTab) => void }) {
  return (
    <div>
      <SegmentedTabs
        active={active}
        items={[
          { id: "hermes", label: "Hermes Plan" },
          { id: "stripe", label: "Stripe Proof" },
          { id: "guardrails", label: "NeMo Guardrails" },
        ]}
        onChange={(id) => onChange(id as ProofTab)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <StatusBadge label={model.hermesLabel} tone="purple" />
        <StatusBadge label={model.stripeLabel} tone="blue" />
        <StatusBadge label={model.guardrailLabel} tone="green" />
      </div>
    </div>
  );
}

function HermesProof({ model }: { model: ControlRoomModel }) {
  return (
    <pre className="proof-terminal">
{model.hermesTasks.map((task, index) => `$ task_${index + 1}: ${task}`).join("\n")}
{"\n"}$ proof_source: {model.hermesLabel}
{"\n"}$ planner_boundary: ScaleX executes only allowed actions
    </pre>
  );
}

function StripeProof({ model }: { model: ControlRoomModel }) {
  return (
    <div className="rounded-md border border-[#1e2128] bg-[#0a0b0e] p-4">
      <div className="mb-3 flex gap-2">
        <StatusBadge label={model.state?.stripe.stripe_mode === "test_double" ? "Test Double" : model.stripeLabel} tone="blue" />
        <StatusBadge label={`livemode=${String(model.state?.stripe.livemode ?? false)}`} tone="green" />
        <StatusBadge label={`paid=${String(model.state?.stripe.paid ?? false)}`} tone="amber" />
      </div>
      <pre className="text-xs leading-6 text-[#f0f0f0]">
{JSON.stringify({
  invoice_id: model.state?.stripe.invoice_id ?? "in_demo_northstar",
  livemode: model.state?.stripe.livemode ?? false,
  paid: model.state?.stripe.paid ?? false,
  hosted_invoice_url: truncateUrl(model.state?.stripe.hosted_invoice_url ?? "https://stripe.test/invoices/northstar-demo"),
  status: model.state?.stripe.invoice_status ?? "open",
}, null, 2)}
      </pre>
    </div>
  );
}

function GuardrailProof({ model }: { model: ControlRoomModel }) {
  return (
    <div className="grid max-h-[calc(100vh-305px)] gap-2 overflow-auto pr-1">
      {model.guardrailChecks.map((check) => (
        <div className="flex items-center justify-between gap-3 rounded-md border border-[#1e2128] bg-[#0a0b0e] px-3 py-2" key={check.label}>
          <p className="text-sm text-[#f0f0f0]">{check.label}</p>
          <StatusBadge label={check.status} tone={check.status === "Block" ? "red" : check.status === "Warn" ? "amber" : "green"} />
        </div>
      ))}
    </div>
  );
}

function RailActivityTimeline({ model }: { model: ControlRoomModel }) {
  return (
    <div className="rounded-md border border-[#1e2128] bg-[#111318] p-3">
      <p className="text-xs font-semibold uppercase text-[#8a8f9e]">Rail Activity</p>
      <div className="mt-2 flex gap-2 overflow-hidden">
        {model.timelineChips.map((chip) => (
          <span className="min-w-0 rounded-md border border-[#1e2128] bg-[#0a0b0e] px-3 py-2 text-xs font-semibold text-[#f0f0f0]" key={chip.label}>
            {chip.label} <span className="text-[#8a8f9e]">{chip.time}</span>
          </span>
        ))}
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
      <div className="h-[calc(100%-3.5rem)] overflow-hidden p-4">{children}</div>
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
  const hermesLabel = state?.execution.planning_label ?? (state?.hermes.used_real_hermes ? "Runtime Hermes proof" : "Deterministic Hermes plan");
  const stripeLabel = state?.execution.finance_label ?? (state?.stripe.used_real_stripe ? "Real Stripe test proof" : "Stripe test-double/sandbox proof");
  const guardrailLabel = state?.execution.guardrail_label ?? (state?.guardrails.used_real_nemo ? "NeMo Guardrails verified" : "Local policy active");
  const rails = buildRails({ approvedSpendCents, blockedSpendCents, guardrailLabel, hasReport, laborCostCents, marginPercent, protectedProfitCents, revenueCents, stripeLabel });
  const auditRowsData = buildAuditRows({ approvedSpendCents, blockedSpendCents, guardrailLabel, laborCostCents, protectedProfitCents, state });

  return {
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
    clientName: displayCustomer,
    connectionCards: buildConnectionCards(state, auditRows, guardrailLabel, hermesLabel, stripeLabel),
    guardrailChecks: buildGuardrailChecks(policyChecks, guardrailEvaluations),
    guardrailLabel,
    hasReport,
    hermesLabel,
    hermesTasks: buildHermesTasks(state),
    marginLabel: formatPercent(marginPercent),
    metrics: [
      { label: "Revenue Secured", value: formatCurrency(revenueCents), tone: "white" },
      { label: "Approved Spend", value: formatCurrency(approvedSpendCents), tone: "green" },
      { label: "Blocked Risk", value: formatCurrency(blockedSpendCents), tone: "red" },
      { label: "Labor Cost", value: formatCurrency(laborCostCents), tone: "white" },
      { label: "Protected Profit", value: formatCurrency(protectedProfitCents), tone: "green" },
    ],
    operationFacts: [
      { label: "Client", value: displayCustomer },
      { label: "Operation", value: displayJob },
      { label: "Revenue", value: formatCurrency(revenueCents), tone: "white" },
      { label: "Spend", value: formatCurrency(approvedSpendCents), tone: "green" },
      { label: "Blocked", value: formatCurrency(blockedSpendCents), tone: "red" },
      { label: "Profit", value: formatCurrency(protectedProfitCents), tone: "green" },
      { label: "Margin", value: formatPercent(marginPercent), tone: "green" },
      { label: "Floor", value: formatPercent(marginFloorPercent), tone: "amber" },
    ],
    operationName: displayJob,
    protectedProfitLabel: formatCurrency(protectedProfitCents),
    rails,
    safetyProof: state?.command_center?.safety_proof ?? ["fake/demo clients only", "no live money", "no credentials", "uploaded data requires review"],
    state,
    stripeLabel,
    supportingModules: buildSupportingModules(state, laborCostCents),
    timelineChips: buildTimelineChips(events),
  };
}

interface ControlRoomModel {
  auditPills: StatPill[];
  auditRows: number;
  auditRowsData: AuditRowModel[];
  blockedRiskLabel: string;
  clientName: string;
  connectionCards: ConnectorCardModel[];
  guardrailChecks: Array<{ label: string; status: "Allow" | "Warn" | "Block" }>;
  guardrailLabel: string;
  hasReport: boolean;
  hermesLabel: string;
  hermesTasks: string[];
  marginLabel: string;
  metrics: StatPill[];
  operationFacts: StatPill[];
  operationName: string;
  protectedProfitLabel: string;
  rails: RailView[];
  safetyProof: string[];
  state: DemoState | null;
  stripeLabel: string;
  supportingModules: Array<{ description: string; status: string; title: string; tone: Tone; value: string }>;
  timelineChips: Array<{ label: string; time: string }>;
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
    { actor: "SCALEX", badge: "01", detail: "Synthetic Northstar operation, revenue, spend cap, margin floor, and data boundary checked.", evidence: "Input rail passed", id: "input", name: "ScaleX Input Rail", status: "Passed", tone: "green" },
    { actor: "HERMES", badge: "02", detail: "Hermes creates the implementation launch plan and proposes next actions.", evidence: "Planning proof recorded", id: "hermes", name: "Hermes Plan", status: "Created", tone: "purple" },
    { actor: "SCALEX", badge: "03", detail: "Plan stays inside the allowed client-implementation scope.", evidence: "Planning rail approved", id: "planning", name: "Planning Rail", status: "Approved", tone: "purple" },
    { actor: "STRIPE", badge: "04", detail: `Finance proof created for ${formatCurrency(revenueCents)}. ${stripeLabel}.`, evidence: "Stripe sandbox/test proof", id: "stripe", name: "Finance Rail", status: "Verified", tone: "blue" },
    { actor: "SCALEX", badge: "05", detail: "Revenue gate verifies money state before setup spend or delivery work proceeds.", evidence: `${formatCurrency(revenueCents)} revenue secured`, id: "revenue", name: "Revenue Gate", status: "Passed", tone: "green" },
    { actor: "NEMO / LOCAL", badge: "06", detail: "Vendor allowlist, blocked vendor, spend cap, margin floor, and unsafe-data rules checked.", evidence: guardrailLabel, id: "policy", name: "Policy Rail", status: "Checked", tone: "green" },
    { actor: "SCALEX", badge: "07", detail: `${formatCurrency(approvedSpendCents)} setup spend stays inside approved vendor and margin rules.`, evidence: "Approved setup spend recorded", id: "approved-spend", name: "Approved Spend", status: "Approved", tone: "green" },
    { actor: "SCALEX", badge: "08", detail: `Data broker enrichment / premium vendor spend requested ${formatCurrency(blockedSpendCents)} and created no spend ledger row.`, evidence: "Unsafe vendor spend blocked", id: "blocked-spend", name: `Risky Vendor Action ${formatCurrency(blockedSpendCents)}`, status: "BLOCKED", tone: "red" },
    { actor: "SCALEX", badge: "09", detail: "Allowed work execution completes only after policy gates pass.", evidence: hasReport ? "Execution evidence recorded" : "Execution ready", id: "execution", name: "Execution Rail", status: hasReport ? "Complete" : "Ready", tone: "green" },
    { actor: "SCALEX", badge: "10", detail: `Labor ${formatCurrency(laborCostCents)}, profit ${formatCurrency(protectedProfitCents)}, margin ${formatPercent(marginPercent)}.`, evidence: "Protected profit outcome recorded", id: "profit", name: "Profit Rail", status: "Protected", tone: "green" },
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
    "request Stripe finance proof",
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
  const stripeResult = state?.stripe.used_real_stripe ? "real Stripe test" : "sandbox proof";
  return [
    { order: "001", actor: "Hermes", action: "Planning proof recorded", evidenceType: "planning_run", safetyNote: "Hermes plans only; ScaleX executes approved actions.", status: "Recorded", tone: "purple" },
    { order: "002", actor: "Stripe", action: "Test finance proof recorded", evidenceType: "stripe_event", safetyNote: `Finance proof is ${stripeResult}; livemode is not live money.`, status: "Verified", tone: "blue" },
    { order: "003", actor: "NeMo / Local Policy", action: "Guardrail check recorded", evidenceType: "guardrail_evaluation", safetyNote: guardrailLabel, status: "Verified", tone: "green" },
    { order: "004", actor: "ScaleX Policy", action: `Approved setup spend ${formatCurrency(approvedSpendCents)}`, evidenceType: "policy_check", safetyNote: "Allowed vendors and margin floor were checked before spend.", status: "Approved", tone: "green" },
    { order: "005", actor: "ScaleX Policy", action: `Blocked risky vendor spend ${formatCurrency(blockedSpendCents)}`, evidenceType: "policy_check", safetyNote: "Data broker enrichment created no spend ledger row.", status: "BLOCKED", tone: "red" },
    { order: "006", actor: "Workforce Costing", action: `Labor-cost proof recorded ${formatCurrency(laborCostCents)}`, evidenceType: "job_costing", safetyNote: "Demo job costing only; not payroll or HR compliance.", status: "Recorded", tone: "purple" },
    { order: "007", actor: "Output Rail", action: "Paid-state honesty verified", evidenceType: "output_guardrail", safetyNote: "Open/unpaid Stripe proof is not described as paid.", status: "Verified", tone: "amber" },
    { order: "008", actor: "ScaleX Safety", action: "No live-money mode verified", evidenceType: "mode_boundary", safetyNote: "Verified Live Mode is future-only.", status: "Verified", tone: "green" },
    { order: "009", actor: "ScaleX Safety", action: "No secrets stored verified", evidenceType: "secret_boundary", safetyNote: "No tokens, credential headers, or .env values are shown.", status: "Verified", tone: "green" },
    { order: "010", actor: "ScaleX Ledger", action: "Final protected profit outcome recorded", evidenceType: "profit_report", safetyNote: `Protected profit ${formatCurrency(protectedProfitCents)} after approved spend and labor.`, status: "Recorded", tone: "green" },
  ];
}

function buildConnectionCards(state: DemoState | null, auditRows: number, guardrailLabel: string, hermesLabel: string, stripeLabel: string): ConnectorCardModel[] {
  const guardrails = state?.guardrails ?? null;
  return [
    {
      badges: [{ label: "active", tone: "green" }, { label: state?.hermes.used_real_hermes ? "runtime verified" : "demo mode", tone: state?.hermes.used_real_hermes ? "green" : "amber" }, { label: "full proof capable", tone: "blue" }],
      boundary: "No production Hermes config is used. Optional NemoHermes routing is selected only by environment configuration.",
      description: "Creates the client implementation plan and proposes the controlled tool sequence.",
      facts: [{ label: "Current mode", value: hermesLabel, tone: "purple" }, { label: "Runtime", value: state?.execution.hermes_runtime ?? "isolated_cli", tone: "white" }, { label: "used_real_hermes", value: String(Boolean(state?.hermes.used_real_hermes)), tone: state?.hermes.used_real_hermes ? "green" : "amber" }, { label: "Planning runs", value: String(state?.planning_runs.length ?? 0), tone: "white" }],
      icon: BrainCircuit,
      title: "Hermes Planning",
    },
    {
      badges: [{ label: state?.stripe.used_real_stripe ? "real test mode" : "demo mode", tone: state?.stripe.used_real_stripe ? "green" : "amber" }, { label: "sandbox proof", tone: "blue" }, { label: "live blocked", tone: "red" }],
      boundary: "Live money is unsupported. Paid state is shown only when Stripe reports it.",
      description: "Provides finance proof through sandbox/test-mode invoice records.",
      facts: [{ label: "Current mode", value: stripeLabel, tone: "blue" }, { label: "livemode", value: String(state?.stripe.livemode ?? false), tone: "green" }, { label: "paid", value: String(state?.stripe.paid ?? false), tone: "amber" }, { label: "invoice", value: state?.stripe.invoice_id ? "Available" : "Demo proof", tone: "white" }],
      icon: CreditCard,
      title: "Stripe Finance Proof",
    },
    {
      badges: [{ label: "active", tone: "green" }, { label: guardrails?.used_real_nemo ? "real NeMo" : "local_policy_active", tone: guardrails?.used_real_nemo ? "green" : "amber" }, { label: "13 evaluations", tone: "blue" }],
      boundary: "Real NeMo is claimed only when used_real_nemo=true. Local policy remains visible otherwise.",
      description: "Checks risky actions before execution and blocks unsafe behavior.",
      facts: [{ label: "Current mode", value: guardrailLabel, tone: "green" }, { label: "used_real_nemo", value: String(Boolean(guardrails?.used_real_nemo)), tone: guardrails?.used_real_nemo ? "green" : "amber" }, { label: "fail_closed", value: String(Boolean(guardrails?.fail_closed)), tone: guardrails?.fail_closed ? "red" : "green" }, { label: "adapter", value: guardrails?.adapter_status ?? "local policy", tone: "white" }],
      icon: ShieldCheck,
      title: "NeMo / Local Policy",
    },
    {
      badges: [{ label: "active", tone: "green" }, { label: "demo mode", tone: "amber" }, { label: `${auditRows} evidence rows`, tone: "blue" }],
      boundary: "Local SQLite evidence only; no production customer data or external ledger is connected.",
      description: "Persists run events, ledger rows, planning proof, policy checks, guardrail evaluations, and reports.",
      facts: [{ label: "Ledger entries", value: String(state?.ledger.entries.length ?? 4), tone: "green" }, { label: "Evidence rows", value: String(auditRows || 64), tone: "white" }, { label: "Reports", value: String(state?.reports.length ?? 1), tone: "green" }, { label: "Blocked spend rows", value: "0", tone: "green" }],
      icon: Database,
      title: "SQLite Evidence Ledger",
    },
  ];
}

function buildTimelineChips(events: DemoState["events"]): Array<{ label: string; time: string }> {
  const source = events.length > 0 ? events.slice(-6).map((event) => ({
    label: event.title,
    time: formatDateTime(event.created_at),
  })) : [];
  if (source.length > 0) {
    return source;
  }
  return ["Input passed", "Hermes plan", "Stripe proof", "Policy check", "Spend blocked", "Profit protected"].map((label, index) => ({
    label,
    time: `T+${index + 1}`,
  }));
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
    case "muted":
      return "text-[#8a8f9e]";
    case "white":
    default:
      return "text-[#f0f0f0]";
  }
}

function truncateUrl(value: string): string {
  return value.length > 46 ? `${value.slice(0, 43)}...` : value;
}
