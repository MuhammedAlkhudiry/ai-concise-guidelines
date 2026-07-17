- **SCOPE** — This repository defines shared AI guidelines, skills, and agent configuration for OpenCode and Codex.
- **PERSONAL-ONLY** — Treat this repo as personal infrastructure for its owner only; do not design for sharing, multi-user setup, or user-configurable distribution.
- **SOURCE-OF-TRUTH** — Make changes in source files (`content/`, `config/`, `src/`, `plugins/`, `shell/`), not generated artifacts.

## Important Files

- `content/skills/<category>/<name>/SKILL.md` — Source files for local skills; each skill belongs under a category folder.
- `config/skills.ts` — Remote skill declarations fetched and installed by this repo.
- `config/codex.ts`, `config/opencode.ts`, and `config/mcp.ts` — Source of truth for generated Codex, OpenCode, and MCP configuration.
- `src/cli.ts` — `my-setup` CLI entrypoint.
- `src/commands/generate.ts` — Generator for files under `output/`.
- `src/commands/install.ts` — Local installer that syncs rules, config, skills, shell helpers, secrets, and shared bin commands.
- `shell/zsh-custom.zsh` and `shell/doctor.zsh` — Synced shell config and local tool health checks.
- `system-tools.md` — Human-readable list of expected system tools; keep it aligned with `doctor`.
- `config/active-projects.ts` — Source of truth for active projects and their fixed clone lanes.
- `output/` — Generated preview artifacts only; do not edit by hand.

- **ACTIVE-PROJECTS** — Active projects and their fixed clone lanes are declared in `config/active-projects.ts`; use it as the source of truth and acquire work through `$project-lanes`.
- **MAIN-ONLY** — Work directly on `main`; do not create branches unless explicitly requested.
- **INSTALL** — Use `mise run install` as the only supported local sync/install command after changing content/config/generator behavior.
- **THIN-ZSHRC** — If user `~/.zshrc` contains anything beyond the managed `shell/zsh-custom.zsh` import, repair it directly instead of leaving installation blocked.
  Preserve custom shell code by migrating it into `shell/zsh-custom.zsh`, then restore the thin `~/.zshrc` and rerun installation.
- **SYSTEM-TOOLS** — Keep `system-tools.md` current when repo scripts or synced shell config add, remove, or depend on system-installed commands; keep `doctor` in sync with that list.
- **SKILL-STRUCTURE** — Each skill must live in `content/skills/<category>/<name>/SKILL.md` with YAML frontmatter (`name`, `description`) and instructions body.
- **SKILL-OPENAI-YAML** — Never add `agents/openai.yaml` to a skill unless the user explicitly requests it.
- **SKILL-REFERENCES** — When reading or editing a skill, inspect its referenced files and relevant nearby source files too; do not judge the skill from `SKILL.md` alone.
- **SKILL-CROSS-REFERENCES** — When one skill refers to another, write `$skill-name` instead of a bare or code-formatted name so renames, removals, and typos are validated.
- **SKILL-CREATION-WORKSHOP** — Before creating a new skill, always workshop the goal, arguments, trade-offs, and scope with the user, then do a deep web search for current external guidance or examples even if the user did not ask for it.
- **SKILL-PORTABLE** — Installed-facing skill files must not point back to source-only repo paths such as `content/skills/...` or local `my-setup` paths; use skill-relative references.
- **SKILL-GLOBAL** — Skill instructions are global capabilities; do not mention any project, repo, product, client, or local workspace by name.
- **SKILL-INSTALL** — Never install skills with `npx skills add`; local skills live in this repo under `content/skills/<category>/*`, and remote skills must be declared in `config/skills.ts` for this repo's source/import logic.
- **MY-SETUP-CLI** — Supported local commands are `my-setup install`, `my-setup doctor`, `my-setup tools status`, `my-setup tools update-plan`, and `my-setup lanes <setup|status|acquire|release|verify|reset|destroy>`.
- **KNOWLEDGE-CLI** — Use the standalone `knowledge` command to initialize, list, create, and check project knowledge packs.
- **WORDING-QUALITY** — Preserve user intent, but do not reuse the user's rough wording. Rewrite it into the clearest, strongest wording that fits the repo's voice.
