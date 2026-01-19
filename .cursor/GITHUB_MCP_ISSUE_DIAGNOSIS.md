# GitHub MCP Connection Failure - Diagnosis

## ✅ Verified Working

1. **Token is VALID** ✅
   - Token exists and is set correctly
   - Token successfully authenticates with GitHub API
   - GitHub user: `cmarcal`
   - Status: 200 OK

2. **Configuration Syntax** ✅
   - `mcp.json` uses correct syntax
   - Environment variable is set at User level

## ❌ Root Cause Analysis

Based on research and common issues, the most likely problems are:

### Issue #1: Environment Variable Expansion (MOST LIKELY)

**Problem**: Cursor may not be expanding `${env:GITHUB_PERSONAL_ACCESS_TOKEN}` in the `headers` section of `mcp.json`.

**Evidence**: 
- Token works when tested directly
- Configuration syntax is correct
- But MCP server doesn't connect

**Why This Happens**:
- Some Cursor versions don't expand environment variables in HTTP headers
- The literal string `${env:GITHUB_PERSONAL_ACCESS_TOKEN}` may be sent instead of the actual token
- This causes authentication to fail

### Issue #2: Global vs Project-Level Config

**Problem**: Global `~/.cursor/mcp.json` may not work as reliably as project-level `.cursor/mcp.json`.

**Solution**: Created project-level config at `c:\Users\roberto\futmeet\.cursor\mcp.json`

### Issue #3: Cursor Not Sending Headers

**Problem**: Cursor may not be sending the Authorization header correctly to the MCP server.

## 🔧 Solutions to Try (In Order)

### Solution 1: Use Project-Level mcp.json (DONE)

✅ Created `c:\Users\roberto\futmeet\.cursor\mcp.json` with GitHub MCP config.

**Next Step**: Restart Cursor and test.

### Solution 2: Temporary Hardcoded Token Test

If project-level config doesn't work, test with hardcoded token to confirm env var expansion is the issue:

**Temporarily** update `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "Figma": {
      "url": "https://mcp.figma.com/mcp",
      "headers": {}
    },
    "github": {
      "name": "github",
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer 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",
        "X-MCP-Toolsets": "pull_requests,repos,issues"
      }
    }
  }
}
```

⚠️ **Warning**: This is for testing only! If this works, it confirms env var expansion is the issue.

### Solution 3: Use Cursor Settings UI

Instead of editing `mcp.json`:

1. Open Cursor Settings: `Ctrl+Shift+J`
2. Go to **MCP** section
3. Add/Edit GitHub MCP server
4. Enter token directly in the UI (may handle it differently than JSON)

### Solution 4: Local MCP Server

If hosted endpoint has issues, use local server:

```bash
npm install -g @modelcontextprotocol/server-github
```

Then update config to use `stdio` instead of `http`.

## Diagnostic Checklist

- [x] Token is valid (tested with GitHub API)
- [x] Environment variable is set (User-level)
- [x] mcp.json syntax is correct
- [x] Created project-level mcp.json
- [ ] **Restart Cursor** (required)
- [ ] Check if GitHub MCP connects after restart
- [ ] If not, try hardcoded token test
- [ ] Check Cursor Developer Console for errors

## Most Likely Fix

**The issue is almost certainly environment variable expansion in headers.**

**Recommended Action**:
1. **Restart Cursor** (project-level config may work better)
2. If still not working, **temporarily hardcode token** to confirm
3. If hardcoded works, consider:
   - Using Cursor Settings UI instead of JSON
   - Using a local MCP server with `env` section
   - Keeping token hardcoded (less secure, but may be necessary)

## Why This Happens

According to research:
- Cursor CLI and some versions have bugs with environment variable expansion in `mcp.json`
- Headers may not support `${env:VAR}` syntax reliably
- Some users report that only hardcoded tokens work
- Project-level config sometimes works better than global

## Next Steps

1. ✅ Project-level `mcp.json` created
2. **Restart Cursor completely**
3. Test connection
4. If fails, try hardcoded token test
5. Check Developer Console for specific errors
