import { TOOLS } from "./tools";
import { THEMES, DEFAULT_THEME } from "../theme";
import { getProviderInfo, getOllamaModels } from "./chat";
const sentinelCmds = {
    analyze: ["analyze"],
    "full-scan": ["full-scan"],
    security: ["security-audit"],
    secrets: ["scan-secrets"],
    container: ["container"],
    frontend: ["frontend"],
    backend: ["backend"],
    diff: ["diff"],
    "pre-commit": ["pre-commit"],
    blame: ["blame"],
    fix: ["fix"],
    agents: ["agents"],
    chat: ["chat"],
    report: ["report"],
    status: ["status"],
    stats: ["stats"],
    complexity: ["complexity"],
    "best-practices": ["best-practices"],
    "multi-file": ["multi-file"],
    config: ["config"],
    cache: ["cache"],
    validate: ["validate"],
    parallel: ["parallel"],
    webhook: ["webhook"],
    server: ["server"],
    policy: ["policy"],
    "install-hooks": ["install-hooks"],
    "test-suggestions": ["test-suggestions"],
    "pr-description": ["pr-description"],
    "pr-summary": ["pr-summary"],
    explain: ["explain"],
    setup: ["setup"],
    secret_patterns: ["secret-patterns"],
    lint: ["lint"],
};
function formatResult(result) {
    if (result.error) {
        return `\u2716 Error: ${result.error}`;
    }
    return result.output || "(done)";
}
function buildCommandHandler(toolName) {
    return async (_args) => {
        const tool = TOOLS[toolName];
        if (!tool)
            return `Unknown command: ${toolName}`;
        const result = await tool.execute({});
        return formatResult(result);
    };
}
export const COMMAND_HANDLERS = {
    help: {
        description: "Show available commands",
        handler: async () => {
            const categories = {};
            for (const [name, cmd] of Object.entries(COMMAND_HANDLERS)) {
                const cat = name === "help" || name === "new" || name === "clear" || name === "exit" ? "general" :
                    ["config", "auth", "rules", "cache", "validate", "policy", "setup", "features", "team"].includes(name) ? "settings" :
                        ["theme"].includes(name) ? "appearance" :
                            ["models"].includes(name) ? "ai" :
                                ["analyze", "full-scan", "security", "secrets", "container", "frontend", "backend", "lint", "complexity", "best-practices", "multi-file", "parallel"].includes(name) ? "scan" :
                                    ["diff", "blame", "pre-commit", "pr", "commit", "log", "pr-description", "pr-summary", "install-hooks"].includes(name) ? "git" :
                                        ["fix", "agents", "agent", "chat", "exec", "search", "explain", "test-suggestions"].includes(name) ? "actions" : "views";
                if (!categories[cat])
                    categories[cat] = [];
                categories[cat].push(name);
            }
            let output = "";
            for (const [cat, cmds] of Object.entries(categories)) {
                output += `\n[${cat.toUpperCase()}]\n`;
                for (const c of cmds.sort()) {
                    output += `  /${c} - ${COMMAND_HANDLERS[c]?.description || ""}\n`;
                }
            }
            return output;
        },
    },
    new: {
        description: "Start a new conversation",
        handler: async () => "(switch to new session)",
    },
    clear: {
        description: "Clear the current session",
        handler: async () => "(clear session)",
    },
    exit: {
        description: "Quit Sentinel",
        handler: async () => {
            process.exit(0);
            return "";
        },
    },
    analyze: { description: "Analyze code for issues", handler: buildCommandHandler("analyze") },
    "full-scan": { description: "Run all available analyzers", handler: buildCommandHandler("fullScan") },
    security: { description: "Comprehensive security audit", handler: buildCommandHandler("securityAudit") },
    secrets: { description: "Scan for secrets and sensitive data", handler: buildCommandHandler("scanSecrets") },
    diff: { description: "Review staged changes", handler: buildCommandHandler("diff") },
    status: { description: "Show system status", handler: buildCommandHandler("status") },
    stats: { description: "Show repository statistics", handler: buildCommandHandler("stats") },
    fix: { description: "Auto-fix detected issues", handler: buildCommandHandler("fix") },
    agents: { description: "Run multi-agent pipeline", handler: buildCommandHandler("agents") },
    chat: { description: "Quick AI chat", handler: buildCommandHandler("chat") },
    "pre-commit": { description: "Quick pre-commit check", handler: buildCommandHandler("preCommit") },
    report: { description: "Generate analysis reports", handler: buildCommandHandler("report") },
    complexity: { description: "Analyze code complexity", handler: buildCommandHandler("complexity") },
    "best-practices": { description: "Analyze code against best practices", handler: buildCommandHandler("bestPractices") },
    explain: { description: "Explain a vulnerability", handler: buildCommandHandler("explain") },
    read: {
        description: "Read a file from the filesystem",
        handler: async (args) => {
            if (!args)
                return "Usage: /read <filepath>";
            const tool = TOOLS.readFile;
            const result = await tool.execute({ path: args });
            return formatResult(result);
        },
    },
    write: {
        description: "Write content to a file",
        handler: async (args) => {
            const match = args.match(/^(\S+)\s+(.+)$/);
            if (!match)
                return "Usage: /write <filepath> <content>";
            const tool = TOOLS.writeFile;
            const result = await tool.execute({ path: match[1], content: match[2] });
            return formatResult(result);
        },
    },
    ls: {
        description: "List files in a directory",
        handler: async (args) => {
            const tool = TOOLS.listDirectory;
            const result = await tool.execute({ path: args || "." });
            return formatResult(result);
        },
    },
    dir: {
        description: "List files in a directory (alias for /ls)",
        handler: async (args) => {
            const tool = TOOLS.listDirectory;
            const result = await tool.execute({ path: args || "." });
            return formatResult(result);
        },
    },
    theme: {
        description: "List or switch themes",
        handler: async (args) => {
            const trimmed = args.trim();
            if (trimmed) {
                const found = THEMES.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
                if (found) {
                    return `Switch to "${found.name}" via the Theme dialog (Ctrl+T) or Settings panel. Current: ${DEFAULT_THEME.name}`;
                }
                return `Theme "${trimmed}" not found. Available: ${THEMES.map((t) => t.name).join(", ")}`;
            }
            let output = `Available themes (${THEMES.length}):\n`;
            for (const t of THEMES) {
                const marker = t.name === DEFAULT_THEME.name ? " \u2022" : "  ";
                output += `${marker} ${t.name}\n`;
                output += `    Primary: ${t.colors.primary} | Background: ${t.colors.background}\n`;
            }
            return output;
        },
    },
    models: {
        description: "Show configured AI providers and installed Ollama models",
        handler: async () => {
            try {
                const providers = await getProviderInfo();
                let output = "AI Providers:\n";
                if (providers.length === 0) {
                    output += "  (none configured - run /setup or sentinel auth)\n";
                }
                else {
                    for (const p of providers) {
                        const status = p.enabled ? (p.hasKey ? "\u2705" : "\u26A0\uFE0F no key") : "\u274C disabled";
                        output += `  ${status} ${p.provider} (${p.model})\n`;
                    }
                }
                const ollamaModels = await getOllamaModels();
                if (ollamaModels.length > 0) {
                    output += "\nInstalled Ollama Models:\n";
                    for (const m of ollamaModels) {
                        const size = m.size > 1e9 ? `${(m.size / 1e9).toFixed(1)}GB` : `${(m.size / 1e6).toFixed(0)}MB`;
                        output += `  \u25C9 ${m.name} (${size})\n`;
                    }
                }
                else {
                    output += "\nOllama: no models found (is Ollama running?)";
                }
                return output;
            }
            catch (err) {
                return `Error loading provider info: ${err}`;
            }
        },
    },
};
//# sourceMappingURL=commands.js.map