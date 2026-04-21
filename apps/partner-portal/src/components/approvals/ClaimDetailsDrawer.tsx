"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import { X, CheckCircle2, XCircle, FileText, Image as ImageIcon, BadgeCheck, AlertTriangle } from "lucide-react";
import type { Claim, AllowanceCategory } from "@partner-portal/shared";
import { parseINR } from "@partner-portal/shared";
import { font, formatAmountINR, formatDate, CATEGORY_LABEL } from "./constants";
import { StatusPill, RiskBadge, AutoApproveTag, BillStatusBadge } from "./ClaimBadges";

/**
 * Per-category monthly allocation caps (demo values).
 * In production these come from the Policy Engine config per company / slab.
 */
const MONTHLY_CATEGORY_CAP_INR: Record<AllowanceCategory, number> = {
  food: 2200,
  children_education: 1500,
  hostel: 2500,
  books_periodicals: 1500,
  professional_development: 5000,
  phone_internet: 2000,
  health_fitness: 4000,
  uniform: 1500,
  gift: 5000,
  business_travel: 10000,
  fuel: 3000,
  vehicle_maintenance: 3000,
  drivers_salary: 10000,
  other: 2000,
};

interface ClaimDetailsDrawerProps {
  claim: Claim | null;
  allClaims: Claim[];
  open: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onApprove?: (claim: Claim) => void;
  onReject?: (claim: Claim) => void;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(15, 23, 42, 0.40)",
  zIndex: 1100,
  transition: "opacity 180ms ease",
};

const drawerStyle: CSSProperties = {
  ...font,
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  width: "min(520px, 96vw)",
  backgroundColor: "var(--color-card)",
  boxShadow: "-12px 0 32px rgba(15, 23, 42, 0.08)",
  zIndex: 1110,
  display: "flex",
  flexDirection: "column",
  transition: "transform 220ms ease",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "var(--space-4) var(--space-5)",
  borderBottom: "1px solid var(--color-border)",
  backgroundColor: "var(--color-card)",
};

const bodyStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
  padding: "var(--space-5)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-5)",
  backgroundColor: "var(--color-surface)",
};

const footerStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-3)",
  padding: "var(--space-4) var(--space-5)",
  borderTop: "1px solid var(--color-border)",
  backgroundColor: "var(--color-card)",
};

const labelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: "var(--color-muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 4,
  lineHeight: 1.4,
};

const valueStyle: CSSProperties = {
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  color: "var(--color-foreground)",
  lineHeight: 1.4,
  wordBreak: "break-word",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: "var(--color-muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "var(--space-2)",
};

const cardStyle: CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  padding: "var(--space-4)",
};

const btnBase: CSSProperties = {
  ...font,
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "12px 16px",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  borderRadius: "var(--rounded-md)",
  border: "none",
  cursor: "pointer",
};

function MetaField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

