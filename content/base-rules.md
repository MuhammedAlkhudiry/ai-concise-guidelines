## Environment

- **SOLO** — Never start dev servers directly; use Solo MCP only, except in a real git worktree where full project setup, direct dev-server runs, and saving any dev URL in `AGENTS.md` are allowed.
- **NO-BUILD** — Never run `build` or build frontend assets. For QA testing, assume dev servers should already be running; if they are not, start them using the allowed project flow or ask the user.
- **HOST-PM** — `npm`/`bun` commands are almost always run on the host, not inside Docker.
- **DDEV-PHP** — Always run Laravel and PHP commands inside `ddev` unless explicitly told not to.
- **SCRIPTING** — For scripting and one-time automation, prefer `bun` and TypeScript by default; use Python only when it is clearly the best tool for the specific task.

## Code Principles

- **CONSISTENCY** — Reuse existing patterns, files, and functions first; avoid new patterns unless approved.
- **SIMPLE** — Simple is absolute in everything: logic, tools, code, structure, and workflow. Fight ruthlessly against creeping or sneaky complexity and keep solutions as simple as they can be.
- **KILL-THE-WRAPPER** — Delete pass-through wrappers, aliases, and helpers unless they protect a real boundary, and do not add tiny helpers or functions that barely abstract anything.
- **COMPATIBILITY** — Prefer the correct change over backward compatibility or artificially small fixes. Keep backward compatibility only for deployed, production, inter-system contracts. If a feature is not deployed, the system is not production, or the change is within one system, make a clean-cut change. For bugs, prefer the smallest correct fix first.
- **BC-ESCALATION** — If keeping backward compatibility adds complexity, explicitly call that out and ask whether a clean-cut change would be acceptable.
- **COMMENTS** — Keep comments tied to current code only; remove stale or removed comments.
- **STRUCTURE** — Confirm the data model before touching data; never assume schema details.
- **QUERY** — Build query strings only with framework/library helpers; never concatenate manually.
- **HOLISTIC** — Before behavior changes, trace callers, consumers, and tests, then update all impacted parts; do not implement directly.
- **TEST-SYNC** — When refactoring app code files, always refactor the related test files too so they stay in sync.

## Communication

- **LANGUAGE** — Write all replies in English unless the user explicitly asks for another language.
- **TRANSLATION** — Translate all user-facing copy naturally and contextually; add missing translations when needed.
- **ASK-WHEN-UNSURE** — If the user's intent, constraints, or the right change are unclear, ask before proceeding instead of guessing.
- **MAKE-SENSE** — When the user says "make sense?", "right?", or asks a "why" question, treat it as uncertainty: make no edits, answer the question directly, and do research first if needed.
- **PLAN-TRACKING** — When the user wants to walk through a plan or group tasks or action items, keep a bold `**Plan**` section that tracks the decisions and conclusions reached in the discussion.
- **GAP-CHECK** — Always raise any bug, risk, inconsistency, dead code, or other issue worth flagging, even if it is unrelated to the task.
- **SHOW-THE-CODE** — Default to code-first replies: show code, diffs, and concrete examples before explanation, always cite the relevant file or code reference, and keep prose brief unless reasoning, tradeoffs, or risks truly matter.

## Verification

- **QUALITY** — Run type-check, lint, format, and relevant tests; fix only task-related issues before finishing.
- **TEST-THRESHOLD** — Do not require new or updated tests for simple non-behavioral changes; keep tests for behavior changes, bug fixes, and new features.
- **CHECKLIST** — Repo-root `CHECKLIST.md` is for stable project-wide verification commands only; never add task-specific checks to it, and update it rarely.
- **PARALLEL** — Always run checks in parallel when the tooling supports it, including running tests with parallel workers by default and running unrelated checks concurrently whenever possible.
- **FIX** — Prefer safe auto-fix commands over read-only checks.
- **DEPLOY-CHECK** — When the user asks "good to deploy?" or equivalent, treat it as a high-scrutiny release-readiness review: think deeply, verify relevant checks and rollout risks, look for anything missed, and do not approve unless it is genuinely ready.
- **FLAKY-TESTS** — When test errors seem random, first suspect a dirty test database or a parallelism issue before deeper debugging.

## Subagents

- **SUBAGENTS** — Prefer spawning subagents when work can be split into sizable independent tasks that run in parallel; do not use them for tightly coupled work or tiny tasks.
- **SUBAGENT-MODELS** — Use smart models for review and `_code-simplifier` work, and use fast or mini models for independent execution tasks and QA.
- **POST-WORK-REVIEW** — After sizable implementation work or finishing a plan, spawn two smart-model subagents in parallel: one to apply `_code-simplifier` and one to review the work; if it involves browser or frontend work, spawn one more fast or mini subagent to QA it with `_playwriter`.

## Repo Context

- **IGNORE-UNRELATED-DIFFS** — Ignore unrelated git diffs or changes completely; do not touch them in any way.
- **AGENTS.md** — In a monorepo, if the work is limited to one repo or package, read its nested `AGENTS.md`; when updating `AGENTS.md`, keep each added point single-point and concise.
- **GUIDELINES-PROJECT** — Shared AI agent rules/skills/config generator repo: `ai-concise-guidelines` is always at `~/PhpstormProjects/ai-concise-guidelines`; from other projects, reference and edit it there.

## Reply Template

Use this reply template and omit sections that do not apply. Never mention the same point twice across sections. If something is already covered in `Answer`, do not repeat it elsewhere.

```md
Minimal real example:
**Answer**
The main fix is correct, but two follow-ups still matter.

**Flag**
The update path still accepts the old payload shape, so one client flow can break until that caller is updated.

**Plan**
- Request shape should be unified across both paths.
- The caller must be updated to match the new shape.

**Next Steps**
The next step is to align the request shape across both paths and update the caller.

Template:
**Answer**
[Direct answer, result, or next action]

**Flag**
[Only when there is any bug, logic risk, dead code, misleading structure, unnecessary complexity, inconsistency, or other issue worth flagging, even if it is unrelated to the task. Keep all such issues here instead of splitting them across multiple sections.]

**Plan**
[Only when the user is walking through a plan or grouping tasks or action items. Use this section to track the decisions, conclusions, and agreed action items reached in the discussion. Do not include `Next Steps` when `Plan` is used.]

**Devil's Advocate**
[Only when a strong counterpoint, failure mode, or opposing case is worth pressure-testing.]

**Next Steps**
[Only when finishing a plan or other significant work and `Plan` is not being used. Mention the next phase or immediate next steps, rollout work, and deployable status only when they still apply.]

**Suggestion**
[Only when there is a high-signal UX/DX suggestion, tool suggestion, workflow improvement, or practical protip that is adjacent to the task but not part of the required work. Do not use this section for obvious implementation steps, expected best practices, or anything directly needed to complete the task.]

**Rethinking Needed**
[Only when progress is stuck or the framing likely needs to change.]
```
