---
name: planning
description: "Create structured implementation plans with phases and assumptions. Use when user wants to plan a feature, architect a solution, design an approach, or says 'let's plan', 'create a plan', 'how should we build this', or needs to break down work into steps."
---

# Plan Mode

You are an architect drafting blueprints, not a secretary taking notes. Analyze the codebase, challenge assumptions, design the approach, then break it into executable steps.

> **No Implementation Until Approval**: Plan first. Build after explicit approval. **Full code snippets are required** — always decide implementation details, never leave open-ended (e.g., "maybe create a class" or "consider using X"). All code decisions must be specific and definitive.
> **Questions through question tool ONLY**: Never output questions as chat text. Every question uses the question tool with concrete options.

---

## Workflow

### Step 0: Read Context

Before anything else, load all available context:

1. **Read `KNOWLEDGE.md`** — business context, constraints, terminology (what IS)
2. **Read `PRD.md` if it exists** — product roadmap, initiatives, scope boundaries (what WILL BE)
3. **Read `master-plan.md` if it exists in session** — initiative coordination, upstream decisions, downstream needs
4. **Read upstream plans if referenced** — decisions and constraints from completed plans

From PRD.md, understand: where does this work sit in the bigger picture? What downstream initiatives need from this work? What's explicitly out of scope?

### Step 1: Understand the Ask

1. **Clarify the goal** — what problem are we solving? What does "done" look like?
2. **Read the codebase** — find related code, existing patterns, similar features
3. **Map the territory** — models, services, APIs, events, jobs that touch this area
4. **Find the tests** — what coverage exists? What's the safety net?

### Step 2: Ask Questions (Extensively)

**Use the question tool for EVERY question. Never output questions as text.**

Before drafting any plan, aggressively resolve ambiguity:

- **Don't assume the tech stack** — ask
- **Don't assume the approach** — ask
- **Don't assume the scale** — ask
- **Don't assume what users need** — ask
- **Don't assume scope boundaries** — ask

Better to ask a "dumb" question than to silently assume wrong.

**The heuristic:** If being wrong about this would change the plan structure (different phases, different approach, different tech), it MUST be asked.

### Step 3: Identify Assumptions

After questions are answered, audit what's left:

**For each aspect of the plan, ask: "Did the user tell me this, or did I decide it?"**

| If... | Then... |
|-------|---------|
| Being wrong changes plan structure | Should have been a question — ask now |
| Being wrong requires minor rework | Declare in Assumptions block |
| Unsure which category | Ask (default to asking) |

**Common assumption traps:**
- Tech choices (database, queue, provider, library)
- Scale expectations (users, data volume, request rate)
- User types (who uses this? roles? permissions?)
- Integration points (what existing systems does this touch?)
- Delivery expectations (real-time? batch? scheduled?)
- Platform (web? mobile? desktop? all?)

### Step 4: Scope Check

Before drafting, evaluate the work size:

**Split signals (any one = must split into multiple plans):**
- 3+ distinct subsystems (DB, API, UI, external service, auth, jobs...)
- 6+ phases
- Can't describe the deliverable in one sentence without commas listing separate features
- Later phases depend on decisions not yet made in phases 3+ steps earlier

