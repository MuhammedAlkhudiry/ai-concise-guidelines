# Improve Handoff Plans

Use this reference when `/improve` needs to write, review, or refresh an implementation plan for another agent or a later session.

## Purpose

The plan is the handoff artifact. It should let an agent with no memory of the advisor session execute the work without guessing.

## Storage

- Keep ordinary improvement advice in chat.
- Create durable files only when the user explicitly asks for a plan file.
- Use `persistent-plans` for durable files and store them under `~/plans/<project-name>/`.
- Do not write repo-local `plans/` files unless the user explicitly asks for repo-local plans.

## Plan Workflow

1. Inspect the target code, product flow, data model, docs, tests, and repo rules enough to specify the work honestly.
2. Resolve ambiguity from local evidence before asking the user.
3. Record the current git commit when the plan depends on source files.
4. Inline the context needed by a fresh executor: exact paths, current behavior, relevant excerpts, local patterns, and verification commands.
5. Define scope tightly: files or surfaces in scope, files or surfaces out of scope, and why the boundary exists.
6. Sequence steps so each step has a concrete verification signal.
7. Add STOP conditions for drift, false assumptions, scope expansion, or repeated verification failure.
8. Include maintenance notes only when future work or review needs the context.

## Plan Shape

Use the clearest plan that preserves the execution contract. Include these sections when they matter:

```md
## Goal

What will be true after the plan is executed.

## Evidence

Why this is worth doing, with concrete files, lines, screens, data, docs, or observed behavior.

## Current State

The facts a fresh executor needs: relevant files, symbols, behavior, and local conventions to match.

## Scope

In scope:
- ...

Out of scope:
- ...

## Implementation Steps

1. ...

Verification after this step:
- `<command>` exits 0 or produces `<expected signal>`.

## Verification Steps

- ...

## Done Criteria

- [ ] ...

## STOP Conditions

Stop and report instead of improvising if:
- ...

## Maintenance Notes

- ...
```

## Drift Checks

When source files are load-bearing, include a drift check:

```bash
git diff --stat <planned-at-sha>..HEAD -- <in-scope paths>
```

Tell the executor to compare current code with the plan's excerpts before editing if any in-scope file changed.

## Review-Plan Checklist

When reviewing a plan, check:

- The goal is concrete enough to know when the work is done.
- Evidence is real and current.
- The plan is self-contained; it does not rely on this conversation.
- Scope is tight and out-of-scope boundaries are explicit.
- Each implementation step is actionable.
- Verification commands and expected signals are named.
- Done criteria are machine-checkable where possible.
- STOP conditions are specific to the plan's actual risks.
- The plan follows local repo rules and existing patterns.
- No secrets or secret values are copied into the plan.

## Reconcile Checklist

When reconciling existing durable plans:

- Read the plan index first.
- For TODO plans, run or inspect the drift check and refresh stale evidence before recommending execution.
- For DONE plans, spot-check cheap done criteria when useful.
- For BLOCKED plans, investigate the blocker and recommend refresh, replacement, or rejection.
- Mark obsolete plans as rejected or archived only when the evidence is clear or the user asks.
