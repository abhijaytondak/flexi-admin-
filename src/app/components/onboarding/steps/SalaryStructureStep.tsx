import React from "react";
import { Wallet, Info } from "lucide-react";
import { formatINR } from "../../../utils/helpers";
import type { SalaryStructureData, SalaryComponent } from "../hooks/useOnboardingState";

interface Props {
  data: SalaryStructureData;
  onChange: (d: Partial<SalaryStructureData>) => void;
}

export function SalaryStructureStep({ data, onChange }: Props) {
  const { components, sampleCtc } = data;
  const wageTotal = components
    .filter((c) => c.inclusion)
    .reduce((s, c) => s + c.percent, 0);
  const totalPercent = components.reduce((s, c) => s + c.percent, 0);

  const updateComponent = (idx: number, patch: Partial<SalaryComponent>) => {
    const updated = components.map((c, i) =>
      i === idx ? { ...c, ...patch } : c
    );
    onChange({ components: updated });
  };

  return (
    <div>
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.iconWrap}>
          <Wallet size={24} />
        </div>
        <div>
          <h2 style={styles.title}>Salary Structure</h2>
          <p style={styles.subtitle}>
            Configure salary components per the New Wage Code. Wage components
            (inclusion = yes) must total at least 50% of CTC.
          </p>
        </div>
      </div>

      {/* ─── Sample CTC ──────────────────────────────────────────── */}
      <div style={styles.ctcBar}>
        <label style={styles.ctcLabel}>Sample Annual CTC for preview</label>
        <div style={styles.ctcInputWrap}>
          <span style={styles.ctcPrefix}>₹</span>
          <input
            type="number"
            style={styles.ctcInput}
            value={sampleCtc}
            onChange={(e) => onChange({ sampleCtc: Number(e.target.value) || 0 })}
            min={0}
            step={50000}
          />
        </div>
      </div>

      {/* ─── Components Table ─────────────────────────────────────── */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "30%" }}>Component</th>
              <th style={{ ...styles.th, width: "12%", textAlign: "center" }}>%</th>
              <th style={{ ...styles.th, width: "18%", textAlign: "right" }}>Monthly</th>
              <th style={{ ...styles.th, width: "18%", textAlign: "right" }}>Annual</th>
              <th style={{ ...styles.th, width: "22%", textAlign: "center" }}>
                Wage Code
                <Info
                  size={13}
                  style={{ marginLeft: 4, verticalAlign: "middle", opacity: 0.5 }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp, idx) => {
              const annual = Math.round((comp.percent / 100) * sampleCtc);
              const monthly = Math.round(annual / 12);
              return (
                <tr
                  key={comp.key}
                  style={{
                    backgroundColor: comp.inclusion
                      ? "var(--brand-green-light)"
                      : "transparent",
                  }}
                >
                  <td style={styles.td}>
                    <span style={styles.compLabel}>{comp.label}</span>
                    {comp.optional && (
                      <span style={styles.optionalBadge}>Optional</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <input
                      type="number"
                      style={styles.percentInput}
                      value={comp.percent}
                      min={0}
                      max={100}
                      onChange={(e) =>
                        updateComponent(idx, {
                          percent: Math.min(100, Math.max(0, Number(e.target.value))),
                        })
                      }
                    />
                  </td>
                  <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {formatINR(monthly)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {formatINR(annual)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {comp.inclusion ? (
                      <span style={styles.includedBadge}>Included</span>
                    ) : (
                      <span style={styles.excludedBadge}>Excluded</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "var(--brand-navy-alpha-8)" }}>
              <td style={{ ...styles.td, fontWeight: 600 }}>Total</td>
              <td
                style={{
                  ...styles.td,
                  textAlign: "center",
                  fontWeight: 700,
                  color:
                    totalPercent === 100
                      ? "var(--brand-green)"
                      : "var(--brand-red)",
                }}
              >
                {totalPercent}%
              </td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {formatINR(Math.round(sampleCtc / 12))}
              </td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {formatINR(sampleCtc)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ─── Wage Code Summary ────────────────────────────────────── */}
      <div style={styles.summaryBar}>
        <div
          style={{
            ...styles.summaryItem,
            borderColor: wageTotal >= 50 ? "var(--brand-green-border)" : "var(--brand-red-border)",
            background: wageTotal >= 50 ? "var(--brand-green-light)" : "var(--brand-red-light)",
          }}
        >
          <span style={styles.summaryLabel}>Wage Components Total</span>
          <span
            style={{
              ...styles.summaryValue,
              color: wageTotal >= 50 ? "var(--brand-green)" : "var(--brand-red)",
            }}
          >
            {wageTotal}%
          </span>
          <span style={styles.summaryHint}>
            {wageTotal >= 50 ? "Compliant" : "Must be >= 50%"}
          </span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Non-Wage Components</span>
          <span style={styles.summaryValue}>{100 - wageTotal}%</span>
          <span style={styles.summaryHint}>Excluded from wage calculation</span>
        </div>
      </div>
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
  ctcBar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 20px",
    background: "var(--brand-blue-light)",
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--brand-blue-border)",
    marginBottom: 24,
  },
  ctcLabel: {
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    flex: 1,
  },
  ctcInputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
    background: "var(--color-background)",
    overflow: "hidden",
  },
  ctcPrefix: {
    padding: "8px 10px",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    background: "var(--color-card)",
    borderRight: "1px solid var(--color-border)",
    color: "var(--color-muted-foreground)",
  },
  ctcInput: {
    border: "none",
    outline: "none",
    padding: "8px 12px",
    fontSize: "var(--text-sm)",
    fontFamily: "inherit",
    width: 140,
    fontVariantNumeric: "tabular-nums",
  },
  tableWrap: {
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--color-border)",
    overflow: "hidden",
    marginBottom: 20,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "var(--text-sm)",
  },
  th: {
    padding: "12px 16px",
    fontWeight: 600,
    fontSize: "var(--text-xs)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    color: "var(--color-muted-foreground)",
    background: "var(--color-card)",
    borderBottom: "1px solid var(--color-border)",
    textAlign: "left" as const,
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--color-border)",
  },
  compLabel: {
    fontWeight: 500,
  },
  optionalBadge: {
    marginLeft: 8,
    padding: "2px 8px",
    borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)",
    background: "var(--brand-amber-light)",
    color: "var(--brand-amber)",
    fontWeight: 500,
    border: "1px solid var(--brand-amber-border)",
  },
  percentInput: {
    width: 56,
    padding: "6px 8px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-sm)",
    textAlign: "center" as const,
    fontSize: "var(--text-sm)",
    fontFamily: "inherit",
    fontVariantNumeric: "tabular-nums",
    outline: "none",
  },
  includedBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    background: "var(--brand-green-light)",
    color: "var(--brand-green)",
    border: "1px solid var(--brand-green-border)",
  },
  excludedBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    background: "var(--color-card)",
    color: "var(--color-muted-foreground)",
    border: "1px solid var(--color-border)",
  },
  summaryBar: {
    display: "flex",
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    padding: "16px 20px",
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--color-border)",
    background: "var(--color-background)",
  },
  summaryLabel: {
    display: "block",
    fontSize: "var(--text-xs)",
    color: "var(--color-muted-foreground)",
    fontWeight: 500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    marginBottom: 4,
  },
  summaryValue: {
    display: "block",
    fontSize: "var(--text-xl)",
    fontWeight: 700,
  },
  summaryHint: {
    display: "block",
    fontSize: "var(--text-xs)",
    color: "var(--color-muted-foreground)",
    marginTop: 2,
  },
};
