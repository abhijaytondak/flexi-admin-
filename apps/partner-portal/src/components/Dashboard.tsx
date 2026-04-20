"use client";

import React, { useMemo, useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Users,
  Wallet,
  TrendingUp,
  CircleDot,
  Inbox,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DEMO_CLAIMS,
  DEMO_CYCLES,
  CURRENT_CYCLE_ID,
  FLEXI_BENEFIT_CATEGORIES,
  type Claim,
  type Cycle,
} from "@partner-portal/shared";

/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard — PRD §4.1
   Visual tokens resolve via CSS custom properties declared in theme.css.
   The component intentionally avoids gradients, stacked shadows, and color
   pile-ons: hierarchy comes from type scale + whitespace.
   ═══════════════════════════════════════════════════════════════════════════ */

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type VolumeRange = "last_month" | "last_3_months" | "ytd";

// Tight category palette — restrained. Accent first, neutrals next.
const CATEGORY_COLORS = [
  "#3D41FA",
  "#27AE60",
  "#F39C12",
  "#3498DB",
  "#9B59B6",
  "#16A085",
  "#E67E22",
  "#1A2B3C",
  "#8E44AD",
  "#E74C3C",
  "#2980B9",
  "#D35400",
  "#6B7A8D",
];

// Parse "₹3,200" → 3200
function parseAmount(value: string): number {
  return parseInt(String(value).replace(/[^0-9]/g, ""), 10) || 0;
}

function formatDayTick(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function CycleBanner({ cycle }: { cycle: Cycle }) {
  const isActive = cycle.status === "active";
  const nextCycle = (() => {
    if (isActive) return null;
    // For a closed cycle, try to identify the next active cycle from DEMO_CYCLES.
    return DEMO_CYCLES.find((c) => c.status === "active") || null;
  })();

  const payrollCutoff = new Date(cycle.payrollCutoff).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      role="status"
      style={{
        ...font,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: "var(--rounded-md)",
        border: "1px solid var(--color-border)",
        // Faintest accent tint — reads as paper, not alert.
        backgroundColor: isActive ? "var(--brand-accent-alpha-8)" : "var(--color-surface)",
        color: "var(--color-foreground)",
      }}
    >
      <CircleDot
        size={14}
        style={{
          color: isActive ? "var(--brand-accent)" : "var(--color-muted-foreground)",
          flexShrink: 0,
        }}
        aria-hidden
      />
      <p style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
        {isActive ? (
          <>
            <span style={{ fontWeight: 600 }}>
              Current cycle: {cycle.label}
            </span>
            <span style={{ color: "var(--color-muted-foreground)" }}>
              {" · "}Claims open · Payroll cutoff: <span style={{ fontVariantNumeric: "tabular-nums" }}>{payrollCutoff}</span>
            </span>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 600 }}>
              Cycle {cycle.month} closed:
            </span>
            <span style={{ color: "var(--color-muted-foreground)" }}>
              {" "}payroll exported.{nextCycle ? ` ${nextCycle.month} cycle active.` : ""}
            </span>
          </>
        )}
      </p>
    </div>
  );
}

// ─── KPI card ───────────────────────────────────────────────────────────────

function KPI({
  label,
  value,
  hint,
  accent,
  accentColor,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  accentColor?: string;
}) {
  return (
    <div
      style={{
        ...font,
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-md)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 128,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          lineHeight: 1.3,
        }}
      >
        <span>{label}</span>
        {accent ? (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: accentColor || "var(--brand-amber)",
              display: "inline-block",
            }}
            aria-hidden
          />
        ) : null}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 600,
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.01em",
          color: "var(--color-foreground)",
        }}
      >
        {value}
      </div>
      {hint ? (
        <div
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-muted-foreground)",
            lineHeight: 1.45,
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

// ─── Chart card shell ───────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  action,
  children,
  minHeight = 320,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <section
      style={{
        ...font,
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-md)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)", letterSpacing: "-0.005em" }}>
            {title}
          </h2>
          {subtitle ? (
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", lineHeight: 1.45 }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </section>
  );
}

// ─── Custom tooltips (restrained, single-purpose) ───────────────────────────

function VolumeTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number; payload: { total: number } }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        backgroundColor: "var(--color-foreground)",
        color: "#fff",
        fontFamily: "'IBM Plex Sans', sans-serif",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: "var(--text-xs)",
        boxShadow: "var(--elevation-md)",
        lineHeight: 1.5,
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: 2 }}>{label ? formatDayTick(label) : ""}</div>
      <div style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
        {p.value} claim{p.value === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function CategoryTooltip({ active, payload }: {
  active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        backgroundColor: "var(--color-foreground)",
        color: "#fff",
        fontFamily: "'IBM Plex Sans', sans-serif",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: "var(--text-xs)",
        boxShadow: "var(--elevation-md)",
        lineHeight: 1.5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.payload.color, display: "inline-block" }} />
        <span style={{ opacity: 0.9 }}>{p.name}</span>
      </div>
      <div style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
        {p.value} claim{p.value === 1 ? "" : "s"}
      </div>
    </div>
  );
}

