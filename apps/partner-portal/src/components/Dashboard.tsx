"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  IndianRupee,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@partner-portal/ui";
import {
  CURRENT_CYCLE_ID,
  DEMO_CLAIMS,
  DEMO_CYCLES,
} from "@partner-portal/shared/demo-data";
import {
  FLEXI_BENEFIT_CATEGORIES,
  type Claim,
  type ClaimStatus,
  type Cycle,
} from "@partner-portal/shared";
import { useIsMobile } from "@partner-portal/shared/hooks/useIsMobile";

/* ═══════════════════════════════════════════════════════════════════════════
   Design tokens — aligned with src/styles/theme.css
   ═══════════════════════════════════════════════════════════════════════════ */

const T = {
  font: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  bg: "var(--color-surface)",
  card: "var(--color-card)",
  border: "var(--color-border)",
  fg: "var(--color-foreground)",
  muted: "var(--color-muted-foreground)",
  accent: "var(--brand-accent)",
  accentLight: "var(--brand-accent-light)",
  green: "var(--brand-green)",
  greenLight: "var(--brand-green-light)",
  amber: "var(--brand-amber)",
  amberLight: "var(--brand-amber-light)",
  blue: "var(--brand-blue)",
  blueLight: "var(--brand-blue-light)",
  purple: "var(--brand-purple)",
  purpleLight: "var(--brand-purple-light)",
  orange: "var(--brand-orange)",
  orangeLight: "var(--brand-orange-light)",
  navy: "var(--brand-navy)",
  radius: "var(--rounded-lg)",
} as const;

/* Raw hex palette for chart fills (Recharts can't resolve CSS vars reliably) */
const CHART_PALETTE = {
  accent: "#3D41FA",
  blue: "#3498DB",
  green: "#27AE60",
  amber: "#F39C12",
  purple: "#9B59B6",
  orange: "#E67E22",
  teal: "#1ABC9C",
  navy: "#1A2B3C",
  red: "#E74C3C",
  slate: "#6B7280",
  border: "#EBEBEB",
  mutedText: "#6B7280",
};

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatIndianCurrency(value: number): string {
  if (!Number.isFinite(value)) return "₹0";
  return currencyFormatter.format(Math.round(value));
}

/** Parse "₹3,200" → 3200 */
function parseClaimAmount(s: string | undefined): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatCutoffDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Statuses we consider "submitted" for auto-approval math (current cycle funnel). */
const SUBMITTED_STATUSES: ClaimStatus[] = [
  "submitted",
  "approved",
  "auto_approved",
  "rejected",
  "flagged_for_later",
  // include "pending" too — in this demo corpus, pending claims are the current
  // queue and should count toward the submitted denominator for the cycle.
  "pending",
];

/* ═══════════════════════════════════════════════════════════════════════════
   Cycle context banner
   ═══════════════════════════════════════════════════════════════════════════ */

function CycleBanner({ cycles, currentId }: { cycles: Cycle[]; currentId: string }) {
  const message = useMemo(() => {
    const current = cycles.find((c) => c.id === currentId);
    if (!current) return null;
    if (current.status === "active") {
      return `Current cycle: ${current.label} · Claims open · Payroll cutoff: ${formatCutoffDate(current.payrollCutoff)}`;
    }
    // Closed — find the next active/upcoming cycle if any
    const next = cycles.find((c) => c.status === "active") ||
      cycles.find((c) => new Date(c.submissionCutoff) > new Date(current.payrollCutoff));
    const closedMonth = current.label.split(" ")[0];
    const nextMonth = next ? next.label.split(" ")[0] : "Next";
    return `Cycle ${closedMonth} closed: payroll exported. ${nextMonth} cycle active.`;
  }, [cycles, currentId]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: "var(--rounded-md)",
        background: "var(--brand-accent-alpha-8)",
        border: `1px solid ${T.border}`,
        color: T.navy,
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        fontFamily: T.font,
      }}
    >
      <Sparkles size={14} style={{ color: "var(--brand-accent)", flexShrink: 0 }} aria-hidden />
      <span style={{ lineHeight: 1.5 }}>{message}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Chart tooltip
   ═══════════════════════════════════════════════════════════════════════════ */

