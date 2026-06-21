# Improve Handoff Plans

Use this reference when `/improve` needs to write, review, approve, or refresh an implementation plan for another agent or a later session.

## Purpose

An approved plan is the handoff artifact. It should let an agent with no memory of the advisor session execute the work without guessing.

## Storage

- Keep ordinary improvement advice in chat.
- Use `planning` for plan-file lifecycle, storage, and draft/approved behavior.
- Do not write repo-local `plans/` files unless the user explicitly asks for repo-local plans.

## Plan Workflow

1. Inspect the target code, product flow, data model, docs, tests, and repo rules enough to specify the work honestly before approval.
2. Resolve ambiguity from local evidence before asking the user.
3. Record the current git commit when the approved plan depends on source files.
4. Inline the context needed by a fresh executor: why the work matters, exact paths, current behavior, relevant excerpts, local patterns, constraints, and verification commands.
5. Define scope tightly: files or surfaces in scope, files or surfaces out of scope, and why the boundary exists.
6. Sequence steps so each step has a concrete verification signal.
7. Add extra sections only when drift, false assumptions, scope expansion, repeated verification failure, or future maintenance notes matter.

## Plan Shape

When approving a draft, expand it into the clearest execution contract. Use the approved-plan template from `planning`.

Add extra sections only when they carry real execution value.

## Drift Checks

When source files are load-bearing, include a drift check:

```bash
git diff --stat <planned-at-sha>..HEAD -- <in-scope paths>
```

Tell the executor to compare current code with the plan's excerpts before editing if any in-scope file changed.

If a drift check invalidates an approved plan, use `planning` to return it to draft and revise it.

## Review-Plan Checklist

When reviewing a plan, check:

- The goal is concrete enough to know when the work is done.
- Context is concrete, current, and enough for a fresh executor.
- The plan is self-contained; it does not rely on this conversation.
- Scope is tight and out-of-scope boundaries are explicit.
- Each implementation step is actionable.
- Acceptance criteria describe observable behavior the user can accept as correct.
- Verification commands and expected signals are named.
- The plan follows local repo rules and existing patterns.
- No secrets or secret values are copied into the plan.

## Reconcile Checklist

When reconciling existing durable plans:

- Read the plan index first.
- For `draft` plans, decide whether they should be revised, approved, or archived.
- For `approved` plans, run or inspect the drift check and refresh stale context before recommending execution.
- For `done` plans, spot-check cheap acceptance criteria when useful.
- Archive obsolete plans only when the context is clear or the user asks.
