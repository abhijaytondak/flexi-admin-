import { useState, useEffect, useCallback, type CSSProperties } from "react";
import {
  ChevronDown, ChevronRight, Shield, ToggleLeft, ToggleRight,
  AlertCircle, AlertTriangle, Mail,
} from "lucide-react";
import { type SalaryBand } from "../types";
import { DEMO_BRACKETS } from "../utils/demoData";

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const cardBase: CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-lg)",
  overflow: "hidden",
  transition: "box-shadow 200ms ease-out, border-color 200ms ease-out",
};

const btnPrimary: CSSProperties = {
  ...font, display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)", backgroundColor: "var(--brand-accent)",
  color: "#fff", border: "none", borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)", fontWeight: 500, cursor: "pointer",
};

/* ─── Recommended Thresholds (annual, INR) ──────────────────────────────────── */
const RECOMMENDED_THRESHOLDS: Record<string, number> = {
  "Food Allowance": 26400,
  "Children's Education Allowance": 1200,
  "Hostel Expenditure Allowance": 3600,
  "Books and Periodicals": 12000,
  "Professional Development Allowance": 24000,
  "Phone/Internet Allowance": 12000,
  "Health and Fitness Allowance": 15000,
  "Uniform Allowance": 12000,
  "Gift Allowance": 5000,
  "Business Travel Allowance": 36000,
  "Fuel Allowance": 21600,
  "Vehicle Maintenance Allowance": 18000,
  "Driver's Salary": 10800,
};

