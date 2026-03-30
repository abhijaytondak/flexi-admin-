"use client";

import { useMemo } from "react";

export interface FiscalCycle {
  start: Date;
  end: Date;
  deadline: Date;
  daysRemaining: number;
}

export interface FiscalYearInfo {
  currentFY: string;
  daysUntilFYEnd: number;
  currentCycle: FiscalCycle;
  isDeclarationWindowOpen: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonthIndex(monthName: string): number {
  const idx = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === monthName.toLowerCase()
  );
  return idx === -1 ? 3 : idx; // default April
}

export function useFiscalYear(
  fiscalYearStartMonth: string = "April",
  payrollDay: number = 1,
  offsetDays: number = 7
): FiscalYearInfo {
  return useMemo(() => {
    const now = new Date();
    const startMonthIdx = getMonthIndex(fiscalYearStartMonth);

    // Determine fiscal year boundaries
    let fyStartYear: number;
    if (now.getMonth() >= startMonthIdx) {
      fyStartYear = now.getFullYear();
    } else {
      fyStartYear = now.getFullYear() - 1;
    }

    const fyStart = new Date(fyStartYear, startMonthIdx, 1);
    const fyEnd = new Date(fyStartYear + 1, startMonthIdx, 0, 23, 59, 59);

    const currentFY =
      startMonthIdx === 0
        ? `FY ${fyStartYear}`
        : `FY ${fyStartYear}-${(fyStartYear + 1) % 100}`;

    const daysUntilFYEnd = Math.max(
      0,
      Math.ceil((fyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Current payroll cycle: find the current month's payroll window
    const cycleMonth = now.getMonth();
    const cycleYear = now.getFullYear();

    const cycleStart = new Date(cycleYear, cycleMonth, 1);
    const cycleEnd = new Date(cycleYear, cycleMonth + 1, 0);
    const payrollDate = new Date(
      cycleYear,
      cycleMonth,
      Math.min(payrollDay, cycleEnd.getDate())
    );

    const deadline = new Date(payrollDate);
    deadline.setDate(deadline.getDate() - offsetDays);

    const cycleDaysRemaining = Math.max(
      0,
      Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    const currentCycle: FiscalCycle = {
      start: cycleStart,
      end: cycleEnd,
      deadline,
      daysRemaining: cycleDaysRemaining,
    };

    // Declaration window is open in the last 2 months of FY
    const monthsUntilFYEnd = Math.ceil(daysUntilFYEnd / 30);
    const isDeclarationWindowOpen = monthsUntilFYEnd <= 2;

    return {
      currentFY,
      daysUntilFYEnd,
      currentCycle,
      isDeclarationWindowOpen,
    };
  }, [fiscalYearStartMonth, payrollDay, offsetDays]);
}
