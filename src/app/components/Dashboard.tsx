import React, { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../utils/api";
import { useSearch } from "../contexts/SearchContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import { PLAN_META, BENEFIT_PLANS, AVATAR_COLORS, type BenefitPlan } from "../types";
import { getTimeGreeting, getInitials } from "../utils/helpers";
import {
  TrendingUp,
  TrendingDown,
  Users,
  IndianRupee,
  ShieldCheck,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  Pencil,
  Upload,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════════
   CSS-in-JS helpers — all inline styles use design-system CSS variables
   ═══════════════════════════════════════════════════════════════════════════ */

const CSS = {
  /* Reusable transition for interactive cards */
  cardTransition: "box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease",
  /* Consistent font stack fallback */
  font: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   Static chart data
   ═══════════════════════════════════════════════════════════════════════════ */

const DONUT_DATA = [
  { name: "HRA", value: 32, color: "#3498DB" },
  { name: "Fuel & Travel", value: 22, color: "#27AE60" },
  { name: "Meal Allowance", value: 18, color: "#F39C12" },
  { name: "Children Education", value: 12, color: "#9B59B6" },
  { name: "NPS", value: 10, color: "#E67E22" },
  { name: "Phone & Internet", value: 6, color: "#E74C3C" },
];

const BAR_DATA = [
  { month: "Apr", planned: 42, realized: 38 },
  { month: "May", planned: 45, realized: 40 },
  { month: "Jun", planned: 48, realized: 44 },
  { month: "Jul", planned: 50, realized: 47 },
  { month: "Aug", planned: 52, realized: 45 },
  { month: "Sep", planned: 55, realized: 50 },
  { month: "Oct", planned: 58, realized: 52 },
  { month: "Nov", planned: 60, realized: 56 },
  { month: "Dec", planned: 62, realized: 58 },
  { month: "Jan", planned: 65, realized: 60 },
  { month: "Feb", planned: 68, realized: 63 },
  { month: "Mar", planned: 72, realized: 67 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   AvatarEditorPopover
   ═══════════════════════════════════════════════════════════════════════════ */

function AvatarEditorPopover({
  initials,
  avatarColor,
  onSave,
  onClose,
}: {
  initials: string;
  avatarColor: string;
  onSave: (initials: string, color: string) => void;
  onClose: () => void;
}) {
  const [localInitials, setLocalInitials] = useState(initials);
  const [localColor, setLocalColor] = useState(avatarColor);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 50,
        background: "var(--color-background)",
        borderRadius: "var(--rounded-lg)",
        boxShadow: "var(--elevation-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-5)",
        width: 260,
        fontFamily: CSS.font,
      }}
    >
      {/* Preview */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--rounded-full)",
            background: localColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            letterSpacing: "0.5px",
            flexShrink: 0,
          }}
        >
          {localInitials}
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontSize: "var(--text-xs)",
              color: "var(--color-muted-foreground)",
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            Initials
          </label>
          <input
            value={localInitials}
            maxLength={3}
            onChange={(e) => setLocalInitials(e.target.value.toUpperCase())}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: "var(--rounded-md)",
              border: "1px solid var(--color-border)",
              fontSize: "var(--text-sm)",
              fontFamily: CSS.font,
              fontWeight: 600,
              letterSpacing: "1px",
              outline: "none",
              textAlign: "center",
              transition: "border-color 150ms",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-blue)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          />
        </div>
      </div>

      {/* Color grid */}
      <label
        style={{
          display: "block",
          fontSize: "var(--text-xs)",
          color: "var(--color-muted-foreground)",
          marginBottom: 8,
          fontWeight: 500,
        }}
      >
        Color
      </label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 6,
          marginBottom: "var(--space-4)",
        }}
      >
        {AVATAR_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setLocalColor(c)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--rounded-full)",
              background: c,
              border: localColor === c ? "3px solid var(--color-foreground)" : "3px solid transparent",
              cursor: "pointer",
              transition: "transform 150ms, border-color 150ms",
              outline: "none",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button
          onClick={() => onSave(localInitials, localColor)}
          style={{
            flex: 1,
            padding: "8px 0",
            background: "var(--brand-navy)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--rounded-md)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            fontFamily: CSS.font,
            cursor: "pointer",
            transition: "background 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-navy-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-navy)")}
        >
          Save
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "8px 0",
            background: "transparent",
            color: "var(--color-muted-foreground)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--rounded-md)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            fontFamily: CSS.font,
            cursor: "pointer",
            transition: "background 150ms, border-color 150ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-card)";
            e.currentTarget.style.borderColor = "var(--color-muted-foreground)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PlannedRealizedChart — CSS-only interactive bar chart
   ═══════════════════════════════════════════════════════════════════════════ */

