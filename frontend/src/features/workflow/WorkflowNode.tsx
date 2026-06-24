import type { PointerEvent as ReactPointerEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatDateTime, humanize } from "../../format";
import type { WorkflowNodeKey, WorkflowNodeModel, WorkflowNodeStatus, WorkflowTone } from "./workflowModel";

const statusIcon: Record<WorkflowNodeStatus, LucideIcon> = {
  pending: CircleDashed,
  current: Clock3,
  complete: CheckCircle2,
  blocked: ShieldAlert,
  error: AlertTriangle,
};

export function WorkflowNode({
  dragging,
  node,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onSelect,
  selected,
}: {
  dragging: boolean;
  node: WorkflowNodeModel;
  onPointerDown: (key: WorkflowNodeModel["key"], event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (key: WorkflowNodeModel["key"], event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (key: WorkflowNodeModel["key"], event: ReactPointerEvent<HTMLDivElement>) => void;
  onSelect: (key: WorkflowNodeKey) => void;
  selected: boolean;
}) {
  const Icon = node.icon;
  const StatusIcon = statusIcon[node.status];

  return (
    <div
      data-workflow-node="true"
      className={`absolute touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerCancel={(event) => onPointerUp(node.key, event)}
      onPointerDown={(event) => onPointerDown(node.key, event)}
      onPointerMove={(event) => onPointerMove(node.key, event)}
      onPointerUp={(event) => onPointerUp(node.key, event)}
      style={{
        height: `${node.position.height}%`,
        left: `${node.position.x}%`,
        top: `${node.position.y}%`,
        width: `${node.position.width}%`,
      }}
    >
      <button
        className={`h-full w-full rounded-md border p-3 text-left transition duration-150 hover:-translate-y-0.5 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
          nodeClass(node.tone, node.status, selected)
        }`}
        onClick={() => onSelect(node.key)}
        type="button"
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-md ${iconClass(node.tone)}`}>
            <Icon className={`h-4 w-4 ${node.status === "current" ? "animate-pulse" : ""}`} aria-hidden="true" />
          </span>
          <span className={`inline-flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-[0.68rem] font-semibold ${statusClass(node.status)}`}>
            <StatusIcon className="h-3 w-3 flex-none" aria-hidden="true" />
            <span className="truncate">{humanize(node.status)}</span>
          </span>
        </div>

        <p className="mt-2 text-[0.68rem] font-semibold uppercase text-zinc-500">{node.eyebrow}</p>
        <h3 className="mt-1 truncate text-sm font-semibold text-zinc-950">{node.title}</h3>
        <p
          className="mt-1 min-h-[2.25rem] overflow-hidden text-xs leading-[1.1rem] text-zinc-600"
          style={{
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            display: "-webkit-box",
          }}
        >
          {node.proof}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 text-[0.65rem] text-zinc-500">
          <span className="truncate rounded bg-zinc-100 px-1.5 py-0.5 font-semibold text-zinc-700">
            {node.badge}
          </span>
          <span className="flex-none">{formatDateTime(node.timestamp)}</span>
        </div>
      </button>
    </div>
  );
}

function nodeClass(tone: WorkflowTone, status: WorkflowNodeStatus, selected: boolean): string {
  const selectedClass = selected ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-white" : "";

  if (status === "error") {
    return `border-rose-300 bg-rose-50 ${selectedClass}`;
  }
  if (status === "blocked") {
    return `border-rose-300 bg-rose-50 ${selectedClass}`;
  }
  if (status === "current") {
    return `border-amber-300 bg-amber-50 ${selectedClass}`;
  }

  const toneClass: Record<WorkflowTone, string> = {
    amber: "border-amber-200 bg-amber-50",
    emerald: "border-emerald-200 bg-emerald-50",
    rose: "border-rose-200 bg-rose-50",
    sky: "border-sky-200 bg-sky-50",
    slate: "border-zinc-200 bg-white",
    teal: "border-teal-200 bg-teal-50",
    violet: "border-violet-200 bg-violet-50",
  };

  return `${toneClass[tone]} ${status === "pending" ? "opacity-80" : ""} ${selectedClass}`;
}

function iconClass(tone: WorkflowTone): string {
  const toneClass: Record<WorkflowTone, string> = {
    amber: "bg-amber-200 text-amber-950",
    emerald: "bg-emerald-200 text-emerald-950",
    rose: "bg-rose-200 text-rose-950",
    sky: "bg-sky-200 text-sky-950",
    slate: "bg-zinc-900 text-white",
    teal: "bg-teal-200 text-teal-950",
    violet: "bg-violet-200 text-violet-950",
  };

  return toneClass[tone];
}

function statusClass(status: WorkflowNodeStatus): string {
  switch (status) {
    case "complete":
      return "bg-emerald-100 text-emerald-900";
    case "current":
      return "bg-amber-100 text-amber-900";
    case "blocked":
      return "bg-rose-100 text-rose-900";
    case "error":
      return "bg-rose-100 text-rose-900";
    case "pending":
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}
