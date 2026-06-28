import { useState, type FormEvent, type ReactNode } from "react";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusBadge } from "../../components/ui/StatusBadge";
import { darkToneClass, softToneClass } from "../../components/ui/statusStyles";
import type { Tone } from "../../components/ui/statusStyles";
import {
  EmptyWorkspaceState,
  OutcomeRail,
  PlainTable,
  ProofRoute,
  TemplateShelf,
  WorkspacePage,
  WorkspaceSection,
  type RailItem,
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
  CommandCenterClientRecord,
  CommandCenterEmployeeRecord,
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
  onRun,
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
  onRun: () => void;
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
            onRun={onRun}
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
  onRun,
  runStatus,
  state,
}: {
  busyAction: BusyAction;
  money: MoneySnapshot;
  onNavigate: (view: AppView) => void;
  onRun: () => void;
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
  const guardrailLabel = state?.execution.guardrail_label ?? "Local policy active";
  const guardrailTone: Tone = state?.guardrails.fail_closed
    ? "rose"
    : state?.guardrails.used_real_nemo
      ? "emerald"
      : state?.guardrails.mode === "nemo_compatible"
        ? "amber"
        : "teal";
  const plannedTemplates = [
    "Invoice-to-Cash",
    "Vendor Spend Approval",
    "Client Onboarding",
    "Research-to-Report",
    "Ops Handoff",
    "Renewal Recommendation",
  ];
  const commandCenter = state?.command_center ?? null;
  const fallbackClientRecord: CommandCenterClientRecord = {
    client_name: clientName,
    business_type: businessType,
    primary_contact: "Demo operations lead",
    contact_email: null,
    contact_phone: null,
    job_name: operationName,
    job_goal: latestRun?.job_goal ?? activeWorkflow?.job_goal ?? "Launch the client implementation package with governed spend and evidence.",
    invoice_amount_cents: revenueCents,
    spend_cap_cents: spendCapCents,
    margin_floor_percent: latestRun?.margin_floor_percent ?? activeWorkflow?.margin_floor_percent ?? 50,
    service_notes: "Synthetic B2B operation. No patient data, PHI, addresses, or real client records.",
    source: "manual_entry",
    status: "saved_editable",
  };
  const savedClient = commandCenter?.client_onboarding.saved_record ?? fallbackClientRecord;
  const baseEmployees = commandCenter?.labor_costing.employees ?? demoEmployeeRecords();
  const [clientMode, setClientMode] = useState<"manual" | "upload" | "review">("manual");
  const [clientDraft, setClientDraft] = useState<CommandCenterClientRecord | null>(null);
  const [clientOverride, setClientOverride] = useState<CommandCenterClientRecord | null>(null);
  const [clientIntakeStatus, setClientIntakeStatus] = useState("Manual entry ready. Extracted data requires review before save.");
  const [employeeMode, setEmployeeMode] = useState<"manual" | "upload" | "review">("manual");
  const [employeeDrafts, setEmployeeDrafts] = useState<CommandCenterEmployeeRecord[] | null>(null);
  const [employeeOverride, setEmployeeOverride] = useState<CommandCenterEmployeeRecord[] | null>(null);
  const [employeeIntakeStatus, setEmployeeIntakeStatus] = useState("Manual workforce entry ready. Demo employees are job-costing assumptions only.");
  const currentClient = clientDraft ?? clientOverride ?? savedClient;
  const currentEmployees = (employeeDrafts ?? employeeOverride ?? baseEmployees).map(calculateLoadedEmployee);
  const totalLaborCostCents = currentEmployees.reduce((sum, employee) => sum + employee.labor_cost_cents, 0);
  const commandRevenueCents = currentClient.invoice_amount_cents || revenueCents;
  const commandApprovedSpendCents = money.approvedSpendCents ?? commandCenter?.mission_control.approved_vendor_spend_cents ?? approvedSpendCents;
  const commandBlockedSpendCents = money.blockedSpendCents ?? commandCenter?.mission_control.blocked_spend_cents ?? blockedSpendCents;
  const profitAfterLaborCents = commandRevenueCents - commandApprovedSpendCents - totalLaborCostCents;
  const marginAfterLaborPercent = commandRevenueCents > 0 ? (profitAfterLaborCents / commandRevenueCents) * 100 : 0;
  const marginFloorPercent = currentClient.margin_floor_percent || 50;
  const marginNeedsReview = marginAfterLaborPercent < marginFloorPercent;
  const runtimeRoute = commandCenter?.runtime_route ?? null;
  const commandAuditEvents = commandCenter?.audit_events ?? [];
  const commandSafetyProof = commandCenter?.safety_proof ?? [
    "fake/demo clients only",
    "fake/demo employees only",
    "no live money",
    "uploaded data requires review",
  ];
  const clientReview = commandCenter?.client_onboarding.extracted_review;
  const employeeReview = commandCenter?.employee_onboarding.extracted_review;
  const documentStates = commandCenter?.document_intake.states ?? [];
  const updateClientDraft = (patch: Partial<CommandCenterClientRecord>) => {
    setClientDraft({ ...currentClient, ...patch });
  };
  const updateEmployeeDraft = (index: number, patch: Partial<CommandCenterEmployeeRecord>) => {
    const sourceRows = currentEmployees.length > 0 ? currentEmployees : demoEmployeeRecords();
    setEmployeeDrafts(
      sourceRows.map((employee, employeeIndex) => (
        employeeIndex === index ? calculateLoadedEmployee({ ...employee, ...patch }) : employee
      )),
    );
  };
  const handleClientFile = (fileName: string) => {
    const extension = fileExtension(fileName);
    if (!isAcceptedIntakeFile(extension)) {
      setClientMode("upload");
      setClientIntakeStatus(`Unsupported file type .${extension || "unknown"}. Use PDF, Excel, Word, or CSV.`);
      return;
    }
    setClientDraft({
      ...currentClient,
      client_name: "Northstar Dental Group",
      business_type: "Multi-location healthcare services group",
      primary_contact: "Demo operations lead",
      contact_email: null,
      contact_phone: null,
      job_name: "Client Implementation Launch",
      job_goal: "Create a governed implementation launch with finance proof, labor costing, and blocked-risk evidence.",
      invoice_amount_cents: 850_000,
      spend_cap_cents: 115_000,
      margin_floor_percent: 50,
      service_notes: "Northstar demo extraction fixture. Review before save. No patient data, PHI, addresses, SSNs, tax IDs, or real client records.",
      source: "file_extraction_fixture",
      status: "review_required",
    });
    setClientMode("review");
    setClientIntakeStatus(`${extension.toUpperCase()} client intake extracted with demo fixtures. Review and edit before save.`);
  };
  const handleEmployeeFile = (fileName: string) => {
    const extension = fileExtension(fileName);
    if (!isAcceptedIntakeFile(extension)) {
      setEmployeeMode("upload");
      setEmployeeIntakeStatus(`Unsupported file type .${extension || "unknown"}. Use PDF, Excel, Word, or CSV.`);
      return;
    }
    setEmployeeDrafts(demoEmployeeRecords().map((employee) => ({ ...employee, source: "file_extraction_fixture", status: "review_required" })));
    setEmployeeMode("review");
    setEmployeeIntakeStatus(`${extension.toUpperCase()} workforce intake extracted with demo fixtures. Review and edit before save.`);
  };
  const commandOutcomeItems: RailItem[] = [
    { label: "Revenue secured", value: formatCurrency(commandRevenueCents), tone: "emerald" },
    { label: "Approved setup spend", value: formatCurrency(commandApprovedSpendCents), tone: "sky" },
    { label: "Blocked risk", value: formatCurrency(commandBlockedSpendCents), tone: "rose" },
    { label: "Labor cost", value: formatCurrency(totalLaborCostCents), tone: "violet" },
    { label: "Protected profit", value: formatCurrency(profitAfterLaborCents), tone: marginNeedsReview ? "rose" : "teal" },
    { label: "Protected margin", value: formatPercent(marginAfterLaborPercent), tone: marginNeedsReview ? "rose" : "amber" },
  ];
  const controlStackItems = [
    {
      icon: BrainCircuit,
      name: "Hermes",
      role: "Planner / Operator Brain",
      description: "Creates the client implementation plan and proposes next actions.",
      result: state?.hermes.used_real_hermes ? "Runtime proof recorded" : "Deterministic plan proof",
      tone: "violet" as Tone,
    },
    {
      icon: CreditCard,
      name: "Stripe",
      role: "Finance Proof",
      description: "Provides test-mode invoice/payment proof and keeps the run financially grounded.",
      result: state?.stripe.used_real_stripe ? "Real Stripe test proof" : "Sandbox finance proof",
      tone: "sky" as Tone,
    },
    {
      icon: ShieldCheck,
      name: "NeMo / Local Policy",
      role: "Guardrail Runtime",
      description: "Checks risky actions before execution and blocks unsafe behavior.",
      result: guardrailLabel,
      tone: guardrailTone,
    },
    {
      icon: Database,
      name: "ScaleX",
      role: "Enterprise Control Plane",
      description: "Executes only what is allowed, records evidence, blocks risk, and reports protected profit.",
      result: `${commandAuditEvents.length || auditRowsFromState(state)} proof events`,
      tone: "teal" as Tone,
    },
  ];
  const governedRails = governedRailItems({
    approvedSpendCents: commandApprovedSpendCents,
    blockedSpendCents: commandBlockedSpendCents,
    guardrailLabel,
    hasRun: Boolean(state?.job),
    hasReport: Boolean(latestReport),
    laborCostCents: totalLaborCostCents,
    marginPercent: marginAfterLaborPercent,
    profitCents: profitAfterLaborCents,
    revenueCents: commandRevenueCents,
    stripeLabel: state?.execution.finance_label ?? "Stripe sandbox proof",
  });
  const evidenceRows = enterpriseEvidenceRows({
    approvedSpendCents: commandApprovedSpendCents,
    blockedSpendCents: commandBlockedSpendCents,
    guardrailLabel,
    laborCostCents: totalLaborCostCents,
    profitCents: profitAfterLaborCents,
    state,
  });
  const comparisonRows = [
    {
      normal: "Trigger -> action",
      scalex: "Revenue-backed operation -> governed run",
    },
    {
      normal: "Tool-focused",
      scalex: "Outcome-focused execution",
    },
    {
      normal: "Little business context",
      scalex: "Client, money, margin, risk, and evidence in one control plane",
    },
    {
      normal: "Actions can fire blindly",
      scalex: "Guardrails run before action and unsafe spend is blocked",
    },
    {
      normal: "Hard to audit deeply",
      scalex: "Evidence ledger records proof, safety notes, and protected profit",
    },
    {
      normal: "Not finance-aware",
      scalex: "Stripe proof, protected profit, Hermes planning, and NeMo policy boundary",
    },
  ];

  return (
    <div className="mx-auto max-w-[94rem] space-y-8 text-zinc-950">
      <CinematicControlRoomHero
        actions={
          <>
            <PrimaryButton
              disabled={busyAction === "run"}
              icon={busyAction === "run" ? RefreshCw : Play}
              label={busyAction === "run" ? "Running governed run..." : "Start Governed Run"}
              onClick={activeWorkflow ? onRun : () => onNavigate("onboarding")}
            />
            <SecondaryButton icon={BookOpenCheck} label="Review Evidence Ledger" onClick={() => onNavigate("audit")} />
          </>
        }
        businessType={businessType}
        clientName={clientName}
        guardrailTone={guardrailTone}
        metrics={commandOutcomeItems}
        operationName={operationName}
        runStatus={runStatus}
      />

      <WorkspaceSection
        description="Enterprise teams want AI agents to help run client operations, but raw agents cannot be trusted with money, vendors, client workflows, or internal systems without controls."
        title="Enterprise Pain -> ScaleX Control"
      >
        <EnterpriseControlNarrative />
      </WorkspaceSection>

      <WorkspaceSection
        description="The control stack makes the agent boundary explicit before execution."
        title="Control Stack"
      >
        <ControlStackFlow items={controlStackItems} />
      </WorkspaceSection>

      <WorkspaceSection
        description="The run is not a generic task list. Each governed rail states the actor, decision, evidence, and proof boundary before the operation moves forward."
        title="Governed Run Stage"
      >
        <GovernedRailGrid rails={governedRails} running={busyAction === "run"} />
      </WorkspaceSection>

      <WorkspaceSection
        description="ScaleX is valuable because it does not just execute. It blocks unsafe spend before it reaches the ledger."
        title="Blocked Risk Spotlight"
      >
        <BlockedRiskSpotlight
          amountCents={commandBlockedSpendCents}
          marginPercent={marginAfterLaborPercent}
        />
      </WorkspaceSection>

      <WorkspaceSection
        description="Economic control is central to the governed run, not a side accounting widget."
        title="Economic Control"
      >
        <EconomicControlPanel
          approvedSpendCents={commandApprovedSpendCents}
          blockedSpendCents={commandBlockedSpendCents}
          laborCostCents={totalLaborCostCents}
          marginFloorPercent={marginFloorPercent}
          protectedMarginPercent={marginAfterLaborPercent}
          protectedProfitCents={profitAfterLaborCents}
          revenueCents={commandRevenueCents}
        />
      </WorkspaceSection>

      <WorkspaceSection
        description="Non-secret proof across planning, finance, policy checks, approved spend, blocked risk, labor costing, paid-state honesty, mode safety, and final protected profit."
        title="Evidence Ledger"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <EnterpriseEvidenceTable rows={evidenceRows} />
          </div>
          <div className="rounded-md bg-zinc-950 p-5 text-white shadow-sm">
            <h3 className="font-semibold">Audit safety proof</h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-200">
              {commandSafetyProof.map((proof) => (
                <li className="flex gap-2" key={proof}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-300" aria-hidden="true" />
                  <span>{proof}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="ScaleX is not trigger-action automation. It is a governed run around client context, finance proof, policy, evidence, and margin."
        title="Why This Is Not Zapier"
      >
        <ComparisonPanel rows={comparisonRows} />
      </WorkspaceSection>

      <WorkspaceSection
        description="Final profit after approved setup spend and labor cost."
        title="Profit Report"
      >
        <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <ConnectionFactGrid
            facts={[
              { label: "Client / job", value: `${currentClient.client_name} / ${currentClient.job_name}`, tone: "slate" },
              { label: "Revenue secured", value: formatCurrency(commandRevenueCents), tone: "emerald" },
              { label: "Approved setup spend", value: formatCurrency(commandApprovedSpendCents), tone: "sky" },
              { label: "Blocked risky spend", value: formatCurrency(commandBlockedSpendCents), tone: "rose" },
              { label: "Labor cost breakdown", value: currentEmployees.map((employee) => `${employee.employee_name}: ${formatCurrency(employee.labor_cost_cents)}`).join("; "), tone: "violet" },
              { label: "Protected profit", value: formatCurrency(profitAfterLaborCents), tone: marginNeedsReview ? "rose" : "teal" },
              { label: "Protected margin", value: formatPercent(marginAfterLaborPercent), tone: marginNeedsReview ? "rose" : "amber" },
              { label: "Margin floor", value: formatPercent(marginFloorPercent), tone: "amber" },
              { label: "Recommendation", value: marginNeedsReview ? "Review staffing or scope before more spend." : "Proceed while preserving labor and vendor-spend guardrails.", tone: marginNeedsReview ? "rose" : "emerald" },
            ]}
          />
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Runtime routing is shown as proof, not as a secret-bearing config dump."
        title="Runtime Proof"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="flex flex-wrap items-center gap-2">
              {(runtimeRoute?.route ?? ["ScaleX", "Hermes Adapter", "Deterministic local planner"]).map((step, index) => (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700" key={`${step}-${index}`}>
                  <span className="rounded-md bg-zinc-100 px-2.5 py-1">{step}</span>
                  {index < (runtimeRoute?.route.length ?? 3) - 1 ? <span className="text-zinc-400">-&gt;</span> : null}
                </span>
              ))}
            </div>
            <ConnectionFactGrid
              facts={[
                { label: "Runtime", value: runtimeRoute?.runtime ?? state?.execution.hermes_runtime ?? "isolated_cli", tone: "sky" },
                { label: "Endpoint", value: runtimeRoute?.endpoint ?? "Not selected / local deterministic", tone: runtimeRoute?.endpoint ? "slate" : "amber" },
                { label: "Sandbox", value: runtimeRoute?.sandbox ?? "Not selected", tone: runtimeRoute?.sandbox ? "teal" : "slate" },
                { label: "Model", value: runtimeRoute?.model ?? state?.hermes.model ?? "model not recorded", tone: "slate" },
                { label: "Provider", value: runtimeRoute?.provider ?? state?.hermes.provider ?? "provider not recorded", tone: "slate" },
                { label: "Upstream model", value: runtimeRoute?.upstream_model ?? "Not applicable", tone: "slate" },
                { label: "Status", value: humanize(runtimeRoute?.status ?? state?.execution.hermes_runtime_status ?? "pending"), tone: runtimeRoute?.status === "fail_closed" ? "rose" : runtimeRoute?.used_real_hermes ? "emerald" : "amber" },
                { label: "Duration / error", value: `${runtimeRoute?.duration_ms ?? state?.hermes.duration_ms ?? 0} ms / ${runtimeRoute?.error_class ?? "none"}`, tone: runtimeRoute?.error_class ? "rose" : "teal" },
              ]}
            />
          </div>
          <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h3 className="font-semibold text-zinc-950">Fail-closed proof</h3>
            <div className="mt-4 space-y-2">
              {["unavailable", "timeout", "malformed response", "HTTP failure"].map((stateLabel) => (
                <StatusBadge key={stateLabel} label={stateLabel} tone={runtimeRoute?.status === "fail_closed" ? "rose" : "slate"} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              Runtime evidence records host/path, model, sandbox, provider, status, duration, and error class only. Secrets, tokens, raw credential headers, and `.env` values are not shown.
            </p>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Manual entry and upload intake both require review before values are saved into the local browser demo state."
        title="Business Intake"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="flex flex-wrap gap-2">
              <TabButton active={clientMode === "manual"} label="Manual Entry" onClick={() => setClientMode("manual")} />
              <TabButton active={clientMode === "upload"} label="Upload File" onClick={() => setClientMode("upload")} />
              <TabButton active={clientMode === "review"} label="Extracted Review" onClick={() => setClientMode("review")} />
            </div>
            {clientMode === "upload" ? (
              <IntakeUpload
                description="Accepted: PDF, Excel .xlsx/.xls, Word .docx/.doc, and CSV. Files are not stored."
                onFileName={handleClientFile}
                onSimulateFailure={() => {
                  setClientMode("upload");
                  setClientIntakeStatus("Extraction failed. Manual entry remains available and no values were saved.");
                }}
              />
            ) : (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <FieldInput label="Client name" onChange={(value) => updateClientDraft({ client_name: value })} value={currentClient.client_name} />
                <FieldInput label="Business type" onChange={(value) => updateClientDraft({ business_type: value })} value={currentClient.business_type} />
                <FieldInput label="Primary contact" onChange={(value) => updateClientDraft({ primary_contact: value })} value={currentClient.primary_contact} />
                <FieldInput label="Contact email" onChange={(value) => updateClientDraft({ contact_email: value || null })} value={currentClient.contact_email ?? ""} />
                <FieldInput label="Job/campaign name" onChange={(value) => updateClientDraft({ job_name: value })} value={currentClient.job_name} />
                <FieldInput label="Invoice amount" onChange={(value) => updateClientDraft({ invoice_amount_cents: dollarsToCents(value) })} type="number" value={centsToDollarInput(currentClient.invoice_amount_cents)} />
                <FieldInput label="Spend cap/budget" onChange={(value) => updateClientDraft({ spend_cap_cents: dollarsToCents(value) })} type="number" value={centsToDollarInput(currentClient.spend_cap_cents)} />
                <FieldInput label="Margin floor" onChange={(value) => updateClientDraft({ margin_floor_percent: numberInput(value) })} type="number" value={String(currentClient.margin_floor_percent)} />
                <div className="lg:col-span-2">
                  <TextAreaField label="Service notes" onChange={(value) => updateClientDraft({ service_notes: value })} value={currentClient.service_notes} />
                </div>
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <PrimaryButton
                icon={CheckCircle2}
                label="Save reviewed client"
                onClick={() => {
                  setClientOverride({ ...currentClient, status: "saved_editable" });
                  setClientDraft(null);
                  setClientIntakeStatus("Client record saved to local browser demo state. Saved records remain editable.");
                }}
              />
              <SecondaryButton icon={FileText} label="Edit saved client" onClick={() => setClientDraft({ ...currentClient })} />
              <StatusBadge label={humanize(currentClient.source)} tone={currentClient.source === "file_extraction_fixture" ? "sky" : "teal"} />
            </div>
          </div>
          <ReviewPanel
            facts={[
              { label: "Review status", value: clientReview?.status ?? currentClient.status, tone: clientMode === "upload" ? "amber" : "sky" },
              { label: "File type", value: clientReview?.file_type ?? "manual", tone: "slate" },
              { label: "Missing fields", value: clientReview?.missing_fields.join(", ") || "None", tone: clientReview?.missing_fields.length ? "amber" : "emerald" },
              { label: "Low confidence", value: clientReview?.low_confidence_fields.join(", ") || "None", tone: clientReview?.low_confidence_fields.length ? "amber" : "emerald" },
              { label: "Silent save", value: "false", tone: "emerald" },
            ]}
            status={clientIntakeStatus}
            title="Extracted Data Review"
          />
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Employee records are demo job-costing assumptions. This is not payroll, HR compliance, tax processing, or workforce management."
        title="Workforce Costing"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="flex flex-wrap gap-2">
              <TabButton active={employeeMode === "manual"} label="Manual Entry" onClick={() => setEmployeeMode("manual")} />
              <TabButton active={employeeMode === "upload"} label="Upload File" onClick={() => setEmployeeMode("upload")} />
              <TabButton active={employeeMode === "review"} label="Extracted Review" onClick={() => setEmployeeMode("review")} />
            </div>
            {employeeMode === "upload" ? (
              <IntakeUpload
                description="Accepted: PDF, Excel .xlsx/.xls, Word .docx/.doc, and CSV. Files are not stored."
                onFileName={handleEmployeeFile}
                onSimulateFailure={() => {
                  setEmployeeMode("upload");
                  setEmployeeIntakeStatus("Extraction failed. Manual employee entry remains available and no values were saved.");
                }}
              />
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                  <thead className="text-left text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Employee</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Base/hr</th>
                      <th className="px-3 py-2">Burden</th>
                      <th className="px-3 py-2">Hours</th>
                      <th className="px-3 py-2">Loaded/hr</th>
                      <th className="px-3 py-2">Labor cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.map((employee, index) => (
                      <tr className="bg-zinc-50" key={`${employee.employee_name}-${index}`}>
                        <td className="px-3 py-2"><input className="w-40 rounded-md border border-zinc-300 px-2 py-1" onChange={(event) => updateEmployeeDraft(index, { employee_name: event.target.value })} value={employee.employee_name} /></td>
                        <td className="px-3 py-2"><input className="w-40 rounded-md border border-zinc-300 px-2 py-1" onChange={(event) => updateEmployeeDraft(index, { role_title: event.target.value })} value={employee.role_title} /></td>
                        <td className="px-3 py-2"><input className="w-24 rounded-md border border-zinc-300 px-2 py-1" onChange={(event) => updateEmployeeDraft(index, { base_hourly_rate_cents: dollarsToCents(event.target.value) })} type="number" value={centsToDollarInput(employee.base_hourly_rate_cents)} /></td>
                        <td className="px-3 py-2"><input className="w-20 rounded-md border border-zinc-300 px-2 py-1" onChange={(event) => updateEmployeeDraft(index, { labor_burden_percent: numberInput(event.target.value) })} type="number" value={String(employee.labor_burden_percent)} /></td>
                        <td className="px-3 py-2"><input className="w-20 rounded-md border border-zinc-300 px-2 py-1" onChange={(event) => updateEmployeeDraft(index, { assigned_hours: numberInput(event.target.value) })} type="number" value={String(employee.assigned_hours)} /></td>
                        <td className="px-3 py-2 font-semibold">{formatCurrency(employee.fully_loaded_hourly_rate_cents)}</td>
                        <td className="px-3 py-2 font-semibold">{formatCurrency(employee.labor_cost_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <PrimaryButton
                icon={CheckCircle2}
                label="Save reviewed employees"
                onClick={() => {
                  setEmployeeOverride(currentEmployees.map((employee) => ({ ...employee, status: "saved_editable" })));
                  setEmployeeDrafts(null);
                  setEmployeeIntakeStatus("Employee job-costing records saved to local browser demo state. Saved records remain editable.");
                }}
              />
              <SecondaryButton icon={FileText} label="Edit saved employees" onClick={() => setEmployeeDrafts(currentEmployees.map((employee) => ({ ...employee })))} />
            </div>
          </div>
          <ReviewPanel
            facts={[
              { label: "Review status", value: employeeReview?.status ?? "saved_editable", tone: employeeMode === "upload" ? "amber" : "sky" },
              { label: "File type", value: employeeReview?.file_type ?? "manual", tone: "slate" },
              { label: "Missing fields", value: employeeReview?.missing_fields.join(", ") || "None", tone: employeeReview?.missing_fields.length ? "amber" : "emerald" },
              { label: "Low confidence", value: employeeReview?.low_confidence_fields.join(", ") || "None", tone: employeeReview?.low_confidence_fields.length ? "amber" : "emerald" },
              { label: "Silent save", value: "false", tone: "emerald" },
            ]}
            status={employeeIntakeStatus}
            title="Document Intake Review"
          />
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Upload intake is demo-safe. Extracted values require review and manual entry remains available after failure."
        title="Document Intake Review"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {documentStates.map((stateItem) => (
            <article className="rounded-md bg-white p-4 shadow-sm ring-1 ring-zinc-200" key={`${stateItem.scope}-${stateItem.status}`}>
              <StatusBadge
                label={humanize(stateItem.status)}
                tone={stateItem.status === "review_required" ? "amber" : stateItem.status === "extraction_failed" || stateItem.status === "unsupported_file" ? "rose" : "slate"}
              />
              <h3 className="mt-3 font-semibold text-zinc-950">{humanize(stateItem.scope)} / .{stateItem.file_type}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{stateItem.message}</p>
            </article>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Labor cost feeds margin, economic controls, and the final recommendation. This is job costing, not payroll processing."
        title="Workforce Cost Detail"
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricTile label="Total labor cost" tone="violet" value={formatCurrency(totalLaborCostCents)} />
          <MetricTile label="Profit after labor" tone={marginNeedsReview ? "rose" : "teal"} value={formatCurrency(profitAfterLaborCents)} />
          <MetricTile label="Margin after labor" tone={marginNeedsReview ? "rose" : "amber"} value={formatPercent(marginAfterLaborPercent)} />
          <MetricTile label="Labor status" tone={marginNeedsReview ? "rose" : "emerald"} value={marginNeedsReview ? "Needs review" : "Above floor"} />
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Detailed margin proof after approved setup spend and labor are included."
        title="Economic Detail"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <ConnectionFactGrid
              facts={[
                { label: "Revenue", value: formatCurrency(commandRevenueCents), tone: "emerald" },
                { label: "Approved vendor spend", value: formatCurrency(commandApprovedSpendCents), tone: "sky" },
                { label: "Blocked spend", value: formatCurrency(commandBlockedSpendCents), tone: "rose" },
                { label: "Labor cost", value: formatCurrency(totalLaborCostCents), tone: "violet" },
                { label: "Gross profit after labor", value: formatCurrency(profitAfterLaborCents), tone: marginNeedsReview ? "rose" : "teal" },
                { label: "Final margin", value: formatPercent(marginAfterLaborPercent), tone: marginNeedsReview ? "rose" : "amber" },
                { label: "Margin floor", value: formatPercent(marginFloorPercent), tone: "amber" },
                { label: "Decision", value: marginNeedsReview ? "Needs review" : "Safe / Profitable", tone: marginNeedsReview ? "rose" : "emerald" },
              ]}
            />
          </div>
          <div className="rounded-md bg-zinc-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase text-zinc-300">Formula</p>
            <p className="mt-3 text-lg font-semibold">Margin = (Revenue - Approved Vendor Spend - Labor Cost) / Revenue</p>
            <p className="mt-4 text-sm leading-6 text-zinc-300">The command center recalculates margin as staffing assumptions change, before another spend decision is trusted.</p>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Approved and blocked policy checks are first-class proof. Blocked spend never creates a spend ledger row."
        title="Policy Guardrail Decisions"
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {(state?.policy_checks ?? []).map((check) => (
            <PolicyDecisionCard check={check} ledgerEntries={state?.ledger.entries ?? []} key={check.id} />
          ))}
          {(state?.policy_checks.length ?? 0) === 0 ? (
            <EmptyWorkspaceState>Policy decisions appear after Start Governed Run.</EmptyWorkspaceState>
          ) : null}
          {marginNeedsReview ? (
            <article className="rounded-md bg-rose-50 p-4 ring-1 ring-rose-200">
              <StatusBadge label="needs review" tone="rose" />
              <h3 className="mt-3 font-semibold text-rose-950">Labor margin warning</h3>
              <p className="mt-2 text-sm leading-6 text-rose-800">Labor assignments push projected margin below the floor. Review staffing, scope, or approved spend before proceeding.</p>
            </article>
          ) : null}
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="Agent work is separated by worker so screenshots show the operating team, not one final blob of text."
        title="Agent Workbench"
      >
        <div className="grid gap-4 xl:grid-cols-5">
          {agentWorkbenchItems(state?.agent_outputs ?? []).map((agent) => (
            <article className="rounded-md bg-white p-4 shadow-sm ring-1 ring-zinc-200" key={agent.name}>
              <StatusBadge label={agent.status} tone={agent.status === "complete" ? "emerald" : "amber"} />
              <h3 className="mt-3 font-semibold text-zinc-950">{agent.name}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{agent.task}</p>
              <p className="mt-3 border-t border-zinc-200 pt-3 text-sm font-semibold text-zinc-800">{agent.summary}</p>
              <p className="mt-2 text-xs text-zinc-500">Evidence: {agent.evidence}</p>
            </article>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        description="One implemented function is available today. Additional ClientOps functions remain planned."
        title="Governed Operation Templates"
      >
        <TemplateShelf implemented="Client Implementation Launch" planned={plannedTemplates} />
      </WorkspaceSection>

      <WorkspaceSection
        description="Detailed finance, guardrail, and record evidence is kept outside the first business screen."
        title="Proof Path"
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <button className="text-left" onClick={() => onNavigate("integrations")} type="button">
            <ProofRoute
              description="Allowed systems, connector modes, guardrail rails, and evidence duties for governed execution."
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
              description={latestRun ? `${humanize(latestRun.status)} execution is available for review.` : "The preloaded Northstar operation is ready for its first governed run."}
              icon={ClipboardList}
              label="Runs"
              tone={latestRun ? "emerald" : "slate"}
            />
          </button>
        </div>
      </WorkspaceSection>
    </div>
  );
}

function CinematicControlRoomHero({
  actions,
  businessType,
  clientName,
  guardrailTone,
  metrics,
  operationName,
  runStatus,
}: {
  actions: ReactNode;
  businessType: string;
  clientName: string;
  guardrailTone: Tone;
  metrics: RailItem[];
  operationName: string;
  runStatus: string;
}) {
  return (
    <section className="overflow-hidden rounded-md bg-zinc-950 text-white shadow-xl shadow-zinc-950/20 ring-1 ring-zinc-900">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="px-5 py-6 sm:px-7 lg:px-9 lg:py-8">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold ${darkToneClass("emerald")}`}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              ScaleX Governed ClientOps
            </span>
            <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold ${darkToneClass("sky")}`}>
              <Activity className="h-4 w-4" aria-hidden="true" />
              {runStatus}
            </span>
          </div>
          <h1 className="mt-5 max-w-5xl text-4xl font-semibold leading-tight tracking-normal text-white lg:text-6xl">
            Governed execution for revenue-backed client operations
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-zinc-200">
            Hermes plans the work. Stripe proves the money. NeMo checks risky actions. ScaleX blocks unsafe execution, records evidence, and protects profit.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {actions}
          </div>
          <StackChain guardrailTone={guardrailTone} />
        </div>

        <aside className="border-t border-white/10 bg-white/[0.04] p-5 sm:p-6 xl:border-l xl:border-t-0">
          <div className="rounded-md bg-white p-5 text-zinc-950 shadow-lg shadow-zinc-950/20">
            <StatusBadge icon={Building2} label="Primary operation" tone="emerald" />
            <p className="mt-5 text-sm font-semibold uppercase text-zinc-500">{clientName}</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-normal text-zinc-950">
              {operationName}
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              {businessType}. Synthetic B2B implementation operations only: no patient data, no PHI, and no healthcare compliance claim.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {metrics.slice(0, 4).map((metric) => (
                <HeroCompactMetric key={metric.label} item={metric} />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="border-t border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {metrics.map((metric) => (
            <HeroMetricCard key={metric.label} item={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroMetricCard({ item }: { item: RailItem }) {
  return (
    <article className={`rounded-md border p-4 ${darkToneClass(item.tone ?? "slate")}`}>
      <p className="text-xs font-semibold uppercase">{item.label}</p>
      <p className="mt-2 break-words text-3xl font-semibold leading-none text-white">{item.value}</p>
    </article>
  );
}

function HeroCompactMetric({ item }: { item: RailItem }) {
  return (
    <div className={`rounded-md border px-3 py-2 ${softToneClass(item.tone ?? "slate")}`}>
      <p className="text-xs font-semibold uppercase">{item.label}</p>
      <p className="mt-1 break-words text-base font-semibold">{item.value}</p>
    </div>
  );
}

function StackChain({ guardrailTone }: { guardrailTone: Tone }) {
  const steps = [
    { icon: BrainCircuit, label: "Hermes plans", tone: "violet" as Tone },
    { icon: CreditCard, label: "Stripe proves", tone: "sky" as Tone },
    { icon: ShieldCheck, label: "NeMo checks", tone: guardrailTone },
    { icon: Database, label: "ScaleX records", tone: "teal" as Tone },
  ];
  return (
    <ol className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <li className="flex min-w-0 items-center gap-2" key={step.label}>
            <span className={`flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${darkToneClass(step.tone)}`}>
              <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
              <span className="min-w-0 break-words">{step.label}</span>
            </span>
            {index < steps.length - 1 ? <span className="hidden text-zinc-500 xl:inline">-&gt;</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

function EnterpriseControlNarrative() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <article className="rounded-md bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <StatusBadge icon={AlertTriangle} label="enterprise pain" tone="amber" />
        <h3 className="mt-4 text-2xl font-semibold leading-tight text-zinc-950">
          Raw agents cannot be trusted with spend, vendors, client workflows, or internal systems.
        </h3>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Enterprise teams need proof, policy, money control, and audit before an AI agent can move paid work forward.
        </p>
      </article>
      <article className="rounded-md bg-zinc-950 p-6 text-white shadow-sm">
        <StatusBadge icon={ShieldCheck} label="ScaleX control" tone="teal" />
        <h3 className="mt-4 text-2xl font-semibold leading-tight">
          ScaleX turns paid client work into a governed run.
        </h3>
        <p className="mt-3 text-sm leading-6 text-zinc-200">
          Finance-backed, policy-checked, guardrailed, and recorded before the agent can move the operation forward.
        </p>
      </article>
    </div>
  );
}

interface ControlStackItem {
  description: string;
  icon: LucideIcon;
  name: string;
  result: string;
  role: string;
  tone: Tone;
}

function ControlStackFlow({ items }: { items: ControlStackItem[] }) {
  return (
    <div className="rounded-md bg-zinc-950 p-4 text-white shadow-sm ring-1 ring-zinc-900 sm:p-5">
      <ol className="grid gap-3 xl:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <li className="relative" key={item.name}>
              <article className={`h-full rounded-md border p-4 ${darkToneClass(item.tone)}`}>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-white/10">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase text-zinc-300">{item.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-200">{item.description}</p>
                <p className="mt-4 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white">{item.result}</p>
              </article>
              {index < items.length - 1 ? (
                <span className="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-white/10 bg-zinc-900 text-sm font-semibold text-zinc-200 xl:flex">
                  -&gt;
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PrimaryButton({
  disabled = false,
  icon: Icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
      disabled={disabled}
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

interface ControlStackCardProps {
  description: string;
  icon: LucideIcon;
  name: string;
  result: string;
  role: string;
  tone: Tone;
}

function ControlStackCard({
  description,
  icon: Icon,
  name,
  result,
  role,
  tone,
}: ControlStackCardProps) {
  return (
    <article className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-md border ${softToneClass(tone)}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-zinc-950">{name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase text-zinc-500">{role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-600">{description}</p>
      <div className="mt-4 border-t border-zinc-200 pt-3">
        <StatusBadge label={result} tone={tone} />
      </div>
    </article>
  );
}

interface GovernedRailItem {
  actor: string;
  checked: string;
  decision: string;
  proof: string;
  rail: string;
  status: string;
  tag: string;
  tone: Tone;
}

function GovernedRailGrid({ rails, running = false }: { rails: GovernedRailItem[]; running?: boolean }) {
  return (
    <div className="rounded-md bg-zinc-950 p-4 text-white shadow-sm ring-1 ring-zinc-900 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-300">Live governed run stage</p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-300">
            Every forward move is checked against proof, policy, money control, and audit duties.
          </p>
        </div>
        <StatusBadge icon={running ? RefreshCw : ShieldCheck} label={running ? "running governed run" : "ready to execute"} tone={running ? "sky" : "emerald"} />
      </div>
      <ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rails.map((rail, index) => (
          <li
            className={`rounded-md border p-4 shadow-sm transition hover:-translate-y-0.5 ${darkToneClass(rail.tone)} ${rail.decision === "Blocked" ? "ring-2 ring-rose-400/80" : ""} ${running && index === 0 ? "animate-pulse" : ""}`}
            key={`${rail.rail}-${rail.status}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-zinc-300">{String(index + 1).padStart(2, "0")} / {rail.actor}</p>
                <h3 className="mt-2 text-xl font-semibold leading-tight text-white">{rail.rail}</h3>
              </div>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                {rail.decision}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-white">{rail.status}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">{rail.checked}</p>
            <div className="mt-4 grid gap-2 border-t border-white/10 pt-3 text-xs font-semibold uppercase text-zinc-300">
              <span>{rail.tag}</span>
              <span className="normal-case leading-5 text-zinc-200">{rail.proof}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BlockedRiskSpotlight({
  amountCents,
  marginPercent,
}: {
  amountCents: number;
  marginPercent: number;
}) {
  return (
    <article className="grid overflow-hidden rounded-md bg-zinc-950 text-white shadow-xl shadow-rose-950/20 ring-1 ring-rose-500/40 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-md border border-rose-300/30 bg-rose-300/10 px-3 py-1.5 text-sm font-semibold text-rose-100">
          <Ban className="h-4 w-4" aria-hidden="true" />
          Blocked risky action
        </span>
        <h3 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-normal">
          Data broker enrichment / premium vendor spend
        </h3>
        <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-200">
          ScaleX stopped the action before execution. The run preserved protected margin, prevented uncontrolled vendor exposure, and recorded audit proof instead of blindly firing the spend.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <BlockedRiskSignal label="Requested amount" value={formatCurrency(amountCents)} />
          <BlockedRiskSignal label="Decision" value="Blocked" />
          <BlockedRiskSignal label="Protected margin" value={formatPercent(marginPercent)} />
        </div>
      </div>
      <dl className="grid divide-y divide-rose-800 border-t border-rose-800 bg-rose-950/70 lg:border-l lg:border-t-0">
        <BlockedRiskFact label="Reason" value="Violates vendor/risk policy and would create uncontrolled spend exposure." />
        <BlockedRiskFact label="Impact" value="Protected margin, prevented risky vendor action, and recorded audit proof." />
        <BlockedRiskFact label="Execution rule" value="Fail-closed before spend reaches the ledger." />
      </dl>
    </article>
  );
}

function BlockedRiskSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-rose-300/30 bg-rose-300/10 p-4">
      <p className="text-xs font-semibold uppercase text-rose-200">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function BlockedRiskFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-5">
      <dt className="text-xs font-semibold uppercase text-rose-200">{label}</dt>
      <dd className="mt-2 break-words text-base font-semibold leading-6 text-white">{value}</dd>
    </div>
  );
}

function EconomicControlPanel({
  approvedSpendCents,
  blockedSpendCents,
  laborCostCents,
  marginFloorPercent,
  protectedMarginPercent,
  protectedProfitCents,
  revenueCents,
}: {
  approvedSpendCents: number;
  blockedSpendCents: number;
  laborCostCents: number;
  marginFloorPercent: number;
  protectedMarginPercent: number;
  protectedProfitCents: number;
  revenueCents: number;
}) {
  return (
    <div className="grid overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-zinc-200 xl:grid-cols-[minmax(0,1fr)_30rem]">
      <div className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <EconomicMetric label="Revenue secured" tone="emerald" value={formatCurrency(revenueCents)} />
          <EconomicMetric label="Approved setup spend" tone="sky" value={formatCurrency(approvedSpendCents)} />
          <EconomicMetric label="Labor cost" tone="violet" value={formatCurrency(laborCostCents)} />
          <EconomicMetric label="Blocked risky spend" tone="rose" value={formatCurrency(blockedSpendCents)} />
          <EconomicMetric label="Protected profit" tone="teal" value={formatCurrency(protectedProfitCents)} />
          <EconomicMetric label="Protected margin" tone="amber" value={formatPercent(protectedMarginPercent)} />
        </div>
      </div>
      <div className="bg-zinc-950 p-6 text-white">
        <p className="text-xs font-semibold uppercase text-emerald-300">Enterprise money control</p>
        <p className="mt-3 text-3xl font-semibold leading-tight text-white">{formatCurrency(protectedProfitCents)}</p>
        <p className="mt-1 text-sm font-semibold text-zinc-300">protected profit after approved setup spend and labor cost</p>
        <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-400">Formula</p>
            <p className="mt-2 text-lg font-semibold leading-7">Protected profit = Revenue - Approved Spend - Labor Cost</p>
            <p className="mt-2 text-lg font-semibold leading-7">Protected margin = Protected profit / Revenue</p>
          </div>
          <dl className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-md bg-white/10 px-3 py-2">
              <dt className="text-zinc-300">Margin floor</dt>
              <dd className="font-semibold">{formatPercent(marginFloorPercent)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-md bg-emerald-300/10 px-3 py-2 text-emerald-100">
              <dt>Decision</dt>
              <dd className="font-semibold">Protected</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function EconomicMetric({ label, tone, value }: { label: string; tone: Tone; value: string }) {
  return (
    <article className={`rounded-md border p-4 ${softToneClass(tone)}`}>
      <p className="text-xs font-semibold uppercase">{label}</p>
      <p className="mt-2 break-words text-3xl font-semibold leading-none">{value}</p>
    </article>
  );
}

interface EnterpriseEvidenceRow {
  action: string;
  actor: string;
  evidenceType: string;
  order: string;
  result: string;
  safetyNote: string;
  tone: Tone;
}

function EnterpriseEvidenceTable({ rows }: { rows: EnterpriseEvidenceRow[] }) {
  return (
    <ol className="grid gap-3">
      {rows.map((row) => (
        <li className="grid gap-4 rounded-md border border-zinc-200 bg-zinc-50 p-4 lg:grid-cols-[4.5rem_minmax(0,0.8fr)_minmax(0,1.35fr)_minmax(0,0.9fr)]" key={`${row.order}-${row.action}`}>
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">Order</p>
            <p className="mt-1 text-lg font-semibold text-zinc-950">{row.order}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">Actor / system</p>
            <p className="mt-1 font-semibold text-zinc-950">{row.actor}</p>
            <div className="mt-2">
              <StatusBadge label={row.result} tone={row.tone} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">Action</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-zinc-800">{row.action}</p>
            <p className="mt-2 text-xs font-semibold uppercase text-zinc-500">Evidence type: {row.evidenceType}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">Safety note</p>
            <p className="mt-1 text-sm leading-6 text-zinc-700">{row.safetyNote}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ComparisonPanel({ rows }: { rows: Array<{ normal: string; scalex: string }> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-md bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600">
            <CircleDashed className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">Normal automation</p>
            <h3 className="text-2xl font-semibold text-zinc-950">Trigger -&gt; action</h3>
          </div>
        </div>
        <ul className="mt-5 space-y-3 text-sm text-zinc-700">
          {rows.map((row) => (
            <li className="flex gap-2" key={row.normal}>
              <CircleDashed className="mt-0.5 h-4 w-4 flex-none text-zinc-400" aria-hidden="true" />
              <span>{row.normal}</span>
            </li>
          ))}
        </ul>
      </article>
      <article className="rounded-md bg-zinc-950 p-6 text-white shadow-sm ring-1 ring-zinc-900">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-300">ScaleX</p>
            <h3 className="text-2xl font-semibold">Revenue-backed operation -&gt; governed run</h3>
          </div>
        </div>
        <ul className="mt-5 space-y-3 text-sm text-zinc-200">
          {rows.map((row) => (
            <li className="flex gap-2" key={row.scalex}>
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-emerald-300" aria-hidden="true" />
              <span>{row.scalex}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-semibold transition ${active ? "bg-zinc-950 text-white" : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function IntakeUpload({
  description,
  onFileName,
  onSimulateFailure,
}: {
  description: string;
  onFileName: (fileName: string) => void;
  onSimulateFailure: () => void;
}) {
  return (
    <div className="mt-5 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-5">
      <p className="text-sm leading-6 text-zinc-600">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Upload demo file
          <input
            accept=".pdf,.xlsx,.xls,.docx,.doc,.csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onFileName(file.name);
              }
              event.target.value = "";
            }}
            type="file"
          />
        </label>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
          onClick={onSimulateFailure}
          type="button"
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Simulate extraction failure
        </button>
      </div>
      <p className="mt-4 text-xs text-zinc-500">The file is not stored. The UI uses deterministic demo fixtures for extracted review values.</p>
    </div>
  );
}

function ReviewPanel({
  facts,
  status,
  title,
}: {
  facts: ConnectorFact[];
  status: string;
  title: string;
}) {
  return (
    <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <h3 className="font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{status}</p>
      <ConnectionFactGrid facts={facts} />
    </div>
  );
}

function PolicyDecisionCard({ check, ledgerEntries }: { check: PolicyCheck; ledgerEntries: LedgerEntry[] }) {
  const approved = isApproved(check);
  const ledgerUpdated = ledgerEntries.some((entry) => entry.entry_type === "spend" && entry.label === check.vendor);
  return (
    <article className={`rounded-md p-4 shadow-sm ring-1 ${approved ? "bg-emerald-50 ring-emerald-200" : "bg-rose-50 ring-rose-200"}`}>
      <StatusBadge label={approved ? "approved" : "blocked"} tone={approved ? "emerald" : "rose"} />
      <h3 className="mt-3 font-semibold text-zinc-950">{check.vendor}</h3>
      <p className="mt-2 text-sm text-zinc-700">Requested: {formatCurrency(check.requested_amount_cents)}</p>
      <p className="mt-1 text-sm text-zinc-700">Margin after spend: {formatPercent(check.margin_after_spend_percent)}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{check.reason}</p>
      <div className="mt-3 border-t border-zinc-200 pt-3 text-xs font-semibold uppercase text-zinc-500">
        Required action: {check.required_action}
      </div>
      <p className={`mt-2 text-sm font-semibold ${approved === ledgerUpdated ? "text-emerald-700" : "text-rose-700"}`}>
        Ledger update: {ledgerUpdated ? "spend row recorded" : "no spend row recorded"}
      </p>
    </article>
  );
}

function governedRailItems({
  approvedSpendCents,
  blockedSpendCents,
  guardrailLabel,
  hasReport,
  hasRun,
  laborCostCents,
  marginPercent,
  profitCents,
  revenueCents,
  stripeLabel,
}: {
  approvedSpendCents: number;
  blockedSpendCents: number;
  guardrailLabel: string;
  hasReport: boolean;
  hasRun: boolean;
  laborCostCents: number;
  marginPercent: number;
  profitCents: number;
  revenueCents: number;
  stripeLabel: string;
}): GovernedRailItem[] {
  const runProof = hasRun ? "Run evidence recorded" : "Preloaded judge demo path";
  return [
    {
      rail: "Input Rail",
      actor: "ScaleX",
      status: "Passed",
      checked: "Northstar operation context, synthetic data boundary, revenue, spend cap, and margin floor checked.",
      proof: `${runProof}; no patient data or PHI.`,
      decision: "Passed",
      tag: "operation context",
      tone: "emerald",
    },
    {
      rail: "Hermes Plan",
      actor: "Hermes",
      status: "Created",
      checked: "Client implementation plan and proposed next actions created for bounded work.",
      proof: "Planning proof recorded before protected execution.",
      decision: "Created",
      tag: "planner proof",
      tone: "violet",
    },
    {
      rail: "Planning Rail",
      actor: "ScaleX",
      status: "Approved",
      checked: "Plan reviewed against allowed client-implementation scope before execution.",
      proof: "Planning rail approved before protected actions.",
      decision: "Approved",
      tag: "scope boundary",
      tone: "violet",
    },
    {
      rail: "Stripe Finance Proof",
      actor: "Stripe",
      status: "Verified",
      checked: `Finance proof created for ${formatCurrency(revenueCents)} secured revenue.`,
      proof: stripeLabel,
      decision: "Verified",
      tag: "finance proof",
      tone: "sky",
    },
    {
      rail: "Revenue Gate",
      actor: "ScaleX",
      status: "Passed",
      checked: "Revenue gate verified before setup spend or delivery work can proceed.",
      proof: `Revenue secured ${formatCurrency(revenueCents)}.`,
      decision: "Passed",
      tag: "money gate",
      tone: "emerald",
    },
    {
      rail: "NeMo / Local Policy",
      actor: "Guardrail Runtime",
      status: "Checked",
      checked: "Vendor allowlist, blocked vendor rule, spend cap, margin floor, and unsafe-data boundary reviewed.",
      proof: guardrailLabel,
      decision: "Checked",
      tag: "policy runtime",
      tone: "teal",
    },
    {
      rail: "Controlled Spend",
      actor: "ScaleX",
      status: "Approved",
      checked: `${formatCurrency(approvedSpendCents)} setup spend checked against approved vendors and margin.`,
      proof: "Approved setup spend recorded.",
      decision: "Approved",
      tag: "spend approval",
      tone: "emerald",
    },
    {
      rail: "Risky Vendor Action",
      actor: "ScaleX Policy",
      status: "Blocked",
      checked: `${formatCurrency(blockedSpendCents)} data broker enrichment / premium vendor spend reviewed before execution.`,
      proof: "Blocked action created no spend ledger row.",
      decision: "Blocked",
      tag: "risk blocked",
      tone: "rose",
    },
    {
      rail: "Evidence Ledger",
      actor: "SQLite Ledger",
      status: "Recorded",
      checked: "Planning, finance, policy, approved spend, blocked risk, labor cost, and safety proof recorded.",
      proof: `${hasRun ? "SQLite evidence rows" : "Evidence preview"} available for audit.`,
      decision: "Recorded",
      tag: "audit proof",
      tone: "teal",
    },
    {
      rail: "Output Honesty Rail",
      actor: "ScaleX",
      status: "Verified",
      checked: "No live-money claim, no false paid claim, no secrets, and no real client data.",
      proof: "Output rail verifies safe wording before report.",
      decision: "Verified",
      tag: "honesty check",
      tone: "amber",
    },
    {
      rail: "Profit Outcome",
      actor: "ScaleX",
      status: "Protected",
      checked: `Labor cost ${formatCurrency(laborCostCents)}, protected profit ${formatCurrency(profitCents)}, protected margin ${formatPercent(marginPercent)}.`,
      proof: hasReport ? "Final profit report recorded" : "Profit outcome preview ready.",
      decision: "Protected",
      tag: "margin proof",
      tone: "emerald",
    },
  ];
}

function enterpriseEvidenceRows({
  approvedSpendCents,
  blockedSpendCents,
  guardrailLabel,
  laborCostCents,
  profitCents,
  state,
}: {
  approvedSpendCents: number;
  blockedSpendCents: number;
  guardrailLabel: string;
  laborCostCents: number;
  profitCents: number;
  state: DemoState | null;
}): EnterpriseEvidenceRow[] {
  const stripeResult = state?.stripe.used_real_stripe ? "real Stripe test" : "sandbox proof";
  return [
    {
      order: "001",
      actor: "Hermes",
      action: "Planning proof recorded",
      result: "recorded",
      evidenceType: "planning_run",
      safetyNote: "Hermes plans only; ScaleX executes approved actions.",
      tone: "violet",
    },
    {
      order: "002",
      actor: "Stripe",
      action: "Test finance proof recorded",
      result: stripeResult,
      evidenceType: "stripe_event",
      safetyNote: "No live-money mode; paid state shown only if Stripe reports it.",
      tone: "sky",
    },
    {
      order: "003",
      actor: "NeMo / Local Policy",
      action: "Guardrail check recorded",
      result: "verified",
      evidenceType: "guardrail_evaluation",
      safetyNote: guardrailLabel,
      tone: "teal",
    },
    {
      order: "004",
      actor: "ScaleX Policy",
      action: `Approved setup spend ${formatCurrency(approvedSpendCents)}`,
      result: "approved",
      evidenceType: "policy_check",
      safetyNote: "Allowed vendors and margin floor were checked before spend.",
      tone: "emerald",
    },
    {
      order: "005",
      actor: "ScaleX Policy",
      action: `Risky vendor action blocked ${formatCurrency(blockedSpendCents)}`,
      result: "blocked",
      evidenceType: "policy_check",
      safetyNote: "Data broker enrichment / premium vendor spend created no spend ledger row.",
      tone: "rose",
    },
    {
      order: "006",
      actor: "Workforce Costing",
      action: `Labor-cost proof recorded ${formatCurrency(laborCostCents)}`,
      result: "recorded",
      evidenceType: "job_costing",
      safetyNote: "Demo job costing only; not payroll or HR compliance.",
      tone: "violet",
    },
    {
      order: "007",
      actor: "Output Rail",
      action: "Paid-state honesty verified",
      result: "verified",
      evidenceType: "output_guardrail",
      safetyNote: "Open/unpaid Stripe proof is not described as paid.",
      tone: "amber",
    },
    {
      order: "008",
      actor: "ScaleX Safety",
      action: "No live-money mode verified",
      result: "verified",
      evidenceType: "mode_boundary",
      safetyNote: "Verified Live Mode is future-only.",
      tone: "teal",
    },
    {
      order: "009",
      actor: "ScaleX Safety",
      action: "No secrets stored verified",
      result: "verified",
      evidenceType: "secret_boundary",
      safetyNote: "No tokens, credential headers, or .env values are shown.",
      tone: "teal",
    },
    {
      order: "010",
      actor: "ScaleX Ledger",
      action: "Final protected profit outcome recorded",
      result: "recorded",
      evidenceType: "profit_report",
      safetyNote: `Protected profit ${formatCurrency(profitCents)} after approved spend and labor.`,
      tone: "emerald",
    },
  ];
}

function auditRowsFromState(state: DemoState | null): number {
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
    state.orchestration_calls.length +
    state.guardrail_evaluations.length
  );
}

function demoEmployeeRecords(): CommandCenterEmployeeRecord[] {
  return [
    calculateLoadedEmployee({
      employee_name: "Maria Lopez",
      role_title: "Technician",
      base_hourly_rate_cents: 2400,
      labor_burden_percent: 20,
      fully_loaded_hourly_rate_cents: 0,
      assigned_hours: 5,
      labor_cost_cents: 0,
      skill_category: "Technical service",
      active: true,
      status: "active",
      notes: "Demo employee only; no HR record.",
      source: "manual_entry",
    }),
    calculateLoadedEmployee({
      employee_name: "James Carter",
      role_title: "Service Assistant",
      base_hourly_rate_cents: 1800,
      labor_burden_percent: 20,
      fully_loaded_hourly_rate_cents: 0,
      assigned_hours: 3,
      labor_cost_cents: 0,
      skill_category: "Operations support",
      active: true,
      status: "active",
      notes: "Demo employee only; no payroll record.",
      source: "file_extraction_fixture",
    }),
    calculateLoadedEmployee({
      employee_name: "Avery Smith",
      role_title: "Campaign/Ops Assistant",
      base_hourly_rate_cents: 2200,
      labor_burden_percent: 20,
      fully_loaded_hourly_rate_cents: 0,
      assigned_hours: 2,
      labor_cost_cents: 0,
      skill_category: "Campaign operations",
      active: true,
      status: "active",
      notes: "Demo employee only; job-costing assumption.",
      source: "file_extraction_fixture",
    }),
  ];
}

function calculateLoadedEmployee(employee: CommandCenterEmployeeRecord): CommandCenterEmployeeRecord {
  const fullyLoadedHourlyRateCents = Math.round(employee.base_hourly_rate_cents * (1 + employee.labor_burden_percent / 100));
  return {
    ...employee,
    fully_loaded_hourly_rate_cents: fullyLoadedHourlyRateCents,
    labor_cost_cents: Math.round(fullyLoadedHourlyRateCents * employee.assigned_hours),
  };
}

function centsToDollarInput(cents: number): string {
  return String(Math.round(cents) / 100);
}

function dollarsToCents(value: string): number {
  return Math.round(numberInput(value) * 100);
}

function numberInput(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function isAcceptedIntakeFile(extension: string): boolean {
  return ["pdf", "xlsx", "xls", "docx", "doc", "csv"].includes(extension);
}

function agentWorkbenchItems(agentOutputs: AgentOutput[]) {
  const defaultItems = [
    {
      name: "Orchestrator",
      task: "Coordinate finance proof, policy checks, labor assumptions, and evidence.",
      status: "complete",
      summary: "Run route and evidence duties prepared.",
      evidence: "orchestration calls",
    },
    {
      name: "Finance Agent",
      task: "Review invoice proof, vendor spend, blocked risk, and final economics.",
      status: "pending",
      summary: "Waiting for run output.",
      evidence: "finance proof",
    },
    {
      name: "Marketing Agent",
      task: "Prepare campaign copy and client-facing launch notes.",
      status: "pending",
      summary: "Waiting for run output.",
      evidence: "agent output",
    },
    {
      name: "Research Agent",
      task: "Review safe market and operations context without real client data.",
      status: "pending",
      summary: "Waiting for run output.",
      evidence: "agent output",
    },
    {
      name: "Ops Agent",
      task: "Prepare implementation handoff and execution checklist.",
      status: "pending",
      summary: "Waiting for run output.",
      evidence: "agent output",
    },
  ];
  if (agentOutputs.length === 0) {
    return defaultItems;
  }
  return defaultItems.map((item) => {
    const output = agentOutputs.find((agentOutput) => agentOutput.agent_name.toLowerCase().includes(item.name.split(" ")[0].toLowerCase()));
    if (!output) {
      return item;
    }
    return {
      ...item,
      status: output.status,
      summary: output.summary,
      evidence: "SQLite agent_outputs",
    };
  });
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
      description="Select the client operation file that drives the next governed run."
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
  const auditMission = state?.command_center?.mission_control ?? null;
  const auditProfitReport = state?.command_center?.final_profit_report ?? null;
  const auditEvidenceRows = enterpriseEvidenceRows({
    approvedSpendCents: auditMission?.approved_vendor_spend_cents ?? totals?.approved_spend_cents ?? 115_000,
    blockedSpendCents: auditMission?.blocked_spend_cents ?? totals?.blocked_spend_cents ?? 320_000,
    guardrailLabel: state?.execution.guardrail_label ?? guardrails?.truthfulness_note ?? "Local policy active",
    laborCostCents: auditMission?.labor_cost_cents ?? auditProfitReport?.labor_cost_cents ?? 26_160,
    profitCents: auditMission?.projected_profit_cents ?? auditProfitReport?.gross_profit_after_labor_cents ?? 708_840,
    state,
  });

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

      <WorkspaceSection
        description="Enterprise audit view: order, actor/system, action, result, evidence type, and safety note."
        title="Enterprise Audit Ledger"
      >
        <div className="rounded-md bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <EnterpriseEvidenceTable rows={auditEvidenceRows} />
        </div>
      </WorkspaceSection>

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
  const hermesRuntime = hermes?.runtime ?? execution?.hermes_runtime ?? "isolated_cli";
  const hermesRuntimeStatus = hermes?.runtime_status ?? execution?.hermes_runtime_status ?? "pending";
  const nemoHermesSelected = hermesRuntime === "nemoclaw" || hermes?.mode === "nemohermes_api";
  const nemoHermesVerified = Boolean(nemoHermesSelected && hermes?.used_real_hermes && hermesRuntimeStatus === "available");
  const nemoHermesFailClosed = Boolean(nemoHermesSelected && hermesRuntimeStatus === "fail_closed");
  const nemoHermesApiBase = hermes?.api_base_url ?? execution?.hermes_api_base_url ?? "127.0.0.1:8642/v1";
  const nemoHermesSandbox = hermes?.sandbox_name ?? execution?.hermes_sandbox_name ?? "scalex-hermes";
  const nemoHermesProvider = hermes?.upstream_provider ?? execution?.hermes_upstream_provider ?? hermes?.provider ?? "nvidia-prod";
  const nemoHermesUpstreamModel = hermes?.upstream_model ?? execution?.hermes_upstream_model ?? "nvidia/nemotron-3-ultra-550b-a55b";
  const nemoMissingConfig = Boolean(guardrails && guardrails.mode === "nemo_guardrails" && !guardrails.used_real_nemo && !guardrails.nemo_python_configured);
  const fullProofRuntimeVerified = Boolean(execution?.used_real_hermes || execution?.used_real_stripe || guardrails?.used_real_nemo || nemoHermesVerified);
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
            boundary={nemoHermesSelected ? "Selected runtime is NemoHermes API through the local NemoClaw/OpenShell sandbox; no production Hermes config is used." : "Uses the ScaleX-isolated Hermes path in Full Proof Mode; no production Hermes config is used."}
            description="Plans the implementation operation and proposes the controlled tool sequence."
            facts={[
              { label: "Judge Demo Mode", value: "Deterministic/local plan proof", tone: "amber" },
              { label: "Full Proof Mode", value: nemoHermesSelected ? "NemoHermes API when available" : "Isolated Hermes when configured", tone: "sky" },
              { label: "used_real_hermes", value: String(Boolean(hermes?.used_real_hermes)), tone: hermes?.used_real_hermes ? "emerald" : "amber" },
              { label: "Provider/model", value: hermes?.used_real_hermes ? `${hermes.provider ?? "Hermes"} / ${hermes.model ?? "model recorded"}` : hermes?.failure_reason ?? hermes?.error ?? "Not runtime verified in this state", tone: hermesMissingConfig ? "rose" : "slate" },
            ]}
            icon={BrainCircuit}
            name="Hermes Planning"
            statuses={[
              { label: "active", tone: "emerald" },
              { label: "demo mode", tone: "amber" },
              { label: "full proof capable", tone: "sky" },
              ...(nemoHermesSelected ? [{ label: "NemoHermes selected", tone: "sky" as Tone }] : []),
              ...(hermes?.used_real_hermes ? [{ label: "runtime verified", tone: "emerald" as Tone }] : []),
              ...(hermesMissingConfig ? [{ label: "missing config", tone: "rose" as Tone }] : []),
            ]}
          />

          {nemoHermesSelected ? (
            <ConnectorCard
              boundary="NemoClaw/OpenShell owns the sandbox boundary. ScaleX records non-secret runtime evidence and fails closed when the local API is unavailable."
              description="Routes Hermes Agent planning through the local OpenAI-compatible NemoHermes API."
              facts={[
                { label: "Runtime", value: "NemoHermes API", tone: nemoHermesVerified ? "emerald" : nemoHermesFailClosed ? "rose" : "sky" },
                { label: "Sandbox", value: nemoHermesSandbox, tone: "slate" },
                { label: "Local API", value: nemoHermesApiBase, tone: "slate" },
                { label: "Agent model", value: hermes?.model ?? "hermes-agent", tone: "sky" },
                { label: "Upstream provider", value: nemoHermesProvider, tone: "slate" },
                { label: "Upstream model", value: nemoHermesUpstreamModel, tone: "slate" },
                { label: "Runtime status", value: humanize(hermesRuntimeStatus), tone: nemoHermesVerified ? "emerald" : nemoHermesFailClosed ? "rose" : "amber" },
              ]}
              icon={Layers3}
              name="NemoClaw / OpenShell Sandbox"
              statuses={[
                { label: "selected", tone: "sky" },
                { label: nemoHermesVerified ? "runtime verified" : nemoHermesFailClosed ? "fail closed" : "proof pending", tone: nemoHermesVerified ? "emerald" : nemoHermesFailClosed ? "rose" : "amber" },
                { label: "Hermes Agent", tone: "teal" },
                { label: "NVIDIA endpoint", tone: "slate" },
              ]}
            />
          ) : null}

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
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
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
          <CapabilityCard
            detail={nemoHermesSelected ? `${nemoHermesSandbox} via ${nemoHermesApiBase}` : "Select HERMES_RUNTIME=nemoclaw to route planning through the local NemoHermes API."}
            icon={Layers3}
            label="NemoClaw / NemoHermes runtime"
            status={nemoHermesVerified ? "runtime verified" : nemoHermesFailClosed ? "fail closed" : nemoHermesSelected ? "selected" : "full proof capable"}
            tone={nemoHermesVerified ? "emerald" : nemoHermesFailClosed ? "rose" : "sky"}
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
      description="Runtime facts and non-negotiable boundaries for the local governed execution workspace."
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
