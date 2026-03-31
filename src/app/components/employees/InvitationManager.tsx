import React, { useState, useMemo } from "react";
import { Send, Users, CheckCircle, Clock, Mail } from "lucide-react";
import { toast } from "sonner";
import * as api from "../../utils/api";
import type { Employee, InviteStatus } from "../../types";

interface Props {
  employees: Employee[];
  onRefresh: () => void;
}

const font: React.CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const card: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #EBEBEB",
  borderRadius: 12,
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const statusBadge = (status: InviteStatus | undefined): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    not_sent: { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" },
    sent: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
    accepted: { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  };
  const s = map[status || "not_sent"];
  return {
    display: "inline-flex",
    padding: "2px 10px",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    color: s.color,
    backgroundColor: s.bg,
    border: `1px solid ${s.border}`,
  };
};

const statusLabel = (status: InviteStatus | undefined): string => {
  if (status === "sent") return "Sent";
  if (status === "accepted") return "Accepted";
  return "Not Sent";
};

export function InvitationManager({ employees, onRefresh }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const total = employees.length;
    const sent = employees.filter(e => e.inviteStatus === "sent").length;
    const accepted = employees.filter(e => e.inviteStatus === "accepted").length;
    const pending = total - accepted;
    return { total, sent, accepted, pending };
  }, [employees]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === employees.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(employees.map(e => e.id)));
    }
  };

  const sendInvite = async (emp: Employee) => {
    setSending(prev => new Set(prev).add(emp.id));
    try {
      await api.updateEmployee(emp.id, { inviteStatus: "sent" });
      toast.success(`Invite sent to ${emp.name}`);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to send invite");
    } finally {
      setSending(prev => {
        const next = new Set(prev);
        next.delete(emp.id);
        return next;
      });
    }
  };

  const sendToSelected = async () => {
    const targets = employees.filter(e => selected.has(e.id) && e.inviteStatus !== "accepted");
    if (targets.length === 0) {
      toast.info("No eligible employees selected");
      return;
    }
    for (const emp of targets) {
      await sendInvite(emp);
    }
    setSelected(new Set());
  };

  const statCards = [
    { label: "Total Employees", value: stats.total, icon: Users, color: "#3498DB" },
    { label: "Invites Sent", value: stats.sent, icon: Send, color: "#F59E0B" },
    { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "#10B981" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "#6B7280" },
  ];

  return (
    <div style={{ ...font }}>
      {/* Stats Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{s.label}</span>
              <s.icon size={18} color={s.color} />
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Bulk Action */}
      {selected.size > 0 && (
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#374151" }}>{selected.size} selected</span>
          <button
            onClick={sendToSelected}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 16px", backgroundColor: "var(--brand-accent, #3498DB)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Send size={14} /> Send to Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{
        backgroundColor: "#fff", border: "1px solid #EBEBEB",
        borderRadius: 12, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "40px 1.8fr 2fr 1.2fr 0.8fr 1fr 1fr 1fr",
          gap: 12, padding: "12px 16px",
          borderBottom: "1px solid #EBEBEB", backgroundColor: "#FAFAFA",
          fontSize: 11, fontWeight: 600, color: "#6B7280",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          <span>
            <input
              type="checkbox"
              checked={selected.size === employees.length && employees.length > 0}
              onChange={toggleAll}
              style={{ cursor: "pointer" }}
            />
          </span>
          <span>Name</span>
          <span>Email</span>
          <span>Department</span>
          <span>Band</span>
          <span>Invite Status</span>
          <span>Sent Date</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        {employees.length === 0 ? (
          <p style={{ textAlign: "center", padding: 32, color: "#9CA3AF", fontSize: 14 }}>
            No employees found.
          </p>
        ) : (
          employees.map((emp, idx) => (
            <div
              key={emp.id || idx}
              style={{
                display: "grid", gridTemplateColumns: "40px 1.8fr 2fr 1.2fr 0.8fr 1fr 1fr 1fr",
                gap: 12, padding: "10px 16px",
                borderBottom: idx < employees.length - 1 ? "1px solid #EBEBEB" : "none",
                alignItems: "center", transition: "background-color 150ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FAFAFA")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>
                <input
                  type="checkbox"
                  checked={selected.has(emp.id)}
                  onChange={() => toggleSelect(emp.id)}
                  style={{ cursor: "pointer" }}
                />
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{emp.name}</span>
              <span style={{ fontSize: 13, color: "#6B7280" }}>{emp.email || "—"}</span>
              <span style={{ fontSize: 13, color: "#374151" }}>{emp.department}</span>
              <span style={{ fontSize: 13, color: "#374151" }}>{emp.benefitPlan}</span>
              <span><span style={statusBadge(emp.inviteStatus)}>{statusLabel(emp.inviteStatus)}</span></span>
              <span style={{ fontSize: 13, color: "#6B7280" }}>
                {emp.inviteStatus === "sent" || emp.inviteStatus === "accepted" ? emp.dateOfJoining || "—" : "—"}
              </span>
              <span>
                {emp.inviteStatus === "accepted" ? (
                  <span style={{ fontSize: 12, color: "#10B981", fontWeight: 500 }}>Accepted</span>
                ) : (
                  <button
                    disabled={sending.has(emp.id)}
                    onClick={() => sendInvite(emp)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "4px 12px", backgroundColor: "var(--brand-accent, #3498DB)",
                      color: "#fff", border: "none", borderRadius: 6,
                      fontSize: 12, fontWeight: 500, cursor: sending.has(emp.id) ? "not-allowed" : "pointer",
                      opacity: sending.has(emp.id) ? 0.6 : 1,
                    }}
                  >
                    <Mail size={12} />
                    {emp.inviteStatus === "sent" ? "Resend" : "Send Invite"}
                  </button>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
