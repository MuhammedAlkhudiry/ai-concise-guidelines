# Orchestrator Workflow — Iteration 5 (Refined Architecture)

## Clarifications Applied

1. **Review = after execute** (the audit phase, not during planning)
2. **Coordinator = the judge** (synthesizes proposals, no separate judge agents)
3. **Models are configurable per agent** (OpenCode supports this natively)
4. **Subagents spawn fresh** (context isolation solved)

---

## OpenCode Capabilities (Confirmed)

From docs research:

| Feature | Support | How |
|---------|---------|-----|
| Different model per agent | ✅ Yes | `model: "provider/model-id"` in agent config |
| Subagent spawning | ✅ Yes | `@agentname` mention or automatic |
| Fresh context per subagent | ✅ Yes | Each spawn is independent |
| Skills (reusable instructions) | ✅ Yes | `SKILL.md` files loaded on-demand |
| Primary vs Subagent modes | ✅ Yes | `mode: "primary"` or `mode: "subagent"` |

**Limitation:** Subagents inherit parent model unless explicitly configured. So we need to define each model-specific agent explicitly.

---

## Refined Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATOR (Primary)                     │
│                                                              │
│  Model: Opus (best judgment)                                │
│  Role: Orchestrate, JUDGE proposals, synthesize, decide     │
│  Context: workflow-state + summaries only (stays lean)      │
│                                                              │
│  This IS the judge. No separate judge agents.               │
└─────────────────────────────────────────────────────────────┘
         │
         │ @spawn subagents
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROPOSER SUBAGENTS                        │
│                                                              │
│  proposer-claude   → model: anthropic/claude-sonnet-4       │
│  proposer-gemini   → model: google/gemini-2.5-pro           │
│  proposer-gpt      → model: openai/gpt-4o                   │
│                                                              │
│  Each spawns fresh, reads codebase independently            │
│  Returns: structured proposal                               │
└─────────────────────────────────────────────────────────────┘
         │
         │ proposals return to coordinator
         ▼
┌─────────────────────────────────────────────────────────────┐
│              COORDINATOR JUDGES & SYNTHESIZES                │
│                                                              │
│  - Evaluates 3 proposals                                    │
│  - Picks winner OR merges best parts                        │
│  - Moves to next phase                                      │
└─────────────────────────────────────────────────────────────┘
         │
         │ @spawn executors (specialized by domain)
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXECUTOR SUBAGENTS                        │
│                                                              │
│  executor-frontend → model: google/gemini-2.5-pro           │
│  executor-backend  → model: anthropic/claude-sonnet-4       │
│  executor-test     → model: anthropic/claude-sonnet-4       │
│                                                              │
│  Each gets scoped context (only relevant files)             │
│  Returns: changes made + summary                            │
└─────────────────────────────────────────────────────────────┘
         │
         │ execution complete, spawn auditors
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AUDITOR SUBAGENTS                         │
│                                                              │
│  auditor-claude    → model: anthropic/claude-sonnet-4       │
│  auditor-gemini    → model: google/gemini-2.5-pro           │
│  auditor-gpt       → model: openai/gpt-4o                   │
│                                                              │
│  Each reviews changes from fresh perspective                │
│  Returns: findings (blockers, warnings, suggestions)        │
└─────────────────────────────────────────────────────────────┘
         │
         │ audit findings return to coordinator
         ▼
