import type { CSSProperties } from "react";

interface Props {
  on: boolean;
  label?: string;
}

/**
 * Visually-disabled toggle. Policy Engine is read-only in v0 (PRD §4.2),
 * so every toggle is greyed out and non-interactive.
 */
export function ReadOnlyToggle({ on, label }: Props) {
  const track: CSSProperties = {
    position: "relative",
    width: 34,
    height: 20,
    borderRadius: "var(--rounded-full)",
    backgroundColor: on ? "var(--brand-green)" : "#D1D5DB",
    opacity: 0.55,
    transition: "background-color 150ms ease-out",
    flexShrink: 0,
    cursor: "not-allowed",
  };
  const thumb: CSSProperties = {
    position: "absolute",
    top: 2,
    left: on ? 16 : 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    transition: "left 150ms ease-out",
  };
  return (
    <span
      role="switch"
      aria-checked={on}
      aria-disabled="true"
      aria-label={label}
      style={track}
      tabIndex={-1}
    >
      <span style={thumb} />
    </span>
  );
}
