# Improve Agent Setup

Audit the setup repository as the source of truth for AI agent behavior, then suggest concrete improvements.

## Workflow

1. Use the lenses below to organize the audit.
2. Run all lenses by default; use one lens only when the user asks for a specific area.
3. Inspect broadly before choosing: sample relevant rules, skills, configs, scripts, shell tooling, generated outputs, and active-project setup paths.
   Do not stop at the first awkward rule, noisy skill, missing script, or context-waste clue when broader setup evidence is available.
4. Read only the source files and installed outputs needed for the active lenses.
5. Use scripts for broad local analysis instead of ad hoc session or repo grep.
6. Search GitHub or the web only when current external tools, APIs, or best practices matter.
7. Identify candidate improvements across the active lenses, then compare them by future-session impact, recurrence, confidence, implementation size, and risk.
8. Return the strongest improvements as specific changes: rule edit, skill add/merge/delete, script, doctor check, install change, active-project fix, or no-op.
9. Suggest only. Never edit files, install packages, run scripts that mutate state, or implement the suggestion from this branch.
10. Mention rejected ideas only when they would otherwise look tempting.

## Output

Lead with the recommendations, then give only the evidence needed to trust them.

- `Top Picks`: the setup improvements most worth doing, ranked by value.
- `Evidence`: concrete files, lines, generated outputs, logs, command output, session analysis, docs, or current external sources.
- `Fix Shape`: the smallest correct implementation direction, including verification.
- `Other Candidates`: only stronger alternatives or close seconds, with why they lost.

## Scripted Checks

- Codex session context waste:

```bash
bun "$HOME/.agents/skills/workflow/scripts/analyze-codex-sessions.ts"
```

## Improve Agent Setup Lenses

Use lenses to organize the audit. Run all lenses by default for a broad setup audit, and use one lens only when the user names a specific area.

### Context/Token Lens

Use for context bloat, token waste, compaction, noisy tool output, MCP/tool schema cost, screenshots, pasted data, broad searches, or RTK opportunities.

Primary checks:

- Run `scripts/analyze-codex-sessions.ts`.
- Inspect always-loaded rule files and installed Codex/OpenCode instructions only when needed.
- Recommend narrower commands, scripts, RTK rules, tool changes, or rule edits.

### Skill Inventory Lens

Use for missing skills, overlapping skills, stale skills, over-broad skills, script-backed skills, or skill deletion/merge ideas.

Primary checks:

- Inspect local skill source folders from the current setup repository.
- Check descriptions, boundaries, references, scripts, and duplicated guidance.
- Recommend new skills only when the job is reusable across nearby tasks.

### Rules Lens

Use for global/base rules, repo-specific rules, communication rules, verification rules, and source-of-truth placement.

Primary checks:

- Inspect always-loaded source rules and generated or installed agent rules.
- Move repo-specific guidance out of global rules.
- Move workflow-specific guidance into skills.

### Install/Shell/Tooling Lens

Use for `mise run install`, `doctor`, `system-tools.md`, shell sync, local secrets, helper commands, generated output drift, or installed config mismatch.

Primary checks:

- Inspect `src/commands/install.ts`, `src/cli.ts`, `shell/*`, `system-tools.md`, `mise.toml`, and `package.json`.
- Compare source files with installed outputs only when drift is relevant.
- Keep install behavior simple and personal-only.

### Active-Project Lens

Use for active project inventory, cross-project setup, local environment setup, and stale project assumptions.

Primary checks:

- Inspect `content/active-projects.md`.
- Check project setup instructions and repo script behavior.
- Verify project paths and contracts before recommending broad changes.

### External Tools Lens

Use for finding or evaluating current tools that could reduce context, improve search, automate setup, replace custom scripts, or improve day-to-day development in the user's stack.

Primary checks:

- Search GitHub/web for current tools when recommendations depend on current ecosystem state.
- Cover the user's real stack by default: Laravel/PHP, React, React Native, DDEV/local environments, testing/QA, Sentry/PostHog/observability, databases/search, and AI-agent context/search workflows.
- Prefer tools that cut work, reduce context, improve feedback loops, or remove repeated manual steps over dashboards that only report usage.
- Rank tools by fit, maturity, local integration cost, and whether they reduce complexity.
- Translate good tools into concrete setup actions: new skill, doctor check, shell helper, project convention, install/evaluation note, or no-op.
