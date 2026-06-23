import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Ban,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ClipboardList,
  CircleDashed,
  CircleDollarSign,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  KeyRound,
  Layers3,
  LockKeyhole,
  LogOut,
  ReceiptText,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
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
import { darkToneClass, softToneClass } from "./components/ui/statusStyles";
import type { Tone } from "./components/ui/statusStyles";
import { formatCurrency, formatDateTime, formatPercent, humanize } from "./format";
import { WorkflowPage } from "./features/workflow/WorkflowPage";
import { WORKFLOW_NODE_ORDER, type WorkflowInspectorKey } from "./features/workflow/workflowModel";
import { AppShell } from "./layout/AppShell";
import { TopCommandBar } from "./layout/TopCommandBar";
import type { AppView } from "./layout/navigation";
import {
  auditRowCount,
  formatOptionalCurrency,
  formatOptionalPercent,
  hermesFailed,
  isApproved,
  latestWhere,
  moneySnapshot,
  operatingPlanPhases,
  runStatusLabel,
  taskRows,
} from "./lib/demoSelectors";
import type { BusyAction, MoneySnapshot } from "./lib/demoSelectors";
import type {
  AgentOutput,
  AuthStatus,
  DemoEvent,
  DemoJob,
  DemoState,
  HealthResponse,
  HermesMetadata,
  LedgerEntry,
  LedgerTotals,
  OnboardingRequest,
  OrchestrationCall,
  PlanningRun,
  PolicyCheck,
  PolicySummary,
  StripeEvent,
  StripeSummary,
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
        <ProductView
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
          onStartOnboarding={() => setActiveView("customers")}
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

function ProductView({
  activeView,
  auditRows,
  auth,
  health,
  money,
  onDeleteWorkflow,
  onDraftChange,
  onInspectRun,
  onSaveWorkflow,
  onSelectWorkflow,
  onStartOnboarding,
  onUseHarborSample,
  onboardingBusy,
  onboardingDraft,
  onboardingError,
  state,
}: {
  activeView: AppView;
  auditRows: number;
  auth: AuthStatus | null;
  health: HealthResponse | null;
  money: MoneySnapshot;
  onDeleteWorkflow: (workflowId: string) => void;
  onDraftChange: (draft: OnboardingDraft) => void;
  onInspectRun: (runId: string) => void;
  onSaveWorkflow: (event?: FormEvent<HTMLFormElement>) => void;
  onSelectWorkflow: (workflowId: string) => void;
  onStartOnboarding: () => void;
  onUseHarborSample: () => void;
  onboardingBusy: boolean;
  onboardingDraft: OnboardingDraft;
  onboardingError: string | null;
  state: DemoState | null;
}) {
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      {activeView === "customers" ? (
        <CustomersView
          busy={onboardingBusy}
          draft={onboardingDraft}
          error={onboardingError}
          onDeleteWorkflow={onDeleteWorkflow}
          onDraftChange={onDraftChange}
          onSelectWorkflow={onSelectWorkflow}
          onStartOnboarding={onStartOnboarding}
          onSubmit={onSaveWorkflow}
          onUseHarborSample={onUseHarborSample}
          state={state}
        />
      ) : null}
      {activeView === "runs" ? (
        <RunsView money={money} onInspectRun={onInspectRun} state={state} />
      ) : null}
      {activeView === "audit" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <AuditLedgerPanel
            auditRows={auditRows}
            databasePath={state?.database.path ?? health?.database_path ?? null}
            entries={state?.ledger.entries ?? []}
            totals={state?.ledger.totals ?? null}
          />
          <TimelinePanel events={state?.timeline_events ?? state?.events ?? []} />
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm xl:col-span-2">
            <ExecutionFeed calls={state?.orchestration_calls ?? []} />
          </section>
          <StripeProofPanel summary={state?.stripe ?? null} events={state?.stripe_events ?? []} />
          <GuardrailDecisionsPanel
            summary={state?.policy.summary ?? null}
            checks={state?.policy_checks ?? []}
          />
        </div>
      ) : null}
      {activeView === "integrations" ? (
        <IntegrationsView auditRows={auditRows} health={health} state={state} />
      ) : null}
      {activeView === "settings" ? (
        <SettingsView auth={auth} auditRows={auditRows} health={health} state={state} />
      ) : null}
    </div>
  );
}

