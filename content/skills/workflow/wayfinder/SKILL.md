---
name: wayfinder
description: User-invoked decision mapping for large, uncertain initiatives that cannot be understood or planned within one agent session.
---

## Boundary

Use only when explicitly invoked for an initiative too large and uncertain for one session. Use $workshop, $interview, or $planning directly when the
work fits one session. Produce decisions, evidence, and clarified scope, not implementation.

## Persistence

Persist one map with child tickets. Prefer the repository's writable issue tracker; on GitHub, use a parent issue, sub-issues, and native
dependencies. Read the narrowest relevant CLI help before operating the tracker.

Without a writable tracker, use `~/wayfinders/<project>/<effort>/map.md` and `tickets/<NN>-<slug>.md`. Local tickets record `Status`, `Type`, and
`Blocked by` fields.

The map is an index; details live in tickets:

```markdown
## Destination

<Concrete result this effort must make possible.>

## Operating notes

<Context, constraints, and required skills.>

## Decisions so far

- <linked ticket name> — <one-line consequence>

## Not yet specified

<In-scope uncertainty not yet expressible as a question.>

## Out of scope

<Explicit exclusions and their reasons.>
```

Refer to maps and tickets by linked names, never opaque identifiers alone.

## Ticket Types

Every ticket answers one question or completes one prerequisite blocking a question.

- **Research:** Establish facts from primary sources. Independent tickets may run concurrently in self-contained subagents given their question,
  context, sources, and completion contract. Record cited findings in the ticket; create no research-only branch.
- **Prototype:** Create a narrow, disposable artifact that makes a decision concrete. Use $ux-ui for interfaces and link the artifact. It answers a
  question; it is not implementation.
- **Interview:** Resolve an owner decision. Use $workshop to test it and $interview for dependent, high-impact unknowns. Never infer human answers.
- **Task:** Complete a prerequisite such as provisioning access or collecting representative data. Do not implement the destination.

## Chart the Map

1. Inspect the repository, documentation, prior decisions, and knowledge. Use $project-knowledge when a matching pack or glossary exists.
2. Establish the destination through $workshop, delegating to $interview when its trigger is met.
3. Explore breadth-first. Classify each area as a precise ticket question, not yet specified, already decided, or out of scope.
4. If no material uncertainty remains, create no map and offer $planning.
5. Create the map and precise tickets. Add child relationships, then blockers. Give each ticket one label: `wayfinder:research`,
   `wayfinder:prototype`, `wayfinder:interview`, or `wayfinder:task`.
6. Start independent research tickets concurrently when delegation is available.
7. Stop after charting; resolve no interview, prototype, or task ticket in that session.

## Work Through the Map

1. Load the map and open-ticket summaries, then reconfirm the destination. Read full tickets only as needed.
2. Use the user's named ticket or the first open, unblocked, unclaimed ticket. Claim it before work through tracker assignment or local `Status`.
3. Resolve it by type. Record the answer or prerequisite, evidence, consequences, and newly exposed uncertainty.
4. Close it and append one linked consequence to `Decisions so far`.
5. Create tickets and dependencies for newly precise questions. Remove them from `Not yet specified`; keep each decision in one place.
6. Move newly excluded work to `Out of scope` with its reason.
7. Resolve at most one non-research ticket per session.

## Completion

Complete the map only when no child tickets remain open, `Not yet specified` is empty, the decisions make the route clear, and exclusions are
recorded. Summarize the settled decisions and offer $planning. Do not begin implementation without the user's request.
