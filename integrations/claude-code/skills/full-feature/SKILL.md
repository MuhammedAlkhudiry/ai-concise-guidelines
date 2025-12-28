---
name: full-feature
description: Manage full feature lifecycle from exploration to delivery. Use when building new features, implementing complete functionality, or when user mentions 'feature mode', 'full feature', or wants to go through Workshop, Plan, Execute, and Reflection phases systematically.
---

# Full Feature Orchestrator

> **This skill delegates to the Manager Agent.** The manager coordinates a team of sub-agents: planners, executors, auditors, and reflector.

You are a process initiator that spawns the Manager Agent to handle the full feature lifecycle.

---

## The Flow (Orchestrated by Manager)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MANAGER AGENT (opus)                              │
│                                                                             │
│  ┌──────────┐   ┌─────────────────┐   ┌────────────────┐   ┌────────────┐  │
│  │ WORKSHOP │ → │    PLANNING     │ → │    EXECUTE     │ → │  AUDIT +   │  │
│  │          │   │   (3 planners)  │   │ (N executors)  │   │ REFLECTION │  │
│  │ manager  │   │                 │   │                │   │            │  │
│  │ handles  │   │ planner-1 (h)   │   │ executor-1 (o) │   │ code (h)   │  │
│  │ directly │   │ planner-2 (h)   │   │ executor-2 (o) │   │ quality (h)│  │
│  │          │   │ planner-3 (h)   │   │ executor-N (o) │   │ reflect (o)│  │
│  └──────────┘   └─────────────────┘   └────────────────┘   └────────────┘  │
│       │                  │                    │                    │        │
│       ▼                  ▼                    ▼                    ▼        │
│   context            plan.md              changes            APPROVED/     │
│                   (synthesized)          + state.md          REJECTED      │
│                                                                             │
│                        ┌─────────────────────────────┐                     │
│                        │      AUTO-FIX LOOP          │                     │
│                        │  If rejected → spawn fixer  │                     │
│                        │  → re-audit → repeat (max 2)│                     │
│                        └─────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘

(h) = haiku/fast model | (o) = opus/smart model
```

---

## How It Works

### 1. User Activates Full-Feature
User says: "full feature", "feature mode", "build feature X"

### 2. You Spawn Manager Agent
```
Task(manager):
"Feature: <feature-name>
Description: <user's feature description>
State path: docs/ai/<feature-name>/state.md"
```

### 3. Manager Takes Over
The manager agent handles everything:

**WORKSHOP** (manager does directly):
- Analyzes codebase structure
- Identifies relevant files, patterns, dependencies
- Creates feature context

**PLANNING** (3 parallel planners):
- Spawns 3 planner sub-agents (haiku)
- Each planner proposes an approach (no files, just findings)
- Manager scores each approach
- Manager synthesizes best parts into `plan.md`

**EXECUTION** (dynamic domain-based):
- Manager detects project domains (frontend, backend, infra, etc.)
- Analyzes plan for dependencies
- Decides execution order (parallel or sequential)
- Spawns N executor sub-agents (opus, one per domain)
- Executors implement their portion
- Manager aggregates all changes in state.md

**AUDITING + REFLECTION** (parallel):
- Code Auditor (haiku): Does code work? Tests, errors, types, linting
- Quality Auditor (haiku): Is code clean? Patterns, standards
- Reflector (opus): What did we build? Gaps, future improvements
- All three run in parallel

**AUTO-FIX LOOP** (if needed):
- If auditors find blockers → manager spawns fixer agent
- Fixer applies targeted fixes
- Re-audit (code auditor only)
- Max 2 fix attempts, then escalate to user

### 4. Manager Returns Verdict
- **APPROVED**: Feature complete, reflection created
- **REJECTED**: Unfixable issues, escalated to user with details

---

## State File

**Location**: `docs/ai/<feature-name>/state.md`

Manager maintains this file throughout. Structure:

```yaml
feature:
  name: ""
  status: workshop|planning|executing|auditing|fixing|complete|failed

workshop:
  status: complete
  context: "# Codebase analysis..."

planning:
  status: complete
  planners:
    - id: planner-1, findings: "...", score: 7.5
    - id: planner-2, findings: "...", score: 8.5
    - id: planner-3, findings: "...", score: 6.0
  selected_plan: planner-2
  final_plan_file: plan.md

execution:
  status: complete
  detected_domains: [frontend, backend]
  execution_order:
    - step: 1, domains: [backend], reason: "API first"
    - step: 2, domains: [frontend], reason: "Uses API"
  executors:
    frontend: { status: complete, changes: [...], summary: "..." }
    backend: { status: complete, changes: [...], summary: "..." }

auditing:
  code_audit: { verdict: approved, blockers: 0 }
  quality_audit: { verdict: approved, blockers: 0 }
  final_verdict: approved
  fix_loops: 0

reflection:
  status: complete
  file: reflection.md
  summary: "# What was built..."
```

---

## Your Role (Simple)

You are the **entry point only**. Your job:

1. **Receive feature request** from user
2. **Create initial state file** at `docs/ai/<feature-name>/state.md`
3. **Spawn manager agent** with feature details
4. **Wait for manager to complete**
5. **Report final verdict** to user

**You do NOT**:
- Run workshop yourself
- Create plans yourself
- Implement code yourself
- Audit code yourself
- Make approval decisions

**Manager owns the entire process.**

---

## Starting a Feature

When user activates Full Feature Mode:

1. **Ask for feature name** (if not provided)
2. **Create state file** at `docs/ai/<feature-name>/state.md` (use template)
3. **Spawn manager**:

```
Task(manager):
"Feature: <feature-name>
Description: <user's feature description>
State path: docs/ai/<feature-name>/state.md
Codebase: <brief project context if known>"
```

4. **Wait for completion**
5. **Report to user**: APPROVED or REJECTED with summary

---

## Resuming a Feature

When user returns to an existing feature:

1. **Read state file**
2. **Check current phase/status**
3. **If incomplete**: Re-spawn manager with state path (manager will resume)
4. **If complete**: Show reflection summary

---

## Commands

| Command | Action |
|---------|--------|
| `status` | Read state.md, show current phase + progress |
| `resume` | Re-spawn manager to continue |
| `cancel` | Mark feature as cancelled in state.md |

---

## Files Structure

```
docs/ai/<feature>/
├── state.md              # Central state (managed by manager)
├── plan.md               # Final synthesized plan
├── reflection.md         # Functional reflection (created by reflector)
└── audits/
    ├── code-audit.md     # Code auditor output
    └── quality-audit.md  # Quality auditor output
```

---

## Quick Reference

```
USER → Full-Feature Skill → Task(manager) → Manager orchestrates team
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                              3 Planners      N Executors     2 Auditors
                               (haiku)         (opus)          (haiku)
                                    │               │               │
                                    └───────────────┼───────────────┘
                                                    ▼
                                              + Reflector (opus)
                                                    │
                                                    ▼
                                            APPROVED/REJECTED
                                                    │
                                                    ▼
                                             USER SEES RESULT
```

**Manager Model**: opus (smart) — coordinates everything
**Planner Model**: haiku (fast) — quick analysis, 3 perspectives
**Executor Model**: opus (smart) — complex implementation decisions
**Auditor Model**: haiku (fast) — quick verification checks
**Reflector Model**: opus (smart) — comprehensive summary
**Fixer Model**: opus (smart) — targeted fixes
