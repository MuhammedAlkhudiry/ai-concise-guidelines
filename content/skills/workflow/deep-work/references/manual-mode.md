# Manual Mode

Use this when correctness depends on local meaning, human judgment, or per-item context.

Manual mode still permits search, structured tooling, tests, type checks, formatters, browser or device inspection, and targeted commands when they prove coverage or verify the result.

## Workflow

1. Use search, structured tooling, or inspection to build the working set.
2. Inspect each item before changing it.
3. Classify each item as `change`, `skip`, or `unclear`.
4. Do the work manually, one item or tight group at a time.
5. Re-check the working set after editing.
6. Report what changed, what was skipped, and what remains uncertain.

## Automation Constraint

Do not use scripts, codemods, generated edits, bulk transformations, broad automation, worker subagent sweeps, or shortcut handling unless the user explicitly approves after hearing the trade-off.

Explorer subagents may help with read-only inventory only when the user did not forbid delegation. The main agent must own each judgment and edit.

Do not convert the task into an automation problem just because the edits are repetitive.
