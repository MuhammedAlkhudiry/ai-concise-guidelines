---
name: improve-agent-setup
description: Agent setup audits and improvement recommendations.
---

This skill is recommendation-only. No edit.

## Workflow

1. Use every lens below for a broad audit, or only the lens named by the user.
2. Inspect the relevant source and installed evidence. Hunt deeply through recent task threads for repeated friction, confusion, detours, failures,
   manual work, and context waste. For context audits, run `scripts/analyze-codex-sessions.ts --help` and use its current interface.
3. For the external-tools lens, search GitHub Trending and current GitHub results for agentic-AI tools that could remove observed friction. Search
   other current external sources only when needed.
4. Rank candidates by recurring future value, confidence, implementation effort, and risk.
5. Report the strongest recommendations first. For each, give the evidence, expected recurring benefit, and concrete implementation direction. Mention
   rejected ideas only when they are genuinely tempting.

## Lenses

- **Context:** always-loaded instructions, session growth, compaction, noisy tool output, screenshots, and avoidable token use.
- **Skills:** missing, overlapping, stale, broad, duplicated, or script-worthy capabilities.
- **Rules:** scope, duplication, source-of-truth placement, and workflow guidance that belongs in a skill.
- **Install and tooling:** install, doctor, shell sync, system tools, helpers, generated drift, and installed configuration.
- **Active projects:** inventory, paths, environment contracts, lane status, and stale assumptions.
- **External tools:** trending and current agentic-AI tools that remove repeated work, reduce context, or simplify the setup enough to justify
  integration cost.
