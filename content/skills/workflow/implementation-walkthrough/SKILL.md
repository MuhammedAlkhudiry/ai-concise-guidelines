---
name: implementation-walkthrough
description: >-
  Gentle, paced walkthroughs of implemented work, PRs, branches, or large changes with durable progress,
  prepared environments, coherent parts, inspection, QA, and follow-up changes.
---

## State Acquisition

1. Resolve the canonical repo root and current branch or PR identity.
2. Before scope analysis or any write, inspect every JSON file under `${XDG_STATE_HOME:-~/.local/state}/implementation-walkthroughs/`.
3. Match by JSON contents, not filename:
   - Use canonical `repoPath` plus `pr` when a PR exists; otherwise use `repoPath` plus `branch`.
   - If a branch walkthrough gains a PR, reuse and migrate it.
4. For one match, resume it in place and preserve recorded progress.
5. For multiple matches, never create another. Show each path, `updatedAt`, `currentPart`, and completed count; ask which to resume.
6. For no match, create `${XDG_STATE_HOME:-~/.local/state}/implementation-walkthroughs/<safe-identity>.json`. Never use repo, temporary, chat, `.codex`, or agent state.
7. Reconcile branch, SHA, diff, or scope changes in place. Mark only affected parts stale; change never justifies new state.

## Scope

8. Reconstruct scope from state, PR or branch context, diffs, commits, changed files, product surfaces, migrations, config, docs, tests, and notes. Cover purpose, flows, impact, risks, dependencies, and non-scope.
9. Compare state with current identity, SHA, diff, and scope; reconcile it and explain what became stale.
10. Give a compact overview before inspection: purpose, product effect, technical effect, risk map, likely path, and blockers.

## Parts And Environment

11. Divide work into coherent product or technical parts: a flow, page, role, state machine, integration, risk area, or implementation slice.
12. Prefer 15-30 minute parts. Keep cohesive flows intact; give larger parts estimates, checkpoints, and pause points.
13. Prepare the environment through the project-supported flow.
   For web, verify a responding URL and open the target in Chrome. For mobile, verify the device, build, launch, and target screen.

## Gentle Walkthrough Loop

14. Orient before asking the user to act. Walk one part and one manageable step at a time; reveal deeper detail only when useful.
15. Pause naturally for questions, inspection, changes, approval, skipping, or scope reshaping. Never pressure the user to approve or continue.
16. Update JSON after every part, decision, request, environment change, blocker, skip, stale marker, or scope change.
17. On scope change, pause, handle the change as requested, resync parts, then continue.

## State Shape

Track at least:

- `repoPath`, `branch`, `pr`, `headSha`, `analyzedRange`, `updatedAt`.
- `overview`: purpose, product impact, technical impact, risks, non-scope.
- `environment`: web URL or device, app state, login/test data, proof, blockers.
- `parts`: id, title, boundary, estimate, checkpoints, status, stale reason, notes, evidence, related files.
- `currentPart`, `decisions`, `requestedChanges`, `skippedItems`, `blockers`, `followUps`.

## Output Shape

- Report one startup outcome:
  - `Resumed walkthrough: <path> — current part: <title>.`
  - `Created walkthrough: <path> — no existing state matched <identity>.`
  - `Multiple walkthroughs matched; selection is required before continuing.`
- Show parts with estimates, status, stale markers, and the verified environment or blocker.
- Before presenting a part, load and follow `references/part-template.md`. Start only the first or current part.
- After each part, summarize, update state, then pause and offer the next move without starting it.

## Rules

- Keep QA cases runnable and observable, but do not reduce the session to QA.
- Do not hand over route lists, file lists, or generic test cases as the walkthrough.
