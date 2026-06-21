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
  Clock3,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  KeyRound,
  Layers3,
  LockKeyhole,
  LogOut,
  Play,
  ReceiptText,
  RefreshCw,
  RotateCcw,
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
} from "./api";
import { formatCurrency, formatDateTime, formatPercent, humanize } from "./format";
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
} from "./types";

type BusyAction = "initial" | "refresh" | "run" | "reset" | null;
type StageStatus = "pending" | "current" | "complete" | "blocked" | "error";
type Tone = "emerald" | "sky" | "amber" | "rose" | "teal" | "violet" | "slate";
type AppView = "workflow" | "customers" | "runs" | "audit" | "integrations";

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

interface WorkflowNode {
  name: string;
  status: StageStatus;
  proof: string;
  timestamp: string | null;
  badge: string;
  icon: LucideIcon;
}

interface PipelineStage {
  name: string;
  status: StageStatus;
  timestamp: string | null;
  modeLabel: string;
  proof: string;
  icon: LucideIcon;
}

interface MoneySnapshot {
  actual: boolean;
  revenueCents: number | null;
  approvedSpendCents: number | null;
  blockedSpendCents: number | null;
  grossProfitCents: number | null;
  marginPercent: number | null;
  policyViolations: number | null;
  spendCapCents: number | null;
  marginFloorPercent: number | null;
}

type PlaybackKey =
  | "intake"
  | "hermes"
  | "stripe"
  | "policy"
  | "blocked"
  | "agents"
  | "report";

interface PlaybackStep {
  key: PlaybackKey;
  label: string;
  icon: LucideIcon;
}

const LOCKED_DEMO_BLOCKED_SPEND_CENTS = 75_000;
const ONBOARDING_STORAGE_KEY = "scalex:onboarding-complete";

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

const PLAYBACK_STEPS: PlaybackStep[] = [
  { key: "intake", label: "Intake received", icon: Target },
  { key: "hermes", label: "Hermes planned", icon: BrainCircuit },
  { key: "stripe", label: "Stripe invoice created", icon: CreditCard },
  { key: "policy", label: "Policy checked spend", icon: ShieldCheck },
  { key: "blocked", label: "Unsafe spend blocked", icon: Ban },
  { key: "agents", label: "Agents produced work", icon: Layers3 },
  { key: "report", label: "Profit report generated", icon: FileText },
];

const stageStatusMeta: Record<
  StageStatus,
  { label: string; icon: LucideIcon; className: string; railClassName: string }
> = {
  pending: {
    label: "Pending",
    icon: CircleDashed,
    className: "border-zinc-200 bg-zinc-50 text-zinc-600",
    railClassName: "border-zinc-200 bg-white",
  },
  current: {
    label: "Current",
    icon: Clock3,
    className: "border-amber-300 bg-amber-50 text-amber-800",
    railClassName: "border-amber-300 bg-amber-50",
  },
  complete: {
    label: "Complete",
    icon: CheckCircle2,
    className: "border-emerald-300 bg-emerald-50 text-emerald-800",
    railClassName: "border-emerald-300 bg-emerald-50",
  },
  blocked: {
    label: "Guardrail block",
    icon: ShieldAlert,
    className: "border-rose-300 bg-rose-50 text-rose-800",
    railClassName: "border-rose-300 bg-rose-50",
  },
  error: {
    label: "Error",
    icon: AlertTriangle,
    className: "border-rose-300 bg-rose-50 text-rose-800",
    railClassName: "border-rose-300 bg-rose-50",
  },
};

