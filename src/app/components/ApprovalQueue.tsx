import React, { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import {
  Check, X, ChevronDown, ChevronRight, Filter, Upload, AlertCircle,
  Clock, CheckCircle, XCircle, FileText, Loader2,
  Download, Eye
} from "lucide-react";
import { toast } from "sonner";
import * as api from "../utils/api";
import { parseINR } from "../utils/helpers";
import { useSearch } from "../contexts/SearchContext";
import { type Claim, type ClaimStatus } from "../types";
import { DEMO_CLAIMS } from "../utils/demoData";

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

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"] as const;
const CATEGORIES = ["All", "Food", "Fuel", "Phone/Internet", "Education", "Health", "Travel", "Other"] as const;

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  pending: { color: "var(--brand-amber)", bg: "var(--brand-amber-light)", icon: Clock },
  submitted: { color: "var(--brand-amber)", bg: "var(--brand-amber-light)", icon: Clock },
  claimed: { color: "#6B7A8D", bg: "#F0F2F5", icon: FileText },
  invoice_pending: { color: "#6B7A8D", bg: "#F0F2F5", icon: FileText },
  approved: { color: "var(--brand-green)", bg: "var(--brand-green-light)", icon: CheckCircle },
  rejected: { color: "var(--brand-red)", bg: "var(--brand-red-light)", icon: XCircle },
};

const APPROVAL_TAG_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  auto: { label: "Auto", color: "#27AE60", bg: "#E8F8EF" },
  manual: { label: "Manual", color: "#E67E22", bg: "#FEF5E7" },
  escalated: { label: "Escalated", color: "#E74C3C", bg: "#FDEDEC" },
};

function statusBadge(status: string): CSSProperties {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 10px", borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)", fontWeight: 600, color: cfg.color, backgroundColor: cfg.bg,
  };
}

/* Spinner component for loading states */
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <Loader2
      size={size}
      style={{ animation: "spin 0.8s linear infinite" }}
    />
  );
}

