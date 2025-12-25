# Opinionated Guidelines for Daily AI Use

This is a list of opinionated guidelines/prompt files that I use daily with AI. They have been carefully curated based on the following principles:

> **For Contributors**: This repository uses a generator script. See [AGENTS.md](./AGENTS.md) for details on modifying templates and regenerating integration files.

1. The prompts are designed to be brief, avoiding unnecessary noise that could overload the AI context window.

2. Each guideline targets a particular behavior. Generic instructions (e.g., "be good," "think hard," "follow user prompt") are avoided, as it is assumed that the AI is already equipped with common sense.

3. Assuming that the AI model is already about 80% effective, these prompts are intended to push it further.

4. The prompts are meant to enhance the model's capabilities. The belief is that no amount of instructions can fix a fundamentally weak model.

5. These prompts have been collected through real-world interactions with AI, serving as direct feedback to address AI failures.

## Install
[Disclaimer: written by AI]

### Quick Install (Recommended)

Download the installer script:

```bash
curl -O https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh
chmod +x init.sh
```

Then run with your desired options:

```bash
# Install rules (merged guidelines) for Windsurf
./init.sh --rules-path ~/.windsurf/rules/RULES.md

# Install workflows for Windsurf
./init.sh --workflows-path ~/.windsurf/workflows

# Install skills for Claude Code
./init.sh --skills-path ~/.claude/skills

# Install everything (Windsurf)
./init.sh --rules-path ~/.windsurf/rules/RULES.md \
          --workflows-path ~/.windsurf/workflows

# Install everything (Claude Code)
./init.sh --rules-path ~/.claude/CLAUDE.md \
          --skills-path ~/.claude/skills \
          --agents-path ~/.claude/agents \
          --mcp-path ~/.claude/mcp.json \
          --install-statusline

# Install everything (OpenCode)
./init.sh --rules-path ~/.config/opencode/AGENTS.md \
          --skills-path ~/.config/opencode/skill \
          --agents-path ~/.config/opencode/agent \
          --mcp-path ~/.config/opencode/opencode.json
```

#### Options

- `--rules-path PATH` — Merge all guidelines into a single rules file at PATH
- `--skills-path PATH` — Copy skills to PATH directory
- `--agents-path PATH` — Copy agents to PATH directory (format auto-detected by path)
- `--workflows-path PATH` — Copy workflows to PATH directory (Windsurf only)
- `--mcp-path PATH` — Merge MCP servers into config file at PATH (requires `jq`)
- `--zsh-path PATH` — Copy ZSH custom config to PATH and source it in `~/.zshrc`
- `--rules-file-action ACTION` — Action when rules file exists: `overwrite`, `append`, or `skip`
- `--platform PLATFORM` — Hint for agent format: `claude-code`, `opencode`, or `windsurf` (auto-detected from paths)
- `--install-statusline` — Install Claude Code status line (colorful prompt with git, model, context bar)
- `--workflows-prefix PREFIX` — Add prefix to workflow filenames (e.g., `"MODES: "` becomes `MODES: plan-mode.md`)
- `--help`, `-h` — Show help message

---

## AI Tool Compatibility

| Tool | Guidelines | Modes/Skills | Agents |
|------|------------|--------------|--------|
| **Windsurf** | `--rules-path` | `--workflows-path` | N/A |
| **Claude Code** | `--rules-path` | `--skills-path` | `--agents-path` |
| **OpenCode** | `--rules-path` | `--skills-path` | `--agents-path` |

### Windsurf
Uses **workflows** (single .md files with frontmatter). Invoked explicitly via `/workflow-name`.

### Claude Code
Uses **skills** (directories with SKILL.md + supporting files). Skills are **auto-discovered** by Claude based on conversation context—no explicit `/mode` commands needed. Just describe what you want to do, and Claude activates the relevant skill automatically.

### OpenCode
Uses **skills** (same format as Claude Code—compatible with `.claude/skills/` paths) and **agents** (markdown files with frontmatter). Skills are auto-discovered via the `skill` tool. Agents can be:
- **Primary agents** (Tab to switch): The custom `plan` agent overrides OpenCode's built-in Plan mode
- **Subagents** (`@mention` to invoke): `@auditor` for code audits, `@scout` for fast file searches

---

### Manual Install

If you prefer manual installation, you can simply clone/copy any file you need.


--- 

### Examples

- Windsurf Editor
```bash
./init.sh --rules-path ~/.codeium/windsurf/memories/global_rules.md \
          --workflows-path ~/.codeium/windsurf/global_workflows
```


- Windsurf Jetbrains
```bash
./init.sh --rules-path ~/.codeium/memories/global_rules.md \
          --workflows-path ~/.codeium/global_workflows
```

### Alias for Quick Refresh

Add this alias to your shell configuration (`.bashrc`, `.zshrc`, etc.) to refresh guidelines with overwrite action:

- Windsurf Editor
```bash
alias refresh-windsurf-editor='cd /tmp && \
          curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh && \
          chmod +x init.sh && \
          ./init.sh --rules-path ~/.codeium/windsurf/memories/global_rules.md \
                    --workflows-path ~/.codeium/windsurf/global_workflows \
                    --zsh-path ~/.config/zsh-sync/custom.zsh \
                    --rules-file-action overwrite && \
          rm init.sh && \
          cd -'
```

- Windsurf Jetbrains
```bash
alias refresh-windsurf-jetbrains='cd /tmp && \
          curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh && \
          chmod +x init.sh && \
          ./init.sh --rules-path ~/.codeium/memories/global_rules.md \
                    --workflows-path ~/.codeium/global_workflows \
                    --zsh-path ~/.config/zsh-sync/custom.zsh \
                    --rules-file-action overwrite && \
          rm init.sh && \
          cd -'
```

- Windsurf (both)
```bash
alias refresh-windsurf='refresh-windsurf-editor && refresh-windsurf-jetbrains'
```

- Claude Code
```bash
alias refresh-claude='cd /tmp && \
          curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh && \
          chmod +x init.sh && \
          ./init.sh --rules-path ~/.claude/CLAUDE.md \
                    --skills-path ~/.claude/skills \
                    --agents-path ~/.claude/agents \
                    --mcp-path ~/.claude/mcp.json \
                    --zsh-path ~/.config/zsh-sync/custom.zsh \
                    --install-statusline \
                    --rules-file-action overwrite && \
          rm init.sh && \
          cd -'
```

- OpenCode
```bash
alias refresh-opencode='cd /tmp && \
          curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh && \
          chmod +x init.sh && \
          ./init.sh --rules-path ~/.config/opencode/AGENTS.md \
                    --skills-path ~/.config/opencode/skill \
                    --agents-path ~/.config/opencode/agent \
                    --mcp-path ~/.config/opencode/opencode.json \
                    --zsh-path ~/.config/zsh-sync/custom.zsh \
                    --rules-file-action overwrite && \
          rm init.sh && \
          cd -'
```

Then simply run:
```bash
refresh-windsurf
# or
refresh-claude
# or
refresh-opencode
```