"use client";

import type { CSSProperties } from "react";
import { Shield, FileCheck, FileWarning, FileText, Bookmark, Flag, Sparkles } from "lucide-react";
import type { Claim, ClaimStatus, RiskLevel, BillStatus } from "@partner-portal/shared";
import { font, RISK_CONFIG, BILL_STATUS_CONFIG, autoApproveRuleLabel } from "./constants";

const basePillStyle: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 10px",
  borderRadius: "var(--rounded-full)",
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  lineHeight: 1.5,
  whiteSpace: "nowrap",
};

export function RiskBadge({ level }: { level?: RiskLevel }) {
  if (!level) return null;
  const cfg = RISK_CONFIG[level];
  return (
    <span
      style={{
        ...basePillStyle,
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
      aria-label={`Uplift AI risk: ${cfg.label}`}
      title="Uplift AI risk assessment"
    >
      <Shield size={11} /> {cfg.label}
    </span>
  );
}

export function BillStatusBadge({ status }: { status?: BillStatus }) {
  if (!status || status === "not_required") return null;
  const cfg = BILL_STATUS_CONFIG[status];
  const Icon = status === "validated" ? FileCheck : status === "mismatch" ? FileWarning : FileText;
  return (
    <span
      style={{
        ...basePillStyle,
        color: cfg.color,
        backgroundColor: cfg.bg,
      }}
      title={`Bill status: ${cfg.label}`}
    >
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

const STATUS_COLORS: Record<ClaimStatus, { label: string; color: string; bg: string }> = {
  claimed: { label: "Claimed", color: "#6B7A8D", bg: "#F0F2F5" },
  invoice_pending: { label: "Invoice pending", color: "#6B7A8D", bg: "#F0F2F5" },
  submitted: { label: "Submitted", color: "var(--brand-amber)", bg: "var(--brand-amber-light)" },
  pending: { label: "Pending", color: "var(--brand-amber)", bg: "var(--brand-amber-light)" },
  eligible: { label: "Eligible", color: "#1D4ED8", bg: "var(--brand-blue-light)" },
  auto_approved: { label: "Auto-approved", color: "var(--brand-green)", bg: "var(--brand-green-light)" },
  approved: { label: "Approved", color: "var(--brand-green)", bg: "var(--brand-green-light)" },
  rejected: { label: "Rejected", color: "var(--brand-red)", bg: "var(--brand-red-light)" },
  flagged_for_later: { label: "Flagged for later", color: "#8E44AD", bg: "var(--brand-purple-light)" },
};

export function StatusPill({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{ ...basePillStyle, color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

export function AutoApproveTag({ claim }: { claim: Claim }) {
  if (!claim.autoApproveRule) return null;
  return (
    <span
      style={{
        ...basePillStyle,
        color: "#1E8A4D",
        backgroundColor: "var(--brand-green-light)",
        border: "1px solid var(--brand-green-border)",
      }}
      title="Auto-approval rule"
    >
      <Sparkles size={11} /> {autoApproveRuleLabel(claim.autoApproveRule)}
    </span>
  );
}

export function FlaggedForLaterBadge() {
  return (
    <span
      style={{
        ...basePillStyle,
        color: "#8E44AD",
        backgroundColor: "var(--brand-purple-light)",
        border: "1px solid #D2B4DE",
      }}
    >
      <Bookmark size={11} /> Flagged for later
    </span>
  );
}

export function AIFlagBadge({ reason }: { reason?: string }) {
  return (
    <span
      style={{
        ...basePillStyle,
        color: "#B32318",
        backgroundColor: "var(--brand-red-light)",
        border: "1px solid var(--brand-red-border)",
      }}
      title={reason || "Flagged by Uplift AI"}
    >
      <Flag size={11} /> Flagged by AI
    </span>
  );
}
