"use client";

import { useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import type { SalarySlab } from "./types";
import { CategoryLimitsTable } from "./CategoryLimitsTable";
import { formatRupees } from "./mockData";
import { cardBase, font, sectionSubtitle, sectionTitle } from "./shared";

interface Props {
  slabs: SalarySlab[];
}

/**
 * Slab-Based layout — accordion list of salary slabs. Each slab expands
 * into a per-slab Category & Limits table (same columns as Company-Wide).
 */
export function SlabBasedView({ slabs }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([slabs[0]?.id].filter(Boolean) as string[]));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const headerStyle: CSSProperties = {
    padding: "var(--space-4) var(--space-5)",
    borderBottom: "1px solid var(--color-border)",
  };

  if (!slabs.length) {
    return (
      <section style={cardBase}>
        <header style={headerStyle}>
          <h2 style={sectionTitle}>Category &amp; Limits</h2>
          <p style={sectionSubtitle}>No salary slabs defined.</p>
        </header>
      </section>
    );
  }

  return (
    <section style={cardBase} aria-label="Category & Limits (Slab-Based)">
      <header style={headerStyle}>
        <h2 style={sectionTitle}>Category &amp; Limits</h2>
        <p style={sectionSubtitle}>
          Slab-Based — limits vary by salary slab. Expand a slab to view its categories.
        </p>
      </header>

      <div>
        {slabs.map((slab, idx) => {
          const isOpen = expanded.has(slab.id);
          const isLast = idx === slabs.length - 1;
          return (
            <div
              key={slab.id}
              style={{
                borderBottom: isLast ? "none" : "1px solid var(--color-border)",
              }}
            >
              <button
                type="button"
                onClick={() => toggle(slab.id)}
                aria-expanded={isOpen}
                aria-controls={`slab-panel-${slab.id}`}
                style={{
                  ...font,
                  all: "unset",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  width: "100%",
                  padding: "var(--space-4) var(--space-5)",
                  cursor: "pointer",
                  backgroundColor: isOpen ? "var(--color-surface)" : "transparent",
                  transition: "background-color 150ms",
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) e.currentTarget.style.backgroundColor = "var(--color-surface)";
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--rounded-md)",
                      backgroundColor: "var(--brand-accent-alpha-8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-hidden="true"
                  >
                    <Layers size={16} style={{ color: "var(--brand-accent)" }} />
                  </span>
                  {isOpen ? (
                    <ChevronDown size={16} style={{ color: "var(--color-muted-foreground)" }} />
                  ) : (
                    <ChevronRight size={16} style={{ color: "var(--color-muted-foreground)" }} />
                  )}
                  <span
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: 600,
                      color: "var(--color-foreground)",
                    }}
                  >
                    {slab.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      color: "var(--color-muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Overall Monthly Limit
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--brand-navy)",
                      padding: "var(--space-1) var(--space-3)",
                      backgroundColor: "var(--brand-accent-alpha-8)",
                      borderRadius: "var(--rounded-md)",
                    }}
                  >
                    {formatRupees(slab.overallMonthlyLimit)}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div
                  id={`slab-panel-${slab.id}`}
                  role="region"
                  aria-label={`${slab.name} category limits`}
                  style={{ borderTop: "1px solid var(--color-border)" }}
                >
                  <CategoryLimitsTable rows={slab.categories} compact />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
