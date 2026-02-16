# Opinionated AI Guidelines

Opinionated AI guidelines, skills, and agents for **Claude Code**, **OpenCode**, **Codex**, and **Cursor**.

> **For Contributors**: See [AGENTS.md](./AGENTS.md) for details on modifying content and regenerating output files.

## Principles

1. **Brief** — Avoid noise that overloads AI context
2. **Targeted** — Each guideline targets a specific behavior
3. **Additive** — Push the model's 80% effectiveness further
4. **Practical** — Collected through real-world AI interactions

## Install

### Quick Install

```bash
# Download and run installer
curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.ts && bun init.ts && rm init.ts
```

### Options

| Option | Description |
|--------|-------------|
| `--local, -l` | Use local output directory instead of cloning from GitHub |
| `--help, -h` | Show help |

### Installed Paths

The installer configures all tools automatically:

**Claude Code** (`~/.claude/`)

| Content | Path |
|---------|------|
| Rules | `~/.claude/CLAUDE.md` |
| Skills | `~/.agents/skills/` (global) |
| Agents | `~/.claude/agents/` |
| Commands | `~/.claude/commands/` |
| Settings | `~/.claude/settings.json` |

**OpenCode** (`~/.config/opencode/`)

| Content | Path |
|---------|------|
| Rules | `~/.config/opencode/AGENTS.md` |
| Skills | `~/.agents/skills/` (global) |
| Agents | `~/.config/opencode/agent/` |
| Plugins | `~/.config/opencode/plugin/` |
| Commands | `~/.config/opencode/command/` |
| Config | `~/.config/opencode/opencode.json` |

**Codex** (`~/.codex/`)

| Content | Path |
|---------|------|
| Rules | `~/.codex/AGENTS.md` |
| Config | `~/.codex/config.toml` (MCP managed block) |

**Cursor** (macOS: `~/Library/Application Support/Cursor/User/`)

| Content | Path |
|---------|------|
| Settings | `~/Library/Application Support/Cursor/User/settings.json` |
| Keybindings | `~/Library/Application Support/Cursor/User/keybindings.json` |
| MCP | `~/.cursor/mcp.json` |
| Extensions | Installed from `cursor/extensions.txt` |

Settings hide problems. To hide other status bar items (Launchpad, Cursor Tab, etc.) while keeping git: right‑click the status bar → **Manage Status Bar Items** → uncheck the ones to hide.

**Shared**

| Content | Path |
|---------|------|
| Zsh Config | `~/.config/zsh-sync/custom.zsh` |
| Kitty Config | `~/.config/kitty/kitty.conf` |

### Shell Helpers

- `hosts list` — list custom domains from `/etc/hosts`
- `hosts add <domain> [ip]` — add a domain to `/etc/hosts` (default IP: `127.0.0.1`) with automatic backup
- `hosts delete` — pick a domain with `fzf`, back up `/etc/hosts`, then delete the selected domain
- `hosts backups` — list `/etc/hosts` backup files
- `hosts cleanup [keep]` — delete old backups and keep newest `keep` files (default from `HOSTS_BACKUP_KEEP`, default value `10`)

Set `HOSTS_BACKUP_KEEP` in your shell if you want a different automatic retention count.

## What's Included

### Skills (19)

| Skill | Description |
|-------|-------------|
| `init-agents` | Initialize or update `AGENTS.md` / `CLAUDE.md` with AI agent guidance |
| `planning` | Create structured implementation plans |
| `execution` | Implement approved plans into code |
| `workshop` | Explore and stress-test ideas |
| `refactoring` | Restructure code without changing behavior |
| `audit-orchestrator` | Run comprehensive audits on completed work |
| `typescript` | TypeScript/JavaScript coding standards |
| `react` | React coding standards |
| `laravel` | Laravel/PHP coding standards |
| `uxui-design` | Practical UI/UX work within design systems |
| `uxui-creative` | Distinctive, bold UI design |
| `product-strategy` | Find 10x product opportunities |
| `feature-research` | Deep research on features before building |
| `api-handoff` | Create API handoff documentation |
| `user-story-review` | Review user stories from developer perspective |
| `qa-test-cases` | Generate test cases for e2e testing |
| `translation` | Review translations for quality |
| `project-skill-creation` | Create project-local skills for modular domains |
| `init-patterns` | Initialize or update project-specific `CODE_PATTERNS.md` templates from current code |

### Agents (17)

**Primary Agents**
- `plan` — Architect mode for planning
- `build` — Execute mode for implementation
- `workshop` — Thinking partner for brainstorming

**Auditor Agents** (14 specialized auditors)
- code-quality, tooling, cleanup, performance, naming
- test-coverage, refactoring, ui, state, forms
- integration, database, security, translation

## License

MIT
