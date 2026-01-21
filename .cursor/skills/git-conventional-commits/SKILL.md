---
name: git-conventional-commits
description: Use Conventional Commits pattern for Git operations. This skill guides creating branches, commits, and pull requests following the Conventional Commits specification with proper prefixes and commit message format.
---

# Git Conventional Commits

When working with Git in this project, always use the Conventional Commits pattern for branch names, commit messages, and pull request titles. This ensures consistency, better changelog generation, and semantic versioning support.

## When to Use This Skill

- Creating new Git branches
- Writing commit messages
- Creating pull requests
- Naming branches for features, bug fixes, or other changes

## Key Principles

1. **Conventional Commits**: Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification
2. **Branch Naming**: Use type prefixes for branch names
3. **Commit Messages**: Use structured commit message format
4. **Consistency**: Always use the same pattern across all Git operations

## Branch Naming Convention

### Format
```
{type}/{short-description}
```

### Types

#### Feature Branches
- **Prefix**: `feat/`
- **Use for**: New features, enhancements, new functionality
- **Examples**:
  - `feat/add-player-management`
  - `feat/team-sorting-algorithm`
  - `feat/priority-player-system`

#### Bug Fix Branches
- **Prefix**: `fix/` or `hotfix/`
- **Use for**: Bug fixes
  - `fix/` - Regular bug fixes
  - `hotfix/` - Critical production bugs that need immediate attention
- **Examples**:
  - `fix/player-list-rendering`
  - `hotfix/critical-sorting-bug`
  - `fix/team-count-validation`

#### Other Branch Types
- **Prefix**: `chore/` - Maintenance tasks, dependencies, build config
- **Prefix**: `docs/` - Documentation changes
- **Prefix**: `style/` - Code style changes (formatting, missing semicolons)
- **Prefix**: `refactor/` - Code refactoring without feature changes or bug fixes
- **Prefix**: `perf/` - Performance improvements
- **Prefix**: `test/` - Adding or updating tests
- **Prefix**: `ci/` - CI/CD changes

### Branch Name Guidelines

- Use lowercase
- Use hyphens to separate words
- Keep it short but descriptive (50 characters max recommended)
- No spaces or special characters
- Start with the type prefix

**Examples**:
```
✅ feat/add-player-input-form
✅ fix/team-sorting-edge-case
✅ hotfix/critical-memory-leak
✅ chore/update-dependencies
✅ docs/update-readme

❌ feature/add-player-form (should be feat/)
❌ bug-fix/player-list (should be fix/)
❌ new feature (no prefix, has space)
❌ FEAT/ADD-FORM (uppercase)
```

## Commit Message Format

### Structure
```
{type}({scope}): {subject}

{body}

{footer}
```

### Required Parts

#### Type (Required)
Same as branch types:
- `feat`: New feature
- `fix`: Bug fix
- `hotfix`: Critical production bug fix
- `chore`: Maintenance
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `perf`: Performance
- `test`: Tests
- `ci`: CI/CD

#### Scope (Optional)
The area of the codebase affected:
- `components`: Component changes
- `pages`: Page changes
- `store`: State management
- `api`: API layer
- `styles`: Styling
- `config`: Configuration
- `deps`: Dependencies

#### Subject (Required)
- Short description (50 characters max)
- Imperative mood ("add" not "added" or "adds")
- No period at the end
- First letter lowercase

#### Body (Optional)
- Detailed explanation (wrap at 72 characters)
- Explain "what" and "why" not "how"
- Can include multiple paragraphs

#### Footer (Optional)
- Breaking changes: `BREAKING CHANGE: {description}`
- Issue references: `Closes #123`, `Fixes #456`

### Commit Message Examples

#### Simple Feature
```
feat(components): add player input form

Add form component for adding new players to the game list.
Includes validation and error handling.
```

#### Bug Fix
```
fix(store): correct team sorting algorithm

Fix edge case where teams were not balanced when odd number
of players. Now handles remainder players correctly.

Fixes #42
```

#### Hotfix
```
hotfix(api): fix critical memory leak in player list

Resolve memory leak that occurred when removing players
from large lists. This was causing performance degradation.

BREAKING CHANGE: Player removal now requires confirmation
```

