---
name: worktree-workflow
description: Use before making any change in this repo, and when starting, finishing, or cleaning up a branch.
---

# Worktree Workflow

Every change happens in a git worktree on its own branch. The primary checkout stays on a clean branch and receives no edits. The `pre-commit` hook rejects commits made from the primary checkout.

## Start

From the primary checkout, create the worktree under `.worktrees/` (gitignored) with a branch named per `git-conventional-commits`:

```bash
git worktree add .worktrees/<type>-<short-name> -b <type>/<short-name>
cd .worktrees/<type>-<short-name>
npm install
```

- Base it on `main` unless the work stacks on another branch: `git worktree add .worktrees/x -b feat/x main`
- Folder name is the branch with `/` replaced by `-`
- Every command, edit and test run from inside the worktree, never from the primary checkout
- Already inside a worktree on a branch for this change: continue there

## Work

1. Write an ADR first when the change is architectural (`adr-on-branch`)
2. Write tests with the code (`testing-vitest`)
3. Commit with Conventional Commits (`git-conventional-commits`)
4. Before opening the PR, `pr-gate` must pass: `npm run verify` green on lint, typecheck, test and build

## Finish

```bash
git push -u origin <type>/<short-name>
gh pr create --title "<type>(<scope>): <subject>"
```

PR titles follow `git-conventional-commits`. Never push to `main`.

## Clean Up

After the PR merges, from the primary checkout:

```bash
git worktree remove .worktrees/<type>-<short-name>
git branch -d <type>/<short-name>
git worktree prune
```

`git worktree list` shows every active worktree. Remove only worktrees whose branch is merged or abandoned, and check `git status` inside one before removing it.

## Rules

- One worktree per branch, one branch per change
- Stash is shared across worktrees; commit WIP instead of stashing
- Emergency bypass for the commit hook (conflict resolution in the primary checkout): `ALLOW_PRIMARY_COMMIT=1 git commit`
