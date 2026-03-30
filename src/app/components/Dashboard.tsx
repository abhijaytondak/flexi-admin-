import React, { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../utils/api";
import { useSearch } from "../contexts/SearchContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import { PLAN_META, BENEFIT_PLANS, AVATAR_COLORS, type BenefitPlan } from "../types";
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
  Calendar,
  Filter,
  LayoutGrid,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
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

const UTILIZATION_DATA = [
  { month: "Apr", food: 32, fuel: 24, communication: 18 },
  { month: "May", food: 35, fuel: 28, communication: 22 },
  { month: "Jun", food: 38, fuel: 26, communication: 25 },
  { month: "Jul", food: 42, fuel: 30, communication: 20 },
  { month: "Aug", food: 40, fuel: 34, communication: 28 },
  { month: "Sep", food: 45, fuel: 32, communication: 26 },
  { month: "Oct", food: 48, fuel: 36, communication: 30 },
  { month: "Nov", food: 50, fuel: 38, communication: 32 },
  { month: "Dec", food: 46, fuel: 40, communication: 35 },
  { month: "Jan", food: 52, fuel: 42, communication: 34 },
  { month: "Feb", food: 55, fuel: 44, communication: 38 },
  { month: "Mar", food: 58, fuel: 46, communication: 40 },
];

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

/* Plan Distribution by department — horizontal stacked bar */
const PLAN_DISTRIBUTION_DATA = [
  { dept: "Engineering", standard: 45, premium: 62, executive: 28 },
  { dept: "Sales", standard: 38, premium: 44, executive: 15 },
  { dept: "Marketing", standard: 22, premium: 30, executive: 12 },
  { dept: "Operations", standard: 30, premium: 25, executive: 8 },
  { dept: "Finance", standard: 18, premium: 20, executive: 10 },
  { dept: "HR", standard: 12, premium: 14, executive: 6 },
];

/* Benefit Trend — actual vs target */
const BENEFIT_TREND_DATA = [
  { month: "Apr", actual: 12.5, target: 14 },
  { month: "May", actual: 13.2, target: 14.5 },
  { month: "Jun", actual: 14.8, target: 15 },
  { month: "Jul", actual: 15.2, target: 15.5 },
  { month: "Aug", actual: 14.6, target: 16 },
  { month: "Sep", actual: 16.1, target: 16.5 },
  { month: "Oct", actual: 17.4, target: 17 },
  { month: "Nov", actual: 18.2, target: 17.5 },
  { month: "Dec", actual: 17.8, target: 18 },
  { month: "Jan", actual: 19.5, target: 18.5 },
  { month: "Feb", actual: 20.1, target: 19 },
  { month: "Mar", actual: 21.8, target: 19.5 },
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
  const [activeTab, setActiveTab] = useState<"Overview" | "Benefits" | "Claims" | "Employees">("Overview");

  /* ─── Fetch ─────────────────────────────────────────────────────────── */
  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);

      const empRes = await api.getEmployees();
      if (empRes.setupRequired) {
        setSetupRequired(true);
        setLoading(false);
        return;
      }
      setSetupRequired(false);

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
      label: "Total Benefit Outgo",
      value: kpis?.totalBenefitOutgo || "\u20B918.2Cr",
      trend: 7.4,
      trendUp: true,
    },
    {
      label: "Active Employees",
      value: kpis?.activeEmployees ?? "2,859",
      trend: 4.9,
      trendUp: true,
    },
    {
      label: "Claims Processed",
      value: kpis?.claimsProcessed ?? "21,948",
      trend: 11.7,
      trendUp: true,
    },
    {
      label: "Pending Approvals",
      value: kpis?.pendingApprovals ?? "33",
      trend: null, // displayed differently
      trendUp: false,
      isWarning: true,
    },
    {
      label: "Avg Tax Saved",
      value: kpis?.avgTaxSaved || "\u20B93,20,000",
      trend: 19.4,
      trendUp: true,
    },
  ];

  const tabs = ["Overview", "Benefits", "Claims", "Employees"] as const;

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

          {/* Right: date range + filter + widgets */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: T.fg,
                fontFamily: T.font,
                cursor: "pointer",
                transition: "border-color 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.mutedLight)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
            >
              <Calendar size={14} style={{ color: T.muted }} />
              Apr 1, 2025 - Mar 31, 2026
            </button>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: T.muted,
                fontFamily: T.font,
                cursor: "pointer",
                transition: "border-color 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.mutedLight)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
            >
              <Filter size={14} />
              Filter
            </button>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: T.muted,
                fontFamily: T.font,
                cursor: "pointer",
                transition: "border-color 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.mutedLight)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
            >
              <LayoutGrid size={14} />
              Widgets
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? T.accent : T.muted,
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? `2px solid ${T.accent}` : "2px solid transparent",
                  cursor: "pointer",
                  fontFamily: T.font,
                  transition: "color 150ms",
                  marginBottom: -1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = T.fg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = T.muted;
                }}
              >
                {tab}
              </button>
            );
          })}
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
            minHeight: 320,
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: T.blueBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={28} style={{ color: T.blue }} />
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.fg }}>
            Welcome to SalarySe FlexiBenefits
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: T.muted, maxWidth: 400, lineHeight: 1.6 }}>
            Import employees to get started. Once you have employees enrolled in
            benefit plans, your dashboard analytics will appear here.
          </p>
          <button
            style={{
              marginTop: 8,
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
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Upload size={14} />
            Import Employees
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
                gridTemplateColumns: `repeat(${kpiMetrics.length}, 1fr)`,
                gap: 0,
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

          {/* ─── 3. CHARTS ROW 1 ──────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Benefit Utilization — Area chart */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <h3 style={cardTitleStyle}>Benefit Utilization</h3>
                  <p style={cardSubtitleStyle}>Category-wise usage trends</p>
                </div>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: T.muted,
                    transition: "background 150ms",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={UTILIZATION_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradFood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.accent} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={T.accent} stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="gradFuel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.blue} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={T.blue} stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.green} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={T.green} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: T.muted, fontFamily: T.font }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: T.muted, fontFamily: T.font }}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 60]}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="food"
                      name="Food"
                      stroke={T.accent}
                      strokeWidth={2}
                      fill="url(#gradFood)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: T.card }}
                    />
                    <Area
                      type="monotone"
                      dataKey="fuel"
                      name="Fuel"
                      stroke={T.blue}
                      strokeWidth={2}
                      fill="url(#gradFuel)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: T.card }}
                    />
                    <Area
                      type="monotone"
                      dataKey="communication"
                      name="Communication"
                      stroke={T.green}
                      strokeWidth={2}
                      fill="url(#gradComm)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: T.card }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
                {[
                  { label: "Food", color: T.accent },
                  { label: "Fuel", color: T.blue },
                  { label: "Communication", color: T.green },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: 12, color: T.muted }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

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

          {/* ─── 4. CHARTS ROW 2 ──────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Plan Distribution — Horizontal stacked bar */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <h3 style={cardTitleStyle}>Plan Distribution</h3>
                  <p style={cardSubtitleStyle}>Breakdown by department</p>
                </div>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: T.muted,
                    transition: "background 150ms",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={PLAN_DISTRIBUTION_DATA}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    barSize={18}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: T.muted, fontFamily: T.font }}
                    />
                    <YAxis
                      type="category"
                      dataKey="dept"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: T.muted, fontFamily: T.font }}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.02)" }}
                      contentStyle={{
                        background: T.fg,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: T.font,
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                    />
                    <Bar dataKey="standard" name="Standard" stackId="a" fill={PLAN_META.Standard.color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="premium" name="Premium" stackId="a" fill={PLAN_META.Premium.color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="executive" name="Executive" stackId="a" fill={PLAN_META.Executive.color} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
                {BENEFIT_PLANS.map((plan) => (
                  <div key={plan} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: PLAN_META[plan].color }} />
                    <span style={{ fontSize: 12, color: T.muted }}>{plan}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefit Trend — Line chart with dashed target */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <h3 style={cardTitleStyle}>Benefit Trend</h3>
                  <p style={cardSubtitleStyle}>Actual vs target (in Crores)</p>
                </div>
                <DropdownSelector value="Last month" />
              </div>

              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={BENEFIT_TREND_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: T.muted, fontFamily: T.font }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: T.muted, fontFamily: T.font }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target"
                      stroke={T.mutedLight}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: T.card }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual"
                      stroke={T.accent}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, fill: T.card }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
                {[
                  { label: "Actual", color: T.accent, dashed: false },
                  { label: "Target", color: T.mutedLight, dashed: true },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: 16,
                        height: 0,
                        borderTop: `2px ${item.dashed ? "dashed" : "solid"} ${item.color}`,
                      }}
                    />
                    <span style={{ fontSize: 12, color: T.muted }}>{item.label}</span>
                  </div>
                ))}
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
                  {query ? "No activity matching your search" : "No recent activity"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                  {query ? "Try adjusting your search query" : "Approval actions will appear here"}
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
