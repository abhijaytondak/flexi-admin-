"use client";

/**
 * Employee Directory — PRD §4.5 (v0 MVP, view-only).
 *
 * Columns: Employee ID, Full Name, Official Email, Annual Flexi Limit,
 *          Monthly Limit (derived), Date of Joining, Income Tax Regime,
 *          Salary Band/Slab (only when company config is slab-based).
 *
 * Rules enforced:
 *   - Phone number is never rendered (privacy).
 *   - Monthly Limit is always derived, never editable.
 *   - Rows are inert on click — no drawer, no modal, no hover affordance.
 *   - Search matches name / email / employee ID.
 *   - Tax-regime filter always visible; Salary-band filter hidden when
 *     company config is company-wide.
 *   - Every column header toggles ascending / descending sort.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Info, Search } from "lucide-react";
import { differenceInCalendarMonths, parseISO } from "date-fns";
import { parseINR } from "@partner-portal/shared/helpers";
import {
  BENEFIT_PLANS,
  type BenefitPlan,
  type Employee,
  type TaxRegime,
} from "@partner-portal/shared";
import { DEMO_EMPLOYEES } from "@partner-portal/shared/demo-data";

// ─── Styling tokens (align with ApprovalQueue / Dashboard conventions) ──

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const inputStyle: CSSProperties = {
  ...font,
  width: "100%",
  padding: "var(--space-2) var(--space-3)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  outline: "none",
};

const selectStyle: CSSProperties = { ...inputStyle, width: "auto", minWidth: 140 };

// ─── Indian currency formatter (₹, no decimals) ─────────────────────────

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const formatINRCurrency = (n: number): string =>
  Number.isFinite(n) ? INR.format(Math.round(n)) : "—";

// ─── Fiscal-year + monthly-limit derivation (Indian FY = Apr 1 → Mar 31) ─

/**
 * Returns the fiscal-year start date (April 1) for the FY that contains `ref`.
 */
function fiscalYearStart(ref: Date): Date {
  const year = ref.getMonth() >= 3 ? ref.getFullYear() : ref.getFullYear() - 1;
  return new Date(year, 3, 1); // month 3 = April
}

/**
 * Count of whole months remaining in the current Indian FY, measured from
 * `effectiveStart` (later of DOJ or FY start) through March 31 next year.
 * Floor is 1 so we never divide by zero.
 */
function monthsRemainingInFY(effectiveStart: Date): number {
  const fyEnd = new Date(fiscalYearStart(effectiveStart).getFullYear() + 1, 2, 31);
  // +1 because both effectiveStart month and March count as full benefit months.
  const diff = differenceInCalendarMonths(fyEnd, effectiveStart) + 1;
  return Math.max(diff, 1);
}

/**
 * Monthly limit = annual ÷ remaining months from DOJ (bounded within the FY).
 * Returns NaN if annualLimit is non-finite so the cell can render "—".
 */
function computeMonthlyLimit(annualLimit: number, dojISO: string | undefined): number {
  if (!Number.isFinite(annualLimit) || annualLimit <= 0) return NaN;
  const now = new Date();
  const fyStart = fiscalYearStart(now);
  const doj = dojISO ? parseISO(dojISO) : fyStart;
  const effectiveStart = doj > fyStart ? doj : fyStart;
  return annualLimit / monthsRemainingInFY(effectiveStart);
}

// ─── Demo enrichment: inject DOJ + annualLimit when missing ─────────────
//
// The shared Employee type doesn't yet carry these PRD-required fields.
// We derive them deterministically from `id` + `bracket` so the demo UI is
// stable across renders and explicable to QA. Real data will replace this.

const BRACKET_ANNUAL_LIMITS: Record<BenefitPlan, number> = {
  Associate: 60000,
  "Senior Associate": 140000,
  Manager: 280000,
  "Senior Manager": 450000,
  AVP: 780000,
  VP: 1200000,
};

function deriveAnnualLimit(emp: Employee): number {
  if (emp.benefitPlan && BRACKET_ANNUAL_LIMITS[emp.benefitPlan] !== undefined) {
    return BRACKET_ANNUAL_LIMITS[emp.benefitPlan];
  }
  // Fallback: 30 % of CTC, rounded.
  return Math.round(parseINR(emp.salary) * 0.3);
}

function deriveDOJ(emp: Employee): string {
  if (emp.dateOfJoining) return emp.dateOfJoining;
  // Deterministic pseudo-DOJ seeded from employee id so the demo is stable.
  const seed = Array.from(emp.id || emp.name || "EMP").reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0
  );
  const yearOffset = seed % 6; // 0..5 years back
  const monthOffset = seed % 12; // 0..11 months
  const day = ((seed * 7) % 27) + 1; // 1..27
  const today = new Date();
  const dojYear = today.getFullYear() - yearOffset;
  const doj = new Date(dojYear, monthOffset, day);
  return doj.toISOString().slice(0, 10);
}

