PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  job_name TEXT NOT NULL,
  job_goal TEXT NOT NULL,
  invoice_amount_cents INTEGER NOT NULL,
  spend_cap_cents INTEGER NOT NULL,
  margin_floor_percent REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  stripe_object_type TEXT NOT NULL,
  stripe_object_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  mode TEXT NOT NULL,
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