function PlannedRealizedChart() {
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const maxVal = Math.max(...BAR_DATA.flatMap((d) => [d.planned, d.realized]));
  const chartHeight = 220;

  return (
    <div style={{ position: "relative" }}>
      {/* Legend */}
      <div style={{ display: "flex", gap: "var(--space-5)", marginBottom: "var(--space-4)" }}>
        {[
          { label: "Planned", color: "var(--brand-blue)" },
          { label: "Realized", color: "var(--brand-green)" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: item.color,
              }}
            />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height: chartHeight,
          paddingBottom: 28,
          position: "relative",
        }}
      >
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <div
            key={frac}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 28 + (chartHeight - 28) * frac,
              borderBottom:
                frac === 0 ? "1px solid var(--color-border)" : "1px dashed rgba(0,0,0,0.06)",
              pointerEvents: "none",
            }}
          />
        ))}

        {BAR_DATA.map((d) => {
          const isActive = activeMonth === d.month;
          const isDimmed = activeMonth !== null && !isActive;
          const plannedH = (d.planned / maxVal) * (chartHeight - 28);
          const realizedH = (d.realized / maxVal) * (chartHeight - 28);

          return (
            <div
              key={d.month}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                cursor: "pointer",
                opacity: isDimmed ? 0.35 : 1,
                transition: "opacity 200ms ease",
              }}
              onMouseEnter={() => setActiveMonth(d.month)}
              onMouseLeave={() => setActiveMonth(null)}
            >
              {/* Tooltip */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: Math.max(plannedH, realizedH) + 38,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--brand-navy)",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "var(--rounded-md)",
                    fontSize: "var(--text-xs)",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "var(--elevation-md)",
                    lineHeight: 1.6,
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.month}</div>
                  <div>
                    <span style={{ color: "var(--brand-blue-border)" }}>Planned:</span>{" "}
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{d.planned}L</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--brand-green-border)" }}>Realized:</span>{" "}
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{d.realized}L</span>
                  </div>
                  {/* Arrow */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -5,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "5px solid var(--brand-navy)",
                    }}
                  />
                </div>
              )}

              {/* Bar pair */}
              <div
                style={{
                  display: "flex",
                  gap: 3,
                  alignItems: "flex-end",
                  flex: 1,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "38%",
                    height: plannedH,
                    borderRadius: "3px 3px 0 0",
                    background: "var(--brand-blue)",
                    transition: "box-shadow 200ms ease, height 300ms ease",
                    boxShadow: isActive
                      ? "0 0 8px rgba(52, 152, 219, 0.4)"
                      : "none",
                  }}
                />
                <div
                  style={{
                    width: "38%",
                    height: realizedH,
                    borderRadius: "3px 3px 0 0",
                    background: "var(--brand-green)",
                    transition: "box-shadow 200ms ease, height 300ms ease",
                    boxShadow: isActive
                      ? "0 0 8px rgba(39, 174, 96, 0.4)"
                      : "none",
                  }}
                />
              </div>

              {/* Month label */}
              <span
                style={{
                  position: "absolute",
                  bottom: 4,
                  fontSize: 10,
                  color: isActive ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                  fontWeight: isActive ? 700 : 400,
                  transition: "color 150ms, font-weight 150ms",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Custom Donut Tooltip
   ═══════════════════════════════════════════════════════════════════════════ */

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background: "var(--brand-navy)",
        color: "#fff",
        padding: "8px 14px",
        borderRadius: "var(--rounded-md)",
        fontSize: "var(--text-xs)",
        boxShadow: "var(--elevation-md)",
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontWeight: 600 }}>{d.name}</span>
      <br />
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{d.value}%</span> of total
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard — main export
   ═══════════════════════════════════════════════════════════════════════════ */

