# System Tools

This repo assumes a small set of non-default tools on top of a normal macOS shell environment.

`doctor` checks command presence, Solo control-plane readiness, managed helper links, and installed skill drift. It does not verify login state, credentials, Kubernetes access, DDEV project state, editor/terminal preferences, or full runtime access.

Built-in macOS shell commands such as `awk`, `sed`, `grep`, `cp`, `rm`, and similar are intentionally not listed here.

## Core Repo Tools

These are the commands the repo itself relies on for install and day-to-day local use.

| Tool | Why this repo assumes it |
| --- | --- |
| `bun` | Runtime used internally by `mise run install`. |
| `git` | Used for remote skill checkout, hook setup, and shared git helpers. |
| `mise` | Powers the supported local task workflow and manages global runtimes instead of NVM. |
| `node` | Runs the Oxfmt CLI used by repo format checks. |
| `zsh` | All shared shell commands are shipped as Zsh scripts. |

## Shell And Helper Integrations

These are referenced by synced shell config or helper commands. Some are optional, but the repo assumes them when those workflows are used.

| Tool | Why this repo assumes it |
| --- | --- |
| `phpstorm` | Default editor command in `shell/zsh-custom.zsh`. |
| `ddev` | Laravel aliases and local PHP workflows use it. |
| `opencode` | `ai` launcher and OpenCode workflows use it. |
| `agent-browser` | Default AI-agent browser automation CLI for snapshots, interaction, screenshots, and local web QA. |
| `rtk` | Reduces noisy command output before it reaches AI agent context. |
| `solo` | Controls Solo projects, processes, dev servers, logs, todos, and scratchpads through the Solo HTTP control plane. |
| `jq` | Reads Solo's local HTTP API discovery file for raw API fallback workflows. |
| `fzf` | Used by project pickers and interactive hosts deletion. |
| `sg` | Optional AST-shaped code search through ast-grep when text search is too loose. |

The installed `context-health` helper audits recent Codex session context waste through the local `improve-my-setup` analyzer.
Install `agent-browser` with `npm install -g agent-browser`, then run `agent-browser install` once to prepare Chrome for Testing when needed.

## Git And Remote Workflow Helpers

These are used by the shared helper commands that get installed into `~/bin`.

| Tool | Why this repo assumes it |
| --- | --- |
| `gh` | Optional PR creation backend for `gbr`. |
| `glab` | Optional MR creation backend for `gbr`. |
| `kubectl` | Required by `remote` and `remote-info`. |
| `gum` | Optional pretty output for `remote-info`. |
| `php` | Required by `remote-tinker` payload execution inside the remote shell command. |
