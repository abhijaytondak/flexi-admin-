import type { CSSProperties } from "react";
import type { CategoryLimitRow } from "./types";
import { formatRupees } from "./mockData";
import { YesNoBadge } from "./YesNoBadge";
import { font } from "./shared";

interface Props {
  rows: CategoryLimitRow[];
  compact?: boolean;
}

/**
 * Flat category & limits table — PRD §4.2 columns:
 * Category | Monthly Limit (₹) | Annual Limit (₹) | Carry-Forward | Bill Required | Multi-Month Allocation.
 * Same layout is used for Company-Wide and inside each Slab-Based accordion panel.
 */
export function CategoryLimitsTable({ rows, compact = false }: Props) {
  const columns = "minmax(220px, 2fr) 140px 160px 120px 120px 160px";

  const headerCell: CSSProperties = {
    ...font,
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--color-muted-foreground)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  };

  const amountCell: CSSProperties = {
    ...font,
    fontSize: "var(--text-sm)",
    color: "var(--color-foreground)",
    fontWeight: 500,
  };

  const nameCell: CSSProperties = {
    ...font,
    fontSize: "var(--text-sm)",
    color: "var(--color-foreground)",
    fontWeight: 500,
  };

  if (!rows.length) {
    return (
      <div
        style={{
          ...font,
          padding: compact ? "var(--space-4)" : "var(--space-6)",
          textAlign: "center",
          color: "var(--color-muted-foreground)",
          fontSize: "var(--text-sm)",
        }}
      >
        No categories configured.
      </div>
    );
  }

  return (
    <div
      role="table"
      aria-label="Category limits"
      style={{
        overflowX: "auto",
      }}
    >
      <div
        role="rowgroup"
        style={{
          display: "grid",
          gridTemplateColumns: columns,
          gap: "var(--space-3)",
          padding: compact ? "var(--space-3) var(--space-4)" : "var(--space-3) var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <span style={headerCell} role="columnheader">Category Name</span>
        <span style={headerCell} role="columnheader">Monthly Limit (₹)</span>
        <span style={headerCell} role="columnheader">Annual Limit (₹)</span>
        <span style={headerCell} role="columnheader">Carry-Forward</span>
        <span style={headerCell} role="columnheader">Bill Required</span>
        <span style={headerCell} role="columnheader">Multi-Month Allocation</span>
      </div>

      <div role="rowgroup">
        {rows.map((row, idx) => (
          <div
            key={row.key}
            role="row"
            style={{
              display: "grid",
              gridTemplateColumns: columns,
              gap: "var(--space-3)",
              alignItems: "center",
              padding: compact ? "var(--space-3) var(--space-4)" : "var(--space-3) var(--space-5)",
              borderBottom: idx === rows.length - 1 ? "none" : "1px solid var(--color-border)",
            }}
          >
            <span role="cell" style={nameCell}>{row.label}</span>
            <span role="cell" style={amountCell}>
              {row.monthlyLimit > 0 ? formatRupees(row.monthlyLimit) : "—"}
            </span>
            <span role="cell" style={amountCell}>
              {row.annualLimit > 0 ? formatRupees(row.annualLimit) : "—"}
            </span>
            <span role="cell"><YesNoBadge value={row.carryForward} /></span>
            <span role="cell"><YesNoBadge value={row.billRequired} /></span>
            <span role="cell"><YesNoBadge value={row.multiMonthAllocation} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
