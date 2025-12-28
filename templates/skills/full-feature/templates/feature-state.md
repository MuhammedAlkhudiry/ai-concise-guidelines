# Feature: <feature-name>
Created: YYYY-MM-DD | Last Updated: YYYY-MM-DD HH:MM

## Current State
- **Phase**: workshop | planning | executing | auditing | fixing | complete | failed
- **Status**: pending | in-progress | blocked | awaiting-approval | done
- **Blocker**: [if blocked, what's blocking]

## Workshop
- **Status**: pending | complete
- **Context**: |
    # Codebase analysis, project structure, dependencies

## Planning
- **Status**: pending | in-progress | complete
- **Planners**:
  - planner-1: { status: pending, findings: "", score: null }
  - planner-2: { status: pending, findings: "", score: null }
  - planner-3: { status: pending, findings: "", score: null }
- **Selected Plan**: ""
- **Final Plan File**: plan.md
- **Rationale**: ""

## Execution
- **Status**: pending | in-progress | complete | failed
- **Detected Domains**: []
- **Execution Order**:
  - step: 1, domains: [], reason: ""
- **Executors**:
  - domain: { status: pending, changes: [], summary: "" }

## Auditing
- **Status**: pending | in-progress | complete
- **Code Audit**:
  - status: pending
  - verdict: pending | approved | rejected
  - blockers: 0
  - warnings: 0
  - file: audits/code-audit.md
  - issues: ""
- **Quality Audit**:
  - status: pending
  - verdict: pending | approved | rejected
  - blockers: 0
  - warnings: 0
  - file: audits/quality-audit.md
  - issues: ""
- **Final Verdict**: pending | approved | rejected
- **Fix Loops**: 0

## Reflection
- **Status**: pending | complete
- **File**: reflection.md
- **Summary**: |
    # What was built, completed, gaps, future improvements

## Phase History
- [YYYY-MM-DD HH:MM] Started WORKSHOP

## Artifacts
- Workshop: `docs/ai/<feature>/workshop/`
- Plan: `docs/ai/<feature>/plan.md`
- Audit: `docs/ai/<feature>/audits/`
- Code: [list of files created/modified]
- Reflection: `docs/ai/<feature>/reflection.md`

## Key Decisions
- [YYYY-MM-DD] Decision: rationale

## Open Questions
- [ ] Question needing resolution
