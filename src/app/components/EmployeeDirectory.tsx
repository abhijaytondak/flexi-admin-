import React, { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import {
  Plus, Upload, X, Users, AlertCircle, ChevronRight, Briefcase,
  Mail, Phone, MapPin, Calendar
} from "lucide-react";
import * as api from "../utils/api";
import { formatINR, parseINR, deriveBenefitPlan, deriveBracketLabel, getInitials } from "../utils/helpers";
import { useSearch } from "../contexts/SearchContext";
import { PLAN_META, AVATAR_COLORS, BENEFIT_PLANS, type Employee, type BenefitPlan, type Claim } from "../types";

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const btnPrimary: CSSProperties = {
  ...font, display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)", backgroundColor: "var(--brand-accent)",
  color: "#fff", border: "none", borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)", fontWeight: 500, cursor: "pointer",
};

const btnGhost: CSSProperties = {
  ...font, display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-3)", backgroundColor: "transparent",
  color: "var(--color-muted-foreground)", border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)", fontSize: "var(--text-sm)", fontWeight: 500, cursor: "pointer",
};

const inputStyle: CSSProperties = {
  ...font, width: "100%", padding: "var(--space-2) var(--space-3)",
  border: "1px solid var(--color-border)", borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)", backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)", outline: "none",
};

const overlay: CSSProperties = {
  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
};

const modalBox: CSSProperties = {
  ...font, backgroundColor: "var(--color-card)", borderRadius: "var(--rounded-lg)",
  padding: "var(--space-6)", width: 500, maxWidth: "90vw",
  boxShadow: "var(--elevation-lg)",
};

function planBadge(plan: BenefitPlan): CSSProperties {
  const m = PLAN_META[plan];
  return {
    display: "inline-flex", padding: "2px 10px", borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)", fontWeight: 600, color: m.color,
    backgroundColor: m.bgColor, border: `1px solid ${m.borderColor}`,
  };
}

function statusDot(status: string): CSSProperties {
  const colors: Record<string, string> = {
    active: "var(--brand-green)", "on-leave": "var(--brand-amber)",
    inactive: "var(--color-muted-foreground)", invited: "var(--brand-navy)",
  };
  return {
    width: 8, height: 8, borderRadius: "50%",
    backgroundColor: colors[status] || "var(--color-muted-foreground)",
    flexShrink: 0,
  };
}

