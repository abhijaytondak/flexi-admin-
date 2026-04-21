"use client";

import React, { useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight, LayoutList, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Claim } from "@partner-portal/shared";
import { parseINR } from "@partner-portal/shared";
import { font, formatAmountINR, formatDate } from "./constants";
import { ClaimRow } from "./ClaimRow";
import { RiskBadge, StatusPill } from "./ClaimBadges";

export type ViewMode = "grouped" | "flat";

interface ClaimsListProps {
  claims: Claim[];
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  readOnly: boolean;
  onApprove?: (claim: Claim) => void;
  onReject?: (claim: Claim) => void;
  onFlagForLater?: (claim: Claim) => void;
  onOpenDetails?: (claim: Claim) => void;
  // Selection (bulk actions)
  selectable?: boolean;
  selectedIds?: Set<string>;
  selectableIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onToggleSelectMany?: (ids: string[]) => void;
  allSelected?: boolean;
}

const toggleBtnBase: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  border: "1px solid var(--color-border)",
  cursor: "pointer",
  backgroundColor: "var(--color-background)",
  color: "var(--color-muted-foreground)",
};

type SortKey = "employeeName" | "benefitType" | "amount" | "dateSubmitted" | "status" | "risk";
type SortDir = "asc" | "desc";

export function ClaimsList({
  claims,
  viewMode,
  onViewModeChange,
  readOnly,
  onApprove,
  onReject,
  onFlagForLater,
  onOpenDetails,
  selectable = false,
  selectedIds,
  selectableIds,
  onToggleSelect,
  onToggleSelectAll,
  onToggleSelectMany,
  allSelected = false,
}: ClaimsListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("dateSubmitted");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const isSelectable = (id: string) => selectable && !!selectableIds?.has(id);
  const isSelected = (id: string) => !!selectedIds?.has(id);

  const toggleEmp = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getSortValue = (c: Claim, k: SortKey): string | number => {
    switch (k) {
      case "employeeName": return c.employeeName;
      case "benefitType": return c.benefitType || c.category;
      case "amount": return parseINR(c.claimAmount);
      case "dateSubmitted": return c.dateSubmitted;
      case "status": return c.status;
      case "risk": {
        const order = { normal: 0, medium: 1, high: 2 };
        return c.riskLevel ? order[c.riskLevel] : -1;
      }
    }
  };

  const sortedFlat = [...claims].sort((a, b) => {
    const av = getSortValue(a, sortKey);
    const bv = getSortValue(b, sortKey);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Grouped view
  const grouped: Record<string, Claim[]> = {};
  claims.forEach((c) => {
    const k = c.employeeId || c.employeeName;
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(c);
  });
  const empKeys = Object.keys(grouped);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* View toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, alignSelf: "flex-start" }}>
        <button
          onClick={() => onViewModeChange("grouped")}
          style={{
            ...toggleBtnBase,
            borderTopLeftRadius: "var(--rounded-md)",
            borderBottomLeftRadius: "var(--rounded-md)",
            borderRight: "none",
            backgroundColor: viewMode === "grouped" ? "var(--brand-navy)" : "var(--color-background)",
            color: viewMode === "grouped" ? "#fff" : "var(--color-muted-foreground)",
            borderColor: viewMode === "grouped" ? "var(--brand-navy)" : "var(--color-border)",
          }}
          aria-pressed={viewMode === "grouped"}
        >
          <Users size={14} /> Grouped by Employee
        </button>
        <button
          onClick={() => onViewModeChange("flat")}
          style={{
            ...toggleBtnBase,
            borderTopRightRadius: "var(--rounded-md)",
            borderBottomRightRadius: "var(--rounded-md)",
            backgroundColor: viewMode === "flat" ? "var(--brand-navy)" : "var(--color-background)",
            color: viewMode === "flat" ? "#fff" : "var(--color-muted-foreground)",
            borderColor: viewMode === "flat" ? "var(--brand-navy)" : "var(--color-border)",
          }}
          aria-pressed={viewMode === "flat"}
        >
          <LayoutList size={14} /> Flat List
        </button>
      </div>

      {viewMode === "grouped" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {empKeys.map((k) => {
            const groupClaims = grouped[k];
            const first = groupClaims[0];
            const isOpen = expanded.has(k);
            const total = groupClaims.reduce((s, c) => s + parseINR(c.claimAmount), 0);

            // Group-level selection state (of actionable claims only)
            const groupSelectableIds = groupClaims
              .filter((c) => isSelectable(c.id))
              .map((c) => c.id);
            const groupHasSelectable = groupSelectableIds.length > 0;
            const groupSelectedCount = groupSelectableIds.filter((id) => isSelected(id)).length;
            const groupAllSelected =
              groupHasSelectable && groupSelectedCount === groupSelectableIds.length;
            const groupPartiallySelected =
              groupSelectedCount > 0 && groupSelectedCount < groupSelectableIds.length;

            return (
              <div
                key={k}
                style={{
                  ...font,
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--rounded-lg)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-3)",
                    padding: "var(--space-3) var(--space-4)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: 1 }}>
                    {selectable && groupHasSelectable && onToggleSelectMany && (
                      <input
                        type="checkbox"
                        checked={groupAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = groupPartiallySelected;
                        }}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleSelectMany(groupSelectableIds);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select all actionable claims for ${first.employeeName}`}
                        style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleEmp(k)}
                      aria-expanded={isOpen}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        flex: 1,
                      }}
                    >
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "var(--rounded-full)",
                          backgroundColor: first.avatarColor || "var(--brand-navy)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                        }}
                      >
                        {first.initials || first.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                          {first.employeeName}{" "}
                          <span style={{ color: "var(--color-muted-foreground)", fontWeight: 500 }}>
                            · {first.employeeId || "—"}
                          </span>
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)", marginTop: 2 }}>
                          {first.department || "—"}
                        </div>
                      </div>
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                      {formatAmountINR(total)}
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                      {groupClaims.length} claim{groupClaims.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "var(--space-4)",
                      backgroundColor: "var(--color-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-3)",
                    }}
                  >
                    {groupClaims.map((c) => (
                      <div
                        key={c.id}
                        style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}
                      >
                        {selectable && isSelectable(c.id) && onToggleSelect && (
                          <input
                            type="checkbox"
                            checked={isSelected(c.id)}
                            onChange={() => onToggleSelect(c.id)}
                            aria-label={`Select claim ${c.id}`}
                            style={{ width: 16, height: 16, cursor: "pointer", marginTop: 14, flexShrink: 0 }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <ClaimRow
                            claim={c}
                            readOnly={readOnly}
                            onApprove={onApprove}
                            onReject={onReject}
                            onFlagForLater={onFlagForLater}
                            onOpenDetails={onOpenDetails}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <FlatTable
          claims={sortedFlat}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          readOnly={readOnly}
          onApprove={onApprove}
          onReject={onReject}
          onFlagForLater={onFlagForLater}
          onOpenDetails={onOpenDetails}
          selectable={selectable}
          isSelectable={isSelectable}
          isSelected={isSelected}
          onToggleSelect={onToggleSelect}
          onToggleSelectAll={onToggleSelectAll}
          allSelected={allSelected}
          hasAnySelectable={(selectableIds?.size ?? 0) > 0}
        />
      )}
    </div>
  );
}

interface FlatTableProps {
  claims: Claim[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  readOnly: boolean;
  onApprove?: (claim: Claim) => void;
  onReject?: (claim: Claim) => void;
  onFlagForLater?: (claim: Claim) => void;
  onOpenDetails?: (claim: Claim) => void;
  // Selection
  selectable?: boolean;
  isSelectable?: (id: string) => boolean;
  isSelected?: (id: string) => boolean;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  allSelected?: boolean;
  hasAnySelectable?: boolean;
}

function FlatTable({
  claims,
  sortKey,
  sortDir,
  onSort,
  readOnly,
  onApprove,
  onReject,
  onFlagForLater,
  onOpenDetails,
  selectable = false,
  isSelectable,
  isSelected,
  onToggleSelect,
  onToggleSelectAll,
  allSelected = false,
  hasAnySelectable = false,
}: FlatTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const headers: { key: SortKey; label: string }[] = [
    { key: "employeeName", label: "Employee" },
    { key: "benefitType", label: "Category" },
    { key: "amount", label: "Amount" },
    { key: "dateSubmitted", label: "Date" },
    { key: "status", label: "Status" },
    { key: "risk", label: "Risk" },
  ];

  const thStyle: CSSProperties = {
    ...font,
    padding: "var(--space-3) var(--space-4)",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "var(--text-xs)",
    color: "var(--color-muted-foreground)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    backgroundColor: "var(--color-card)",
    borderBottom: "1px solid var(--color-border)",
    cursor: "pointer",
    userSelect: "none",
  };

  const tdStyle: CSSProperties = {
    ...font,
    padding: "var(--space-3) var(--space-4)",
    borderBottom: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
    fontSize: "var(--text-sm)",
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    return sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-lg)",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {selectable && hasAnySelectable && (
              <th style={{ ...thStyle, width: 36, cursor: "default" }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleSelectAll?.()}
                  aria-label="Select all actionable claims"
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
              </th>
            )}
            {headers.map((h) => (
              <th key={h.key} style={thStyle} onClick={() => onSort(h.key)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {h.label} <SortIcon k={h.key} />
                </span>
              </th>
            ))}
            <th style={thStyle}>{/* actions */}</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => {
            const isOpen = expandedRow === c.id;
            const rowSelectable = selectable && isSelectable?.(c.id);
            const rowSelected = isSelected?.(c.id) ?? false;
            return (
              <React.Fragment key={c.id}>
                <tr
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (onOpenDetails) onOpenDetails(c);
                    else setExpandedRow(isOpen ? null : c.id);
                  }}
                >
                  {selectable && hasAnySelectable && (
                    <td style={{ ...tdStyle, width: 36 }} onClick={(e) => e.stopPropagation()}>
                      {rowSelectable && onToggleSelect && (
                        <input
                          type="checkbox"
                          checked={rowSelected}
                          onChange={() => onToggleSelect(c.id)}
                          aria-label={`Select claim ${c.id}`}
                          style={{ width: 16, height: 16, cursor: "pointer" }}
                        />
                      )}
                    </td>
                  )}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "var(--rounded-full)",
                          backgroundColor: c.avatarColor || "var(--brand-navy)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {c.initials || c.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.employeeName}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>{c.employeeId || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{c.benefitType || c.category}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{formatAmountINR(parseINR(c.claimAmount))}</td>
                  <td style={tdStyle}>{formatDate(c.dateSubmitted)}</td>
                  <td style={tdStyle}>
                    <StatusPill status={c.status} />
                  </td>
                  <td style={tdStyle}>
                    <RiskBadge level={c.riskLevel} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td
                      colSpan={selectable && hasAnySelectable ? 8 : 7}
                      style={{ padding: "var(--space-3) var(--space-4)", backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
                    >
                      <ClaimRow
                        claim={c}
                        readOnly={readOnly}
                        onApprove={onApprove}
                        onReject={onReject}
                        onFlagForLater={onFlagForLater}
                        onOpenDetails={onOpenDetails}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
