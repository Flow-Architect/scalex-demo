import { formatCurrency, formatPercent, humanize } from "../format";
import type {
  DemoEvent,
  DemoState,
  HermesMetadata,
  PlanningRun,
  PolicyCheck,
  StripeSummary,
} from "../types";

export type BusyAction = "initial" | "refresh" | "run" | "reset" | null;

export interface MoneySnapshot {
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

const LOCKED_DEMO_BLOCKED_SPEND_CENTS = 320_000;

export function moneySnapshot(state: DemoState | null): MoneySnapshot {
  const report = state?.report ?? null;
  const totals = state?.ledger.totals ?? null;
  const placeholder = state?.report_placeholder ?? null;
  const job = state?.job ?? null;
  const workflow = state?.workflow ?? null;
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
    spendCapCents: job?.spend_cap_cents ?? workflow?.spend_cap_cents ?? null,
    marginFloorPercent:
      job?.margin_floor_percent ??
      workflow?.margin_floor_percent ??
      state?.policy.summary.margin_floor_percent ??
      null,
  };
}

export function auditRowCount(state: DemoState | null): number {
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

export function runStatusLabel(
  state: DemoState | null,
  busyAction: BusyAction,
  error: string | null,
): string {
  if (busyAction === "initial") {
    return "Loading backend state";
  }
  if (busyAction === "run") {
    return "Running selected client operation";
  }
  if (busyAction === "reset") {
    return "Updating local data";
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

export function stripeBadgeValue(stripe: StripeSummary | null): string {
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

export function stripeModeLabel(stripe: StripeSummary | null): string {
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

export function hermesFailed(
  hermes: HermesMetadata | null,
  planningRun: PlanningRun | null,
): boolean {
  return Boolean(planningRun?.error || hermes?.failure_reason || hermes?.error);
}

export function isApproved(check: PolicyCheck): boolean {
  return Boolean(check.approved);
}

export function eventByType(events: DemoEvent[], type: string): DemoEvent | null {
  return latestWhere(events, (event) => event.type === type);
}

export function latestWhere<T>(items: T[], predicate: (item: T) => boolean): T | null {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return items[index];
    }
  }
  return null;
}

export function latestTimestamp(items: Array<{ created_at?: string | null }>): string | null {
  const timestamps = items.map((item) => item.created_at).filter(Boolean) as string[];
  return timestamps.length > 0 ? timestamps[timestamps.length - 1] : null;
}

export function operatingPlanPhases(plan: PlanningRun["result_json"]): string[] {
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

export function taskRows(tasks: unknown[]): Array<{ agent: string; task: string }> {
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

export function displayValue(value: unknown): string {
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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function formatOptionalCurrency(cents: number | null | undefined): string {
  return cents === null || cents === undefined ? "Pending" : formatCurrency(cents);
}

export function formatOptionalPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? "Pending" : formatPercent(value);
}
