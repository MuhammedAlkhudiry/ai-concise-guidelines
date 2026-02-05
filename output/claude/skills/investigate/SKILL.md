---
name: investigate
description: Investigate issues, bugs, or questions before making changes. Use when user asks 'why is this happening', 'what's wrong with', 'can you check', 'investigate this', or any question about unexpected behavior. NO EDITS until user approves findings.
---

# Investigate Mode

**Understand first. Edit never (until approved).**

This is research mode. User asked a question — find the answer, don't assume it.

---

## The Rule

**NO EDITS during investigation.** Only after presenting findings and user approves.

Why: The user asked a question, not for a fix. Maybe it's not a bug. Maybe the fix is bigger than expected. Maybe they just want to understand.

---

## The Mindset (If It's a Bug)

**NEVER just patch a bug to make it pass. Every bug is a signal.**

### 1. Symptom or disease?

| Patch Thinking | Diagnostic Thinking |
|----------------|---------------------|
| "Add null check" | "Why is this null?" |
| "Wrap in try-catch" | "What's throwing?" |
| "Add retry logic" | "Why does this fail?" |

The bug you see is often not the bug you have.

### 2. Are there siblings?

One bug rarely travels alone. **Grep first, fix second.**
- Same pattern elsewhere?
- Same wrong assumption?
- Same misused API?

### 3. How to prevent forever?

| Prevention | Example |
|------------|---------|
| Types | Make invalid states unrepresentable |
| Lint | Catch pattern automatically |
| Test | Regression test this case |

If someone could introduce this bug tomorrow, you haven't fixed it.

### 4. What does this reveal?

| Pattern | Might Need |
|---------|------------|
| Repeated null checks | Validation layer |
| Race conditions | State machine |
| Copy-paste bugs | Abstraction |

Sometimes the right fix is a refactor, not a patch.

---

## The Questions

### 1. What's actually happening?

Don't assume. Trace it.
- Read the relevant code
- Check logs, errors, data
- Reproduce if possible

### 2. Is this even a bug?

| Might look like bug | But could be |
|---------------------|--------------|
| "Not working" | Working as designed, just unexpected |
| "Wrong data" | Correct data, wrong expectation |
| "Slow" | Normal for the operation |

### 3. What's the fix scope?

| Scope | Implication |
|-------|-------------|
| One-liner | Quick fix, probably safe |
| Multiple files | Needs more thought |
| Architecture | Needs discussion first |

---

## The Output

Present findings, don't just fix:

```markdown
## Investigation: [issue]

**What's happening:** [factual description]

**Root cause:** [if found] or **Hypothesis:** [if uncertain]

**Related issues:** [siblings found, or none]

**Recommended action:**
- [ ] Option A: [description + scope]
- [ ] Option B: [description + scope]

**Questions before proceeding:** [if any]
```

Then wait for user decision.

---

## Rules

- **NO EDITS** — investigate only, present findings, wait for approval
- **NO PATCHING** — if it's a bug, find the real cause
- **NO ASSUMPTIONS** — trace the actual behavior
- **FIND SIBLINGS** — grep before declaring victory
- **THINK PREVENTION** — how to prevent this forever
- **SHOW EVIDENCE** — code references, logs, data
- **PRESENT OPTIONS** — let user decide the path
