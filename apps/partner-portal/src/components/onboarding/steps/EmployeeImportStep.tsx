"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  SkipForward,
} from "lucide-react";
import { deriveBenefitPlan } from "@partner-portal/shared/helpers";
import type { EmployeeImportData, ImportedEmployee } from "../hooks/useOnboardingState";

interface Props {
  data: EmployeeImportData;
  onChange: (d: Partial<EmployeeImportData>) => void;
}


function detectColumn(header: string): string | null {
  const h = header.toLowerCase().replace(/[^a-z]/g, "");
  if (h.includes("name") && !h.includes("email")) return "name";
  if (h.includes("email") || h.includes("mail")) return "email";
  if (h.includes("dept") || h.includes("department")) return "department";
  if (h.includes("desig") || h.includes("title") || h.includes("role")) return "designation";
  if (h.includes("ctc") || h.includes("salary") || h.includes("annual") || h.includes("compensation")) return "annualctc";
  return null;
}

function parseCSV(text: string): ImportedEmployee[] {
  const lines = text.trim().split("\n").map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
  if (lines.length < 2) return [];

  const headers = lines[0];
  const columnMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    const detected = detectColumn(h);
    if (detected) columnMap[detected] = i;
  });

  const rows = lines.slice(1);
  return rows.map((row) => {
    const errors: string[] = [];
    const name = row[columnMap["name"]] || "";
    const email = row[columnMap["email"]] || "";
    const department = row[columnMap["department"]] || "";
    const designation = row[columnMap["designation"]] || "";
    const ctcStr = row[columnMap["annualctc"]] || "0";
    const annualCtc = parseInt(ctcStr.replace(/[^0-9]/g, ""), 10) || 0;

    if (!name) errors.push("Name is required");
    if (!email || !email.includes("@")) errors.push("Valid email required");
    if (annualCtc < 100000) errors.push("CTC seems too low");

    return {
      name,
      email,
      department,
      designation,
      annualCtc,
      band: deriveBenefitPlan(annualCtc),
      valid: errors.length === 0,
      errors,
    };
  });
}

