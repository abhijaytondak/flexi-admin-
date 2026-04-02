import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import * as api from "../../utils/api";
import { PLAN_META, BENEFIT_PLANS, type Employee, type BenefitPlan } from "../../types";

const PAGE_SIZE = 50;

interface Props {
  employees: Employee[];
  onRefresh: () => void;
}

const font: React.CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

export function BandAssignmentView({ employees, onRefresh }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reassigning, setReassigning] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input (300ms)
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return employees;
    const q = debouncedSearch.toLowerCase();
    return employees.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q)
    );
  }, [employees, debouncedSearch]);

  // Pagination calculations
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const columns: BenefitPlan[] = BENEFIT_PLANS;

  // Group the paginated employees for display
  const grouped = useMemo(() => {
    const map = Object.fromEntries(BENEFIT_PLANS.map(p => [p, [] as Employee[]])) as Record<BenefitPlan, Employee[]>;
    for (const emp of paginatedEmployees) {
      map[emp.benefitPlan]?.push(emp);
    }
    return map;
  }, [paginatedEmployees]);

  // Total counts per band (across all filtered, not just current page)
  const totalCountsPerBand = useMemo(() => {
    const map = Object.fromEntries(BENEFIT_PLANS.map(p => [p, 0])) as Record<BenefitPlan, number>;
    for (const emp of filtered) {
      if (map[emp.benefitPlan] !== undefined) map[emp.benefitPlan]++;
    }
    return map;
  }, [filtered]);

  const handleReassign = async (emp: Employee, newPlan: BenefitPlan) => {
    if (newPlan === emp.benefitPlan) return;
    setReassigning(prev => new Set(prev).add(emp.id));
    try {
      await api.updateEmployee(emp.id, { benefitPlan: newPlan });
      toast.success(`${emp.name} reassigned to ${newPlan}`);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to reassign");
    } finally {
      setReassigning(prev => {
        const next = new Set(prev);
        next.delete(emp.id);
        return next;
      });
    }
  };

  return (
    <div style={{ ...font }}>
      {/* Search */}
      <div style={{ marginBottom: 20, position: "relative", maxWidth: 400 }}>
        <Search
          size={16}
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}
        />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          style={{
            width: "100%", padding: "8px 12px 8px 36px",
            border: "1px solid #EBEBEB", borderRadius: 12,
            fontSize: 14, backgroundColor: "#fff", color: "#111827",
            outline: "none", fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        />
      </div>

      {/* 3-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {columns.map(plan => {
          const meta = PLAN_META[plan];
          const list = grouped[plan];

          return (
            <div
              key={plan}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #EBEBEB",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #EBEBEB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: meta.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{plan}</span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: meta.color,
                    backgroundColor: meta.bgColor,
                    border: `1px solid ${meta.borderColor}`,
                    padding: "2px 10px",
                    borderRadius: 9999,
                  }}
                >
                  {totalCountsPerBand[plan]} employee{totalCountsPerBand[plan] !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Employee Cards */}
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto" }}>
                {list.length === 0 ? (
                  <p style={{ textAlign: "center", padding: 20, color: "#9CA3AF", fontSize: 13 }}>
                    No employees
                  </p>
                ) : (
                  list.map(emp => (
                    <div
                      key={emp.id}
                      style={{
                        border: "1px solid #EBEBEB",
                        borderRadius: 10,
                        padding: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: emp.color || "#3498DB",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {emp.initials || emp.name?.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {emp.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>{emp.department}</div>
                        <div style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{emp.salary}</div>
                      </div>

                      {/* Reassign Dropdown */}
                      <select
                        value={emp.benefitPlan}
                        disabled={reassigning.has(emp.id)}
                        onChange={e => handleReassign(emp, e.target.value as BenefitPlan)}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #EBEBEB",
                          borderRadius: 6,
                          fontSize: 12,
                          color: "#374151",
                          backgroundColor: "#fff",
                          cursor: reassigning.has(emp.id) ? "not-allowed" : "pointer",
                          opacity: reassigning.has(emp.id) ? 0.5 : 1,
                          fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                      >
                        {BENEFIT_PLANS.map(p => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, marginTop: 24, fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "6px 14px", border: "1px solid #EBEBEB", borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: currentPage === 1 ? "not-allowed" : "pointer",
              backgroundColor: "#fff", color: currentPage === 1 ? "#D1D5DB" : "#374151",
              opacity: currentPage === 1 ? 0.6 : 1,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          {/* Page numbers */}
          {(() => {
            const pages: (number | "ellipsis")[] = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (currentPage > 3) pages.push("ellipsis");
              for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
              }
              if (currentPage < totalPages - 2) pages.push("ellipsis");
              pages.push(totalPages);
            }
            return pages.map((p, idx) =>
              p === "ellipsis" ? (
                <span key={`ellipsis-${idx}`} style={{ padding: "0 4px", color: "#9CA3AF", fontSize: 13 }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    minWidth: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center",
                    border: currentPage === p ? "1px solid #3B82F6" : "1px solid #EBEBEB",
                    borderRadius: 8, fontSize: 13, fontWeight: currentPage === p ? 700 : 400,
                    cursor: "pointer",
                    backgroundColor: currentPage === p ? "#EFF6FF" : "#fff",
                    color: currentPage === p ? "#3B82F6" : "#374151",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {p}
                </button>
              )
            );
          })()}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "6px 14px", border: "1px solid #EBEBEB", borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              backgroundColor: "#fff", color: currentPage === totalPages ? "#D1D5DB" : "#374151",
              opacity: currentPage === totalPages ? 0.6 : 1,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            Next <ChevronRight size={14} />
          </button>

          <span style={{ marginLeft: 12, fontSize: 13, color: "#6B7280" }}>
            Showing {((currentPage - 1) * PAGE_SIZE) + 1}--{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
        </div>
      )}
    </div>
  );
}
