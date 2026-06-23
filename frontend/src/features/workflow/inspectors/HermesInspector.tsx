import { AlertTriangle, BrainCircuit, Layers3 } from "lucide-react";

import { formatDateTime, humanize } from "../../../format";
import {
  hermesFailed,
  operatingPlanPhases,
  taskRows,
} from "../../../lib/demoSelectors";
import type { DemoState } from "../../../types";
import {
  EmptyState,
  Fact,
  FactGrid,
  InspectorSection,
  StatusPill,
} from "./inspectorUi";

export function HermesInspector({ state }: { state: DemoState | null }) {
  const hermes = state?.hermes ?? null;
  const planningRun = state?.planning_run ?? null;
  const plan = planningRun?.result_json ?? null;
  const failed = hermesFailed(hermes, planningRun);
  const phases = operatingPlanPhases(plan);
  const tasks = taskRows(plan?.agent_task_list ?? []);
  const proposedTools = plan?.proposed_tool_sequence ?? [];
  const summary =
    plan?.executive_summary ??
    planningRun?.summary ??
    "Run the workflow to load the Hermes operating plan.";

  return (
    <div className="space-y-4">
      <InspectorSection
        description="Hermes plans and proposes orchestration. ScaleX still enforces payment, policy, ledger, and report actions."
        icon={BrainCircuit}
        title="Hermes Brain"
      >
        <FactGrid>
          <Fact label="used_real_hermes" value={String(Boolean(hermes?.used_real_hermes))} />
          <Fact label="Provider" value={hermes?.provider ?? planningRun?.provider ?? "Pending"} />
          <Fact label="Model" value={hermes?.model ?? planningRun?.model ?? "Pending"} />
          <Fact label="Skill" value={hermes?.skill_name ?? "Pending"} />
          <Fact label="Toolsets" value={hermes?.toolsets_used?.join(", ") || "None recorded"} />
          <Fact label="Planning status" value={humanize(planningRun?.status ?? null)} />
          <Fact label="Planning source" value={planningRun?.source ?? "Pending"} />
          <Fact label="Completed" value={formatDateTime(planningRun?.completed_at)} />
        </FactGrid>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            icon={failed ? AlertTriangle : BrainCircuit}
            label={failed ? "Hermes error" : hermes?.used_real_hermes ? "Real isolated Hermes" : "Test or pending"}
            tone={failed ? "rose" : hermes?.used_real_hermes ? "emerald" : "amber"}
          />
          <StatusPill icon={Layers3} label={`${state?.orchestration_calls.length ?? 0} orchestration calls`} tone="violet" />
        </div>

        {failed ? (
          <div className="mt-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">
            {planningRun?.error ?? hermes?.failure_reason ?? hermes?.error}
          </div>
        ) : null}
      </InspectorSection>

      <InspectorSection title="Operating plan summary">
        <p className="text-sm leading-6 text-zinc-300">{summary}</p>
        {phases.length > 0 ? (
          <ol className="mt-3 space-y-2">
            {phases.map((phase, index) => (
              <li className="flex gap-2 text-sm leading-5 text-zinc-300" key={`${phase}-${index}`}>
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-md bg-violet-300/15 text-xs font-semibold text-violet-100">
                  {index + 1}
                </span>
                <span>{phase}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </InspectorSection>

      <InspectorSection title="Proposed tool sequence">
        {proposedTools.length === 0 ? (
          <EmptyState>Hermes proposed tools appear after the planning run.</EmptyState>
        ) : (
          <div className="flex flex-wrap gap-2">
            {proposedTools.map((toolName, index) => (
              <span
                className="rounded-md border border-violet-300/20 bg-violet-300/10 px-2 py-1 text-xs font-semibold text-violet-100"
                key={`${toolName}-${index}`}
              >
                #{index + 1} {toolName}
              </span>
            ))}
          </div>
        )}
      </InspectorSection>

      <InspectorSection title="Agent task list">
        {tasks.length === 0 ? (
          <EmptyState>Agent tasks appear after Hermes returns a plan.</EmptyState>
        ) : (
          <div className="grid gap-2">
            {tasks.map((task) => (
              <div className="rounded-md border border-white/10 bg-zinc-950/35 p-3" key={task.agent}>
                <p className="text-sm font-semibold text-white">{task.agent}</p>
                <p className="mt-1 text-sm leading-5 text-zinc-300">{task.task}</p>
              </div>
            ))}
          </div>
        )}
      </InspectorSection>
    </div>
  );
}
