import React, { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import {
  User, Palette, Bell, GitBranch, Shield, Database, Save, Check,
  AlertCircle, ToggleLeft, ToggleRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import * as api from "../utils/api";
import { useUserProfile, AVATAR_COLORS } from "../contexts/UserProfileContext";
import { getInitials } from "../utils/helpers";
import { BENEFIT_PLANS, DEFAULT_PROFILE, type AdminProfile, type DashboardCards } from "../types";

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

const sectionCard: CSSProperties = {
  backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-lg)", padding: "var(--space-6)",
  transition: "box-shadow 200ms ease-out",
};

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "workflow", label: "Workflow", icon: GitBranch },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data", icon: Database },
] as const;

type TabId = typeof TABS[number]["id"];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DIGEST_OPTIONS = ["realtime", "daily", "weekly", "never"] as const;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Settings() {
  const { profile, updateProfile, saveProfile, saving: profileSaving } = useUserProfile();

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [saving, setSaving] = useState(false);

  // Track unsaved changes per tab
  const [dirtyTabs, setDirtyTabs] = useState<Set<TabId>>(new Set());

  // Snapshot of original profile for dirty tracking
  const profileSnapshotRef = useRef<string>("");
  const settingsSnapshotRef = useRef<string>("");

  // Preview avatar color (only applied on save)
  const [previewAvatarColor, setPreviewAvatarColor] = useState<string>(profile.avatarColor);

  // Local settings state (for workflow/security/notifications/data tabs)
  const [settings, setSettings] = useState({
    // Notifications
    emailEnabled: true,
    slackEnabled: false,
    digestFrequency: "daily" as string,
    notifyOnClaim: true,
    notifyOnApproval: true,
    notifyOnNewEmployee: true,
    notifyOnPolicyChange: false,
    // Workflow
    autoApproveThreshold: 5000,
    escalationHours: 48,
    // Security
    twoFactorEnabled: false,
    sessionTimeout: 30,
    // Data
    exportFormat: profile.exportFormat || "pdf",
    dataRetention: profile.dataRetention || "2years",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSettings();
        if (res.data) {
          setSettings(prev => {
            const merged = { ...prev, ...res.data };
            settingsSnapshotRef.current = JSON.stringify(merged);
            return merged;
          });
        }
      } catch { /* use defaults */ }
    })();
  }, []);

  // Update snapshot when profile loads
  useEffect(() => {
    profileSnapshotRef.current = JSON.stringify({
      name: profile.name, designation: profile.designation,
      email: profile.email, employeeId: profile.employeeId,
      avatarColor: profile.avatarColor,
    });
    setPreviewAvatarColor(profile.avatarColor);
  }, []);

  // Mark tab dirty on profile field changes
  const markDirty = (tab: TabId) => {
    setDirtyTabs(prev => {
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  };

  const clearDirty = (tab: TabId) => {
    setDirtyTabs(prev => {
      const next = new Set(prev);
      next.delete(tab);
      return next;
    });
  };

  const handleSaveSection = useCallback(async () => {
    setSaving(true);
    try {
      if (activeTab === "profile") {
        // Validate email
        if (!isValidEmail(profile.email)) {
          toast.error("Please enter a valid email address");
          setSaving(false);
          return;
        }
        // Apply preview avatar color to profile before saving
        updateProfile({ avatarColor: previewAvatarColor });
        await saveProfile({ avatarColor: previewAvatarColor });
        toast.success("Profile updated");
      } else if (activeTab === "appearance") {
        await saveProfile({ dashboardCards: profile.dashboardCards, fiscalYearStart: profile.fiscalYearStart, showGreeting: profile.showGreeting });
        toast.success("Appearance updated");
      } else {
        await api.saveSettings(settings);
        if (activeTab === "data") {
          await saveProfile({ exportFormat: settings.exportFormat as any, dataRetention: settings.dataRetention as any });
        }
        toast.success("Settings saved");
      }
      clearDirty(activeTab);
    } catch (e: any) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [activeTab, settings, profile, saveProfile, previewAvatarColor, updateProfile]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Determine which tab this setting belongs to
    const notifKeys = ["emailEnabled", "slackEnabled", "digestFrequency", "notifyOnClaim", "notifyOnApproval", "notifyOnNewEmployee", "notifyOnPolicyChange"];
    const workflowKeys = ["autoApproveThreshold", "escalationHours"];
    const securityKeys = ["twoFactorEnabled", "sessionTimeout"];
    const dataKeys = ["exportFormat", "dataRetention"];
    if (notifKeys.includes(key)) markDirty("notifications");
    else if (workflowKeys.includes(key)) markDirty("workflow");
    else if (securityKeys.includes(key)) markDirty("security");
    else if (dataKeys.includes(key)) markDirty("data");
  };

  const toggleDashboardCard = (key: keyof DashboardCards) => {
    updateProfile({
      dashboardCards: { ...profile.dashboardCards, [key]: !profile.dashboardCards[key] },
    });
    markDirty("appearance");
  };

  const renderToggle = (value: boolean, onChange: () => void) => (
    <button
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      onClick={onChange}
      tabIndex={0}
      role="switch"
      aria-checked={value}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange();
        }
      }}
    >
      {value
        ? <ToggleRight size={24} style={{ color: "var(--brand-green)" }} />
        : <ToggleLeft size={24} style={{ color: "var(--color-muted-foreground)" }} />}
    </button>
  );

  const renderField = (label: string, children: React.ReactNode) => (
    <div style={{ marginBottom: "var(--space-4)" }}>
      <label style={{
        display: "block", fontSize: "var(--text-xs)", fontWeight: 600,
        color: "var(--color-muted-foreground)", textTransform: "uppercase",
        letterSpacing: "0.04em", marginBottom: "var(--space-1)",
      }}>
        {label}
      </label>
      {children}
    </div>
  );

  const renderToggleRow = (label: string, description: string, value: boolean, onChange: () => void) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "var(--space-3) 0", borderBottom: "1px solid var(--color-border)",
    }}>
      <div>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>{description}</p>
      </div>
      {renderToggle(value, onChange)}
    </div>
  );

  const renderSaveButton = () => (
    <div style={{
      display: "flex", alignItems: "center", gap: "var(--space-3)",
      marginTop: "var(--space-6)", paddingTop: "var(--space-4)",
      borderTop: "1px solid var(--color-border)",
    }}>
      <button style={{
        ...btnPrimary,
        opacity: saving || profileSaving ? 0.7 : 1,
      }} onClick={handleSaveSection}
        disabled={saving || profileSaving}
        onMouseEnter={e => { if (!saving && !profileSaving) e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)"; }}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--brand-accent)"}>
        {saving || profileSaving ? (
          <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
        ) : (
          <><Save size={14} /> Save Changes</>
        )}
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Profile Settings
            </h3>

            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "var(--rounded-full)",
                backgroundColor: previewAvatarColor, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--text-xl)", fontWeight: 700,
                transition: "background-color 200ms ease",
              }}>
                {profile.initials}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)" }}>
                  Avatar Color
                </p>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                  {AVATAR_COLORS.map(c => (
                    <button key={c} onClick={() => { setPreviewAvatarColor(c); markDirty("profile"); }}
                      style={{
                        width: 24, height: 24, borderRadius: "50%", backgroundColor: c,
                        border: previewAvatarColor === c ? "2px solid var(--color-foreground)" : "2px solid transparent",
                        cursor: "pointer", padding: 0,
                        transition: "transform 100ms",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              {renderField("Name",
                <input style={inputStyle} value={profile.name}
                  onChange={e => { updateProfile({ name: e.target.value, initials: getInitials(e.target.value) }); markDirty("profile"); }} />
              )}
              {renderField("Designation",
                <input style={inputStyle} value={profile.designation}
                  onChange={e => { updateProfile({ designation: e.target.value }); markDirty("profile"); }} />
              )}
              {renderField("Email",
                <input style={inputStyle} value={profile.email} type="email"
                  onChange={e => { updateProfile({ email: e.target.value }); markDirty("profile"); }} />
              )}
              {renderField("Employee ID",
                <input style={inputStyle} value={profile.employeeId}
                  onChange={e => { updateProfile({ employeeId: e.target.value }); markDirty("profile"); }} />
              )}
            </div>

            {renderSaveButton()}
          </div>
        );

      case "appearance":
        return (
          <div>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Appearance
            </h3>

            <div style={{ marginBottom: "var(--space-6)" }}>
              <h4 style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Dashboard Cards
              </h4>
              <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                Choose which KPI cards appear on the dashboard
              </p>
              {[
                { key: "totalBenefitOutgo" as const, label: "Total Benefit Outgo", desc: "Shows total benefits disbursed" },
                { key: "avgTaxSaved" as const, label: "Avg Tax Saved", desc: "Average tax savings per employee" },
                { key: "pendingApprovals" as const, label: "Pending Approvals", desc: "Number of claims awaiting review" },
                { key: "activeEmployees" as const, label: "Active Employees", desc: "Count of active employees" },
              ].map(card => (
                renderToggleRow(card.label, card.desc, profile.dashboardCards[card.key], () => toggleDashboardCard(card.key))
              ))}
            </div>

            {renderField("Fiscal Year Start",
              <select style={inputStyle} value={profile.fiscalYearStart}
                onChange={e => { updateProfile({ fiscalYearStart: e.target.value }); markDirty("appearance"); }}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            {renderToggleRow("Show Greeting", "Display time-based greeting on dashboard",
              profile.showGreeting, () => { updateProfile({ showGreeting: !profile.showGreeting }); markDirty("appearance"); }
            )}

            {renderSaveButton()}
          </div>
        );

      case "notifications":
        return (
          <div>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Notifications
            </h3>

            <div style={{ marginBottom: "var(--space-6)" }}>
              <h4 style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Channels
              </h4>
              {renderToggleRow("Email Notifications", "Receive notifications via email",
                settings.emailEnabled, () => updateSetting("emailEnabled", !settings.emailEnabled)
              )}
              {renderToggleRow("Slack Notifications", "Receive notifications in Slack",
                settings.slackEnabled, () => updateSetting("slackEnabled", !settings.slackEnabled)
              )}
            </div>

            {renderField("Digest Frequency",
              <select style={inputStyle} value={settings.digestFrequency}
                onChange={e => updateSetting("digestFrequency", e.target.value)}>
                {DIGEST_OPTIONS.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            )}

            <div style={{ marginTop: "var(--space-4)" }}>
              <h4 style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                Event Subscriptions
              </h4>
              {renderToggleRow("New Claim Submitted", "Notify when an employee submits a new claim",
                settings.notifyOnClaim, () => updateSetting("notifyOnClaim", !settings.notifyOnClaim)
              )}
              {renderToggleRow("Claim Approved/Rejected", "Notify when a claim status changes",
                settings.notifyOnApproval, () => updateSetting("notifyOnApproval", !settings.notifyOnApproval)
              )}
              {renderToggleRow("New Employee Added", "Notify when a new employee is onboarded",
                settings.notifyOnNewEmployee, () => updateSetting("notifyOnNewEmployee", !settings.notifyOnNewEmployee)
              )}
              {renderToggleRow("Policy Changes", "Notify when policy brackets are modified",
                settings.notifyOnPolicyChange, () => updateSetting("notifyOnPolicyChange", !settings.notifyOnPolicyChange)
              )}
            </div>

            {renderSaveButton()}
          </div>
        );

      case "workflow":
        return (
          <div>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Workflow Settings
            </h3>

            {renderField("Auto-Approve Threshold (INR)",
              <div>
                <input type="number" style={inputStyle} value={settings.autoApproveThreshold}
                  onChange={e => updateSetting("autoApproveThreshold", Number(e.target.value))} />
                <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                  Claims below this amount will be auto-approved. Set to 0 to disable.
                </p>
              </div>
            )}

            {renderField("Escalation Timer (Hours)",
              <div>
                <input type="number" style={inputStyle} value={settings.escalationHours}
                  onChange={e => updateSetting("escalationHours", Number(e.target.value))} />
                <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                  Pending claims older than this are escalated to senior admins.
                </p>
              </div>
            )}

            {renderSaveButton()}
          </div>
        );

      case "security":
        return (
          <div>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Security
            </h3>

            {renderToggleRow("Two-Factor Authentication", "Require 2FA for admin sign-in",
              settings.twoFactorEnabled, () => updateSetting("twoFactorEnabled", !settings.twoFactorEnabled)
            )}

            <div style={{ marginTop: "var(--space-4)" }}>
              {renderField("Session Timeout (Minutes)",
                <div>
                  <input type="number" style={inputStyle} value={settings.sessionTimeout}
                    onChange={e => updateSetting("sessionTimeout", Number(e.target.value))} />
                  <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                    Automatically sign out after this period of inactivity.
                  </p>
                </div>
              )}
            </div>

            {renderSaveButton()}
          </div>
        );

      case "data":
        return (
          <div>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Data Management
            </h3>

            {renderField("Export Format",
              <select style={inputStyle} value={settings.exportFormat}
                onChange={e => updateSetting("exportFormat", e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </select>
            )}

            {renderField("Data Retention",
              <div>
                <select style={inputStyle} value={settings.dataRetention}
                  onChange={e => updateSetting("dataRetention", e.target.value)}>
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                  <option value="5years">5 Years</option>
                  <option value="unlimited">Unlimited</option>
                </select>
                <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                  How long to retain claims and payroll data before archiving.
                </p>
              </div>
            )}

            {renderSaveButton()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ ...font, padding: "var(--space-6)" }}>
      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-foreground)" }}>
          Settings
        </h1>
        <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
          Configure your SalarySe FlexiBenefits portal
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "var(--space-5)" }}>
        {/* Tab Nav */}
        <div style={{
          display: "flex", flexDirection: "column", gap: "var(--space-1)",
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const isDirty = dirtyTabs.has(tab.id);
            const TabIcon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                ...font, display: "flex", alignItems: "center", gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--rounded-md)", border: "none",
                fontSize: "var(--text-sm)", fontWeight: isActive ? 600 : 400,
                cursor: "pointer", textAlign: "left",
                backgroundColor: isActive ? "var(--brand-navy-alpha-08)" : "transparent",
                color: isActive ? "var(--brand-navy)" : "var(--color-muted-foreground)",
                transition: "all 150ms",
                position: "relative",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--color-background)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
                <TabIcon size={16} />
                {tab.label}
                {isDirty && (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    backgroundColor: "var(--brand-accent)",
                    marginLeft: "auto", flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={sectionCard}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
