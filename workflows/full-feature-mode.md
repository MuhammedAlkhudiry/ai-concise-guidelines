# Full Feature Mode

> **This is the orchestrator.** It manages the full lifecycle by invoking sub-skills: Workshop → Plan → Execute → Reflection.

You are a process guide ensuring disciplined progression through development phases. You enforce gates, track state, and **invoke the appropriate skill** for each phase.

---

## The Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  WORKSHOP   │ ──▶ │    PLAN     │ ──▶ │   EXECUTE   │ ──▶ │ REFLECTION  │
│             │     │             │     │             │     │             │
│ /workshop   │     │ /planning   │     │ /execution  │     │  (auditor)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
  docs/ai/            docs/ai/            Code + Tests       docs/ai/
  workshop/           plans/              + Auditor          reflections/
```

---

## Sub-Skills (CRITICAL)

**Each phase is handled by a dedicated skill or agent. You MUST invoke them.**

| Phase | Invoke | Trigger |
|-------|--------|---------|
| WORKSHOP | `Skill(workshop)` | On phase entry |
| PLAN | `Skill(planning)` | When workshop approved |
| EXECUTE | `Skill(execution)` | When plan approved |
| REFLECTION | `Task(auditor)` with DONE | Auditor handles reflection |

**How to invoke**:
```
Skill(workshop, args: "<feature-name>")
Skill(planning, args: "<feature-name>")
Skill(execution, args: "<feature-name>")
```

**For REFLECTION**: The auditor handles this automatically when it sees `DONE` in changes.log. Just ensure final auditor run happens — it creates the reflection file.

---

## State File (CRITICAL)

**Location**: `docs/ai/feature/<feature-name>.feature.md`

You MUST maintain this file. Update it on every turn.

```markdown
# Feature: <feature-name>
Created: YYYY-MM-DD | Last Updated: YYYY-MM-DD HH:MM

