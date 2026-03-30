import { useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "alert";
  icon?: LucideIcon;
  color: string;
  bgColor: string;
}

const TREND_CONFIG = {
  up: {
    icon: TrendingUp,
    color: "var(--brand-green)",
    bg: "var(--brand-green-light)",
  },
  down: {
    icon: TrendingDown,
    color: "var(--brand-red)",
    bg: "var(--brand-red-light)",
  },
  alert: {
    icon: AlertTriangle,
    color: "var(--brand-amber)",
    bg: "var(--brand-amber-light)",
  },
} as const;

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  bgColor,
}: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  const trendInfo = trend ? TREND_CONFIG[trend] : null;
  const TrendIcon = trendInfo?.icon;

  const cardStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "var(--color-background)",
    border: `1px solid ${hovered ? color : "var(--color-border)"}`,
    borderRadius: "var(--rounded-lg)",
    padding: "var(--space-5)",
    boxShadow: hovered ? "var(--elevation-md)" : "var(--elevation-xs)",
    transition: "box-shadow 200ms ease-out, border-color 200ms ease-out",
    cursor: "default",
  };

  /* 2px accent gradient along the top edge */
  const accentStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: `linear-gradient(90deg, ${color}, ${color}88)`,
  };

  const iconContainerStyle: CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: "var(--rounded-lg)",
    background: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const pillStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-1)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    lineHeight: 1,
    padding: "3px 8px",
    borderRadius: "var(--rounded-full)",
    color: trendInfo?.color,
    backgroundColor: trendInfo?.bg,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={accentStyle} aria-hidden="true" />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color: "var(--color-muted-foreground)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.04em",
              lineHeight: 1.3,
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: "var(--space-2) 0 0",
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-foreground)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {value}
          </p>

          {change && trendInfo && (
            <div style={{ ...pillStyle, marginTop: "var(--space-3)" }}>
              {TrendIcon && <TrendIcon size={12} />}
              <span>{change}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div style={iconContainerStyle}>
            <Icon size={22} style={{ color }} />
          </div>
        )}
      </div>
    </div>
  );
}
