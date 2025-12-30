# Orchestrator Workflow — Iteration 4 (ULTRATHINK)

## Context

**Confirmed decisions:**
- Models: configurable (not hardcoded)
- Architecture: Main agent spawning subagents
- Ensemble: 3 models
- Context: Subagent spawning solves pollution (each spawn = fresh)
- Planning: Multiple proposers + multiple reviewers
- Auditing: Multiple auditors, not single judge

**Key insight from user:** Spawning subagents inherently solves context pollution. Each subagent starts clean; coordinator passes only what's needed.

---

## Deep Analysis

### The Subagent Context Architecture

This is elegant. Let me trace it:

```
┌─────────────────────────────────────────────────────────────────┐
│                     COORDINATOR AGENT                            │
│                                                                  │
│  Context: workflow-state.json, goal, phase tracking             │
│  Role: Orchestrate, synthesize, decide transitions              │
│  Model: Opus (needs judgment for synthesis)                     │
│                                                                  │
│  Does NOT accumulate: file contents, code, raw outputs          │
│  Only holds: summaries, decisions, state                        │
└─────────────────────────────────────────────────────────────────┘
         │
         │ spawn(task, minimal_context)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUBAGENT (Fresh)                            │
│                                                                  │
│  Receives: Only what coordinator passes                         │
│  - Goal/task description                                        │
│  - Relevant file paths (reads them fresh)                       │
│  - Constraints/requirements                                     │
│  - Previous phase summary (NOT raw output)                      │
│                                                                  │
│  Returns: Structured output + summary                           │
│  Dies: Context garbage collected                                │
└─────────────────────────────────────────────────────────────────┘
```

**Why this works:**
1. Coordinator stays lean (state + summaries only)
2. Subagents read files fresh (no stale context)
3. Each subagent gets full context window for its task
4. No cross-contamination between phases
5. Summaries compress knowledge; raw data discarded

**Context flow example:**

```
Phase 1: Workshop
├── Coordinator context: 500 tokens (goal + state)
├── Spawns 3 proposers, each gets: 2000 tokens (goal + requirements)
├── Each proposer reads codebase: +50,000 tokens (fresh per agent)
├── Each proposer outputs: 3000 token proposal
├── Coordinator receives: 3 × 3000 = 9000 tokens (proposals only)
├── Spawns 3 reviewers, each gets: 9000 tokens (all proposals)
├── Each reviewer outputs: 1000 token verdict
├── Coordinator receives: 3 × 1000 = 3000 tokens
├── Coordinator synthesizes: 500 token direction
└── Coordinator total context: 500 + 9000 + 3000 = 12,500 tokens

WITHOUT subagents (single agent):
├── Reads codebase: 50,000 tokens
├── Generates 3 plans internally: context keeps growing
├── Reviews internally: context still growing
├── By end: 100,000+ tokens, degraded quality
```

**10x context efficiency.** The math is compelling.

---

### Ensemble Patterns

#### Pattern 1: Propose-Review (for Planning/Workshop)

```
                    PROPOSE PHASE
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │ Claude  │     │ Gemini  │     │  GPT    │
    │ Prop A  │     │ Prop B  │     │ Prop C  │
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         └───────────────┴───────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ Coordinator │
                  │  (collects) │
                  └──────┬──────┘
                         │
                    REVIEW PHASE
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │Review 1 │     │Review 2 │     │Review 3 │
    │(Claude) │     │(Gemini) │     │ (GPT)   │
    │scores A │     │scores A │     │scores A │
    │scores B │     │scores B │     │scores B │
    │scores C │     │scores C │     │scores C │
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         └───────────────┴───────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ Coordinator │
                  │(synthesize) │
                  │ Pick/Merge  │
                  └─────────────┘
```

**Scoring matrix:**

|           | Reviewer 1 | Reviewer 2 | Reviewer 3 | Avg  |
|-----------|------------|------------|------------|------|
| Plan A    | 8          | 7          | 9          | 8.0  |
| Plan B    | 6          | 9          | 7          | 7.3  |
| Plan C    | 7          | 6          | 8          | 7.0  |

Winner: Plan A (or coordinator synthesizes best parts of each).

**Why 3 reviewers, not 1:**
- Each model has blind spots
- Claude might overvalue elegance
- GPT might overvalue safety
- Gemini might overvalue simplicity
- Combined scoring is more robust

---

#### Pattern 2: Multi-Lens Audit (for Code Review)

Different auditors examine different concerns:

