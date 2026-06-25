import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

import type { AuthStatus } from "../types";
import { Sidebar } from "./Sidebar";
import type { AppView } from "./navigation";

export function AppShell({
  activeView,
  auth,
  busy,
  children,
  onLogout,
  onNavigate,
  topBar,
}: {
  activeView: AppView;
  auth: AuthStatus | null;
  busy: boolean;
  children: ReactNode;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  topBar: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-stone-100 text-zinc-950">
      <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Sidebar
          activeView={activeView}
          auth={auth}
          busy={busy}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />
        <div className="min-w-0">
          {topBar}
          {children}
        </div>
      </div>
      {auth?.auth_enabled || auth?.authenticated ? (
        <button
          aria-label="Logout"
          className="fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={busy}
          onClick={onLogout}
          type="button"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      ) : null}
    </main>
  );
}
