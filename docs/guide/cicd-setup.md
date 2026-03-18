# CI/CD Setup

## GitHub Actions

### Basic Setup

```yaml
name: Sentinel Security Scan
on: [push, pull_request]

jobs:
  sentinel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Run Sentinel
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
        run: |
          npm install -g sentinel-cli
          sentinel analyze --format json --output results.json
          
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: sentinel-results
          path: results.json
```

### With PR Annotations

```yaml
- name: Sentinel PR Review
  run: sentinel ci --annotate --fail-on critical
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_SHA: ${{ github.sha }}
```

## GitLab CI

```yaml
sentinel:
  image: node:18-alpine
  script:
    - npm install -g sentinel-cli
    - sentinel analyze --format gl-sarif --output sentinel-results.sarif
  artifacts:
    reports:
      sast: sentinel-results.sarif
```

## Pre-push Hook

```bash
# Install
sentinel pre-push install

# Bypass (logged)
SENTINEL_SKIP=1 git push
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SENTINEL_ANALYZERS` | Comma-separated analyzers to run |
| `SENTINEL_THRESHOLD` | Fail on severity (critical/high/medium) |
| `SENTINEL_FORMAT` | Output format (console/json/sarif) |
