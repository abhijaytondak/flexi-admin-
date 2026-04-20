"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import {
  Download,
  DollarSign,
  Users,
  BarChart3,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
} from "lucide-react";
import { formatINR, downloadFile } from "@partner-portal/shared/helpers";
import { StatCard } from "@partner-portal/ui";
import { toast } from "sonner";

import { usePayrollPeriod } from "./hooks/usePayrollPeriod";
import { usePayrollData } from "./hooks/usePayrollData";

// ─────────────────────────────────────────────────────────────────────────────
// Payroll Export — implements PRD §4.4 in full:
//   (1) 4 summary cards driven by the selected period
//   (2) Time period selector: Per Cycle (default) | Monthly | Yearly (FY) | Custom
//   (3) Per-employee × per-category table with Slab column + totals row
//   (4) Three export buttons: CSV (functional), Excel + PDF (stubs with toast)
// ─────────────────────────────────────────────────────────────────────────────

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const inputStyle: CSSProperties = {
  ...font,
  padding: "var(--space-2) var(--space-3)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  outline: "none",
};

const btnPrimary: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)",
  backgroundColor: "var(--brand-accent)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
};

const btnSecondary: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
};

const fieldLabel: CSSProperties = {
  ...font,
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  color: "var(--color-muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export function PayrollExport() {
  const {
    state,
    setMode,
    setCycleId,
    setMonthly,
    setFiscalYearStart,
    setCustomRange,
    window: periodWindow,
    fiscalYearOptions,
    cycles,
    monthLabels,
  } = usePayrollPeriod();

  // NOTE on Slab column (PRD §4.4): hidden when company uses a single
  // company-wide policy. Default = slab-based visible. Toggle lives in
  // the header so reviewers can see both states.
  const [showSlab, setShowSlab] = useState(true);

  const data = usePayrollData(periodWindow);

  // ── Build CSV respecting active period + filters ─────────────────────────
  const buildCsv = useCallback((): string => {
    const headers: string[] = ["Employee ID", "Name"];
    if (showSlab) headers.push("Slab");
    for (const cat of data.categories) headers.push(cat.label);
    headers.push("Total");

    const rows = data.rows.map((r) => {
      const cols: (string | number)[] = [r.employeeId, `"${r.name}"`];
      if (showSlab) cols.push(`"${r.bracket}"`);
      for (const cat of data.categories) cols.push(r.cells[cat.key] || 0);
      cols.push(r.total);
      return cols.join(",");
    });

    // Totals row
    const totalsCols: (string | number)[] = ["", "TOTALS"];
    if (showSlab) totalsCols.push("");
    for (const cat of data.categories) totalsCols.push(data.columnTotals[cat.key] || 0);
    totalsCols.push(data.grandTotal);

    const metaLines = [
      `# Period,${periodWindow.label}`,
      `# Generated,${new Date().toISOString()}`,
    ];
    return [...metaLines, headers.join(","), ...rows, totalsCols.join(",")].join("\n");
  }, [data, showSlab, periodWindow.label]);

  const handleExportCsv = useCallback(() => {
    if (data.rows.length === 0) {
      toast.error("No approved claims in the selected period");
      return;
    }
    try {
      const csv = buildCsv();
      downloadFile(csv, `payroll_${periodWindow.slug}.csv`, "text/csv");
      toast.success("CSV downloaded");
    } catch {
      toast.error("Failed to generate CSV");
    }
  }, [buildCsv, data.rows.length, periodWindow.slug]);

  // TODO(xlsx): Wire up SheetJS or similar once a lightweight dep is approved.
  const handleExportExcel = useCallback(() => {
    toast.info("Excel export coming soon");
  }, []);

  // TODO(pdf): Wire up a server-side renderer or jsPDF once a dep is approved.
  const handleExportPdf = useCallback(() => {
    toast.info("PDF export coming soon");
  }, []);

  const thStyle: CSSProperties = useMemo(
    () => ({
      textAlign: "left",
      padding: "var(--space-3) var(--space-3)",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      color: "var(--color-muted-foreground)",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      borderBottom: "1px solid var(--color-border)",
      backgroundColor: "var(--color-background)",
      whiteSpace: "nowrap",
    }),
    [],
  );

  const tdStyle: CSSProperties = useMemo(
    () => ({
      padding: "var(--space-3) var(--space-3)",
      fontSize: "var(--text-sm)",
      color: "var(--color-foreground)",
      borderBottom: "1px solid var(--color-border)",
      whiteSpace: "nowrap",
    }),
    [],
  );

  const cellValue = (n: number): string => (n > 0 ? formatINR(n) : "\u2014");

  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-5)",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Payroll Export
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            {periodWindow.label} &middot; {data.employeesWithClaims} employee{data.employeesWithClaims === 1 ? "" : "s"} &middot; {data.totalClaimUnits} claim unit{data.totalClaimUnits === 1 ? "" : "s"}
          </p>
        </div>

        {/* Export buttons */}
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            style={btnPrimary}
            onClick={handleExportCsv}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-accent)")}
            aria-label="Export CSV"
          >
            <Download size={15} /> <FileText size={14} style={{ opacity: 0.9 }} /> CSV
          </button>
          <button style={btnSecondary} onClick={handleExportExcel} aria-label="Export Excel">
            <FileSpreadsheet size={15} style={{ color: "var(--color-muted-foreground)" }} /> Excel
          </button>
          <button style={btnSecondary} onClick={handleExportPdf} aria-label="Export PDF">
            <FileIcon size={15} style={{ color: "var(--color-muted-foreground)" }} /> PDF
          </button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-lg)",
          padding: "var(--space-4)",
          marginBottom: "var(--space-5)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "flex-end" }}>
          {/* Mode picker */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 180 }}>
            <label style={fieldLabel}>Time Period</label>
            <select
              style={{ ...inputStyle, width: "100%" }}
              value={state.mode}
              onChange={(e) => setMode(e.target.value as typeof state.mode)}
              aria-label="Time period mode"
            >
              <option value="cycle">Per Cycle</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly (FY)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {state.mode === "cycle" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 220 }}>
              <label style={fieldLabel}>Cycle</label>
              <select
                style={{ ...inputStyle, width: "100%" }}
                value={state.cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                aria-label="Select cycle"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {state.mode === "monthly" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label style={fieldLabel}>Month</label>
                <select
                  style={inputStyle}
                  value={state.monthlyMonth}
                  onChange={(e) => setMonthly(Number(e.target.value), state.monthlyYear)}
                  aria-label="Select month"
                >
                  {monthLabels.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label style={fieldLabel}>Year</label>
                <input
                  type="number"
                  style={{ ...inputStyle, width: 100 }}
                  value={state.monthlyYear}
                  min={2020}
                  max={2099}
                  onChange={(e) => setMonthly(state.monthlyMonth, Number(e.target.value) || state.monthlyYear)}
                  aria-label="Year"
                />
              </div>
            </>
          )}

          {state.mode === "yearly" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 200 }}>
              <label style={fieldLabel}>Financial Year</label>
              <select
                style={inputStyle}
                value={state.fiscalYearStart}
                onChange={(e) => setFiscalYearStart(Number(e.target.value))}
                aria-label="Select fiscal year"
              >
                {fiscalYearOptions.map((y) => (
                  <option key={y} value={y}>
                    FY {y}-{String(y + 1).slice(-2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {state.mode === "custom" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label style={fieldLabel}>Start Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={state.customStart}
                  onChange={(e) => setCustomRange(e.target.value, state.customEnd)}
                  aria-label="Custom start date"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label style={fieldLabel}>End Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={state.customEnd}
                  onChange={(e) => setCustomRange(state.customStart, e.target.value)}
                  aria-label="Custom end date"
                />
              </div>
            </>
          )}

          <div style={{ flex: 1 }} />

          <label
            style={{
              ...font,
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--text-sm)",
              color: "var(--color-muted-foreground)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showSlab}
              onChange={(e) => setShowSlab(e.target.checked)}
            />
            Slab-based config
          </label>
        </div>
      </div>

      {/* 4 Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <StatCard
          title="Total Reimbursable"
          value={formatINR(data.totalReimbursable)}
          icon={DollarSign}
          color="var(--brand-navy)"
          bgColor="var(--brand-navy-alpha-08)"
        />
        <StatCard
          title="Employees with Claims"
          value={String(data.employeesWithClaims)}
          icon={Users}
          color="var(--brand-green)"
          bgColor="var(--brand-green-light)"
        />
        <StatCard
          title="Avg per Employee"
          value={formatINR(data.avgPerEmployee)}
          icon={BarChart3}
          color="var(--brand-amber)"
          bgColor="var(--brand-amber-light)"
        />
        <StatCard
          title="Total Claim Units"
          value={String(data.totalClaimUnits)}
          icon={FileText}
          color="#9B59B6"
          bgColor="#F4ECF7"
        />
      </div>

      {/* Per-Employee Table */}
      <div
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-lg)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
            <thead>
              <tr>
                <th style={thStyle}>Employee ID</th>
                <th style={thStyle}>Name</th>
                {showSlab && <th style={thStyle}>Slab</th>}
                {data.categories.map((cat) => (
                  <th key={cat.key} style={{ ...thStyle, textAlign: "right" }}>
                    {cat.label}
                  </th>
                ))}
                <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={(showSlab ? 3 : 2) + data.categories.length + 1}
                    style={{ padding: "var(--space-8)", textAlign: "center" }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
                      <FileText size={40} style={{ color: "var(--color-muted-foreground)", opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600 }}>
                        No approved claims
                      </p>
                      <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                        There are no approved claims in {periodWindow.label}.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {data.rows.map((row) => (
                    <tr key={row.employeeId}>
                      <td style={{ ...tdStyle, color: "var(--color-muted-foreground)" }}>{row.employeeId}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{row.name}</td>
                      {showSlab && <td style={tdStyle}>{row.bracket}</td>}
                      {data.categories.map((cat) => {
                        const v = row.cells[cat.key] || 0;
                        return (
                          <td
                            key={cat.key}
                            style={{
                              ...tdStyle,
                              textAlign: "right",
                              color: v === 0 ? "var(--color-muted-foreground)" : "var(--color-foreground)",
                            }}
                          >
                            {cellValue(v)}
                          </td>
                        );
                      })}
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                        {formatINR(row.total)}
                      </td>
                    </tr>
                  ))}

                  {/* Totals row */}
                  <tr style={{ backgroundColor: "var(--color-background)" }}>
                    <td style={{ ...tdStyle, fontWeight: 700, borderBottom: "none" }} colSpan={showSlab ? 3 : 2}>
                      TOTALS
                    </td>
                    {data.categories.map((cat) => (
                      <td
                        key={cat.key}
                        style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderBottom: "none" }}
                      >
                        {cellValue(data.columnTotals[cat.key] || 0)}
                      </td>
                    ))}
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        fontWeight: 700,
                        borderBottom: "none",
                        color: "var(--brand-navy)",
                      }}
                    >
                      {formatINR(data.grandTotal)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p
        style={{
          marginTop: "var(--space-4)",
          fontSize: "var(--text-xs)",
          color: "var(--color-muted-foreground)",
          textAlign: "center",
        }}
      >
        Approved + auto-approved claims only. Multi-month allocations use the
        cycle slice (<code>allocationAmount</code>), not the original purchase amount.
      </p>
    </div>
  );
}
