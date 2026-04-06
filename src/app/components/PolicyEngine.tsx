import React, { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import {
  ChevronDown, ChevronRight, Plus, Trash2, Upload, Shield, Settings2,
  ToggleLeft, ToggleRight, AlertCircle, X, Loader2, Save, Info, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import * as api from "../utils/api";
import { parseINR } from "../utils/helpers";
import { useSearch } from "../contexts/SearchContext";
import { FLEXI_BENEFIT_CATEGORIES, type SalaryBand } from "../types";
import { DEMO_BRACKETS } from "../utils/demoData";

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const cardBase: CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-lg)",
  overflow: "hidden",
  transition: "box-shadow 200ms ease-out, border-color 200ms ease-out",
};

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
  padding: "var(--space-6)", width: 480, maxWidth: "90vw",
  boxShadow: "var(--elevation-lg)",
};

/* ─── Recommended Thresholds (annual, INR) ──────────────────────────────────── */
const RECOMMENDED_THRESHOLDS: Record<string, number> = {
  "Food Allowance": 26400,
  "Children's Education Allowance": 1200,
  "Hostel Expenditure Allowance": 3600,
  "Books and Periodicals": 12000,
  "Professional Development Allowance": 24000,
  "Phone / Internet Allowance": 12000,
  "Health and Fitness Allowance": 15000,
  "Uniform Allowance": 12000,
  "Gift Allowance": 5000,
  "Business Travel Allowance": 36000,
  "Fuel Allowance": 21600,
  "Vehicle Maintenance Allowance": 18000,
  "Driver's Salary": 10800,
};

