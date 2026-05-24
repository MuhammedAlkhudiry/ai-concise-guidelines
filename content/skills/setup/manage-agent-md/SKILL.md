---
name: manage-agent-md
description: Create, update, prune, or review AGENTS.md-style agent instruction files. Use when the user asks to manage repo instructions, AI coding guidelines, agent rules, durable agent context, or AGENTS.md wording.
---

# Manage Agent Markdown

Manage durable agent instruction files as concise operating rules, not documentation.

## Workflow

1. Find the current instruction source before editing. If the visible file is generated, edit the source file that owns it.
2. Decide whether the request is a new rule, an update, a stale-rule removal, or a rule that belongs in a narrower skill.
3. Keep each rule single-purpose, direct, and actionable.
4. Replace stale instructions instead of layering exceptions.
5. Move task-specific workflow guidance into the relevant skill instead of keeping it in always-loaded instructions.
6. Store local dev URLs only when they are durable setup facts for a real git worktree.
7. Preserve the file's existing structure and labels unless the local pattern is clearly stale.
8. Run the repository's supported sync and checks after source edits.

## Review Checklist

- The rule belongs in an agent instruction file instead of a skill, script, checklist, or project doc.
- The wording tells the agent what to do.
- The instruction is current, testable, and not duplicated elsewhere.
- The file stays concise enough for always-loaded context.
