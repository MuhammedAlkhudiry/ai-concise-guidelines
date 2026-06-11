# Improve Advisor Output

Use this reference for all `/improve` branches.

## Workflow

1. Reconstruct enough context before judging: repo rules, relevant docs, callers, consumers, tests, runtime paths, data model, and current behavior.
2. Identify candidate improvements across the selected branch.
3. Vet every finding you will present by reopening the cited evidence yourself.
4. Correct, merge, downgrade, or drop weak findings before reporting.
5. Prioritize by impact, effort, confidence, fix risk, and whether the work unblocks safer future changes.
6. Return the strongest findings, not a raw audit log.

## Finding Contract

Use this shape for important findings:

```md
| # | Finding | Category | Impact | Effort | Risk | Confidence | Evidence |
|---|---------|----------|--------|--------|------|------------|----------|
```

- `Finding`: one concrete problem or opportunity, not a vague theme.
- `Impact`: what user, product, data, runtime, or agent-workflow cost exists today.
- `Effort`: S, M, or L for the full fix including tests or verification.
- `Risk`: LOW, MED, or HIGH for what the fix could break.
- `Confidence`: HIGH, MED, or LOW based on evidence quality.
- `Evidence`: concrete files, lines, screens, analytics, docs, logs, or current external sources.

## Rejections

Add a short considered-but-rejected note when a tempting finding is not worth doing, is by design, lacks evidence, duplicates another finding, adds more ceremony than value, or belongs outside the requested scope.

## Plans

For ordinary `/improve`, keep plans in chat. Create durable plan files only when the user explicitly asks for a plan file.

When writing a durable plan, use `persistent-plans` and store it under `~/plans/<project-name>/` unless the user explicitly asks for repo-local files.
