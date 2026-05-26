# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kaneo is a self-hosted project management platform built with simplicity and performance as core principles. The codebase is organized as a **pnpm monorepo** with TurboRepo.

**Key Philosophy**: Features exist to solve real problems, not to impress. Avoid over-engineering - keep solutions simple and focused. Don't add features, refactoring, or improvements beyond what was asked.

## Development Commands

### Getting Started
```bash
# Install dependencies (uses pnpm)
pnpm install

# Start all development servers (API + web)
pnpm dev

# Lint and auto-fix code (Biome)
pnpm lint

# Build all packages
pnpm build
```

### API-Specific Commands
```bash
# Run API in development mode
pnpm --filter @kaneo/api dev

# Build API
pnpm --filter @kaneo/api build

# Generate database migrations (after schema changes)
pnpm --filter @kaneo/api db:generate

# Run database migrations (auto-runs on API startup)
pnpm --filter @kaneo/api db:migrate

# Open Drizzle Studio (database GUI)
pnpm --filter @kaneo/api db:studio

# Lint API code
pnpm --filter @kaneo/api lint
```

### Web-Specific Commands
```bash
# Run web app in development mode
pnpm --filter @kaneo/web dev

# Build web app for production
pnpm --filter @kaneo/web build

# Preview production build
pnpm --filter @kaneo/web preview

# Lint web code
pnpm --filter @kaneo/web lint
```

## Architecture Overview

### Monorepo Structure
```
kaneo/
├── apps/
│   ├── api/          # Backend API (Hono/Node.js/PostgreSQL)
│   ├── web/          # Frontend app (React/Vite/TanStack)
│   └── docs/         # Documentation site (Next.js)
├── packages/
│   ├── email/        # Email utilities
│   ├── libs/         # Shared libraries
│   └── typescript-config/  # TypeScript configurations
└── charts/           # Kubernetes Helm charts
```

### Technology Stack

**Backend (API)**
- Framework: Hono (lightweight web framework)
- Database: PostgreSQL with Drizzle ORM
- Authentication: Better Auth
- Validation: Valibot (Zod is also present, used by Better Auth and some schemas)
- API Documentation: OpenAPI (hono-openapi)
- IDs: CUID2 (via @paralleldrive/cuid2)

**Frontend (Web)**
- Framework: React 19+
- Routing: TanStack Router (file-based)
- Data Fetching: TanStack Query (React Query)
- Build Tool: Vite
- Styling: Tailwind CSS v4
- State Management: Zustand
- UI Components: Radix UI primitives

### Key Architectural Patterns

**Backend API Structure**
- Routes organized by feature in `apps/api/src/{feature}/`
- Controller pattern: business logic extracted to `{feature}/controllers/`
- All routes use OpenAPI decorators (`describeRoute`)
- All inputs validated with Valibot schemas
- Migrations auto-run on API startup

**Frontend Structure**
- File-based routing in `apps/web/src/routes/`
- Query hooks in `apps/web/src/hooks/queries/`
- Mutation hooks in `apps/web/src/hooks/mutations/`
- API fetchers in `apps/web/src/fetchers/{feature}/`
- Components in `apps/web/src/components/`

**Database Schema Conventions**
- All tables use CUID2 for primary keys (`createId()`)
- Every table has `createdAt` and `updatedAt` timestamps
- Foreign keys always specify cascade behavior (`onDelete`, `onUpdate`)
- Indexes on frequently queried columns (especially foreign keys)
- Schema defined in `apps/api/src/database/schema.ts`
- Relations defined in `apps/api/src/database/relations.ts`

**Authentication Flow**
- Better Auth handles authentication
- User context available in Hono via `c.get("userId")`, `c.get("user")`, `c.get("session")`
- API keys supported via Bearer token
- Frontend uses Better Auth client from `@/lib/auth-client`

**Event System**
- Events published for activity tracking
- Use `publishEvent()` from `apps/api/src/events/`
- Events tracked for features like status changes, assignments, etc.

## Code Style

### Formatting (Biome)
- **Indentation**: Spaces for JavaScript/TypeScript/TSX (tabs for other file types)
- **Quotes**: Double quotes
- **Semicolons**: Required
- **Ignored files**: CSS and `package.json` files are excluded from Biome linting/formatting
- Run `pnpm lint` to auto-fix

### TypeScript Conventions
- Prefer `type` over `interface` (only use interface when extending/merging)
- Prefer type inference when obvious
- File naming: PascalCase for components, kebab-case for utilities/hooks
- Hooks use `use` prefix: `use-task.ts`

