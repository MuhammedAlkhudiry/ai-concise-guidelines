---
name: tdd
description: Test-driven implementation with RED-GREEN-REFACTOR, failing tests first, or requests to write tests before production code.
---

# Test-Driven Development (TDD)

Use strict RED-GREEN-Refactor against verifiable behavior.

## Workflow
1. Define behavior (invariants, contracts, error cases).
2. Write a focused test for one behavior, using `test-writing` to protect a named contract instead of the planned implementation.
3. Confirm it fails for the expected reason (`RED`).
4. Make a focused production change that satisfies the behavior.
5. Confirm the test passes.
6. Refactor for clarity/duplication only; keep behavior unchanged.
7. Repeat for next behavior.

## Rules
- Discover official test commands first (`package.json`, `composer.json`, `Makefile`, `pyproject.toml`).
- Run the most focused target first: file or pattern-level.
- Prefer precise commands over full-suite runs.
- Record command and result at each step.
- If failure reason is unexpected, classify before code changes.

- Never code before a failing test exists for behavior changes, bug fixes, or new features.
- One behavior = one test.
- Focused fixtures and local style.
- No unrelated behavior changes.
- Cover happy path, changed behavior, relevant boundaries/errors, and integration points.
- Finish each TDD loop with passing local-friendly tests and a diff limited to tested behavior.
