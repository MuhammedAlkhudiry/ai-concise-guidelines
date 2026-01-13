# Base Rules

These are global rules that apply to all modes and operations.

---

## Critical Rules

- **NO SHORTCUTS** — If a task only works via a shortcut/unsafe workaround, STOP and notify the user. Do not proceed without explicit approval.
- **STAY IN SCOPE** — If an error/blocker is outside your task, HALT and report. Do not modify outside scope.
- **PROTECT ALL DATA** — Never drop/refresh/truncate/modify the development DB. Use only the testing DB for destructive or large ops.
- **DO NOT CHANGE ENVIRONMENTS WITHOUT PERMISSION** — Any env/container/config change requires explicit user approval.
- **If you are spinning**, pause, summarize options, escalate.
- **TEST ONLY WHAT MATTERS** — Cover critical paths, ignore noise. Tests must be fast, reliable, essential. Useless tests are forbidden.
- **DO NOT write before checking existing patterns.** Consistency is absolute. No new patterns without approval and a migration plan.
- **Add ONLY code that is necessary.** Every line must serve a current purpose. "Nice to have" or speculative code is forbidden. Unused code is forbidden.
- **UNDERSTAND DATA STRUCTURE** — Before working with data, fully understand the related database structure/models. Use available tools: DB access, ddev, tinker, or migrations (migrations can be outdated—verify). Never assume schema; always confirm.
- **PREFER EXTENDING EXISTING** — Extend existing files/functions over creating new. Only create new when no fit exists.
- **NO DEAD CODE** — No commented-out blocks, debug prints, or leftover TODOs.
- **NEVER BUILD QUERY PARAMS MANUALLY** — Use library/framework built-ins: Axios `params` option, PHP `http_build_query()`, URLSearchParams, etc. Never concatenate query strings by hand.

---

## Translations (if project uses i18n)

Every user-facing string must be translated. Provide natural, contextual translations—never literal. If translation is missing from user/context, write it yourself. This rule is absolute.

---

## OpenCode Specific

- **NO SELF-APPROVAL** — You cannot self-approve or self-audit. After implementation, spawn the auditor sub-agent and wait for its verdict. Task is NEVER done without audit approval. If auditor rejects, fix blockers and re-audit.
- **BUILD → EXECUTE** — When build mode, you MUST use the execution skill to implement the plan. Do not implement directly without invoking the execution skill—it handles audit setup and ensures no self-approval.
- **PARALLELIZE EXECUTION** — When todo list has multiple independent tasks, spawn subagents to execute them in parallel. Don't work sequentially on tasks that have no dependencies. Use your judgment:
  - Independent file changes → parallel
  - Frontend + backend for same feature → parallel
  - Tasks with shared state/dependencies → sequential
  - When in doubt, parallelize and coordinate results

---

## Sessions

When work is substantial enough to warrant documentation, create a session folder. User decides, or agent proposes.

**Structure:**
```
docs/ai/sessions/<YYYY-MM-DD>-<slug>/
├── README.md       # Context, status, related sessions
├── workshop.md     # Exploration, decisions (if workshopped)
├── plan.md         # Implementation plan (if planned)
├── state.md        # Execution progress, blockers
├── audit.md        # Audit results (if audited)
└── learnings.md    # Retrospective, next steps, future work
```

**Rules:**
- **README.md first** — Always create this. It's the entry point.
- **Files as needed** — Only create files when that phase happens.
- **Same folder for continuation** — Multi-day work stays in one session. Update README status.
- **Link related sessions** — Note connections in README.

**Session Context (ALL modes/skills):**

Session path is passed explicitly — never scan for "recent" sessions.

When session path is provided:
1. **Read session files** for context:
   - `README.md` — What this session is about
   - `workshop.md` — Decisions already made
   - `plan.md` — What was planned
   - `state.md` — Current progress, blockers
2. **Write to session files** (not just chat):
   - Workshop output → `workshop.md`
   - Plans → `plan.md`
   - Progress/blockers → `state.md`
   - Audit results → `audit.md`
   - Retrospective → `learnings.md`
3. **Update README status** — Keep session status current
4. **Pass session path** when invoking skills or spawning subagents

---

## Knowledge

Project knowledge lives in `docs/ai/knowledge/`. Use the `knowledge-extract` skill to extract learnings from sessions.

**Structure:**
```
docs/ai/knowledge/
├── knowledge.md          # Global project knowledge
└── <domain>/
    └── knowledge.md      # Domain-specific (created as needed)
```

Domains are project-specific — create folders based on your codebase (e.g., `auth/`, `billing/`, `api/`). Don't pre-create empty folders.

**What IS knowledge** (add this):
- WHY decisions were made
- Constraints (legal, client, external)
- History (we tried X, failed because Y)
- Gotchas not obvious from code
- External context

**What is NOT knowledge** (don't add):
- Config values, schema, API signatures
- How code works (AI can read code)
- Patterns already visible in codebase

**Rule:** If AI can infer it from code, don't add to knowledge.

**Bubble-up to AGENTS.md:** When a pattern is critical enough to affect ALL AI interactions (not just this project), suggest adding to AGENTS.md. User must approve.

---

## After-Task Checklist

Run type-check/lint/format/analysis/relevant-tests. Fix only task-related issues. Task IS NOT DONE until you do this.

**Think holistically:**  
When changing any behavior (e.g., validation, API params, business logic), ask: *What else does this affect?* Trace the full flow—callers, consumers, tests, related endpoints—and update all impacted areas. Do not change one spot and leave others broken.

**Use project's container prefix:** `ddev exec`, `docker compose exec app`, etc.

**Examples:**
- `ddev composer test && ddev exec vendor/bin/phpstan analyse`
- `docker compose exec frontend pnpm typecheck && pnpm lint`
