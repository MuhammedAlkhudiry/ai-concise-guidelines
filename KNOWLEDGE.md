# KNOWLEDGE

## Repository Purpose

- Opinionated AI guidelines, skills, and agents for **Claude Code** and **OpenCode**
- Content installed to user machines via `bun src/init.ts`
- All user-facing output lives in `output/`, generated from `content/` + `config/`
- Generates for **both tools** from single source of truth

## Content Architecture

### Single Source of Truth
- `content/instructions/<name>.md` — raw instruction text, NO frontmatter
- `config/*.ts` — defines which instructions become agents/skills and their metadata
- `output/` — GENERATED, never edit directly
- Same instruction file can be both an agent AND a skill (configured separately)

### Generation Flow
```
content/instructions/*.md + config/*.ts → src/generate.ts → output/opencode/
                                                          → output/claude/
```
- Frontmatter added during generation (descriptions, models, modes)
- Must run `make generate` (or `make install`) after any content/config change

### Tool-Specific Differences

| Aspect | OpenCode | Claude Code |
|--------|----------|-------------|
| Config path | `~/.config/opencode/` | `~/.claude/` |
| Rules file | `AGENTS.md` | `CLAUDE.md` |
| Model format | `anthropic/claude-opus-4-5` | `opus` |
| Agent frontmatter | `mode`, `color` | `name` only |
| Plugins | Supported (`.ts` files) | Not supported (different system) |
| Config file | `opencode.json` | `settings.json` |

### Installation
- **Remote mode** (default): Clones from GitHub, sparse checkout
- **Local mode** (`--local`): Uses local `output/` directory
- **Always installs both tools** — no tool selection flag
- Copy modes matter:
  - `clean`: Skills/agents — replaced completely each install
  - `merge`: Plugins/commands/config — preserves user's custom additions

## Agent System

### Agent Types
- **primary**: User-invokable modes (plan, build, workshop)
- **sub**: Spawned by other agents only (all auditors)

### Models
- `smart` = anthropic/claude-opus-4-5 (OpenCode) / opus (Claude Code) — primary agents
- `fast` = anthropic/claude-haiku-4-5 (OpenCode) / haiku (Claude Code) — all auditors except UI
- `ui_reviewer` = google/gemini-3-pro-preview (OpenCode) / sonnet (Claude Code) — UI auditor needs vision

### Auditors
- All auditors defined in `config/auditors.ts`, generated to agents with `auditor-` prefix
- Instruction files live in `content/instructions/auditing/`
- Core auditors run always; conditional auditors run based on change type

## Workflow Conventions

### Session Structure
```
docs/ai/sessions/<YYYY-MM-DD>-<slug>/
├── workshop.md   # Exploration phase
├── plan.md       # Implementation plan (living document)
└── audit.md      # Audit results
```
- Plans must stay high-level — no code snippets, DB schemas
- Plan status must be kept current (items marked done/blocked)
- Session path passed explicitly, never "scan for recent"

### Status Markers (standardized)
- `[ ]` pending, `[x]` done, `[~]` blocked, `[!]` needs decision
- `✅` approved, `⚠️` warning, `🔄` changes requested, `❌` rejected
- `🔴` blocker, `🟡` should fix, `🟢` minor/nitpick

## Plugins

### Loop Plugin (`plugins/loop.ts`) — OpenCode only
- Autonomous iterative execution until `<promise>DONE</promise>` marker
- Default max 50 iterations, configurable via `--max=N`
- Cancel: user abort (Ctrl+C) clears loop state
- Continuation prompt injected on `session.idle` event if not complete

## Config Transformation

### OpenCode Config (`custom-opencode.json`)
- Uses full model names: `anthropic/claude-opus-4-5`
- Permission format: `permission.external_directory`, `permission.read`
- MCP servers: `mcp: { server: { type, command } }`

### Claude Code Settings (generated `settings.json`)
- Uses model aliases: `opus`, `haiku`, `sonnet`
- Permission format: `permissions.allow[]`, `permissions.deny[]`
- MCP servers: configured separately in `~/.claude.json` or `.mcp.json`

## History

- **2025-06**: Initial structure with Claude Code support
- **2026-01**: Migrated to OpenCode — changed all paths/terminology
- **2026-01-23**: Added dual-tool support — generates for both Claude Code and OpenCode
