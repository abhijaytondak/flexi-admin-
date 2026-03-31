import React, { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import {
  Plus, Upload, X, Users, AlertCircle,
  Mail, Phone, MapPin, Calendar, Trash2, Pencil, Save, Loader2, Check
} from "lucide-react";
import { toast } from "sonner";
import * as api from "../utils/api";
import { formatINR, parseINR, deriveBenefitPlan, deriveBracketLabel, getInitials } from "../utils/helpers";
import { useSearch } from "../contexts/SearchContext";
import { PLAN_META, AVATAR_COLORS, BENEFIT_PLANS, type Employee, type BenefitPlan, type Claim } from "../types";
import { InvitationManager } from "./employees/InvitationManager";
import { BandAssignmentView } from "./employees/BandAssignmentView";

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

const btnDanger: CSSProperties = {
  ...font, display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)", backgroundColor: "var(--brand-red)",
  color: "#fff", border: "none", borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)", fontWeight: 500, cursor: "pointer",
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

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <Loader2
      size={size}
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    />
  );
}

// Skeleton placeholder for profile loading
function ProfileSkeleton() {
  const bar = (w: string, h = 14): CSSProperties => ({
    width: w, height: h, borderRadius: 4,
    backgroundColor: "var(--color-border)", animation: "pulse 1.5s ease-in-out infinite",
  });
  return (
    <div style={{ padding: "var(--space-5)" }}>
      <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--color-border)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={bar("180px", 18)} />
          <div style={bar("140px")} />
          <div style={bar("80px")} />
        </div>
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ ...bar("100%", 12), marginBottom: 12 }} />
      ))}
    </div>
  );
}

