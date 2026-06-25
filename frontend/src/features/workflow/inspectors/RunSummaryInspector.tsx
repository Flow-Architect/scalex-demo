import { Activity, CircleDollarSign, ClipboardList, TrendingUp, WalletCards } from "lucide-react";

import { formatCurrency, humanize } from "../../../format";
import { formatOptionalCurrency, formatOptionalPercent } from "../../../lib/demoSelectors";
import type { MoneySnapshot } from "../../../lib/demoSelectors";
import type { DemoState, WorkflowConfig } from "../../../types";
import { Metric, Fact, FactGrid, InspectorSection, StatusPill } from "./inspectorUi";

export function RunSummaryInspector({
  activeWorkflow,
  money,
  runStatus,
  state,
}: {
  activeWorkflow: WorkflowConfig | null;
  money: MoneySnapshot;
  runStatus: string;
  state: DemoState | null;
}) {
  const source = activeWorkflow ?? state?.job ?? null;
  const execution = state?.execution ?? null;

  return (
    <div className="space-y-4">
      <InspectorSection
        description="Current selected client operation and latest run economics."
        icon={Activity}
        title="Run Summary"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Revenue" tone="emerald" value={formatOptionalCurrency(money.revenueCents)} />
          <Metric label="Approved setup spend" tone="sky" value={formatOptionalCurrency(money.approvedSpendCents)} />
          <Metric label="Blocked risk" tone="rose" value={formatOptionalCurrency(money.blockedSpendCents)} />
          <Metric label="Protected profit" tone="teal" value={formatOptionalCurrency(money.grossProfitCents)} />
          <Metric label="Margin" tone="amber" value={formatOptionalPercent(money.marginPercent)} />
          <Metric
            label="Policy violations"
            tone="violet"
            value={money.policyViolations === null ? "Not recorded" : String(money.policyViolations)}
          />
        </div>
      </InspectorSection>

      <InspectorSection icon={ClipboardList} title="Active operation">
        <FactGrid>
          <Fact label="Account" value={source?.client_name ?? "No operation selected"} />
          <Fact label="Template" value={source?.job_name ?? "Create or select a client operation"} />
          <Fact
            label="Invoice amount"
            value={source ? formatCurrency(source.invoice_amount_cents) : "Not selected"}
          />
          <Fact label="Current run status" value={runStatus} />
          <Fact label="Selected run ID" value={state?.selected_run_id ?? state?.job?.id ?? "None"} />
          <Fact label="Job status" value={humanize(state?.job?.status ?? null)} />
          <Fact label="Execution mode" value={execution?.label ?? "Not recorded"} />
          <Fact label="Proof path" value={execution ? `${execution.planning_label} / ${execution.finance_label}` : "Not recorded"} />
        </FactGrid>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill icon={CircleDollarSign} label={execution?.finance_label ?? "Finance proof in inspector"} tone="sky" />
          <StatusPill icon={WalletCards} label="Local policy setup spend gate" tone="emerald" />
          <StatusPill icon={TrendingUp} label={money.actual ? "API-backed economics" : "Awaiting run proof"} tone={money.actual ? "teal" : "amber"} />
        </div>
      </InspectorSection>
    </div>
  );
}
