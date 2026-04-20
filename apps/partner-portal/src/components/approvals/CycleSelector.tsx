"use client";

import type { CSSProperties } from "react";
import { CalendarDays, Lock } from "lucide-react";
import type { Cycle } from "@partner-portal/shared";
import { font, formatDate } from "./constants";

interface CycleSelectorProps {
  cycles: Cycle[];
  selectedCycleId: string;
  onCycleChange: (cycleId: string) => void;
}

const labelStyle: CSSProperties = {
  ...font,
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  color: "var(--color-muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const selectStyle: CSSProperties = {
  ...font,
  padding: "var(--space-2) var(--space-3)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  cursor: "pointer",
  outline: "none",
  minWidth: 180,
};

export function CycleSelector({ cycles, selectedCycleId, onCycleChange }: CycleSelectorProps) {
  const selected = cycles.find((c) => c.id === selectedCycleId);
  const isClosed = selected?.status === "closed";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={labelStyle}>Cycle</span>
        <select
          value={selectedCycleId}
          onChange={(e) => onCycleChange(e.target.value)}
          style={selectStyle}
          aria-label="Select cycle"
        >
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} {c.status === "closed" ? "(closed)" : "(active)"}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            padding: "var(--space-2) var(--space-3)",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--rounded-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <CalendarDays size={14} style={{ color: "var(--color-muted-foreground)" }} />
            <div style={{ ...font, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Submission cutoff
              </span>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-foreground)" }}>
                {formatDate(selected.submissionCutoff)}
              </span>
            </div>
          </div>
          <div style={{ width: 1, height: 24, backgroundColor: "var(--color-border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <CalendarDays size={14} style={{ color: "var(--color-muted-foreground)" }} />
            <div style={{ ...font, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Payroll cutoff
              </span>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-foreground)" }}>
                {formatDate(selected.payrollCutoff)}
              </span>
            </div>
          </div>
        </div>
      )}

      {isClosed && (
        <span
          style={{
            ...font,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: "var(--rounded-full)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--color-muted-foreground)",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <Lock size={12} /> Read-only — cycle closed
        </span>
      )}
    </div>
  );
}
