# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

FutMeet is a **TypeScript monorepo** for organizing casual football pickup games. It uses **npm workspaces** with **Turbo** for task orchestration.

```
apps/api      — Fastify REST API + PostgreSQL
apps/web      — React 18 + Vite SPA
packages/shared       — Shared domain types and utilities
packages/tsconfig     — Reusable TypeScript configs
packages/oxlint-config — Reusable oxlint configs + CLI wrappers
```

## Commands

### Root (runs across all packages via Turbo)
```bash
npm run build   # Build all packages (topological order)
npm run test    # Run all tests
npm run lint    # Lint all packages
npm run dev:api # Dev server for API only
npm run dev:web # Dev server for web only
```

### API (`apps/api`)
```bash
npm run dev         # Hot reload at http://localhost:3001
npm run build       # tsc → dist/
npm run test        # Vitest unit tests
npm run lint        # oxlint (warnings = errors)

# Run a single test file
npx vitest run src/modules/room/service/__tests__/index.test.ts

# Database (requires Docker)
npm run db:up       # Start postgres:16 on port 5432
npm run db:migrate  # Run pending migrations
npm run db:fresh    # Rollback all → migrate → seed (clean slate)
npm run db:seed     # Load seed data
npm run db:status   # Show migration status
```

### Web (`apps/web`)
```bash
npm run dev         # Vite dev server at http://localhost:5173
npm run build       # tsc + vite build
npm run test        # Vitest
npm run test:watch  # Watch mode
```

### Before pushing
Always run from root: `npm run lint && npm run test && npm run build`. CI treats warnings as errors (`--deny-warnings`).

## API architecture

Layered architecture with manual DI wired at the composition root (`src/index.ts`):

```
Route → Controller → Service → Repository → Query → PostgreSQL
```

- **Route** — Fastify route registration + JSON schema validation
- **Controller** — Parses request, calls service, sets HTTP status
- **Service** — Business rules, error translation
- **Repository** — Transaction management, `SELECT FOR UPDATE` locks, returns `WriteResult<T>`
- **Query** — Raw SQL execution and row → domain type mapping

Each module (`room/`, `game/`) owns its full vertical slice under `src/modules/`. Dependencies flow strictly downward.

### Key patterns

**WriteResult\<T\>** — Repository write methods return `{ ok: true; data: T } | { ok: false; reason: string }` instead of throwing. Services call `unwrapRoomResult` / `unwrapGameResult` to convert to HTTP errors.

**Pessimistic locking** — All write operations use `SELECT ... FOR UPDATE` inside a transaction via a `lockRoom` / `lockGame` private helper in the repository. This prevents TOCTOU race conditions. The service layer does NOT do pre-check reads.

**Query/Repository DI** — Repositories accept a `queryFactory: (db: DbPool | DbClient) => Query` parameter (defaults to `(db) => new Query(db)`). Tests mock the factory to inject a fake query object. This makes each layer independently testable without a real database.

**Path aliases** (API only):
- `@/*` → `src/*`
- `@core/*` → `src/core/*`
- `@modules/*` → `src/modules/*`

### Database migrations

Files live in `src/migrations/` and follow the naming convention `YYYYMMDD_NN_description.ts`. Knex is used only for migrations/seeds (`knexfile.ts`). The `pg` pool is used directly for all runtime queries.

ID types: Room and Game IDs are `VARCHAR(21)` (nanoid). Player and Team IDs are `UUID` (crypto.randomUUID()).

## Web architecture

React 18 SPA with:
- **Zustand** — global state management
- **React Hook Form + Zod** — form handling and validation
- **React Router DOM v7** — client-side routing
- **CSS Modules** — all component styling (no Tailwind, no inline styles)

### Frontend code conventions
- Use `const` arrow functions, not `function` declarations
- Event handlers prefixed with `handle` (e.g. `handleClick`)
- Early returns for guard clauses
- Accessibility attributes required on interactive elements (tabIndex, aria-label, onKeyDown)

## Shared package

`@futmeet/shared` exports two entry points:
- `@futmeet/shared/types` — domain types: `Room`, `Player`, `Game`, `Team`
- `@futmeet/shared/utils` — `generateGameId`, `generatePlayerId`, `sortTeams`

Import from the package alias, not via relative paths crossing package boundaries.

## Linting

Uses **oxlint** (Rust-based, replaces ESLint). Config packages expose `oxlint-node` and `oxlint-web` CLI wrappers. All warnings are treated as errors in CI.

## Test conventions

- Test files go in `__tests__/` subdirectory next to the source (e.g. `service/__tests__/index.test.ts`)
- No comments in test files
- Use path aliases (`@modules/...`) in test imports, not relative paths
- Mock the query factory to test repository logic without a database
