"use client";

import type { CSSProperties } from "react";
import { Check, X, Bookmark, AlertTriangle } from "lucide-react";
import type { Claim } from "@partner-portal/shared";
import { parseINR } from "@partner-portal/shared";
import { font, formatAmountINR, formatDate, REJECTION_REASON_LABEL } from "./constants";
import {
  RiskBadge,
  BillStatusBadge,
  StatusPill,
  AutoApproveTag,
  FlaggedForLaterBadge,
  AIFlagBadge,
} from "./ClaimBadges";

interface ClaimRowProps {
  claim: Claim;
  readOnly: boolean;
  onApprove?: (claim: Claim) => void;
  onReject?: (claim: Claim) => void;
  onFlagForLater?: (claim: Claim) => void;
  onOpenDetails?: (claim: Claim) => void;
}

const cardStyle: CSSProperties = {
  ...font,
  padding: "var(--space-4)",
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
};

const btnBase: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "var(--space-2) var(--space-3)",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  borderRadius: "var(--rounded-md)",
  cursor: "pointer",
  border: "1px solid transparent",
  whiteSpace: "nowrap",
};

export function ClaimRow({
  claim,
  readOnly,
  onApprove,
  onReject,
  onFlagForLater,
  onOpenDetails,
}: ClaimRowProps) {
  const amt = parseINR(claim.claimAmount);
  const canAct =
    !readOnly &&
    (claim.status === "pending" ||
      claim.status === "submitted" ||
      claim.status === "claimed" ||
      claim.status === "invoice_pending" ||
      claim.status === "eligible" ||
      claim.status === "flagged_for_later");

  const rowStyle: CSSProperties = onOpenDetails
    ? { ...cardStyle, cursor: "pointer", transition: "border-color 120ms ease, background-color 120ms ease" }
    : cardStyle;

  return (
    <div
      style={rowStyle}
      onClick={onOpenDetails ? () => onOpenDetails(claim) : undefined}
      onMouseEnter={
        onOpenDetails
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--brand-accent)";
            }
          : undefined
      }
      onMouseLeave={
        onOpenDetails
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
            }
          : undefined
      }
    >
      {/* Top: employee + meta */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--rounded-full)",
              backgroundColor: claim.avatarColor || "var(--brand-navy)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {claim.initials || claim.employeeName.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
              {claim.employeeName}{" "}
              <span style={{ color: "var(--color-muted-foreground)", fontWeight: 500 }}>
                · {claim.employeeId || "—"}
              </span>
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", marginTop: 2 }}>
              {claim.id} · {claim.department || "—"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-foreground)" }}>
            {formatAmountINR(amt)}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
            {formatDate(claim.dateSubmitted)}
          </div>
        </div>
      </div>

      {/* Middle: transaction details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-2) var(--space-5)",
          fontSize: "var(--text-sm)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Merchant
          </div>
          <div style={{ color: "var(--color-foreground)", fontWeight: 500 }}>
            {claim.merchantName || "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Category
          </div>
          <div style={{ color: "var(--color-foreground)", fontWeight: 500 }}>
            {claim.benefitType || claim.category}
          </div>
        </div>
      </div>

      {/* Multi-month allocation line */}
      {claim.multiMonthAllocation && (
        <div
          style={{
            padding: "var(--space-2) var(--space-3)",
            backgroundColor: "var(--brand-accent-alpha-8)",
            borderRadius: "var(--rounded-md)",
            fontSize: "var(--text-xs)",
            color: "var(--brand-navy)",
            fontWeight: 500,
          }}
        >
          Allocation {claim.multiMonthAllocation.index} of {claim.multiMonthAllocation.total}: Original transaction: {formatDate(claim.multiMonthAllocation.originalDate)}, {claim.multiMonthAllocation.originalMerchant}, {formatAmountINR(claim.multiMonthAllocation.originalAmount)}
        </div>
      )}

      {/* Badges row */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)" }}>
        <StatusPill status={claim.status} />
        <RiskBadge level={claim.riskLevel} />
        <BillStatusBadge status={claim.billStatus} />
        {claim.flaggedByAI && <AIFlagBadge reason={claim.flagReason} />}
        {claim.autoApproveRule && <AutoApproveTag claim={claim} />}
        {claim.status === "flagged_for_later" && <FlaggedForLaterBadge />}
      </div>

      {/* Rejection detail */}
      {claim.status === "rejected" && (claim.rejectionReason || claim.rejectionNote || claim.actionNote) && (
        <div
          style={{
            padding: "var(--space-3)",
            backgroundColor: "var(--brand-red-light)",
            border: "1px solid var(--brand-red-border)",
            borderRadius: "var(--rounded-md)",
            fontSize: "var(--text-xs)",
            color: "#7A1A12",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={12} />
            {claim.rejectionReason ? REJECTION_REASON_LABEL[claim.rejectionReason] : "Rejected"}
          </div>
          {(claim.rejectionNote || claim.actionNote) && (
            <div style={{ whiteSpace: "pre-wrap" }}>{claim.rejectionNote || claim.actionNote}</div>
          )}
        </div>
      )}

      {/* Actions */}
      {canAct && (
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {onFlagForLater && claim.status !== "flagged_for_later" && (
            <button
              onClick={(e) => { e.stopPropagation(); onFlagForLater(claim); }}
              style={{
                ...btnBase,
                backgroundColor: "transparent",
                color: "#8E44AD",
                border: "1px solid #D2B4DE",
              }}
            >
              <Bookmark size={14} /> Flag for later
            </button>
          )}
          {onReject && (
            <button
              onClick={(e) => { e.stopPropagation(); onReject(claim); }}
              style={{
                ...btnBase,
                backgroundColor: "transparent",
                color: "var(--brand-red)",
                border: "1px solid var(--brand-red-border)",
              }}
            >
              <X size={14} /> Reject
            </button>
          )}
          {onApprove && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(claim); }}
              style={{
                ...btnBase,
                backgroundColor: "var(--brand-green)",
                color: "#fff",
              }}
            >
              <Check size={14} /> Approve
            </button>
          )}
        </div>
      )}
    </div>
  );
}
