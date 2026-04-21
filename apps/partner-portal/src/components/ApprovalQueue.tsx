"use client";

import { useState, useMemo, useCallback, useEffect, type CSSProperties } from "react";
import { Inbox, Flag, CheckCircle, XCircle, MessageSquareWarning, Layers, X, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@partner-portal/ui";
import {
  type Claim,
  type ClaimStatus,
  type Dispute,
  type RejectionReason,
  type AllowanceCategory,
  parseINR,
  FLEXI_BENEFIT_CATEGORIES,
  DEMO_CLAIMS,
  DEMO_CYCLES,
  DEMO_DISPUTES,
  CURRENT_CYCLE_ID,
} from "@partner-portal/shared";
import { CycleSelector } from "./approvals/CycleSelector";
import { ClaimsList, type ViewMode } from "./approvals/ClaimsList";
import { DisputesList } from "./approvals/DisputesList";
import { RejectDialog } from "./approvals/RejectDialog";
import { BulkRejectDialog } from "./approvals/BulkRejectDialog";
import { ClaimDetailsDrawer } from "./approvals/ClaimDetailsDrawer";
import { font } from "./approvals/constants";

/**
 * A claim is "actionable" when HR can still approve / reject / flag it.
 * Final statuses (approved, auto_approved, rejected) are excluded from bulk operations.
 */
const ACTIONABLE_STATUSES: ReadonlyArray<ClaimStatus> = [
  "eligible",
  "submitted",
  "pending",
  "claimed",
  "invoice_pending",
  "flagged_for_later",
];
function isActionable(c: Claim): boolean {
  return ACTIONABLE_STATUSES.includes(c.status);
}

const inputStyle: CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  width: "100%",
  padding: "8px 10px",
  fontSize: "var(--text-sm)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  outline: "none",
};

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-muted-foreground)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

type ApprovalTab = "all" | "flagged" | "approved" | "rejected" | "disputes";

const TABS: { key: ApprovalTab; label: string; icon: typeof Flag }[] = [
  { key: "all", label: "All", icon: Layers },
  { key: "flagged", label: "Flagged", icon: Flag },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "rejected", label: "Rejected", icon: XCircle },
  { key: "disputes", label: "Disputes", icon: MessageSquareWarning },
];

const EMPTY_COPY: Record<ApprovalTab, { title: string; description: string }> = {
  all: { title: "No claims this cycle yet.", description: "As employees submit claims, they will appear here." },
  flagged: { title: "No flagged items this cycle.", description: "Uplift AI has not surfaced any risky claims." },
  approved: { title: "No approved claims yet this cycle.", description: "Auto-approved and manually approved claims will appear here." },
  rejected: { title: "No rejections this cycle.", description: "Rejected claims will appear here with their reason." },
  disputes: { title: "No disputes — employees are satisfied this cycle.", description: "Disputes raised against claim decisions will appear here." },
};

