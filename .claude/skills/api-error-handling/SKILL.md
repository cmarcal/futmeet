---
name: api-error-handling
description: Use when creating module-specific errors, adding a new error class, understanding why service methods have no try/catch, or tracing how exceptions become HTTP responses.
---

# API Error Handling

## Overview
Errors are thrown once (in the service layer) and caught once (by Fastify's centralized error handler). No try/catch in controllers or services — AppErrors bubble up automatically and are serialized to typed JSON.

## AppError Base Class (`src/core/error/index.ts`)
```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,      // machine-readable, SCREAMING_SNAKE_CASE
    message: string,                   // human-readable
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

## Module Error Classes (`src/modules/<name>/error/index.ts`)
```typescript
import { AppError } from '@core/error/index.js';

export class ThingNotFound extends AppError {
  constructor(thingId: string) {
    super('THING_NOT_FOUND', `Thing '${thingId}' not found`, 404);
  }
}

export class ThingConflict extends AppError {
  constructor(thingId: string) {
    super('THING_CONFLICT', `Thing '${thingId}' cannot be modified`, 409);
  }
}
```
- One class per error case
- Code is `MODULE_REASON` in SCREAMING_SNAKE_CASE
- Status code owned by the error class — never set in the controller

## Fastify Error Handler (registered once at startup)
Handles three cases automatically:
1. `AppError` → `reply.status(error.statusCode).send({ code, message, details? })`
2. Fastify validation error (status 400) → `{ code: 'VALIDATION_ERROR', message }`
3. Anything else → log + `{ code: 'INTERNAL_ERROR', message: 'Internal server error' }` (500)

## Why No try/catch in Service or Controller

```
Controller → calls service
Service    → throws ThingNotFound (AppError)
               ↓ bubbles up automatically
Fastify    → setErrorHandler catches it
               ↓
           reply.status(404).send({ code: 'THING_NOT_FOUND', message: '...' })
```

Adding try/catch in the service forces you to either re-throw (pointless boilerplate) or swallow the error (dangerous — hides bugs, returns 500 silently). The only valid catch is in `withTransaction` — and it immediately re-throws after rollback.

## HTTP Status Code Reference
| Status | When |
|--------|------|
| 400 | Invalid input (Fastify schema validation handles this automatically) |
| 404 | Resource not found |
| 409 | Conflict — resource exists or state prevents the operation |
| 500 | Unexpected — never throw this explicitly; let the handler catch unknown errors |

## Common Mistakes
- **Catching AppError in the service** — defeats the purpose; just let it bubble
- **Setting `reply.status(404)` in the controller** — status code belongs to the error class
- **Using `Error` directly instead of `AppError`** — produces an untyped 500 instead of a meaningful response
- **Generic error codes** — `'NOT_FOUND'` is not helpful; `'ROOM_NOT_FOUND'` lets clients handle it precisely
