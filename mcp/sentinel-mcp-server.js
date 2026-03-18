#!/usr/bin/env node

/**
 * SENTINEL-CLI — MCP Server
 *
 * Exposes Sentinel's analyzers as tools that any MCP-compatible
 * AI assistant (Claude, Cursor, Windsurf, Continue) can call natively.
 *
 * Usage:
 *   node src/sentinel-mcp-server.js
 *   npx sentinel-mcp            (once published)
 *
 * Every tool follows the same contract:
 *   input  → { files?, directory?, code?, ...options }
 *   output → { issues[], summary, score, metadata }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const execFileAsync = promisify(execFile);

// ─── Server bootstrap ────────────────────────────────────────────────────────

const server = new McpServer({
  name: "sentinel-cli",
  version: "1.0.0",
});

// ─── Shared helpers ──────────────────────────────────────────────────────────

/**
 * Run sentinel CLI and return parsed JSON output.
 * Falls back to a mock runner in environments where sentinel isn't installed
 * so the MCP server itself can be tested standalone.
 */
async function runSentinel(args = [], cwd = process.cwd()) {
  try {
    const cliPath = join(process.cwd(), "src/core/cli.js");
    const { stdout } = await execFileAsync(
      "node",
      [cliPath, ...args, "--format", "json"],
      { cwd, maxBuffer: 10 * 1024 * 1024 } // 10 MB
    );
    return JSON.parse(stdout);
  } catch (err) {
    // sentinel not found — return structured error so the AI can report it clearly
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        /* fall through */
      }
    }
    throw new Error(`Sentinel execution failed: ${err.message}`);
  }
}

/**
 * Write ad-hoc code to a temp file, run sentinel on it, then clean up.
 * Used by tools that accept inline `code` rather than file paths.
 */
async function runSentinelOnCode(code, extension = "js", analyzerArgs = []) {
  const tmpFile = join(tmpdir(), `sentinel-${randomUUID()}.${extension}`);
  try {
    await writeFile(tmpFile, code, "utf8");
    return await runSentinel(["analyze", tmpFile, ...analyzerArgs]);
  } finally {
    await unlink(tmpFile).catch(() => {});
  }
}

/**
 * Build a human-readable text summary from a Sentinel JSON result.
 * This is what the AI assistant sees as the tool response.
 */
