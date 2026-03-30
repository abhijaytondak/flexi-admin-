import { useState, useCallback, type CSSProperties, type ReactNode } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Inbox } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface Column<T> {
  key: keyof T & string;
  label: string;
  width?: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  emptyMessage?: string;
}

type SortDir = "asc" | "desc" | null;

/* ─── Shared styles ──────────────────────────────────────────────────────── */

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  fontSize: "var(--text-sm)",
};

const thStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  padding: "var(--space-3) var(--space-4)",
  textAlign: "left",
  fontWeight: 600,
  fontSize: "var(--text-xs)",
  color: "var(--color-muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  backgroundColor: "var(--color-card)",
  borderBottom: "1px solid var(--color-border)",
  whiteSpace: "nowrap",
  userSelect: "none",
};

const tdStyle: CSSProperties = {
  padding: "var(--space-3) var(--space-4)",
  borderBottom: "1px solid var(--color-border)",
  color: "var(--color-foreground)",
  verticalAlign: "middle",
};

const checkboxStyle: CSSProperties = {
  width: 16,
  height: 16,
  accentColor: "var(--brand-navy)",
  cursor: "pointer",
  margin: 0,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  selectable = false,
  selectedIds,
  onSelectionChange,
  emptyMessage = "No data to display",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  /* Sort cycle: asc -> desc -> none */
  const handleSort = useCallback(
    (key: string) => {
      if (sortKey !== key) {
        setSortKey(key);
        setSortDir("asc");
      } else if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortKey(null);
        setSortDir(null);
      }
    },
    [sortKey, sortDir]
  );

  /* Selection helpers */
  const selected = selectedIds ?? new Set<string>();
  const allSelected = data.length > 0 && data.every((r) => selected.has(r.id));
  const someSelected = data.some((r) => selected.has(r.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((r) => r.id)));
    }
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  /* Sorted data */
  const sortedData = (() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (aVal == null || bVal == null) return 0;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  })();

  /* Sort icon for a column */
  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey)
      return <ArrowUpDown size={13} style={{ opacity: 0.35 }} />;
    return sortDir === "asc" ? (
      <ArrowUp size={13} />
    ) : (
      <ArrowDown size={13} />
    );
  };

  /* ─── Empty state ──────────────────────────────────────────────────── */
  if (data.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-8) var(--space-6)",
          color: "var(--color-muted-foreground)",
          gap: "var(--space-3)",
        }}
      >
        <Inbox size={40} strokeWidth={1.2} />
        <p
          style={{
            margin: 0,
            fontSize: "var(--text-sm)",
            fontWeight: 500,
          }}
        >
          {emptyMessage}
        </p>
      </div>
    );
  }

  /* ─── Render ───────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--rounded-lg)",
      }}
    >
      <table style={tableStyle}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ ...thStyle, width: 44, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={toggleAll}
                  style={checkboxStyle}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...thStyle,
                  width: col.width,
                  cursor: "pointer",
                }}
                onClick={() => handleSort(col.key)}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-1)",
                  }}
                >
                  {col.label}
                  <SortIcon colKey={col.key} />
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedData.map((row) => {
            const isHovered = hoveredRow === row.id;
            const isSelected = selected.has(row.id);

            return (
              <tr
                key={row.id}
                style={{
                  backgroundColor: isSelected
                    ? "var(--brand-navy-alpha-8)"
                    : isHovered
                    ? "var(--color-card)"
                    : "transparent",
                  transition: "background-color 120ms ease",
                  cursor: onRowClick ? "pointer" : "default",
                }}
                onClick={() => onRowClick?.(row)}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {selectable && (
                  <td
                    style={{ ...tdStyle, width: 44, textAlign: "center" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(row.id)}
                      style={checkboxStyle}
                      aria-label={`Select row ${row.id}`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} style={tdStyle}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