function formatDOJ(dojISO: string): string {
  const d = parseISO(dojISO);
  if (Number.isNaN(d.getTime())) return dojISO;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

// ─── Sort / filter state ────────────────────────────────────────────────

type CompanyConfig = "slab-based" | "company-wide";

type SortKey =
  | "id"
  | "name"
  | "email"
  | "annualLimit"
  | "monthlyLimit"
  | "doj"
  | "taxRegime"
  | "benefitPlan";

interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

interface EnrichedEmployee extends Employee {
  _annualLimit: number;
  _monthlyLimit: number;
  _doj: string;
}

function capitalizeRegime(r: TaxRegime | undefined): string {
  if (r === "old") return "Old";
  if (r === "new") return "New";
  return "—";
}

// ─── Sortable header cell ───────────────────────────────────────────────

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (k: SortKey) => void;
  tooltip?: string;
  align?: "left" | "right";
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
  tooltip,
  align = "left",
}: SortableHeaderProps) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      title={tooltip}
      style={{
        ...font,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: 0,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: active
          ? "var(--color-foreground)"
          : "var(--color-muted-foreground)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        width: "100%",
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        textAlign: align,
      }}
    >
      <span>{label}</span>
      {tooltip && (
        <Info
          size={12}
          style={{ color: "var(--color-muted-foreground)", flexShrink: 0 }}
          aria-label={tooltip}
        />
      )}
      <Icon
        size={12}
        style={{
          color: active
            ? "var(--brand-accent)"
            : "var(--color-muted-foreground)",
          opacity: active ? 1 : 0.5,
        }}
      />
    </button>
  );
}

// ─── Component ──────────────────────────────────────────────────────────

