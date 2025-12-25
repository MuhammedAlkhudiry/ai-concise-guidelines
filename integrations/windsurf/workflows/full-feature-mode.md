---
description: Manage full feature lifecycle from exploration to delivery. Use when building new features, implementing complete functionality, or when user mentions 'feature mode', 'full feature', or wants to go through Workshop, Plan, Execute, and Reflection phases systematically.
---

# Full Feature Orchestrator

> **This is the orchestrator.** It manages the full lifecycle by invoking sub-skills: Workshop → Plan → Execute (+ Audit) → Reflection.

You are a process guide ensuring disciplined progression through development phases. You enforce gates, track state, and **invoke the appropriate skill** for each phase.

---

## The Flow

```
┌───────────┐   ┌───────────┐   ┌─────────────────────┐   ┌────────────┐
│  WORKSHOP │ → │   PLAN    │ → │      EXECUTE        │ → │ REFLECTION │
│           │   │           │   │                     │   │            │
│ /workshop │   │ /planning │   │ /execution + audit  │   │ (auditor)  │
└───────────┘   └───────────┘   └─────────────────────┘   └────────────┘
      │               │                   │                      │
      ▼               ▼                   ▼                      ▼
  docs/ai/        docs/ai/         Code + Tests +          docs/ai/
  <feature>/      <feature>/       Audit Approval          <feature>/
  workshop/       plan.md                                  reflection.md
```

---

## Sub-Skills & Agents

**Each phase is handled by a dedicated skill or agent. You MUST invoke them.**

| Phase | Invoke | Trigger |
|-------|--------|---------|
| WORKSHOP | `Skill(workshop)` | On phase entry |
| PLAN | `Skill(planning)` | When workshop approved |
| EXECUTE | `Skill(execution)` | When plan approved |
| REFLECTION | Auditor creates reflection.md | When auditor approves |

**How to invoke**:
```
Skill(workshop, args: "<feature-name>")
Skill(planning, args: "<feature-name>")
Skill(execution, args: "<feature-name>")
```

**Audit happens at end of EXECUTE**: The execution skill handles spawning the auditor after implementation is complete. The auditor returns APPROVED or REJECTED. Task is never done without audit approval.

**REFLECTION**: The auditor creates the reflection file when it approves.

---

## Audit Gate (CRITICAL)

**Main agent cannot self-approve or self-audit.** At the end of Execute phase:

1. Main agent implements all plan items
2. Main agent spawns auditor with full context
3. Auditor reviews all changes and returns verdict
4. If REJECTED: main agent fixes blockers, re-audits
5. If APPROVED: auditor creates reflection.md, task is complete

### Files

```
docs/ai/<feature>/audits/
├── changes.log       # Auto-logged by hook during execute
├── issues.md         # Auditor writes findings
├── completeness.md   # Auditor writes component status
└── escalations.md    # Main agent writes disagreements
```

---

## State File (CRITICAL)

**Location**: `docs/ai/<feature-name>/state.md`

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
- [YYYY-MM-DD HH:MM] EXECUTE → auditor APPROVED → REFLECTION
- [YYYY-MM-DD HH:MM] REFLECTION → auditor created reflection.md → COMPLETE
- ...

## Artifacts
- Workshop: `docs/ai/<feature>/workshop/iteration-1.md`, `iteration-2.md`, ...
- Plan: `docs/ai/<feature>/plan.md`
- Audit: `docs/ai/<feature>/audits/` (changes.log, issues.md, completeness.md)
- Code: [list of files created/modified]
- Reflection: `docs/ai/<feature>/reflection.md`

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
- Creating audit folder + changes.log
- Setting active audit path (enables auto-logging hook)
- Implementation following the plan
- Tests and project checks
- Spawning auditor after implementation complete
- Handling APPROVED/REJECTED verdict

**Exit Criteria** (auditor returns APPROVED):
1. Auditor has created reflection.md
2. Update feature file: phase → REFLECTION

**If REJECTED**: Main agent fixes blockers and re-audits (stays in EXECUTE).

