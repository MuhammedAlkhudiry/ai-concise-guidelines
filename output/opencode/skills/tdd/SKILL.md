---
name: tdd
description: "Apply test-driven development for implementation work. Use when user wants RED-GREEN-REFACTOR flow, asks for failing tests first, or asks to implement by writing tests before code."
---

# Test-Driven Development (TDD)

Use strict RED→GREEN→Refactor. Work only against verifiable behavior.

## Scope
- Use for behavior changes, bug fixes, and new features with acceptance criteria.
- Skip for docs-only work and exploratory experiments.

## Workflow
1. Define behavior (invariants, contracts, error cases).
2. Write the smallest test for one behavior.
3. Confirm it fails for the expected reason (`RED`).
4. Make the minimal production change.
5. Confirm the test passes (`GREEN`).
6. Refactor for clarity/duplication only; keep behavior unchanged.
7. Repeat for next behavior.

## Execution Rules
- Discover official test commands first (`package.json`, `composer.json`, `Makefile`, `pyproject.toml`).
- Run the smallest target first: file or pattern-level.
- Prefer precise commands over full-suite runs.
- Record command + result at each step.
- If failure reason is unexpected, classify before code changes.

## Non-Negotiables
- Never code before a failing test exists.
- One behavior = one test.
- Minimal fixtures and local style.
- No unrelated behavior changes.
- Stop each behavioral batch with a verification artifact (`command` + `result`).

## Coverage Checklist (per behavior)
- Happy path and core flow covered.
- Modified behavior and error path tested.
- Boundary / empty / null / invalid / error cases covered where relevant.
- Regression test added for bug fixes.
- Integration points validated (API, DB, external services, auth/error responses).
- Tests are deterministic, independent, and readable (AAA + meaningful assertions).

## Exit Criteria
- New behavior has at least one passing regression test.
- Tests are stable and local-friendly.
- Existing behavior remains protected by tests.
- Final diff only reflects behavior from the test set.