```
                    CODE CHANGES
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │Security │     │  Logic  │     │  Style  │
    │ Auditor │     │ Auditor │     │ Auditor │
    │         │     │         │     │         │
    │• Auth   │     │• Correct│     │• Naming │
    │• Inject │     │• Edge   │     │• Pattern│
    │• Leak   │     │• Perf   │     │• Consist│
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         ▼               ▼               ▼
    [Findings]      [Findings]      [Findings]
         │               │               │
         └───────────────┴───────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ Coordinator │
                  │  (merges)   │
                  │             │
                  │ APPROVED /  │
                  │ REJECTED +  │
                  │ ALL issues  │
                  └─────────────┘
```

**Auditor specializations:**

| Auditor | Focus | Catches |
|---------|-------|---------|
| Security | Vulnerabilities | SQL injection, auth bypass, data leaks, XSS |
| Logic | Correctness | Off-by-one, null handling, race conditions, edge cases |
| Style | Consistency | Naming, patterns, architecture fit, code smells |
| Performance | Efficiency | N+1 queries, memory leaks, algorithmic complexity |
| UX (for frontend) | User experience | Accessibility, responsiveness, error states |

**Why multi-lens:**
- Single auditor context-switches between concerns
- Specialized auditor goes deeper on one concern
- Combined coverage > single comprehensive review
- Different models might excel at different audits (GPT good at security, Claude good at logic)

---

#### Pattern 3: Debate (for Controversial Decisions)

When reviewers disagree significantly:

```
Reviews show disagreement:
├── Reviewer 1: Plan A (score 9)
├── Reviewer 2: Plan B (score 9)  
├── Reviewer 3: Plan A (score 5), Plan B (score 5)
└── No clear winner

         DEBATE PHASE
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌─────────┐       ┌─────────┐
│ Claude  │ ◄───► │ Gemini  │
│ (Pro A) │       │ (Pro B) │
└────┬────┘       └────┬────┘
     │                 │
     │ "A is better    │ "B is better
     │  because..."    │  because..."
     │                 │
     └────────┬────────┘
              │
              ▼
       ┌─────────────┐
       │    Opus     │
       │  (Arbiter)  │
       │             │
       │ Weighs args │
       │ Final call  │
       └─────────────┘
```

**When to trigger debate:**
- Score variance > threshold (e.g., std dev > 2)
- Reviewers explicitly flag "controversial"
- High-stakes decision (architecture, security)

**Debate is expensive** — only for truly contested decisions.

---

### The Coordinator Agent Design

This is the heart of the system. Let me spec it properly.

```markdown
# Coordinator Agent

## Role
Orchestrate complex workflows by decomposing tasks, spawning specialized 
subagents, synthesizing results, and managing phase transitions.

## Capabilities
1. Parse workflow definitions (YAML)
2. Track workflow state (current phase, completed phases, decisions)
3. Spawn subagents with minimal, focused context
4. Collect and synthesize subagent outputs
5. Make transition decisions (next phase, retry, escalate)
6. Handle failures gracefully

## What Coordinator Does NOT Do
- Read large codebases directly (delegates to subagents)
- Write code (delegates to execution subagents)
- Make specialized judgments (delegates to reviewers/auditors)

## Context Management
Coordinator maintains ONLY:
- workflow-state.json (current state)
- Phase summaries (compressed outputs)
- Decision log (what was decided and why)

Coordinator DISCARDS:
- Raw subagent outputs (after summarizing)
- File contents (never reads directly)
- Intermediate work products
```

**Coordinator prompting pattern:**

```
You are the Coordinator for workflow: {workflow_name}

Current state:
{workflow_state_json}

Your task: {current_phase_description}

Previous phase summary:
{previous_phase_summary}

Instructions:
1. Spawn the required subagents for this phase
2. Pass each subagent ONLY the context listed in the phase spec
3. Collect their outputs
4. Synthesize a summary and decision
5. Update workflow state
6. Determine next phase

Phase specification:
{phase_yaml}

Output format:
- Subagent spawns (with exact context to pass)
- Synthesis of results  
- Decision/outcome
- Next phase recommendation
```

---

### Workflow YAML Schema (Refined)

