import {
  Ban,
  BrainCircuit,
  CreditCard,
  Database,
  FileText,
  Layers3,
  ReceiptText,
  ShieldCheck,
  Target,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatCurrency, formatPercent } from "../../format";
import {
  eventByType,
  formatOptionalCurrency,
  hermesFailed,
  isApproved,
  latestTimestamp,
  latestWhere,
  stripeModeLabel,
} from "../../lib/demoSelectors";
import type { MoneySnapshot } from "../../lib/demoSelectors";
import type {
  DemoState,
  HealthResponse,
  LedgerEntry,
  PolicyCheck,
} from "../../types";

export type WorkflowNodeKey =
  | "customer"
  | "hermes"
  | "stripe"
  | "payment"
  | "policy"
  | "approved"
  | "blocked"
  | "agents"
  | "audit"
  | "report";

export type WorkflowInspectorKey = "summary" | WorkflowNodeKey;

export type WorkflowNodeStatus = "pending" | "current" | "complete" | "blocked" | "error";

export type WorkflowTone =
  | "slate"
  | "emerald"
  | "rose"
  | "amber"
  | "violet"
  | "sky"
  | "teal";

export interface WorkflowNodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkflowNodeModel {
  key: WorkflowNodeKey;
  title: string;
  eyebrow: string;
  proof: string;
  badge: string;
  status: WorkflowNodeStatus;
  tone: WorkflowTone;
  icon: LucideIcon;
  timestamp: string | null;
  position: WorkflowNodePosition;
}

export interface WorkflowConnectionModel {
  from: WorkflowNodeKey;
  to: WorkflowNodeKey;
  tone: WorkflowTone;
  label?: string;
}

export interface WorkflowAuditCounts {
  events: number;
  orchestrationCalls: number;
  stripeEvents: number;
  policyChecks: number;
  ledgerEntries: number;
  reports: number;
  planningRuns: number;
  agentOutputs: number;
  total: number;
}

export interface WorkflowModel {
  nodes: WorkflowNodeModel[];
  connections: WorkflowConnectionModel[];
  counts: WorkflowAuditCounts;
  activeCount: number;
}

export const WORKFLOW_NODE_ORDER: WorkflowNodeKey[] = [
  "customer",
  "hermes",
  "stripe",
  "payment",
  "policy",
  "approved",
  "blocked",
  "agents",
  "audit",
  "report",
];

const NODE_POSITIONS: Record<WorkflowNodeKey, WorkflowNodePosition> = {
  customer: { x: 24, y: 96, width: 172, height: 118 },
  hermes: { x: 232, y: 96, width: 172, height: 118 },
  stripe: { x: 440, y: 96, width: 172, height: 118 },
  payment: { x: 648, y: 96, width: 172, height: 118 },
  policy: { x: 856, y: 96, width: 172, height: 118 },
  approved: { x: 856, y: 318, width: 172, height: 118 },
  blocked: { x: 648, y: 318, width: 172, height: 118 },
  agents: { x: 440, y: 318, width: 172, height: 118 },
  audit: { x: 232, y: 318, width: 172, height: 118 },
  report: { x: 24, y: 318, width: 172, height: 118 },
};

export const WORKFLOW_CANVAS_WIDTH = 1052;
export const WORKFLOW_CANVAS_HEIGHT = 532;

export function buildWorkflowModel({
  auditRows,
  busy,
  health,
  money,
  progressIndex,
  state,
}: {
  auditRows: number;
  busy: boolean;
  health: HealthResponse | null;
  money: MoneySnapshot;
  progressIndex: number;
  state: DemoState | null;
}): WorkflowModel {
  const settledNodes = buildSettledNodes(state, money, auditRows, health);
  const nodes = busy ? applyProgressState(settledNodes, progressIndex) : settledNodes;

  return {
    nodes,
    connections: [
      { from: "customer", to: "hermes", tone: "teal" },
      { from: "hermes", to: "stripe", tone: "violet" },
      { from: "stripe", to: "payment", tone: "sky" },
      { from: "payment", to: "policy", tone: "amber" },
      { from: "policy", to: "approved", tone: "emerald", label: "approved path" },
      { from: "policy", to: "blocked", tone: "rose", label: "blocked path" },
      { from: "approved", to: "agents", tone: "emerald" },
      { from: "blocked", to: "audit", tone: "rose" },
      { from: "agents", to: "audit", tone: "teal" },
      { from: "audit", to: "report", tone: "teal" },
    ],
    counts: auditCounts(state, auditRows),
    activeCount: nodes.filter((node) => node.status !== "pending").length,
  };
}

export function nodeByKey(
  model: WorkflowModel,
  key: WorkflowInspectorKey,
): WorkflowNodeModel | null {
  if (key === "summary") {
    return null;
  }

  return model.nodes.find((node) => node.key === key) ?? null;
}

export function approvedPolicyChecks(state: DemoState | null): PolicyCheck[] {
  return state?.policy_checks.filter(isApproved) ?? [];
}

