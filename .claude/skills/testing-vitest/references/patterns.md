# Test Patterns

## Route: mock controller

```ts
const buildMockController = () => ({
  getItem: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
});

it('returns 400 when playerId is not a UUID', async () => {
  const app = await buildApp();
  const res = await app.inject({ method: 'PATCH', url: '/items/id123/members/not-a-uuid' });
  expect(res.statusCode).toBe(400);
});
```

`ajvFormats` is required for `format: 'uuid'`.

## Controller: service delegation and HTTP mapping

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

## Core plugin: hook behaviour

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

## Framework utility: constructor args

`vi.hoisted` avoids hoisting errors with class mocks.

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

## Service and repository: query factory

```ts
const fakeQuery = { findById: vi.fn(), update: vi.fn() };
const repo = new MyRepository(db, () => fakeQuery);
```

## Web component

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
