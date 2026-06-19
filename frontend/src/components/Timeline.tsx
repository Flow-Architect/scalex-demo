import {
  BadgeCheck,
  CircleDashed,
  ClipboardList,
  CreditCard,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";

import { formatDateTime, humanize } from "../format";
import type { DemoEvent } from "../types";

interface TimelineProps {
  events: DemoEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Economic loop timeline</h2>
          <p className="mt-1 text-sm text-slate-600">
            Job intake to payment, policy-gated spend, agent work, and profit report.
          </p>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {events.length} events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          Timeline is empty until the demo runs.
        </div>
      ) : (
        <ol className="mt-6 space-y-4">
          {events.map((event, index) => {
            const Icon = iconForEvent(event.type);
            return (
              <li className="grid grid-cols-[2rem_1fr] gap-3" key={event.id}>
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {index < events.length - 1 ? (
                    <span className="mt-2 h-full min-h-8 w-px bg-slate-200" />
                  ) : null}
                </div>
                <article className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{event.title}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {humanize(event.type)}
                      </p>
                    </div>
                    <span className={statusClass(event.status)}>
                      {humanize(event.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{event.detail}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {formatDateTime(event.created_at)}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function iconForEvent(type: string) {
  switch (type) {
    case "job_intake":
      return ClipboardList;
    case "margin_plan":
      return BadgeCheck;
    case "policy_gate":
    case "policy_check":
      return ShieldCheck;
    case "stripe_mock":
    case "payment_confirmed":
      return CreditCard;
    case "agent_work":
      return Users;
    case "profit_report":
      return FileText;
    case "job_complete":
      return LockKeyhole;
    default:
      return CircleDashed;
  }
}

function statusClass(status: string): string {
  const base = "inline-flex w-fit rounded-md border px-2 py-1 text-xs font-medium";
  if (status === "blocked") {
    return `${base} border-rose-200 bg-rose-50 text-rose-800`;
  }
  if (status === "paid" || status === "complete" || status === "approved") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-800`;
  }
  if (status === "guarded" || status === "planned") {
    return `${base} border-amber-200 bg-amber-50 text-amber-800`;
  }
  return `${base} border-slate-200 bg-slate-50 text-slate-700`;
}
