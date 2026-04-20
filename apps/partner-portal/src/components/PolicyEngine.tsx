"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { AlertCircle, Mail, Shield, UserCog } from "lucide-react";

import { CompanyConfigBlock } from "./policy/CompanyConfigBlock";
import { CompanyWideView } from "./policy/CompanyWideView";
import { SlabBasedView } from "./policy/SlabBasedView";
import { AutoApprovePanel } from "./policy/AutoApprovePanel";
import {
  MOCK_AUTO_APPROVE,
  MOCK_COMPANY_CONFIG,
  MOCK_COMPANY_WIDE_CATEGORIES,
  MOCK_SALARY_SLABS,
} from "./policy/mockData";
import type { CompanyPolicyConfig, ConfigurationApproach } from "./policy/types";

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const cardBase: CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-lg)",
  overflow: "hidden",
  transition: "box-shadow 200ms ease-out, border-color 200ms ease-out",
};

const btnPrimary: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)",
  backgroundColor: "var(--brand-accent)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Policy Engine surface — PRD §4.2.
 * Read-only in v0: all toggles disabled, changes funnel through SalarySe support.
 *
 * Structure:
 *   1. Company-Level Configuration (always visible, 5 read-only rows + dev layout switch)
 *   2. Category & Limits View (Company-Wide flat table OR Slab-Based accordion)
 *   3. Auto-Approve Configuration (collapsible panel)
 *   4. Employee-level overrides note
 */
export function PolicyEngine() {
  const [config, setConfig] = useState<CompanyPolicyConfig>(MOCK_COMPANY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Simulate a brief async load so loading state is visible once on mount.
      await new Promise((r) => setTimeout(r, 120));
      setConfig(MOCK_COMPANY_CONFIG);
    } catch {
      setError("Failed to load policy configuration. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  const handleApproachChange = useCallback((next: ConfigurationApproach) => {
    setConfig((prev) => ({ ...prev, configurationApproach: next }));
  }, []);

  const slabRows = useMemo(() => MOCK_SALARY_SLABS, []);
  const companyWideRows = useMemo(() => MOCK_COMPANY_WIDE_CATEGORIES, []);

  /* ─── Loading / Error states ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--color-border)",
            borderTopColor: "var(--brand-accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto var(--space-4)",
          }}
        />
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>
          Loading policy engine…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <AlertCircle
          size={40}
          style={{ color: "var(--brand-red)", marginBottom: "var(--space-3)" }}
        />
        <p style={{ color: "var(--brand-red)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>
          {error}
        </p>
        <button
          type="button"
          onClick={fetchPolicy}
          style={btnPrimary}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-accent)")}
        >
          Retry
        </button>
      </div>
    );
  }

  /* ─── Main render ─────────────────────────────────────────────────────── */
  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-5)",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--color-foreground)",
            }}
          >
            Policy Engine
          </h1>
          <p
            style={{
              margin: "var(--space-1) 0 0",
              fontSize: "var(--text-sm)",
              color: "var(--color-muted-foreground)",
            }}
          >
            Read-only view of company configuration, category limits and auto-approve rules.
          </p>
        </div>
      </div>

      {/* Contact callout — primary mutation path is via SalarySe support in v0 */}
      <div
        style={{
          ...cardBase,
          padding: "var(--space-5)",
          marginBottom: "var(--space-6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          background: "linear-gradient(135deg, var(--brand-accent-alpha-8) 0%, var(--color-card) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--rounded-full)",
              backgroundColor: "var(--brand-accent-alpha-8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield size={22} style={{ color: "var(--brand-navy)" }} />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "var(--text-base)",
                fontWeight: 600,
                color: "var(--color-foreground)",
              }}
            >
              Want to make changes to your policy?
            </h3>
            <p
              style={{
                margin: "var(--space-1) 0 0",
                fontSize: "var(--text-sm)",
                color: "var(--color-muted-foreground)",
              }}
            >
              Policy is read-only in v0. Contact the SalarySe team to update categories, limits or auto-approve rules.
            </p>
          </div>
        </div>
        <a
          href="mailto:support@salaryse.com?subject=Policy%20configuration%20change%20request"
          style={btnPrimary}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-accent)")}
        >
          <Mail size={16} /> Contact Us
        </a>
      </div>

      {/* 1. Company-Level Configuration */}
      <CompanyConfigBlock config={config} onToggleApproach={handleApproachChange} />

      {/* 2. Category & Limits View — layout flips based on configurationApproach */}
      {config.configurationApproach === "Company-Wide" ? (
        <CompanyWideView rows={companyWideRows} />
      ) : (
        <SlabBasedView slabs={slabRows} />
      )}

      {/* 3. Auto-Approve Configuration */}
      <AutoApprovePanel config={MOCK_AUTO_APPROVE} />

      {/* 4. Footer note: employee-level overrides live in Employee Directory */}
      <div
        style={{
          marginTop: "var(--space-6)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-3) var(--space-4)",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-md)",
          fontSize: "var(--text-sm)",
          color: "var(--color-muted-foreground)",
        }}
      >
        <UserCog size={14} style={{ flexShrink: 0, color: "var(--color-muted-foreground)" }} />
        <span>
          Employee-level limit overrides (if any) are visible in Employee Directory.
        </span>
      </div>

    </div>
  );
}
