---
name: ci-cd-github-actions
description: CI/CD with GitHub Actions for automated testing, linting, and builds on pull requests. This skill guides setting up and maintaining CI workflows.
---

# CI/CD with GitHub Actions

This project uses GitHub Actions for continuous integration. All pull requests must pass lint and test checks before merging.

## When to Use This Skill

- Setting up new CI/CD workflows
- Adding new jobs to the CI pipeline
- Debugging failed CI builds
- Understanding the PR merge requirements

## Workflow Overview

The CI workflow (`.github/workflows/ci.yml`) runs on:
- All pull requests targeting `main`
- All pushes to `main`

### Jobs

| Job | Description | Blocking |
|-----|-------------|----------|
| `lint` | Runs ESLint with `--max-warnings 0` | Yes |
| `test` | Runs Vitest tests | Yes |
| `build` | Builds the application (depends on lint & test) | Yes |

### Branch Protection

For PRs to be mergeable, they must pass:
1. **Lint check**: No ESLint errors or warnings
2. **Test check**: All tests must pass
3. **Build check**: Application must build successfully

## Commands

```bash
# Run lint locally (same as CI)
npm run lint

# Run tests locally (same as CI)
npm run test

# Build locally (same as CI)
npm run build
```

## Adding New CI Jobs

When adding new jobs to the workflow:

1. **Independent jobs** can run in parallel (no `needs` dependency)
2. **Dependent jobs** should use `needs: [job1, job2]`
3. Always use `actions/checkout@v4` and `actions/setup-node@v4`
4. Use `npm ci` instead of `npm install` for reproducible builds
5. Cache npm dependencies with `cache: 'npm'`

### Example: Adding a Type Check Job

```yaml
typecheck:
  name: Type Check
  runs-on: ubuntu-latest
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run type check
      run: npx tsc --noEmit
```

## Concurrency

The workflow uses concurrency control to cancel redundant runs:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

This ensures only the latest commit on a branch runs CI, saving resources.

## Troubleshooting

### Lint Failures
- Run `npm run lint` locally to see errors
- Fix all errors AND warnings (using `--max-warnings 0`)

### Test Failures
- Run `npm run test` locally to reproduce
- Check test output for specific failures

### Build Failures
- Run `npm run build` locally
- Check for TypeScript errors with `npx tsc --noEmit`

## Branch Protection Setup (GitHub)

To enforce CI checks before merging:

1. Go to repository **Settings** > **Branches**
2. Add rule for `main` branch
3. Enable **Require status checks to pass before merging**
4. Select required checks: `lint`, `test`, `build`
5. Enable **Require branches to be up to date before merging**

## Best Practices

1. **Run CI locally first**: Always run `npm run lint && npm run test && npm run build` before pushing
2. **Keep CI fast**: Optimize test and build times
3. **Don't skip CI**: Never use `[skip ci]` in commits to main
4. **Fix failures immediately**: Don't merge with failing checks

## Checklist

- [ ] Workflow file exists at `.github/workflows/ci.yml`
- [ ] Lint job configured
- [ ] Test job configured
- [ ] Build job depends on lint and test
- [ ] Branch protection rules enabled on GitHub
- [ ] All team members understand CI requirements
