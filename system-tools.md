# System Tools

This repo assumes a small set of non-default tools on top of a normal macOS shell environment.

`doctor` checks command presence, managed helper links, and installed skill drift. It does not verify login state, credentials, local project state, editor/terminal preferences, or full runtime access.

Built-in macOS shell commands such as `awk`, `sed`, `grep`, `cp`, `rm`, and similar are intentionally not listed here.

## Regular Updates

Use these commands for periodic CLI upkeep:

```bash
mise run tools:status
mise run tools:update:plan
```

`tools:status` prints installed paths, current versions, latest known versions, and freshness labels. `tools:update:plan` prints the same version comparison plus reviewable update commands and notes, but does not change anything.

After running update commands, run `mise run install` again. Some installers may append shell setup directly to `~/.zshrc`; if the install fails the thin-`.zshrc` check, move any new shell setup into `shell/zsh-custom.zsh`, restore `~/.zshrc` to only source `~/.config/zsh-sync/custom.zsh`, then rerun `mise run install`.

Use `mise run install -- --compact` in agent workflows to keep successful installation output to one line while preserving warnings and failures.

## Core Repo Tools

These are the commands the repo itself relies on for install and day-to-day local use.

| Tool    | Why this repo assumes it                                                             |
| ------- | ------------------------------------------------------------------------------------ |
| `bun`   | Runtime used internally by `mise run install`.                                       |
| `git`   | Used for remote skill checkout, hook setup, and shared git helpers.                  |
| `mise`  | Powers the supported local task workflow and manages global runtimes instead of NVM. |
| `node`  | Runs the Oxfmt CLI used by repo format checks.                                       |
| `zsh`   | All shared shell commands are shipped as Zsh scripts.                                |
| `swift` | Builds the native Lanes menu-bar app during installation.                            |

## Shell And Helper Integrations

These are referenced by synced shell config, helper commands, or installed workflows. `agent-browser`, `agent-device`, and `simslim` are required by `doctor`; the rest are optional, but the repo assumes them when those workflows are used.

| Tool            | Why this repo assumes it                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `phpstorm`      | Default editor command in `shell/zsh-custom.zsh`.                                                                                      |
| `herd`          | Laravel aliases and local PHP workflows use it.                                                                                        |
| `opencode`      | `ai` launcher and OpenCode workflows use it.                                                                                           |
| `agent-browser` | Default AI-agent browser automation CLI for snapshots, interaction, screenshots, and local web QA.                                     |
| `agent-device`  | Default AI-agent mobile and device automation CLI for app snapshots, interaction, screenshots, and mobile QA.                          |
| `simslim`       | Applies and verifies project-safe memory-saving profiles for persistent lane simulators.                                               |
| `fzf`           | Used by project pickers and interactive hosts/plan deletion.                                                                           |
| `sg`            | Optional AST-shaped code search through ast-grep when text search is too loose.                                                        |
| `wacli`         | Reads and exports WhatsApp data for authorized personal knowledge workflows.                                                           |
| `imsg`          | Reads and exports local SMS and iMessage data for authorized personal knowledge workflows; reading Messages requires Full Disk Access. |
| `gcloud`        | Supports Google Cloud project, API, service account, and IAM workflows.                                                                |
| `gum`           | Optional styled output for `doctor`.                                                                                                   |

The installed `context-health` helper audits recent Codex session context waste through the local `improve-agent-setup` analyzer.
Install `agent-browser` with `npm install -g agent-browser`, then run `agent-browser install` once to prepare Chrome for Testing when needed.
Install `agent-device` with `npm install -g agent-device`.
Install SimSlim 0.2.0 or newer with `brew install mobai-app/tap/simslim`.

## Persistent Lane Simulator Profiles

Each active project can declare a safe SimSlim profile in `config/active-projects.ts`. Lane setup applies that profile after installing the Herd certificate, and lane verification requires the exact expected service set.

```bash
lanes simulators status [project]
lanes simulators apply [project]
lanes simulators apply [project] --mode full
lanes simulators restore [project]
```

Commands operate sequentially, preserve each simulator's original boot state, and report every lane failure together. Project mode is the default; full mode is explicit because it can disable capabilities used by the app.

## Observability CLIs

These CLIs are the supported agent access path for PostHog and Sentry. The setup intentionally does not configure MCP servers.

| Tool          | Why this repo assumes it                                                                  |
| ------------- | ----------------------------------------------------------------------------------------- |
| `posthog-cli` | Primary PostHog analytics, HogQL, entity, and API access through shell-friendly commands. |
| `sentry`      | Primary Sentry issue, event, trace, log, release, and API access for agents.              |
| `sentry-cli`  | Optional legacy command retained for SDK and CI integrations that invoke it directly.     |

## Git Workflow Helpers

These are used by the shared helper commands that get installed into `~/bin`.

| Tool   | Why this repo assumes it                                      |
| ------ | ------------------------------------------------------------- |
| `gh`   | Optional GitHub pull request creation from the command line.  |
| `glab` | Optional GitLab merge request creation from the command line. |
