---
name: adr-on-branch
description: Use when a branch makes a significant architectural decision, picks between technical approaches, or adds a new dependency or pattern.
---

# Architecture Decision Records (ADR)

Every branch with a significant architectural decision gets an ADR in MADR format, written in English. ADRs record WHY, not what was built.

## When to Write One

Write an ADR when the branch:
- Introduces a new pattern, library or framework
- Chooses between two or more viable approaches
- Changes how modules are structured or interact
- Makes a trade-off that is hard to reverse

Skip it for bug fixes with no architectural impact, routes added to an existing module with the same pattern, and styling or docs-only changes.

## Location and Naming

```
src/docs/adr/YYYYMMDD-NNN-short-title.md
```

`NNN` increments sequentially. The title is kebab-case and names the decision made, not the problem: `20260406-002-write-result-pattern-for-repositories.md`.

The MADR template is in `references/madr-template.md`.

## Workflow

1. **Branch start**: create the ADR with `Status: proposed`; fill Context, Drivers and Options before coding
2. **PR open**: finalize Decision Outcome, set `Status: accepted`, link the ADR in the PR description
3. **Superseded**: set `Status: superseded by ADR-NNN`; old ADRs stay in the repo

PR description link:

```markdown
## Architecture Decision
[ADR-NNN: Short title](src/docs/adr/YYYYMMDD-NNN-short-title.md)
```

## Quality Bar

- Reasoning, not implementation steps
- At least two evaluated options under Considered Options
- Written at branch start, before the code
- Specific drivers: "testability without a database connection", never "it's better"
