# Opinionated Guidelines for OpenCode

Opinionated AI guidelines, skills, and agents for OpenCode.

> **For Contributors**: See [AGENTS.md](./AGENTS.md) for details on modifying content and regenerating output files.

## Principles

1. **Brief** — Avoid noise that overloads AI context
2. **Targeted** — Each guideline targets a specific behavior
3. **Additive** — Push the model's 80% effectiveness further
4. **Practical** — Collected through real-world AI interactions

## Install

### Quick Install

```bash
# Download installer
curl -O https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.ts
```

Run with bun:

```bash
bun init.ts --rules-path ~/.config/opencode/AGENTS.md \
            --skills-path ~/.config/opencode/skill \
            --agents-path ~/.config/opencode/agent
```

### Options

| Option | Description |
|--------|-------------|
| `--rules-path PATH` | Install base rules to PATH |
| `--skills-path PATH` | Install skills to PATH directory |
| `--agents-path PATH` | Install agents to PATH directory |
| `--rules-file-action ACTION` | `overwrite`, `append`, or `skip` |
| `--help` | Show help |

### Refresh Alias

Add to your `.zshrc` or `.bashrc`:

```bash
alias refresh-opencode='cd /tmp && \
          curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.ts && \
          bun init.ts --rules-path ~/.config/opencode/AGENTS.md \
                    --skills-path ~/.config/opencode/skill \
                    --agents-path ~/.config/opencode/agent \
                    --rules-file-action overwrite && \
          rm init.ts && \
          cd -'
```

Then run:
```bash
refresh-opencode
```

## What's Included

### Base Rules
Global rules applied to all modes—critical safety rules, coding standards, after-task checklist.

### Primary Agents (Modes)

> **Note**: `plan` and `build` agents are disabled—use [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) for orchestration.

| Agent | Description |
|-------|-------------|
| `frontend-design` | UI/UX focused editing |
| `quick-edits` | Fast, minimal changes |
| `workshop` | Explore and stress-test ideas |
| `audit` | Orchestrate specialized auditors for code review |

### Sub-agents
| Agent | Description |
|-------|-------------|
| `auditor` | General code auditor |
| `auditor-*` | Specialized auditors (code-quality, security, performance, database, etc.) |

### Skills
| Skill | Description |
|-------|-------------|
| `planning` | Create structured implementation plans |
| `execution` | Implement approved plans into code |
| `frontend-design` | UI/UX focused editing |
| `workshop` | Explore and stress-test ideas |
| `debugging` | Systematic bug investigation |
| `code-review` | Review code for issues |
| `refactoring` | Restructure without changing behavior |
| `product-strategy` | Find 10x opportunities |
| `feature-research` | Research features before building |
| `api-handoff` | Create API documentation for frontend |
| `backend-requirements` | Document frontend data needs |
| `user-story-review` | Review user stories |
| `translation` | Review translation quality |

## Repository Structure

```
content/
├── base-rules.md           # Global rules
├── instructions/           # Agent/skill instructions (17 files)
└── checklists/             # Domain-specific checklists (9 files)

config/
├── models.ts               # Model definitions
├── agents.ts               # Agent configs
└── skills.ts               # Skill configs

output/
└── opencode/               # Generated output
    ├── agents/
    └── skills/
```

## License

MIT
