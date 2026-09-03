---
name: writing-skills
description: AI agent skill and instruction-file writing and maintenance.
---

## Content

- Assume the agent is capable. Keep only reusable task-specific workflows, domain knowledge, tool contracts, and preferences unavailable from broader
  instructions or authoritative sources.
- Make the skill route to authoritative code, live help, schemas, metadata, catalogs, or another skill. Do not mirror discoverable inventories,
  syntax, options, behavior, or implementation.
- Remove textbook material, generic advice, copied global rules, duplication, mood, decorative examples, stale guidance, and no-op steps before adding
  anything.
- For CLI-backed skills, require the agent to read the narrowest relevant live help before acting. Never copy, summarize, explain, or maintain CLI
  commands, options, syntax, installation steps, or behavior that help exposes. Keep only task-specific workflow, decisions, safety boundaries, and
  completion contracts that the CLI cannot provide.
- Bundle source material only when it is unavailable at execution time, prohibitively expensive to retrieve, or needs a stable task-specific
  interpretation.
- State the intended rule or boundary directly, omit redundant prohibitions.
- Keep exact command shapes only when live help cannot determine the task-specific invocation. Keep file structures and output templates only when
  they prevent guessing.
- Give workflow steps checkable completion conditions when done would otherwise be ambiguous.

## Structure

- Use only `name` and `description` YAML frontmatter. The lowercase hyphenated name must match its folder.
- Make the description the trigger contract: lead with the domain or action and include only distinct trigger branches.
- Inline any reference loaded on every invocation; keep separate references only for conditional branches.
- Reference another skill as `$skill-name`.
- Co-locate each concept's rule, caveat, and completion signal. Remove empty sections, hidden references, vague triggers, and unnecessary files.

## Instruction files

Apply the same content rules to always-loaded instruction files. Edit the authoritative source, never a generated copy. Move task-specific workflows
into a skill, script, checklist, or project document and keep always-loaded context for durable, broadly applicable rules. Replace stale or
overlapping rules instead of layering exceptions.
