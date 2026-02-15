---
name: init-patterns
description: "Initialize or update CODE_PATTERNS.md with project-specific code templates discovered from the current codebase. Use when user says 'init patterns', 'create code patterns', or 'update templates'."
---

# Init Patterns

Initialize or update `CODE_PATTERNS.md` at project root.

## What CODE_PATTERNS.md Is

The **project-specific coding template file** - practical examples for how key file types should be written in the current repository.

**Contains:**
- Copy-ready templates for common file types
- Naming and placement conventions
- Concise implementation notes per template
- Project-specific style patterns derived from existing code

**Does NOT contain:**
- Business/domain context (`KNOWLEDGE.md`)
- Product roadmap or future planning (`PRD.md`)
- Unified cross-project boilerplate
- Long essays, design rationale, or speculative alternatives

## Companion Documents

- `KNOWLEDGE.md` = what IS true about the business and system
- `PRD.md` = what WILL BE built next
- `CODE_PATTERNS.md` = how code should be written in practice

Use `init-knowledge` and `init-prd` when those documents need updates.

## Required Coverage

Treat the following as examples, not a closed list:
- Controller
- Model
- Resource
- Service
- Action
- Job
- UI component
- `page.tsx`
- Helpers
- Test files (backend + frontend where applicable)

When creating/updating `CODE_PATTERNS.md`, include:
- Any of the example types that actually exist in this project
- Any additional recurring file types that exist in this project
- Framework-specific types only if they are present
- Test patterns if tests exist

Each template must include concise notes (2-4 bullets).

## Format

````markdown
# CODE_PATTERNS

## <Area>

### <File type> (`<path pattern>`)
```<language>
<template>
```

Notes:
- <concise rule>
- <concise rule>
````

## Process

### Step 1: Gather Existing Patterns

Explore the codebase for real patterns before writing templates:
- File locations and naming conventions
- Dependency injection and composition style
- Validation, serialization, and test style
- Repeated helper and utility patterns
- What file types exist vs do not exist in this project

### Step 2: Synthesize Canonical Templates

For each required file type:
1. Extract the dominant style
2. Create one canonical template
3. Add concise notes that explain intent and guardrails

Never invent framework patterns that are absent from the repository.

### Step 3: Write or Merge

**If `CODE_PATTERNS.md` exists:**
1. Read existing content
2. Merge new templates and remove duplicates
3. Update outdated examples to match current style

**If `CODE_PATTERNS.md` does not exist:**
1. Create it with required coverage
2. Organize by the project's actual areas (for example backend/frontend/docs/scripts)

## Rules

- **Just do it** - no approval needed, write directly
- **Pattern first** - mirror existing project conventions before inventing
- **Project-specific only** - no unified templates copied from other projects
- **Examples are not exhaustive** - document all recurring local file types, not only the sample list
- **Concise notes** - short, actionable bullets only
- **One canonical template per type** - avoid multiple competing variants
- **Keep it maintainable** - update templates when conventions change
