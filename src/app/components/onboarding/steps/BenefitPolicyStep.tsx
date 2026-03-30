import React, { useState } from "react";
import { Gift, ToggleLeft, ToggleRight } from "lucide-react";
import { formatINR } from "../../../utils/helpers";
import type { BenefitPlan } from "../../../types";
import type { BenefitPolicyData, BenefitCategoryRow } from "../hooks/useOnboardingState";

interface Props {
  data: BenefitPolicyData;
  onChange: (d: Partial<BenefitPolicyData>) => void;
}

const TABS: { key: BenefitPlan; label: string; color: string; bg: string; border: string }[] = [
  { key: "Standard", label: "Standard", color: "var(--plan-standard-color)", bg: "var(--plan-standard-bg)", border: "var(--plan-standard-border)" },
  { key: "Premium", label: "Premium", color: "var(--plan-premium-color)", bg: "var(--plan-premium-bg)", border: "var(--plan-premium-border)" },
  { key: "Executive", label: "Executive", color: "var(--plan-executive-color)", bg: "var(--plan-executive-bg)", border: "var(--plan-executive-border)" },
];

export function BenefitPolicyStep({ data, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<BenefitPlan>("Standard");
  const rows = data[activeTab];
  const activeTabMeta = TABS.find((t) => t.key === activeTab)!;

  const totalMonthly = rows
    .filter((r) => r.enabled)
    .reduce((s, r) => s + r.monthlyLimit, 0);

  const updateRow = (idx: number, patch: Partial<BenefitCategoryRow>) => {
    const updated = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange({ [activeTab]: updated });
  };

  return (
    <div>
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.iconWrap}>
          <Gift size={24} />
        </div>
        <div>
          <h2 style={styles.title}>Benefit Policy</h2>
          <p style={styles.subtitle}>
            Configure benefit categories and limits for each salary band.
            Toggle categories on/off and set monthly limits.
          </p>
        </div>
      </div>

      {/* ─── Tabs ─────────────────────────────────────────────────── */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tab,
              background: activeTab === tab.key ? tab.bg : "transparent",
              color: activeTab === tab.key ? tab.color : "var(--color-muted-foreground)",
              borderColor: activeTab === tab.key ? tab.border : "transparent",
              fontWeight: activeTab === tab.key ? 600 : 400,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: tab.color,
                display: "inline-block",
                marginRight: 8,
              }}
            />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Category Table ───────────────────────────────────────── */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "8%" }}>Enable</th>
              <th style={{ ...styles.th, width: "28%" }}>Category</th>
              <th style={{ ...styles.th, width: "22%", textAlign: "right" }}>
                Monthly Limit
              </th>
              <th style={{ ...styles.th, width: "18%", textAlign: "center" }}>
                Bill Required
              </th>
              <th style={{ ...styles.th, width: "18%", textAlign: "center" }}>
                Carry Forward
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  opacity: row.enabled ? 1 : 0.5,
                  transition: "opacity 0.15s ease",
                }}
              >
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <button
                    onClick={() => updateRow(idx, { enabled: !row.enabled })}
                    style={styles.toggleBtn}
                    aria-label={`Toggle ${row.name}`}
                  >
                    {row.enabled ? (
                      <ToggleRight
                        size={28}
                        style={{ color: activeTabMeta.color }}
                      />
                    ) : (
                      <ToggleLeft
                        size={28}
                        style={{ color: "var(--color-muted-foreground)" }}
                      />
                    )}
                  </button>
                </td>
                <td style={styles.td}>
                  <span style={{ fontWeight: 500 }}>{row.name}</span>
                </td>
                <td style={{ ...styles.td, textAlign: "right" }}>
                  <div style={styles.limitWrap}>
                    <span style={styles.limitPrefix}>₹</span>
                    <input
                      type="number"
                      style={styles.limitInput}
                      value={row.monthlyLimit}
                      min={0}
                      step={500}
                      disabled={!row.enabled}
                      onChange={(e) =>
                        updateRow(idx, {
                          monthlyLimit: Math.max(0, Number(e.target.value)),
                        })
                      }
                    />
                  </div>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={row.billRequired}
                    disabled={!row.enabled}
                    onChange={(e) =>
                      updateRow(idx, { billRequired: e.target.checked })
                    }
                    style={styles.checkbox}
                  />
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={row.carryForward}
                    disabled={!row.enabled}
                    onChange={(e) =>
                      updateRow(idx, { carryForward: e.target.checked })
                    }
                    style={styles.checkbox}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Total ────────────────────────────────────────────────── */}
      <div
        style={{
          ...styles.totalBar,
          borderColor: activeTabMeta.border,
          background: activeTabMeta.bg,
        }}
      >
        <span style={styles.totalLabel}>
          Total Monthly Benefit Budget ({activeTab})
        </span>
        <span style={{ ...styles.totalValue, color: activeTabMeta.color }}>
          {formatINR(totalMonthly)}/mo
        </span>
        <span style={styles.totalAnnual}>
          {formatINR(totalMonthly * 12)}/yr per employee
        </span>
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
  tabBar: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 20px",
    border: "1.5px solid transparent",
    borderRadius: "var(--rounded-md)",
    cursor: "pointer",
    fontSize: "var(--text-sm)",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    background: "transparent",
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
    padding: "10px 16px",
    borderBottom: "1px solid var(--color-border)",
    verticalAlign: "middle" as const,
  },
  toggleBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  limitWrap: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-sm)",
    overflow: "hidden",
    background: "var(--color-background)",
  },
  limitPrefix: {
    padding: "6px 8px",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    background: "var(--color-card)",
    borderRight: "1px solid var(--color-border)",
    color: "var(--color-muted-foreground)",
  },
  limitInput: {
    border: "none",
    outline: "none",
    padding: "6px 10px",
    width: 90,
    fontSize: "var(--text-sm)",
    fontFamily: "inherit",
    textAlign: "right" as const,
    fontVariantNumeric: "tabular-nums",
  },
  checkbox: {
    width: 16,
    height: 16,
    cursor: "pointer",
    accentColor: "var(--brand-navy)",
  },
  totalBar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--color-border)",
  },
  totalLabel: {
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    flex: 1,
  },
  totalValue: {
    fontSize: "var(--text-xl)",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  totalAnnual: {
    fontSize: "var(--text-xs)",
    color: "var(--color-muted-foreground)",
  },
};
