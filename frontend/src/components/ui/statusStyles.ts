export type Tone = "emerald" | "sky" | "amber" | "rose" | "teal" | "violet" | "slate";

export function softToneClass(tone: Tone): string {
  switch (tone) {
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "sky":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "teal":
      return "border-teal-200 bg-teal-50 text-teal-900";
    case "violet":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "slate":
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

export function darkToneClass(tone: Tone): string {
  switch (tone) {
    case "emerald":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
    case "sky":
      return "border-sky-300/30 bg-sky-300/10 text-sky-100";
    case "amber":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100";
    case "rose":
      return "border-rose-300/30 bg-rose-300/10 text-rose-100";
    case "teal":
      return "border-teal-300/30 bg-teal-300/10 text-teal-100";
    case "violet":
      return "border-violet-300/30 bg-violet-300/10 text-violet-100";
    case "slate":
      return "border-zinc-300/20 bg-zinc-300/10 text-zinc-100";
    default:
      return "border-zinc-300/20 bg-zinc-300/10 text-zinc-100";
  }
}
