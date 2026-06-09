---
name: improve-my-setup
description: Personal AI operating system audit for rules, skills, install and shell tooling, Codex/OpenCode behavior, context waste, active projects, and the user's dev stack.
---

# Improve My Setup

Audit `my-setup` as the source of truth for AI agent behavior, then suggest concrete improvements.

## Workflow

1. Read `references/lenses.md`.
2. Run all lenses by default. Use a single lens only when the user asks for a specific area.
3. Inspect broadly before choosing: sample multiple relevant rules, skills, configs, scripts, shell tooling, generated outputs, and active-project setup paths. Do not stop at the first awkward rule, first noisy skill, first missing script, or first obvious context-waste issue when broader setup evidence is available.
4. Read only the source files and installed outputs needed for the active lenses.
5. Use scripts for broad local analysis instead of ad hoc session or repo grep.
6. Search GitHub or the web only when current external tools, APIs, or best practices matter.
7. Identify candidate improvements across the active lenses, then compare them by future-session impact, recurrence, confidence, implementation size, and risk.
8. Return the strongest improvements as specific changes: rule edit, skill add/merge/delete, script, doctor check, install change, active-project fix, or no-op. Do not merely return the first issue found.
9. Suggest only. Never edit files, install packages, run scripts that mutate state, or implement the suggestion from this skill.

## Scripted Checks

- Codex session context waste:

```bash
bun "$HOME/.agents/skills/improve-my-setup/scripts/analyze-codex-sessions.ts"
```