export function ClaimDetailsDrawer({
  claim,
  allClaims,
  open,
  readOnly = false,
  onClose,
  onApprove,
  onReject,
}: ClaimDetailsDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Monthly allocation usage for this employee + category in the claim's cycle.
  const allocation = useMemo(() => {
    if (!claim) return null;
    const cap = MONTHLY_CATEGORY_CAP_INR[claim.category as AllowanceCategory];
    if (!cap) return null;
    const cycleId = claim.cycleId;
    const counted: Claim["status"][] = [
      "approved",
      "auto_approved",
      "pending",
      "submitted",
      "claimed",
      "invoice_pending",
      "flagged_for_later",
      "eligible",
    ];
    const previouslyUsed = allClaims
      .filter(
        (c) =>
          c.id !== claim.id &&
          c.employeeId === claim.employeeId &&
          c.category === claim.category &&
          (!cycleId || c.cycleId === cycleId) &&
          counted.includes(c.status),
      )
      .reduce((sum, c) => sum + parseINR(c.claimAmount), 0);
    const current = parseINR(claim.claimAmount);
    const remaining = Math.max(cap - previouslyUsed - current, 0);
    const overflow = Math.max(previouslyUsed + current - cap, 0);
    return { cap, previouslyUsed, current, remaining, overflow };
  }, [claim, allClaims]);

  if (!open || !claim) return null;

  const amount = parseINR(claim.claimAmount);
  const categoryLabel = CATEGORY_LABEL[claim.category as keyof typeof CATEGORY_LABEL] ?? claim.benefitType ?? claim.category;
  const isFinal = claim.status === "approved" || claim.status === "auto_approved" || claim.status === "rejected";

  return (
    <>
      <div style={overlayStyle} onClick={onClose} aria-hidden="true" />
      <aside
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-drawer-title"
      >
        {/* Header */}
        <div style={headerStyle}>
          <h2
            id="claim-drawer-title"
            style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}
          >
            Claim Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: "var(--rounded-md)",
              display: "inline-flex",
              color: "var(--color-muted-foreground)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {/* Employee card */}
          <div
            style={{
              ...cardStyle,
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--rounded-full)",
                backgroundColor: claim.avatarColor || "var(--brand-navy)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {claim.initials || claim.employeeName.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)", lineHeight: 1.3 }}>
                {claim.employeeName}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", marginTop: 2 }}>
                {claim.department || claim.employeeId || "—"}
              </div>
            </div>
          </div>

          {/* Metadata grid */}
          <div
            style={{
              ...cardStyle,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: "var(--space-4)",
              columnGap: "var(--space-4)",
            }}
          >
            <MetaField label="Claim ID" value={claim.id} />
            <MetaField label="Benefit Type" value={categoryLabel} />
            <MetaField
              label="Amount"
              value={<span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatAmountINR(amount)}</span>}
            />
            <MetaField label="Date Submitted" value={formatDate(claim.dateSubmitted)} />
            <MetaField
              label="Status"
              value={<StatusPill status={claim.status} />}
            />
            <MetaField label="Merchant" value={claim.merchantName || "—"} />
            <MetaField label="Transaction ID" value={claim.transactionId || "—"} />
            <MetaField label="Employee ID" value={claim.employeeId || "—"} />
          </div>

          {/* Monthly allocation progress */}
          {allocation && (
            <AllocationProgress
              cap={allocation.cap}
              previouslyUsed={allocation.previouslyUsed}
              current={allocation.current}
              remaining={allocation.remaining}
              overflow={allocation.overflow}
              categoryLabel={categoryLabel}
            />
          )}

          {/* Optional row: risk + bill + auto-approve rule */}
          {(claim.riskLevel || claim.billStatus || claim.autoApproveRule) && (
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-2)",
                alignItems: "center",
              }}
            >
              {claim.riskLevel && <RiskBadge level={claim.riskLevel} />}
              {claim.billStatus && <BillStatusBadge status={claim.billStatus} />}
              {claim.autoApproveRule && <AutoApproveTag claim={claim} />}
            </div>
          )}

          {/* Payment Proof */}
          {(claim.transactionId || claim.merchantName) && (
            <div>
              <div style={sectionTitleStyle}>Payment Proof</div>
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--rounded-md)",
                    backgroundColor: "var(--brand-green-light)",
                    color: "var(--brand-green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <BadgeCheck size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--color-muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "var(--brand-accent-alpha-12, rgba(79,70,229,0.12))",
                        color: "var(--brand-accent)",
                        borderRadius: 4,
                        fontSize: 10,
                      }}
                    >
                      UPI
                    </span>
                    <span>{claim.transactionId || "—"}</span>
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", fontWeight: 500 }}>
                    {claim.merchantName || "—"}
                    <span style={{ color: "var(--color-muted-foreground)", fontWeight: 400 }}>
                      {" · "}{formatDate(claim.dateSubmitted)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fuel Bill Photo / Receipt attachment */}
          <div>
            <div style={sectionTitleStyle}>{categoryLabel} Bill Photo</div>
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--space-6) var(--space-4)",
                textAlign: "center",
                gap: "var(--space-2)",
              }}
            >
              {claim.upiScreenshot ? (
                <img
                  src={claim.upiScreenshot}
                  alt="Bill receipt"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 280,
                    borderRadius: "var(--rounded-md)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "var(--rounded-md)",
                    border: "1px dashed var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  <ImageIcon size={22} />
                </div>
              )}
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                {categoryLabel} Receipt
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                {claim.merchantName || "—"} · {formatDate(claim.dateSubmitted)}
              </div>
            </div>
          </div>

          {/* Receipt Description */}
          {claim.receiptDescription && (
            <div>
              <div style={sectionTitleStyle}>Receipt Description</div>
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-3)",
                }}
              >
                <FileText size={16} style={{ color: "var(--color-muted-foreground)", flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", lineHeight: 1.5 }}>
                  {claim.receiptDescription}
                </div>
              </div>
            </div>
          )}

          {/* Multi-month allocation note */}
          {claim.multiMonthAllocation && (
            <div>
              <div style={sectionTitleStyle}>Multi-Month Allocation</div>
              <div style={cardStyle}>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", lineHeight: 1.5 }}>
                  Allocation {claim.multiMonthAllocation.index} of {claim.multiMonthAllocation.total}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", marginTop: 4 }}>
                  Original transaction: {formatDate(claim.multiMonthAllocation.originalDate)} ·{" "}
                  {claim.multiMonthAllocation.originalMerchant} ·{" "}
                  {formatAmountINR(claim.multiMonthAllocation.originalAmount)}
                </div>
              </div>
            </div>
          )}

          {/* Rejection reason block (when applicable) */}
          {claim.status === "rejected" && (claim.rejectionReason || claim.rejectionNote) && (
            <div>
              <div style={sectionTitleStyle}>Rejection Reason</div>
              <div
                style={{
                  ...cardStyle,
                  borderColor: "var(--brand-red-border)",
                  backgroundColor: "var(--brand-red-light)",
                }}
              >
                {claim.rejectionReason && (
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#B32318", textTransform: "capitalize" }}>
                    {claim.rejectionReason.replace(/_/g, " ")}
                  </div>
                )}
                {claim.rejectionNote && (
                  <div style={{ fontSize: "var(--text-sm)", color: "#7A1A12", marginTop: 4 }}>
                    {claim.rejectionNote}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!readOnly && !isFinal && (onApprove || onReject) && (
          <div style={footerStyle}>
            {onReject && (
              <button
                onClick={() => onReject(claim)}
                style={{
                  ...btnBase,
                  backgroundColor: "var(--brand-red)",
                  color: "#fff",
                }}
              >
                <XCircle size={16} /> Reject
              </button>
            )}
            {onApprove && (
              <button
                onClick={() => onApprove(claim)}
                style={{
                  ...btnBase,
                  backgroundColor: "var(--brand-green)",
                  color: "#fff",
                }}
              >
                <CheckCircle2 size={16} /> Approve
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  AllocationProgress — monthly cap usage bar                                */
/* ────────────────────────────────────────────────────────────────────────── */

interface AllocationProgressProps {
  cap: number;
  previouslyUsed: number;
  current: number;
  remaining: number;
  overflow: number;
  categoryLabel: string;
}

function AllocationProgress({
  cap,
  previouslyUsed,
  current,
  remaining,
  overflow,
  categoryLabel,
}: AllocationProgressProps) {
  // Scale denominator: extend the bar beyond 100% when the claim pushes over the cap,
  // so the overflow segment is still visible.
  const scale = Math.max(cap, previouslyUsed + current);
  const usedPct = (previouslyUsed / scale) * 100;
  const currentPct = (current / scale) * 100;
  const remainingPct = (remaining / scale) * 100;
  const overflowPct = (overflow / scale) * 100;

  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--color-muted-foreground)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "var(--space-2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span>Monthly Allocation</span>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-muted-foreground)", textTransform: "none", letterSpacing: 0 }}>
          Cap ₹{cap.toLocaleString("en-IN")}
        </span>
      </div>

      <div
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-md)",
          padding: "var(--space-4)",
        }}
      >
        {/* Bar */}
        <div
          style={{
            height: 10,
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--rounded-full)",
            overflow: "hidden",
            display: "flex",
            width: "100%",
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={cap}
          aria-valuenow={previouslyUsed + current}
          aria-label={`${categoryLabel} monthly allocation`}
        >
          {previouslyUsed > 0 && (
            <div
              style={{
                width: `${usedPct}%`,
                backgroundColor: "var(--color-muted-foreground, #94a3b8)",
                opacity: 0.45,
              }}
            />
          )}
          {current > 0 && (
            <div
              style={{
                width: `${currentPct}%`,
                backgroundColor: overflow > 0 ? "var(--brand-red)" : "var(--brand-accent)",
              }}
            />
          )}
          {remaining > 0 && (
            <div
              style={{
                width: `${remainingPct}%`,
                backgroundColor: "transparent",
              }}
            />
          )}
          {overflow > 0 && (
            <div
              style={{
                width: `${overflowPct}%`,
                background:
                  "repeating-linear-gradient(45deg, var(--brand-red) 0 4px, var(--brand-red-light) 4px 8px)",
              }}
            />
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            marginTop: "var(--space-3)",
            fontSize: "var(--text-xs)",
            color: "var(--color-foreground)",
          }}
        >
          <LegendItem
            color="var(--color-muted-foreground, #94a3b8)"
            opacity={0.45}
            label="Previously claimed"
            value={formatAmountINR(previouslyUsed)}
          />
          <LegendItem
            color={overflow > 0 ? "var(--brand-red)" : "var(--brand-accent)"}
            label="This claim"
            value={formatAmountINR(current)}
          />
          <LegendItem
            color="var(--color-border)"
            label="Remaining"
            value={formatAmountINR(remaining)}
          />
        </div>

        {overflow > 0 && (
          <div
            style={{
              marginTop: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              backgroundColor: "var(--brand-red-light)",
              color: "#7A1A12",
              borderRadius: "var(--rounded-md)",
              fontSize: "var(--text-xs)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 500,
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            Exceeds monthly cap by {formatAmountINR(overflow)}
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({
  color,
  opacity = 1,
  label,
  value,
}: {
  color: string;
  opacity?: number;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: color,
          opacity,
          flexShrink: 0,
        }}
      />
      <span style={{ color: "var(--color-muted-foreground)" }}>{label}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