```yaml
# workflows/feature-build.yaml
name: feature-build
version: 1.0
description: "Full feature development with ensemble planning and multi-lens audit"

# Model configuration (overridable per workflow)
models:
  coordinator: ${COORDINATOR_MODEL:-claude-opus}
  proposer: ${PROPOSER_MODELS:-[claude-sonnet, gemini-pro, gpt-4o]}
  reviewer: ${REVIEWER_MODELS:-[claude-sonnet, gemini-pro, gpt-4o]}
  executor:
    frontend: ${FRONTEND_MODEL:-gemini-pro}
    backend: ${BACKEND_MODEL:-claude-sonnet}
    test: ${TEST_MODEL:-claude-sonnet}
  auditor: ${AUDITOR_MODELS:-[claude-sonnet, gemini-pro, gpt-4o]}

# Context passed between phases
context_contracts:
  workshop_output:
    type: summary
    max_tokens: 2000
    includes: [direction, key_decisions, constraints, open_questions]
  
  plan_output:
    type: structured
    max_tokens: 5000
    includes: [goal, scope, phases, tasks, risks, decisions]
  
  execution_output:
    type: summary
    max_tokens: 3000
    includes: [files_changed, key_changes, gotchas, test_results]

# Phase definitions
phases:
  - name: workshop
    type: ensemble-propose-review
    description: "Explore approaches, surface trade-offs"
    
    propose:
      models: ${models.proposer}
      context:
        - goal (from user)
        - requirements.md (if exists)
        - AGENTS.md (project conventions)
      prompt_template: workshop-propose
      output: docs/ai/{feature}/workshop/proposals/
    
    review:
      models: ${models.reviewer}
      context:
        - all proposals (from propose phase)
        - evaluation criteria
      prompt_template: workshop-review
      scoring: [feasibility, clarity, innovation, risk]
      output: docs/ai/{feature}/workshop/reviews/
    
    synthesize:
      model: ${models.coordinator}
      strategy: weighted-merge  # or: pick-winner, debate-if-contested
      output: docs/ai/{feature}/workshop/direction.md
    
    pass_forward: workshop_output

  - name: plan
    type: ensemble-propose-review
    description: "Generate detailed implementation plan"
    
    propose:
      models: ${models.proposer}
      context:
        - workshop_output (from previous phase)
        - existing code patterns (auto-discovered)
      prompt_template: plan-propose
      output: docs/ai/{feature}/plan/proposals/
    
    review:
      models: ${models.reviewer}
      context:
        - all proposals
        - workshop direction
      prompt_template: plan-review
      scoring: [completeness, feasibility, risk_handling, clarity]
      output: docs/ai/{feature}/plan/reviews/
    
    synthesize:
      model: ${models.coordinator}
      strategy: pick-winner-with-amendments
      output: docs/ai/{feature}/plan/final.md
    
    pass_forward: plan_output

  - name: decompose
    type: single
    description: "Break plan into executable tasks"
    model: ${models.coordinator}
    context:
      - plan_output
    prompt_template: decompose
    output: docs/ai/{feature}/tasks.json
    
    # Output structure
    produces:
      tasks:
        - id: string
          type: frontend | backend | test | integration
          description: string
          dependencies: [task_ids]
          context_files: [file_paths]

  - name: execute
    type: routed
    description: "Execute each task with specialized model"
    
    routing:
      frontend: ${models.executor.frontend}
      backend: ${models.executor.backend}
      test: ${models.executor.test}
      integration: ${models.coordinator}
    
    per_task:
      context:
        - task definition (from decompose)
        - task.context_files (read fresh)
        - plan_output.relevant_section
      context_strategy: scoped  # only files relevant to task
      output: docs/ai/{feature}/execution/{task_id}/
    
    pass_forward: execution_output

  - name: audit
    type: multi-lens
    description: "Multi-perspective code review"
    
    lenses:
      - name: security
        model: ${models.auditor[0]}
        focus: [auth, injection, data_exposure, xss, csrf]
        prompt_template: audit-security
        
      - name: logic
        model: ${models.auditor[1]}
        focus: [correctness, edge_cases, error_handling, null_safety]
        prompt_template: audit-logic
        
      - name: consistency
        model: ${models.auditor[2]}
        focus: [patterns, naming, architecture_fit, code_style]
        prompt_template: audit-consistency
    
    context:
      - plan_output
      - execution_output
      - changed files (read fresh)
    
    synthesis:
      model: ${models.coordinator}
      threshold:
        blockers: 0      # any blocker = reject
        warnings: 5      # more than 5 warnings = reject
      output: docs/ai/{feature}/audits/verdict.md
    
    outcomes:
      approved: complete workflow
      rejected: return to execute with issues

# Error handling
on_failure:
  phase_timeout: 5 minutes
  max_retries: 2
  escalation: pause and notify user
```

---

### State Management

