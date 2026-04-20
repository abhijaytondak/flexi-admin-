import type { CSSProperties } from "react";

interface Props {
  value: boolean;
}

/**
 * Small read-only Yes / No badge used in Category & Limits tables.
 * Green "Yes" / muted "No" — no interaction.
 */
export function YesNoBadge({ value }: Props) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
    padding: "2px 10px",
    borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    letterSpacing: "0.02em",
    border: "1px solid",
    backgroundColor: value ? "var(--brand-green-light)" : "var(--color-surface)",
    color: value ? "var(--brand-green-dark)" : "var(--color-muted-foreground)",
    borderColor: value ? "var(--brand-green-border)" : "var(--color-border)",
  };
  return (
    <span style={style} aria-label={value ? "Yes" : "No"}>
      {value ? "Yes" : "No"}
    </span>
  );
}
