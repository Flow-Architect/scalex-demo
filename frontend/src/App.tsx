import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CreditCard,
  KeyRound,
  LockKeyhole,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  getAuthStatus,
  getDemoState,
  getHealth,
  login as loginApi,
  logout as logoutApi,
  resetDemo,
  runDemo,
  saveOnboarding,
  deleteWorkflow,
  selectWorkflow,
} from "./api";
import { formatCurrency, formatDateTime, formatPercent, humanize } from "./format";
import { ProductView as OperationsProductView } from "./features/operations/ProductView";
import { WorkflowPage } from "./features/workflow/WorkflowPage";
import { WORKFLOW_NODE_ORDER, type WorkflowInspectorKey } from "./features/workflow/workflowModel";
import { AppShell } from "./layout/AppShell";
import { TopCommandBar } from "./layout/TopCommandBar";
import type { AppView } from "./layout/navigation";
import {
  auditRowCount,
  moneySnapshot,
  runStatusLabel,
} from "./lib/demoSelectors";
import type { BusyAction, MoneySnapshot } from "./lib/demoSelectors";
import type {
  AuthStatus,
  DemoJob,
  DemoState,
  HealthResponse,
  OnboardingRequest,
  WorkflowConfig,
} from "./types";

interface OnboardingDraft {
  clientName: string;
  businessType: string;
  jobName: string;
  jobGoal: string;
  invoiceAmountUsd: string;
  spendCapUsd: string;
  marginFloorPercent: string;
  approvedVendors: string;
  blockedVendors: string;
}

const HARBOR_ONBOARDING_DRAFT: OnboardingDraft = {
  clientName: "Harbor Fleet Services",
  businessType: "Regional fleet maintenance provider",
  jobName: "30-day fleet brake inspection campaign",
  jobGoal:
    "Generate a client-ready fleet brake inspection package, including campaign copy, operations handoff notes, landing page copy, follow-up messages, and a final profitability report.",
  invoiceAmountUsd: "1200",
  spendCapUsd: "300",
  marginFloorPercent: "50",
  approvedVendors: "Local Ads API, Design Asset Pack",
  blockedVendors: "Premium Automation Suite",
};

