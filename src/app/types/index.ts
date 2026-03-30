// ─── Employee ─────────────────────────────────────────────────────────────────

export type BenefitPlan = "Standard" | "Premium" | "Executive";
export type EmployeeStatus = "active" | "on-leave" | "inactive" | "invited";
export type InviteStatus = "not_sent" | "sent" | "accepted";

export interface Employee {
  id: string;
  name: string;
  initials: string;
  color: string;
  department: string;
  designation: string;
  salary: string;
  bracket: string;
  benefitPlan: BenefitPlan;
  status: EmployeeStatus;
  email?: string;
  phone?: string;
  location?: string;
  dateOfJoining?: string;
  inviteStatus?: InviteStatus;
}

// ─── Claim ────────────────────────────────────────────────────────────────────

export type ClaimStatus = "claimed" | "invoice_pending" | "submitted" | "pending" | "approved" | "rejected";

export interface Claim {
  id: string;
  employeeName: string;
  employeeId?: string;
  initials: string;
  avatarColor: string;
  department: string;
  benefitType: string;
  category: string;
  claimAmount: string;
  dateSubmitted: string;
  status: ClaimStatus;
  hasAttachment: boolean;
  receiptDescription: string;
  benefitPlan?: BenefitPlan;
  actionNote?: string;
  actionTimestamp?: string;
  actionBy?: string;
  merchantName?: string;
  transactionId?: string;
}

// ─── Policy ───────────────────────────────────────────────────────────────────

export type AllowanceCategory = "food" | "fuel" | "communication" | "lta" | "hra" | "nps" | "professional_pursuit" | "gadget" | "other";

export interface Allowance {
  name: string;
  enabled: boolean;
  maxPercent: string;
  fixedCap: string;
  billRequired: boolean;
  carryForward: boolean;
  category: AllowanceCategory;
}

export interface SalaryBand {
  id: string;
  name: string;
  range: string;
  benefitPlan: BenefitPlan;
  employeeCount: number;
  benefits: Allowance[];
  expanded: boolean;
}

export interface SalaryStructure {
  basicPay: { percent: number; inclusion: boolean };
  roleBasedAllowance: { percent: number; inclusion: boolean };
  conveyanceAllowance: { percent: number; inclusion: boolean };
  houseRentAllowance: { percent: number; inclusion: boolean };
  statutoryBonus: { percent: number; inclusion: boolean };
  employerNps: { percent: number; inclusion: boolean; optional: boolean };
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

export interface PayrollCycle {
  id: string;
  startDate: string;
  endDate: string;
  payrollDate: string;
  submissionDeadline: string;
  status: "open" | "locked" | "exported";
}

export interface PayrollRow {
  employeeId: string;
  employeeName: string;
  department: string;
  salaryBand: string;
  categories: { category: string; claimCount: number; amount: number }[];
  totalReimbursable: number;
  claimCount: number;
}

// ─── Fiscal ───────────────────────────────────────────────────────────────────

export interface CarryForwardRule {
  allowanceCategory: string;
  action: "carry_forward" | "encash" | "lapse";
  encashmentTaxable: boolean;
}

// ─── Admin Profile ────────────────────────────────────────────────────────────

export interface DashboardCards {
  totalBenefitOutgo: boolean;
  avgTaxSaved: boolean;
  pendingApprovals: boolean;
  activeEmployees: boolean;
}

export interface AdminProfile {
  name: string;
  designation: string;
  department: string;
  email: string;
  employeeId: string;
  initials: string;
  avatarColor: string;
  showGreeting: boolean;
  fiscalYearStart: string;
  dashboardCards: DashboardCards;
  exportFormat: "pdf" | "csv" | "excel";
  dataRetention: "1year" | "2years" | "5years" | "unlimited";
}

// ─── Plan Meta ────────────────────────────────────────────────────────────────

export interface PlanMeta {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  bracketRange: string;
  bracketShort: string;
}

export const BENEFIT_PLANS: BenefitPlan[] = ["Standard", "Premium", "Executive"];

export const PLAN_META: Record<BenefitPlan, PlanMeta> = {
  Standard: {
    label: "Standard", color: "#6B7A8D", bgColor: "#F0F2F5",
    borderColor: "#D8DDE4", bracketRange: "₹2.5L – ₹6.5L", bracketShort: "Entry & mid CTC",
  },
  Premium: {
    label: "Premium", color: "#27AE60", bgColor: "#E8F8EF",
    borderColor: "#B7E4CB", bracketRange: "₹6.5L – ₹10L", bracketShort: "Senior IC",
  },
  Executive: {
    label: "Executive", color: "#3498DB", bgColor: "#EBF5FB",
    borderColor: "#A9D4EE", bracketRange: "₹10L+", bracketShort: "Leadership",
  },
};

export const AVATAR_COLORS = [
  "#3498DB", "#27AE60", "#E74C3C", "#F39C12",
  "#9B59B6", "#1A2B3C", "#16A085", "#E67E22",
  "#2C3E50", "#8E44AD", "#1ABC9C", "#D35400",
];

export const DEFAULT_PROFILE: AdminProfile = {
  name: "Amanda Johnson",
  designation: "HR Director",
  department: "Human Resources",
  email: "amanda.johnson@acme.com",
  employeeId: "ADM-001",
  initials: "AJ",
  avatarColor: "#3498DB",
  showGreeting: true,
  fiscalYearStart: "April",
  dashboardCards: { totalBenefitOutgo: true, avgTaxSaved: true, pendingApprovals: true, activeEmployees: true },
  exportFormat: "pdf",
  dataRetention: "2years",
};
