---
name: implementation-walkthrough
description: >-
  Gentle, low-pressure walkthroughs of implemented work, PRs, branches, or large changes with durable progress,
  progressive disclosure, prepared environments, inspection, and follow-up changes.
---

## Gentleness Contract

Read `references/part-template.md` before starting. It owns the final-answer shape, pacing, and gentleness constraints.

## Durable State

1. Resolve the canonical repo root and current branch or PR identity.
2. Before analysis or writes, inspect every JSON file under
   `${XDG_STATE_HOME:-~/.local/state}/implementation-walkthroughs/`.
3. Match JSON contents by canonical `repoPath` plus `pr`, or `repoPath` plus `branch` when no PR exists.
4. Resume one match in place, migrating legacy shapes and branch-to-PR identity. For multiple matches, show path,
   `updatedAt`, cursor, and completed count, then ask which to resume.
5. For no match, create `<safe-identity>.json` in that state directory. Never use the repo, temporary storage, chat,
   `.codex`, or agent state.
6. Reconcile changes in place and mark only affected parts stale; change never justifies new state.

Use `references/state-schema.md` as the resume checkpoint; omit empty, optional, or null fields. Fold decisions and
changes into parts, skips into part status, and retain only one blocker. Reconstruct broader context on resume.

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

Follow `references/part-template.md` for every final answer after creation or resume. Keep preparation in commentary and state; keep walkthrough output inside the template.
