import type { CategoryLimitRow } from "./types";
import { CategoryLimitsTable } from "./CategoryLimitsTable";
import { cardBase, sectionSubtitle, sectionTitle } from "./shared";

interface Props {
  rows: CategoryLimitRow[];
}

/**
 * Company-Wide layout — a single flat table of all 13 flexi benefit categories
 * applied uniformly to every employee.
 */
export function CompanyWideView({ rows }: Props) {
  return (
    <section style={cardBase} aria-label="Category & Limits (Company-Wide)">
      <header
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h2 style={sectionTitle}>Category &amp; Limits</h2>
        <p style={sectionSubtitle}>
          Applies uniformly to all employees under the Company-Wide configuration.
        </p>
      </header>
      <CategoryLimitsTable rows={rows} />
    </section>
  );
}
