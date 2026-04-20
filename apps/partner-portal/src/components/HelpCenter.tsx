"use client";

import {
  useState,
  useRef,
  useEffect,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  Rocket,
  ClipboardCheck,
  Download,
  SlidersHorizontal,
  ChevronDown,
  Mail,
  Ticket,
  ArrowRight,
  X,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Style helpers ────────────────────────────────────────────────────── */

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const card: CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: "var(--space-6)",
};

const btnPrimary: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 20px",
  backgroundColor: "var(--brand-accent)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background-color 150ms ease, opacity 150ms ease",
};

const btnSecondary: CSSProperties = {
  ...font,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 16px",
  backgroundColor: "transparent",
  color: "var(--color-foreground)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
};

/* ─── Quick-link data ──────────────────────────────────────────────────── */

const QUICK_LINKS = [
  {
    id: "faq-getting-started",
    title: "Getting Started",
    icon: Rocket,
    description: "Orient yourself to the SalarySe HR dashboard.",
  },
  {
    id: "faq-managing-claims",
    title: "Managing Claims",
    icon: ClipboardCheck,
    description: "Learn how the approval queue and auto-approval work.",
  },
  {
    id: "faq-payroll-export",
    title: "Payroll Export",
    icon: Download,
    description: "Generate reimbursement files for your payroll team.",
  },
  {
    id: "faq-policy-configuration",
    title: "Policy Configuration",
    icon: SlidersHorizontal,
    description: "Understand your company's benefit rules.",
  },
] as const;

/* ─── FAQ data ─────────────────────────────────────────────────────────── */

type Faq = { anchor?: string; question: string; answer: string };

const FAQS: Faq[] = [
  {
    anchor: "faq-getting-started",
    question: "What is flexi-benefits?",
    answer:
      "Flexi-benefits let employees allocate a portion of their CTC across tax-advantaged categories such as meals, fuel, books, and wellness. SalarySe tracks each employee's monthly allocations, claims, and balances so your payroll team can reimburse the right amount each cycle.",
  },
  {
    anchor: "faq-managing-claims",
    question: "How do auto-approvals work?",
    answer:
      "When auto-approval is enabled, any claim that is below your configured limit, has a valid receipt, and is flagged low-risk by Uplift AI is approved instantly and moved to the next payroll batch. Everything else lands in the approval queue for a human admin to review.",
  },
  {
    question: "What is Uplift AI and why are claims flagged?",
    answer:
      "Uplift AI is our anomaly-detection layer that scores each claim against receipt authenticity, duplicates, policy fit, and historical employee behaviour. Claims with a high-risk score are flagged in the queue with a reason code so you can focus your review time on the few items that matter.",
  },
  {
    question: "How do I switch between cycles?",
    answer:
      "Use the cycle selector at the top of the Approval Queue, Payroll Export, or Analytics screens to jump between the current month, previous months, or an upcoming cycle. Data is scoped to the selected cycle across all three surfaces.",
  },
  {
    anchor: "faq-payroll-export",
    question: "What happens after payroll cutoff?",
    answer:
      "Once the monthly cutoff passes, the cycle is locked: no new claims can be added and the admin can generate the final Payroll Export. Any claims employees submit afterwards automatically roll into the next cycle.",
  },
  {
    anchor: "faq-policy-configuration",
    question: "Can I edit company configuration?",
    answer:
      "Core policy items such as benefit brackets, per-category limits, and eligible plan bands are managed by the SalarySe team in v0. Use the Submit a Ticket button below (or email support) with the changes you need and we will turn them around within one business day.",
  },
  {
    question: "How do employees raise disputes?",
    answer:
      "Employees can reopen a rejected claim from the SalarySe mobile app within seven days of the decision. The dispute appears back in your Approval Queue with the original reviewer's notes and the employee's response attached.",
  },
  {
    question: "What file formats does Payroll Export support?",
    answer:
      "Payroll Export produces a cycle-level CSV and Excel (.xlsx) file, plus an optional ZIP of receipt attachments. The column layout matches the SalarySe standard schema and can be mapped to most payroll systems including Keka, Zoho Payroll, and Darwinbox.",
  },
  {
    question: "Is there a mobile version?",
    answer:
      "Employees use the SalarySe mobile app to submit claims and track balances. The HR admin dashboard is web-only in v0 and is optimised for desktop and tablet widths.",
  },
  {
    question: "How do I add another admin to my organisation?",
    answer:
      "v0 supports a single admin account per organisation. If you need to transfer ownership or temporarily grant access to a colleague, submit a ticket and our team will help you rotate the login safely.",
  },
  {
    question: "Who do I contact for help?",
    answer:
      "Email support@salaryse.com or use the Submit a Ticket button at the bottom of this page. Our team responds within 24 hours on business days and escalates anything blocking payroll immediately.",
  },
];

/* ─── Accordion Item ───────────────────────────────────────────────────── */

