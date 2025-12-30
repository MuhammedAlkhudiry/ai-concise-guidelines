# Orchestrator Workflow — Final Synthesis (ULTRATHINK)

## What We're Building

A multi-model orchestration system where a **Coordinator agent** spawns specialized subagents, leveraging **ensemble thinking** (multiple models propose, coordinator judges) and **context isolation** (each subagent starts fresh).

---

## What We HAVE (Decided)

### Architecture

| Decision | Details |
|----------|---------|
| **Coordinator = Judge** | Main agent synthesizes/judges. No separate judge agents. |
| **Subagent spawning** | Each spawn = fresh context. Solves context pollution. |
| **3 ensemble models** | Claude, Gemini, GPT (configurable in `config/models.ts`) |
| **DRY instructions** | One `proposer.md`, one `executor.md`, one `reviewer.md`. Model configured separately. |
| **File-based state** | `workflow-state.json` + markdown summaries |
| **Dynamic execution** | Single or multiple executors based on task scope |

### Ensemble Phases

| Phase | Ensemble? | Pattern |
|-------|-----------|---------|
| Workshop | Yes | 3 proposers → coordinator synthesizes direction |
| Planning | Yes | 3 proposers → coordinator picks/merges best plan |
| Execution | No (routed) | 1 executor per domain (frontend/backend/test) |
| Audit | Yes | 3 reviewers → coordinator merges findings, final verdict |

### The Flow

```
USER: "Build feature X"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATOR (Opus)                        │
│  Context: goal + workflow-state.json (LEAN)                 │
└─────────────────────────────────────────────────────────────┘
         │
         │ Phase 1: WORKSHOP (if complex)
         ├──→ spawn proposer-claude  ──→ proposal A
         ├──→ spawn proposer-gemini  ──→ proposal B
         ├──→ spawn proposer-gpt     ──→ proposal C
         │
         │ Coordinator JUDGES: picks direction
         │ Output: docs/ai/X/workshop/direction.md
         │
         │ Phase 2: PLAN
         ├──→ spawn proposer-claude  ──→ plan A
         ├──→ spawn proposer-gemini  ──→ plan B
         ├──→ spawn proposer-gpt     ──→ plan C
         │
         │ Coordinator JUDGES: picks/merges best plan
         │ Output: docs/ai/X/plan.md
         │
         │ Phase 3: DECOMPOSE (coordinator does this)
         │ Output: docs/ai/X/tasks.json
         │
         │ Phase 4: EXECUTE (routed by domain)
         ├──→ spawn executor (backend tasks)   ──→ code
         ├──→ spawn executor (frontend tasks)  ──→ code
         ├──→ spawn executor (test tasks)      ──→ tests
         │
         │ Output: code changes + execution summary
         │
         │ Phase 5: AUDIT
         ├──→ spawn reviewer-claude  ──→ findings A
         ├──→ spawn reviewer-gemini  ──→ findings B
         ├──→ spawn reviewer-gpt     ──→ findings C
         │
         │ Coordinator JUDGES: merge findings
         │ ANY blocker = REJECT → back to execute
         │ No blockers = APPROVED
         │
         ▼
       [DONE]
```

### File Structure

```
config/
├── models.ts           # Model definitions (ensemble + specialized)
├── agents.ts           # Agent configs
└── workflows.ts        # Workflow definitions (optional for v1)

content/instructions/
├── coordinator.md      # NEW: The brain
├── proposer.md         # NEW: Generic proposal (reused 3x)
├── executor.md         # EXISTING: execution.md (minor updates)
├── reviewer.md         # NEW: Generic review (reused 3x)

output/opencode/agents/
├── coordinator.md      # Primary agent
├── proposer-claude.md  # Subagent (Claude model)
├── proposer-gemini.md  # Subagent (Gemini model)
├── proposer-gpt.md     # Subagent (GPT model)
├── executor.md         # Subagent (model varies by task type)
├── reviewer-claude.md  # Subagent (Claude model)
├── reviewer-gemini.md  # Subagent (Gemini model)
├── reviewer-gpt.md     # Subagent (GPT model)
```

### Models Config

