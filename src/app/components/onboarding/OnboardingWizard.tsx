import React, { useState, useMemo } from "react";
import {
  Building2,
  Wallet,
  Gift,
  Users,
  Rocket,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import * as api from "../../utils/api";
import {
  useOnboardingState,
  STEPS,
  STEP_LABELS,
  type OnboardingStep,
} from "./hooks/useOnboardingState";
import { CompanyProfileStep } from "./steps/CompanyProfileStep";
import { SalaryStructureStep } from "./steps/SalaryStructureStep";
import { BenefitPolicyStep } from "./steps/BenefitPolicyStep";
import { EmployeeImportStep } from "./steps/EmployeeImportStep";
import { ReviewPublishStep } from "./steps/ReviewPublishStep";

const STEP_ICONS: Record<OnboardingStep, React.ReactNode> = {
  CompanyProfile: <Building2 size={20} />,
  SalaryStructure: <Wallet size={20} />,
  BenefitPolicy: <Gift size={20} />,
  EmployeeImport: <Users size={20} />,
  ReviewPublish: <Rocket size={20} />,
};

function getStepValidationErrors(step: OnboardingStep, data: any): string[] {
  const errors: string[] = [];
  switch (step) {
    case "CompanyProfile": {
      const d = data.CompanyProfile;
      if (!d.companyName) errors.push("Company name is required");
      if (!d.industry) errors.push("Industry is required");
      if (!d.companySize) errors.push("Company size is required");
      if (!d.hrAdminName) errors.push("HR Admin name is required");
      if (!d.hrAdminEmail) errors.push("HR Admin email is required");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.hrAdminEmail)) errors.push("HR Admin email is invalid");
      break;
    }
    case "SalaryStructure": {
      const d = data.SalaryStructure;
      const total = d.components.reduce((sum: number, c: any) => sum + c.percent, 0);
      if (total < 95 || total > 105) errors.push(`Component total is ${total}% (must be 95-105%)`);
      break;
    }
    case "BenefitPolicy": {
      const d = data.BenefitPolicy;
      if (!d.Standard.some((r: any) => r.enabled)) errors.push("At least one Standard benefit must be enabled");
      if (!d.Premium.some((r: any) => r.enabled)) errors.push("At least one Premium benefit must be enabled");
      if (!d.Executive.some((r: any) => r.enabled)) errors.push("At least one Executive benefit must be enabled");
      break;
    }
    case "EmployeeImport": {
      const d = data.EmployeeImport;
      if (!d.skipped && d.employees.filter((e: any) => e.valid).length === 0) {
        errors.push("Import at least one valid employee or skip this step");
      }
      break;
    }
    case "ReviewPublish": {
      const c = data.ReviewPublish.checklist;
      if (!c.companyVerified) errors.push("Verify company profile");
      if (!c.salaryVerified) errors.push("Verify salary structure");
      if (!c.benefitsVerified) errors.push("Verify benefit policy");
      if (!c.employeesVerified) errors.push("Verify employee data");
      break;
    }
  }
  return errors;
}

