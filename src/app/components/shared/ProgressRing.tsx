import { useMemo, type CSSProperties } from "react";

interface ProgressRingProps {
  value: number;
  maxValue?: number;
  label?: string;
  size?: number;
  color?: string;
}

/**
 * Auto-selects a semantic color based on the percentage:
 *   <30% = red (danger), 30-70% = amber (warning), >70% = green (healthy)
 */
function getAutoColor(pct: number): string {
  if (pct < 30) return "var(--brand-red)";
  if (pct <= 70) return "var(--brand-amber)";
  return "var(--brand-green)";
}

export function ProgressRing({
  value,
  maxValue = 100,
  label,
  size = 96,
  color,
}: ProgressRingProps) {
  const pct = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const resolvedColor = color ?? getAutoColor(pct);

  /* SVG geometry */
  const strokeWidth = size * 0.09; // proportional stroke
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  /* Center text sizing -- proportional to the ring */
  const valueFontSize = size * 0.26;
  const suffixFontSize = size * 0.14;
  const labelFontSize = Math.max(size * 0.12, 11);

  const wrapperStyle: CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-2)",
  };

  const svgContainerStyle: CSSProperties = {
    position: "relative",
    width: size,
    height: size,
  };

  const centerTextStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  /* Pre-compute the track color -- a very faint version of the ring color
     using color-mix for CSS-var compatibility */
  const trackColor = useMemo(() => {
    return `color-mix(in srgb, ${resolvedColor} 12%, transparent)`;
  }, [resolvedColor]);

  return (
    <div style={wrapperStyle}>
      <div style={svgContainerStyle}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          aria-hidden="true"
          style={{ display: "block" }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition:
                "stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1), stroke 300ms ease",
              transformOrigin: "center",
              transform: "rotate(-90deg)",
            }}
          />
        </svg>

        {/* Center percentage */}
        <div style={centerTextStyle}>
          <span
            style={{
              fontWeight: 700,
              fontSize: valueFontSize,
              color: "var(--color-foreground)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {Math.round(pct)}
          </span>
          <span
            style={{
              fontSize: suffixFontSize,
              fontWeight: 500,
              color: "var(--color-muted-foreground)",
              marginTop: 2,
              lineHeight: 1,
            }}
          >
            %
          </span>
        </div>
      </div>

      {/* Optional label below the ring */}
      {label && (
        <span
          style={{
            fontSize: labelFontSize,
            fontWeight: 500,
            color: "var(--color-muted-foreground)",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
