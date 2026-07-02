---
name: improve-agent-setup
description: Agent setup improvement audits for AI-agent rules, skills, generated configs, install/shell tooling, active-project setup, context waste, and external tooling opportunities.
---

# Improve Agent Setup

Audit the setup repository as the source of truth for AI agent behavior, then suggest concrete improvements.

## Workflow

1. Read `references/lenses.md`.
2. Run all lenses by default; use one lens only when the user asks for a specific area.
3. Inspect broadly before choosing: sample relevant rules, skills, configs, scripts, shell tooling, generated outputs, and active-project setup paths.
   Do not stop at the first awkward rule, noisy skill, missing script, or context-waste clue when broader setup evidence is available.
4. Read only the source files and installed outputs needed for the active lenses.
5. Use scripts for broad local analysis instead of ad hoc session or repo grep.
6. Search GitHub or the web only when current external tools, APIs, or best practices matter.
7. Identify candidate improvements across the active lenses, then compare them by future-session impact, recurrence, confidence, implementation size, and risk.
8. Return the strongest improvements as specific changes: rule edit, skill add/merge/delete, script, doctor check, install change, active-project fix, or no-op.
9. Suggest only. Never edit files, install packages, run scripts that mutate state, or implement the suggestion from this skill.
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
bun "$HOME/.agents/skills/improve-agent-setup/scripts/analyze-codex-sessions.ts"
```