```typescript
// config/models.ts
export const MODELS = {
  // Existing
  smart: "anthropic/claude-sonnet-4",
  fast: "anthropic/claude-haiku-4",
  
  // Coordinator (the judge)
  coordinator: "anthropic/claude-opus-4",
  
  // Ensemble models
  ensemble: {
    claude: "anthropic/claude-sonnet-4",
    gemini: "google/gemini-2.5-pro",
    gpt: "openai/gpt-4o",
  },
  
  // Execution specialists (optional overrides)
  execution: {
    frontend: "google/gemini-2.5-pro",
    backend: "anthropic/claude-sonnet-4",
    test: "anthropic/claude-sonnet-4",
  },
} as const;
```

---

## What's MISSING

### Critical (Must Have for v1)

| Gap | Why It Matters | Proposal |
|-----|----------------|----------|
| **Coordinator instruction** | The brain doesn't exist yet | Write `content/instructions/coordinator.md` |
| **Proposer instruction** | Core ensemble pattern | Write `content/instructions/proposer.md` |
| **Reviewer instruction** | Audit ensemble pattern | Write `content/instructions/reviewer.md` |
| **Spawn mechanism** | How does coordinator actually spawn? | Use OpenCode's `Task()` tool with agent name |
| **Context handoff format** | What exactly passes between phases? | Structured markdown with sections |
| **Trigger mechanism** | How user invokes orchestration | `/orchestrate` command or coordinator as primary agent |

### Important (Should Have)

| Gap | Why It Matters | Proposal |
|-----|----------------|----------|
| **Skip logic** | Simple tasks shouldn't go through full flow | Coordinator decides based on complexity |
| **Partial failure handling** | What if 1 of 3 proposers fails? | Continue with 2; warn user |
| **Cost tracking** | Ensemble is expensive | Track in workflow-state.json |
| **Timeout handling** | Subagent hangs | 5-minute timeout, escalate to user |

### Nice to Have (v2+)

| Gap | Why It Matters | Proposal |
|-----|----------------|----------|
| **Workflow YAML** | Declarative workflow definitions | Start with hardcoded, add YAML later |
| **Parallel spawning** | Speed up ensemble phases | Sequential first, parallel when stable |
| **Debate protocol** | When reviewers strongly disagree | Coordinator escalates to user |
| **Model fallback** | Opus down, what then? | Fall back to Sonnet for judging |

---

## What I PUSH BACK On

### 1. Ensemble for Small Tasks is Overkill

**Concern:** A typo fix doesn't need 3 proposers + 3 reviewers = 6 subagent calls.

**My position:** Coordinator should gate ensemble based on complexity:

```
if (task.complexity === "trivial") {
  // Skip ensemble, direct execute
  spawn(executor, task)
  spawn(reviewer-claude, changes)  // Single reviewer is enough
} else {
  // Full ensemble
  ...
}
```

**Recommendation:** Add complexity assessment to coordinator. Not everything needs the full orchestra.

---

### 2. The Coordinator Bottleneck

**Concern:** Coordinator judges EVERYTHING. If Opus is slow/down, whole system stalls.

**My position:** This is acceptable for v1, but track it. 

**Mitigation:**
- Coordinator should be stateless (can restart from workflow-state.json)
- Add model fallback in config
- Monitor Opus latency

---

### 3. Cost Explosion Risk

**Concern:** Full workflow = 3 proposers + 3 reviewers + coordinator × multiple phases = $$$.

**Math for a feature:**
| Phase | Calls | Estimated Cost |
|-------|-------|----------------|
| Workshop | 3 proposers + judge | $0.50 |
| Plan | 3 proposers + judge | $0.50 |
| Decompose | 1 coordinator | $0.10 |
| Execute | 1-3 executors | $0.30 |
| Audit | 3 reviewers + judge | $0.50 |
| **Total** | **12-14 calls** | **~$2.00** |

**My position:** This is fine for complex features. NOT fine for "add a button".

**Recommendation:** 
- Track costs per workflow
- Set budget limits
- Default to single-model for simple tasks

---

### 4. Sequential vs Parallel Spawning

**Concern:** We said "doesn't matter" but it affects UX significantly.

**Sequential:** 3 proposers = 3 × 30sec = 90 seconds waiting
**Parallel:** 3 proposers = 30 seconds total

