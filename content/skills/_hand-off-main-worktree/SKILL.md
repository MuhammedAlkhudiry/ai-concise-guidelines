---
name: _hand-off-main-worktree
description: Use when the user wants uncommitted changes moved from a secondary git worktree into the main checkout for review, continuation, or handoff.
---

# Hand Off To Main Git Worktree

Move the requested uncommitted changes from a secondary worktree into the main checkout without disturbing unrelated diffs.

## Workflow

1. Identify the source worktree and the main checkout.
2. Inspect `git status --short` in both locations before moving anything.
3. Isolate only the paths that belong to the requested handoff.
4. Transfer the changes into the main checkout with an explicit patch or exact file copy.
5. Verify the target diff in the main checkout.
6. Remove the handed-off changes from the source worktree only if the user wants a move rather than a copy.

## Rules

- Never move unrelated diffs.
- Do not use `git stash` as the default handoff method across worktrees.
- Prefer `git diff --binary` plus `git apply` for tracked edits and deletions.
- Copy untracked files explicitly by path.
- Do not overwrite newer target changes blindly. Stop and surface conflicts instead.
- After the handoff, verify the main checkout with `git status --short` and `git diff -- <paths>`.

## Default Command Shape

Tracked changes:

```bash
cd /path/to/source-worktree
git diff --binary HEAD -- path/to/file1 path/to/file2 > /tmp/worktree-handoff.patch

cd /path/to/main-checkout
git apply /tmp/worktree-handoff.patch
```

Untracked files:

```bash
cp -R /path/to/source-worktree/path/to/new-file /path/to/main-checkout/path/to/new-file
```

## Finish

- Show which paths were handed off.
- Confirm that the main checkout now contains the uncommitted patch.
- Call out any conflicts, skipped files, or cleanup still needed in the source worktree.
