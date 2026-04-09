import React, { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import {
  User, Palette, Bell, GitBranch, Shield, Database, Save,
ToggleLeft, ToggleRight, Loader2, RotateCcw, Mail, LogOut
} from "lucide-react";
import { toast } from "sonner";
import * as api from "@partner-portal/shared/api";
import { useUserProfile, AVATAR_COLORS } from "@partner-portal/shared/contexts/UserProfileContext";
import { getInitials } from "@partner-portal/shared/helpers";
import { type DashboardCards, DEFAULT_PROFILE } from "@partner-portal/shared";

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const btnPrimary: CSSProperties = {
  ...font, display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)", backgroundColor: "var(--brand-accent)",
  color: "#fff", border: "none", borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)", fontWeight: 500, cursor: "pointer",
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
  { id: "workflow", label: "Workflow", icon: GitBranch },
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
    autoApproveEnabled: true,
    autoApproveThreshold: 2000,
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
      } else {
        await api.saveSettings(settings);
        toast.success("Settings saved");
      }
      clearDirty(activeTab);
    } catch (e: any) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [activeTab, settings, profile, saveProfile, previewAvatarColor, updateProfile]);

  const handleResetToDefaults = useCallback(async () => {
    if (!window.confirm("Reset all profile settings to their default values? This cannot be undone.")) return;
    setSaving(true);
    try {
      updateProfile({
        name: DEFAULT_PROFILE.name,
        initials: DEFAULT_PROFILE.initials,
        designation: DEFAULT_PROFILE.designation,
        email: DEFAULT_PROFILE.email,
        employeeId: DEFAULT_PROFILE.employeeId,
        avatarColor: DEFAULT_PROFILE.avatarColor,
        dashboardCards: DEFAULT_PROFILE.dashboardCards,
        fiscalYearStart: DEFAULT_PROFILE.fiscalYearStart,
        showGreeting: DEFAULT_PROFILE.showGreeting,
        exportFormat: DEFAULT_PROFILE.exportFormat,
        dataRetention: DEFAULT_PROFILE.dataRetention,
      });
      setPreviewAvatarColor(DEFAULT_PROFILE.avatarColor);
      await saveProfile({
        name: DEFAULT_PROFILE.name,
        initials: DEFAULT_PROFILE.initials,
        designation: DEFAULT_PROFILE.designation,
        email: DEFAULT_PROFILE.email,
        employeeId: DEFAULT_PROFILE.employeeId,
        avatarColor: DEFAULT_PROFILE.avatarColor,
        dashboardCards: DEFAULT_PROFILE.dashboardCards,
        fiscalYearStart: DEFAULT_PROFILE.fiscalYearStart,
        showGreeting: DEFAULT_PROFILE.showGreeting,
        exportFormat: DEFAULT_PROFILE.exportFormat,
        dataRetention: DEFAULT_PROFILE.dataRetention,
      });
      setSettings(prev => ({
        ...prev,
        exportFormat: DEFAULT_PROFILE.exportFormat || "pdf",
        dataRetention: DEFAULT_PROFILE.dataRetention || "2years",
      }));
      setDirtyTabs(new Set());
      toast.success("Settings reset to defaults");
    } catch {
      toast.error("Failed to reset settings");
    } finally {
      setSaving(false);
    }
  }, [updateProfile, saveProfile]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    markDirty("workflow");
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
      display: "flex", alignItems: "center", justifyContent: "space-between",
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
      <button style={{
        ...font, display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
        padding: "var(--space-2) var(--space-4)", backgroundColor: "transparent",
        color: "var(--color-muted-foreground)", border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-md)", fontSize: "var(--text-sm)",
        fontWeight: 500, cursor: "pointer",
      }}
        onClick={handleResetToDefaults}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-muted-foreground)"; }}>
        <RotateCcw size={14} /> Reset to Defaults
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Profile
            </h3>

            {/* Avatar + Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "var(--rounded-full)",
                backgroundColor: profile.avatarColor, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--text-xl)", fontWeight: 700,
              }}>
                {profile.initials}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
                  {profile.name}
                </p>
                <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "0 0 var(--space-5)" }} />

            {/* Logout */}
            <button
              style={{
                ...btnPrimary,
                backgroundColor: "#EF4444",
              }}
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                  window.location.href = "/";
                }
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#DC2626")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#EF4444")}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        );

      case "workflow":
        return (
          <div>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-foreground)" }}>
              Workflow Settings
            </h3>

            <div style={{
              padding: "var(--space-4)", backgroundColor: "var(--color-background)",
              borderRadius: "var(--rounded-md)", border: "1px solid var(--color-border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: "var(--brand-green)",
                }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-foreground)" }}>
                  Auto-Approve is ON
                </span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "var(--space-3)", backgroundColor: "var(--color-card)",
                borderRadius: "var(--rounded-md)", border: "1px solid var(--color-border)",
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-foreground)" }}>
                    Auto-Approve Limit
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted-foreground)" }}>
                    Claims below this amount are automatically approved
                  </p>
                </div>
                <span style={{
                  fontSize: "var(--text-base)", fontWeight: 700, color: "var(--brand-green)",
                  backgroundColor: "#D1FAE5", padding: "var(--space-1) var(--space-3)",
                  borderRadius: "var(--rounded-md)", border: "1px solid #6EE7B7",
                }}>
                  ₹{settings.autoApproveThreshold.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "var(--space-4) 0" }} />

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

            {/* Contact Us Card */}
            <div
              style={{
                padding: "var(--space-5)",
                marginTop: "var(--space-5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-4)",
                background: "linear-gradient(135deg, var(--brand-accent-alpha-8) 0%, var(--color-card) 100%)",
                borderRadius: "var(--rounded-lg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "var(--rounded-full)",
                  backgroundColor: "var(--brand-accent-alpha-8)", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Shield size={22} style={{ color: "var(--brand-navy)" }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-foreground)" }}>
                    Want to make changes to your policy?
                  </h3>
                  <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)" }}>
                    Contact the Salaryse team to update brackets, add new bands, or modify limits.
                  </p>
                </div>
              </div>
              <a
                href="mailto:support@salaryse.com?subject=Policy%20configuration%20change%20request"
                style={{ ...btnPrimary, textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--brand-accent)")}
              >
                <Mail size={16} /> Contact Us
              </a>
            </div>
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
          Configure your SalarySe benefits portal
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
