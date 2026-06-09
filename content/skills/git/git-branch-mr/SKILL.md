---
name: git-branch-mr
description: Branch, commit, push, and MR/PR flow for prompts like create branch, create MR, push and create PR, or open a merge request.
---

# Git Branch & Merge Request

Create a branch, commit, push, and open an MR/PR for the current change.

## Workflow

1. Run `git status`.
2. Sync the requested base branch.
3. Create `feature/`, `fix/`, or `chore/` branch.
4. Stage only relevant files.
5. Commit with a clear message.
6. Push and create the MR/PR using `gh` or `glab` with title only and no body.
