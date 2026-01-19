# GitHub MCP Connection Troubleshooting

## Current Status Analysis

### ✅ What's Working
- Environment variable `GITHUB_PERSONAL_ACCESS_TOKEN` is **SET** (User-level)
- `mcp.json` configuration syntax is **CORRECT**
- Token format appears valid (starts with `ghp_`)

### ❌ What's Not Working
- GitHub MCP server is **NOT CONNECTING**
- MCP resources show only Figma, not GitHub

## Common Causes & Solutions

### Issue 1: Environment Variable Not Expanded by Cursor

**Problem**: Cursor may not expand `${env:VARIABLE}` syntax in `mcp.json` headers.

**Solution A: Try Direct Token (Temporary Test)**

Temporarily hardcode the token to test if the issue is environment variable expansion:

```json
{
  "mcpServers": {
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

⚠️ **Warning**: Only for testing! If this works, the issue is environment variable expansion.

**Solution B: Use Project-Level mcp.json**

Some users report that project-level `.cursor/mcp.json` works better than global `~/.cursor/mcp.json`:

1. Create `.cursor/mcp.json` in your project root (`c:\Users\roberto\futmeet\.cursor\mcp.json`)
2. Copy the GitHub MCP configuration there
3. Restart Cursor

### Issue 2: Cursor Not Sending Authorization Header

**Problem**: Cursor may not be sending the Authorization header correctly.

**Check**: Look in Cursor's Developer Console:
1. Help → Toggle Developer Tools
2. Check Console for MCP connection errors
3. Look for 401 (Unauthorized) or missing header errors

**Solution**: Ensure the header format is exactly:
```json
"Authorization": "Bearer YOUR_TOKEN"
```
(No extra spaces, correct capitalization)

### Issue 3: Wrong URL or Endpoint

**Problem**: The GitHub MCP endpoint URL might be incorrect.

**Current URL**: `https://api.githubcopilot.com/mcp/`

**Verify**: This is the correct endpoint for GitHub's hosted MCP server.

**Alternative**: If using a local server, the configuration would be different:
```json
{
  "command": "github-mcp-server",
  "args": ["--toolsets", "pull_requests,repos,issues"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token"
  }
}
```

### Issue 4: Token Permissions/Scopes

**Problem**: Token may not have required scopes.

**Check**: 
1. Go to https://github.com/settings/tokens
2. Find your token
3. Verify it has `repo` scope enabled

**Required Scopes**:
- ✅ `repo` (for private repos and PR operations)
- ✅ `public_repo` (if only using public repos)

### Issue 5: Cursor Version/Update Needed

**Problem**: Older Cursor versions may have bugs with MCP header handling.

**Solution**: 
1. Check Cursor version: Help → About
2. Update to latest version if available
3. Some MCP header bugs were fixed in recent updates

### Issue 6: MCP Server Not Initializing

**Problem**: MCP servers may fail to initialize silently.

**Check MCP Status in Cursor**:
1. Open Settings: `Ctrl+Shift+J`
2. Navigate to **MCP** section
3. Check if GitHub server appears in the list
4. Look for error messages or connection status

## Diagnostic Steps

### Step 1: Test with Hardcoded Token

Temporarily replace `${env:GITHUB_PERSONAL_ACCESS_TOKEN}` with the actual token to isolate the issue:

```json
"Authorization": "Bearer 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"
```

**If this works**: The issue is environment variable expansion.  
**If this doesn't work**: The issue is authentication, URL, or token validity.

### Step 2: Check Cursor Developer Console

1. Help → Toggle Developer Tools
2. Go to Console tab
3. Look for MCP-related errors:
   - `401 Unauthorized` → Authentication issue
   - `404 Not Found` → URL issue
   - `Connection failed` → Network/endpoint issue
   - `Missing header` → Header not being sent

### Step 3: Verify Token Validity

Test your token directly with curl:

```powershell
$token = [System.Environment]::GetEnvironmentVariable('GITHUB_PERSONAL_ACCESS_TOKEN', 'User')
curl -H "Authorization: Bearer $token" https://api.github.com/user
```

If this returns your GitHub user info, the token is valid.

### Step 4: Check MCP Server Status

In Cursor Settings → MCP, verify:
- GitHub server appears in the list
- Connection status shows "Connected" or "Error"
- Any error messages are displayed

## Alternative Configuration Methods

### Method 1: Project-Level mcp.json

Create `c:\Users\roberto\futmeet\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "name": "github",
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}",
        "X-MCP-Toolsets": "pull_requests,repos,issues"
      }
    }
  }
}
```

### Method 2: Use Cursor Settings UI

Instead of editing `mcp.json` directly:

1. Open Cursor Settings: `Ctrl+Shift+J`
2. Navigate to **MCP** section
3. Add/Edit GitHub MCP server
4. Enter token directly in the UI (may handle env vars differently)

### Method 3: Local MCP Server

If the hosted endpoint doesn't work, try a local server:

1. Install: `npm install -g @modelcontextprotocol/server-github`
2. Update `mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "github-mcp-server",
      "args": [
        "--toolsets", "pull_requests,repos,issues"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Most Likely Issues (Based on Research)

1. **Environment Variable Expansion**: Cursor may not expand `${env:VAR}` in headers
   - **Fix**: Try hardcoded token temporarily to test

2. **Header Not Sent**: Cursor may not be sending the Authorization header
   - **Fix**: Check Developer Console for errors

3. **Project vs Global Config**: Global `~/.cursor/mcp.json` may not work as expected
   - **Fix**: Try project-level `.cursor/mcp.json`

4. **Cursor Version**: Older versions may have MCP bugs
   - **Fix**: Update Cursor to latest version

## Quick Test Procedure

1. **Temporarily hardcode token** in `mcp.json` (for testing only)
2. **Restart Cursor completely**
3. **Check if GitHub MCP connects**
4. **If it works**: Issue is env var expansion → Use hardcoded token OR find alternative method
5. **If it doesn't work**: Issue is token/auth/URL → Check token validity and scopes

## Next Steps

1. Try hardcoded token test (temporary)
2. Check Cursor Developer Console for errors
3. Verify token is valid with curl test
4. Check Cursor MCP settings UI for connection status
5. Consider using project-level `mcp.json` instead of global
