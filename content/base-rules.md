## Critical Rules

- **SOLO FOR DEV SERVERS ONLY** — NEVER EVER start development servers directly. Use the Solo MCP only for dev server management. When you obtain a dev server URL, save it in the project `AGENTS.md` file.
- **CONSISTENCY FIRST** — Check existing patterns before writing. Extend existing files/functions over creating new. No new patterns without approval.
- **PREFER UPDATES TO BACKWARD COMPATIBILITY** — Default to updating code directly instead of patching or supporting "old + new" paths in parallel. Add backward compatibility only when a change would clearly break an inter-system API contract (for example backend ↔ frontend). For in-system changes, always update directly and do not add BC layers. If the user says the environment is not production, never implement BC.
- **NO ORPHANED COMMENTS** — Every comment must describe code that exists directly below/around it. No leftover comments from previous iterations, no comments explaining removed code, no comments referencing what "was" or "used to be". If the code a comment describes is gone or changed, the comment goes too.
- **UNDERSTAND DATA STRUCTURE** — Before working with data, fully understand the related database structure/models. Never assume schema; always confirm.
- **NEVER BUILD QUERY PARAMS MANUALLY** — Use library/framework built-ins: Axios `params` option, PHP `http_build_query()`, URLSearchParams, etc. Never concatenate query strings by hand.
- **TRANSLATE EVERYTHING** — Every user-facing string must be translated. Provide natural, contextual translations—never literal. If translation is missing from user/context, write it yourself.
- **TASK IS NOT DONE** — Run type-check/lint/format/analysis/relevant-tests. Fix only task-related issues. Task IS NOT DONE until this is complete.
- **ALWAYS RUN CHECKS AND TESTS IN PARALLEL** — Run checks concurrently whenever possible: parallelize test cases within a test run (e.g., `phpunit --parallel`, `vitest --parallel`), and run unrelated checks together (for example, type-check and tests at the same time).
- **PREFER FIX COMMANDS OVER CHECK COMMANDS** — If a check has a safe auto-fix mode, run the fix command directly (for example, `format` instead of format-check mode).
- **THINK HOLISTICALLY** — When changing any behavior (e.g., validation, API params, business logic), ask: *What else does this affect?* Trace the full flow—callers, consumers, tests, related endpoints—and update all impacted areas. Do not change one spot and leave others broken.
  Do not implement directly—use the appropriate skill.
- **PARALLELIZE EXECUTION** — AI can only parallelize with subagents. When todo list has multiple independent tasks, spawn general subagents (with relevant skills loaded) to execute them in parallel. Don't work sequentially on tasks that have no dependencies. Use your judgment:
    - Independent file changes → parallel subagents
    - Frontend + backend for same feature → parallel subagents
    - Tasks with shared state/dependencies → sequential
    - When in doubt, parallelize and coordinate results

---

## Project Documents

Two optional documents at project root provide high-level context:

| Document | Purpose | What it contains |
|----------|---------|-----------------|
| `KNOWLEDGE.md` | What IS — project context | Business rules, decisions, constraints, terminology, gotchas |

`KNOWLEDGE.md` is descriptive (present/past).

---

## Knowledge

Project knowledge lives in `KNOWLEDGE.md` at project root. Use `/init-knowledge` to create or update.

**Purpose:** Distilled project overview for fast AI context loading — everything a senior developer would know.

**What belongs here:**
- Business rules and why they exist
- Domain terminology (what terms mean in THIS project)
- Constraints (legal, client, compliance, technical)
- Decisions made and why (especially verbal ones not in code)
- Gotchas and edge cases not obvious from code
- External system quirks and integration details
- Things user says that affect implementation
- History: what was tried, changed, or abandoned and why

**What does NOT belong:**
- Anything readable from code (schemas, API signatures, config values)
- Implementation details (AI can read the code)
- Obvious patterns already in codebase
- Code snippets — only `[file:line]` or `[path:line-line]` references allowed when needed
- Future plans or roadmap (not included in this file)

**Format:**
- Sections by domain/bounded context (Orders, Users, Payments, etc.)
- Nested subsections as deep as needed
- One fact per line: `<fact> — <reason/source>` when why matters
- `## History` section at end for tracking changes, migrations, abandoned approaches

**Rule:** If AI can infer it from code, don't add. If user says something important, add it.

**Updating:** Run `/init-knowledge` after significant work or when new business context is discovered.

