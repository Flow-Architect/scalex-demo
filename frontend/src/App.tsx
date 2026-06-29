import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  BrainCircuit,
  CreditCard,
  KeyRound,
  LockKeyhole,
  RefreshCw,
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
import { ControlRoomApp } from "./features/control-room/ControlRoomApp";
import {
  ProductView as OperationsProductView,
  type OnboardingDraft,
} from "./features/operations/ProductView";
import { WorkflowPage } from "./features/workflow/WorkflowPage";
import { WORKFLOW_NODE_ORDER, type WorkflowInspectorKey } from "./features/workflow/workflowModel";
import { BrandLogo } from "./components/BrandLogo";
import { AppShell } from "./layout/AppShell";
import { TopCommandBar } from "./layout/TopCommandBar";
import type { AppView } from "./layout/navigation";
import {
  auditRowCount,
  moneySnapshot,
  runStatusLabel,
} from "./lib/demoSelectors";
import type { BusyAction } from "./lib/demoSelectors";
import type {
  AuthStatus,
  DemoJob,
  DemoState,
  HealthResponse,
  OnboardingRequest,
  WorkflowConfig,
} from "./types";

const NORTHSTAR_ONBOARDING_DRAFT: OnboardingDraft = {
  clientName: "Northstar Dental Group",
  businessType: "Multi-location healthcare services group",
  jobName: "Client Implementation Launch",
  jobGoal:
    "Launch a synthetic B2B client implementation operation for a multi-location account, including onboarding kickoff, secure workspace setup, data migration sandbox coordination, launch asset kit preparation, stakeholder handoff, evidence summary, and a final protected-profit outcome. This sample uses no patient data and no PHI.",
  invoiceAmountUsd: "8500",
  spendCapUsd: "1150",
  marginFloorPercent: "50",
  approvedVendors: "Secure Workspace Pack, Data Migration Sandbox, Launch Asset Kit",
  blockedVendors: "Unapproved Data Broker Enrichment",
};
const RUN_STEP_MS = 1750;

