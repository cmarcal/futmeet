---
name: git-conventional-commits
description: Use when creating branches, writing commit messages, or titling pull requests.
---

# Git Conventional Commits

Branch names, commit messages and PR titles all follow Conventional Commits. Work happens in a worktree on a branch, never on `main` (`worktree-workflow` skill).

## Types

| Type | Use for |
|------|---------|
| `feat` | New features, enhancements |
| `fix` | Bug fixes |
| `hotfix` | Critical production bugs |
| `chore` | Maintenance, dependencies, build config |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Refactoring without behavior change |
| `perf` | Performance |
| `test` | Tests |
| `ci` | CI/CD |

## Branch Names

`{type}/{short-description}`: lowercase, hyphens only, under 50 chars.

```
feat/add-player-input-form      ✅
feature/add-player-form         ❌ wrong prefix
FEAT/ADD-FORM                   ❌ uppercase
```

## Commit Messages

```
{type}({scope}): {subject}

{body}

{footer}
```

- **scope** (optional): `components`, `pages`, `store`, `api`, `styles`, `config`, `deps`
- **subject**: imperative mood, lowercase first letter, no period, max 50 chars
- **body** (optional): what and why, wrapped at 72 chars
- **footer** (optional): `BREAKING CHANGE: ...`, `Fixes #N`, `Closes #N`

```
fix(store): correct team sorting algorithm

Fix edge case where teams were not balanced when odd number
of players. Now handles remainder players correctly.

Fixes #42
```

## PR Titles

Same `{type}({scope}): {subject}` format as the commit subject.

## Workflow

```bash
git worktree add .worktrees/feat-add-player-management -b feat/add-player-management
git commit -m "feat(components): add player input form"
git push -u origin feat/add-player-management
```

Hotfixes branch from `main` the same way: `git worktree add .worktrees/hotfix-x -b hotfix/x main`.
