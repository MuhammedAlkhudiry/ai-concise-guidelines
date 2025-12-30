# Plan: OpenCode-Only Restructure

Level: 7 | Status: approved | Created: 2024-12-30

## Goal

Restructure repository to keep only OpenCode, DRY all text content (no duplicates), separate configs from generator logic.

## Scope

**In scope:**
- Remove Claude Code, Windsurf integrations entirely
- Remove full-feature workflow (+ planner, executor, manager, fixer)
- Remove reflection (+ reflector)
- Merge auditors (auditor + code-auditor + quality-auditor → single auditor)
- Create `content/` with `base-rules.md` + `instructions/`
- Create `config/` with `models.ts`, `agents.ts`, `skills.ts`
- Rename `integrations/` → `output/` (OpenCode only)
- Refactor `generate.ts` - NO inline text, import everything
- Update `init.ts` - OpenCode only, delete-then-copy sync

**Out of scope:**
- Full-feature workflow (future work)
- New features or instructions

---

## Final Structure

```
content/
├── base-rules.md                    # Global rules (renamed from CRITICAL_RULES.md)
└── instructions/                    # 15 files total
    ├── plan.md                      # Primary mode
    ├── execution.md                 # Primary mode
    ├── frontend-design.md           # Primary mode + skill
    ├── quick-edits.md               # Primary mode
    ├── auditor.md                   # Sub-agent (MERGED: auditor + code-auditor + quality-auditor)
    ├── workshop.md                  # Skill
    ├── debugging.md                 # Skill
    ├── code-review.md               # Skill
    ├── refactoring.md               # Skill
    ├── product-strategy.md          # Skill
    ├── feature-research.md          # Skill
    ├── api-handoff.md               # Skill
    ├── backend-requirements.md      # Skill
    ├── user-story-review.md         # Skill
    └── translation.md               # Skill

config/
├── models.ts                        # DRY model names
├── agents.ts                        # Agent definitions (type: primary/sub)
└── skills.ts                        # Skill definitions + descriptions

output/
└── opencode/
    ├── agents/
    ├── skills/
    └── opencode.json
```

---

## Summary

| Type | Count | Files |
|------|-------|-------|
| Primary modes | 4 | plan, execution, frontend-design, quick-edits |
| Sub-agents | 1 | auditor (merged) |
| Skills | 10 | workshop, debugging, code-review, refactoring, product-strategy, feature-research, api-handoff, backend-requirements, user-story-review, translation |

**Total: 15 instruction files** (down from 27 originally)

---

## Key Decisions

| Decision | Chosen | Why |
|----------|--------|-----|
| Output directory | `output/` | Clearer than `integrations/` for single platform |
| Text location | `content/` folder | All text in one place, easy to review |
| Rules format | Single `base-rules.md` | Global rules, one file |
| Config format | TypeScript in `config/` | Type safety, importable |
| Auditors | Merge into one | code-auditor + quality-auditor were full-feature specific |
| Sync behavior | Delete-then-copy | Clean sync when files removed from repo |
| generate.ts | No inline text | Import all content from files |

---

## Deleted Files (12 files + 3 folders)

**Full-feature orchestration:**
- `planner.md` - parallel planners
- `executor.md` - domain executors
- `manager.md` - orchestrator
- `fixer.md` - fix loop
- `full-feature.md` + `templates/`

**Reflection:**
- `reflection.md` - skill
- `reflector.md` - sub-agent

**Merged into auditor:**
- `code-auditor.md`
- `quality-auditor.md`

**Duplicates removed:**
- `planning.md` (= plan.md)
- `frontend-design.md` skill (= agent)

**Folders:**
- `integrations/claude-code/`
- `integrations/windsurf/`
- `guidelines/` (content moves to `content/base-rules.md`)
- `templates/` (content moves to `content/instructions/`)

---

## Phases

### Phase 1: Create Content Structure
- [ ] 1.1 Create `content/` directory
- [ ] 1.2 Create `content/base-rules.md` (copy + rename from `guidelines/CRITICAL_RULES.md`)
- [ ] 1.3 Create `content/instructions/` directory
- [ ] 1.4 Copy 15 instruction files (deduplicated):
  - From `templates/agents/`: plan.md, quick-edits.md, frontend-design.md, auditor.md
  - From `templates/skills/`: execution.md, workshop.md, debugging.md, code-review.md, refactoring.md, product-strategy.md, feature-research.md, api-handoff.md, backend-requirements.md, user-story-review.md, translation.md
- [ ] 1.5 Merge auditor content (auditor + code-auditor + quality-auditor → single file)

### Phase 2: Create Config Files
- [ ] 2.1 Create `config/` directory
- [ ] 2.2 Create `config/models.ts` - export model definitions
- [ ] 2.3 Create `config/agents.ts` - export agent configs (type: primary/sub)
- [ ] 2.4 Create `config/skills.ts` - export skill configs + descriptions

### Phase 3: Refactor Generator
- [ ] 3.1 Rewrite `generate.ts`:
  - Import from `config/`
  - Read content from `content/`
  - NO inline text/content
  - Generate only to `output/opencode/`
- [ ] 3.2 Remove all Claude Code logic
- [ ] 3.3 Remove all Windsurf logic

### Phase 4: Update Installer
- [ ] 4.1 Rewrite `init.ts` for OpenCode only
- [ ] 4.2 Implement delete-then-copy sync for agents/skills
- [ ] 4.3 Remove platform selection logic
- [ ] 4.4 Update source paths to `output/opencode/`

### Phase 5: Cleanup
- [ ] 5.1 Delete `integrations/` folder
- [ ] 5.2 Delete `templates/` folder
- [ ] 5.3 Delete `guidelines/` folder
- [ ] 5.4 Update `AGENTS.md`
- [ ] 5.5 Update `README.md`

### Phase 6: Verify
- [ ] 6.1 Run `bun generate.ts --clean`
- [ ] 6.2 Verify output in `output/opencode/`
- [ ] 6.3 Test init.ts to temp directory

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing installations | Users with old paths break | Document migration in README |
| Lost content during merge | Auditor missing checks | Carefully merge all 3 auditor files |
| Import errors | Build fails | Test after each phase |

---

## Status: APPROVED - Ready to Execute
