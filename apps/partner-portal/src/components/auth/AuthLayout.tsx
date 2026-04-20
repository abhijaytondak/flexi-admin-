"use client";

import type { ReactNode } from "react";

/**
 * Full-viewport auth shell. Sits above the app's root sidebar via
 * fixed positioning + z-index, so `/login` and `/forgot-password`
 * render without any app chrome.
 *
 * Visual intent: quiet, neutral, institutional — no gradients, no
 * marketing flash. The card holds the focus; the background reads
 * as paper, not decoration.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "var(--color-surface)",
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: "var(--color-foreground)",
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Faintest tint from existing theme vars — almost imperceptible,
        // just enough to set auth apart from in-app surfaces.
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(61, 65, 250, 0.025), transparent 60%)",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Brand header */}
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <img
            src="/logo.svg"
            alt="SalarySe"
            style={{ height: 28, width: "auto" }}
          />
          <div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-muted-foreground)",
                lineHeight: 1.3,
              }}
            >
              HR Admin Dashboard
            </div>
          </div>
        </header>

        {children}

        <footer
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-muted-foreground)",
            textAlign: "left",
            lineHeight: 1.5,
          }}
        >
          &copy; {new Date().getFullYear()} SalarySe. Internal HR tooling.
        </footer>
      </main>
    </div>
  );
}
