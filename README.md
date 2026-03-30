# Opinionated AI Guidelines

Opinionated AI guidelines and skills for **OpenCode** and **Codex**.

> **For Contributors**: See [AGENTS.md](./AGENTS.md) for details on modifying content and regenerating output files.

## Install

```bash
curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.ts && bun init.ts && rm init.ts
```

Use `--local` / `-l` to install from local output instead of cloning from GitHub.

Managed skills are updated in `~/.agents/skills` during install. Existing custom skills on the device are preserved. You can run quick non-interactive prompts with `opencode run` once a provider is configured.

## Shared Shell Commands

`make install` installs these commands into `~/bin`:

- `gbr`
- `remote`
- `remote-tinker`
- `remote-info`
- `hosts`

## License

MIT
