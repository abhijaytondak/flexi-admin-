import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = "var(--brand-navy)",
}: EmptyStateProps) {
  const [btnHovered, setBtnHovered] = useState(false);

  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--space-8) var(--space-6)",
    textAlign: "center",
  };

  /* Tinted circle behind the icon */
  const circleStyle: CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "var(--space-5)",
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: "var(--text-lg)",
    fontWeight: 600,
    color: "var(--color-foreground)",
    lineHeight: 1.3,
  };

  const descStyle: CSSProperties = {
    margin: "var(--space-2) 0 0",
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
    lineHeight: 1.5,
    maxWidth: 360,
  };

  const btnStyle: CSSProperties = {
    marginTop: "var(--space-5)",
    padding: "var(--space-2) var(--space-5)",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: "#fff",
    backgroundColor: accentColor,
    border: "none",
    borderRadius: "var(--rounded-md)",
    cursor: "pointer",
    transition: "opacity 150ms ease-out, box-shadow 150ms ease-out",
    opacity: btnHovered ? 0.88 : 1,
    boxShadow: btnHovered ? "var(--elevation-sm)" : "none",
  };

  return (
    <div style={wrapperStyle}>
      <div style={circleStyle} aria-hidden="true">
        <Icon size={28} style={{ color: accentColor }} strokeWidth={1.5} />
      </div>

      <h3 style={titleStyle}>{title}</h3>
      <p style={descStyle}>{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={btnStyle}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
