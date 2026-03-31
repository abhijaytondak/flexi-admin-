"use client";

import React, { useState } from "react";
import {
  Calendar,

  Lock,
  Bell,
  BellOff,
  Save,

} from "lucide-react";
import { toast } from "sonner";
import { useFiscalYear } from "../../hooks/useFiscalYear";

export function DeadlineManager() {
  const [payrollDay, setPayrollDay] = useState(1);
  const [offsetDays, setOffsetDays] = useState(7);
  const [autoLock, setAutoLock] = useState(true);
  const [emailReminder, setEmailReminder] = useState(true);
  const [slackReminder, setSlackReminder] = useState(false);
  const [saved, setSaved] = useState(false);

  const { currentFY, currentCycle } = useFiscalYear("April", payrollDay, offsetDays);

  const handleSave = () => {
    try {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Deadline configuration saved successfully");
    } catch {
      toast.error("Failed to save deadline configuration");
    }
  };

  const deadlinePassed = currentCycle.daysRemaining <= 0;
  const totalCycleDays = Math.ceil(
    (currentCycle.end.getTime() - currentCycle.start.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const elapsedDays = totalCycleDays - currentCycle.daysRemaining;
  const progressPct = Math.min(100, Math.round((elapsedDays / totalCycleDays) * 100));

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Current Cycle Card */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Calendar size={18} style={{ color: "var(--brand-navy)" }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--brand-navy)" }}>
            Current Cycle &mdash; {currentFY}
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <InfoTile label="Payroll Date" value={fmt(new Date(currentCycle.end.getFullYear(), currentCycle.end.getMonth(), payrollDay))} />
          <InfoTile label="Submission Deadline" value={fmt(currentCycle.deadline)} />
          <InfoTile
            label="Days Remaining"
            value={deadlinePassed ? "Passed" : `${currentCycle.daysRemaining} days`}
          />
          <InfoTile label="Status" value={deadlinePassed ? "Locked" : "Open"} badge badgeColor={deadlinePassed ? "var(--brand-red)" : "var(--brand-green)"} />
        </div>

        {/* Countdown bar */}
        <div style={{ marginBottom: 4, fontSize: 12, color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
          <span>{fmt(currentCycle.start)}</span>
          <span>{fmt(currentCycle.end)}</span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "var(--color-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              borderRadius: 4,
              background: deadlinePassed
                ? "var(--brand-red)"
                : progressPct > 80
                ? "var(--brand-amber)"
                : "var(--brand-green)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Configuration */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "var(--brand-navy)" }}>
          Cycle Configuration
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Payroll Day */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
              Payroll Day (1-28)
            </label>
            <input
              type="number"
              min={1}
              max={28}
              value={payrollDay}
              onChange={(e) => setPayrollDay(Math.max(1, Math.min(28, Number(e.target.value))))}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 14,
                background: "var(--color-background)",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Offset Days */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
              Deadline Offset (1-15 days before payroll)
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={offsetDays}
              onChange={(e) => setOffsetDays(Math.max(1, Math.min(15, Number(e.target.value))))}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 14,
                background: "var(--color-background)",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ToggleRow
            icon={<Lock size={16} />}
            label="Auto-lock submissions after deadline"
            checked={autoLock}
            onChange={setAutoLock}
          />
          <ToggleRow
            icon={<Bell size={16} />}
            label="Email reminders (3 days, 1 day before deadline)"
            checked={emailReminder}
            onChange={setEmailReminder}
          />
          <ToggleRow
            icon={<BellOff size={16} />}
            label="Slack notifications"
            checked={slackReminder}
            onChange={setSlackReminder}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
          <button onClick={handleSave} style={saveButtonStyle}>
            <Save size={16} />
            Save Configuration
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: "var(--brand-green)", fontWeight: 500 }}>
              Settings saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function InfoTile({
  label,
  value,
  badge,
  badgeColor,
}: {
  label: string;
  value: string;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      {badge ? (
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            background: badgeColor,
          }}
        >
          {value}
        </span>
      ) : (
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--brand-navy)" }}>{value}</div>
      )}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        padding: "8px 12px",
        borderRadius: 8,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ color: "var(--brand-navy)", display: "flex" }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, color: "#374151" }}>{label}</span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? "var(--brand-green)" : "#d1d5db",
          position: "relative",
          transition: "background 0.2s",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </span>
    </label>
  );
}

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
  transition: "opacity 0.15s",
};