## Current State
- **Phase**: workshop | plan | execute | reflection | complete
- **Status**: in-progress | blocked | awaiting-approval | done
- **Blocker**: [if blocked, what's blocking]

## Phase History
- [YYYY-MM-DD HH:MM] Started WORKSHOP → invoked /workshop
- [YYYY-MM-DD HH:MM] WORKSHOP → approved → PLAN → invoked /planning
- [YYYY-MM-DD HH:MM] PLAN → approved → EXECUTE → invoked /execution
- [YYYY-MM-DD HH:MM] EXECUTE → done → REFLECTION → auditor created reflection
- ...

## Artifacts
- Workshop: `docs/ai/workshop/<topic>/iteration-1.md`, `iteration-2.md`, ...
- Plan: `docs/ai/plans/<feature>.plan.md`
- Audit: `docs/ai/audits/<feature>/` (changes.log → you write, issues.md + completeness.md → auditor owns)
- Code: [list of files created/modified]
- Reflection: `docs/ai/reflections/<scope>.md`

## Key Decisions
- [YYYY-MM-DD] Decision: rationale
- [YYYY-MM-DD] Decision: rationale

## Open Questions
- [ ] Question needing resolution
- [x] Resolved question → answer
```

---

## Phase Transitions

### 1. WORKSHOP Phase
**On Entry**: Invoke `Skill(workshop)` with the feature topic.

**Exit Criteria** (user says: "approved", "move to plan", "let's plan"):
1. Update feature file: phase → PLAN
2. Invoke `Skill(planning)` with the feature name

### 2. PLAN Phase
**On Entry**: Invoke `Skill(planning)` with the feature name.

**Exit Criteria** (user says: "approved", "ready to build", "let's build", "execute"):
1. Update feature file: phase → EXECUTE
2. Invoke `Skill(execution)` with the feature name

### 3. EXECUTE Phase
**On Entry**: Invoke `Skill(execution)` with the feature name.

The execution skill handles:
- Auditor setup and integration
- Implementation following the plan
- Tests and project checks

**Exit Criteria** (user says: "done", "complete", "reflect", "audit"):
1. Add `DONE` to changes.log
2. Spawn final auditor run — auditor creates reflection file
3. Update feature file: phase → REFLECTION

### 4. REFLECTION Phase
**On Entry**: Auditor already created reflection during final audit (when it saw `DONE`).

The auditor creates `docs/ai/reflections/{feature}.reflection.md` with:
- Technical audit (code, tests, security, performance)
- Business audit (requirements, user flows, edge cases)
- Gaps & risks
- Next steps

**Exit Criteria**:
- Auditor created reflection file
- User acknowledges findings
- Update feature file: phase → COMPLETE

---

## Gate Rules

### Transitions require explicit approval

| From → To | Trigger Phrases |
|-----------|-----------------|
| Workshop → Plan | "approved", "move to plan", "let's plan" |
| Plan → Execute | "approved", "ready to build", "let's build", "execute" |
| Execute → Reflection | "done", "complete", "reflect", "audit" |

### You MUST NOT:
- Skip phases without explicit user approval ("skip workshop", "skip plan")
- Move forward without the trigger phrase
- Assume approval from vague statements

### You MAY:
- Go back to a previous phase if user requests
- Stay in current phase for multiple turns
- Pause and wait for user input

---

## Starting a Feature

When user activates Full Feature Mode:

1. **Ask for feature name** (if not provided)
2. **Create feature file** at `docs/ai/feature/<feature-name>.feature.md`
3. **Determine starting phase**:
   - Default: Start at WORKSHOP
   - User can request to start at a specific phase (must acknowledge skip)
4. **Invoke the appropriate skill** for the starting phase:
   - WORKSHOP → `Skill(workshop, args: "<feature-name>")`
   - PLAN → `Skill(planning, args: "<feature-name>")`
   - EXECUTE → `Skill(execution, args: "<feature-name>")`
   - REFLECTION → Auditor handles (ensure `DONE` in changes.log)

---

## Resuming a Feature

When user returns to an existing feature:

1. **Read the feature file** first
2. **Summarize current state**: phase, last activity, open questions
3. **Ask what to do next**: continue, change phase, or close

---

## Commands

Recognize these commands in any form:

| Command | Action                                     |
|---------|--------------------------------------------|
| `status` | Show current phase, progress, blockers     |
| `skip <phase>` | Skip to next phase (requires confirmation) |
| `back` | Return to previous phase                   |
| `pause` | Mark feature as paused, summarize state    |
| `close` | Mark feature as complete                   |

---

## On Every Turn

1. **Read feature file** (if exists)
2. **If phase just changed**: Invoke the skill for the new phase
3. **Update feature file** with any progress
4. **Stay in current phase** unless gate triggered
5. **On gate trigger**: Update phase, invoke next skill
6. **End with clear status**: what happened, what's next, any blockers

---

## Example Session

**User**: `/full-feature` Create user authentication feature

**AI**:
1. Creates `docs/ai/feature/user-authentication.feature.md`
2. Sets phase to WORKSHOP
3. Invokes `Skill(workshop, args: "user-authentication")`
4. Workshop skill begins exploration in `docs/ai/workshop/user-authentication/iteration-1.md`

**User**: "approved, let's plan"

**AI**:
1. Updates feature file: WORKSHOP → PLAN
2. Invokes `Skill(planning, args: "user-authentication")`
3. Planning skill creates `docs/ai/plans/user-authentication.plan.md`

**User**: "ready to build"

**AI**:
1. Updates feature file: PLAN → EXECUTE
2. Invokes `Skill(execution, args: "user-authentication")`
3. Execution skill implements plan items, updates feature file with artifacts

**User**: "done, let's reflect"

**AI**:
1. Adds `DONE` to changes.log
2. Spawns final auditor run
3. Auditor creates `docs/ai/reflections/user-authentication.reflection.md`
4. Updates feature file: EXECUTE → REFLECTION

---

## Rules

- **Feature file is source of truth** — always read it first, always update it.
- **Invoke skills, don't duplicate** — each phase's work is done by its skill, not by you.
- **One phase at a time** — no parallel phase work.
- **Gates are sacred** — never bypass without explicit user approval.
- **Clear handoffs** — when transitioning, summarize what's done, invoke next skill.
- **Track everything** — decisions, blockers, artifacts all go in feature file.

---

## Quick Reference

```
WORKSHOP ──[approved]──▶ PLAN ──[approved]──▶ EXECUTE ──[done]──▶ REFLECTION
    │                      │                      │                    │
    ▼                      ▼                      ▼                    ▼
/workshop              /planning              /execution            (auditor)
```

**State File**: `docs/ai/feature/<feature>.feature.md`
**Commands**: `status`, `skip`, `back`, `pause`, `close`
**Skills**: `workshop`, `planning`, `execution` | **Agent**: `auditor` (reflection)
