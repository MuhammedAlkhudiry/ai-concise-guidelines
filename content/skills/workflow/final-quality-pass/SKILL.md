---
name: final-quality-pass
description: Strict final quality gate after implementation, bug fixes, refactors, branch syncs, conflict resolution, PR prep, or "make it ready" prompts, using read-only Codex review threads, main-agent-only edits, diff inventory, simplification, maintainability, coverage, checks, and remaining risk.
---

# Final Quality Pass

Prove the current diff is ready, or report exactly what prevents completion. This is not a changelog and must not collapse into check-running.
Follow [references/final-gate.md](references/final-gate.md) for the full protocol.

## Start

- Default to the current PR or `git diff` unless the user names a narrower target.
- Start with a diff inventory: comparison target, changed file count, touched apps or layers, behavior areas, and risky surfaces.
- Keep the pass focused on the current task and directly affected code. Do not widen into unrelated cleanup.

## Codex Review Threads

- Use a solo pass only for small, single-surface diffs.
- For large or cross-surface diffs, this skill is explicit authorization to create one read-only Codex thread per lane when thread tools are available; otherwise use read-only subagents.
- Required lanes: code simplifier, code quality review, test coverage audit, refactor opportunities, and check discovery.
- Review lanes must inspect deeply and return large structured feedback: files, flows, findings, severity, required fixes, optional follow-ups, tests/checks, and explicit no-findings statements.
- If a required lane returns empty, vague, errored, or unusable output, rerun once narrower; if still unusable, disclose that missing lane output with the reason.

## Workflow

1. Inventory the diff and choose solo or review-lane mode.
2. Launch required read-only Codex review threads or fallback subagents when the surface requires them.
3. Aggregate all feedback, dedupe it, reject weak findings, and create a step-by-step plan.
4. Main agent applies accepted `code-simplifier` changes.
5. Main agent presents `code-quality-review` findings unless a blocker is clearly in scope.
6. Main agent applies accepted `test-coverage-audit` test changes.
7. Main agent presents `refactor-opportunities` findings without implementing them.
8. Main agent runs `check-and-fix` until all relevant checks pass or the exact blocker is reported.

## Lane Output

- The main final answer must include every lane's full output.
- Include the Codex thread id for each lane output.
- If output is too large, include a faithful full-section synthesis with all findings, files, risks, checks, and recommendations.
- Do not replace lane output with a short summary.

## Rules

- Only the current main Codex thread/main agent may edit files, run mutating commands, refresh databases, or run fix loops.
- Implement only fixes that belong to simplification, coverage gaps, structural blockers, or task-related check failures.
- Leave optional refactors as recommendations unless the user explicitly asks to do them.
- Do not call a large or cross-surface review complete when required review evidence is missing or relevant checks do not pass.
- Final output must include scope, full lane outputs, aggregation plan, main-thread changes, checks, and remaining risk.
