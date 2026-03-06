---
name: planning
description: "Create structured implementation plans with phases and assumptions. Use when user wants to plan a feature, architect a solution, design an approach, or says 'let's plan', 'create a plan', 'how should we build this', or needs to break down work into steps."
---

# Plan Mode

Architect first, implement only after explicit approval. A plan must be executable, decisive, and written to file.

## Core Principles

- No implementation before approval.
- Full code snippets are required for implementation decisions.
- No tentative language (`maybe`, `consider`, `perhaps`).
- Questions must go through the question tool, never chat text.
- Plans are living documents; keep updating them.

## Workflow

### 1. Read Context First

Load, in order:

1. `KNOWLEDGE.md`
2. `master-plan.md` (if present)
3. Referenced upstream plans

### 2. Resolve Ambiguity

Ask early and aggressively for anything that could change plan structure:

- Stack and architecture choices
- Scope boundaries
- Scale and performance expectations
- User roles/permissions
- Integration points and delivery model

Heuristic: if a wrong assumption would change phases or approach, ask.

### 3. Audit Assumptions

For each decision, classify:

- Structure-changing uncertainty: ask now.
- Minor-rework uncertainty: list under `Assumptions`.
- Unsure: ask.

### 4. Scope Check and Split

Split into multiple plans if any signal appears:

- 3+ distinct subsystems
- 6+ phases
- Deliverable cannot be described in one clean sentence
- Long dependency chains with unresolved decisions

If split:

1. Propose boundaries via question tool.
2. Confirm dependency order.
3. Create `master-plan.md` and first child plan.
4. List remaining child plans in one line each.

If not split: use `plan.md` only.

### 5. Draft the Plan File

Always write to `plan.md` (or `plan-N-slug.md`).

Required sections:

- Goal
- Assumptions
- Approach (with concrete architecture decisions)
- Required Skills
- Phases (with explicit review gates)

Phase rules:

- Scope each phase for about 5-minute human review.
- Mark independent phases for parallelization (`Phase 2 ⟂ Phase 3`).
- Include a final simplify phase and a finalization/audit phase.

### 6. Iterate Every Turn

1. Re-read plan file first.
2. Update checklist status (`[x]`, `[~]`).
3. Log key decisions and rationale.
4. Revalidate assumptions with new information.

## Plan Quality Bar

Tasks must be:

- Atomic
- Verifiable
- Correctly ordered
- Code-referenced with `[path:line]`

Trade-offs must be explicit:

- Options considered
- Selected option + rationale
- What was intentionally not chosen

## Research Before Asking

Before asking unresolved questions:

1. Search codebase
2. Check docs
3. Inspect similar features
4. Search web for prior art when needed

When answering from research, show evidence with file/line references.

## Status Markers

```markdown
- [ ] Pending
- [x] Done
- [~] Blocked (reason: ...)
- [!] Needs decision
```

## Non-Negotiable Rules

- Every plan lives in a file, never chat-only.
- No silent assumptions.
- No vague tasks.
- Full snippets required for implementation decisions.
- Decide details; do not defer.
- Challenge weak assumptions.
- Reference relevant code with `[path:line]`.
- End with finalize/audit and `KNOWLEDGE.md` update when business context changes.

## Completion States

- `READY TO BUILD`: complete and approved.
- `BLOCKED`: cannot proceed until a specific blocker is resolved.

On approval (`go`, `build`, `approved`), move to execution mode using the existing plan file.
