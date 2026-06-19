import { BrainCircuit, CheckCircle2 } from "lucide-react";

import { formatDateTime } from "../format";
import type { AgentOutput } from "../types";

interface AgentWorkboardProps {
  outputs: AgentOutput[];
}

export function AgentWorkboard({ outputs }: AgentWorkboardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-violet-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Agent workboard</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Deterministic local outputs from Finance, Marketing, Research, and Ops.
          </p>
        </div>
        <span className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-violet-800">
          Seeded outputs
        </span>
      </div>

      {outputs.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          Agent outputs appear after the demo runs.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {outputs.map((output) => (
            <article className="rounded-lg border border-slate-200 p-4" key={output.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {output.agent_name} Agent
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{output.summary}</p>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <MarkdownPreview markdown={output.output_markdown} />
              <p className="mt-4 text-xs text-slate-500">
                Completed {formatDateTime(output.created_at)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
      {markdown
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          if (line.startsWith("# ")) {
            return (
              <h3 className="text-sm font-semibold text-slate-950" key={`${line}-${index}`}>
                {line.replace("# ", "")}
              </h3>
            );
          }

          if (line.startsWith("- ")) {
            return (
              <p className="pl-4 text-slate-700" key={`${line}-${index}`}>
                <span className="mr-2 text-slate-400">-</span>
                {line.replace("- ", "")}
              </p>
            );
          }

          return <p key={`${line}-${index}`}>{line}</p>;
        })}
    </div>
  );
}
