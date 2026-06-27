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

import { formatCurrency, formatPercent, humanize } from "../../format";
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
  guardrailEvaluations: number;
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
  customer: { x: 2, y: 34, width: 11, height: 19 },
  hermes: { x: 16, y: 34, width: 11, height: 19 },
  stripe: { x: 30, y: 34, width: 11, height: 19 },
  payment: { x: 44, y: 34, width: 11, height: 19 },
  policy: { x: 58, y: 34, width: 11, height: 19 },
  approved: { x: 72, y: 8, width: 11, height: 19 },
  blocked: { x: 72, y: 63, width: 11, height: 19 },
  agents: { x: 86, y: 8, width: 11, height: 19 },
  audit: { x: 86, y: 45, width: 11, height: 19 },
  report: { x: 86, y: 79, width: 11, height: 18 },
};

export const WORKFLOW_CANVAS_WIDTH = 100;
export const WORKFLOW_CANVAS_HEIGHT = 100;

function planningBadgeLabel(source: string | null | undefined, usedRealHermes: boolean | undefined): string {
  if (usedRealHermes) {
    return "real Hermes";
  }
  if (!source) {
    return "awaiting run";
  }
  if (source === "deterministic_demo" || source === "deterministic_test" || source === "test_double") {
    return "deterministic local plan";
  }
  return humanize(source);
}

