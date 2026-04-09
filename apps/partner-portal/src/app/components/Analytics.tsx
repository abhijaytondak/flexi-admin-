import { useState, useEffect, useCallback, type CSSProperties } from "react";
import {
  BarChart3, TrendingUp, DollarSign, AlertCircle, Percent
} from "lucide-react";
import * as api from "@partner-portal/shared/api";
import { formatINR, parseINR } from "@partner-portal/shared/helpers";
import { StatCard } from "@partner-portal/ui";
import { useSearch } from "@partner-portal/shared/contexts/SearchContext";
import { PLAN_META, BENEFIT_PLANS, type BenefitPlan, type Claim, type Employee, type SalaryBand } from "@partner-portal/shared";
import { DEMO_EMPLOYEES, DEMO_CLAIMS, DEMO_BRACKETS } from "@partner-portal/shared/demo-data";

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const btnGhost: CSSProperties = {
  ...font, display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-3)", backgroundColor: "transparent",
  color: "var(--color-muted-foreground)", border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)", fontSize: "var(--text-sm)", fontWeight: 500, cursor: "pointer",
};

const CATEGORIES = ["Food", "Fuel", "Phone/Internet", "Education", "Health", "Travel", "Other"];

function colorIntensity(pct: number): string {
  if (pct === 0) return "var(--color-background)";
  if (pct < 25) return "#E8F8EF";
  if (pct < 50) return "#B7E4CB";
  if (pct < 75) return "#6FCF97";
  return "#27AE60";
}

function textForIntensity(pct: number): string {
  if (pct >= 50) return "#fff";
  return "var(--color-foreground)";
}

