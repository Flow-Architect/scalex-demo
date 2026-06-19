import { FileText, TrendingUp } from "lucide-react";

import { centsLabel, formatCurrency, formatDateTime, formatPercent } from "../format";
import type { LedgerTotals, ProfitReport as ProfitReportType, ReportPlaceholder } from "../types";

interface ProfitReportProps {
  report: ProfitReportType | null;
  totals: LedgerTotals | null;
  placeholder: ReportPlaceholder | null;
}

export function ProfitReport({ report, totals, placeholder }: ProfitReportProps) {
  const revenue = report?.revenue_cents ?? totals?.revenue_cents ?? placeholder?.expected_revenue_cents ?? 0;
  const approvedSpend =
    report?.approved_spend_cents ??
    totals?.approved_spend_cents ??
    placeholder?.expected_approved_spend_cents ??
    0;
  const blockedSpend = report?.blocked_spend_cents ?? totals?.blocked_spend_cents ?? 0;
  const grossProfit =
    report?.gross_profit_cents ??
    totals?.gross_profit_cents ??
    placeholder?.expected_gross_profit_cents ??
    0;
  const margin =
    report?.actual_margin_percent ??
    report?.margin_percent ??
    totals?.actual_margin_percent ??
    placeholder?.expected_margin_percent ??
    0;
  const recommendation = report?.recommendation ?? placeholder?.recommendation ?? "Pending";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Final profit report</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {report ? "Completed local demo report" : "Expected report after demo run"}
          </p>
        </div>
        <span className={report ? completeClass : pendingClass}>
          {report ? "Complete" : "Pending"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ReportMetric label="Revenue" value={formatCurrency(revenue)} detail={centsLabel(revenue)} />
        <ReportMetric
          label="Approved spend"
          value={formatCurrency(approvedSpend)}
          detail={centsLabel(approvedSpend)}
        />
        <ReportMetric
          label="Blocked unsafe spend"
          value={formatCurrency(blockedSpend)}
          detail={centsLabel(blockedSpend)}
        />
        <ReportMetric
          label="Gross profit"
          value={formatCurrency(grossProfit)}
          detail={centsLabel(grossProfit)}
        />
      </div>

      <div className="mt-5 border-t border-teal-200 pt-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-teal-700" aria-hidden="true" />
          <p className="text-sm font-semibold text-teal-950">Final margin</p>
        </div>
        <p className="mt-2 text-3xl font-semibold text-teal-950">{formatPercent(margin)}</p>
        <p className="mt-1 text-sm text-teal-800">Policy violations: {report?.policy_violations ?? 0}</p>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Recommendation
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{recommendation}</p>
      </div>

      {report ? (
        <p className="mt-4 text-xs text-slate-500">
          Generated {formatDateTime(report.created_at)}
        </p>
      ) : null}
    </section>
  );
}

const completeClass =
  "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-800";

const pendingClass =
  "rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600";

function ReportMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-t border-slate-200 pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
