---
name: audit-verifications
description: Read-only audits of project verification coverage, effectiveness, reliability, and performance, including tests, static analysis, linting, CI, and missing checks or tools.
---

## Workflow

1. Audit the requested scope without editing files, configuration, CI, or repository settings. Use $systematic-work for exhaustive repository
   coverage.
2. Inventory checks from repository instructions, `CHECKLIST.md`, task runners, manifests, tool and CI configuration, repository rules, and run
   evidence. Read narrow live help when tool behavior affects a finding.
3. Use $verification to run every relevant stable project-owned check and test suite. CI results supplement local execution but never replace it;
   report checks that cannot run as `BLOCKED` with the cause.
4. Map each check to its protected risk or contract. Cover every project-defined verification kind, including tests, type and static analysis,
   linting, formatting, builds, and project-specific checks; infer missing areas from the project rather than a universal checklist.
5. Use $test-writing for test coverage, duplication, brittleness, placement, runtime, and flakiness; do not duplicate its test-level analysis.
6. Assess scope, proof quality, execution stage, and enforcement. Inspect triggers, path filters, matrices, required checks, local and CI parity,
   exclusions, thresholds, skipped states, retries, and fail-open behavior when relevant.
7. Assess developer and CI feedback cost from evidence, including critical-path time, duplication, caching, parallelism, sharding, and broad runs.
   Distinguish measurements from inference.
8. Recommend a missing area or tool only for a named gap. Prefer extending the established path and state protection, feedback cost, maintenance, and
   confidence.
9. Report the verdict, local verification, CI improvements, prioritized findings, worthwhile missing checks or tools, evidence, limitations, commands,
   and confirmation that no changes were made.

## Findings

Classify each finding as `missing`, `ineffective`, `unenforced`, `unreliable`, or `wasteful`. Rank it `HIGH`, `MEDIUM`, or `LOW`, name the affected
surface and evidence, explain the practical risk, and give the smallest complete recommendation. Omit healthy areas unless they materially support the
overall verdict.