```json
// docs/ai/{feature}/workflow-state.json
{
  "workflow": "feature-build",
  "feature": "user-authentication",
  "started_at": "2024-01-15T10:00:00Z",
  "current_phase": "execute",
  "phases_completed": [
    {
      "name": "workshop",
      "completed_at": "2024-01-15T10:15:00Z",
      "outcome": "direction established",
      "proposals": 3,
      "reviews": 3,
      "winner": "proposal-claude"
    },
    {
      "name": "plan", 
      "completed_at": "2024-01-15T10:30:00Z",
      "outcome": "plan approved",
      "proposals": 3,
      "reviews": 3,
      "winner": "proposal-gemini (amended)"
    },
    {
      "name": "decompose",
      "completed_at": "2024-01-15T10:35:00Z",
      "outcome": "5 tasks created",
      "tasks": ["task-1", "task-2", "task-3", "task-4", "task-5"]
    }
  ],
  "current_phase_state": {
    "tasks_completed": ["task-1", "task-2"],
    "tasks_in_progress": ["task-3"],
    "tasks_pending": ["task-4", "task-5"]
  },
  "context_summaries": {
    "workshop": "Direction: REST API with JWT auth. Key decisions: ...",
    "plan": "5-phase implementation. Phase 1: schema. Phase 2: ...",
    "execution": "Completed: User model, AuthController. Pending: ..."
  },
  "cost_tracking": {
    "total_tokens": 150000,
    "estimated_cost": "$2.40",
    "by_phase": {
      "workshop": { "tokens": 45000, "cost": "$0.70" },
      "plan": { "tokens": 60000, "cost": "$0.95" },
      "decompose": { "tokens": 5000, "cost": "$0.08" },
      "execute": { "tokens": 40000, "cost": "$0.67" }
    }
  }
}
```

---

### Implementation Files

What we need to build:

```
content/instructions/
├── coordinator.md          # Main orchestrator agent
├── proposer.md             # Generic proposal generator
├── reviewer.md             # Generic proposal reviewer  
├── auditor-security.md     # Security-focused auditor
├── auditor-logic.md        # Logic-focused auditor
├── auditor-consistency.md  # Style/pattern auditor

config/
├── models.ts               # Model definitions (extended)
├── agents.ts               # Agent configs (extended)
├── workflows.ts            # Workflow definitions
└── prompts/                # Prompt templates
    ├── workshop-propose.md
    ├── workshop-review.md
    ├── plan-propose.md
    ├── plan-review.md
    ├── decompose.md
    ├── audit-security.md
    ├── audit-logic.md
    └── audit-consistency.md

output/opencode/
├── agents/
│   ├── coordinator.md      # Generated
│   ├── proposer.md         # Generated
│   └── reviewer.md         # Generated
├── skills/
│   └── orchestrator/       # Skill for invoking workflows
│       └── SKILL.md
└── workflows/              # Generated workflow configs
    ├── feature-build.yaml
    ├── quick-fix.yaml
    └── exploration.yaml
```

---

## Position

**This architecture is sound.** The key insights:

1. **Subagent spawning = context isolation** — Elegant solution to pollution
2. **Propose-Review > Single Judge** — More robust decisions
3. **Multi-lens audit > Single auditor** — Better coverage
4. **Coordinator stays lean** — Only state + summaries
5. **File-based state** — Fits our config-generator nature
6. **YAML workflows** — Declarative, customizable, versionable

**What I'd build first (priority order):**

1. **Coordinator agent** — The orchestration brain
2. **Workflow YAML parser** — Turn YAML into agent spawns
3. **Propose-Review pattern** — For workshop and planning
4. **Multi-lens audit** — Specialized auditors
5. **State management** — workflow-state.json conventions

**Risks I still see:**

| Risk | Mitigation |
|------|------------|
| Coordinator becomes bottleneck | Keep it lean; it synthesizes, doesn't do work |
| Subagent spawning overhead | Batch where possible; parallel spawns |
| Cost explosion (many agents) | Track costs; budget limits per workflow |
| Lost context in summaries | Good summarization prompts; structured outputs |
| Workflow debugging | Detailed state logging; step replay |

---

## Open Design Questions

1. **Subagent invocation mechanism:**
   - OpenCode's `Task()` tool?
   - Custom MCP tool?
   - Shell script spawning OpenCode instances?

2. **Model switching:**
   - How does coordinator spawn a Gemini subagent vs Claude subagent?
   - Does OpenCode support this? Or do we need external orchestration?

3. **Parallel execution:**
   - Can we spawn multiple subagents simultaneously?
   - If not, sequential is fine but slower

4. **Cost controls:**
   - Hard limits per workflow?
   - Approval gates for expensive phases?

---

## Next Steps

- [ ] Validate: Can OpenCode spawn subagents with different models?
- [ ] Prototype: Coordinator agent with simple propose-review flow
- [ ] Define: Prompt templates for each role
- [ ] Test: Run a real feature through the workflow
