PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT,
  client_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  job_name TEXT NOT NULL,
  job_goal TEXT NOT NULL,
  invoice_amount_cents INTEGER NOT NULL,
  spend_cap_cents INTEGER NOT NULL,
  margin_floor_percent REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  job_name TEXT NOT NULL,
  job_goal TEXT NOT NULL,
  invoice_amount_cents INTEGER NOT NULL,
  spend_cap_cents INTEGER NOT NULL,
  margin_floor_percent REAL NOT NULL,
  approved_vendors_json TEXT NOT NULL,
  blocked_vendors_json TEXT NOT NULL,
  seed_config_json TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS onboarding_configs (
  id TEXT PRIMARY KEY,
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workflows_active_updated
  ON workflows(is_active, updated_at);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planning_runs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  result_json TEXT,
  summary TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orchestration_calls (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  planning_run_id TEXT,
  sequence INTEGER NOT NULL,
  tool_name TEXT NOT NULL,
  tool_input_json TEXT NOT NULL,
  tool_output_json TEXT,
  status TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  error TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY(planning_run_id) REFERENCES planning_runs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_planning_runs_job_created
  ON planning_runs(job_id, created_at);

CREATE INDEX IF NOT EXISTS idx_orchestration_calls_job_sequence
  ON orchestration_calls(job_id, sequence);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK(entry_type IN ('revenue', 'spend', 'adjustment')),
  label TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS policy_checks (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  request_type TEXT NOT NULL,
  vendor TEXT NOT NULL,
  requested_amount_cents INTEGER NOT NULL,
  approved INTEGER NOT NULL,
  reason TEXT NOT NULL,
  margin_after_spend_percent REAL NOT NULL,
  required_action TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS guardrail_evaluations (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  stage TEXT NOT NULL CHECK(stage IN ('input', 'planning', 'execution', 'output')),
  mode TEXT NOT NULL,
  adapter TEXT NOT NULL,
  status TEXT NOT NULL,
  used_real_nemo INTEGER NOT NULL DEFAULT 0,
  fail_closed INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  summary TEXT NOT NULL,
  details_json TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guardrail_evaluations_job_created
  ON guardrail_evaluations(job_id, created_at);

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  stripe_object_type TEXT NOT NULL,
  stripe_object_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  mode TEXT NOT NULL,
  provider_mode TEXT,
  livemode INTEGER NOT NULL DEFAULT 0,
  raw_object_json TEXT,
  currency TEXT,
  customer_id TEXT,
  invoice_id TEXT,
  payment_link_id TEXT,
  payment_link_url TEXT,
  hosted_invoice_url TEXT,
  checkout_session_id TEXT,
  payment_intent_id TEXT,
  idempotency_key TEXT,
  diagnostic_reason TEXT,
  invoice_status TEXT,
  paid INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agent_outputs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  output_markdown TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  revenue_cents INTEGER NOT NULL,
  approved_spend_cents INTEGER NOT NULL,
  blocked_spend_cents INTEGER NOT NULL,
  gross_profit_cents INTEGER NOT NULL,
  margin_percent REAL NOT NULL,
  policy_violations INTEGER NOT NULL,
  recommendation TEXT NOT NULL,
  report_markdown TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
