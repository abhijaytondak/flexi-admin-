"use client";



export interface GoalData {
  label: string;
  value: number;
  target: number;
  unit: string;
}

interface GoalTrackerProps {
  goals: GoalData[];
}

function getColor(value: number, target: number, higherIsBetter: boolean): string {
  const ratio = higherIsBetter ? value / target : target / value;
  if (ratio >= 1) return "var(--brand-green)";
  if (ratio >= 0.7) return "var(--brand-amber)";
  return "var(--brand-red)";
}

function ProgressRing({ goal }: { goal: GoalData }) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Determine if higher is better based on unit context
  const lowerIsBetter = goal.unit === "min" || goal.unit === "days";

  let pct: number;
  if (lowerIsBetter) {
    // For "lower is better" metrics, progress = how close we are (target/value capped at 1)
    pct = goal.value <= 0 ? 100 : Math.min(100, (goal.target / goal.value) * 100);
  } else {
    pct = Math.min(100, (goal.value / goal.target) * 100);
  }

  const offset = circumference - (pct / 100) * circumference;
  const color = lowerIsBetter
    ? getColor(goal.value, goal.target, false)
    : getColor(goal.value, goal.target, true);

  const displayValue = goal.unit === "%" ? `${goal.value}%` : `${goal.value}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: 20,
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        transition: "box-shadow 0.15s, transform 0.15s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
        />
      </svg>

      {/* Center value overlay */}
      <div
        style={{
          marginTop: -size - 12,
          height: size,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--brand-navy)" }}>
          {displayValue}
        </span>
        {goal.unit !== "%" && (
          <span style={{ fontSize: 11, color: "#6b7280" }}>{goal.unit}</span>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-navy)", marginBottom: 4 }}>
          {goal.label}
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          Target: {lowerIsBetter ? "<" : ">"}{goal.target}
          {goal.unit === "%" ? "%" : ` ${goal.unit}`}
        </div>
      </div>
    </div>
  );
}

export function GoalTracker({ goals }: GoalTrackerProps) {
  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "var(--brand-navy)" }}>
        PRD Goal Tracker
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {goals.map((g) => (
          <ProgressRing key={g.label} goal={g} />
        ))}
      </div>
    </div>
  );
}

/** Default PRD goals for standalone usage */
export const DEFAULT_GOALS: GoalData[] = [
  { label: "Benefit Utilization", value: 74, target: 70, unit: "%" },
  { label: "HR Processing Time", value: 8, target: 10, unit: "min" },
  { label: "Submission Rate", value: 88, target: 85, unit: "%" },
  { label: "Approval Turnaround", value: 1.5, target: 2, unit: "days" },
];
