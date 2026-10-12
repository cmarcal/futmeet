---
name: security-pr-review
description: Use when asked to review a PR for security issues, audit code changes, or check for vulnerabilities. Posts findings as a PR review via gh CLI.
---

# Security PR Review

Review a pull request for security issues and post the findings as a GitHub review with inline comments.

## Workflow

### 1. Gather PR data

```bash
gh pr view <PR_NUMBER> --json number,title,body,baseRefName,headRefName,author,files
gh pr diff <PR_NUMBER>
```

No PR number given: run `gh pr list` and ask the user to pick one.

### 2. Analyze

Read `references/security-checklist.md` and cover every category:

- Secrets and credentials
- Injection (SQL, command, template)
- XSS (`dangerouslySetInnerHTML`, `innerHTML`)
- Broken authentication / authorization (missing checks, IDOR, JWT misuse)
- Input validation at system boundaries
- Path traversal and SSRF
- Insecure deserialization
- Sensitive data in logs, errors, responses
- New dependencies
- Weak cryptography
- Race conditions on shared resources

Done when every category has a recorded verdict (finding or "clear") for the whole diff.

Per finding record: file and line, severity, category, description, concrete fix.

### 3. Post the review

Submit one review: inline comments per finding, `REQUEST_CHANGES` when findings exist, `--approve` with "No security issues found." when none. Commands and the comment format are in `references/posting-review.md`.

## Severity

| Severity | Criteria |
|---|---|
| CRITICAL | Directly exploitable; data breach or RCE |
| HIGH | Likely exploitable with moderate effort |
| MEDIUM | Exploitable under specific conditions |
| LOW | Defense-in-depth concern |
| INFO | Hardening suggestion |

## Project Hot Spots

- Raw SQL via `pg` with no ORM: scrutinize every query for string concatenation
- Write paths use `SELECT FOR UPDATE` (`api-pg-transaction-lock`): verify the lock is present
- Fastify routes with a body carry a JSON schema (`api-fastify-module`)
- IDs come from `nanoid` or `crypto.randomUUID()`; flag anything else
