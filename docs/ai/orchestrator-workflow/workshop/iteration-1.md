# Orchestrator Workflow — Iteration 1

## Context

We're exploring adding orchestrator workflow capabilities to this repository (ai-concise-guidelines). This repo currently provides opinionated AI guidelines, skills, and agents for OpenCode—a documentation/configuration repository with a generator script.

**Current architecture:**
- 4 primary agents: plan, build, frontend-design, quick-edits
- 1 sub-agent: auditor (spawned by build agent)
- 13 skills (invokable capabilities)
- Generator creates output from content + config

**The question:** What orchestration capabilities would add value here, and how do they compare to existing solutions?

---

## My Understanding

You want to explore adding orchestration workflows—the ability for agents to coordinate, spawn sub-agents, work in parallel, and manage complex multi-step tasks autonomously. Two major solutions exist in this space:

1. **oh-my-opencode** (4.1k stars) — OpenCode plugin with async subagents, curated agents, Claude Code compatibility
2. **claude-flow** (11k stars) — Enterprise orchestration platform with swarm intelligence, 100+ MCP tools, persistent memory

---

## Analysis

### What Works in Existing Solutions

**oh-my-opencode strengths:**
- **Async subagents** — Background task execution while main agent continues
- **Curated agent models** — Right model for right task (Opus for orchestration, GPT for debugging, Gemini for frontend)
- **Claude Code compatibility layer** — Hooks, commands, skills, MCPs work seamlessly
- **Todo continuation enforcer** — Agent doesn't quit halfway through tasks
- **LSP/AST tools** — Proper refactoring, not just text manipulation
- **Context injection** — AGENTS.md, README.md, rules automatically injected

**claude-flow strengths:**
- **Hive-mind architecture** — Queen-led coordination with specialized workers
- **Persistent memory** — SQLite-backed ReasoningBank survives restarts
- **100+ MCP tools** — Comprehensive toolkit
- **Semantic search** — Vector embeddings for finding similar patterns
- **Dynamic Agent Architecture (DAA)** — Self-organizing, fault-tolerant agents

### Concerns

**1. Scope creep — This repo is guidelines, not infrastructure**

This repository generates static configuration files. Adding runtime orchestration would fundamentally change its nature from "config generator" to "orchestration platform." That's a different product.

| This repo | oh-my-opencode / claude-flow |
|-----------|------------------------------|
| Generates static files | Runtime orchestration |
| Config-time | Execution-time |
| Simple generator script | Complex TypeScript/npm package |
| ~500 lines total | 10k+ lines |

**2. Duplication — Why rebuild what exists?**

oh-my-opencode already has:
- Claude Code compatibility (we have similar skills/agents structure)
- Async subagents (we have auditor sub-agent concept)
- Model routing (we have smart/fast model abstraction)

If we build orchestration, we're competing with a 4k-star project that has active development and community.

**3. Complexity vs. Value**

Current flow: `Plan → Execute → Audit` (simple, predictable)

Adding orchestration means:
- Session management
- Task queues
- Agent spawning/termination
- Memory persistence
- Error recovery
- Parallel execution coordination

Is this complexity justified for the use case?

**4. OpenCode is evolving**

OpenCode itself may add orchestration features. Building our own risks obsolescence.

### Alternatives

**Option A: Stay focused — Enhance current approach**
- Keep current Plan → Execute → Audit flow
- Add more skills for specific tasks
- Improve existing agent instructions
- Let oh-my-opencode/claude-flow handle orchestration

**Option B: Integrate with oh-my-opencode**
- Make our guidelines/skills compatible with oh-my-opencode
- They handle orchestration, we handle opinionated workflows
- Complementary rather than competitive

**Option C: Build lightweight orchestration primitives**
- Add a `coordinator` agent that can spawn multiple sub-agents
- Keep it simple: just task decomposition and parallel execution
- No memory persistence, no swarm intelligence
- Builds on existing auditor pattern

**Option D: Document orchestration patterns**
- Add a skill/guide for using oh-my-opencode or claude-flow
- Teach users how to combine our guidelines with orchestration tools
- Zero implementation, maximum value

### Core Trade-off

**Simplicity vs. Power**

Our current value proposition is *opinionated simplicity*—clear workflows, no bloat. Adding orchestration trades that for power at the cost of complexity.

oh-my-opencode's tagline is literally "Steroids for your OpenCode." Do we want to be steroids, or do we want to be a clean, focused methodology?

---

## Position

**I'm torn, leaning toward Option B + D (integration + documentation).**

Here's my reasoning:

1. **oh-my-opencode solves orchestration well** — 4k stars, active development, Claude Code compatibility. Why compete?

2. **Our strength is methodology, not infrastructure** — Plan mode, audit gates, skill-based workflows. That's what we do well.

3. **Integration is lower risk** — Making our guidelines work seamlessly with oh-my-opencode adds value without the maintenance burden.

4. **Documentation captures patterns** — A "how to orchestrate complex tasks" skill or guide teaches users without us building anything.

**However**, I see a gap:

oh-my-opencode's Sisyphus agent is impressive but opinionated differently than us. Their model routing (Opus for orchestration, GPT for debugging, Gemini for frontend) is baked in. Our model abstraction (smart/fast) is simpler.

**A lightweight coordinator agent (Option C)** could be valuable if:
- It's just task decomposition (break big task into sub-tasks)
- It uses our existing auditor pattern for sub-agent spawning
- It's 50-100 lines, not a platform

---

## UX (if applicable)

If we build anything, the interface should be invisible:

```
User: "Build a REST API with authentication and tests"

Plan agent decomposes:
1. API endpoints (spawn backend sub-agent)
2. Auth middleware (spawn security sub-agent)  
3. Tests (spawn testing sub-agent)
4. Integration (main agent coordinates)

User sees: progress updates, final result
User doesn't see: orchestration complexity
```

No new commands, no configuration, no "swarm init."

---

## Questions

### Answered
- **Q**: Does oh-my-opencode support our skill format? **A**: Yes, they load skills from `.claude/skills/` and `.opencode/command/`—our structure is compatible.
- **Q**: What models does claude-flow use? **A**: Multiple providers (Anthropic, OpenAI, Google) with semantic routing.
- **Q**: Does oh-my-opencode work without subscriptions? **A**: Yes, base functionality works; premium models need subscriptions.

### Blockers
- **Q**: What's your actual goal here? Add features to this repo, or understand orchestration patterns for your work?
- **Q**: Are you using OpenCode or Claude Code primarily? (Different orchestration options)
- **Q**: What complexity of tasks are you trying to orchestrate? (Affects which approach makes sense)

---

## Next

- [ ] Decision needed: Which option (A/B/C/D) aligns with your goals?
- [ ] Stress-test: If Option C (lightweight coordinator), what's the minimal viable version?
- [ ] Would change my mind if: You have specific orchestration needs that existing solutions don't cover
