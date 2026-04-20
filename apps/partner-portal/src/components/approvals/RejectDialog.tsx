"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { Claim, RejectionReason } from "@partner-portal/shared";
import { font, REJECTION_REASON_OPTIONS, formatAmountINR } from "./constants";

interface RejectDialogProps {
  claim: Claim;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: RejectionReason, note: string) => void;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  zIndex: 1200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-4)",
};

const dialogStyle: CSSProperties = {
  ...font,
  width: "100%",
  maxWidth: 480,
  backgroundColor: "var(--color-card)",
  borderRadius: "var(--rounded-lg)",
  boxShadow: "var(--elevation-lg)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  maxHeight: "90vh",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "var(--space-4) var(--space-5)",
  borderBottom: "1px solid var(--color-border)",
};

const bodyStyle: CSSProperties = {
  padding: "var(--space-5)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
  overflow: "auto",
};

const labelStyle: CSSProperties = {
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  color: "var(--color-muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 6,
  display: "block",
};

const selectStyle: CSSProperties = {
  ...font,
  width: "100%",
  padding: "var(--space-2) var(--space-3)",
  fontSize: "var(--text-sm)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  outline: "none",
};

const textareaStyle: CSSProperties = {
  ...selectStyle,
  minHeight: 80,
  resize: "vertical" as const,
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
  padding: "var(--space-4) var(--space-5)",
  borderTop: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
};

const btnBase: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "var(--space-2) var(--space-4)",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  borderRadius: "var(--rounded-md)",
  cursor: "pointer",
  border: "none",
};

export function RejectDialog({ claim, open, onClose, onConfirm }: RejectDialogProps) {
  const [reason, setReason] = useState<RejectionReason | "">("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      // For flagged claims auto-attach the AI flag reason context to the note.
      setReason("");
      setNote(claim.flaggedByAI && claim.flagReason ? `AI flag: ${claim.flagReason}\n` : "");
    }
  }, [open, claim]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isFlagged = !!claim.flaggedByAI;
  // Reason required ONLY for non-flagged claims; for flagged, AI flag reason serves as context.
  const needsReason = !isFlagged;
  const needsNote = reason === "other";
  const canSubmit =
    (!needsReason || !!reason) && (!needsNote || note.trim().length > 0);

  const handleConfirm = () => {
    if (!canSubmit) return;
    // For flagged claims without an explicit dropdown selection, default to "other"
    // so the reason is stored alongside the free-text note + AI context.
    const finalReason: RejectionReason = reason || "other";
    onConfirm(finalReason, note.trim());
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="reject-dialog-title">
      <div style={dialogStyle}>
        <div style={headerStyle}>
          <h3 id="reject-dialog-title" style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
            Reject claim
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Close"
          >
            <X size={18} style={{ color: "var(--color-muted-foreground)" }} />
          </button>
        </div>

        <div style={bodyStyle}>
          <div
            style={{
              padding: "var(--space-3)",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--rounded-md)",
              border: "1px solid var(--color-border)",
              fontSize: "var(--text-sm)",
              color: "var(--color-foreground)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{claim.employeeName} · {claim.employeeId}</div>
            <div style={{ color: "var(--color-muted-foreground)", marginTop: 2 }}>
              {claim.merchantName || claim.category} · {formatAmountINR(parseInt(claim.claimAmount.replace(/[^\d]/g, ""), 10) || 0)}
            </div>
          </div>

          {isFlagged && claim.flagReason && (
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "var(--space-3)",
                backgroundColor: "var(--brand-red-light)",
                border: "1px solid var(--brand-red-border)",
                borderRadius: "var(--rounded-md)",
                fontSize: "var(--text-sm)",
                color: "#B32318",
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>AI flag reason auto-attached</div>
                <div style={{ color: "#7A1A12" }}>{claim.flagReason}</div>
              </div>
            </div>
          )}

          {needsReason && (
            <div>
              <label style={labelStyle}>
                Reason {needsReason && <span style={{ color: "var(--brand-red)" }}>*</span>}
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as RejectionReason)}
                style={selectStyle}
              >
                <option value="">Select a reason…</option>
                {REJECTION_REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>
              {isFlagged ? "HR note (optional)" : "Note"}
              {needsNote && <span style={{ color: "var(--brand-red)" }}> *</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={needsNote ? "Please explain the rejection reason…" : "Optional context for the employee…"}
              style={textareaStyle}
            />
          </div>
        </div>

        <div style={footerStyle}>
          <button
            onClick={onClose}
            style={{
              ...btnBase,
              backgroundColor: "transparent",
              color: "var(--color-foreground)",
              border: "1px solid var(--color-border)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            style={{
              ...btnBase,
              backgroundColor: canSubmit ? "var(--brand-red)" : "var(--color-border)",
              color: "#fff",
              opacity: canSubmit ? 1 : 0.7,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Confirm rejection
          </button>
        </div>
      </div>
    </div>
  );
}
