# Orchestrator Workflow — Iteration 3

## Context

**Clarified problems:**
1. Context pollution kills model quality
2. Need model specialization (frontend vs backend)
3. Want ensemble thinking — multiple models propose, Opus judges
4. Current linear flow (plan → execute → audit) is underwhelming

**Not priorities:**
- Parallelism for editing (dangerous)
- Complex swarm infrastructure

---

## My Understanding

You want to unlock the potential of having multiple models with different strengths. The current "one model does everything" approach wastes the ecosystem. 

**The vision:**
- Claude proposes Plan A
- Gemini proposes Plan B  
- GPT proposes Plan C
- Opus evaluates and picks/synthesizes the best

This applies to planning, workshopping, brainstorming—any generative phase. Execution stays focused (one model, clean context).

---

## Analysis

### Problem 1: Context Pollution

**Why it happens:**
- Agent reads 10 files to understand codebase
- Starts working, context grows
- By edit #15, model is swimming in noise
- Quality degrades, hallucinations increase

**Solutions:**

| Approach | How it works | Trade-off |
|----------|--------------|-----------|
| **Context handoff** | Agent 1 summarizes, hands summary to Agent 2 | Lossy but clean |
| **Scoped agents** | Each agent sees only relevant files | Needs smart scoping |
| **Checkpointing** | Periodically dump context to file, restart fresh | Overhead but effective |
| **Distillation** | After each phase, extract key facts, discard raw | Like extract tool but systematic |

**My lean:** Combination of **scoped agents** + **distillation between phases**.

```
Phase 1 (Plan)
├── Context: requirements, existing patterns
├── Output: plan.md
└── Distill: "key decisions, constraints, risks"
         ↓
Phase 2 (Execute)  
├── Context: distilled plan + ONLY files being edited
├── Output: code changes
└── Distill: "what changed, why, gotchas"
         ↓
Phase 3 (Audit)
├── Context: distilled changes + test results
├── Output: verdict
```

Each phase starts relatively clean. No accumulated garbage.

---

### Problem 2: Model Specialization

**Current state:** 
- `smart` model = Claude Sonnet (everything)
- `fast` model = Claude Haiku (quick stuff)

**What you want:**

| Task Type | Best Model | Why |
|-----------|------------|-----|
| Planning/Architecture | Claude Opus | Best at complex reasoning |
| Frontend (React, CSS) | Gemini 2.5 | Strong at UI patterns |
| Backend (Laravel, API) | Claude Sonnet | Best at PHP/Laravel |
| Debugging | GPT-4 | Good at systematic diagnosis |
| Code review | Claude Opus | Catches subtle issues |
| Quick edits | Claude Haiku | Fast, cheap, good enough |

**Implementation:**

```typescript
// config/models.ts
export const models = {
  // Role-based, not quality-based
  orchestrator: "claude-opus",
  planner: "claude-opus", 
  frontend: "gemini-2.5-pro",
  backend: "claude-sonnet",
  debugger: "gpt-4o",
  reviewer: "claude-opus",
  quick: "claude-haiku",
};
```

Agents get assigned models by their role, not by "smart/fast" abstraction.

---

### Problem 3: Ensemble Thinking

This is the exciting part. Instead of one perspective, get multiple.

**Pattern: Propose-Judge**

```
┌─────────────────────────────────────────────────────┐
│                   PROPOSE PHASE                      │
│                                                      │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐          │
│   │ Claude  │   │ Gemini  │   │  GPT    │          │
│   │ Plan A  │   │ Plan B  │   │ Plan C  │          │
│   └────┬────┘   └────┬────┘   └────┬────┘          │
│        │             │             │                │
│        └─────────────┼─────────────┘                │
│                      ↓                              │
└─────────────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│                   JUDGE PHASE                        │
│                                                      │
│                 ┌───────────┐                        │
│                 │   Opus    │                        │
│                 │  (Judge)  │                        │
│                 └─────┬─────┘                        │
│                       │                              │
│            ┌──────────┼──────────┐                  │
│            ↓          ↓          ↓                  │
│         Pick A    Pick B    Synthesize              │
│                              (best of all)          │
└─────────────────────────────────────────────────────┘
```

**Where this applies:**

| Phase | Ensemble? | Why |
|-------|-----------|-----|
| Workshop/Brainstorm | Yes | Multiple perspectives = richer ideas |
| Planning | Yes | Different approaches to same problem |
| Architecture | Yes | Trade-offs seen differently by models |
| Execution | No | One source of truth for code |
| Debugging | Maybe | Different diagnostic approaches |
| Audit | No | One authoritative verdict |

**Implementation options:**

**A) Parallel proposals (if cheap/fast matters)**
```
spawn(claude, "propose plan for X") 
spawn(gemini, "propose plan for X")
spawn(gpt, "propose plan for X")
await all
judge(opus, [planA, planB, planC])
```

**B) Sequential proposals (simpler)**
```
planA = claude("propose plan for X")
planB = gemini("propose plan for X, consider: " + planA)
planC = gpt("propose plan for X, consider: " + planA + planB)
final = opus("judge these plans: " + all)
```

Sequential lets later models build on earlier ones. More expensive but richer.

