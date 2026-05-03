# AI Concise Guidelines

Personal source of truth for my Codex and OpenCode rules, skills, shell helpers, and local assistant setup.

## Install

```bash
make install
```

Global runtimes are managed with `mise`; repo install still runs through `make install`.

`~/.zshrc` must stay as a thin loader that only imports `~/.config/zsh-sync/custom.zsh`. Put shell changes in `shell/zsh-custom.zsh`; `make install` fails if extra shell code is added directly to `~/.zshrc`.

## AI Assistant

`make install` installs `ai-assistant` and keeps its background digest job loaded.

```bash
ai-assistant status
ai-assistant digest
ai-assistant logs -f
```

Digest feedback is written to `ai-feedback.md` in the synced note vault, so it is visible from Mac, Android, and iOS. Local command status and logs stay under `~/.config/ai-assistant/`.

## Map

- `content/base-rules.md` - shared agent rules.
- `content/skills/` - managed local skills.
- `config/` and `src/` - install and generator logic.
- `shell/` - synced shell commands.
- `system-tools.md` - local command requirements.
- `AGENTS.md` - repo editing rules.

## License

MIT