export function Analytics() {
  const { query } = useSearch();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [_brackets, setBrackets] = useState<SalaryBand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [planFilter, setPlanFilter] = useState<string>("All");

  const fetchAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      // Always use demo data for client presentation
      setEmployees(DEMO_EMPLOYEES);
      setClaims(DEMO_CLAIMS);
      setBrackets(DEMO_BRACKETS);
      setSetupRequired(false);
    } catch {
      setEmployees(DEMO_EMPLOYEES);
      setClaims(DEMO_CLAIMS);
      setBrackets(DEMO_BRACKETS);
      setSetupRequired(false);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Compute KPIs
  const filteredEmployees = planFilter === "All"
    ? employees
    : employees.filter(e => e.benefitPlan === planFilter);
  const filteredClaims = planFilter === "All"
    ? claims
    : claims.filter(c => {
        const emp = employees.find(e => e.id === c.employeeId || e.name === c.employeeName);
        return emp?.benefitPlan === planFilter;
      });

  const approvedClaims = filteredClaims.filter(c => c.status === "approved");
  const totalAllocated = filteredEmployees.reduce((sum, e) => sum + parseINR(e.salary), 0);
  const totalRealized = approvedClaims.reduce((sum, c) => sum + parseINR(c.claimAmount), 0);
  const utilizationRate = totalAllocated > 0 ? Math.round((totalRealized / totalAllocated) * 100) : 0;
  const avgClaimValue = approvedClaims.length > 0 ? Math.round(totalRealized / approvedClaims.length) : 0;

  // Department x Category heatmap
  const allDepartments = Array.from(new Set(filteredEmployees.map(e => e.department).filter((d): d is string => Boolean(d))));
  const departments = query.trim()
    ? allDepartments.filter(dept => {
        const q = query.toLowerCase();
        return dept.toLowerCase().includes(q) || CATEGORIES.some(cat => cat.toLowerCase().includes(q));
      })
    : allDepartments;
  const heatmapData: Record<string, Record<string, number>> = {};
  departments.forEach(dept => {
    heatmapData[dept] = {};
    CATEGORIES.forEach(cat => {
      const deptClaims = filteredClaims.filter(c => {
        const catMatch = c.category?.toLowerCase().includes(cat.toLowerCase()) ||
          c.benefitType?.toLowerCase().includes(cat.toLowerCase());
        const deptMatch = c.department === dept;
        return catMatch && deptMatch && c.status === "approved";
      });
      const deptEmpCount = filteredEmployees.filter(e => e.department === dept).length;
      const claimTotal = deptClaims.reduce((s, c) => s + parseINR(c.claimAmount), 0);
      const allocEstimate = deptEmpCount > 0 ? deptEmpCount * (totalAllocated / (filteredEmployees.length || 1)) : 0;
      heatmapData[dept][cat] = allocEstimate > 0 ? Math.round((claimTotal / allocEstimate) * 100) : 0;
    });
  });

  /* Day-0 */
  if (!loading && setupRequired) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "var(--rounded-full)",
            backgroundColor: "var(--brand-accent-alpha-8)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-5)",
          }}>
            <BarChart3 size={32} style={{ color: "var(--brand-navy)" }} />
          </div>
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Analytics will appear here
          </h2>
          <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Add employees and configure policies to see benefit utilization analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid var(--color-border)",
          borderTopColor: "var(--brand-accent)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto var(--space-4)",
        }} />
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <AlertCircle size={40} style={{ color: "var(--brand-red)", marginBottom: "var(--space-3)" }} />
        <p style={{ color: "var(--brand-red)", fontSize: "var(--text-sm)" }}>{error}</p>
        <button style={{ ...btnGhost, marginTop: "var(--space-3)" }} onClick={fetchAll}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Analytics
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Benefit utilization insights across your organization
          </p>
        </div>
      </div>

      {/* Plan Filter Tabs */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
        {["All", ...BENEFIT_PLANS].map(plan => {
          const isActive = planFilter === plan;
          const meta = plan !== "All" ? PLAN_META[plan as BenefitPlan] : null;
          return (
            <button key={plan} onClick={() => setPlanFilter(plan)} style={{
              ...font, padding: "var(--space-2) var(--space-4)",
              borderRadius: "var(--rounded-md)", fontSize: "var(--text-sm)", fontWeight: 500,
              border: `1px solid ${isActive ? (meta?.borderColor || "var(--brand-navy)") : "var(--color-border)"}`,
              cursor: "pointer",
              backgroundColor: isActive ? (meta?.bgColor || "var(--brand-navy)") : "transparent",
              color: isActive ? (meta?.color || "#fff") : "var(--color-muted-foreground)",
              transition: "all 150ms",
            }}>
              {plan}
            </button>
          );
        })}
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <StatCard
          title="Total Allocated"
          value={formatINR(totalAllocated)}
          icon={DollarSign}
          color="var(--brand-navy)"
          bgColor="var(--brand-navy-alpha-08)"
        />
        <StatCard
          title="Total Realized"
          value={formatINR(totalRealized)}
          icon={TrendingUp}
          color="var(--brand-green)"
          bgColor="var(--brand-green-light)"
          change={`${approvedClaims.length} approved`}
          trend="up"
        />
        <StatCard
          title="Utilization Rate"
          value={`${utilizationRate}%`}
          icon={Percent}
          color={utilizationRate >= 60 ? "var(--brand-green)" : "var(--brand-amber)"}
          bgColor={utilizationRate >= 60 ? "var(--brand-green-light)" : "var(--brand-amber-light)"}
        />
        <StatCard
          title="Avg Claim Value"
          value={formatINR(avgClaimValue)}
          icon={BarChart3}
          color="#9B59B6"
          bgColor="#F4ECF7"
        />
      </div>

      {/* Department x Category Heatmap */}
      <div style={{
        backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-lg)", overflow: "hidden",
      }}>
        <div style={{
          padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)",
        }}>
          <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
            Department x Category Utilization
          </h3>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
            Color intensity represents utilization percentage per department and benefit category
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: "left", padding: "var(--space-3) var(--space-4)",
                  fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-background)",
                  position: "sticky", left: 0, zIndex: 1,
                }}>
                  Department
                </th>
                {CATEGORIES.map(cat => (
                  <th key={cat} style={{
                    textAlign: "center", padding: "var(--space-3) var(--space-3)",
                    fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-background)",
                    whiteSpace: "nowrap",
                  }}>
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={CATEGORIES.length + 1} style={{
                    textAlign: "center", padding: "var(--space-8)",
                    color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)",
                  }}>
                    No department data available.
                  </td>
                </tr>
              ) : (
                departments.map((dept, idx) => (
                  <tr key={dept}>
                    <td style={{
                      padding: "var(--space-3) var(--space-4)", fontWeight: 500,
                      color: "var(--color-foreground)", whiteSpace: "nowrap",
                      borderBottom: idx < departments.length - 1 ? "1px solid var(--color-border)" : "none",
                      backgroundColor: "var(--color-card)", position: "sticky", left: 0, zIndex: 1,
                    }}>
                      {dept}
                    </td>
                    {CATEGORIES.map(cat => {
                      const pct = heatmapData[dept]?.[cat] ?? 0;
                      return (
                        <td key={cat} style={{
                          textAlign: "center", padding: "var(--space-3)",
                          backgroundColor: colorIntensity(pct), color: textForIntensity(pct),
                          fontWeight: 500, fontSize: "var(--text-xs)",
                          borderBottom: idx < departments.length - 1 ? "1px solid var(--color-border)" : "none",
                          transition: "background-color 300ms",
                        }}>
                          {pct > 0 ? `${pct}%` : "\u2014"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", alignItems: "center", gap: "var(--space-4)",
          padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)",
          fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)",
        }}>
          <span>Utilization:</span>
          {[
            { label: "0%", bg: "var(--color-background)" },
            { label: "<25%", bg: "#E8F8EF" },
            { label: "<50%", bg: "#B7E4CB" },
            { label: "<75%", bg: "#6FCF97" },
            { label: "75%+", bg: "#27AE60" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: l.bg, border: "1px solid var(--color-border)" }} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