function planningProofText(
  planningRun: DemoState["planning_run"] | null,
  hermes: DemoState["hermes"] | null,
): string {
  if (!planningRun) {
    return "Planning proof appears after a run.";
  }
  if (hermes?.used_real_hermes) {
    return `${hermes.provider ?? planningRun.provider} / ${hermes.model ?? planningRun.model}`;
  }
  return "Deterministic local planning proof recorded for this client operation.";
}

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
      { from: "policy", to: "approved", tone: "emerald", label: "approved" },
      { from: "policy", to: "blocked", tone: "rose", label: "blocked" },
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
  const execution = state?.execution ?? null;
  const guardrails = state?.guardrails ?? null;
  const checks = state?.policy_checks ?? [];
  const approvedChecks = approvedPolicyChecks(state);
  const blockedChecks = blockedPolicyChecks(state);
  const outputs = state?.agent_outputs ?? [];
  const report = state?.report ?? null;
  const revenueEntry = revenueLedgerEntry(state);
  const events = state?.events ?? [];
  const latestStripeInvoice = latestWhere(state?.stripe_events ?? [], (event) =>
    Boolean(event.invoice_id),
  );
  const latestPayment = latestWhere(state?.stripe_events ?? [], (event) => event.paid !== null);
  const latestPolicyCheck = checks[checks.length - 1] ?? null;

  return [
    {
      key: "customer",
      title: "Input Rail",
      eyebrow: "passed",
      proof: workflow
        ? `${workflow.client_name} - ${formatCurrency(workflow.invoice_amount_cents)} invoice`
        : job
          ? `${job.client_name} - ${formatCurrency(job.invoice_amount_cents)} invoice`
        : "Select or create a local client operation.",
      badge: job ? "input passed" : workflow ? "operation ready" : "preloaded",
      status: workflow || job ? "complete" : "pending",
      tone: "teal",
      icon: Target,
      timestamp: eventByType(events, "run_started")?.created_at ?? job?.created_at ?? workflow?.updated_at ?? eventByType(events, "job_intake")?.created_at ?? null,
      position: NODE_POSITIONS.customer,
    },
    {
      key: "hermes",
      title: "Hermes Plan Created",
      eyebrow: "planning rail",
      proof: planningProofText(planningRun, hermes),
      badge: planningBadgeLabel(planningRun?.source, hermes?.used_real_hermes),
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
      title: "Finance Rail",
      eyebrow: stripe?.used_real_stripe ? "Stripe test mode" : "sandbox finance",
      proof: stripe?.invoice_id
        ? `${stripe.customer_id ?? "customer not recorded"} / ${stripe.invoice_id}`
        : stripe?.error ?? "Stripe test invoice proof appears after launch.",
      badge: stripe?.used_real_stripe
        ? "real Stripe test"
        : stripe?.stripe_mode === "test_double"
          ? "sandbox proof"
          : stripeModeLabel(stripe),
      status: stripe?.error ? "error" : stripe?.invoice_id ? "complete" : "pending",
      tone: "sky",
      icon: CreditCard,
      timestamp: latestStripeInvoice?.created_at ?? eventByType(events, "stripe_test")?.created_at ?? null,
      position: NODE_POSITIONS.stripe,
    },
    {
      key: "payment",
      title: "Revenue Gate Verified",
      eyebrow: "revenue gate",
      proof:
        stripe?.paid === true
          ? "Stripe reports paid=true."
          : revenueEntry
            ? "Stripe is open/unpaid; local test revenue confirmation is recorded separately."
          : stripe?.paid === false
            ? "Open/unpaid. Local confirmation is labeled separately."
            : "Finance proof awaiting run.",
      badge: stripe?.paid === true ? "paid" : revenueEntry ? "local confirmed" : stripe?.paid === false ? "open/unpaid" : "awaiting proof",
      status: stripe?.error
        ? "error"
        : stripe?.paid === true
          ? "complete"
          : revenueEntry
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
      title: "Policy Rail",
      eyebrow: guardrails?.mode ? humanize(guardrails.mode) : "local guardrails",
      proof: guardrails
        ? `${execution?.guardrail_label ?? guardrails.adapter_status}; local policy active=${String(guardrails.local_policy_active)}`
        : state?.policy.summary
          ? `${state.policy.summary.engine}: cap ${formatCurrency(state.policy.summary.max_job_spend_usd * 100)}, floor ${formatPercent(state.policy.summary.margin_floor_percent)}`
        : "Policy configuration appears after setup.",
      badge: guardrails?.fail_closed
        ? "fail closed"
        : guardrails?.used_real_nemo
          ? "real NeMo verified"
          : execution?.guardrail_label ?? execution?.policy_label ?? (state?.policy.summary ? "local policy" : "not configured"),
      status: guardrails?.fail_closed
        ? "error"
        : checks.length > 0 || (state?.guardrail_evaluations.length ?? 0) > 0
          ? "complete"
          : state?.policy.summary
            ? "current"
            : "pending",
      tone: "violet",
      icon: ShieldCheck,
      timestamp: eventByType(events, "policy_gate")?.created_at ?? latestPolicyCheck?.created_at ?? null,
      position: NODE_POSITIONS.policy,
    },
    {
      key: "approved",
      title: "Approved Setup Spend",
      eyebrow: "execution rail",
      proof:
        approvedChecks.length > 0
          ? `${formatCurrency(approvedChecks.reduce((total, check) => total + check.requested_amount_cents, 0))} approved`
          : "Approved setup spend decisions appear after launch.",
      badge: `${approvedChecks.length} approved`,
      status: approvedChecks.length > 0 ? "complete" : "pending",
      tone: "emerald",
      icon: WalletCards,
      timestamp: approvedChecks[approvedChecks.length - 1]?.created_at ?? null,
      position: NODE_POSITIONS.approved,
    },
    {
      key: "blocked",
      title: "Blocked Risky Spend",
      eyebrow: "unsafe spend path",
      proof:
        blockedChecks.length > 0
          ? `${formatOptionalCurrency(money.blockedSpendCents)} blocked before ledger spend`
          : "Blocked risk decisions appear after launch.",
      badge: blockedChecks[0]?.vendor ?? "guarded",
      status: blockedChecks.length > 0 ? "blocked" : "pending",
      tone: "rose",
      icon: Ban,
      timestamp: blockedChecks[blockedChecks.length - 1]?.created_at ?? null,
      position: NODE_POSITIONS.blocked,
    },
    {
      key: "agents",
      title: "Execution Rail",
      eyebrow: "work completed",
      proof: outputs.length > 0 ? `${outputs.length} deliverables recorded` : "Launch work appears after execution.",
      badge: outputs.length > 0 ? `${outputs.length}/4 outputs` : "awaiting work",
      status: outputs.length >= 4 ? "complete" : outputs.length > 0 ? "current" : "pending",
      tone: "teal",
      icon: Layers3,
      timestamp: outputs[outputs.length - 1]?.created_at ?? eventByType(events, "agent_work")?.created_at ?? null,
      position: NODE_POSITIONS.agents,
    },
    {
      key: "audit",
      title: "Evidence Rail",
      eyebrow: "records",
      proof:
        auditRows > 0
          ? `${auditRows} timeline, orchestration, finance, policy, ledger, work, and report records`
          : health?.database_exists
            ? "SQLite database is present; run proof is not recorded yet."
            : "SQLite proof appears after launch.",
      badge: health?.database_exists || state?.database.exists ? "SQLite active" : "not recorded",
      status: auditRows > 0 ? "complete" : health?.database_exists ? "current" : "pending",
      tone: "teal",
      icon: Database,
      timestamp: latestTimestamp([
        ...(state?.events ?? []),
        ...(state?.ledger.entries ?? []),
        ...(state?.stripe_events ?? []),
        ...(state?.policy_checks ?? []),
        ...(state?.guardrail_evaluations ?? []),
        ...(state?.agent_outputs ?? []),
        ...(state?.orchestration_calls ?? []),
        ...(state?.reports ?? []),
      ]),
      position: NODE_POSITIONS.audit,
    },
    {
      key: "report",
      title: "Profit Rail",
      eyebrow: "economics",
      proof: report
        ? `${formatOptionalCurrency(money.grossProfitCents)} profit, ${formatPercent(money.marginPercent ?? report.actual_margin_percent)} margin`
        : "Final report appears after execution.",
      badge: report ? "report ready" : "awaiting outcome",
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
  const guardrailEvaluations = state?.guardrail_evaluations.length ?? 0;
  const ledgerEntries = state?.ledger.entries.length ?? 0;
  const reports = state?.reports.length ?? 0;
  const planningRuns = state?.planning_runs.length ?? 0;
  const agentOutputs = state?.agent_outputs.length ?? 0;
  const total =
    events +
    orchestrationCalls +
    stripeEvents +
    policyChecks +
    guardrailEvaluations +
    ledgerEntries +
    reports +
    planningRuns +
    agentOutputs;

  return {
    events,
    orchestrationCalls,
    stripeEvents,
    policyChecks,
    guardrailEvaluations,
    ledgerEntries,
    reports,
    planningRuns,
    agentOutputs,
    total: total || fallbackTotal,
  };
}
