---
name: _create-skill
description: "Create or update an AI agent skill. Use when the user wants a new skill, wants to improve an existing one, or asks how to structure a reusable skill."
---

# Create Skill

Write skills as lean triggerable instructions, not tutorials.

## Core Principles

- Assume the agent is already capable. Keep only task-specific knowledge.
- Put trigger guidance in the description, not the body.
- Keep `SKILL.md` short. Move detail to `references/`, `scripts/`, or `assets/`.
- Keep each fact in one place. Duplication makes skills rot.

## Structure

```text
_skill-name/
├── SKILL.md
├── references/   # docs loaded on demand
├── scripts/      # deterministic helpers
└── assets/       # templates or files used in output
```

`SKILL.md` needs:

```yaml
---
name: _skill-name
description: What the skill does and when to trigger it.
---
```

## Writing Rules

- `name`: lowercase, hyphenated, matches folder name, and uses the `_` prefix.
- `description`: say what it does, when to use it, and the phrases or contexts that should trigger it.
- Body: imperative instructions, fast workflow first, links to references only when needed.
- Prefer examples over explanation, but keep examples short.

## Workflow

1. Collect concrete examples of what the skill must handle.
2. Decide the boundary. One skill should cover one cohesive job.
3. Decide what belongs in `SKILL.md` versus `references/`, `scripts/`, or `assets/`.
4. Write the trigger description.
5. Write the body as a practical workflow.
6. Test the skill on real prompts. Tighten anything it misses or over-explains.

## Use Resources Deliberately

- Put stable, detailed material in `references/`.
- Put repeatable code in `scripts/`.
- Put templates or boilerplate in `assets/`.
- Keep the body as navigation plus decision rules.

## Anti-Patterns

- Vague descriptions
- Kitchen-sink skills
- Explaining basics the model already knows
- Copying the same guidance into multiple sections
- Putting "when to use" only in the body
