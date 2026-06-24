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
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  Layers3,
  LockKeyhole,
  ReceiptText,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusBadge } from "../../components/ui/StatusBadge";
import { darkToneClass } from "../../components/ui/statusStyles";
import type { Tone } from "../../components/ui/statusStyles";
import { formatCurrency, formatDateTime, formatPercent, humanize } from "../../format";
import {
  formatOptionalCurrency,
  formatOptionalPercent,
  isApproved,
  latestWhere,
  type MoneySnapshot,
} from "../../lib/demoSelectors";
import type { AppView } from "../../layout/navigation";
import type {
  AgentOutput,
  AuthStatus,
  DemoEvent,
  DemoState,
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
  state: DemoState | null;
}) {
  return (
    <section className="min-h-screen bg-zinc-950 text-white">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        {activeView === "dashboard" ? (
          <DashboardView money={money} onNavigate={onNavigate} state={state} />
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
          <IntegrationsView auditRows={auditRows} health={health} state={state} />
        ) : null}
        {activeView === "settings" ? (
          <SettingsView auth={auth} auditRows={auditRows} health={health} state={state} />
        ) : null}
      </div>
    </section>
  );
}

function DashboardView({
  money,
  onNavigate,
  state,
}: {
  money: MoneySnapshot;
  onNavigate: (view: AppView) => void;
  state: DemoState | null;
}) {
  const activeWorkflow = state?.workflow ?? null;
  const runs = state?.runs ?? [];
  const reports = state?.reports ?? [];
  const latestReport = state?.report ?? reports[reports.length - 1] ?? null;
  const latestRun = state?.job ?? runs[0] ?? null;
  const paymentTone: Tone =
    state?.stripe?.paid === true
      ? "emerald"
      : state?.stripe?.invoice_status === "open"
        ? "amber"
        : state?.stripe?.error
          ? "rose"
          : "slate";

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <Eyebrow>Dashboard</Eyebrow>
            <h1 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
              ClientOps Autopilot overview
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">
              Confirm the selected revenue-backed client operation, current economics, run health, and where to go next before opening the ClientOps Function Studio.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge
                icon={Workflow}
                label={activeWorkflow ? "Operation selected" : "Needs onboarding"}
                tone={activeWorkflow ? "emerald" : "amber"}
              />
              <StatusBadge
                icon={ClipboardList}
                label={latestRun ? humanize(latestRun.status) : "No run loaded"}
                tone={latestRun ? runStatusTone(latestRun.status) : "slate"}
              />
              <StatusBadge
                icon={CreditCard}
                label={state?.stripe?.paid ? "Stripe paid" : humanize(state?.stripe?.invoice_status ?? "pending")}
                tone={paymentTone}
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[31rem] xl:grid-cols-3">
            <MetricTile label="Revenue" tone="emerald" value={formatOptionalCurrency(money.revenueCents)} />
            <MetricTile label="Approved setup spend" tone="sky" value={formatOptionalCurrency(money.approvedSpendCents)} />
            <MetricTile label="Blocked risk" tone="rose" value={formatOptionalCurrency(money.blockedSpendCents)} />
            <MetricTile label="Protected profit" tone="teal" value={formatOptionalCurrency(money.grossProfitCents)} />
            <MetricTile label="Margin" tone="amber" value={formatOptionalPercent(money.marginPercent)} />
            <MetricTile label="Saved operations" tone="slate" value={String(state?.workflows.length ?? 0)} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Panel className="p-5">
          <SectionHeader
            description="The selected client operation seed that the next run will use."
            icon={Building2}
            title="Current client operation"
          />
          {activeWorkflow ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge icon={CheckCircle2} label="Ready to run" tone="emerald" />
                <StatusBadge icon={Users} label={activeWorkflow.client_name} tone="slate" />
                <StatusBadge icon={Gauge} label={formatCurrency(activeWorkflow.spend_cap_cents)} tone="sky" />
                <StatusBadge icon={TrendingUp} label={formatPercent(activeWorkflow.margin_floor_percent)} tone="teal" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricTile label="Business type" tone="slate" value={activeWorkflow.business_type} />
                <MetricTile label="Invoice" tone="emerald" value={formatCurrency(activeWorkflow.invoice_amount_cents)} />
                <MetricTile label="Spend cap" tone="sky" value={formatCurrency(activeWorkflow.spend_cap_cents)} />
                <MetricTile label="Margin floor" tone="teal" value={formatPercent(activeWorkflow.margin_floor_percent)} />
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-300">{activeWorkflow.job_goal}</p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <InlineList items={activeWorkflow.approved_vendors} title="Approved setup vendors" tone="sky" />
                <InlineList items={activeWorkflow.blocked_vendors} title="Blocked risk vendors" tone="rose" />
              </div>
            </>
          ) : (
            <EmptyState className="mt-4">
              No client operation is selected yet. Open Onboarding to create the Northstar sample operation.
            </EmptyState>
          )}
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            description="Fast access to the next product surface."
            icon={Layers3}
            title="Next moves"
          />
          <div className="mt-4 space-y-3">
            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
              onClick={() => onNavigate(activeWorkflow ? "workflow" : "onboarding")}
              type="button"
            >
              <Workflow className="h-4 w-4" aria-hidden="true" />
              {activeWorkflow ? "Open Function Studio" : "Open onboarding"}
            </button>
            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => onNavigate("customers")}
              type="button"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Manage accounts
            </button>
            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => onNavigate("runs")}
              type="button"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Review run history
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <EvidenceCard
              description={state?.hermes?.used_real_hermes ? `${state.hermes.provider ?? "Hermes"} / ${state.hermes.model ?? "model pending"}` : state?.hermes?.failure_reason ?? state?.hermes?.error ?? "Hermes proof appears after planning or run execution."}
              icon={BrainCircuit}
              title="Hermes state"
              tone={state?.hermes?.used_real_hermes ? "emerald" : state?.hermes?.error ? "rose" : "violet"}
            />
            <EvidenceCard
              description={latestReport ? "Final profit outcome is available in the selected run and Function Studio views." : "Final profit outcome proof appears after the operation completes."}
              icon={FileText}
              title="Profit outcome"
              tone={latestReport ? "teal" : "slate"}
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel className="p-5">
          <SectionHeader
            description="Current payment honesty remains visible here."
            icon={CreditCard}
            title="Payment state"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricTile label="Invoice status" tone={paymentTone} value={humanize(state?.stripe?.invoice_status ?? "pending")} />
            <MetricTile label="Paid" tone={state?.stripe?.paid ? "emerald" : "amber"} value={String(Boolean(state?.stripe?.paid))} />
            <MetricTile label="Invoice ID" tone="slate" value={state?.stripe?.invoice_id ?? "Pending"} />
            <MetricTile label="Customer ID" tone="slate" value={state?.stripe?.customer_id ?? "Pending"} />
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            description="Guardrail decisions and local policy proof."
            icon={ShieldCheck}
            title="Policy state"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricTile label="Approved checks" tone="emerald" value={String((state?.policy_checks ?? []).filter((check) => Boolean(check.approved)).length)} />
            <MetricTile label="Blocked checks" tone="rose" value={String((state?.policy_checks ?? []).filter((check) => !Boolean(check.approved)).length)} />
            <MetricTile label="Engine" tone="violet" value="Local policy engine" />
            <MetricTile label="Goal 8" tone="violet" value="NeMo planned / not wired" />
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            description="Persisted records behind the operator shell."
            icon={Database}
            title="SQLite state"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricTile label="Database path" tone="slate" value={state?.database.path ?? "Pending"} />
            <MetricTile label="Runs" tone="sky" value={String(state?.runs.length ?? 0)} />
            <MetricTile label="Audit rows" tone="teal" value={String((state?.timeline_events ?? state?.events ?? []).length)} />
            <MetricTile label="Agent outputs" tone="emerald" value={String(state?.agent_outputs.length ?? 0)} />
          </div>
        </Panel>
      </div>
    </div>
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
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <Eyebrow>Onboarding</Eyebrow>
            <h1 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
              Create a client operation seed
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">
              Create or update the Northstar Client Implementation Launch sample without mixing intake, account selection, or run review.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge icon={UserPlus} label="Synthetic sample only" tone="sky" />
              <StatusBadge icon={Workflow} label={activeWorkflow ? "Operation selected" : "No active operation"} tone={activeWorkflow ? "emerald" : "amber"} />
              <StatusBadge icon={ShieldCheck} label="No patient data / no PHI" tone="teal" />
              <StatusBadge icon={ShieldAlert} label="No secrets in browser" tone="amber" />
            </div>
          </div>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
            disabled={busy}
            onClick={onUseNorthstarSample}
            type="button"
          >
            {busy ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Building2 className="h-4 w-4" aria-hidden="true" />
            )}
            Load Northstar sample
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Invoice" tone="emerald" value={`$${draft.invoiceAmountUsd || "0"}`} />
          <MetricTile label="Spend cap" tone="sky" value={`$${draft.spendCapUsd || "0"}`} />
          <MetricTile label="Margin floor" tone="teal" value={`${draft.marginFloorPercent || "0"}%`} />
          <MetricTile label="Blocked risk vendor" tone="rose" value={draft.blockedVendors || "Unapproved Data Broker Enrichment"} />
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,1fr)]">
        <Panel className="p-5">
          <SectionHeader
            description="This left rail stays focused on the selected sample account and current operating bounds."
            icon={Building2}
            title="Onboarding summary"
          />
          <div className="mt-4 space-y-4">
            <EvidenceCard
              description={draft.jobGoal}
              icon={Workflow}
              title={draft.clientName || "Account name pending"}
              tone="emerald"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricTile label="Business type" tone="slate" value={draft.businessType || "Pending"} />
              <MetricTile label="Implementation/template" tone="slate" value={draft.jobName || "Pending"} />
              <MetricTile label="Approved setup vendors" tone="sky" value={draft.approvedVendors || "Pending"} />
              <MetricTile label="Blocked risk vendors" tone="rose" value={draft.blockedVendors || "Pending"} />
            </div>
            {activeWorkflow ? (
              <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-4">
                <p className="text-xs font-semibold uppercase text-emerald-100">Current selected operation</p>
                <p className="mt-2 text-base font-semibold text-white">{activeWorkflow.client_name}</p>
                <p className="mt-1 text-sm text-zinc-200">{activeWorkflow.job_name}</p>
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            description="Saving updates SQLite and selects the client operation for the next run."
            icon={UserPlus}
            title="Operation intake form"
          />

          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Client/account name"
                onChange={(value) => onDraftChange({ ...draft, clientName: value })}
                value={draft.clientName}
              />
              <FieldInput
                label="Business type"
                onChange={(value) => onDraftChange({ ...draft, businessType: value })}
                value={draft.businessType}
              />
              <FieldInput
                label="Implementation/template name"
                onChange={(value) => onDraftChange({ ...draft, jobName: value })}
                value={draft.jobName}
              />
              <FieldInput
                label="Invoice amount"
                onChange={(value) => onDraftChange({ ...draft, invoiceAmountUsd: value })}
                type="number"
                value={draft.invoiceAmountUsd}
              />
              <FieldInput
                label="Spend cap"
                onChange={(value) => onDraftChange({ ...draft, spendCapUsd: value })}
                type="number"
                value={draft.spendCapUsd}
              />
              <FieldInput
                label="Margin floor"
                onChange={(value) => onDraftChange({ ...draft, marginFloorPercent: value })}
                type="number"
                value={draft.marginFloorPercent}
              />
            </div>

            <TextAreaField
              label="Operation goal"
              onChange={(value) => onDraftChange({ ...draft, jobGoal: value })}
              value={draft.jobGoal}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Approved setup vendors"
                onChange={(value) => onDraftChange({ ...draft, approvedVendors: value })}
                value={draft.approvedVendors}
              />
              <FieldInput
                label="Blocked risk vendors"
                onChange={(value) => onDraftChange({ ...draft, blockedVendors: value })}
                value={draft.blockedVendors}
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
              disabled={busy}
              type="submit"
            >
              {busy ? (
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              )}
              Save and select operation
            </button>
          </form>
        </Panel>
      </div>
    </div>
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
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <Eyebrow>Customers</Eyebrow>
            <h1 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
              Saved client operations
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">
              Accounts focuses on saved client operation selection and lifecycle management. New intake happens in Onboarding, and the dashboard remains the landing surface.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge icon={Users} label={`${workflows.length} saved operations`} tone="slate" />
              <StatusBadge
                icon={Workflow}
                label={activeWorkflow ? "Operation selected" : "No active operation"}
                tone={activeWorkflow ? "emerald" : "amber"}
              />
            </div>
          </div>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
            onClick={() => onNavigate("onboarding")}
            type="button"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Open onboarding
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Active account" tone={activeWorkflow ? "emerald" : "amber"} value={activeWorkflow?.client_name ?? "None selected"} />
          <MetricTile label="Invoice" tone="emerald" value={activeWorkflow ? formatCurrency(activeWorkflow.invoice_amount_cents) : "Pending"} />
          <MetricTile label="Spend cap" tone="sky" value={activeWorkflow ? formatCurrency(activeWorkflow.spend_cap_cents) : "Pending"} />
          <MetricTile label="Margin floor" tone="teal" value={activeWorkflow ? formatPercent(activeWorkflow.margin_floor_percent) : "Pending"} />
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Panel className="p-5">
          <SectionHeader
            description="Select the next run seed or delete obsolete local samples."
            icon={Users}
            title="Saved operations"
          />

          <div className="mt-5 space-y-3">
            {workflows.length === 0 ? (
              <EmptyState>No saved local operations yet. Open Onboarding to create the Northstar sample.</EmptyState>
            ) : (
              workflows.map((workflow) => (
                <article
                  className={`rounded-lg border p-4 transition ${
                    workflow.is_active
                      ? "border-emerald-300/40 bg-emerald-300/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                  key={workflow.id}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{workflow.client_name}</h3>
                        {workflow.is_active ? (
                          <StatusBadge icon={CheckCircle2} label="Active" tone="emerald" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-300">{workflow.job_name}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricTile label="Invoice" tone="emerald" value={formatCurrency(workflow.invoice_amount_cents)} />
                        <MetricTile label="Cap" tone="sky" value={formatCurrency(workflow.spend_cap_cents)} />
                        <MetricTile label="Floor" tone="teal" value={formatPercent(workflow.margin_floor_percent)} />
                        <MetricTile label="Updated" tone="slate" value={formatDateTime(workflow.updated_at)} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-zinc-500"
                        disabled={busy || workflow.is_active}
                        onClick={() => onSelectWorkflow(workflow.id)}
                        type="button"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        {workflow.is_active ? "Selected" : "Select"}
                      </button>
                      <button
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-rose-300/25 bg-rose-300/10 px-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:text-zinc-500"
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
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            description="Selected account proof for the next run."
            icon={Building2}
            title="Active account"
          />
          {activeWorkflow ? (
            <div className="mt-4 space-y-4">
              <EvidenceCard
                description={activeWorkflow.job_goal}
                icon={Workflow}
                title={activeWorkflow.client_name}
                tone="emerald"
              />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <MetricTile label="Business type" tone="slate" value={activeWorkflow.business_type} />
                <MetricTile label="Template" tone="slate" value={activeWorkflow.job_name} />
                <MetricTile label="Operation ID" tone="slate" value={activeWorkflow.id} />
                <MetricTile label="Updated" tone="slate" value={formatDateTime(activeWorkflow.updated_at)} />
              </div>
              <InlineList items={activeWorkflow.approved_vendors} title="Approved setup vendors" tone="sky" />
              <InlineList items={activeWorkflow.blocked_vendors} title="Blocked risk vendors" tone="rose" />
            </div>
          ) : (
            <EmptyState className="mt-4">
              No account is selected. Open Onboarding or choose a saved operation from the left.
            </EmptyState>
          )}
        </Panel>
      </div>
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
  const selectedRun = state?.job ?? null;

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Eyebrow>Runs</Eyebrow>
            <h1 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
              Persisted run history
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">
              Review historical proof without leaving the product shell. The selected run should make economics, orchestration steps, and final profit outcome status immediately obvious.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[26rem]">
            <MetricTile label="Runs" tone="slate" value={String(runs.length)} />
            <MetricTile label="Selected run" tone="emerald" value={selectedRunId ? "Loaded" : "None"} />
            <MetricTile label="Margin" tone="teal" value={formatOptionalPercent(money.marginPercent)} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel className="p-5">
          <SectionHeader
            description="Every client operation run remains inspectable after completion."
            icon={ClipboardList}
            title="Run list"
          />
          <div className="mt-4 space-y-3">
            {runs.length === 0 ? (
              <EmptyState>Run history appears after a client operation run starts.</EmptyState>
            ) : (
              runs.map((run) => (
                <button
                  className={`block w-full rounded-lg border p-4 text-left transition ${
                    run.id === selectedRunId
                      ? "border-emerald-300/35 bg-emerald-300/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                  key={run.id}
                  onClick={() => onInspectRun(run.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-base font-semibold text-white">{run.client_name}</p>
                      <p className="mt-1 text-sm text-zinc-300">{run.job_name}</p>
                    </div>
                    <StatusBadge label={humanize(run.status)} tone={runStatusTone(run.status)} />
                  </div>
                  <div className="mt-3 grid gap-2">
                    <MetricTile label="Run ID" tone="slate" value={run.id} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <MetricTile label="Invoice" tone="emerald" value={formatCurrency(run.invoice_amount_cents)} />
                      <MetricTile label="Started" tone="slate" value={formatDateTime(run.created_at)} />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            <SectionHeader
              description="Current proof surface for the selected run."
              icon={Workflow}
              title="Selected run"
            />
            {selectedRun ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge label={humanize(selectedRun.status)} tone={runStatusTone(selectedRun.status)} />
                  <StatusBadge icon={CircleDollarSign} label={formatCurrency(selectedRun.invoice_amount_cents)} tone="emerald" />
                  <StatusBadge icon={Gauge} label={formatCurrency(selectedRun.spend_cap_cents)} tone="sky" />
                  <StatusBadge icon={TrendingUp} label={formatOptionalPercent(money.marginPercent)} tone="teal" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricTile label="Account" tone="slate" value={selectedRun.client_name} />
                  <MetricTile label="Template" tone="slate" value={selectedRun.job_name} />
                  <MetricTile label="Operation ID" tone="slate" value={selectedRun.workflow_id ?? "Detached"} />
                  <MetricTile label="Updated" tone="slate" value={formatDateTime(selectedRun.updated_at)} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <MetricTile label="Revenue" tone="emerald" value={formatOptionalCurrency(money.revenueCents)} />
                  <MetricTile label="Approved setup spend" tone="sky" value={formatOptionalCurrency(money.approvedSpendCents)} />
                  <MetricTile label="Blocked risk" tone="rose" value={formatOptionalCurrency(money.blockedSpendCents)} />
                  <MetricTile label="Protected profit" tone="teal" value={formatOptionalCurrency(money.grossProfitCents)} />
                  <MetricTile label="Margin" tone="amber" value={formatOptionalPercent(money.marginPercent)} />
                </div>
              </>
            ) : (
              <EmptyState>Select a run from the left to load its proof summary.</EmptyState>
            )}
          </Panel>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <Panel className="p-5">
              <ExecutionFeed calls={calls} />
            </Panel>
            <Panel className="p-5">
              <SectionHeader
                description="The protected-profit proof remains loaded with the selected run."
                icon={FileText}
                title="Profit outcome"
              />
              {reports.length > 0 ? (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <MetricTile label="Revenue" tone="emerald" value={formatOptionalCurrency(money.revenueCents)} />
                    <MetricTile label="Protected profit" tone="teal" value={formatOptionalCurrency(money.grossProfitCents)} />
                  </div>
                  <MarkdownPreview markdown={reports[reports.length - 1].report_markdown} />
                </div>
              ) : (
                <EmptyState>Final report proof appears after the run completes.</EmptyState>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
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
  const stripeEvents = state?.stripe_events ?? [];
  const databasePath = state?.database.path ?? health?.database_path ?? null;

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Eyebrow>Audit</Eyebrow>
            <h1 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
              SQLite evidence trail
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">
              Timeline, orchestration calls, ledger movement, Stripe records, and policy decisions stay organized here instead of crowding the Function Studio.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[28rem]">
            <MetricTile label="Audit rows" tone="teal" value={String(auditRows)} />
            <MetricTile label="Calls" tone="emerald" value={String(calls.length)} />
            <MetricTile label="Policy checks" tone="amber" value={String(checks.length)} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricTile label="Ledger rows" tone="sky" value={String(entries.length)} />
          <MetricTile label="Timeline events" tone="slate" value={String(events.length)} />
          <MetricTile label="Stripe events" tone="sky" value={String(stripeEvents.length)} />
          <MetricTile label="Reports" tone="emerald" value={String(state?.reports.length ?? 0)} />
          <MetricTile label="Database" tone="slate" value={databasePath ?? "Path pending"} />
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel className="p-5">
          <TimelinePanel events={events} />
        </Panel>
        <Panel className="p-5">
          <ExecutionFeed calls={calls} />
        </Panel>
        <Panel className="p-5">
          <LedgerPanel
            auditRows={auditRows}
            databasePath={databasePath}
            entries={entries}
            totals={totals}
          />
        </Panel>
        <div className="space-y-5">
          <Panel className="p-5">
            <StripeEvidence summary={state?.stripe ?? null} events={stripeEvents} />
          </Panel>
          <Panel className="p-5">
            <PolicyEvidence checks={checks} summary={summary} />
          </Panel>
        </div>
      </div>
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
  const hermes = state?.hermes ?? null;
  const stripe = state?.stripe ?? null;

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Eyebrow>Integrations</Eyebrow>
            <h1 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
              Runtime proof surfaces
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">
              Hermes, Stripe test mode, SQLite, and the local policy layer stay visible here as product evidence, with Goal 8 still clearly marked as future work.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              icon={BrainCircuit}
              label={hermes?.used_real_hermes ? "Real isolated Hermes" : "Hermes pending or test"}
              tone={hermes?.used_real_hermes ? "emerald" : hermes?.error ? "rose" : "amber"}
            />
            <StatusBadge
              icon={CreditCard}
              label={stripe?.used_real_stripe ? "Real Stripe test mode" : humanize(stripe?.stripe_mode ?? "pending")}
              tone={stripe?.used_real_stripe ? "sky" : stripe?.error ? "rose" : "amber"}
            />
            <StatusBadge icon={ShieldAlert} label="NeMo not wired yet" tone="violet" />
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel className="p-5">
          <SectionHeader
            description="Direct proof from the running Hermes integration surface."
            icon={BrainCircuit}
            title="Hermes"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MetricTile label="used_real_hermes" tone={hermes?.used_real_hermes ? "emerald" : "amber"} value={String(Boolean(hermes?.used_real_hermes))} />
            <MetricTile label="Provider" tone="slate" value={hermes?.provider ?? "Pending"} />
            <MetricTile label="Model" tone="slate" value={hermes?.model ?? "Pending"} />
            <MetricTile label="Skill" tone="violet" value={hermes?.skill_name ?? "Pending"} />
            <MetricTile label="Toolsets" tone="slate" value={hermes?.toolsets_used?.join(", ") || "Pending"} />
            <MetricTile label="Safety summary" tone="slate" value={hermes?.command_safety_summary ?? "Pending"} />
          </div>
          {hermes?.error || hermes?.failure_reason ? (
            <div className="mt-4 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">
              <p className="font-semibold">Hermes integration error</p>
              <p className="mt-1">{hermes.failure_reason ?? hermes.error}</p>
            </div>
          ) : null}
        </Panel>

        <Panel className="p-5">
          <StripeEvidence summary={stripe} events={state?.stripe_events ?? []} />
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            description="Current persisted state behind the product shell."
            icon={Database}
            title="SQLite and records"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricTile label="Database path" tone="slate" value={state?.database.path ?? health?.database_path ?? "Pending"} />
            <MetricTile label="Audit rows" tone="teal" value={String(auditRows)} />
            <MetricTile label="Persisted runs" tone="sky" value={String(state?.runs.length ?? 0)} />
            <MetricTile label="Operations" tone="slate" value={String(state?.workflows.length ?? 0)} />
            <MetricTile label="Selected run" tone="emerald" value={state?.selected_run_id ?? "None"} />
            <MetricTile label="API mode" tone="slate" value={health?.mode ?? state?.mode ?? "local"} />
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            description="Current safety layer facts and future integration boundary."
            icon={ShieldCheck}
            title="Policy and NeMo Guardrails"
          />
          <div className="mt-4 space-y-3">
            <EvidenceCard
              description="Local policy engine enforces payment-before-spend, vendor allow/block lists, spend cap, and margin floor."
              icon={ShieldCheck}
              title="Local guardrails active"
              tone="emerald"
            />
            <EvidenceCard
              description="Goal 8 remains the NVIDIA NeMo Guardrails or NeMo-compatible safety-adapter milestone. This view does not claim it is wired yet."
              icon={ShieldAlert}
              title="Goal 8 planned"
              tone="violet"
            />
          </div>
        </Panel>
      </div>
    </div>
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
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Eyebrow>Settings</Eyebrow>
            <h1 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
              Local operator boundaries
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">
              Prototype auth, runtime status, selected operation/run references, and hard safety boundaries remain visible here without exposing secrets or pretending this is production identity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              icon={LockKeyhole}
              label={auth?.authenticated ? `Signed in as ${auth.username ?? "operator"}` : auth?.auth_enabled ? "Auth enabled" : "Auth disabled"}
              tone={auth?.authenticated ? "emerald" : auth?.auth_enabled ? "amber" : "slate"}
            />
            <StatusBadge
              icon={Activity}
              label={health?.status ?? "Pending"}
              tone={health?.status === "ok" ? "emerald" : "amber"}
            />
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <Panel className="p-5">
          <SectionHeader
            description="Current local runtime and selected product record state."
            icon={Settings}
            title="Runtime"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="Prototype auth" tone={auth?.authenticated ? "emerald" : auth?.auth_enabled ? "amber" : "slate"} value={auth?.auth_enabled ? auth?.authenticated ? "Signed in" : "Enabled" : "Disabled"} />
            <MetricTile label="API mode" tone="slate" value={health?.mode ?? state?.mode ?? "local"} />
            <MetricTile label="Operation" tone={state?.workflow ? "teal" : "amber"} value={state?.workflow?.client_name ?? "None selected"} />
            <MetricTile label="Selected run" tone={state?.selected_run_id ? "emerald" : "slate"} value={state?.selected_run_id ?? "None"} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <EvidenceCard
              description={auth?.auth_enabled ? "Signed HTTP-only local session cookie. This is prototype auth, not enterprise identity." : "Prototype auth disabled for this local run."}
              icon={LockKeyhole}
              title="Auth model"
              tone={auth?.authenticated ? "emerald" : auth?.auth_enabled ? "amber" : "slate"}
            />
            <EvidenceCard
              description={`${health?.status ?? "Pending"} API; database ${health?.database_exists ? "exists" : "pending"}; ${auditRows} audit rows in current proof state.`}
              icon={Database}
              title="Local runtime"
              tone={health?.database_exists ? "teal" : "amber"}
            />
            <EvidenceCard
              description={state?.workflow ? state.workflow.job_name : "Create or select a client operation before starting a run."}
              icon={Workflow}
              title="Active operation"
              tone={state?.workflow ? "teal" : "amber"}
            />
            <EvidenceCard
              description={`${state?.runs.length ?? 0} persisted runs; ${state?.workflows.length ?? 0} saved operations; SQLite path ${state?.database.path ?? health?.database_path ?? "pending"}.`}
              icon={ClipboardList}
              title="Stored records"
              tone="slate"
            />
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            description="These boundaries are visible because they are product claims, not internal notes."
            icon={ShieldAlert}
            title="Safety boundaries"
          />
          <div className="mt-4 space-y-3">
            <EvidenceCard
              description="Goal 7 uses Stripe test mode only. Live-money execution is deferred to a future Verified Live Mode milestone."
              icon={CreditCard}
              title="No live money"
              tone="rose"
            />
            <EvidenceCard
              description="Hosted judge mode must not expose secrets. Local full-proof mode may use ignored `.env` values."
              icon={LockKeyhole}
              title="No secrets in browser"
              tone="amber"
            />
            <EvidenceCard
              description="NeMo Guardrails remains Goal 8 planned. This settings view does not claim a real NeMo or NemoClaw integration."
              icon={ShieldAlert}
              title="NeMo not wired yet"
              tone="violet"
            />
            <EvidenceCard
              description="Synthetic Northstar Dental Group account only for B2B implementation operations. No patient data, no PHI, and no healthcare compliance claim."
              icon={Building2}
              title="Sample-only data"
              tone="sky"
            />
          </div>
        </Panel>
      </div>
    </div>
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
        <Icon className="h-5 w-5 text-zinc-200" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <p className="text-sm font-semibold uppercase text-emerald-200">{children}</p>;
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-white/10 bg-white/[0.04] shadow-2xl shadow-zinc-950/20 ${className}`}>
      {children}
    </section>
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
    <div className={`rounded-lg border p-3 ${darkToneClass(tone)}`}>
      <p className="text-[0.68rem] font-semibold uppercase">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function EvidenceCard({
  description,
  icon: Icon,
  title,
  tone,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
  tone: Tone;
}) {
  return (
    <article className={`rounded-lg border p-3 ${darkToneClass(tone)}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs leading-5">{description}</p>
        </div>
      </div>
    </article>
  );
}

function InlineList({
  items,
  title,
  tone,
}: {
  items: string[];
  title: string;
  tone: Tone;
}) {
  return (
    <div className={`rounded-lg border p-3 ${darkToneClass(tone)}`}>
      <p className="text-xs font-semibold uppercase">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-zinc-300">None configured</span>
        ) : (
          items.map((item) => (
            <span
              className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold text-white"
              key={item}
            >
              {item}
            </span>
          ))
        )}
      </div>
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
    <label className="block text-sm font-semibold text-zinc-200">
      {label}
      <input
        className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-zinc-950/60 px-3 text-sm text-white outline-none transition focus:border-emerald-400"
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
    <label className="block text-sm font-semibold text-zinc-200">
      {label}
      <textarea
        className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400"
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
    <div className={`rounded-lg border border-dashed border-white/15 bg-zinc-950/30 p-4 text-sm text-zinc-400 ${className}`}>
      {children}
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
                className={`rounded-lg border p-3 ${
                  failed ? "border-rose-300/25 bg-rose-300/10" : "border-white/10 bg-white/[0.03]"
                }`}
                key={call.id}
              >
                <div className="grid gap-3 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
                  <p className="font-mono text-sm font-semibold text-zinc-500">#{call.sequence}</p>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-white">{call.tool_name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatDateTime(call.created_at)}</p>
                    {call.error ? (
                      <p className="mt-2 text-xs leading-5 text-rose-200">{call.error}</p>
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
              <li className="rounded-lg border border-white/10 bg-white/[0.03] p-3" key={event.id}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-200">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{event.title}</p>
                        <p className="mt-1 text-xs font-semibold uppercase text-zinc-500">
                          {humanize(event.type)}
                        </p>
                      </div>
                      <StatusBadge label={humanize(event.status)} tone={runStatusTone(event.status)} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{event.detail}</p>
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
        <StatusBadge label={databasePath ?? "Ledger path pending"} tone="slate" />
      </div>

      {entries.length === 0 ? (
        <EmptyState className="mt-4">Ledger entries appear after revenue and approved spend are recorded.</EmptyState>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Label</th>
                <th className="px-3 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-transparent">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-3">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-zinc-200">
                      {humanize(entry.entry_type)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-white">{entry.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {entry.source} · {formatDateTime(entry.created_at)}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-white">
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
              ? "Test-double Stripe proof is labeled for tests or diagnostics."
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
                : humanize(summary?.stripe_mode ?? "pending")
          }
          tone={failed ? "rose" : summary?.used_real_stripe ? "emerald" : "amber"}
        />
        <StatusBadge
          label={`livemode=${summary?.livemode === null || summary?.livemode === undefined ? "pending" : String(summary.livemode)}`}
          tone={summary?.livemode === false ? "sky" : "amber"}
        />
      </div>

      {failed ? (
        <div className="mt-4 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">
          <p className="font-semibold">Stripe integration error</p>
          <p className="mt-1">{summary?.error}</p>
        </div>
      ) : null}

      {invoiceOpenUnpaid ? (
        <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
          Stripe test invoice finalized and open. It is not marked paid.
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricTile label="used_real_stripe" tone={summary?.used_real_stripe ? "emerald" : "amber"} value={String(Boolean(summary?.used_real_stripe))} />
        <MetricTile label="Customer ID" tone="slate" value={summary?.customer_id ?? "Pending"} />
        <MetricTile label="Invoice ID" tone="slate" value={summary?.invoice_id ?? "Pending"} />
        <MetricTile label="Invoice status" tone="amber" value={summary?.invoice_status ?? "Pending"} />
        <MetricTile label="Paid" tone={summary?.paid ? "emerald" : "amber"} value={summary?.paid === null || summary?.paid === undefined ? "Pending" : String(summary.paid)} />
        <MetricTile label="Hosted URL" tone="slate" value={summary?.hosted_invoice_url ? "Available" : "Pending"} />
      </div>

      {summary?.hosted_invoice_url ? (
        <a
          className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-sky-300/30 bg-sky-300/10 p-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/15"
          href={summary.hosted_invoice_url}
          rel="noreferrer"
          target="_blank"
        >
          <span className="min-w-0">
            <span className="block text-xs uppercase text-sky-200">Hosted invoice URL</span>
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
  summary,
}: {
  checks: PolicyCheck[];
  summary: PolicySummary | null;
}) {
  const approvedChecks = checks.filter(isApproved);
  const blockedChecks = checks.filter((check) => !isApproved(check));

  return (
    <div>
      <SectionHeader
        description="Local policy decisions persisted for the selected run."
        icon={ShieldCheck}
        title="Policy checks"
      />
      {summary ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <MetricTile label="Spend cap" tone="sky" value={formatCurrency(summary.max_job_spend_usd * 100)} />
          <MetricTile label="Margin floor" tone="teal" value={formatPercent(summary.margin_floor_percent)} />
          <MetricTile label="Payment before spend" tone="amber" value={summary.require_payment_before_spend ? "Required" : "Not required"} />
          <MetricTile label="Vendor list" tone="emerald" value={`${summary.approved_vendors.length} allowed / ${summary.blocked_vendors.length} blocked`} />
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {checks.length === 0 ? (
          <EmptyState>Spend decisions appear after the run executes.</EmptyState>
        ) : (
          checks.map((check) => {
            const approved = isApproved(check);
            return (
              <article
                className={`rounded-lg border p-3 ${
                  approved ? "border-emerald-300/25 bg-emerald-300/10" : "border-rose-300/25 bg-rose-300/10"
                }`}
                key={check.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{check.vendor}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-zinc-400">
                      {approved ? "Approved vendor spend" : "Blocked unsafe spend"}
                    </p>
                  </div>
                  <StatusBadge label={formatCurrency(check.requested_amount_cents)} tone={approved ? "emerald" : "rose"} />
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-200">{check.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge label={`Margin after ${formatPercent(check.margin_after_spend_percent)}`} tone="teal" />
                  <StatusBadge label={`Action ${check.required_action}`} tone="slate" />
                  <StatusBadge label={formatDateTime(check.created_at)} tone="slate" />
                </div>
              </article>
            );
          })
        )}
      </div>

      {summary ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-zinc-950/40 p-3 text-xs leading-5 text-zinc-400">
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
    <div className="space-y-2 text-sm leading-6 text-zinc-300">
      {markdown
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          if (line.startsWith("# ")) {
            return (
              <h3 className="text-sm font-semibold text-white" key={`${line}-${index}`}>
                {line.replace("# ", "")}
              </h3>
            );
          }

          if (line.startsWith("- ")) {
            return (
              <p className="pl-4 text-zinc-300" key={`${line}-${index}`}>
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
