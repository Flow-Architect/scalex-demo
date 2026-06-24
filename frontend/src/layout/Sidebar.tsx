import {
  LogOut,
  ShieldCheck,
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
}: {
  activeView: AppView;
  auth: AuthStatus | null;
  busy: boolean;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
}) {
  return (
    <aside className="border-b border-zinc-200 bg-white text-zinc-950 lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-semibold">ScaleX</p>
            <p className="text-xs text-zinc-500">ClientOps workspace</p>
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
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
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

        <div className="border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
          <p className="font-semibold text-zinc-950">Prototype local auth</p>
          <p className="mt-1 text-xs leading-5">
            {auth?.auth_enabled ? `Signed in as ${auth.username ?? "operator"}` : "Disabled for this local run"}
          </p>
        </div>

        <div className="mt-auto grid gap-2">
          {auth?.auth_enabled ? (
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
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
