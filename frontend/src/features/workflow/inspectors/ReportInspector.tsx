import { FileText, TrendingUp } from "lucide-react";

import { formatCurrency, formatPercent } from "../../../format";
import { formatOptionalCurrency, formatOptionalPercent } from "../../../lib/demoSelectors";
import type { MoneySnapshot } from "../../../lib/demoSelectors";
import type { DemoState } from "../../../types";
import {
  EmptyState,
  Fact,
  FactGrid,
  InspectorSection,
  MarkdownDetails,
  Metric,
  StatusPill,
} from "./inspectorUi";

export function ReportInspector({
  money,
  state,
}: {
  money: MoneySnapshot;
  state: DemoState | null;
}) {
  const report = state?.report ?? null;
  const commandReport = state?.command_center?.final_profit_report ?? null;

  return (
    <div className="space-y-4">
      <InspectorSection
        description="Final protected-profit economics include approved setup spend and deterministic labor cost."
        icon={FileText}
        title="Profit Outcome"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric
            label="Revenue"
            tone="emerald"
            value={report ? formatCurrency(report.revenue_cents) : formatOptionalCurrency(money.revenueCents)}
          />
          <Metric
            label="Approved setup spend"
            tone="sky"
            value={report ? formatCurrency(report.approved_spend_cents) : formatOptionalCurrency(money.approvedSpendCents)}
          />
          <Metric
            label="Protected profit"
            tone="teal"
            value={commandReport ? formatCurrency(commandReport.gross_profit_after_labor_cents) : formatOptionalCurrency(money.grossProfitCents)}
          />
          <Metric
            label="Labor cost"
            tone="violet"
            value={commandReport ? formatCurrency(commandReport.labor_cost_cents) : "Pending"}
          />
          <Metric
            label="Blocked risk"
            tone="rose"
            value={report ? formatCurrency(report.blocked_spend_cents) : formatOptionalCurrency(money.blockedSpendCents)}
          />
          <Metric
            label="Margin"
            tone="amber"
            value={commandReport ? formatPercent(commandReport.final_margin_after_labor_percent) : formatOptionalPercent(money.marginPercent)}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            icon={TrendingUp}
            label={report ? "Profit outcome generated" : "Profit outcome awaiting run"}
            tone={report ? "emerald" : "amber"}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Recommendation">
        {report ? (
          <FactGrid>
            <Fact label="Blocked risk" value={formatCurrency(report.blocked_spend_cents)} />
            <Fact label="Policy violations" value={String(report.policy_violations)} />
            <Fact label="Recommendation" value={report.recommendation} />
            <Fact label="Report ID" value={report.id} />
          </FactGrid>
        ) : (
          <EmptyState>Profit outcome appears after the client operation run completes.</EmptyState>
        )}
      </InspectorSection>

      <InspectorSection title="Outcome markdown">
        {report ? (
          <MarkdownDetails markdown={report.report_markdown} open title="Profit outcome markdown" />
        ) : (
          <EmptyState>Report markdown is confined to this inspector once available.</EmptyState>
        )}
      </InspectorSection>
    </div>
  );
}
