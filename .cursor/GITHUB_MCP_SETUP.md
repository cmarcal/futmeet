# GitHub MCP Setup Guide

This guide explains how to set up GitHub MCP (Model Context Protocol) in Cursor to enable pull request operations (create, merge, close).

## Prerequisites

1. **GitHub Account**: You need a GitHub account with access to the repositories you want to manage
2. **GitHub Personal Access Token (PAT)**: Required for authentication

## Step 1: Create a GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Direct link: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Configure the token:
   - **Note**: `Cursor GitHub MCP` (or any descriptive name)
   - **Expiration**: Set your preferred expiration (or no expiration)
   - **Scopes**: Select at minimum:
     - ✅ `repo` (Full control of private repositories)
       - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
4. Click "Generate token"
5. **Copy the token immediately** - you won't be able to see it again!

## Step 2: Install GitHub MCP Server (Optional - Local)

If you want to run a local MCP server instead of using GitHub's hosted endpoint:

```bash
npm install -g @modelcontextprotocol/server-github
```

## Step 3: Configure GitHub MCP in Cursor

### Option A: Using Cursor Settings UI (Recommended)

1. Open Cursor Settings:
   - `Cmd+Shift+J` (Mac) or `Ctrl+Shift+J` (Windows/Linux)
   - Or: Cursor → Settings → MCP

2. Click "Add MCP Server" or configure existing server

3. Add GitHub MCP Server with these settings:

**For GitHub's Hosted Endpoint (Recommended):**
```json
{
  "name": "github",
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "Authorization": "Bearer YOUR_GITHUB_PAT_HERE",
    "X-MCP-Toolsets": "pull_requests,repos,issues"
  }
}
```

**For Local MCP Server:**
```json
{
  "name": "github",
  "command": "github-mcp-server",
  "args": [
    "--toolsets", "pull_requests,repos,issues"
  ],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT_HERE"
  }
}
```

### Option B: Using Settings JSON

1. Open Cursor Settings (JSON mode)
   - `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: "Preferences: Open User Settings (JSON)"

2. Add MCP configuration to `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "github": {
        "type": "http",
        "url": "https://api.githubcopilot.com/mcp/",
        "headers": {
          "Authorization": "Bearer YOUR_GITHUB_PAT_HERE",
          "X-MCP-Toolsets": "pull_requests,repos,issues"
        }
      }
    }
  }
}
```

**Replace `YOUR_GITHUB_PAT_HERE` with your actual token!**

## Step 4: Available Tools for Pull Requests

Once configured, the GitHub MCP server provides these pull request tools:

### Create Pull Request
- **Tool**: `create_pull_request`
- **Parameters**: 
  - `owner`: Repository owner (username or org)
  - `repo`: Repository name
  - `title`: PR title
  - `head`: Source branch
  - `base`: Target branch
  - `body`: Optional PR description
  - `draft`: Optional draft flag

### List Pull Requests
- **Tool**: `list_pull_requests`
- **Parameters**:
  - `owner`: Repository owner
  - `repo`: Repository name
  - `state`: Optional filter (`open`, `closed`, `all`)

### Read Pull Request
- **Tool**: `pull_request_read`
- **Parameters**:
  - `owner`: Repository owner
  - `repo`: Repository name
  - `pullRequestNumber`: PR number
  - `method`: Optional (`get`, `get_diff`, `get_files`, `get_comments`, `get_reviews`)

### Merge Pull Request
- **Tool**: `merge_pull_request`
- **Parameters**:
  - `owner`: Repository owner
  - `repo`: Repository name
  - `pullRequestNumber`: PR number
  - `mergeMethod`: Optional (`merge`, `squash`, `rebase`)
  - `commitTitle`: Optional custom commit title
  - `commitMessage`: Optional custom commit message

### Update/Close Pull Request
- **Tool**: `update_pull_request`
- **Parameters**:
  - `owner`: Repository owner
  - `repo`: Repository name
  - `pullRequestNumber`: PR number
  - `state`: Set to `"closed"` to close, `"open"` to reopen

## Step 5: Security Best Practices

1. **Never commit your PAT to version control**
   - Store it in Cursor settings only
   - Consider using environment variables for local servers

2. **Use minimal scopes**
   - Only grant `repo` scope if you need write access
   - For read-only, use `public_repo` or no token for public repos

3. **Set token expiration**
   - Regularly rotate tokens
   - Revoke old/unused tokens

4. **Read-only mode** (if using local server):
   ```json
   {
     "args": ["--read-only", "--toolsets", "pull_requests"]
   }
   ```

## Verification

After setup, you can test the MCP connection by asking Cursor:

- "List open pull requests in [owner]/[repo]"
- "Create a pull request from [branch] to [branch] in [owner]/[repo]"
- "Show details for pull request #123 in [owner]/[repo]"

## Troubleshooting

### MCP Server Not Connecting
- Verify your GitHub PAT is correct
- Check token has `repo` scope enabled
- Ensure Cursor has internet access

### Authentication Errors
- Regenerate your GitHub PAT
- Verify token hasn't expired
- Check token has required scopes

### Tools Not Available
- Verify `pull_requests` toolset is enabled in headers/args
- Check server configuration is correct
- Restart Cursor after configuration changes

## Resources

- [GitHub MCP Server Repository](https://github.com/github/github-mcp-server)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)

## Quick Reference

### Environment Variable for Local Server
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
```

### Command Line (Local Server)
```bash
github-mcp-server \
  --toolsets pull_requests,repos \
  --env GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
```
