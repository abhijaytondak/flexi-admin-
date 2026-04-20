import type { CSSProperties } from "react";
import {
  type RejectionReason,
  type RiskLevel,
  type BillStatus,
  type DisputeType,
  type DisputeStatus,
  type AllowanceCategory,
  type AutoApproveRule,
  FLEXI_BENEFIT_CATEGORIES,
} from "@partner-portal/shared";

export const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

/** PRD §4.3 rejection reasons: exactly 4 options */
export const REJECTION_REASON_OPTIONS: { value: RejectionReason; label: string }[] = [
  { value: "not_a_business_expense", label: "Not a business expense" },
  { value: "duplicate_claim", label: "Duplicate claim" },
  { value: "policy_violation", label: "Policy violation" },
  { value: "other", label: "Other" },
];

export const REJECTION_REASON_LABEL: Record<RejectionReason, string> = {
  not_a_business_expense: "Not a business expense",
  duplicate_claim: "Duplicate claim",
  policy_violation: "Policy violation",
  other: "Other",
};

export const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  normal: { label: "Normal", color: "#1E8A4D", bg: "var(--brand-green-light)", border: "var(--brand-green-border)" },
  medium: { label: "Medium Risk", color: "#B7791F", bg: "var(--brand-amber-light)", border: "var(--brand-amber-border)" },
  high: { label: "High Risk", color: "#B32318", bg: "var(--brand-red-light)", border: "var(--brand-red-border)" },
};

export const BILL_STATUS_CONFIG: Record<BillStatus, { label: string; color: string; bg: string }> = {
  uploaded: { label: "Bill uploaded", color: "#1D4ED8", bg: "var(--brand-blue-light)" },
  validated: { label: "Bill validated", color: "#1E8A4D", bg: "var(--brand-green-light)" },
  pending: { label: "Bill pending", color: "#B7791F", bg: "var(--brand-amber-light)" },
  mismatch: { label: "Bill mismatch", color: "#B32318", bg: "var(--brand-red-light)" },
  not_required: { label: "No bill required", color: "var(--color-muted-foreground)", bg: "var(--color-surface)" },
};

export const DISPUTE_TYPE_LABEL: Record<DisputeType, string> = {
  wrong_category: "Wrong category",
  wrong_rejection: "Wrong rejection",
  missed_transaction: "Missed transaction",
  other: "Other",
};

export const DISPUTE_STATUS_LABEL: Record<DisputeStatus, string> = {
  raised: "Raised",
  under_review: "Under Review (Ops)",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const CATEGORY_LABEL: Record<AllowanceCategory, string> = FLEXI_BENEFIT_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.key] = cat.label;
    return acc;
  },
  {} as Record<AllowanceCategory, string>,
);

/** Build the visible tag text for the auto-approve rule. */
export function autoApproveRuleLabel(rule: AutoApproveRule): string {
  switch (rule.type) {
    case "category":
      return `Auto: ${CATEGORY_LABEL[rule.category] ?? rule.category} category`;
    case "threshold":
      return `Auto: amount < ₹${rule.amountLessThan.toLocaleString("en-IN")}`;
    case "employee":
      return "Auto: Employee trusted";
  }
}

/** ₹X,XX,XXX Indian grouping. */
export function formatAmountINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

/** Accepts a raw claimAmount string (e.g. "₹1,20,000") and returns "1,20,000". */
export function stripCurrencySymbol(formatted: string): string {
  return formatted.replace(/[^\d,]/g, "");
}

/** dd MMM yyyy in en-IN. */
export function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
