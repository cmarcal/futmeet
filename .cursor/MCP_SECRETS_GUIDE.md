# Secure MCP Configuration Guide

This guide shows how to use environment variables in `mcp.json` to keep secrets safe.

## Problem

Hardcoding secrets (like GitHub PAT) in `mcp.json` is insecure:
- ❌ Secrets can be accidentally committed to git
- ❌ Anyone with access to the file can see your tokens
- ❌ Hard to rotate or change tokens

## Solution: Environment Variables

Use `${env:VARIABLE_NAME}` syntax in `mcp.json` to reference environment variables.

## Step 1: Set Environment Variable (Windows)

### Option A: System Environment Variables (Recommended)

1. Open System Environment Variables:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → Click "Environment Variables"

2. Under "User variables", click "New":
   - **Variable name**: `GITHUB_PERSONAL_ACCESS_TOKEN`
   - **Variable value**: Your actual GitHub PAT (starts with `ghp_`)

3. Click OK and restart Cursor for changes to take effect

### Option B: PowerShell Session (Temporary)

For current session only (resets when you close PowerShell):

```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "your_token_here"
```

### Option C: User Profile Script (Persistent)

Add to your PowerShell profile to set it on every terminal session:

1. Edit your profile:
   ```powershell
   notepad $PROFILE
   ```

2. Add this line:
   ```powershell
   $env:GITHUB_PERSONAL_ACCESS_TOKEN = "your_token_here"
   ```

3. If file doesn't exist, create it first:
   ```powershell
   if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -Type File }
   ```

**Note**: This approach stores the token in plain text in your profile. Use Option A for better security.

## Step 2: Update mcp.json

Update your `~/.cursor/mcp.json` to use the environment variable:

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

**Key change**: `"Bearer YOUR_TOKEN"` → `"Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}"`

## Step 3: Verify Configuration

After setting the environment variable and updating `mcp.json`:

1. **Restart Cursor** (required to pick up new environment variables)
2. Test by asking Cursor: "List open pull requests in [owner]/[repo]"

## Alternative: Using a .env File (Advanced)

If you prefer a file-based approach:

### 1. Create `.env.mcp` in your home directory

```powershell
# c:\Users\roberto\.env.mcp
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

### 2. Use envmcp tool (if available)

Some setups support loading `.env` files. Check if your MCP server supports this.

## Security Best Practices

1. **Never commit `.env` files or `mcp.json` with hardcoded secrets**
2. **Use `.gitignore`** to exclude files with secrets
3. **Restrict file permissions** on files containing secrets:
   ```powershell
   icacls "$env:USERPROFILE\.env.mcp" /inheritance:r /grant:r "$env:USERNAME:(R)"
   ```
4. **Rotate tokens regularly**
5. **Use minimal scopes** on GitHub tokens (only what you need)

## .gitignore Example

If you store `.env` files in your project:

```gitignore
# Environment files
.env
.env.mcp
.env.local
*.pat
*.token
*.secret
```

## Troubleshooting

### Environment Variable Not Found

**Problem**: Cursor can't find `${env:GITHUB_PERSONAL_ACCESS_TOKEN}`

**Solutions**:
1. Verify variable is set:
   ```powershell
   echo $env:GITHUB_PERSONAL_ACCESS_TOKEN
   ```
2. **Restart Cursor** after setting environment variable
3. Check variable name spelling (case-sensitive)
4. Ensure you set it as a User variable, not just in PowerShell session

### Token Not Working After Switch

**Problem**: MCP works with hardcoded token but not with environment variable

**Solutions**:
1. Verify token is still valid (check on GitHub)
2. Check for extra spaces in `${env:VARIABLE_NAME}` syntax
3. Ensure token includes `ghp_` prefix if using classic token

## Quick Reference

### Check Environment Variable
```powershell
echo $env:GITHUB_PERSONAL_ACCESS_TOKEN
```

### Set Environment Variable (Session)
```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_your_token_here"
```

### Set Environment Variable (System - User)
```powershell
[System.Environment]::SetEnvironmentVariable('GITHUB_PERSONAL_ACCESS_TOKEN', 'ghp_your_token_here', 'User')
```

### mcp.json Syntax
```json
{
  "headers": {
    "Authorization": "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}"
  }
}
```
