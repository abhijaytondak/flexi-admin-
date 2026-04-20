"use client";

import type { CSSProperties } from "react";
import { Calendar, CalendarCheck, Layers, Rocket, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CompanyPolicyConfig, ConfigurationApproach } from "./types";
import { cardBase, font, sectionSubtitle, sectionTitle } from "./shared";

interface Props {
  config: CompanyPolicyConfig;
  /** Dev-only handler — swap Configuration Approach between Company-Wide and Slab-Based. */
  onToggleApproach: (next: ConfigurationApproach) => void;
}

const ICONS: Record<string, LucideIcon> = {
  disbursement: Wallet,
  cycle: Calendar,
  payroll: CalendarCheck,
  approach: Layers,
  goLive: Rocket,
};

interface Row {
  key: keyof typeof ICONS;
  label: string;
  value: string;
  hint: string;
}

export function CompanyConfigBlock({ config, onToggleApproach }: Props) {
  const rows: Row[] = [
    {
      key: "disbursement",
      label: "Disbursement Model",
      value: config.disbursementModel,
      hint: "How benefits are realised each cycle.",
    },
    {
      key: "cycle",
      label: "Cycle Date",
      value: config.cycleDate,
      hint: "Employee submission cutoff per cycle.",
    },
    {
      key: "payroll",
      label: "Payroll Cutoff Date",
      value: config.payrollCutoffDate,
      hint: "HR action deadline for the cycle.",
    },
    {
      key: "approach",
      label: "Configuration Approach",
      value: config.configurationApproach,
      hint: "Drives whether limits are shared or slab-specific.",
    },
    {
      key: "goLive",
      label: "Go-Live Date",
      value: config.goLiveDate,
      hint: "When this company started on SalarySe.",
    },
  ];

  const rowStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "44px 1fr minmax(180px, auto)",
    gap: "var(--space-4)",
    alignItems: "center",
    padding: "var(--space-4) var(--space-5)",
    borderBottom: "1px solid var(--color-border)",
  };

  const iconWrapStyle: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: "var(--rounded-md)",
    backgroundColor: "var(--brand-accent-alpha-8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <section
      style={{
        ...cardBase,
        marginBottom: "var(--space-6)",
      }}
      aria-label="Company-Level Configuration"
    >
      <header
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={sectionTitle}>Company-Level Configuration</h2>
          <p style={sectionSubtitle}>
            Read-only in v0 — contact the SalarySe team to request changes.
          </p>
        </div>
        <DemoApproachToggle
          current={config.configurationApproach}
          onChange={onToggleApproach}
        />
      </header>

      <div>
        {rows.map((row, idx) => {
          const Icon = ICONS[row.key];
          const isLast = idx === rows.length - 1;
          return (
            <div
              key={row.key}
              style={{
                ...rowStyle,
                borderBottom: isLast ? "none" : rowStyle.borderBottom,
              }}
            >
              <span style={iconWrapStyle} aria-hidden="true">
                <Icon size={18} style={{ color: "var(--brand-accent)" }} />
              </span>
              <div>
                <div
                  style={{
                    ...font,
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "var(--color-muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {row.label}
                </div>
                <div
                  style={{
                    ...font,
                    fontSize: "var(--text-sm)",
                    color: "var(--color-muted-foreground)",
                    marginTop: 2,
                  }}
                >
                  {row.hint}
                </div>
              </div>
              <div
                style={{
                  ...font,
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                  textAlign: "right",
                }}
              >
                {row.value}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Dev-only layout toggle ─────────────────────────────────────────────── */

function DemoApproachToggle({
  current,
  onChange,
}: {
  current: ConfigurationApproach;
  onChange: (next: ConfigurationApproach) => void;
}) {
  const options: ConfigurationApproach[] = ["Company-Wide", "Slab-Based"];
  const wrap: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "6px 10px",
    border: "1px dashed var(--brand-accent)",
    borderRadius: "var(--rounded-md)",
    backgroundColor: "var(--brand-accent-alpha-8)",
  };
  const label: CSSProperties = {
    ...font,
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--brand-accent)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  const segment: CSSProperties = {
    display: "inline-flex",
    borderRadius: "var(--rounded-md)",
    backgroundColor: "#fff",
    border: "1px solid var(--color-border)",
    overflow: "hidden",
  };
  const seg = (active: boolean): CSSProperties => ({
    ...font,
    padding: "4px 10px",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: active ? "var(--brand-accent)" : "transparent",
    color: active ? "#fff" : "var(--color-foreground)",
    transition: "background-color 120ms",
  });

  return (
    <div style={wrap} role="group" aria-label="Demo: switch layout">
      <span style={label}>Demo: switch layout</span>
      <div style={segment}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={seg(current === opt)}
            aria-pressed={current === opt}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
