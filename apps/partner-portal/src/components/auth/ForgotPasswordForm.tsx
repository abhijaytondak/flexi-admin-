"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "request" | "sent";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email is required");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address");
      return;
    }

    setError(undefined);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    setStep("sent");
  }

  async function handleResend() {
    if (submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    toast.success("Reset link resent");
  }

  if (step === "sent") {
    return (
      <div>
        <div
          className="flex flex-col items-center"
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--rounded-full)",
              backgroundColor: "var(--brand-green-light)",
              color: "var(--brand-green)",
              marginBottom: 12,
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              color: "var(--color-foreground)",
              margin: 0,
            }}
          >
            Reset link sent
          </h2>
        </div>

        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-muted-foreground)",
            textAlign: "center",
            lineHeight: 1.5,
            marginTop: 0,
            marginBottom: 20,
          }}
        >
          Check your inbox at{" "}
          <span style={{ color: "var(--color-foreground)", fontWeight: 500 }}>
            {email}
          </span>
          . The link expires in 15 minutes.
        </p>

        <div
          className="flex flex-col items-center gap-3"
          style={{ marginBottom: 4 }}
        >
          <button
            type="button"
            onClick={handleResend}
            disabled={submitting}
            className="flex items-center justify-center gap-2"
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--rounded-md)",
              padding: "10px 16px",
              cursor: submitting ? "not-allowed" : "pointer",
              color: "var(--color-foreground)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              fontFamily: "inherit",
              width: "100%",
              height: 40,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Resending…" : "Resend link"}
          </button>
          <Link
            href="/login"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--brand-accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  // Step 1 — request
  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 12px 0 38px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
    fontSize: "var(--text-base)",
    color: "var(--color-foreground)",
    backgroundColor: "var(--color-card)",
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            color: "var(--color-foreground)",
            margin: 0,
            marginBottom: 6,
          }}
        >
          Forgot your password?
        </h2>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-muted-foreground)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="forgot-email"
            style={{
              display: "block",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-foreground)",
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <div style={{ position: "relative" }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 12,
                top: 0,
                height: 40,
                display: "flex",
                alignItems: "center",
                color: "var(--color-muted-foreground)",
              }}
            >
              <Mail size={16} />
            </span>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(undefined);
              }}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "forgot-email-error" : undefined}
              placeholder="you@company.com"
              disabled={submitting}
              style={{
                ...inputBaseStyle,
                borderColor: error
                  ? "var(--color-destructive)"
                  : "var(--color-border)",
              }}
            />
          </div>
          {error && (
            <span
              id="forgot-email-error"
              role="alert"
              style={{
                display: "block",
                marginTop: 6,
                fontSize: "var(--text-xs)",
                color: "var(--color-destructive)",
              }}
            >
              {error}
            </span>
          )}
        </div>

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
            marginBottom: 16,
          }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Sending…" : "Send reset link"}
        </button>

        <div style={{ textAlign: "center" }}>
          <Link
            href="/login"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--brand-accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
