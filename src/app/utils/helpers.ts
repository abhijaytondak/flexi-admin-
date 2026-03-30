import type { BenefitPlan } from "../types";

/** Derive benefit plan from annual CTC */
export function deriveBenefitPlan(annualCtc: number): BenefitPlan {
  if (annualCtc >= 1_000_000) return "Executive";
  if (annualCtc >= 650_000) return "Premium";
  return "Standard";
}

/** Derive salary bracket label from CTC */
export function deriveBracketLabel(annualCtc: number): string {
  if (annualCtc >= 1_000_000) return "₹10L+";
  if (annualCtc >= 650_000) return "₹6.5L – ₹10L";
  if (annualCtc >= 400_000) return "₹4L – ₹6.5L";
  return "₹2.5L – ₹4L";
}

/** Format currency in Indian style */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Parse INR string to number */
export function parseINR(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
}

/** Get time-based greeting */
export function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Generate initials from name */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Trigger browser download */
export function downloadFile(content: string, filename: string, mimeType = "text/csv") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** cn() utility for merging Tailwind classes */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
