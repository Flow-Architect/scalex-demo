import {
  LogOut,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import type { AuthStatus } from "../types";
import { NAV_ITEMS } from "./navigation";
import type { AppView } from "./navigation";

export function Sidebar({
  activeView,
  auth,
  busy,
  onLogout,
  onNavigate,
  onStartOnboarding,
}: {
  activeView: AppView;
  auth: AuthStatus | null;
  busy: boolean;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  onStartOnboarding: () => void;
}) {
  return (
    <aside className="border-b border-zinc-800 bg-zinc-950 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-semibold">ScaleX</p>
            <p className="text-xs text-zinc-400">Operator console</p>
          </div>
        </div>

        <nav className="grid gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.view;
            return (
              <button
                className={`flex min-h-11 items-center gap-3 rounded-md border px-3 text-left text-sm font-semibold transition ${
                  active
                    ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
                key={item.view}
                onClick={() => onNavigate(item.view)}
                type="button"
              >
                <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">Prototype local auth</p>
          <p className="mt-1 text-xs leading-5">
            {auth?.auth_enabled ? `Signed in as ${auth.username ?? "operator"}` : "Disabled for this local run"}
          </p>
        </div>

        <div className="mt-auto grid gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            onClick={onStartOnboarding}
            type="button"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Onboard customer
          </button>
          {auth?.auth_enabled ? (
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-zinc-500"
              disabled={busy}
              onClick={onLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
