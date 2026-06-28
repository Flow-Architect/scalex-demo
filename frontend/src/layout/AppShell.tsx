import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import type { AppView } from "./navigation";

export function AppShell({
  activeView,
  busy,
  children,
  displayCustomer,
  displayJob,
  onNavigate,
  onRun,
  profitLabel,
  revenueLabel,
}: {
  activeView: AppView;
  busy: boolean;
  children: ReactNode;
  displayCustomer: string;
  displayJob: string;
  onNavigate: (view: AppView) => void;
  onRun: () => void;
  profitLabel: string;
  revenueLabel: string;
}) {
  return (
    <main className="h-screen overflow-hidden bg-[#050505] text-white">
      <Sidebar
        activeView={activeView}
        busy={busy}
        displayCustomer={displayCustomer}
        displayJob={displayJob}
        onNavigate={onNavigate}
        onRun={onRun}
        profitLabel={profitLabel}
        revenueLabel={revenueLabel}
      />
      <section className="ml-[200px] h-screen overflow-x-hidden bg-[#050505]">
        {children}
      </section>
    </main>
  );
}
