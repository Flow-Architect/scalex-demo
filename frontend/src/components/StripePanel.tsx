import { AlertTriangle, CreditCard, ExternalLink, ReceiptText } from "lucide-react";

import { formatCurrency, formatDateTime, humanize } from "../format";
import type { StripeEvent, StripeSummary } from "../types";

interface StripePanelProps {
  events: StripeEvent[];
  summary: StripeSummary | null;
}

export function StripePanel({ events, summary }: StripePanelProps) {
  const mode = summary?.stripe_mode ?? "not_configured";
  const usedRealStripe = Boolean(summary?.used_real_stripe);
  const failed = Boolean(summary?.error);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Stripe records</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {usedRealStripe
              ? "Real Stripe test-mode objects with no live-money movement."
              : mode === "test_double"
                ? "Stripe test-double records for tests or diagnostics."
                : "Stripe test-mode records appear after the demo runs."}
          </p>
        </div>
        <span className={failed ? errorPillClass : modePillClass(usedRealStripe)}>
          {failed ? "Stripe error" : humanize(mode)}
        </span>
      </div>

      {failed ? (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <div>
            <p className="font-semibold">Stripe integration error</p>
            <p className="mt-1">{summary?.error}</p>
          </div>
        </div>
      ) : null}

      {summary && !failed ? (
        <dl className="mt-5 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
          <Fact label="Real Stripe" value={summary.used_real_stripe ? "used_real_stripe=true" : "used_real_stripe=false"} />
          <Fact
            label="Livemode"
            value={summary.livemode === null ? "Pending" : `livemode=${String(summary.livemode)}`}
          />
          <Fact label="Customer" value={summary.customer_id ?? "Pending"} />
          <Fact label="Invoice" value={summary.invoice_id ?? "Pending"} />
          <Fact label="Invoice status" value={summary.invoice_status ?? "Pending"} />
          <Fact label="Paid" value={summary.paid === null ? "Pending" : String(summary.paid)} />
          {summary.hosted_invoice_url ? (
            <div className="border-t border-slate-200 pt-3 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Hosted invoice
              </dt>
              <dd className="mt-1">
                <a
                  className="inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-sky-700 hover:text-sky-900"
                  href={summary.hosted_invoice_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {summary.hosted_invoice_url}
                  <ExternalLink className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                </a>
              </dd>
            </div>
          ) : null}
          {summary.diagnostic_reason ? (
            <Fact label="Diagnostic" value={summary.diagnostic_reason} />
          ) : null}
        </dl>
      ) : null}

      {events.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          Stripe records appear after the demo runs.
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-200">
          {events.map((event) => (
            <article className="py-4 first:pt-0 last:pb-0" key={event.id}>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-md border border-sky-200 bg-sky-50 text-sky-800">
                  <ReceiptText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {humanize(event.stripe_object_type)}
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-600">
                        {event.stripe_object_id}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(event.amount_cents)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                      {humanize(event.status)}
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                      {event.mode}
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                      livemode={String(event.livemode)}
                    </span>
                    {event.invoice_status ? (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                        invoice {event.invoice_status}
                      </span>
                    ) : null}
                    {event.paid !== null ? (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                        paid={String(event.paid)}
                      </span>
                    ) : null}
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                      {formatDateTime(event.created_at)}
                    </span>
                  </div>
                  {event.hosted_invoice_url ? (
                    <a
                      className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-xs font-medium text-sky-700 hover:text-sky-900"
                      href={event.hosted_invoice_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {event.hosted_invoice_url}
                      <ExternalLink className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                    </a>
                  ) : null}
                  {event.diagnostic_reason ? (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {event.diagnostic_reason}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-slate-200 pt-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function modePillClass(usedRealStripe: boolean): string {
  const base = "rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wide";
  return usedRealStripe
    ? `${base} border-emerald-200 bg-emerald-50 text-emerald-800`
    : `${base} border-sky-200 bg-sky-50 text-sky-800`;
}

const errorPillClass =
  "rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-800";
