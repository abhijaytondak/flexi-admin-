# Migration Status: Monorepo Architecture

## Status: COMPLETE

**Date**: 2026-04-09

## Structure

```
partner-portal/
├── apps/
│   └── partner-portal/          # Vite React app (all pages & features)
├── packages/
│   ├── config/                  # Shared TypeScript & ESLint configs
│   ├── shared/                  # Types, API, helpers, hooks, contexts
│   └── ui/                      # 7 reusable UI components
├── turbo.json                   # TurboRepo pipeline config
├── pnpm-workspace.yaml          # pnpm workspace config
└── package.json                 # Root workspace scripts
```

## Packages

### @partner-portal/config
- `tsconfig.base.json` - Shared TypeScript base config
- `tsconfig.react.json` - React-specific TS config
- `eslint.config.js` - Shared ESLint config

### @partner-portal/shared
- `src/types/` - All type definitions (Employee, Claim, Policy, Admin, etc.)
- `src/utils/api.ts` - Supabase API client
- `src/utils/helpers.ts` - Utility functions (formatINR, getInitials, etc.)
- `src/utils/demoData.ts` - Demo data for presentations
- `src/hooks/` - useIsMobile, useFiscalYear
- `src/contexts/` - UserProfileContext, SearchContext

### @partner-portal/ui
- StatCard, DataTable, FilterBar, EmptyState
- ExportButton, StepIndicator, ProgressRing

### @partner-portal/app (apps/partner-portal)
- All page components (Dashboard, PolicyEngine, ApprovalQueue, etc.)
- Layout, routing, error handling
- Vite build system with Tailwind CSS

## Commands

```bash
pnpm dev          # Start dev server (via Turbo)
pnpm build        # Build all packages + app
pnpm lint         # Lint all packages
pnpm test         # Run tests
```

## Import Patterns

```typescript
// From shared package
import { type Employee, BENEFIT_PLANS } from "@partner-portal/shared";
import * as api from "@partner-portal/shared/api";
import { formatINR } from "@partner-portal/shared/helpers";
import { useIsMobile } from "@partner-portal/shared/hooks/useIsMobile";
import { useUserProfile } from "@partner-portal/shared/contexts/UserProfileContext";

// From UI package
import { StatCard, DataTable, FilterBar } from "@partner-portal/ui";
```