/* Status timeline component */
function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: "submitted", label: "Submitted" },
    { key: "review", label: "Under Review" },
    { key: "final", label: status === "rejected" ? "Rejected" : "Approved" },
  ];

  const activeIndex =
    status === "approved" || status === "rejected" ? 2 :
    status === "pending" || status === "submitted" || status === "claimed" || status === "invoice_pending" ? 1 : 0;

  return (
    <div style={{ marginBottom: "var(--space-5)" }}>
      <p style={{
        margin: "0 0 var(--space-3)", fontSize: "var(--text-xs)", fontWeight: 600,
        color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        Status Timeline
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {steps.map((step, i) => {
          const isActive = i <= activeIndex;
          const isFinal = i === 2 && status === "rejected";
          const dotColor = isFinal ? "var(--brand-red)" : isActive ? "var(--brand-green)" : "var(--color-border)";
          return (
            <React.Fragment key={step.key}>
              {i > 0 && (
                <div style={{
                  flex: 1, height: 2,
                  backgroundColor: isActive ? dotColor : "var(--color-border)",
                }} />
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  backgroundColor: isActive ? dotColor : "var(--color-background)",
                  border: `2px solid ${dotColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isActive && (
                    i === 2 && status === "rejected"
                      ? <X size={12} style={{ color: "#fff" }} />
                      : <Check size={12} style={{ color: "#fff" }} />
                  )}
                </div>
                <span style={{
                  fontSize: "var(--text-xs)", fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                  whiteSpace: "nowrap",
                }}>
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function ApprovalQueue() {
  const { query } = useSearch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deptFilter, setDeptFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  // Detail drawer
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection dialog
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [returnToLimit, setReturnToLimit] = useState(true);
  const [rejectLoading, setRejectLoading] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkReturnToLimit, setBulkReturnToLimit] = useState(true);

  // Employee accordion
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  // Deep linking flag
  const [deepLinkProcessed, setDeepLinkProcessed] = useState(false);

  const fetchClaims = useCallback(async () => {
    setLoading(true); setError("");
    try {
      // Always use demo data for client presentation
      setClaims(DEMO_CLAIMS);
      setSetupRequired(false);
    } catch {
      setClaims(DEMO_CLAIMS);
      setSetupRequired(false);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  // Deep linking: auto-open claim from URL query param ?claim=CLM-1024
  useEffect(() => {
    if (deepLinkProcessed || loading || claims.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const claimId = params.get("claim");
    if (claimId) {
      const found = claims.find(c => c.id === claimId);
      if (found) {
        setSelectedClaim(found);
        setActionNote("");
      }
    }
    setDeepLinkProcessed(true);
  }, [claims, loading, deepLinkProcessed]);

  // ESC key handler: close drawer and rejection dialog
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showBulkRejectDialog) {
          setShowBulkRejectDialog(false);
          setBulkRejectReason("");
        } else if (showRejectDialog) {
          setShowRejectDialog(false);
          setRejectReason("");
          setReturnToLimit(true);
        } else if (selectedClaim) {
          setSelectedClaim(null);
          setActionNote("");
        }
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showRejectDialog, selectedClaim]);

  // Approve action (single claim from drawer) — local state only for demo
  const handleApprove = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network
    setClaims(prev => prev.map(c => c.id === selectedClaim.id ? { ...c, status: "approved" as ClaimStatus, actionNote: "Approved by Admin", actionTimestamp: new Date().toISOString(), actionBy: "Amanda Johnson" } : c));
    toast.success("Claim approved successfully");
    setSelectedClaim(null);
    setActionLoading(false);
  };

  // Reject action: open rejection dialog
  const openRejectDialog = () => {
    setRejectReason("");
    setReturnToLimit(true);
    setShowRejectDialog(true);
  };

  // Confirm rejection with reason — local state only for demo
  const confirmReject = async () => {
    if (!selectedClaim) return;
    if (!rejectReason) return;
    setRejectLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const fullNote = `${rejectReason}${returnToLimit ? " [Amount returned to employee limit]" : ""}`;
    setClaims(prev => prev.map(c => c.id === selectedClaim.id ? { ...c, status: "rejected" as ClaimStatus, actionNote: fullNote, actionTimestamp: new Date().toISOString(), actionBy: "Amanda Johnson" } : c));
    toast.success("Claim rejected");
    setShowRejectDialog(false);
    setRejectReason("");
    setReturnToLimit(true);
    setSelectedClaim(null); setActionNote("");
    setRejectLoading(false);
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
      return obj;
    });
    try {
      const res = await api.bulkImportClaims(rows);
      const imported = res.data || [];
      setClaims(prev => [...prev, ...imported]);
      setSetupRequired(false);
      toast.success(`Imported ${imported.length} claims`);
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
    finally { if (fileRef.current) fileRef.current.value = ""; }
  };

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (filteredClaims: Claim[]) => {
    if (selectedIds.size === filteredClaims.length && filteredClaims.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClaims.map(c => c.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkApprove = async () => {
    const ids = Array.from(selectedIds);
    const actionable = ids.filter(id => {
      const c = claims.find(cl => cl.id === id);
      return c && (c.status === "pending" || c.status === "submitted" || c.status === "claimed" || c.status === "invoice_pending");
    });
    if (actionable.length === 0) {
      toast.error("No pending claims selected to approve");
      return;
    }
    setBulkLoading(true);
    const toastId = toast.loading(`Approving ${actionable.length} claims...`);
    await new Promise(r => setTimeout(r, 800));
    setClaims(prev => prev.map(c => actionable.includes(c.id) ? { ...c, status: "approved" as ClaimStatus, actionNote: "Bulk approved by Admin", actionTimestamp: new Date().toISOString(), actionBy: "Amanda Johnson" } : c));
    toast.success(`${actionable.length} claims approved`, { id: toastId });
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const openBulkRejectDialog = () => {
    const ids = Array.from(selectedIds);
    const actionable = ids.filter(id => {
      const c = claims.find(cl => cl.id === id);
      return c && (c.status === "pending" || c.status === "submitted" || c.status === "claimed" || c.status === "invoice_pending");
    });
    if (actionable.length === 0) {
      toast.error("No pending claims selected");
      return;
    }
    setBulkRejectReason("");
    setBulkReturnToLimit(true);
    setShowBulkRejectDialog(true);
  };

  const confirmBulkReject = async () => {
    if (bulkRejectReason.trim().length < 10) return;
    const ids = Array.from(selectedIds);
    const actionable = ids.filter(id => {
      const c = claims.find(cl => cl.id === id);
      return c && (c.status === "pending" || c.status === "submitted" || c.status === "claimed" || c.status === "invoice_pending");
    });
    if (actionable.length === 0) return;
    setBulkLoading(true);
    const fullNote = `${bulkRejectReason}${bulkReturnToLimit ? " [Amount returned to employee limit]" : ""}`;
    const toastId = toast.loading(`Rejecting ${actionable.length} claims...`);
    await new Promise(r => setTimeout(r, 800));
    setClaims(prev => prev.map(c => actionable.includes(c.id) ? { ...c, status: "rejected" as ClaimStatus, actionNote: fullNote, actionTimestamp: new Date().toISOString(), actionBy: "Amanda Johnson" } : c));
    toast.success(`${actionable.length} claims rejected`, { id: toastId });
    setSelectedIds(new Set());
    setShowBulkRejectDialog(false);
    setBulkRejectReason("");
    setBulkLoading(false);
  };

  // Filter logic
  const departments = Array.from(new Set(claims.map(c => c.department).filter(Boolean)));
  let filtered = claims;

  if (statusFilter !== "All") {
    filtered = filtered.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());
  }
  if (categoryFilter !== "All") {
    filtered = filtered.filter(c =>
      c.category?.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      c.benefitType?.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }
  if (deptFilter) filtered = filtered.filter(c => c.department === deptFilter);
  if (dateFrom) filtered = filtered.filter(c => c.dateSubmitted >= dateFrom);
  if (dateTo) filtered = filtered.filter(c => c.dateSubmitted <= dateTo);
  if (amountMin) filtered = filtered.filter(c => parseINR(c.claimAmount) >= Number(amountMin));
  if (amountMax) filtered = filtered.filter(c => parseINR(c.claimAmount) <= Number(amountMax));
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(c =>
      c.employeeName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q) ||
      c.benefitType?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.claimAmount?.toString().toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  }

  /* Day-0 */
  if (!loading && setupRequired && claims.length === 0) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "var(--rounded-full)",
            backgroundColor: "var(--brand-accent-alpha-8)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-5)",
          }}>
            <FileText size={32} style={{ color: "var(--brand-navy)" }} />
          </div>
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            No claims to review
          </h2>
          <p style={{ margin: "var(--space-2) 0 var(--space-6)", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Claims will appear here once employees start submitting benefit reimbursement requests.
          </p>
          <button style={btnGhost} onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Import Claims CSV
          </button>
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
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>Loading claims...</p>
      </div>
    );
  }

  if (error && claims.length === 0) {
    return (
      <div style={{ ...font, padding: "var(--space-8)", textAlign: "center" }}>
        <AlertCircle size={40} style={{ color: "var(--brand-red)", marginBottom: "var(--space-3)" }} />
        <p style={{ color: "var(--brand-red)", fontSize: "var(--text-sm)" }}>{error}</p>
        <button style={{ ...btnGhost, marginTop: "var(--space-3)" }} onClick={fetchClaims}>Retry</button>
      </div>
    );
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div style={{ ...font, padding: "var(--space-6)", position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Approval Queue
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            {filtered.length} claim{filtered.length !== 1 ? "s" : ""} to review
          </p>
        </div>
        <button style={btnGhost} onClick={() => fileRef.current?.click()}>
          <Upload size={16} /> Import CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSVImport} />
      </div>

      {/* Submission Deadline Banner */}
      {(() => {
        const deadline = new Date("2026-03-31");
        const now = new Date();
        const diffMs = deadline.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const isUrgent = daysRemaining <= 7;
        return (
          <div style={{
            display: "flex", alignItems: "center", gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)", marginBottom: "var(--space-4)",
            backgroundColor: isUrgent ? "#FFF3E0" : "#FFF8E1",
            border: `1px solid ${isUrgent ? "#FFB74D" : "#FFE082"}`,
            borderRadius: "var(--rounded-md)",
            animation: isUrgent ? "deadlinePulse 2s ease-in-out infinite" : "none",
          }}>
            <style>{`@keyframes deadlinePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }`}</style>
            <span style={{ fontSize: "var(--text-base)" }}>&#9200;</span>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#E65100" }}>
              Submission deadline: March 31, 2026 — {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
            </span>
          </div>
        );
      })()}

      {/* Status Pills */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            ...font, padding: "var(--space-1) var(--space-4)",
            borderRadius: "var(--rounded-full)", fontSize: "var(--text-sm)", fontWeight: 500,
            border: "1px solid var(--color-border)", cursor: "pointer",
            backgroundColor: statusFilter === s ? "var(--brand-accent)" : "transparent",
            color: statusFilter === s ? "#fff" : "var(--color-muted-foreground)",
            transition: "all 150ms",
          }}>
            {s}
          </button>
        ))}
        <div style={{ width: 1, backgroundColor: "var(--color-border)", margin: "0 var(--space-2)" }} />
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)} style={{
            ...font, padding: "var(--space-1) var(--space-3)",
            borderRadius: "var(--rounded-full)", fontSize: "var(--text-xs)", fontWeight: 500,
            border: "1px solid var(--color-border)", cursor: "pointer",
            backgroundColor: categoryFilter === c ? "var(--brand-green)" : "transparent",
            color: categoryFilter === c ? "#fff" : "var(--color-muted-foreground)",
            transition: "all 150ms",
          }}>
            {c}
          </button>
        ))}
        <button style={{ ...btnGhost, padding: "var(--space-1) var(--space-3)" }}
          onClick={() => setShowAdvanced(!showAdvanced)}>
          <Filter size={14} /> {showAdvanced ? "Hide" : "More"}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "var(--space-3)", marginBottom: "var(--space-4)",
          padding: "var(--space-4)", backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border)", borderRadius: "var(--rounded-md)",
        }}>
          <div>
            <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)" }}>Department</label>
            <select style={{ ...inputStyle, marginTop: 4 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)" }}>From Date</label>
            <input type="date" style={{ ...inputStyle, marginTop: 4 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)" }}>To Date</label>
            <input type="date" style={{ ...inputStyle, marginTop: 4 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)" }}>Min Amount</label>
            <input type="number" style={{ ...inputStyle, marginTop: 4 }} value={amountMin} onChange={e => setAmountMin(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)" }}>Max Amount</label>
            <input type="number" style={{ ...inputStyle, marginTop: 4 }} value={amountMax} onChange={e => setAmountMax(e.target.value)} placeholder="No limit" />
          </div>
        </div>
      )}

      {/* Claims — Grouped by Employee */}
      {(() => {
        // Group filtered claims by employeeId
        const grouped: Record<string, Claim[]> = {};
        filtered.forEach(c => {
          const key = c.employeeId || c.employeeName;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(c);
        });
        const employeeKeys = Object.keys(grouped);

        if (filtered.length === 0) {
          return (
            <p style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>
              No claims match your filters.
            </p>
          );
        }

        const toggleEmployee = (key: string) => {
          setExpandedEmployees(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
          });
        };

        const toggleSelectGroup = (groupClaims: Claim[]) => {
          const ids = groupClaims.map(c => c.id);
          const allGroupSelected = ids.every(id => selectedIds.has(id));
          setSelectedIds(prev => {
            const next = new Set(prev);
            if (allGroupSelected) { ids.forEach(id => next.delete(id)); }
            else { ids.forEach(id => next.add(id)); }
            return next;
          });
        };

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {employeeKeys.map(empKey => {
              const groupClaims = grouped[empKey];
              const first = groupClaims[0];
              const isExpanded = expandedEmployees.has(empKey);
              const pendingCount = groupClaims.filter(c => c.status === "pending" || c.status === "submitted" || c.status === "claimed" || c.status === "invoice_pending").length;
              const totalAmount = groupClaims.reduce((sum, c) => sum + parseINR(c.claimAmount), 0);
              const allGroupSelected = groupClaims.every(c => selectedIds.has(c.id));

              return (
                <div key={empKey} style={{
                  backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)",
                  borderRadius: "var(--rounded-lg)", overflow: "hidden",
                }}>
                  {/* Employee Accordion Header */}
                  <div
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "var(--space-3) var(--space-4)", cursor: "pointer",
                      transition: "background-color 150ms",
                    }}
                    onClick={() => toggleEmployee(empKey)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-background)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <span onClick={e => { e.stopPropagation(); toggleSelectGroup(groupClaims); }} style={{ display: "flex", alignItems: "center" }}>
                        <input type="checkbox" checked={allGroupSelected} onChange={() => toggleSelectGroup(groupClaims)} style={{ cursor: "pointer", width: 16, height: 16 }} />
                      </span>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <div style={{
                        width: 36, height: 36, borderRadius: "var(--rounded-full)",
                        backgroundColor: first.avatarColor || "var(--brand-navy)",
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "var(--text-xs)", fontWeight: 600, flexShrink: 0,
                      }}>
                        {first.initials || first.employeeName?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                          {first.employeeName}
                        </p>
                        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                          {first.department}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                      {pendingCount > 0 && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 10px", borderRadius: "var(--rounded-full)",
                          fontSize: "var(--text-xs)", fontWeight: 600,
                          color: "var(--brand-amber)", backgroundColor: "var(--brand-amber-light)",
                        }}>
                          <Clock size={12} /> {pendingCount} pending
                        </span>
                      )}
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                        {`\u20B9${totalAmount.toLocaleString("en-IN")}`}
                      </span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                        {groupClaims.length} claim{groupClaims.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Claim Cards */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--color-border)" }}>
                      {groupClaims.map((claim, idx) => {
                        const StatusIcon = STATUS_CONFIG[claim.status]?.icon || Clock;
                        const isSelected = selectedIds.has(claim.id);
                        return (
                          <div key={claim.id || idx}
                            onClick={() => { setSelectedClaim(claim); setActionNote(""); }}
                            style={{
                              display: "grid", gridTemplateColumns: "40px 1.5fr 1fr 1fr 0.8fr",
                              gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)",
                              borderBottom: idx < groupClaims.length - 1 ? "1px solid var(--color-border)" : "none",
                              cursor: "pointer", transition: "background-color 150ms",
                              backgroundColor: isSelected ? "var(--brand-accent-alpha-8)" : "transparent",
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "var(--color-background)"; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                              onClick={e => { e.stopPropagation(); toggleSelect(claim.id); }}>
                              <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(claim.id)} style={{ cursor: "pointer", width: 16, height: 16 }} />
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)" }}>
                                  {claim.benefitType || claim.category}
                                </span>
                                {claim.approvalTag && (() => {
                                  const tagCfg = APPROVAL_TAG_CONFIG[claim.approvalTag];
                                  return tagCfg ? (
                                    <span style={{
                                      display: "inline-flex", alignItems: "center", gap: 3,
                                      padding: "0 6px", borderRadius: "var(--rounded-full)",
                                      fontSize: 10, fontWeight: 600, backgroundColor: tagCfg.bg, color: tagCfg.color,
                                      lineHeight: "18px", whiteSpace: "nowrap",
                                    }}>
                                      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: tagCfg.color, display: "inline-block" }} />
                                      {tagCfg.label}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              {claim.transactionId && (
                                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                                  {claim.transactionId}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)", display: "flex", alignItems: "center" }}>
                              {claim.claimAmount}
                            </span>
                            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", display: "flex", alignItems: "center" }}>
                              {claim.dateSubmitted}
                            </span>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={statusBadge(claim.status)}>
                                <StatusIcon size={12} />
                                {claim.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Bulk Actions Floating Bar */}
      {someSelected && (
        <div style={{
          position: "fixed", bottom: "var(--space-6)", left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-5)",
          backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--rounded-lg)", boxShadow: "var(--elevation-lg)", zIndex: 1100,
        }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
            {selectedIds.size} selected
          </span>
          <div style={{ width: 1, height: 24, backgroundColor: "var(--color-border)" }} />
          <button
            style={{ ...btnPrimary, backgroundColor: "var(--brand-green)", padding: "var(--space-2) var(--space-3)" }}
            onClick={bulkApprove}
            disabled={bulkLoading}
          >
            {bulkLoading ? <Spinner size={14} /> : <CheckCircle size={14} />} Approve All
          </button>
          <button
            style={{ ...btnPrimary, backgroundColor: "var(--brand-red)", padding: "var(--space-2) var(--space-3)" }}
            onClick={openBulkRejectDialog}
            disabled={bulkLoading}
          >
            {bulkLoading ? <Spinner size={14} /> : <XCircle size={14} />} Reject All
          </button>
          <button
            style={{ ...btnGhost, padding: "var(--space-2) var(--space-3)" }}
            onClick={clearSelection}
            disabled={bulkLoading}
          >
            Clear
          </button>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedClaim && (
        <>
          <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999,
          }} onClick={() => { setSelectedClaim(null); setActionNote(""); }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 440, maxWidth: "90vw",
            backgroundColor: "var(--color-card)", boxShadow: "var(--elevation-lg)",
            zIndex: 1000, display: "flex", flexDirection: "column", overflow: "auto",
          }}>
            {/* Drawer Header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "var(--space-5)", borderBottom: "1px solid var(--color-border)",
            }}>
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Claim Details
              </h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => { setSelectedClaim(null); setActionNote(""); }}>
                <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: "var(--space-5)", flex: 1 }}>
              {/* Employee Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "var(--rounded-full)",
                  backgroundColor: selectedClaim.avatarColor || "var(--brand-navy)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-sm)", fontWeight: 600,
                }}>
                  {selectedClaim.initials || selectedClaim.employeeName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
                    {selectedClaim.employeeName}
                  </p>
                  <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                    {selectedClaim.department}
                  </p>
                </div>
              </div>

              {/* Claim Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
                {[
                  { label: "Claim ID", value: selectedClaim.id },
                  { label: "Benefit Type", value: selectedClaim.benefitType || selectedClaim.category },
                  { label: "Amount", value: selectedClaim.claimAmount },
                  { label: "Date Submitted", value: selectedClaim.dateSubmitted },
                  { label: "Status", value: selectedClaim.status },
                  { label: "Merchant", value: selectedClaim.merchantName || "N/A" },
                  { label: "Transaction ID", value: selectedClaim.transactionId || "N/A" },
                  { label: "Employee ID", value: selectedClaim.employeeId || "N/A" },
                ].map(item => (
                  <div key={item.label}>
                    <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {item.label}
                    </p>
                    <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* UPI Transaction */}
              {selectedClaim.transactionId && (
                <div style={{ marginBottom: "var(--space-5)" }}>
                  <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Payment Proof
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "var(--space-3)",
                    padding: "var(--space-3)", backgroundColor: "#f0f0ff",
                    border: "1px solid #d0d0f0", borderRadius: "var(--rounded-md)",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "var(--rounded-full)",
                      backgroundColor: "var(--brand-green)", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Check size={18} style={{ color: "#fff" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <span style={{
                          display: "inline-flex", padding: "1px 8px", borderRadius: "var(--rounded-full)",
                          fontSize: 10, fontWeight: 700, backgroundColor: "#5B21B6", color: "#fff",
                        }}>UPI</span>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                          {selectedClaim.transactionId}
                        </span>
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                        {selectedClaim.merchantName || "Merchant"} · {selectedClaim.dateSubmitted}
                      </p>
                    </div>
                  </div>
                  {selectedClaim.upiScreenshot && (
                    <button style={{ ...btnGhost, marginTop: "var(--space-2)", gap: 6 }} onClick={e => e.stopPropagation()}>
                      <Eye size={14} /> View UPI Screenshot
                    </button>
                  )}
                </div>
              )}

              {/* Receipt */}
              {selectedClaim.receiptDescription && (
                <div style={{ marginBottom: "var(--space-5)" }}>
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Receipt Description
                  </p>
                  <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-foreground)", padding: "var(--space-3)", backgroundColor: "var(--color-background)", borderRadius: "var(--rounded-md)" }}>
                    {selectedClaim.receiptDescription}
                  </p>
                </div>
              )}

              {/* Previous action info */}
              {selectedClaim.actionNote && (
                <div style={{
                  padding: "var(--space-3)", backgroundColor: "var(--color-background)",
                  borderRadius: "var(--rounded-md)", marginBottom: "var(--space-5)",
                  borderLeft: "3px solid var(--color-border)",
                }}>
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)" }}>
                    Previous Note by {selectedClaim.actionBy || "Admin"}
                  </p>
                  <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-foreground)" }}>
                    {selectedClaim.actionNote}
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {(selectedClaim.status === "pending" || selectedClaim.status === "submitted" || selectedClaim.status === "claimed" || selectedClaim.status === "invoice_pending") && (
              <div style={{
                display: "flex", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)",
                borderTop: "1px solid var(--color-border)",
              }}>
                <button style={{
                  ...btnPrimary, flex: 1, justifyContent: "center",
                  backgroundColor: "var(--brand-red)",
                  opacity: actionLoading ? 0.7 : 1,
                }} onClick={openRejectDialog} disabled={actionLoading}
                  onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.backgroundColor = "#c0392b"; }}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-red)"}>
                  {actionLoading ? <Spinner size={16} /> : <XCircle size={16} />} Reject
                </button>
                <button style={{
                  ...btnPrimary, flex: 1, justifyContent: "center",
                  backgroundColor: "var(--brand-green)",
                  opacity: actionLoading ? 0.7 : 1,
                }} onClick={handleApprove} disabled={actionLoading}
                  onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.backgroundColor = "#219a52"; }}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-green)"}>
                  {actionLoading ? <Spinner size={16} /> : <CheckCircle size={16} />} Approve
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Rejection Dialog Modal */}
      {showRejectDialog && (
        <>
          <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100,
          }} onClick={() => { setShowRejectDialog(false); setRejectReason(""); setReturnToLimit(true); }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 440, maxWidth: "90vw", backgroundColor: "var(--color-card)",
            borderRadius: "var(--rounded-lg)", boxShadow: "var(--elevation-lg)", zIndex: 1200,
            padding: "var(--space-6)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Reject Claim
              </h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => { setShowRejectDialog(false); setRejectReason(""); setReturnToLimit(true); }}
              >
                <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
              </button>
            </div>

            <p style={{ margin: "0 0 var(--space-4)", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
              Please provide a reason for rejecting this claim. This will be shared with the employee.
            </p>

            <div style={{ marginBottom: "var(--space-4)" }}>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Rejection Reason <span style={{ color: "var(--brand-red)" }}>*</span>
              </label>
              <select
                style={{ ...inputStyle, marginTop: "var(--space-2)" }}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                autoFocus
              >
                <option value="">Select a reason...</option>
                <option value="Duplicate claim">Duplicate claim</option>
                <option value="Invalid receipt">Invalid receipt</option>
                <option value="Exceeds limit">Exceeds limit</option>
                <option value="Not eligible">Not eligible</option>
                <option value="Insufficient documentation">Insufficient documentation</option>
              </select>
            </div>

            <div style={{ marginBottom: "var(--space-5)" }}>
              <label style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)",
                fontSize: "var(--text-sm)", cursor: "pointer", color: "var(--color-foreground)",
              }}>
                <div
                  onClick={() => setReturnToLimit(!returnToLimit)}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    backgroundColor: returnToLimit ? "var(--brand-green)" : "var(--color-border)",
                    position: "relative", cursor: "pointer", transition: "background-color 150ms",
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", backgroundColor: "#fff",
                    position: "absolute", top: 2,
                    left: returnToLimit ? 20 : 2,
                    transition: "left 150ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
                Return amount to employee's limit
              </label>
            </div>

            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button
                style={btnGhost}
                onClick={() => { setShowRejectDialog(false); setRejectReason(""); setReturnToLimit(true); }}
                disabled={rejectLoading}
              >
                Cancel
              </button>
              <button
                style={{
                  ...btnPrimary, backgroundColor: "var(--brand-red)",
                  opacity: !rejectReason || rejectLoading ? 0.5 : 1,
                  cursor: !rejectReason || rejectLoading ? "not-allowed" : "pointer",
                }}
                onClick={confirmReject}
                disabled={!rejectReason || rejectLoading}
              >
                {rejectLoading ? <Spinner size={16} /> : <XCircle size={16} />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bulk Rejection Dialog */}
      {showBulkRejectDialog && (
        <>
          <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100,
          }} onClick={() => { setShowBulkRejectDialog(false); setBulkRejectReason(""); }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 480, maxWidth: "90vw", backgroundColor: "var(--color-card)",
            borderRadius: "var(--rounded-lg)", boxShadow: "var(--elevation-lg)", zIndex: 1200,
            padding: "var(--space-6)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Reject {selectedIds.size} Claim{selectedIds.size !== 1 ? "s" : ""}
              </h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => { setShowBulkRejectDialog(false); setBulkRejectReason(""); }}
              >
                <X size={20} style={{ color: "var(--color-muted-foreground)" }} />
              </button>
            </div>

            <div style={{
              padding: "var(--space-3)", backgroundColor: "var(--brand-red-light)",
              borderRadius: "var(--rounded-md)", marginBottom: "var(--space-4)",
              display: "flex", alignItems: "center", gap: "var(--space-2)",
            }}>
              <AlertCircle size={16} style={{ color: "var(--brand-red)", flexShrink: 0 }} />
              <span style={{ fontSize: "var(--text-sm)", color: "var(--brand-red)" }}>
                This will reject {selectedIds.size} selected claim{selectedIds.size !== 1 ? "s" : ""}. Employees will be notified.
              </span>
            </div>

            <div style={{ marginBottom: "var(--space-4)" }}>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Rejection Reason <span style={{ color: "var(--brand-red)" }}>*</span>
              </label>
              <textarea
                style={{
                  ...inputStyle, marginTop: "var(--space-2)", minHeight: 100, resize: "vertical",
                  borderColor: bulkRejectReason.trim().length > 0 && bulkRejectReason.trim().length < 10 ? "var(--brand-red)" : "var(--color-border)",
                }}
                value={bulkRejectReason}
                onChange={e => setBulkRejectReason(e.target.value)}
                placeholder="Enter rejection reason for all selected claims (minimum 10 characters)..."
                autoFocus
              />
              {bulkRejectReason.trim().length > 0 && bulkRejectReason.trim().length < 10 && (
                <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--brand-red)" }}>
                  Reason must be at least 10 characters ({bulkRejectReason.trim().length}/10)
                </p>
              )}
            </div>

            <div style={{ marginBottom: "var(--space-5)" }}>
              <label style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)",
                fontSize: "var(--text-sm)", cursor: "pointer", color: "var(--color-foreground)",
              }}>
                <div
                  onClick={() => setBulkReturnToLimit(!bulkReturnToLimit)}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    backgroundColor: bulkReturnToLimit ? "var(--brand-green)" : "var(--color-border)",
                    position: "relative", cursor: "pointer", transition: "background-color 150ms",
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", backgroundColor: "#fff",
                    position: "absolute", top: 2,
                    left: bulkReturnToLimit ? 20 : 2,
                    transition: "left 150ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
                Return amounts to employees' limits
              </label>
            </div>

            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button
                style={btnGhost}
                onClick={() => { setShowBulkRejectDialog(false); setBulkRejectReason(""); }}
                disabled={bulkLoading}
              >
                Cancel
              </button>
              <button
                style={{
                  ...btnPrimary, backgroundColor: "var(--brand-red)",
                  opacity: bulkRejectReason.trim().length < 10 || bulkLoading ? 0.5 : 1,
                  cursor: bulkRejectReason.trim().length < 10 || bulkLoading ? "not-allowed" : "pointer",
                }}
                onClick={confirmBulkReject}
                disabled={bulkRejectReason.trim().length < 10 || bulkLoading}
              >
                {bulkLoading ? <Spinner size={16} /> : <XCircle size={16} />}
                Reject {selectedIds.size} Claim{selectedIds.size !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </>
      )}

      {error && (
        <div style={{
          position: "fixed", bottom: "var(--space-4)", right: "var(--space-4)",
          padding: "var(--space-3) var(--space-4)", backgroundColor: "var(--brand-red-light)",
          color: "var(--brand-red)", borderRadius: "var(--rounded-md)", fontSize: "var(--text-sm)",
          boxShadow: "var(--elevation-md)", zIndex: 1100,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