**My position:** Start sequential (simpler), but design for parallel. OpenCode may support parallel Task() calls.

**Recommendation:** Check if OpenCode's Task() can run multiple subagents simultaneously.

---

### 5. Reviewer vs Auditor Naming

**Concern:** We have existing `auditor.md`. Now adding `reviewer.md`. Confusing?

**My position:** They're different:
- **Auditor** (existing): Single-model, after-execute check
- **Reviewer** (new): Ensemble member, part of multi-lens audit

**Recommendation:** Rename for clarity:
- `auditor.md` → keep for single-model audit (backward compat)
- `reviewer.md` → new ensemble member instruction
- Coordinator chooses: simple task → auditor, complex → 3 reviewers

---

## Implementation Priority

### Phase 1: Minimal Viable Orchestrator (1-2 days)

1. **Write `coordinator.md`** — The brain that spawns and judges
2. **Write `proposer.md`** — Generic proposal instruction
3. **Update `config/models.ts`** — Add ensemble models
4. **Update `config/agents.ts`** — Add coordinator + proposer variants
5. **Test:** Coordinator spawns 3 proposers, judges result

### Phase 2: Full Flow (2-3 days)

6. **Write `reviewer.md`** — Generic review instruction
7. **Update `executor.md`** — Ensure it works as subagent
8. **Implement all phases** — Workshop → Plan → Execute → Audit
9. **Test:** Full workflow on a real feature

### Phase 3: Polish (1-2 days)

10. **Skip logic** — Trivial tasks bypass ensemble
11. **Cost tracking** — Log to workflow-state.json
12. **Error handling** — Timeouts, partial failures
13. **Documentation** — How to use orchestrator

---

## Open Questions (Need Your Call)

### 1. Trigger Mechanism

How does user invoke orchestration?

| Option | Pros | Cons |
|--------|------|------|
| **A: Primary agent** | Tab to switch, natural | Replaces existing flow |
| **B: `/orchestrate` command** | Explicit, opt-in | Another command to remember |
| **C: Skill** | Any agent can invoke | Adds complexity |

**My lean:** Option A — Coordinator as primary agent. User tabs to it for complex work.

### 2. Subagent Model Override

How does coordinator spawn a Gemini proposer vs Claude proposer?

| Option | How |
|--------|-----|
| **A: Separate agent files** | `proposer-claude.md`, `proposer-gemini.md`, `proposer-gpt.md` |
| **B: Single agent + param** | `@proposer model=gemini` |

**From OpenCode docs:** Agents inherit parent model unless configured. So we need Option A — separate agent files with different model configs.

### 3. What's v1 Scope?

| Scope | Includes |
|-------|----------|
| **Minimal** | Ensemble planning only (3 proposers → coordinator judges → plan) |
| **Medium** | Plan + Execute + Audit (skip workshop) |
| **Full** | Workshop → Plan → Execute → Audit |

**My lean:** Medium scope. Workshop can be added later. Plan + Execute + Audit covers 90% of value.

---

## Final Recommendation

**Build it in this order:**

1. ✅ Decided: Coordinator as brain/judge
2. ✅ Decided: Subagent spawning for context isolation
3. ✅ Decided: 3 ensemble models, configurable
4. ✅ Decided: DRY instructions with model config
5. 🔨 Build: `coordinator.md` instruction
6. 🔨 Build: `proposer.md` instruction  
7. 🔨 Build: `reviewer.md` instruction
8. 🔨 Build: Model config updates
9. 🔨 Build: Agent config (coordinator + variants)
10. 🧪 Test: Single ensemble phase (planning)
11. 🧪 Test: Full flow (plan → execute → audit)
12. 📦 Ship: v1 with medium scope

**Total estimate:** 5-7 days for solid v1.

---

## Ready for Plan Mode?

Workshop is complete. We have:
- ✅ Clear architecture
- ✅ Decided patterns (ensemble, subagent spawning, coordinator-as-judge)
- ✅ File structure
- ✅ Implementation priority
- ⚠️ Few open questions (trigger mechanism, v1 scope)

**Your call:** Answer the open questions, then I'll create a detailed implementation plan.
