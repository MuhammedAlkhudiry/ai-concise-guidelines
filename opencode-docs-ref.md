# OpenCode Documentation Reference

> **Source:** [anomalyco/opencode](https://github.com/anomalyco/opencode) - The open source AI coding agent
> **Docs:** https://opencode.ai/docs

---

## Documentation Pages

### Core Documentation

| Page | URL | Description |
|------|-----|-------------|
| Intro | https://opencode.ai/docs/ | Getting started guide |
| Config | https://opencode.ai/docs/config/ | JSON configuration reference |
| Providers | https://opencode.ai/docs/providers/ | LLM provider configuration |
| Network | https://opencode.ai/docs/network/ | Network settings |
| Enterprise | https://opencode.ai/docs/enterprise/ | Enterprise features |
| Troubleshooting | https://opencode.ai/docs/troubleshooting/ | Common issues and fixes |
| Migrating to 1.0 | https://opencode.ai/docs/1-0/ | Migration guide |

### Usage

| Page | URL | Description |
|------|-----|-------------|
| TUI | https://opencode.ai/docs/tui/ | Terminal UI usage |
| CLI | https://opencode.ai/docs/cli/ | Command line interface |
| Web | https://opencode.ai/docs/web/ | Web interface |
| IDE | https://opencode.ai/docs/ide/ | IDE extension |
| Zen | https://opencode.ai/docs/zen/ | OpenCode Zen (recommended models) |
| Share | https://opencode.ai/docs/share/ | Sharing conversations |
| GitHub | https://opencode.ai/docs/github/ | GitHub integration |
| GitLab | https://opencode.ai/docs/gitlab/ | GitLab integration |

### Configure

| Page | URL | Description |
|------|-----|-------------|
| Tools | https://opencode.ai/docs/tools/ | Available tools configuration |
| Rules | https://opencode.ai/docs/rules/ | Instruction rules |
| Agents | https://opencode.ai/docs/agents/ | Agent configuration (includes temperature) |
| Models | https://opencode.ai/docs/models/ | Model configuration and variants |
| Themes | https://opencode.ai/docs/themes/ | UI themes |
| Keybinds | https://opencode.ai/docs/keybinds/ | Keyboard shortcuts |
| Commands | https://opencode.ai/docs/commands/ | Custom commands |
| Formatters | https://opencode.ai/docs/formatters/ | Code formatters |
| Permissions | https://opencode.ai/docs/permissions/ | Permission settings |
| LSP Servers | https://opencode.ai/docs/lsp/ | Language Server Protocol |
| MCP Servers | https://opencode.ai/docs/mcp-servers/ | Model Context Protocol servers |
| ACP Support | https://opencode.ai/docs/acp/ | Agent Communication Protocol |
| Agent Skills | https://opencode.ai/docs/skills/ | Agent skills system |
| Custom Tools | https://opencode.ai/docs/custom-tools/ | Creating custom tools |

### Develop

| Page | URL | Description |
|------|-----|-------------|
| SDK | https://opencode.ai/docs/sdk/ | Software Development Kit |
| Server | https://opencode.ai/docs/server/ | Server configuration |
| Plugins | https://opencode.ai/docs/plugins/ | Plugin development |
| Ecosystem | https://opencode.ai/docs/ecosystem/ | OpenCode ecosystem |

---

## Temperature Configuration

OpenCode supports temperature configuration at the **agent level**. This controls the randomness and creativity of the LLM's responses.

### Usage

```jsonc
// opencode.json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "plan": {
      "temperature": 0.1
    },
    "build": {
      "temperature": 0.3
    },
    "creative": {
      "temperature": 0.8
    }
  }
}
```

### In Markdown Agents

```markdown
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
---

You are in code review mode...
```

### Temperature Values

| Range | Behavior | Use Case |
|-------|----------|----------|
| 0.0-0.2 | Very focused and deterministic | Code analysis, planning |
| 0.3-0.5 | Balanced with some creativity | General development tasks |
| 0.6-1.0 | More creative and varied | Brainstorming, exploration |

### Defaults

If no temperature is specified, OpenCode uses model-specific defaults:
- **Most models:** 0
- **Qwen models:** 0.55

---

## Temperature Support by Type

| Type | Direct Support | Workaround |
|------|----------------|------------|
| **Agents** | ✅ Yes | — |
| **Skills** | ❌ No (ignored) | Uses calling agent's temperature |
| **Commands** | ❌ No | Set `agent` option to an agent with temperature |

### Skills Frontmatter (No Temperature)

Skills only support these frontmatter fields:
- `name` (required)
- `description` (required)
- `license`, `compatibility`, `metadata` (optional)

> "Unknown frontmatter fields are ignored."

### Commands Options (No Temperature)

Commands support:
- `template` (required) - the prompt
- `description` - shown in TUI
- `agent` - which agent executes it (use this to get temperature!)
- `subtask` - force subagent mode
- `model` - override the model

### Pattern: Creative Commands via Agents

```jsonc
{
  "agent": {
    "creative": {
      "description": "Creative mode",
      "temperature": 0.7
    }
  },
  "command": {
    "brainstorm": {
      "agent": "creative",  // Inherits agent's temperature
      "template": "Brainstorm $ARGUMENTS"
    }
  }
}
```

---

## Other Model Options

Available at agent level or in provider model configuration:

| Option | Description |
|--------|-------------|
| `temperature` | Sampling temperature (0.0-1.0) |
| `maxSteps` | Max agentic iterations before text-only response |
| `reasoningEffort` | OpenAI reasoning models: `low`, `medium`, `high`, `xhigh` |
| `textVerbosity` | OpenAI: control response verbosity |
| `reasoningSummary` | OpenAI: reasoning summary mode |
| `thinking` | Anthropic: enable thinking mode with budget tokens |

### Example with Provider Options

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "openai": {
      "models": {
        "gpt-5": {
          "options": {
            "reasoningEffort": "high",
            "textVerbosity": "low"
          }
        }
      }
    },
    "anthropic": {
      "models": {
        "claude-sonnet-4-5-20250929": {
          "options": {
            "thinking": {
              "type": "enabled",
              "budgetTokens": 16000
            }
          }
        }
      }
    }
  }
}
```

---

## Config Schema

Full JSON schema: https://opencode.ai/config.json

---

## Quick Links

- **GitHub:** https://github.com/anomalyco/opencode
- **Discord:** https://opencode.ai/discord
- **Install:** `curl -fsSL https://opencode.ai/install | bash`
- **NPM:** `npm i -g opencode-ai@latest`
