# Docker Configuration Design — FutMeet API

**Date:** 2026-04-06
**Scope:** `apps/api`

## Goal

Add Docker support to the API with two modes:

- **`dev` profile** — starts only the PostgreSQL database. The developer runs the API locally with `npm run dev`.
- **`deploy` profile** — starts the database, runs migrations automatically, then starts the compiled API.

## Files

```
apps/api/
  Dockerfile               ← new: multi-stage build
  docker-compose.yml       ← updated: profiles, migrate service, api service
  .env.example             ← updated: note about db hostname in Docker
```

The Dockerfile build context is the **monorepo root** (`../..` from `apps/api/`) to allow copying `packages/shared` as a workspace dependency.

## Dockerfile (multi-stage)

Three stages:

| Stage | Base | Purpose |
|-------|------|---------|
| `deps` | `node:22-alpine` | `npm ci` — installs all node_modules |
| `build` | `node:22-alpine` | Copies deps + source, runs `tsc` → `dist/` |
| `runtime` | `node:22-alpine` | Copies `dist/` + `node_modules`, exposes port 3001, runs `node dist/index.js` |

The runtime image contains no source code — only the compiled output and dependencies.

## docker-compose.yml

### Services

**`db`** (profiles: `dev`, `deploy`)
- `postgres:16-alpine`, same credentials as today
- Adds a `healthcheck` (`pg_isready`) so dependent services wait for readiness
- Persists data in named volume `pgdata`

**`migrate`** (profile: `deploy` only)
- Built from the same Dockerfile as `api`
- Runs `node --import tsx/esm node_modules/knex/bin/cli.js migrate:latest --knexfile dist/knexfile.js`
- `depends_on: db` with `condition: service_healthy`
- `restart: on-failure` — retries if DB isn't ready yet
- Exits after migrations complete

**`api`** (profile: `deploy` only)
- Built from the same Dockerfile
- `depends_on: migrate` with `condition: service_completed_successfully` — only starts after migrations succeed
- Reads env vars from `.env` via `env_file:`
- `restart: unless-stopped`

### Important: DATABASE_URL hostname

When running inside Docker, services communicate over the Docker network. The `DATABASE_URL` in `.env` must use `db` as the hostname:

```
DATABASE_URL=postgresql://postgres:password@db:5432/futmeet
```

For local development (API running on host machine), use `localhost`:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/futmeet
```

This is a manual toggle — the developer must update `.env` depending on whether they are running the API locally or via Docker.

## npm scripts (additions to `apps/api/package.json`)

```json
"docker:dev":    "docker compose --profile dev up -d",
"docker:deploy": "docker compose --profile deploy up -d",
"docker:down":   "docker compose --profile deploy down"
```

## Usage

```bash
# Development — start only DB, run API locally
npm run docker:dev
npm run dev

# Deploy — start DB + migrate + API (fully containerized)
npm run docker:deploy

# Stop all containers
npm run docker:down

# Manual migration run (on-demand)
docker compose --profile deploy run --rm migrate
```

## knexfile consideration

The `migrate` service runs against `dist/knexfile.js`. This means `knexfile.ts` must be included in the `tsc` compilation output. Verify that `tsconfig.json` does not exclude it (e.g., via `exclude` or `include` patterns that skip root-level files).

## Out of scope

- Hot-reload / development API container (developer runs API locally)
- Multi-stage secrets management (`.env` file approach is sufficient for this stage)
- CI/CD pipeline changes