┌─────────────────────────────────────────────────────────────┐
│              COORDINATOR SYNTHESIZES VERDICT                 │
│                                                              │
│  - Merges 3 audit reports                                   │
│  - ANY blocker from ANY auditor = REJECT                    │
│  - Otherwise = APPROVED (with merged warnings)              │
└─────────────────────────────────────────────────────────────┘
```

---

## The Full Flow

```
USER: "Build feature X"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: WORKSHOP (Ensemble Propose)                        │
│                                                              │
│  Coordinator spawns:                                        │
│    @proposer-claude "explore approaches for X"              │
│    @proposer-gemini "explore approaches for X"              │
│    @proposer-gpt "explore approaches for X"                 │
│                                                              │
│  Coordinator receives 3 proposals                           │
│  Coordinator JUDGES: picks direction or merges              │
│  Output: docs/ai/X/workshop/direction.md                    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: PLAN (Ensemble Propose)                            │
│                                                              │
│  Coordinator spawns:                                        │
│    @proposer-claude "create plan for X given direction"     │
│    @proposer-gemini "create plan for X given direction"     │
│    @proposer-gpt "create plan for X given direction"        │
│                                                              │
│  Coordinator receives 3 plans                               │
│  Coordinator JUDGES: picks best plan or merges              │
│  Output: docs/ai/X/plan/final.md                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: DECOMPOSE (Single)                                 │
│                                                              │
│  Coordinator breaks plan into tasks:                        │
│    - Task 1: Backend API (type: backend)                    │
│    - Task 2: Frontend UI (type: frontend)                   │
│    - Task 3: Tests (type: test)                             │
│                                                              │
│  Output: docs/ai/X/tasks.json                               │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 4: EXECUTE (Routed by domain)                         │
│                                                              │
│  Coordinator spawns per task type:                          │
│    @executor-backend "implement Task 1"                     │
│    @executor-frontend "implement Task 2"                    │
│    @executor-test "implement Task 3"                        │
│                                                              │
│  Each executor gets ONLY relevant context                   │
│  Output: code changes + docs/ai/X/execution/summary.md      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 5: AUDIT (Ensemble Review)                            │
│                                                              │
│  Coordinator spawns:                                        │
│    @auditor-claude "review changes for X"                   │
│    @auditor-gemini "review changes for X"                   │
│    @auditor-gpt "review changes for X"                      │
│                                                              │
│  Coordinator receives 3 audit reports                       │
│  Coordinator JUDGES: merge findings, determine verdict      │
│                                                              │
│  If REJECTED: return to EXECUTE with issues                 │
│  If APPROVED: workflow complete                             │
│                                                              │
│  Output: docs/ai/X/audits/verdict.md                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Definitions

### Primary Agent: Coordinator

```yaml
# config/agents.ts or .opencode/agent/coordinator.md
name: coordinator
mode: primary
model: anthropic/claude-opus-4  # Best judgment
description: "Orchestrates complex workflows with ensemble thinking"

# Coordinator does NOT edit code directly
tools:
  write: true   # For workflow state files only
  edit: false   # Delegates to executors
  bash: false   # Delegates to executors
```

