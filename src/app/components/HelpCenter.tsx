import { useState, useRef, useEffect, type CSSProperties } from "react";
import {
  Search,
  Rocket,
  ClipboardCheck,
  Download,
  Settings,
  ChevronDown,
  Mail,
  Phone,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

const font: CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" };

const card: CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid #EBEBEB",
  borderRadius: 12,
  padding: "var(--space-6)",
};

/* ─── Quick-link data ──────────────────────────────────────────────────── */

const QUICK_LINKS = [
  {
    title: "Getting Started",
    icon: Rocket,
    description: "Set up your organization, import employees, configure benefits",
  },
  {
    title: "Managing Claims",
    icon: ClipboardCheck,
    description: "Approve, reject, and track employee benefit claims",
  },
  {
    title: "Payroll Export",
    icon: Download,
    description: "Generate and download monthly payroll reports",
  },
  {
    title: "Policy Configuration",
    icon: Settings,
    description: "Configure salary bands, allowances, and limits",
  },
] as const;

/* ─── FAQ data ─────────────────────────────────────────────────────────── */

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I import employees?",
    answer:
      "Navigate to the Employee Directory and click the \"Import\" button in the top-right corner. Download the CSV template, fill in employee details (name, email, CTC, department, designation), then upload the completed file. The system validates each row and highlights any errors before confirming the import.",
  },
  {
    question: "How does benefit plan auto-detection work?",
    answer:
      "SalarySe automatically assigns a benefit plan based on each employee's CTC. Employees with a CTC below \u20B96.5 LPA are placed on the Standard plan. Those between \u20B96.5\u201310 LPA receive the Premium plan, and employees above \u20B910 LPA are assigned the Executive plan. You can override the auto-detected plan from the employee\u2019s profile drawer.",
  },
  {
    question: "How do I approve claims in bulk?",
    answer:
      "Go to the Approval Queue, select the claims you want to act on using the checkboxes, and a floating action bar will appear at the bottom of the screen. From there you can approve or reject all selected claims in one click.",
  },
  {
    question: "How do I export payroll data?",
    answer:
      "Navigate to Payroll Export from the sidebar, select the payroll cycle (month/year), review the summary, and click the \"Export\" button to download the report as a CSV or Excel file.",
  },
  {
    question: "What happens at fiscal year end?",
    answer:
      "At fiscal year end, each benefit category follows the rule configured in Policy Engine: unused amounts can be carried forward to the next year, encashed to the employee, or lapsed (forfeited). You can configure these rules per plan under Settings \u2192 Fiscal.",
  },
  {
    question: "How do I configure submission deadlines?",
    answer:
      "Go to Settings \u2192 Fiscal \u2192 Deadlines. You can set a monthly claim-submission cutoff date (e.g., the 5th of each month) and a fiscal-year-end final submission deadline.",
  },
  {
    question: "Can I edit an employee\u2019s benefit plan?",
    answer:
      "Yes. Open the Employee Directory, click on the employee\u2019s row to open the profile drawer, and use the Plan dropdown to change their assigned benefit plan. Changes take effect from the next payroll cycle.",
  },
  {
    question: "How do I set up the onboarding wizard?",
    answer:
      "Navigate to /onboarding from the browser address bar or use the sidebar link. The wizard walks you through company setup, employee import, plan configuration, and a review step before going live.",
  },
];

/* ─── Keyboard shortcuts ───────────────────────────────────────────────── */

const SHORTCUTS = [
  { keys: "ESC", action: "Close drawers / modals" },
  { keys: "\u2318K", action: "Focus search" },
  { keys: "\u2318S", action: "Save current form (future)" },
];

/* ─── Accordion Item ───────────────────────────────────────────────────── */

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
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
    <div
      style={{
        borderBottom: "1px solid #EBEBEB",
      }}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between"
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

/* ─── HelpCenter Component ─────────────────────────────────────────────── */

export function HelpCenter() {
  const [searchValue, setSearchValue] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filtered = searchValue.trim()
    ? FAQS.filter(
        (f) =>
          f.question.toLowerCase().includes(searchValue.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : FAQS;

  const filteredLinks = searchValue.trim()
    ? QUICK_LINKS.filter(
        (l) =>
          l.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          l.description.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : QUICK_LINKS;

  return (
    <div style={{ ...font, maxWidth: 960, margin: "0 auto" }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 24,
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
            color: "var(--sidebar-text-muted)",
            marginTop: 4,
          }}
        >
          Find answers, learn features, get support
        </p>

        {/* Search bar */}
        <div
          className="flex items-center gap-2"
          style={{
            maxWidth: 520,
            margin: "24px auto 0",
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid #EBEBEB",
            backgroundColor: "var(--color-card)",
          }}
        >
          <Search
            size={18}
            style={{ color: "var(--sidebar-text-muted)", flexShrink: 0 }}
          />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{
              ...font,
              border: "none",
              outline: "none",
              background: "none",
              fontSize: "var(--text-base)",
              color: "var(--color-foreground)",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* ── Quick Links ─────────────────────────────────────────────────── */}
      {filteredLinks.length > 0 && (
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
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.title}
                  style={{
                    ...card,
                    cursor: "default",
                    transition: "box-shadow 200ms ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: "var(--brand-accent-alpha-12)",
                      marginBottom: 12,
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
                      color: "var(--sidebar-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {link.description}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── FAQ Accordion ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: 40 }}>
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
          {filtered.length === 0 && (
            <p
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "var(--sidebar-text-muted)",
                fontSize: "var(--text-sm)",
              }}
            >
              No matching questions found.
            </p>
          )}
          {filtered.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ── Contact Support ─────────────────────────────────────────────── */}
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-foreground)",
            marginBottom: 16,
          }}
        >
          Need more help?
        </h2>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="flex items-center gap-2">
              <Mail size={15} style={{ color: "var(--brand-accent)" }} />
              <a
                href="mailto:support@salaryse.com"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--brand-accent)",
                  textDecoration: "none",
                }}
              >
                support@salaryse.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} style={{ color: "var(--brand-accent)" }} />
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-foreground)",
                }}
              >
                +91 80-XXXX-XXXX
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              toast("Support ticket feature coming soon", {
                duration: 3000,
              })
            }
            className="flex items-center gap-2"
            style={{
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
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--brand-accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--brand-accent)")
            }
          >
            <Ticket size={15} />
            Submit a ticket
          </button>
        </div>
      </section>

      {/* ── Keyboard Shortcuts ──────────────────────────────────────────── */}
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-foreground)",
            marginBottom: 16,
          }}
        >
          Keyboard Shortcuts
        </h2>
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <table
            style={{
              ...font,
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "var(--text-sm)",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderBottom: "1px solid #EBEBEB",
                }}
              >
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 24px",
                    fontWeight: 600,
                    color: "var(--sidebar-text-muted)",
                    fontSize: "var(--text-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Shortcut
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 24px",
                    fontWeight: 600,
                    color: "var(--sidebar-text-muted)",
                    fontSize: "var(--text-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUTS.map((s) => (
                <tr
                  key={s.keys}
                  style={{ borderBottom: "1px solid #EBEBEB" }}
                >
                  <td style={{ padding: "10px 24px" }}>
                    <kbd
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid #EBEBEB",
                        backgroundColor: "var(--color-surface)",
                        fontSize: "var(--text-xs)",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        color: "var(--color-foreground)",
                      }}
                    >
                      {s.keys}
                    </kbd>
                  </td>
                  <td
                    style={{
                      padding: "10px 24px",
                      color: "var(--color-foreground)",
                    }}
                  >
                    {s.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
