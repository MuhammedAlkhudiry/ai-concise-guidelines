# Plan: Orchestrator Workflow

Level: 8 | Status: draft | Created: 2024-12-30

## Goal

Build a multi-model orchestration system where a **Coordinator agent** spawns specialized subagents, leveraging **ensemble thinking** (multiple models propose, coordinator judges) and **context isolation** (each subagent starts fresh).

## Scope

**In scope:**
- Coordinator agent (the brain/judge)
- Proposer subagent (generic, reused with different model configs)
- Reviewer subagent (generic, reused with different model configs)
- Model configuration system (configurable, not hardcoded)
- Agent configuration for all variants
- Generator updates to support new agent types
- Full workflow: Workshop → Plan → Execute → Audit

**Out of scope:**
- Workflow YAML definitions (v2)
- Parallel subagent spawning (v2, depends on OpenCode support)
- Cost tracking/budgets (v2)
- Model fallback strategies (v2)
- Web UI or external tooling

## Approach

### Architecture

```
USER: "Build feature X"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATOR (configurable)               │
│  Context: goal + workflow-state.json (LEAN)                │
│  Role: Spawns subagents, judges results, routes execution  │
└─────────────────────────────────────────────────────────────┘
         │
         │ Ensemble phases (configurable N models)
         ├──→ spawn proposer-1 ──→ proposal A
         ├──→ spawn proposer-2 ──→ proposal B
         ├──→ spawn proposer-3 ──→ proposal C
         │
         │ Coordinator JUDGES → picks/synthesizes best
         │
         │ Execute phase (dynamic scopes)
         ├──→ spawn executor (scope: determined by coordinator)
         ├──→ spawn executor (scope: determined by coordinator)
         │
         │ Audit phase (configurable N reviewers)
         ├──→ spawn reviewer-1 ──→ findings A
         ├──→ spawn reviewer-2 ──→ findings B
         ├──→ spawn reviewer-3 ──→ findings C
         │
         │ Coordinator JUDGES → APPROVED or FIX LIST
         ▼
       [DONE]
```

### Key Design Decisions

| Decision | Chosen | Why |
|----------|--------|-----|
| Models | Configurable slots, not hardcoded providers | User may use any models |
| Execution scopes | Dynamic (coordinator decides per-task) | Tasks vary; "backend/frontend" is just one pattern |
| Instructions | DRY - one proposer.md, one reviewer.md | Reused with different model configs |
| Coordinator role | Primary agent (Tab to switch) | Natural UX, explicit opt-in |
| State | File-based (markdown + JSON) | Fits existing patterns, no infrastructure |

### File Structure

```
config/
├── models.ts              # UPDATE: Add ensemble config
├── agents.ts              # UPDATE: Add coordinator + ensemble subagents
└── skills.ts              # NO CHANGE

content/instructions/
├── coordinator.md         # NEW: The orchestration brain (ONLY new instruction)
├── plan.md                # REUSE: For planning proposals
├── workshop.md            # REUSE: For workshop proposals  
├── auditor.md             # REUSE: For review/audit
└── execution.md           # REUSE: For execution

output/opencode/agents/    # GENERATED
├── coordinator.md         # Primary agent (NEW instruction)
├── planner-1.md           # Subagent: plan.md + ensemble_1
├── planner-2.md           # Subagent: plan.md + ensemble_2
├── planner-3.md           # Subagent: plan.md + ensemble_3
├── workshopper-1.md       # Subagent: workshop.md + ensemble_1
├── workshopper-2.md       # Subagent: workshop.md + ensemble_2
├── workshopper-3.md       # Subagent: workshop.md + ensemble_3
├── auditor-1.md           # Subagent: auditor.md + ensemble_1
├── auditor-2.md           # Subagent: auditor.md + ensemble_2
├── auditor-3.md           # Subagent: auditor.md + ensemble_3
```

**DRY Principle**: One instruction, multiple agents with different models.

## Phases

### Phase 1: Model Configuration
- [ ] 1.1 Update `config/models.ts` — Add ensemble model slots (configurable) `[config/models.ts:1-12]`
- [ ] 1.2 Update `ModelType` to support ensemble config

### Phase 2: Clean Up Existing Instructions (Self-Contained)

Instructions should be **pure capabilities** — they don't know about other agents or workflow structure. The coordinator handles orchestration.

**Analysis of all 15 instruction files:**

