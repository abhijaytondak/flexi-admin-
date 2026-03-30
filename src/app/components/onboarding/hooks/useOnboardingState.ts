import { useState, useCallback, useMemo } from "react";
import type { BenefitPlan, Allowance } from "../../../types";

// ─── Step Definitions ────────────────────────────────────────────────────────

export type OnboardingStep =
  | "CompanyProfile"
  | "SalaryStructure"
  | "BenefitPolicy"
  | "EmployeeImport"
  | "ReviewPublish";

export const STEPS: OnboardingStep[] = [
  "CompanyProfile",
  "SalaryStructure",
  "BenefitPolicy",
  "EmployeeImport",
  "ReviewPublish",
];

export const STEP_LABELS: Record<OnboardingStep, string> = {
  CompanyProfile: "Company Profile",
  SalaryStructure: "Salary Structure",
  BenefitPolicy: "Benefit Policy",
  EmployeeImport: "Employee Import",
  ReviewPublish: "Review & Publish",
};

// ─── Step Data Interfaces ────────────────────────────────────────────────────

export interface CompanyProfileData {
  companyName: string;
  industry: string;
  companySize: string;
  fiscalYearStart: string;
  payrollDay: number;
  hrAdminName: string;
  hrAdminEmail: string;
  hrAdminPhone: string;
  hrAdminDesignation: string;
}

export interface SalaryComponent {
  key: string;
  label: string;
  percent: number;
  inclusion: boolean;
  optional: boolean;
}

export interface SalaryStructureData {
  components: SalaryComponent[];
  sampleCtc: number;
}

export interface BenefitCategoryRow {
  id: string;
  name: string;
  enabled: boolean;
  monthlyLimit: number;
  billRequired: boolean;
  carryForward: boolean;
}

export interface BenefitPolicyData {
  Standard: BenefitCategoryRow[];
  Premium: BenefitCategoryRow[];
  Executive: BenefitCategoryRow[];
}

export interface ImportedEmployee {
  name: string;
  email: string;
  department: string;
  designation: string;
  annualCtc: number;
  band: BenefitPlan;
  valid: boolean;
  errors: string[];
}

export interface EmployeeImportData {
  employees: ImportedEmployee[];
  fileName: string;
  skipped: boolean;
}

export interface ReviewPublishData {
  checklist: {
    companyVerified: boolean;
    salaryVerified: boolean;
    benefitsVerified: boolean;
    employeesVerified: boolean;
  };
  published: boolean;
}

export type StepDataMap = {
  CompanyProfile: CompanyProfileData;
  SalaryStructure: SalaryStructureData;
  BenefitPolicy: BenefitPolicyData;
  EmployeeImport: EmployeeImportData;
  ReviewPublish: ReviewPublishData;
};

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_SALARY_COMPONENTS: SalaryComponent[] = [
  { key: "basic", label: "Basic Pay", percent: 40, inclusion: true, optional: false },
  { key: "rba", label: "Role-Based Allowance (RBA)", percent: 14, inclusion: true, optional: false },
  { key: "ca", label: "Conveyance Allowance (CA)", percent: 20, inclusion: false, optional: false },
  { key: "hra", label: "House Rent Allowance (HRA)", percent: 20, inclusion: false, optional: false },
  { key: "bonus", label: "Statutory Bonus", percent: 6, inclusion: true, optional: false },
  { key: "nps", label: "Employer NPS", percent: 0, inclusion: false, optional: true },
];

