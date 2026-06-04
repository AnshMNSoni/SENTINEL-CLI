# Sentinel — Anchored Summary

## Identity & Scope
- **Sentinel**: Local-first AI coding agent CLI/TUI. Terminal-native. Four modes (build/plan/ask/debug), 9 local tools, streaming chat, optional Hono server for sessions/credits.
- **Entry point**: `bin/sentinel.js` (ESM) — auto-detects Bun, routes CLI subcommands to `dist/cli.js` or launches TUI (`bun src/tui/index.tsx`).

## Architecture
```
bin/sentinel.js                     # entry, routes to CLI or TUI
src/dist/cli.js                     # source for dist/cli.js (built by src/core/build.js)
src/cli/commands/                   # new agent commands: login, whoami, clear, upgrade
src/server/                         # Hono SSE server, tool execution, sessions
src/tui/                            # OpenTUI React terminal UI
src/shared/                         # types, schemas, tool definitions
src/core/build.js                   # builds dist/ from src/dist/
```

## How to Use (Easy)
```bash
# Clone, install, run
git clone <repo>
cd sentinel-cli
npm install           # postinstall auto-runs build if dist/ missing
npm start             # launches TUI via bin/sentinel.js (auto-detects Bun)
sentinel --help       # CLI help (after npm install -g .)
sentinel whoami       # show user/mode/model/credits
sentinel login        # issue dev token
sentinel clear        # clear session cache
sentinel upgrade      # show Polar / dev-mode notice
sentinel analyze      # legacy analyzers (21 of them)
sentinel security-audit
sentinel status       # CLI version of /status
```

## Tests
```bash
npm test              # 247 tests total: 213 Jest + 34 node:test
npm run test:jest     # Jest only
npm run test:unit     # node:test only (faster, no transpilation)
npm run typecheck     # tsc --noEmit (TUI)
```

## Status (Phase 1–3 complete, Phase 4 started)
- 247/247 tests passing (213 Jest + 34 node:test)
- All CLI commands work: login, whoami, clear, upgrade, --help, --version, analyze, security-audit, etc.
- TUI launches via `npm start` / `node bin/sentinel.js` / `bun src/tui/index.tsx`
- `bin/sentinel.js` finds Bun at APPDATA and spawns TUI correctly (no `shell: true` on Windows)
- `--help` flag routes to CLI (added `isFlag` check in bin/sentinel.js)

## Build Process
- `npm run build` → `node src/core/build.js` → reads `src/dist/cli.js`, transforms `../` to `./` paths, writes `dist/cli.js`
- `dist/cli.js` is the compiled CLI bundle (2900+ lines, all commander commands registered)
- New commands (`login`, `whoami`, `clear`, `upgrade`) are registered at the end of `src/dist/cli.js` (line 2893+), using `await import('./cli/commands/...')` for code splitting
- `prepublishOnly: npm run build` — auto-runs build before publish
- `files` in package.json now includes `dist/**/*` (so npm package ships the compiled CLI)

## Recent Fixes (Phase 4 — DX)
- **Critical**: Added login/whoami/clear/upgrade commands to `src/dist/cli.js` (was missing — dist/cli.js was stale build, only had legacy commands)
- `bin/sentinel.js` `isFlag` check: flags (`--help`, `--version`) now route to CLI
- `bin/sentinel.js` spawn fix: removed `shell: process.platform === "win32"` (caused path splitting on Windows)
- `package.json` `files` includes `dist/**/*` (was missing — npm install wouldn't have shipped compiled CLI)
- `package.json` `prepublishOnly`: `npm run build` (was just `tsc --noEmit`)
- `package.json` `postinstall`: auto-builds dist/ if missing
- `package.json` `scripts.start`: `node bin/sentinel.js` (was old `src/core/cli.js` launcher)
- All `scripts.*` now use `node bin/sentinel.js` so `npm run analyze` etc. work consistently
- `npm test` runs both Jest and node:test suites
- Added `npm run go` alias for `npm start`

## Known Issues
- TUI requires Bun (OpenTUI uses node:ffi, not available in Node 22 Windows)
- `tui:node` script shows install instructions (can't run on Node 22)
- Server mode optional — TUI falls back to local LLM orchestrator if server not running
- AI agent requires API keys (OPENAI/ANTHROPIC/GEMINI/GROQ/OPENROUTER) for actual chat

## Open Work
- Real LLM integration test (needs API key)
- macOS sandbox docs/verification
- npm publish to registry
- Install `npx sentinel-cli` flow (currently requires global install)