export function Dashboard() {
  const { profile, saveProfile } = useUserProfile();
  const { query } = useSearch();

  /* ─── State ─────────────────────────────────────────────────────────── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [kpis, setKpis] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any>(null);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ─── Fetch ─────────────────────────────────────────────────────────── */
  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);

      // Check employees for setupRequired
      const empRes = await api.getEmployees();
      if (empRes.setupRequired) {
        setSetupRequired(true);
        setLoading(false);
        return;
      }
      setSetupRequired(false);

      // Fetch dashboard data
      const dashRes = await api.getDashboard();
      setKpis(dashRes.data.kpis);
      setRecentActivity(dashRes.data.recentActivity || []);
      setPlanDistribution(dashRes.data.planDistribution || null);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  /* ─── Avatar save ───────────────────────────────────────────────────── */
  const handleAvatarSave = async (initials: string, color: string) => {
    try {
      await saveProfile({ initials, avatarColor: color });
    } catch { /* handled in context */ }
    setShowAvatarEditor(false);
  };

  /* ─── Filter activity by search ─────────────────────────────────────── */
  const filteredActivity = recentActivity.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.employeeName?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.claimId?.toLowerCase().includes(q) ||
      item.action?.toLowerCase().includes(q)
    );
  });

  /* ─── Today's date formatted ────────────────────────────────────────── */
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* ═══════════════════════════════════════════════════════════════════════
     LOADING STATE
     ═══════════════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 480,
          gap: "var(--space-4)",
          color: "var(--color-muted-foreground)",
          fontFamily: CSS.font,
        }}
      >
        <Loader2
          size={28}
          style={{
            animation: "spin 1s linear infinite",
            color: "var(--brand-navy)",
          }}
        />
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
          Loading dashboard...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     ERROR STATE
     ═══════════════════════════════════════════════════════════════════════ */
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 480,
          gap: "var(--space-4)",
          fontFamily: CSS.font,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--rounded-full)",
            background: "var(--brand-red-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle size={24} style={{ color: "var(--brand-red)" }} />
        </div>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-muted-foreground)",
            maxWidth: 360,
            textAlign: "center",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {error}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboard();
          }}
          style={{
            padding: "8px 20px",
            background: "var(--brand-navy)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--rounded-md)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            fontFamily: CSS.font,
            cursor: "pointer",
            transition: "background 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-navy-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-navy)")}
        >
          Retry
        </button>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     KPI CARD CONFIG
     ═══════════════════════════════════════════════════════════════════════ */
  const kpiCards = [
    {
      key: "totalBenefitOutgo" as const,
      title: "Total Benefit Outgo",
      value: kpis?.totalBenefitOutgo || "₹18.2Cr",
      icon: IndianRupee,
      gradient: "linear-gradient(135deg, var(--brand-green), #1E8A4D)",
      trend: "+12.5%",
      trendUp: true,
      context: "vs. last fiscal year",
      accentGradient: "linear-gradient(90deg, var(--brand-green), var(--brand-blue))",
    },
    {
      key: "avgTaxSaved" as const,
      title: "Avg Tax Saved / Employee",
      value: kpis?.avgTaxSaved || "₹3,20,000",
      icon: ShieldCheck,
      gradient: "linear-gradient(135deg, var(--brand-blue), #2372A8)",
      trend: "+8.3%",
      trendUp: true,
      context: "across all benefit plans",
      accentGradient: "linear-gradient(90deg, var(--brand-blue), var(--brand-purple))",
    },
    {
      key: "pendingApprovals" as const,
      title: "Pending Approvals",
      value: kpis?.pendingApprovals ?? "24",
      icon: Clock,
      gradient: "linear-gradient(135deg, var(--brand-amber), #D4880D)",
      trend: "-3",
      trendUp: false,
      context: "requires your attention",
      accentGradient: "linear-gradient(90deg, var(--brand-amber), var(--brand-orange))",
    },
    {
      key: "activeEmployees" as const,
      title: "Active Employees",
      value: kpis?.activeEmployees ?? "342",
      icon: Users,
      gradient: "linear-gradient(135deg, var(--brand-navy), #243A4F)",
      trend: "+18",
      trendUp: true,
      context: "enrolled in benefit plans",
      accentGradient: "linear-gradient(90deg, var(--brand-navy), var(--brand-blue))",
    },
  ];

  const visibleKpiCards = kpiCards.filter(
    (card) => profile.dashboardCards[card.key]
  );

  /* ═══════════════════════════════════════════════════════════════════════
     PLAN DISTRIBUTION (from API or static fallback)
     ═══════════════════════════════════════════════════════════════════════ */
  const planDist = planDistribution || {
    Standard: { count: 128, total: 342 },
    Premium: { count: 145, total: 342 },
    Executive: { count: 69, total: 342 },
  };
  const totalEmployees = Object.values(planDist).reduce(
    (sum: number, p: any) => sum + (p.count || 0),
    0
  );

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        fontFamily: CSS.font,
        maxWidth: 1280,
      }}
    >
      {/* ─── 1. WELCOME BANNER ──────────────────────────────────────────── */}
      {profile.showGreeting && (
        <div
          style={{
            position: "relative",
            background:
              "radial-gradient(ellipse at 10% 90%, rgba(39,174,96,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(52,152,219,0.12) 0%, transparent 50%), linear-gradient(135deg, var(--brand-navy) 0%, #243A4F 100%)",
            borderRadius: "var(--rounded-lg)",
            padding: "var(--space-6) var(--space-8)",
            color: "#fff",
            overflow: "hidden",
            /* Inset top highlight */
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), var(--elevation-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-4)",
            }}
          >
            {/* Left: avatar + greeting */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-5)",
              }}
            >
              {/* Avatar with editor toggle */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowAvatarEditor(!showAvatarEditor)}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--rounded-full)",
                    background: profile.avatarColor,
                    border: "2.5px solid rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "var(--text-lg)",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    cursor: "pointer",
                    transition: "border-color 200ms, transform 200ms",
                    fontFamily: CSS.font,
                    padding: 0,
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  aria-label="Edit avatar"
                >
                  {profile.initials}
                  {/* Tiny pencil overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 18,
                      height: 18,
                      borderRadius: "var(--rounded-full)",
                      background: "var(--color-background)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "var(--elevation-xs)",
                    }}
                  >
                    <Pencil size={9} style={{ color: "var(--brand-navy)" }} />
                  </div>
                </button>

                {showAvatarEditor && (
                  <AvatarEditorPopover
                    initials={profile.initials}
                    avatarColor={profile.avatarColor}
                    onSave={handleAvatarSave}
                    onClose={() => setShowAvatarEditor(false)}
                  />
                )}
              </div>

              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "var(--text-xl)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {getTimeGreeting()}, {profile.name.split(" ")[0]}!
                </h1>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "var(--text-sm)",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.4,
                  }}
                >
                  {profile.designation} &middot; {profile.department}
                </p>
              </div>
            </div>

            {/* Right: date + edit link */}
            <div
              style={{
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Calendar size={12} />
                {todayFormatted}
              </span>
              <button
                onClick={() => {/* navigate to profile */}}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "var(--rounded-md)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  fontFamily: CSS.font,
                  padding: "5px 14px",
                  cursor: "pointer",
                  transition: "background 150ms, color 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }}
              >
                Edit profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SETUP REQUIRED STATE ───────────────────────────────────────── */}
      {setupRequired && (
        <div
          style={{
            background: "var(--color-background)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--rounded-lg)",
            padding: "var(--space-8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            minHeight: 320,
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--rounded-full)",
              background: "var(--brand-blue-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={28} style={{ color: "var(--brand-blue)" }} />
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-foreground)",
            }}
          >
            Welcome to SalarySe FlexiBenefits
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-sm)",
              color: "var(--color-muted-foreground)",
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            Import employees to get started. Once you have employees enrolled in
            benefit plans, your dashboard analytics will appear here.
          </p>
          <button
            style={{
              marginTop: "var(--space-2)",
              padding: "10px 24px",
              background: "var(--brand-navy)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--rounded-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              fontFamily: CSS.font,
              cursor: "pointer",
              transition: "background 150ms",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-navy-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-navy)")}
          >
            <Upload size={14} />
            Import Employees
          </button>
        </div>
      )}

      {/* ═══ MAIN DASHBOARD CONTENT (only when not setup required) ═══════ */}
      {!setupRequired && (
        <>
          {/* ─── 2. PLAN DISTRIBUTION STRIP ─────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-4)",
            }}
          >
            {BENEFIT_PLANS.map((plan) => {
              const meta = PLAN_META[plan];
              const dist = planDist[plan] || { count: 0, total: totalEmployees };
              const pct = totalEmployees > 0 ? Math.round((dist.count / totalEmployees) * 100) : 0;

              return (
                <div
                  key={plan}
                  style={{
                    background: "var(--color-background)",
                    borderRadius: "var(--rounded-lg)",
                    border: "1px solid var(--color-border)",
                    borderLeft: `3px solid ${meta.color}`,
                    padding: "var(--space-5)",
                    transition: CSS.cardTransition,
                    cursor: "default",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "var(--elevation-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Gradient swatch in top-right */}
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      right: -12,
                      width: 56,
                      height: 56,
                      borderRadius: "var(--rounded-full)",
                      background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}08)`,
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "var(--text-xl)",
                          fontWeight: 700,
                          color: "var(--color-foreground)",
                          lineHeight: 1.2,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {dist.count}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--color-muted-foreground)",
                          marginTop: 2,
                        }}
                      >
                        employees
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: meta.color,
                        background: meta.bgColor,
                        border: `1px solid ${meta.borderColor}`,
                        borderRadius: "var(--rounded-full)",
                        padding: "2px 10px",
                        letterSpacing: "0.02em",
                        lineHeight: "18px",
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--color-muted-foreground)",
                      marginBottom: 8,
                    }}
                  >
                    {meta.bracketRange}
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: "var(--color-card)",
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: meta.color,
                        boxShadow: `0 0 6px ${meta.color}40`,
                        transition: "width 500ms ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--color-muted-foreground)",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── 3. KPI CARDS ───────────────────────────────────────────── */}
          {visibleKpiCards.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(visibleKpiCards.length, 4)}, 1fr)`,
                gap: "var(--space-4)",
              }}
            >
              {visibleKpiCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.key}
                    style={{
                      background: "var(--color-background)",
                      borderRadius: "var(--rounded-lg)",
                      border: "1px solid var(--color-border)",
                      padding: "var(--space-5)",
                      position: "relative",
                      overflow: "hidden",
                      transition: CSS.cardTransition,
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "var(--elevation-md)";
                      e.currentTarget.style.borderColor = "var(--brand-navy-alpha-20)";
                      const icon = e.currentTarget.querySelector("[data-kpi-icon]") as HTMLElement;
                      if (icon) icon.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      const icon = e.currentTarget.querySelector("[data-kpi-icon]") as HTMLElement;
                      if (icon) icon.style.transform = "scale(1)";
                    }}
                  >
                    {/* 2px top accent gradient */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: card.accentGradient,
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "var(--space-3)",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-muted-foreground)",
                            fontWeight: 500,
                            marginBottom: 6,
                            letterSpacing: "0.01em",
                          }}
                        >
                          {card.title}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-2xl)",
                            fontWeight: 700,
                            color: "var(--color-foreground)",
                            lineHeight: 1.1,
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {card.value}
                        </div>
                      </div>

                      {/* Icon container */}
                      <div
                        data-kpi-icon=""
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "var(--rounded-lg)",
                          background: card.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "transform 200ms ease",
                        }}
                      >
                        <Icon size={20} style={{ color: "#fff" }} />
                      </div>
                    </div>

                    {/* Trend pill */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: "var(--space-3)",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 11,
                          fontWeight: 600,
                          color: card.trendUp ? "var(--brand-green)" : "var(--brand-red)",
                          background: card.trendUp
                            ? "var(--brand-green-light)"
                            : "var(--brand-red-light)",
                          borderRadius: "var(--rounded-full)",
                          padding: "2px 8px",
                          lineHeight: "16px",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {card.trendUp ? (
                          <TrendingUp size={11} />
                        ) : (
                          <TrendingDown size={11} />
                        )}
                        {card.trend}
                      </span>
                    </div>

                    {/* Separator + context */}
                    <div
                      style={{
                        borderTop: "1px solid var(--color-border)",
                        paddingTop: "var(--space-3)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        {card.context}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── 4. CHARTS ROW ──────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 3fr",
              gap: "var(--space-4)",
            }}
          >
            {/* Donut chart */}
            <div
              style={{
                background: "var(--color-background)",
                borderRadius: "var(--rounded-lg)",
                border: "1px solid var(--color-border)",
                padding: "var(--space-5)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 var(--space-4)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Benefit Distribution by Category
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                }}
              >
                <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DONUT_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={72}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {DONUT_DATA.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  {DONUT_DATA.map((item) => (
                    <div
                      key={item.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "5px 8px",
                        borderRadius: "var(--rounded-sm)",
                        transition: "background 150ms",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--color-card)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: item.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-foreground)",
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          color: "var(--color-muted-foreground)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div
              style={{
                background: "var(--color-background)",
                borderRadius: "var(--rounded-lg)",
                border: "1px solid var(--color-border)",
                padding: "var(--space-5)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 var(--space-2)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Planned vs Realized Benefits (₹ Lakhs)
              </h3>
              <PlannedRealizedChart />
            </div>
          </div>

          {/* ─── 5. RECENT ACTIVITY FEED ────────────────────────────────── */}
          <div
            style={{
              background: "var(--color-background)",
              borderRadius: "var(--rounded-lg)",
              border: "1px solid var(--color-border)",
              padding: "var(--space-5)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Recent Approval Activity
              </h3>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--rounded-md)",
                  padding: "5px 12px",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  color: "var(--color-muted-foreground)",
                  fontFamily: CSS.font,
                  cursor: refreshing ? "default" : "pointer",
                  opacity: refreshing ? 0.6 : 1,
                  transition: "background 150ms, border-color 150ms",
                }}
                onMouseEnter={(e) => {
                  if (!refreshing) {
                    e.currentTarget.style.background = "var(--color-card)";
                    e.currentTarget.style.borderColor = "var(--color-muted-foreground)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <RefreshCw
                  size={12}
                  style={{
                    animation: refreshing ? "spin 1s linear infinite" : "none",
                  }}
                />
                Refresh
              </button>
            </div>

            {/* Activity rows */}
            {filteredActivity.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "var(--space-8) var(--space-4)",
                  color: "var(--color-muted-foreground)",
                  textAlign: "center",
                }}
              >
                <Clock
                  size={32}
                  style={{
                    color: "var(--color-border)",
                    marginBottom: "var(--space-3)",
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                  }}
                >
                  {query
                    ? "No activity matching your search"
                    : "No recent activity"}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  {query
                    ? "Try adjusting your search query"
                    : "Approval actions will appear here"}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {filteredActivity.map((item, idx) => {
                  const isApproved =
                    item.action === "approved" || item.status === "approved";
                  const isRejected =
                    item.action === "rejected" || item.status === "rejected";
                  const statusColor = isApproved
                    ? "var(--brand-green)"
                    : isRejected
                    ? "var(--brand-red)"
                    : "var(--brand-amber)";
                  const statusBg = isApproved
                    ? "var(--brand-green-light)"
                    : isRejected
                    ? "var(--brand-red-light)"
                    : "var(--brand-amber-light)";
                  const StatusIcon = isApproved ? Check : isRejected ? X : Clock;

                  return (
                    <div
                      key={item.claimId || idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-4)",
                        padding: "var(--space-3) var(--space-2)",
                        borderBottom:
                          idx < filteredActivity.length - 1
                            ? "1px solid var(--color-border)"
                            : "none",
                        borderRadius: "var(--rounded-sm)",
                        transition: "background 150ms",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--color-card)";
                        /* Dim separators on hover */
                        const border = e.currentTarget.style;
                        if (idx < filteredActivity.length - 1) {
                          border.borderBottomColor = "rgba(226,226,226,0.5)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        if (idx < filteredActivity.length - 1) {
                          e.currentTarget.style.borderBottomColor = "var(--color-border)";
                        }
                      }}
                    >
                      {/* Status icon */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--rounded-full)",
                          background: statusBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 0 0 3px ${statusBg}`,
                        }}
                      >
                        <StatusIcon size={14} style={{ color: statusColor }} />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-foreground)",
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: statusColor, fontWeight: 600 }}>
                            {isApproved
                              ? "Approved"
                              : isRejected
                              ? "Rejected"
                              : "Pending"}
                          </span>{" "}
                          claim for{" "}
                          <span style={{ fontWeight: 600 }}>
                            {item.employeeName}
                          </span>
                          {item.type && (
                            <>
                              {" "}&middot;{" "}
                              <span style={{ color: "var(--color-muted-foreground)" }}>
                                {item.type}
                              </span>
                            </>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-3)",
                            marginTop: 4,
                            fontSize: "var(--text-xs)",
                            color: "var(--color-muted-foreground)",
                          }}
                        >
                          {item.claimId && (
                            <span
                              style={{
                                background: "var(--color-card)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "var(--rounded-sm)",
                                padding: "1px 7px",
                                fontSize: 10,
                                fontWeight: 500,
                                fontVariantNumeric: "tabular-nums",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {item.claimId}
                            </span>
                          )}
                          {item.timestamp && (
                            <span>{item.timestamp}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      {item.amount && (
                        <div
                          style={{
                            fontSize: "var(--text-sm)",
                            fontWeight: 700,
                            color: "var(--color-foreground)",
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.amount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Keyframe animation for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
