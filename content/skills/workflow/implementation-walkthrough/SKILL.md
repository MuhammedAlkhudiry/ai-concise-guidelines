---
name: implementation-walkthrough
description: >-
  Gentle walkthroughs for implemented work, PRs, branches, or large changes where the agent reconstructs scope,
  prepares the app, tracks progress outside repo and agent state, and guides natural parts through inspection,
  QA, and follow-up changes.
---

## Scope And State

1. Reconstruct scope from the PR, branch, local diff, title, description, commits, changed files, routes/screens, migrations, config, docs, tests, and notes.
   Done when you can state what changed, why it matters, affected flows, technical impact, risks, dependencies, and non-scope.
2. Create or update persistent walkthrough JSON in user-owned state outside the repo and outside agent application state:
   `${XDG_STATE_HOME:-~/.local/state}/implementation-walkthroughs/<safe-repo-and-branch-or-pr-key>.json`.
   Do not store it under the repo, temporary directories, chat memory, `.codex`, or another agent config/state directory.
3. Before trusting saved state, compare repo path, branch, PR identifier when present, and head SHA.
   If any differ, resync scope, mark affected parts stale, and explain the stale boundary.
4. Give a compact overview before inspection: purpose, product effect, technical effect, risk map, likely path, and blockers.

## Parts And Environment

5. Break the work into natural parts by product and technical coherence: one flow, page, role, state machine, integration, risk area, or cohesive implementation slice.
6. Prefer 15-30 minute parts when natural. Do not split a cohesive flow only to hit the target; label larger parts with estimates, checkpoints, and pause points.
7. Prepare the environment through the project-supported flow.
   For web, verify a responding URL and open the relevant state in Chrome.
   For mobile, verify simulator/emulator, installed app/build, launch state, and reachable target screen.

## Walkthrough Loop

8. Walk through one part at a time.
   Briefly explain product behavior, show focused code context when useful, then guide inspection, testing, or decisions.
9. Let the user ask questions, inspect code, request changes, approve the part, skip it, pause, or reshape scope.
   Treat change requests as part of the walkthrough, not interruptions.
10. Update the JSON after every part, decision, requested change, environment change, blocker, skipped area, stale marker, and scope mutation.
11. When scope changes, pause the current path, implement or plan the change as requested, then resync parts before continuing.

## State Shape

Track at least:

- `repoPath`, `branch`, `pr`, `headSha`, `analyzedRange`, `updatedAt`.
- `overview`: purpose, product impact, technical impact, risks, non-scope.
- `environment`: web URL or device, app state, login/test data, proof, blockers.
- `parts`: id, title, boundary, estimate, checkpoints, status, stale reason, notes, evidence, related files.
- `currentPart`, `decisions`, `requestedChanges`, `skippedItems`, `blockers`, `followUps`.

## Output Shape

- Start with a short implementation overview when the user is not oriented.
- Show the proposed parts with estimates, status, and stale markers.
- State the verified environment or setup blocker.
- Start only the first or current part: explain behavior, name relevant files when helpful, give an exact starting point, and list observable checks.
- After each part, summarize what happened, update state, and offer the next natural move.

## Rules

- Be gentle: orient first, then move one step at a time.
- Use code references selectively when they help the user understand, trust, or decide.
- Keep QA cases runnable and observable, but do not reduce the session to QA.
- Preserve natural boundaries over uniform sizing.
- Do not hand over route lists, file lists, or generic test cases as the walkthrough.
- Do not bury the user in full implementation details before they are useful.
- Do not continue from saved JSON until freshness has been checked.
- Do not keep progress only in chat memory.
