# Deploying apps/web to Railway

Decided host: Railway, running `apps/web` as a Node container built from
`apps/web/Dockerfile` (TanStack Start + Nitro). `apps/api` and Postgres run as
sibling services in the same Railway project. Nothing here is automated: these
are manual dashboard steps.

## The image

Build context is the repo root:

```bash
docker build -f apps/web/Dockerfile -t futmeet-web .
docker run --rm -e PORT=8080 -p 8080:8080 futmeet-web
```

- Multi-stage on `node:26-alpine`: install workspace deps, build
  `@futmeet/shared`, run `vite build`, then copy only `apps/web/.output` into
  the runtime stage.
- Runs as a non-root user with `node .output/server/index.mjs`.
- Honors `PORT` (Railway injects it; defaults to `3000`). Nitro listens on all
  interfaces.
- CI builds the image on every PR (`docker-web` job) but never pushes it.

## Manual Railway steps

1. Create a Railway project.
2. Add a Postgres service (Railway Postgres).
3. Add an `api` service from this repo: Dockerfile path `apps/api/Dockerfile`,
   build target `runtime`, root directory = repo root.
4. Add a `web` service from this repo: Dockerfile path `apps/web/Dockerfile`,
   root directory = repo root.
5. Set variables (see below).
6. Generate public domains for `web` and `api`.
7. Run migrations once with the `migrate` stage of `apps/api/Dockerfile`
   (pre-deploy or one-off job; confirm the mechanism in Railway docs).

## Variables

`api`:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Reference the Postgres service's `DATABASE_URL` |
| `ALLOWED_ORIGINS` | Public origin of `web`, e.g. `https://web-production-xxxx.up.railway.app` (comma-separated for several) |
| `API_KEY` | Required by `apps/api/src/config.ts` |
| `PORT` | Set by Railway |

`web`:

| Variable | Scope | Value |
|---|---|---|
| `API_INTERNAL_URL` | Server only (SSR loaders) | `http://api.railway.internal:3001` |
| `VITE_API_URL` | Public, browser | Public URL of `api` |

Notes:

- The web app does not call the API yet, so the two web variables and their
  names are a plan, not something the code reads today. Pick final names when
  the data layer lands.
- `VITE_*` values are inlined at build time. When the code starts reading one,
  declare it as an `ARG`/`ENV` in the build stage of `apps/web/Dockerfile`;
  Railway only passes service variables to Docker builds that declare them.
- Never put the internal URL in a `VITE_` variable: it would ship to the
  browser.
- Only `/waiting-room/*` and `/results/*` render on the server, so only those
  loaders use the internal URL. `/` and `/game/*` are client-rendered.

## Verify on deploy

- Private-network bind: Railway's Fastify guide says the listen host must be
  `::` to accept private-network traffic. `apps/api/src/index.ts` binds
  `0.0.0.0`. From the `web` service, check that
  `http://api.railway.internal:3001` is reachable. If it returns 502 or
  refuses, change the API listen host to `::` (with a test) in a follow-up.
- `PORT` is honored by the web container (verified locally with a custom
  `PORT`, not on Railway).
- Health check path and pre-deploy migration behavior (not yet confirmed in
  Railway docs).
