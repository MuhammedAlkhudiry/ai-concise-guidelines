---
name: init-knowledge
description: "Initialize or update KNOWLEDGE.md with project business context. Use when user says 'init knowledge', 'create knowledge file', 'update knowledge', or wants to capture project context for AI."
---

# Init Knowledge

Initialize or update `KNOWLEDGE.md` at project root.

## What KNOWLEDGE.md Is

The **distilled project overview** — everything important about the project in one dense file. This is what a senior developer would know after months on the project, compressed for fast AI context loading.

**Contains:**
- Business rules and constraints
- Domain terminology and what terms mean in THIS project
- How systems work and integrate
- Why decisions were made
- External dependencies and their quirks
- Edge cases and gotchas
- What was tried and abandoned

**Does NOT contain:**
- Future plans, roadmap, or feature ideas (that belongs in `PRD.md`)
- Anything readable from code

## Companion: PRD.md

If the project has a product roadmap or feature backlog, it belongs in `PRD.md` — not KNOWLEDGE.md. Use the `init-prd` skill to create it through structured questioning.

When running init-knowledge, if no `PRD.md` exists and the user mentions future plans or roadmap items, suggest running `init-prd` to create one properly.

## Format

```
# KNOWLEDGE

## <Domain>

### <Subsection>
- <fact> — <reason/source>
- <fact>

### <Subsection>
- <fact>

## <Another Domain>
...

## History
- **<YYYY-MM>**: <what changed/was tried> — <why/outcome>
```

- Sections = bounded contexts (Orders, Users, Inventory, etc.)
- Nest as deep as needed
- One fact per line
- `— <reason>` only when why isn't obvious

## Process

### Step 1: Spawn Explore Agents

Release a swarm of `explore` sub-agents to gather knowledge in parallel:

| Agent | Task |
|-------|------|
| Architecture | Explore project structure, folder layout, entry points |
| Backend | Explore backend: routes, controllers, services, models, middleware |
| Frontend | Explore frontend: components, pages, state management, routing |
| Database | Explore database: migrations, models, relationships, constraints |
| Config | Explore configs: env files, package.json, composer.json, build configs |
| External | Explore external integrations: APIs, webhooks, third-party services |

Spawn agents with prompts like:
```
Explore the [area] of this codebase. Return:
- Key patterns and conventions used
- Important files and their purposes
- Business logic and domain concepts
- Gotchas or non-obvious behavior
- Any hardcoded values or magic numbers that encode business rules
```

### Step 2: Collect and Synthesize

Wait for all explore agents to return. Collect their findings.

### Step 3: Write KNOWLEDGE.md

**If KNOWLEDGE.md exists:**
1. Read existing content
2. Merge new findings (don't duplicate)
3. Update outdated entries
4. Write updated file

**If KNOWLEDGE.md doesn't exist:**
1. Create file with synthesized findings
2. Organize by domain/bounded context

## Rules

- **Just do it** — no approval needed, write directly
- **Dense, not verbose** — one fact per line, no prose
- **Capture verbal context** — if user mentions business rules, add them
- **Nest as needed** — no forced structure, let content dictate depth
- **Merge, don't duplicate** — update existing entries
- **Parallelize** — spawn explore agents concurrently for speed
- **Suggest PRD.md** — if user mentions future plans and no PRD.md exists, suggest they create one