### Import Organization
1. External packages
2. Internal packages (`@/` aliases)
3. Relative imports
Biome auto-organizes imports.

### Git Commits
Use Conventional Commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Husky enforces commit message format via commitlint.

### Pre-commit Hooks
The pre-commit hook (`.husky/pre-commit`) runs two checks:
1. `biome ci .` — linting and formatting validation
2. `pnpm run build` — full monorepo build

Commits will be slow due to the build step. Ensure code compiles before committing.

## Environment Configuration

**Single `.env` file** in project root shared by all apps.

Required variables:
- `KANEO_CLIENT_URL` - Web app URL (e.g., http://localhost:5173)
- `KANEO_API_URL` - API URL (e.g., http://localhost:1337)
- `AUTH_SECRET` - JWT secret (min 32 chars)
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

Optional:
- `CORS_ORIGINS` - Comma-separated allowed origins (empty = allow all in dev)
- `VITE_API_URL` - API URL for web dev (defaults to http://localhost:1337)
- `REDIS_URL` - Redis connection string for multi-instance WebSocket broadcasts via Pub/Sub (omit for single-instance in-memory mode)
- SSO providers (GitHub, Google, Discord, Custom OAuth/OIDC)
- SMTP configuration

See `ENVIRONMENT_SETUP.md` for detailed configuration and troubleshooting.

## Development Workflow

### When Making Changes

1. **Read before modifying**: Never propose changes to code you haven't read
2. **Use existing patterns**: Follow the established controller/fetcher/hook patterns
3. **Avoid over-engineering**: Don't add features beyond what's requested
4. **Type safety**: Let TypeScript guide you - all APIs are fully typed
5. **Validate inputs**: Always use Valibot schemas for API inputs
6. **Error handling**: Backend uses HTTPException, frontend uses toast notifications

### Database Changes

1. Modify schema in `apps/api/src/database/schema.ts`
2. Generate migration: `pnpm --filter @kaneo/api db:generate`
3. Migration auto-runs on next API startup
4. Always use CUID2 for IDs, include timestamps, specify cascade behavior

### Adding API Endpoints

1. Create controller in `apps/api/src/{feature}/controllers/`
2. Add route in `apps/api/src/{feature}/index.ts`
3. Use `describeRoute` for OpenAPI docs
4. Use `validator` with Valibot schema
5. Keep route handler thin - business logic in controller

### Adding Frontend Features

1. Create fetcher in `apps/web/src/fetchers/{feature}/`
2. Create query/mutation hook in `apps/web/src/hooks/`
3. Use TanStack Query for caching
4. Handle loading/error states properly
5. Use toast notifications (sonner) for user feedback

## Important Notes

- **Package Manager**: This project uses **pnpm** (pinned to `10.32.1` via `packageManager` field), not npm or yarn. Requires Node `>=18`
- **Migrations**: Auto-run on API startup, stored in `apps/api/drizzle/`
- **Development Ports**: API runs on 1337, web runs on 5173
- **Hot Reload**: Both API and web have watch mode via `pnpm dev`
- **CORS**: Configured in API index.ts, controlled by `CORS_ORIGINS` env var
- **Testing**: Run `pnpm test` at the repo root (Turbo runs `test` in packages that define it: API unit tests, web unit/component tests, shared packages). API integration tests: `pnpm test:integration` (requires PostgreSQL; env is set in `tests/api-integration/setup.ts`; CI uses `.github/workflows/ci.yml`). Vitest configs: `apps/api/vitest.config.ts` (unit), `apps/api/vitest.integration.config.ts` (integration), `apps/web/vitest.config.ts` (web). Integration tests live under `tests/api-integration/`; API unit tests under `tests/api/`.
- **Security**: Never commit secrets, always validate inputs, sanitize outputs

## Common Patterns

### Backend Route Example
```typescript
// apps/api/src/{feature}/index.ts
import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import * as v from "valibot";
import getItem from "./controllers/get-item";

const feature = new Hono<{ Variables: { userId: string } }>()
  .get("/:id",
    describeRoute({
      operationId: "getItem",
      tags: ["Feature"],
      description: "Get item by ID"
    }),
    validator("param", v.object({ id: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const item = await getItem(id);
      return c.json(item);
    }
  );
```

### Frontend Query Hook Example
```typescript
// apps/web/src/hooks/queries/{feature}/use-item.ts
import { useQuery } from "@tanstack/react-query";
import { getItem } from "@/fetchers/{feature}/get-item";

export function useItem(itemId: string) {
  return useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItem(itemId),
  });
}
```

### Database Schema Example
```typescript
// apps/api/src/database/schema.ts
export const exampleTable = pgTable("example", {
  id: text("id").$defaultFn(() => createId()).primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("example_projectId_idx").on(table.projectId),
]);
```

<!-- Anchored Summary: i18n Localization Completion -->

## Goal

Complete i18n localization of all UI strings across the web app.

## Progress

### Done
- **Intake Forms feature completely removed**: schema, API, frontend, migration, all references.
- **Recurring Tasks integrated** with event/notification system (schema, migration, processor publishes `task.created`, WebSocket handlers).
- **All 10 locale files** have identical key structures (en-US, es-ES, de-DE, fr-FR, nl-NL, ru-RU, uk-UA, el-GR, mk-MK, ko-KR).
- **All 18 component files** have `useTranslation` imports or `i18n.t()` calls.
- **8 supplier hook .ts files** use `i18n.t("suppliers:toast.*")`.
- **create-project-modal.tsx**: Toast + placeholder use `t()`.
- **create-template-modal.tsx**: Column defaults use `t()` via `getDefaultColumns()`.
- **project-layout.tsx**, **workspace-layout.tsx**, **task-layout.tsx**: "Toggle sidebar" → `t("navigation.sidebar.toggleSidebar")`.
- **status.tsx**: "Active"/"Pending" → `i18n.t("common:status.*")`.
- **demo-alert.tsx**: Banner + deploy button → `t("common:demo.*")`.
- **theme-toggle-dropdown.tsx**: "Toggle theme" → `t("common:theme.toggle")`.
- **spinner.tsx**: `aria-label` → `i18n.t("common:spinner.loading")`.
- **archive-tasks-modal.tsx**: Title, description (with plural), confirm → `t("common:modals.archiveTasks.*")`.
- **delete-team-member-modal.tsx**: Title, description, buttons → `t("team:deleteMemberModal.*")`.
- **modules.tsx**: Title, description, loading, toasts, category labels → `t("workspace:modules.*")`.
- **device/index.tsx** + **device/approve.tsx**: All ~22 strings → `t("auth:device.*")`.
- **New i18n keys added**: `common:status.*`, `common:demo.*`, `common:theme.*`, `common:spinner.*`, `common:modals.archiveTasks.*`, `team:deleteMemberModal.*`, `workspace:modules.categories.*`, `workspace:modules.description`, `workspace:modules.loading`, `auth:device.*`.
- **`pnpm lint` passes clean** — all 6 packages.

### Remaining Hardcoded Strings (low priority)
- `components/kanban-board/task-labels.tsx`: `labelColors` array is a color-value mapping, not rendered text; label names come from API.
- Feature utility audit gap report across 36 integration issues (Budgets, Suppliers, Recurring Tasks, Templates operate as silos).

### Key Decisions
- `.ts` files (hooks, lib utilities) use `import i18n from "i18next"` + `i18n.t()`.
- `.tsx` components/route files use `useTranslation` hook + `t()`.
- Archive modal uses i18next plural (`_one`/`_other`) for `{{count}}` interpolation.
- Device auth strings live under `auth:device.*` namespace (not `common`).
- Delete member modal uses its own `team:deleteMemberModal.*` keys (not `team:membersTable.*`).
- Russian/Ukrainian locale files use `_one`/`_few`/`_other` plural forms.

### Relevant Files
- `i18n/*.json`: All 10 locale files updated with new keys.
- `apps/web/src/lib/status.tsx`: Now localized (lib → `i18n.t()`).
- `apps/web/src/components/demo-alert.tsx`: Now localized.
- `apps/web/src/components/theme-toggle-dropdown.tsx`: Now localized.
- `apps/web/src/components/ui/spinner.tsx`: Now localized (ui → `i18n.t()`).
- `apps/web/src/components/shared/modals/archive-tasks-modal.tsx`: Now localized.
- `apps/web/src/components/team/delete-team-member-modal.tsx`: Now localized.
- `apps/web/src/components/common/workspace-layout.tsx`: Now localized.
- `apps/web/src/components/common/task-layout.tsx`: Now localized.
- `apps/web/src/routes/device/index.tsx` + `approve.tsx`: Now localized.
- `apps/web/src/routes/.../settings/workspace/modules.tsx`: Now localized.
- `apps/web/src/hooks/mutations/supplier/*.ts`: 8 files localized.
- `apps/web/src/components/shared/modals/create-project-modal.tsx`: Localized.
- `apps/web/src/components/shared/modals/create-template-modal.tsx`: Localized.
- `apps/web/src/components/common/project-layout.tsx`: Localized earlier.
```
