"use client";

import type { ReactNode } from "react";

/**
 * AuthLayout — shared full-viewport wrapper for /login and /forgot-password.
 *
 * The app's root layout (apps/partner-portal/src/app/layout.tsx) unconditionally
 * wraps every route with the <Layout /> chrome (sidebar + top bar). Since the
 * task prohibits modifying that file, this wrapper uses a fixed full-viewport
 * overlay with a high z-index to visually replace the chrome for auth routes.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        backgroundColor: "var(--color-surface)",
        backgroundImage:
          "radial-gradient(1000px 600px at 10% -10%, var(--brand-accent-alpha-8), transparent 60%), radial-gradient(800px 500px at 110% 110%, rgba(219, 219, 0, 0.12), transparent 60%)",
        fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowY: "auto",
      }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: 420,
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-xl)",
          boxShadow: "var(--elevation-lg)",
          padding: "32px 28px",
        }}
      >
        {/* ── Branding ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col items-center"
          style={{ marginBottom: 24, textAlign: "center" }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--rounded-lg)",
              backgroundColor: "var(--brand-accent)",
              marginBottom: 12,
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "0.02em",
            }}
            aria-hidden="true"
          >
            S
          </div>
          <div
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 600,
              color: "var(--color-foreground)",
              lineHeight: 1.2,
            }}
          >
            SalarySe
          </div>
          <div
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-muted-foreground)",
              marginTop: 4,
            }}
          >
            HR Admin Dashboard
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
