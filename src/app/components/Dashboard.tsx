import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import * as api from "../utils/api";
import { useUserProfile } from "../contexts/UserProfileContext";
import { AVATAR_COLORS } from "../types";
import { DEMO_DASHBOARD, DEMO_EMPLOYEES } from "../utils/demoData";
import { useIsMobile } from "../hooks/useIsMobile";
import { getTimeGreeting, formatINR } from "../utils/helpers";
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
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Briefcase,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════════
   Design tokens — Microdose-inspired analytics dashboard
   ═══════════════════════════════════════════════════════════════════════════ */

const T = {
  font: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  border: "#EBEBEB",
  fg: "#1A1A1A",
  muted: "#8C8C8C",
  mutedLight: "#B3B3B3",
  accent: "#E8683A",
  green: "#27AE60",
  greenBg: "#EAFAF1",
  red: "#E74C3C",
  redBg: "#FDEDEC",
  amber: "#F39C12",
  amberBg: "#FEF9E7",
  blue: "#3498DB",
  blueBg: "#EBF5FB",
  purple: "#9B59B6",
  radius: 12,
  transition: "all 200ms ease",
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   Static chart data — Benefit Utilization
   ═══════════════════════════════════════════════════════════════════════════ */

/* Claims Overview — daily volume over past month */
const CLAIMS_OVERVIEW_DATA = [
  { date: "1", claims: 820 },
  { date: "3", claims: 1200 },
  { date: "5", claims: 950 },
  { date: "7", claims: 1800 },
  { date: "9", claims: 2100 },
  { date: "11", claims: 1600 },
  { date: "13", claims: 3200 },
  { date: "15", claims: 4500 },
  { date: "17", claims: 3800 },
  { date: "19", claims: 5200 },
  { date: "21", claims: 6800 },
  { date: "23", claims: 7200 },
  { date: "25", claims: 9400 },
  { date: "27", claims: 11200 },
  { date: "29", claims: 12800 },
  { date: "31", claims: 14200 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Shared style helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const cardStyle: React.CSSProperties = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  padding: 24,
  fontFamily: T.font,
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: T.fg,
  margin: 0,
  lineHeight: 1.3,
};

const cardSubtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: T.muted,
  margin: "2px 0 0",
  fontWeight: 400,
};

/* ═══════════════════════════════════════════════════════════════════════════
   AvatarEditorPopover — simplified
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
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 50,
        background: T.card,
        borderRadius: T.radius,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
        border: `1px solid ${T.border}`,
        padding: 20,
        width: 260,
        fontFamily: T.font,
      }}
    >
      {/* Preview */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: localColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.5px",
            flexShrink: 0,
          }}
        >
          {localInitials}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 11, color: T.muted, marginBottom: 4, fontWeight: 500 }}>
            Initials
          </label>
          <input
            value={localInitials}
            maxLength={3}
            onChange={(e) => setLocalInitials(e.target.value.toUpperCase())}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              fontSize: 13,
              fontFamily: T.font,
              fontWeight: 600,
              letterSpacing: "1px",
              outline: "none",
              textAlign: "center",
              transition: "border-color 150ms",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = T.accent)}
            onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
          />
        </div>
      </div>

      {/* Color grid */}
      <label style={{ display: "block", fontSize: 11, color: T.muted, marginBottom: 8, fontWeight: 500 }}>
        Color
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 16 }}>
        {AVATAR_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setLocalColor(c)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: c,
              border: localColor === c ? `3px solid ${T.fg}` : "3px solid transparent",
              cursor: "pointer",
              transition: "transform 150ms",
              outline: "none",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onSave(localInitials, localColor)}
          style={{
            flex: 1,
            padding: "8px 0",
            background: T.accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: T.font,
            cursor: "pointer",
            transition: "opacity 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Save
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "8px 0",
            background: "transparent",
            color: T.muted,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: T.font,
            cursor: "pointer",
            transition: "background 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Custom Recharts Tooltip
   ═══════════════════════════════════════════════════════════════════════════ */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: T.fg,
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        lineHeight: 1.6,
        fontFamily: T.font,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 11, opacity: 0.7 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
          <span style={{ opacity: 0.8 }}>{p.name}:</span>
          <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

function SingleLineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: T.fg,
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        fontFamily: T.font,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 11, opacity: 0.7 }}>Day {label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i}>
          <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
          </span>
          <span style={{ opacity: 0.7, marginLeft: 4 }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: T.fg,
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        fontFamily: T.font,
        lineHeight: 1.6,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 11, opacity: 0.7 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 3, borderRadius: 1, background: p.color, flexShrink: 0 }} />
          <span style={{ opacity: 0.8 }}>{p.name}:</span>
          <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{p.value} Cr</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DropdownSelector — small pill dropdown for chart headers
   ═══════════════════════════════════════════════════════════════════════════ */