interface TooltipPayloadEntry {
  color?: string;
  name?: string;
  value?: number | string;
  dataKey?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  valueFormatter?: (value: number | string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1A1A1A",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        fontFamily: T.font,
        lineHeight: 1.5,
      }}
    >
      {label !== undefined && (
        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 11, opacity: 0.7 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {p.color && (
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block" }} />
          )}
          <span style={{ opacity: 0.85 }}>{p.name}:</span>
          <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {valueFormatter ? valueFormatter(p.value ?? 0) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Range selector (native select styled as pill)
   ═══════════════════════════════════════════════════════════════════════════ */

type RangeKey = "last_month" | "last_3_months" | "ytd";

const RANGE_OPTIONS: { key: RangeKey; label: string; days?: number }[] = [
  { key: "last_month", label: "Last Month", days: 30 },
  { key: "last_3_months", label: "Last 3 Months", days: 90 },
  { key: "ytd", label: "YTD" },
];

function RangeSelector({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (next: RangeKey) => void;
}) {
  return (
    <label
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RangeKey)}
        aria-label="Time range"
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          padding: "5px 26px 5px 10px",
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          color: T.muted,
          fontFamily: T.font,
          cursor: "pointer",
          outline: "none",
        }}
      >
        {RANGE_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        style={{
          position: "absolute",
          right: 8,
          pointerEvents: "none",
          color: T.muted,
        }}
      />
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard — PRD §4.1
   ═══════════════════════════════════════════════════════════════════════════ */

export function Dashboard() {
  const isMobile = useIsMobile();
  const [rangeKey, setRangeKey] = useState<RangeKey>("last_month");

  /* ─── Current-cycle claims ────────────────────────────────────────── */
  const currentCycleClaims = useMemo<Claim[]>(
    () => DEMO_CLAIMS.filter((c) => c.cycleId === CURRENT_CYCLE_ID),
    []
  );

  /* ─── KPIs ────────────────────────────────────────────────────────── */
  const kpis = useMemo(() => {
    // Eligible denominator: claims in current cycle that entered the review funnel.
    const eligible = currentCycleClaims.filter((c) => SUBMITTED_STATUSES.includes(c.status));

    // NOTE: PRD §4.1 printed formula for Auto-Approval Rate is broken
    // (divides auto-approved by a set that excludes auto-approved itself).
    // Using corrected denominator: all submitted/reviewed claims this cycle.
    // autoApprovalRate = autoApprovedCount / submittedCount * 100
    const autoApprovedCount = eligible.filter(
      (c) => c.status === "auto_approved" || c.approvalSource === "auto"
    ).length;
    const submittedCount = eligible.length;
    const autoApprovalRate = submittedCount > 0
      ? Math.round((autoApprovedCount / submittedCount) * 100)
      : 0;

    // Active employees: unique employeeIds with ≥1 eligible claim this cycle
    const activeEmployeeSet = new Set<string>();
    eligible.forEach((c) => {
      if (c.employeeId) activeEmployeeSet.add(c.employeeId);
    });
    const activeEmployees = activeEmployeeSet.size;

    // Total Benefits Claimed: sum of approved + auto-approved amounts this cycle
    const totalClaimed = currentCycleClaims
      .filter((c) => c.status === "approved" || c.status === "auto_approved")
      .reduce((sum, c) => sum + parseClaimAmount(c.claimAmount), 0);

    // Flagged items
    const flaggedCount = currentCycleClaims.filter((c) => c.flaggedByAI === true).length;

    // Avg claim per employee
    const avgPerEmployee = activeEmployees > 0 ? totalClaimed / activeEmployees : 0;

    return {
      autoApprovalRate,
      autoApprovedCount,
      submittedCount,
      activeEmployees,
      totalClaimed,
      flaggedCount,
      avgPerEmployee,
    };
  }, [currentCycleClaims]);

  /* ─── Claims Volume Over Time ─────────────────────────────────────── */
  const volumeData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const range = RANGE_OPTIONS.find((r) => r.key === rangeKey)!;

    let from: Date;
    if (rangeKey === "ytd") {
      from = new Date(currentYear, 0, 1);
    } else {
      from = new Date(now);
      from.setDate(from.getDate() - (range.days ?? 30));
    }

    const buckets = new Map<string, number>();
    DEMO_CLAIMS.forEach((c) => {
      if (!c.dateSubmitted) return;
      const d = new Date(c.dateSubmitted);
      if (Number.isNaN(d.getTime())) return;
      if (d < from || d > now) return;
      const key = c.dateSubmitted; // yyyy-mm-dd already
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });

    // Fill in missing days across range for a continuous line
    const points: { date: string; label: string; claims: number }[] = [];
    const cursor = new Date(from);
    while (cursor <= now) {
      const key = cursor.toISOString().split("T")[0];
      const d = new Date(cursor);
      points.push({
        date: key,
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        claims: buckets.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return points;
  }, [rangeKey]);

  /* ─── Claims by Category ──────────────────────────────────────────── */
  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    currentCycleClaims.forEach((c) => {
      const key = c.benefitType || c.category || "Other";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    // Order by FLEXI_BENEFIT_CATEGORIES label list, then any extras alphabetically
    const known = FLEXI_BENEFIT_CATEGORIES.map((c) => c.label);
    const knownWithCounts = known
      .map((label) => ({ label, count: counts.get(label) ?? 0 }))
      .filter((d) => d.count > 0);

    const extras: { label: string; count: number }[] = [];
    counts.forEach((count, label) => {
      if (!known.includes(label)) extras.push({ label, count });
    });
    extras.sort((a, b) => b.count - a.count);

    const rows = [...knownWithCounts, ...extras];

    // Assign colors from palette cyclically
    const palette = [
      CHART_PALETTE.accent,
      CHART_PALETTE.blue,
      CHART_PALETTE.green,
      CHART_PALETTE.amber,
      CHART_PALETTE.purple,
      CHART_PALETTE.orange,
      CHART_PALETTE.teal,
      CHART_PALETTE.navy,
    ];
    return rows.map((r, i) => ({ ...r, color: palette[i % palette.length] }));
  }, [currentCycleClaims]);

  /* ─── Derived styles / labels ─────────────────────────────────────── */
  const flaggedSubtitle = kpis.flaggedCount === 0
    ? "All clear — nothing needs review"
    : `${kpis.flaggedCount} ${kpis.flaggedCount === 1 ? "item needs" : "items need"} review`;

  /* ─── Render ──────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        fontFamily: T.font,
        color: T.fg,
        maxWidth: 1280,
      }}
    >
      {/* Page header */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--text-2xl)",
            fontWeight: 600,
            color: T.fg,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            margin: "var(--space-1) 0 0",
            fontSize: "var(--text-sm)",
            color: T.muted,
            fontWeight: 400,
          }}
        >
          Benefits are running on auto-pilot. Review only what needs your attention.
        </p>
      </div>

      {/* Cycle context banner */}
      <CycleBanner cycles={DEMO_CYCLES} currentId={CURRENT_CYCLE_ID} />

      {/* KPI grid — 5 cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <StatCard
          title="Auto-Approval Rate"
          value={`${kpis.autoApprovalRate}%`}
          change={`${kpis.autoApprovedCount}/${kpis.submittedCount} this cycle`}
          trend="up"
          icon={Sparkles}
          color={CHART_PALETTE.accent}
          bgColor="var(--brand-accent-light)"
        />
        <StatCard
          title="Active Employees"
          value={kpis.activeEmployees.toLocaleString("en-IN")}
          change="with ≥1 eligible claim"
          trend="up"
          icon={Users}
          color={CHART_PALETTE.blue}
          bgColor="var(--brand-blue-light)"
        />
        <StatCard
          title="Total Benefits Claimed"
          value={formatIndianCurrency(kpis.totalClaimed)}
          change="approved + auto-approved"
          trend="up"
          icon={Wallet}
          color={CHART_PALETTE.green}
          bgColor="var(--brand-green-light)"
        />
        <StatCard
          title="Flagged Items"
          value={kpis.flaggedCount.toLocaleString("en-IN")}
          change={flaggedSubtitle}
          /* Only surface the amber "alert" treatment when there's actually something to review.
             PRD: "Default state: everything is fine." */
          trend={kpis.flaggedCount > 0 ? "alert" : "up"}
          icon={kpis.flaggedCount > 0 ? AlertTriangle : CheckCircle2}
          color={kpis.flaggedCount > 0 ? CHART_PALETTE.amber : CHART_PALETTE.green}
          bgColor={kpis.flaggedCount > 0 ? "var(--brand-amber-light)" : "var(--brand-green-light)"}
        />
        <StatCard
          title="Avg Claim per Employee"
          value={formatIndianCurrency(kpis.avgPerEmployee)}
          change="this cycle"
          trend="up"
          icon={IndianRupee}
          color={CHART_PALETTE.purple}
          bgColor="var(--brand-purple-light)"
        />
      </div>

      {/* Charts row — side-by-side desktop, stacked mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "var(--space-4)",
        }}
      >
        {/* Claims Volume Over Time */}
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            padding: "var(--space-5)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  color: T.fg,
                  lineHeight: 1.3,
                }}
              >
                Claims Volume Over Time
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "var(--text-xs)",
                  color: T.muted,
                  fontWeight: 400,
                }}
              >
                Daily claims submitted
              </p>
            </div>
            <RangeSelector value={rangeKey} onChange={setRangeKey} />
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={volumeData}
                margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="dashClaimsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_PALETTE.accent} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={CHART_PALETTE.accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_PALETTE.border}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: CHART_PALETTE.mutedText, fontFamily: T.font }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: CHART_PALETTE.mutedText, fontFamily: T.font }}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      valueFormatter={(v) => `${v} claim${Number(v) === 1 ? "" : "s"}`}
                    />
                  }
                  cursor={{ stroke: CHART_PALETTE.border, strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="claims"
                  name="Claims"
                  stroke={CHART_PALETTE.accent}
                  strokeWidth={2}
                  fill="url(#dashClaimsGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims by Category */}
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            padding: "var(--space-5)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  color: T.fg,
                  lineHeight: 1.3,
                }}
              >
                Claims by Category
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "var(--text-xs)",
                  color: T.muted,
                  fontWeight: 400,
                }}
              >
                Distribution across flexi-benefit categories
              </p>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: "var(--rounded-full)",
                fontSize: 11,
                fontWeight: 500,
                color: T.muted,
                background: T.bg,
                border: `1px solid ${T.border}`,
              }}
            >
              <TrendingUp size={11} />
              Current cycle
            </span>
          </div>

          {categoryData.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 260,
                color: T.muted,
                fontSize: 13,
              }}
            >
              No claims yet this cycle
            </div>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_PALETTE.border}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: CHART_PALETTE.mutedText, fontFamily: T.font }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    width={140}
                    tick={{ fontSize: 11, fill: CHART_PALETTE.mutedText, fontFamily: T.font }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        valueFormatter={(v) => `${v} claim${Number(v) === 1 ? "" : "s"}`}
                      />
                    }
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  />
                  <Bar dataKey="count" name="Claims" radius={[0, 6, 6, 0]} fill={CHART_PALETTE.accent}>
                    {/* Individual bar colors via cells */}
                    {categoryData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

