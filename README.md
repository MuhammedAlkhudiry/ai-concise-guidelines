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
# Download and run installer
curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.ts && bun init.ts && rm init.ts
```

### Options

| Option | Description |
|--------|-------------|
| `--local, -l` | Use local output directory instead of cloning from GitHub |
| `--help, -h` | Show help |

### Installed Paths

| Content | Path |
|---------|------|
| Rules | `~/.config/opencode/AGENTS.md` |
| Skills | `~/.config/opencode/skill/` |
| Agents | `~/.config/opencode/agent/` |
| Plugins | `~/.config/opencode/plugin/` |
| Commands | `~/.config/opencode/command/` |
| Zsh Config | `~/.config/zsh-sync/custom.zsh` |
| OpenCode Config | `~/.config/opencode/opencode.json` |

## License

MIT
