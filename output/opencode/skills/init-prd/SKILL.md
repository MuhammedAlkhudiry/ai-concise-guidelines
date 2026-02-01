---
name: init-prd
description: Initialize or update PRD.md product roadmap through structured questioning. Use when user says 'init prd', 'create roadmap', 'define features', 'product roadmap', 'what are we building', or wants to capture product vision and feature initiatives.
---

# Init PRD

Initialize or update `PRD.md` at project root — the product roadmap that defines what WILL BE built.

> **Questions through question tool ONLY**: Never output questions as chat text. Every question uses the question tool with concrete options.
> **Load `product-strategy` skill**: Use its strategic thinking framework when evaluating and prioritizing initiatives.

## What PRD.md Is

The **product direction document** — what we're building, in what order, and why. Extracted through structured questioning, evaluated with strategic product thinking.

`KNOWLEDGE.md` = what IS (present/past). `PRD.md` = what WILL BE (future). They don't overlap.

---

## Process

### Step 1: Load Strategic Thinking

Load the `product-strategy` skill. Its frameworks for evaluating opportunities (impact, reach, frequency, differentiation, defensibility, feasibility) and its three-scale thinking (massive / medium / small gems) guide the entire PRD process.

### Step 2: Understand the Product

Start with high-level questions via question tool. Don't assume anything.

**Round 1 — The basics:**
- What is this product? (ask for one-sentence description)
- Who uses it? (ask about user types/personas)
- What's the core value — the ONE thing that makes it worth using?
- Is this a new product or adding to an existing one?

**Round 2 — The vision:**
- What does "done" look like for v1? What can users do?
- What are you explicitly NOT building? (scope boundaries matter)
- What existing systems/services does this integrate with?
- Are there hard constraints? (compliance, platform, budget, tech mandates)

### Step 3: Extract Initiatives

Now dig into each feature area. **Each initiative gets its own deep-dive.**

For EACH initiative the user mentions, ask a dedicated round of questions:

**Per-initiative questions:**
- What problem does this solve for the user?
- What does the user see/do? (walk through the flow)
- What's the simplest version that delivers value? (MVP boundary)
- What would the ideal version look like? (full vision, for later)
- Does this depend on other features being built first?
- What external services/APIs does this need?
- Are there existing patterns in the codebase to follow or break from?
- What's unclear or undecided? (capture as open questions)

**Don't rush.** Each initiative deserves its own question round. Don't bundle 3 features into one question. One initiative at a time.

### Step 4: Strategic Evaluation

Apply the `product-strategy` framework to each initiative:

**For each initiative, evaluate:**

| Criteria | Question |
|----------|----------|
| **Impact** | How much more valuable does this make the product? |
| **Reach** | What % of users does this affect? |
| **Frequency** | How often do users encounter this value? |
| **Differentiation** | Does this set us apart or just match competitors? |
| **Defensibility** | Is this easy to copy or does it compound over time? |
| **Feasibility** | Can we actually build this given constraints? |

**Classify each initiative:**
- 🔥 **Must do** — High impact, clearly worth it
- 👍 **Strong** — Good impact, should prioritize
- 🤔 **Maybe** — Interesting but needs more thought
- ❌ **Pass** — Not worth it right now (remove from PRD or park in backlog)

**Challenge the user's assumptions.** If an initiative scores poorly on the strategic criteria, say so. The user may still want it — but they should know the trade-off. Use the product-strategy prompts to unstick thinking:
- "What would make a user tell their friend about this?"
- "What's the feature that sounds crazy but might work?"
- "What do power users do manually that we could make native?"

**Look for gaps.** Are there 10x opportunities the user hasn't mentioned? Categories to probe (from product-strategy): speed, automation, intelligence, integration, collaboration, personalization, visibility, confidence, delight, access.

### Step 5: Prioritize

After all initiatives are captured and evaluated, help the user prioritize:

- **Do Now** — Quick wins with outsized impact, or foundational pieces everything depends on
- **Do Next** — High leverage, moderate effort, builds on Do Now
- **Explore** — Strategic bets worth investigating, higher uncertainty
- **Backlog** — Good ideas, wrong time

Consider:
- Which initiatives are must-have for v1 vs nice-to-have?
- Which have dependencies that force ordering?
- Which are highest risk / most uncertain?
- Which deliver the most user value soonest?
- Which compound over time? (prefer these)

Use question tool to confirm priority order.

### Step 6: Write PRD.md

Write the document with breathing room per initiative:

```markdown
# Product Roadmap

## Product Vision
One paragraph: what this product is, who it's for, why it matters.

## Core Value
One sentence: the single most important thing this product does.

## Constraints
- [Hard constraints: compliance, platform, budget, tech mandates]
- [Scope boundaries: what we're explicitly NOT building]

## Initiatives

### 1. [Initiative Name] — [Status: planned | in progress | done]
**Priority:** P0 | P1 | P2
**Strategic Score:** 🔥 | 👍 | 🤔
**Dependencies:** none | needs #N
**Session:** — | docs/ai/sessions/YYYY-MM-DD-slug/

**Problem:** What user problem this solves. One paragraph.

**User Flow:**
How the user experiences this. Walk through the key interactions:
1. User does X
2. System responds with Y
3. User sees Z

**MVP Scope:**
The simplest version that delivers value:
- [Must-have for this initiative]
- [Must-have for this initiative]

**Full Vision:**
What the ideal version looks like (for later iterations):
- [Nice-to-have]
- [Nice-to-have]

**Open Questions:**
- [Undecided items that affect implementation]

**Integrations:**
- [External services, APIs, systems this touches]

---

### 2. [Next Initiative] — [Status]
...
```

### Step 7: Confirm with User

Present the full PRD draft. Ask the user to review via question tool:
- Are the priorities right?
- Is anything missing?
- Are the scope boundaries accurate?
- Do the open questions capture the real unknowns?
- Do the strategic scores feel right?

---

## Updating an Existing PRD

When `PRD.md` already exists:

1. Read current content
2. Ask the user what changed (new initiative? priority shift? scope change?)
3. For new initiatives, run the per-initiative question round + strategic evaluation
4. Re-evaluate priorities if new initiatives shift the landscape
5. Update the document — merge, don't rewrite from scratch
6. Mark completed initiatives as `done`, link to their sessions

---

## Rules

- **QUESTIONS VIA TOOL ONLY** — never output questions as chat text
- **LOAD PRODUCT-STRATEGY SKILL** — use its frameworks for evaluation and prioritization
- **ONE INITIATIVE AT A TIME** — each initiative gets its own question round, don't bundle
- **NO SILENT ASSUMPTIONS** — if you're filling in gaps, ask instead
- **CHALLENGE THE USER** — if an initiative scores poorly strategically, say so
- **LOOK FOR GAPS** — probe for 10x opportunities the user hasn't mentioned
- **WRITE AND MAINTAIN** — keep PRD.md current after every execution (status, session links, constraints)
- **BREATHING ROOM** — each initiative gets a full section, not a table row
- **CAPTURE UNKNOWNS** — open questions are as valuable as decisions
- **MVP FIRST** — always distinguish "simplest valuable version" from "full vision"
- **PREFER COMPOUNDING** — features that get better over time rank higher
- **LINK TO SESSIONS** — when initiatives get planned/built, link to their session folders
