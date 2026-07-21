---
name: manage-skill
description: AI agent skill creation and maintenance.
---

## Content

- Assume the agent is capable. Keep only reusable task-specific workflows, domain knowledge, tool contracts, and preferences unavailable from broader instructions or authoritative sources.
- Remove textbook material, generic advice, copied global rules, duplication, mood, decorative examples, stale guidance, and no-op steps before adding anything.
- Route to authoritative CLI help, schemas, metadata, documentation, live catalogs, or another skill instead of copying them.
- Bundle source material only when it is unavailable at execution time, prohibitively expensive to retrieve, or needs a stable task-specific interpretation.
- State the intended rule or boundary directly instead of layering exception clauses.
- Keep exact command shapes, file structures, and output templates only when they prevent guessing.
- Give workflow steps checkable completion conditions when done would otherwise be ambiguous.

## Structure

- Use only `name` and `description` YAML frontmatter. The lowercase hyphenated name must match its folder.
- Make the description the trigger contract: lead with the domain or action and include only distinct trigger branches.
- Inline any reference loaded on every invocation; keep separate references only for conditional branches.
- Reference another skill as `$skill-name`.
- Co-locate each concept's rule, caveat, and completion signal. Remove empty sections, hidden references, vague triggers, and unnecessary files.
