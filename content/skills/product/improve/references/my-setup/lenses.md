# Improve My Setup Lenses

Use lenses to keep the audit organized. Run all lenses by default for a broad setup audit, and use one lens only when the user names a specific area.

## Context/Token Lens

Use for context bloat, token waste, compaction, noisy tool output, MCP/tool schema cost, screenshots, pasted data, broad searches, or RTK opportunities.

Primary checks:

- Run `scripts/analyze-codex-sessions.ts`.
- Inspect always-loaded rule files and installed Codex/OpenCode instructions only when needed.
- Recommend narrower commands, scripts, RTK rules, tool changes, or rule edits.

## Skill Inventory Lens

Use for missing skills, overlapping skills, stale skills, over-broad skills, script-backed skills, or skill deletion/merge ideas.

Primary checks:

- Inspect local skill source folders from the current setup repository.
- Check descriptions, boundaries, references, scripts, and duplicated guidance.
- Recommend new skills only when the job is reusable across nearby tasks.

## Rules Lens

Use for global/base rules, repo-specific rules, communication rules, verification rules, and source-of-truth placement.

Primary checks:

- Inspect always-loaded source rules and generated or installed agent rules.
- Move repo-specific guidance out of global rules.
- Move workflow-specific guidance into skills.

## Install/Shell/Tooling Lens

Use for `mise run install`, `doctor`, `system-tools.md`, shell sync, local secrets, helper commands, generated output drift, or installed config mismatch.

Primary checks:

- Inspect `src/commands/install.ts`, `src/cli.ts`, `shell/*`, `system-tools.md`, `mise.toml`, and `package.json`.
- Compare source files with installed outputs only when drift is relevant.
- Keep install behavior simple and personal-only.

## Active-Project Lens

Use for active project inventory, cross-project setup, local environment setup, and stale project assumptions.

Primary checks:

- Inspect `content/active-projects.md`.
- Check project setup instructions and repo script behavior.
- Verify project paths and contracts before recommending broad changes.

## External Tools Lens

Use for finding or evaluating current tools that could reduce context, improve search, automate setup, replace custom scripts, or improve day-to-day development in the user's stack.

Primary checks:

- Search GitHub/web for current tools when recommendations depend on current ecosystem state.
- Cover the user's real stack by default: Laravel/PHP, React, React Native, DDEV/local environments, testing/QA, Sentry/PostHog/observability, databases/search, and AI-agent context/search workflows.
- Prefer tools that cut work, reduce context, improve feedback loops, or remove repeated manual steps over dashboards that only report usage.
- Rank tools by fit, maturity, local integration cost, and whether they reduce complexity.
- Translate good tools into concrete setup actions: new skill, doctor check, shell helper, project convention, install/evaluation note, or no-op.
