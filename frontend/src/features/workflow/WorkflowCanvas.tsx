import type { WorkflowInspectorKey, WorkflowModel, WorkflowNodeKey, WorkflowTone } from "./workflowModel";
import { WORKFLOW_CANVAS_HEIGHT, WORKFLOW_CANVAS_WIDTH } from "./workflowModel";
import { WorkflowNode } from "./WorkflowNode";

export function WorkflowCanvas({
  model,
  onSelect,
  selectedKey,
}: {
  model: WorkflowModel;
  onSelect: (key: WorkflowInspectorKey) => void;
  selectedKey: WorkflowInspectorKey;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-white shadow-2xl shadow-zinc-950/30">
      <div className="border-b border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Enterprise Workflow Canvas</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Invoice-to-workflow orchestration with policy-gated spend and audited profit proof.
            </p>
          </div>
          <span className="w-fit rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300">
            {model.activeCount}/{model.nodes.length} nodes active
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            height: WORKFLOW_CANVAS_HEIGHT,
            minWidth: WORKFLOW_CANVAS_WIDTH,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(16,185,129,0.10),transparent_34%),radial-gradient(circle_at_85%_78%,rgba(244,63,94,0.10),transparent_28%)]" />
          <ConnectorLayer model={model} />
          {model.nodes.map((node) => (
            <WorkflowNode
              key={node.key}
              node={node}
              onSelect={onSelect}
              selected={selectedKey === node.key}
            />
          ))}
          <CanvasLegend />
        </div>
      </div>
    </section>
  );
}

function ConnectorLayer({ model }: { model: WorkflowModel }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${WORKFLOW_CANVAS_WIDTH} ${WORKFLOW_CANVAS_HEIGHT}`}
    >
      <defs>
        {(["teal", "violet", "sky", "amber", "emerald", "rose", "slate"] as WorkflowTone[]).map(
          (tone) => (
            <marker
              id={`workflow-arrow-${tone}`}
              key={tone}
              markerHeight="8"
              markerWidth="8"
              orient="auto"
              refX="7"
              refY="4"
              viewBox="0 0 8 8"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill={toneColor(tone)} />
            </marker>
          ),
        )}
      </defs>
      {model.connections.map((connection) => {
        const from = model.nodes.find((node) => node.key === connection.from);
        const to = model.nodes.find((node) => node.key === connection.to);
        if (!from || !to) {
          return null;
        }

        const path = connectorPath(connection.from, connection.to, from.position, to.position);
        const active = from.status !== "pending" || to.status !== "pending";

        return (
          <g key={`${connection.from}-${connection.to}`}>
            <path
              d={path}
              fill="none"
              markerEnd={`url(#workflow-arrow-${connection.tone})`}
              opacity={active ? 0.95 : 0.35}
              stroke={toneColor(connection.tone)}
              strokeDasharray={active ? undefined : "6 8"}
              strokeLinecap="round"
              strokeWidth={connection.tone === "rose" || connection.tone === "emerald" ? 3 : 2.4}
            />
            {connection.label ? (
              <text
                fill={toneColor(connection.tone)}
                fontSize="11"
                fontWeight="700"
                opacity={active ? 0.9 : 0.45}
                x={labelX(connection.from, connection.to)}
                y={labelY(connection.from, connection.to)}
              >
                {connection.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function CanvasLegend() {
  return (
    <div className="absolute bottom-5 right-6 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-zinc-950/80 p-2 text-[0.68rem] font-semibold text-zinc-300 backdrop-blur">
      <LegendDot className="bg-emerald-300" label="Approved" />
      <LegendDot className="bg-rose-300" label="Blocked" />
      <LegendDot className="bg-amber-300" label="Open/pending" />
      <LegendDot className="bg-violet-300" label="Hermes/future" />
      <LegendDot className="bg-sky-300" label="Stripe proof" />
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function connectorPath(
  fromKey: WorkflowNodeKey,
  toKey: WorkflowNodeKey,
  from: { x: number; y: number; width: number; height: number },
  to: { x: number; y: number; width: number; height: number },
): string {
  if (from.y === to.y && from.x < to.x) {
    const startX = from.x + from.width;
    const startY = from.y + from.height / 2;
    const endX = to.x;
    const endY = to.y + to.height / 2;
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  if (fromKey === "policy" && toKey === "approved") {
    const startX = from.x + from.width / 2;
    const startY = from.y + from.height;
    const endX = to.x + to.width / 2;
    const endY = to.y;
    const midY = startY + 58;
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  }

  if (fromKey === "policy" && toKey === "blocked") {
    const startX = from.x + from.width / 2;
    const startY = from.y + from.height;
    const endX = to.x + to.width / 2;
    const endY = to.y;
    const midY = startY + 70;
    return `M ${startX} ${startY} C ${startX - 80} ${midY}, ${endX + 60} ${midY}, ${endX} ${endY}`;
  }

  const startX = from.x;
  const startY = from.y + from.height / 2;
  const endX = to.x + to.width;
  const endY = to.y + to.height / 2;
  const delta = Math.max(58, Math.abs(startX - endX) / 2);
  return `M ${startX} ${startY} C ${startX - delta} ${startY}, ${endX + delta} ${endY}, ${endX} ${endY}`;
}

function labelX(from: WorkflowNodeKey, to: WorkflowNodeKey): number {
  if (from === "policy" && to === "approved") {
    return 902;
  }
  if (from === "policy" && to === "blocked") {
    return 744;
  }
  return 0;
}

function labelY(from: WorkflowNodeKey, to: WorkflowNodeKey): number {
  if (from === "policy" && to === "approved") {
    return 286;
  }
  if (from === "policy" && to === "blocked") {
    return 286;
  }
  return 0;
}

function toneColor(tone: WorkflowTone): string {
  const colors: Record<WorkflowTone, string> = {
    amber: "#fbbf24",
    emerald: "#34d399",
    rose: "#fb7185",
    sky: "#38bdf8",
    slate: "#94a3b8",
    teal: "#2dd4bf",
    violet: "#a78bfa",
  };

  return colors[tone];
}