export function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [regimeFilter, setRegimeFilter] = useState<"all" | TaxRegime>("all");
  const [bandFilter, setBandFilter] = useState<"all" | BenefitPlan>("all");
  const [sort, setSort] = useState<SortState>({ key: "id", dir: "asc" });

  // Mock company config — default slab-based so Slab column + filter show.
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>("slab-based");
  const slabBased = companyConfig === "slab-based";

  useEffect(() => {
    // Demo data load — real fetch lives in a dedicated API layer in v0+.
    setEmployees(DEMO_EMPLOYEES);
    setLoading(false);
  }, []);

  const enriched = useMemo<EnrichedEmployee[]>(() => {
    return employees.map((e) => {
      const annual = deriveAnnualLimit(e);
      const doj = deriveDOJ(e);
      const monthly = computeMonthlyLimit(annual, doj);
      return { ...e, _annualLimit: annual, _monthlyLimit: monthly, _doj: doj };
    });
  }, [employees]);

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((e) => {
      if (q) {
        const hay = `${e.name} ${e.email ?? ""} ${e.id ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (regimeFilter !== "all" && e.taxRegime !== regimeFilter) return false;
      if (slabBased && bandFilter !== "all" && e.benefitPlan !== bandFilter)
        return false;
      return true;
    });
  }, [enriched, query, regimeFilter, bandFilter, slabBased]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sort.key) {
        case "annualLimit":
          av = a._annualLimit;
          bv = b._annualLimit;
          break;
        case "monthlyLimit":
          av = Number.isFinite(a._monthlyLimit) ? a._monthlyLimit : -Infinity;
          bv = Number.isFinite(b._monthlyLimit) ? b._monthlyLimit : -Infinity;
          break;
        case "doj":
          av = a._doj;
          bv = b._doj;
          break;
        case "email":
          av = (a.email ?? "").toLowerCase();
          bv = (b.email ?? "").toLowerCase();
          break;
        case "name":
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
        case "taxRegime":
          av = a.taxRegime ?? "";
          bv = b.taxRegime ?? "";
          break;
        case "benefitPlan":
          av = a.benefitPlan ?? "";
          bv = b.benefitPlan ?? "";
          break;
        case "id":
        default:
          av = (a.id ?? "").toLowerCase();
          bv = (b.id ?? "").toLowerCase();
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    return arr;
  }, [filtered, sort]);

  // Grid template columns — swap based on slab-column visibility.
  const gridCols = slabBased
    ? "0.9fr 1.3fr 1.6fr 1.1fr 1.1fr 1fr 0.9fr 1fr"
    : "1fr 1.4fr 1.8fr 1.2fr 1.2fr 1.1fr 1fr";

  if (loading) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
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
        <p
          style={{
            color: "var(--color-muted-foreground)",
            fontSize: "var(--text-sm)",
          }}
        >
          Loading employees...
        </p>
      </div>
    );
  }

  const monthlyLimitTooltip =
    "Calculated as Annual ÷ remaining months from Date of Joining in the current fiscal year.";

  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
            Employee Directory
          </h1>
          <p
            style={{
              margin: "var(--space-1) 0 0",
              fontSize: "var(--text-sm)",
              color: "var(--color-muted-foreground)",
            }}
          >
            {sorted.length} employee{sorted.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Dev affordance — config toggle for QA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--rounded-md)",
            backgroundColor: "var(--color-background)",
          }}
          aria-label="Demo: switch company configuration"
        >
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-muted-foreground)",
              fontWeight: 500,
            }}
          >
            Demo: switch company config
          </span>
          <select
            style={{ ...selectStyle, minWidth: 150 }}
            value={companyConfig}
            onChange={(e) =>
              setCompanyConfig(e.target.value as CompanyConfig)
            }
            aria-label="Company configuration"
          >
            <option value="slab-based">Slab-based</option>
            <option value="company-wide">Company-wide</option>
          </select>
        </div>
      </div>

      {/* ─── Search + Filters ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 320px", maxWidth: 420 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-muted-foreground)",
            }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or employee ID"
            style={{ ...inputStyle, paddingLeft: 36 }}
            aria-label="Search employees"
          />
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--color-muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Tax Regime
          <select
            style={selectStyle}
            value={regimeFilter}
            onChange={(e) =>
              setRegimeFilter(e.target.value as "all" | TaxRegime)
            }
          >
            <option value="all">All</option>
            <option value="old">Old</option>
            <option value="new">New</option>
          </select>
        </label>

        {slabBased && (
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--color-muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Salary Band
            <select
              style={selectStyle}
              value={bandFilter}
              onChange={(e) =>
                setBandFilter(e.target.value as "all" | BenefitPlan)
              }
            >
              <option value="all">All</option>
              {BENEFIT_PLANS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* ─── Table ──────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-lg)",
          overflow: "hidden",
        }}
        role="table"
        aria-label="Employees"
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-background)",
          }}
          role="row"
        >
          <SortableHeader
            label="Employee ID"
            sortKey="id"
            sort={sort}
            onSort={handleSort}
          />
          <SortableHeader
            label="Full Name"
            sortKey="name"
            sort={sort}
            onSort={handleSort}
          />
          <SortableHeader
            label="Official Email"
            sortKey="email"
            sort={sort}
            onSort={handleSort}
          />
          <SortableHeader
            label="Annual Flexi Limit (₹)"
            sortKey="annualLimit"
            sort={sort}
            onSort={handleSort}
            align="right"
          />
          <SortableHeader
            label="Monthly Limit (₹)"
            sortKey="monthlyLimit"
            sort={sort}
            onSort={handleSort}
            tooltip={monthlyLimitTooltip}
            align="right"
          />
          <SortableHeader
            label="Date of Joining"
            sortKey="doj"
            sort={sort}
            onSort={handleSort}
          />
          <SortableHeader
            label="Income Tax Regime"
            sortKey="taxRegime"
            sort={sort}
            onSort={handleSort}
          />
          {slabBased && (
            <SortableHeader
              label="Salary Band"
              sortKey="benefitPlan"
              sort={sort}
              onSort={handleSort}
            />
          )}
        </div>

        {sorted.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              padding: "var(--space-8)",
              color: "var(--color-muted-foreground)",
              fontSize: "var(--text-sm)",
            }}
          >
            No employees match your filters.
          </p>
        ) : (
          sorted.map((emp, idx) => (
            <div
              key={emp.id || idx}
              role="row"
              // Row is intentionally inert per PRD — no onClick, no hover swap,
              // no cursor: pointer. This removes the "clickable" affordance.
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                borderBottom:
                  idx < sorted.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
                alignItems: "center",
                cursor: "default",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-muted-foreground)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {emp.id || "—"}
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--color-foreground)",
                }}
              >
                {emp.name}
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-muted-foreground)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={emp.email || ""}
              >
                {emp.email || "—"}
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-foreground)",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                {formatINRCurrency(emp._annualLimit)}
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-foreground)",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
                title={monthlyLimitTooltip}
              >
                {formatINRCurrency(emp._monthlyLimit)}
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-muted-foreground)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatDOJ(emp._doj)}
              </span>
              <span style={{ fontSize: "var(--text-sm)" }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "2px 10px",
                    borderRadius: "var(--rounded-full)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: emp.taxRegime === "old" ? "#B45309" : "#047857",
                    backgroundColor:
                      emp.taxRegime === "old" ? "#FEF3C7" : "#D1FAE5",
                    border: `1px solid ${
                      emp.taxRegime === "old" ? "#FCD34D" : "#6EE7B7"
                    }`,
                  }}
                >
                  {capitalizeRegime(emp.taxRegime)}
                </span>
              </span>
              {slabBased && (
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-foreground)",
                  }}
                >
                  {emp.benefitPlan || "—"}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
