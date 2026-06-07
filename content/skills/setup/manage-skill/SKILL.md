---
name: manage-skill
description: "Create, update, rename, or remove an AI agent skill. Use when the user wants a new skill, wants to improve an existing one, or asks how to structure or maintain reusable skills."
---

# Manage Skill

## Core Principles

- Assume the agent is already capable. Keep only task-specific knowledge.
- Put trigger guidance in the description, not the body.
- Keep `SKILL.md` focused. Move detail to `references/`, `scripts/`, or `assets/`.
- Keep each fact in one place.
- Do not copy global rules into skills unless the skill needs a task-specific interpretation.

## Structure

```text
skill-name/SKILL.md
skill-name/references/
skill-name/scripts/
skill-name/assets/
```

```yaml
---
name: skill-name
description: What the skill does and when to trigger it.
---
```

## Writing

- `name`: lowercase, hyphenated, and matches the folder name exactly.
- `description`: say what it does, when to use it, and the phrases or contexts that should trigger it.
- Body: imperative instructions, fast workflow first, references only when needed.
- Prefer clear examples over abstract explanation.

## Workflow

1. Collect concrete examples.
2. Choose one cohesive boundary.
3. Split body, references, scripts, and assets deliberately.
4. Write the trigger description and workflow.
5. Test on real prompts and tighten misses or over-explanation.

## Anti-Patterns

- Vague descriptions, kitchen-sink boundaries, tutorials, duplicated guidance, copied global rules, or body-only trigger guidance.
