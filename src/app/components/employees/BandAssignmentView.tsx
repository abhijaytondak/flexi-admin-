import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import * as api from "../../utils/api";
import { PLAN_META, BENEFIT_PLANS, type Employee, type BenefitPlan } from "../../types";

interface Props {
  employees: Employee[];
  onRefresh: () => void;
}

const font: React.CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

export function BandAssignmentView({ employees, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [reassigning, setReassigning] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const columns: BenefitPlan[] = BENEFIT_PLANS;

  const grouped = useMemo(() => {
    const map = Object.fromEntries(BENEFIT_PLANS.map(p => [p, [] as Employee[]])) as Record<BenefitPlan, Employee[]>;
    for (const emp of filtered) {
      map[emp.benefitPlan]?.push(emp);
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
          value={search}
          onChange={e => setSearch(e.target.value)}
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
                  {list.length}
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
    </div>
  );
}
