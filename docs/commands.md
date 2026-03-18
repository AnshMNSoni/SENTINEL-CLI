# 📖 Sentinel CLI Command Reference

Sentinel provides a powerful set of commands for security auditing, AI-powered code reviews, and project management.

## 🛠️ Setup & Config
| Command | Alias | Description |
|---------|-------|-------------|
| `sentinel auth` | `login` | Configure API keys for AI providers (OpenAI, Gemini, Groq) |
| `sentinel setup` | - | Interactive configuration wizard |
| `sentinel config` | - | Manage Sentinel configuration manually |
| `sentinel status` | - | Show Sentinel system status and statistics |
| `sentinel context` | - | Analyze and display deep project context (framework, arch, risks) |
| `sentinel install-hooks`| - | Install pre-commit hooks |
| `sentinel validate` | - | Validate `.sentinel.json` configuration |

## 🔍 Analysis Core
| Command | Alias | Description |
|---------|-------|-------------|
| `sentinel analyze` | `review` | Analyze specific files or directories |
| `sentinel security-audit`| - | Comprehensive security scan (Security + API + Secrets + Deps) |
| `sentinel full-scan` | `full` | Run all available analyzers across the project |
| `sentinel pre-commit` | - | Scan staged files (called by git hooks) |
| `sentinel frontend` | - | Frontend-specific analysis (React, TSX, A11y) |
| `sentinel backend` | - | Backend-specific analysis (Security, Performance) |
| `sentinel container` | - | Docker and Kubernetes security checks |
| `sentinel trace <id>` | - | Trace usage of a function or class across the codebase |
| `sentinel impact <f>` | - | Analyze architectural impact of changing a specific file |
| `sentinel list-analyzers`| `analyzers`| List all 20+ built-in security and quality analyzers |

## 🤖 AI & Agents
| Command | Alias | Description |
|---------|-------|-------------|
| `sentinel interactive` | `i` | Start interactive conversational AI mode |
| `sentinel search <q>` | `find` | Semantic code search using natural language queries |
| `sentinel ask <q>` | - | Ask questions about your codebase (requires indexing) |
| `sentinel chat` | - | Launch the Sentinel interactive assistant console |
| `sentinel fix` | - | Automatically fix detected security and quality issues |
| `sentinel pr-description`| - | Generate AI-powered PR descriptions |
| `sentinel agents pr` | - | Run multi-agent review and post results to a GitHub PR |
| `sentinel test-suggestions`| - | Generate unit test suggestions for specific files |

## 📊 Reporting & Governance
| Command | Alias | Description |
|---------|-------|-------------|
| `sentinel dashboard` | - | Launch the local web dashboard (UI) |
| `sentinel badge` | - | Generate dynamic security score badges for README |
| `sentinel sarif` | - | Export results in SARIF format for GitHub Security |
| `sentinel audit-log` | `history` | View history of commands and findings |
| `sentinel compliance` | - | Check compliance with standards (OWASP, HIPAA, etc.) |
| `sentinel threats` | - | Generate STRIDE-based threat models |
| `sentinel attack-surface`| - | Map entry points and data flows |

## ⚡ Shortcuts & Aliases
You can use these shorter versions for frequently used commands:

- `s i` → `sentinel interactive`
- `s review` → `sentinel analyze`
- `s login` → `sentinel auth`
- `s full` → `sentinel full-scan`
- `s find` → `sentinel search`
- `s bench` → `sentinel benchmark`
- `s analyzers` → `sentinel list-analyzers`
- `s secrets` → `sentinel scan-secrets`

---

> [!TIP]
> For more detailed options for each command, run `sentinel [command] --help`.
