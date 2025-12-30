# Issues: OpenCode-Only Restructure
Audited: 2024-12-30

## Blockers (0)
None.

## Warnings (1)
| ID | File:Line | Issue |
|----|-----------|-------|
| W1 | `generate.ts:82-84` | Dead code: accesses `config.mode`, `config.tools`, `config.permission` which don't exist in AgentConfig interface. These guards never trigger. |

## Notes
- `AGENTS.md:130-132` — Says "Skills \| 10" but output has 13 skills. The 3 extra are shared with agents (planning, execution, frontend-design). Technically correct but could be clearer.
- `plan.md:70` — Same discrepancy in plan summary table. Not a bug, just confusing documentation.
