# Layer Examples

## Route

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

## Controller

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

## Service

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

## Common mistakes

- **Method declarations instead of arrow functions**: `getThing() {}` loses `this` when Fastify calls it as a handler.
- **Try/catch in the service**: AppErrors and unexpected errors both bubble to `registerErrorHandler`. The only valid catch is in `withTransaction` for ROLLBACK, and it re-throws.
- **Status codes for errors in controllers**: AppError subclasses own the error status.
