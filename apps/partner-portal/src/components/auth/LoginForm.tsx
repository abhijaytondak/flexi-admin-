"use client";

import {
  useState,
  useCallback,
  useMemo,
  type CSSProperties,
  type FormEvent,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email) return "Email is required.";
    if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
    return "";
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }, [password, touched.password]);

  const canSubmit = email.length > 0 && password.length > 0 && !submitting;

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setTouched({ email: true, password: true });
      if (!EMAIL_RE.test(email) || password.length < 6) return;

      setSubmitting(true);
      // Mock auth — any credentials succeed. Short, respectful delay.
      await new Promise((r) => setTimeout(r, 450));
      toast.success("Welcome back");
      router.push("/");
    },
    [email, password, router],
  );

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  return (
    <section
      style={{
        ...font,
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-md)",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            lineHeight: 1.2,
            color: "var(--color-foreground)",
            letterSpacing: "-0.01em",
          }}
        >
          Sign in
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "var(--text-sm)",
            color: "var(--color-muted-foreground)",
            lineHeight: 1.5,
          }}
        >
          Access your HR admin workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Email field */}
        <Field
          id="login-email"
          label="Email"
          error={emailError}
        >
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={onEmailChange}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="you@company.com"
            aria-invalid={!!emailError}
            style={inputStyle(!!emailError)}
          />
        </Field>

        {/* Password field */}
        <Field
          id="login-password"
          label="Password"
          error={passwordError}
        >
          <div style={{ position: "relative" }}>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={onPasswordChange}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="Enter your password"
              aria-invalid={!!passwordError}
              style={{ ...inputStyle(!!passwordError), paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-muted-foreground)",
                padding: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {/* Remember + forgot row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: "var(--text-sm)",
              color: "var(--color-foreground)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--brand-accent)" }}
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

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            ...font,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            height: 40,
            padding: "0 16px",
            borderRadius: "var(--rounded-md)",
            border: "1px solid var(--brand-accent)",
            backgroundColor: canSubmit ? "var(--brand-accent)" : "var(--brand-accent-alpha-20)",
            color: "#fff",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "background-color 150ms ease",
            opacity: canSubmit ? 1 : 0.85,
          }}
          onMouseEnter={(e) => {
            if (canSubmit) e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (canSubmit) e.currentTarget.style.backgroundColor = "var(--brand-accent)";
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
              Signing in
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </section>
  );
}

// ─── Small helpers (scoped to auth) ──────────────────────────────────────────

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
        }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <span
          role="alert"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--brand-red)",
            lineHeight: 1.4,
          }}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}

function inputStyle(hasError: boolean): CSSProperties {
  return {
    width: "100%",
    height: 40,
    padding: "0 12px",
    borderRadius: "var(--rounded-md)",
    border: `1px solid ${hasError ? "var(--brand-red-border)" : "var(--color-border)"}`,
    backgroundColor: "var(--color-background)",
    color: "var(--color-foreground)",
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: "var(--text-sm)",
    outline: "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    boxSizing: "border-box",
  };
}
