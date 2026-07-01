---
name: manage-skill
description: AI agent skill creation and maintenance, including skill updates, renames, removals, trigger descriptions, structure, and reusable workflow design.
---

# Manage Skill

## Core Principles

- Assume the agent is already capable. Keep only task-specific knowledge.
- Put trigger guidance in the description, not the body. The description is the invocation contract.
- Keep `SKILL.md` focused. Move branch-specific detail to `references/`, repeatable execution to `scripts/`, and reusable media or fixtures to `assets/`.
- Keep each fact in one place.
- Do not copy global rules into skills unless the skill needs a task-specific interpretation.
- Never add guidance to a skill when the same rule, constraint, workflow step, or tool preference already lives in a broader source of truth such as `base-rules.md`, repo rules, or system guidance.
- Every workflow step needs a checkable done condition when completion could otherwise be fuzzy.
- Prune before adding: remove no-op guidance, duplicated meaning, stale sediment, and sprawl.

## Writing

- Structure skills as `skill-name/SKILL.md` plus optional `references/`, `scripts/`, and `assets/`.
- Use YAML frontmatter with `name` and `description`.
- `name`: lowercase, hyphenated, and matches the folder name exactly.
- `description`: start with the leading domain or action, say what the skill does, and list only distinct trigger branches.
- Body: imperative instructions, fast workflow first, references when needed. Keep branch-specific material behind clear pointers.
- Prefer clear examples over abstract explanation.
- Co-locate each concept's rule, caveat, and completion signal under one heading instead of scattering them.

## Workflow

1. Collect concrete examples.
2. Choose one cohesive boundary.
3. Draft the description as trigger branches, then delete duplicate synonyms and body-only trigger guidance.
4. Split body, references, scripts, and assets deliberately: inline what every run needs, and disclose what only some runs need.
5. Write the workflow with checkable completion criteria for each non-trivial step.
6. Test on real prompts and tighten misses, premature completion, or over-explanation.
7. Run a pruning pass for no-ops, duplication, stale sediment, and sprawl.

## Anti-Patterns

Vague descriptions, synonym-stuffed triggers, kitchen-sink boundaries, tutorials, steps without a done signal,
duplicated guidance, copied global rules, body-only trigger guidance, hidden reference material with no pointer,
and skill files that keep growing instead of disclosing or pruning.
