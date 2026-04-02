---
name: security-pr-review
description: >
  Expert security review of GitHub pull requests. Use when asked to review a PR for security issues,
  audit code changes, or check for vulnerabilities. Analyzes the PR diff for OWASP Top 10, injection
  flaws, secrets exposure, broken auth, insecure dependencies, and more. Posts findings as a structured
  PR review via gh CLI. Trigger phrases include "review PR", "security review", "audit PR", "check PR
  for vulnerabilities".
---

# Security PR Review

Perform a thorough security-focused review of a pull request and post findings as a GitHub review with inline comments.

## Workflow

### 1. Gather PR data

```bash
# PR metadata
gh pr view <PR_NUMBER> --json number,title,body,baseRefName,headRefName,author,files

# Full diff
gh pr diff <PR_NUMBER>

# Changed files list
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/files --jq '.[].filename'
```

If no PR number is provided, run `gh pr list` and ask the user to pick one.

### 2. Analyze for security issues

Read `references/security-checklist.md` for the full checklist. Cover every category:

- **Secrets & credentials** — hardcoded tokens, keys, passwords, connection strings
- **Injection** — SQL, command, LDAP, XPath, template injection
- **XSS** — unescaped output, `dangerouslySetInnerHTML`, `innerHTML`
- **Broken authentication / authorization** — missing auth checks, IDOR, JWT misuse
- **Input validation** — missing validation at system boundaries, type coercion, regex DoS
- **Path traversal** — user-controlled file paths, `../` sequences
- **SSRF** — user-controlled URLs passed to HTTP clients
- **Insecure deserialization** — `JSON.parse` on untrusted input without validation
- **Sensitive data exposure** — PII/secrets in logs, error messages, responses
- **Dependency risks** — new packages added; flag any that are unfamiliar or high-risk
- **Cryptography** — weak algorithms (MD5, SHA1, DES), hardcoded IVs/salts, insecure random
- **Race conditions** — missing locks on shared resources (especially relevant to this codebase's pessimistic locking pattern)

For each finding, record:
- **File path + line number(s)**
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW / INFO
- **Category**: (e.g., SQL Injection, Secrets Exposure)
- **Description**: what the vulnerability is and why it matters
- **Recommendation**: concrete fix

### 3. Post the review

Use a single `gh pr review` call to submit all findings at once:

```bash
gh pr review <PR_NUMBER> \
  --request-changes \
  --body "$(cat <<'EOF'
## Security Review

**Severity summary:** N CRITICAL | N HIGH | N MEDIUM | N LOW

> Reviewed by security-pr-review skill. Findings below as inline comments.
EOF
)"
```

Post each finding as an inline comment:

```bash
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/reviews \
  --method POST \
  --field commit_id="$(gh pr view <PR_NUMBER> --json headRefOid --jq '.headRefOid')" \
  --field body="Security review" \
  --field event="REQUEST_CHANGES" \
  --field "comments[][path]"="src/example.ts" \
  --field "comments[][line]"=42 \
  --field "comments[][body]"="**[HIGH] SQL Injection** — ..."
```

If there are **no findings**, post an approving review:

```bash
gh pr review <PR_NUMBER> --approve --body "No security issues found."
```

## Severity guidelines

| Severity | Criteria |
|---|---|
| CRITICAL | Directly exploitable, data breach or RCE possible |
| HIGH | Likely exploitable with moderate effort |
| MEDIUM | Exploitable under specific conditions |
| LOW | Defense-in-depth concern, unlikely to be directly exploited |
| INFO | Best practice / hardening suggestion |

## Output format for inline comments

```
**[SEVERITY] Category**

Brief description of the issue.

**Risk:** What an attacker could do.

**Fix:**
\`\`\`typescript
// suggested fix
\`\`\`
```

## Project context

This is a TypeScript monorepo (Node.js API with Fastify + PostgreSQL, React SPA). Key things to watch for:
- Raw SQL via `pg` pool — check for string concatenation in queries
- `SELECT FOR UPDATE` pattern — verify locks are used in write paths
- Fastify route schemas — verify all inputs are validated with JSON schema
- `nanoid` / `crypto.randomUUID()` for IDs — flag if anything else is used
- No ORM — SQL injection risk is higher; scrutinize every query

See `references/security-checklist.md` for detailed patterns per category.
