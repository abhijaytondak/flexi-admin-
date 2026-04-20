import { FLEXI_BENEFIT_CATEGORIES, type AllowanceCategory } from "@partner-portal/shared";
import type {
  CompanyPolicyConfig, CategoryLimitRow, SalarySlab,
  AutoApproveCategoryRule, AutoApproveConfig,
} from "./types";

/**
 * Mock company-level policy configuration (PRD §4.2).
 * Demo values — swap at runtime via the dev-only toggle in PolicyEngine.
 */
export const MOCK_COMPANY_CONFIG: CompanyPolicyConfig = {
  disbursementModel: "Monthly Realisation",
  cycleDate: "25th of each month",
  payrollCutoffDate: "2nd of following month",
  configurationApproach: "Company-Wide",
  goLiveDate: "1 April 2026",
};

/**
 * Seed per-category defaults (monthly limit, annual limit, flags).
 * Values are demo only — chosen to stay at or below standard Indian tax exemption
 * thresholds for flexi benefits so the view tells a coherent story.
 */
const CATEGORY_SEED: Record<AllowanceCategory, Omit<CategoryLimitRow, "key" | "label">> = {
  food:                     { monthlyLimit: 2200,  annualLimit: 26400, carryForward: false, billRequired: false, multiMonthAllocation: false },
  children_education:       { monthlyLimit: 100,   annualLimit: 1200,  carryForward: true,  billRequired: true,  multiMonthAllocation: true  },
  hostel:                   { monthlyLimit: 300,   annualLimit: 3600,  carryForward: true,  billRequired: true,  multiMonthAllocation: true  },
  books_periodicals:        { monthlyLimit: 1000,  annualLimit: 12000, carryForward: true,  billRequired: true,  multiMonthAllocation: false },
  professional_development: { monthlyLimit: 2000,  annualLimit: 24000, carryForward: true,  billRequired: true,  multiMonthAllocation: true  },
  phone_internet:           { monthlyLimit: 1000,  annualLimit: 12000, carryForward: false, billRequired: true,  multiMonthAllocation: false },
  health_fitness:           { monthlyLimit: 1250,  annualLimit: 15000, carryForward: true,  billRequired: true,  multiMonthAllocation: true  },
  uniform:                  { monthlyLimit: 1000,  annualLimit: 12000, carryForward: false, billRequired: true,  multiMonthAllocation: false },
  gift:                     { monthlyLimit: 0,     annualLimit: 5000,  carryForward: false, billRequired: false, multiMonthAllocation: false },
  business_travel:          { monthlyLimit: 3000,  annualLimit: 36000, carryForward: false, billRequired: true,  multiMonthAllocation: true  },
  fuel:                     { monthlyLimit: 1800,  annualLimit: 21600, carryForward: false, billRequired: true,  multiMonthAllocation: false },
  vehicle_maintenance:      { monthlyLimit: 1500,  annualLimit: 18000, carryForward: true,  billRequired: true,  multiMonthAllocation: false },
  drivers_salary:           { monthlyLimit: 900,   annualLimit: 10800, carryForward: false, billRequired: true,  multiMonthAllocation: false },
  other:                    { monthlyLimit: 0,     annualLimit: 0,     carryForward: false, billRequired: true,  multiMonthAllocation: false },
};

/**
 * Company-Wide category & limits view — all 13 flexi categories at a single flat table.
 * `other` is excluded from display as it's not a user-facing flexi category.
 */
export const MOCK_COMPANY_WIDE_CATEGORIES: CategoryLimitRow[] = FLEXI_BENEFIT_CATEGORIES.map((c) => ({
  key: c.key,
  label: c.label,
  ...CATEGORY_SEED[c.key],
}));

/**
 * Slab-based variant — 4 mock slabs with different monthly ceilings.
 * Each slab inherits the category seed and applies a slab-specific multiplier
 * so the inspector can see that limits vary per slab.
 */
function slabCategories(multiplier: number): CategoryLimitRow[] {
  return MOCK_COMPANY_WIDE_CATEGORIES.map((row) => ({
    ...row,
    monthlyLimit: Math.round(row.monthlyLimit * multiplier),
    annualLimit: Math.round(row.annualLimit * multiplier),
  }));
}

export const MOCK_SALARY_SLABS: SalarySlab[] = [
  {
    id: "slab-associate",
    name: "Associate",
    overallMonthlyLimit: 12000,
    categories: slabCategories(0.7),
  },
  {
    id: "slab-senior-associate",
    name: "Senior Associate",
    overallMonthlyLimit: 18000,
    categories: slabCategories(1.0),
  },
  {
    id: "slab-manager",
    name: "Manager",
    overallMonthlyLimit: 26000,
    categories: slabCategories(1.3),
  },
  {
    id: "slab-senior-manager",
    name: "Senior Manager",
    overallMonthlyLimit: 36000,
    categories: slabCategories(1.6),
  },
];

/**
 * Auto-approve configuration mock (PRD §4.2).
 * Only Food Allowance and Phone/Internet are category-enabled by default.
 */
const DEFAULT_ENABLED: AllowanceCategory[] = ["food", "phone_internet"];

const categoryRules: AutoApproveCategoryRule[] = FLEXI_BENEFIT_CATEGORIES.map((c) => ({
  category: c.key,
  label: c.label,
  enabled: DEFAULT_ENABLED.includes(c.key),
}));

export const MOCK_AUTO_APPROVE: AutoApproveConfig = {
  categoryRules,
  thresholdAmount: 5000,
  trustedEmployeeIds: ["EMP-002", "EMP-006", "EMP-011"],
};

/** ₹ formatter — Indian numbering system, no fractional paise. */
export function formatRupees(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}