/* ─── Component ──────────────────────────────────────────────────────────────── */
export function PolicyEngine() {
  const [brackets, setBrackets] = useState<SalaryBand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState("");

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    // Defensive shim: migrate any legacy `fixedCap` → `monthlyLimit` and ensure annualLimit exists
    const migrate = (b: any): SalaryBand => ({
      ...b,
      expanded: false,
      benefits: (b.benefits || []).map((ben: any) => {
        const monthly = ben.monthlyLimit ?? ben.fixedCap ?? "0";
        const annual = ben.annualLimit ?? (() => {
          const n = parseFloat(String(monthly).replace(/[^0-9.]/g, ""));
          return isNaN(n) ? "0" : (n * 12).toLocaleString("en-IN");
        })();
        const next: any = { ...ben, monthlyLimit: monthly, annualLimit: annual };
        delete next.fixedCap;
        if (ben.category === "food" && !next.perTxnLimit) {
          next.perTxnLimit = { enabled: false, amount: "0", basis: "per_meal" };
        }
        return next;
      }),
    });
    setBrackets(DEMO_BRACKETS.map(migrate));
    setLoading(false);
  }, []);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  const toggleExpand = (id: string) => {
    setBrackets(prev => prev.map(b => b.id === id ? { ...b, expanded: !b.expanded } : b));
  };

  /* ─── Loading / Error ──────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid var(--color-border)",
          borderTopColor: "var(--brand-accent)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto var(--space-4)",
        }} />
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>Loading policy engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <AlertCircle size={40} style={{ color: "var(--brand-red)", marginBottom: "var(--space-3)" }} />
        <p style={{ color: "var(--brand-red)", fontSize: "var(--text-sm)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Policy Engine
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Pre-configured benefit brackets and allocations
          </p>
        </div>
      </div>

      {/* Contact Us Card */}
      <div
        style={{
          ...cardBase,
          padding: "var(--space-5)",
          marginBottom: "var(--space-5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          background: "linear-gradient(135deg, var(--brand-accent-alpha-8) 0%, var(--color-card) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--rounded-full)",
            backgroundColor: "var(--brand-accent-alpha-8)", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Shield size={22} style={{ color: "var(--brand-navy)" }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Want to make changes to your policy?
            </h3>
            <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
              Contact the Salaryse team to update brackets, add new bands, or modify limits.
            </p>
          </div>
        </div>
        <a
          href="mailto:support@salaryse.com?subject=Policy%20configuration%20change%20request"
          style={{ ...btnPrimary, textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--brand-accent)")}
        >
          <Mail size={16} /> Contact Us
        </a>
      </div>

      {/* Bracket Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {brackets.map(bracket => (
          <div key={bracket.id} style={cardBase}>
            {/* Bracket Header */}
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "var(--space-4) var(--space-5)", cursor: "pointer",
                backgroundColor: bracket.expanded ? "var(--color-background)" : "transparent",
                transition: "background-color 150ms",
              }}
              onClick={() => toggleExpand(bracket.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                {bracket.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <div>
                  <span style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
                    {bracket.name}
                  </span>
                </div>
              </div>
              {bracket.globalMaxLimit && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{
                    fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>
                    Global Max Limit
                  </span>
                  <span style={{
                    fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--brand-navy)",
                    padding: "var(--space-1) var(--space-3)",
                    backgroundColor: "var(--brand-accent-alpha-8)",
                    borderRadius: "var(--rounded-md)",
                  }}>
                    {bracket.globalMaxLimit}
                  </span>
                </div>
              )}
            </div>

            {/* Expanded Benefits */}
            {bracket.expanded && (
              <div style={{ borderTop: "1px solid var(--color-border)", padding: "var(--space-4) var(--space-5)" }}>
                {(!bracket.benefits || bracket.benefits.length === 0) ? (
                  <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)", textAlign: "center", padding: "var(--space-4)" }}>
                    No benefits configured for this bracket.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {/* Table Header */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "1.6fr 80px 120px 120px 80px 80px",
                      gap: "var(--space-3)", padding: "0 0 var(--space-2)",
                      borderBottom: "1px solid var(--color-border)",
                      fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      <span>Benefit</span>
                      <span>Enabled</span>
                      <span>Monthly Cap</span>
                      <span>Annual Limit</span>
                      <span>Bill Req.</span>
                      <span>Carry Fwd</span>
                    </div>
                    {bracket.benefits.map((ben, idx) => (
                      <div key={idx} style={{
                        display: "grid", gridTemplateColumns: "1.6fr 80px 120px 120px 80px 80px",
                        gap: "var(--space-3)", alignItems: "center",
                      }}>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", fontWeight: 500 }}>
                          {ben.name}
                        </span>
                        <span aria-disabled style={{ display: "inline-flex", alignItems: "center" }}>
                          {ben.enabled
                            ? <ToggleRight size={22} style={{ color: "var(--brand-green)" }} />
                            : <ToggleLeft size={22} style={{ color: "var(--color-muted-foreground)" }} />}
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", fontWeight: 500 }}>
                          ₹{ben.monthlyLimit}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", fontWeight: 500 }}>
                            ₹{ben.annualLimit}
                          </span>
                          {(() => {
                            const threshold = RECOMMENDED_THRESHOLDS[ben.name];
                            const capNum = parseFloat(String(ben.annualLimit).replace(/[^0-9.]/g, ""));
                            if (threshold && !isNaN(capNum) && capNum > threshold) {
                              return (
                                <span
                                  title={`Annual limit exceeds recommended threshold of \u20B9${threshold.toLocaleString("en-IN")}.`}
                                  style={{ display: "flex", alignItems: "center", cursor: "help", flexShrink: 0 }}
                                >
                                  <AlertTriangle size={16} style={{ color: "#d97706" }} />
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </span>
                        <span aria-disabled style={{ display: "inline-flex", alignItems: "center" }}>
                          {ben.billRequired
                            ? <ToggleRight size={22} style={{ color: "var(--brand-green)" }} />
                            : <ToggleLeft size={22} style={{ color: "var(--color-muted-foreground)" }} />}
                        </span>
                        <span aria-disabled style={{ display: "inline-flex", alignItems: "center" }}>
                          {ben.carryForward
                            ? <ToggleRight size={22} style={{ color: "var(--brand-green)" }} />
                            : <ToggleLeft size={22} style={{ color: "var(--color-muted-foreground)" }} />}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