| File | Status | Action |
|------|--------|--------|
| execution.md | 🔴 HEAVY | Remove Audit Gate (lines 9-107), spawning, changes.log, escalations |
| auditor.md | 🟡 MEDIUM | Make generic, remove specific path expectations |
| plan.md | 🟡 LIGHT | Remove "once approved, execute ALL items" workflow assumption |
| api-handoff.md | ✅ | No change (file path is output convention) |
| backend-requirements.md | ✅ | No change |
| code-review.md | ✅ | No change (fully self-contained) |
| debugging.md | ✅ | No change |
| feature-research.md | ✅ | No change |
| frontend-design.md | ✅ | No change ("Switch to Build" is guidance) |
| product-strategy.md | ✅ | No change |
| quick-edits.md | ✅ | No change |
| refactoring.md | ✅ | No change |
| translation.md | ✅ | No change |
| workshop.md | ✅ | No change |
| user-story-review.md | ✅ | No change |

**Tasks:**
- [ ] 2.1 Clean `execution.md` — Remove Audit Gate section (lines 9-107), auditor spawning, changes.log, escalations. Keep only "how to write good code".
- [ ] 2.2 Clean `auditor.md` — Remove workflow-specific paths (`docs/ai/<feature>/audits/`), make generic. Input comes from coordinator.
- [ ] 2.3 Clean `plan.md` — Remove "FINISH THE PLAN—once approved, execute ALL items" (line 157). Planning is just planning.

### Phase 3: Coordinator Instruction
- [ ] 3.1 Write `content/instructions/coordinator.md` — The brain that spawns and judges. Owns all workflow logic that was removed from other instructions.

### Phase 4: Agent Configuration
- [ ] 4.1 Update `config/agents.ts` — Add coordinator as primary agent
- [ ] 4.2 Update `config/agents.ts` — Add planner-1, planner-2, planner-3 (reuse plan.md + ensemble models)
- [ ] 4.3 Update `config/agents.ts` — Add workshopper-1, workshopper-2, workshopper-3 (reuse workshop.md + ensemble models)
- [ ] 4.4 Update `config/agents.ts` — Add auditor-1, auditor-2, auditor-3 (reuse auditor.md + ensemble models)
- [ ] 4.5 Update `AgentConfig` interface if needed for ensemble model references

### Phase 5: Generator Updates
- [ ] 5.1 Review `generate.ts` — Ensure it handles new agent types correctly `[generate.ts:67-98]`
- [ ] 5.2 Run `bun generate.ts --clean` and verify output

### Phase 6: Testing & Validation
- [ ] 6.1 Test: Coordinator spawns subagents correctly
- [ ] 6.2 Test: Subagents return structured output
- [ ] 6.3 Test: Coordinator judges and synthesizes
- [ ] 6.4 Test: Full workflow (workshop → plan → execute → audit)
- [ ] 6.5 Update README.md with orchestrator documentation

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenCode subagent spawning may not support model override | High - core architecture depends on this | Test early in Phase 3; fallback to separate agent files per model |
| Coordinator context grows too large | Medium - defeats purpose | Strict handoff format; only summaries between phases |
| Ensemble is expensive for simple tasks | Medium - cost concern | Coordinator gates by complexity; simple tasks skip ensemble |
| Different models may return inconsistent formats | Medium - hard to judge | Proposer/reviewer instructions enforce strict output format |

## Decisions

| Decision | Chosen | Why | Alternatives Rejected |
|----------|--------|-----|----------------------|
| Trigger mechanism | Primary agent (Tab) | Natural UX, explicit | `/orchestrate` command (another thing to remember) |
| Model slots | 3 configurable | Balance of perspectives vs cost | 2 (too few), 5 (too expensive) |
| Execution routing | Dynamic by coordinator | Tasks vary widely | Fixed categories (too rigid) |
| Reviewer naming | `reviewer-N` | Distinct from existing `auditor` | Overloading `auditor` (confusing) |

## Questions

### Answered (for context)
- **Q**: Can OpenCode agents have different models? **A**: Yes, each agent can specify `model: provider/model-id` in frontmatter `[OpenCode docs]`
- **Q**: How do subagents get fresh context? **A**: Each Task() spawn starts fresh; coordinator passes only what's needed `[OpenCode architecture]`
- **Q**: Existing patterns for agents? **A**: See `config/agents.ts` — primary/sub types, instruction reference, model assignment `[config/agents.ts:19-56]`

### Blockers (need input)
- **Q**: None — ready to build

---

## Implementation Details

### 1. Models Config (Phase 1)

```typescript
// config/models.ts
export const MODELS = {
  // Existing
  smart: "anthropic/claude-sonnet-4",
  fast: "anthropic/claude-haiku-4",
  
  // Coordinator
  coordinator: "anthropic/claude-sonnet-4",
  
  // Ensemble (configurable slots — user changes these)
  ensemble_1: "anthropic/claude-sonnet-4",
  ensemble_2: "google/gemini-2.5-pro", 
  ensemble_3: "openai/gpt-4o",
  
  // Executor (defaults to smart, coordinator can override)
  executor: "anthropic/claude-sonnet-4",
} as const;

export type ModelType = keyof typeof MODELS;
```

