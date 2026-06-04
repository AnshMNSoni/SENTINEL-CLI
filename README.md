# Sentinel — AI-Powered Code Security & Review Platform

[![npm version](https://img.shields.io/npm/v/sentinel-cli?style=flat-square&color=blue)](https://www.npmjs.com/package/sentinel-cli)
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen?style=flat-square)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.x-black?style=flat-square)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

Sentinel is a local-first, privacy-focused code security platform — now with a built-in AI coding agent (Build/Plan/Ask/Debug modes), streaming chat, tool execution, and a terminal UI.

---

## AI Coding Agent

Sentinel ships a terminal-based AI coding agent with four modes and 9 local tools.

### Four modes

| Mode | Tools | Use case |
|------|-------|----------|
| **BUILD** | all 9 | Implement features, edit files, run commands |
| **PLAN** | read-only (readFile, globFiles, grepFiles) | Explore codebase, propose plans |
| **ASK** | read-only + web search | Research, documentation, questions |
| **DEBUG** | all 9 + verbose logging | Root-cause analysis |

Tab to toggle between BUILD and PLAN. Type `/mode` in the TUI for other modes.

### Local tools

`readFile`, `globFiles`, `grepFiles`, `writeFile`, `executeCommand` (sandboxed), `toddInstructions`, `readOutput`, `searchWeb`, `batchEdit` (atomic multi-file edit with rollback).

All tools run inside the project working directory. bash is sandboxed (bwrap/macOS sandbox-exec/fallback). Rate-limited: glob, grep, bash, and searchWeb (max 3 concurrent).

### Slash commands

Inside the TUI, type `/` to open the command menu:

`/help`, `/clear`, `/mode`, `/model <name>`, `/login`, `/logout`, `/upgrade`, `/status`

### @-mentions

Type `@` in the input bar to fuzzy-match a project file. Select with arrow keys, insert with Tab / Enter.

### Server mode (optional)

Run a Hono SSE server alongside for session persistence and credit metering:

```bash
npm run sentinel:server         # http://localhost:3000
node bin/sentinel.js login      # issues a dev token
node bin/sentinel.js upgrade    # Polar checkout (or dev-credits notice)
node bin/sentinel.js clear      # clear local session cache
node bin/sentinel.js whoami     # shows mode, model, sessions, credits
node bin/sentinel.js --help     # full CLI help
```

For production, set `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_PRODUCT_ID` (billing) and `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` (OAuth). Without them, the server runs in dev fallback mode with `SENTINEL_DEV_CREDITS=1000`.

---

## Quick Start

```bash
git clone <repo>
cd sentinel-cli
npm install           # auto-builds dist/ if missing
npm start             # launches TUI (Bun required)
```

**That's it.** `npm start` opens the Sentinel TUI. The TUI is the recommended interface — chat with your codebase, run analyses, manage sessions.

**For non-interactive use** (CI, scripts, automation):

```bash
sentinel --help                    # all 35+ commands
sentinel whoami                    # user, mode, model, credits
sentinel login                     # issue dev token
sentinel analyze src/              # run 21 analyzers
sentinel security-audit            # security scan
sentinel status                    # system status
sentinel clear                     # clear session cache
sentinel upgrade                   # Polar checkout / dev notice
```

**For global install** (so `sentinel` is on PATH):

```bash
npm install -g .                   # from project root
sentinel                           # global launch
sentinel --help                    # all commands
```

**For the server** (optional, for session persistence + credit metering):

```bash
npm run sentinel:server            # Hono SSE on localhost:3000
sentinel login                     # connect to it
```

---

## Quick Test

```bash
npm test                         # all 247 tests (213 Jest + 34 node:test)
npm run test:jest                # Jest only
npm run test:unit                # node:test only (faster, no transpile)
npm run typecheck                # TUI type check
npm run build                    # rebuild dist/
```

---

## TUI (Terminal UI)

```bash
sentinel              # launch TUI (auto-detects Bun)
npm start             # alias for above
```

Requires **Bun** (OpenTUI uses `node:ffi`, unavailable in Node 22 on Windows). Install: `curl -fsSL https://bun.sh/install | bash`.

The TUI has multi-screen navigation (Home, Session, Dashboard), streaming chat with tool-call rendering, slash commands (`/help`, `/mode`, `/clear`, `/status`, etc.), and @-mentions for files.

---

## Architecture

```
src/
├── server/           # Hono SSE server, orchestrator, tool execution
│   ├── index.ts      # SSE endpoint, health, auth
│   └── orchestrator.ts  # Agent loop: prompt → LLM → tools → repeat
├── cli/              # CLI subcommands (login, whoami, clear, upgrade, etc.)
│   ├── index.ts      # CLI entry → dist/cli.js
│   └── commands/     # per-command handlers
├── tui/              # React terminal UI (OpenTUI)
│   ├── index.tsx     # TUI entry
│   ├── screens/      # Session, Dashboard screens
│   ├── components/   # Message, input, dialogs, status bar
│   ├── hooks/        # useAgentChat (streaming SSE + tool calls)
│   ├── providers/    # PromptConfigProvider (mode + model state)
│   └── lib/          # API client, local-tools wrapper
├── shared/           # Types, schemas, auth, config, tool definitions
│   ├── types.ts      # ToolDef, ToolResult, AgentMode, Session interfaces
│   ├── tools/        # 9 tool implementations
│   └── index.ts      # Public API: streaming, auth, config
├── __tests__/        # Test suites (Jest + node:test)
└── bin/
    └── sentinel.js   # Entry: routes CLI → dist/cli.js, TUI → bun
```

---

## CLI Overview

### Account & Status

| Command | Description |
|---------|-------------|
| `sentinel login` | Issue dev login token |
| `sentinel whoami` | Show user, mode, model, credits |
| `sentinel status` | System status and statistics |
| `sentinel upgrade` | Open Polar checkout |
| `sentinel clear` | Clear local session cache |

### Built-in analyzers (legacy, via CLI)

Sentinel's original 21 analyzers are still available through the CLI:

| Command | Description |
|---------|-------------|
| `sentinel analyze` | Analyze files/directories |
| `sentinel security-audit` | Full security scan |
| `sentinel full-scan` | All 21 analyzers |
| `sentinel pre-commit` | Scan staged files |
| `sentinel diff` | Staged diff review |
| `sentinel fix` | Auto-fix common issues |

Run `sentinel --help` for the full command list.

---

## Configuration

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI provider |
| `ANTHROPIC_API_KEY` | Anthropic provider |
| `GEMINI_API_KEY` | Google Gemini |
| `GROQ_API_KEY` | Groq |
| `OPENROUTER_API_KEY` | OpenRouter |
| `SEARCH_WEB_ENDPOINT` | Custom web search endpoint |
| `POLAR_ACCESS_TOKEN` | Production billing |
| `CLERK_SECRET_KEY` | Production OAuth |

AI provider keys are optional — the server picks the first configured provider.

---

## Requirements

- **Runtime**: Bun 1.x (recommended for TUI), Node.js 22+ (CLI + server)
- **Memory**: 256 MB minimum
- **Disk**: ~50 MB for installation

---

## Test Status

- **247 tests passing**: 213 Jest + 34 node:test
- **npm pack**: 636 KB, 294 files
- **Platform**: Windows (primary), Linux/macOS (compatible)

---

## License

MIT — Created by [Kunj Shah](https://github.com/KunjShah95).
