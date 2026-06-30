---
name: manage-skill
description: AI agent skill creation and maintenance, including skill updates, renames, removals, trigger descriptions, structure, and reusable workflow design.
---

# Manage Skill

## Core Principles

- Assume the agent is already capable. Keep only task-specific knowledge.
- Put trigger guidance in the description, not the body.
- Keep `SKILL.md` focused. Move detail to `references/`, `scripts/`, or `assets/`.
- Keep each fact in one place.
- Do not copy global rules into skills unless the skill needs a task-specific interpretation.
- Never add guidance to a skill when the same rule, constraint, workflow step, or tool preference already lives in a broader source of truth such as `base-rules.md`, repo rules, or system guidance.

## Writing

- Structure skills as `skill-name/SKILL.md` plus optional `references/`, `scripts/`, and `assets/`.
- Use YAML frontmatter with `name` and `description`.
- `name`: lowercase, hyphenated, and matches the folder name exactly.
- `description`: say what it does, when to use it, and the phrases or contexts that should trigger it.
- Body: imperative instructions, fast workflow first, references when needed.
- Prefer clear examples over abstract explanation.

## Workflow

1. Collect concrete examples.
2. Choose one cohesive boundary.
3. Split body, references, scripts, and assets deliberately.
4. Write the trigger description and workflow.
5. Test on real prompts and tighten misses or over-explanation.

## Anti-Patterns

Vague descriptions, kitchen-sink boundaries, tutorials, duplicated guidance, copied global rules, and body-only trigger guidance.
