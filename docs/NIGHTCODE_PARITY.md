# Sentinel × Nightcode Feature Parity

Sentinel v2.0.2 ships a terminal-based AI coding agent. This document tracks
how Sentinel's agent features line up with the [Nightcode](https://github.com/any-flagship/claudecode)
reference agent (a Claude Code-style TUI product) and lists everything that
was added to reach parity.

## Overview

Sentinel already shipped a TUI, 21 static analyzers, an MCP server, and a
dashboard. The AI coding agent pieces were added on top:

- **Shared package** (`src/shared/`) — tool contracts, mode enum, model registry.
- **Hono server** (`src/server/api/`) — auth, billing, sessions, streaming chat.
- **Database adapters** (`src/server/database/`) — Prisma / SQLite / JSON.
- **TUI hook** (`src/tui/hooks/use-agent-chat.ts`) — streaming client over SSE.
- **Provider** (`src/tui/providers/prompt-config/`) — mode + model state.
- **Slash commands** (`src/tui/components/dialogs/command-menu.tsx`).
- **@-mentions** (`src/tui/components/input-bar.tsx`).
- **CLI subcommands** (`src/cli/commands/{login,upgrade,clear,status}.js`).

## Feature matrix

| Feature | Nightcode | Sentinel | File |
|---|---|---|---|
| Build / Plan mode toggle | ✓ | ✓ | `src/shared/schemas/mode.js` |
| Local tool execution | ✓ | ✓ | `src/shared/tools/index.js` |
| Tool contracts (zod-shaped) | ✓ | ✓ | `src/shared/tools/schemas.js` |
| Path sandbox (cwd) | ✓ | ✓ | `src/shared/tools/index.js:resolveInsideCwd` |
| PLAN mode read-only guard | ✓ | ✓ | `src/shared/tools/index.js:executeLocalTool` |
| Hono server | ✓ | ✓ | `src/server/api/app.js` |
| Streaming chat (SSE) | ✓ | ✓ | `src/server/api/routes/chat.js` |
| AI SDK transport | ✓ | ✓ (lazy) | `src/server/api/lib/chat-stream.js` |
| Local LLM fallback | ✓ | ✓ | `src/server/api/lib/chat-stream.js:streamWithOrchestrator` |
| Sessions API | ✓ | ✓ | `src/server/api/routes/sessions.js` |
| Persisted chat history | ✓ | ✓ | `src/server/database/sessions.js` |
| Tool-call execution loop | ✓ | ✓ | `src/tui/hooks/use-agent-chat.ts` |
| Mode + model provider | ✓ | ✓ | `src/tui/providers/prompt-config/index.tsx` |
| Command menu (slash commands) | ✓ | ✓ | `src/tui/components/dialogs/command-menu.tsx` |
| @-mentions for file paths | ✓ | ✓ | `src/tui/components/input-bar.tsx` |
| Multiple model providers | ✓ | ✓ | `src/shared/models/index.js` |
| Anthropic thinking config | ✓ | ✓ | `src/shared/models/index.js:getProviderOptions` |
| Credit / token metering | ✓ | ✓ | `src/server/api/lib/polar.js:ingestAiUsage` |
| Polar billing integration | ✓ | ✓ (lazy) | `src/server/api/lib/polar.js` |
| Clerk OAuth integration | ✓ | ✓ (lazy) | `src/server/api/middleware/auth.js` |
| Dev-token fallback auth | ✓ | ✓ | `src/server/api/middleware/auth.js:issueDevToken` |
| Prisma ORM | ✓ | ✓ (lazy) | `src/server/database/schema.prisma` |
| SQLite fallback | ✓ | ✓ | `src/server/database/adapter.js:SqliteAdapter` |
| JSON fallback | n/a | ✓ | `src/server/database/adapter.js:JsonAdapter` |
| Bun server bootstrap | ✓ | ✓ | `src/server/api/start.js` |
| Node server bootstrap | ✓ | ✓ | `src/server/api/start.js` |
| Idle timeout 255s | ✓ | ✓ | `src/server/api/start.js` |
| CLI subcommands | ✓ | ✓ | `src/cli/commands/{login,upgrade,clear,status}.js` |
| Pinned model registry | ✓ | ✓ | `src/shared/models/index.js:SUPPORTED_CHAT_MODELS` |
| Dev credits default 1000 | ✓ | ✓ | `src/server/api/lib/polar.js` |
| macOS Seatbelt sandbox | ✓ | ✗ | n/a |
| Session forking | ✓ | ✗ | n/a |
| Web search | ✓ | ✗ | n/a |

## New components