export function EmployeeDirectory() {
  const { query } = useSearch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);

  // Filters
  const [deptFilter, setDeptFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form
  const [formName, setFormName] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formCTC, setFormCTC] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [empRes, claimRes] = await Promise.all([api.getEmployees(), api.getClaims()]);
      if (empRes.setupRequired) { setSetupRequired(true); setEmployees([]); }
      else { setSetupRequired(false); setEmployees(empRes.data || []); }
      setClaims(claimRes.data || []);
    } catch (e: any) { setError(e.message || "Failed to load employees"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const handleAddEmployee = async () => {
    if (!formName.trim() || !formDept.trim() || !formCTC.trim()) return;
    setSaving(true);
    const ctcNum = parseINR(formCTC);
    const plan = deriveBenefitPlan(ctcNum);
    const bracket = deriveBracketLabel(ctcNum);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    try {
      const res = await api.createEmployee({
        name: formName, department: formDept, designation: formDesignation,
        salary: formatINR(ctcNum), bracket, benefitPlan: plan,
        initials: getInitials(formName), color, status: "active",
        email: formEmail,
      });
      setEmployees(prev => [...prev, res.data]);
      setShowAddModal(false);
      setFormName(""); setFormDept(""); setFormDesignation(""); setFormCTC(""); setFormEmail("");
      setSetupRequired(false);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(",").map(s => s.trim());
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i]; });
      const ctcNum = parseINR(obj.salary || obj.ctc || "0");
      return {
        name: obj.name, department: obj.department || obj.dept,
        designation: obj.designation || obj.title || "",
        salary: formatINR(ctcNum), bracket: deriveBracketLabel(ctcNum),
        benefitPlan: deriveBenefitPlan(ctcNum),
        initials: getInitials(obj.name || ""), color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        status: "active", email: obj.email || "",
      };
    });
    try {
      const res = await api.bulkImportEmployees(rows);
      setEmployees(prev => [...prev, ...(res.data || [])]);
      setSetupRequired(false);
    } catch (e: any) { setError(e.message); }
    finally { if (fileRef.current) fileRef.current.value = ""; }
  };

  // Filter
  let filtered = employees;
  if (deptFilter) filtered = filtered.filter(e => e.department === deptFilter);
  if (planFilter) filtered = filtered.filter(e => e.benefitPlan === planFilter);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q)
    );
  }

  // Employee claims for drawer
  const empClaims = selectedEmployee
    ? claims.filter(c => c.employeeId === selectedEmployee.id || c.employeeName === selectedEmployee.name)
    : [];

  /* Day-0 */
  if (!loading && setupRequired && employees.length === 0) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "var(--rounded-full)",
            backgroundColor: "var(--brand-accent-alpha-8)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-5)",
          }}>
            <Users size={32} style={{ color: "var(--brand-navy)" }} />
          </div>
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            No employees yet
          </h2>
          <p style={{ margin: "var(--space-2) 0 var(--space-6)", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Add your first employee or import from a CSV file to get started.
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
            <button style={btnPrimary} onClick={() => setShowAddModal(true)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
              <Plus size={16} /> Add Employee
            </button>
            <button style={btnGhost} onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Import CSV
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSVImport} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid var(--color-border)",
          borderTopColor: "var(--brand-accent)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto var(--space-4)",
        }} />
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>Loading employees...</p>
      </div>
    );
  }

  if (error && employees.length === 0) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <AlertCircle size={40} style={{ color: "var(--brand-red)", marginBottom: "var(--space-3)" }} />
        <p style={{ color: "var(--brand-red)", fontSize: "var(--text-sm)" }}>{error}</p>
        <button style={{ ...btnGhost, marginTop: "var(--space-3)" }} onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Employee Directory
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            {filtered.length} employee{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button style={btnGhost} onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Import CSV
          </button>
          <button style={btnPrimary} onClick={() => setShowAddModal(true)}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
            <Plus size={16} /> Add Employee
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSVImport} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <select style={{ ...inputStyle, width: 200 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select style={{ ...inputStyle, width: 160 }} value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          <option value="">All Plans</option>
          {BENEFIT_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-lg)", overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2.5fr 1.2fr 1.2fr 1fr 0.8fr 0.6fr",
          gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-background)",
          fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          <span>Employee</span>
          <span>Department</span>
          <span>Designation</span>
          <span>CTC</span>
          <span>Plan</span>
          <span>Status</span>
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>
            No employees match your filters.
          </p>
        ) : (
          filtered.map((emp, idx) => (
            <div key={emp.id || idx}
              onClick={() => setSelectedEmployee(emp)}
              style={{
                display: "grid", gridTemplateColumns: "2.5fr 1.2fr 1.2fr 1fr 0.8fr 0.6fr",
                gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)",
                borderBottom: idx < filtered.length - 1 ? "1px solid var(--color-border)" : "none",
                cursor: "pointer", transition: "background-color 150ms",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-background)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--rounded-full)",
                  backgroundColor: emp.color || "var(--brand-navy)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-xs)", fontWeight: 600, flexShrink: 0,
                }}>
                  {emp.initials || emp.name?.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)" }}>
                  {emp.name}
                </span>
              </div>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", display: "flex", alignItems: "center" }}>
                {emp.department}
              </span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", display: "flex", alignItems: "center" }}>
                {emp.designation}
              </span>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)", display: "flex", alignItems: "center" }}>
                {emp.salary}
              </span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={planBadge(emp.benefitPlan)}>{emp.benefitPlan}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <div style={statusDot(emp.status)} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", textTransform: "capitalize" }}>
                  {emp.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Employee Profile Drawer */}
      {selectedEmployee && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999 }}
            onClick={() => setSelectedEmployee(null)} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 480, maxWidth: "90vw",
            backgroundColor: "var(--color-card)", boxShadow: "var(--elevation-lg)",
            zIndex: 1000, display: "flex", flexDirection: "column", overflow: "auto",
          }}>
            {/* Header */}
            <div style={{
              padding: "var(--space-5)", borderBottom: "1px solid var(--color-border)",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "var(--rounded-full)",
                  backgroundColor: selectedEmployee.color || "var(--brand-navy)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-lg)", fontWeight: 700,
                }}>
                  {selectedEmployee.initials}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
                    {selectedEmployee.name}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                    {selectedEmployee.designation} &middot; {selectedEmployee.department}
                  </p>
                  <div style={{ marginTop: "var(--space-2)" }}>
                    <span style={planBadge(selectedEmployee.benefitPlan)}>{selectedEmployee.benefitPlan}</span>
                  </div>
                </div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setSelectedEmployee(null)}>
                <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "var(--space-5)", flex: 1 }}>
              {/* Contact Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                {[
                  { icon: Mail, label: "Email", value: selectedEmployee.email || "N/A" },
                  { icon: Phone, label: "Phone", value: selectedEmployee.phone || "N/A" },
                  { icon: MapPin, label: "Location", value: selectedEmployee.location || "N/A" },
                  { icon: Calendar, label: "Date of Joining", value: selectedEmployee.dateOfJoining || "N/A" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
                    <item.icon size={14} style={{ color: "var(--color-muted-foreground)", marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Salary Breakdown */}
              <div style={{ marginBottom: "var(--space-6)" }}>
                <h4 style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                  Salary Breakdown
                </h4>
                <div style={{
                  padding: "var(--space-4)", backgroundColor: "var(--color-background)",
                  borderRadius: "var(--rounded-md)", border: "1px solid var(--color-border)",
                }}>
                  {[
                    { label: "Annual CTC", value: selectedEmployee.salary },
                    { label: "Salary Bracket", value: selectedEmployee.bracket },
                    { label: "Benefit Plan", value: selectedEmployee.benefitPlan },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "var(--space-2) 0",
                    }}>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>{item.label}</span>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefit Limits (simulated progress bars) */}
              <div style={{ marginBottom: "var(--space-6)" }}>
                <h4 style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                  Benefit Utilization
                </h4>
                {["Food", "Fuel", "Communication", "LTA", "NPS"].map(cat => {
                  const catClaims = empClaims.filter(c =>
                    (c.category?.toLowerCase().includes(cat.toLowerCase()) ||
                     c.benefitType?.toLowerCase().includes(cat.toLowerCase())) &&
                    c.status === "approved"
                  );
                  const used = catClaims.reduce((s, c) => s + parseINR(c.claimAmount), 0);
                  const limit = parseINR(selectedEmployee.salary) * 0.03; // Approx 3% per category
                  const pct = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: "var(--space-3)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-foreground)" }}>{cat}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                          {formatINR(used)} / {formatINR(Math.round(limit))}
                        </span>
                      </div>
                      <div style={{
                        height: 6, backgroundColor: "var(--color-border)", borderRadius: 3, overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${pct}%`, height: "100%", borderRadius: 3,
                          backgroundColor: pct > 80 ? "var(--brand-red)" : pct > 50 ? "var(--brand-amber)" : "var(--brand-green)",
                          transition: "width 300ms ease-out",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Claims */}
              <div>
                <h4 style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                  Recent Claims
                </h4>
                {empClaims.length === 0 ? (
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "center", padding: "var(--space-4)" }}>
                    No claims found for this employee.
                  </p>
                ) : (
                  empClaims.slice(0, 5).map((c, idx) => (
                    <div key={c.id || idx} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "var(--space-2) 0",
                      borderBottom: idx < Math.min(empClaims.length, 5) - 1 ? "1px solid var(--color-border)" : "none",
                    }}>
                      <div>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)" }}>
                          {c.benefitType || c.category}
                        </span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", marginLeft: "var(--space-2)" }}>
                          {c.dateSubmitted}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                          {c.claimAmount}
                        </span>
                        <span style={{
                          fontSize: "var(--text-xs)", fontWeight: 500, textTransform: "capitalize",
                          color: c.status === "approved" ? "var(--brand-green)" : c.status === "rejected" ? "var(--brand-red)" : "var(--brand-amber)",
                        }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={overlay} onClick={() => setShowAddModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Add Employee
              </h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowAddModal(false)}>
                <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Full Name *
                </label>
                <input style={{ ...inputStyle, marginTop: "var(--space-1)" }} value={formName}
                  onChange={e => setFormName(e.target.value)} placeholder="e.g. Priya Sharma" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Department *
                  </label>
                  <input style={{ ...inputStyle, marginTop: "var(--space-1)" }} value={formDept}
                    onChange={e => setFormDept(e.target.value)} placeholder="e.g. Engineering" />
                </div>
                <div>
                  <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Designation
                  </label>
                  <input style={{ ...inputStyle, marginTop: "var(--space-1)" }} value={formDesignation}
                    onChange={e => setFormDesignation(e.target.value)} placeholder="e.g. Software Engineer" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Annual CTC (INR) *
                </label>
                <input style={{ ...inputStyle, marginTop: "var(--space-1)" }} value={formCTC}
                  onChange={e => setFormCTC(e.target.value)} placeholder="e.g. 800000" type="number" />
                {formCTC && (
                  <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                    Auto-detected plan: <strong style={{ color: PLAN_META[deriveBenefitPlan(Number(formCTC))].color }}>
                      {deriveBenefitPlan(Number(formCTC))}
                    </strong>
                  </p>
                )}
              </div>
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Email
                </label>
                <input style={{ ...inputStyle, marginTop: "var(--space-1)" }} value={formEmail}
                  onChange={e => setFormEmail(e.target.value)} placeholder="e.g. priya@acme.com" type="email" />
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
                <button style={btnGhost} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button style={btnPrimary} onClick={handleAddEmployee} disabled={saving || !formName.trim() || !formDept.trim() || !formCTC.trim()}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
                  {saving ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