export default function App() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingDraft>(NORTHSTAR_ONBOARDING_DRAFT);
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
  const displayCustomer = activeWorkflow?.client_name ?? state?.job?.client_name ?? "Northstar Dental Group";
  const displayJob = activeWorkflow?.job_name ?? state?.job?.job_name ?? "Client Implementation Launch";

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
      setActiveView("dashboard");
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
      setActiveView("dashboard");
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
      setNotice("ScaleX Governed ClientOps refreshed from the local backend.");
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
    setPlaybackIndex(0);
    setSelectedNodeKey(WORKFLOW_NODE_ORDER[0]);
    let cancelPlayback = false;
    const playback = playRunProgress(() => cancelPlayback);
    try {
      const response = await runDemo();
      setState(response.state);
      setHealth(await getHealth());
      if (response.status === "completed") {
        await playback;
        setPlaybackIndex(WORKFLOW_NODE_ORDER.length - 1);
        setSelectedNodeKey("report");
        setRunCompletedMoment(true);
        setNotice(
          `${response.state.execution.label} completed: protected profit ${formatCurrencyText(
            response.state.report?.gross_profit_cents,
          )}, blocked risk ${formatCurrencyText(
            response.state.report?.blocked_spend_cents,
          )}, evidence records ${auditRowCount(response.state)}.`,
        );
      } else {
        cancelPlayback = true;
        const failureNode = failureNodeForStatus(response.status);
        const failureIndex =
          failureNode === "summary" ? 0 : WORKFLOW_NODE_ORDER.indexOf(failureNode);
        setPlaybackIndex(Math.max(failureIndex, 0));
        setSelectedNodeKey(failureNode);
        setError(runFailureMessage(response.status, response.decision?.error));
      }
    } catch (caught) {
      cancelPlayback = true;
      setError(errorMessage(caught));
    } finally {
      cancelPlayback = true;
      setBusyAction(null);
    }
  }

  async function playRunProgress(cancelled: () => boolean) {
    for (let index = 0; index < WORKFLOW_NODE_ORDER.length; index += 1) {
      if (cancelled()) {
        return;
      }
      setPlaybackIndex(index);
      setSelectedNodeKey(WORKFLOW_NODE_ORDER[index]);
      await wait(RUN_STEP_MS);
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
      setActiveView("dashboard");
      setNotice("Local client operation saved and selected. It is ready to run.");
    } catch (caught) {
      setOnboardingError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleUseNorthstarSample() {
    setOnboardingDraft(NORTHSTAR_ONBOARDING_DRAFT);
    setBusyAction("reset");
    setOnboardingError(null);
    setError(null);
    try {
      const response = await saveOnboarding(onboardingRequestFromDraft(NORTHSTAR_ONBOARDING_DRAFT));
      setState(response.state);
      setHealth(await getHealth());
      setActiveView("dashboard");
      setNotice("Northstar Dental Group sample loaded.");
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
      setActiveView("dashboard");
      setSelectedNodeKey("summary");
      setNotice("Client operation selected. The next run will use this account and economics.");
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
      busy={isBusy}
      displayCustomer={displayCustomer}
      displayJob={displayJob}
      onNavigate={setActiveView}
      onRun={handleRunDemo}
      profitLabel={formatCurrencyText(money.grossProfitCents)}
      revenueLabel={formatCurrencyText(money.revenueCents)}
    >
      <ControlRoomApp
        activeView={activeView}
        auditRows={auditRows}
        auth={auth}
        busyAction={busyAction}
        displayCustomer={displayCustomer}
        displayJob={displayJob}
        error={error}
        health={health}
        money={money}
        notice={notice}
        onNavigate={setActiveView}
        onRefresh={refreshState}
        onReset={handleResetDemo}
        onLogout={handleLogout}
        onRun={handleRunDemo}
        runCompletedMoment={runCompletedMoment}
        runStatus={runStatus}
        state={state}
      />
    </AppShell>
  );
}

function LoadingScreen() {
  return (
    <main className="scalex-grid-surface flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-md border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-zinc-950/30">
        <div className="flex flex-wrap items-center gap-3">
          <BrandLogo variant="compact" />
          <div>
            <p className="text-lg font-semibold">ScaleX Governed ClientOps</p>
            <p className="text-sm text-zinc-300">Loading governed execution workspace</p>
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
        <section className="scalex-grid-surface flex min-h-[22rem] flex-col justify-between border-b border-white/10 bg-zinc-950 p-6 lg:border-b-0 lg:border-r lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo variant="hero" />
            <div>
              <p className="text-xl font-semibold">Governed ClientOps</p>
              <p className="text-sm text-emerald-300">Enterprise Function Accelerator</p>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-emerald-300">
              Governed execution workspace
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-white lg:text-6xl">
              Governed execution for revenue-backed client operations.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Local prototype auth gates the demo API and product shell with a signed
              session cookie. It is not production enterprise identity.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-zinc-200 sm:grid-cols-3">
            <LoginProof icon={LockKeyhole} label="Local session" />
            <LoginProof icon={BrainCircuit} label="Hermes proof preserved" />
            <LoginProof icon={CreditCard} label="Stripe test only" />
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#eef2f1] p-6 text-zinc-950 lg:p-10">
          <form
            className="w-full max-w-md rounded-md bg-white p-6 shadow-xl shadow-zinc-950/10 ring-1 ring-zinc-200"
            onSubmit={onSubmit}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-sky-200 bg-sky-50 text-sky-900">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Governed ClientOps login</h2>
                <p className="text-sm text-zinc-600">Prototype local auth</p>
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold text-zinc-700">
              Username
              <input
                autoComplete="username"
                className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                onChange={(event) => onChange({ ...form, username: event.target.value })}
                type="text"
                value={form.username}
              />
            </label>
            <label className="mt-4 block text-sm font-semibold text-zinc-700">
              Password
              <input
                autoComplete="current-password"
                className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                onChange={(event) => onChange({ ...form, password: event.target.value })}
                type="password"
                value={form.password}
              />
            </label>

            {error ? (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
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
              Enter ScaleX Governed ClientOps
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function LoginProof({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] p-3">
      <Icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
      <span>{label}</span>
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
    approvedVendors: NORTHSTAR_ONBOARDING_DRAFT.approvedVendors,
    blockedVendors: NORTHSTAR_ONBOARDING_DRAFT.blockedVendors,
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

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function failureNodeForStatus(status: string): WorkflowInspectorKey {
  if (status.includes("hermes")) {
    return "hermes";
  }
  if (status.includes("stripe")) {
    return "stripe";
  }
  return "summary";
}

function runFailureMessage(status: string, error: unknown): string {
  const reason = error ? String(error) : `Run ended with status ${status}.`;
  return `${reason} Next action: check the selected proof step, then switch to Demo proof mode or fix the Full Proof Mode configuration before retrying.`;
}

function formatCurrencyText(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return "pending";
  }
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
