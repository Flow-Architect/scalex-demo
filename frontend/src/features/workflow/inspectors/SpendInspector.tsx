import { Ban, CheckCircle2, WalletCards } from "lucide-react";

import { formatCurrency, formatDateTime } from "../../../format";
import type { DemoState, PolicyCheck } from "../../../types";
import {
  approvedPolicyChecks,
  blockedPolicyChecks,
  spendLedgerEntries,
} from "../workflowModel";
import { EmptyState, Fact, FactGrid, InspectorSection, StatusPill } from "./inspectorUi";

export function SpendInspector({
  mode,
  state,
}: {
  mode: "approved" | "blocked";
  state: DemoState | null;
}) {
  const approvedChecks = approvedPolicyChecks(state);
  const blockedChecks = blockedPolicyChecks(state);
  const checks = mode === "approved" ? approvedChecks : blockedChecks;
  const spendEntries = spendLedgerEntries(state);
  const approvedTotal = approvedChecks.reduce(
    (total, check) => total + check.requested_amount_cents,
    0,
  );
  const blockedTotal = blockedChecks.reduce(
    (total, check) => total + check.requested_amount_cents,
    0,
  );
  const remainingCap = state?.ledger.totals.remaining_spend_cap_cents ?? null;

  return (
    <div className="space-y-4">
      <InspectorSection
        description={
          mode === "approved"
            ? "Approved setup spend checks can create local spend ledger rows."
            : "Blocked risk checks stop unsafe vendor spend before any spend ledger row is created."
        }
        icon={mode === "approved" ? WalletCards : Ban}
        title={mode === "approved" ? "Approved Setup Spend" : "Blocked Risk"}
      >
        <FactGrid>
          <Fact label="Approved checks" value={String(approvedChecks.length)} />
          <Fact label="Approved setup total" value={formatCurrency(approvedTotal)} />
          <Fact label="Blocked checks" value={String(blockedChecks.length)} />
          <Fact label="Blocked risk total" value={formatCurrency(blockedTotal)} />
          <Fact
            label="Remaining cap"
            value={remainingCap === null ? "Not recorded" : formatCurrency(remainingCap)}
          />
          <Fact label="Spend ledger rows" value={String(spendEntries.length)} />
        </FactGrid>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            icon={mode === "approved" ? CheckCircle2 : Ban}
            label={mode === "approved" ? "Approved path" : "Blocked path"}
            tone={mode === "approved" ? "emerald" : "rose"}
          />
          {mode === "blocked" ? (
            <StatusPill label="No spend ledger entry for blocked request" tone="amber" />
          ) : null}
        </div>
      </InspectorSection>

      <InspectorSection title={mode === "approved" ? "Approved setup checks" : "Blocked risk checks"}>
        {checks.length === 0 ? (
          <EmptyState>
            {mode === "approved"
              ? "Approved setup spend checks appear after the guardrail review runs."
              : "Blocked risk checks appear after the guardrail review evaluates unsafe requests."}
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {checks.map((check) => (
              <SpendCheckCard check={check} key={check.id} mode={mode} spendEntries={spendEntries} />
            ))}
          </div>
        )}
      </InspectorSection>

      {mode === "approved" ? (
        <InspectorSection title="Spend ledger rows">
          {spendEntries.length === 0 ? (
            <EmptyState>Spend ledger rows appear after approved setup spend is recorded.</EmptyState>
          ) : (
            <div className="space-y-2">
              {spendEntries.map((entry) => (
                <div className="border border-zinc-200 bg-zinc-50 p-3" key={entry.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">{entry.label}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {entry.source} - {formatDateTime(entry.created_at)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-950">{formatCurrency(entry.amount_cents)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InspectorSection>
      ) : null}
    </div>
  );
}

function SpendCheckCard({
  check,
  mode,
  spendEntries,
}: {
  check: PolicyCheck;
  mode: "approved" | "blocked";
  spendEntries: ReturnType<typeof spendLedgerEntries>;
}) {
  const matchingSpendEntry = spendEntries.find(
    (entry) => entry.label.includes(check.vendor) || entry.amount_cents === check.requested_amount_cents,
  );

  return (
    <article
      className={`border p-3 ${
        mode === "approved"
          ? "border-emerald-200 bg-emerald-50"
          : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-zinc-950">{check.vendor}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-zinc-500">
            {mode === "approved" ? "Approved setup spend" : "Blocked vendor risk"}
          </p>
        </div>
        <p className="flex-none text-sm font-semibold text-zinc-950">
          {formatCurrency(check.requested_amount_cents)}
        </p>
      </div>
      <p className="mt-2 text-sm leading-5 text-zinc-700">{check.reason}</p>
      <FactGrid>
        <Fact label="Required action" value={check.required_action} />
        <Fact label="Margin after spend" value={`${check.margin_after_spend_percent.toFixed(1)}%`} />
        <Fact label="Decision time" value={formatDateTime(check.created_at)} />
        <Fact
          label="Spend ledger entry"
          value={
            mode === "blocked"
              ? matchingSpendEntry
                ? "Unexpected matching spend row"
                : "None created"
              : matchingSpendEntry
                ? matchingSpendEntry.id
                : "Not recorded"
          }
        />
      </FactGrid>
    </article>
  );
}
