---
name: manage-skill
description: AI agent skill creation and maintenance, including updates, renames, removals, trigger descriptions, structure, and workflow design.
---

## Content

- Assume the agent is already capable. Keep only task-specific knowledge.
- Remove textbook material and general model knowledge unless it is necessary task-specific context.
- Put trigger guidance in the description, not the body. The description is the invocation contract.
- Minimal means low interpretation cost, not lowest word count.
- Omit empty sections and extra headings unless they make repeated execution clearer.
- Keep compact file structures, command shapes, and output templates when they prevent guessing.
- Remove mood, duplicated explanation, decorative examples, and redundant output shapes.
- Keep each fact in one place.
- Prefer routing to an authoritative data source over reproducing its contents in a skill. Keep only the trigger, route, and task-specific constraints the source does not provide.
- Examples: point to CLI `--help` or agent help; inspect API schemas or tool metadata; read project knowledge or product documentation; query live service catalogs; use a dedicated task or access skill.
- Copy source material into a skill only when it will be unavailable at execution time, prohibitively expensive to retrieve, or requires a stable task-specific interpretation.
- Do not copy global rules into skills unless the skill needs a task-specific interpretation.
- Do not add guidance already covered by `base-rules.md`, repo rules, system guidance, or another broader source of truth.
- Every workflow step needs a checkable done condition when completion could otherwise be fuzzy.
- Prune before adding: remove no-op guidance, duplicated meaning, stale sediment, and sprawl.

## Structure

- Use YAML frontmatter with `name` and `description`.
- `name`: lowercase, hyphenated, and matches the folder name exactly.
- `description`: start with the leading domain or action, say what the skill does, and list only distinct trigger branches.
- If a reference would be loaded on every invocation, inline it into `SKILL.md`; reserve references for conditional branches.
- Reference another skill with the `$name` form so renames, removals, and typos are validated.
- Prefer clear examples over abstract explanation.
- Co-locate each concept's rule, caveat, and completion signal under one heading instead of scattering them.
- Avoid vague descriptions, synonym-stuffed triggers, kitchen-sink boundaries, tutorials, and steps without done signals.
- Avoid duplicated guidance, copied global rules, body-only triggers, hidden references, and ever-growing files.
