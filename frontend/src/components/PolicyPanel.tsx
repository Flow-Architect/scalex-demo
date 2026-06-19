import { Ban, CheckCircle2, ShieldCheck } from "lucide-react";

import { formatCurrency, formatDateTime, formatPercent } from "../format";
import type { PolicyCheck, PolicySummary } from "../types";

interface PolicyPanelProps {
  summary: PolicySummary | null;
  checks: PolicyCheck[];
}

export function PolicyPanel({ summary, checks }: PolicyPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Policy guardrails</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {summary?.engine ?? "local policy engine"}
          </p>
        </div>
        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
          Local policy
        </span>
      </div>

      {summary ? (
        <dl className="mt-5 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
          <PolicyRule label="Spend cap" value={formatCurrency(summary.max_job_spend_usd * 100)} />
          <PolicyRule label="Margin floor" value={formatPercent(summary.margin_floor_percent)} />
          <PolicyRule
            label="Human approval"
            value={`Over ${formatCurrency(summary.require_human_approval_above_usd * 100)}`}
          />
          <PolicyRule
            label="Payment before spend"
            value={summary.require_payment_before_spend ? "Required" : "Not required"}
          />
          <PolicyRule label="Approved vendors" value={summary.approved_vendors.join(", ")} />
          <PolicyRule label="Blocked vendors" value={summary.blocked_vendors.join(", ")} />
        </dl>
      ) : null}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-950">Spend checks</h3>
        {checks.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            Spend decisions appear after the demo runs.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {checks.map((check) => {
              const approved = Boolean(check.approved);
              const Icon = approved ? CheckCircle2 : Ban;
              return (
                <article
                  className={`rounded-lg border p-4 ${
                    approved
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-rose-200 bg-rose-50"
                  }`}
                  key={check.id}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`mt-1 h-5 w-5 ${
                        approved ? "text-emerald-700" : "text-rose-700"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {check.vendor}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-slate-600">
                            {approved ? "Approved" : "Blocked"}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-950">
                          {formatCurrency(check.requested_amount_cents)}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{check.reason}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                          Margin after: {formatPercent(check.margin_after_spend_percent)}
                        </span>
                        <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                          Action: {check.required_action}
                        </span>
                        <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                          {formatDateTime(check.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function PolicyRule({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-slate-200 pt-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
