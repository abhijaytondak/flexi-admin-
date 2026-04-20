"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight, Info, Search, Sparkles } from "lucide-react";
import { DEMO_EMPLOYEES, type Employee } from "@partner-portal/shared";
import type { AutoApproveConfig } from "./types";
import { formatRupees } from "./mockData";
import { ReadOnlyToggle } from "./ReadOnlyToggle";
import { cardBase, font, sectionSubtitle, sectionTitle } from "./shared";

interface Props {
  config: AutoApproveConfig;
}

/**
 * Auto-Approve Configuration (PRD §4.2) — collapsible, read-only in v0.
 * Surfaces three additive rule types (category / amount threshold / employee-level)
 * and explanatory notes about OR-logic and Uplift AI coexistence.
 */
export function AutoApprovePanel({ config }: Props) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");

  const trustedSet = useMemo(
    () => new Set(config.trustedEmployeeIds),
    [config.trustedEmployeeIds]
  );

  const filteredEmployees = useMemo(() => {
    if (!query.trim()) return DEMO_EMPLOYEES;
    const q = query.trim().toLowerCase();
    return DEMO_EMPLOYEES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q)
    );
  }, [query]);

  const enabledCategoryCount = config.categoryRules.filter((r) => r.enabled).length;

  return (
    <section
      style={{ ...cardBase, marginTop: "var(--space-6)" }}
      aria-label="Auto-Approve Configuration"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="auto-approve-panel-body"
        style={{
          ...font,
          all: "unset",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          width: "100%",
          padding: "var(--space-4) var(--space-5)",
          cursor: "pointer",
          backgroundColor: open ? "var(--color-surface)" : "transparent",
          borderBottom: open ? "1px solid var(--color-border)" : "none",
          transition: "background-color 150ms",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--rounded-md)",
              backgroundColor: "var(--brand-accent-alpha-8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <Sparkles size={16} style={{ color: "var(--brand-accent)" }} />
          </span>
          {open ? (
            <ChevronDown size={16} style={{ color: "var(--color-muted-foreground)" }} />
          ) : (
            <ChevronRight size={16} style={{ color: "var(--color-muted-foreground)" }} />
          )}
          <div>
            <h2 style={sectionTitle}>Auto-Approve Configuration</h2>
            <p style={sectionSubtitle}>
              {enabledCategoryCount} categor{enabledCategoryCount === 1 ? "y" : "ies"} ·
              Threshold {formatRupees(config.thresholdAmount)} ·
              {" "}{config.trustedEmployeeIds.length} trusted employees
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--color-muted-foreground)",
          }}
        >
          Read-only
        </span>
      </button>

      {open && (
        <div
          id="auto-approve-panel-body"
          style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}
        >
          <CategoryRulesBlock rules={config.categoryRules} />
          <ThresholdBlock amount={config.thresholdAmount} />
          <EmployeeRulesBlock
            employees={filteredEmployees}
            trusted={trustedSet}
            query={query}
            onQueryChange={setQuery}
          />
          <NotesBlock />
        </div>
      )}
    </section>
  );
}

/* ─── Sub-blocks ─────────────────────────────────────────────────────────── */

function BlockHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div style={{ marginBottom: "var(--space-3)" }}>
      <h3
        style={{
          ...font,
          margin: 0,
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--color-foreground)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          ...font,
          margin: "2px 0 0",
          fontSize: "var(--text-sm)",
          color: "var(--color-muted-foreground)",
        }}
      >
        {hint}
      </p>
    </div>
  );
}

