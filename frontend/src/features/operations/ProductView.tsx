import type { FormEvent, ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Ban,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Layers3,
  LockKeyhole,
  Play,
  ReceiptText,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusBadge } from "../../components/ui/StatusBadge";
import { softToneClass } from "../../components/ui/statusStyles";
import type { Tone } from "../../components/ui/statusStyles";
import {
  EmptyWorkspaceState,
  OperationHero,
  OperationTimeline,
  OutcomeRail,
  PlainTable,
  ProofRoute,
  TemplateShelf,
  WorkspacePage,
  WorkspaceSection,
  type OperationStateItem,
  type RailItem,
  type TimelineStep,
} from "../../components/workspace/WorkspacePrimitives";
import { formatCurrency, formatDateTime, formatPercent, humanize } from "../../format";
import {
  formatOptionalCurrency,
  formatOptionalPercent,
  isApproved,
  latestWhere,
  type MoneySnapshot,
} from "../../lib/demoSelectors";
import type { AppView } from "../../layout/navigation";
import type { BusyAction } from "../../lib/demoSelectors";
import type {
  AgentOutput,
  AuthStatus,
  DemoEvent,
  DemoState,
  GuardrailEvaluation,
  GuardrailSummary,
  HealthResponse,
  LedgerEntry,
  LedgerTotals,
  OrchestrationCall,
  PolicyCheck,
  PolicySummary,
  StripeEvent,
  StripeSummary,
  WorkflowConfig,
} from "../../types";

export interface OnboardingDraft {
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

export function ProductView({
  activeView,
  auditRows,
  auth,
  health,
  money,
  onNavigate,
  onDeleteWorkflow,
  onDraftChange,
  onInspectRun,
  onSaveWorkflow,
  onSelectWorkflow,
  onUseNorthstarSample,
  onboardingBusy,
  onboardingDraft,
  onboardingError,
  busyAction,
  runStatus,
  state,
}: {
  activeView: AppView;
  auditRows: number;
  auth: AuthStatus | null;
  health: HealthResponse | null;
  money: MoneySnapshot;
  onNavigate: (view: AppView) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onDraftChange: (draft: OnboardingDraft) => void;
  onInspectRun: (runId: string) => void;
  onSaveWorkflow: (event?: FormEvent<HTMLFormElement>) => void;
  onSelectWorkflow: (workflowId: string) => void;
  onUseNorthstarSample: () => void;
  onboardingBusy: boolean;
  onboardingDraft: OnboardingDraft;
  onboardingError: string | null;
  busyAction: BusyAction;
  runStatus: string;
  state: DemoState | null;
}) {
  return (
    <section className="min-h-screen bg-stone-100 text-zinc-950">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        {activeView === "dashboard" ? (
          <DashboardView
            busyAction={busyAction}
            money={money}
            onNavigate={onNavigate}
            runStatus={runStatus}
            state={state}
          />
        ) : null}
        {activeView === "onboarding" ? (
          <OnboardingView
            busy={onboardingBusy}
            draft={onboardingDraft}
            error={onboardingError}
            onDraftChange={onDraftChange}
            onSubmit={onSaveWorkflow}
            onUseNorthstarSample={onUseNorthstarSample}
            state={state}
          />
        ) : null}
        {activeView === "customers" ? (
          <CustomersView
            busy={onboardingBusy}
            onNavigate={onNavigate}
            onDeleteWorkflow={onDeleteWorkflow}
            onSelectWorkflow={onSelectWorkflow}
            state={state}
          />
        ) : null}
        {activeView === "runs" ? (
          <RunsView money={money} onInspectRun={onInspectRun} state={state} />
        ) : null}
        {activeView === "audit" ? (
          <AuditView auditRows={auditRows} health={health} state={state} />
        ) : null}
        {activeView === "integrations" ? (
          <ConnectionHubView auditRows={auditRows} auth={auth} health={health} money={money} state={state} />
        ) : null}
        {activeView === "settings" ? (
          <SettingsView auth={auth} auditRows={auditRows} health={health} state={state} />
        ) : null}
      </div>
    </section>
  );
}

function DashboardView({
  busyAction,
  money,
  onNavigate,
  runStatus,
  state,
}: {
  busyAction: BusyAction;
  money: MoneySnapshot;
  onNavigate: (view: AppView) => void;
  runStatus: string;
  state: DemoState | null;
}) {
  const activeWorkflow = state?.workflow ?? null;
  const runs = state?.runs ?? [];
  const reports = state?.reports ?? [];
  const latestReport = state?.report ?? reports[reports.length - 1] ?? null;
  const latestRun = state?.job ?? runs[0] ?? null;
  const clientName = activeWorkflow?.client_name ?? latestRun?.client_name ?? "Northstar Dental Group";
  const operationName = activeWorkflow?.job_name ?? latestRun?.job_name ?? "Client Implementation Launch";
  const businessType = activeWorkflow?.business_type ?? latestRun?.business_type ?? "Multi-location healthcare services group";
  const spendCapCents = activeWorkflow?.spend_cap_cents ?? latestRun?.spend_cap_cents ?? money.spendCapCents ?? 115_000;
  const revenueCents = money.revenueCents ?? activeWorkflow?.invoice_amount_cents ?? latestRun?.invoice_amount_cents ?? 850_000;
  const approvedSpendCents = money.approvedSpendCents ?? spendCapCents;
  const blockedSpendCents = money.blockedSpendCents ?? 320_000;
  const grossProfitCents = money.grossProfitCents ?? revenueCents - approvedSpendCents;
  const marginPercent = money.marginPercent ?? (revenueCents > 0 ? (grossProfitCents / revenueCents) * 100 : null);
  const guardrailLabel = state?.execution.guardrail_label ?? "Local policy active";
  const guardrailTone: Tone = state?.guardrails.fail_closed
    ? "rose"
    : state?.guardrails.used_real_nemo
      ? "emerald"
      : state?.guardrails.mode === "nemo_compatible"
        ? "amber"
        : "teal";
  const operationStates: OperationStateItem[] = [
    { icon: Activity, label: "Run", value: busyAction === "run" ? "Run in progress" : runStatus, tone: busyAction === "run" ? "amber" : latestReport ? "emerald" : "slate" },
    { icon: Workflow, label: "Launch readiness", value: activeWorkflow ? "Ready for Studio" : "Select operation", tone: activeWorkflow ? "emerald" : "amber" },
    { icon: ShieldCheck, label: "Data boundary", value: "No patient data / no PHI", tone: "teal" },
    { icon: ShieldCheck, label: "Guardrails", value: guardrailLabel, tone: guardrailTone },
  ];
  const outcomeItems: RailItem[] = [
    { label: "Revenue", value: formatCurrency(revenueCents), tone: "emerald" },
    { label: "Setup spend", value: formatCurrency(approvedSpendCents), tone: "sky" },
    { label: "Blocked risk", value: formatCurrency(blockedSpendCents), tone: "rose" },
    { label: "Protected profit", value: formatCurrency(grossProfitCents), tone: "teal" },
    { label: "Margin", value: formatOptionalPercent(marginPercent), tone: "amber" },
  ];
  const stackSteps: TimelineStep[] = [
    { icon: Building2, label: "Intake", description: "Northstar implementation scope and operating rules are selected." },
    { icon: BrainCircuit, label: "Hermes Plan", description: "The operation is routed into a coordinated launch plan." },
    { icon: CreditCard, label: "Stripe Finance Proof", description: "Finance proof is created through the configured test-mode path." },
    { icon: ShieldCheck, label: "Guardrail Review", description: "Spend, vendor, and margin risk are checked before work proceeds." },
    { icon: Database, label: "Evidence Ledger", description: "Timeline, finance, policy, and work evidence are recorded." },
    { icon: TrendingUp, label: "Profit Outcome", description: "Protected profit and margin are reported for the run." },
  ];
  const plannedTemplates = [
    "Invoice-to-Cash",
    "Vendor Spend Approval",
    "Client Onboarding",
    "Research-to-Report",
    "Ops Handoff",
    "Renewal Recommendation",
  ];

  return (
    <WorkspacePage
      description={`${clientName} is the current synthetic account for the implemented ${operationName} function.`}
      eyebrow="ClientOps operation file"
      meta={
        <p className="text-sm font-semibold text-zinc-600">
          {activeWorkflow
            ? "Demo path: open Function Studio, start the run, then review Evidence Ledger and Connection Hub."
            : "Demo path: configure the Northstar sample, open Function Studio, then start the run."}
        </p>
      }
      title="Revenue-backed implementation launch"
    >
      <OperationHero
        actions={
          <>
            <PrimaryButton
              icon={activeWorkflow ? Workflow : Building2}
              label={activeWorkflow ? "Open Function Studio" : "Configure Northstar sample"}
              onClick={() => onNavigate(activeWorkflow ? "workflow" : "onboarding")}
            />
            <SecondaryButton icon={BookOpenCheck} label="Review Evidence Ledger" onClick={() => onNavigate("audit")} />
          </>
        }
        client={clientName}
        states={operationStates}
        subtitle="Launch a governed client implementation with finance proof, controlled setup spend, blocked vendor risk, and a recorded evidence trail."
        title={operationName}
      >
        <p>{businessType}. Synthetic B2B implementation operations only: no patient data, no PHI, and no healthcare compliance claim.</p>
      </OperationHero>

      <OutcomeRail items={outcomeItems} />

      <WorkspaceSection
        description="The launch reads from left to right as a governed business process."
        title="Operating stack"
      >
        <OperationTimeline steps={stackSteps} />
      </WorkspaceSection>

      <WorkspaceSection
        description="One implemented function is available today. Additional ClientOps functions remain planned."
        title="Function templates"
      >
        <TemplateShelf implemented="Client Implementation Launch" planned={plannedTemplates} />
      </WorkspaceSection>

      <WorkspaceSection
        description="Detailed finance, guardrail, and record evidence is kept outside the first business screen."
        title="Demo proof path"
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <button className="text-left" onClick={() => onNavigate("integrations")} type="button">
            <ProofRoute
              description="Allowed systems, connector modes, guardrail rails, and evidence duties for ClientOps execution."
              icon={Layers3}
              label="Connection Hub"
              tone="sky"
            />
          </button>
          <button className="text-left" onClick={() => onNavigate("audit")} type="button">
            <ProofRoute
              description={`${state?.policy_checks.length ?? 0} policy decisions, ${state?.guardrail_evaluations.length ?? 0} guardrail evaluations, ${state?.ledger.entries.length ?? 0} ledger rows, and finance evidence after launch.`}
              icon={BookOpenCheck}
              label="Evidence Ledger"
              tone="teal"
            />
          </button>
          <button className="text-left" onClick={() => onNavigate("runs")} type="button">
            <ProofRoute
              description={latestRun ? `${humanize(latestRun.status)} execution is available for review.` : "No execution has been launched for this client operation yet."}
              icon={ClipboardList}
              label="Runs"
              tone={latestRun ? "emerald" : "slate"}
            />
          </button>
        </div>
      </WorkspaceSection>
    </WorkspacePage>
  );
}

function PrimaryButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function SecondaryButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="grid gap-5 border-b border-zinc-200 px-6 py-6 sm:px-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div>
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function FileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-zinc-200 pt-3">
      <dt className="text-xs font-semibold uppercase text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-zinc-900">{value}</dd>
    </div>
  );
}

