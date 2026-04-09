"use client";

import React from "react";
import {
  FileCheck,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface PolicyViolation {
  category: string;
  count: number;
  severity: "low" | "medium" | "high";
}

export interface ComplianceData {
  billComplianceRate: number;
  totalBills: number;
  compliantBills: number;
  violations: PolicyViolation[];
  auditTrail: AuditEntry[];
  fyReadiness: {
    allDeclarationsSubmitted: boolean;
    taxProofsCollected: boolean;
    carryForwardConfigured: boolean;
    payrollExported: boolean;
  };
}

interface ComplianceDashboardProps {
  data: ComplianceData;
}

/* ── Component ─────────────────────────────────────────────── */

export function ComplianceDashboard({ data }: ComplianceDashboardProps) {
  const totalViolations = data.violations.reduce((sum, v) => sum + v.count, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--brand-navy)" }}>
        Compliance Dashboard
      </h3>

      {/* Top cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {/* Bill Compliance */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <FileCheck size={18} style={{ color: "var(--brand-green)" }} />
            <span style={cardTitleStyle}>Bill Compliance</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: data.billComplianceRate >= 90 ? "var(--brand-green)" : "var(--brand-amber)", marginBottom: 8 }}>
            {data.billComplianceRate}%
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {data.compliantBills} of {data.totalBills} claims have required documentation
          </div>
          <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: "var(--color-border)", overflow: "hidden" }}>
            <div
              style={{
                width: `${data.billComplianceRate}%`,
                height: "100%",
                borderRadius: 3,
                background: data.billComplianceRate >= 90 ? "var(--brand-green)" : "var(--brand-amber)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Policy Violations */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={18} style={{ color: totalViolations > 0 ? "var(--brand-red)" : "var(--brand-green)" }} />
            <span style={cardTitleStyle}>Policy Violations</span>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: totalViolations > 0 ? "var(--brand-red)" : "var(--brand-green)",
              marginBottom: 12,
            }}
          >
            {totalViolations}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.violations.map((v) => (
              <div
                key={v.category}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "var(--color-background)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#374151" }}>{v.category}</span>
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                    background:
                      v.severity === "high"
                        ? "var(--brand-red)"
                        : v.severity === "medium"
                        ? "var(--brand-amber)"
                        : "var(--brand-green)",
                  }}
                >
                  {v.count}
                </span>
              </div>
            ))}
            {data.violations.length === 0 && (
              <div style={{ fontSize: 13, color: "#6b7280" }}>No violations found</div>
            )}
          </div>
        </div>

        {/* FY Readiness */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <ShieldCheck size={18} style={{ color: "var(--brand-blue)" }} />
            <span style={cardTitleStyle}>FY Readiness</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ReadinessItem label="All declarations submitted" done={data.fyReadiness.allDeclarationsSubmitted} />
            <ReadinessItem label="Tax proofs collected" done={data.fyReadiness.taxProofsCollected} />
            <ReadinessItem label="Carry-forward configured" done={data.fyReadiness.carryForwardConfigured} />
            <ReadinessItem label="Payroll exported" done={data.fyReadiness.payrollExported} />
          </div>
          {(() => {
            const done = Object.values(data.fyReadiness).filter(Boolean).length;
            const total = Object.keys(data.fyReadiness).length;
            return (
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: done === total ? "var(--brand-green)" : "var(--brand-amber)" }}>
                {done}/{total} complete
              </div>
            );
          })()}
        </div>
      </div>

      {/* Audit Trail */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <ClipboardList size={18} style={{ color: "var(--brand-navy)" }} />
          <span style={cardTitleStyle}>Audit Trail</span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            Last {data.auditTrail.length} actions
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-background)" }}>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.auditTrail.map((entry) => (
                <tr
                  key={entry.id}
                  style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={tdStyle}>
                    <span style={{ color: "#6b7280", fontSize: 12, whiteSpace: "nowrap" }}>{entry.timestamp}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 500, color: "var(--brand-navy)" }}>{entry.action}</span>
                  </td>
                  <td style={tdStyle}>{entry.user}</td>
                  <td style={{ ...tdStyle, color: "#6b7280" }}>{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function ReadinessItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {done ? (
        <CheckCircle2 size={16} style={{ color: "var(--brand-green)", flexShrink: 0 }} />
      ) : (
        <XCircle size={16} style={{ color: "var(--brand-red)", flexShrink: 0 }} />
      )}
      <span style={{ fontSize: 13, color: done ? "#374151" : "#9ca3af" }}>{label}</span>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: 24,
  transition: "box-shadow 0.15s",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--brand-navy)",
};

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
};

/* ── Default mock data for standalone usage ─────────────────── */

export const DEFAULT_COMPLIANCE_DATA: ComplianceData = {
  billComplianceRate: 92,
  totalBills: 348,
  compliantBills: 320,
  violations: [
    { category: "Missing receipts", count: 12, severity: "medium" },
    { category: "Amount exceeds cap", count: 5, severity: "high" },
    { category: "Duplicate claims", count: 3, severity: "high" },
    { category: "Expired documents", count: 8, severity: "low" },
  ],
  auditTrail: Array.from({ length: 20 }, (_, i) => ({
    id: `audit-${i + 1}`,
    timestamp: new Date(Date.now() - i * 3_600_000 * 4).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    action: [
      "Claim approved",
      "Policy updated",
      "Employee onboarded",
      "Payroll exported",
      "Declaration submitted",
      "Claim rejected",
      "Carry-forward configured",
      "Deadline modified",
    ][i % 8],
    user: [
      "Amanda Johnson",
      "Rahul Sharma",
      "Priya Patel",
      "System",
    ][i % 4],
    details: [
      "Approved food claim #FC-234",
      "Updated fuel policy cap to 5000",
      "Added Arjun Mehta to Premium plan",
      "March 2026 payroll file generated",
      "LTA declaration for FY 25-26",
      "Rejected duplicate claim #DC-89",
      "Set food allowance to carry forward",
      "Changed payroll day to 28th",
    ][i % 8],
  })),
  fyReadiness: {
    allDeclarationsSubmitted: false,
    taxProofsCollected: true,
    carryForwardConfigured: true,
    payrollExported: false,
  },
};
