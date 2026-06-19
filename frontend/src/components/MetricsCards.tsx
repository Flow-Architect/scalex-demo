import {
  Ban,
  CircleDollarSign,
  Percent,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { centsLabel, formatCurrency, formatPercent } from "../format";
import type { LedgerTotals, ProfitReport, ReportPlaceholder } from "../types";

interface MetricsCardsProps {
  totals: LedgerTotals | null;
  report: ProfitReport | null;
  placeholder: ReportPlaceholder | null;
}

export function MetricsCards({
  totals,
  report,
  placeholder,
}: MetricsCardsProps) {
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

  const cards = [
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      detail: centsLabel(revenue),
      icon: CircleDollarSign,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    {
      label: "Approved spend",
      value: formatCurrency(approvedSpend),
      detail: centsLabel(approvedSpend),
      icon: WalletCards,
      tone: "border-sky-200 bg-sky-50 text-sky-800",
    },
    {
      label: "Blocked unsafe spend",
      value: formatCurrency(blockedSpend),
      detail: centsLabel(blockedSpend),
      icon: Ban,
      tone: "border-rose-200 bg-rose-50 text-rose-800",
    },
    {
      label: "Gross profit",
      value: formatCurrency(grossProfit),
      detail: centsLabel(grossProfit),
      icon: TrendingUp,
      tone: "border-teal-200 bg-teal-50 text-teal-800",
    },
    {
      label: "Final margin",
      value: formatPercent(margin),
      detail: "Margin floor protected",
      icon: Percent,
      tone: "border-amber-200 bg-amber-50 text-amber-800",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={card.label}
          >
            <div
              className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border ${card.tone}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
