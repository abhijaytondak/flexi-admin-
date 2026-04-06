// ─── Employee ─────────────────────────────────────────────────────────────────

export type BenefitPlan = "Associate" | "Senior Associate" | "Manager" | "Senior Manager" | "AVP" | "VP";
export type EmployeeStatus = "active" | "on-leave" | "inactive" | "invited";
export type InviteStatus = "not_sent" | "sent" | "accepted";

export type TaxRegime = "old" | "new";

export interface Employee {
  id: string;
  name: string;
  initials: string;
  color: string;
  department?: string;
  designation: string;
  salary: string;
  bracket: string;
  benefitPlan?: BenefitPlan;
  status: EmployeeStatus;
  email?: string;
  phone?: string;
  location?: string;
  dateOfJoining?: string;
  inviteStatus?: InviteStatus;
  taxRegime?: TaxRegime;
}

// ─── Claim ────────────────────────────────────────────────────────────────────

export type ClaimStatus = "claimed" | "invoice_pending" | "submitted" | "pending" | "approved" | "rejected";

export interface Claim {
  id: string;
  employeeName: string;
  employeeId?: string;
  initials: string;
  avatarColor: string;
  department?: string;
  benefitType: string;
  category: string;
  claimAmount: string;
  dateSubmitted: string;
  status: ClaimStatus;
  upiScreenshot?: string;
  receiptDescription: string;
  benefitPlan?: BenefitPlan;
  actionNote?: string;
  actionTimestamp?: string;
  actionBy?: string;
  merchantName?: string;
  transactionId?: string;
  salaryBand?: string;
  approvalTag?: "auto" | "manual" | "escalated";
}

// ─── Policy ───────────────────────────────────────────────────────────────────

export type AllowanceCategory =
  | "food"
  | "children_education"
  | "hostel"
  | "books_periodicals"
  | "professional_development"
  | "phone_internet"
  | "health_fitness"
  | "uniform"
  | "gift"
  | "business_travel"
  | "fuel"
  | "vehicle_maintenance"
  | "drivers_salary"
  | "other";

export const FLEXI_BENEFIT_CATEGORIES: { key: AllowanceCategory; label: string; defaultBillRequired: boolean }[] = [
  { key: "food", label: "Food Allowance", defaultBillRequired: false },
  { key: "children_education", label: "Children's Education Allowance", defaultBillRequired: true },
  { key: "hostel", label: "Hostel Expenditure Allowance", defaultBillRequired: true },
  { key: "books_periodicals", label: "Books and Periodicals", defaultBillRequired: true },
  { key: "professional_development", label: "Professional Development Allowance", defaultBillRequired: true },
  { key: "phone_internet", label: "Phone / Internet Allowance", defaultBillRequired: true },
  { key: "health_fitness", label: "Health and Fitness Allowance", defaultBillRequired: true },
  { key: "uniform", label: "Uniform Allowance", defaultBillRequired: true },
  { key: "gift", label: "Gift Allowance", defaultBillRequired: false },
  { key: "business_travel", label: "Business Travel Allowance", defaultBillRequired: true },
  { key: "fuel", label: "Fuel Allowance", defaultBillRequired: true },
  { key: "vehicle_maintenance", label: "Vehicle Maintenance Allowance", defaultBillRequired: true },
  { key: "drivers_salary", label: "Driver's Salary", defaultBillRequired: true },
];

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

export const BENEFIT_PLANS: BenefitPlan[] = ["Associate", "Senior Associate", "Manager", "Senior Manager", "AVP", "VP"];

export const PLAN_META: Record<BenefitPlan, PlanMeta> = {
  Associate: {
    label: "Associate", color: "#6B7A8D", bgColor: "#F0F2F5",
    borderColor: "#D8DDE4", bracketRange: "₹2.5L – ₹5L", bracketShort: "Entry level",
  },
  "Senior Associate": {
    label: "Senior Associate", color: "#2980B9", bgColor: "#EBF5FB",
    borderColor: "#A9D4EE", bracketRange: "₹5L – ₹8L", bracketShort: "Mid level",
  },
  Manager: {
    label: "Manager", color: "#27AE60", bgColor: "#E8F8EF",
    borderColor: "#B7E4CB", bracketRange: "₹8L – ₹12L", bracketShort: "People manager",
  },
  "Senior Manager": {
    label: "Senior Manager", color: "#8E44AD", bgColor: "#F5EEF8",
    borderColor: "#D2B4DE", bracketRange: "₹12L – ₹18L", bracketShort: "Senior management",
  },
  AVP: {
    label: "AVP", color: "#E67E22", bgColor: "#FEF5E7",
    borderColor: "#F5CBA7", bracketRange: "₹18L – ₹25L", bracketShort: "Associate Vice President",
  },
  VP: {
    label: "VP", color: "#3498DB", bgColor: "#D4E6F1",
    borderColor: "#85C1E9", bracketRange: "₹25L+", bracketShort: "Vice President",
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
