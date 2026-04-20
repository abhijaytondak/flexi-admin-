"use client";

import { useMemo, useState, useCallback } from "react";
import { DEMO_CYCLES, CURRENT_CYCLE_ID, type Cycle } from "@partner-portal/shared";

// ── Period selector state ──────────────────────────────────────────────────
// PRD §4.4 — Time Period Selector supports 4 modes:
//   • Per Cycle   → cycleId from DEMO_CYCLES (primary / default)
//   • Monthly     → specific month + year
//   • Yearly (FY) → Indian Financial Year (April → March)
//   • Custom      → explicit start + end date (inclusive)

export type PeriodMode = "cycle" | "monthly" | "yearly" | "custom";

export interface PeriodState {
  mode: PeriodMode;
  cycleId: string;
  monthlyMonth: number; // 1-12
  monthlyYear: number;
  fiscalYearStart: number; // the year in "FY YYYY-YY"
  customStart: string; // ISO yyyy-mm-dd
  customEnd: string;   // ISO yyyy-mm-dd
}

export interface PeriodWindow {
  /** Inclusive start date (yyyy-mm-dd). Null ⇒ unbounded lower. */
  start: Date | null;
  /** Inclusive end date (yyyy-mm-dd).   Null ⇒ unbounded upper. */
  end: Date | null;
  /** cycleId → restrict to this cycle only, if set. */
  cycleId: string | null;
  /** Human-readable label used in card subtitle and CSV filename. */
  label: string;
  /** Short slug safe for filenames. */
  slug: string;
}

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Derive the current Indian fiscal year (April → March) based on today. */
function currentFiscalYearStart(): number {
  const d = new Date();
  return d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;
}

function defaultState(): PeriodState {
  const now = new Date();
  return {
    mode: "cycle",
    cycleId: CURRENT_CYCLE_ID,
    monthlyMonth: now.getMonth() + 1,
    monthlyYear: now.getFullYear(),
    fiscalYearStart: currentFiscalYearStart(),
    customStart: "",
    customEnd: "",
  };
}

/** Last day of a given month (1-12). */
function endOfMonth(year: number, month1to12: number): Date {
  return new Date(year, month1to12, 0); // day 0 of next month = last of this month
}

export function usePayrollPeriod() {
  const [state, setState] = useState<PeriodState>(defaultState);

  const setMode = useCallback(
    (mode: PeriodMode) => setState((s) => ({ ...s, mode })),
    [],
  );
  const setCycleId = useCallback(
    (cycleId: string) => setState((s) => ({ ...s, cycleId })),
    [],
  );
  const setMonthly = useCallback(
    (month: number, year: number) =>
      setState((s) => ({ ...s, monthlyMonth: month, monthlyYear: year })),
    [],
  );
  const setFiscalYearStart = useCallback(
    (year: number) => setState((s) => ({ ...s, fiscalYearStart: year })),
    [],
  );
  const setCustomRange = useCallback(
    (start: string, end: string) =>
      setState((s) => ({ ...s, customStart: start, customEnd: end })),
    [],
  );

  /** Derive the active {start, end, cycleId, label, slug}. */
  const window: PeriodWindow = useMemo(() => {
    if (state.mode === "cycle") {
      const cyc: Cycle | undefined = DEMO_CYCLES.find((c) => c.id === state.cycleId);
      if (!cyc) return { start: null, end: null, cycleId: state.cycleId, label: state.cycleId, slug: state.cycleId };
      return {
        start: null,
        end: null,
        cycleId: cyc.id,
        label: `Cycle · ${cyc.label}`,
        slug: cyc.id,
      };
    }
    if (state.mode === "monthly") {
      const start = new Date(state.monthlyYear, state.monthlyMonth - 1, 1);
      const end = endOfMonth(state.monthlyYear, state.monthlyMonth);
      const label = `${MONTH_LABELS[state.monthlyMonth - 1]} ${state.monthlyYear}`;
      return {
        start, end, cycleId: null,
        label: `Month · ${label}`,
        slug: `${state.monthlyYear}-${String(state.monthlyMonth).padStart(2, "0")}`,
      };
    }
    if (state.mode === "yearly") {
      // Indian FY: Apr 1 → Mar 31 of following year
      const start = new Date(state.fiscalYearStart, 3, 1);
      const end = endOfMonth(state.fiscalYearStart + 1, 3);
      const yy = String(state.fiscalYearStart + 1).slice(-2);
      return {
        start, end, cycleId: null,
        label: `FY ${state.fiscalYearStart}-${yy}`,
        slug: `FY-${state.fiscalYearStart}-${yy}`,
      };
    }
    // custom
    const start = state.customStart ? new Date(state.customStart) : null;
    const end = state.customEnd ? new Date(state.customEnd) : null;
    const label = start && end
      ? `${state.customStart} → ${state.customEnd}`
      : "Custom range";
    return {
      start, end, cycleId: null,
      label: `Custom · ${label}`,
      slug: `custom-${state.customStart || "na"}_${state.customEnd || "na"}`,
    };
  }, [state]);

  /** Generate an array of candidate FY start years (last 3, current, next 1). */
  const fiscalYearOptions = useMemo(() => {
    const curFy = currentFiscalYearStart();
    return [curFy - 2, curFy - 1, curFy, curFy + 1];
  }, []);

  return {
    state,
    setMode,
    setCycleId,
    setMonthly,
    setFiscalYearStart,
    setCustomRange,
    window,
    fiscalYearOptions,
    cycles: DEMO_CYCLES,
    monthLabels: MONTH_LABELS,
  };
}
