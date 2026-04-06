---
name: api-logging
description: Use when adding log statements to the API, choosing the right log level, understanding when to use fastify.log vs the imported logger, or configuring logging for dev vs production.
---

# API Logging with Pino

## Overview
The API uses **Pino** as its logger, wired directly into Fastify. In development it uses `pino-pretty` for colorized human-readable output; in production it emits structured JSON. Fastify automatically logs every request/response — manual logging is only needed for business events and errors.

## Setup (`src/core/logger/index.ts`)
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport:
    process.env['NODE_ENV'] !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
```
Passed to Fastify at startup: `Fastify({ logger })`.

## fastify.log vs. imported logger

| Context | Use |
|---|---|
| Inside a route, plugin, or hook | `fastify.log.info(...)` — request-scoped, includes `reqId` automatically |
| Outside Fastify (standalone script, migration) | `import { logger } from '@core/logger/index.js'` |
| Error handler | `fastify.log.error(error)` |

Never import the logger inside a Fastify route/plugin — use `fastify.log` so Pino can correlate logs to the request.

## Log Levels
| Level | When to use |
|---|---|
| `error` | Unexpected failures caught by the error handler |
| `warn` | Degraded state that doesn't stop the request |
| `info` | Business events worth tracking in production (e.g. game started) |
| `debug` | Developer detail — noisy, filtered out in production |

Default level is `info`. Override with `LOG_LEVEL=debug` env var.

## What Fastify Logs Automatically
- Incoming request: method, url, `reqId`
- Response: status code, response time
- Plugin registration errors

You don't need to log these manually.

## Adding a Manual Log
```typescript
// Inside a controller or plugin (has fastify context)
fastify.log.info({ roomId }, 'game started');

// Inside a service — pass logger explicitly if needed, or leave it to the controller layer
```

## Common Mistakes
- **`console.log` instead of `fastify.log`** — bypasses Pino, loses structured format and `reqId`
- **Importing `logger` inside a route handler** — works but loses request correlation; use `fastify.log` instead
- **Logging at `info` in a hot path** — use `debug` for high-frequency events to avoid log noise in production
- **Logging sensitive data** — never log passwords, tokens, or PII; Pino has no automatic redaction here
