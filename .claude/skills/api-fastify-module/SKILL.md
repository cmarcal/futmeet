---
name: api-fastify-module
description: Use when creating a module in apps/api, adding routes, or wiring a feature into the Fastify composition root.
---

# Fastify Module Architecture

Each feature is a vertical slice: Route → Controller → Service → Repository → Query. Dependencies flow downward; all wiring happens at the composition root (`src/index.ts`).

## File Layout

```
src/modules/<name>/
  route/index.ts       Fastify plugin, JSON schema body validation
  controller/index.ts  Request parsing, HTTP status, calls service
  service/index.ts     Business rules, throws AppError
  repository/index.ts  Transactions, locking, returns WriteResult<T>
  query/index.ts       Raw SQL, row → domain type mapping
  entity/index.ts      DB row types (internal to module)
  error/index.ts       Module-specific AppError subclasses
```

Every file ships with tests (`testing-vitest` skill).

## Layer Rules

- **Route**: higher-order plugin `(controller) => async (fastify) => {...}`; controller injected by closure. Inline JSON schema only on routes with a request body.
- **Controller**: arrow-function properties (`getThing = async (...) => {}`) so `this` survives being passed as a handler. Param/body interfaces at the top of the file. Sets only non-200 statuses explicitly; never catches.
- **Service**: business rules only. Throws typed module errors (`api-error-handling`), never returns null to callers, has no try/catch, does no pre-read before writes (the repository locks, see `api-pg-transaction-lock` and `api-write-result-pattern`).
- **Imports**: across modules use `@modules/room/...`, never `../../room/...`.

## HTTP Status

| Operation | Status |
|-----------|--------|
| GET | 200 |
| POST creating a resource | 201 |
| PATCH / PUT | 200 |
| DELETE | 204, no body |

## Wiring

```typescript
const thingRepository = new ThingRepository(db);
const thingService    = new ThingService(thingRepository);
const thingController = new ThingController(thingService);

await fastify.register(thingRoutes(thingController), { prefix: '/api/v1/things' });
```

Order: repository → service → controller, then register routes with a prefix.

## References

Read `references/layer-examples.md` for full route, controller and service code.
