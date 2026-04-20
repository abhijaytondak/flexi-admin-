"use client";

import {
  useState,
  useCallback,
  useMemo,
  type CSSProperties,
  type FormEvent,
} from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "request" | "sent";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailError = useMemo(() => {
    if (!touched) return "";
    if (!email) return "Email is required.";
    if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
    return "";
  }, [email, touched]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setTouched(true);
      if (!EMAIL_RE.test(email)) return;
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 500));
      setSubmitting(false);
      setStep("sent");
    },
    [email],
  );

  const handleResend = useCallback(async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    toast.success(`Reset link resent to ${email}`);
  }, [email]);

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
      {step === "request" ? (
        <>
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
              Reset your password
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-sm)",
                color: "var(--color-muted-foreground)",
                lineHeight: 1.5,
              }}
            >
              Enter the email associated with your account. We will send you a secure link to set a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="fp-email"
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--color-muted-foreground)",
                }}
              >
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="you@company.com"
                aria-invalid={!!emailError}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  borderRadius: "var(--rounded-md)",
                  border: `1px solid ${emailError ? "var(--brand-red-border)" : "var(--color-border)"}`,
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-foreground)",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "var(--text-sm)",
                  outline: "none",
                  transition: "border-color 150ms ease",
                  boxSizing: "border-box",
                }}
              />
              {emailError ? (
                <span role="alert" style={{ fontSize: "var(--text-xs)", color: "var(--brand-red)" }}>
                  {emailError}
                </span>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
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
                backgroundColor: "var(--brand-accent)",
                color: "#fff",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                cursor: submitting ? "default" : "pointer",
                transition: "background-color 150ms ease",
                opacity: submitting ? 0.85 : 1,
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = "var(--brand-accent-hover)";
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = "var(--brand-accent)";
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                  Sending
                </>
              ) : (
                "Send reset link"
              )}
            </button>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                alignSelf: "flex-start",
                fontSize: "var(--text-sm)",
                color: "var(--color-muted-foreground)",
                textDecoration: "none",
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Confirmation */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--rounded-md)",
                backgroundColor: "var(--brand-green-light)",
                border: "1px solid var(--brand-green-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MailCheck size={20} style={{ color: "var(--brand-green-dark)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "var(--text-xl)",
                  fontWeight: 600,
                  lineHeight: 1.25,
                  color: "var(--color-foreground)",
                  letterSpacing: "-0.01em",
                }}
              >
                Check your inbox
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--text-sm)",
                  color: "var(--color-muted-foreground)",
                  lineHeight: 1.55,
                }}
              >
                Reset link sent to <strong style={{ color: "var(--color-foreground)", fontWeight: 600 }}>{email}</strong>.
                Link expires in 15 minutes.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={submitting}
              style={{
                ...font,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                height: 38,
                padding: "0 14px",
                borderRadius: "var(--rounded-md)",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-foreground)",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                cursor: submitting ? "default" : "pointer",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = "var(--color-surface)";
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = "var(--color-background)";
              }}
            >
              {submitting ? (
                <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
              ) : null}
              Resend
            </button>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "var(--text-sm)",
                color: "var(--color-muted-foreground)",
                textDecoration: "none",
                fontWeight: 500,
                padding: "0 10px",
                height: 38,
                lineHeight: "38px",
              }}
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </section>
  );
}
