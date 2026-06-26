import { Database } from "lucide-react";

import type { DemoState, HealthResponse } from "../../../types";
import type { WorkflowAuditCounts } from "../workflowModel";
import { Fact, FactGrid, InspectorSection, StatusPill } from "./inspectorUi";

export function AuditInspector({
  counts,
  health,
  onOpenAudit,
  state,
}: {
  counts: WorkflowAuditCounts;
  health: HealthResponse | null;
  onOpenAudit: () => void;
  state: DemoState | null;
}) {
  const databasePath = state?.database.path ?? health?.database_path ?? "Path not recorded";
  const databaseExists = Boolean(state?.database.exists ?? health?.database_exists);

  return (
    <div className="space-y-4">
      <InspectorSection
        description="Client operation proof is persisted in local SQLite. Full timelines and tables remain in the Evidence Ledger."
        icon={Database}
        title="SQLite Audit"
      >
        <FactGrid>
          <Fact label="Database status" value={databaseExists ? "Present" : "Not recorded"} />
          <Fact label="Database path" value={databasePath} />
          <Fact label="Initialized" value={String(Boolean(state?.database.initialized))} />
          <Fact label="Current-state records" value={String(counts.total)} />
        </FactGrid>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            icon={Database}
            label={databaseExists ? "SQLite audit active" : "SQLite not recorded"}
            tone={databaseExists ? "teal" : "amber"}
          />
        </div>
        <button
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          onClick={onOpenAudit}
          type="button"
        >
          Open Evidence Ledger
        </button>
      </InspectorSection>

      <InspectorSection title="Record counts">
        <div className="grid gap-3 sm:grid-cols-2">
          <CountTile label="Events" value={counts.events} />
          <CountTile label="Orchestration calls" value={counts.orchestrationCalls} />
          <CountTile label="Stripe events" value={counts.stripeEvents} />
          <CountTile label="Policy checks" value={counts.policyChecks} />
          <CountTile label="Guardrail evaluations" value={counts.guardrailEvaluations} />
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
    <div className="border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-[0.68rem] font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