function StackRow({
  boundary,
  icon: Icon,
  name,
  proof,
  role,
}: {
  boundary: string;
  icon: LucideIcon;
  name: string;
  proof: string;
  role: string;
}) {
  return (
    <tr className="bg-white">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-zinc-950 text-white">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-semibold text-zinc-950">{name}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-zinc-700">{role}</td>
      <td className="px-4 py-4 text-zinc-700">{proof}</td>
      <td className="px-4 py-4 text-zinc-600">{boundary}</td>
    </tr>
  );
}

function BoundaryRow({
  area,
  boundary,
  value,
}: {
  area: string;
  boundary: string;
  value: string;
}) {
  return (
    <tr className="bg-white">
      <td className="px-4 py-4 font-semibold text-zinc-950">{area}</td>
      <td className="px-4 py-4 text-zinc-700">{value}</td>
      <td className="px-4 py-4 text-zinc-600">{boundary}</td>
    </tr>
  );
}

function OnboardingView({
  busy,
  draft,
  error,
  onDraftChange,
  onSubmit,
  onUseNorthstarSample,
  state,
}: {
  busy: boolean;
  draft: OnboardingDraft;
  error: string | null;
  onDraftChange: (draft: OnboardingDraft) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onUseNorthstarSample: () => void;
  state: DemoState | null;
}) {
  const activeWorkflow = state?.workflow ?? null;

  return (
    <WorkspacePage
      actions={
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
          disabled={busy}
          onClick={onUseNorthstarSample}
          type="button"
        >
          {busy ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Building2 className="h-4 w-4" aria-hidden="true" />}
          Load Northstar sample
        </button>
      }
      description="Configure the synthetic Northstar client implementation operation, revenue rules, setup resources, and blocked risk before launching the function."
      eyebrow="Configure operation"
      meta={
        activeWorkflow ? (
          <p className="text-sm font-semibold text-emerald-700">
            Selected: {activeWorkflow.client_name} / {activeWorkflow.job_name}
          </p>
        ) : (
          <p className="text-sm font-semibold text-amber-700">No operation selected yet.</p>
        )
      }
      title="Configure Client Implementation Launch"
    >
      <form className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-zinc-200" onSubmit={onSubmit}>
        <FormSection description="Name the synthetic account and the function template." title="Client profile">
          <div className="grid gap-5 xl:grid-cols-2">
            <FieldInput label="Client/account name" onChange={(value) => onDraftChange({ ...draft, clientName: value })} value={draft.clientName} />
            <FieldInput label="Business type" onChange={(value) => onDraftChange({ ...draft, businessType: value })} value={draft.businessType} />
            <div className="xl:col-span-2">
              <FieldInput label="Implementation/template name" onChange={(value) => onDraftChange({ ...draft, jobName: value })} value={draft.jobName} />
            </div>
          </div>
        </FormSection>

        <FormSection description="These rules drive the protected-profit outcome and spend guardrails." title="Revenue and margin rules">
          <div className="grid gap-5 md:grid-cols-3">
            <FieldInput label="Invoice amount" onChange={(value) => onDraftChange({ ...draft, invoiceAmountUsd: value })} type="number" value={draft.invoiceAmountUsd} />
            <FieldInput label="Setup spend cap" onChange={(value) => onDraftChange({ ...draft, spendCapUsd: value })} type="number" value={draft.spendCapUsd} />
            <FieldInput label="Margin floor" onChange={(value) => onDraftChange({ ...draft, marginFloorPercent: value })} type="number" value={draft.marginFloorPercent} />
          </div>
        </FormSection>

        <FormSection description="Allowed resources can be approved by the local policy engine when the run executes." title="Approved setup resources">
          <FieldInput label="Approved setup vendors" onChange={(value) => onDraftChange({ ...draft, approvedVendors: value })} value={draft.approvedVendors} />
        </FormSection>

        <FormSection description="Risky spend remains blocked unless a future policy milestone explicitly changes the rules." title="Blocked risk">
          <FieldInput label="Blocked risk vendors" onChange={(value) => onDraftChange({ ...draft, blockedVendors: value })} value={draft.blockedVendors} />
        </FormSection>

        <FormSection description="Describe what this operation should produce for the implementation team." title="Operation objective">
          <TextAreaField label="Operation objective" onChange={(value) => onDraftChange({ ...draft, jobGoal: value })} value={draft.jobGoal} />
        </FormSection>

        {error ? (
          <div className="mx-6 mb-6 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:mx-8">
            {error}
          </div>
        ) : null}

        <div className="border-t border-zinc-200 px-6 py-5 sm:px-8">
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 sm:w-auto"
            disabled={busy}
            type="submit"
          >
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            Save and select operation
          </button>
        </div>
      </form>
    </WorkspacePage>
  );
}

