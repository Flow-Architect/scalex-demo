import { Database } from "lucide-react";

import type { DemoState, HealthResponse } from "../../../types";
import type { WorkflowAuditCounts } from "../workflowModel";
import { Fact, FactGrid, InspectorSection, StatusPill } from "./inspectorUi";

export function AuditInspector({
  counts,
  health,
  state,
}: {
  counts: WorkflowAuditCounts;
  health: HealthResponse | null;
  state: DemoState | null;
}) {
  const databasePath = state?.database.path ?? health?.database_path ?? "Path pending";
  const databaseExists = Boolean(state?.database.exists ?? health?.database_exists);

  return (
    <div className="space-y-4">
      <InspectorSection
        description="Client operation proof is persisted in local SQLite. Full timelines and tables remain in the Audit tab."
        icon={Database}
        title="SQLite Audit"
      >
        <FactGrid>
          <Fact label="Database status" value={databaseExists ? "Present" : "Pending"} />
          <Fact label="Database path" value={databasePath} />
          <Fact label="Initialized" value={String(Boolean(state?.database.initialized))} />
          <Fact label="Current-state records" value={String(counts.total)} />
        </FactGrid>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            icon={Database}
            label={databaseExists ? "SQLite audit active" : "SQLite pending"}
            tone={databaseExists ? "teal" : "amber"}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Record counts">
        <div className="grid gap-3 sm:grid-cols-2">
          <CountTile label="Events" value={counts.events} />
          <CountTile label="Orchestration calls" value={counts.orchestrationCalls} />
          <CountTile label="Stripe events" value={counts.stripeEvents} />
          <CountTile label="Policy checks" value={counts.policyChecks} />
          <CountTile label="Ledger entries" value={counts.ledgerEntries} />
          <CountTile label="Reports" value={counts.reports} />
          <CountTile label="Planning runs" value={counts.planningRuns} />
          <CountTile label="Agent outputs" value={counts.agentOutputs} />
        </div>
      </InspectorSection>
    </div>
  );
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-zinc-950/35 p-3">
      <p className="text-[0.68rem] font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
