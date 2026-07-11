---
name: code-review
description: Diff-based code review against a fixed point, branch, PR, or work-in-progress change, with separate Standards and Spec axes.
---

Review the diff between `HEAD` and a fixed point along two independent axes.

- `Standards`: whether the change follows documented repo conventions and the structural smell baseline.
- `Spec`: whether the change implements the requested issue, PRD, plan, or spec without missing requirements or scope creep.

## Workflow

1. Pin the fixed point.
   If the user supplied a commit, branch, tag, or expression such as `main` or `HEAD~5`, use it.
   If no fixed point is supplied, use the best repo-local default such as the base branch or current `git diff`; ask only when the base cannot be inferred safely.
2. Resolve the fixed point and confirm there is a non-empty diff.
   Use `git diff <fixed-point>...HEAD` for branch-style comparisons.
   Use the current unstaged/staged diff when reviewing local work without a fixed point.
3. Capture the commit list with `git log <fixed-point>..HEAD --oneline` when a fixed point exists.
4. Identify the spec source from user-provided paths, commit messages, issue or PR references, branch names, local plans, PRDs, docs, specs, or project task files.
   Use available issue, PR, or project-management tools when the reference points outside the repo.
   If no spec exists, skip the Spec axis and say `No spec available`.
5. Identify standards sources such as agent instructions, `AGENTS.md`, `CONTRIBUTING.md`, `CODING_STANDARDS.md`, style guides, framework conventions, local patterns, and relevant language or framework skills.
6. Read `references/smell-baseline.md` for the Standards axis.
7. Run Standards and Spec as independent passes.
8. Aggregate without merging the axes. Put findings under `Standards` and `Spec`, then end with counts and the worst issue within each axis.

## Standards Axis

Report findings tied to concrete files or hunks.

- Cite documented standards when a change violates them.
- Treat smell-baseline items as judgment calls, not hard violations.
- Let documented repo standards override the smell baseline.
- Skip issues already enforced by tooling unless the diff clearly bypasses or weakens that tooling.
- Focus on defects, maintainability risk, misleading structure, hidden coupling, and reviewability.

## Spec Axis

Report only what can be grounded in the spec source or a clear user request.

- Missing or partial requirements.
- Behavior that was not requested and creates scope creep.
- Implemented requirements that appear behaviorally wrong.
- Ambiguous requirements that need human confirmation.

## Output

Use this shape:

```text
## Standards
- <finding or "No findings">

## Spec
- <finding, "No findings", or "No spec available">

Summary: Standards <count>; Spec <count>. Worst Standards issue: <item or none>. Worst Spec issue: <item or none>.
```