const makeBenefitRows = (multiplier: number): BenefitCategoryRow[] => [
  { id: "food", name: "Food & Meals", enabled: true, monthlyLimit: Math.round(2500 * multiplier), billRequired: true, carryForward: false },
  { id: "fuel", name: "Fuel & Travel", enabled: true, monthlyLimit: Math.round(3000 * multiplier), billRequired: true, carryForward: false },
  { id: "communication", name: "Communication", enabled: true, monthlyLimit: Math.round(1500 * multiplier), billRequired: true, carryForward: true },
  { id: "lta", name: "Leave Travel Allowance", enabled: true, monthlyLimit: Math.round(5000 * multiplier), billRequired: true, carryForward: true },
  { id: "professional", name: "Professional Pursuit", enabled: multiplier > 1, monthlyLimit: Math.round(3000 * multiplier), billRequired: true, carryForward: false },
  { id: "gadget", name: "Gadget & Equipment", enabled: multiplier > 1.2, monthlyLimit: Math.round(4000 * multiplier), billRequired: true, carryForward: true },
  { id: "wellness", name: "Health & Wellness", enabled: true, monthlyLimit: Math.round(2000 * multiplier), billRequired: false, carryForward: false },
  { id: "other", name: "Other Reimbursements", enabled: false, monthlyLimit: Math.round(1000 * multiplier), billRequired: true, carryForward: false },
];

const DEFAULT_STEP_DATA: StepDataMap = {
  CompanyProfile: {
    companyName: "",
    industry: "",
    companySize: "",
    fiscalYearStart: "April",
    payrollDay: 28,
    hrAdminName: "",
    hrAdminEmail: "",
    hrAdminPhone: "",
    hrAdminDesignation: "",
  },
  SalaryStructure: {
    components: DEFAULT_SALARY_COMPONENTS,
    sampleCtc: 800000,
  },
  BenefitPolicy: {
    Standard: makeBenefitRows(1),
    Premium: makeBenefitRows(1.5),
    Executive: makeBenefitRows(2),
  },
  EmployeeImport: {
    employees: [],
    fileName: "",
    skipped: false,
  },
  ReviewPublish: {
    checklist: {
      companyVerified: false,
      salaryVerified: false,
      benefitsVerified: false,
      employeesVerified: false,
    },
    published: false,
  },
};

// ─── Validation ──────────────────────────────────────────────────────────────

function isStepComplete(step: OnboardingStep, data: StepDataMap): boolean {
  switch (step) {
    case "CompanyProfile": {
      const d = data.CompanyProfile;
      return !!(d.companyName && d.industry && d.companySize && d.hrAdminName && d.hrAdminEmail);
    }
    case "SalaryStructure": {
      const d = data.SalaryStructure;
      const total = d.components.reduce((sum, c) => sum + c.percent, 0);
      return total >= 95 && total <= 105;
    }
    case "BenefitPolicy": {
      const d = data.BenefitPolicy;
      return (
        d.Standard.some((r) => r.enabled) &&
        d.Premium.some((r) => r.enabled) &&
        d.Executive.some((r) => r.enabled)
      );
    }
    case "EmployeeImport": {
      const d = data.EmployeeImport;
      return d.skipped || d.employees.filter((e) => e.valid).length > 0;
    }
    case "ReviewPublish": {
      const c = data.ReviewPublish.checklist;
      return c.companyVerified && c.salaryVerified && c.benefitsVerified && c.employeesVerified;
    }
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOnboardingState() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("CompanyProfile");
  const [stepData, setStepDataState] = useState<StepDataMap>({ ...DEFAULT_STEP_DATA });

  const currentIndex = STEPS.indexOf(currentStep);

  const setStepData = useCallback(
    <S extends OnboardingStep>(step: S, partial: Partial<StepDataMap[S]>) => {
      setStepDataState((prev) => ({
        ...prev,
        [step]: { ...prev[step], ...partial },
      }));
    },
    []
  );

  const isComplete = useCallback(
    (step: OnboardingStep) => isStepComplete(step, stepData),
    [stepData]
  );

  const canProceed = useMemo(() => isStepComplete(currentStep, stepData), [currentStep, stepData]);

  const nextStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1]);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]);
  }, [currentStep]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  return {
    currentStep,
    currentIndex,
    stepData,
    setStepData,
    isComplete,
    canProceed,
    nextStep,
    prevStep,
    goToStep,
  };
}
