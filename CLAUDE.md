# CLAUDE.md

FutMeet is a TypeScript monorepo (npm workspaces + Turbo) for organizing casual football pickup games.

```
apps/api               Fastify REST API + PostgreSQL
apps/web               React 18 + Vite SPA
packages/shared        Shared types and utils (@futmeet/shared)
packages/tsconfig      Reusable TypeScript configs
packages/oxlint-config Reusable oxlint configs + CLI wrappers
```

Scripts live in each `package.json`; Postgres runs through `npm run db:up` in `apps/api` (needs Docker).

## Required workflow

- **Every change happens in a git worktree on its own branch.** Follow `worktree-workflow`; the pre-commit hook rejects commits from the primary checkout and from `main`.
- **Every file you create or modify ships with unit tests** in the same commit (`testing-vitest`).
- **A PR opens only when `npm run verify` is green** on lint, typecheck, test and build (`pr-gate`). A red sensor is fixed at its cause and rerun; a hook blocks `gh pr create` while any sensor is red. CI treats warnings as errors.

## Skills

Load the matching skill from `.claude/skills/` before working in its area.

| Working on | Skill |
|---|---|
| Any change, branch, or cleanup | `worktree-workflow` |
| Before opening a PR | `pr-gate` |
| Branch names, commits, PR titles | `git-conventional-commits` |
| Architectural decision | `adr-on-branch` |
| Tests (api or web) | `testing-vitest` |
| CI workflow | `ci-cd-github-actions` |
| New API module, routes, DI wiring | `api-fastify-module` |
| Repository writes | `api-write-result-pattern`, `api-pg-transaction-lock` |
| API errors, logging | `api-error-handling`, `api-logging` |
| Components and CSS Modules | `component-architecture-css-modules`, `design-tokens-strategy`, `mobile-first-strategy` |
| Accessibility, icons | `accessibility-wcag`, `icons-lucide-react` |
| Forms, error UI | `forms-react-hook-form-zod`, `error-handling-strategy` |
| State, server data, routing | `state-management-zustand`, `api-tanstack-query`, `routing-react-router` |
| Security review of a PR | `security-pr-review` |

## Conventions not found in config

**API** — layers run `Route → Controller → Service → Repository → Query`, wired by hand in `apps/api/src/index.ts`. Services contain no try/catch and do no pre-check reads; repositories lock with `SELECT ... FOR UPDATE`.

Path aliases (API): `@/*` → `src/*`, `@core/*` → `src/core/*`, `@modules/*` → `src/modules/*`.

**Database** — Knex runs migrations and seeds only; runtime queries use the `pg` pool. Migrations are named `YYYYMMDD_NN_description.ts`. Room and Game IDs are `VARCHAR(21)` (nanoid); Player and Team IDs are `UUID` (`crypto.randomUUID()`).

**Web** — CSS Modules for all styling (no Tailwind, no inline styles). `const` arrow functions, not `function` declarations. Event handlers are prefixed `handle`. Guard clauses return early. Interactive elements carry `tabIndex`, `aria-label` and `onKeyDown`.

**Shared** — import `@futmeet/shared/types` and `@futmeet/shared/utils` by alias, never by relative path across packages.

**Linting** — oxlint (not ESLint); `oxlint-node` and `oxlint-web` wrap the shared configs.

## Docs

- Architectural decisions: `src/docs/adr/` (written per `adr-on-branch`)
- Database model: `docs/database-model.html`, `docs/adr/0001-database-schema.md`
- Security assessment: `docs/SECURITY_ASSESSMENT.md`