export function blockedPolicyChecks(state: DemoState | null): PolicyCheck[] {
  return state?.policy_checks.filter((check) => !isApproved(check)) ?? [];
}

export function spendLedgerEntries(state: DemoState | null): LedgerEntry[] {
  return state?.ledger.entries.filter((entry) => entry.entry_type === "spend") ?? [];
}

export function revenueLedgerEntry(state: DemoState | null): LedgerEntry | null {
  return state?.ledger.entries.find((entry) => entry.entry_type === "revenue") ?? null;
}

function buildSettledNodes(
  state: DemoState | null,
  money: MoneySnapshot,
  auditRows: number,
  health: HealthResponse | null,
): WorkflowNodeModel[] {
  const job = state?.job ?? null;
  const workflow = state?.workflow ?? null;
  const planningRun = state?.planning_run ?? null;
  const hermes = state?.hermes ?? null;
  const stripe = state?.stripe ?? null;
  const checks = state?.policy_checks ?? [];
  const approvedChecks = approvedPolicyChecks(state);
  const blockedChecks = blockedPolicyChecks(state);
  const outputs = state?.agent_outputs ?? [];
  const report = state?.report ?? null;
  const events = state?.events ?? [];
  const latestStripeInvoice = latestWhere(state?.stripe_events ?? [], (event) =>
    Boolean(event.invoice_id),
  );
  const latestPayment = latestWhere(state?.stripe_events ?? [], (event) => event.paid !== null);
  const latestPolicyCheck = checks[checks.length - 1] ?? null;

  return [
    {
      key: "customer",
      title: "Customer Intake",
      eyebrow: "workflow seed",
      proof: workflow
        ? `${workflow.client_name} - ${formatCurrency(workflow.invoice_amount_cents)} invoice`
        : job
          ? `${job.client_name} - ${formatCurrency(job.invoice_amount_cents)} invoice`
          : "Select or create a local workflow.",
      badge: workflow ? "workflow ready" : job ? "run loaded" : "needs workflow",
      status: workflow || job ? "complete" : "pending",
      tone: "teal",
      icon: Target,
      timestamp: workflow?.updated_at ?? job?.created_at ?? eventByType(events, "job_intake")?.created_at ?? null,
      position: NODE_POSITIONS.customer,
    },
    {
      key: "hermes",
      title: "Hermes Brain",
      eyebrow: "planning",
      proof: planningRun
        ? `${hermes?.provider ?? planningRun.provider} / ${hermes?.model ?? planningRun.model}`
        : "Planning proof appears after a run.",
      badge: hermes?.used_real_hermes ? "real Hermes" : planningRun?.source ?? "pending",
      status: hermesFailed(hermes, planningRun)
        ? "error"
        : planningRun?.status === "completed"
          ? "complete"
          : planningRun
            ? "current"
            : "pending",
      tone: "violet",
      icon: BrainCircuit,
      timestamp: planningRun?.completed_at ?? planningRun?.created_at ?? eventByType(events, "hermes_planning")?.created_at ?? null,
      position: NODE_POSITIONS.hermes,
    },
    {
      key: "stripe",
      title: "Stripe Test Invoice",
      eyebrow: "invoice",
      proof: stripe?.invoice_id
        ? `${stripe.customer_id ?? "customer pending"} / ${stripe.invoice_id}`
        : stripe?.error ?? "Stripe test invoice proof pending.",
      badge: stripeModeLabel(stripe),
      status: stripe?.error ? "error" : stripe?.invoice_id ? "complete" : "pending",
      tone: "sky",
      icon: CreditCard,
      timestamp: latestStripeInvoice?.created_at ?? eventByType(events, "stripe_test")?.created_at ?? null,
      position: NODE_POSITIONS.stripe,
    },
    {
      key: "payment",
      title: "Payment Status",
      eyebrow: "revenue gate",
      proof:
        stripe?.paid === true
          ? "Stripe reports paid=true."
          : stripe?.paid === false
            ? "Open/unpaid. Local confirmation is labeled separately."
            : "Payment state pending.",
      badge: stripe?.paid === true ? "paid" : stripe?.paid === false ? "open/unpaid" : "pending",
      status: stripe?.error
        ? "error"
        : stripe?.paid === true
          ? "complete"
          : stripe?.paid === false || stripe?.invoice_status === "open"
            ? "current"
            : "pending",
      tone: "amber",
      icon: ReceiptText,
      timestamp: latestPayment?.created_at ?? eventByType(events, "payment_confirmed")?.created_at ?? null,
      position: NODE_POSITIONS.payment,
    },
    {
      key: "policy",
      title: "Policy Gate",
      eyebrow: "local guardrails",
      proof: state?.policy.summary
        ? `${state.policy.summary.engine}: cap ${formatCurrency(state.policy.summary.max_job_spend_usd * 100)}, floor ${formatPercent(state.policy.summary.margin_floor_percent)}`
        : "Policy configuration pending.",
      badge: state?.policy.summary ? "local policy" : "pending",
      status: checks.length > 0 ? "complete" : state?.policy.summary ? "current" : "pending",
      tone: "violet",
      icon: ShieldCheck,
      timestamp: eventByType(events, "policy_gate")?.created_at ?? latestPolicyCheck?.created_at ?? null,
      position: NODE_POSITIONS.policy,
    },
    {
      key: "approved",
      title: "Approved Spend",
      eyebrow: "safe spend path",
      proof:
        approvedChecks.length > 0
          ? `${formatCurrency(approvedChecks.reduce((total, check) => total + check.requested_amount_cents, 0))} approved`
          : "Approved spend decisions pending.",
      badge: `${approvedChecks.length} approved`,
      status: approvedChecks.length > 0 ? "complete" : "pending",
      tone: "emerald",
      icon: WalletCards,
      timestamp: approvedChecks[approvedChecks.length - 1]?.created_at ?? null,
      position: NODE_POSITIONS.approved,
    },
    {
      key: "blocked",
      title: "Blocked Spend",
      eyebrow: "unsafe spend path",
      proof:
        blockedChecks.length > 0
          ? `${formatOptionalCurrency(money.blockedSpendCents)} blocked before ledger spend`
          : "Blocked spend decisions pending.",
      badge: blockedChecks[0]?.vendor ?? "guarded",
      status: blockedChecks.length > 0 ? "blocked" : "pending",
      tone: "rose",
      icon: Ban,
      timestamp: blockedChecks[blockedChecks.length - 1]?.created_at ?? null,
      position: NODE_POSITIONS.blocked,
    },
    {
      key: "agents",
      title: "Agent Work",
      eyebrow: "deliverables",
      proof: outputs.length > 0 ? `${outputs.length} deliverables recorded` : "Agent outputs pending.",
      badge: outputs.length > 0 ? `${outputs.length}/4 outputs` : "pending",
      status: outputs.length >= 4 ? "complete" : outputs.length > 0 ? "current" : "pending",
      tone: "teal",
      icon: Layers3,
      timestamp: outputs[outputs.length - 1]?.created_at ?? eventByType(events, "agent_work")?.created_at ?? null,
      position: NODE_POSITIONS.agents,
    },
    {
      key: "audit",
      title: "SQLite Audit",
      eyebrow: "records",
      proof:
        auditRows > 0
          ? `${auditRows} current-state records`
          : health?.database_exists
            ? "SQLite database is present; run proof pending."
            : "SQLite proof pending.",
      badge: health?.database_exists || state?.database.exists ? "SQLite active" : "pending",
      status: auditRows > 0 ? "complete" : health?.database_exists ? "current" : "pending",
      tone: "teal",
      icon: Database,
      timestamp: latestTimestamp([
        ...(state?.events ?? []),
        ...(state?.ledger.entries ?? []),
        ...(state?.stripe_events ?? []),
        ...(state?.policy_checks ?? []),
        ...(state?.agent_outputs ?? []),
        ...(state?.orchestration_calls ?? []),
        ...(state?.reports ?? []),
      ]),
      position: NODE_POSITIONS.audit,
    },
    {
      key: "report",
      title: "Profit Report",
      eyebrow: "economics",
      proof: report
        ? `${formatCurrency(report.gross_profit_cents)} profit, ${formatPercent(report.actual_margin_percent)} margin`
        : "Final report pending.",
      badge: report ? "report ready" : "pending",
      status: report ? "complete" : "pending",
      tone: "emerald",
      icon: FileText,
      timestamp: report?.created_at ?? eventByType(events, "profit_report")?.created_at ?? null,
      position: NODE_POSITIONS.report,
    },
  ];
}

