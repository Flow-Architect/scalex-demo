import { BriefcaseBusiness, CheckCircle2, Target } from "lucide-react";

import { formatCurrency, formatDateTime, formatPercent, humanize } from "../format";
import type { DemoJob, LedgerTotals } from "../types";

interface JobIntakeCardProps {
  job: DemoJob | null;
  totals: LedgerTotals | null;
}

export function JobIntakeCard({ job, totals }: JobIntakeCardProps) {
  if (!job) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5">
        <div className="flex items-start gap-3">
          <BriefcaseBusiness className="mt-1 h-5 w-5 text-slate-500" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-slate-950">Client operation intake</h2>
            <p className="mt-2 text-sm text-slate-600">
              Run the local demo to create the Northstar Dental Group implementation launch.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Active operation</h2>
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-950">{job.client_name}</p>
          <p className="mt-1 text-sm text-slate-600">{job.job_name}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {humanize(job.status)}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">{job.job_goal}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Invoice" value={formatCurrency(job.invoice_amount_cents)} />
        <Metric label="Spend cap" value={formatCurrency(job.spend_cap_cents)} />
        <Metric label="Margin floor" value={formatPercent(job.margin_floor_percent)} />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-amber-700" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-950">Margin plan</h3>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Metric
            label="Projected profit"
            value={formatCurrency(totals?.projected_profit_cents ?? 0)}
          />
          <Metric
            label="Projected margin"
            value={formatPercent(totals?.projected_margin_percent ?? 0)}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Created {formatDateTime(job.created_at)}. Updated {formatDateTime(job.updated_at)}.
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-slate-200 pl-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
