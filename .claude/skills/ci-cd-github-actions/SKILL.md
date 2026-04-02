---
name: ci-cd-github-actions
description: Use when setting up, modifying, or debugging the GitHub Actions CI workflow, adding new jobs, or understanding what must pass before a PR can merge.
---

# CI/CD with GitHub Actions

The CI workflow (`.github/workflows/ci.yml`) runs on all PRs targeting `main` and all pushes to `main`.

## Jobs

| Job | Description | Blocking |
|-----|-------------|----------|
| `lint` | oxlint with `--deny-warnings` | Yes |
| `test` | Vitest tests | Yes |
| `build` | Build (depends on lint & test) | Yes |

## Local Verification (Always Run Before Pushing)

```bash
npm run lint && npm run test && npm run build
```

## Adding New CI Jobs

```yaml
typecheck:
  name: Type Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npx tsc --noEmit
```

Rules for new jobs:
- Independent jobs run in parallel (no `needs`)
- Dependent jobs use `needs: [lint, test]`
- Always use `npm ci` — never `npm install`
- Always cache with `cache: 'npm'`

## Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## Troubleshooting

- **Lint failures**: Run `npm run lint` locally. Fix all errors and warnings — `--deny-warnings` means zero tolerance.
- **Test failures**: Run `npm run test` locally to reproduce.
- **Build failures**: Run `npm run build` then `npx tsc --noEmit` to isolate TypeScript errors.

## Branch Protection Setup

Settings > Branches > Add rule for `main`:
1. Require status checks: `lint`, `test`, `build`
2. Require branches to be up to date before merging

## Best Practices

- Never use `[skip ci]` on commits to main
- Fix CI failures immediately — do not merge with failing checks
- This project uses **oxlint** (not ESLint) — `--deny-warnings` is the flag, not `--max-warnings 0`
