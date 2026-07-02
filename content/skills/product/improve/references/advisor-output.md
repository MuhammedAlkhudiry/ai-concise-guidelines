# Improve Advisor Output

Use this reference for all `/improve` branches.

## Workflow

1. Reconstruct enough context before judging: repo rules, relevant docs, callers, consumers, tests, runtime paths, data model, and current behavior.
2. Identify candidate improvements across the selected branch.
3. Vet every finding you will present by reopening the cited evidence yourself.
4. Correct, merge, downgrade, or drop weak findings before reporting.
5. Prioritize by impact, effort, confidence, fix risk, and whether the work unblocks safer future changes.
6. Return the strongest findings, not a raw audit log.

## Output

Lead with the recommendations, then give only the evidence needed to trust them.

- `Top Picks`: the improvements most worth doing, ranked by value.
- `Evidence`: concrete files, lines, screens, analytics, docs, logs, or current external sources.
- `Fix Shape`: the smallest correct implementation direction, including verification.
- `Other Candidates`: only stronger alternatives or close seconds, with why they lost.

## Rejections

Mention rejected ideas only when they would otherwise look tempting.
