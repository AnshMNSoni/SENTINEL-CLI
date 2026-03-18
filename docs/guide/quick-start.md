# Quick Start

## 5-Minute Setup

### 1. Install

```bash
npm install -g sentinel-cli
```

### 2. Configure API Key

```bash
# For fastest results (recommended)
export GROQ_API_KEY=gsk_your_key_here

# Or use OpenAI
export OPENAI_API_KEY=sk-your_key_here
```

### 3. First Scan

```bash
sentinel analyze
```

## Common Workflows

### Pre-commit Hook

```bash
sentinel install-hooks
```

### CI/CD Pipeline

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  sentinel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Sentinel
        run: npx sentinel analyze --format json --output results.json
```

### Auto-Fix

```bash
# Interactive mode - review each fix
sentinel fix --interactive

# Auto-apply all fixes
sentinel fix --all
```

## Next Steps

- [Configure analyzers](/commands/analyze)
- [Set up CI/CD](/guide/cicd-setup)
- [Track project score](/commands/score)
