import {
  BookOpenCheck,
  ClipboardList,
  PlugZap,
  Settings,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppView =
  | "workflow"
  | "customers"
  | "runs"
  | "audit"
  | "integrations"
  | "settings";

export const NAV_ITEMS: Array<{ view: AppView; label: string; icon: LucideIcon }> = [
  { view: "workflow", label: "Workflow", icon: Workflow },
  { view: "customers", label: "Customers", icon: Users },
  { view: "runs", label: "Runs", icon: ClipboardList },
  { view: "audit", label: "Audit", icon: BookOpenCheck },
  { view: "integrations", label: "Integrations", icon: PlugZap },
  { view: "settings", label: "Settings", icon: Settings },
];
