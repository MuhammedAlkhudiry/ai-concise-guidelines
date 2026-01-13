# Knowledge Extraction

Extract learnings from sessions into permanent project knowledge. User triggers, AI proposes, user approves.

---

## Knowledge Structure

```
docs/ai/
├── knowledge/
│   ├── knowledge.md          # Global project knowledge
│   └── <domain>/
│       └── knowledge.md      # Domain-specific (created as needed)
├── sessions/                  # Active sessions (ephemeral)
└── archive/                   # Old sessions (optional)
```

Domains are project-specific — create folders based on your codebase (e.g., `auth/`, `billing/`, `api/`). Don't pre-create empty folders.

---

## What IS Knowledge

Knowledge = what AI **cannot infer from code**.

| IS Knowledge | NOT Knowledge |
|--------------|---------------|
| WHY decisions were made | Config values |
| Constraints (legal, client, external) | How code works |
| History (we tried X, failed because Y) | Patterns visible in code |
| Gotchas not obvious from code | API signatures |
| External context (client requirements) | Database schema |

**Filter:** Before proposing, ask: *"Can AI figure this out by reading code?"* If yes, don't add.

---

## Input

- Session path(s) — specific or "all completed"
- Optional: target domain hint

---

## Process

### Step 1: Read Sources

Read from session(s):
- `learnings.md` — primary source
- `workshop.md` — decisions and rationale
- `README.md` — context and outcomes

Read existing knowledge files to:
- Avoid duplicates
- Understand current state
- Find update candidates (not just additions)

### Step 2: Categorize

For each learning, determine:
1. **Domain** — infer from session name, file paths, content keywords
2. **Type** — WHY / CONSTRAINT / HISTORY / GOTCHA / EXTERNAL
3. **Action** — ADD new or UPDATE existing

If domain unclear, ask user: *"Which domain? [auth/admin/payments/new/global]"*

### Step 3: Check for Bubble-Up

Flag for AGENTS.md if:
- Pattern appeared in 3+ sessions
- Marked as "critical" or "always" in learnings
- Affects cross-cutting concerns (security, data integrity)
- Would prevent repeated mistakes across ALL projects

### Step 4: Present Proposal

Format:

```markdown
## Proposed Knowledge Extraction

Session: 2026-01-13-auth-refactor

### → auth/knowledge.md
- [ADD] Token expiry non-negotiable — security audit finding #47
- [UPDATE] Sanctum chosen over Passport (add: memory issues at scale)

### → knowledge.md (global)
- [ADD] Client reviews all PRs manually — expect 2-day delay

### → AGENTS.md (bubble up)
- [SUGGEST] "Check compliance docs before auth changes"
  Reason: Caused rework in 3 sessions

---
[a]pprove all | [e]dit | [r]eview individually | [s]kip
```

### Step 5: Wait for Approval

**Do not write without explicit user approval.**

Options:
- **Approve all** — write everything as proposed
- **Edit** — user modifies, then approve
- **Review individually** — go item by item
- **Skip** — abandon extraction

### Step 6: Write Approved Changes

- Create domain folders if needed
- Append to or update knowledge files
- Use consistent format (see below)

### Step 7: Session Cleanup

Ask: *"Archive or delete session?"*
- **Archive** — move to `docs/ai/archive/`
- **Delete** — remove (git history is backup)
- **Keep** — leave session in place

---

## Knowledge File Format

```markdown
# Auth Knowledge

## Decisions
- **2026-01-13**: Sanctum over Passport — memory issues at scale, simpler API
- **2025-08-20**: 7-day token expiry — security audit requirement #47

## Constraints
- Token expiry is non-negotiable (compliance)
- Must support SSO for enterprise clients (contract)

## Gotchas
- Test environment tokens don't expire (intentional, causes confusion)
- Legacy API uses different auth header format

## History
- 2025-06: Tried Passport, migrated away due to memory at 10k concurrent users
```

---

## Rules

- **User approval required** — never write without explicit approval
- **No code duplication** — if it's in code, don't add to knowledge
- **Be selective** — fewer high-value entries beats many low-value ones
- **Date decisions** — always include when decision was made
- **Link sessions** — reference source session when relevant
- **Create domains on demand** — don't pre-create empty folders

---

## Output

After completion, report:
- Files created/updated
- Items added
- Session disposition (archived/deleted/kept)
