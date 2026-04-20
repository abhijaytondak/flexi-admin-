"use client";

import React, { type CSSProperties } from "react";
import { Info, Check, X, Clock } from "lucide-react";
import type { Dispute, DisputeStatus } from "@partner-portal/shared";
import { font, formatAmountINR, formatDate, DISPUTE_TYPE_LABEL } from "./constants";

interface DisputesListProps {
  disputes: Dispute[];
  readOnly: boolean;
  onRejectUnderlyingClaim: (dispute: Dispute) => void;
}

const cardStyle: CSSProperties = {
  ...font,
  padding: "var(--space-4)",
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-lg)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
};

const bannerStyle: CSSProperties = {
  ...font,
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--space-2)",
  padding: "var(--space-3) var(--space-4)",
  backgroundColor: "var(--brand-blue-light)",
  border: "1px solid var(--brand-blue-border)",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  color: "#1D4ED8",
};

/** Visual timeline for the dispute status progression. */
function DisputeTimeline({ status }: { status: DisputeStatus }) {
  const steps: { key: DisputeStatus; label: string }[] = [
    { key: "raised", label: "Raised" },
    { key: "under_review", label: "Under Review (Ops)" },
    {
      key: status === "rejected" ? "rejected" : "resolved",
      label: status === "rejected" ? "Rejected" : "Resolved",
    },
  ];

  const activeIdx = status === "raised" ? 0 : status === "under_review" ? 1 : 2;
  const isFinalRejected = status === "rejected";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
      {steps.map((step, i) => {
        const isActive = i <= activeIdx;
        const isFinalStep = i === 2;
        const dotColor = isFinalStep && isFinalRejected
          ? "var(--brand-red)"
          : isActive
          ? "var(--brand-green)"
          : "var(--color-border)";
        return (
          <React.Fragment key={`${step.key}-${i}`}>
            {i > 0 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isActive ? dotColor : "var(--color-border)",
                }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: isActive ? dotColor : "var(--color-background)",
                  border: `2px solid ${dotColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isActive &&
                  (isFinalStep && isFinalRejected ? (
                    <X size={10} style={{ color: "#fff" }} />
                  ) : isFinalStep ? (
                    <Check size={10} style={{ color: "#fff" }} />
                  ) : (
                    <Clock size={10} style={{ color: "#fff" }} />
                  ))}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function DisputesList({ disputes, readOnly, onRejectUnderlyingClaim }: DisputesListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={bannerStyle}>
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          HR has limited actions on disputes. Ops owns the resolution workflow. HR can only
          reject the underlying claim (final say) — you cannot approve or override an Ops decision.
        </div>
      </div>

      {disputes.map((d) => (
        <div key={d.id} style={cardStyle}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "var(--space-4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--rounded-full)",
                  backgroundColor: d.avatarColor || "var(--brand-navy)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                }}
              >
                {d.initials}
              </div>
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                  {d.employeeName}{" "}
                  <span style={{ color: "var(--color-muted-foreground)", fontWeight: 500 }}>· {d.employeeId}</span>
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", marginTop: 2 }}>
                  {d.id} · Raised {formatDate(d.raisedAt)}
                </div>
              </div>
            </div>
            <span
              style={{
                ...font,
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 10px",
                borderRadius: "var(--rounded-full)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                backgroundColor: "var(--brand-accent-alpha-8)",
                color: "var(--brand-navy)",
              }}
            >
              {DISPUTE_TYPE_LABEL[d.disputeType]}
            </span>
          </div>

          {/* Original transaction */}
          <div
            style={{
              padding: "var(--space-3)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--rounded-md)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Original transaction
              </div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)", marginTop: 2 }}>
                {d.originalTransaction.merchant}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                {formatDate(d.originalTransaction.date)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Amount
              </div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)", marginTop: 2 }}>
                {formatAmountINR(d.originalTransaction.amount)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Category
              </div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)", marginTop: 2 }}>
                {d.claimCategory}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              backgroundColor: "var(--color-background)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--rounded-md)",
            }}
          >
            <DisputeTimeline status={d.status} />
          </div>

          {/* Resolution */}
          {d.resolutionDetails && (
            <div
              style={{
                padding: "var(--space-3)",
                backgroundColor:
                  d.status === "resolved" ? "var(--brand-green-light)" : "var(--brand-red-light)",
                border: `1px solid ${
                  d.status === "resolved" ? "var(--brand-green-border)" : "var(--brand-red-border)"
                }`,
                borderRadius: "var(--rounded-md)",
                fontSize: "var(--text-xs)",
                color: d.status === "resolved" ? "#1E8A4D" : "#7A1A12",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 2 }}>
                Resolution by {d.resolutionDetails.by} · {formatDate(d.resolutionDetails.at)}
              </div>
              <div>{d.resolutionDetails.action}</div>
            </div>
          )}

          {/* Actions */}
          {!readOnly && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => onRejectUnderlyingClaim(d)}
                style={{
                  ...font,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "var(--space-2) var(--space-3)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  borderRadius: "var(--rounded-md)",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  color: "var(--brand-red)",
                  border: "1px solid var(--brand-red-border)",
                }}
              >
                <X size={14} /> Reject Underlying Claim
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
