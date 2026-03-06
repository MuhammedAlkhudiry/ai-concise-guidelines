---
name: project-skill-creation
description: "Create or refresh project-local skills for specific domains in a codebase. Use when a project needs modular AI guidance tied to its own architecture and business logic."
---

# Project Skill Creation

Create focused project-local skills under `.agents/skills/` so agents load only the domain guidance they need.

## Workflow

1. Inspect the codebase and identify cohesive domains, not broad buckets.
2. Decide whether each domain needs a new skill or an update to an existing one.
3. Create or update `.agents/skills/<skill-name>/SKILL.md`.
4. Fill it with project-specific triggers, key files, patterns, tests, and integration points.
5. Remove stale references when code or architecture changed.

## Good Boundaries

Good:

- `authentication`
- `focus-timer`
- `mobile-navigation`

Bad:

- `backend`
- `everything-user-related`

## SKILL.md Shape

Keep project-local skills short and concrete:

- Frontmatter with clear trigger language
- Core concepts for that domain
- Key files or folders
- Patterns and rules
- Testing notes
- Integration points

## Rules

- One skill per cohesive domain.
- Use real project paths and terminology.
- Prefer examples from the current codebase over generic advice.
- Update existing skills instead of creating duplicates.