// ─── Dashboard main ─────────────────────────────────────────────────────────

export function Dashboard() {
  const [range, setRange] = useState<VolumeRange>("last_month");

  // Current cycle (banner + KPI scope)
  const currentCycle = useMemo<Cycle>(() => {
    const c = DEMO_CYCLES.find((c) => c.id === CURRENT_CYCLE_ID);
    return c ?? DEMO_CYCLES[DEMO_CYCLES.length - 1];
  }, []);

  // Claims scoped to the current cycle
  const cycleClaims = useMemo<Claim[]>(
    () => DEMO_CLAIMS.filter((c) => c.cycleId === currentCycle.id),
    [currentCycle.id],
  );

  // ─── KPI math ─────────────────────────────────────────────────────────────

  // "Submitted" means anything that's been entered into the system and is not
  // merely eligible. We treat pending/approved/auto_approved/rejected/flagged
  // as submissions.
  const submittedCount = cycleClaims.filter(
    (c) =>
      c.status === "pending" ||
      c.status === "submitted" ||
      c.status === "claimed" ||
      c.status === "invoice_pending" ||
      c.status === "approved" ||
      c.status === "auto_approved" ||
      c.status === "rejected" ||
      c.status === "flagged_for_later",
  ).length;

  const autoApprovedCount = cycleClaims.filter((c) => c.status === "auto_approved" || c.approvalSource === "auto").length;

  // PRD note: the printed KPI formula in the spec was broken (it multiplied
  // against `approvedCount`). Corrected formula: autoApproved ÷ submitted.
  const autoApprovalRate =
    submittedCount > 0 ? Math.round((autoApprovedCount / submittedCount) * 100) : 0;

  const activeEmployeeIds = new Set(
    cycleClaims
      // Eligible-or-submitted claims mean the employee participated this cycle
      .map((c) => c.employeeId)
      .filter((id): id is string => Boolean(id)),
  );
  const activeEmployees = activeEmployeeIds.size;

  const approvedAmount = cycleClaims
    .filter((c) => c.status === "approved" || c.status === "auto_approved")
    .reduce((sum, c) => {
      // Use allocationAmount when present — multi-month slice belongs to this cycle.
      if (c.multiMonthAllocation) return sum + c.multiMonthAllocation.allocationAmount;
      return sum + parseAmount(c.claimAmount);
    }, 0);

  const flaggedCount = cycleClaims.filter((c) => c.flaggedByAI === true).length;

  const avgPerEmployee = activeEmployees > 0 ? Math.round(approvedAmount / activeEmployees) : 0;

  // ─── Volume series ────────────────────────────────────────────────────────

  const volumeSeries = useMemo(() => {
    const days = range === "last_month" ? 30 : range === "last_3_months" ? 90 : 365;
    const now = new Date();
    const buckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    DEMO_CLAIMS.forEach((c) => {
      if (!c.dateSubmitted) return;
      if (buckets.has(c.dateSubmitted)) {
        buckets.set(c.dateSubmitted, (buckets.get(c.dateSubmitted) || 0) + 1);
      }
    });
    return Array.from(buckets.entries()).map(([date, total]) => ({ date, total }));
  }, [range]);

  // ─── Category distribution ────────────────────────────────────────────────

  const categoryData = useMemo(() => {
    const byCategory = new Map<string, number>();
    cycleClaims.forEach((c) => {
      byCategory.set(c.category, (byCategory.get(c.category) || 0) + 1);
    });
    // Map to the official labels from FLEXI_BENEFIT_CATEGORIES where possible.
    const entries = Array.from(byCategory.entries()).map(([cat, count], idx) => {
      const official = FLEXI_BENEFIT_CATEGORIES.find(
        (c) => c.label.toLowerCase().startsWith(cat.toLowerCase()) || c.key.toLowerCase() === cat.toLowerCase(),
      );
      return {
        name: official?.label ?? cat,
        value: count,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      };
    });
    return entries.sort((a, b) => b.value - a.value);
  }, [cycleClaims]);

  const rangeLabel: Record<VolumeRange, string> = {
    last_month: "Last month",
    last_3_months: "Last 3 months",
    ytd: "Year to date",
  };

  return (
    <div style={{ ...font, display: "flex", flexDirection: "column", gap: 24, maxWidth: 1360 }}>
      {/* ─── Page header ────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--text-2xl)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--color-foreground)",
            lineHeight: 1.2,
          }}
        >
          Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", lineHeight: 1.5 }}>
          Cycle overview and claim health.
        </p>
      </div>

      {/* ─── Cycle banner ───────────────────────────────────────────── */}
      <CycleBanner cycle={currentCycle} />

      {/* ─── KPI grid ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          // Auto-fit at narrow widths; 5 columns when there's room.
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        <KPI
          label="Auto-Approval Rate"
          value={`${autoApprovalRate}%`}
          hint={autoApprovedCount + " of " + submittedCount + " claims"}
        />
        <KPI
          label="Active Employees"
          value={String(activeEmployees)}
          hint={activeEmployees === 1 ? "Employee with claims this cycle" : "Employees with claims this cycle"}
        />
        <KPI
          label="Total Benefits Claimed"
          value={INR.format(approvedAmount)}
          hint="Approved and auto-approved"
        />
        <KPI
          label="Flagged Items"
          value={String(flaggedCount)}
          hint={flaggedCount === 0 ? "System is working smoothly" : `${flaggedCount} item${flaggedCount === 1 ? "" : "s"} need review`}
          accent={flaggedCount > 0}
          accentColor="var(--brand-amber)"
        />
        <KPI
          label="Avg Claim per Employee"
          value={INR.format(avgPerEmployee)}
          hint="Based on approved amounts"
        />
      </div>

      {/* ─── Charts row ────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        <ChartCard
          title="Claims Volume"
          subtitle="Daily claim submissions"
          action={
            <div style={{ position: "relative" }}>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as VolumeRange)}
                aria-label="Time range"
                style={{
                  ...font,
                  appearance: "none",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  padding: "6px 28px 6px 12px",
                  borderRadius: "var(--rounded-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-foreground)",
                  cursor: "pointer",
                  outline: "none",
                  backgroundImage:
                    "linear-gradient(45deg, transparent 50%, var(--color-muted-foreground) 50%), linear-gradient(135deg, var(--color-muted-foreground) 50%, transparent 50%)",
                  backgroundPosition: "calc(100% - 14px) 50%, calc(100% - 10px) 50%",
                  backgroundSize: "4px 4px, 4px 4px",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <option value="last_month">{rangeLabel.last_month}</option>
                <option value="last_3_months">{rangeLabel.last_3_months}</option>
                <option value="ytd">{rangeLabel.ytd}</option>
              </select>
            </div>
          }
        >
          {volumeSeries.every((d) => d.total === 0) ? (
            <ChartEmpty
              icon={<TrendingUp size={22} />}
              title="No volume to chart"
              description="Claim submissions will appear as they arrive."
            />
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeSeries} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3D41FA" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#3D41FA" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDayTick}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    minTickGap={28}
                    tick={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={4}
                    width={28}
                    allowDecimals={false}
                    tick={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <Tooltip cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} content={<VolumeTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3D41FA"
                    strokeWidth={1.75}
                    fill="url(#volumeArea)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-card)", stroke: "#3D41FA" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Claims by Category"
          subtitle="Distribution across benefit types this cycle"
        >
          {categoryData.length === 0 ? (
            <ChartEmpty
              icon={<Inbox size={22} />}
              title="No categories yet"
              description="Category breakdown appears as claims come in."
            />
          ) : (
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ width: 200, height: 200, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CategoryTooltip />} />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={92}
                      strokeWidth={1}
                      stroke="var(--color-card)"
                      paddingAngle={1}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: 1,
                  minWidth: 200,
                }}
              >
                {categoryData.map((entry) => (
                  <li
                    key={entry.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--color-foreground)" }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: entry.color, display: "inline-block" }} />
                      {entry.name}
                    </span>
                    <span
                      style={{
                        color: "var(--color-muted-foreground)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {entry.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// ─── Chart empty state ──────────────────────────────────────────────────────

function ChartEmpty({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        ...font,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 260,
        color: "var(--color-muted-foreground)",
        textAlign: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--rounded-full)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>{title}</p>
      <p style={{ margin: 0, fontSize: "var(--text-xs)", lineHeight: 1.5, maxWidth: 240 }}>{description}</p>
    </div>
  );
}
