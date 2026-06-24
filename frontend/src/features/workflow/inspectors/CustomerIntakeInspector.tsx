import { Gauge, Target, TrendingUp } from "lucide-react";

import { formatCurrency, formatPercent } from "../../../format";
import type { DemoState, WorkflowConfig } from "../../../types";
import { EmptyState, Fact, FactGrid, InspectorSection, StatusPill } from "./inspectorUi";

export function CustomerIntakeInspector({
  activeWorkflow,
  state,
}: {
  activeWorkflow: WorkflowConfig | null;
  state: DemoState | null;
}) {
  const source = activeWorkflow ?? state?.job ?? null;
  const workflowId = activeWorkflow?.id ?? state?.job?.workflow_id ?? "Pending";

  if (!source) {
    return (
      <InspectorSection icon={Target} title="Client Operation Intake">
        <EmptyState>Create or select a local client operation in Customers before starting a run.</EmptyState>
      </InspectorSection>
    );
  }

  return (
    <div className="space-y-4">
      <InspectorSection
        description="The selected enterprise-function template that drives the run."
        icon={Target}
        title="Client Operation Intake"
      >
        <FactGrid>
          <Fact label="Client/account name" value={source.client_name} />
          <Fact label="Business type" value={source.business_type} />
          <Fact label="Implementation/template name" value={source.job_name} />
          <Fact label="Invoice amount" value={formatCurrency(source.invoice_amount_cents)} />
          <Fact label="Spend cap" value={formatCurrency(source.spend_cap_cents)} />
          <Fact label="Margin floor" value={formatPercent(source.margin_floor_percent)} />
          <Fact label="Operation ID" value={workflowId} />
          <Fact label="Job ID" value={state?.job?.id ?? "Run not started"} />
        </FactGrid>

        <div className="mt-3 rounded-md border border-white/10 bg-zinc-950/35 p-3">
          <p className="text-[0.68rem] font-semibold uppercase text-zinc-500">Operation goal</p>
          <p className="mt-1 text-sm leading-6 text-zinc-200">{source.job_goal}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill icon={Gauge} label={`Spend cap ${formatCurrency(source.spend_cap_cents)}`} tone="sky" />
          <StatusPill icon={TrendingUp} label={`Margin floor ${formatPercent(source.margin_floor_percent)}`} tone="teal" />
        </div>
      </InspectorSection>

      {activeWorkflow ? (
        <InspectorSection title="Vendor rules">
          <FactGrid>
            <Fact
              label="Approved setup vendors"
              value={activeWorkflow.approved_vendors.join(", ") || "Default local allowlist"}
            />
            <Fact
              label="Blocked risk vendors"
              value={activeWorkflow.blocked_vendors.join(", ") || "Default local blocklist"}
            />
          </FactGrid>
        </InspectorSection>
      ) : null}
    </div>
  );
}
