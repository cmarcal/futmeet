---
name: pr-gate
description: Use before opening a pull request, or when asked to verify that lint, typecheck, test and build are green.
---

# PR Gate

A pull request opens only when four sensors read green: `lint`, `typecheck`, `test`, `build`. Red means fix and rerun; it never means open anyway.

## Loop

1. From the worktree root run `npm run verify`. It runs all four sensors and prints a GREEN/RED summary.
2. Any RED: run that sensor alone (`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`), read the first error, fix the cause in the code.
3. Rerun `npm run verify` until every line reads GREEN.
4. Commit the fixes (`git-conventional-commits`), push, then `gh pr create`.

Done when `npm run verify` ends with `verify passed: all sensors green.` in this session, after the last edit.

## Fix the cause

A fix changes code, tests or config so the sensor passes for the right reason. These make a sensor green without fixing anything, so none of them count:
- Skipping, deleting or weakening a test (`it.skip`, loosened assertions)
- Lint disable comments or rule downgrades
- `@ts-ignore`, `@ts-expect-error`, `any` casts added to silence an error
- Removing a check from `scripts/verify.mjs` or CI

A test that fails because behavior changed on purpose: update the test and say so in the PR body.

## Environment check

`verify` warns when the running Node differs from `.nvmrc`. Failures that look unrelated to the diff (worker crashes, `EPIPE`, Vite engine warnings) point at the Node version first: switch with `nvm use`, then rerun before touching code.

## Enforcement

`.claude/settings.json` runs `npm run verify` before every `gh pr create` and blocks the command while any sensor is red. CI runs the same four checks as the backstop.
