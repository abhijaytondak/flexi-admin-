import { useState, useCallback, useMemo, useRef, useEffect, type CSSProperties } from "react";
import { Download, Calendar, DollarSign, Users, FileText, BarChart3, X, ChevronDown, Lock, CheckCircle, Circle } from "lucide-react";
import { formatINR, downloadFile } from "@partner-portal/shared/helpers";
import { PLAN_META, type BenefitPlan } from "@partner-portal/shared";
import { StatCard } from "@partner-portal/ui";
import { toast } from "sonner";

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const btnPrimary: CSSProperties = {
  ...font, display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)", backgroundColor: "var(--brand-accent)",
  color: "#fff", border: "none", borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)", fontWeight: 500, cursor: "pointer",
};

const inputStyle: CSSProperties = {
  ...font, padding: "var(--space-2) var(--space-3)",
  border: "1px solid var(--color-border)", borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)", backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)", outline: "none",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type ExportFormat = "csv" | "pdf" | "excel";
type CycleScope = "current" | "all" | string; // string for specific month names

/** Get cycle status based on month relative to current date */
function getCycleStatus(month: string): "open" | "locked" | "exported" {
  const now = new Date();
  const idx = MONTHS.indexOf(month);
  const currentMonth = now.getMonth();
  if (idx === currentMonth) return "open";
  if (idx < currentMonth) {
    // Simulate: months more than 2 months ago are "exported", others "locked"
    return currentMonth - idx > 2 ? "exported" : "locked";
  }
  return "open"; // future months
}

const cycleStatusConfig = {
  open: { label: "Open", color: "#16A34A", icon: Circle },
  locked: { label: "Locked", color: "#D97706", icon: Lock },
  exported: { label: "Exported", color: "#6B7280", icon: CheckCircle },
} as const;

interface MockRow {
  employeeId: string;
  name: string;
  dept: string;
  band: string;
  food: number;
  fuel: number;
  comm: number;
  profPursuit: number;
  gadget: number;
}

const BASE_EMPLOYEES: MockRow[] = [
  { employeeId: "EMP-001", name: "Priya Sharma", dept: "Engineering", band: "Senior Associate", food: 3000, fuel: 3200, comm: 1200, profPursuit: 0, gadget: 4000 },
  { employeeId: "EMP-002", name: "Rahul Verma", dept: "Engineering", band: "Senior Manager", food: 6000, fuel: 5000, comm: 2000, profPursuit: 12000, gadget: 10000 },
  { employeeId: "EMP-003", name: "Anita Desai", dept: "Product", band: "Manager", food: 4500, fuel: 0, comm: 1500, profPursuit: 8000, gadget: 5000 },
  { employeeId: "EMP-004", name: "Vikram Patel", dept: "Sales", band: "Associate", food: 2000, fuel: 0, comm: 800, profPursuit: 0, gadget: 0 },
  { employeeId: "EMP-005", name: "Deepa Nair", dept: "HR", band: "Manager", food: 4500, fuel: 3000, comm: 1500, profPursuit: 5000, gadget: 4000 },
  { employeeId: "EMP-006", name: "Arjun Singh", dept: "Engineering", band: "VP", food: 10000, fuel: 4500, comm: 3000, profPursuit: 15000, gadget: 12000 },
  { employeeId: "EMP-007", name: "Meera Joshi", dept: "Marketing", band: "Associate", food: 2000, fuel: 0, comm: 800, profPursuit: 0, gadget: 0 },
  { employeeId: "EMP-008", name: "Karthik Reddy", dept: "Engineering", band: "Senior Associate", food: 3000, fuel: 3800, comm: 1200, profPursuit: 0, gadget: 5000 },
  { employeeId: "EMP-009", name: "Sneha Gupta", dept: "Product", band: "AVP", food: 8000, fuel: 4000, comm: 2500, profPursuit: 10000, gadget: 8000 },
  { employeeId: "EMP-010", name: "Ravi Kumar", dept: "Sales", band: "Senior Associate", food: 3000, fuel: 2800, comm: 1200, profPursuit: 0, gadget: 0 },
  { employeeId: "EMP-011", name: "Lakshmi Iyer", dept: "Finance", band: "Senior Manager", food: 6000, fuel: 0, comm: 2000, profPursuit: 6000, gadget: 5500 },
  { employeeId: "EMP-012", name: "Anil Kapoor", dept: "Operations", band: "Associate", food: 2000, fuel: 2000, comm: 800, profPursuit: 0, gadget: 0 },
];