function CategoryRulesBlock({ rules }: { rules: AutoApproveConfig["categoryRules"] }) {
  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "var(--space-2)",
  };
  const rowStyle: CSSProperties = {
    ...font,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space-3)",
    padding: "var(--space-3)",
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
  };
  return (
    <div>
      <BlockHeader
        title="Category-level auto-approve"
        hint="Claims in these categories auto-approve regardless of amount."
      />
      <div style={gridStyle}>
        {rules.map((rule) => (
          <div key={rule.category} style={rowStyle}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", fontWeight: 500 }}>
              {rule.label}
            </span>
            <ReadOnlyToggle on={rule.enabled} label={`${rule.label} auto-approve`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThresholdBlock({ amount }: { amount: number }) {
  return (
    <div>
      <BlockHeader
        title="Amount threshold"
        hint="Any claim below this amount auto-approves, regardless of category."
      />
      <div
        style={{
          ...font,
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-md)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
          Auto-approve claims below
        </span>
        <input
          type="text"
          readOnly
          aria-readonly="true"
          value={formatRupees(amount)}
          style={{
            ...font,
            width: 120,
            padding: "6px 10px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--rounded-sm)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-foreground)",
            backgroundColor: "#FFFFFF",
            opacity: 0.75,
            cursor: "not-allowed",
          }}
        />
      </div>
    </div>
  );
}

function EmployeeRulesBlock({
  employees,
  trusted,
  query,
  onQueryChange,
}: {
  employees: Employee[];
  trusted: Set<string>;
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div>
      <BlockHeader
        title="Employee-level auto-approve"
        hint="Trusted employees' claims auto-approve regardless of category or amount."
      />
      <div
        style={{
          position: "relative",
          marginBottom: "var(--space-3)",
        }}
      >
        <Search
          size={14}
          style={{
            position: "absolute",
            top: "50%",
            left: 12,
            transform: "translateY(-50%)",
            color: "var(--color-muted-foreground)",
          }}
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search employees by name, ID, department…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            ...font,
            width: "100%",
            padding: "8px 12px 8px 34px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--rounded-md)",
            fontSize: "var(--text-sm)",
            color: "var(--color-foreground)",
            backgroundColor: "#FFFFFF",
            outline: "none",
          }}
        />
      </div>

      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-md)",
          overflow: "hidden",
          backgroundColor: "var(--color-card)",
          maxHeight: 260,
          overflowY: "auto",
        }}
      >
        {employees.length === 0 ? (
          <div
            style={{
              ...font,
              padding: "var(--space-4)",
              textAlign: "center",
              color: "var(--color-muted-foreground)",
              fontSize: "var(--text-sm)",
            }}
          >
            No employees match “{query}”.
          </div>
        ) : (
          employees.map((emp, idx) => (
            <div
              key={emp.id}
              style={{
                ...font,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                borderBottom:
                  idx === employees.length - 1 ? "none" : "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: emp.color,
                    color: "#fff",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {emp.initials}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--color-foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {emp.name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-muted-foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {emp.designation}
                    {emp.department ? ` · ${emp.department}` : ""}
                  </div>
                </div>
              </div>
              <ReadOnlyToggle
                on={trusted.has(emp.id)}
                label={`${emp.name} auto-approve`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function NotesBlock() {
  const note: CSSProperties = {
    ...font,
    display: "flex",
    gap: "var(--space-3)",
    padding: "var(--space-3) var(--space-4)",
    backgroundColor: "var(--brand-accent-alpha-8)",
    border: "1px solid var(--brand-accent-alpha-20)",
    borderRadius: "var(--rounded-md)",
    fontSize: "var(--text-sm)",
    color: "var(--color-foreground)",
    lineHeight: 1.5,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <div style={note}>
        <Info size={16} style={{ color: "var(--brand-accent)", flexShrink: 0, marginTop: 2 }} />
        <span>
          Rules are additive — if any rule matches, the claim is auto-approved (OR logic).
        </span>
      </div>
      <div style={note}>
        <Info size={16} style={{ color: "var(--brand-accent)", flexShrink: 0, marginTop: 2 }} />
        <span>
          Auto-approve rules coexist with Uplift AI flagging. A claim can be auto-approved by
          rule but still flagged for HR visibility — the flag is shown but the claim proceeds.
        </span>
      </div>
    </div>
  );
}
