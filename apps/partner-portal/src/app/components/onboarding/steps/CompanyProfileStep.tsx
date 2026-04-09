import React from "react";
import { Building2, User, Mail, Phone, Briefcase } from "lucide-react";
import type { CompanyProfileData } from "../hooks/useOnboardingState";

interface Props {
  data: CompanyProfileData;
  onChange: (d: Partial<CompanyProfileData>) => void;
}

const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Manufacturing",
  "Retail & E-commerce",
  "Education",
  "Consulting",
  "Real Estate",
  "Media & Entertainment",
  "Other",
];

const COMPANY_SIZES = [
  "1 - 50",
  "51 - 200",
  "201 - 500",
  "501 - 1000",
  "1001 - 5000",
  "5000+",
];

const FISCAL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CompanyProfileStep({ data, onChange }: Props) {
  return (
    <div>
      <div style={styles.header}>
        <div style={styles.iconWrap}>
          <Building2 size={24} />
        </div>
        <div>
          <h2 style={styles.title}>Company Profile</h2>
          <p style={styles.subtitle}>
            Tell us about your organization to configure your benefits portal
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* ─── Company Details ─────────────────────────────────────── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Company Details</h3>

          <label style={styles.label}>
            Company Name <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            placeholder="e.g. Acme Technologies Pvt. Ltd."
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
          />

          <label style={styles.label}>
            Industry <span style={styles.required}>*</span>
          </label>
          <select
            style={styles.select}
            value={data.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          <label style={styles.label}>
            Company Size <span style={styles.required}>*</span>
          </label>
          <select
            style={styles.select}
            value={data.companySize}
            onChange={(e) => onChange({ companySize: e.target.value })}
          >
            <option value="">Select size</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Fiscal Year Starts</label>
              <select
                style={styles.select}
                value={data.fiscalYearStart}
                onChange={(e) => onChange({ fiscalYearStart: e.target.value })}
              >
                {FISCAL_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Payroll Day</label>
              <input
                style={styles.input}
                type="number"
                min={1}
                max={31}
                value={data.payrollDay}
                onChange={(e) =>
                  onChange({ payrollDay: Math.min(31, Math.max(1, Number(e.target.value))) })
                }
              />
            </div>
          </div>
        </div>

        {/* ─── HR Admin ───────────────────────────────────────────── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>HR Admin Contact</h3>

          <label style={styles.label}>
            <User size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Full Name <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            placeholder="e.g. Priya Sharma"
            value={data.hrAdminName}
            onChange={(e) => onChange({ hrAdminName: e.target.value })}
          />

          <label style={styles.label}>
            <Mail size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Email <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            type="email"
            placeholder="priya@company.com"
            value={data.hrAdminEmail}
            onChange={(e) => onChange({ hrAdminEmail: e.target.value })}
          />

          <label style={styles.label}>
            <Phone size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Phone
          </label>
          <input
            style={styles.input}
            type="tel"
            placeholder="+91 98765 43210"
            value={data.hrAdminPhone}
            onChange={(e) => onChange({ hrAdminPhone: e.target.value })}
          />

          <label style={styles.label}>
            <Briefcase size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Designation
          </label>
          <input
            style={styles.input}
            placeholder="e.g. HR Director"
            value={data.hrAdminDesignation}
            onChange={(e) => onChange({ hrAdminDesignation: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 32,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: "var(--rounded-lg)",
    background: "var(--brand-navy-alpha-8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--brand-navy)",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "var(--text-xl)",
    fontWeight: 600,
    color: "var(--color-foreground)",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "var(--text-sm)",
    color: "var(--color-muted-foreground)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 32,
  },
  section: {
    padding: 24,
    borderRadius: "var(--rounded-lg)",
    border: "1px solid var(--color-border)",
    background: "var(--color-background)",
  },
  sectionTitle: {
    margin: "0 0 20px",
    fontSize: "var(--text-lg)",
    fontWeight: 600,
    color: "var(--color-foreground)",
  },
  label: {
    display: "block",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    color: "var(--color-foreground)",
    marginBottom: 6,
    marginTop: 16,
  },
  required: {
    color: "var(--brand-red)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
    fontSize: "var(--text-sm)",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s ease",
    boxSizing: "border-box" as const,
    background: "var(--color-background)",
    color: "var(--color-foreground)",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-md)",
    fontSize: "var(--text-sm)",
    fontFamily: "inherit",
    outline: "none",
    background: "var(--color-background)",
    color: "var(--color-foreground)",
    cursor: "pointer",
    boxSizing: "border-box" as const,
  },
  row: {
    display: "flex",
    gap: 16,
    marginTop: 0,
  },
};
