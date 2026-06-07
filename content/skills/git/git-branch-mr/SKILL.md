---
name: git-branch-mr
description: "Git branch and MR workflow. Use when user says 'create branch', 'create MR', 'push and create PR'."
---

# Git Branch & Merge Request

Create a branch, commit, push, and open an MR/PR for the current change.

## Quick Method: `gbr` Shell Function

Use `gbr` unless it is unavailable or unsuitable:

```bash
gbr <type> <description> [base-branch] [files...]
```

- `gbr feature add-user-auth main app/Models/User.php`
- `gbr fix login-redirect --current`  # uses current branch as base
- `MR_TITLE="Custom MR Title" gbr chore update-deps`

## Manual Method

1. Run `git status`.
2. Sync the requested base branch.
3. Create `feature/`, `fix/`, or `chore/` branch.
4. Stage only relevant files.
5. Commit with a clear message.
6. Push and create the MR/PR using `gh` or `glab` with title only and no body.