### 2. Coordinator Instruction (Phase 2.1)

Core responsibilities:
- Receive task from user
- Assess complexity (skip ensemble for trivial)
- Spawn workshoppers/planners for ideation phases (reuse existing instructions)
- Judge proposals, synthesize best approach
- Decompose into execution scopes (dynamic, not fixed categories)
- Spawn executor(s) with scoped context
- Spawn auditors for review phase (reuse existing auditor.md)
- Judge reviews, produce final verdict
- Track state in `docs/ai/{feature}/workflow-state.json`

### 3. Agent Config (Phase 3) — DRY Approach

```typescript
// config/agents.ts additions
coordinator: {
  instruction: "coordinator",
  description: "Multi-model orchestrator. Spawns subagents, judges, synthesizes.",
  model: "coordinator",
  type: "primary",
},
// Planners — reuse plan.md with different models
"planner-1": {
  instruction: "plan",  // REUSE existing
  description: "Planning proposer (ensemble slot 1)",
  model: "ensemble_1",
  type: "sub",
},
"planner-2": {
  instruction: "plan",  // REUSE existing
  description: "Planning proposer (ensemble slot 2)",
  model: "ensemble_2",
  type: "sub",
},
"planner-3": {
  instruction: "plan",  // REUSE existing
  description: "Planning proposer (ensemble slot 3)",
  model: "ensemble_3",
  type: "sub",
},
// Workshoppers — reuse workshop.md with different models
"workshopper-1": {
  instruction: "workshop",  // REUSE existing
  description: "Workshop proposer (ensemble slot 1)",
  model: "ensemble_1",
  type: "sub",
},
// ... etc for workshopper-2, workshopper-3
// Auditors — reuse auditor.md with different models
"auditor-1": {
  instruction: "auditor",  // REUSE existing
  description: "Code reviewer (ensemble slot 1)",
  model: "ensemble_1",
  type: "sub",
},
// ... etc for auditor-2, auditor-3
```

---

## State Management

### Workflow State File

`docs/ai/{feature}/workflow-state.json`:

```json
{
  "feature": "user-authentication",
  "status": "executing",
  "current_phase": "execute",
  "phases": {
    "workshop": { "status": "completed", "output": "workshop/synthesis.md" },
    "plan": { "status": "completed", "output": "plan.md" },
    "execute": { "status": "in_progress", "scopes": ["api", "middleware"] },
    "audit": { "status": "pending" }
  },
  "proposals": {
    "workshop": ["workshop/proposal-1.md", "workshop/proposal-2.md", "workshop/proposal-3.md"],
    "plan": ["plan/proposal-1.md", "plan/proposal-2.md", "plan/proposal-3.md"]
  },
  "reviews": []
}
```

### Directory Structure Per Feature

```
docs/ai/{feature}/
├── workflow-state.json
├── workshop/
│   ├── proposal-1.md      # From proposer-1
│   ├── proposal-2.md      # From proposer-2
│   ├── proposal-3.md      # From proposer-3
│   └── synthesis.md       # Coordinator's judgment
├── plan/
│   ├── proposal-1.md
│   ├── proposal-2.md
│   ├── proposal-3.md
│   └── final.md           # Coordinator's chosen/merged plan
├── execute/
│   └── summary.md         # Execution summary
└── audit/
    ├── review-1.md        # From reviewer-1
    ├── review-2.md        # From reviewer-2
    ├── review-3.md        # From reviewer-3
    └── verdict.md         # Coordinator's final verdict
```

---

## Complexity Gating

Coordinator assesses task complexity:

| Complexity | Ensemble? | Flow |
|------------|-----------|------|
| Trivial | No | Direct execute → single reviewer |
| Simple | No | Single proposer → execute → single reviewer |
| Standard | Yes | 3 proposers → execute → 3 reviewers |
| Complex | Yes | Workshop (3) → Plan (3) → Execute → Audit (3) |

Coordinator decides based on:
- Task description keywords
- Scope (files/components affected)
- Risk level
- User override (`--full` or `--simple`)

---

## Status: READY TO BUILD

All questions answered. No blockers. Approved to execute.

**Execution order:**
1. Phase 1 (models) — foundation
2. Phase 2 (instructions) — core content
3. Phase 3 (agents) — configuration
4. Phase 4 (generator) — ensure output works
5. Phase 5 (testing) — validate full flow
