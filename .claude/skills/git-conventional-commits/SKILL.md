---
name: git-conventional-commits
description: Use when creating branches, writing commit messages, or titling pull requests. Enforces Conventional Commits specification with correct type prefixes, imperative mood, and scope conventions.
---

# Git Conventional Commits

Always use Conventional Commits for branch names, commit messages, and PR titles.

## Branch Naming

Format: `{type}/{short-description}`

| Type | Use for |
|------|---------|
| `feat/` | New features, enhancements |
| `fix/` | Bug fixes |
| `hotfix/` | Critical production bugs |
| `chore/` | Maintenance, dependencies, build config |
| `docs/` | Documentation |
| `style/` | Code style, formatting |
| `refactor/` | Refactoring without behavior change |
| `perf/` | Performance improvements |
| `test/` | Tests |
| `ci/` | CI/CD changes |

Rules: lowercase, hyphens only, under 50 chars, no spaces or special characters.

```
feat/add-player-input-form      ✅
fix/team-sorting-edge-case      ✅
hotfix/critical-memory-leak     ✅
feature/add-player-form         ❌ (wrong prefix)
FEAT/ADD-FORM                   ❌ (uppercase)
```

## Commit Message Format

```
{type}({scope}): {subject}

{body}

{footer}
```

- **type**: same types as branch prefixes
- **scope** (optional): `components`, `pages`, `store`, `api`, `styles`, `config`, `deps`
- **subject**: imperative mood, lowercase first letter, no period, max 50 chars
- **body** (optional): explain what and why, wrap at 72 chars
- **footer** (optional): `BREAKING CHANGE: ...`, `Closes #123`

### Examples

```
feat(components): add player input form

Add form component for adding new players to the game list.
Includes validation and error handling.
```

```
fix(store): correct team sorting algorithm

Fix edge case where teams were not balanced when odd number
of players. Now handles remainder players correctly.

Fixes #42
```

```
hotfix(api): fix critical memory leak in player list

Resolve memory leak that occurred when removing players
from large lists.

BREAKING CHANGE: Player removal now requires confirmation
```

```
chore(deps): update React to 18.3.1
```

## PR Titles

Use the same `{type}({scope}): {subject}` format as commit subjects.

## Common Workflows

```bash
# Feature
git checkout -b feat/add-player-management
git commit -m "feat(components): add player input form"
git push -u origin feat/add-player-management
# PR title: feat(components): Add player input form

# Bug fix
git checkout -b fix/player-count-display
git commit -m "fix(components): correct player count display

Player count badge was showing incorrect number after removing players.

Fixes #15"

# Hotfix (branch from main)
git checkout main
git checkout -b hotfix/critical-sorting-bug
git commit -m "hotfix(utils): fix critical team sorting bug

BREAKING CHANGE: Sorting now requires at least 2 players"
```

## Rules Summary

1. Always use a type prefix on branches and in commit messages
2. Subject line: imperative mood ("add" not "added"), max 50 chars, no trailing period
3. Body: explain what and why (not how), wrap at 72 chars
4. Footer: reference issues with `Fixes #N` or `Closes #N`
5. PR titles match commit message format
