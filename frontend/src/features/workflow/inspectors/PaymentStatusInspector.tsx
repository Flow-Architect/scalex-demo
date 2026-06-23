import { CircleDollarSign, ReceiptText } from "lucide-react";

import { formatCurrency, formatDateTime } from "../../../format";
import { eventByType } from "../../../lib/demoSelectors";
import type { DemoState } from "../../../types";
import { revenueLedgerEntry } from "../workflowModel";
import {
  EmptyState,
  Fact,
  FactGrid,
  InspectorSection,
  StatusPill,
} from "./inspectorUi";

export function PaymentStatusInspector({ state }: { state: DemoState | null }) {
  const stripe = state?.stripe ?? null;
  const revenueEntry = revenueLedgerEntry(state);
  const paymentEvent = eventByType(state?.events ?? [], "payment_confirmed");
  const localConfirmation = Boolean(
    revenueEntry?.source.includes("local_test_confirmation") ||
      paymentEvent?.status === "local_test_confirmed",
  );
  const paid = stripe?.paid === null || stripe?.paid === undefined ? "Pending" : String(stripe.paid);

  return (
    <div className="space-y-4">
      <InspectorSection
        description="Payment status separates Stripe invoice state from the local compressed-run revenue marker."
        icon={ReceiptText}
        title="Payment Status"
      >
        <FactGrid>
          <Fact label="invoice_status" value={stripe?.invoice_status ?? "Pending"} />
          <Fact label="paid" value={paid} />
          <Fact label="Revenue ledger entry" value={revenueEntry ? formatCurrency(revenueEntry.amount_cents) : "Pending"} />
          <Fact label="Revenue source" value={revenueEntry?.source ?? "Pending"} />
          <Fact label="Revenue label" value={revenueEntry?.label ?? "Pending"} />
          <Fact label="Recorded" value={formatDateTime(revenueEntry?.created_at)} />
        </FactGrid>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            icon={CircleDollarSign}
            label={stripe?.paid === true ? "Stripe-paid revenue" : "No Stripe-paid claim"}
            tone={stripe?.paid === true ? "emerald" : "amber"}
          />
          {localConfirmation ? (
            <StatusPill label="Local compressed-run confirmation" tone="teal" />
          ) : null}
        </div>

        {stripe?.paid === false ? (
          <div className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
            Stripe reports paid=false. Revenue economics are recorded only through the explicitly labeled local test confirmation.
          </div>
        ) : null}
      </InspectorSection>

      <InspectorSection title="Local confirmation event">
        {paymentEvent ? (
          <FactGrid>
            <Fact label="Event status" value={paymentEvent.status} />
            <Fact label="Event title" value={paymentEvent.title} />
            <Fact label="Event detail" value={paymentEvent.detail} />
            <Fact label="Created" value={formatDateTime(paymentEvent.created_at)} />
          </FactGrid>
        ) : (
          <EmptyState>Local payment confirmation event appears after the run records revenue.</EmptyState>
        )}
      </InspectorSection>
    </div>
  );
}
