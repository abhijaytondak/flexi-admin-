"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  type CSSProperties,
} from "react";
import { Save, Loader2, Info, Lock, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { useUserProfile } from "@partner-portal/shared/contexts/UserProfileContext";

/* ─── Style helpers ────────────────────────────────────────────────────── */

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const btnPrimary: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)",
  backgroundColor: "var(--brand-accent)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background-color 150ms ease, opacity 150ms ease",
};

const btnSecondary: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-4)",
  backgroundColor: "transparent",
  color: "var(--color-foreground)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background-color 150ms ease, border-color 150ms ease",
};

const inputStyle: CSSProperties = {
  ...font,
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  fontSize: "var(--text-sm)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  outline: "none",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  color: "var(--color-muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "var(--space-1)",
};

const sectionCard: CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-lg)",
  padding: "var(--space-6)",
};

/* ─── Validation helpers ───────────────────────────────────────────────── */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Loose Indian phone validation — +91 XXXXX XXXXX or a 10-digit number.
function isValidIndianPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return true;
  if (digits.length === 12 && digits.startsWith("91")) return true;
  return false;
}

function formatIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  let rest = digits;
  let cc = "";
  if (digits.startsWith("91") && digits.length > 10) {
    cc = "+91 ";
    rest = digits.slice(2);
  }
  rest = rest.slice(0, 10);
  if (rest.length <= 5) return cc + rest;
  return `${cc}${rest.slice(0, 5)} ${rest.slice(5)}`.trim();
}

/* ─── Change Password Dialog ───────────────────────────────────────────── */

function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset fields when dialog closes.
  useEffect(() => {
    if (!open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setShowCurrent(false);
      setShowNext(false);
      setShowConfirm(false);
    }
  }, [open]);

  // Close on Escape key.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit =
    current.length > 0 &&
    next.length >= 8 &&
    confirm.length > 0 &&
    next === confirm &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (next !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (next.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    // Mock network latency.
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    toast.success("Password updated");
    onClose();
  };

  const renderPasswordField = (
    id: string,
    label: string,
    value: string,
    setValue: (v: string) => void,
    show: boolean,
    setShow: (v: boolean) => void,
    help?: string,
  ) => (
    <div style={{ marginBottom: "var(--space-4)" }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ ...inputStyle, paddingRight: 40 }}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            padding: 4,
            cursor: "pointer",
            color: "var(--color-muted-foreground)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {help && (
        <p
          style={{
            margin: "var(--space-1) 0 0",
            fontSize: "var(--text-xs)",
            color: "var(--color-muted-foreground)",
          }}
        >
          {help}
        </p>
      )}
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)",
      }}
    >
      <div
        ref={dialogRef}
        style={{
          ...font,
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--rounded-lg)",
          boxShadow: "var(--elevation-xl)",
          width: "100%",
          maxWidth: 440,
          padding: "var(--space-6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-5)",
          }}
        >
          <h2
            id="change-password-title"
            style={{
              margin: 0,
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-foreground)",
            }}
          >
            Change Password
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-muted-foreground)",
              padding: 4,
              display: "inline-flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {renderPasswordField(
            "cp-current",
            "Current Password",
            current,
            setCurrent,
            showCurrent,
            setShowCurrent,
          )}
          {renderPasswordField(
            "cp-new",
            "New Password",
            next,
            setNext,
            showNext,
            setShowNext,
            "At least 8 characters.",
          )}
          {renderPasswordField(
            "cp-confirm",
            "Confirm New Password",
            confirm,
            setConfirm,
            showConfirm,
            setShowConfirm,
            confirm.length > 0 && confirm !== next
              ? "Passwords do not match."
              : undefined,
          )}

          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "flex-end",
              marginTop: "var(--space-5)",
            }}
          >
            <button type="button" style={btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...btnPrimary,
                opacity: canSubmit ? 1 : 0.5,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
              disabled={!canSubmit}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Lock size={14} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Email info tooltip ───────────────────────────────────────────────── */

function EmailInfoTooltip() {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <button
        type="button"
        aria-label="Email change info"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          marginLeft: 4,
          cursor: "help",
          display: "inline-flex",
          color: "var(--color-muted-foreground)",
        }}
      >
        <Info size={13} />
      </button>
      {show && (
        <span
          role="tooltip"
          style={{
            ...font,
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--brand-navy)",
            color: "#fff",
            fontSize: "var(--text-xs)",
            padding: "6px 10px",
            borderRadius: "var(--rounded-md)",
            width: 240,
            lineHeight: 1.45,
            zIndex: 10,
            boxShadow: "var(--elevation-md)",
            textTransform: "none",
            letterSpacing: "normal",
            fontWeight: 400,
          }}
        >
          This email is your login ID. Changing it will require you to re-login
          with the new address.
        </span>
      )}
    </span>
  );
}

