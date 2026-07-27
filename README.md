# My Setup

Personal source of truth for my Claude Code, Codex, and OpenCode rules, skills, and shell helpers.

## Workflow

```bash
mise run install
mise run check
doctor
```

- `mise run install` generates previews, syncs local agent configuration and skills, installs shell helpers, and finishes with the doctor checks.
- `mise run install -- --compact` preserves warnings and failures while reducing successful agent output to one line.
- `mise run check` runs formatting, linting, TypeScript checks, and tests.
- `doctor` checks required tools, managed links, and installed skill drift.

After pulling changes, rerun `mise run install` if the managed hooks did not complete successfully. Use `doctor` to identify any remaining local
drift.

## Source Layout

- `content/` — shared agent rules, local skills, and active-project references.
- `config/` — Codex, OpenCode, MCP, remote-skill, model, and secret-template configuration.
- `src/` — generator, installer, doctor support, project and personal knowledge commands, and tool-status logic.
- `shell/` — synced Zsh configuration and installed helper commands.
- `output/` — generated previews; never edit these files directly.
- `system-tools.md` — required and optional host tools plus update guidance.

Make durable changes in the source directories, then use `mise run install` to regenerate and sync the installed state.
