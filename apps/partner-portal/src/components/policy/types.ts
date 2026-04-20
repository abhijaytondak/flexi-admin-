import type { AllowanceCategory } from "@partner-portal/shared";

/**
 * Internal view-model types for the Policy Engine v0 (read-only).
 * PRD §4.2 — Company-Level Configuration & Category & Limits View.
 */

export type DisbursementModel = "Monthly Realisation" | "Front-Loaded" | "Back-Loaded";
export type ConfigurationApproach = "Company-Wide" | "Slab-Based";

export interface CompanyPolicyConfig {
  disbursementModel: DisbursementModel;
  cycleDate: string;           // e.g. "25th of each month"
  payrollCutoffDate: string;   // e.g. "2nd of following month"
  configurationApproach: ConfigurationApproach;
  goLiveDate: string;          // e.g. "1 April 2026"
}

/**
 * A single row in the Category & Limits table.
 * Mirrors the PRD column set: Category | Monthly | Annual | Carry-Forward | Bill Required | Multi-Month Allocation.
 */
export interface CategoryLimitRow {
  key: AllowanceCategory;
  label: string;
  monthlyLimit: number;
  annualLimit: number;
  carryForward: boolean;
  billRequired: boolean;
  multiMonthAllocation: boolean;
}

export interface SalarySlab {
  id: string;
  name: string;
  overallMonthlyLimit: number;
  categories: CategoryLimitRow[];
}

export interface AutoApproveCategoryRule {
  category: AllowanceCategory;
  label: string;
  enabled: boolean;
}

export interface AutoApproveConfig {
  categoryRules: AutoApproveCategoryRule[];
  thresholdAmount: number;           // ₹ value, e.g. 5000
  trustedEmployeeIds: string[];      // IDs of employees mocked as trusted
}
