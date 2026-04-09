"use client";

import React, { useState, useMemo } from "react";
import { Send, Users, CheckCircle, Clock, Mail, Info, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import * as api from "@partner-portal/shared/api";
import type { Employee, InviteStatus } from "@partner-portal/shared";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sentTimestamps, setSentTimestamps] = useState<Record<string, string>>({});

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

  const selectAllPending = () => {
    const pendingIds = employees.filter(e => e.inviteStatus === "not_sent" || !e.inviteStatus).map(e => e.id);
    setSelected(new Set(pendingIds));
  };

  const sendInvite = async (emp: Employee) => {
    setSending(prev => new Set(prev).add(emp.id));
    try {
      await api.updateEmployee(emp.id, { inviteStatus: "sent" });
      setSentTimestamps(prev => ({ ...prev, [emp.id]: new Date().toLocaleString() }));
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

  const confirmAndSend = () => {
    const targets = employees.filter(e => selected.has(e.id) && e.inviteStatus !== "accepted");
    if (targets.length === 0) {
      toast.info("No eligible employees selected");
      return;
    }
    setShowConfirmModal(true);
  };

  const sendToSelected = async () => {
    setShowConfirmModal(false);
    const targets = employees.filter(e => selected.has(e.id) && e.inviteStatus !== "accepted");
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

  const selectedTargets = employees.filter(e => selected.has(e.id) && e.inviteStatus !== "accepted");

  return (
    <div style={{ ...font }}>
      {/* Explanatory Banner */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "14px 18px", marginBottom: 20,
        backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE",
        borderRadius: 10,
      }}>
        <Info size={18} style={{ color: "#2563EB", flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#1E40AF" }}>
          Invitations allow employees to access the self-service portal where they can submit benefit claims and upload receipts.
        </p>
      </div>

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

      {/* Bulk Action Bar */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={selectAllPending}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", backgroundColor: "#fff",
            color: "#374151", border: "1px solid #D1D5DB", borderRadius: 8,
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          <CheckCircle size={14} /> Select All Pending
        </button>

        {selected.size > 0 && (
          <>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 12px", backgroundColor: "#EFF6FF",
              color: "#1D4ED8", borderRadius: 9999,
              fontSize: 12, fontWeight: 600, border: "1px solid #BFDBFE",
            }}>
              {selected.size} employee{selected.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={confirmAndSend}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 16px", backgroundColor: "var(--brand-accent, #3498DB)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <Send size={14} /> Send Invites
            </button>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: "#fff", borderRadius: 14, padding: 0,
            width: "100%", maxWidth: 560, maxHeight: "80vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            {/* Modal Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px", borderBottom: "1px solid #EBEBEB",
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Confirm Send Invitations
              </h3>
              <button onClick={() => setShowConfirmModal(false)} style={{
                background: "none", border: "none", cursor: "pointer", padding: 4,
                color: "#6B7280", borderRadius: 6,
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#374151" }}>
                The following {selectedTargets.length} employee{selectedTargets.length !== 1 ? "s" : ""} will receive an invitation email:
              </p>
              <div style={{
                maxHeight: 180, overflowY: "auto", borderRadius: 8,
                border: "1px solid #E5E7EB", marginBottom: 20,
              }}>
                {selectedTargets.map((emp, idx) => (
                  <div key={emp.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 14px", fontSize: 13,
                    borderBottom: idx < selectedTargets.length - 1 ? "1px solid #F3F4F6" : "none",
                  }}>
                    <span style={{ fontWeight: 500, color: "#111827" }}>{emp.name}</span>
                    <span style={{ color: "#6B7280" }}>{emp.email || "No email"}</span>
                  </div>
                ))}
              </div>

              {/* Email Preview */}
              <div style={{
                backgroundColor: "#F9FAFB", borderRadius: 8,
                border: "1px solid #E5E7EB", padding: 16,
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Email Preview
                </p>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                  <p style={{ margin: "0 0 4px" }}><strong>Subject:</strong> You are invited to SalarySe FlexiBenefits</p>
                  <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "10px 0" }} />
                  <p style={{ margin: "0 0 6px" }}>Hello [Employee Name],</p>
                  <p style={{ margin: "0 0 6px" }}>
                    You have been invited to access the SalarySe FlexiBenefits self-service portal. Through this portal you can:
                  </p>
                  <ul style={{ margin: "0 0 6px", paddingLeft: 20 }}>
                    <li>View your assigned benefit plan</li>
                    <li>Submit benefit claims with receipts</li>
                    <li>Track claim approval status</li>
                  </ul>
                  <p style={{ margin: 0, color: "#6B7280", fontStyle: "italic" }}>
                    Click the link in your email to get started.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 10,
              padding: "16px 24px", borderTop: "1px solid #EBEBEB",
            }}>
              <button onClick={() => setShowConfirmModal(false)} style={{
                padding: "8px 18px", backgroundColor: "#fff",
                color: "#374151", border: "1px solid #D1D5DB",
                borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>
                Cancel
              </button>
              <button onClick={sendToSelected} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 20px", backgroundColor: "var(--brand-accent, #3498DB)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                <Send size={14} /> Send {selectedTargets.length} Invite{selectedTargets.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
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
              <span style={{ fontSize: 12, color: "#6B7280" }}>
                {sentTimestamps[emp.id]
                  ? sentTimestamps[emp.id]
                  : (emp.inviteStatus === "sent" || emp.inviteStatus === "accepted")
                    ? emp.dateOfJoining || "—"
                    : "—"}
              </span>
              <span>
                {emp.inviteStatus === "accepted" ? (
                  <span style={{ fontSize: 12, color: "#10B981", fontWeight: 500 }}>Accepted</span>
                ) : emp.inviteStatus === "sent" ? (
                  <button
                    disabled={sending.has(emp.id)}
                    onClick={() => sendInvite(emp)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "4px 12px", backgroundColor: "#fff",
                      color: "#374151", border: "1px solid #D1D5DB", borderRadius: 6,
                      fontSize: 12, fontWeight: 500, cursor: sending.has(emp.id) ? "not-allowed" : "pointer",
                      opacity: sending.has(emp.id) ? 0.6 : 1,
                    }}
                  >
                    <RefreshCw size={12} /> Resend
                  </button>
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
                    <Mail size={12} /> Send Invite
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