/** Generate deterministic mock data per month -- multiplier varies amounts by cycle */
function getDataForMonth(month: string): MockRow[] {
  const idx = MONTHS.indexOf(month);
  if (idx < 0) return [];
  // Future months have no data
  const now = new Date();
  if (idx > now.getMonth()) return [];
  // Apply a multiplier so each month looks different
  const multipliers = [1, 0.9, 1.1, 0.85, 1.05, 0.95, 1.15, 0.8, 1.0, 0.92, 1.08, 0.88];
  const m = multipliers[idx];
  return BASE_EMPLOYEES.map((row) => ({
    ...row,
    food: Math.round(row.food * m),
    fuel: Math.round(row.fuel * m),
    comm: Math.round(row.comm * m),
    profPursuit: Math.round(row.profPursuit * m),
    gadget: Math.round(row.gadget * m),
  }));
}

function total(row: MockRow): number {
  return row.food + row.fuel + row.comm + row.profPursuit + row.gadget;
}

function amountCell(val: number): string {
  return val === 0 ? "\u2014" : formatINR(val);
}

export function PayrollExport() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()]);
  const [selectedYear] = useState(now.getFullYear());
  const [selectedRow, setSelectedRow] = useState<MockRow | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [cycleScope, setCycleScope] = useState<CycleScope>("current");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setShowExportDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter data by selected cycle
  const filteredData = useMemo(() => getDataForMonth(selectedMonth), [selectedMonth]);

  const totalReimbursable = filteredData.reduce((s, r) => s + total(r), 0);
  const employeesWithClaims = filteredData.filter(r => total(r) > 0).length;
  const totalClaimsCount = filteredData.reduce((s, r) => {
    let count = 0;
    if (r.food > 0) count++;
    if (r.fuel > 0) count++;
    if (r.comm > 0) count++;
    if (r.profPursuit > 0) count++;
    if (r.gadget > 0) count++;
    return s + count;
  }, 0);
  const avgPerEmployee = employeesWithClaims > 0 ? Math.round(totalReimbursable / employeesWithClaims) : 0;

  // Column totals
  const colTotals = {
    food: filteredData.reduce((s, r) => s + r.food, 0),
    fuel: filteredData.reduce((s, r) => s + r.fuel, 0),
    comm: filteredData.reduce((s, r) => s + r.comm, 0),
    profPursuit: filteredData.reduce((s, r) => s + r.profPursuit, 0),
    gadget: filteredData.reduce((s, r) => s + r.gadget, 0),
  };
  const grandTotal = colTotals.food + colTotals.fuel + colTotals.comm + colTotals.profPursuit + colTotals.gadget;

  /** Gather data rows based on the selected cycle scope */
  const getExportData = useCallback((): { data: MockRow[]; label: string } => {
    if (cycleScope === "all") {
      const allData: MockRow[] = [];
      const currentMonthIdx = now.getMonth();
      for (let i = 0; i <= currentMonthIdx; i++) {
        allData.push(...getDataForMonth(MONTHS[i]));
      }
      return { data: allData, label: "all_cycles" };
    }
    const month = cycleScope === "current" ? selectedMonth : cycleScope;
    return { data: getDataForMonth(month), label: month };
  }, [cycleScope, selectedMonth, now]);

  const buildCsvContent = useCallback((data: MockRow[]): string => {
    const headers = ["Employee ID", "Name", "Department", "Band", "Food", "Fuel", "Communication", "Education", "Health", "Total Claims", "Total Amount"];
    const rows = data.map(r => {
      const claimsCount = [r.food, r.fuel, r.comm, r.profPursuit, r.gadget].filter(v => v > 0).length;
      return [r.employeeId, `"${r.name}"`, r.dept, r.band, r.food, r.fuel, r.comm, r.profPursuit, r.gadget, claimsCount, total(r)].join(",");
    });
    const cFood = data.reduce((s, r) => s + r.food, 0);
    const cFuel = data.reduce((s, r) => s + r.fuel, 0);
    const cComm = data.reduce((s, r) => s + r.comm, 0);
    const cProf = data.reduce((s, r) => s + r.profPursuit, 0);
    const cGadget = data.reduce((s, r) => s + r.gadget, 0);
    const cTotal = cFood + cFuel + cComm + cProf + cGadget;
    const totalClaimsSum = data.reduce((s, r) => s + [r.food, r.fuel, r.comm, r.profPursuit, r.gadget].filter(v => v > 0).length, 0);
    const totalsRow = ["", "TOTALS", "", "", cFood, cFuel, cComm, cProf, cGadget, totalClaimsSum, cTotal].join(",");
    return [headers.join(","), ...rows, totalsRow].join("\n");
  }, []);

  const handleExport = useCallback(() => {
    try {
      const { data, label } = getExportData();
      if (data.length === 0) {
        toast.error("No data available for the selected cycle");
        return;
      }
      const content = buildCsvContent(data);
      const formatExt = exportFormat === "excel" ? "xlsx" : exportFormat;
      const mimeType = exportFormat === "pdf" ? "application/pdf" : exportFormat === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv";
      // For PDF/Excel, we still export CSV content with the appropriate extension as a simulation
      downloadFile(content, `payroll_${label}_${selectedYear}.${formatExt}`, mimeType);
      toast.success(`Payroll report downloaded as ${formatExt.toUpperCase()}`);
      setShowExportDropdown(false);
    } catch {
      toast.error("Failed to generate report");
    }
  }, [selectedYear, getExportData, buildCsvContent, exportFormat]);

  const thStyle: CSSProperties = {
    textAlign: "left", padding: "var(--space-3) var(--space-3)",
    fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)",
    textTransform: "uppercase", letterSpacing: "0.04em",
    borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-background)",
    whiteSpace: "nowrap",
  };

  const tdStyle: CSSProperties = {
    padding: "var(--space-3) var(--space-3)",
    fontSize: "var(--text-sm)", color: "var(--color-foreground)",
    borderBottom: "1px solid var(--color-border)",
    whiteSpace: "nowrap",
  };

  const mutedTd: CSSProperties = {
    ...tdStyle, color: "var(--color-muted-foreground)",
  };

  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Payroll Export
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Generate reimbursement data for payroll processing
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Calendar size={16} style={{ color: "var(--color-muted-foreground)" }} />
            <select style={{ ...inputStyle, width: 140 }} value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
              {selectedYear}
            </span>
          </div>
          <div ref={exportDropdownRef} style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button style={{ ...btnPrimary, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} onClick={handleExport}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
                <Download size={16} /> Export {exportFormat.toUpperCase()}
              </button>
              <button
                style={{ ...btnPrimary, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: "1px solid rgba(255,255,255,0.2)", padding: "var(--space-2) var(--space-2)" }}
                onClick={() => setShowExportDropdown(v => !v)}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
                <ChevronDown size={16} />
              </button>
            </div>

            {showExportDropdown && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 100,
                width: 280, backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)",
                borderRadius: "var(--rounded-lg)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                padding: "var(--space-4)", ...font,
              }}>
                {/* Export Format */}
                <div style={{ marginBottom: "var(--space-4)" }}>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--space-2)" }}>
                    Format
                  </label>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    {(["csv", "pdf", "excel"] as ExportFormat[]).map(fmt => (
                      <label key={fmt} style={{
                        display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-sm)",
                        cursor: "pointer", padding: "4px 10px", borderRadius: "var(--rounded-md)",
                        border: exportFormat === fmt ? "1px solid var(--brand-accent)" : "1px solid var(--color-border)",
                        backgroundColor: exportFormat === fmt ? "var(--brand-accent-alpha-08, rgba(37,99,235,0.08))" : "transparent",
                        color: exportFormat === fmt ? "var(--brand-accent)" : "var(--color-foreground)",
                        fontWeight: exportFormat === fmt ? 600 : 400,
                      }}>
                        <input type="radio" name="exportFormat" value={fmt} checked={exportFormat === fmt}
                          onChange={() => setExportFormat(fmt)} style={{ display: "none" }} />
                        {fmt.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cycle Scope */}
                <div style={{ marginBottom: "var(--space-4)" }}>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--space-2)" }}>
                    Cycle
                  </label>
                  <select style={{ ...inputStyle, width: "100%" }} value={cycleScope}
                    onChange={e => setCycleScope(e.target.value)}>
                    <option value="current">Current Month ({selectedMonth})</option>
                    <option value="all">All Cycles (YTD)</option>
                    <optgroup label="Past Months">
                      {MONTHS.slice(0, now.getMonth() + 1).map(m => {
                        const status = getCycleStatus(m);
                        const cfg = cycleStatusConfig[status];
                        return (
                          <option key={m} value={m}>
                            {m} - {cfg.label}
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>
                </div>

                {/* Cycle status legend */}
                <div style={{ marginBottom: "var(--space-4)", padding: "var(--space-2) var(--space-3)", backgroundColor: "var(--color-background)", borderRadius: "var(--rounded-md)" }}>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", marginBottom: "var(--space-1)", fontWeight: 600 }}>Cycle Status</div>
                  <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    {(["open", "locked", "exported"] as const).map(status => {
                      const cfg = cycleStatusConfig[status];
                      const Icon = cfg.icon;
                      return (
                        <div key={status} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: cfg.color }}>
                          <Icon size={12} /> {cfg.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Export button */}
                <button style={{ ...btnPrimary, width: "100%", justifyContent: "center" }} onClick={handleExport}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
                  <Download size={16} /> Download {exportFormat.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
            <StatCard
              title="Total Reimbursable"
              value={formatINR(totalReimbursable)}
              icon={DollarSign}
              color="var(--brand-navy)"
              bgColor="var(--brand-navy-alpha-08)"
            />
            <StatCard
              title="Employees with Claims"
              value={String(employeesWithClaims)}
              icon={Users}
              color="var(--brand-green)"
              bgColor="var(--brand-green-light)"
            />
            <StatCard
              title="Avg per Employee"
              value={formatINR(avgPerEmployee)}
              icon={BarChart3}
              color="var(--brand-amber)"
              bgColor="var(--brand-amber-light)"
            />
            <StatCard
              title="Total Claims"
              value={String(totalClaimsCount)}
              icon={FileText}
              color="#9B59B6"
              bgColor="#F4ECF7"
            />
          </div>

      {/* Data Table */}
      <div style={{
        backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-lg)", overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Employee ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Dept</th>
                <th style={thStyle}>Band</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Food</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Fuel</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Comm</th>
                <th style={{ ...thStyle, textAlign: "right" }}>LTA</th>
                <th style={{ ...thStyle, textAlign: "right" }}>NPS</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: "var(--space-8)", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
                      <FileText size={40} style={{ color: "var(--color-muted-foreground)", opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
                        No approved claims
                      </p>
                      <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                        There are no approved claims for {selectedMonth} {selectedYear}. Try selecting a different month.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredData.map((row) => {
                    const rowTotal = total(row);
                    return (
                      <tr key={row.employeeId}
                        style={{ transition: "background-color 150ms", cursor: "pointer" }}
                        onClick={() => setSelectedRow(row)}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-background)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={mutedTd}>{row.employeeId}</td>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{row.name}</td>
                        <td style={tdStyle}>{row.dept}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: "inline-flex", padding: "1px 8px", borderRadius: "var(--rounded-full)",
                            fontSize: "var(--text-xs)", fontWeight: 600,
                            color: PLAN_META[row.band as BenefitPlan]?.color ?? "#6B7A8D",
                            backgroundColor: PLAN_META[row.band as BenefitPlan]?.bgColor ?? "#F0F2F5",
                          }}>
                            {row.band}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", color: row.food === 0 ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>
                          {amountCell(row.food)}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", color: row.fuel === 0 ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>
                          {amountCell(row.fuel)}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", color: row.comm === 0 ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>
                          {amountCell(row.comm)}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", color: row.profPursuit === 0 ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>
                          {amountCell(row.profPursuit)}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", color: row.gadget === 0 ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>
                          {amountCell(row.gadget)}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                          {formatINR(rowTotal)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totals Row */}
                  <tr style={{ backgroundColor: "var(--color-background)" }}>
                    <td style={{ ...tdStyle, fontWeight: 700, borderBottom: "none" }} colSpan={4}>
                      TOTALS
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
                      {formatINR(colTotals.food)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
                      {formatINR(colTotals.fuel)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
                      {formatINR(colTotals.comm)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
                      {formatINR(colTotals.profPursuit)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
                      {formatINR(colTotals.gadget)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderBottom: "none", color: "var(--brand-navy)" }}>
                      {formatINR(grandTotal)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <p style={{
        marginTop: "var(--space-4)", fontSize: "var(--text-xs)",
        color: "var(--color-muted-foreground)", textAlign: "center",
      }}>
        Payroll data for {selectedMonth} {selectedYear}. Export as CSV, PDF, or Excel for processing in your payroll system.
      </p>

      {/* Employee Detail Drawer */}
      {selectedRow && (
        <div
          style={{
            position: "fixed", top: 0, right: 0, bottom: 0, left: 0,
            backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000,
            display: "flex", justifyContent: "flex-end",
          }}
          onClick={() => setSelectedRow(null)}
        >
          <div
            style={{
              width: 420, maxWidth: "90vw", height: "100%", backgroundColor: "var(--color-card)",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", padding: "var(--space-6)",
              overflowY: "auto", ...font,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-foreground)" }}>
                Claims Breakdown
              </h2>
              <button
                onClick={() => setSelectedRow(null)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "var(--space-1)", color: "var(--color-muted-foreground)" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "var(--space-5)" }}>
              <h3 style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-base)", fontWeight: 600 }}>{selectedRow.name}</h3>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                {selectedRow.employeeId} &middot; {selectedRow.dept} &middot; {selectedRow.band}
              </p>
              <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                Period: {selectedMonth} {selectedYear}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[
                { label: "Food & Meals", value: selectedRow.food },
                { label: "Fuel & Travel", value: selectedRow.fuel },
                { label: "Communication", value: selectedRow.comm },
                { label: "Leave Travel Allowance", value: selectedRow.profPursuit },
                { label: "Health & Fitness", value: selectedRow.gadget },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "var(--space-3) var(--space-4)",
                  backgroundColor: item.value > 0 ? "var(--color-background)" : "transparent",
                  borderRadius: "var(--rounded-md)",
                  border: "1px solid var(--color-border)",
                }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)" }}>{item.label}</span>
                  <span style={{
                    fontSize: "var(--text-sm)", fontWeight: 600,
                    color: item.value > 0 ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                  }}>
                    {item.value > 0 ? formatINR(item.value) : "\u2014"}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: "var(--space-5)", paddingTop: "var(--space-4)",
              borderTop: "2px solid var(--color-border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--brand-navy)" }}>
                {formatINR(total(selectedRow))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
