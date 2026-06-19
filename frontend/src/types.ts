export interface HealthResponse {
  status: string;
  mode: string;
  database_path: string;
  database_exists: boolean;
}

export interface DemoJob {
  id: string;
  client_name: string;
  business_type: string;
  job_name: string;
  job_goal: string;
  invoice_amount_cents: number;
  spend_cap_cents: number;
  margin_floor_percent: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DemoEvent {
  id: string;
  job_id: string;
  type: string;
  title: string;
  detail: string;
  status: string;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  job_id: string;
  entry_type: "revenue" | "spend" | "adjustment";
  label: string;
  amount_cents: number;
  source: string;
  created_at: string;
}

export interface LedgerTotals {
  revenue_cents: number;
  approved_spend_cents: number;
  blocked_spend_cents: number;
  remaining_spend_cap_cents: number;
  payment_revenue_exists: boolean;
  gross_profit_cents: number;
  actual_margin_percent: number;
  projected_profit_cents: number;
  projected_margin_percent: number;
}

export interface PolicySummary {
  name: string;
  engine: string;
  stripe_live_mode: boolean;
  max_job_spend_usd: number;
  margin_floor_percent: number;
  require_invoice_before_spend: boolean;
  require_payment_before_spend: boolean;
  require_human_approval_above_usd: number;
  approved_vendors: string[];
  blocked_vendors: string[];
}

export interface PolicyCheck {
  id: string;
  job_id: string;
  request_type: string;
  vendor: string;
  requested_amount_cents: number;
  approved: 0 | 1 | boolean;
  reason: string;
  margin_after_spend_percent: number;
  required_action: string;
  created_at: string;
}

export interface StripeEvent {
  id: string;
  job_id: string;
  stripe_object_type: string;
  stripe_object_id: string;
  status: string;
  amount_cents: number;
  mode: string;
  created_at: string;
}

export interface AgentOutput {
  id: string;
  job_id: string;
  agent_name: string;
  status: string;
  summary: string;
  output_markdown: string;
  created_at: string;
}

export interface PlanningResult {
  operating_plan: unknown;
  agent_task_list: unknown[];
  campaign_strategy: unknown;
  executive_summary: string;
  proposed_tool_sequence: string[];
}

export interface PlanningRun {
  id: string;
  job_id: string;
  mode: string;
  provider: string;
  model: string;
  source: string;
  status: string;
  prompt_version: string;
  prompt_text: string;
  result_json: PlanningResult | null;
  summary: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface OrchestrationCall {
  id: string;
  job_id: string;
  planning_run_id: string | null;
  sequence: number;
  tool_name: string;
  tool_input_json: unknown;
  tool_output_json: unknown;
  status: string;
  duration_ms: number;
  error: string | null;
  created_at: string;
}

export interface HermesMetadata {
  mode: string;
  used_real_hermes: boolean;
  provider: string | null;
  model: string | null;
  skill_name: string | null;
  toolsets_used: string[];
  error: string | null;
  failure_reason: string | null;
  duration_ms: number;
  command_safety_summary: string;
  retry_count?: number;
  ok?: boolean;
}

export interface ProfitReport {
  id: string;
  job_id: string;
  revenue_cents: number;
  approved_spend_cents: number;
  blocked_spend_cents: number;
  gross_profit_cents: number;
  margin_percent: number;
  actual_margin_percent: number;
  policy_violations: number;
  recommendation: string;
  report_markdown: string;
  created_at: string;
}

export interface ReportPlaceholder {
  status: string;
  expected_revenue_cents: number;
  expected_approved_spend_cents: number;
  expected_gross_profit_cents: number;
  expected_margin_percent: number;
  recommendation: string;
}

export interface DemoState {
  mode: string;
  database: {
    initialized: boolean;
    path?: string;
    exists?: boolean;
  };
  job: DemoJob | null;
  jobs: DemoJob[];
  ledger: {
    entries: LedgerEntry[];
    totals: LedgerTotals;
  };
  policy: {
    config: Record<string, unknown>;
    summary: PolicySummary;
  };
  events: DemoEvent[];
  timeline_events: DemoEvent[];
  planning_runs: PlanningRun[];
  planning_run: PlanningRun | null;
  orchestration_calls: OrchestrationCall[];
  hermes: HermesMetadata;
  policy_checks: PolicyCheck[];
  stripe_events: StripeEvent[];
  agent_outputs: AgentOutput[];
  reports: ProfitReport[];
  report: ProfitReport | null;
  report_placeholder: ReportPlaceholder;
}

export interface DemoActionResponse {
  status: string;
  state: DemoState;
  decision?: Record<string, unknown> | null;
}
