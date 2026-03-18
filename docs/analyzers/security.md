# Security Analyzer

Detects common security vulnerabilities and dangerous patterns.

## Detected Issues

| Issue | Severity | CWE |
|-------|----------|-----|
| SQL Injection | Critical | CWE-89 |
| Command Injection | Critical | CWE-78 |
| Path Traversal | High | CWE-22 |
| XSS (innerHTML) | High | CWE-79 |
| Hardcoded Secrets | Critical | CWE-798 |
| Eval Usage | High | CWE-95 |
| Weak Cryptography | Medium | CWE-327 |

## Usage

```bash
sentinel analyze --analyzers security
```

## Configuration

```json
{
  "analyzers": {
    "security": {
      "enabled": true,
      "excludePatterns": ["**/test/**"]
    }
  }
}
```
