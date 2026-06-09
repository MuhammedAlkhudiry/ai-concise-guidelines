---
name: code-quality-review
description: Strict maintainability review for abstraction quality, structural simplification, file sprawl, condition complexity, code quality review, deep audit, harsh review, or structural review.
---

# Code Quality Review

Run a strict maintainability review. Look for "code judo" moves: behavior-preserving restructures that make the implementation simpler, smaller, more direct, and easier to reason about.

## Workflow

1. Inspect the current branch diff, touched files, callers, tests, and ownership boundaries.
2. Find structural regressions before local cleanup issues.
3. Push for simpler models, clearer ownership, fewer branches, and fewer layers.
4. Prioritize high-conviction findings over cosmetic nits.
5. Do not approve just because behavior works.

## Standards

- Be ambitious about structural simplification. Look for ways to delete branches, helpers, modes, conditionals, wrappers, or layers.
- Treat a file crossing 1000 lines because of the diff as a strong smell.
- Call out ad-hoc conditionals, scattered special cases, one-off flags, nullable modes, and branching in unrelated flows.
- Prefer direct, boring, maintainable code over hacky, magical, or overly generic mechanisms.
- Flag thin abstractions, identity wrappers, pass-through helpers, casts, `any`, `unknown`, and optionality that obscure the real contract.
- Push logic into the canonical layer and reuse existing helpers instead of accepting architectural drift.
- Treat unnecessary sequential orchestration and non-atomic updates as design smells.

## Flag

- Complicated implementations where a cleaner reframing could delete complexity.
- Refactors that move complexity around without reducing the reader's mental model.
- Files pushed past 1000 lines by the diff.
- Special-case branches bolted into busy flows.
- Feature-specific logic leaking into general-purpose modules.
- Magic handling that hides simple data-shape assumptions.
- Duplicate helpers, wrong-layer logic, cast-heavy contracts, and optional-heavy contracts.
- Partial updates or serialized async work that make the flow harder to reason about.

## Remedies

- Delete unnecessary indirection, reframe state so conditionals disappear, move logic to the owner, turn special cases into the default flow, extract only when it removes real complexity, replace condition chains with typed models or dispatchers, collapse duplicate branches, and parallelize independent work when that simplifies orchestration.

## Output

Prioritize structural regressions, missed simplifications, spaghetti branching, boundary problems, file-size concerns, ownership issues, and maintainability concerns. Use a small number of direct, actionable findings. Treat major structural issues as blockers unless justified clearly.
