import { CreditCard, ReceiptText } from "lucide-react";

import { formatCurrency, formatDateTime, humanize } from "../format";
import type { StripeEvent } from "../types";

interface StripePanelProps {
  events: StripeEvent[];
}

export function StripePanel({ events }: StripePanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Stripe records</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Local mock/test-style objects only. No Stripe SDK call or live payment.
          </p>
        </div>
        <span className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-sky-800">
          Mock test
        </span>
      </div>

      {events.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          Mock Stripe records appear after the demo runs.
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
                      {formatDateTime(event.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