---

### Problem 4: Underwhelming Linear Flow

**Current:**
```
[Plan] → [Execute] → [Audit]
  │          │          │
  └──────────┴──────────┘
        One model
        One perspective
        One path
```

**Proposed:**
```
[Workshop] ─── Ensemble ───→ [Direction]
     │
     ↓
[Plan] ─── Ensemble ───→ [Best Plan]
     │                        │
     │    ┌───────────────────┘
     ↓    ↓
[Decompose] → [Task 1] → [Task 2] → [Task 3]
                 │           │          │
              Backend    Frontend    Tests
              (Sonnet)   (Gemini)   (Sonnet)
                 │           │          │
                 └─────┬─────┴──────────┘
                       ↓
                 [Integrate]
                       │
                       ↓
                 [Audit] ← Opus
                       │
                       ↓
                    [Done]
```

**Key improvements:**
1. Workshop phase with ensemble (not just planning)
2. Multiple plan proposals, best one selected
3. Decomposition into specialized tasks
4. Model routing by task type
5. Integration phase before audit
6. Opus for high-stakes decisions (judging, auditing)

---

## The Workflow Model

### Proposed Workflow Definition

```yaml
# workflows/feature-build.yaml
name: feature-build
description: "Full feature development with ensemble planning"

phases:
  - name: workshop
    type: ensemble
    models: [claude-sonnet, gemini-pro, gpt-4o]
    judge: claude-opus
    output: docs/ai/{feature}/workshop/direction.md
    
  - name: plan
    type: ensemble  
    models: [claude-sonnet, gemini-pro]
    judge: claude-opus
    input: workshop.output
    output: docs/ai/{feature}/plan.md
    
  - name: decompose
    type: single
    model: claude-opus
    input: plan.output
    output: docs/ai/{feature}/tasks.md
    
  - name: execute
    type: routed
    routing:
      frontend: gemini-pro
      backend: claude-sonnet
      test: claude-sonnet
    input: decompose.output
    context_strategy: scoped  # Only relevant files
    
  - name: integrate
    type: single
    model: claude-sonnet
    input: execute.outputs
    
  - name: audit
    type: single
    model: claude-opus
    input: [plan.output, integrate.output]
    output: docs/ai/{feature}/audits/verdict.md
```

### Phase Types

| Type | Behavior |
|------|----------|
| `ensemble` | Multiple models propose, judge picks/synthesizes |
| `single` | One model, one output |
| `routed` | Tasks assigned to models by category |
| `parallel` | Multiple tasks run simultaneously (future) |

### Context Strategies

| Strategy | Behavior |
|----------|----------|
| `full` | All accumulated context (default, dangerous) |
| `scoped` | Only files relevant to current task |
| `distilled` | Summary of previous phases, not raw content |
| `fresh` | Start clean, explicit inputs only |

---

## Position

**Build a workflow engine that supports:**

1. **Ensemble phases** — Multiple models propose, Opus judges
2. **Model routing** — Role-based model assignment
3. **Context strategies** — Explicit control over what each phase sees
4. **Declarative workflows** — YAML definitions, not hardcoded logic

**Start with these workflows:**
- `workshop.yaml` — Ensemble brainstorming
- `plan.yaml` — Ensemble planning with judge
- `feature-build.yaml` — Full workflow (workshop → plan → execute → audit)

**Implementation priority:**
1. Model routing (biggest bang for buck)
2. Context strategies (solves pollution)
3. Ensemble phases (unlock multi-perspective)
4. Workflow YAML engine (ties it together)

---

## What I'd Push Back On

**Ensemble everything is expensive.**

3 models × planning = 3× cost. Only use ensemble where multiple perspectives actually matter:
- ✅ Workshop (divergent thinking)
- ✅ Planning (architectural decisions)
- ✅ Debugging (different diagnostic lenses)
- ❌ Execution (one source of truth)
- ❌ Quick edits (not worth it)
- ❌ Formatting/linting (waste of money)

**Judge overhead.**

Every ensemble needs a judge call. That's 4 API calls per ensemble phase (3 propose + 1 judge). Budget accordingly.

---

## Questions

### Answered
- **Q:** Parallelism for editing? **A:** No, too dangerous (your call)
- **Q:** Parallelism for planning/audit? **A:** Maybe, ensemble is more valuable than pure parallel

### For You

1. **Which models do you have access to?** (Opus, Gemini, GPT-4 — need to know constraints)

2. **Workflow engine: where does it run?**
   - Option A: Runtime TypeScript (needs execution environment)
   - Option B: Generated agent instructions (fits our config generator)
   - Option C: Shell scripts orchestrating OpenCode (hacky but works)

3. **Ensemble depth:** 
   - 2 models + judge (cheaper)
   - 3 models + judge (richer)
   - User configurable?

4. **Context handoff format:**
   - Markdown summaries (human readable)
   - JSON state (machine parseable)
   - Both?

---

## Next

- [ ] Decision: Ensemble for workshop + planning, single for execute/audit?
- [ ] Decision: Where does workflow engine live?
- [ ] Define: Model routing config structure
- [ ] Define: Context distillation format between phases
