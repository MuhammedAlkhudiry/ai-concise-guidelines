## Critical Rules

- **RE-READ THE REQUEST** — Before responding, re-read the user's request to ensure you're addressing what they actually asked
- **NO SHORTCUTS** — If a task only works via a shortcut/unsafe workaround, STOP and notify the user. Do not proceed without explicit approval.
- **STAY IN SCOPE** — If an error/blocker is outside your task, HALT and report. Do not modify outside scope.
- **TEST ONLY WHAT MATTERS** — Cover critical paths, ignore noise. Tests must be fast, reliable, essential. Useless tests are forbidden.
- **CONSISTENCY FIRST** — Check existing patterns before writing. Extend existing files/functions over creating new. No new patterns without approval.
- **MINIMAL CODE** — Every line must serve a current purpose. No speculative code, no commented-out blocks, no debug prints, no leftover TODOs.
- **NO USELESS VARIABLES** — Never assign a property/method result to a variable just to use it once or twice inline. Access the value directly. Variables are only justified when: the value is reused 3+ times, the expression is complex/expensive, or the variable name adds meaningful clarity the original expression lacks.
    ```
    // BAD — pointless variable used twice
    const user = order.user;
    if (user && user.isActive()) { sendEmail(user); }

    // GOOD — access directly
    if (order.user?.isActive()) { sendEmail(order.user); }
    ```
- **NO USELESS WRAPPERS** — Never create a function that only calls another function. Pass the original function directly or call it inline. Wrappers are only justified when they add parameters, transform data, or combine multiple calls.
    ```
    // BAD — pointless wrapper
    const handleSubmit = () => { mutation.mutate(); };
    <Button onClick={handleSubmit} />

    // GOOD — call directly
    <Button onClick={() => mutation.mutate()} />
    ```
- **NO ORPHANED COMMENTS** — Every comment must describe code that exists directly below/around it. No leftover comments from previous iterations, no comments explaining removed code, no comments referencing what "was" or "used to be". If the code a comment describes is gone or changed, the comment goes too.
- **UNDERSTAND DATA STRUCTURE** — Before working with data, fully understand the related database structure/models. Never assume schema; always confirm.
- **NEVER BUILD QUERY PARAMS MANUALLY** — Use library/framework built-ins: Axios `params` option, PHP `http_build_query()`, URLSearchParams, etc. Never concatenate query strings by hand.
- **TIME IS NOT A VARIABLE** — AI has no time constraints. Time estimates, deadlines, time-based prioritization, and "running out of time" do not apply. Never factor time into decisions. Do complete, thorough work—always.
- **TRANSLATE EVERYTHING** — Every user-facing string must be translated. Provide natural, contextual translations—never literal. If translation is missing from user/context, write it yourself.
- **TASK IS NOT DONE** — Run type-check/lint/format/analysis/relevant-tests. Fix only task-related issues. Task IS NOT DONE until this is complete.
- **THINK HOLISTICALLY** — When changing any behavior (e.g., validation, API params, business logic), ask: *What else does this affect?* Trace the full flow—callers, consumers, tests, related endpoints—and update all impacted areas. Do not change one spot and leave others broken.
  Do not implement directly—use the appropriate skill.
- **PARALLELIZE EXECUTION** — AI can only parallelize with subagents. When todo list has multiple independent tasks, spawn general subagents (with relevant skills loaded) to execute them in parallel. Don't work sequentially on tasks that have no dependencies. Use your judgment:
    - Independent file changes → parallel subagents
    - Frontend + backend for same feature → parallel subagents
    - Tasks with shared state/dependencies → sequential
    - When in doubt, parallelize and coordinate results

---

## Sessions

When work is substantial enough to warrant documentation, create a session folder. User decides, or agent proposes.

**Structure:**
```
docs/ai/sessions/<YYYY-MM-DD>-<slug>/
├── workshop.md     # Exploration, decisions (if workshopped)
├── plan.md         # Implementation plan (if planned)
└── audit.md        # Audit results (if audited)
```

**Rules:**
- **Files as needed** — Only create files when that phase happens.
- **Same folder for continuation** — Multi-day work stays in one session.
- **Keep plan current** — Always ensure `plan.md` is up-to-date: mark completed items as done, note blockers. Plan must reflect actual state.
- **Plans stay high-level** — No detailed code snippets, DB schemas, or specific implementation in plans. General technical approach and architecture notes are fine.

**Session Context (ALL modes/skills):**

Session path is passed explicitly — never scan for "recent" sessions.

When session path is provided:
1. **Read session files** for context:
   - `workshop.md` — Decisions already made
   - `plan.md` — What was planned, current progress
2. **Write to session files** (not just chat):
   - Workshop output → `workshop.md`
   - Plans + progress → `plan.md`
   - Audit results → `audit.md`
3. **Pass session path** when invoking skills or spawning subagents

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

**Format:**
- Sections by domain/bounded context (Orders, Users, Payments, etc.)
- Nested subsections as deep as needed
- One fact per line: `<fact> — <reason/source>` when why matters
- `## History` section at end for tracking changes, migrations, abandoned approaches

**Rule:** If AI can infer it from code, don't add. If user says something important, add it.

**Updating:** Run `/init-knowledge` after significant work or when new business context is discovered.