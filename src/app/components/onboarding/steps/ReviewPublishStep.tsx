import React from "react";
import {
  Rocket,
  Building2,
  Wallet,
  Gift,
  Users,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatINR } from "../../../utils/helpers";
import type { BenefitPlan } from "../../../types";
import type {
  ReviewPublishData,
  StepDataMap,
} from "../hooks/useOnboardingState";

interface Props {
  data: ReviewPublishData;
  allData: StepDataMap;
  onChange: (d: Partial<ReviewPublishData>) => void;
}

export function ReviewPublishStep({ data, allData, onChange }: Props) {
  const { CompanyProfile: company, SalaryStructure: salary, BenefitPolicy: benefits, EmployeeImport: employees } = allData;
  const { checklist } = data;

  const toggleCheck = (key: keyof typeof checklist) => {
    onChange({
      checklist: { ...checklist, [key]: !checklist[key] },
    });
  };

  const allChecked =
    checklist.companyVerified &&
    checklist.salaryVerified &&
    checklist.benefitsVerified &&
    checklist.employeesVerified;

  const wageTotal = salary.components
    .filter((c) => c.inclusion)
    .reduce((s, c) => s + c.percent, 0);

  const validEmployees = employees.employees.filter((e) => e.valid);

  const bandCounts: Record<BenefitPlan, number> = { Standard: 0, Premium: 0, Executive: 0 };
  validEmployees.forEach((e) => bandCounts[e.band]++);

  const planColors: Record<BenefitPlan, { color: string; bg: string; border: string }> = {
    Standard: { color: "var(--plan-standard-color)", bg: "var(--plan-standard-bg)", border: "var(--plan-standard-border)" },
    Premium: { color: "var(--plan-premium-color)", bg: "var(--plan-premium-bg)", border: "var(--plan-premium-border)" },
    Executive: { color: "var(--plan-executive-color)", bg: "var(--plan-executive-bg)", border: "var(--plan-executive-border)" },
  };

  return (
    <div>
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.iconWrap}>
          <Rocket size={24} />
        </div>
        <div>
          <h2 style={styles.title}>Review & Publish</h2>
          <p style={styles.subtitle}>
            Review your configuration below. Check each section to confirm, then
            publish to go live.
          </p>
        </div>
      </div>

      {/* ─── Summary Cards ────────────────────────────────────────── */}
      <div style={styles.cardGrid}>
        {/* Company card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Building2 size={18} style={{ color: "var(--brand-navy)" }} />
            <span style={styles.cardTitle}>Company</span>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Name</span>
              <span style={styles.detailValue}>
                {company.companyName || "Not set"}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Industry</span>
              <span style={styles.detailValue}>
                {company.industry || "Not set"}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Size</span>
              <span style={styles.detailValue}>
                {company.companySize || "Not set"}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Fiscal Year</span>
              <span style={styles.detailValue}>
                {company.fiscalYearStart}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>HR Admin</span>
              <span style={styles.detailValue}>
                {company.hrAdminName || "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Salary structure card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Wallet size={18} style={{ color: "var(--brand-navy)" }} />
            <span style={styles.cardTitle}>Salary Structure</span>
          </div>
          <div style={styles.cardBody}>
            {salary.components.map((comp) => (
              <div key={comp.key} style={styles.detailRow}>
                <span style={styles.detailLabel}>{comp.label}</span>
                <span style={styles.detailValue}>
                  {comp.percent}%
                  {comp.inclusion && (
                    <span style={styles.wageTag}>Wage</span>
                  )}
                </span>
              </div>
            ))}
            <div
              style={{
                ...styles.detailRow,
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <span style={{ ...styles.detailLabel, fontWeight: 600 }}>
                Wage Total
              </span>
              <span
                style={{
                  ...styles.detailValue,
                  fontWeight: 700,
                  color:
                    wageTotal >= 50
                      ? "var(--brand-green)"
                      : "var(--brand-red)",
                }}
              >
                {wageTotal}%
              </span>
            </div>
          </div>
        </div>

        {/* Benefits per band card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Gift size={18} style={{ color: "var(--brand-navy)" }} />
            <span style={styles.cardTitle}>Benefits per Band</span>
          </div>
          <div style={styles.cardBody}>
            {(["Standard", "Premium", "Executive"] as BenefitPlan[]).map(
              (plan) => {
                const rows = benefits[plan].filter((r) => r.enabled);
                const total = rows.reduce((s, r) => s + r.monthlyLimit, 0);
                return (
                  <div key={plan} style={styles.bandRow}>
                    <span
                      style={{
                        ...styles.bandBadge,
                        background: planColors[plan].bg,
                        color: planColors[plan].color,
                        borderColor: planColors[plan].border,
                      }}
                    >
                      {plan}
                    </span>
                    <span style={styles.bandCategories}>
                      {rows.length} categories
                    </span>
                    <span style={styles.bandAmount}>
                      {formatINR(total)}/mo
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Employees card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Users size={18} style={{ color: "var(--brand-navy)" }} />
            <span style={styles.cardTitle}>Employees</span>
          </div>
          <div style={styles.cardBody}>
            {employees.skipped ? (
              <div style={styles.skippedInfo}>
                <AlertTriangle
                  size={14}
                  style={{ color: "var(--brand-amber)" }}
                />
                <span>Import skipped -- you can add employees later</span>
              </div>
            ) : validEmployees.length > 0 ? (
              <>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Total Imported</span>
                  <span style={styles.detailValue}>
                    {validEmployees.length}
                  </span>
                </div>
                {(["Standard", "Premium", "Executive"] as BenefitPlan[]).map(
                  (plan) =>
                    bandCounts[plan] > 0 ? (
                      <div key={plan} style={styles.detailRow}>
                        <span style={styles.detailLabel}>{plan}</span>
                        <span style={styles.detailValue}>
                          {bandCounts[plan]}
                        </span>
                      </div>
                    ) : null
                )}
              </>
            ) : (
              <div style={styles.skippedInfo}>
                <AlertTriangle
                  size={14}
                  style={{ color: "var(--brand-amber)" }}
                />
                <span>No employees imported yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Publish Checklist ─────────────────────────────────────── */}
      <div style={styles.checklistCard}>
        <h3 style={styles.checklistTitle}>Publish Checklist</h3>
        <p style={styles.checklistHint}>
          Verify each section before going live.
        </p>

        {[
          { key: "companyVerified" as const, label: "Company profile is correct" },
          { key: "salaryVerified" as const, label: "Salary structure is compliant with New Wage Code" },
          { key: "benefitsVerified" as const, label: "Benefit policies and limits are configured" },
          { key: "employeesVerified" as const, label: employees.skipped ? "Employee import will be done later" : "Employee data has been reviewed" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => toggleCheck(item.key)}
            style={styles.checklistRow}
          >
            {checklist[item.key] ? (
              <CheckSquare
                size={20}
                style={{ color: "var(--brand-green)", flexShrink: 0 }}
              />
            ) : (
              <Square
                size={20}
                style={{
                  color: "var(--color-muted-foreground)",
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontWeight: checklist[item.key] ? 500 : 400,
                color: checklist[item.key]
                  ? "var(--color-foreground)"
                  : "var(--color-muted-foreground)",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Go Live Banner ───────────────────────────────────────── */}
      {allChecked && (
        <div style={styles.goLiveBanner}>
          <CheckCircle2 size={24} style={{ color: "var(--brand-green)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "var(--text-lg)" }}>
              Ready to Go Live!
            </div>
            <div
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-muted-foreground)",
                marginTop: 2,
              }}
            >
              All checks passed. Click "Go Live" in the bottom bar to publish
              your benefits portal.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 28,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: "var(--rounded-lg)",
    background: "var(--brand-navy-alpha-8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--brand-navy)",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "var(--text-xl)",
    fontWeight: 600,
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
    maxWidth: 560,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--color-border)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 20px",
    background: "var(--color-card)",
    borderBottom: "1px solid var(--color-border)",
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: "var(--text-sm)",
  },
  cardBody: {
    padding: "16px 20px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
  },
  detailLabel: {
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
  },
  detailValue: {
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  wageTag: {
    padding: "1px 6px",
    borderRadius: "var(--rounded-sm)",
    fontSize: "var(--text-xs)",
    background: "var(--brand-green-light)",
    color: "var(--brand-green)",
    fontWeight: 500,
  },
  bandRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 0",
  },
  bandBadge: {
    padding: "3px 12px",
    borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    border: "1px solid",
    minWidth: 70,
    textAlign: "center" as const,
  },
  bandCategories: {
    flex: 1,
    fontSize: "var(--text-xs)",
    color: "var(--color-muted-foreground)",
  },
  bandAmount: {
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
  },
  skippedInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
    padding: "4px 0",
  },
  checklistCard: {
    padding: "24px",
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--color-border)",
    marginBottom: 20,
  },
  checklistTitle: {
    margin: 0,
    fontSize: "var(--text-lg)",
    fontWeight: 600,
  },
  checklistHint: {
    margin: "4px 0 16px",
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
  },
  checklistRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: "var(--rounded-md)",
    border: "none",
    background: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left" as const,
    fontSize: "var(--text-sm)",
    fontFamily: "inherit",
    transition: "background 0.15s ease",
  },
  goLiveBanner: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "20px 24px",
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--brand-green-border)",
    background: "var(--brand-green-light)",
  },
};
