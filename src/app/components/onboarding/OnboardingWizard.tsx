import React from "react";
import {
  Building2,
  Wallet,
  Gift,
  Users,
  Rocket,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

export function OnboardingWizard() {
  const state = useOnboardingState();
  const { currentStep, currentIndex, canProceed, nextStep, prevStep, goToStep, isComplete } = state;

  const progressPercent = ((currentIndex + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case "CompanyProfile":
        return (
          <CompanyProfileStep
            data={state.stepData.CompanyProfile}
            onChange={(d) => state.setStepData("CompanyProfile", d)}
          />
        );
      case "SalaryStructure":
        return (
          <SalaryStructureStep
            data={state.stepData.SalaryStructure}
            onChange={(d) => state.setStepData("SalaryStructure", d)}
          />
        );
      case "BenefitPolicy":
        return (
          <BenefitPolicyStep
            data={state.stepData.BenefitPolicy}
            onChange={(d) => state.setStepData("BenefitPolicy", d)}
          />
        );
      case "EmployeeImport":
        return (
          <EmployeeImportStep
            data={state.stepData.EmployeeImport}
            onChange={(d) => state.setStepData("EmployeeImport", d)}
          />
        );
      case "ReviewPublish":
        return (
          <ReviewPublishStep
            data={state.stepData.ReviewPublish}
            allData={state.stepData}
            onChange={(d) => state.setStepData("ReviewPublish", d)}
          />
        );
    }
  };

  return (
    <div style={styles.root}>
      {/* ─── Progress bar ─────────────────────────────────────────── */}
      <div style={styles.progressTrack}>
        <div
          style={{ ...styles.progressFill, width: `${progressPercent}%` }}
        />
      </div>

      <div style={styles.layout}>
        {/* ─── Sidebar ──────────────────────────────────────────── */}
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
                            ? "#fff"
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

        {/* ─── Content ──────────────────────────────────────────── */}
        <main style={styles.content}>
          <div style={styles.contentInner}>{renderStep()}</div>

          {/* ─── Bottom bar ──────────────────────────────────── */}
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
                onClick={nextStep}
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
                disabled={!canProceed}
                style={{
                  ...styles.btnGreen,
                  opacity: canProceed ? 1 : 0.5,
                  cursor: canProceed ? "pointer" : "default",
                }}
              >
                <Rocket size={16} />
                Go Live
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
    background: "var(--sidebar-bg)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid var(--sidebar-divider)",
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
    color: "#fff",
    fontWeight: 600,
    fontSize: "var(--text-lg)",
    lineHeight: 1.2,
  },
  brandSub: {
    color: "var(--sidebar-text-muted)",
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
    color: "var(--sidebar-text-muted)",
    marginTop: 1,
    opacity: 0.7,
  },
  sidebarFooter: {
    padding: "16px 20px",
    borderTop: "1px solid var(--sidebar-divider)",
  },
  helpText: {
    color: "var(--sidebar-text-muted)",
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