function DropdownSelector({ value, options }: { value: string; options?: string[] }) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 10px",
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        color: T.muted,
        fontFamily: T.font,
        cursor: "pointer",
        transition: "border-color 150ms",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.mutedLight)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
    >
      {value}
      <ChevronDown size={12} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard — main export
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   Static data for Benefits / Claims tabs
   ═══════════════════════════════════════════════════════════════════════════ */

const BENEFIT_CATEGORIES = [
  { name: "Food & Meals", limit: "2,200/mo", utilization: 78, color: T.accent },
  { name: "Fuel & Travel", limit: "1,600/mo", utilization: 64, color: T.blue },
  { name: "Communication", limit: "1,000/mo", utilization: 52, color: T.green },
  { name: "Leave Travel", limit: "25,000/yr", utilization: 34, color: T.purple },
  { name: "Professional Pursuit", limit: "15,000/yr", utilization: 41, color: T.amber },
  { name: "Gadget Allowance", limit: "20,000/yr", utilization: 28, color: "#1ABC9C" },
];


/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard — main export
   ═══════════════════════════════════════════════════════════════════════════ */

export function Dashboard() {
  const { profile, saveProfile } = useUserProfile();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
      // Always use demo data for client presentation
      setSetupRequired(false);
      setKpis(DEMO_DASHBOARD.kpis);
      setRecentActivity(DEMO_DASHBOARD.recentActivity || []);
      setPlanDistribution(DEMO_DASHBOARD.planDistribution || null);
    } catch {
      setKpis(DEMO_DASHBOARD.kpis);
      setRecentActivity(DEMO_DASHBOARD.recentActivity || []);
      setPlanDistribution(DEMO_DASHBOARD.planDistribution || null);
      setSetupRequired(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboard();
      toast.success("Dashboard refreshed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  /* ─── Avatar save ───────────────────────────────────────────────────── */
  const handleAvatarSave = async (initials: string, color: string) => {
    try {
      await saveProfile({ initials, avatarColor: color });
      toast.success("Avatar updated");
      setShowAvatarEditor(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update avatar");
    }
  };

  /* ─── Activity ──────────────────────────────────────────────────────── */
  const filteredActivity = recentActivity;

  /* ─── Claim status counts for Claims tab ───────────────────────────── */
  const claimStatusCounts = useMemo(() => {
    let approved = 0, rejected = 0, pending = 0;
    recentActivity.forEach((item) => {
      const isApproved = item.action === "approved" || item.status === "approved";
      const isRejected = item.action === "rejected" || item.status === "rejected";
      if (isApproved) approved++;
      else if (isRejected) rejected++;
      else pending++;
    });
    return { approved, rejected, pending, total: recentActivity.length };
  }, [recentActivity]);

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
          gap: 16,
          color: T.muted,
          fontFamily: T.font,
        }}
      >
        <Loader2
          size={28}
          style={{ animation: "spin 1s linear infinite", color: T.accent }}
        />
        <span style={{ fontSize: 14, fontWeight: 500 }}>Loading dashboard...</span>
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
          gap: 16,
          fontFamily: T.font,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: T.redBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle size={24} style={{ color: T.red }} />
        </div>
        <p style={{ fontSize: 14, color: T.muted, maxWidth: 360, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
          {error}
        </p>
        <button
          onClick={() => { setLoading(true); fetchDashboard(); }}
          style={{
            padding: "10px 24px",
            background: T.accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: T.font,
            cursor: "pointer",
            transition: "opacity 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Retry
        </button>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     KPI CONFIG
     ═══════════════════════════════════════════════════════════════════════ */
  const kpiMetrics = [
    {
      label: "Pending Approvals",
      value: kpis?.pendingApprovals ?? "33",
      trend: null,
      trendUp: false,
      isWarning: true,
    },
    {
      label: "Active Employees",
      value: kpis?.activeEmployees ?? "2,859",
      trend: 4.9,
      trendUp: true,
    },
  ];

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        fontFamily: T.font,
        maxWidth: 1280,
        color: T.fg,
      }}
    >
      {/* ─── 1. PAGE HEADER ────────────────────────────────────────────── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              color: T.fg,
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            Dashboard
          </h1>

        </div>

      </div>

      {/* ─── SETUP REQUIRED STATE ──────────────────────────────────────── */}
      {setupRequired && (
        <div
          style={{
            ...cardStyle,
            border: `1px dashed ${T.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            minHeight: 400,
            gap: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: T.blueBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Briefcase size={32} style={{ color: T.blue }} />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.fg }}>
            Welcome! Let's set up your benefits
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: T.muted, maxWidth: 420, lineHeight: 1.7 }}>
            Import employees to get started. Once you have employees enrolled in
            benefit plans, your dashboard analytics will appear here.
          </p>
          <button
            onClick={() => navigate("/onboarding")}
            style={{
              marginTop: 8,
              padding: "12px 28px",
              background: T.accent,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: T.font,
              cursor: "pointer",
              transition: "opacity 150ms",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Upload size={14} />
            Start Setup
          </button>
        </div>
      )}

      {/* ═══ MAIN DASHBOARD CONTENT ═══════════════════════════════════════ */}
      {!setupRequired && (
        <>

          {/* ─── 2. PERFORMANCE SUMMARY ───────────────────────────────── */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ ...cardTitleStyle, fontSize: 16 }}>Performance summary</h2>
              <p style={cardSubtitleStyle}>View your key benefit metrics</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : `repeat(${kpiMetrics.length}, 1fr)`,
                gap: isMobile ? 16 : 0,
                borderTop: `1px solid ${T.border}`,
                paddingTop: 20,
              }}
            >
              {kpiMetrics.map((kpi, idx) => (
                <div
                  key={kpi.label}
                  style={{
                    padding: "0 20px",
                    borderRight: idx < kpiMetrics.length - 1 ? `1px solid ${T.border}` : "none",
                    /* First item needs no left padding */
                    ...(idx === 0 ? { paddingLeft: 0 } : {}),
                    /* Last item needs no right padding */
                    ...(idx === kpiMetrics.length - 1 ? { paddingRight: 0 } : {}),
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: T.muted,
                      fontWeight: 400,
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {kpi.label}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: T.fg,
                      lineHeight: 1.1,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.02em",
                      marginBottom: 8,
                    }}
                  >
                    {kpi.value}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    {kpi.isWarning ? (
                      <>
                        <ArrowUpRight size={14} style={{ color: T.amber }} />
                        <span style={{ color: T.amber, fontWeight: 600 }}>&uarr;</span>
                        <span style={{ color: T.muted }}>from last month</span>
                      </>
                    ) : (
                      <>
                        {kpi.trendUp ? (
                          <ArrowUpRight size={14} style={{ color: T.green }} />
                        ) : (
                          <ArrowDownRight size={14} style={{ color: T.red }} />
                        )}
                        <span
                          style={{
                            color: kpi.trendUp ? T.green : T.red,
                            fontWeight: 600,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {kpi.trendUp ? "+" : "-"}{kpi.trend}%
                        </span>
                        <span style={{ color: T.muted }}>than last month</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── 3. CLAIMS OVERVIEW CHART ──────────────────────────────── */}
          <div>
            {/* Claims Overview — Area chart */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <h3 style={cardTitleStyle}>Claims Overview</h3>
                  <p style={cardSubtitleStyle}>Volume of claims processed</p>
                </div>
                <DropdownSelector value="Last month" />
              </div>

              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CLAIMS_OVERVIEW_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradClaims" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.blue} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={T.blue} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: T.muted, fontFamily: T.font }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: T.muted, fontFamily: T.font }}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                      domain={[0, 15000]}
                    />
                    <Tooltip content={<SingleLineTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="claims"
                      name="Claims"
                      stroke={T.blue}
                      strokeWidth={2}
                      fill="url(#gradClaims)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: T.card }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ─── 5. RECENT ACTIVITY TABLE ─────────────────────────────── */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <h3 style={cardTitleStyle}>Recent Activity</h3>
                <p style={cardSubtitleStyle}>Latest benefit claims and approvals</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: T.muted,
                  fontFamily: T.font,
                  cursor: refreshing ? "default" : "pointer",
                  opacity: refreshing ? 0.6 : 1,
                  transition: "background 150ms, border-color 150ms",
                }}
                onMouseEnter={(e) => {
                  if (!refreshing) {
                    e.currentTarget.style.background = T.bg;
                    e.currentTarget.style.borderColor = T.mutedLight;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = T.border;
                }}
              >
                <RefreshCw
                  size={13}
                  style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
                />
                Refresh
              </button>
            </div>

            {filteredActivity.length === 0 ? (
              /* Empty state */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 16px",
                  color: T.muted,
                  textAlign: "center",
                }}
              >
                <FileText size={32} style={{ color: T.border, marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                  No recent activity
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                  Approval actions will appear here
                </p>
              </div>
            ) : (
              /* Table */
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                    fontFamily: T.font,
                  }}
                >
                  <thead>
                    <tr>
                      {["Employee", "Benefit Type", "Amount", "Status", "Date"].map((col) => (
                        <th
                          key={col}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: T.muted,
                            borderBottom: `1px solid ${T.border}`,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivity.map((item, idx) => {
                      const isApproved = item.action === "approved" || item.status === "approved";
                      const isRejected = item.action === "rejected" || item.status === "rejected";
                      const isPending = !isApproved && !isRejected;
                      const statusLabel = isApproved ? "Approved" : isRejected ? "Rejected" : "Pending";
                      const statusColor = isApproved ? T.green : isRejected ? T.red : T.amber;
                      const statusBg = isApproved ? T.greenBg : isRejected ? T.redBg : T.amberBg;

                      return (
                        <tr
                          key={item.claimId || idx}
                          style={{
                            transition: "background 150ms",
                            cursor: "default",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Employee */}
                          <td
                            style={{
                              padding: "12px 12px",
                              borderBottom: idx < filteredActivity.length - 1 ? `1px solid ${T.border}` : "none",
                              fontWeight: 500,
                              color: T.fg,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  background: item.avatarColor || T.blue,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#fff",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {item.initials || (item.employeeName || "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <span>{item.employeeName}</span>
                            </div>
                          </td>

                          {/* Benefit Type */}
                          <td
                            style={{
                              padding: "12px 12px",
                              borderBottom: idx < filteredActivity.length - 1 ? `1px solid ${T.border}` : "none",
                              color: T.muted,
                            }}
                          >
                            {item.type || item.category || "--"}
                          </td>

                          {/* Amount */}
                          <td
                            style={{
                              padding: "12px 12px",
                              borderBottom: idx < filteredActivity.length - 1 ? `1px solid ${T.border}` : "none",
                              fontWeight: 600,
                              fontVariantNumeric: "tabular-nums",
                              color: T.fg,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.amount || "--"}
                          </td>

                          {/* Status badge */}
                          <td
                            style={{
                              padding: "12px 12px",
                              borderBottom: idx < filteredActivity.length - 1 ? `1px solid ${T.border}` : "none",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 10px",
                                borderRadius: 100,
                                fontSize: 11,
                                fontWeight: 600,
                                color: statusColor,
                                background: statusBg,
                                lineHeight: "16px",
                              }}
                            >
                              {isApproved && <Check size={11} />}
                              {isRejected && <X size={11} />}
                              {isPending && <Clock size={11} />}
                              {statusLabel}
                            </span>
                          </td>

                          {/* Date */}
                          <td
                            style={{
                              padding: "12px 12px",
                              borderBottom: idx < filteredActivity.length - 1 ? `1px solid ${T.border}` : "none",
                              color: T.muted,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.timestamp || item.dateSubmitted || "--"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