| File | Description |
|---|---|
| `src/shared/index.js` | Shared package entry — exports mode, tools, models, validators |
| `src/shared/schemas/mode.js` | `Mode` enum + `isReadOnlyTool` |
| `src/shared/schemas/index.js` | Chainable zod-like validator |
| `src/shared/tools/schemas.js` | 7 tool input schemas |
| `src/shared/tools/index.js` | `executeLocalTool` with cwd sandbox + PLAN guard |
| `src/shared/models/index.js` | `SUPPORTED_CHAT_MODELS`, credit math, provider options |
| `src/server/database/adapter.js` | Prisma / Sqlite / Json adapter with auto-detection |
| `src/server/database/sessions.js` | Session CRUD, message append, credit events |
| `src/server/database/schema.prisma` | Prisma schema for Session / CreditEvent / UserPreferences |
| `src/server/database/index.js` | Re-exports |
| `src/server/api/app.js` | Hono app with `/health`, `/auth`, `/sessions`, `/chat`, `/billing` |
| `src/server/api/start.js` | Bun / Node bootstrap with `idleTimeout: 255` |
| `src/server/api/middleware/auth.js` | `requireAuth`, `issueDevToken`, PKCE state decoder |
| `src/server/api/middleware/credits.js` | `requireCreditsBalance` with dev fallback |
| `src/server/api/routes/auth.js` | `/auth/callback`, `/auth/dev-login`, `/auth/dev-logout` |
| `src/server/api/routes/sessions.js` | GET / POST / DELETE / GET-by-id |
| `src/server/api/routes/chat.js` | SSE streaming chat with mode-aware tools |
| `src/server/api/routes/billing.js` | `/billing/checkout`, `/billing/portal`, `/billing/success` |
| `src/server/api/lib/polar.js` | Polar SDK wrapper with dev fallback |
| `src/server/api/lib/chat-stream.js` | AI SDK + orchestrator streaming |
| `src/server/api/lib/system-prompt.js` | BUILD vs PLAN system prompt builder |
| `src/server/api/client.js` | Auth persistence, `api()` wrapper, `streamSse()` |
| `src/tui/providers/prompt-config/index.tsx` | Mode + model React context |
| `src/tui/hooks/use-agent-chat.ts` | Streaming chat hook over SSE |
| `src/tui/lib/api-client.ts` | TypeScript-friendly client wrapper |
| `src/tui/lib/local-tools.ts` | Client-side tool execution wrapper |
| `src/tui/components/dialogs/command-menu.tsx` | Slash-command dialog |
| `src/cli/commands/login.js` | Dev-token login subcommand |
| `src/cli/commands/upgrade.js` | Polar checkout subcommand |
| `src/cli/commands/clear.js` | Local cache clear subcommand |
| `src/cli/commands/status.js` | Mode / model / credits subcommand |
| `__tests__/shared-tools.test.js` | 13 unit tests for local tools |
| `__tests__/server-routes.test.js` | 7 unit tests for Hono routes |
| `scripts/verify-server.mjs` | E2E smoke test script |

## Server routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | none | App info (name, version, runtime) |
| GET | `/health` | none | Liveness probe |
| GET | `/auth/callback` | none | OAuth PKCE callback (Clerk) |
| POST | `/auth/dev-login` | none | Issue a dev token (file-backed) |
| POST | `/auth/dev-logout` | dev token | Revoke a dev token |
| GET | `/sessions` | required | List the user's sessions |
| POST | `/sessions` | required | Create a new session |
| GET | `/sessions/:id` | required | Read a session with messages |
| DELETE | `/sessions/:id` | required | Delete a session |
| POST | `/chat` | required | Stream a chat completion (SSE) |
| POST | `/billing/checkout` | required | Create a Polar checkout URL |
| GET | `/billing/portal` | required | Create a Polar customer portal URL |
| POST | `/billing/success` | required | Handle a Polar checkout return |

## Local tools

| Name | Mode | Description |
|---|---|---|
| `readFile` | read | Read up to 10 KB of a single file |
| `listDirectory` | read | List entries in a directory (capped) |
| `glob` | read | Find files matching a pattern |
| `grep` | read | Ripgrep-style text search (capped 50 matches) |
| `writeFile` | write | Write or create a file (sandboxed) |
| `editFile` | write | Find-and-replace edit (sandboxed) |
| `bash` | write | Run a shell command (30s default timeout) |

## Setup

```bash
# Optional: install server deps
npm install hono @hono/node-server --save-optional
npm install better-sqlite3 --save-optional
npm install @prisma/client --save-optional
npm install @polar-sh/sdk --save-optional
npm install @clerk/backend --save-optional
npm install ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google --save-optional

# Start the server
npm run sentinel:server
# or with auto-reload
npm run sentinel:dev:server

# Get a dev token
curl -X POST http://localhost:3000/auth/dev-login -H 'Content-Type: application/json' -d '{}'

# Or use the CLI
sentinel login
sentinel upgrade
sentinel clear
sentinel whoami
```

Environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | 3000 | Server port |
| `SENTINEL_HOME` | `~/.sentinel` | Config / auth / DB dir |
| `DATABASE_URL` | unset | Prisma connection string (auto-detect) |
| `SENTINEL_DB_BACKEND` | auto | `prisma` / `sqlite` / `json` |
| `POLAR_ACCESS_TOKEN` | unset | Polar SDK key (dev fallback if absent) |
| `POLAR_ORGANIZATION_ID` | unset | Polar org id |
| `POLAR_PRODUCT_ID` | unset | Polar product id for checkout |
| `SENTINEL_DEV_CREDITS` | 1000 | Dev-mode credit allocation |
| `CLERK_SECRET_KEY` | unset | Clerk backend key (dev fallback if absent) |
| `CLERK_PUBLISHABLE_KEY` | unset | Clerk publishable key |

## Future work

- macOS Seatbelt / Linux Landlock sandbox for `bash` tool.
- Session forking (Nightcode session menu).
- Web search tool (parallel to `grep`).
- Multi-file edits (transactional rollback).
- TUI integration: open the new `CommandMenu` when the user types `/` in the
  input bar; add a mode badge in the status bar; wire the existing
  `use-chat.ts` to delegate to `useAgentChat` for `/chat` mode.