function formatResult(result) {
  if (result.error) {
    return `Error: ${result.message}`;
  }

  const { issues = [], summary = {} } = result;

  const lines = [
    `Sentinel scan complete.`,
    `Found ${summary.total ?? issues.length} issues: ` +
      `${summary.critical ?? 0} critical, ` +
      `${summary.high ?? 0} high, ` +
      `${summary.medium ?? 0} medium, ` +
      `${summary.low ?? 0} low.`,
    "",
  ];

  if (issues.length === 0) {
    lines.push("No issues found. Clean scan.");
  } else {
    // Group by severity for readability
    const bySeverity = { critical: [], high: [], medium: [], low: [] };
    for (const issue of issues) {
      const sev = issue.severity?.toLowerCase() ?? "low";
      (bySeverity[sev] ?? bySeverity.low).push(issue);
    }

    for (const [sev, list] of Object.entries(bySeverity)) {
      if (list.length === 0) continue;
      lines.push(`── ${sev.toUpperCase()} (${list.length}) ──`);
      for (const issue of list.slice(0, 20)) { // cap at 20 per severity
        lines.push(
          `• [${issue.ruleId ?? issue.id ?? "?"}] ${issue.message ?? issue.description}`
        );
        if (issue.file) {
          lines.push(
            `  File: ${issue.file}${issue.line ? `:${issue.line}` : ""}`
          );
        }
        if (issue.fix ?? issue.suggestion) {
          lines.push(`  Fix: ${issue.fix ?? issue.suggestion}`);
        }
      }
      if (list.length > 20) {
        lines.push(`  …and ${list.length - 20} more. Run with --format json for full list.`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ─── Tools ───────────────────────────────────────────────────────────────────

// 1. analyze — general-purpose scan
server.tool(
  "sentinel_analyze",
  "Scan files or a directory with Sentinel's full analyzer suite. Returns a list of issues with severity, location, and fix suggestions. Use this when the user asks to review, audit, or check their code.",
  {
    target: z
      .string()
      .describe(
        "File path, glob pattern, or directory to scan. Examples: 'src/', 'src/auth.js', 'src/**/*.ts'"
      ),
    analyzers: z
      .string()
      .optional()
      .describe(
        "Comma-separated analyzers to run. Options: security, quality, bugs, performance, dependency, accessibility, typescript, react, api, secrets, docker, kubernetes. Omit for all defaults."
      ),
    failOn: z
      .enum(["critical", "high", "medium", "low"])
      .optional()
      .describe("Minimum severity level to treat as a failure."),
  },
  async ({ target, analyzers, failOn }) => {
    const args = ["analyze", target];
    if (analyzers) args.push("--analyzers", analyzers);
    if (failOn) args.push("--fail-on", failOn);

    const result = await runSentinel(args);
    return { content: [{ type: "text", text: formatResult(result) }] };
  }
);

// 2. security_audit — dedicated security scan
server.tool(
  "sentinel_security_audit",
  "Run a focused security audit: XSS, SQL injection, CSRF, secrets/API key detection, dependency CVEs, Docker/K8s misconfigurations, and API security. Use when the user asks specifically about security vulnerabilities or wants to harden their code.",
  {
    target: z
      .string()
      .describe("File path or directory to audit. Example: 'src/', '.'"),
    includeSecrets: z
      .boolean()
      .optional()
      .default(true)
      .describe("Also scan for exposed API keys, tokens, and credentials."),
    includeDeps: z
      .boolean()
      .optional()
      .default(true)
      .describe("Also check npm dependencies for known CVEs."),
  },
  async ({ target, includeSecrets, includeDeps }) => {
    const analyzers = ["security", "api"];
    if (includeSecrets) analyzers.push("secrets");
    if (includeDeps) analyzers.push("dependency");

    const result = await runSentinel([
      "analyze",
      target,
      "--analyzers",
      analyzers.join(","),
    ]);
    return { content: [{ type: "text", text: formatResult(result) }] };
  }
);

// 3. review_code — analyze inline code snippet (no file needed)
server.tool(
  "sentinel_review_code",
  "Analyze a code snippet passed as a string — no file needed. Ideal when the user has just written or pasted code and wants immediate feedback. Returns issues with severity, line numbers, and fix suggestions.",
  {
    code: z.string().describe("The source code to analyze."),
    language: z
      .enum([
        "javascript",
        "typescript",
        "python",
        "go",
        "java",
        "ruby",
        "php",
        "html",
        "css",
      ])
      .optional()
      .default("javascript")
      .describe("Language of the code snippet."),
    analyzers: z
      .string()
      .optional()
      .describe("Comma-separated analyzers. Defaults to security,quality,bugs."),
  },
  async ({ code, language, analyzers }) => {
    const extMap = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      go: "go",
      java: "java",
      ruby: "rb",
      php: "php",
      html: "html",
      css: "css",
    };
    const ext = extMap[language] ?? "js";
    const analyzerArgs = analyzers
      ? ["--analyzers", analyzers]
      : ["--analyzers", "security,quality,bugs"];

    const result = await runSentinelOnCode(code, ext, analyzerArgs);
    return { content: [{ type: "text", text: formatResult(result) }] };
  }
);

// 4. review_pr — analyze staged/branch changes
server.tool(
  "sentinel_review_pr",
  "Analyze only the files changed in the current branch compared to a base branch. Perfect for pre-merge review — only reports NEW issues introduced by the changes, not pre-existing ones.",
  {
    baseBranch: z
      .string()
      .optional()
      .default("main")
      .describe("Branch to diff against. Usually 'main' or 'develop'."),
    analyzers: z
      .string()
      .optional()
      .describe("Comma-separated analyzers to run."),
    directory: z
      .string()
      .optional()
      .default(".")
      .describe("Repository root directory."),
  },
  async ({ baseBranch, analyzers, directory }) => {
    const args = ["analyze", "--branch", baseBranch];
    if (analyzers) args.push("--analyzers", analyzers);

    const result = await runSentinel(args, directory);
    return { content: [{ type: "text", text: formatResult(result) }] };
  }
);

// 5. explain_issue — drill down on a specific finding
server.tool(
  "sentinel_explain_issue",
  "Get a detailed explanation of a specific Sentinel issue — what the vulnerability is, how an attacker could exploit it, a fixed code example, and links to OWASP/CWE references. Use when the user wants to understand a finding, not just see it listed.",
  {
    ruleId: z
      .string()
      .describe(
        "The Sentinel rule ID to explain. Example: 'SEC-001', 'sql-injection', 'xss-reflected'"
      ),
    codeContext: z
      .string()
      .optional()
      .describe(
        "Optional: the actual vulnerable code snippet for a tailored explanation."
      ),
  },
  async ({ ruleId, codeContext }) => {
    // Build a rich prompt that uses Sentinel's chat/AI mode
    const prompt = codeContext
      ? `Explain the Sentinel issue "${ruleId}" in the context of this code:\n\n${codeContext}\n\nInclude: what the vulnerability is, realistic attack scenario, fixed version, and OWASP/CWE reference.`
      : `Explain the Sentinel rule "${ruleId}": what it detects, why it matters, a code example that triggers it, the fixed version, and the OWASP/CWE reference.`;

    const result = await runSentinel(["chat", prompt]);
    const text =
      typeof result === "string"
        ? result
        : result.response ?? result.message ?? JSON.stringify(result);

    return { content: [{ type: "text", text }] };
  }
);

// 6. auto_fix — apply fixes to a file
server.tool(
  "sentinel_fix",
  "Apply automatic fixes to common issues in a file or directory. Fixes console.log removal, missing alt attributes, simple security anti-patterns, and more. Use --dryRun to preview changes before applying.",
  {
    target: z.string().describe("File or directory to fix."),
    dryRun: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "If true, show what would be fixed without making changes. Always use dryRun first."
      ),
    analyzers: z
      .string()
      .optional()
      .describe(
        "Comma-separated analyzers whose issues should be fixed. Defaults to all fixable."
      ),
  },
  async ({ target, dryRun, analyzers }) => {
    const args = ["fix", target];
    if (dryRun) args.push("--dry-run");
    if (analyzers) args.push("--analyzers", analyzers);

    const result = await runSentinel(args);
    const text =
      result.fixed !== undefined
        ? `${dryRun ? "[DRY RUN] Would fix" : "Fixed"} ${result.fixed} issues in ${result.filesModified ?? 0} files.\n\n${formatResult(result)}`
        : formatResult(result);

    return { content: [{ type: "text", text }] };
  }
);

// 7. score — project health score
server.tool(
  "sentinel_score",
  "Calculate an overall security and quality score (0–100) for a project, broken down by category. Use when the user wants a high-level health check or wants to track improvement over time.",
  {
    directory: z
      .string()
      .optional()
      .default(".")
      .describe("Project root directory to score."),
  },
  async ({ directory }) => {
    const result = await runSentinel(
      ["analyze", directory, "--all-analyzers"],
      directory
    );

    if (result.error) {
      return { content: [{ type: "text", text: formatResult(result) }] };
    }

    const issues = result.issues ?? [];
    const weights = { critical: 25, high: 10, medium: 4, low: 1 };
    const deductions = issues.reduce(
      (sum, i) => sum + (weights[i.severity?.toLowerCase()] ?? 1),
      0
    );
    const score = Math.max(0, Math.min(100, 100 - deductions));

    const bar = (n) => "█".repeat(Math.round(n / 10)) + "░".repeat(10 - Math.round(n / 10));

    const lines = [
      `Sentinel Score for ${directory}`,
      `────────────────────────────────`,
      `Overall   ${bar(score)}  ${score}/100`,
      ``,
      `Issues: ${issues.length} total`,
      `  Critical: ${result.summary?.critical ?? 0}  (-${(result.summary?.critical ?? 0) * 25} pts)`,
      `  High:     ${result.summary?.high ?? 0}  (-${(result.summary?.high ?? 0) * 10} pts)`,
      `  Medium:   ${result.summary?.medium ?? 0}  (-${(result.summary?.medium ?? 0) * 4} pts)`,
      `  Low:      ${result.summary?.low ?? 0}  (-${(result.summary?.low ?? 0) * 1} pts)`,
    ];

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// 8. check_dependencies — CVE scan only
server.tool(
  "sentinel_check_dependencies",
  "Scan npm/yarn dependencies for known CVEs, outdated packages with security patches, and license issues. Equivalent to `npm audit` but with Sentinel's enhanced analysis and fix suggestions.",
  {
    directory: z
      .string()
      .optional()
      .default(".")
      .describe("Directory containing package.json."),
    severity: z
      .enum(["critical", "high", "moderate", "low"])
      .optional()
      .default("moderate")
      .describe("Minimum CVE severity to report."),
  },
  async ({ directory, severity }) => {
    const result = await runSentinel(
      ["analyze", directory, "--analyzers", "dependency"],
      directory
    );
    return { content: [{ type: "text", text: formatResult(result) }] };
  }
);

// ─── Resources ───────────────────────────────────────────────────────────────
// Resources let the AI assistant read static context (config docs, rule list)
// without making tool calls.

server.resource(
  "sentinel://rules",
  "Full list of all Sentinel analyzer rules with IDs, descriptions, and severity levels.",
  async () => {
    try {
      const { stdout } = await execFileAsync("sentinel", [
        "list-analyzers",
        "--format",
        "json",
      ]);
      return { contents: [{ uri: "sentinel://rules", text: stdout }] };
    } catch {
      return {
        contents: [
          {
            uri: "sentinel://rules",
            text: "Run `sentinel list-analyzers` to see available rules.",
          },
        ],
      };
    }
  }
);

server.resource(
  "sentinel://config",
  "Current Sentinel configuration for this project (.sentinel.json).",
  async () => {
    try {
      const config = await readFile(".sentinel.json", "utf8");
      return { contents: [{ uri: "sentinel://config", text: config }] };
    } catch {
      return {
        contents: [
          {
            uri: "sentinel://config",
            text: 'No .sentinel.json found. Run `sentinel auth` to set up, or create one manually. See https://github.com/KunjShah95/SENTINEL-CLI for the config schema.',
          },
        ],
      };
    }
  }
);

// ─── Start ───────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);

// Server runs on stdio — no console.log (it would corrupt the JSON-RPC stream)
// Use stderr for debug output only:
// process.stderr.write("Sentinel MCP server started\n");
