#!/usr/bin/env node
import { spawn, execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distCli = resolve(__dirname, "../dist/cli.js");
const tuiEntry = resolve(__dirname, "../src/tui/index.tsx");

const CLI_COMMANDS = new Set([
  "login", "upgrade", "clear", "whoami",
  "analyze", "diff", "doctor", "report", "score",
  "auth", "status", "watch", "init", "config",
  "security-audit", "full-scan", "pre-commit",
  "frontend", "backend", "completion",
  "interactive", "chat", "ask", "search", "context",
  "badge-server", "webhook-server", "benchmark",
  "mcp", "ci", "help", "version",
]);

const args = process.argv.slice(2);
const firstArg = args[0]?.toLowerCase();

// Flags (--help, --version) and CLI subcommands route to dist/cli.js
const isFlag = firstArg?.startsWith("-");
if (isFlag || (firstArg && CLI_COMMANDS.has(firstArg))) {
  const child = spawn(process.execPath, [distCli, ...args], {
    stdio: "inherit",
    cwd: root,
  });
  child.on("exit", (code) => process.exit(code ?? 1));
} else {
  await launchTui();
}

async function launchTui() {
  const bunPath = findBun();
  if (bunPath) {
    const child = spawn(bunPath, [tuiEntry], {
      stdio: "inherit",
      cwd: root,
      env: { ...process.env, SENTINEL_ROOT: root },
    });
    child.on("exit", (code) => process.exit(code ?? 1));
    return;
  }

  // Check if Node supports --experimental-ffi (Node 23+)
  try {
    const { execFileSync } = await import("node:child_process");
    const help = execFileSync(process.execPath, ["--help"], { encoding: "utf-8" });
    if (help.includes("experimental-ffi")) {
      const tsxEntry = resolve(root, "node_modules", "tsx", "dist", "cli.mjs");
      if (existsSync(tsxEntry)) {
        const child = spawn(process.execPath, ["--experimental-ffi", "--allow-ffi", tsxEntry, tuiEntry], {
          stdio: "inherit",
          cwd: root,
        });
        child.on("exit", (code) => process.exit(code ?? 1));
        return;
      }
    }
  } catch {}

  console.error("");
  console.error("  Sentinel TUI requires Bun runtime");
  console.error("");
  console.error("  Install Bun (1 min):");
  console.error("    curl -fsSL https://bun.sh/install | bash");
  console.error("    sentinel");
  console.error("");
  console.error("  CLI commands work without TUI:");
  console.error("    sentinel login | whoami | clear | upgrade");
  console.error("    sentinel analyze | security-audit | diff");
  console.error("    sentinel --help");
  console.error("");
  process.exit(1);
}

function findBun() {
  const ext = process.platform === "win32" ? ".exe" : "";
  const candidates = [
    process.env.BUN_INSTALL && resolve(process.env.BUN_INSTALL, "bin", "bun" + ext),
    resolve(process.env.APPDATA || "", "npm", "node_modules", "bun", "bin", "bun" + ext),
    resolve(process.env.LOCALAPPDATA || "", "bun", "bin", "bun" + ext),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  if (process.platform !== "win32") {
    try {
      return execSync("which bun", { encoding: "utf-8" }).trim();
    } catch {}
  }
  return null;
}