export function ApprovalQueue() {
  const [claims, setClaims] = useState<Claim[]>(DEMO_CLAIMS);
  const [disputes] = useState<Dispute[]>(DEMO_DISPUTES);
  const [activeTab, setActiveTab] = useState<ApprovalTab>("all");
  const [selectedCycleId, setSelectedCycleId] = useState<string>(CURRENT_CYCLE_ID);
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<Claim | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);

  // Claim details drawer
  const [detailClaim, setDetailClaim] = useState<Claim | null>(null);

  // Filters
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<AllowanceCategory | "all">("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  // Reset selection + filters when tab or cycle changes
  useEffect(() => {
    setSelectedIds(new Set());
    setCategoryFilter("all");
    setDeptFilter("all");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
  }, [activeTab, selectedCycleId]);

  const selectedCycle = useMemo(
    () => DEMO_CYCLES.find((c) => c.id === selectedCycleId) ?? DEMO_CYCLES[DEMO_CYCLES.length - 1],
    [selectedCycleId],
  );
  const readOnly = selectedCycle.status === "closed";

  // Filter by cycle. Claims without an explicit cycleId fall into the current cycle bucket.
  const cycleClaims = useMemo(
    () => claims.filter((c) => (c.cycleId ?? CURRENT_CYCLE_ID) === selectedCycleId),
    [claims, selectedCycleId],
  );

  const cycleDisputes = useMemo(() => {
    // Disputes don't carry a cycleId in the schema; associate each dispute with its
    // underlying claim's cycle (falling back to the current cycle for unresolved demo data).
    const cycleByClaimId = new Map<string, string>();
    claims.forEach((c) => cycleByClaimId.set(c.id, c.cycleId ?? CURRENT_CYCLE_ID));
    return disputes.filter((d) => (cycleByClaimId.get(d.claimId) ?? CURRENT_CYCLE_ID) === selectedCycleId);
  }, [disputes, claims, selectedCycleId]);

  const tabClaims = useMemo(() => {
    switch (activeTab) {
      case "all":
        return cycleClaims;
      case "flagged":
        return cycleClaims.filter((c) => c.flaggedByAI === true);
      case "approved":
        return cycleClaims.filter(
          (c) => c.status === "approved" || c.status === "auto_approved",
        );
      case "rejected":
        return cycleClaims.filter((c) => c.status === "rejected");
      default:
        return [];
    }
  }, [cycleClaims, activeTab]);

  const tabCounts: Record<ApprovalTab, number> = {
    all: cycleClaims.length,
    flagged: cycleClaims.filter((c) => c.flaggedByAI === true).length,
    approved: cycleClaims.filter((c) => c.status === "approved" || c.status === "auto_approved").length,
    rejected: cycleClaims.filter((c) => c.status === "rejected").length,
    disputes: cycleDisputes.length,
  };

  /* ─── Filters ───────────────────────────────────────────────────────────── */

  const departments = useMemo(() => {
    const set = new Set<string>();
    cycleClaims.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set).sort();
  }, [cycleClaims]);

  const filtersActive =
    categoryFilter !== "all" ||
    deptFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "" ||
    minAmount !== "" ||
    maxAmount !== "";

  const filteredTabClaims = useMemo(() => {
    if (!filtersActive) return tabClaims;
    const minN = minAmount === "" ? -Infinity : Number(minAmount);
    const maxN = maxAmount === "" ? Infinity : Number(maxAmount);
    return tabClaims.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (deptFilter !== "all" && c.department !== deptFilter) return false;
      if (fromDate && c.dateSubmitted < fromDate) return false;
      if (toDate && c.dateSubmitted > toDate) return false;
      const amt = parseINR(c.claimAmount);
      if (amt < minN) return false;
      if (amt > maxN) return false;
      return true;
    });
  }, [tabClaims, filtersActive, categoryFilter, deptFilter, fromDate, toDate, minAmount, maxAmount]);

  const clearFilters = useCallback(() => {
    setCategoryFilter("all");
    setDeptFilter("all");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
  }, []);

  /* ─── Drawer handlers ───────────────────────────────────────────────────── */

  const handleOpenDetails = useCallback((claim: Claim) => {
    setDetailClaim(claim);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailClaim(null);
  }, []);

  // Keep drawer in sync with claim state mutations (e.g. after Approve in drawer).
  const liveDetailClaim = useMemo(
    () => (detailClaim ? claims.find((c) => c.id === detailClaim.id) ?? null : null),
    [detailClaim, claims],
  );

  /* ─── Actions (mutate local state only; demo-mode) ─────────────────────── */

  const handleApprove = useCallback((claim: Claim) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claim.id
          ? {
              ...c,
              status: "approved" as ClaimStatus,
              approvalSource: "manual" as const,
              actionNote: "Approved by HR",
              actionBy: "Amanda Johnson",
              actionTimestamp: new Date().toISOString(),
            }
          : c,
      ),
    );
    toast.success(`Approved ${claim.id}`);
  }, []);

  const handleFlagForLater = useCallback((claim: Claim) => {
    // TODO: at payroll cutoff, claims still in `flagged_for_later` should auto-resolve
    // to `approved` (per PRD §4.3 OD-D-01). Deferred — requires cron/cutoff hook.
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claim.id
          ? { ...c, status: "flagged_for_later" as ClaimStatus }
          : c,
      ),
    );
    toast.success(`Flagged ${claim.id} for later`);
  }, []);

  const handleOpenReject = useCallback((claim: Claim) => {
    setRejectTarget(claim);
  }, []);

  const handleConfirmReject = useCallback(
    (reason: RejectionReason, note: string) => {
      if (!rejectTarget) return;
      setClaims((prev) =>
        prev.map((c) =>
          c.id === rejectTarget.id
            ? {
                ...c,
                status: "rejected" as ClaimStatus,
                rejectionReason: reason,
                rejectionNote: note || undefined,
                actionNote: note || undefined,
                actionBy: "Amanda Johnson",
                actionTimestamp: new Date().toISOString(),
              }
            : c,
        ),
      );
      toast.success(`Rejected ${rejectTarget.id}`);
      setRejectTarget(null);
    },
    [rejectTarget],
  );

  const handleRejectUnderlyingClaim = useCallback(
    (dispute: Dispute) => {
      const target = claims.find((c) => c.id === dispute.claimId);
      if (!target) {
        toast.error("Underlying claim not found");
        return;
      }
      setRejectTarget(target);
    },
    [claims],
  );

  const handleDrawerApprove = useCallback(
    (c: Claim) => {
      handleApprove(c);
      setDetailClaim(null);
    },
    [handleApprove],
  );

  const handleDrawerReject = useCallback(
    (c: Claim) => {
      setDetailClaim(null);
      handleOpenReject(c);
    },
    [handleOpenReject],
  );

  /* ─── Bulk selection + bulk actions ────────────────────────────────────── */

  // Only actionable (non-final) claims in the current (filtered) view are selectable.
  const selectableInView = useMemo(
    () => filteredTabClaims.filter(isActionable),
    [filteredTabClaims],
  );
  const selectableIdsInView = useMemo(
    () => new Set(selectableInView.map((c) => c.id)),
    [selectableInView],
  );
  const selectedInViewCount = useMemo(
    () => [...selectedIds].filter((id) => selectableIdsInView.has(id)).length,
    [selectedIds, selectableIdsInView],
  );
  const allSelected =
    selectableInView.length > 0 && selectedInViewCount === selectableInView.length;

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableInView.map((c) => c.id)));
    }
  }, [allSelected, selectableInView]);

  const handleToggleSelectMany = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allOn = ids.every((id) => next.has(id));
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkApprove = useCallback(() => {
    const ids = [...selectedIds].filter((id) => selectableIdsInView.has(id));
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    setClaims((prev) =>
      prev.map((c) =>
        ids.includes(c.id)
          ? {
              ...c,
              status: "approved" as ClaimStatus,
              approvalSource: "manual" as const,
              actionNote: "Bulk approved by HR",
              actionBy: "Amanda Johnson",
              actionTimestamp: now,
            }
          : c,
      ),
    );
    toast.success(`Approved ${ids.length} claim${ids.length !== 1 ? "s" : ""}`);
    clearSelection();
  }, [selectedIds, selectableIdsInView, clearSelection]);

  const handleBulkReject = useCallback(
    (reason: RejectionReason, note: string) => {
      const ids = [...selectedIds].filter((id) => selectableIdsInView.has(id));
      if (ids.length === 0) return;
      const now = new Date().toISOString();
      setClaims((prev) =>
        prev.map((c) =>
          ids.includes(c.id)
            ? {
                ...c,
                status: "rejected" as ClaimStatus,
                rejectionReason: reason,
                rejectionNote: note || undefined,
                actionNote: note || `Bulk rejected: ${reason}`,
                actionBy: "Amanda Johnson",
                actionTimestamp: now,
              }
            : c,
        ),
      );
      toast.success(`Rejected ${ids.length} claim${ids.length !== 1 ? "s" : ""}`);
      clearSelection();
      setBulkRejectOpen(false);
    },
    [selectedIds, selectableIdsInView, clearSelection],
  );

  /* ─── Render ───────────────────────────────────────────────────────────── */

  const headerWrap: CSSProperties = {
    ...font,
    padding: "var(--space-6)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-5)",
  };

  return (
    <div style={headerWrap}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
            Approval Queue
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
            Review, approve, or dispute claim units for the selected cycle.
          </p>
        </div>
        <CycleSelector
          cycles={DEMO_CYCLES}
          selectedCycleId={selectedCycleId}
          onCycleChange={setSelectedCycleId}
        />
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Approval tabs"
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--color-border)",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...font,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--brand-accent)" : "var(--color-muted-foreground)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--brand-accent)" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={14} />
              {tab.label}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 20,
                  padding: "0 6px",
                  height: 18,
                  borderRadius: "var(--rounded-full)",
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: isActive ? "var(--brand-accent)" : "var(--color-surface)",
                  color: isActive ? "#fff" : "var(--color-muted-foreground)",
                }}
              >
                {tabCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter controls — only for claim tabs, not disputes */}
      {activeTab !== "disputes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {/* Row 1: category + filter toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AllowanceCategory | "all")}
              aria-label="Category filter"
              style={inputStyle}
            >
              <option value="all">All Categories</option>
              {FLEXI_BENEFIT_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFiltersVisible((v) => !v)}
              aria-expanded={filtersVisible}
              style={{
                ...font,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-muted-foreground)",
                borderRadius: "var(--rounded-md)",
                cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={14} />
              {filtersVisible ? "Hide" : "Show"}
            </button>
            {filtersActive && (
              <button
                onClick={clearFilters}
                style={{
                  ...font,
                  background: "none",
                  border: "none",
                  color: "var(--brand-accent)",
                  fontSize: "var(--text-sm)",
                  cursor: "pointer",
                  padding: "8px 4px",
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Row 2: advanced filters — Department / From / To / Min / Max */}
          {filtersVisible && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--rounded-md)",
              }}
            >
              <FilterField label="Department">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={inputStyle}
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="From Date">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={inputStyle}
                />
              </FilterField>
              <FilterField label="To Date">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={inputStyle}
                />
              </FilterField>
              <FilterField label="Min Amount">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  style={inputStyle}
                />
              </FilterField>
              <FilterField label="Max Amount">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="No limit"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  style={inputStyle}
                />
              </FilterField>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {activeTab === "disputes" ? (
        cycleDisputes.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={EMPTY_COPY.disputes.title}
            description={EMPTY_COPY.disputes.description}
          />
        ) : (
          <DisputesList
            disputes={cycleDisputes}
            readOnly={readOnly}
            onRejectUnderlyingClaim={handleRejectUnderlyingClaim}
          />
        )
      ) : filteredTabClaims.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filtersActive ? "No claims match your filters" : EMPTY_COPY[activeTab].title}
          description={filtersActive ? "Try adjusting or clearing filters to see more results." : EMPTY_COPY[activeTab].description}
        />
      ) : (
        <>
          {/* Bulk action toolbar — visible when any actionable claim is selected */}
          {!readOnly && selectedInViewCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                backgroundColor: "var(--brand-navy)",
                color: "#fff",
                borderRadius: "var(--rounded-md)",
                fontSize: "var(--text-sm)",
              }}
              role="toolbar"
              aria-label="Bulk actions"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <button
                  onClick={clearSelection}
                  aria-label="Clear selection"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--rounded-sm)",
                    padding: 4,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
                <span style={{ fontWeight: 600 }}>
                  {selectedInViewCount} selected
                </span>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  onClick={handleBulkApprove}
                  style={{
                    ...font,
                    backgroundColor: "var(--brand-green)",
                    color: "#fff",
                    border: "none",
                    padding: "var(--space-2) var(--space-4)",
                    borderRadius: "var(--rounded-md)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CheckCircle size={14} /> Approve {selectedInViewCount}
                </button>
                <button
                  onClick={() => setBulkRejectOpen(true)}
                  style={{
                    ...font,
                    backgroundColor: "var(--brand-red)",
                    color: "#fff",
                    border: "none",
                    padding: "var(--space-2) var(--space-4)",
                    borderRadius: "var(--rounded-md)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <XCircle size={14} /> Reject {selectedInViewCount}
                </button>
              </div>
            </div>
          )}

          <ClaimsList
            claims={filteredTabClaims}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            readOnly={readOnly}
            onApprove={readOnly ? undefined : handleApprove}
            onReject={readOnly ? undefined : handleOpenReject}
            onFlagForLater={readOnly ? undefined : handleFlagForLater}
            onOpenDetails={handleOpenDetails}
            selectable={!readOnly}
            selectedIds={selectedIds}
            selectableIds={selectableIdsInView}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onToggleSelectMany={handleToggleSelectMany}
            allSelected={allSelected}
          />
        </>
      )}

      {/* Reject Dialog (single-claim) */}
      {rejectTarget && (
        <RejectDialog
          claim={rejectTarget}
          open={!!rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleConfirmReject}
        />
      )}

      {/* Claim Details Drawer */}
      <ClaimDetailsDrawer
        claim={liveDetailClaim}
        open={!!liveDetailClaim}
        readOnly={readOnly}
        onClose={handleCloseDetails}
        onApprove={readOnly ? undefined : handleDrawerApprove}
        onReject={readOnly ? undefined : handleDrawerReject}
      />

      {/* Bulk Reject Dialog */}
      <BulkRejectDialog
        count={selectedInViewCount}
        open={bulkRejectOpen}
        onClose={() => setBulkRejectOpen(false)}
        onConfirm={handleBulkReject}
      />
    </div>
  );
}