function CustomersView({
  busy,
  draft,
  error,
  onDeleteWorkflow,
  onDraftChange,
  onSelectWorkflow,
  onStartOnboarding,
  onSubmit,
  onUseHarborSample,
  state,
}: {
  busy: boolean;
  draft: OnboardingDraft;
  error: string | null;
  onDeleteWorkflow: (workflowId: string) => void;
  onDraftChange: (draft: OnboardingDraft) => void;
  onSelectWorkflow: (workflowId: string) => void;
  onStartOnboarding: () => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onUseHarborSample: () => void;
  state: DemoState | null;
}) {
  const activeWorkflow = state?.workflow ?? null;
  const workflows = state?.workflows ?? [];
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h1 className="text-xl font-semibold text-zinc-950">Customers / Workflows</h1>
            </div>
            <p className="mt-1 text-sm text-zinc-600">
              Saved local sample workflows in SQLite. Synthetic/sample customer data only.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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
        </div>

        {activeWorkflow ? (
          <article className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase text-emerald-700">Active workflow</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">{activeWorkflow.client_name}</h2>
            <p className="mt-1 text-sm text-zinc-700">{activeWorkflow.business_type}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{activeWorkflow.job_name}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <ProofChip icon={CircleDollarSign} label="Invoice" value={formatCurrency(activeWorkflow.invoice_amount_cents)} tone="emerald" />
              <ProofChip icon={Gauge} label="Spend cap" value={formatCurrency(activeWorkflow.spend_cap_cents)} tone="sky" />
              <ProofChip icon={TrendingUp} label="Margin floor" value={formatPercent(activeWorkflow.margin_floor_percent)} tone="teal" />
            </div>
          </article>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-zinc-300 p-5 text-sm text-zinc-600">
            Create a workflow or load Harbor Fleet Services before starting a run.
          </div>
        )}

        <div className="mt-5 grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase text-zinc-500">Saved workflows</h2>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
              {workflows.length} saved
            </span>
          </div>
          {workflows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
              No saved local workflows yet.
            </div>
          ) : (
            workflows.map((workflow) => (
              <article
                className={`rounded-lg border p-4 ${
                  workflow.is_active ? "border-emerald-300 bg-emerald-50" : "border-zinc-200 bg-zinc-50"
                }`}
                key={workflow.id}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-zinc-950">{workflow.client_name}</p>
                    <p className="mt-1 text-sm text-zinc-600">{workflow.job_name}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
                      <span className="rounded-md border border-white bg-white px-2 py-1">
                        {formatCurrency(workflow.invoice_amount_cents)} invoice
                      </span>
                      <span className="rounded-md border border-white bg-white px-2 py-1">
                        {formatCurrency(workflow.spend_cap_cents)} cap
                      </span>
                      <span className="rounded-md border border-white bg-white px-2 py-1">
                        {formatPercent(workflow.margin_floor_percent)} floor
                      </span>
                      <span className="rounded-md border border-white bg-white px-2 py-1">
                        Updated {formatDateTime(workflow.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                      disabled={busy || workflow.is_active}
                      onClick={() => onSelectWorkflow(workflow.id)}
                      type="button"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      {workflow.is_active ? "Active" : "Select"}
                    </button>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                      disabled={busy}
                      onClick={() => onDeleteWorkflow(workflow.id)}
                      type="button"
                    >
                      <Ban className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={onSubmit}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-800">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Create workflow</h2>
            <p className="text-sm text-zinc-600">Saved locally in SQLite.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
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

        <div className="mt-4 grid gap-4">
          <TextField
            label="Approved vendors"
            value={draft.approvedVendors}
            onChange={(value) => onDraftChange({ ...draft, approvedVendors: value })}
          />
          <TextField
            label="Blocked vendors"
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
          onClick={onStartOnboarding}
          type="submit"
        >
          {busy ? (
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          )}
          Save and select workflow
        </button>
      </form>
    </div>
  );
}

function RunsView({
  money,
  onInspectRun,
  state,
}: {
  money: MoneySnapshot;
  onInspectRun: (runId: string) => void;
  state: DemoState | null;
}) {
  const calls = state?.orchestration_calls ?? [];
  const reports = state?.reports ?? [];
  const runs = state?.runs ?? state?.jobs ?? [];
  const selectedRunId = state?.selected_run_id ?? state?.job?.id ?? null;
  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-sky-700" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-zinc-950">Run History</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">
          Persisted SQLite job runs. Click any run to inspect its proof records.
        </p>
        <div className="mt-4">
          <MoneyFlow compact money={money} />
        </div>
        <div className="mt-4 space-y-3">
          {runs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
              Run history appears after a workflow run starts.
            </div>
          ) : (
            runs.map((run) => (
              <button
                className={`block w-full rounded-lg border p-4 text-left transition ${
                  run.id === selectedRunId
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-zinc-200 bg-zinc-50 hover:bg-white"
                }`}
                key={run.id}
                onClick={() => onInspectRun(run.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-zinc-950">{run.client_name}</p>
                    <p className="mt-1 text-sm text-zinc-600">{run.job_name}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${eventStatusClass(run.status)}`}>
                    {humanize(run.status)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
                  <span className="rounded-md border border-white bg-white px-2 py-1">
                    Run ID {run.id}
                  </span>
                  <span className="rounded-md border border-white bg-white px-2 py-1">
                    {formatCurrency(run.invoice_amount_cents)} invoice
                  </span>
                  <span className="rounded-md border border-white bg-white px-2 py-1">
                    Started {formatDateTime(run.created_at)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        {state?.job ? (
          <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase text-zinc-500">Selected run</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">{state.job.client_name}</h2>
            <p className="mt-1 text-sm text-zinc-600">{state.job.job_name}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <ProofChip icon={CircleDollarSign} label="Invoice" value={formatCurrency(state.job.invoice_amount_cents)} tone="emerald" />
              <ProofChip icon={Gauge} label="Spend cap" value={formatCurrency(state.job.spend_cap_cents)} tone="sky" />
              <ProofChip icon={TrendingUp} label="Margin" value={formatOptionalPercent(money.marginPercent)} tone="teal" />
            </div>
          </div>
        ) : null}
        <ExecutionFeed calls={calls} />
        {reports.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-zinc-950">Final report</h3>
            <MarkdownPreview markdown={reports[reports.length - 1].report_markdown} />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function IntegrationsView({
  auditRows,
  health,
  state,
}: {
  auditRows: number;
  health: HealthResponse | null;
  state: DemoState | null;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-violet-700" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-zinc-950">Integrations</h1>
      </div>
      <p className="mt-1 text-sm text-zinc-600">
        Current Hermes, Stripe test-mode, SQLite, and policy proof for this local product prototype.
      </p>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <ProofRow
          detail={`${state?.hermes.provider ?? "Pending"} / ${state?.hermes.model ?? "Pending"} / ${state?.hermes.skill_name ?? "Pending"}`}
          icon={BrainCircuit}
          label="Hermes"
          status={state?.hermes.used_real_hermes ? "Real isolated Hermes" : "Test or pending"}
          tone={state?.hermes.used_real_hermes ? "emerald" : "amber"}
        />
        <ProofRow
          detail={`livemode=${state?.stripe.livemode === null || state?.stripe.livemode === undefined ? "pending" : String(state?.stripe.livemode)}; paid=${state?.stripe.paid === null || state?.stripe.paid === undefined ? "pending" : String(state?.stripe.paid)}`}
          icon={CreditCard}
          label="Stripe"
          status={state?.stripe.used_real_stripe ? "Real Stripe test mode" : humanize(state?.stripe.stripe_mode ?? "pending")}
          tone={state?.stripe.used_real_stripe ? "emerald" : state?.stripe.error ? "rose" : "amber"}
        />
        <ProofRow
          detail={`${auditRows} audit rows; ${state?.database.path ?? health?.database_path ?? "path pending"}`}
          icon={Database}
          label="SQLite ledger"
          status={health?.database_exists ? "Active" : "Pending"}
          tone={health?.database_exists ? "teal" : "slate"}
        />
        <ProofRow
          detail={`${state?.workflows.length ?? 0} workflows; ${state?.runs.length ?? 0} persisted runs; selected run ${state?.selected_run_id ?? "none"}`}
          icon={ClipboardList}
          label="Product records"
          status={state?.workflow ? "Workflow selected" : "Needs workflow"}
          tone={state?.workflow ? "teal" : "amber"}
        />
        <ProofRow
          detail="Local policy engine enforces payment-before-spend, vendor lists, spend cap, and margin floor."
          icon={ShieldCheck}
          label="Policy engine"
          status="Local guardrails"
          tone="emerald"
        />
        <ProofRow
          detail="Goal 8 remains next. This UI does not claim a real NemoClaw integration."
          icon={ShieldAlert}
          label="NemoClaw"
          status="Not real yet"
          tone="violet"
        />
      </div>
    </section>
  );
}

function SettingsView({
  auditRows,
  auth,
  health,
  state,
}: {
  auditRows: number;
  auth: AuthStatus | null;
  health: HealthResponse | null;
  state: DemoState | null;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-zinc-700" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-zinc-950">Settings</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">
          Local prototype controls and safety boundaries. No production identity or live-money mode is enabled here.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <ProofRow
            detail={auth?.auth_enabled ? "Signed HTTP-only local session cookie" : "Auth disabled for this local run"}
            icon={LockKeyhole}
            label="Prototype auth"
            status={auth?.auth_enabled ? `Signed in as ${auth.username ?? "operator"}` : "Disabled"}
            tone={auth?.authenticated ? "emerald" : auth?.auth_enabled ? "amber" : "slate"}
          />
          <ProofRow
            detail={`${health?.mode ?? state?.mode ?? "local"}; database ${health?.database_exists ? "exists" : "pending"}`}
            icon={Activity}
            label="Local API"
            status={health?.status ?? "Pending"}
            tone={health?.status === "ok" ? "emerald" : "amber"}
          />
          <ProofRow
            detail={state?.workflow ? state.workflow.job_name : "Create or select a local workflow before running."}
            icon={Workflow}
            label="Active workflow"
            status={state?.workflow?.client_name ?? "No workflow selected"}
            tone={state?.workflow ? "teal" : "amber"}
          />
          <ProofRow
            detail={`${state?.runs.length ?? 0} persisted runs; selected run ${state?.selected_run_id ?? "none"}`}
            icon={ClipboardList}
            label="Run records"
            status={`${auditRows} audit rows in current state`}
            tone={auditRows > 0 ? "teal" : "slate"}
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-violet-700" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-zinc-950">Safety Boundaries</h2>
        </div>
        <div className="mt-4 space-y-3">
          <ProofRow
            detail="Goal 7 uses Stripe test mode only. Live-money execution is deferred to future Verified Live Mode."
            icon={CreditCard}
            label="Payments"
            status="No live money"
            tone="rose"
          />
          <ProofRow
            detail="Goal 8 remains next. This settings view does not claim real NemoClaw integration."
            icon={ShieldAlert}
            label="NemoClaw"
            status="Not real yet"
            tone="violet"
          />
          <ProofRow
            detail={state?.database.path ?? health?.database_path ?? "Path pending"}
            icon={Database}
            label="SQLite"
            status="Local audit ledger"
            tone="teal"
          />
        </div>
      </section>
    </div>
  );
}

function HermesCommandPanel({
  hermes,
  planningRun,
  calls,
  busy,
}: {
  hermes: HermesMetadata | null;
  planningRun: PlanningRun | null;
  calls: OrchestrationCall[];
  busy: boolean;
}) {
  const plan = planningRun?.result_json ?? null;
  const failed = Boolean(planningRun?.error || hermes?.failure_reason || hermes?.error);
  const summary = plan?.executive_summary ?? planningRun?.summary ?? "Run the demo to load the Hermes operating plan.";
  const phases = operatingPlanPhases(plan);
  const tasks = taskRows(plan?.agent_task_list ?? []);
  const proposedTools = plan?.proposed_tool_sequence ?? [];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
                failed
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : busy
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-violet-300 bg-violet-50 text-violet-700"
              }`}
            >
              <BrainCircuit className={`h-6 w-6 ${busy ? "animate-pulse" : ""}`} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Active Execution / Agent Brain / Orchestration
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Hermes plans; ScaleX executes guarded payment, policy, ledger, and report steps.
              </p>
            </div>
          </div>
        </div>
        <span
          className={`inline-flex w-fit rounded-md border px-3 py-2 text-xs font-semibold uppercase ${
            failed
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : planningRun
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
          }`}
        >
          {failed ? "Hermes error" : planningRun ? humanize(planningRun.status) : "Pending"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Fact label="used_real_hermes" value={String(Boolean(hermes?.used_real_hermes))} />
        <Fact label="Provider" value={hermes?.provider ?? planningRun?.provider ?? "Pending"} />
        <Fact label="Model" value={hermes?.model ?? planningRun?.model ?? "Pending"} />
        <Fact
          label="Skill / toolsets"
          value={`${hermes?.skill_name ?? "Pending"} / ${hermes?.toolsets_used?.join(", ") || "none"}`}
        />
      </div>

      {failed ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <div>
            <p className="font-semibold">Hermes integration error</p>
            <p className="mt-1">{planningRun?.error ?? hermes?.failure_reason ?? hermes?.error}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase text-zinc-500">Operating plan summary</p>
          <p className="mt-2 text-sm leading-6 text-zinc-800">{summary}</p>
          {phases.length > 0 ? (
            <div className="mt-4 space-y-2">
              {phases.map((phase, index) => (
                <div className="flex gap-2 text-sm text-zinc-700" key={`${phase}-${index}`}>
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md bg-teal-100 text-xs font-semibold text-teal-800">
                    {index + 1}
                  </span>
                  <span>{phase}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-zinc-500">Agent task list</p>
          {tasks.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">Tasks appear after Hermes returns a plan.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {tasks.map((task) => (
                <div className="rounded-md border border-violet-200 bg-violet-50 p-3" key={task.agent}>
                  <p className="text-sm font-semibold text-violet-950">{task.agent}</p>
                  <p className="mt-1 text-xs leading-5 text-violet-900">{task.task}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-zinc-700" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-zinc-950">Proposed tool sequence</h3>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
            {proposedTools.length || 0} proposed
          </span>
        </div>
        {proposedTools.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
            Hermes proposed tools appear after the planning run.
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {proposedTools.map((toolName, index) => (
              <span
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700"
                key={`${toolName}-${index}`}
              >
                <span className="text-teal-700">#{index + 1}</span>
                {toolName}
              </span>
            ))}
          </div>
        )}
      </div>

      <ExecutionFeed calls={calls} />
    </section>
  );
}

function ExecutionFeed({ calls }: { calls: OrchestrationCall[] }) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-zinc-950">Live execution feed</h3>
        </div>
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          {calls.length} calls
        </span>
      </div>

      {calls.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Orchestration calls appear after the demo runs.
        </div>
      ) : (
        <ol className="mt-3 max-h-[34rem] space-y-2 overflow-auto pr-1">
          {calls.map((call) => {
            const failed = call.status === "failed";
            return (
              <li
                className={`rounded-lg border p-3 ${
                  failed ? "border-rose-200 bg-rose-50" : "border-zinc-200 bg-zinc-50"
                }`}
                key={call.id}
              >
                <div className="grid gap-3 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
                  <p className="font-mono text-sm font-semibold text-zinc-500">#{call.sequence}</p>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-zinc-950">
                      {call.tool_name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{formatDateTime(call.created_at)}</p>
                    {call.error ? (
                      <p className="mt-2 text-xs leading-5 text-rose-700">{call.error}</p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
                      failed
                        ? "border-rose-300 bg-white text-rose-800"
                        : "border-emerald-300 bg-white text-emerald-800"
                    }`}
                  >
                    {failed ? (
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {humanize(call.status)} · {call.duration_ms}ms
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function MoneyFlow({ money, compact = false }: { money: MoneySnapshot; compact?: boolean }) {
  const items = [
    {
      label: "Invoice",
      value: formatOptionalCurrency(money.revenueCents),
      tone: "emerald" as Tone,
    },
    {
      label: "Approved spend",
      value: formatOptionalCurrency(money.approvedSpendCents),
      tone: "sky" as Tone,
    },
    {
      label: "Blocked unsafe spend",
      value: formatOptionalCurrency(money.blockedSpendCents),
      tone: "rose" as Tone,
    },
    {
      label: "Gross profit",
      value: formatOptionalCurrency(money.grossProfitCents),
      tone: "teal" as Tone,
    },
    {
      label: "Margin",
      value: formatOptionalPercent(money.marginPercent),
      tone: "amber" as Tone,
    },
  ];

  return (
    <div className={compact ? "rounded-lg border border-white/15 bg-white/10 p-3" : "mt-4"}>
      {compact ? (
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-white">
            {formatOptionalCurrency(money.revenueCents)} invoice to guarded profit report
          </span>
          <span className="text-xs text-zinc-300">
            {money.actual ? "API proof loaded" : "Awaiting run proof"}
          </span>
        </div>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-5">
        {items.map((item, index) => (
          <div className="min-w-0" key={item.label}>
            <div
              className={`min-h-[5.25rem] rounded-lg border p-3 ${
                compact ? darkToneClass(item.tone) : softToneClass(item.tone)
              }`}
            >
              <p className="truncate text-xs font-semibold uppercase">{item.label}</p>
              <p className="mt-2 truncate text-xl font-semibold">{item.value}</p>
            </div>
            {index < items.length - 1 ? (
              <ArrowRight
                className={`mx-auto my-1 hidden h-4 w-4 sm:block ${
                  compact ? "text-zinc-400" : "text-zinc-400"
                }`}
                aria-hidden="true"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StripeProofPanel({
  summary,
  events,
}: {
  summary: StripeSummary | null;
  events: StripeEvent[];
}) {
  const failed = Boolean(summary?.error);
  const invoiceOpenUnpaid = summary?.invoice_status === "open" && summary.paid === false;
  const latestInvoice = latestWhere(events, (event) => Boolean(event.invoice_id));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Stripe Test Proof</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            {summary?.used_real_stripe
              ? "Real Stripe test-mode customer and finalized invoice records."
              : summary?.stripe_mode === "test_double"
                ? "Stripe test-double mode is labeled for tests or diagnostics."
                : "Stripe test-mode proof appears after the demo run."}
          </p>
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-xs font-semibold ${
            failed
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : summary?.used_real_stripe
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-amber-300 bg-amber-50 text-amber-800"
          }`}
        >
          {failed ? "Error" : humanize(summary?.stripe_mode ?? "pending")}
        </span>
      </div>

      {failed ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">Stripe integration error</p>
          <p className="mt-1">{summary?.error}</p>
        </div>
      ) : null}

      {invoiceOpenUnpaid ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Stripe test invoice finalized and open - not marked paid.
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Fact label="used_real_stripe" value={String(Boolean(summary?.used_real_stripe))} />
        <Fact
          label="livemode"
          value={summary?.livemode === null || summary?.livemode === undefined ? "Pending" : String(summary.livemode)}
        />
        <Fact label="customer ID" value={summary?.customer_id ?? "Pending"} />
        <Fact label="invoice ID" value={summary?.invoice_id ?? "Pending"} />
        <Fact label="invoice_status" value={summary?.invoice_status ?? "Pending"} />
        <Fact
          label="paid"
          value={summary?.paid === null || summary?.paid === undefined ? "Pending" : String(summary.paid)}
        />
      </div>

      {summary?.hosted_invoice_url ? (
        <a
          className="mt-4 flex items-center justify-between gap-3 rounded-lg border-2 border-sky-300 bg-sky-50 p-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
          href={summary.hosted_invoice_url}
          rel="noreferrer"
          target="_blank"
        >
          <span className="min-w-0">
            <span className="block text-xs uppercase text-sky-700">Hosted invoice URL</span>
            <span className="mt-1 block break-all">{summary.hosted_invoice_url}</span>
          </span>
          <ExternalLink className="h-5 w-5 flex-none" aria-hidden="true" />
        </a>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-600">
          Hosted invoice link appears after Stripe creates the invoice.
        </div>
      )}

      {summary?.diagnostic_reason ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">{summary.diagnostic_reason}</p>
      ) : null}
      {latestInvoice ? (
        <p className="mt-3 text-xs text-zinc-500">
          Latest Stripe proof recorded {formatDateTime(latestInvoice.created_at)}.
        </p>
      ) : null}
    </section>
  );
}

function GuardrailDecisionsPanel({
  summary,
  checks,
}: {
  summary: PolicySummary | null;
  checks: PolicyCheck[];
}) {
  const approvedChecks = checks.filter(isApproved);
  const blockedChecks = checks.filter((check) => !isApproved(check));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Guardrail Decisions</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Local Policy currently active until Goal 8 safety integration.
          </p>
        </div>
        <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
          Local Policy
        </span>
      </div>

      {summary ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ProofChip
            icon={Gauge}
            label="Spend cap"
            value={formatCurrency(summary.max_job_spend_usd * 100)}
            tone="sky"
          />
          <ProofChip
            icon={TrendingUp}
            label="Margin floor"
            value={formatPercent(summary.margin_floor_percent)}
            tone="teal"
          />
          <ProofChip
            icon={LockKeyhole}
            label="Payment before spend"
            value={summary.require_payment_before_spend ? "Required" : "Not required"}
            tone="amber"
          />
          <ProofChip
            icon={ShieldAlert}
            label="Vendor list"
            value={`${summary.approved_vendors.length} allowed / ${summary.blocked_vendors.length} blocked`}
            tone="emerald"
          />
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {checks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-600">
            Spend decisions appear after the demo run.
          </div>
        ) : (
          checks.map((check) => {
            const approved = isApproved(check);
            const Icon = approved ? CheckCircle2 : Ban;
            return (
              <article
                className={`rounded-lg border p-3 ${
                  approved ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                }`}
                key={check.id}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`mt-0.5 h-5 w-5 flex-none ${
                      approved ? "text-emerald-700" : "text-rose-700"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-950">{check.vendor}</p>
                        <p className="mt-1 text-xs font-semibold uppercase text-zinc-500">
                          {approved ? "Approved vendor spend" : "Blocked unsafe spend"}
                        </p>
                      </div>
                      <p className="flex-none text-sm font-semibold text-zinc-950">
                        {formatCurrency(check.requested_amount_cents)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-zinc-700">{check.reason}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
                      <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                        Margin after {formatPercent(check.margin_after_spend_percent)}
                      </span>
                      <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                        Action {check.required_action}
                      </span>
                      <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">
                        {formatDateTime(check.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {summary ? (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
          Approved vendors: {summary.approved_vendors.join(", ")}. Blocked vendor:
          {" "}
          {summary.blocked_vendors.join(", ")}.
        </div>
      ) : null}
      {approvedChecks.length > 0 || blockedChecks.length > 0 ? (
        <p className="mt-3 text-xs text-zinc-500">
          Decisions recorded: {approvedChecks.length} approved, {blockedChecks.length} blocked.
        </p>
      ) : null}
    </section>
  );
}

function AgentOutputsPanel({ outputs }: { outputs: AgentOutput[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-violet-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Agent Outputs</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Finance, Marketing, Research, and Ops deliverables for the selected workflow.
          </p>
        </div>
        <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">
          {outputs.length}/4 done
        </span>
      </div>

      {outputs.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Agent outputs appear after the demo run.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {outputs.map((output) => (
            <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4" key={output.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-950">{output.agent_name} Agent</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-600">{output.summary}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 flex-none text-emerald-700" aria-hidden="true" />
              </div>
              <MarkdownPreview markdown={output.output_markdown} />
              <p className="mt-3 text-xs text-zinc-500">
                Completed {formatDateTime(output.created_at)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function JudgeProofPanel({
  state,
  health,
  auditRows,
}: {
  state: DemoState | null;
  health: HealthResponse | null;
  auditRows: number;
}) {
  const hermes = state?.hermes ?? null;
  const stripe = state?.stripe ?? null;
  const policy = state?.policy.summary ?? null;
  const sqlitePath = state?.database.path ?? health?.database_path ?? "Pending";

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-950">Judge Proof</h2>
      </div>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        Required stack proof is surfaced directly from the running app state.
      </p>

      <div className="mt-4 space-y-3">
        <ProofRow
          icon={BrainCircuit}
          label="Hermes Agent"
          status={hermes?.used_real_hermes ? "Real" : "Test or pending"}
          detail={`${hermes?.provider ?? "Pending"} / ${hermes?.model ?? "Pending"} / ${hermes?.skill_name ?? "Pending"}`}
          tone={hermes?.used_real_hermes ? "emerald" : "amber"}
        />
        <ProofRow
          icon={CreditCard}
          label="Stripe"
          status={stripe?.used_real_stripe ? "Real test mode" : humanize(stripe?.stripe_mode ?? "pending")}
          detail={`livemode=${stripe?.livemode === null || stripe?.livemode === undefined ? "pending" : String(stripe.livemode)}`}
          tone={stripe?.used_real_stripe ? "emerald" : "amber"}
        />
        <ProofRow
          icon={Database}
          label="SQLite"
          status={health?.database_exists ? "Active ledger" : "Pending"}
          detail={`${auditRows} audit rows · ${sqlitePath}`}
          tone={health?.database_exists ? "teal" : "slate"}
        />
        <ProofRow
          icon={ShieldCheck}
          label="Policy engine"
          status="Local guardrails"
          detail={policy ? `${policy.name}: cap, payment, margin, vendor checks` : "Pending"}
          tone="emerald"
        />
        <ProofRow
          icon={ShieldAlert}
          label="Future"
          status="NemoClaw Goal 8"
          detail="Not claimed as wired yet; next goal is safety integration and presentation."
          tone="violet"
        />
      </div>
    </section>
  );
}

function AuditLedgerPanel({
  entries,
  totals,
  databasePath,
  auditRows,
}: {
  entries: LedgerEntry[];
  totals: LedgerTotals | null;
  databasePath: string | null;
  auditRows: number;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">SQLite Audit Ledger</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Revenue, approved spend, policy checks, Stripe records, and orchestration calls.
          </p>
        </div>
        <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
          {auditRows} rows
        </span>
      </div>
      <p className="mt-3 break-all rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
        {databasePath ?? "Ledger path pending"}
      </p>

      {entries.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Ledger entries appear after revenue and approved spend are recorded.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Label</th>
                <th className="px-3 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-3">
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700">
                      {humanize(entry.entry_type)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-zinc-950">{entry.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {entry.source} · {formatDateTime(entry.created_at)}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-zinc-950">
                    {formatCurrency(entry.amount_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totals ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <ProofChip
            icon={CircleDollarSign}
            label="Revenue"
            value={formatCurrency(totals.revenue_cents)}
            tone="emerald"
          />
          <ProofChip
            icon={WalletCards}
            label="Approved spend"
            value={formatCurrency(totals.approved_spend_cents)}
            tone="sky"
          />
          <ProofChip
            icon={Gauge}
            label="Remaining cap"
            value={formatCurrency(totals.remaining_spend_cap_cents)}
            tone="amber"
          />
        </div>
      ) : null}
    </section>
  );
}

function TimelinePanel({ events }: { events: DemoEvent[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-zinc-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Audit Timeline</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Human-readable events generated during the compressed lifecycle.
          </p>
        </div>
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          {events.length} events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Timeline events appear after the demo runs.
        </div>
      ) : (
        <ol className="mt-4 max-h-[32rem] space-y-3 overflow-auto pr-1">
          {events.map((event) => {
            const Icon = iconForEvent(event.type);
            return (
              <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-3" key={event.id}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-950">{event.title}</p>
                        <p className="mt-1 text-xs font-semibold uppercase text-zinc-500">
                          {humanize(event.type)}
                        </p>
                      </div>
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${eventStatusClass(event.status)}`}>
                        {humanize(event.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-zinc-700">{event.detail}</p>
                    <p className="mt-2 text-xs text-zinc-500">{formatDateTime(event.created_at)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function ProofChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: Tone;
}) {
  return (
    <div className={`rounded-lg border p-3 ${softToneClass(tone)}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
        <p className="truncate text-xs font-semibold uppercase">{label}</p>
      </div>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function ProofRow({
  icon: Icon,
  label,
  status,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  status: string;
  detail: string;
  tone: Tone;
}) {
  return (
    <article className={`rounded-lg border p-3 ${softToneClass(tone)}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-950">{label}</p>
          <p className="mt-1 text-sm font-semibold">{status}</p>
          <p className="mt-1 break-words text-xs leading-5">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-t border-zinc-200 pt-3">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-700">
      {markdown
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          if (line.startsWith("# ")) {
            return (
              <h3 className="text-sm font-semibold text-zinc-950" key={`${line}-${index}`}>
                {line.replace("# ", "")}
              </h3>
            );
          }

          if (line.startsWith("- ")) {
            return (
              <p className="pl-4 text-zinc-700" key={`${line}-${index}`}>
                <span className="mr-2 text-zinc-400">-</span>
                {line.replace("- ", "")}
              </p>
            );
          }

          return <p key={`${line}-${index}`}>{line}</p>;
        })}
    </div>
  );
}

function iconForEvent(type: string): LucideIcon {
  switch (type) {
    case "job_intake":
      return Target;
    case "hermes_planning":
      return BrainCircuit;
    case "margin_plan":
      return TrendingUp;
    case "policy_gate":
    case "policy_check":
      return ShieldCheck;
    case "stripe_test":
    case "stripe_test_double":
    case "stripe_integration_error":
    case "payment_confirmed":
      return CreditCard;
    case "agent_work":
      return Layers3;
    case "profit_report":
      return FileText;
    case "job_complete":
      return LockKeyhole;
    default:
      return CircleDashed;
  }
}

function eventStatusClass(status: string): string {
  if (status === "blocked" || status === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }
  if (status === "complete" || status === "paid" || status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (status === "guarded" || status === "planned" || status === "local_test_confirmed") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (status === "stripe_test" || status === "test_double") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
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
