# sentinel analyze

Analyze code for security issues, bugs, and quality problems.

## Usage

```bash
sentinel analyze [files...] [options]
```

## Options

| Flag | Description |
|------|-------------|
| `--analyzers` | Comma-separated list (security, bugs, quality, dependency) |
| `--staged` | Analyze only staged changes |
| `--format` | Output format (console, json, sarif) |
| `--output` | Write results to file |
| `--severity` | Minimum severity to report |

## Examples

```bash
# Analyze all files
sentinel analyze

# Specific files
sentinel analyze src/

# Staged changes only
sentinel analyze --staged

# JSON output
sentinel analyze --format json --output results.json

# Security focus
sentinel analyze --analyzers security,secrets
```

## Exit Codes

- `0` - Success (no critical issues)
- `1` - Issues found (with --fail-on)
- `2` - Configuration error
