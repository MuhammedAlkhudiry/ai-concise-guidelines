---
name: tdd
description: Test-driven implementation with RED-GREEN-REFACTOR, failing tests first, or requests to write tests before production code.
---

# Test-Driven Development (TDD)

Use strict RED-GREEN-Refactor against verifiable behavior.

## Workflow
1. Define behavior (invariants, contracts, error cases).
2. Write the smallest test for one behavior.
3. Confirm it fails for the expected reason (`RED`).
4. Make the minimal production change.
5. Confirm the test passes.
6. Refactor for clarity/duplication only; keep behavior unchanged.
7. Repeat for next behavior.

## Rules
- Discover official test commands first (`package.json`, `composer.json`, `Makefile`, `pyproject.toml`).
- Run the smallest target first: file or pattern-level.
- Prefer precise commands over full-suite runs.
- Record command and result at each step.
- If failure reason is unexpected, classify before code changes.

- Never code before a failing test exists for behavior changes, bug fixes, or new features.
- One behavior = one test.
- Minimal fixtures and local style.
- No unrelated behavior changes.
- Cover happy path, changed behavior, relevant boundaries/errors, and integration points.
- Finish each TDD loop with passing local-friendly tests and a diff limited to tested behavior.
