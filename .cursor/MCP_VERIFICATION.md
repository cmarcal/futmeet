# MCP Connection Verification Guide

## Current Status

**Configuration**: ✅ `mcp.json` is properly configured to use environment variables  
**Environment Variable**: ❌ `GITHUB_PERSONAL_ACCESS_TOKEN` is **NOT SET**  
**MCP Server Status**: ❌ GitHub MCP server is **NOT CONNECTED**

## Issues Found

1. **Environment Variable Missing**: The `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable is not set
2. **MCP Server Not Connected**: Without the environment variable, Cursor cannot authenticate with GitHub's MCP server

## Fix Steps

### Step 1: Set Environment Variable

**Option A: PowerShell (Permanent - Recommended)**

Open PowerShell and run:

```powershell
# Replace 'your_actual_token_here' with your GitHub PAT
[System.Environment]::SetEnvironmentVariable('GITHUB_PERSONAL_ACCESS_TOKEN', 'your_actual_token_here', 'User')
```

**Option B: System Environment Variables (GUI)**

1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to "Advanced" tab → Click "Environment Variables"
3. Under "User variables", click "New"
4. **Variable name**: `GITHUB_PERSONAL_ACCESS_TOKEN`
5. **Variable value**: Your GitHub PAT (starts with `ghp_`)
6. Click OK

### Step 2: Verify Environment Variable is Set

In a **new PowerShell window**:

```powershell
echo $env:GITHUB_PERSONAL_ACCESS_TOKEN
```

If it shows your token, the variable is set correctly. If it's empty, you need to set it first.

### Step 3: Restart Cursor

**IMPORTANT**: You **must restart Cursor** completely for it to pick up the new environment variable.

1. Close Cursor completely (not just the window)
2. Reopen Cursor
3. Wait a few seconds for MCP servers to connect

### Step 4: Verify Connection

After restarting Cursor, you can test the connection by:

1. **Ask Cursor directly**: "List open pull requests in [owner]/[repo]"
2. **Check MCP Resources**: The MCP server should appear in available resources

## Verification Checklist

- [ ] Environment variable `GITHUB_PERSONAL_ACCESS_TOKEN` is set (check in PowerShell)
- [ ] Cursor has been **fully restarted** after setting the variable
- [ ] `mcp.json` uses `${env:GITHUB_PERSONAL_ACCESS_TOKEN}` syntax
- [ ] GitHub MCP server appears in available MCP resources
- [ ] Can ask Cursor to list pull requests successfully

## Current Configuration Status

### ✅ mcp.json Configuration (Correct)

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
        "Authorization": "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}",
        "X-MCP-Toolsets": "pull_requests,repos,issues"
      }
    }
  }
}
```

**Status**: Configuration is correct, but requires environment variable to be set.

### ❌ Environment Variable (Missing)

```powershell
# Check current value
echo $env:GITHUB_PERSONAL_ACCESS_TOKEN
# Expected: Your GitHub PAT (starts with ghp_)
# Actual: Empty or undefined
```

## Quick Test After Setup

Once you've set the environment variable and restarted Cursor, test with:

```
"List open pull requests in [your-username]/[your-repo]"
```

Or for a public repo:

```
"List open pull requests in microsoft/vscode"
```

## Troubleshooting

### If Environment Variable Still Not Working

1. **Check variable name**: Must be exactly `GITHUB_PERSONAL_ACCESS_TOKEN` (case-sensitive)
2. **Restart required**: Cursor only reads environment variables at startup
3. **Verify in new terminal**: The variable must be set system-wide, not just in your current session
4. **Check token format**: Should start with `ghp_` for classic tokens

### If MCP Server Still Not Connecting

1. **Check token validity**: Verify your GitHub PAT is still valid
2. **Check token scopes**: Must have `repo` scope enabled
3. **Check internet connection**: MCP server requires internet access
4. **Check Cursor logs**: Look for MCP connection errors in Cursor's developer console

## Next Steps

1. ✅ Set `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable
2. ✅ Verify variable is set: `echo $env:GITHUB_PERSONAL_ACCESS_TOKEN`
3. ✅ **Restart Cursor completely**
4. ✅ Test by asking Cursor to list pull requests