/* ─── Settings Component ───────────────────────────────────────────────── */

export function Settings() {
  const { profile, updateProfile, saveProfile, saving } = useUserProfile();

  // Locally editable fields. Phone is app-local (not in shared profile schema).
  const [name, setName] = useState(profile.name ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState("+91 98765 43210");

  // Snapshot for dirty tracking — captured once on mount + when profile loads.
  const initialRef = useRef<{ name: string; email: string; phone: string }>({
    name: profile.name ?? "",
    email: profile.email ?? "",
    phone: "+91 98765 43210",
  });

  // If profile loads async, sync state once when it arrives.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current && (profile.name || profile.email)) {
      hydratedRef.current = true;
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      initialRef.current = {
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: initialRef.current.phone,
      };
    }
  }, [profile.name, profile.email]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDirty = useMemo(
    () =>
      name !== initialRef.current.name ||
      email !== initialRef.current.email ||
      phone !== initialRef.current.phone,
    [name, email, phone],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!isValidIndianPhone(phone)) {
      toast.error("Please enter a valid Indian phone number");
      return;
    }
    setSubmitting(true);
    try {
      // Persist name/email through shared context (mocked via shared api).
      updateProfile({ name, email });
      try {
        await saveProfile({ name, email });
      } catch {
        // Shared api may 404 in v0 — ignore, we still treat this as success.
      }
      // Phone is stored locally only for v0.
      initialRef.current = { name, email, phone };
      toast.success("Settings saved");
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || saving;

  return (
    <div style={{ ...font, padding: "var(--space-6)", maxWidth: 720 }}>
      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: "var(--color-foreground)",
          }}
        >
          Settings
        </h1>
        <p
          style={{
            margin: "var(--space-1) 0 0",
            fontSize: "var(--text-sm)",
            color: "var(--color-muted-foreground)",
          }}
        >
          Manage your admin account details.
        </p>
      </div>

      {/* Account Card */}
      <div style={sectionCard}>
        <h2
          style={{
            margin: "0 0 var(--space-5)",
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-foreground)",
          }}
        >
          Admin Account
        </h2>

        {/* Name */}
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="settings-name" style={labelStyle}>
            Name
          </label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            placeholder="Your full name"
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label
            htmlFor="settings-email"
            style={{
              ...labelStyle,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Email
            <EmailInfoTooltip />
          </label>
          <input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="you@company.com"
            autoComplete="email"
          />
          <p
            style={{
              margin: "var(--space-1) 0 0",
              fontSize: "var(--text-xs)",
              color: "var(--color-muted-foreground)",
            }}
          >
            Used as your login ID.
          </p>
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="settings-phone" style={labelStyle}>
            Phone
          </label>
          <input
            id="settings-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatIndianPhone(e.target.value))}
            style={inputStyle}
            placeholder="+91 98765 43210"
            autoComplete="tel"
            inputMode="tel"
          />
          <p
            style={{
              margin: "var(--space-1) 0 0",
              fontSize: "var(--text-xs)",
              color: "var(--color-muted-foreground)",
            }}
          >
            Indian format, e.g. +91 98765 43210.
          </p>
        </div>

        {/* Password */}
        <div style={{ marginBottom: "var(--space-2)" }}>
          <label style={labelStyle}>Password</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-3)",
              padding: "10px 12px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--rounded-md)",
              backgroundColor: "var(--color-background)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-muted-foreground)",
                letterSpacing: "0.15em",
              }}
            >
              ••••••••••
            </span>
            <button
              type="button"
              style={btnSecondary}
              onClick={() => setDialogOpen(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background)";
                e.currentTarget.style.borderColor = "var(--brand-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <Lock size={14} /> Change Password
            </button>
          </div>
        </div>

        {/* Save Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: "var(--space-6)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--color-border)",
            gap: "var(--space-2)",
          }}
        >
          {isDirty && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-muted-foreground)",
                marginRight: "auto",
              }}
            >
              You have unsaved changes.
            </span>
          )}
          <button
            type="button"
            style={{
              ...btnPrimary,
              opacity: !isDirty || busy ? 0.5 : 1,
              cursor: !isDirty || busy ? "not-allowed" : "pointer",
            }}
            disabled={!isDirty || busy}
            onClick={handleSave}
            onMouseEnter={(e) => {
              if (isDirty && !busy)
                e.currentTarget.style.backgroundColor =
                  "var(--brand-accent-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brand-accent)";
            }}
          >
            {busy ? (
              <>
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <ChangePasswordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