/* ─── Component ──────────────────────────────────────────────────────────────── */
export function PolicyEngine() {
  const { query } = useSearch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [brackets, setBrackets] = useState<SalaryBand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [savingBracketId, setSavingBracketId] = useState<string | null>(null);

  // Add bracket form
  const [newName, setNewName] = useState("");

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Always use demo data for client presentation
      setBrackets(DEMO_BRACKETS.map(b => ({ ...b, expanded: false })));
      setSetupRequired(false);
    } catch {
      setBrackets(DEMO_BRACKETS.map(b => ({ ...b, expanded: false })));
      setSetupRequired(false);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  // ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setDeleteTarget(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleExpand = (id: string) => {
    setBrackets(prev => prev.map(b => b.id === id ? { ...b, expanded: !b.expanded } : b));
  };

  const toggleBenefit = async (bracketId: string, idx: number, field: "enabled" | "billRequired" | "carryForward") => {
    const bracket = brackets.find(b => b.id === bracketId);
    if (!bracket) return;
    const updatedBenefits = [...bracket.benefits];
    updatedBenefits[idx] = { ...updatedBenefits[idx], [field]: !updatedBenefits[idx][field] };
    try {
      await api.updateBracket(bracketId, { benefits: updatedBenefits });
      setBrackets(prev => prev.map(b => {
        if (b.id !== bracketId) return b;
        return { ...b, benefits: updatedBenefits };
      }));
      toast.success("Bracket updated");
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    }
  };

  const updateCap = (bracketId: string, idx: number, value: string) => {
    setBrackets(prev => prev.map(b => {
      if (b.id !== bracketId) return b;
      const benefits = [...b.benefits];
      benefits[idx] = { ...benefits[idx], fixedCap: value };
      return { ...b, benefits };
    }));
  };

  const handleAddBracket = async () => {
    if (!newName.trim()) {
      toast.error("Please provide a bracket name");
      return;
    }
    setSaving(true);
    try {
      const benefits = FLEXI_BENEFIT_CATEGORIES.map(cat => ({
        name: cat.label, enabled: false, maxPercent: "0", fixedCap: "0",
        billRequired: cat.defaultBillRequired, carryForward: false, category: cat.key,
      }));
      const res = await api.createBracket({ name: newName, benefits });
      setBrackets(res.all?.map((b: any) => ({ ...b, expanded: false })) ?? [...brackets, { ...res.data, expanded: false }]);
      setShowAddModal(false); setNewName("");
      setSetupRequired(false);
      toast.success("Bracket created");
    } catch (e: any) { toast.error(e.message || "Operation failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteBracket(deleteTarget);
      setBrackets(res.data?.map((b: any) => ({ ...b, expanded: false })) ?? brackets.filter(b => b.id !== deleteTarget));
      setDeleteTarget(null);
      toast.success("Bracket deleted");
    } catch (e: any) { toast.error(e.message || "Failed to delete bracket"); }
    finally { setIsDeleting(false); }
  };

  const handleSave = async (bracketId: string) => {
    const bracket = brackets.find(b => b.id === bracketId);
    if (!bracket) return;
    setSavingBracketId(bracketId);
    try {
      await api.updateBracket(bracketId, { benefits: bracket.benefits });
      toast.success("Bracket updated");
    } catch (e: any) { toast.error(e.message || "Operation failed"); }
    finally { setSavingBracketId(null); }
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      const res = await api.savePolicy(brackets);
      setBrackets(res.data?.map((b: any) => ({ ...b, expanded: false })) ?? brackets);
      toast.success("Policy saved successfully");
    } catch (e: any) { toast.error(e.message || "Operation failed"); }
    finally { setIsSavingAll(false); }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) { toast.error("CSV must have a header row and at least one data row."); return; }
    const rows = lines.slice(1).map(line => {
      const [name] = line.split(",").map(s => s.trim());
      const benefits = FLEXI_BENEFIT_CATEGORIES.map(cat => ({
        name: cat.label, enabled: false, maxPercent: "0", fixedCap: "0",
        billRequired: cat.defaultBillRequired, carryForward: false, category: cat.key,
      }));
      return { name, benefits };
    });
    setSaving(true);
    try {
      const res = await api.bulkImportPolicy(rows);
      setBrackets(res.data?.map((b: any) => ({ ...b, expanded: false })) ?? brackets);
      setSetupRequired(false);
      toast.success(`Imported ${rows.length} brackets`);
    } catch (e: any) { toast.error(e.message || "Operation failed"); }
    finally { setSaving(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const filtered = brackets.filter(b => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return b.name?.toLowerCase().includes(q) ||
      b.benefits?.some(ben => ben.name?.toLowerCase().includes(q));
  });

  /* ─── Day-0 Empty State ────────────────────────────────────────────────────── */
  if (!loading && setupRequired && brackets.length === 0) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "var(--rounded-full)",
            backgroundColor: "var(--brand-accent-alpha-8)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-5)",
          }}>
            <Shield size={32} style={{ color: "var(--brand-navy)" }} />
          </div>
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            No salary brackets configured
          </h2>
          <p style={{ margin: "var(--space-2) 0 var(--space-6)", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Create your first salary bracket to define benefit plans for different employee levels.
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
            <button style={btnPrimary} onClick={() => setShowAddModal(true)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
              <Plus size={16} /> Add Bracket
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

  /* ─── Loading / Error ──────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid var(--color-border)",
          borderTopColor: "var(--brand-accent)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto var(--space-4)",
        }} />
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>Loading policy engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <AlertCircle size={40} style={{ color: "var(--brand-red)", marginBottom: "var(--space-3)" }} />
        <p style={{ color: "var(--brand-red)", fontSize: "var(--text-sm)" }}>{error}</p>
        <button style={{ ...btnGhost, marginTop: "var(--space-3)" }} onClick={fetchPolicy}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Policy Engine
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Manage benefit brackets and allocations
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button style={btnGhost} onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Import CSV
          </button>
          <button style={btnGhost} onClick={handleSaveAll} disabled={isSavingAll}>
            {isSavingAll ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Save size={16} />}
            {isSavingAll ? "Saving..." : "Save All"}
          </button>
          <button style={btnPrimary} onClick={() => setShowAddModal(true)}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
            <Plus size={16} /> Add Bracket
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSVImport} />
      </div>

      {/* Next Cycle Notice */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "var(--space-3) var(--space-4)",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "var(--rounded-md)",
          marginBottom: "var(--space-5)",
        }}
      >
        <Info size={18} style={{ color: "#2563eb", flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.6, color: "#1e40af" }}>
          Policy changes will take effect from the next payroll cycle. Existing claims in the current cycle will be processed under the previous policy.
        </span>
      </div>

      {/* Bracket Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)", padding: "var(--space-8)" }}>
            No brackets match your search.
          </p>
        )}
        {filtered.map(bracket => (
          <div key={bracket.id} style={cardBase}>
            {/* Bracket Header */}
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "var(--space-4) var(--space-5)", cursor: "pointer",
                backgroundColor: bracket.expanded ? "var(--color-background)" : "transparent",
                transition: "background-color 150ms",
              }}
              onClick={() => toggleExpand(bracket.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                {bracket.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <div>
                  <span style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
                    {bracket.name}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button style={{ ...btnGhost, padding: "var(--space-1) var(--space-2)" }}
                  onClick={e => { e.stopPropagation(); setDeleteTarget(bracket.id); }}
                  title="Delete bracket">
                  <Trash2 size={14} style={{ color: "var(--brand-red)" }} />
                </button>
              </div>
            </div>

            {/* Expanded Benefits */}
            {bracket.expanded && (
              <div style={{ borderTop: "1px solid var(--color-border)", padding: "var(--space-4) var(--space-5)" }}>
                {(!bracket.benefits || bracket.benefits.length === 0) ? (
                  <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)", textAlign: "center", padding: "var(--space-4)" }}>
                    No benefits configured for this bracket yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {/* Table Header */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "1.5fr 80px 120px 80px 80px",
                      gap: "var(--space-3)", padding: "0 0 var(--space-2)",
                      borderBottom: "1px solid var(--color-border)",
                      fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      <span>Benefit</span>
                      <span>Enabled</span>
                      <span>Fixed Cap</span>
                      <span>Bill Req.</span>
                      <span>Carry Fwd</span>
                    </div>
                    {bracket.benefits.map((ben, idx) => (
                      <div key={idx} style={{
                        display: "grid", gridTemplateColumns: "1.5fr 80px 120px 80px 80px",
                        gap: "var(--space-3)", alignItems: "center",
                      }}>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", fontWeight: 500 }}>
                          {ben.name}
                        </span>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          onClick={() => toggleBenefit(bracket.id, idx, "enabled")}>
                          {ben.enabled
                            ? <ToggleRight size={22} style={{ color: "var(--brand-green)" }} />
                            : <ToggleLeft size={22} style={{ color: "var(--color-muted-foreground)" }} />}
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
                          <input
                            style={{ ...inputStyle, width: 110 }}
                            value={ben.fixedCap}
                            onChange={e => updateCap(bracket.id, idx, e.target.value)}
                            placeholder="e.g. 12000"
                          />
                          {(() => {
                            const threshold = RECOMMENDED_THRESHOLDS[ben.name];
                            const capNum = parseFloat(String(ben.fixedCap).replace(/[^0-9.]/g, ""));
                            if (threshold && !isNaN(capNum) && capNum > threshold) {
                              return (
                                <span
                                  title={`Cap exceeds recommended threshold of \u20B9${threshold.toLocaleString("en-IN")}. Tax benefit may not apply beyond this limit.`}
                                  style={{ display: "flex", alignItems: "center", cursor: "help", flexShrink: 0 }}
                                >
                                  <AlertTriangle size={16} style={{ color: "#d97706" }} />
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          onClick={() => toggleBenefit(bracket.id, idx, "billRequired")}>
                          {ben.billRequired
                            ? <ToggleRight size={22} style={{ color: "var(--brand-green)" }} />
                            : <ToggleLeft size={22} style={{ color: "var(--color-muted-foreground)" }} />}
                        </button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          onClick={() => toggleBenefit(bracket.id, idx, "carryForward")}>
                          {ben.carryForward
                            ? <ToggleRight size={22} style={{ color: "var(--brand-green)" }} />
                            : <ToggleLeft size={22} style={{ color: "var(--color-muted-foreground)" }} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
                  <button style={btnPrimary} onClick={() => handleSave(bracket.id)} disabled={savingBracketId === bracket.id}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
                    {savingBracketId === bracket.id
                      ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                      : <Settings2 size={14} />}
                    {savingBracketId === bracket.id ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Bracket Modal */}
      {showAddModal && (
        <div style={overlay} onClick={() => setShowAddModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Add Bracket
              </h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowAddModal(false)}>
                <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Bracket Name
                </label>
                <input style={{ ...inputStyle, marginTop: "var(--space-1)" }} value={newName}
                  onChange={e => setNewName(e.target.value)} placeholder="e.g. Junior Band" />
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
                <button style={btnGhost} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button style={btnPrimary} onClick={handleAddBracket} disabled={saving}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
                  {saving ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Creating...</> : "Create Bracket"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={overlay} onClick={() => setDeleteTarget(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "var(--rounded-full)",
                backgroundColor: "var(--brand-red-light)", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <Trash2 size={20} style={{ color: "var(--brand-red)" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
                  Delete bracket {brackets.find(b => b.id === deleteTarget)?.name ?? ""}?
                </h3>
                <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button style={btnGhost} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button style={{
                ...btnPrimary, backgroundColor: "var(--brand-red)",
              }} onClick={handleDelete} disabled={isDeleting}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#c0392b"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-red)"}>
                {isDeleting ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Deleting...</> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
