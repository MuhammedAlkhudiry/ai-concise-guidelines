# System Tools

This repo assumes a small set of non-default tools on top of a normal macOS shell environment.

`doctor` checks command presence plus the `ai-assistant` LaunchAgent. It does not verify login state, credentials, Kubernetes access, DDEV project state, editor/terminal preferences, or full runtime access.

Built-in macOS shell commands such as `awk`, `sed`, `grep`, `cp`, `rm`, and similar are intentionally not listed here.

## Core Repo Tools

These are the commands the repo itself relies on for install and day-to-day local use.

| Tool | Why this repo assumes it |
| --- | --- |
| `bun` | Runtime used internally by `make install`. |
| `git` | Used for remote skill checkout, hook setup, and shared git helpers. |
| `make` | Powers the only supported local install workflow. |
| `mise` | Manages global runtimes instead of NVM. |
| `zsh` | All shared shell commands are shipped as Zsh scripts. |

## Shell And Helper Integrations

These are referenced by synced shell config or helper commands. Some are optional, but the repo assumes them when those workflows are used.

| Tool | Why this repo assumes it |
| --- | --- |
| `phpstorm` | Default editor command in `shell/zsh-custom.zsh`. |
| `ddev` | Laravel aliases and local PHP workflows use it. |
| `obsidian` | `ai-assistant` uses it to read and update the personal vault. |
| `codex` | `ai-assistant` uses it to run inbox digestion. |
| `opencode` | `ai` launcher and OpenCode workflows use it. |
| `fzf` | Used by project pickers and interactive hosts deletion. |

## Git And Remote Workflow Helpers

These are used by the shared helper commands that get installed into `~/bin`.

| Tool | Why this repo assumes it |
| --- | --- |
| `gh` | Optional PR creation backend for `gbr`. |
| `glab` | Optional MR creation backend for `gbr`. |
| `kubectl` | Required by `remote` and `remote-info`. |
| `gum` | Optional pretty output for `remote-info`. |
| `php` | Required by `remote-tinker` payload execution inside the remote shell command. |
