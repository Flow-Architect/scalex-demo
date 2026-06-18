import { Header } from "./components/Header";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Sandbox scaffold
          </p>
          <h1 className="mt-2 text-3xl font-semibold">ScaleX</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-700">
            Profit-aware agent operations for service businesses. The working
            dashboard will be implemented after the backend ledger and demo
            runner are in place.
          </p>
        </div>
      </section>
    </main>
  );
}
