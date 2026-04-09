import type { CSSProperties } from "react";
import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

const CIRCLE_SIZE = 32;
const LINE_HEIGHT = 2;

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
  };

  return (
    <div style={containerStyle} role="list" aria-label="Progress steps">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isActive = i === currentStep;
        const isUpcoming = i > currentStep;

        /* Circle styling */
        const circleStyle: CSSProperties = {
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          fontFamily: "'IBM Plex Sans', sans-serif",
          flexShrink: 0,
          transition: "all 200ms ease-out",
          ...(isComplete
            ? {
                backgroundColor: "var(--brand-green)",
                color: "#fff",
                border: "2px solid var(--brand-green)",
              }
            : isActive
            ? {
                backgroundColor: "var(--brand-accent)",
                color: "#fff",
                border: "2px solid var(--brand-navy)",
                boxShadow: "0 0 0 4px var(--brand-navy-alpha-20)",
              }
            : {
                backgroundColor: "var(--color-background)",
                color: "var(--color-muted-foreground)",
                border: "2px solid var(--color-border)",
              }),
        };

        /* Label styling */
        const labelStyle: CSSProperties = {
          marginTop: "var(--space-2)",
          fontSize: "var(--text-xs)",
          fontWeight: isActive ? 600 : 500,
          color: isUpcoming
            ? "var(--color-muted-foreground)"
            : "var(--color-foreground)",
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: 80,
          wordWrap: "break-word",
        };

        /* Connector line (not rendered after the last step) */
        const lineStyle: CSSProperties = {
          flex: 1,
          height: LINE_HEIGHT,
          alignSelf: "center",
          /* Offset to vertically center with the circle */
          marginTop: -(CIRCLE_SIZE / 2),
          backgroundColor: isComplete
            ? "var(--brand-green)"
            : "var(--color-border)",
          transition: "background-color 200ms ease-out",
          marginLeft: "var(--space-1)",
          marginRight: "var(--space-1)",
        };

        return (
          <div
            key={i}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
            style={{
              display: "flex",
              alignItems: "flex-start",
              flex: i < steps.length - 1 ? 1 : "0 0 auto",
              minWidth: 0,
            }}
          >
            {/* Step circle + label column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={circleStyle}>
                {isComplete ? <Check size={16} strokeWidth={2.5} /> : i + 1}
              </div>
              <span style={labelStyle}>{step.label}</span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && <div style={lineStyle} aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
