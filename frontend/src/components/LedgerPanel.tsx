import { BookOpenCheck } from "lucide-react";

import { formatCurrency, formatDateTime, humanize } from "../format";
import type { LedgerEntry, LedgerTotals } from "../types";

interface LedgerPanelProps {
  entries: LedgerEntry[];
  totals: LedgerTotals | null;
}

export function LedgerPanel({ entries, totals }: LedgerPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-slate-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Evidence ledger</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Local SQLite entries for booked revenue and approved setup spend.
          </p>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          SQLite
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          Ledger entries appear after payment and approved setup spend.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3">
                    <span className={entryClass(entry.entry_type)}>
                      {humanize(entry.entry_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-950">{entry.label}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.source} - {formatDateTime(entry.created_at)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-950">
                    {formatCurrency(entry.amount_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totals ? (
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <Total label="Revenue" value={formatCurrency(totals.revenue_cents)} />
          <Total label="Approved setup spend" value={formatCurrency(totals.approved_spend_cents)} />
          <Total label="Remaining cap" value={formatCurrency(totals.remaining_spend_cap_cents)} />
        </dl>
      ) : null}
    </section>
  );
}

function entryClass(type: LedgerEntry["entry_type"]): string {
  const base = "inline-flex rounded-md border px-2 py-1 text-xs font-medium";
  if (type === "revenue") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-800`;
  }
  if (type === "spend") {
    return `${base} border-sky-200 bg-sky-50 text-sky-800`;
  }
  return `${base} border-slate-200 bg-slate-50 text-slate-700`;
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-slate-200 pt-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
