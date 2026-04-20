"use client";

import { useMemo } from "react";
import {
  DEMO_CLAIMS,
  DEMO_EMPLOYEES,
  FLEXI_BENEFIT_CATEGORIES,
  type Claim,
  type Employee,
} from "@partner-portal/shared";
import { parseINR } from "@partner-portal/shared/helpers";
import type { PeriodWindow } from "./usePayrollPeriod";

// ── Per-employee × per-category derived table ─────────────────────────────
// PRD §4.4: one row per employee with ≥1 approved claim in the period.
//           one column per FLEXI_BENEFIT_CATEGORIES entry + Total.
//           Multi-month claims contribute `allocationAmount` (slice for this
//           cycle), not `originalAmount`.

export interface PayrollEmployeeRow {
  employeeId: string;
  name: string;
  bracket: string;
  cells: Record<string, number>; // by category key
  total: number;
  claimUnitCount: number;
}

export interface PayrollDerived {
  rows: PayrollEmployeeRow[];
  columnTotals: Record<string, number>;
  grandTotal: number;
  totalReimbursable: number;
  employeesWithClaims: number;
  avgPerEmployee: number;
  totalClaimUnits: number;
  categories: { key: string; label: string }[];
}

/** Approved-ish statuses that count toward payroll (PRD §4.4). */
function isApproved(c: Claim): boolean {
  return c.status === "approved" || c.status === "auto_approved";
}

/** Map a claim's benefitType label back to a FLEXI_BENEFIT_CATEGORIES key. */
function categoryKeyFromClaim(claim: Claim): string | null {
  const match = FLEXI_BENEFIT_CATEGORIES.find(
    (c) => c.label === claim.benefitType,
  );
  if (match) return match.key;
  // Fallback: loose match by lowercased includes for pre-seeded demo data.
  const lc = (claim.benefitType || "").toLowerCase();
  const loose = FLEXI_BENEFIT_CATEGORIES.find((c) =>
    lc.includes(c.key.replace(/_/g, " ")) || c.label.toLowerCase() === lc,
  );
  return loose?.key ?? null;
}

/**
 * Multi-month amount rule:
 *   If `multiMonthAllocation` is set, use `allocationAmount` (the slice for
 *   this cycle). Otherwise parse `claimAmount` ("₹2,500" → 2500).
 */
function claimAmount(claim: Claim): number {
  if (claim.multiMonthAllocation) {
    return claim.multiMonthAllocation.allocationAmount;
  }
  return parseINR(claim.claimAmount);
}

function claimInWindow(claim: Claim, win: PeriodWindow): boolean {
  if (win.cycleId) return claim.cycleId === win.cycleId;
  if (!win.start && !win.end) return true;
  const ds = claim.dateSubmitted;
  if (!ds) return false;
  const d = new Date(ds);
  if (win.start && d < win.start) return false;
  if (win.end) {
    // inclusive end-of-day comparison
    const endInclusive = new Date(win.end);
    endInclusive.setHours(23, 59, 59, 999);
    if (d > endInclusive) return false;
  }
  return true;
}

export function usePayrollData(win: PeriodWindow): PayrollDerived {
  return useMemo(() => {
    const categories = FLEXI_BENEFIT_CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
    }));

    // Filter to approved + in-window claims.
    const scoped = DEMO_CLAIMS.filter(
      (c) => isApproved(c) && claimInWindow(c, win),
    );

    // Index employees for bracket lookup.
    const empIndex = new Map<string, Employee>();
    DEMO_EMPLOYEES.forEach((e) => empIndex.set(e.id, e));

    const byEmp = new Map<string, PayrollEmployeeRow>();
    for (const c of scoped) {
      const empId = c.employeeId ?? c.employeeName;
      const emp = (c.employeeId && empIndex.get(c.employeeId)) || undefined;
      const bracket = emp?.bracket ?? c.salaryBand ?? "—";
      const catKey = categoryKeyFromClaim(c);
      if (!catKey) continue;

      const amt = claimAmount(c);

      let row = byEmp.get(empId);
      if (!row) {
        row = {
          employeeId: empId,
          name: c.employeeName,
          bracket,
          cells: Object.fromEntries(categories.map((cat) => [cat.key, 0])),
          total: 0,
          claimUnitCount: 0,
        };
        byEmp.set(empId, row);
      }
      row.cells[catKey] += amt;
      row.total += amt;
      row.claimUnitCount += 1;
    }

    const rows = Array.from(byEmp.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const columnTotals: Record<string, number> = Object.fromEntries(
      categories.map((c) => [c.key, 0]),
    );
    for (const r of rows) {
      for (const cat of categories) columnTotals[cat.key] += r.cells[cat.key];
    }
    const grandTotal = rows.reduce((s, r) => s + r.total, 0);

    const totalReimbursable = grandTotal;
    const employeesWithClaims = rows.length;
    const avgPerEmployee =
      employeesWithClaims > 0
        ? Math.round(totalReimbursable / employeesWithClaims)
        : 0;
    const totalClaimUnits = rows.reduce((s, r) => s + r.claimUnitCount, 0);

    return {
      rows,
      columnTotals,
      grandTotal,
      totalReimbursable,
      employeesWithClaims,
      avgPerEmployee,
      totalClaimUnits,
      categories,
    };
  }, [win]);
}

