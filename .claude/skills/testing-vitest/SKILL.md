---
name: testing-vitest
description: Use when writing, modifying, or reviewing any code file in apps/api or apps/web. Covers the mandatory test requirement, layer-specific patterns, and Vitest + React Testing Library conventions.
---

# Testing with Vitest

## The Rule

**Every file you create or modify must have unit tests in the same commit. No exceptions.**

If you added or changed code without a `__tests__/index.test.ts` next to it, go back and write the tests before committing.

| Thought | Reality |
|---|---|
| "This file is too simple to need tests" | Simple files break silently. Tests take 5 minutes. |
| "I'll add tests in a follow-up" | There is no follow-up. Write them now. |
| "The logic is already tested elsewhere" | Test the layer you changed, not a different layer. |
| "This is just a config change" | Config changes have observable behaviour. Test it. |

---

## API Layer Test Patterns (`apps/api`)

### Route — param / body validation

Use Fastify's `inject()` with a mock controller. Requires `ajvFormats` for `format: 'uuid'`.

```ts
import Fastify from 'fastify';
import ajvFormats from 'ajv-formats';
import { vi } from 'vitest';
import { myRoutes } from '../index.js';

function buildMockController() {
  return {
    getItem: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
    // ... one mock per route handler
  };
}

async function buildApp() {
  const fastify = Fastify({ logger: false, ajv: { plugins: [ajvFormats as never] } });
  await fastify.register(myRoutes(buildMockController() as never), { prefix: '/items' });
  await fastify.ready();
  return fastify;
}

it('returns 400 when id exceeds max length', async () => {
  const app = await buildApp();
  const res = await app.inject({ method: 'GET', url: '/items/' + 'a'.repeat(22) });
  expect(res.statusCode).toBe(400);
});

it('returns 400 when playerId is not a UUID', async () => {
  const app = await buildApp();
  const res = await app.inject({ method: 'PATCH', url: '/items/id123/members/not-a-uuid' });
  expect(res.statusCode).toBe(400);
});
```

### Controller — service delegation + HTTP mapping

Mock the service, call handlers directly.

```ts
const mockService = { getItem: vi.fn() };
const controller = new MyController(mockService as any);

it('calls service and replies 200', async () => {
  const item = { id: '1' };
  mockService.getItem.mockResolvedValue(item);
  const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
  await controller.getItem({ params: { id: '1' } } as any, reply as any);
  expect(reply.status).toHaveBeenCalledWith(200);
  expect(reply.send).toHaveBeenCalledWith(item);
});
```

### Core plugin — hook / handler behaviour

Mock Fastify methods, extract registered hook, test it directly.

```ts
const mockFastify = {
  register: vi.fn().mockResolvedValue(undefined),
  addHook: vi.fn(),
};
await registerMyPlugin(mockFastify as never);
const [, handler] = mockFastify.addHook.mock.calls.find(([name]) => name === 'onRequest');
const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
await handler({ url: '/some-path', headers: {} }, reply);
expect(reply.status).toHaveBeenCalledWith(401);
```

### Framework utility — constructor args / return value

Use `vi.hoisted` to avoid hoisting errors with class mocks.

```ts
const { MockClass } = vi.hoisted(() => ({ MockClass: vi.fn() }));
vi.mock('third-party', () => ({ default: { ClassName: MockClass } }));

import { createThing } from '../index.js';

it('passes correct options', () => {
  createThing('connection-string');
  expect(MockClass).toHaveBeenCalledWith(
    expect.objectContaining({ connectionString: 'connection-string', timeout: 5_000 })
  );
});
```

### Service — business rules

Mock the repository via `queryFactory`, test each branch.

```ts
const fakeQuery = { findById: vi.fn(), update: vi.fn() };
const repo = new MyRepository(db, () => fakeQuery);
```

---

## Web Layer Test Patterns (`apps/web`)

### Component — rendering + interaction

```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();
  render(<Button onClick={handleClick}>Click me</Button>);
  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

Prefer `getByRole`, `getByLabelText` over `getByTestId`.

---

## General Rules

- Test files: `__tests__/index.test.ts` next to the source file
- No comments in test files
- Use path aliases (`@modules/...`), never relative cross-package imports
- Each test must be independent — no shared mutable state
- Test behaviour, not implementation details

## Running Tests

```bash
npm run test                                        # all packages
npx vitest run apps/api/src/modules/room/route/__tests__/index.test.ts  # single file
```
