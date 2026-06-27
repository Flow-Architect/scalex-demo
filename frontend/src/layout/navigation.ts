import {
  BookOpenCheck,
  ClipboardList,
  LayoutDashboard,
  PlugZap,
  Settings,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppView =
  | "dashboard"
  | "workflow"
  | "onboarding"
  | "customers"
  | "runs"
  | "audit"
  | "integrations"
  | "settings";

export const NAV_ITEMS: Array<{ view: AppView; label: string; icon: LucideIcon }> = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "workflow", label: "Governed Run Studio", icon: Workflow },
  { view: "onboarding", label: "Onboarding", icon: UserPlus },
  { view: "customers", label: "Client Operations", icon: Users },
  { view: "runs", label: "Runs", icon: ClipboardList },
  { view: "audit", label: "Evidence Ledger", icon: BookOpenCheck },
  { view: "integrations", label: "Connection Hub", icon: PlugZap },
  { view: "settings", label: "Settings", icon: Settings },
];
