# API Security & Hardening Design

**Date:** 2026-04-03
**Scope:** `apps/api`
**Approach:** Security plugin layer first, then input validation, then operational hardening

---

## Context

The `apps/api` Fastify REST API currently has no authentication, no security headers, several routes with missing input validation schemas, and no graceful shutdown handling. This design introduces targeted hardening across three phases without requiring user accounts — the application remains open to end users, but the frontend is protected by an origin-pinned rotating API key.

---

## Architecture Overview

```
src/core/
  security/        ← NEW: Fastify plugin (helmet + API key + CORS + request IDs)
  framework/
    postgres/      ← UPDATED: pool idle timeout + connection timeout
  error/           ← unchanged
  logger/          ← unchanged
  decorator/       ← unchanged
src/index.ts       ← UPDATED: graceful shutdown + register security plugin + ajv-formats
config.ts          ← UPDATED: CORS_ORIGIN → ALLOWED_ORIGINS, add API_KEY
```

Registration order in `src/index.ts`:
```
registerDbDecorator(fastify, db)
registerErrorHandler(fastify)
registerSecurity(fastify)        ← replaces inline cors registration
if (config.nodeEnv !== 'production') await registerSwagger(fastify)
```

---

## Phase 1 — Security Plugin Layer

### `src/core/security/index.ts`

A single Fastify plugin registered at the composition root. Responsibilities:

1. **HTTP security headers** — registers `@fastify/helmet` with default options (sets `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `X-DNS-Prefetch-Control`, etc.)

2. **CORS hardening** — replaces the inline `cors` registration. Reads `ALLOWED_ORIGINS` from config, splits on `,` to build the origin allowlist. Methods remain `['GET', 'POST', 'PATCH', 'DELETE']`.

3. **API key validation** — `onRequest` hook checks `request.headers['x-api-key'] === config.apiKey`. Returns `401 UNAUTHORIZED` on mismatch. The `/health` route is excluded via `if (request.url === '/health') return` at the top of the hook (health checks must be keyless for infrastructure probes).

4. **Request ID injection** — Fastify instance configured with `genReqId: () => crypto.randomUUID()`. Every Pino log line Fastify emits for a request includes the `reqId` field automatically.

### Config changes (`src/config.ts`)

```ts
// Before
corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173'

// After
corsOrigins: (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:5173').split(','),
apiKey: requireEnv('API_KEY'),
```

### `.env.example` additions

```
ALLOWED_ORIGINS=http://localhost:5173
API_KEY=change-me-in-production
```

### Swagger guard

The `registerSwagger` call in `src/index.ts` is wrapped in `if (config.nodeEnv !== 'production')`. No changes to `core/documentation/swagger/index.ts`.

### `ajv-formats` configuration

Fastify v5 does not enable JSON Schema format validation by default. `ajv-formats` is added as a dependency and configured at Fastify instantiation:

```ts
import ajvFormats from 'ajv-formats';

const fastify = Fastify({
  logger,
  ajv: { plugins: [ajvFormats] },
  genReqId: () => crypto.randomUUID(),
});
```

---

## Phase 2 — Input Validation Gaps

### Reusable param schemas (top of each route file)

```ts
const roomIdParam = {
  type: 'object',
  required: ['roomId'],
  properties: {
    roomId: { type: 'string', minLength: 1, maxLength: 21 },
  },
} as const;

const playerIdParam = {
  type: 'object',
  required: ['roomId', 'playerId'],
  properties: {
    roomId: { type: 'string', minLength: 1, maxLength: 21 },
    playerId: { type: 'string', format: 'uuid' },
  },
} as const;
```

`format: 'uuid'` is enforced by `ajv-formats` configured in Phase 1.

### Routes to update (`apps/api/src/modules/room/route/index.ts`)

| Route | Add |
|---|---|
| `POST /rooms` | `schema: { body: { type: 'object', properties: {} } }` (explicit empty body) |
| `GET /rooms/:roomId` | `schema: { params: roomIdParam }` |
| `PATCH /rooms/:roomId/players/:playerId` | `schema: { params: playerIdParam }` |
| `DELETE /rooms/:roomId/players/:playerId` | `schema: { params: playerIdParam }` |
| `DELETE /rooms/:roomId/players` | `schema: { params: roomIdParam }` |
| `POST /rooms/:roomId/start` | `schema: { params: roomIdParam }` |

All game routes in `apps/api/src/modules/game/route/index.ts` get the same treatment with equivalent param shapes.

---

## Phase 3 — Operational Hardening

### Graceful shutdown (`src/index.ts`)

Added after `fastify.listen(...)`:

```ts
const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Shutting down');
  await fastify.close();
  await db.end();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
```

`fastify.close()` waits for in-flight requests to finish. `db.end()` drains the connection pool cleanly.

### Pool configuration (`src/core/framework/postgres/index.ts`)

```ts
export const createPool = (connectionString: string): DbPool =>
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
```

- `idleTimeoutMillis: 30_000` — releases idle connections after 30s, preventing held database slots
- `connectionTimeoutMillis: 5_000` — fails fast if the database is unreachable at startup

---

## New Dependencies

| Package | Type | Purpose |
|---|---|---|
| `@fastify/helmet` | `dependency` | HTTP security headers |
| `ajv-formats` | `dependency` | JSON Schema `format: 'uuid'` validation |

---

## Out of Scope

- User authentication / sessions (planned for a future phase)
- Rate limiting (no infra for distributed counters yet)
- Database query timeouts (no `statement_timeout` in pool config — deferred)
