## Critical

- **SIMPLE** — Simple is absolute in everything: logic, tools, code, structure, and workflow. Fight ruthlessly against creeping or sneaky complexity and keep solutions as simple as they can be.
- **CONSISTENCY** — Reuse existing patterns, files, and functions first; avoid new patterns unless approved.
- **HOLISTIC** — Before behavior changes, trace callers, consumers, and tests, then update all impacted parts; do not implement directly.
- **MINIMAL** — Implement the leanest change that fully solves the request. Do not add extras, nice-to-haves, broaden scope, or build speculative future-proofing.

## Environment

- **SOLO** — Never start dev servers directly; use the Solo CLI first and Solo HTTP API only as a fallback for dev servers and process logs, except inside a real git worktree during its explicit
  setup phase.
- **WORKTREE-SETUP-GATE** — Apply repo-local worktree setup only during the explicit Codex/local-environment setup phase for secondary worktrees, never during normal product work and never in the
  canonical checkout. Before coding, checking, QA, or product work in a secondary worktree, require `.codex/worktree-ready.json` with `READY`. After `READY`, do not touch DDEV setup, `.env`, installs,
  migrations, seeders, Vite startup, storage/search setup, setup scripts, or readiness repair; stop with `WORKTREE_NOT_READY` if readiness is missing.
- **BUILD-CLEANUP** — Run builds only when they are the right verification step, and clean up any generated or compiled files they leave behind before finishing unless those files are intentional
  tracked outputs.
- **HOST-PM** — `npm`/`bun` commands are always run on the host, not inside Docker.
- **DDEV-PHP** — Always run Laravel and PHP commands inside `ddev` unless explicitly told not to.
- **SCRIPTING** — For scripting and one-time automation, prefer `bun` and TypeScript by default; use Python only when it is clearly the better tool for the
  task.

## Code Principles

- **NO-OVERPROTECTION** — Avoid defensive over-checking, redundant guards, and unnecessary cleanup like extra `trim()` or regex normalization unless they are intentional and needed for a real
  boundary, runtime uncertainty, input contract, or compatibility constraint.
- **TRUTHY-FALSY** — Prefer simple truthy/falsy or presence checks over explicit `===` or `!==` comparisons to `true`, `false`, or `null`, and over unnecessary `instanceof` checks, unless exact
  value or type semantics are required.
- **HELPER-REUSE** — When a helper seems needed, search for an existing helper, function, or local pattern first; reuse it if it fits, and add a new helper only when it creates a real boundary or
  removes real duplication.
- **KILL-THE-WRAPPER** — Delete pass-through wrappers, aliases, and helpers unless they protect a real boundary, and do not add tiny helpers or functions that barely abstract anything.
- **COMPATIBILITY** — Prefer the correct change over backward compatibility or artificially small fixes. Keep backward compatibility only for deployed, production, inter-system contracts. If a
  feature is not deployed, the system is not production, or the change is within one system, make a clean-cut change. For bugs, prefer the smallest correct fix first.
- **BC-ESCALATION** — If keeping backward compatibility adds complexity, explicitly call that out and ask whether a clean-cut change would be acceptable.
- **STRUCTURE** — Confirm the data model before touching data; never assume schema details.

## Repo Context

- **IGNORE-UNRELATED-DIFFS** — Ignore unrelated git diffs or changes completely; do not touch them in any way.
- **GUIDELINES-PROJECT** — Shared AI agent rules/skills/config generator repo: `my-setup` is always at `~/PhpstormProjects/my-setup`; from other projects, reference and edit it there.
- **SOLO-SCOPE** — Assume the user is usually working on one-person projects; when planning, specing, or writing docs, avoid enterprise process, heavy formality, and oversized documents unless
  explicitly needed. Simple and casual is usually better.

## Reply Behavior

Write all replies in English.

When the user asks a question, discusses, workshops, asks why, or checks whether something makes sense, answer first and do not edit code unless they explicitly ask for an implementation or change. 
If intent, constraints, or the right change are unclear, ask before guessing.

When discussing options, weigh practical solutions and trade-offs. Do not present only one solution unless there is clearly no reasonable alternative. 
Search the web when current facts, tools, or best practices may matter.

Use `Flag` only for concrete bugs, logic risks, misleading structure, dead code, inconsistencies, or unnecessary complexity that creates real task risk.

## Reply Template

Use this reply template and omit sections that do not apply. In `Answer [emoji mode]`, replace `emoji mode` with an emoji plus the active mode. Possible mode values are `discuss`, `plan`, `teach`,
`workshop`, `tweak-ui`, and `execute`. Across the full answer, mention each point once. If a point is already covered in `Answer`, do not repeat it in `Flag`, `Next Steps`, or any other section. Do
not add boilerplate flags for unrelated local git changes unless those changes create a real task risk.

```md
Minimal real example:
**Answer [🔧 execute]**
The main fix is correct.

**Flag**
The update path still accepts the old payload shape, so one client flow can break.

Template:
**Answer [emoji mode]**
[Direct answer, result, or next action]

**Flag**
[Only for concrete bugs, logic risks, misleading structure, dead code, inconsistencies, or unnecessary
complexity that creates real task risk. Do not use for general observations, nice-to-have improvements,
routine caveats, suggestions, or anything already covered in `Answer`.]

**Plan**
[Only when the user is walking through a plan or grouping tasks or action items. Use exactly three subsections:
`Implementation Steps` for decisions, conclusions, and agreed action items, `Verification Steps` for required
checks and post-work review, and `QA Steps` for manual QA paths and repeatable test data. Do not include
`Next Steps` when `Plan` is used.]

Implementation Steps:
[Committed implementation actions.]

Verification Steps:
[Required checks and post-work review.]

QA Steps:
[Manual QA paths and repeatable test data.]

**Next Steps**
[Only when finishing a plan or other significant work and `Plan` is not being used. Mention the next phase
or immediate next steps, rollout work, and deployable status only when they still apply.]
```
