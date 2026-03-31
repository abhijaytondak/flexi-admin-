import { type CSSProperties, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterConfig {
  type: "pills" | "dropdown";
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const barStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  flexWrap: "wrap",
};

const pillBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  padding: "6px 14px",
  borderRadius: "var(--rounded-full)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  fontFamily: "'IBM Plex Sans', sans-serif",
  border: "1px solid var(--color-border)",
  cursor: "pointer",
  transition: "all 150ms ease-out",
  whiteSpace: "nowrap",
  lineHeight: 1.3,
};

const pillInactive: CSSProperties = {
  ...pillBase,
  backgroundColor: "var(--color-background)",
  color: "var(--color-muted-foreground)",
};

const pillActive: CSSProperties = {
  ...pillBase,
  backgroundColor: "var(--brand-accent)",
  color: "#fff",
  borderColor: "var(--brand-navy)",
};

const searchWrapStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const searchInputStyle: CSSProperties = {
  padding: "7px 12px 7px 34px",
  fontSize: "var(--text-sm)",
  fontFamily: "'IBM Plex Sans', sans-serif",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  outline: "none",
  width: 220,
  transition: "border-color 150ms ease-out, box-shadow 150ms ease-out",
};

const searchIconStyle: CSSProperties = {
  position: "absolute",
  left: 10,
  color: "var(--color-muted-foreground)",
  pointerEvents: "none",
};

const dropdownWrapStyle: CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
};

const selectStyle: CSSProperties = {
  appearance: "none",
  padding: "7px 32px 7px 12px",
  fontSize: "var(--text-sm)",
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontWeight: 500,
  border: "1px solid var(--color-border)",
  borderRadius: "var(--rounded-md)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  cursor: "pointer",
  outline: "none",
  transition: "border-color 150ms ease-out",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div style={barStyle}>
      {/* Search input */}
      {onSearchChange && (
        <div style={searchWrapStyle}>
          <Search size={15} style={searchIconStyle} aria-hidden="true" />
          <input
            type="text"
            value={searchQuery ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              ...searchInputStyle,
              borderColor: searchFocused
                ? "var(--brand-navy)"
                : "var(--color-border)",
              boxShadow: searchFocused
                ? "0 0 0 3px var(--brand-navy-alpha-12)"
                : "none",
            }}
            aria-label="Search"
          />
        </div>
      )}

      {/* Filter groups */}
      {filters.map((filter) => {
        if (filter.type === "pills") {
          return (
            <div
              key={filter.key}
              role="radiogroup"
              aria-label={filter.label}
              style={{ display: "flex", gap: "var(--space-2)" }}
            >
              {filter.options.map((opt) => {
                const isActive = activeFilters[filter.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => onFilterChange(filter.key, opt.value)}
                    style={isActive ? pillActive : pillInactive}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-card)";
                        e.currentTarget.style.borderColor =
                          "var(--brand-navy-alpha-20)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-background)";
                        e.currentTarget.style.borderColor =
                          "var(--color-border)";
                      }
                    }}
                  >
                    {opt.label}
                    {opt.count !== undefined && (
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          opacity: isActive ? 0.8 : 0.6,
                          fontWeight: 400,
                        }}
                      >
                        {opt.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        }

        /* Dropdown filter */
        return (
          <div key={filter.key} style={dropdownWrapStyle}>
            <select
              value={activeFilters[filter.key] ?? ""}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              style={selectStyle}
              aria-label={filter.label}
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                color: "var(--color-muted-foreground)",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
}
