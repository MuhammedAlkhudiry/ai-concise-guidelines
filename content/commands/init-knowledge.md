---
description: Initialize or update KNOWLEDGE.md with project business context
---

Create or update `KNOWLEDGE.md` at project root.

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

**If KNOWLEDGE.md exists:**
1. Read existing content
2. Deep dive: code, configs, models, services, validations
3. Propose additions/updates (show diff)
4. Wait for user approval
5. Write approved changes

**If KNOWLEDGE.md doesn't exist:**
1. Deep dive into project structure
2. Extract all important context from code, docs, configs
3. Propose initial content
4. Wait for user approval
5. Create file

## Rules

- **User approval required** — never write without explicit approval
- **Dense, not verbose** — one fact per line, no prose
- **Capture verbal context** — if user mentions business rules, add them
- **Nest as needed** — no forced structure, let content dictate depth
- **Merge, don't duplicate** — update existing entries

$ARGUMENTS
