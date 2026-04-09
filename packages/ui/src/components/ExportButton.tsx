import { useState, useRef, useEffect, type CSSProperties } from "react";
import {
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  File,
  Loader2,
} from "lucide-react";

type ExportFormat = "csv" | "excel" | "pdf";

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  loading?: boolean;
  disabled?: boolean;
}

const FORMAT_OPTIONS: {
  format: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    format: "csv",
    label: "CSV",
    description: "Comma-separated values",
    icon: FileText,
  },
  {
    format: "excel",
    label: "Excel",
    description: "Microsoft Excel workbook",
    icon: FileSpreadsheet,
  },
  {
    format: "pdf",
    label: "PDF",
    description: "Portable document format",
    icon: File,
  },
];

export function ExportButton({
  onExport,
  loading = false,
  disabled = false,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [hoveredFormat, setHoveredFormat] = useState<ExportFormat | null>(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const isDisabled = disabled || loading;

  const buttonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-2) var(--space-4)",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: "#fff",
    backgroundColor: isDisabled
      ? "var(--color-muted-foreground)"
      : btnHovered
      ? "var(--brand-navy-hover)"
      : "var(--brand-navy)",
    border: "none",
    borderRadius: "var(--rounded-md)",
    cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "background-color 150ms ease-out",
    opacity: isDisabled ? 0.6 : 1,
  };

  const dropdownStyle: CSSProperties = {
    position: "absolute",
    top: "calc(100% + var(--space-1))",
    right: 0,
    minWidth: 220,
    backgroundColor: "var(--color-background)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--rounded-lg)",
    boxShadow: "var(--elevation-lg)",
    padding: "var(--space-1) 0",
    zIndex: 50,
    /* Entrance animation */
    animation: "exportDropIn 150ms ease-out",
  };

  const itemStyle = (isHovered: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    width: "100%",
    padding: "var(--space-3) var(--space-4)",
    border: "none",
    backgroundColor: isHovered ? "var(--color-card)" : "transparent",
    cursor: "pointer",
    fontFamily: "'IBM Plex Sans', sans-serif",
    textAlign: "left",
    transition: "background-color 120ms ease",
  });

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Inline keyframes for dropdown entrance */}
      <style>{`
        @keyframes exportDropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        onClick={() => !isDisabled && setOpen((v) => !v)}
        disabled={isDisabled}
        style={buttonStyle}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {loading ? (
          <Loader2
            size={15}
            style={{ animation: "spin 800ms linear infinite" }}
          />
        ) : (
          <Download size={15} />
        )}
        Export
        <ChevronDown
          size={14}
          style={{
            transition: "transform 150ms ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Spinner keyframe */}
      {loading && (
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      )}

      {open && !isDisabled && (
        <div style={dropdownStyle} role="menu">
          {FORMAT_OPTIONS.map(({ format, label, description, icon: FmtIcon }) => (
            <button
              key={format}
              role="menuitem"
              style={itemStyle(hoveredFormat === format)}
              onMouseEnter={() => setHoveredFormat(format)}
              onMouseLeave={() => setHoveredFormat(null)}
              onClick={() => {
                onExport(format);
                setOpen(false);
              }}
            >
              <FmtIcon
                size={18}
                style={{ color: "var(--color-muted-foreground)", flexShrink: 0 }}
              />
              <div>
                <div
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    color: "var(--color-foreground)",
                    lineHeight: 1.3,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-muted-foreground)",
                    lineHeight: 1.3,
                    marginTop: 1,
                  }}
                >
                  {description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
