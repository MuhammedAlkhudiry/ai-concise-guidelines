---
name: improve-my-setup
description: Audit the user's `my-setup` AI operating system and suggest improvements for rules, skills, install/shell tooling, Codex/OpenCode behavior, context waste, active-project setup, and current tools for the user's Laravel, React, React Native, DDEV, QA, observability, and AI-agent development stack.
---

# Improve My Setup

Audit `my-setup` as the source of truth for AI agent behavior, then suggest concrete improvements.

## Workflow

1. Read `references/lenses.md`.
2. Run all lenses by default. Use a single lens only when the user asks for a specific area.
3. Read only the source files and installed outputs needed for the active lenses.
4. Use scripts for broad local analysis instead of ad hoc session or repo grep.
5. Search GitHub or the web only when current external tools, APIs, or best practices matter.
6. Return improvements as specific changes: rule edit, skill add/merge/delete, script, doctor check, install change, active-project fix, or no-op.
7. Suggest only. Never edit files, install packages, run scripts that mutate state, or implement the suggestion from this skill.

## Scripted Checks

- Codex session context waste:

```bash
bun "$HOME/.agents/skills/improve-my-setup/scripts/analyze-codex-sessions.ts"
```