function CustomersView({
  busy,
  onNavigate,
  onDeleteWorkflow,
  onSelectWorkflow,
  state,
}: {
  busy: boolean;
  onNavigate: (view: AppView) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onSelectWorkflow: (workflowId: string) => void;
  state: DemoState | null;
}) {
  const activeWorkflow = state?.workflow ?? null;
  const workflows = state?.workflows ?? [];

  return (
    <WorkspacePage
      actions={<PrimaryButton icon={UserPlus} label="Configure operation" onClick={() => onNavigate("onboarding")} />}
      description="Select the client operation file that drives the next Function Studio run."
      eyebrow="Client operation files"
      meta={<p className="text-sm font-semibold text-zinc-600">{workflows.length} saved operation files</p>}
      title="Client Operation Files"
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        {workflows.length === 0 ? (
          <EmptyWorkspaceState>No saved local operations yet. Open Onboarding to create the Northstar sample.</EmptyWorkspaceState>
        ) : (
          <PlainTable headers={["Client", "Function", "Revenue", "Controls", "Updated", ""]}>
            {workflows.map((workflow) => (
              <tr className={workflow.is_active ? "bg-emerald-50/70" : "bg-white"} key={workflow.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-zinc-950">{workflow.client_name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{workflow.business_type}</p>
                </td>
                <td className="px-4 py-4 text-zinc-700">{workflow.job_name}</td>
                <td className="px-4 py-4 font-semibold text-zinc-950">{formatCurrency(workflow.invoice_amount_cents)}</td>
                <td className="px-4 py-4 text-sm text-zinc-600">
                  Cap {formatCurrency(workflow.spend_cap_cents)} / floor {formatPercent(workflow.margin_floor_percent)}
                </td>
                <td className="px-4 py-4 text-sm text-zinc-600">{formatDateTime(workflow.updated_at)}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                      disabled={busy || workflow.is_active}
                      onClick={() => onSelectWorkflow(workflow.id)}
                      type="button"
                    >
                      {workflow.is_active ? "Selected" : "Select"}
                    </button>
                    <button
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:text-zinc-400"
                      disabled={busy}
                      onClick={() => onDeleteWorkflow(workflow.id)}
                      type="button"
                    >
                      <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </PlainTable>
        )}

        <aside className="border-l border-zinc-200 pl-6">
          <p className="text-sm font-semibold uppercase text-zinc-500">Active file</p>
          {activeWorkflow ? (
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-2xl font-semibold text-zinc-950">{activeWorkflow.client_name}</p>
                <p className="mt-1 text-sm text-zinc-600">{activeWorkflow.job_name}</p>
              </div>
              <dl className="space-y-3 text-sm">
                <FileFact label="Revenue" value={formatCurrency(activeWorkflow.invoice_amount_cents)} />
                <FileFact label="Spend cap" value={formatCurrency(activeWorkflow.spend_cap_cents)} />
                <FileFact label="Margin floor" value={formatPercent(activeWorkflow.margin_floor_percent)} />
                <FileFact label="Approved resources" value={activeWorkflow.approved_vendors.join(", ")} />
                <FileFact label="Blocked risk" value={activeWorkflow.blocked_vendors.join(", ")} />
              </dl>
            </div>
          ) : (
            <EmptyWorkspaceState>No account is selected. Choose a saved operation file or configure the Northstar sample.</EmptyWorkspaceState>
          )}
        </aside>
      </div>
    </WorkspacePage>
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
  const selectedRun = state?.job ?? null;

  return (
    <WorkspacePage
      description="Review launched executions and inspect the profit outcome, orchestration activity, and run evidence."
      eyebrow="Execution history"
      meta={<p className="text-sm font-semibold text-zinc-600">{runs.length} executions recorded</p>}
      title="Execution History"
    >
      {runs.length === 0 ? (
        <EmptyWorkspaceState>No execution has been launched for this client operation yet.</EmptyWorkspaceState>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <PlainTable headers={["Execution", "Status", "Revenue", "Started", ""]}>
            {runs.map((run) => (
              <tr className={run.id === selectedRunId ? "bg-emerald-50/70" : "bg-white"} key={run.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-zinc-950">{run.client_name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{run.job_name}</p>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-zinc-700">{humanize(run.status)}</td>
                <td className="px-4 py-4 font-semibold text-zinc-950">{formatCurrency(run.invoice_amount_cents)}</td>
                <td className="px-4 py-4 text-sm text-zinc-600">{formatDateTime(run.created_at)}</td>
                <td className="px-4 py-4 text-right">
                  <button
                    className="inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
                    onClick={() => onInspectRun(run.id)}
                    type="button"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </PlainTable>

          <div className="space-y-8">
            <WorkspaceSection description="Selected execution economics and operation metadata." title="Selected execution">
              {selectedRun ? (
                <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
                  <p className="text-xl font-semibold text-zinc-950">{selectedRun.client_name}</p>
                  <p className="mt-1 text-sm text-zinc-600">{selectedRun.job_name}</p>
                  <OutcomeRail
                    items={[
                      { label: "Revenue", value: formatOptionalCurrency(money.revenueCents), tone: "emerald" },
                      { label: "Setup spend", value: formatOptionalCurrency(money.approvedSpendCents), tone: "sky" },
                      { label: "Blocked risk", value: formatOptionalCurrency(money.blockedSpendCents), tone: "rose" },
                      { label: "Protected profit", value: formatOptionalCurrency(money.grossProfitCents), tone: "teal" },
                      { label: "Margin", value: formatOptionalPercent(money.marginPercent), tone: "amber" },
                    ]}
                  />
                </div>
              ) : (
                <EmptyWorkspaceState>Select an execution from the history table.</EmptyWorkspaceState>
              )}
            </WorkspaceSection>

            <WorkspaceSection description="Ordered activity from the selected execution." title="Activity timeline">
              <ExecutionFeed calls={calls} />
            </WorkspaceSection>

            <WorkspaceSection description="Final profit report for the selected execution." title="Profit Outcome">
              {reports.length > 0 ? <MarkdownPreview markdown={reports[reports.length - 1].report_markdown} /> : <EmptyWorkspaceState>Profit Outcome appears after the run completes.</EmptyWorkspaceState>}
            </WorkspaceSection>
          </div>
        </div>
      )}
    </WorkspacePage>
  );
}

function AuditView({
  auditRows,
  health,
  state,
}: {
  auditRows: number;
  health: HealthResponse | null;
  state: DemoState | null;
}) {
  const entries = state?.ledger.entries ?? [];
  const totals = state?.ledger.totals ?? null;
  const events = state?.timeline_events ?? state?.events ?? [];
  const calls = state?.orchestration_calls ?? [];
  const checks = state?.policy_checks ?? [];
  const summary = state?.policy.summary ?? null;
  const guardrails = state?.guardrails ?? null;
  const guardrailEvaluations = state?.guardrail_evaluations ?? [];
  const stripeEvents = state?.stripe_events ?? [];
  const reports = state?.reports ?? [];
  const databasePath = state?.database.path ?? health?.database_path ?? null;

  return (
    <WorkspacePage
      description="Grouped evidence for the selected client operation: lifecycle events, finance proof, guardrail decisions, ledger rows, and agent/Hermes calls."
      eyebrow="Evidence Ledger"
      meta={<p className="text-sm font-semibold text-zinc-600">{auditRows} evidence rows in the current view</p>}
      title="Evidence Ledger"
    >
      <OutcomeRail
        items={[
          { label: "Timeline", value: String(events.length), tone: "slate" },
          { label: "Finance proof", value: String(stripeEvents.length), tone: "sky" },
          { label: "Guardrails", value: String(guardrailEvaluations.length), tone: "amber" },
          { label: "Ledger entries", value: String(entries.length), tone: "teal" },
          { label: "Hermes/orchestration", value: String(calls.length), tone: "emerald" },
          { label: "Profit outcome", value: String(reports.length), tone: "violet" },
        ]}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <WorkspaceSection title="Timeline">
          <TimelinePanel events={events} />
        </WorkspaceSection>
        <WorkspaceSection title="Hermes/orchestration">
          <PlanningEvidence state={state} />
          <div className="mt-5">
            <ExecutionFeed calls={calls} />
          </div>
        </WorkspaceSection>
        <WorkspaceSection title="Finance proof">
          <StripeEvidence summary={state?.stripe ?? null} events={stripeEvents} />
        </WorkspaceSection>
        <WorkspaceSection title="Guardrail decisions">
          <PolicyEvidence checks={checks} evaluations={guardrailEvaluations} guardrails={guardrails} ledgerEntries={entries} summary={summary} />
        </WorkspaceSection>
        <WorkspaceSection title="Ledger entries">
          <LedgerPanel auditRows={auditRows} databasePath={databasePath} entries={entries} totals={totals} />
        </WorkspaceSection>
        <WorkspaceSection title="Profit outcome">
          {reports.length > 0 ? <MarkdownPreview markdown={reports[reports.length - 1].report_markdown} /> : <EmptyWorkspaceState>Profit Outcome appears after the run completes.</EmptyWorkspaceState>}
        </WorkspaceSection>
      </div>
    </WorkspacePage>
  );
}

function ConnectionHubView({
  auditRows,
  auth,
  health,
  money,
  state,
}: {
  auditRows: number;
  auth: AuthStatus | null;
  health: HealthResponse | null;
  money: MoneySnapshot;
  state: DemoState | null;
}) {
  const hermes = state?.hermes ?? null;
  const stripe = state?.stripe ?? null;
  const execution = state?.execution ?? null;
  const guardrails = state?.guardrails ?? null;
  const policySummary = state?.policy.summary ?? null;
  const tableCounts = state?.database.table_counts ?? {};
  const policyChecks = state?.policy_checks ?? [];
  const ledgerEntries = state?.ledger.entries ?? [];
  const blockedChecks = policyChecks.filter((check) => !isApproved(check));
  const spendLedgerLabels = new Set(
    ledgerEntries
      .filter((entry) => entry.entry_type === "spend")
      .map((entry) => entry.label),
  );
  const blockedSpendLedgerRows = blockedChecks.filter((check) => spendLedgerLabels.has(check.vendor));
  const guardrailStages = guardrails?.evaluation_stages ?? execution?.guardrail_evaluation_stages ?? [];
  const databaseMode = health?.mode ?? state?.mode ?? "local_sqlite";
  const stripeMode = stripe?.stripe_mode ?? execution?.stripe_mode ?? "not_configured";
  const stripeMissingConfig = stripeMode === "not_configured" && !stripe?.used_real_stripe;
  const hermesMissingConfig = Boolean(hermes?.failure_reason || hermes?.error) && !hermes?.used_real_hermes;
  const nemoMissingConfig = Boolean(guardrails && guardrails.mode === "nemo_guardrails" && !guardrails.used_real_nemo && !guardrails.nemo_python_configured);
  const fullProofRuntimeVerified = Boolean(execution?.used_real_hermes || execution?.used_real_stripe || guardrails?.used_real_nemo);
  const counts = [
    { label: "Planning runs", value: tableCounts.planning_runs ?? state?.planning_runs.length ?? 0, tone: "violet" as Tone },
    { label: "Stripe events", value: tableCounts.stripe_events ?? state?.stripe_events.length ?? 0, tone: "sky" as Tone },
    { label: "Policy checks", value: tableCounts.policy_checks ?? policyChecks.length, tone: "amber" as Tone },
    { label: "Guardrail evaluations", value: tableCounts.guardrail_evaluations ?? state?.guardrail_evaluations.length ?? 0, tone: "teal" as Tone },
    { label: "Orchestration calls", value: tableCounts.orchestration_calls ?? state?.orchestration_calls.length ?? 0, tone: "emerald" as Tone },
    { label: "Events", value: tableCounts.events ?? state?.events.length ?? 0, tone: "slate" as Tone },
    { label: "Reports", value: tableCounts.reports ?? state?.reports.length ?? 0, tone: "rose" as Tone },
    { label: "Ledger entries", value: tableCounts.ledger_entries ?? ledgerEntries.length, tone: "teal" as Tone },
  ];

  return (
    <WorkspacePage
      description="Allowed systems, guardrails, and evidence for ClientOps execution."
      eyebrow="ClientOps operating boundary"
      meta={
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={execution?.label ?? "Judge Demo Mode"} tone={execution?.mode === "full_proof" ? "emerald" : "amber"} />
          <StatusBadge label={`${auditRows} evidence rows`} tone="teal" />
          <StatusBadge label={fullProofRuntimeVerified ? "runtime verified" : "runtime proof pending"} tone={fullProofRuntimeVerified ? "emerald" : "slate"} />
        </div>
      }
      title="Connection Hub"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Mode" tone={execution?.mode === "full_proof" ? "emerald" : "amber"} value={execution?.label ?? "Judge Demo Mode"} />
        <MetricTile label="Planning proof" tone={execution?.used_real_hermes ? "emerald" : "amber"} value={execution?.planning_label ?? "Pending"} />
        <MetricTile label="Finance proof" tone={execution?.used_real_stripe ? "emerald" : "sky"} value={execution?.finance_label ?? "Pending"} />
        <MetricTile label="Guardrails" tone={guardrails?.fail_closed ? "rose" : guardrails?.used_real_nemo ? "emerald" : "teal"} value={execution?.guardrail_label ?? "Local policy active"} />
      </div>

      <WorkspaceSection
        description="Systems ScaleX is allowed to use for the current revenue-backed ClientOps run. Each card states the current mode and boundary."
        title="Active Today"
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <ConnectorCard
            boundary="Uses the ScaleX-isolated Hermes path in Full Proof Mode; no production Hermes config is used."
            description="Plans the implementation operation and proposes the controlled tool sequence."
            facts={[
              { label: "Judge Demo Mode", value: "Deterministic/local plan proof", tone: "amber" },
              { label: "Full Proof Mode", value: "Isolated Hermes when configured", tone: "sky" },
              { label: "used_real_hermes", value: String(Boolean(hermes?.used_real_hermes)), tone: hermes?.used_real_hermes ? "emerald" : "amber" },
              { label: "Provider/model", value: hermes?.used_real_hermes ? `${hermes.provider ?? "Hermes"} / ${hermes.model ?? "model recorded"}` : hermes?.failure_reason ?? hermes?.error ?? "Not runtime verified in this state", tone: hermesMissingConfig ? "rose" : "slate" },
            ]}
            icon={BrainCircuit}
            name="Hermes Planning"
            statuses={[
              { label: "active", tone: "emerald" },
              { label: "demo mode", tone: "amber" },
              { label: "full proof capable", tone: "sky" },
              ...(hermes?.used_real_hermes ? [{ label: "runtime verified", tone: "emerald" as Tone }] : []),
              ...(hermesMissingConfig ? [{ label: "missing config", tone: "rose" as Tone }] : []),
            ]}
          />

          <ConnectorCard
            boundary="Live money is unsupported. Stripe paid state is shown only when Stripe returns it."
            description="Provides finance proof for the ClientOps run through sandbox/test-mode invoice records."
            facts={[
              { label: "Judge Demo Mode", value: "Test-double/sandbox proof", tone: "amber" },
              { label: "Full Proof Mode", value: "Real Stripe test mode", tone: "sky" },
              { label: "Stripe mode", value: humanize(stripeMode), tone: stripe?.used_real_stripe ? "emerald" : stripeMissingConfig ? "rose" : "amber" },
              { label: "Invoice ID", value: stripe?.invoice_id ? "Available" : "Not recorded", tone: stripe?.invoice_id ? "emerald" : "slate" },
              { label: "Hosted invoice URL", value: stripe?.hosted_invoice_url ? "Available" : "Not recorded", tone: stripe?.hosted_invoice_url ? "emerald" : "slate" },
              { label: "Paid", value: stripe?.paid === null || stripe?.paid === undefined ? "Not recorded" : String(stripe.paid), tone: stripe?.paid ? "emerald" : "amber" },
            ]}
            icon={CreditCard}
            name="Stripe Finance Proof"
            statuses={[
              { label: stripe?.used_real_stripe ? "runtime verified" : "demo mode", tone: stripe?.used_real_stripe ? "emerald" : "amber" },
              { label: "full proof capable", tone: "sky" },
              { label: "blocked by policy", tone: "rose" },
              ...(stripeMissingConfig ? [{ label: "missing config", tone: "rose" as Tone }] : []),
            ]}
          />

          <ConnectorCard
            boundary="Local policy is active now. Real NeMo is claimed only when used_real_nemo=true; fail-closed remains visible."
            description="Guards input, planning, execution, and output rails before work is accepted as proof."
            facts={[
              { label: "Mode", value: guardrails?.mode ?? "local_policy", tone: guardrails?.used_real_nemo ? "emerald" : "teal" },
              { label: "Adapter status", value: guardrails?.adapter_status ?? "pending", tone: guardrails?.fail_closed ? "rose" : guardrails?.used_real_nemo ? "emerald" : "amber" },
              { label: "used_real_nemo", value: String(Boolean(guardrails?.used_real_nemo)), tone: guardrails?.used_real_nemo ? "emerald" : "amber" },
              { label: "fail_closed", value: String(Boolean(guardrails?.fail_closed)), tone: guardrails?.fail_closed ? "rose" : "teal" },
              { label: "Rails", value: "input / planning / execution / output", tone: "slate" },
            ]}
            icon={ShieldCheck}
            name="Guardrails"
            statuses={[
              { label: "active", tone: "emerald" },
              { label: guardrails?.used_real_nemo ? "runtime verified" : "local policy", tone: guardrails?.used_real_nemo ? "emerald" : "teal" },
              ...(guardrails?.fail_closed ? [{ label: "fail closed", tone: "rose" as Tone }] : []),
              ...(guardrails?.blocked ? [{ label: "blocked by policy", tone: "rose" as Tone }] : []),
              ...(nemoMissingConfig ? [{ label: "missing config", tone: "rose" as Tone }] : []),
            ]}
          />

          <ConnectorCard
            boundary="Local SQLite evidence only; no production customer data or external ledger is connected."
            description="Persists run events, ledger rows, planning proof, policy checks, guardrail evaluations, and reports."
            facts={[
              { label: "Database mode", value: databaseMode, tone: "teal" },
              { label: "Runs", value: String(state?.runs.length ?? 0), tone: "slate" },
              { label: "Ledger entries", value: String(tableCounts.ledger_entries ?? ledgerEntries.length), tone: "teal" },
              { label: "Evidence rows", value: String(auditRows), tone: "emerald" },
              { label: "Blocked spend ledger rows", value: String(blockedSpendLedgerRows.length), tone: blockedSpendLedgerRows.length === 0 ? "emerald" : "rose" },
            ]}
            icon={Database}
            name="SQLite Evidence Ledger"
            statuses={[
              { label: "active", tone: "emerald" },
              { label: "demo mode", tone: "amber" },
            ]}
          />

          <ConnectorCard
            boundary="Prototype local auth only. It is not production enterprise identity."
            description="Protects the local product shell when enabled and stays disabled by default for judge checkout."
            facts={[
              { label: "Auth enabled", value: String(Boolean(auth?.auth_enabled)), tone: auth?.auth_enabled ? "emerald" : "amber" },
              { label: "Session", value: auth?.authenticated ? `Signed in as ${auth.username ?? "operator"}` : "No local session required", tone: auth?.authenticated ? "emerald" : "slate" },
              { label: "Production auth", value: "Not implemented", tone: "amber" },
            ]}
            icon={LockKeyhole}
            name="Prototype Auth"
            statuses={[
              { label: auth?.auth_enabled ? "active" : "demo mode", tone: auth?.auth_enabled ? "emerald" : "amber" },
            ]}
          />
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Full Proof Mode paths are capability boundaries, not a claim that every runtime was used in this local state."
        title="Full Proof Capable"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <CapabilityCard
            detail={hermes?.used_real_hermes ? `${hermes.provider ?? "Hermes"} / ${hermes.model ?? "model recorded"}` : hermesMissingConfig ? hermes?.failure_reason ?? hermes?.error ?? "Hermes config error recorded." : "Available through isolated Hermes configuration."}
            icon={BrainCircuit}
            label="Isolated Hermes planning"
            status={hermes?.used_real_hermes ? "runtime verified" : hermesMissingConfig ? "missing config" : "full proof capable"}
            tone={hermes?.used_real_hermes ? "emerald" : hermesMissingConfig ? "rose" : "sky"}
          />
          <CapabilityCard
            detail={stripe?.used_real_stripe ? "Real Stripe test-mode proof recorded." : stripeMissingConfig ? "Stripe test mode has no configured proof in this state." : "Real Stripe test mode is the Full Proof finance path."}
            icon={CreditCard}
            label="Stripe test-mode finance"
            status={stripe?.used_real_stripe ? "runtime verified" : stripeMissingConfig ? "missing config" : "full proof capable"}
            tone={stripe?.used_real_stripe ? "emerald" : stripeMissingConfig ? "rose" : "sky"}
          />
          <CapabilityCard
            detail={guardrails?.used_real_nemo ? "Real NeMo Guardrails runtime evidence was recorded." : guardrails?.mode === "nemo_compatible" ? "NeMo-compatible fallback only; not real NeMo." : guardrails?.nemo_python_configured ? "Real NeMo runtime can be probed when selected." : "Real NeMo is optional and needs configured runtime values before use."}
            icon={ShieldAlert}
            label="Real NeMo guardrails"
            status={guardrails?.used_real_nemo ? "runtime verified" : nemoMissingConfig || !guardrails?.nemo_python_configured ? "missing config" : "full proof capable"}
            tone={guardrails?.used_real_nemo ? "emerald" : nemoMissingConfig || !guardrails?.nemo_python_configured ? "rose" : "sky"}
          />
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="The latest selected run records what was planned, guarded, blocked, and persisted."
        title="Evidence Recorded"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-5">
            <ConnectionPanel icon={ReceiptText} title="Latest run proof summary">
              <ConnectionFactGrid
                facts={[
                  { label: "Selected run", tone: "slate", value: state?.job ? humanize(state.job.status) : "No run selected" },
                  { label: "Stripe paid", tone: stripe?.paid ? "emerald" : "amber", value: stripe?.paid === null || stripe?.paid === undefined ? "Not recorded" : String(stripe.paid) },
                  { label: "Blocked risk", tone: "rose", value: formatOptionalCurrency(money.blockedSpendCents) },
                  { label: "Protected profit", tone: "teal", value: formatOptionalCurrency(money.grossProfitCents) },
                  { label: "Protected margin", tone: "amber", value: formatOptionalPercent(money.marginPercent) },
                  {
                    label: "No blocked spend row proof",
                    tone: blockedChecks.length > 0 && blockedSpendLedgerRows.length === 0 ? "emerald" : blockedSpendLedgerRows.length > 0 ? "rose" : "slate",
                    value: blockedChecks.length > 0 ? blockedSpendLedgerRows.length === 0 ? "Preserved" : "Review ledger" : "Pending blocked decision",
                  },
                ]}
              />
            </ConnectionPanel>

            <ConnectionPanel icon={BookOpenCheck} title="Evidence counts">
              <ConnectionFactGrid
                facts={counts.map((item) => ({
                  label: item.label,
                  tone: item.tone,
                  value: String(item.value),
                }))}
              />
            </ConnectionPanel>
          </div>

          <div className="space-y-5">
            <ConnectionPanel icon={ShieldCheck} title="Guardrail rail stages">
              <RailStageGrid stages={guardrailStages} />
            </ConnectionPanel>
            <ConnectionPanel icon={Ban} title="Blocked by policy">
              <BlockedPolicyList blockedChecks={blockedChecks} spendLedgerLabels={spendLedgerLabels} />
              {policySummary ? (
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  Approved vendors: {policySummary.approved_vendors.join(", ")}. Blocked vendors: {policySummary.blocked_vendors.join(", ")}.
                </p>
              ) : null}
            </ConnectionPanel>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Future systems are shown as planned boundaries only. They are not active connectors and no MCP server is claimed."
        title="Planned"
      >
        <div className="grid gap-4 xl:grid-cols-5">
          <PlannedConnectorCard
            boundary="Approval transport is planned; no real client email is connected."
            icon={ClipboardList}
            name="Slack or Email approvals"
          />
          <PlannedConnectorCard
            boundary="CRM context is planned; no production CRM or real customer data is connected."
            icon={Users}
            name="CRM context"
          />
          <PlannedConnectorCard
            boundary="Workspace publishing is planned; no Notion or docs workspace is connected."
            icon={FileText}
            name="Docs / Notion workspace"
          />
          <PlannedConnectorCard
            boundary="Kickoff scheduling is planned; no calendar API is connected."
            icon={CircleDashed}
            name="Calendar kickoff scheduling"
          />
          <PlannedConnectorCard
            boundary="Future access pattern only. No MCP server or external agent access is implemented."
            icon={Settings}
            name="MCP server boundary"
          />
        </div>
      </WorkspaceSection>
    </WorkspacePage>
  );
}

interface ConnectionStatus {
  label: string;
  tone: Tone;
}

interface ConnectorFact {
  label: string;
  value: string;
  tone: Tone;
}

function ConnectorCard({
  boundary,
  description,
  facts,
  icon: Icon,
  name,
  statuses,
}: {
  boundary: string;
  description: string;
  facts: ConnectorFact[];
  icon: LucideIcon;
  name: string;
  statuses: ConnectionStatus[];
}) {
  return (
    <article className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-zinc-950 text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-zinc-950">{name}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {statuses.map((status, index) => (
          <StatusBadge key={`${status.label}-${index}`} label={status.label} tone={status.tone} />
        ))}
      </div>
      <ConnectionFactGrid facts={facts} />
      <p className="mt-4 border-t border-zinc-200 pt-3 text-xs leading-5 text-zinc-500">{boundary}</p>
    </article>
  );
}

function ConnectionFactGrid({ facts }: { facts: ConnectorFact[] }) {
  return (
    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
      {facts.map((fact) => (
        <div className={`border-l-4 pl-3 ${toneAccentClass(fact.tone)}`} key={fact.label}>
          <dt className="text-[0.68rem] font-semibold uppercase text-zinc-500">{fact.label}</dt>
          <dd className="mt-1 break-words text-sm font-semibold text-zinc-950">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CapabilityCard({
  detail,
  icon: Icon,
  label,
  status,
  tone,
}: {
  detail: string;
  icon: LucideIcon;
  label: string;
  status: string;
  tone: Tone;
}) {
  return (
    <article className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-md border ${softToneClass(tone)}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-zinc-950">{label}</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{detail}</p>
          </div>
        </div>
        <StatusBadge label={status} tone={tone} />
      </div>
    </article>
  );
}

function ConnectionPanel({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-zinc-700" aria-hidden="true" />
        <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function RailStageGrid({ stages }: { stages: GuardrailSummary["evaluation_stages"] }) {
  if (stages.length === 0) {
    return <EmptyState>Rail evidence appears after guardrail evaluation records are written.</EmptyState>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {stages.map((stage) => (
        <article
          className={`rounded-md border p-3 ${
            stage.fail_closed || stage.decision === "block"
              ? "border-rose-200 bg-rose-50"
              : stage.used_real_nemo
                ? "border-emerald-200 bg-emerald-50"
                : "border-zinc-200 bg-zinc-50"
          }`}
          key={stage.stage}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-zinc-950">{stage.label}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-zinc-400">
                {humanize(stage.stage)} / {stage.adapter}
              </p>
            </div>
            <StatusBadge
              label={humanize(stage.decision)}
              tone={stage.fail_closed || stage.decision === "block" ? "rose" : stage.used_real_nemo ? "emerald" : stage.decision === "pending" ? "slate" : "teal"}
            />
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{stage.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge label={`used_real_nemo=${String(stage.used_real_nemo)}`} tone={stage.used_real_nemo ? "emerald" : "amber"} />
            <StatusBadge label={`fail_closed=${String(stage.fail_closed)}`} tone={stage.fail_closed ? "rose" : "teal"} />
          </div>
        </article>
      ))}
    </div>
  );
}

function BlockedPolicyList({
  blockedChecks,
  spendLedgerLabels,
}: {
  blockedChecks: PolicyCheck[];
  spendLedgerLabels: Set<string>;
}) {
  if (blockedChecks.length === 0) {
    return <EmptyState>No blocked policy actions are recorded for the selected run yet.</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {blockedChecks.map((check) => (
        <article className="rounded-md border border-rose-200 bg-rose-50 p-3" key={check.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-zinc-950">{check.vendor}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-rose-700">blocked by policy</p>
            </div>
            <StatusBadge label={formatCurrency(check.requested_amount_cents)} tone="rose" />
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-700">{check.reason}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge label={`Action ${check.required_action}`} tone="slate" />
            <StatusBadge
              label={spendLedgerLabels.has(check.vendor) ? "Spend ledger row present" : "No spend ledger row"}
              tone={spendLedgerLabels.has(check.vendor) ? "rose" : "emerald"}
            />
            <StatusBadge label={formatDateTime(check.created_at)} tone="slate" />
          </div>
        </article>
      ))}
    </div>
  );
}

function PlannedConnectorCard({
  boundary,
  icon: Icon,
  name,
}: {
  boundary: string;
  icon: LucideIcon;
  name: string;
}) {
  return (
    <article className="rounded-md bg-white p-4 shadow-sm ring-1 ring-zinc-200">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-950">{name}</h3>
          <div className="mt-2">
            <StatusBadge label="planned" tone="slate" />
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-500">{boundary}</p>
        </div>
      </div>
    </article>
  );
}

function toneAccentClass(tone: Tone): string {
  switch (tone) {
    case "emerald":
      return "border-emerald-500";
    case "sky":
      return "border-sky-500";
    case "amber":
      return "border-amber-500";
    case "rose":
      return "border-rose-500";
    case "teal":
      return "border-teal-500";
    case "violet":
      return "border-violet-500";
    case "slate":
      return "border-zinc-300";
    default:
      return "border-zinc-300";
  }
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
    <WorkspacePage
      description="Runtime facts and non-negotiable boundaries for the local ClientOps workspace."
      eyebrow="Boundaries & Runtime"
      meta={<p className="text-sm font-semibold text-zinc-600">API {health?.status ?? "not checked"} / {auditRows} evidence rows</p>}
      title="Boundaries & Runtime"
    >
      <PlainTable headers={["Area", "Current value", "Boundary"]}>
        <BoundaryRow
          area="Prototype auth"
          boundary="Local prototype auth only; no production identity claim."
          value={auth?.auth_enabled ? auth?.authenticated ? `Signed in as ${auth.username ?? "operator"}` : "Enabled" : "Disabled for this local run"}
        />
        <BoundaryRow
          area="Execution mode"
          boundary={state?.execution.truthfulness_note ?? "Demo proof and Full Proof Mode stay explicitly labeled."}
          value={state?.execution.label ?? "Not recorded"}
        />
        <BoundaryRow
          area="Runtime"
          boundary="Local API and SQLite-backed product workspace."
          value={`${health?.mode ?? state?.mode ?? "local"} / database ${health?.database_exists || state?.database.exists ? "available" : "not initialized"}`}
        />
        <BoundaryRow
          area="Active operation"
          boundary="Synthetic Northstar B2B implementation operation only."
          value={state?.workflow ? `${state.workflow.client_name} / ${state.workflow.job_name}` : "No operation selected"}
        />
        <BoundaryRow
          area="Data"
          boundary="No patient data, no PHI, no healthcare compliance or HIPAA claim."
          value="Synthetic sample"
        />
        <BoundaryRow
          area="Money movement"
          boundary="No live-money support; future live execution requires Verified Live Mode."
          value="Stripe test mode only when configured"
        />
        <BoundaryRow
          area="Guardrails"
          boundary={state?.guardrails.truthfulness_note ?? "Local policy active now; real NeMo is optional and must be runtime verified before any claim."}
          value={
            state?.guardrails
              ? `${state.guardrails.mode} / ${state.guardrails.adapter_status} / used_real_nemo=${String(state.guardrails.used_real_nemo)} / fail_closed=${String(state.guardrails.fail_closed)}`
              : "Local policy active"
          }
        />
        <BoundaryRow
          area="Records"
          boundary="SQLite evidence is local; no production customer workflow claim."
          value={`${state?.runs.length ?? 0} runs / ${state?.workflows.length ?? 0} operation files`}
        />
      </PlainTable>
    </WorkspacePage>
  );
}

function SectionHeader({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-zinc-700" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      </div>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );
}

function MetricTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone: Tone;
  value: string;
}) {
  return (
    <div className={`rounded-md border p-3 ${softToneClass(tone)}`}>
      <p className="text-[0.68rem] font-semibold uppercase">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function FieldInput({
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
        className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-600"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold text-zinc-700">
      {label}
      <textarea
        className="mt-2 min-h-32 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-emerald-600"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function EmptyState({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600 ${className}`}>
      {children}
    </div>
  );
}

function PlanningEvidence({ state }: { state: DemoState | null }) {
  const planningRun = state?.planning_run ?? null;
  const execution = state?.execution ?? null;
  const toolSequence = planningRun?.result_json?.proposed_tool_sequence ?? [];

  return (
    <div>
      <SectionHeader
        description="Planning proof and proposed tool sequence for the selected execution."
        icon={BrainCircuit}
        title="Hermes planning"
      />
      {planningRun ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Execution mode" tone="violet" value={execution?.label ?? "Not recorded"} />
            <MetricTile label="Planning proof" tone={execution?.used_real_hermes ? "emerald" : "amber"} value={execution?.planning_label ?? "Not recorded"} />
            <MetricTile label="Provider/model" tone="slate" value={`${planningRun.provider} / ${planningRun.model}`} />
            <MetricTile label="Planning source" tone="slate" value={humanize(planningRun.source)} />
          </div>
          <div className="border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-700">
            {planningRun.summary ?? "Planning summary was not recorded."}
          </div>
          {toolSequence.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {toolSequence.slice(0, 10).map((toolName, index) => (
                <StatusBadge
                  key={`${toolName}-${index}`}
                  label={`#${index + 1} ${toolName}`}
                  tone="violet"
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState className="mt-4">Hermes planning proof appears after the run executes.</EmptyState>
      )}
    </div>
  );
}

function ExecutionFeed({ calls }: { calls: OrchestrationCall[] }) {
  return (
    <div>
      <SectionHeader
        description="Ordered tool calls captured from the selected run."
        icon={Activity}
        title="Execution feed"
      />
      {calls.length === 0 ? (
        <EmptyState className="mt-4">Orchestration calls appear after the run executes.</EmptyState>
      ) : (
        <ol className="mt-4 max-h-[36rem] space-y-2 overflow-auto pr-1">
          {calls.map((call) => {
            const failed = call.status === "failed";
            return (
              <li
                className={`border p-3 ${
                  failed ? "border-rose-200 bg-rose-50" : "border-zinc-200 bg-white"
                }`}
                key={call.id}
              >
                <div className="grid gap-3 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
                  <p className="font-mono text-sm font-semibold text-zinc-500">#{call.sequence}</p>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-zinc-950">{call.tool_name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatDateTime(call.created_at)}</p>
                    {call.error ? (
                      <p className="mt-2 text-xs leading-5 text-rose-700">{call.error}</p>
                    ) : null}
                  </div>
                  <StatusBadge
                    icon={failed ? AlertTriangle : CheckCircle2}
                    label={`${humanize(call.status)} · ${call.duration_ms}ms`}
                    tone={failed ? "rose" : "emerald"}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function TimelinePanel({ events }: { events: DemoEvent[] }) {
  return (
    <div>
      <SectionHeader
        description="Human-readable lifecycle events for the selected run."
        icon={ReceiptText}
        title="Timeline"
      />
      {events.length === 0 ? (
        <EmptyState className="mt-4">Timeline events appear after the run executes.</EmptyState>
      ) : (
        <ol className="mt-4 max-h-[36rem] space-y-3 overflow-auto pr-1">
          {events.map((event) => {
            const Icon = iconForEvent(event.type);
            return (
              <li className="border border-zinc-200 bg-white p-3" key={event.id}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-zinc-950 text-white">
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
                      <StatusBadge label={humanize(event.status)} tone={runStatusTone(event.status)} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{event.detail}</p>
                    <p className="mt-2 text-xs text-zinc-500">{formatDateTime(event.created_at)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function LedgerPanel({
  auditRows,
  databasePath,
  entries,
  totals,
}: {
  auditRows: number;
  databasePath: string | null;
  entries: LedgerEntry[];
  totals: LedgerTotals | null;
}) {
  return (
    <div>
      <SectionHeader
        description="Revenue and spend rows persisted to local SQLite."
        icon={BookOpenCheck}
        title="Ledger"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge icon={Database} label={`${auditRows} audit rows`} tone="teal" />
        <StatusBadge label={databasePath ?? "Ledger path not recorded"} tone="slate" />
      </div>

      {entries.length === 0 ? (
        <EmptyState className="mt-4">Ledger entries appear after revenue and approved spend are recorded.</EmptyState>
      ) : (
        <div className="mt-4 overflow-hidden border border-zinc-200 bg-white">
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
          <MetricTile label="Revenue" tone="emerald" value={formatCurrency(totals.revenue_cents)} />
          <MetricTile label="Approved setup spend" tone="sky" value={formatCurrency(totals.approved_spend_cents)} />
          <MetricTile label="Remaining cap" tone="amber" value={formatCurrency(totals.remaining_spend_cap_cents)} />
        </div>
      ) : null}
    </div>
  );
}

function StripeEvidence({
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
    <div>
      <SectionHeader
        description={
          summary?.used_real_stripe
            ? "Real Stripe test-mode customer and finalized invoice records."
            : summary?.stripe_mode === "test_double"
              ? "Stripe test-double sandbox finance proof. No Stripe SDK call was performed."
              : "Stripe proof appears after the run."
        }
        icon={CreditCard}
        title="Stripe"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge
          label={
            failed
              ? "Integration error"
              : summary?.used_real_stripe
                ? "Real Stripe test mode"
                : summary?.stripe_mode
                  ? humanize(summary.stripe_mode)
                  : "Awaiting Stripe proof"
          }
          tone={failed ? "rose" : summary?.used_real_stripe ? "emerald" : "amber"}
        />
        <StatusBadge
          label={`livemode=${summary?.livemode === null || summary?.livemode === undefined ? "not recorded" : String(summary.livemode)}`}
          tone={summary?.livemode === false ? "sky" : "amber"}
        />
      </div>

      {failed ? (
        <div className="mt-4 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">Stripe integration error</p>
          <p className="mt-1">{summary?.error}</p>
        </div>
      ) : null}

      {invoiceOpenUnpaid ? (
        <div className="mt-4 border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Stripe test invoice finalized and open. It is not marked paid.
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricTile label="Real Stripe test path" tone={summary?.used_real_stripe ? "emerald" : "amber"} value={String(Boolean(summary?.used_real_stripe))} />
        <MetricTile label="Customer ID" tone="slate" value={summary?.customer_id ?? "Not recorded"} />
        <MetricTile label="Invoice ID" tone="slate" value={summary?.invoice_id ?? "Not recorded"} />
        <MetricTile label="Invoice status" tone="amber" value={summary?.invoice_status ?? "Not recorded"} />
        <MetricTile label="Paid" tone={summary?.paid ? "emerald" : "amber"} value={summary?.paid === null || summary?.paid === undefined ? "Not recorded" : String(summary.paid)} />
        <MetricTile label="Hosted URL" tone="slate" value={summary?.hosted_invoice_url ? "Available" : "Not recorded"} />
      </div>

      {summary?.hosted_invoice_url ? (
        <a
          className="mt-4 flex items-center justify-between gap-3 border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
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
      ) : null}

      {summary?.diagnostic_reason ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">{summary.diagnostic_reason}</p>
      ) : null}
      {latestInvoice ? (
        <p className="mt-3 text-xs text-zinc-500">
          Latest Stripe proof recorded {formatDateTime(latestInvoice.created_at)}.
        </p>
      ) : null}
    </div>
  );
}

function PolicyEvidence({
  checks,
  evaluations,
  guardrails,
  ledgerEntries,
  summary,
}: {
  checks: PolicyCheck[];
  evaluations: GuardrailEvaluation[];
  guardrails: GuardrailSummary | null;
  ledgerEntries: LedgerEntry[];
  summary: PolicySummary | null;
}) {
  const approvedChecks = checks.filter(isApproved);
  const blockedChecks = checks.filter((check) => !isApproved(check));
  const spendLedgerLabels = new Set(
    ledgerEntries
      .filter((entry) => entry.entry_type === "spend")
      .map((entry) => entry.label),
  );
  const blockedSpendLedgerRows = blockedChecks.filter((check) => spendLedgerLabels.has(check.vendor));

  return (
    <div>
      <SectionHeader
        description="Guardrail adapter proof and local policy decisions persisted for the selected run."
        icon={ShieldCheck}
        title="Guardrail proof"
      />
      {guardrails ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <MetricTile label="Mode" tone="violet" value={guardrails.mode} />
          <MetricTile label="Adapter status" tone={guardrails.fail_closed ? "rose" : guardrails.used_real_nemo ? "emerald" : "amber"} value={guardrails.adapter_status} />
          <MetricTile label="used_real_nemo" tone={guardrails.used_real_nemo ? "emerald" : "amber"} value={String(guardrails.used_real_nemo)} />
          <MetricTile label="fail_closed" tone={guardrails.fail_closed ? "rose" : "teal"} value={String(guardrails.fail_closed)} />
          <MetricTile label="Local policy active" tone="emerald" value={String(guardrails.local_policy_active)} />
          <MetricTile label="Evaluation stages" tone="slate" value={String(evaluations.length)} />
          <MetricTile
            label="Blocked spend ledger rows"
            tone={blockedSpendLedgerRows.length === 0 ? "emerald" : "rose"}
            value={String(blockedSpendLedgerRows.length)}
          />
        </div>
      ) : null}
      {summary ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <MetricTile label="Spend cap" tone="sky" value={formatCurrency(summary.max_job_spend_usd * 100)} />
          <MetricTile label="Margin floor" tone="teal" value={formatPercent(summary.margin_floor_percent)} />
          <MetricTile label="Payment before spend" tone="amber" value={summary.require_payment_before_spend ? "Required" : "Not required"} />
          <MetricTile label="Vendor list" tone="emerald" value={`${summary.approved_vendors.length} allowed / ${summary.blocked_vendors.length} blocked`} />
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {evaluations.length === 0 ? (
          <EmptyState>Guardrail adapter evaluations appear after the run executes.</EmptyState>
        ) : (
          evaluations.map((evaluation) => (
            <article
              className={`border p-3 ${
                evaluation.fail_closed
                  ? "border-rose-200 bg-rose-50"
                  : evaluation.status === "block"
                    ? "border-rose-200 bg-rose-50"
                  : evaluation.used_real_nemo
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-zinc-200 bg-white"
              }`}
              key={evaluation.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-950">{evaluation.label}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-zinc-400">
                    {humanize(evaluation.stage)} / {evaluation.mode} / {evaluation.adapter}
                  </p>
                </div>
                <StatusBadge
                  label={humanize(evaluation.status)}
                  tone={evaluation.fail_closed || evaluation.status === "block" ? "rose" : evaluation.used_real_nemo ? "emerald" : "amber"}
                />
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-700">{evaluation.summary}</p>
              {evaluation.error ? (
                <p className="mt-2 text-xs leading-5 text-rose-700">{evaluation.error}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge label={`used_real_nemo=${String(evaluation.used_real_nemo)}`} tone={evaluation.used_real_nemo ? "emerald" : "amber"} />
                <StatusBadge label={`fail_closed=${String(evaluation.fail_closed)}`} tone={evaluation.fail_closed ? "rose" : "teal"} />
                <StatusBadge label={`decision=${humanize(evaluation.status)}`} tone={evaluation.fail_closed ? "rose" : evaluation.status === "block" ? "rose" : "teal"} />
                <StatusBadge label={formatDateTime(evaluation.created_at)} tone="slate" />
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 space-y-3">
        {checks.length === 0 ? (
          <EmptyState>Spend decisions appear after the run executes.</EmptyState>
        ) : (
          checks.map((check) => {
            const approved = isApproved(check);
            return (
              <article
                className={`border p-3 ${
                  approved ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                }`}
                key={check.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-950">{check.vendor}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-zinc-400">
                      {approved ? "Approved vendor spend" : "Blocked unsafe spend"}
                    </p>
                  </div>
                  <StatusBadge label={formatCurrency(check.requested_amount_cents)} tone={approved ? "emerald" : "rose"} />
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{check.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge label={`Margin after ${formatPercent(check.margin_after_spend_percent)}`} tone="teal" />
                  <StatusBadge label={`Action ${check.required_action}`} tone="slate" />
                  {!approved ? (
                    <StatusBadge
                      label={spendLedgerLabels.has(check.vendor) ? "Spend ledger row present" : "No spend ledger row"}
                      tone={spendLedgerLabels.has(check.vendor) ? "rose" : "emerald"}
                    />
                  ) : null}
                  <StatusBadge label={formatDateTime(check.created_at)} tone="slate" />
                </div>
              </article>
            );
          })
        )}
      </div>

      {summary ? (
        <div className="mt-4 border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
          Approved vendors: {summary.approved_vendors.join(", ")}. Blocked vendors: {summary.blocked_vendors.join(", ")}.
        </div>
      ) : null}
      {(approvedChecks.length > 0 || blockedChecks.length > 0) ? (
        <p className="mt-3 text-xs text-zinc-500">
          Decisions recorded: {approvedChecks.length} approved, {blockedChecks.length} blocked.
        </p>
      ) : null}
    </div>
  );
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-2 text-sm leading-6 text-zinc-700">
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
                <span className="mr-2 text-zinc-500">-</span>
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
    case "run_started":
      return Play;
    case "margin_plan":
      return TrendingUp;
    case "policy_gate":
    case "policy_check":
    case "guardrail_blocked":
    case "guardrail_fail_closed":
      return ShieldCheck;
    case "stripe_test":
    case "stripe_test_double":
    case "stripe_integration_error":
    case "payment_confirmed":
      return CreditCard;
    case "agent_work":
      return Layers3;
    case "profit_report":
      return ReceiptText;
    default:
      return CircleDashed;
  }
}

function runStatusTone(status: string): Tone {
  if (status === "blocked" || status === "failed" || status === "error" || status === "stripe_error") {
    return "rose";
  }
  if (status === "complete" || status === "paid" || status === "approved" || status === "completed" || status === "run complete") {
    return "emerald";
  }
  if (status === "guarded" || status === "planned" || status === "local_test_confirmed" || status === "pending") {
    return "amber";
  }
  if (status === "stripe_test" || status === "test_double") {
    return "sky";
  }
  return "slate";
}
