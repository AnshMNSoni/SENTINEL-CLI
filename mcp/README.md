# Sentinel MCP — Client Configuration Guide

## Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "sentinel": {
      "command": "node",
      "args": ["/path/to/SENTINEL-CLI/mcp/src/sentinel-mcp-server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "GROQ_API_KEY": "gsk_..."
      }
    }
  }
}
```

Once published to npm:
```json
{
  "mcpServers": {
    "sentinel": {
      "command": "npx",
      "args": ["sentinel-mcp"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

## Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "sentinel": {
      "command": "node",
      "args": ["/path/to/SENTINEL-CLI/mcp/src/sentinel-mcp-server.js"]
    }
  }
}
```

## Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "sentinel": {
      "command": "node",
      "args": ["/path/to/SENTINEL-CLI/mcp/src/sentinel-mcp-server.js"]
    }
  }
}
```

## Continue (VS Code extension)

In `~/.continue/config.json`, add to the `mcpServers` array:

```json
{
  "mcpServers": [
    {
      "name": "sentinel",
      "command": "node",
      "args": ["/path/to/SENTINEL-CLI/mcp/src/sentinel-mcp-server.js"]
    }
  ]
}
```

## Available tools (what the AI can call)

| Tool | What it does |
|------|-------------|
| `sentinel_analyze` | Scan files/directory with all analyzers |
| `sentinel_security_audit` | Focused security + secrets + CVE scan |
| `sentinel_review_code` | Analyze a code snippet inline (no file needed) |
| `sentinel_review_pr` | Analyze only changed files vs base branch |
| `sentinel_explain_issue` | Get deep explanation of a specific rule/finding |
| `sentinel_fix` | Apply auto-fixes (dry-run first!) |
| `sentinel_score` | Calculate 0–100 project health score |
| `sentinel_check_dependencies` | CVE scan on npm dependencies |

## Available resources (context the AI can read)

| Resource | What it contains |
|----------|-----------------|
| `sentinel://rules` | All analyzer rules with IDs and descriptions |
| `sentinel://config` | Current project .sentinel.json config |

## Example prompts that will invoke Sentinel

Once configured, you can ask your AI assistant:

- "Review the code I just wrote for security issues"
- "Run a security audit on the src/ folder"
- "Check my dependencies for CVEs"
- "Explain what SEC-001 means and how to fix it"
- "What's the security score for this project?"
- "Run Sentinel on these staged changes before I commit"
- "Fix the auto-fixable issues in src/utils.js"
