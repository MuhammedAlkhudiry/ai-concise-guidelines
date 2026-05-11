---
name: manage-skill
description: "Create, update, rename, or remove an AI agent skill. Use when the user wants a new skill, wants to improve an existing one, or asks how to structure or maintain reusable skills."
---

# Manage Skill

Write skills as lean triggerable instructions, not tutorials or copied global rules.

## Core Principles

- Assume the agent is already capable. Keep only task-specific knowledge.
- Put trigger guidance in the description, not the body.
- Keep `SKILL.md` short. Move detail to `references/`, `scripts/`, or `assets/`.
- Keep each fact in one place.
- Do not copy global rules from `content/base-rules.md` into skills. Reference the global rule only when the skill needs to explain how it applies to this specific task.

## Structure

```text
skill-name/
├── SKILL.md
├── references/   # docs loaded on demand
├── scripts/      # deterministic helpers
└── assets/       # templates or files used in output
```

`SKILL.md` needs:

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
- Prefer short examples over explanation.

## Workflow

1. Collect concrete examples of what the skill must handle.
2. Decide the boundary. One skill should cover one cohesive job.
3. Decide what belongs in `SKILL.md` versus `references/`, `scripts/`, or `assets/`.
4. Write the trigger description.
5. Write the body as a practical workflow.
6. Test the skill on real prompts. Tighten anything it misses or over-explains.

## Anti-Patterns

- Vague descriptions
- Kitchen-sink skills
- Explaining basics the model already knows
- Duplicating guidance across sections
- Copying global rules into a skill
- Putting "when to use" only in the body