export function EmployeeImportStep({ data, onChange }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const employees = parseCSV(text);
        onChange({ employees, fileName: file.name, skipped: false });
      };
      reader.readAsText(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const validCount = data.employees.filter((e) => e.valid).length;
  const errorCount = data.employees.filter((e) => !e.valid).length;
  const previewRows = data.employees.slice(0, 5);

  const bandColor: Record<string, { bg: string; color: string }> = {
    Associate: { bg: "#F0F2F5", color: "#6B7A8D" },
    "Senior Associate": { bg: "#EBF5FB", color: "#2980B9" },
    Manager: { bg: "#E8F8EF", color: "#27AE60" },
    "Senior Manager": { bg: "#F5EEF8", color: "#8E44AD" },
    AVP: { bg: "#FEF5E7", color: "#E67E22" },
    VP: { bg: "#D4E6F1", color: "#3498DB" },
  };

  return (
    <div>
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.iconWrap}>
          <Upload size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={styles.title}>Employee Import</h2>
          <p style={styles.subtitle}>
            Upload a CSV file with employee data. We will auto-detect columns and
            assign benefit bands based on CTC.
          </p>
        </div>
        <button
          onClick={() => onChange({ skipped: true, employees: [], fileName: "" })}
          style={styles.skipBtn}
        >
          <SkipForward size={14} />
          Skip for now
        </button>
      </div>

      {data.skipped ? (
        <div style={styles.skippedCard}>
          <SkipForward size={20} style={{ color: "var(--brand-amber)" }} />
          <div>
            <div style={{ fontWeight: 500 }}>Employee import skipped</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", marginTop: 2 }}>
              You can import employees later from the Employees section.
            </div>
          </div>
          <button
            onClick={() => onChange({ skipped: false })}
            style={styles.undoBtn}
          >
            Undo
          </button>
        </div>
      ) : data.employees.length === 0 ? (
        /* ─── Drop Zone ───────────────────────────────────────── */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            ...styles.dropZone,
            borderColor: dragOver
              ? "var(--brand-blue)"
              : "var(--color-border)",
            background: dragOver
              ? "var(--brand-blue-light)"
              : "var(--color-background)",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
          <FileSpreadsheet
            size={40}
            style={{
              color: dragOver
                ? "var(--brand-blue)"
                : "var(--color-muted-foreground)",
            }}
          />
          <div style={styles.dropTitle}>
            {dragOver
              ? "Drop CSV file here"
              : "Drag & drop your CSV file here"}
          </div>
          <div style={styles.dropHint}>
            or click to browse. Expected columns: Name, Email, Department,
            Designation, Annual CTC
          </div>
        </div>
      ) : (
        /* ─── Preview ─────────────────────────────────────────── */
        <div>
          {/* File info bar */}
          <div style={styles.fileBar}>
            <FileSpreadsheet size={16} style={{ color: "var(--brand-green)" }} />
            <span style={styles.fileName}>{data.fileName}</span>
            <span style={styles.fileStats}>
              <CheckCircle2
                size={14}
                style={{ color: "var(--brand-green)", marginRight: 4 }}
              />
              {validCount} valid
            </span>
            {errorCount > 0 && (
              <span style={styles.fileErrors}>
                <AlertCircle
                  size={14}
                  style={{ color: "var(--brand-red)", marginRight: 4 }}
                />
                {errorCount} errors
              </span>
            )}
            <button
              onClick={() => onChange({ employees: [], fileName: "" })}
              style={styles.clearBtn}
            >
              <X size={14} />
              Clear
            </button>
          </div>

          {/* Preview table */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Designation</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Annual CTC
                  </th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Band</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((emp, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={{ ...styles.td, fontWeight: 500 }}>
                      {emp.name || "--"}
                    </td>
                    <td style={styles.td}>{emp.email || "--"}</td>
                    <td style={styles.td}>{emp.department || "--"}</td>
                    <td style={styles.td}>{emp.designation || "--"}</td>
                    <td
                      style={{
                        ...styles.td,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {emp.annualCtc > 0
                        ? `₹${emp.annualCtc.toLocaleString("en-IN")}`
                        : "--"}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span
                        style={{
                          ...styles.bandBadge,
                          background: bandColor[emp.band]?.bg,
                          color: bandColor[emp.band]?.color,
                        }}
                      >
                        {emp.band}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {emp.valid ? (
                        <CheckCircle2
                          size={16}
                          style={{ color: "var(--brand-green)" }}
                        />
                      ) : (
                        <span
                          style={styles.errorTooltip}
                          title={emp.errors.join(", ")}
                        >
                          <AlertCircle
                            size={16}
                            style={{ color: "var(--brand-red)" }}
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.employees.length > 5 && (
            <div style={styles.moreText}>
              ...and {data.employees.length - 5} more employees
            </div>
          )}

          {/* Validation errors */}
          {errorCount > 0 && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} style={{ color: "var(--brand-red)", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {errorCount} row{errorCount > 1 ? "s" : ""} with errors
                </div>
                {data.employees
                  .filter((e) => !e.valid)
                  .slice(0, 3)
                  .map((emp, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      Row {data.employees.indexOf(emp) + 1} ({emp.name || "unnamed"}): {emp.errors.join(", ")}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 28,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: "var(--rounded-lg)",
    background: "var(--brand-navy-alpha-8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--brand-navy)",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "var(--text-xl)",
    fontWeight: 600,
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
    maxWidth: 560,
  },
  skipBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
    background: "var(--color-background)",
    color: "var(--color-muted-foreground)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  skippedCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "20px 24px",
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--brand-amber-border)",
    background: "var(--brand-amber-light)",
  },
  undoBtn: {
    marginLeft: "auto",
    padding: "6px 14px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
    background: "var(--color-background)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  dropZone: {
    padding: "60px 40px",
    borderRadius: "var(--rounded-lg)",
    border: "2px dashed var(--color-border)",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  dropTitle: {
    fontSize: "var(--text-lg)",
    fontWeight: 600,
    marginTop: 16,
    color: "var(--color-foreground)",
  },
  dropHint: {
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
    marginTop: 8,
    maxWidth: 420,
    marginLeft: "auto",
    marginRight: "auto",
  },
  fileBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: "var(--rounded-md)",
    border: "1px solid var(--brand-green-border)",
    background: "var(--brand-green-light)",
    marginBottom: 16,
  },
  fileName: {
    fontWeight: 500,
    fontSize: "var(--text-sm)",
    flex: 1,
  },
  fileStats: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    color: "var(--brand-green)",
  },
  fileErrors: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    color: "var(--brand-red)",
  },
  clearBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-sm)",
    background: "var(--color-background)",
    fontSize: "var(--text-xs)",
    fontFamily: "inherit",
    cursor: "pointer",
    color: "var(--color-muted-foreground)",
  },
  tableWrap: {
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--color-border)",
    overflow: "hidden",
    marginBottom: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "var(--text-sm)",
  },
  th: {
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: "var(--text-xs)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    color: "var(--color-muted-foreground)",
    background: "var(--color-card)",
    borderBottom: "1px solid var(--color-border)",
    textAlign: "left" as const,
  },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid var(--color-border)",
  },
  bandBadge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
  },
  errorTooltip: {
    cursor: "help",
  },
  moreText: {
    textAlign: "center" as const,
    fontSize: "var(--text-xs)",
    color: "var(--color-muted-foreground)",
    padding: "8px 0",
  },
  errorBox: {
    display: "flex",
    gap: 12,
    padding: "14px 16px",
    borderRadius: "var(--rounded-md)",
    border: "1px solid var(--brand-red-border)",
    background: "var(--brand-red-light)",
    marginTop: 12,
    fontSize: "var(--text-sm)",
  },
};
