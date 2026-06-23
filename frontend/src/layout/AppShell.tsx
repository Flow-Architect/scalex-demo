import type { ReactNode } from "react";

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
    </main>
  );
}
