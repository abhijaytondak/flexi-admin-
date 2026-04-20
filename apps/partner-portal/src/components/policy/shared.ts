import type { CSSProperties } from "react";

/** Shared style tokens used across Policy Engine subcomponents. */
export const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

export const cardBase: CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-lg)",
  overflow: "hidden",
  transition: "box-shadow 200ms ease-out, border-color 200ms ease-out",
};

export const sectionTitle: CSSProperties = {
  margin: 0,
  fontSize: "var(--text-lg)",
  fontWeight: 600,
  color: "var(--color-foreground)",
};

export const sectionSubtitle: CSSProperties = {
  margin: "var(--space-1) 0 0",
  fontSize: "var(--text-sm)",
  color: "var(--color-muted-foreground)",
};
