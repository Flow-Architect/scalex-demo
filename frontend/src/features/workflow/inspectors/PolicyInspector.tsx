import { Gauge, LockKeyhole, ShieldAlert, ShieldCheck, TrendingUp } from "lucide-react";

import { formatCurrency, formatPercent } from "../../../format";
import type { DemoState } from "../../../types";
import { blockedPolicyChecks, approvedPolicyChecks } from "../workflowModel";
import { EmptyState, Fact, FactGrid, InspectorSection, StatusPill } from "./inspectorUi";

export function PolicyInspector({ state }: { state: DemoState | null }) {
  const summary = state?.policy.summary ?? null;
  const approvedChecks = approvedPolicyChecks(state);
  const blockedChecks = blockedPolicyChecks(state);

  return (
    <div className="space-y-4">
      <InspectorSection
        description="ScaleX code currently runs the policy engine locally. Goal 8 remains the NeMo Guardrails or NeMo-compatible adapter integration step."
        icon={ShieldCheck}
        title="Policy Gate"
      >
        {summary ? (
          <>
            <FactGrid>
              <Fact label="Policy engine" value={summary.engine} />
              <Fact label="Spend cap" value={formatCurrency(summary.max_job_spend_usd * 100)} />
              <Fact label="Margin floor" value={formatPercent(summary.margin_floor_percent)} />
              <Fact label="Invoice before spend" value={summary.require_invoice_before_spend ? "Required" : "Not required"} />
              <Fact label="Payment before spend" value={summary.require_payment_before_spend ? "Required" : "Not required"} />
              <Fact label="Human approval above" value={formatCurrency(summary.require_human_approval_above_usd * 100)} />
              <Fact label="Allowed vendors" value={summary.approved_vendors.join(", ") || "None configured"} />
              <Fact label="Blocked vendors" value={summary.blocked_vendors.join(", ") || "None configured"} />
            </FactGrid>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill icon={Gauge} label="Spend cap enforced" tone="sky" />
              <StatusPill icon={TrendingUp} label="Margin floor enforced" tone="teal" />
              <StatusPill icon={LockKeyhole} label="Payment-before-spend checked" tone="amber" />
              <StatusPill icon={ShieldAlert} label="NeMo Goal 8 planned - not wired yet" tone="violet" />
            </div>
          </>
        ) : (
          <EmptyState>Policy summary appears after backend state loads.</EmptyState>
        )}
      </InspectorSection>

      <InspectorSection title="Decision summary">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3">
            <p className="text-sm font-semibold text-emerald-100">{approvedChecks.length} approved</p>
            <p className="mt-1 text-sm text-emerald-200">Policy-safe requests can create spend ledger rows.</p>
          </div>
          <div className="rounded-lg border border-rose-300/20 bg-rose-300/10 p-3">
            <p className="text-sm font-semibold text-rose-100">{blockedChecks.length} blocked</p>
            <p className="mt-1 text-sm text-rose-200">Unsafe requests are blocked before spend is recorded.</p>
          </div>
        </div>
      </InspectorSection>
    </div>
  );
}
