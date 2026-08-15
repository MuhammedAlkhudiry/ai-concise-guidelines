---
name: audit-verifications
description: Read-only audits of project verification coverage, effectiveness, reliability, and performance, including tests, static analysis, linting, CI, and missing checks or tools.
---

## Workflow

1. Resolve the requested scope and audit it without editing files, configuration, CI, or repository settings. Use $systematic-work when the scope
   requires exhaustive repository coverage.
2. Inventory verification from repository instructions, `CHECKLIST.md`, task runners, manifests, tool configuration, CI workflows, repository rules,
   and available run evidence. Read the narrowest relevant live help when a tool's behavior affects a finding.
3. Map each discovered check to the risk or contract it claims to protect. Cover every project-defined verification kind, including tests, type and
   static analysis, linting, formatting, builds, and project-specific checks; infer missing areas from the actual project rather than a universal
   checklist.
4. Use $test-writing to audit test coverage and quality, including duplication, brittleness, placement, runtime, and flakiness. Do not duplicate its
   test-level analysis.
5. Assess whether checks cover the intended surface, prove a meaningful contract, run at the right stage, and are enforced consistently. Inspect
   triggers, path filters, matrices, required checks, local and CI parity, exclusions, thresholds, skipped states, retries, and fail-open behavior when
   relevant.
6. Assess developer and CI feedback cost from available evidence. Identify the critical path, queue and execution time, duplicated setup or checks,
   ineffective caching, poor parallelism or sharding, and expensive broad runs. Distinguish measured evidence from inference.
7. Recommend a missing verification area or tool only when it closes a named gap. Prefer repairing or extending an established project-owned path;
   state expected protection, feedback cost, maintenance burden, and confidence for every recommendation.
8. Report the overall verdict, existing coverage, prioritized findings, worthwhile missing checks or tools, evidence, limitations, and commands
   inspected or run. State explicitly that no changes were made.

## Findings

Classify each finding as `missing`, `ineffective`, `unenforced`, `unreliable`, or `wasteful`. Rank it `HIGH`, `MEDIUM`, or `LOW`, name the affected
surface and evidence, explain the practical risk, and give the smallest complete recommendation. Omit healthy areas unless they materially support the
overall verdict.
