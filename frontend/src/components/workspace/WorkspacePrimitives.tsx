import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

import type { Tone } from "../ui/statusStyles";
import { softToneClass } from "../ui/statusStyles";

export interface RailItem {
  label: string;
  value: string;
  tone?: Tone;
}

export interface TimelineStep {
  label: string;
  description?: string;
  icon?: LucideIcon;
  tone?: Tone;
}

export interface OperationStateItem {
  icon?: LucideIcon;
  label: string;
  value: string;
  tone?: Tone;
}

export function WorkspacePage({
  actions,
  children,
  description,
  eyebrow,
  meta,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description: string;
  eyebrow: string;
  meta?: ReactNode;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-[94rem] space-y-7 text-zinc-950">
      <header className="scalex-grid-surface grid gap-5 overflow-hidden rounded-md bg-zinc-950 p-6 text-white shadow-xl shadow-zinc-950/20 ring-1 ring-zinc-900 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase text-emerald-300">{eyebrow}</p>
          <h1 className="mt-2 max-w-5xl text-4xl font-semibold leading-tight tracking-normal text-white lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-zinc-300">{description}</p>
          {meta ? <div className="mt-4">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function OperationHero({
  actions,
  children,
  client,
  states,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  client: string;
  states: OperationStateItem[];
  subtitle: string;
  title: string;
}) {
  return (
    <section className="grid overflow-hidden rounded-md bg-white shadow-xl shadow-zinc-200/60 ring-1 ring-zinc-200/80 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="px-6 py-8 sm:px-8 lg:px-10">
        <p className="text-sm font-semibold uppercase text-zinc-500">{client}</p>
        <h2 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-zinc-950 lg:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-700">{subtitle}</p>
        {children ? <div className="mt-5 max-w-3xl text-sm leading-6 text-zinc-600">{children}</div> : null}
        {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </div>
      <aside className="border-t border-zinc-200 bg-zinc-50 px-6 py-7 sm:px-8 xl:border-l xl:border-t-0">
        <p className="text-sm font-semibold uppercase text-zinc-500">Primary operation</p>
        <div className="mt-5 divide-y divide-zinc-200">
          {states.map((item) => {
            const Icon = item.icon ?? CheckCircle2;
            return (
              <div className="grid grid-cols-[2rem_1fr] gap-3 py-4 first:pt-0" key={item.label}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-md border ${softToneClass(item.tone ?? "slate")}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-zinc-500">{item.label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-zinc-950">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </section>
  );
}

export function OutcomeRail({ items }: { items: RailItem[] }) {
  return (
    <section className="overflow-hidden rounded-md bg-white shadow-lg shadow-zinc-200/70 ring-1 ring-zinc-200/80" aria-label="Outcome ledger">
      <div className="grid divide-y divide-zinc-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-6">
        {items.map((item) => (
          <div className="px-5 py-5 sm:px-6" key={item.label}>
            <p className="text-xs font-semibold uppercase text-zinc-500">{item.label}</p>
            <p className={`mt-2 text-3xl font-semibold leading-none ${valueClass(item.tone ?? "slate")}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OperationTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="grid gap-0 overflow-hidden rounded-md bg-white shadow-lg shadow-zinc-200/70 ring-1 ring-zinc-200/80 lg:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <li
            className="border-b border-zinc-200 p-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            key={step.label}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-semibold uppercase text-zinc-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              {Icon ? (
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : null}
            </div>
            <h3 className="mt-4 text-base font-semibold leading-6 text-zinc-950">{step.label}</h3>
            {step.description ? (
              <p className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function WorkspaceSection({
  actions,
  children,
  description,
  id,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  id?: string;
  title: string;
}) {
  return (
    <section className="scroll-mt-28 border-t border-zinc-300/70 pt-8" id={id}>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="border-l-4 border-emerald-400 pl-4">
          <h2 className="text-3xl font-semibold leading-tight text-zinc-950">{title}</h2>
          {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function TemplateShelf({
  implemented,
  planned,
}: {
  implemented: string;
  planned: string[];
}) {
  return (
    <div className="grid gap-5 rounded-md bg-white p-6 shadow-lg shadow-zinc-200/70 ring-1 ring-zinc-200/80 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div>
        <p className="text-xs font-semibold uppercase text-emerald-700">Implemented</p>
        <p className="mt-2 text-xl font-semibold text-zinc-950">{implemented}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-zinc-500">Planned</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {planned.map((template) => (
            <span
              className="inline-flex min-h-9 items-center rounded-md bg-zinc-100 px-3 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200"
              key={template}
            >
              {template}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProofRoute({
  description,
  icon: Icon,
  label,
  tone = "slate",
}: {
  description: string;
  icon: LucideIcon;
  label: string;
  tone?: Tone;
}) {
  return (
    <article className={`rounded-md border p-4 ${softToneClass(tone)}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </article>
  );
}

export function EmptyWorkspaceState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-300 bg-white/90 px-5 py-8 text-sm leading-6 text-zinc-600 shadow-sm">
      {children}
    </div>
  );
}

export function PlainTable({
  children,
  headers,
}: {
  children: ReactNode;
  headers: string[];
}) {
  return (
    <div className="overflow-hidden rounded-md bg-white shadow-lg shadow-zinc-200/70 ring-1 ring-zinc-200/80">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-950 text-left text-xs uppercase text-zinc-200">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-3 font-semibold" key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white">{children}</tbody>
      </table>
    </div>
  );
}

function valueClass(tone: Tone): string {
  switch (tone) {
    case "emerald":
      return "text-emerald-700";
    case "sky":
      return "text-sky-700";
    case "amber":
      return "text-amber-700";
    case "rose":
      return "text-rose-700";
    case "teal":
      return "text-teal-700";
    case "violet":
      return "text-violet-700";
    case "slate":
    default:
      return "text-zinc-950";
  }
}
