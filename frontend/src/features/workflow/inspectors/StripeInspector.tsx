import { AlertTriangle, CreditCard } from "lucide-react";

import { formatDateTime, humanize } from "../../../format";
import { latestWhere } from "../../../lib/demoSelectors";
import type { DemoState } from "../../../types";
import {
  EmptyState,
  ExternalTextLink,
  Fact,
  FactGrid,
  InspectorSection,
  StatusPill,
} from "./inspectorUi";

export function StripeInspector({ state }: { state: DemoState | null }) {
  const stripe = state?.stripe ?? null;
  const latestInvoice = latestWhere(state?.stripe_events ?? [], (event) => Boolean(event.invoice_id));
  const failed = Boolean(stripe?.error);
  const livemode =
    stripe?.livemode === null || stripe?.livemode === undefined ? "Pending" : String(stripe.livemode);
  const paid = stripe?.paid === null || stripe?.paid === undefined ? "Pending" : String(stripe.paid);

  return (
    <div className="space-y-4">
      <InspectorSection
        description="Goal 7 product path uses Stripe test mode only. Live-money payments are not implemented."
        icon={CreditCard}
        title="Stripe Test Invoice"
      >
        <FactGrid>
          <Fact label="used_real_stripe" value={String(Boolean(stripe?.used_real_stripe))} />
          <Fact label="stripe_mode" value={stripe?.stripe_mode ?? "Pending"} />
          <Fact label="livemode" value={livemode} />
          <Fact label="Customer ID" value={stripe?.customer_id ?? "Pending"} />
          <Fact label="Invoice ID" value={stripe?.invoice_id ?? "Pending"} />
          <Fact label="invoice_status" value={stripe?.invoice_status ?? "Pending"} />
          <Fact label="paid" value={paid} />
          <Fact label="Latest proof" value={formatDateTime(latestInvoice?.created_at)} />
        </FactGrid>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            icon={failed ? AlertTriangle : CreditCard}
            label={failed ? "Stripe error" : stripe?.used_real_stripe ? "Real Stripe test mode" : humanize(stripe?.stripe_mode ?? "pending")}
            tone={failed ? "rose" : stripe?.used_real_stripe ? "sky" : "amber"}
          />
          <StatusPill label="No live money" tone="rose" />
        </div>

        {stripe?.hosted_invoice_url ? (
          <div className="mt-3">
            <ExternalTextLink href={stripe.hosted_invoice_url} label={stripe.hosted_invoice_url} />
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState>Hosted invoice URL appears after Stripe creates and finalizes the test invoice.</EmptyState>
          </div>
        )}

        {stripe?.invoice_status === "open" && stripe.paid === false ? (
          <div className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
            Stripe test invoice is finalized and open. It is not marked paid.
          </div>
        ) : null}

        {failed ? (
          <div className="mt-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">
            {stripe?.error}
          </div>
        ) : null}

        {stripe?.diagnostic_reason ? (
          <p className="mt-3 text-sm leading-6 text-zinc-400">{stripe.diagnostic_reason}</p>
        ) : null}
      </InspectorSection>
    </div>
  );
}
