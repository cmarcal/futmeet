---
name: api-fastify-module
description: Use when creating a new module in apps/api, adding routes, or wiring a new feature into the Fastify composition root. Covers file layout, layer responsibilities, route registration, controller typing, and DI wiring.
---

# Fastify Module Architecture

## Overview
Each feature is a self-contained vertical slice: Route → Controller → Service → Repository → Query. Dependencies flow strictly downward. All wiring happens at the composition root (`src/index.ts`).

## File Layout
```
src/modules/<name>/
  route/index.ts       — Fastify plugin, JSON schema body validation
  controller/index.ts  — Request parsing, HTTP status, calls service
  service/index.ts     — Business rules, throws AppError
  repository/index.ts  — Transactions, locking, returns WriteResult<T>
  query/index.ts       — Raw SQL, row → domain type mapping
  entity/index.ts      — DB row types (internal to module)
  error/index.ts       — Module-specific AppError subclasses
```

## Route — Higher-order Plugin Pattern
```typescript
export const thingRoutes =
  (controller: ThingController) =>
  async (fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> => {
    fastify.get('/:thingId', controller.getThing);
    fastify.post(
      '/',
      {
        schema: {
          body: {
            type: 'object',
            required: ['name'],
            properties: { name: { type: 'string', minLength: 1, maxLength: 50 } },
          },
        },
      },
      controller.createThing
    );
  };
```
- Inject controller via closure (DI without a container)
- Add inline JSON schema **only** on routes that have a request body
- No schema needed for GET/DELETE with params only

## Controller — Typed Arrow Functions
```typescript
interface ThingParams { thingId: string }
interface CreateBody  { name: string }

export class ThingController {
  constructor(private readonly service: ThingService) {}

  getThing = async (
    req: FastifyRequest<{ Params: ThingParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    const thing = await this.service.getThing(req.params.thingId);
    reply.send(thing);
  };

  createThing = async (
    req: FastifyRequest<{ Body: CreateBody }>,
    reply: FastifyReply
  ): Promise<void> => {
    const thing = await this.service.createThing(req.body.name);
    reply.status(201).send(thing);
  };
}
```
- **Arrow functions** (not `method()`) — preserves `this` when passed as Fastify handler
- Param/body interfaces defined at top of file
- Service throws AppError; controller never catches — Fastify's error handler manages it

## Service — Business Rules Only
```typescript
export class ThingService {
  constructor(private readonly repo: ThingRepository) {}

  async getThing(id: string): Promise<Thing> {
    const thing = await this.repo.findById(id);
    if (!thing) throw new ThingNotFound(id);
    return thing;
  }
}
```
- Throws typed module errors, never returns null to caller
- **No try/catch** — errors bubble up to Fastify's centralized error handler
- Does NOT pre-read before writes — repository handles locking internally

## Wiring at Composition Root (`src/index.ts`)
```typescript
const thingRepository = new ThingRepository(db);
const thingService    = new ThingService(thingRepository);
const thingController = new ThingController(thingService);

await fastify.register(thingRoutes(thingController), { prefix: '/api/v1/things' });
```
Add repository → service → controller in order, then register routes with prefix.

## HTTP Status Conventions
| Operation | Status |
|-----------|--------|
| GET | 200 |
| POST (creates resource) | 201 |
| PATCH / PUT | 200 |
| DELETE | 204 (no body) |

## Common Mistakes
- **Method declarations instead of arrow functions** — `getThing() {}` loses `this` binding when Fastify calls it as a handler; always use `getThing = async () => {}`
- **Try/catch in service** — redundant; AppErrors and unexpected errors both bubble up to `registerErrorHandler`. The only valid catch is in `withTransaction` for ROLLBACK, and it always re-throws.
- **Status codes in controllers** — only set non-200 statuses explicitly (201, 204); let AppError subclasses own the status code for errors
- **Crossing module boundaries via relative paths** — import from `@modules/room/...`, never `../../room/...`
