---
name: testing-vitest
description: Use when writing, modifying, or reviewing any code file in apps/api or apps/web.
---

# Testing with Vitest

## The Rule

**Every file you create or modify has unit tests in the same commit.** Code changed without a `__tests__/index.test.ts` beside it is unfinished; write the tests before committing.

| Thought | Reality |
|---|---|
| "This file is too simple to need tests" | Simple files break silently. Tests take 5 minutes. |
| "I'll add tests in a follow-up" | There is no follow-up. Write them now. |
| "The logic is already tested elsewhere" | Test the layer you changed. |
| "This is just a config change" | Config changes have observable behaviour. Test it. |

## What to test per layer

| Layer | Test | How |
|---|---|---|
| Route | Invalid params/body return 400; valid input passes | `Fastify().inject()` with a mock controller, `ajvFormats as never` |
| Controller | Calls the right service method; maps result to HTTP status/body | Mock the service, call the handler directly |
| Service | Business rules and error branches | Mock the repository |
| Repository | Correct SQL runs; rows map to domain types | Mock the `queryFactory` |
| Core plugin | Registration; hook/handler behaviour | Mock Fastify with `vi.fn()`, extract the registered hook |
| Framework utility | Constructor args; return value | `vi.hoisted()` + `vi.mock()` |
| Web component | Rendering and interaction | React Testing Library + `userEvent` |

## Conventions

- Files live in `__tests__/index.test.ts` next to the source
- No comments in test files
- Import with path aliases (`@modules/...`), never relative cross-package paths
- Each test is independent, with no shared mutable state
- Test behaviour, not implementation
- Web queries: prefer `getByRole` and `getByLabelText` over `getByTestId`
- Repositories take `queryFactory`; tests inject a fake query object

## Route test skeleton

```ts
const buildApp = async () => {
  const fastify = Fastify({ logger: false, ajv: { plugins: [ajvFormats as never] } });
  await fastify.register(myRoutes(buildMockController() as never), { prefix: '/items' });
  await fastify.ready();
  return fastify;
};

it('returns 400 when id exceeds max length', async () => {
  const app = await buildApp();
  const res = await app.inject({ method: 'GET', url: '/items/' + 'a'.repeat(22) });
  expect(res.statusCode).toBe(400);
});
```

## Running

```bash
npm run test
npx vitest run apps/api/src/modules/room/route/__tests__/index.test.ts
```

## References

Read `references/patterns.md` for controller, core plugin, framework utility, service and web component examples.
