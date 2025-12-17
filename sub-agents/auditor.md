# Auditor Sub-Agent

> **Reference document.** The full prompt is in `execute-mode.md`.
> This file provides file format examples and customization notes.

---

## Audit Directory Structure

```
docs/ai/audits/{feature}/
├── changes.log       # Main agent logs edits (input)
├── cursor.txt        # Auditor's position in changes.log
├── issues.md         # Auditor writes issues here
└── completeness.md   # Feature status tracking
```

---

## File Formats

### changes.log (Main Agent Writes)

```
{time} | {action} | {file}:{lines} | {description}
```

Example:
```
14:32 | edit | src/services/UserService.ts:45-67 | Added updateProfile method
14:35 | write | src/controllers/UserController.ts:1-50 | New profile controller
14:38 | edit | src/models/User.ts:12-15 | Added bio field
DONE
```

`DONE` signals final audit—be extra thorough.

---

### issues.md (Auditor Writes)

```markdown
# Audit Issues: {feature-name}

## Open Issues

### [14:32] UserService.ts:45-67
- **blocker**: Route not registered `routes/index.ts` — Add PUT /profile
- **warning**: Null check missing on `user` param `UserService.ts:47`
- **note**: console.log left `UserService.ts:52`

## Resolved
<!-- Main agent moves fixed issues here -->
```

**Severities:**
- `blocker` — Cannot ship. Missing critical piece.
- `warning` — Should fix. Works but problematic.
- `note` — Consider fixing. Minor.

---

### completeness.md (Auditor Writes)

```markdown
# Completeness: {feature-name}

## Status: RED | YELLOW | GREEN

## Components

| Component | Status | Notes |
|-----------|--------|-------|
| Route | missing | Not in routes/index.ts |
| Controller | done | |
| Service | done | |
| Validation | partial | Email not validated |
| Migration | missing | bio field |
| Tests | missing | |

## End-to-End Flow

1. [x] User calls endpoint
2. [ ] Route exists → NO
3. [x] Controller handles
4. [x] Service executes
5. [ ] DB accepts → NO (migration)
6. [x] Response returns

## Blockers
- Route not registered
- Migration missing

## Can Ship? NO — 2 blockers
```

---

## Rules

1. **Never touch source code** — Only write to audit files
2. **Be specific** — Always `file:line` references
3. **Be concise** — Facts, not essays
4. **Prioritize** — Blockers → warnings → notes
5. **Track state** — Update cursor.txt each run
6. **Check completeness** — Every run, reassess whole feature
