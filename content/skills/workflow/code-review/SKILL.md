---
name: code-review
description: Code review of a diff, branch, PR, commit range, or working tree against standards and agreed requirements.
---

Review along two independent axes:

- `Standards`: defects, maintainability risks, hidden coupling, misleading structure, and documented convention violations.
- `Spec`: missing, partial, incorrect, ambiguous, or unrequested behavior relative to the agreed requirements.

## Workflow

1. Use the fixed point named by the user. Otherwise infer the base branch or use the current staged and unstaged diff; ask only when the review
   surface cannot be determined safely.
2. Resolve the comparison and confirm it has a non-empty diff. Use `git diff <fixed-point>...HEAD` for branch-style comparisons.
3. Resolve the spec from the user's request or linked issue, PRD, plan, PR, or project documentation. If none exists, skip that axis and report
   `No spec available`.
4. Read applicable repository instructions and conventions, then review Standards and Spec independently. Documented project standards override
   general judgment; do not report issues already enforced by tooling unless the change bypasses that tooling.
5. Ground every finding in a concrete file or hunk. Keep the axes separate and report counts and the worst finding for each.

## Output

```md
## Standards

- <finding or "No findings">

## Spec

- <finding, "No findings", or "No spec available">

Summary: Standards <count>; Spec <count>. Worst Standards issue: <item or none>. Worst Spec issue: <item or none>.
```
