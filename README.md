# Opinionated AI Guidelines

Opinionated AI guidelines and skills for **OpenCode** and **Codex**.

> **For Contributors**: See [AGENTS.md](./AGENTS.md) for details on modifying content and regenerating output files.

## Install

```bash
curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.ts && bun init.ts && rm init.ts
```

Use `--local` / `-l` to install from local output instead of cloning from GitHub.

Managed skills are synced in `~/.agents/skills` during install. Removed managed skills are pruned, while existing custom skills on the device are preserved. You can run quick non-interactive prompts with `opencode run` once a provider is configured.

When you run `make install` from this repo, it also configures Git to use the tracked hooks in `.githooks/`. That makes local `git pull` run `make install` automatically after merge-based pulls and rebase-based pulls.

This repo assumes several system tools already exist on the machine. See [system-tools.md](./system-tools.md) for the full list, then run `doctor` after install to verify what is available on the current machine.

## Shared Shell Commands

`make install` installs these commands into `~/bin`:

- `gbr`
- `hugeicons`
- `remote`
- `remote-tinker`
- `remote-info`
- `hosts`
- `doctor`

## License

MIT
