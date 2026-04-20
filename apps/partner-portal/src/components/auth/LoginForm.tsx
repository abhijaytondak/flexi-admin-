"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const next: Errors = {};
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = "Enter a valid email address";
    }
    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }
    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    // Simulate async auth
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Signed in successfully");
    router.push("/");
    // Keep button disabled during navigation transition
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    color: "var(--color-foreground)",
    marginBottom: 6,
  };

  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 12px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
    fontSize: "var(--text-base)",
    color: "var(--color-foreground)",
    backgroundColor: "var(--color-card)",
    fontFamily: "inherit",
    outline: "none",
  };

  const errorStyle: React.CSSProperties = {
    display: "block",
    marginTop: 6,
    fontSize: "var(--text-xs)",
    color: "var(--color-destructive)",
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Email ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="email" style={labelStyle}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          placeholder="you@company.com"
          disabled={submitting}
          style={{
            ...inputBaseStyle,
            borderColor: errors.email
              ? "var(--color-destructive)"
              : "var(--color-border)",
          }}
        />
        {errors.email && (
          <span id="email-error" role="alert" style={errorStyle}>
            {errors.email}
          </span>
        )}
      </div>

      {/* ── Password ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="password" style={labelStyle}>
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((p) => ({ ...p, password: undefined }));
            }}
            aria-invalid={errors.password ? "true" : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="At least 8 characters"
            disabled={submitting}
            style={{
              ...inputBaseStyle,
              paddingRight: 40,
              borderColor: errors.password
                ? "var(--color-destructive)"
                : "var(--color-border)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              height: 40,
              width: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-muted-foreground)",
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <span id="password-error" role="alert" style={errorStyle}>
            {errors.password}
          </span>
        )}
      </div>

      {/* ── Remember me ────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 20 }}
      >
        <label
          htmlFor="remember"
          className="flex items-center gap-2"
          style={{
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            color: "var(--color-foreground)",
          }}
        >
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={submitting}
            style={{
              width: 16,
              height: 16,
              accentColor: "var(--brand-accent)",
              cursor: "pointer",
            }}
          />
          Remember me
        </label>

        <Link
          href="/forgot-password"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--brand-accent)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Forgot password?
        </Link>
      </div>

      {/* ── Submit ─────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2"
        style={{
          width: "100%",
          height: 42,
          border: "none",
          borderRadius: "var(--rounded-md)",
          backgroundColor: submitting
            ? "var(--brand-accent-hover)"
            : "var(--brand-accent)",
          color: "#FFFFFF",
          fontSize: "var(--text-base)",
          fontWeight: 500,
          cursor: submitting ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          transition: "background-color 150ms ease",
          opacity: submitting ? 0.85 : 1,
        }}
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
