import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatDateTime, humanize } from "../../format";
import type { WorkflowInspectorKey, WorkflowNodeModel, WorkflowNodeStatus, WorkflowTone } from "./workflowModel";

const statusIcon: Record<WorkflowNodeStatus, LucideIcon> = {
  pending: CircleDashed,
  current: Clock3,
  complete: CheckCircle2,
  blocked: ShieldAlert,
  error: AlertTriangle,
};

export function WorkflowNode({
  node,
  onSelect,
  selected,
}: {
  node: WorkflowNodeModel;
  onSelect: (key: WorkflowInspectorKey) => void;
  selected: boolean;
}) {
  const Icon = node.icon;
  const StatusIcon = statusIcon[node.status];

  return (
    <button
      className={`absolute rounded-lg border p-3 text-left transition duration-150 hover:-translate-y-0.5 hover:border-white/35 focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
        nodeClass(node.tone, node.status, selected)
      }`}
      onClick={() => onSelect(node.key)}
      style={{
        height: node.position.height,
        left: node.position.x,
        top: node.position.y,
        width: node.position.width,
      }}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-md border ${iconClass(node.tone)}`}>
          <Icon className={`h-4 w-4 ${node.status === "current" ? "animate-pulse" : ""}`} aria-hidden="true" />
        </span>
        <span className={`inline-flex min-w-0 items-center gap-1 rounded-md border px-1.5 py-1 text-[0.68rem] font-semibold ${statusClass(node.status)}`}>
          <StatusIcon className="h-3 w-3 flex-none" aria-hidden="true" />
          <span className="truncate">{humanize(node.status)}</span>
        </span>
      </div>

      <p className="mt-2 text-[0.68rem] font-semibold uppercase text-zinc-500">{node.eyebrow}</p>
      <h3 className="mt-1 truncate text-sm font-semibold text-white">{node.title}</h3>
      <p
        className="mt-1 min-h-[2.25rem] overflow-hidden text-xs leading-[1.1rem] text-zinc-300"
        style={{
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          display: "-webkit-box",
        }}
      >
        {node.proof}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2 text-[0.65rem] text-zinc-500">
        <span className="truncate rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-semibold text-zinc-300">
          {node.badge}
        </span>
        <span className="flex-none">{formatDateTime(node.timestamp)}</span>
      </div>
    </button>
  );
}

function nodeClass(tone: WorkflowTone, status: WorkflowNodeStatus, selected: boolean): string {
  const selectedClass = selected ? "ring-2 ring-emerald-300 ring-offset-2 ring-offset-zinc-950" : "";

  if (status === "error") {
    return `border-rose-300/60 bg-rose-950/40 shadow-lg shadow-rose-950/30 ${selectedClass}`;
  }
  if (status === "blocked") {
    return `border-rose-300/50 bg-rose-300/10 shadow-lg shadow-rose-950/20 ${selectedClass}`;
  }
  if (status === "current") {
    return `border-amber-300/60 bg-amber-300/10 shadow-lg shadow-amber-950/20 ${selectedClass}`;
  }

  const toneClass: Record<WorkflowTone, string> = {
    amber: "border-amber-300/30 bg-amber-300/10",
    emerald: "border-emerald-300/35 bg-emerald-300/10",
    rose: "border-rose-300/35 bg-rose-300/10",
    sky: "border-sky-300/35 bg-sky-300/10",
    slate: "border-white/10 bg-zinc-900/80",
    teal: "border-teal-300/35 bg-teal-300/10",
    violet: "border-violet-300/35 bg-violet-300/10",
  };

  return `${toneClass[tone]} ${status === "pending" ? "opacity-80" : ""} ${selectedClass}`;
}

function iconClass(tone: WorkflowTone): string {
  const toneClass: Record<WorkflowTone, string> = {
    amber: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    emerald: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    rose: "border-rose-300/30 bg-rose-300/10 text-rose-100",
    sky: "border-sky-300/30 bg-sky-300/10 text-sky-100",
    slate: "border-white/10 bg-white/10 text-zinc-100",
    teal: "border-teal-300/30 bg-teal-300/10 text-teal-100",
    violet: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  };

  return toneClass[tone];
}

function statusClass(status: WorkflowNodeStatus): string {
  switch (status) {
    case "complete":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
    case "current":
      return "border-amber-300/40 bg-amber-300/10 text-amber-100";
    case "blocked":
      return "border-rose-300/40 bg-rose-300/10 text-rose-100";
    case "error":
      return "border-rose-300/40 bg-rose-300/15 text-rose-100";
    case "pending":
    default:
      return "border-white/10 bg-white/5 text-zinc-300";
  }
}