#### With Scope
```
feat(pages): implement game management page

Add complete game management interface with player list,
priority assignment, and team configuration.

Implements Phase 1, Step 2 from PROJECT_PLAN.md
```

#### Chore
```
chore(deps): update React to 18.3.1

Update React and React DOM to latest stable version.
No breaking changes expected.
```

## Pull Request Titles

### Format
Use the same format as commit messages:
```
{type}({scope}): {subject}
```

### Examples
```
feat(components): Add player management interface
fix(store): Fix team sorting edge case
hotfix(api): Resolve critical memory leak
chore(deps): Update dependencies
docs(readme): Update installation instructions
```

## Implementation Pattern

### Creating a Feature Branch

```bash
# User asks: "Create a branch for adding player management"
# Response: Create branch with feat/ prefix

git checkout -b feat/add-player-management
```

### Creating a Bug Fix Branch

```bash
# User asks: "Create a branch for fixing the sorting bug"
# Response: Create branch with fix/ prefix

git checkout -b fix/team-sorting-bug
```

### Creating a Hotfix Branch

```bash
# User asks: "Create a hotfix for critical production issue"
# Response: Create branch with hotfix/ prefix

git checkout -b hotfix/critical-memory-leak
```

### Writing Commit Messages

```bash
# Good commit message
git commit -m "feat(components): add player input form

- Add PlayerInput component with validation
- Integrate with Zustand store
- Add error handling and user feedback

Implements Phase 1, Step 2 from PROJECT_PLAN.md"

# Bad commit message (avoid)
git commit -m "added player form"  # Missing type, no detail
git commit -m "feat: add player form"  # Missing scope, no body
```

## Best Practices

1. **Always use type prefix** for branches and commits
2. **Be descriptive** but concise in branch names and commit messages
3. **Use scope** when it adds clarity (e.g., `feat(components):`)
4. **Write detailed body** for complex changes
5. **Reference issues** in footer when applicable
6. **Use imperative mood** in commit messages ("add" not "added")
7. **Keep subject line short** (50 characters max)
8. **Wrap body at 72 characters** for readability

## Common Patterns

### Feature Development
```bash
# Create branch
git checkout -b feat/add-priority-system

# Make changes and commit
git commit -m "feat(components): add priority toggle button

Add star icon button to player items for toggling priority status.
Button updates Zustand store and persists to localStorage."

# Push and create PR
git push -u origin feat/add-priority-system
# PR title: feat(components): Add priority toggle button
```

### Bug Fix
```bash
# Create branch
git checkout -b fix/player-count-display

# Fix and commit
git commit -m "fix(components): correct player count display

Player count badge was showing incorrect number after removing players.
Now correctly updates when players are added or removed.

Fixes #15"

# Push and create PR
git push -u origin fix/player-count-display
# PR title: fix(components): Correct player count display
```

### Hotfix
```bash
# Create branch from main (for production hotfix)
git checkout main
git checkout -b hotfix/critical-sorting-bug

# Fix and commit
git commit -m "hotfix(utils): fix critical team sorting bug

Fix bug where sorting algorithm crashed with empty player list.
Add validation to prevent crash and show user-friendly error.

BREAKING CHANGE: Sorting now requires at least 2 players"

# Push and create PR
git push -u origin hotfix/critical-sorting-bug
# PR title: hotfix(utils): Fix critical team sorting bug
```

## Related Files

- `adr/frontend/PROJECT_PLAN.md` - Project implementation plan
- `.cursor/rules/github-approval.mdc` - GitHub workflow rules

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Branching Best Practices](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)

## Checklist

When creating branches or commits:
- [ ] Use correct type prefix (`feat/`, `fix/`, `hotfix/`, etc.)
- [ ] Branch name is lowercase with hyphens
- [ ] Commit message follows conventional format
- [ ] Subject line is imperative mood and under 50 characters
- [ ] Body explains "what" and "why" (if needed)
- [ ] Footer includes issue references (if applicable)
- [ ] PR title matches commit message format
