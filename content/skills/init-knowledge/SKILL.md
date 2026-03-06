---
name: init-knowledge
description: "Create or update `KNOWLEDGE.md` with business context, decisions, terminology, and project constraints."
---

# Init Knowledge

Maintain `KNOWLEDGE.md` as the dense project memory file.

## What Belongs There

- Business rules and constraints
- Domain terminology
- System boundaries and integrations
- Decisions and why they matter
- External dependencies and quirks
- Gotchas, edge cases, and abandoned approaches

Do not copy code structure that is already obvious from the repo.

## Format

Use bounded sections with short factual bullets:

```markdown
# KNOWLEDGE

## Domain
### Subsection
- Fact
- Fact — why it matters

## History
- **YYYY-MM**: Decision or change — outcome
```

## Workflow

1. Inspect the codebase, configs, docs, and user-provided context.
2. Group findings by domain.
3. Merge with existing `KNOWLEDGE.md` instead of duplicating.
4. Remove stale entries when the current code contradicts them.

## Rules

- Keep it dense, not narrative.
- One fact per line.
- Prefer business meaning over implementation trivia.
- Update it whenever new durable project knowledge is discovered.