export default function App() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [activeView, setActiveView] = useState<AppView>("workflow");
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingDraft>(HARBOR_ONBOARDING_DRAFT);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [state, setState] = useState<DemoState | null>(null);
  const [selectedNodeKey, setSelectedNodeKey] = useState<WorkflowInspectorKey>("summary");
  const [busyAction, setBusyAction] = useState<BusyAction>("initial");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [runCompletedMoment, setRunCompletedMoment] = useState(false);

  const isBusy = busyAction !== null;
  const money = useMemo(() => moneySnapshot(state), [state]);
  const auditRows = useMemo(() => auditRowCount(state), [state]);
  const runStatus = runStatusLabel(state, busyAction, error);
  const activeWorkflow = state?.workflow ?? null;
  const displayCustomer = activeWorkflow?.client_name ?? state?.job?.client_name ?? "No workflow selected";
  const displayJob = activeWorkflow?.job_name ?? state?.job?.job_name ?? "Create or select a workflow";

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (state?.workflow) {
      setOnboardingDraft(draftFromWorkflow(state.workflow));
      return;
    }

    if (state?.job) {
      setOnboardingDraft(draftFromJob(state.job));
    }
  }, [state?.job, state?.workflow]);

  useEffect(() => {
    if (busyAction !== "run") {
      return undefined;
    }

    setPlaybackIndex(0);
    const timer = window.setInterval(() => {
      setPlaybackIndex((current) =>
        current >= WORKFLOW_NODE_ORDER.length - 1 ? current : current + 1,
      );
    }, 700);

    return () => window.clearInterval(timer);
  }, [busyAction]);

  useEffect(() => {
    if (!runCompletedMoment) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRunCompletedMoment(false);
    }, 9000);

    return () => window.clearTimeout(timer);
  }, [runCompletedMoment]);

  async function loadDashboard() {
    setBusyAction("initial");
    setError(null);
    try {
      const [healthResponse, stateResponse] = await Promise.all([
        getHealth(),
        getDemoState(),
      ]);
      setHealth(healthResponse);
      setState(stateResponse);
      if (!stateResponse.workflow && stateResponse.workflows.length === 0) {
        setActiveView("customers");
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function loadSession() {
    setBusyAction("initial");
    setAuthError(null);
    setError(null);
    try {
      const authResponse = await getAuthStatus();
      setAuth(authResponse);
      if (authResponse.authenticated) {
        await loadDashboard();
      } else {
        setBusyAction(null);
      }
    } catch (caught) {
      setAuthError(errorMessage(caught));
      setBusyAction(null);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("initial");
    setAuthError(null);
    try {
      const authResponse = await loginApi(loginForm);
      setAuth(authResponse);
      setLoginForm({ username: "", password: "" });
      if (authResponse.authenticated) {
        await loadDashboard();
      }
    } catch (caught) {
      setAuthError(errorMessage(caught));
      setBusyAction(null);
    }
  }

  async function handleLogout() {
    setBusyAction("initial");
    setAuthError(null);
    try {
      const authResponse = await logoutApi();
      setAuth(authResponse);
      setState(null);
      setHealth(null);
      setSelectedNodeKey("summary");
      setActiveView("workflow");
    } catch (caught) {
      setAuthError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function refreshState() {
    setBusyAction("refresh");
    setError(null);
    setRunCompletedMoment(false);
    try {
      const [healthResponse, stateResponse] = await Promise.all([
        getHealth(),
        getDemoState(),
      ]);
      setHealth(healthResponse);
      setState(stateResponse);
      setNotice("Command center refreshed from the local backend.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRunDemo() {
    setBusyAction("run");
    setError(null);
    setNotice(null);
    setRunCompletedMoment(false);
    try {
      const response = await runDemo();
      setState(response.state);
      setHealth(await getHealth());
      if (response.status === "completed") {
        setPlaybackIndex(WORKFLOW_NODE_ORDER.length - 1);
        setRunCompletedMoment(true);
        setNotice("Workflow run completed with API proof loaded.");
      } else {
        setError(String(response.decision?.error ?? `Run ended with status ${response.status}.`));
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleResetDemo() {
    setBusyAction("reset");
    setError(null);
    setNotice(null);
    setRunCompletedMoment(false);
    try {
      const response = await resetDemo();
      setState(response.state);
      setHealth(await getHealth());
      setNotice("Local workflows and run history reset.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSaveOnboarding(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setBusyAction("reset");
    setOnboardingError(null);
    setError(null);
    try {
      const response = await saveOnboarding(onboardingRequestFromDraft(onboardingDraft));
      setState(response.state);
      setHealth(await getHealth());
      setActiveView("workflow");
      setNotice("Local workflow saved and selected. It is ready to run.");
    } catch (caught) {
      setOnboardingError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleUseHarborSample() {
    setOnboardingDraft(HARBOR_ONBOARDING_DRAFT);
    setBusyAction("reset");
    setOnboardingError(null);
    setError(null);
    try {
      const response = await saveOnboarding(onboardingRequestFromDraft(HARBOR_ONBOARDING_DRAFT));
      setState(response.state);
      setHealth(await getHealth());
      setActiveView("workflow");
      setNotice("Harbor Fleet Services sample loaded.");
    } catch (caught) {
      setOnboardingError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSelectWorkflow(workflowId: string) {
    setBusyAction("refresh");
    setError(null);
    setNotice(null);
    try {
      const response = await selectWorkflow(workflowId);
      setState(response.state);
      setHealth(await getHealth());
      setActiveView("workflow");
      setSelectedNodeKey("summary");
      setNotice("Workflow selected. The next run will use this customer and economics.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeleteWorkflow(workflowId: string) {
    setBusyAction("reset");
    setError(null);
    setNotice(null);
    try {
      const response = await deleteWorkflow(workflowId);
      setState(response.state);
      setHealth(await getHealth());
      setSelectedNodeKey("summary");
      setNotice("Local workflow deleted. Run history remains in SQLite.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleInspectRun(runId: string) {
    setBusyAction("refresh");
    setError(null);
    setNotice(null);
    try {
      const [healthResponse, stateResponse] = await Promise.all([
        getHealth(),
        getDemoState(runId),
      ]);
      setHealth(healthResponse);
      setState(stateResponse);
      setActiveView("runs");
      setSelectedNodeKey("summary");
      setNotice("Historical run loaded from SQLite.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  if (busyAction === "initial" && auth === null && !authError) {
    return <LoadingScreen />;
  }

  if (auth === null && authError) {
    return (
      <LoginScreen
        busy={busyAction === "initial"}
        error={authError}
        form={loginForm}
        onChange={setLoginForm}
        onSubmit={handleLogin}
      />
    );
  }

  if (!auth?.authenticated && auth?.auth_enabled) {
    return (
      <LoginScreen
        busy={busyAction === "initial"}
        error={authError}
        form={loginForm}
        onChange={setLoginForm}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <AppShell
      activeView={activeView}
      auth={auth}
      busy={isBusy}
      onLogout={handleLogout}
      onNavigate={setActiveView}
      onStartOnboarding={() => setActiveView("customers")}
      topBar={
        <TopCommandBar
          activeWorkflow={activeWorkflow}
          busyAction={busyAction}
          displayCustomer={displayCustomer}
          displayJob={displayJob}
          isBusy={isBusy}
          onRefresh={refreshState}
          onReset={handleResetDemo}
          onRun={handleRunDemo}
          runStatus={runStatus}
        />
      }
    >
      {activeView === "workflow" ? (
        <WorkflowPage
          activeWorkflow={activeWorkflow}
          auditRows={auditRows}
          busyAction={busyAction}
          displayCustomer={displayCustomer}
          displayJob={displayJob}
          error={error}
          health={health}
          isBusy={isBusy}
          money={money}
          notice={notice}
          onOpenCustomers={() => setActiveView("customers")}
          onRefresh={refreshState}
          onReset={handleResetDemo}
          onRun={handleRunDemo}
          onSelectNode={setSelectedNodeKey}
          playbackIndex={playbackIndex}
          runStatus={runStatus}
          selectedNodeKey={selectedNodeKey}
          state={state}
        />
      ) : (
        <OperationsProductView
          activeView={activeView}
          auditRows={auditRows}
          auth={auth}
          health={health}
          money={money}
          onDeleteWorkflow={handleDeleteWorkflow}
          onDraftChange={setOnboardingDraft}
          onInspectRun={handleInspectRun}
          onSaveWorkflow={handleSaveOnboarding}
          onSelectWorkflow={handleSelectWorkflow}
          onUseHarborSample={handleUseHarborSample}
          onboardingBusy={busyAction === "reset"}
          onboardingDraft={onboardingDraft}
          onboardingError={onboardingError}
          state={state}
        />
      )}
    </AppShell>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-lg border border-white/15 bg-white/10 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
            <Workflow className="h-5 w-5 animate-pulse" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-semibold">ScaleX</p>
            <p className="text-sm text-zinc-300">Loading local operator console</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoginScreen({
  busy,
  error,
  form,
  onChange,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  form: { username: string; password: string };
  onChange: (form: { username: string; password: string }) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.7fr)]">
        <section className="flex min-h-[22rem] flex-col justify-between border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold">ScaleX</p>
              <p className="text-sm text-zinc-400">Profit-aware agent operations</p>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-emerald-200">
              Secure Operator Console
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight lg:text-6xl">
              Access the autonomous workflow control room.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Local prototype auth gates the demo API and product shell with a signed
              session cookie. It is not production enterprise identity.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            <LoginProof icon={LockKeyhole} label="Local session" />
            <LoginProof icon={BrainCircuit} label="Hermes proof preserved" />
            <LoginProof icon={CreditCard} label="Stripe test only" />
          </div>
        </section>

        <section className="flex items-center justify-center p-6 lg:p-10">
          <form
            className="w-full max-w-md rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30"
            onSubmit={onSubmit}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-300/30 bg-sky-300/10 text-sky-100">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Operator login</h2>
                <p className="text-sm text-zinc-300">Prototype local auth</p>
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold text-zinc-200">
              Username
              <input
                autoComplete="username"
                className="mt-2 min-h-11 w-full rounded-md border border-white/15 bg-zinc-950 px-3 text-white outline-none transition focus:border-emerald-300"
                onChange={(event) => onChange({ ...form, username: event.target.value })}
                type="text"
                value={form.username}
              />
            </label>
            <label className="mt-4 block text-sm font-semibold text-zinc-200">
              Password
              <input
                autoComplete="current-password"
                className="mt-2 min-h-11 w-full rounded-md border border-white/15 bg-zinc-950 px-3 text-white outline-none transition focus:border-emerald-300"
                onChange={(event) => onChange({ ...form, password: event.target.value })}
                type="password"
                value={form.password}
              />
            </label>

            {error ? (
              <div className="mt-4 rounded-lg border border-rose-300/40 bg-rose-300/10 p-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
              disabled={busy}
              type="submit"
            >
              {busy ? (
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              )}
              Enter console
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function LoginProof({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 p-3">
      <Icon className="h-4 w-4 text-emerald-200" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function OnboardingScreen({
  auth,
  busy,
  draft,
  error,
  onDraftChange,
  onLogout,
  onSubmit,
  onUseHarborSample,
}: {
  auth: AuthStatus | null;
  busy: boolean;
  draft: OnboardingDraft;
  error: string | null;
  onDraftChange: (draft: OnboardingDraft) => void;
  onLogout: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUseHarborSample: () => void;
}) {
  return (
    <main className="min-h-screen bg-stone-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
              <Workflow className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-semibold">ScaleX onboarding</p>
              <p className="text-sm text-zinc-600">
                Local sample workflow setup before the operator console.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700">
              {auth?.auth_enabled ? `Signed in as ${auth.username ?? "operator"}` : "Prototype auth disabled"}
            </span>
            {auth?.auth_enabled ? (
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                onClick={onLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(420px,1fr)] lg:px-8">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase text-emerald-700">Customer onboarding</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950 lg:text-5xl">
            Prepare one local revenue-backed workflow.
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Use Harbor Fleet Services or enter a synthetic local sample. ScaleX keeps this
            narrow: one customer, one campaign, one invoice, local policy, SQLite audit.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <OnboardingMetric label="Invoice" value={`$${draft.invoiceAmountUsd || "0"}`} />
            <OnboardingMetric label="Spend cap" value={`$${draft.spendCapUsd || "0"}`} />
            <OnboardingMetric label="Margin floor" value={`${draft.marginFloorPercent || "0"}%`} />
            <OnboardingMetric label="Mode" value="Local sample" />
          </div>

          <button
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={busy}
            onClick={onUseHarborSample}
            type="button"
          >
            {busy ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Building2 className="h-4 w-4" aria-hidden="true" />
            )}
            Use Harbor sample
          </button>
        </section>

        <form
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          onSubmit={onSubmit}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-800">
              <UserPlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">Workflow intake</h2>
              <p className="text-sm text-zinc-600">Synthetic/sample customer data only.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Customer/business name"
              value={draft.clientName}
              onChange={(value) => onDraftChange({ ...draft, clientName: value })}
            />
            <TextField
              label="Business type"
              value={draft.businessType}
              onChange={(value) => onDraftChange({ ...draft, businessType: value })}
            />
            <TextField
              label="Job/campaign name"
              value={draft.jobName}
              onChange={(value) => onDraftChange({ ...draft, jobName: value })}
            />
            <TextField
              label="Invoice amount"
              type="number"
              value={draft.invoiceAmountUsd}
              onChange={(value) => onDraftChange({ ...draft, invoiceAmountUsd: value })}
            />
            <TextField
              label="Spend cap"
              type="number"
              value={draft.spendCapUsd}
              onChange={(value) => onDraftChange({ ...draft, spendCapUsd: value })}
            />
            <TextField
              label="Margin floor"
              type="number"
              value={draft.marginFloorPercent}
              onChange={(value) => onDraftChange({ ...draft, marginFloorPercent: value })}
            />
          </div>

          <label className="mt-4 block text-sm font-semibold text-zinc-700">
            Job goal
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-emerald-500"
              onChange={(event) => onDraftChange({ ...draft, jobGoal: event.target.value })}
              value={draft.jobGoal}
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Optional approved vendors"
              value={draft.approvedVendors}
              onChange={(value) => onDraftChange({ ...draft, approvedVendors: value })}
            />
            <TextField
              label="Optional blocked vendors"
              value={draft.blockedVendors}
              onChange={(value) => onDraftChange({ ...draft, blockedVendors: value })}
            />
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <button
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={busy}
            type="submit"
          >
            {busy ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
            Save local workflow
          </button>
        </form>
      </div>
    </main>
  );
}

function TextField({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold text-zinc-700">
      {label}
      <input
        className="mt-2 min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function OnboardingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function draftFromJob(job: DemoJob): OnboardingDraft {
  return {
    clientName: job.client_name,
    businessType: job.business_type,
    jobName: job.job_name,
    jobGoal: job.job_goal,
    invoiceAmountUsd: String(job.invoice_amount_cents / 100),
    spendCapUsd: String(job.spend_cap_cents / 100),
    marginFloorPercent: String(job.margin_floor_percent),
    approvedVendors: HARBOR_ONBOARDING_DRAFT.approvedVendors,
    blockedVendors: HARBOR_ONBOARDING_DRAFT.blockedVendors,
  };
}

function draftFromWorkflow(workflow: WorkflowConfig): OnboardingDraft {
  return {
    clientName: workflow.client_name,
    businessType: workflow.business_type,
    jobName: workflow.job_name,
    jobGoal: workflow.job_goal,
    invoiceAmountUsd: String(workflow.invoice_amount_cents / 100),
    spendCapUsd: String(workflow.spend_cap_cents / 100),
    marginFloorPercent: String(workflow.margin_floor_percent),
    approvedVendors: workflow.approved_vendors.join(", "),
    blockedVendors: workflow.blocked_vendors.join(", "),
  };
}

function onboardingRequestFromDraft(draft: OnboardingDraft): OnboardingRequest {
  return {
    client_name: draft.clientName,
    business_type: draft.businessType,
    job_name: draft.jobName,
    job_goal: draft.jobGoal,
    invoice_amount_usd: Number(draft.invoiceAmountUsd),
    spend_cap_usd: Number(draft.spendCapUsd),
    margin_floor_percent: Number(draft.marginFloorPercent),
    approved_vendors: splitVendors(draft.approvedVendors),
    blocked_vendors: splitVendors(draft.blockedVendors),
  };
}

function splitVendors(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function errorMessage(caught: unknown): string {
  if (caught instanceof Error) {
    return caught.message;
  }

  return "Unexpected local API error.";
}
