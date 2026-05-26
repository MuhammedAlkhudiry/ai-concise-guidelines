---
name: delete-worktree
description: Delete local git worktrees and their owned local resources. Use when asked to remove, clean up, prune, or delete a repo worktree.
---

# Delete Worktree

Remove a worktree and only the local resources that clearly belong to it.

## Workflow

1. Resolve the canonical checkout and target worktree path.
2. Start with:

```bash
rtk git worktree list --porcelain
```

3. Check target dirty status before deleting.
4. Remove clean worktrees with `rtk git worktree remove <path>`, then run `rtk git worktree prune`.
5. Ask before force-removing dirty worktrees.
6. Stop and delete DDEV, Vite, local service, and filesystem resources only when they clearly belong to that worktree.
7. Verify Git registration, filesystem path, processes, and owned local services are gone.
8. Summarize what was removed and what was preserved.

## Rules

- Preserve canonical checkout config, shared caches, production dumps, and unrelated Docker or DDEV projects.
- Do not remove dirty worktrees without explicit approval.
- Do not clean broad Docker, package-manager, or global caches.