function applyProgressState(
  nodes: WorkflowNodeModel[],
  progressIndex: number,
): WorkflowNodeModel[] {
  return nodes.map((node, index) => {
    if (index === progressIndex) {
      return { ...node, status: "current" };
    }
    if (index < progressIndex) {
      return {
        ...node,
        status: node.key === "blocked" ? "blocked" : "complete",
      };
    }

    return { ...node, status: "pending" };
  });
}

function auditCounts(state: DemoState | null, fallbackTotal: number): WorkflowAuditCounts {
  const events = state?.events.length ?? 0;
  const orchestrationCalls = state?.orchestration_calls.length ?? 0;
  const stripeEvents = state?.stripe_events.length ?? 0;
  const policyChecks = state?.policy_checks.length ?? 0;
  const ledgerEntries = state?.ledger.entries.length ?? 0;
  const reports = state?.reports.length ?? 0;
  const planningRuns = state?.planning_runs.length ?? 0;
  const agentOutputs = state?.agent_outputs.length ?? 0;
  const total =
    events +
    orchestrationCalls +
    stripeEvents +
    policyChecks +
    ledgerEntries +
    reports +
    planningRuns +
    agentOutputs;

  return {
    events,
    orchestrationCalls,
    stripeEvents,
    policyChecks,
    ledgerEntries,
    reports,
    planningRuns,
    agentOutputs,
    total: total || fallbackTotal,
  };
}
