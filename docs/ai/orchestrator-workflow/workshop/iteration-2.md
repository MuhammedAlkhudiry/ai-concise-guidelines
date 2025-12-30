# Orchestrator Workflow — Iteration 2

## Context

User decision: **Build our own orchestrator. Scope concerns dismissed.**

Now the question shifts from "should we" to "what exactly and how."

---

## My Understanding

You want orchestration capabilities built into this repo. Not a plugin for someone else's system—our own workflow that fits our methodology (Plan → Execute → Audit).

---

## Analysis

### What Problem Are We Solving?

Before architecture, let's nail the problem. Current limitations:

| Pain Point | Current State | With Orchestration |
|------------|---------------|-------------------|
| Sequential execution | One task at a time | Parallel sub-agents |
| Manual decomposition | User breaks down tasks | Agent decomposes automatically |
| Single model | Same model for everything | Route to best model per task |
| No coordination | Agents don't know about each other | Coordinator manages state |
| Lost context | Each agent starts fresh | Shared memory/context |

**Which of these matter to you?** This determines what we build.

### Architectural Options

**Option 1: Coordinator Agent (Lightweight)**

```
User Task
    ↓
┌─────────────────┐
│   Coordinator   │  ← New primary agent
│  (decomposes)   │
└────────┬────────┘
         │ spawns
    ┌────┴────┬────────┐
    ↓         ↓        ↓
┌───────┐ ┌───────┐ ┌───────┐
│ Sub 1 │ │ Sub 2 │ │ Sub 3 │  ← Existing agents as workers
└───────┘ └───────┘ └───────┘
    │         │        │
    └────┬────┴────────┘
         ↓
┌─────────────────┐
│    Auditor      │  ← Validates all work
└─────────────────┘
```

**Pros:** Simple, extends existing pattern, auditor still gates everything
**Cons:** No parallelism (sequential spawns), no shared memory

---

**Option 2: Swarm with Queen (claude-flow inspired)**

```
┌─────────────────────────────────────┐
│              Queen                  │
│  (strategic decisions, delegation)  │
└──────────────────┬──────────────────┘
                   │
     ┌─────────────┼─────────────┐
     ↓             ↓             ↓
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Worker  │  │ Worker  │  │ Worker  │
│ (plan)  │  │ (build) │  │ (test)  │
└─────────┘  └─────────┘  └─────────┘
     │             │             │
     └─────────────┴─────────────┘
                   ↓
            ┌───────────┐
            │  Memory   │  ← Persistent state
            │  (SQLite) │
            └───────────┘
```

**Pros:** True parallelism, persistent memory, sophisticated coordination
**Cons:** Complex, needs runtime infrastructure, not just config files

---

**Option 3: Pipeline with Stages (GitLab CI inspired)**

```yaml
# orchestrator.yaml
pipeline:
  - stage: plan
    agent: plan
    output: plan.md
    
  - stage: implement
    parallel:
      - agent: backend
        needs: [plan]
      - agent: frontend  
        needs: [plan]
        
  - stage: integrate
    agent: build
    needs: [backend, frontend]
    
  - stage: audit
    agent: auditor
    needs: [integrate]
```

**Pros:** Declarative, predictable, fits our config-generator nature
**Cons:** Less dynamic, can't adapt mid-execution

---

**Option 4: Event-Driven (oh-my-opencode inspired)**

```
┌──────────────────────────────────────┐
│            Event Bus                 │
│  task.created → task.assigned →      │
│  task.completed → audit.requested    │
└──────────────────────────────────────┘
        ↑               ↓
   ┌────┴────┐    ┌─────┴─────┐
   │ Agents  │    │ Listeners │
   │ (emit)  │    │ (react)   │
   └─────────┘    └───────────┘
```

**Pros:** Loosely coupled, extensible, async-native
**Cons:** Harder to reason about, needs event infrastructure

---

### What oh-my-opencode Got Right

Stealing ideas worth stealing:

1. **Model routing** — Their Sisyphus (Opus), Oracle (GPT), Librarian (Sonnet) pattern. Right model for right task.

2. **Async subagents** — Background execution while main agent continues. Not blocking.

3. **Todo enforcer** — Agent can't quit until checklist complete. We have this in auditor but could be stronger.

4. **Context injection** — AGENTS.md, README, rules auto-loaded. We do this, but could be more explicit.

### What claude-flow Got Right

1. **Persistent memory** — ReasoningBank survives restarts. Agents learn from past sessions.

2. **Semantic search** — Find similar past problems/solutions. Not just text matching.

3. **Fault tolerance** — Worker dies, queen reassigns. No single point of failure.

### Core Design Decisions

| Decision | Option A | Option B | My Lean |
|----------|----------|----------|---------|
| **Coordination model** | Single coordinator | Swarm/queen | Coordinator (simpler) |
| **Execution** | Sequential | Parallel | Sequential first, parallel later |
| **Memory** | Stateless | Persistent | File-based (fits our model) |
| **Configuration** | Code | YAML/declarative | YAML (we're a config generator) |
| **Model routing** | Static | Dynamic per task | Static per agent type |

---

## Position

**Start with Option 1 (Coordinator) + Option 3 (Pipeline YAML).**

Here's why:

1. **Coordinator is just another agent** — Fits our existing architecture. One new file in `content/instructions/coordinator.md`, one entry in `config/agents.ts`.

2. **Pipeline YAML is declarative** — Matches our "config generator" DNA. Users define workflows, generator produces agent instructions.

3. **Sequential first** — Get decomposition working before adding parallelism complexity.

4. **File-based memory** — We already write to `docs/ai/<feature>/`. Add `context.md` or `state.json` per workflow. No SQLite needed initially.

### Minimal Viable Orchestrator

```
New files:
├── content/instructions/coordinator.md   # Coordinator agent
├── config/workflows.ts                   # Workflow definitions
└── output/opencode/workflows/            # Generated workflow configs
```

**Coordinator agent responsibilities:**
1. Receive complex task from user
2. Decompose into sub-tasks
3. Assign each to appropriate agent (plan/build/frontend/quick-edits)
4. Track progress in `docs/ai/<task>/workflow-state.md`
5. Coordinate handoffs between agents
6. Final audit gate

---

## What I'd Push Back On

**Parallelism is seductive but dangerous.**

oh-my-opencode's async subagents are cool, but:
- Merge conflicts when agents edit same files
- Coordination overhead (which agent is source of truth?)
- Debugging nightmare (what ran when?)

**Recommendation:** Get sequential orchestration rock-solid before adding parallel. You can always add it; removing complexity is harder.

---

## Questions

### For You to Answer

1. **What's the trigger?** User says "orchestrate this" explicitly, or coordinator activates automatically for complex tasks?

2. **How deep is decomposition?** 
   - Shallow: "Build API" → [plan, implement, test]
   - Deep: "Build API" → [plan] → [design schema, design endpoints, design auth] → [implement each] → [test each] → [integrate]

3. **Model routing?** Same model for all, or different models for different agents? (e.g., Opus for coordinator, Sonnet for workers)

4. **Scope of orchestration?** 
   - Just this repo's agents?
   - Any OpenCode agent?
   - Cross-tool (spawn Claude Code, Cursor, etc.)?

### Blockers
- None yet, but scope question above is critical for architecture

---

## Next

- [ ] Decision: Coordinator + Pipeline YAML approach acceptable?
- [ ] Decision: Sequential first, parallel later?
- [ ] Define: What does a workflow YAML look like?
- [ ] Define: What does coordinator.md contain?
