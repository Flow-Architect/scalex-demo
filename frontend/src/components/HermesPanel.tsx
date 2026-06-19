import { AlertTriangle, BrainCircuit, CheckCircle2, Workflow } from "lucide-react";

import { formatDateTime, humanize } from "../format";
import type { HermesMetadata, OrchestrationCall, PlanningRun } from "../types";

interface HermesPanelProps {
  hermes: HermesMetadata | null;
  planningRun: PlanningRun | null;
  calls: OrchestrationCall[];
}

export function HermesPanel({ hermes, planningRun, calls }: HermesPanelProps) {
  const failed = Boolean(planningRun?.error || hermes?.failure_reason || hermes?.error);
  const plan = planningRun?.result_json ?? null;
  const metadata = hermes ?? null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">
              Hermes Brain / Orchestration
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {planningRun
              ? `${planningRun.source} planning run ${planningRun.id}`
              : "Planning run pending"}
          </p>
        </div>
        <span className={failed ? failedClass : completeClass}>
          {failed ? "Hermes error" : planningRun ? humanize(planningRun.status) : "Pending"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Mode" value={metadata?.mode ?? planningRun?.mode ?? "Pending"} />
        <Fact
          label="Real Hermes"
          value={metadata?.used_real_hermes ? "used_real_hermes=true" : "used_real_hermes=false"}
        />
        <Fact
          label="Provider / model"
          value={`${metadata?.provider ?? planningRun?.provider ?? "Pending"} / ${
            metadata?.model ?? planningRun?.model ?? "Pending"
          }`}
        />
        <Fact
          label="Skill / tools"
          value={`${metadata?.skill_name ?? "Pending"} / ${
            metadata?.toolsets_used?.join(", ") || "none"
          }`}
        />
      </div>

      {failed ? (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <div>
            <p className="font-semibold">Hermes integration error</p>
            <p className="mt-1">
              {planningRun?.error ?? metadata?.failure_reason ?? metadata?.error}
            </p>
          </div>
        </div>
      ) : null}

      {plan ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Planning result</h3>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
              <p>{plan.executive_summary}</p>
              <JsonBlock value={plan.campaign_strategy} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-950">Proposed sequence</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {plan.proposed_tool_sequence.map((toolName, index) => (
                <span
                  className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-800"
                  key={`${toolName}-${index}`}
                >
                  {index + 1}. {toolName}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          Hermes planning output appears after a successful product run.
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-slate-700" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-950">Recorded tool calls</h3>
          </div>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {calls.length} calls
          </span>
        </div>

        {calls.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            Orchestration calls appear after the demo runs.
          </div>
        ) : (
          <ol className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {calls.map((call) => (
              <li className="grid gap-3 p-4 md:grid-cols-[4rem_1fr_auto]" key={call.id}>
                <p className="font-mono text-sm font-semibold text-slate-500">
                  #{call.sequence}
                </p>
                <div className="min-w-0">
                  <p className="break-all text-sm font-semibold text-slate-950">
                    {call.tool_name}
                  </p>
                  {call.error ? (
                    <p className="mt-1 text-sm text-rose-700">{call.error}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(call.created_at)}
                  </p>
                </div>
                <span className={call.status === "failed" ? failedPillClass : callPillClass}>
                  {call.status === "failed" ? (
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {humanize(call.status)} · {call.duration_ms}ms
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-slate-200 pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

const completeClass =
  "inline-flex w-fit rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-800";

const failedClass =
  "inline-flex w-fit rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-800";

const callPillClass =
  "inline-flex h-fit w-fit items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800";

const failedPillClass =
  "inline-flex h-fit w-fit items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800";
