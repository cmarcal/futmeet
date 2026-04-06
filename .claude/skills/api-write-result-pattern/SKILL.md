---
name: api-write-result-pattern
description: Use when implementing repository write methods, handling errors from write operations in the service layer, or deciding between WriteResult<T> and throwing directly.
---

# WriteResult<T> Pattern

## Overview
Repository write methods return a discriminant union instead of throwing. The service layer unwraps the result and translates failure reasons into typed AppErrors.

## The Type
```typescript
type WriteError = { ok: false; reason: 'thing_not_found' | 'conflict_reason' | ... }
type WriteOk<T> = { ok: true; data: T }
export type WriteResult<T> = WriteOk<T> | WriteError
```
Reason strings are snake_case literals scoped to the module. Export the type from `repository/index.ts`.

## Repository — Return, Never Throw
```typescript
async addPlayer(thingId: string, name: string): Promise<WriteResult<Player>> {
  return this.withTransaction(async (q) => {
    const guard = await this.lockThing(q, thingId);
    if (guard) return guard;                          // early return on lock failure
    const player = await q.insertPlayer(thingId, name);
    return { ok: true, data: player };
  });
}
```

## Service — Two Unwrap Strategies

**Strategy A — Private helper** (use when a module has many write operations with the same failure reasons):
```typescript
async addPlayer(thingId: string, name: string): Promise<Player> {
  const result = await this.repo.addPlayer(thingId, name);
  return this.unwrapResult(result, thingId);
}

private unwrapResult<T>(result: WriteResult<T>, thingId: string): T {
  if (!result.ok) {
    if (result.reason === 'thing_not_found') throw new ThingNotFound(thingId);
    throw new SomeOtherError();
  }
  return result.data;
}
```

**Strategy B — Inline check** (use for one-off or ad-hoc reason sets):
```typescript
async createFromThing(thingId: string): Promise<Game> {
  const result = await this.repo.createFromThing(thingId);
  if (!result.ok) {
    if (result.reason === 'thing_not_found') throw new ThingNotFound(thingId);
    throw new ThingAlreadyUsed(thingId);
  }
  return result.data;
}
```

## When to Use WriteResult<T> vs. Returning null/boolean
| Return type | When to use |
|---|---|
| `WriteResult<T>` | Write operation that can fail for named business reasons |
| `T \| null` | Read operation that may find nothing |
| `boolean` | Simple success/failure with no data needed |

## Common Mistakes
- **Throwing inside the repository** — loses the typed reason; service can't distinguish errors
- **Checking `result.ok === false`** — use `!result.ok`; TypeScript narrows the discriminant either way but `!result.ok` is idiomatic
- **Adding too many reason strings** — keep reasons to actual business cases; don't add reasons for database errors (those should throw and bubble up)