**When splitting:**
1. Propose split boundaries to user via question tool with reasoning
2. Show dependency order between resulting plans
3. User adjusts/approves
4. Create `master-plan.md` + first child plan in session
5. Remaining plans get one-line descriptions in master-plan (detailed planning happens when they're next)

**Don't over-split:** Each plan should be substantial — a meaningful deliverable, not a single file change. If a "plan" is 1-2 phases, merge it with an adjacent plan.

**Master-plan format:**

```markdown
# Master Plan: <initiative-name>

## Vision
One sentence: what this whole effort achieves when done.

## Plans (ordered)
1. [ ] Plan name → plan-1-slug.md (no deps)
2. [ ] Plan name → plan-2-slug.md (needs: plan 1)
3. [ ] Plan name → plan-3-slug.md (needs: plan 1, 2) ⟂ Plan 4
4. [ ] Plan name → plan-4-slug.md (needs: plan 1)

## Decisions (accumulated across plans)
| Plan | Decision | Rationale |
|------|----------|-----------|

## Constraints Discovered
- (filled in during execution)
```

**Single plans (no split needed):** No master-plan. Just `plan.md` as usual.

### Step 5: Draft the Plan

When drafting the plan, **write full code snippets for all implementation details**. Never be vague — decide the exact approach:
- **BAD**: "Maybe create a UserService class or use the existing one"
- **GOOD**: "Create `UserService` class in `src/services/UserService.ts` with `createUser()` method:"

  ```typescript
  // src/services/UserService.ts
  export class UserService {
    constructor(private repo: UserRepository) {}
    
    async createUser(data: CreateUserDTO): Promise<User> {
      // Implementation here
    }
  }
  ```

Always write the plan to a file — never just output to chat. Use session's `plan.md` (or `plan-N-slug.md` if multiple plans exist):

```markdown
# Plan: <feature-name>
Status: draft | Created: YYYY-MM-DD

PRD: PRD.md → Initiative #N (if PRD exists)
Master plan: master-plan.md → Plan N of M (if master exists)
Upstream: [what came before, key decisions] (if applicable)
Downstream: [what comes after, what it needs from this plan] (if applicable)

## Goal
One sentence: what we're building and why.

## Assumptions
- [Things you decided, not the user — be explicit]
- [Reasonable defaults the user should validate]

## Approach
How we'll build this. Key architectural decisions.
Reference existing patterns: `[path:line]`

## Required Skills
List skills needed for execution:
- `skill-name` — why needed
- `project-skill-creation` — create/update project-local skills when the plan introduces or changes modular domains
- `code-simplifier` — simplify code after implementation (standard)

## Phases

### Phase 1: Foundation
- [ ] 1.1 Task description `[file:line]`
- [ ] 1.2 Task description

### Phase 2: Core Logic ⟂ Phase 3: Integration
> Phases 2 and 3 can run in parallel (no shared dependencies)

- [ ] 2.1 Task description
- [ ] 2.2 Task description

### Phase 3: Integration
- [ ] 3.1 Task description

### Phase N-2: Project Skill Updates (when applicable)
> Load `project-skill-creation` skill
- [ ] (N-2).1 Identify domains changed by this plan that need project-local skill guidance
- [ ] (N-2).2 Create or update `.agents/skills/<domain>/SKILL.md` for each changed domain

### Phase N-1: Simplify
> Load `code-simplifier` skill
- [ ] (N-1).1 Review and simplify all code changes from this plan
- [ ] (N-1).2 Verify all tests still pass after simplification

### Phase N: Finalize
- [ ] N.1 Update `KNOWLEDGE.md` if new business context discovered
```

**No scope section.** Questions replaced it.
**No risks section.** Real risks surface during execution — deviation rules handle them.

### Step 6: Iterate

On every subsequent turn:

1. **Read the plan file first** — don't rely on memory
2. **Update status** — mark items `[x]` done, `[~]` blocked
3. **Log decisions** — add to Approach section with rationale
4. **Challenge assumptions** — re-validate Assumptions block against new information

---

## What Good Plans Have

### Executable Steps
Each task should be:
- **Atomic** — completable in one sitting
- **Verifiable** — you know when it's done
- **Ordered** — dependencies flow correctly
- **Referenced** — points to specific code `[file:line]`

### Parallelization Strategy
- **Identify independent phases** — phases with no shared dependencies can run as parallel subagents
- **Mark parallel groups** — explicitly note which phases can execute simultaneously (e.g., `Phase 2 ⟂ Phase 3`)
- **Sequential by default** — phases that depend on prior phase output must run in order

### Real Trade-offs
Don't hide decisions. Surface them:
- What options exist?
- Which did we choose and why?
- What are we giving up?

---

## Status Markers

```
- [ ] Pending
- [x] Done
- [~] Blocked (reason: ...)
- [!] Needs decision
```

---

## Research First, Ask Second

Before raising a question:

1. **Search the codebase** — maybe it's already solved
2. **Check the docs** — library docs, internal wikis
3. **Look at similar features** — how did we handle this before?
4. **Search the web** — prior art, best practices

Only raise questions you genuinely cannot answer. For answered questions, show your work:
- **Q**: How does auth work here? **A**: Found in `AuthService.ts:50-80` — uses JWT with refresh tokens.

---

## Rules

- **ALWAYS IN FILE** — every plan must be written to a session file, never only in chat
- **QUESTIONS VIA TOOL ONLY** — never output questions as chat text, always use question tool
- **NO SILENT ASSUMPTIONS** — every assumption is either questioned or declared
- **NO FLUFF** — every line should add information
- **NO VAGUE TASKS** — "implement feature" is not a task; "add validation to `CreateUserDTO`" is
- **SNIPPETS ARE REQUIRED** — include **full code implementations** in the plan; all decisions must be definitive, never tentative ("maybe", "consider", "perhaps")
- **DECIDE, DON'T DEFER** — every implementation detail must be decided.
- **CHALLENGE ASSUMPTIONS** — if something seems wrong, say so
- **REFERENCE CODE** — `[path:line]` for everything
- **UPDATE THE FILE** — plan is living document, not write-once
- **ALWAYS FINALIZE** — every plan ends with audit + knowledge update phase

---

## Closing the Plan

End every plan with one of:

| Status | Meaning |
|--------|---------|
| **READY TO BUILD** | Plan is complete, no blockers, approved to execute |
| **BLOCKED** | Cannot proceed until: [specific blocker] |

When plan is **READY TO BUILD**, user can proceed to execution.

---

## On Approval (User says "go", "build", "approved", etc.)

Plan is already in `plan.md` (written during drafting). Proceed to build mode with session path.
