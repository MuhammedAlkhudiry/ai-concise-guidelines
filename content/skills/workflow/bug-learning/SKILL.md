---
name: bug-learning
description: Durable bug learning after misleading, cross-file, cross-system, or behavior-level debugging worth preserving in docs/knowledge/learnings.
---

Capture hard-earned bug knowledge, not ordinary bug reports.

## Workflow

1. Confirm the bug qualifies: long investigation, misleading symptoms, cross-system behavior, or a durable invariant.
2. Inspect the final fix, regression tests, logs, affected feature packs, and key files.
3. Read git history for the affected files and feature terms; keep only major relevant history.
4. Create the learning with `knowledge learning "<Title>"`.
5. Use `references/bug-learning.md` for the file shape.
6. Write the root cause as a mechanism, not a symptom.
7. Record why detection was hard and the durable rule future agents should remember.
8. Document regression protection: tests, guards, monitoring, or code paths.
9. Link the learning from related feature packs under `Known Learnings`.
10. Update glossary terms, aliases, index entries, and `key_files` when needed.
11. Run `knowledge check`.

## Rules

- Do not create learnings for obvious one-file fixes, typos, routine edge cases, or temporary incidents.
- Do not preserve debugging noise, every failed hypothesis, or minor commits.
- Do not call the learning complete without regression protection or a clear reason none applies.
