"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Users,
  Send,
  Lock,
  Unlock,
  IndianRupee,
  PieChart,
  RefreshCcw,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "../../utils/helpers";
import { useFiscalYear } from "../../hooks/useFiscalYear";

/* ── Mock Data ─────────────────────────────────────────────── */

const MOCK = {
  allocated: 4_500_000,
  utilized: 3_150_000,
  unused: 1_350_000,
  carryForward: 540_000,
  encashment: 405_000,
  lapsed: 405_000,
  submittedCount: 132,
  pendingCount: 18,
  totalEmployees: 150,
};

export function FYEndSummary() {
  const { currentFY, daysUntilFYEnd, isDeclarationWindowOpen } = useFiscalYear();
  const [windowOpen, setWindowOpen] = useState(isDeclarationWindowOpen);
  const [reminderSent, setReminderSent] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);

  const utilizationPct = Math.round((MOCK.utilized / MOCK.allocated) * 100);

  const stats: StatItem[] = [
    { label: "Total Allocated", value: MOCK.allocated, icon: <IndianRupee size={18} />, color: "var(--brand-blue)" },
    { label: "Utilized", value: MOCK.utilized, icon: <TrendingUp size={18} />, color: "var(--brand-green)" },
    { label: "Unused", value: MOCK.unused, icon: <TrendingDown size={18} />, color: "var(--brand-amber)" },
    { label: "Carry Forward", value: MOCK.carryForward, icon: <RefreshCcw size={18} />, color: "var(--brand-blue)" },
    { label: "Encashment", value: MOCK.encashment, icon: <ArrowRight size={18} />, color: "#8b5cf6" },
    { label: "Lapsed", value: MOCK.lapsed, icon: <PieChart size={18} />, color: "var(--brand-red)" },
  ];

  const handleSendReminder = () => {
    try {
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
      toast.success(`Reminders sent to ${MOCK.pendingCount} employees`);
    } catch {
      toast.error("Failed to send reminders");
    }
  };

  const handleToggleDeclarations = () => {
    if (windowOpen) {
      // Locking -- show confirmation dialog
      setShowLockConfirm(true);
    } else {
      // Opening
      setWindowOpen(true);
      toast.success("Declaration window opened");
    }
  };

  const confirmLock = () => {
    setWindowOpen(false);
    setShowLockConfirm(false);
    toast.success("Declarations locked successfully");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--brand-navy)" }}>
            {currentFY} End Summary
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            {daysUntilFYEnd} days remaining in current fiscal year
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 16,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              padding: 20,
              transition: "box-shadow 0.15s, transform 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: s.color }}>
              {s.icon}
              <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--brand-navy)" }}>
              {formatINR(s.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Utilization Progress */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--brand-navy)" }}>
            Overall Utilization
          </span>
          <span style={{ fontSize: 22, fontWeight: 700, color: utilizationPct >= 70 ? "var(--brand-green)" : "var(--brand-amber)" }}>
            {utilizationPct}%
          </span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: "var(--color-border)", overflow: "hidden" }}>
          <div
            style={{
              width: `${utilizationPct}%`,
              height: "100%",
              borderRadius: 6,
              background:
                utilizationPct >= 70
                  ? "var(--brand-green)"
                  : utilizationPct >= 50
                  ? "var(--brand-amber)"
                  : "var(--brand-red)",
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          <span>{formatINR(MOCK.utilized)} utilized</span>
          <span>{formatINR(MOCK.allocated)} allocated</span>
        </div>
      </div>

      {/* Bottom Row: Employee Readiness + Declaration Window */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Employee Readiness */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Users size={18} style={{ color: "var(--brand-navy)" }} />
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--brand-navy)" }}>
              Employee Readiness
            </h4>
          </div>

          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--brand-green)" }}>
                {MOCK.submittedCount}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Submitted</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--brand-amber)" }}>
                {MOCK.pendingCount}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Pending</div>
            </div>
          </div>

          <div style={{ height: 6, borderRadius: 3, background: "var(--color-border)", overflow: "hidden", marginBottom: 16 }}>
            <div
              style={{
                width: `${Math.round((MOCK.submittedCount / MOCK.totalEmployees) * 100)}%`,
                height: "100%",
                borderRadius: 3,
                background: "var(--brand-green)",
              }}
            />
          </div>

          <button
            onClick={handleSendReminder}
            disabled={reminderSent}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              background: reminderSent ? "var(--color-background)" : "var(--color-card)",
              fontSize: 13,
              fontWeight: 600,
              color: reminderSent ? "var(--brand-green)" : "var(--brand-navy)",
              cursor: reminderSent ? "default" : "pointer",
              transition: "background 0.15s",
            }}
          >
            <Send size={14} />
            {reminderSent ? "Reminders Sent!" : `Send Reminder (${MOCK.pendingCount})`}
          </button>
        </div>

        {/* Declaration Window */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--brand-navy)" }}>
              Declaration Window
            </h4>
            <span
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                background: windowOpen ? "var(--brand-green)" : "var(--brand-red)",
                marginBottom: 16,
              }}
            >
              {windowOpen ? "Open" : "Closed"}
            </span>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 8px", lineHeight: 1.5 }}>
              {windowOpen
                ? "Employees can currently submit and modify their benefit declarations."
                : "The declaration window is locked. No changes can be made."}
            </p>
          </div>

          <button
            onClick={handleToggleDeclarations}
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: 8,
              padding: "8px 16px",
              border: "none",
              borderRadius: 8,
              background: windowOpen ? "var(--brand-red)" : "var(--brand-green)",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            {windowOpen ? <Lock size={14} /> : <Unlock size={14} />}
            {windowOpen ? "Lock Declarations" : "Open Declarations"}
          </button>
        </div>
      </div>

      {/* Lock Confirmation Dialog */}
      {showLockConfirm && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setShowLockConfirm(false)}
        >
          <div
            style={{
              background: "var(--color-card)", borderRadius: 16, padding: 32,
              width: 440, maxWidth: "90vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AlertTriangle size={20} style={{ color: "var(--brand-red)" }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--brand-navy)" }}>
                Lock Declarations?
              </h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6b7280", margin: "0 0 24px" }}>
              This will prevent all employees from submitting or modifying their benefit declarations.
              {MOCK.pendingCount > 0 && (
                <span style={{ display: "block", marginTop: 8, color: "var(--brand-amber)", fontWeight: 600 }}>
                  {MOCK.pendingCount} employees have not yet submitted their declarations.
                </span>
              )}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowLockConfirm(false)}
                style={{
                  padding: "8px 20px", border: "1px solid var(--color-border)",
                  borderRadius: 8, background: "var(--color-card)", fontSize: 14,
                  fontWeight: 600, color: "#374151", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLock}
                style={{
                  padding: "8px 20px", border: "none", borderRadius: 8,
                  background: "var(--brand-red)", fontSize: 14,
                  fontWeight: 600, color: "#fff", cursor: "pointer",
                }}
              >
                Lock Declarations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}
