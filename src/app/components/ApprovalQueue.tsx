import React, { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import {
  Check, X, ChevronRight, Paperclip, Filter, Upload, AlertCircle,
  Clock, CheckCircle, XCircle, FileText, Search, ChevronDown
} from "lucide-react";
import * as api from "../utils/api";
import { formatINR, parseINR } from "../utils/helpers";
import { useSearch } from "../contexts/SearchContext";
import { PLAN_META, type Claim, type ClaimStatus, type BenefitPlan } from "../types";

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
const CATEGORIES = ["All", "LTA", "HRA", "Fuel", "Meal", "Internet", "NPS"] as const;

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  pending: { color: "var(--brand-amber)", bg: "var(--brand-amber-light)", icon: Clock },
  submitted: { color: "var(--brand-amber)", bg: "var(--brand-amber-light)", icon: Clock },
  claimed: { color: "#6B7A8D", bg: "#F0F2F5", icon: FileText },
  invoice_pending: { color: "#6B7A8D", bg: "#F0F2F5", icon: FileText },
  approved: { color: "var(--brand-green)", bg: "var(--brand-green-light)", icon: CheckCircle },
  rejected: { color: "var(--brand-red)", bg: "var(--brand-red-light)", icon: XCircle },
};

function statusBadge(status: string): CSSProperties {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 10px", borderRadius: "var(--rounded-full)",
    fontSize: "var(--text-xs)", fontWeight: 600, color: cfg.color, backgroundColor: cfg.bg,
  };
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
  const [attachmentOnly, setAttachmentOnly] = useState(false);

  // Detail drawer
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.getClaims();
      if (res.setupRequired) { setSetupRequired(true); setClaims([]); }
      else { setSetupRequired(false); setClaims(res.data || []); }
    } catch (e: any) { setError(e.message || "Failed to load claims"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleAction = async (status: "approved" | "rejected") => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      await api.updateClaimStatus(selectedClaim.id, status, actionNote);
      setClaims(prev => prev.map(c => c.id === selectedClaim.id ? { ...c, status, actionNote, actionTimestamp: new Date().toISOString() } : c));
      setSelectedClaim(null); setActionNote("");
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
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
      setClaims(prev => [...prev, ...(res.data || [])]);
      setSetupRequired(false);
    } catch (e: any) { setError(e.message); }
    finally { if (fileRef.current) fileRef.current.value = ""; }
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
  if (attachmentOnly) filtered = filtered.filter(c => c.hasAttachment);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(c =>
      c.employeeName.toLowerCase().includes(q) || c.department?.toLowerCase().includes(q) ||
      c.benefitType?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)
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
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", cursor: "pointer" }}>
              <input type="checkbox" checked={attachmentOnly} onChange={e => setAttachmentOnly(e.target.checked)} />
              With Attachments Only
            </label>
          </div>
        </div>
      )}

      {/* Claims Table */}
      <div style={{
        backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-lg)", overflow: "hidden",
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 0.8fr 40px",
          gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-background)",
          fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          <span>Employee</span>
          <span>Benefit Type</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Status</span>
          <span></span>
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-muted-foreground)", fontSize: "var(--text-sm)" }}>
            No claims match your filters.
          </p>
        ) : (
          filtered.map((claim, idx) => {
            const StatusIcon = STATUS_CONFIG[claim.status]?.icon || Clock;
            return (
              <div key={claim.id || idx}
                onClick={() => { setSelectedClaim(claim); setActionNote(""); }}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 0.8fr 40px",
                  gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)",
                  borderBottom: idx < filtered.length - 1 ? "1px solid var(--color-border)" : "none",
                  cursor: "pointer", transition: "background-color 150ms",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-background)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "var(--rounded-full)",
                    backgroundColor: claim.avatarColor || "var(--brand-navy)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--text-xs)", fontWeight: 600, flexShrink: 0,
                  }}>
                    {claim.initials || claim.employeeName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {claim.employeeName}
                    </p>
                    <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                      {claim.department}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-foreground)", display: "flex", alignItems: "center" }}>
                  {claim.benefitType || claim.category}
                </span>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {claim.hasAttachment && <Paperclip size={14} style={{ color: "var(--color-muted-foreground)" }} />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Drawer */}
      {selectedClaim && (
        <>
          <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999,
          }} onClick={() => setSelectedClaim(null)} />
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
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setSelectedClaim(null)}>
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
                  { label: "Benefit Type", value: selectedClaim.benefitType || selectedClaim.category },
                  { label: "Amount", value: selectedClaim.claimAmount },
                  { label: "Date Submitted", value: selectedClaim.dateSubmitted },
                  { label: "Status", value: selectedClaim.status },
                  { label: "Merchant", value: selectedClaim.merchantName || "N/A" },
                  { label: "Transaction ID", value: selectedClaim.transactionId || "N/A" },
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

              {selectedClaim.hasAttachment && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "var(--space-2)",
                  padding: "var(--space-3)", backgroundColor: "var(--color-background)",
                  borderRadius: "var(--rounded-md)", marginBottom: "var(--space-5)",
                }}>
                  <Paperclip size={16} style={{ color: "var(--brand-navy)" }} />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--brand-navy)", fontWeight: 500 }}>
                    Attachment available
                  </span>
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom: "var(--space-5)" }}>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Action Notes
                </label>
                <textarea
                  style={{ ...inputStyle, marginTop: "var(--space-2)", minHeight: 80, resize: "vertical" }}
                  value={actionNote} onChange={e => setActionNote(e.target.value)}
                  placeholder="Add notes for this decision..."
                />
              </div>

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
            {(selectedClaim.status === "pending" || selectedClaim.status === "submitted" || selectedClaim.status === "claimed") && (
              <div style={{
                display: "flex", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)",
                borderTop: "1px solid var(--color-border)",
              }}>
                <button style={{
                  ...btnPrimary, flex: 1, justifyContent: "center",
                  backgroundColor: "var(--brand-red)",
                }} onClick={() => handleAction("rejected")} disabled={actionLoading}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#c0392b"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-red)"}>
                  <XCircle size={16} /> Reject
                </button>
                <button style={{
                  ...btnPrimary, flex: 1, justifyContent: "center",
                  backgroundColor: "var(--brand-green)",
                }} onClick={() => handleAction("approved")} disabled={actionLoading}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#219a52"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-green)"}>
                  <CheckCircle size={16} /> Approve
                </button>
              </div>
            )}
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