**Coordinator instructions (content/instructions/coordinator.md):**
- Parse workflow state
- Spawn appropriate subagents with minimal context
- JUDGE proposals (don't delegate judgment)
- Synthesize results
- Manage phase transitions
- Track costs

### Subagents: Proposers (One per model)

```yaml
# proposer-claude
name: proposer-claude
mode: subagent
model: anthropic/claude-sonnet-4
description: "Generates proposals using Claude's perspective"
tools:
  write: true   # For proposal files
  edit: false
  bash: false

# proposer-gemini
name: proposer-gemini
mode: subagent
model: google/gemini-2.5-pro
description: "Generates proposals using Gemini's perspective"
tools:
  write: true
  edit: false
  bash: false

# proposer-gpt
name: proposer-gpt
mode: subagent
model: openai/gpt-4o
description: "Generates proposals using GPT's perspective"
tools:
  write: true
  edit: false
  bash: false
```

### Subagents: Executors (Specialized by domain)

```yaml
# executor-frontend
name: executor-frontend
mode: subagent
model: google/gemini-2.5-pro  # Gemini good at frontend/visual
description: "Implements frontend tasks"
tools:
  write: true
  edit: true
  bash: true

# executor-backend
name: executor-backend
mode: subagent
model: anthropic/claude-sonnet-4  # Claude good at logic
description: "Implements backend tasks"
tools:
  write: true
  edit: true
  bash: true

# executor-test
name: executor-test
mode: subagent
model: anthropic/claude-sonnet-4
description: "Implements tests"
tools:
  write: true
  edit: true
  bash: true
```

### Subagents: Auditors (One per model, read-only)

```yaml
# auditor-claude
name: auditor-claude
mode: subagent
model: anthropic/claude-sonnet-4
description: "Reviews code changes for issues"
tools:
  write: true   # For audit report only
  edit: false
  bash: false

# auditor-gemini
name: auditor-gemini
mode: subagent
model: google/gemini-2.5-pro
description: "Reviews code changes for issues"
tools:
  write: true
  edit: false
  bash: false

# auditor-gpt
name: auditor-gpt
mode: subagent
model: openai/gpt-4o
description: "Reviews code changes for issues"
tools:
  write: true
  edit: false
  bash: false
```

---

## Context Flow (The Key Innovation)

```
PHASE 1: Workshop
├── Coordinator context: 1000 tokens
│   - Goal from user
│   - workflow-state.json
│
├── Spawns @proposer-claude with:
│   - Goal (500 tokens)
│   - Key constraints (500 tokens)
│   → Proposer reads codebase fresh (50k tokens, isolated)
│   → Returns proposal (2000 tokens)
│   → Proposer context DISCARDED
│
├── Spawns @proposer-gemini (same pattern)
├── Spawns @proposer-gpt (same pattern)
│
├── Coordinator receives: 3 × 2000 = 6000 tokens
├── Coordinator JUDGES, writes direction.md
├── Coordinator compresses to summary: 500 tokens
└── Coordinator total context: 1000 + 6000 + 500 = 7500 tokens

WITHOUT orchestration (single agent):
├── Agent accumulates everything: 150k+ tokens
├── Quality degrades
└── Often hits context limit
```

**10-20x more efficient context usage.**

---

## Files to Create

```
content/instructions/
├── coordinator.md          # NEW: Orchestration brain
├── proposer.md             # NEW: Generic proposal generator
├── executor.md             # EXISTING: Renamed from execution.md? Or separate?
├── auditor.md              # EXISTING: Enhance for multi-auditor

config/
├── agents.ts               # EXTEND: Add coordinator, proposers, executors, auditors
├── workflows/              # NEW: Workflow definitions
│   ├── feature-build.yaml
│   ├── quick-fix.yaml
│   └── exploration.yaml
└── models.ts               # EXTEND: Add model aliases

output/opencode/
├── agents/
│   ├── coordinator.md      # Generated
│   ├── proposer-claude.md  # Generated (3 variants)
│   ├── proposer-gemini.md
│   ├── proposer-gpt.md
│   ├── executor-frontend.md
│   ├── executor-backend.md
│   ├── executor-test.md
│   ├── auditor-claude.md   # Generated (3 variants)
│   ├── auditor-gemini.md
│   └── auditor-gpt.md
└── skills/
    └── orchestrate/        # Skill to invoke coordinator
        └── SKILL.md
```

---

## Open Questions (For You)

1. **Parallel vs Sequential proposers:**
   - Can coordinator spawn 3 subagents simultaneously?
   - Or must it be sequential? (slower but simpler)

2. **Workflow trigger:**
   - New `/orchestrate` command?
   - Or coordinator becomes a primary agent (Tab to switch)?
   - Or skill that any agent can invoke?

3. **Model configuration:**
   - Hardcode in agent definitions?
   - Or environment variables for flexibility?
   - Or both (defaults + overrides)?

4. **Scope for v1:**
   - Full workflow (workshop → plan → execute → audit)?
   - Or start simpler (just ensemble planning)?

---

## My Recommendation

**Start with ensemble planning only:**

```
USER: "/orchestrate plan feature X"
         │
         ▼
    Coordinator spawns 3 proposers
         │
         ▼
    Coordinator judges, picks winner
         │
         ▼
    Output: plan.md
```

Once that works, add:
1. Ensemble auditing
2. Routed execution
3. Full workshop phase

**Why:** Smaller scope = faster iteration = find problems early.
