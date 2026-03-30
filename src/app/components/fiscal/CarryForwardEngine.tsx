"use client";

import React, { useState } from "react";
import { Save, Info, ArrowRightLeft, ChevronDown } from "lucide-react";
import type { CarryForwardRule, AllowanceCategory } from "../../types";

const CATEGORIES: { key: AllowanceCategory; label: string }[] = [
  { key: "food", label: "Food & Meals" },
  { key: "fuel", label: "Fuel & Travel" },
  { key: "communication", label: "Communication" },
  { key: "lta", label: "Leave Travel Allowance" },
  { key: "hra", label: "House Rent Allowance" },
  { key: "nps", label: "NPS Contribution" },
  { key: "professional_pursuit", label: "Professional Pursuit" },
  { key: "gadget", label: "Gadgets & Equipment" },
  { key: "other", label: "Other Allowances" },
];

const ACTION_LABELS: Record<CarryForwardRule["action"], string> = {
  carry_forward: "Carry Forward",
  encash: "Encash",
  lapse: "Lapse",
};

export function CarryForwardEngine() {
  const [rules, setRules] = useState<CarryForwardRule[]>(
    CATEGORIES.map((c) => ({
      allowanceCategory: c.key,
      action: "lapse" as const,
      encashmentTaxable: true,
    }))
  );
  const [defaultAction, setDefaultAction] = useState<CarryForwardRule["action"]>("lapse");
  const [saved, setSaved] = useState(false);

  const updateRule = (idx: number, patch: Partial<CarryForwardRule>) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const applyToAll = () => {
    setRules((prev) =>
      prev.map((r) => ({
        ...r,
        action: defaultAction,
        encashmentTaxable: defaultAction === "encash" ? true : r.encashmentTaxable,
      }))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Info Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: 16,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 10,
        }}
      >
        <Info size={18} style={{ color: "var(--brand-blue)", flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "#1e40af" }}>
          <strong>Tax implications:</strong> Encashed amounts are added to taxable income under
          &quot;Income from Salary&quot; and will attract TDS at the employee&apos;s applicable slab rate.
          Carry-forward balances remain tax-free until utilized. Lapsed amounts are
          non-recoverable and non-taxable.
        </div>
      </div>

      {/* Default Action + Apply All */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: 16,
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 10,
        }}
      >
        <ArrowRightLeft size={16} style={{ color: "var(--brand-navy)" }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>Default action:</span>
        <div style={{ position: "relative" }}>
          <select
            value={defaultAction}
            onChange={(e) => setDefaultAction(e.target.value as CarryForwardRule["action"])}
            style={selectStyle}
          >
            <option value="carry_forward">Carry Forward</option>
            <option value="encash">Encash</option>
            <option value="lapse">Lapse</option>
          </select>
          <ChevronDown
            size={14}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }}
          />
        </div>
        <button onClick={applyToAll} style={applyBtnStyle}>
          Apply to All
        </button>
      </div>

      {/* Rules Table */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-background)" }}>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Action</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Taxable on Encash</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, idx) => {
              const cat = CATEGORIES.find((c) => c.key === rule.allowanceCategory);
              return (
                <tr
                  key={rule.allowanceCategory}
                  style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 500, color: "var(--brand-navy)" }}>
                      {cat?.label ?? rule.allowanceCategory}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <select
                        value={rule.action}
                        onChange={(e) =>
                          updateRule(idx, { action: e.target.value as CarryForwardRule["action"] })
                        }
                        style={{
                          ...selectStyle,
                          background:
                            rule.action === "carry_forward"
                              ? "#ecfdf5"
                              : rule.action === "encash"
                              ? "#fef3c7"
                              : "#fef2f2",
                          borderColor:
                            rule.action === "carry_forward"
                              ? "#6ee7b7"
                              : rule.action === "encash"
                              ? "#fcd34d"
                              : "#fca5a5",
                        }}
                      >
                        <option value="carry_forward">Carry Forward</option>
                        <option value="encash">Encash</option>
                        <option value="lapse">Lapse</option>
                      </select>
                      <ChevronDown
                        size={14}
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }}
                      />
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <label style={{ cursor: rule.action === "encash" ? "pointer" : "not-allowed" }}>
                      <input
                        type="checkbox"
                        checked={rule.encashmentTaxable}
                        disabled={rule.action !== "encash"}
                        onChange={(e) => updateRule(idx, { encashmentTaxable: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: "var(--brand-navy)", cursor: "inherit" }}
                      />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={handleSave} style={saveButtonStyle}>
          <Save size={16} />
          Save Rules
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: "var(--brand-green)", fontWeight: 500 }}>
            Carry-forward rules saved
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 14,
};

const selectStyle: React.CSSProperties = {
  appearance: "none",
  padding: "6px 32px 6px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  background: "var(--color-card)",
  cursor: "pointer",
  color: "#374151",
};

const applyBtnStyle: React.CSSProperties = {
  padding: "7px 16px",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  background: "var(--color-card)",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--brand-navy)",
  cursor: "pointer",
  transition: "background 0.15s",
};

const saveButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 20px",
  background: "var(--brand-navy)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
