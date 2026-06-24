import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import type {
  WorkflowConnectionModel,
  WorkflowInspectorKey,
  WorkflowModel,
  WorkflowNodeKey,
  WorkflowNodeModel,
  WorkflowNodePosition,
  WorkflowTone,
} from "./workflowModel";
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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    key: WorkflowNodeKey;
    moved: boolean;
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);
  const [draggingKey, setDraggingKey] = useState<WorkflowNodeKey | null>(null);
  const [suppressClickKey, setSuppressClickKey] = useState<WorkflowNodeKey | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<WorkflowNodeKey, WorkflowNodePosition>>(
    () => buildPositionMap(model.nodes),
  );

  useEffect(() => {
    setNodePositions((current) => {
      const next = { ...current };
      for (const node of model.nodes) {
        next[node.key] = current[node.key] ?? node.position;
      }
      return next;
    });
  }, [model.nodes]);

  const nodes = useMemo<WorkflowNodeModel[]>(
    () =>
      model.nodes.map((node) => ({
        ...node,
        position: nodePositions[node.key] ?? node.position,
      })),
    [model.nodes, nodePositions],
  );

  const handleNodePointerDown = (key: WorkflowNodeKey, event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = {
      key,
      moved: false,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setDraggingKey(key);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleNodePointerMove = (key: WorkflowNodeKey, event: ReactPointerEvent<HTMLDivElement>) => {
    const current = dragState.current;
    const canvas = viewportRef.current;
    if (!canvas || !current || current.key !== key || current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - current.x;
    const deltaY = event.clientY - current.y;
    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      current.moved = true;
    }
    current.x = event.clientX;
    current.y = event.clientY;

    setNodePositions((existing) => {
      const position = existing[key];
      if (!position) {
        return existing;
      }

      const nextX = clamp(position.x + (deltaX / canvas.clientWidth) * 100, 1, 99 - position.width);
      const nextY = clamp(position.y + (deltaY / canvas.clientHeight) * 100, 1, 99 - position.height);

      return {
        ...existing,
        [key]: {
          ...position,
          x: nextX,
          y: nextY,
        },
      };
    });
  };

  const handleNodePointerEnd = (key: WorkflowNodeKey, event: ReactPointerEvent<HTMLDivElement>) => {
    const current = dragState.current;
    if (!current || current.key !== key || current.pointerId !== event.pointerId) {
      return;
    }

    if (current.moved) {
      setSuppressClickKey(key);
    }
    dragState.current = null;
    setDraggingKey((existing) => (existing === key ? null : existing));
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleNodeSelect = (key: WorkflowNodeKey) => {
    if (suppressClickKey === key) {
      setSuppressClickKey(null);
      return;
    }

    onSelect(key);
  };

  return (
    <section className="flex h-full min-h-[44rem] flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-white shadow-2xl shadow-zinc-950/30">
      <div className="border-b border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">ClientOps Function Studio</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Revenue-backed client operation with policy-gated setup spend and audited profit proof.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center 2xl:justify-end">
            <CanvasLegend />
            <span className="w-fit rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300">
              {model.activeCount}/{model.nodes.length} nodes active
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div
          ref={viewportRef}
          className="relative h-full min-h-[48rem] overflow-hidden"
        >
          <div
            className="relative h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(16,185,129,0.10),transparent_34%),radial-gradient(circle_at_85%_78%,rgba(244,63,94,0.10),transparent_28%)]" />
            <ConnectorLayer connections={model.connections} nodes={nodes} />
            {nodes.map((node) => (
              <WorkflowNode
                key={node.key}
                dragging={draggingKey === node.key}
                node={node}
                onPointerDown={handleNodePointerDown}
                onPointerMove={handleNodePointerMove}
                onPointerUp={handleNodePointerEnd}
                onSelect={handleNodeSelect}
                selected={selectedKey === node.key}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConnectorLayer({
  connections,
  nodes,
}: {
  connections: WorkflowConnectionModel[];
  nodes: WorkflowNodeModel[];
}) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      height="100%"
      preserveAspectRatio="none"
      viewBox={`0 0 ${WORKFLOW_CANVAS_WIDTH} ${WORKFLOW_CANVAS_HEIGHT}`}
      width="100%"
    >
      <defs>
        {(["teal", "violet", "sky", "amber", "emerald", "rose", "slate"] as WorkflowTone[]).map(
          (tone) => (
            <marker
              id={`workflow-arrow-${tone}`}
              key={tone}
              markerHeight="1.5"
              markerUnits="userSpaceOnUse"
              markerWidth="1.5"
              orient="auto"
              refX="1.2"
              refY="0.75"
              viewBox="0 0 1.5 1.5"
            >
              <path d="M0,0 L1.5,0.75 L0,1.5 Z" fill={toneColor(tone)} />
            </marker>
          ),
        )}
      </defs>
      {connections.map((connection) => {
        const from = nodes.find((node) => node.key === connection.from);
        const to = nodes.find((node) => node.key === connection.to);
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
              strokeWidth={connection.tone === "rose" || connection.tone === "emerald" ? 2.6 : 2.1}
              vectorEffect="non-scaling-stroke"
            />
            {connection.label ? (
              <text
                fill={toneColor(connection.tone)}
                fontSize="1.35"
                fontWeight="700"
                opacity={active ? 0.9 : 0.45}
                x={labelPosition(connection.from, connection.to, from.position, to.position).x}
                y={labelPosition(connection.from, connection.to, from.position, to.position).y}
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
    <div className="flex w-fit flex-wrap gap-2 rounded-lg border border-white/10 bg-zinc-950/80 p-2 text-[0.68rem] font-semibold text-zinc-300 backdrop-blur">
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

function buildPositionMap(nodes: WorkflowNodeModel[]) {
  return nodes.reduce<Record<WorkflowNodeKey, WorkflowNodePosition>>((accumulator, node) => {
    accumulator[node.key] = node.position;
    return accumulator;
  }, {} as Record<WorkflowNodeKey, WorkflowNodePosition>);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function connectorPath(
  fromKey: WorkflowNodeKey,
  toKey: WorkflowNodeKey,
  from: { x: number; y: number; width: number; height: number },
  to: { x: number; y: number; width: number; height: number },
): string {
  const clampCurve = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  if (from.x === to.x) {
    const startX = from.x + from.width / 2;
    const startY = from.y + from.height;
    const endX = to.x + to.width / 2;
    const endY = to.y;
    const midY = startY + clampCurve((endY - startY) / 2, 4, 10);
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  }

  const startX = from.x + from.width;
  const startY = from.y + from.height / 2;
  const endX = to.x;
  const endY = to.y + to.height / 2;

  if (from.y === to.y && from.x < to.x) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  if (
    (fromKey === "policy" && (toKey === "approved" || toKey === "blocked")) ||
    (fromKey === "agents" && toKey === "audit") ||
    (fromKey === "blocked" && toKey === "audit")
  ) {
    const midX = startX + clampCurve((endX - startX) / 2, 5, 10);
    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  }

  const delta = clampCurve(Math.abs(endX - startX) / 2, 4, 9);
  return `M ${startX} ${startY} C ${startX + delta} ${startY}, ${endX - delta} ${endY}, ${endX} ${endY}`;
}

function labelPosition(
  fromKey: WorkflowNodeKey,
  toKey: WorkflowNodeKey,
  from: { x: number; y: number; width: number; height: number },
  to: { x: number; y: number; width: number; height: number },
): { x: number; y: number } {
  if (fromKey === "policy" && toKey === "approved") {
    return {
      x: from.x + from.width + 1.5,
      y: from.y - 3,
    };
  }

  if (fromKey === "policy" && toKey === "blocked") {
    return {
      x: from.x + from.width + 1.5,
      y: from.y + from.height + 7,
    };
  }

  return {
    x: from.x + from.width + Math.max(2, (to.x - from.x - from.width) / 2),
    y:
      from.x === to.x
        ? (from.y + from.height + to.y) / 2 - 1.5
        : (from.y + from.height / 2 + to.y + to.height / 2) / 2 - 1.5,
  };
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
