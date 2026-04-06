---
name: adr-on-branch
description: Use when starting a branch with a significant architectural decision, choosing between technical approaches, adding a new dependency or pattern, or when a choice needs its reasoning preserved for future contributors.
---

# Architecture Decision Records (ADR)

## Overview
Every branch that introduces a significant architectural decision gets an ADR in MADR format. ADRs capture WHY a decision was made — not what was built — so future contributors understand reasoning and trade-offs. **All ADRs must be written in English.**

## When to Write an ADR

**Write an ADR when the branch:**
- Introduces a new pattern, library, or framework
- Chooses between two or more viable technical approaches
- Changes how modules are structured or interact
- Makes a trade-off that will be hard to reverse

**Skip an ADR for:**
- Bug fixes with no architectural impact
- Adding a route/endpoint to an existing module (same pattern as before)
- Styling or documentation-only changes

## File Location and Naming

```
src/docs/adr/YYYYMMDD-NNN-short-title.md
```

Examples:
- `src/docs/adr/20260315-001-use-pg-over-orm.md`
- `src/docs/adr/20260406-002-write-result-pattern-for-repositories.md`

Increment `NNN` sequentially. Use kebab-case for the title (the decision made, not the problem).

## MADR Template

```markdown
# [Short title — the decision made, not the problem]

* Status: [proposed | accepted | deprecated | superseded by ADR-NNN]
* Date: YYYY-MM-DD
* Branch/PR: [branch name or PR link]

## Context and Problem Statement

[2-3 sentences describing the situation. Frame as a question if helpful.]

## Decision Drivers

* [Key constraint or quality attribute — e.g., testability without a real database]
* [Another driver — performance, simplicity, consistency with existing patterns, …]

## Considered Options

* [Option A]
* [Option B]
* [Option C]

## Decision Outcome

Chosen option: **[Option X]**, because [one clear sentence with the key reason].

### Positive Consequences

* [What improves as a result]

### Negative Consequences

* [What we accept as a trade-off]

## Pros and Cons of the Options

### [Option A]

* Good, because [reason]
* Bad, because [reason]

### [Option B]

* Good, because [reason]
* Bad, because [reason]
```

## Workflow

1. **Branch start** — create ADR with `Status: proposed`; fill Context, Drivers, Options before coding
2. **PR open** — finalize Decision Outcome; change to `Status: accepted`; add link in PR description
3. **If superseded** — update `Status: superseded by ADR-NNN`; never delete old ADRs

## Linking from PR Description

```markdown
## Architecture Decision
[ADR-NNN: Short title](src/docs/adr/YYYYMMDD-NNN-short-title.md)
```

## Common Mistakes

- **Describing what was built, not why** — ADRs capture reasoning, not implementation steps
- **Skipping Considered Options** — a decision without evaluated alternatives is just a command
- **Writing the ADR after the PR** — write it at branch start; it clarifies thinking before coding
- **Vague decision drivers** — "it's better" is not a driver; "testability without a database connection" is