export function OnboardingWizard() {
  const state = useOnboardingState();
  const { currentStep, currentIndex, canProceed, nextStep, prevStep, goToStep, isComplete } = state;
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const progressPercent = ((currentIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const errors = getStepValidationErrors(currentStep, state.stepData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    toast.success("Step completed");
    nextStep();
  };

  const handlePublish = async () => {
    const errors = getStepValidationErrors("ReviewPublish", state.stepData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setPublishing(true);
    setValidationErrors([]);
    try {
      const { stepData } = state;

      // Import employees if any were provided
      if (!stepData.EmployeeImport.skipped && stepData.EmployeeImport.employees.length > 0) {
        const validEmployees = stepData.EmployeeImport.employees
          .filter(e => e.valid)
          .map(e => ({
            name: e.name,
            email: e.email,
            department: e.department,
            designation: e.designation,
            annualCtc: e.annualCtc,
            band: e.band,
          }));
        if (validEmployees.length > 0) {
          await api.bulkImportEmployees(validEmployees);
        }
      }

      // Save policy brackets from all tiers
      const brackets: any[] = [];
      (["Standard", "Premium", "Executive"] as const).forEach(tier => {
        stepData.BenefitPolicy[tier]
          .filter(r => r.enabled)
          .forEach(r => {
            brackets.push({
              band: tier,
              category: r.name,
              monthlyLimit: r.monthlyLimit,
              billRequired: r.billRequired,
              carryForward: r.carryForward,
            });
          });
      });
      if (brackets.length > 0) {
        await api.savePolicy(brackets);
      }

      // Save company profile
      await api.saveProfile({
        companyName: stepData.CompanyProfile.companyName,
        industry: stepData.CompanyProfile.industry,
        companySize: stepData.CompanyProfile.companySize,
        fiscalYearStart: stepData.CompanyProfile.fiscalYearStart,
        payrollDay: stepData.CompanyProfile.payrollDay,
        hrAdminName: stepData.CompanyProfile.hrAdminName,
        hrAdminEmail: stepData.CompanyProfile.hrAdminEmail,
        hrAdminPhone: stepData.CompanyProfile.hrAdminPhone,
        hrAdminDesignation: stepData.CompanyProfile.hrAdminDesignation,
      });

      toast.success("Your FlexiBenefits policy is now live!");
      navigate("/");
    } catch (e: any) {
      toast.error("Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "CompanyProfile":
        return (
          <CompanyProfileStep
            data={state.stepData.CompanyProfile}
            onChange={(d) => { state.setStepData("CompanyProfile", d); setValidationErrors([]); }}
          />
        );
      case "SalaryStructure":
        return (
          <SalaryStructureStep
            data={state.stepData.SalaryStructure}
            onChange={(d) => { state.setStepData("SalaryStructure", d); setValidationErrors([]); }}
          />
        );
      case "BenefitPolicy":
        return (
          <BenefitPolicyStep
            data={state.stepData.BenefitPolicy}
            onChange={(d) => { state.setStepData("BenefitPolicy", d); setValidationErrors([]); }}
          />
        );
      case "EmployeeImport":
        return (
          <EmployeeImportStep
            data={state.stepData.EmployeeImport}
            onChange={(d) => { state.setStepData("EmployeeImport", d); setValidationErrors([]); }}
          />
        );
      case "ReviewPublish":
        return (
          <ReviewPublishStep
            data={state.stepData.ReviewPublish}
            allData={state.stepData}
            onChange={(d) => { state.setStepData("ReviewPublish", d); setValidationErrors([]); }}
          />
        );
    }
  };

  return (
    <div style={styles.root}>
      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div
          style={{ ...styles.progressFill, width: `${progressPercent}%` }}
        />
      </div>

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logo}>S</div>
            <div>
              <div style={styles.brandName}>SalarySe</div>
              <div style={styles.brandSub}>FlexiBenefits Setup</div>
            </div>
          </div>

          <nav style={styles.stepList}>
            {STEPS.map((step, idx) => {
              const active = step === currentStep;
              const completed = isComplete(step);
              const past = idx < currentIndex;
              return (
                <React.Fragment key={step}>
                  {idx > 0 && (
                    <div style={styles.connector}>
                      <div
                        style={{
                          ...styles.connectorLine,
                          backgroundColor:
                            past || (idx === currentIndex && completed)
                              ? "var(--brand-green)"
                              : "var(--sidebar-divider)",
                        }}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => goToStep(step)}
                    style={{
                      ...styles.stepBtn,
                      backgroundColor: active
                        ? "var(--sidebar-active-bg)"
                        : "transparent",
                      opacity: idx > currentIndex + 1 ? 0.5 : 1,
                    }}
                  >
                    <div
                      style={{
                        ...styles.stepIcon,
                        backgroundColor: completed
                          ? "var(--brand-green)"
                          : active
                          ? "var(--brand-blue)"
                          : "transparent",
                        border: completed || active
                          ? "none"
                          : "1.5px solid var(--sidebar-text-muted)",
                        color:
                          completed || active
                            ? "#fff"
                            : "var(--sidebar-text-muted)",
                      }}
                    >
                      {completed ? <Check size={14} /> : STEP_ICONS[step]}
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div
                        style={{
                          ...styles.stepLabel,
                          color: active
                            ? "var(--color-foreground)"
                            : "var(--sidebar-text-muted)",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {STEP_LABELS[step]}
                      </div>
                      <div style={styles.stepNumber}>
                        Step {idx + 1} of {STEPS.length}
                      </div>
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          <div style={styles.sidebarFooter}>
            <div style={styles.helpText}>Need help? Contact support</div>
          </div>
        </aside>

        {/* Content */}
        <main style={styles.content}>
          <div style={styles.contentInner}>
            {renderStep()}

            {/* Inline validation errors */}
            {validationErrors.length > 0 && (
              <div style={{
                marginTop: 16, padding: "12px 16px",
                backgroundColor: "rgba(239, 68, 68, 0.06)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "var(--rounded-md)",
              }}>
                {validationErrors.map((err, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: "var(--text-sm)", color: "var(--brand-red, #ef4444)",
                    padding: "2px 0",
                  }}>
                    <AlertCircle size={14} />
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div style={styles.bottomBar}>
            <button
              onClick={prevStep}
              disabled={currentIndex === 0}
              style={{
                ...styles.btnSecondary,
                opacity: currentIndex === 0 ? 0.4 : 1,
                cursor: currentIndex === 0 ? "default" : "pointer",
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div style={styles.stepIndicatorText}>
              {currentIndex + 1} / {STEPS.length}
            </div>

            {currentIndex < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                style={{
                  ...styles.btnPrimary,
                  opacity: canProceed ? 1 : 0.5,
                  cursor: canProceed ? "pointer" : "default",
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!canProceed || publishing}
                style={{
                  ...styles.btnGreen,
                  opacity: canProceed && !publishing ? 1 : 0.5,
                  cursor: canProceed && !publishing ? "pointer" : "default",
                }}
              >
                {publishing ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    Go Live
                  </>
                )}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "var(--color-background)",
  },
  progressTrack: {
    height: 3,
    background: "var(--color-border)",
    flexShrink: 0,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--brand-green), var(--brand-blue))",
    transition: "width 0.4s ease",
    borderRadius: "0 2px 2px 0",
  },
  layout: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  sidebar: {
    width: 280,
    background: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    borderRight: "1px solid var(--color-border)",
  },
  sidebarHeader: {
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid var(--color-border)",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: "var(--rounded-md)",
    background: "var(--brand-green)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "var(--text-lg)",
  },
  brandName: {
    color: "var(--color-foreground)",
    fontWeight: 600,
    fontSize: "var(--text-lg)",
    lineHeight: 1.2,
  },
  brandSub: {
    color: "var(--color-muted-foreground)",
    fontSize: "var(--text-xs)",
    marginTop: 2,
  },
  stepList: {
    flex: 1,
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
  },
  connector: {
    padding: "0 0 0 30px",
    height: 20,
    display: "flex",
    alignItems: "stretch",
  },
  connectorLine: {
    width: 2,
    borderRadius: 1,
    transition: "background-color 0.3s ease",
  },
  stepBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    border: "none",
    borderRadius: "var(--rounded-md)",
    cursor: "pointer",
    width: "100%",
    transition: "background-color 0.2s ease",
    background: "transparent",
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: "var(--rounded-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s ease",
  },
  stepLabel: {
    fontSize: "var(--text-sm)",
    lineHeight: 1.3,
    transition: "color 0.2s ease",
  },
  stepNumber: {
    fontSize: "var(--text-xs)",
    color: "var(--color-muted-foreground)",
    marginTop: 1,
    opacity: 0.7,
  },
  sidebarFooter: {
    padding: "16px 20px",
    borderTop: "1px solid var(--color-border)",
  },
  helpText: {
    color: "var(--color-muted-foreground)",
    fontSize: "var(--text-xs)",
    textAlign: "center",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  contentInner: {
    flex: 1,
    overflowY: "auto",
    padding: "32px 40px",
  },
  bottomBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 40px",
    borderTop: "1px solid var(--color-border)",
    background: "var(--color-background)",
    flexShrink: 0,
  },
  stepIndicatorText: {
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
    fontWeight: 500,
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
    background: "var(--color-background)",
    color: "var(--color-foreground)",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 24px",
    border: "none",
    borderRadius: "var(--rounded-md)",
    background: "var(--brand-accent)",
    color: "#fff",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  btnGreen: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 28px",
    border: "none",
    borderRadius: "var(--rounded-md)",
    background: "var(--brand-green)",
    color: "#fff",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};
