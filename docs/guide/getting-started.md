# Getting Started

## Installation

```bash
# Global install
npm install -g sentinel-cli

# Or use without install
npx sentinel-cli analyze
```

## Quick Usage

```bash
# Analyze your code
sentinel analyze

# Security audit
sentinel security-audit

# Quick scan (under 2 seconds)
sentinel fast

# PR review
sentinel diff main..HEAD
```

## Configuration

Create `.sentinel.json` in your project:

```json
{
  "analyzers": ["security", "quality", "bugs"],
  "severityThreshold": "high",
  "preCommit": {
    "enabled": true,
    "blockOnFail": false
  }
}
```

## API Keys

```bash
# Groq (fastest, recommended)
export GROQ_API_KEY=gsk_...

# OpenAI
export OPENAI_API_KEY=sk-...

# Google Gemini
export GEMINI_API_KEY=AI...
```
