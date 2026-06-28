import { ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { formatDateTime } from "../../../format";
import { softToneClass } from "../../../components/ui/statusStyles";
import type { Tone } from "../../../components/ui/statusStyles";

export function InspectorSection({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description?: string;
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-md shadow-zinc-200/70">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-zinc-950 text-white">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-zinc-600">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function FactGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50 p-3 shadow-sm">
      <p className="text-[0.68rem] font-semibold uppercase text-zinc-500">{label}</p>
      <div className="mt-1 break-words text-sm font-semibold text-zinc-950">{value}</div>
    </div>
  );
}

export function Metric({
  label,
  tone,
  value,
}: {
  label: string;
  tone: Tone;
  value: string;
}) {
  return (
    <div className={`rounded-md border p-3 shadow-sm ${softToneClass(tone)}`}>
      <p className="truncate text-[0.68rem] font-semibold uppercase">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold">{value}</p>
    </div>
  );
}

export function StatusPill({
  icon: Icon,
  label,
  tone,
}: {
  icon?: LucideIcon;
  label: string;
  tone: Tone;
}) {
  return (
    <span className={`inline-flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-xs font-semibold ${softToneClass(tone)}`}>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      <span className="min-w-0 break-words">{label}</span>
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-300 bg-white p-4 text-sm leading-6 text-zinc-600 shadow-sm">
      {children}
    </div>
  );
}

export function Timestamp({ value }: { value: string | null | undefined }) {
  return <span>{formatDateTime(value)}</span>;
}

export function ExternalTextLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="inline-flex max-w-full items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <span className="min-w-0 break-all">{label}</span>
      <ExternalLink className="h-4 w-4 flex-none" aria-hidden="true" />
    </a>
  );
}

export function MarkdownDetails({
  markdown,
  open = false,
  title = "Generated markdown",
}: {
  markdown: string;
  open?: boolean;
  title?: string;
}) {
  if (!markdown.trim()) {
    return <EmptyState>No markdown output recorded.</EmptyState>;
  }

  return (
    <details
      className="rounded-md border border-zinc-200 bg-white p-3 text-sm text-zinc-700 shadow-sm"
      open={open}
    >
      <summary className="cursor-pointer text-sm font-semibold text-zinc-950">{title}</summary>
      <div className="mt-3 max-h-[24rem] space-y-2 overflow-auto pr-1 leading-6">
        {markdown
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line, index) => {
            if (line.startsWith("# ")) {
              return (
                <h4 className="text-sm font-semibold text-zinc-950" key={`${line}-${index}`}>
                  {line.replace("# ", "")}
                </h4>
              );
            }

            if (line.startsWith("- ")) {
              return (
                <p className="pl-3 text-zinc-700" key={`${line}-${index}`}>
                  <span className="mr-2 text-zinc-500">-</span>
                  {line.replace("- ", "")}
                </p>
              );
            }

            return <p key={`${line}-${index}`}>{line}</p>;
          })}
      </div>
    </details>
  );
}
