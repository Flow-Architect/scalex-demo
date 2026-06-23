import { BrainCircuit, CheckCircle2 } from "lucide-react";

import { formatDateTime, humanize } from "../../../format";
import type { DemoState } from "../../../types";
import {
  EmptyState,
  Fact,
  FactGrid,
  InspectorSection,
  MarkdownDetails,
  StatusPill,
} from "./inspectorUi";

export function AgentWorkInspector({ state }: { state: DemoState | null }) {
  const outputs = state?.agent_outputs ?? [];

  return (
    <div className="space-y-4">
      <InspectorSection
        description="Deliverables are recorded in SQLite after policy-safe spend handling."
        icon={BrainCircuit}
        title="Agent Work"
      >
        <div className="flex flex-wrap gap-2">
          <StatusPill
            icon={CheckCircle2}
            label={`${outputs.length}/4 outputs recorded`}
            tone={outputs.length >= 4 ? "emerald" : outputs.length > 0 ? "amber" : "slate"}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Deliverable summaries">
        {outputs.length === 0 ? (
          <EmptyState>Finance, Marketing, Research, and Ops outputs appear after the workflow run.</EmptyState>
        ) : (
          <div className="space-y-3">
            {outputs.map((output) => (
              <article className="rounded-lg border border-white/10 bg-zinc-950/35 p-3" key={output.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-white">
                      {output.agent_name} Agent
                    </p>
                    <p className="mt-1 text-sm leading-5 text-zinc-300">{output.summary}</p>
                  </div>
                  <StatusPill label={humanize(output.status)} tone={output.status === "complete" ? "emerald" : "amber"} />
                </div>
                <div className="mt-3">
                  <FactGrid>
                    <Fact label="Output ID" value={output.id} />
                    <Fact label="Recorded" value={formatDateTime(output.created_at)} />
                  </FactGrid>
                </div>
                <div className="mt-3">
                  <MarkdownDetails markdown={output.output_markdown} title="Full output markdown" />
                </div>
              </article>
            ))}
          </div>
        )}
      </InspectorSection>
    </div>
  );
}
