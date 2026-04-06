---
name: api-pg-transaction-lock
description: Use when implementing write operations in a repository that require a transaction, preventing race conditions with SELECT FOR UPDATE, or passing a transactional client through the query layer.
---

# pg Transaction + Pessimistic Locking

## Overview
All repository writes run inside a transaction. A `SELECT ... FOR UPDATE` on the parent row is always the first operation — this prevents TOCTOU race conditions without application-level locking.

## withTransaction Helper
Copy this pattern into every repository:
```typescript
private async withTransaction<T>(fn: (q: ThingQuery) => Promise<T>): Promise<T> {
  const client = await this.db.connect();
  const q = this.queryFactory(client);  // bind query to the transaction client
  try {
    await client.query('BEGIN');
    const result = await fn(q);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;                            // always re-throw — never swallow
  } finally {
    client.release();                   // always release, even on error
  }
}
```

## Lock Helper — First Step of Every Write
```typescript
private async lockThing(q: ThingQuery, thingId: string): Promise<WriteError | null> {
  const row = await q.selectThingForUpdate(thingId);   // SELECT ... FOR UPDATE
  if (!row) return { ok: false, reason: 'thing_not_found' };
  return null;
}
```
Call `lockThing` before any mutation inside `withTransaction`. If it returns a value, return it immediately — no further work needed.

## Query — FOR UPDATE
```typescript
async selectThingForUpdate(thingId: string): Promise<{ id: string } | null> {
  const result = await this.db.query<{ id: string }>(
    'SELECT id FROM things WHERE id = $1 FOR UPDATE',
    [thingId]
  );
  return result.rows[0] ?? null;
}
```

## Full Write Operation Example
```typescript
async addItem(thingId: string, name: string): Promise<WriteResult<Item>> {
  return this.withTransaction(async (q) => {
    const guard = await this.lockThing(q, thingId);
    if (guard) return guard;                            // thing not found → early exit
    const item = await q.insertItem(thingId, name);
    return { ok: true, data: item };
  });
}
```

## Why queryFactory(client) Inside Transactions
The `queryFactory` accepts either `DbPool` or `DbClient`:
- Outside transactions → `queryFactory(this.db)` — uses pool, auto-manages connection
- Inside transactions → `queryFactory(client)` — uses same PoolClient so all queries share the transaction

If you use `this.db` inside `withTransaction`, each query gets its own connection and is NOT part of the transaction.

## Common Mistakes
- **Using `this.db` inside `withTransaction`** — queries run outside the transaction; locks don't apply
- **Skipping `client.release()` in finally** — connection leak; pool exhausts under load
- **Swallowing the re-throw** — hides errors, transaction appears to succeed
- **Checking existence before locking** — pre-read without `FOR UPDATE` is a TOCTOU gap; the service layer must not do pre-reads for writes