export default function App() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [activeView, setActiveView] = useState<AppView>("workflow");
  const [onboardingComplete, setOnboardingComplete] = useState(readOnboardingComplete);
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingDraft>(HARBOR_ONBOARDING_DRAFT);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [state, setState] = useState<DemoState | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>("initial");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [runCompletedMoment, setRunCompletedMoment] = useState(false);

  const isBusy = busyAction !== null;
  const pipeline = useMemo(() => buildPipeline(state), [state]);
  const money = useMemo(() => moneySnapshot(state), [state]);
  const auditRows = useMemo(() => auditRowCount(state), [state]);
  const runStatus = runStatusLabel(state, busyAction, error);
  const showExecutionReplay =
    busyAction === "run" || runCompletedMoment || Boolean(state?.report);

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!state?.job || onboardingComplete) {
      return;
    }

    setOnboardingDraft(draftFromJob(state.job));
  }, [onboardingComplete, state?.job]);

  useEffect(() => {
    if (busyAction !== "run") {
      return undefined;
    }

    setPlaybackIndex(0);
    const timer = window.setInterval(() => {
      setPlaybackIndex((current) =>
        current >= PLAYBACK_STEPS.length - 1 ? current : current + 1,
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
      setOnboardingComplete(false);
      writeOnboardingComplete(false);
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
        setPlaybackIndex(PLAYBACK_STEPS.length - 1);
        setRunCompletedMoment(true);
        setNotice("Demo lifecycle completed with API proof loaded.");
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
      setNotice("Demo state reset.");
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
      setOnboardingComplete(true);
      writeOnboardingComplete(true);
      setActiveView("workflow");
      setNotice("Local onboarding saved. The workflow is ready to run.");
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
      setOnboardingComplete(true);
      writeOnboardingComplete(true);
      setActiveView("workflow");
      setNotice("Harbor Fleet Services sample loaded.");
    } catch (caught) {
      setOnboardingError(errorMessage(caught));
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

  if (!onboardingComplete) {
    return (
      <OnboardingScreen
        auth={auth}
        busy={busyAction === "reset"}
        draft={onboardingDraft}
        error={onboardingError ?? authError}
        onDraftChange={setOnboardingDraft}
        onLogout={handleLogout}
        onSubmit={handleSaveOnboarding}
        onUseHarborSample={handleUseHarborSample}
      />
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 text-zinc-950">
      <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <AppSidebar
          activeView={activeView}
          auth={auth}
          busy={isBusy}
          onLogout={handleLogout}
          onNavigate={setActiveView}
          onStartOnboarding={() => {
            setOnboardingComplete(false);
            writeOnboardingComplete(false);
          }}
        />
        <div className="min-w-0">
          {activeView === "workflow" ? (
            <>
      <section className="border-b border-zinc-900 bg-zinc-950 text-white">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-100">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  ScaleX Command Center
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-zinc-200">
                  <Activity className="h-4 w-4 text-sky-200" aria-hidden="true" />
                  {runStatus}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
                  disabled={isBusy}
                  onClick={handleRunDemo}
                  type="button"
                >
                  {busyAction === "run" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Play className="h-4 w-4" aria-hidden="true" />
                  )}
                  Run Demo Job
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-zinc-500"
                  disabled={isBusy}
                  onClick={handleResetDemo}
                  type="button"
                >
                  {busyAction === "reset" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  )}
                  Reset
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-zinc-500"
                  disabled={isBusy}
                  onClick={refreshState}
                  type="button"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${busyAction === "refresh" ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] xl:items-stretch">
              <div className="flex min-h-[19rem] flex-col justify-between rounded-lg border border-white/15 bg-white/5 p-5">
                <div>
                  <p className="text-sm font-semibold uppercase text-emerald-200">
                    Profit-aware agent operations
                  </p>
                  <h1 className="mt-3 max-w-5xl text-4xl font-semibold leading-tight text-white lg:text-6xl">
                    ScaleX ran a live AI business workflow.
                  </h1>
                  <p className="mt-4 max-w-4xl text-base leading-7 text-zinc-300 lg:text-lg">
                    One Harbor Fleet Services job went from intake to Hermes planning,
                    Stripe test invoicing, policy-gated spend, agent work, and an
                    audited profit report.
                  </p>
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  <HeroClaim
                    icon={Workflow}
                    label="What it does"
                    value="Runs a paid service workflow end to end"
                  />
                  <HeroClaim
                    icon={ShieldCheck}
                    label="Why it matters"
                    value="Blocks spend that would violate margin policy"
                  />
                  <HeroClaim
                    icon={BookOpenCheck}
                    label="What judges see"
                    value="Proof records from integrations and SQLite"
                  />
                </div>
              </div>

              <ProfitProtectedHero money={money} />
            </div>

            <HeroStackProof state={state} health={health} auditRows={auditRows} />

            <WorkflowCanvas
              auditRows={auditRows}
              busy={busyAction === "run"}
              money={money}
              playbackIndex={playbackIndex}
              state={state}
            />

            {showExecutionReplay ? (
              <ExecutionPlayback
                busy={busyAction === "run"}
                error={error}
                money={money}
                playbackIndex={playbackIndex}
                state={state}
              />
            ) : null}

            {notice ? (
              <div className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                {notice}
              </div>
            ) : null}
            {error ? (
              <div className="flex items-start gap-3 rounded-lg border border-rose-300/40 bg-rose-400/10 p-4 text-sm text-rose-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
                <div>
                  <p className="font-semibold">API request failed</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_420px]">
          <LivePipeline stages={pipeline} />

          <HermesCommandPanel
            hermes={state?.hermes ?? null}
            planningRun={state?.planning_run ?? null}
            calls={state?.orchestration_calls ?? []}
            busy={busyAction === "run"}
          />

          <ProofColumn
            money={money}
            stripe={state?.stripe ?? null}
            stripeEvents={state?.stripe_events ?? []}
            policySummary={state?.policy.summary ?? null}
            policyChecks={state?.policy_checks ?? []}
          />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_420px]">
          <AgentOutputsPanel outputs={state?.agent_outputs ?? []} />
          <JudgeProofPanel
            state={state}
            health={health}
            auditRows={auditRows}
          />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <AuditLedgerPanel
            entries={state?.ledger.entries ?? []}
            totals={state?.ledger.totals ?? null}
            databasePath={state?.database.path ?? health?.database_path ?? null}
            auditRows={auditRows}
          />
          <TimelinePanel events={state?.timeline_events ?? state?.events ?? []} />
        </section>
      </div>
            </>
          ) : (
            <ProductView
              activeView={activeView}
              auditRows={auditRows}
              health={health}
              money={money}
              onStartOnboarding={() => {
                setOnboardingComplete(false);
                writeOnboardingComplete(false);
              }}
              state={state}
            />
          )}
        </div>
      </div>
    </main>
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

function AppSidebar({
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
  const navItems: Array<{ view: AppView; label: string; icon: LucideIcon }> = [
    { view: "workflow", label: "Dashboard / Workflow", icon: Workflow },
    { view: "customers", label: "Customers", icon: Users },
    { view: "runs", label: "Runs", icon: ClipboardList },
    { view: "audit", label: "Audit", icon: BookOpenCheck },
    { view: "integrations", label: "Settings / Integrations", icon: Settings },
  ];

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
          {navItems.map((item) => {
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

function WorkflowCanvas({
  auditRows,
  busy,
  money,
  playbackIndex,
  state,
}: {
  auditRows: number;
  busy: boolean;
  money: MoneySnapshot;
  playbackIndex: number;
  state: DemoState | null;
}) {
  const nodes = buildWorkflowNodes(state, money, auditRows, busy, playbackIndex);
  const approvedChecks = state?.policy_checks.filter(isApproved) ?? [];
  const blockedChecks = state?.policy_checks.filter((check) => !isApproved(check)) ?? [];

  return (
    <section className="rounded-lg border border-white/15 bg-zinc-900/80 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-emerald-200" aria-hidden="true" />
            <h2 className="text-base font-semibold text-white">Autonomous Workflow Map</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-300">
            Animated presentation while the run is in flight; completed proof is loaded from the API state.
          </p>
        </div>
        <span className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-200">
          {nodes.filter((node) => node.status !== "pending").length}/{nodes.length} nodes active
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {nodes.map((node, index) => (
          <WorkflowNodeCard
            approvedChecks={approvedChecks}
            blockedChecks={blockedChecks}
            key={node.name}
            node={node}
            showBranches={node.name === "Spend Decision"}
            showConnector={index < nodes.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function WorkflowNodeCard({
  approvedChecks,
  blockedChecks,
  node,
  showBranches,
  showConnector,
}: {
  approvedChecks: PolicyCheck[];
  blockedChecks: PolicyCheck[];
  node: WorkflowNode;
  showBranches: boolean;
  showConnector: boolean;
}) {
  const Icon = node.icon;
  const StatusIcon = stageStatusMeta[node.status].icon;
  return (
    <article className={`relative min-h-[13rem] rounded-lg border p-4 ${darkStageClass(node.status)}`}>
      {showConnector ? (
        <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 rounded-full border border-white/15 bg-zinc-950 p-1 text-zinc-300 lg:block" />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/10">
          <Icon className={`h-5 w-5 ${node.status === "current" ? "animate-pulse" : ""}`} aria-hidden="true" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs font-semibold">
          <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {stageStatusMeta[node.status].label}
        </span>
      </div>
      <p className="mt-3 text-base font-semibold text-white">{node.name}</p>
      <p className="mt-2 text-sm leading-5 text-zinc-200">{node.proof}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 font-semibold">
          {node.badge}
        </span>
        <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1">
          {formatDateTime(node.timestamp)}
        </span>
      </div>
      {showBranches ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-emerald-300/30 bg-emerald-300/10 p-2 text-xs text-emerald-100">
            <p className="font-semibold">Proceed branch</p>
            <p className="mt-1">{approvedChecks.length} approved spend checks</p>
          </div>
          <div className="rounded-md border border-rose-300/40 bg-rose-300/10 p-2 text-xs text-rose-100">
            <p className="font-semibold">Blocked branch</p>
            <p className="mt-1">
              {blockedChecks[0]
                ? `${formatCurrency(blockedChecks[0].requested_amount_cents)} ${blockedChecks[0].vendor}`
                : "$750 unsafe spend pending"}
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ProductView({
  activeView,
  auditRows,
  health,
  money,
  onStartOnboarding,
  state,
}: {
  activeView: AppView;
  auditRows: number;
  health: HealthResponse | null;
  money: MoneySnapshot;
  onStartOnboarding: () => void;
  state: DemoState | null;
}) {
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      {activeView === "customers" ? (
        <CustomersView onStartOnboarding={onStartOnboarding} state={state} />
      ) : null}
      {activeView === "runs" ? <RunsView money={money} state={state} /> : null}
      {activeView === "audit" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <AuditLedgerPanel
            auditRows={auditRows}
            databasePath={state?.database.path ?? health?.database_path ?? null}
            entries={state?.ledger.entries ?? []}
            totals={state?.ledger.totals ?? null}
          />
          <TimelinePanel events={state?.timeline_events ?? state?.events ?? []} />
        </div>
      ) : null}
      {activeView === "integrations" ? (
        <IntegrationsView auditRows={auditRows} health={health} state={state} />
      ) : null}
    </div>
  );
}

function CustomersView({
  onStartOnboarding,
  state,
}: {
  onStartOnboarding: () => void;
  state: DemoState | null;
}) {
  const job = state?.job ?? null;
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h1 className="text-xl font-semibold text-zinc-950">Customers</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Local/sample workflow onboarding only; not full multi-tenant SaaS.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          onClick={onStartOnboarding}
          type="button"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Onboard local workflow
        </button>
      </div>

      {job ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase text-zinc-500">Active customer</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">{job.client_name}</h2>
            <p className="mt-2 text-sm text-zinc-600">{job.business_type}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <ProofChip icon={CircleDollarSign} label="Invoice" value={formatCurrency(job.invoice_amount_cents)} tone="emerald" />
              <ProofChip icon={Gauge} label="Spend cap" value={formatCurrency(job.spend_cap_cents)} tone="sky" />
              <ProofChip icon={TrendingUp} label="Margin floor" value={formatPercent(job.margin_floor_percent)} tone="teal" />
            </div>
          </article>
          <article className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-zinc-500">Prepared job</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">{job.job_name}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{job.job_goal}</p>
            <p className="mt-4 text-xs text-zinc-500">Updated {formatDateTime(job.updated_at)}</p>
          </article>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-zinc-300 p-5 text-sm text-zinc-600">
          No local workflow is currently onboarded.
        </div>
      )}
    </section>
  );
}

function RunsView({ money, state }: { money: MoneySnapshot; state: DemoState | null }) {
  const calls = state?.orchestration_calls ?? [];
  const reports = state?.reports ?? [];
  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-sky-700" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-zinc-950">Run History</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">Latest compressed local workflow run.</p>
        <div className="mt-4">
          <MoneyFlow compact money={money} />
        </div>
        <div className="mt-4 space-y-3">
          {reports.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
              Run history appears after a demo run completes.
            </div>
          ) : (
            reports.map((report) => (
              <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4" key={report.id}>
                <p className="font-semibold text-zinc-950">{formatCurrency(report.gross_profit_cents)} gross profit</p>
                <p className="mt-1 text-sm text-zinc-700">
                  {formatPercent(report.actual_margin_percent)} margin, {report.policy_violations} policy violations.
                </p>
                <p className="mt-2 text-xs text-zinc-500">{formatDateTime(report.created_at)}</p>
              </article>
            ))
          )}
        </div>
      </section>
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <ExecutionFeed calls={calls} />
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
        <Settings className="h-5 w-5 text-zinc-700" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-zinc-950">Settings / Integrations</h1>
      </div>
      <p className="mt-1 text-sm text-zinc-600">
        Current integration proof and honest boundaries for this local product prototype.
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

function HeroClaim({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-none text-emerald-200" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase text-zinc-300">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold leading-5 text-white">{value}</p>
    </div>
  );
}

function ProfitProtectedHero({ money }: { money: MoneySnapshot }) {
  return (
    <section className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-5 shadow-2xl shadow-emerald-950/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-emerald-200" aria-hidden="true" />
            <h2 className="text-base font-semibold text-white">Profit Protected</h2>
          </div>
          <p className="mt-1 text-sm text-emerald-100">
            {money.actual ? "API-backed result loaded" : "Locked demo target until the run completes"}
          </p>
        </div>
        <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs font-semibold text-zinc-200">
          Harbor Fleet
        </span>
      </div>

      <div className="mt-5">
        <p className="text-6xl font-semibold leading-none text-white lg:text-7xl">
          {formatOptionalCurrency(money.grossProfitCents)}
        </p>
        <p className="mt-3 text-base leading-6 text-emerald-100">
          protected gross profit after ScaleX approved only policy-safe spend.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <OutcomeMetric
          label="Protected margin"
          value={formatOptionalPercent(money.marginPercent)}
          tone="teal"
        />
        <OutcomeMetric
          label="Blocked unsafe spend"
          value={formatOptionalCurrency(money.blockedSpendCents)}
          tone="rose"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <OutcomeMetric
          label="Stripe test invoice"
          value={formatOptionalCurrency(money.revenueCents)}
          tone="sky"
        />
        <OutcomeMetric
          label="Approved spend"
          value={formatOptionalCurrency(money.approvedSpendCents)}
          tone="amber"
        />
      </div>
    </section>
  );
}

function OutcomeMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: Tone;
}) {
  return (
    <div className={`rounded-lg border p-3 ${darkToneClass(tone)}`}>
      <p className="text-xs font-semibold uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function HeroStackProof({
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
  const stripePaidState =
    stripe?.paid === null || stripe?.paid === undefined ? "pending" : String(stripe.paid);
  const stripeLiveMode =
    stripe?.livemode === null || stripe?.livemode === undefined ? "pending" : String(stripe.livemode);

  return (
    <section className="rounded-lg border border-white/15 bg-white/5 p-3">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <StackProofCard
          icon={BrainCircuit}
          label="Real Hermes"
          status={hermes?.used_real_hermes ? "Real Hermes" : "Test or pending"}
          detail={`${hermes?.provider ?? "Pending"} / ${hermes?.model ?? "Pending"} / ${hermes?.skill_name ?? "Pending"}`}
          tone={hermes?.used_real_hermes ? "emerald" : "amber"}
        />
        <StackProofCard
          icon={CreditCard}
          label="Real Stripe Test Mode"
          status={stripe?.used_real_stripe ? "stripe_test" : stripeBadgeValue(stripe)}
          detail={`livemode=${stripeLiveMode}; invoice_status=${stripe?.invoice_status ?? "pending"}; paid=${stripePaidState}`}
          tone={stripe?.used_real_stripe ? "sky" : stripe?.error ? "rose" : "amber"}
        />
        <StackProofCard
          icon={Database}
          label="SQLite Audit Ledger"
          status={health?.database_exists ? "Active" : "Pending"}
          detail={`${auditRows} audit rows recorded`}
          tone={health?.database_exists ? "teal" : "slate"}
        />
        <StackProofCard
          icon={ShieldCheck}
          label="Policy Guardrails"
          status={policy ? "Active local policy" : "Pending"}
          detail={policy ? `${policy.engine}: cap, payment, margin, vendors` : "Local policy loading"}
          tone={policy ? "emerald" : "amber"}
        />
        <StackProofCard
          icon={ShieldAlert}
          label="NemoClaw"
          status="Goal 8 next"
          detail="Not claimed as real yet"
          tone="violet"
        />
      </div>
    </section>
  );
}

function StackProofCard({
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
    <article className={`rounded-lg border p-3 ${darkToneClass(tone)}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{status}</p>
      <p className="mt-1 break-words text-xs leading-5">{detail}</p>
    </article>
  );
}

function ExecutionPlayback({
  busy,
  error,
  money,
  playbackIndex,
  state,
}: {
  busy: boolean;
  error: string | null;
  money: MoneySnapshot;
  playbackIndex: number;
  state: DemoState | null;
}) {
  const completed = Boolean(state?.report) && !busy && !error;

  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-white">
            {busy
              ? "Live execution replay running"
              : completed
                ? "Run completed: profit report generated"
                : "Execution replay"}
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            {busy
              ? "Frontend stages pulse while POST /api/demo/run returns the audited state."
              : "Replay cards now reflect the latest API-backed workflow state."}
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${
            completed
              ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
              : error
                ? "border-rose-300/40 bg-rose-300/10 text-rose-100"
                : "border-amber-300/40 bg-amber-300/10 text-amber-100"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : error ? (
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {completed ? "Completed" : error ? "Needs attention" : "In flight"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-7">
        {PLAYBACK_STEPS.map((step, index) => {
          const status = playbackStepStatus(step, index, playbackIndex, busy, state, error);
          const Icon = step.icon;
          const StatusIcon = stageStatusMeta[status].icon;
          return (
            <article
              className={`min-h-[9rem] rounded-lg border p-3 ${darkStageClass(status)}`}
              key={step.key}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/10">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {stageStatusMeta[status].label}
                </span>
              </div>
              <span
                className={`mt-3 block h-1.5 rounded-full ${
                  status === "current" ? "animate-pulse bg-amber-300" : darkStageBarClass(status)
                }`}
              />
              <p className="mt-3 text-sm font-semibold text-white">{step.label}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-200">
                {playbackProof(step.key, state, money)}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function playbackStepStatus(
  step: PlaybackStep,
  index: number,
  playbackIndex: number,
  busy: boolean,
  state: DemoState | null,
  error: string | null,
): StageStatus {
  if (busy) {
    if (index === playbackIndex) {
      return "current";
    }
    if (index < playbackIndex) {
      return step.key === "blocked" ? "blocked" : "complete";
    }
    return "pending";
  }

  if (error && index >= playbackIndex) {
    return "error";
  }

  if (state?.report) {
    return step.key === "blocked" ? "blocked" : "complete";
  }

  const checks = state?.policy_checks ?? [];
  const blockedChecks = checks.filter((check) => !isApproved(check));
  switch (step.key) {
    case "intake":
      return state?.job ? "complete" : "pending";
    case "hermes":
      return hermesFailed(state?.hermes ?? null, state?.planning_run ?? null)
        ? "error"
        : state?.planning_run?.status === "completed"
          ? "complete"
          : state?.planning_run
            ? "current"
            : "pending";
    case "stripe":
      return state?.stripe?.error ? "error" : state?.stripe?.invoice_id ? "complete" : "pending";
    case "policy":
      return checks.length > 0 ? "complete" : state?.policy.summary ? "current" : "pending";
    case "blocked":
      return blockedChecks.length > 0 ? "blocked" : checks.length > 0 ? "complete" : "pending";
    case "agents":
      return (state?.agent_outputs.length ?? 0) >= 4 ? "complete" : "pending";
    case "report":
      return state?.report ? "complete" : "pending";
    default:
      return "pending";
  }
}

function playbackProof(key: PlaybackKey, state: DemoState | null, money: MoneySnapshot): string {
  const checks = state?.policy_checks ?? [];
  const approvedChecks = checks.filter(isApproved);
  const blockedCheck = checks.find((check) => !isApproved(check));

  switch (key) {
    case "intake":
      return state?.job
        ? `${state.job.client_name}: ${formatCurrency(state.job.invoice_amount_cents)} invoice.`
        : "Harbor Fleet Services job waiting for run state.";
    case "hermes":
      return state?.hermes?.used_real_hermes
        ? `${state.hermes.provider ?? "provider"} / ${state.hermes.model ?? "model"} with ${state.hermes.skill_name ?? "skill"}.`
        : "Hermes proof loads from the planning response.";
    case "stripe":
      return state?.stripe?.invoice_id
        ? `${state.stripe.stripe_mode}; livemode=${String(state.stripe.livemode)}; invoice_status=${state.stripe.invoice_status ?? "pending"}.`
        : state?.stripe?.error ?? "Stripe test invoice proof pending.";
    case "policy":
      return checks.length > 0
        ? `${approvedChecks.length} spend requests approved under cap and margin rules.`
        : "Spend checks run after invoice and policy state are available.";
    case "blocked":
      return blockedCheck
        ? `${formatCurrency(blockedCheck.requested_amount_cents)} ${blockedCheck.vendor} blocked.`
        : `${formatOptionalCurrency(money.blockedSpendCents)} unsafe spend target guarded by policy.`;
    case "agents":
      return state?.agent_outputs.length
        ? `${state.agent_outputs.length} agent deliverables recorded.`
        : "Finance, Marketing, Research, and Ops outputs pending.";
    case "report":
      return state?.report
        ? `${formatCurrency(state.report.gross_profit_cents)} profit, ${formatPercent(state.report.actual_margin_percent)} margin.`
        : `${formatOptionalCurrency(money.grossProfitCents)} protected profit target pending report.`;
    default:
      return "Proof pending.";
  }
}

function darkStageClass(status: StageStatus): string {
  switch (status) {
    case "complete":
      return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100";
    case "current":
      return "border-amber-300/50 bg-amber-300/15 text-amber-100 shadow-lg shadow-amber-950/20";
    case "blocked":
      return "border-rose-300/50 bg-rose-300/15 text-rose-100";
    case "error":
      return "border-rose-300/50 bg-rose-300/20 text-rose-100";
    case "pending":
    default:
      return "border-white/10 bg-zinc-950/30 text-zinc-400";
  }
}

function darkStageBarClass(status: StageStatus): string {
  switch (status) {
    case "complete":
      return "bg-emerald-300";
    case "blocked":
      return "bg-rose-300";
    case "error":
      return "bg-rose-400";
    case "pending":
    default:
      return "bg-zinc-700";
  }
}

function LivePipeline({ stages }: { stages: PipelineStage[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">Live Run Pipeline</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Intake to profit report with proof pulled from API state.
          </p>
        </div>
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          {stages.filter((stage) => stage.status !== "pending").length}/{stages.length}
        </span>
      </div>

      <ol className="mt-4 space-y-3">
        {stages.map((stage, index) => {
          const StatusIcon = stageStatusMeta[stage.status].icon;
          const StageIcon = stage.icon;
          return (
            <li className="grid grid-cols-[2rem_1fr] gap-3" key={stage.name}>
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md border ${stageStatusMeta[stage.status].className}`}
                >
                  <StageIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                {index < stages.length - 1 ? (
                  <span className="mt-2 h-full min-h-9 w-px bg-zinc-200" />
                ) : null}
              </div>
              <article
                className={`rounded-lg border p-3 ${stageStatusMeta[stage.status].railClassName}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-950">{stage.name}</p>
                    <p className="mt-1 text-xs font-medium uppercase text-zinc-500">
                      {stage.modeLabel}
                    </p>
                  </div>
                  <span
                    className={`inline-flex flex-none items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${stageStatusMeta[stage.status].className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {stageStatusMeta[stage.status].label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-zinc-700">{stage.proof}</p>
                <p className="mt-2 text-xs text-zinc-500">{formatDateTime(stage.timestamp)}</p>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
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

function ProofColumn({
  money,
  stripe,
  stripeEvents,
  policySummary,
  policyChecks,
}: {
  money: MoneySnapshot;
  stripe: StripeSummary | null;
  stripeEvents: StripeEvent[];
  policySummary: PolicySummary | null;
  policyChecks: PolicyCheck[];
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-950">
              Money, Policy, and Profit Proof
            </h2>
          </div>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
            {money.actual ? "Actual run" : "Locked target"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          One invoice, controlled spend, blocked unsafe automation, audited profit.
        </p>
        <MoneyFlow money={money} />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ProofChip
            icon={TrendingUp}
            label="Protected margin"
            value={formatOptionalPercent(money.marginPercent)}
            tone="teal"
          />
          <ProofChip
            icon={Ban}
            label="Blocked unsafe spend"
            value={formatOptionalCurrency(money.blockedSpendCents)}
            tone="rose"
          />
          <ProofChip
            icon={WalletCards}
            label="Approved under cap"
            value={`${formatOptionalCurrency(money.approvedSpendCents)} / ${formatOptionalCurrency(money.spendCapCents)}`}
            tone="sky"
          />
          <ProofChip
            icon={ShieldCheck}
            label="Policy violations"
            value={money.policyViolations === null ? "Pending" : String(money.policyViolations)}
            tone="emerald"
          />
        </div>
      </section>

      <StripeProofPanel summary={stripe} events={stripeEvents} />
      <GuardrailDecisionsPanel summary={policySummary} checks={policyChecks} />
    </aside>
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
            $1,200 invoice to guarded profit report
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
            Finance, Marketing, Research, and Ops deliverables for the Harbor Fleet workflow.
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

function buildWorkflowNodes(
  state: DemoState | null,
  money: MoneySnapshot,
  auditRows: number,
  busy: boolean,
  playbackIndex: number,
): WorkflowNode[] {
  const job = state?.job ?? null;
  const planningRun = state?.planning_run ?? null;
  const hermes = state?.hermes ?? null;
  const stripe = state?.stripe ?? null;
  const checks = state?.policy_checks ?? [];
  const outputs = state?.agent_outputs ?? [];
  const report = state?.report ?? null;
  const approvedChecks = checks.filter(isApproved);
  const blockedChecks = checks.filter((check) => !isApproved(check));
  const events = state?.events ?? [];

  const settledNodes: WorkflowNode[] = [
    {
      name: "Customer Intake",
      status: job ? "complete" : "pending",
      proof: job
        ? `${job.client_name}: ${formatCurrency(job.invoice_amount_cents)} invoice.`
        : "Local onboarding prepares the customer and job.",
      timestamp: job?.created_at ?? eventByType(events, "job_intake")?.created_at ?? null,
      badge: "SQLite job",
      icon: Target,
    },
    {
      name: "Hermes Brain",
      status: hermesFailed(hermes, planningRun)
        ? "error"
        : planningRun?.status === "completed"
          ? "complete"
          : planningRun
            ? "current"
            : "pending",
      proof: planningRun
        ? `${hermes?.provider ?? planningRun.provider} / ${hermes?.model ?? planningRun.model}; Hermes plans only.`
        : "Planning proof appears after the run.",
      timestamp: planningRun?.completed_at ?? planningRun?.created_at ?? null,
      badge: hermes?.used_real_hermes ? "real Hermes" : "test or pending",
      icon: BrainCircuit,
    },
    {
      name: "Stripe Test Invoice",
      status: stripe?.error ? "error" : stripe?.invoice_id ? "complete" : "pending",
      proof: stripe?.invoice_id
        ? `${stripe.customer_id ?? "customer pending"} / ${stripe.invoice_id}`
        : stripe?.error ?? "Stripe test invoice proof pending.",
      timestamp: latestWhere(state?.stripe_events ?? [], (event) => Boolean(event.invoice_id))?.created_at ?? null,
      badge: stripeModeLabel(stripe),
      icon: CreditCard,
    },
    {
      name: "Payment Status",
      status: stripe?.error
        ? "error"
        : stripe?.paid === true
          ? "complete"
          : stripe?.paid === false
            ? "current"
            : "pending",
      proof:
        stripe?.paid === true
          ? "Stripe reports paid=true."
          : stripe?.paid === false
            ? "Stripe test invoice is open/unpaid; compressed run records local confirmation."
            : "Payment status pending.",
      timestamp: latestWhere(state?.stripe_events ?? [], (event) => event.paid !== null)?.created_at ?? null,
      badge: stripe?.paid === false ? "open/unpaid" : stripe?.paid === true ? "paid" : "pending",
      icon: ReceiptText,
    },
    {
      name: "Policy Guardrail",
      status: state?.policy.summary ? "complete" : "pending",
      proof: state?.policy.summary
        ? `Cap ${formatCurrency((state.policy.summary.max_job_spend_usd ?? 0) * 100)}, margin floor ${formatPercent(job?.margin_floor_percent ?? state.policy.summary.margin_floor_percent)}.`
        : "Policy state pending.",
      timestamp: eventByType(events, "policy_gate")?.created_at ?? null,
      badge: "local policy",
      icon: ShieldCheck,
    },
    {
      name: "Spend Decision",
      status: blockedChecks.length > 0 ? "blocked" : approvedChecks.length > 0 ? "complete" : "pending",
      proof:
        checks.length > 0
          ? `${approvedChecks.length} approved; ${formatOptionalCurrency(money.blockedSpendCents)} blocked unsafe spend.`
          : "Approved and blocked branches appear after policy checks.",
      timestamp: checks[checks.length - 1]?.created_at ?? null,
      badge: "branching",
      icon: WalletCards,
    },
    {
      name: "Agent Work",
      status: outputs.length >= 4 ? "complete" : outputs.length > 0 ? "current" : "pending",
      proof: outputs.length > 0 ? `${outputs.length} agent deliverables recorded.` : "Agent work pending.",
      timestamp: outputs[outputs.length - 1]?.created_at ?? null,
      badge: "Finance / Marketing / Research / Ops",
      icon: Layers3,
    },
    {
      name: "SQLite Audit Ledger",
      status: auditRows > 0 ? "complete" : "pending",
      proof: `${auditRows} audit rows across events, ledger, policy, Stripe, calls, agents, and reports.`,
      timestamp: latestTimestamp([
        ...(state?.events ?? []),
        ...(state?.ledger.entries ?? []),
        ...(state?.policy_checks ?? []),
        ...(state?.orchestration_calls ?? []),
      ]),
      badge: "auditable",
      icon: Database,
    },
    {
      name: "Profit Report",
      status: report ? "complete" : "pending",
      proof: report
        ? `${formatCurrency(report.gross_profit_cents)} gross profit, ${formatPercent(report.actual_margin_percent)} margin.`
        : "Profit report pending.",
      timestamp: report?.created_at ?? null,
      badge: "final output",
      icon: FileText,
    },
  ];

  if (!busy) {
    return settledNodes;
  }

  return settledNodes.map((node, index) => ({
    ...node,
    status:
      index === playbackIndex
        ? "current"
        : index < playbackIndex
          ? node.name === "Spend Decision"
            ? "blocked"
            : "complete"
          : "pending",
  }));
}

function buildPipeline(state: DemoState | null): PipelineStage[] {
  const job = state?.job ?? null;
  const planningRun = state?.planning_run ?? null;
  const hermes = state?.hermes ?? null;
  const stripe = state?.stripe ?? null;
  const events = state?.events ?? [];
  const checks = state?.policy_checks ?? [];
  const stripeEvents = state?.stripe_events ?? [];
  const outputs = state?.agent_outputs ?? [];
  const report = state?.report ?? null;
  const blockedChecks = checks.filter((check) => !isApproved(check));
  const approvedChecks = checks.filter(isApproved);
  const latestPolicyCheck = checks[checks.length - 1] ?? null;
  const latestStripeInvoice = latestWhere(stripeEvents, (event) => Boolean(event.invoice_id));
  const latestPayment = latestWhere(stripeEvents, (event) => event.paid !== null);

  return [
    {
      name: "Intake",
      status: job ? "complete" : "pending",
      timestamp: job?.created_at ?? eventByType(events, "job_intake")?.created_at ?? null,
      modeLabel: "sample workflow",
      proof: job
        ? `${job.client_name}: ${job.job_name}. Invoice ${formatCurrency(job.invoice_amount_cents)}.`
        : "Harbor Fleet Services job appears after the demo starts.",
      icon: Target,
    },
    {
      name: "Hermes Plan",
      status: hermesFailed(hermes, planningRun)
        ? "error"
        : planningRun?.status === "completed"
          ? "complete"
          : planningRun
            ? "current"
            : "pending",
      timestamp: planningRun?.completed_at ?? planningRun?.created_at ?? eventByType(events, "hermes_planning")?.created_at ?? null,
      modeLabel: hermes?.used_real_hermes ? "real Hermes" : planningRun?.source ?? "pending",
      proof: planningRun
        ? `${hermes?.provider ?? planningRun.provider} / ${hermes?.model ?? planningRun.model}; skill ${hermes?.skill_name ?? "pending"}; toolsets ${hermes?.toolsets_used?.join(", ") || "none"}.`
        : "Hermes planning proof appears after POST /api/demo/run.",
      icon: BrainCircuit,
    },
    {
      name: "Stripe Test Invoice",
      status: stripe?.error ? "error" : stripe?.invoice_id ? "complete" : "pending",
      timestamp: latestStripeInvoice?.created_at ?? eventByType(events, "stripe_test")?.created_at ?? null,
      modeLabel: stripeModeLabel(stripe),
      proof: stripe?.invoice_id
        ? `${stripe.customer_id ?? "customer pending"} / ${stripe.invoice_id}; livemode=${String(stripe.livemode)}.`
        : stripe?.error ?? "Stripe test customer and finalized invoice appear after the run.",
      icon: CreditCard,
    },
    {
      name: "Payment Status",
      status: stripe?.error
        ? "error"
        : stripe?.paid === true
          ? "complete"
          : stripe?.paid === false
            ? "current"
            : "pending",
      timestamp: latestPayment?.created_at ?? eventByType(events, "payment_confirmed")?.created_at ?? null,
      modeLabel: stripe?.paid === false ? "open/unpaid" : stripe?.paid === true ? "paid" : "pending",
      proof:
        stripe?.paid === true
          ? "Stripe reports paid=true; revenue can be labeled Stripe-paid."
          : stripe?.paid === false
            ? "Stripe test invoice finalized and open - not marked paid."
            : "Payment status appears after Stripe invoice finalization.",
      icon: ReceiptText,
    },
    {
      name: "Policy Gate",
      status: state?.policy.summary ? "complete" : "pending",
      timestamp: eventByType(events, "policy_gate")?.created_at ?? null,
      modeLabel: "local policy",
      proof: state?.policy.summary
        ? `Payment-before-spend=${String(state.policy.summary.require_payment_before_spend)}, margin floor ${formatPercent(state.policy.summary.margin_floor_percent)}.`
        : "Policy configuration appears after state loads.",
      icon: ShieldCheck,
    },
    {
      name: "Spend Approval",
      status: blockedChecks.length > 0 ? "blocked" : approvedChecks.length > 0 ? "complete" : "pending",
      timestamp: latestPolicyCheck?.created_at ?? null,
      modeLabel: "guardrail decisions",
      proof:
        checks.length > 0
          ? `${approvedChecks.length} approved, ${blockedChecks.length} blocked. ${blockedChecks[0]?.vendor ?? "Unsafe spend"} blocked if unsafe.`
          : "Spend decisions appear after policy checks run.",
      icon: WalletCards,
    },
    {
      name: "Agent Outputs",
      status: outputs.length >= 4 ? "complete" : outputs.length > 0 ? "current" : "pending",
      timestamp: outputs[outputs.length - 1]?.created_at ?? eventByType(events, "agent_work")?.created_at ?? null,
      modeLabel: "deterministic agent outputs",
      proof: outputs.length > 0 ? `${outputs.length} agent deliverables recorded.` : "Finance, Marketing, Research, and Ops outputs appear after policy decisions.",
      icon: Layers3,
    },
    {
      name: "Profit Report",
      status: report ? "complete" : "pending",
      timestamp: report?.created_at ?? eventByType(events, "profit_report")?.created_at ?? null,
      modeLabel: "SQLite report",
      proof: report
        ? `${formatCurrency(report.gross_profit_cents)} gross profit, ${formatPercent(report.actual_margin_percent)} margin, ${report.policy_violations} policy violations.`
        : "Final profit report appears after agent work completes.",
      icon: FileText,
    },
  ];
}

function moneySnapshot(state: DemoState | null): MoneySnapshot {
  const report = state?.report ?? null;
  const totals = state?.ledger.totals ?? null;
  const placeholder = state?.report_placeholder ?? null;
  const job = state?.job ?? null;
  const hasLedgerRevenue = Boolean(totals && totals.revenue_cents > 0);
  const hasPolicyChecks = Boolean(state && state.policy_checks.length > 0);

  return {
    actual: Boolean(report || hasLedgerRevenue),
    revenueCents:
      report?.revenue_cents ??
      (hasLedgerRevenue ? totals?.revenue_cents ?? null : placeholder?.expected_revenue_cents ?? null),
    approvedSpendCents:
      report?.approved_spend_cents ??
      (hasPolicyChecks ? totals?.approved_spend_cents ?? null : placeholder?.expected_approved_spend_cents ?? null),
    blockedSpendCents:
      report?.blocked_spend_cents ??
      (hasPolicyChecks ? totals?.blocked_spend_cents ?? null : placeholder ? LOCKED_DEMO_BLOCKED_SPEND_CENTS : null),
    grossProfitCents:
      report?.gross_profit_cents ??
      (hasLedgerRevenue ? totals?.gross_profit_cents ?? null : placeholder?.expected_gross_profit_cents ?? null),
    marginPercent:
      report?.actual_margin_percent ??
      report?.margin_percent ??
      (hasLedgerRevenue ? totals?.actual_margin_percent ?? null : placeholder?.expected_margin_percent ?? null),
    policyViolations: report?.policy_violations ?? null,
    spendCapCents: job?.spend_cap_cents ?? null,
    marginFloorPercent: job?.margin_floor_percent ?? state?.policy.summary.margin_floor_percent ?? null,
  };
}

function auditRowCount(state: DemoState | null): number {
  if (!state) {
    return 0;
  }

  return (
    state.events.length +
    state.ledger.entries.length +
    state.policy_checks.length +
    state.stripe_events.length +
    state.agent_outputs.length +
    state.reports.length +
    state.planning_runs.length +
    state.orchestration_calls.length
  );
}

function runStatusLabel(
  state: DemoState | null,
  busyAction: BusyAction,
  error: string | null,
): string {
  if (busyAction === "initial") {
    return "Loading backend state";
  }
  if (busyAction === "run") {
    return "Running demo lifecycle";
  }
  if (busyAction === "reset") {
    return "Resetting demo state";
  }
  if (busyAction === "refresh") {
    return "Refreshing proof";
  }
  if (error) {
    return "Action needed";
  }
  if (state?.report) {
    return "Run complete";
  }
  if (state?.job) {
    return humanize(state.job.status);
  }
  return "Ready";
}

function stripeBadgeValue(stripe: StripeSummary | null): string {
  if (!stripe) {
    return "Pending";
  }
  if (stripe.error) {
    return "Integration error";
  }
  if (stripe.used_real_stripe) {
    return "Real Stripe Test";
  }
  if (stripe.stripe_mode === "test_double") {
    return "Test-double";
  }
  return humanize(stripe.stripe_mode);
}

function stripeModeLabel(stripe: StripeSummary | null): string {
  if (!stripe) {
    return "pending";
  }
  if (stripe.error) {
    return "integration error";
  }
  if (stripe.used_real_stripe) {
    return "real Stripe test";
  }
  if (stripe.stripe_mode === "test_double") {
    return "test-double";
  }
  return stripe.stripe_mode || "pending";
}

function hermesFailed(hermes: HermesMetadata | null, planningRun: PlanningRun | null): boolean {
  return Boolean(planningRun?.error || hermes?.failure_reason || hermes?.error);
}

function isApproved(check: PolicyCheck): boolean {
  return Boolean(check.approved);
}

function eventByType(events: DemoEvent[], type: string): DemoEvent | null {
  return latestWhere(events, (event) => event.type === type);
}

function latestWhere<T>(items: T[], predicate: (item: T) => boolean): T | null {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return items[index];
    }
  }
  return null;
}

function latestTimestamp(items: Array<{ created_at?: string | null }>): string | null {
  const timestamps = items.map((item) => item.created_at).filter(Boolean) as string[];
  return timestamps.length > 0 ? timestamps[timestamps.length - 1] : null;
}

function operatingPlanPhases(plan: PlanningRun["result_json"]): string[] {
  if (!plan || !isRecord(plan.operating_plan)) {
    return [];
  }
  const phases = plan.operating_plan.phases;
  if (Array.isArray(phases)) {
    return phases.map(displayValue).filter(Boolean).slice(0, 5);
  }

  const keyedPhases = Object.entries(plan.operating_plan)
    .filter(([key]) => key.startsWith("phase_"))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => displayValue(value))
    .filter(Boolean);
  if (keyedPhases.length > 0) {
    return keyedPhases.slice(0, 6);
  }

  const objective = plan.operating_plan.objective;
  return typeof objective === "string" ? [objective] : [];
}

function taskRows(tasks: unknown[]): Array<{ agent: string; task: string }> {
  return tasks.slice(0, 6).map((task, index) => {
    if (isRecord(task)) {
      const taskList = Array.isArray(task.tasks)
        ? task.tasks.map(displayValue).filter(Boolean).join(" ")
        : "";
      return {
        agent: displayValue(task.agent) || `Task ${index + 1}`,
        task:
          displayValue(task.task) ||
          taskList ||
          displayValue(task.summary) ||
          "Task detail pending",
      };
    }

    return {
      agent: `Task ${index + 1}`,
      task: displayValue(task) || "Task detail pending",
    };
  });
}

function displayValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function formatOptionalCurrency(cents: number | null | undefined): string {
  return cents === null || cents === undefined ? "Pending" : formatCurrency(cents);
}

function formatOptionalPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? "Pending" : formatPercent(value);
}

function softToneClass(tone: Tone): string {
  switch (tone) {
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "sky":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "teal":
      return "border-teal-200 bg-teal-50 text-teal-900";
    case "violet":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "slate":
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

function darkToneClass(tone: Tone): string {
  switch (tone) {
    case "emerald":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
    case "sky":
      return "border-sky-300/30 bg-sky-300/10 text-sky-100";
    case "amber":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100";
    case "rose":
      return "border-rose-300/30 bg-rose-300/10 text-rose-100";
    case "teal":
      return "border-teal-300/30 bg-teal-300/10 text-teal-100";
    case "violet":
      return "border-violet-300/30 bg-violet-300/10 text-violet-100";
    case "slate":
      return "border-zinc-300/20 bg-zinc-300/10 text-zinc-100";
    default:
      return "border-zinc-300/20 bg-zinc-300/10 text-zinc-100";
  }
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

function readOnboardingComplete(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeOnboardingComplete(value: boolean) {
  try {
    if (value) {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } else {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  } catch {
    // Local storage is optional; SQLite remains the backend source for workflow data.
  }
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
