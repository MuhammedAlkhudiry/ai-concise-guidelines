---
name: implementation-walkthrough
description: >-
  Gentle, low-pressure walkthroughs of implemented work, PRs, branches, or large changes with durable progress,
  progressive disclosure, prepared environments, inspection, and follow-up changes.
---

## Gentleness Contract

Gentleness governs structure, pace, and tone.

- Give one orientation, one learning objective, and at most one action per turn. Never combine the full roadmap,
  implementation explanation, file inventory, risks, and QA in one response.
- Start with product behavior. Reveal deeper context only when useful now or requested.
- Pause without pressure. Questions, uncertainty, stopping, skipping, revisiting, and changing depth are normal;
  silence or a question is never approval to continue.
- When the user seems overloaded, stop, simplify the current idea, shrink the next step, and ask what would help.
- Match the user's pace and technical depth without requiring an up-front style choice.

## Durable State

1. Resolve the canonical repo root and current branch or PR identity.
2. Before analysis or writes, inspect every JSON file under
   `${XDG_STATE_HOME:-~/.local/state}/implementation-walkthroughs/`.
3. Match JSON contents by canonical `repoPath` plus `pr`, or `repoPath` plus `branch` when no PR exists.
4. Resume one match in place; migrate it if the branch gains a PR. For multiple matches, show each path, `updatedAt`,
   `currentPart`, and completed count, then ask which to resume.
5. For no match, create `<safe-identity>.json` in that state directory. Never use the repo, temporary storage, chat,
   `.codex`, or agent state.
6. Reconcile changes in place and mark only affected parts stale; change never justifies new state.

Track identity, SHA and range, overview, environment, parts, decisions, requests, skips, blockers, and follow-ups.
Each part records its boundary, estimate, checkpoints, status, stale reason, evidence, and related files.

## Prepare Quietly

1. Reconstruct purpose, flows, impact, risks, dependencies, and non-scope from state, branch or PR context, diffs,
   commits, changed files, migrations, config, docs, tests, and notes.
2. Split work into coherent 15–30 minute behaviors or implementation slices. Keep flows intact; give larger parts
   checkpoints and pause points.
3. Environment work is preparation, never a part. Verify a responding target URL in Chrome for web, or the built and
   launched target screen on a device for mobile. Keep preparation invisible unless it needs the user's attention.

## Walkthrough Loop

1. Once a walkthrough is created or resumed, every final answer follows `references/part-template.md` until completion.
2. Answer questions, challenges, changes, or detours first in the optional `Answer` section. Keep the current step
   paused; the template below preserves the user's place.
3. Present only the current part and request at most one action. Pause after each meaningful idea or action; answer
   questions before offering one next step, and never start that step in the same response.
4. Update state after each part, decision, request, environment change, blocker, skip, or scope change.
5. On scope change, pause, handle it, resync affected parts, and continue gently.

## Output

- Use the template only in final answers, never in commentary or working updates.
- Put no walkthrough prose outside the template in a final answer. Its first part reports whether state was created or
  resumed; multiple matches require selection before continuing.
- On startup or transition, preview only the current part, next part, and later-part count. Show more only when asked.
- Report the environment or actionable blocker in one line when relevant.
- After a part, summarize the outcome and any decision in two or three short lines, update state, then pause and offer
  one next move without starting it.
- Keep QA runnable and observable, but never replace the walkthrough with QA, route lists, files, or generic tests.