### 4. REFLECTION Phase
**On Entry**: Auditor created reflection during approval.

The auditor creates `docs/ai/{feature}/reflection.md` with:
- Technical audit (code, tests, security, performance)
- Business audit (requirements, user flows, edge cases)
- Gaps & risks
- Next steps

**Exit Criteria**:
- Reflection file exists
- User acknowledges findings
- Update feature file: phase → COMPLETE

---

## Gate Rules

### Transitions require explicit approval

| From → To | Trigger |
|-----------|---------|
| Workshop → Plan | User says "approved", "move to plan", "let's plan" |
| Plan → Execute | User says "approved", "ready to build", "let's build", "execute" |
| Execute → Reflection | Auditor returns APPROVED |
| Reflection → Complete | User acknowledges |

### You MUST NOT:
- Skip phases without explicit user approval ("skip workshop", "skip plan")
- Move forward without the trigger phrase
- Assume approval from vague statements
- **Proceed from Execute without auditor APPROVED verdict**
- **Self-approve or self-audit — auditor owns the gate**

### You MAY:
- Go back to a previous phase if user requests
- Stay in current phase for multiple turns
- Pause and wait for user input

---

## Starting a Feature

When user activates Full Feature Mode:

1. **Ask for feature name** (if not provided)
2. **Create state file** at `docs/ai/<feature-name>/state.md`
3. **Determine starting phase**:
   - Default: Start at WORKSHOP
   - User can request to start at a specific phase (must acknowledge skip)
4. **Invoke the appropriate skill** for the starting phase:
   - WORKSHOP → `Skill(workshop, args: "<feature-name>")`
   - PLAN → `Skill(planning, args: "<feature-name>")`
   - EXECUTE → `Skill(execution, args: "<feature-name>")`
   - REFLECTION → Check for reflection.md

---

## Resuming a Feature

When user returns to an existing feature:

1. **Read the feature file** first
2. **Summarize current state**: phase, last activity, open questions
3. **Ask what to do next**: continue, change phase, or close

---

## Commands

Recognize these commands in any form:

| Command | Action |
|---------|--------|
| `status` | Show current phase, progress, blockers |
| `skip <phase>` | Skip to next phase (requires confirmation) |
| `back` | Return to previous phase |
| `pause` | Mark feature as paused, summarize state |
| `close` | Mark feature as complete |

---

## On Every Turn

1. **Read feature file** (if exists)
2. **If phase just changed**: Invoke the skill for the new phase
3. **Update feature file** with any progress
4. **Stay in current phase** unless gate triggered
5. **On gate trigger**: Update phase, invoke next skill
6. **End with clear status**: what happened, what's next, any blockers

---

## Rules

- **Feature file is source of truth** — always read it first, always update it.
- **Invoke skills, don't duplicate** — each phase's work is done by its skill, not by you.
- **One phase at a time** — no parallel phase work.
- **Gates are sacred** — never bypass without explicit user approval.
- **Auditor owns approval** — cannot proceed without auditor APPROVED verdict.
- **No self-approval** — main agent never declares task done without audit.
- **Clear handoffs** — when transitioning, summarize what's done, invoke next skill.
- **Track everything** — decisions, blockers, artifacts all go in feature file.

---

## Quick Reference

```
WORKSHOP ─[approved]─▶ PLAN ─[approved]─▶ EXECUTE ─[auditor APPROVED]─▶ REFLECTION
    │                    │                    │                              │
    ▼                    ▼                    ▼                              ▼
/workshop            /planning           /execution                      (auditor)
                                         + Task(auditor)                 reflection.md
                                         at the end
```

**State File**: `docs/ai/<feature>/state.md`
**Audit Files**: `docs/ai/<feature>/audits/` (changes.log, issues.md, completeness.md)
**Commands**: `status`, `skip`, `back`, `pause`, `close`
**Skills**: `workshop`, `planning`, `execution` | **Agent**: `auditor` (post-execute + reflection)
