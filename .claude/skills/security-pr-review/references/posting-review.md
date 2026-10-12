# Posting the Review

## Summary review

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

## Inline comments

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

## No findings

```bash
gh pr review <PR_NUMBER> --approve --body "No security issues found."
```

## Inline comment format

````
**[SEVERITY] Category**

Brief description of the issue.

**Risk:** What an attacker could do.

**Fix:**
```typescript
// suggested fix
```
````
