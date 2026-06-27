export interface HealthResponse {
  status: string;
  mode: string;
  database_path: string;
  database_exists: boolean;
}

export interface ExecutionSummary {
  mode: "demo" | "full_proof";
  label: string;
  requested_full_proof: boolean;
  planning_label: string;
  finance_label: string;
  policy_label: string;
  guardrail_mode: GuardrailMode;
  guardrail_adapter_status: string;
  guardrail_label: string;
  used_real_nemo: boolean;
  guardrails_fail_closed: boolean;
  guardrail_evaluation_stages: GuardrailStageSummary[];
  used_real_hermes: boolean;
  used_real_stripe: boolean;
  hermes_runtime: string;
  hermes_runtime_status: string;
  hermes_api_base_url: string | null;
  hermes_api_endpoint: string | null;
  hermes_sandbox_name: string | null;
  hermes_upstream_provider: string | null;
  hermes_upstream_model: string | null;
  hermes_error_class: string | null;
  planning_source: string | null;
  stripe_mode: string | null;
  truthfulness_note: string;
}

export interface AuthStatus {
  auth_enabled: boolean;
  authenticated: boolean;
  username: string | null;
  prototype_auth: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface OnboardingRequest {
  client_name: string;
  business_type: string;
  job_name: string;
  job_goal: string;
  invoice_amount_usd: number;
  spend_cap_usd: number;
  margin_floor_percent: number;
  approved_vendors: string[];
  blocked_vendors: string[];
}

export interface DemoJob {
  id: string;
  workflow_id: string | null;
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

export interface WorkflowConfig {
  id: string;
  client_name: string;
  business_type: string;
  job_name: string;
  job_goal: string;
  invoice_amount_cents: number;
  spend_cap_cents: number;
  margin_floor_percent: number;
  approved_vendors: string[];
  blocked_vendors: string[];
  seed_config_json: {
    clientName?: string;
    businessType?: string;
    jobName?: string;
    jobGoal?: string;
    invoiceAmountUsd?: number;
    spendCapUsd?: number;
    marginFloorPercent?: number;
    approvedVendors?: string[];
    blockedVendors?: string[];
    approvedSpendRequests?: Array<{ vendor: string; amountUsd: number; purpose?: string }>;
    blockedSpendRequests?: Array<{ vendor: string; amountUsd: number; purpose?: string }>;
  };
  is_active: boolean;
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

export type GuardrailMode = "local_policy" | "nemo_guardrails" | "nemo_compatible";

export interface GuardrailStageSummary {
  stage: "input" | "planning" | "execution" | "output";
  label: string;
  purpose: string;
  status: string;
  decision: string;
  mode: GuardrailMode;
  adapter: string;
  used_real_nemo: boolean;
  fail_closed: boolean;
  summary: string;
  created_at: string | null;
}

export interface GuardrailSummary {
  mode: GuardrailMode;
  adapter: string;
  adapter_status: string;
  status: string;
  used_real_nemo: boolean;
  fail_closed: boolean;
  blocked: boolean;
  local_policy_active: boolean;
  record_evaluations: boolean;
  evaluation_stages: GuardrailStageSummary[];
  nemo_python_configured: boolean;
  nemo_config_path: string;
  latest_error: string | null;
  truthfulness_note: string;
}

export interface GuardrailEvaluation {
  id: string;
  job_id: string;
  stage: GuardrailStageSummary["stage"];
  mode: GuardrailMode;
  adapter: string;
  status: string;
  used_real_nemo: boolean;
  fail_closed: boolean;
  label: string;
  summary: string;
  details_json: unknown;
  error: string | null;
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
  provider_mode: string | null;
  livemode: boolean;
  raw_object_json: unknown;
  currency: string | null;
  customer_id: string | null;
  invoice_id: string | null;
  payment_link_id: string | null;
  payment_link_url: string | null;
  hosted_invoice_url: string | null;
  checkout_session_id: string | null;
  payment_intent_id: string | null;
  idempotency_key: string | null;
  diagnostic_reason: string | null;
  invoice_status: string | null;
  paid: boolean | null;
  created_at: string;
}

export interface StripeSummary {
  stripe_mode: string;
  used_real_stripe: boolean;
  livemode: boolean | null;
  customer_id: string | null;
  invoice_id: string | null;
  hosted_invoice_url: string | null;
  invoice_status: string | null;
  paid: boolean | null;
  error: string | null;
  diagnostic_reason: string | null;
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
  runtime?: string;
  mode: string;
  used_real_hermes: boolean;
  provider: string | null;
  model: string | null;
  skill_name: string | null;
  toolsets_used: string[];
  error: string | null;
  failure_reason: string | null;
  duration_ms: number;
  runtime_status?: string;
  api_base_url?: string | null;
  api_endpoint?: string | null;
  sandbox_name?: string | null;
  upstream_provider?: string | null;
  upstream_model?: string | null;
  error_class?: string | null;
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

export interface CommandCenterClientRecord {
  client_name: string;
  business_type: string;
  primary_contact: string;
  contact_email: string | null;
  contact_phone: string | null;
  job_name: string;
  job_goal: string;
  invoice_amount_cents: number;
  spend_cap_cents: number;
  margin_floor_percent: number;
  service_notes: string;
  source: string;
  status: string;
}

export interface CommandCenterEmployeeRecord {
  employee_name: string;
  role_title: string;
  base_hourly_rate_cents: number;
  labor_burden_percent: number;
  fully_loaded_hourly_rate_cents: number;
  assigned_hours: number;
  labor_cost_cents: number;
  skill_category: string;
  active: boolean;
  status: string;
  notes: string;
  source: string;
}

export interface CommandCenterReviewState {
  source: string;
  file_name: string;
  file_type: string;
  status: string;
  confidence: string;
  missing_fields: string[];
  low_confidence_fields: string[];
  editable_before_save: boolean;
  silent_save: boolean;
}

export interface CommandCenterAuditEvent {
  type: string;
  title: string;
  status: string;
  detail: string;
}

export interface CommandCenterState {
  mission_control: {
    active_client: string;
    business_type: string;
    active_job: string;
    job_goal: string;
    invoice_amount_cents: number;
    spend_cap_cents: number;
    margin_floor_percent: number;
    approved_vendor_spend_cents: number;
    blocked_spend_cents: number;
    labor_cost_cents: number;
    projected_profit_cents: number;
    final_margin_after_labor_percent: number;
    runtime_mode: string;
    overall_status: string;
  };
  runtime_route: {
    route: string[];
    runtime: string;
    endpoint: string | null;
    sandbox: string | null;
    model: string | null;
    provider: string | null;
    upstream_model: string | null;
    status: string;
    duration_ms: number;
    error_class: string | null;
    used_real_hermes: boolean;
  };
  client_onboarding: {
    saved_record: CommandCenterClientRecord;
    extracted_review: CommandCenterReviewState;
  };
  employee_onboarding: {
    saved_records: CommandCenterEmployeeRecord[];
    extracted_review: CommandCenterReviewState;
  };
  document_intake: {
    accepted_file_types: string[];
    storage_policy: string;
    external_services: boolean;
    manual_entry_available: boolean;
    states: Array<{
      scope: string;
      file_type: string;
      status: string;
      message: string;
    }>;
  };
  labor_costing: {
    formula: string;
    employees: CommandCenterEmployeeRecord[];
    total_labor_cost_cents: number;
    gross_profit_after_labor_cents: number;
    final_margin_after_labor_percent: number;
    margin_floor_percent: number;
    margin_warning: boolean;
    status: string;
  };
  final_profit_report: {
    client_name: string;
    job_name: string;
    revenue_cents: number;
    approved_vendor_spend_cents: number;
    blocked_spend_cents: number;
    labor_cost_cents: number;
    gross_profit_after_labor_cents: number;
    final_margin_after_labor_percent: number;
    margin_floor_percent: number;
    policy_violations: number;
    decision: string;
    recommendation: string;
  };
  audit_events: CommandCenterAuditEvent[];
  safety_proof: string[];
}

export interface OnboardingConfig {
  id: string;
  config_json: {
    clientName?: string;
    businessType?: string;
    jobName?: string;
    jobGoal?: string;
    invoiceAmountUsd?: number;
    spendCapUsd?: number;
    marginFloorPercent?: number;
    approvedVendors?: string[];
    blockedVendors?: string[];
  };
  created_at: string;
}

export interface DemoState {
  mode: string;
  execution: ExecutionSummary;
  command_center: CommandCenterState;
  database: {
    initialized: boolean;
    path?: string;
    exists?: boolean;
    table_counts?: Record<string, number>;
  };
  workflow: WorkflowConfig | null;
  workflows: WorkflowConfig[];
  selected_run_id: string | null;
  job: DemoJob | null;
  jobs: DemoJob[];
  runs: DemoJob[];
  onboarding: OnboardingConfig | null;
  ledger: {
    entries: LedgerEntry[];
    totals: LedgerTotals;
  };
  policy: {
    config: Record<string, unknown>;
    summary: PolicySummary;
  };
  guardrails: GuardrailSummary;
  guardrail_evaluations: GuardrailEvaluation[];
  events: DemoEvent[];
  timeline_events: DemoEvent[];
  planning_runs: PlanningRun[];
  planning_run: PlanningRun | null;
  orchestration_calls: OrchestrationCall[];
  hermes: HermesMetadata;
  stripe: StripeSummary;
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
