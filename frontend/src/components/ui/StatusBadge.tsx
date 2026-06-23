import type { LucideIcon } from "lucide-react";

import { darkToneClass } from "./statusStyles";
import type { Tone } from "./statusStyles";

export function StatusBadge({
  icon: Icon,
  label,
  tone = "slate",
}: {
  icon?: LucideIcon;
  label: string;
  tone?: Tone;
}) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold ${darkToneClass(tone)}`}>
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {label}
    </span>
  );
}
