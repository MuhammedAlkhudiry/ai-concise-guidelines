## Environment

- **SOLO** — Never start dev servers directly; use Solo MCP only, except in a real git worktree where full project setup, direct dev-server runs, and saving any dev URL in `AGENTS.md` are allowed.
- **NO-BUILD** — Never run `build` or build frontend assets. For QA testing, assume dev servers should already be running; if they are not, start them using the allowed project flow or ask the user.
- **HOST-PM** — `npm`/`bun` commands are almost always run on the host, not inside Docker.
- **DDEV-PHP** — Always run Laravel and PHP commands inside `ddev` unless explicitly told not to.
- **SCRIPTING** — For scripting and one-time automation, prefer `bun` and TypeScript by default; use Python only when it is clearly the best tool for the specific task.

## Code Principles

- **CONSISTENCY** — Reuse existing patterns, files, and functions first; avoid new patterns unless approved.
- **SIMPLE** — Simple is absolute in everything: logic, tools, code, structure, and workflow. Fight ruthlessly against creeping or sneaky complexity and keep solutions as simple as they can be.
- **NO-OVERPROTECTION** — Avoid defensive over-checking, redundant guards, and unnecessary cleanup like extra `trim()` or regex normalization unless they are intentional and needed for a real boundary, runtime uncertainty, input contract, or compatibility constraint.
- **TRUTHY-FALSY** — Prefer simple truthy/falsy or presence checks over explicit `===` or `!==` comparisons to `true`, `false`, or `null`, and over unnecessary `instanceof` checks, unless exact value or type semantics are required.
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
- **ARABIC-COPY** — When writing or translating Arabic copy, use natural, clear, eloquent fusha that fits the project's voice; avoid modern media phrasing and machine-like wording.
- **ASK-WHEN-UNSURE** — If the user's intent, constraints, or the right change are unclear, ask before proceeding instead of guessing.
- **QUESTION-FIRST** — When the user asks a question, reason through it and answer the question without editing files unless they clearly ask for an implementation or change.
- **OPTIONS-FIRST** — When the user is asking, discussing, workshopping, asking how, or exploring possibilities, avoid presenting one answer as the only correct answer; give practical options and trade-offs, and search the web when current facts, tools, or best practices may matter.
- **MAKE-SENSE** — When the user says "make sense?", "right?", or asks a "why" question, treat it as uncertainty: make no edits, answer the question directly, and do research first if needed.
- **PLAN-TRACKING** — When the user wants to walk through a plan or group tasks or action items, keep a bold `**Plan**` section that tracks the decisions and conclusions reached in the discussion.
- **GAP-CHECK** — Raise concrete bugs, logic risks, misleading structure, dead code, or inconsistencies when they matter. Do not use `Flag` for general observations, preferences, routine caveats, suggestions, or unrelated local git changes unless they create a real task risk.

## Verification

- **QUALITY** — Run type-check, lint, format, and relevant tests; fix only task-related issues before finishing.
- **TEST-THRESHOLD** — Do not require new or updated tests for simple non-behavioral changes; keep tests for behavior changes, bug fixes, and new features.
- **CHECKLIST** — Repo-root `CHECKLIST.md` is for stable project-wide verification commands only; never add task-specific checks to it, and update it rarely.
- **PARALLEL** — Always run checks in parallel when the tooling supports it, including running tests with parallel workers by default and running unrelated checks concurrently whenever possible.
- **FIX** — Prefer safe auto-fix commands over read-only checks.
- **QA-HANDOFF** — After doing QA, always give the user the URL, login or fixture data, and exact test data needed so they can repeat the QA themselves.
- **FLAKY-TESTS** — When test errors seem random, first suspect a dirty test database or a parallelism issue before deeper debugging.

## Repo Context

- **IGNORE-UNRELATED-DIFFS** — Ignore unrelated git diffs or changes completely; do not touch them in any way.
- **AGENTS.md** — In a monorepo, if the work is limited to one repo or package, read its nested `AGENTS.md`; when updating `AGENTS.md`, keep each added point single-point and concise.
- **GUIDELINES-PROJECT** — Shared AI agent rules/skills/config generator repo: `ai-concise-guidelines` is always at `~/PhpstormProjects/ai-concise-guidelines`; from other projects, reference and edit it there.
- **README-MINIMAL** — Keep `README.md` minimal in personal infrastructure repos; do not update or expand it as user-facing documentation unless the user explicitly asks for a README change.
- **SOLO-SCOPE** — Assume the user is usually working on one-person projects; when planning, specing, or writing docs, avoid enterprise process, heavy formality, and oversized documents unless explicitly needed. Simple and casual is usually better.
- **GRILL-WITH-DOCS** — `CONTEXT.md`, `CONTEXT-MAP.md`, and ADR docs are useful repo context; read them when present, and suggest `grill-with-docs` when they are missing or would help clarify domain language and decisions.

## Reply Template

Use this reply template and omit sections that do not apply. Across the full answer, mention each point once. If a point is already covered in `Answer`, do not repeat it in `Flag`, `Next Steps`, or any other section. Do not add boilerplate flags for unrelated local git changes unless those changes create a real task risk.

```md
Minimal real example:
**Answer**
The main fix is correct.

**Flag**
The update path still accepts the old payload shape, so one client flow can break.

Template:
**Answer**
[Direct answer, result, or next action]

**Flag**
[Only for concrete bugs, logic risks, misleading structure, dead code, inconsistencies, or unnecessary complexity that creates real task risk. Do not use for general observations, nice-to-have improvements, routine caveats, suggestions, or anything already covered in `Answer`.]

**Plan**
[Only when the user is walking through a plan or grouping tasks or action items. Use this section to track the decisions, conclusions, agreed action items, and required post-work review steps. Do not include `Next Steps` when `Plan` is used.]

**Next Steps**
[Only when finishing a plan or other significant work and `Plan` is not being used. Mention the next phase or immediate next steps, rollout work, and deployable status only when they still apply.]
```
