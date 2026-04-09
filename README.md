# Partner Portal — Monorepo

Enterprise HR Benefits Portal built as a TurboRepo monorepo with shared packages.

## Structure

```
├── apps/
│   └── partner-portal/          # Vite + React SPA
├── packages/
│   ├── config/                  # Shared TypeScript & ESLint configs
│   ├── shared/                  # Types, API client, utils, hooks, contexts
│   └── ui/                      # 7 reusable UI components
├── turbo.json                   # TurboRepo pipeline
├── pnpm-workspace.yaml          # pnpm workspaces
└── package.json                 # Root scripts
```

## Getting Started

```bash
pnpm install
pnpm dev        # Start dev server
pnpm build      # Build all packages + app
pnpm lint       # Lint everything
pnpm test       # Run tests
```

## Packages

### @partner-portal/shared
Types, API client (Supabase), helper functions, hooks (`useIsMobile`, `useFiscalYear`), and contexts (`UserProfileContext`, `SearchContext`).

### @partner-portal/ui
Reusable UI components: `StatCard`, `DataTable`, `FilterBar`, `EmptyState`, `ExportButton`, `StepIndicator`, `ProgressRing`.

### @partner-portal/config
Shared `tsconfig` and ESLint configurations extended by all packages and apps.

## Import Patterns

```typescript
import { type Employee, BENEFIT_PLANS } from "@partner-portal/shared";
import * as api from "@partner-portal/shared/api";
import { formatINR } from "@partner-portal/shared/helpers";
import { useIsMobile } from "@partner-portal/shared/hooks/useIsMobile";
import { useUserProfile } from "@partner-portal/shared/contexts/UserProfileContext";
import { StatCard, DataTable } from "@partner-portal/ui";
```

## Tech Stack
- **Runtime**: React 19, TypeScript 5.9
- **Build**: Vite 8, TurboRepo
- **Styling**: Tailwind CSS 4, CSS variables
- **Backend**: Supabase Edge Functions
- **Package Manager**: pnpm 9
- **Deployment**: Vercel