function AccordionItem({
  id,
  question,
  answer,
  isOpen,
  onToggle,
}: {
  id?: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(bodyRef.current.scrollHeight);
    }
  }, [answer, isOpen]);

  return (
    <div id={id} style={{ borderBottom: "1px solid var(--color-border)" }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          ...font,
          width: "100%",
          padding: "16px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "var(--text-base)",
          fontWeight: 500,
          color: "var(--color-foreground)",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span>{question}</span>
        <ChevronDown
          size={16}
          style={{
            flexShrink: 0,
            color: "var(--sidebar-text-muted)",
            transition: "transform 250ms ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        style={{
          overflow: "hidden",
          transition: "height 250ms ease",
          height: isOpen ? height : 0,
        }}
      >
        <div
          ref={bodyRef}
          style={{
            ...font,
            paddingBottom: 16,
            fontSize: "var(--text-sm)",
            lineHeight: 1.65,
            color: "var(--sidebar-text-muted)",
          }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
}

/* ─── Submit Ticket Modal ──────────────────────────────────────────────── */

function SubmitTicketModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubject("");
      setDescription("");
      setSubmitting(false);
    }
  }, [open]);

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
    subject.trim().length > 0 && description.trim().length > 0 && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 450));
    setSubmitting(false);
    toast.success("Ticket submitted. We'll be in touch within 24 hours.");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-ticket-title"
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
        style={{
          ...font,
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--rounded-lg)",
          boxShadow: "var(--elevation-xl)",
          width: "100%",
          maxWidth: 520,
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
            id="submit-ticket-title"
            style={{
              margin: 0,
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-foreground)",
            }}
          >
            Submit a Ticket
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
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label
              htmlFor="ticket-subject"
              style={{
                display: "block",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "var(--space-1)",
              }}
            >
              Subject
            </label>
            <input
              id="ticket-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Payroll Export missing for March cycle"
              style={{
                ...font,
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--rounded-md)",
                fontSize: "var(--text-sm)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-foreground)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <label
              htmlFor="ticket-description"
              style={{
                display: "block",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "var(--space-1)",
              }}
            >
              Description
            </label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share as much detail as possible — steps to reproduce, screenshots, affected employees."
              rows={6}
              style={{
                ...font,
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--rounded-md)",
                fontSize: "var(--text-sm)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-foreground)",
                outline: "none",
                resize: "vertical",
                minHeight: 120,
                lineHeight: 1.5,
              }}
            />
          </div>

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
              disabled={!canSubmit}
              style={{
                ...btnPrimary,
                opacity: canSubmit ? 1 : 0.5,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={14} /> Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── HelpCenter Component ─────────────────────────────────────────────── */

export function HelpCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);

  const handleQuickLink = (anchorId: string) => {
    // Expand the first FAQ with a matching anchor, then scroll to it.
    const idx = FAQS.findIndex((f) => f.anchor === anchorId);
    if (idx !== -1) setOpenFaq(idx);

    // Defer scroll so the accordion has time to expand.
    requestAnimationFrame(() => {
      const el = document.getElementById(anchorId) ?? document.getElementById("faq-section");
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  return (
    <div style={{ ...font, padding: "var(--space-6)", maxWidth: 960, margin: "0 auto" }}>
      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: "var(--color-foreground)",
            margin: 0,
          }}
        >
          Help Center
        </h1>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-muted-foreground)",
            margin: "var(--space-1) 0 0",
          }}
        >
          Find answers, learn features, and get in touch with our team.
        </p>
      </div>

      {/* Quick Links */}
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-foreground)",
            marginBottom: 16,
          }}
        >
          Quick Links
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => handleQuickLink(link.id)}
                style={{
                  ...card,
                  ...font,
                  cursor: "pointer",
                  transition:
                    "box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease",
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--elevation-md)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "var(--brand-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: "var(--brand-accent-alpha-12)",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} style={{ color: "var(--brand-accent)" }} />
                </div>
                <div
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: "var(--color-foreground)",
                    marginBottom: 4,
                  }}
                >
                  {link.title}
                </div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-muted-foreground)",
                    lineHeight: 1.5,
                    marginBottom: 12,
                    flex: 1,
                  }}
                >
                  {link.description}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "var(--brand-accent)",
                  }}
                >
                  Read FAQ <ArrowRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq-section" style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-foreground)",
            marginBottom: 16,
          }}
        >
          Frequently Asked Questions
        </h2>
        <div style={{ ...card, padding: "0 24px" }}>
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              id={faq.anchor}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* Support Contact Card */}
      <section style={{ marginBottom: 40 }}>
        <div
          style={{
            ...card,
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              minWidth: 240,
            }}
          >
            <div
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 600,
                color: "var(--color-foreground)",
              }}
            >
              Still need help?
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "var(--text-sm)",
                color: "var(--color-muted-foreground)",
              }}
            >
              <Mail size={15} style={{ color: "var(--brand-accent)" }} />
              <a
                href="mailto:support@salaryse.com"
                style={{
                  color: "var(--brand-accent)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                support@salaryse.com
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTicketOpen(true)}
            style={btnPrimary}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--brand-accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--brand-accent)")
            }
          >
            <Ticket size={15} />
            Submit a Ticket
          </button>
        </div>
      </section>

      <SubmitTicketModal
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
      />
    </div>
  );
}