export function EmployeeDirectory() {
  const { query } = useSearch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<"directory" | "bands" | "invitations">("directory");

  // Filters
  const [deptFilter, setDeptFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  // Modals / drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Edit mode in drawer
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState<Partial<Employee>>({});
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // CSV preview
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);

  // Add form
  const [formName, setFormName] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formCTC, setFormCTC] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  // ESC key handler for drawer and modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDeleteConfirm) { setShowDeleteConfirm(false); return; }
        if (csvPreview) { setCsvPreview(null); return; }
        if (showAddModal) { setShowAddModal(false); return; }
        if (selectedEmployee) { closeDrawer(); return; }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal, selectedEmployee, showDeleteConfirm, csvPreview]);

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const closeDrawer = () => {
    setSelectedEmployee(null);
    setEditing(false);
    setEditFields({});
    setShowDeleteConfirm(false);
  };

  // Open drawer & fetch full profile
  const openProfile = async (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditing(false);
    setEditFields({});
    setShowDeleteConfirm(false);
    if (emp.id) {
      setProfileLoading(true);
      try {
        const res = await api.getEmployee(emp.id);
        if (res.data) setSelectedEmployee(res.data);
      } catch {
        // fall back to list data already set
      } finally {
        setProfileLoading(false);
      }
    }
  };

  // ─── Add Employee ──────────────────────────────────────────────────────
  const validateAddForm = () => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) errs.name = "Name is required";
    if (!formDept.trim()) errs.dept = "Department is required";
    if (!formDesignation.trim()) errs.designation = "Designation is required";
    if (!formCTC.trim()) errs.ctc = "CTC is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearAddForm = () => {
    setFormName(""); setFormDept(""); setFormDesignation("");
    setFormCTC(""); setFormEmail(""); setFormErrors({});
  };

  const handleAddEmployee = async () => {
    if (!validateAddForm()) return;
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
      clearAddForm();
      setSetupRequired(false);
      toast.success("Employee added successfully");
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    } finally { setSaving(false); }
  };

  // ─── Delete Employee ───────────────────────────────────────────────────
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee?.id) return;
    setDeleting(true);
    try {
      await api.deleteEmployee(selectedEmployee.id);
      setEmployees(prev => prev.filter(e => e.id !== selectedEmployee.id));
      toast.success("Employee removed");
      closeDrawer();
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    } finally { setDeleting(false); }
  };

  // ─── Edit Employee ─────────────────────────────────────────────────────
  const startEditing = () => {
    if (!selectedEmployee) return;
    setEditing(true);
    setEditFields({
      name: selectedEmployee.name,
      department: selectedEmployee.department,
      designation: selectedEmployee.designation,
      email: selectedEmployee.email || "",
      phone: selectedEmployee.phone || "",
      location: selectedEmployee.location || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedEmployee?.id) return;
    setEditSaving(true);
    try {
      const res = await api.updateEmployee(selectedEmployee.id, editFields);
      const updated = { ...selectedEmployee, ...editFields, ...(res.data || {}) };
      setSelectedEmployee(updated as Employee);
      setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? (updated as Employee) : e));
      setEditing(false);
      toast.success("Employee updated");
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    } finally { setEditSaving(false); }
  };

  // ─── CSV Import ────────────────────────────────────────────────────────
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) {
      toast.error("CSV file must have a header row and at least one data row");
      return;
    }
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
        status: "active" as const, email: obj.email || "",
      };
    });
    // Show preview instead of importing directly
    setCsvPreview(rows);
    if (fileRef.current) fileRef.current.value = "";
  };

  const confirmCSVImport = async () => {
    if (!csvPreview || csvPreview.length === 0) return;
    setCsvImporting(true);
    try {
      const res = await api.bulkImportEmployees(csvPreview);
      const imported = res.data || [];
      setEmployees(prev => [...prev, ...imported]);
      setSetupRequired(false);
      toast.success(`Imported ${imported.length} employees`);
      setCsvPreview(null);
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    } finally { setCsvImporting(false); }
  };

  // Filter
  let filtered = employees;
  if (deptFilter) filtered = filtered.filter(e => e.department === deptFilter);
  if (planFilter) filtered = filtered.filter(e => e.benefitPlan === planFilter);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) ||
      e.id?.toLowerCase().includes(q) || e.benefitPlan?.toLowerCase().includes(q)
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

        {/* Add Modal (also needed for day-0) */}
        {showAddModal && renderAddModal()}
        {csvPreview && renderCSVPreview()}
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

  // ─── Render helpers ────────────────────────────────────────────────────

  function renderAddModal() {
    const derivedPlan = formCTC ? deriveBenefitPlan(Number(formCTC)) : null;
    return (
      <div style={overlay} onClick={() => { setShowAddModal(false); setFormErrors({}); }}>
        <div style={modalBox} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Add Employee
            </h3>
            <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => { setShowAddModal(false); setFormErrors({}); }}>
              <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Full Name *
              </label>
              <input style={{ ...inputStyle, marginTop: "var(--space-1)", borderColor: formErrors.name ? "var(--brand-red)" : undefined }} value={formName}
                onChange={e => setFormName(e.target.value)} placeholder="e.g. Priya Sharma" />
              {formErrors.name && <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--brand-red)" }}>{formErrors.name}</p>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Department *
                </label>
                <input style={{ ...inputStyle, marginTop: "var(--space-1)", borderColor: formErrors.dept ? "var(--brand-red)" : undefined }} value={formDept}
                  onChange={e => setFormDept(e.target.value)} placeholder="e.g. Engineering" />
                {formErrors.dept && <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--brand-red)" }}>{formErrors.dept}</p>}
              </div>
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Designation *
                </label>
                <input style={{ ...inputStyle, marginTop: "var(--space-1)", borderColor: formErrors.designation ? "var(--brand-red)" : undefined }} value={formDesignation}
                  onChange={e => setFormDesignation(e.target.value)} placeholder="e.g. Software Engineer" />
                {formErrors.designation && <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--brand-red)" }}>{formErrors.designation}</p>}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Annual CTC (INR) *
              </label>
              <input style={{ ...inputStyle, marginTop: "var(--space-1)", borderColor: formErrors.ctc ? "var(--brand-red)" : undefined }} value={formCTC}
                onChange={e => setFormCTC(e.target.value)} placeholder="e.g. 800000" type="number" />
              {formErrors.ctc && <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--brand-red)" }}>{formErrors.ctc}</p>}
              {derivedPlan && (
                <div style={{ marginTop: "var(--space-2)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>Auto-detected plan:</span>
                  <span style={planBadge(derivedPlan)}>{derivedPlan}</span>
                </div>
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
              <button style={btnGhost} onClick={() => { setShowAddModal(false); setFormErrors({}); }}>Cancel</button>
              <button
                style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}
                onClick={handleAddEmployee}
                disabled={saving}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"; }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}
              >
                {saving ? <><Spinner size={14} /> Adding...</> : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCSVPreview() {
    if (!csvPreview) return null;
    return (
      <div style={overlay} onClick={() => setCsvPreview(null)}>
        <div style={{ ...modalBox, width: 640 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Import Preview ({csvPreview.length} employees)
            </h3>
            <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setCsvPreview(null)}>
              <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
            </button>
          </div>
          <div style={{ maxHeight: 320, overflow: "auto", border: "1px solid var(--color-border)", borderRadius: "var(--rounded-md)", marginBottom: "var(--space-4)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--color-background)", position: "sticky", top: 0 }}>
                  {["Name", "Department", "Designation", "CTC", "Plan"].map(h => (
                    <th key={h} style={{ padding: "var(--space-2) var(--space-3)", textAlign: "left", fontWeight: 600, fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.slice(0, 20).map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "var(--space-2) var(--space-3)", color: "var(--color-foreground)" }}>{row.name}</td>
                    <td style={{ padding: "var(--space-2) var(--space-3)", color: "var(--color-foreground)" }}>{row.department}</td>
                    <td style={{ padding: "var(--space-2) var(--space-3)", color: "var(--color-muted-foreground)" }}>{row.designation}</td>
                    <td style={{ padding: "var(--space-2) var(--space-3)", color: "var(--color-foreground)" }}>{row.salary}</td>
                    <td style={{ padding: "var(--space-2) var(--space-3)" }}><span style={planBadge(row.benefitPlan)}>{row.benefitPlan}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {csvPreview.length > 20 && (
              <p style={{ textAlign: "center", padding: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                ...and {csvPreview.length - 20} more
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <button style={btnGhost} onClick={() => setCsvPreview(null)}>Cancel</button>
            <button
              style={{ ...btnPrimary, opacity: csvImporting ? 0.7 : 1 }}
              onClick={confirmCSVImport}
              disabled={csvImporting}
              onMouseEnter={e => { if (!csvImporting) e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"; }}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}
            >
              {csvImporting ? <><Spinner size={14} /> Importing...</> : <><Check size={16} /> Import {csvPreview.length} Employees</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderDeleteConfirm() {
    if (!showDeleteConfirm || !selectedEmployee) return null;
    return (
      <div style={overlay} onClick={() => setShowDeleteConfirm(false)}>
        <div style={{ ...modalBox, width: 420 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "var(--rounded-full)",
              backgroundColor: "rgba(231, 76, 60, 0.1)", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Trash2 size={20} style={{ color: "var(--brand-red)" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Remove {selectedEmployee.name}?
              </h3>
              <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                This will delete their data.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <button style={btnGhost} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button
              style={{ ...btnDanger, opacity: deleting ? 0.7 : 1 }}
              onClick={handleDeleteEmployee}
              disabled={deleting}
            >
              {deleting ? <><Spinner size={14} /> Removing...</> : <><Trash2 size={14} /> Remove</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderDrawer() {
    if (!selectedEmployee) return null;
    const emp = selectedEmployee;
    return (
      <>
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999 }}
          onClick={closeDrawer} />
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 480, maxWidth: "90vw",
          backgroundColor: "var(--color-card)", boxShadow: "var(--elevation-lg)",
          zIndex: 1000, display: "flex", flexDirection: "column", overflow: "auto",
        }}>
          {profileLoading ? <ProfileSkeleton /> : (
            <>
              {/* Header */}
              <div style={{
                padding: "var(--space-5)", borderBottom: "1px solid var(--color-border)",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flex: 1 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "var(--rounded-full)",
                    backgroundColor: emp.color || "var(--brand-navy)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--text-lg)", fontWeight: 700, flexShrink: 0,
                  }}>
                    {emp.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    {editing ? (
                      <input
                        style={{ ...inputStyle, fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: 4 }}
                        value={editFields.name || ""}
                        onChange={e => setEditFields(p => ({ ...p, name: e.target.value }))}
                      />
                    ) : (
                      <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
                        {emp.name}
                      </h3>
                    )}
                    {editing ? (
                      <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <input
                          style={{ ...inputStyle, fontSize: "var(--text-sm)" }}
                          value={editFields.designation || ""}
                          onChange={e => setEditFields(p => ({ ...p, designation: e.target.value }))}
                          placeholder="Designation"
                        />
                        <input
                          style={{ ...inputStyle, fontSize: "var(--text-sm)" }}
                          value={editFields.department || ""}
                          onChange={e => setEditFields(p => ({ ...p, department: e.target.value }))}
                          placeholder="Department"
                        />
                      </div>
                    ) : (
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                        {emp.designation} &middot; {emp.department}
                      </p>
                    )}
                    <div style={{ marginTop: "var(--space-2)" }}>
                      <span style={planBadge(emp.benefitPlan)}>{emp.benefitPlan}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  {!editing ? (
                    <button
                      style={{ ...btnGhost, padding: "var(--space-1) var(--space-2)" }}
                      onClick={startEditing}
                      title="Edit employee"
                    >
                      <Pencil size={14} />
                    </button>
                  ) : (
                    <button
                      style={{ ...btnPrimary, padding: "var(--space-1) var(--space-2)", opacity: editSaving ? 0.7 : 1 }}
                      onClick={handleSaveEdit}
                      disabled={editSaving}
                      title="Save changes"
                    >
                      {editSaving ? <Spinner size={14} /> : <Save size={14} />}
                    </button>
                  )}
                  <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={closeDrawer}>
                    <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "var(--space-5)", flex: 1 }}>
                {/* Contact Info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                  {([
                    { icon: Mail, label: "Email", field: "email" as const, value: emp.email || "N/A" },
                    { icon: Phone, label: "Phone", field: "phone" as const, value: emp.phone || "N/A" },
                    { icon: MapPin, label: "Location", field: "location" as const, value: emp.location || "N/A" },
                    { icon: Calendar, label: "Date of Joining", field: null, value: emp.dateOfJoining || "N/A" },
                  ] as const).map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
                      <item.icon size={14} style={{ color: "var(--color-muted-foreground)", marginTop: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>{item.label}</p>
                        {editing && item.field ? (
                          <input
                            style={{ ...inputStyle, padding: "2px var(--space-2)", fontSize: "var(--text-sm)" }}
                            value={(editFields as any)[item.field] || ""}
                            onChange={e => setEditFields(p => ({ ...p, [item.field!]: e.target.value }))}
                          />
                        ) : (
                          <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)" }}>{item.value}</p>
                        )}
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
                      { label: "Annual CTC", value: emp.salary },
                      { label: "Salary Bracket", value: emp.bracket },
                      { label: "Benefit Plan", value: emp.benefitPlan },
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

                {/* Benefit Utilization */}
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
                    const limit = parseINR(emp.salary) * 0.03;
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
                <div style={{ marginBottom: "var(--space-6)" }}>
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

                {/* Delete Button */}
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
                  <button
                    style={btnDanger}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={14} /> Remove Employee
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Delete confirmation dialog */}
        {renderDeleteConfirm()}
      </>
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

      {/* Tab Navigation */}
      <div style={{
        display: "flex", gap: 0, marginBottom: "var(--space-5)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        {([
          { key: "directory" as const, label: "Directory" },
          { key: "bands" as const, label: "Band Assignment" },
          { key: "invitations" as const, label: "Invitations" },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...font,
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: activeTab === tab.key ? 600 : 500,
              color: activeTab === tab.key ? "var(--brand-accent)" : "var(--color-muted-foreground)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--brand-accent)" : "2px solid transparent",
              cursor: "pointer",
              transition: "color 150ms, border-color 150ms",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "directory" && (
        <>
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
                  onClick={() => openProfile(emp)}
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
        </>
      )}

      {activeTab === "bands" && (
        <BandAssignmentView employees={employees} onRefresh={fetchData} />
      )}

      {activeTab === "invitations" && (
        <InvitationManager employees={employees} onRefresh={fetchData} />
      )}

      {/* Employee Profile Drawer */}
      {renderDrawer()}

      {/* Add Employee Modal */}
      {showAddModal && renderAddModal()}

      {/* CSV Preview Modal */}
      {csvPreview && renderCSVPreview()}
    </div>
  );
}
