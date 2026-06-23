import { Activity, X } from "lucide-react";

import { formatDateTime, humanize } from "../../format";
import type { MoneySnapshot } from "../../lib/demoSelectors";
import type { DemoState, HealthResponse, WorkflowConfig } from "../../types";
import { AgentWorkInspector } from "./inspectors/AgentWorkInspector";
import { AuditInspector } from "./inspectors/AuditInspector";
import { CustomerIntakeInspector } from "./inspectors/CustomerIntakeInspector";
import { HermesInspector } from "./inspectors/HermesInspector";
import { PaymentStatusInspector } from "./inspectors/PaymentStatusInspector";
import { PolicyInspector } from "./inspectors/PolicyInspector";
import { ReportInspector } from "./inspectors/ReportInspector";
import { RunSummaryInspector } from "./inspectors/RunSummaryInspector";
import { SpendInspector } from "./inspectors/SpendInspector";
import { StripeInspector } from "./inspectors/StripeInspector";
import {
  nodeByKey,
  type WorkflowInspectorKey,
  type WorkflowModel,
} from "./workflowModel";

export function NodeInspector({
  activeWorkflow,
  health,
  model,
  money,
  onSelect,
  runStatus,
  selectedKey,
  state,
}: {
  activeWorkflow: WorkflowConfig | null;
  health: HealthResponse | null;
  model: WorkflowModel;
  money: MoneySnapshot;
  onSelect: (key: WorkflowInspectorKey) => void;
  runStatus: string;
  selectedKey: WorkflowInspectorKey;
  state: DemoState | null;
}) {
  const node = nodeByKey(model, selectedKey);
  const Icon = node?.icon ?? Activity;

  return (
    <aside className="flex min-h-[44rem] flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-white shadow-2xl shadow-zinc-950/30">
      <div className="border-b border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-white/10 bg-white/10 text-zinc-100">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-zinc-500">Selected node</p>
              <h2 className="mt-1 break-words text-lg font-semibold text-white">
                {node?.title ?? "Run Summary"}
              </h2>
              <p className="mt-1 text-sm leading-5 text-zinc-400">
                {node ? `${humanize(node.status)} - ${formatDateTime(node.timestamp)}` : runStatus}
              </p>
            </div>
          </div>
          {selectedKey !== "summary" ? (
            <button
              aria-label="Return to run summary"
              className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
              onClick={() => onSelect("summary")}
              type="button"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        {selectedKey === "summary" ? (
          <RunSummaryInspector
            activeWorkflow={activeWorkflow}
            money={money}
            runStatus={runStatus}
            state={state}
          />
        ) : null}
        {selectedKey === "customer" ? (
          <CustomerIntakeInspector activeWorkflow={activeWorkflow} state={state} />
        ) : null}
        {selectedKey === "hermes" ? <HermesInspector state={state} /> : null}
        {selectedKey === "stripe" ? <StripeInspector state={state} /> : null}
        {selectedKey === "payment" ? <PaymentStatusInspector state={state} /> : null}
        {selectedKey === "policy" ? <PolicyInspector state={state} /> : null}
        {selectedKey === "approved" ? <SpendInspector mode="approved" state={state} /> : null}
        {selectedKey === "blocked" ? <SpendInspector mode="blocked" state={state} /> : null}
        {selectedKey === "agents" ? <AgentWorkInspector state={state} /> : null}
        {selectedKey === "audit" ? (
          <AuditInspector counts={model.counts} health={health} state={state} />
        ) : null}
        {selectedKey === "report" ? <ReportInspector money={money} state={state} /> : null}
      </div>
    </aside>
  );
}
