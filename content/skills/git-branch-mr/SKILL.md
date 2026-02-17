---
name: git-branch-mr
description: "Git branch and MR workflow. Use when user says 'create branch', 'create MR', 'push and create PR'."
---

# Git Branch & Merge Request

Execute the Git Branch & Merge Request Workflow for the changes.

## Quick Method: `gbr` Shell Function

Use the `gbr` function for a fast single-command workflow **unless it's not working or suitable** for the current situation:

```bash
gbr <type> <description> [base-branch] [files...]
```

**Examples:**
- `gbr feature add-user-auth main app/Models/User.php`
- `gbr fix login-redirect --current`  # uses current branch as base
- `MR_TITLE="Custom MR Title" gbr chore update-deps`

## Manual Method

Use these commands if `gbr` is not available or not suitable for this workflow.

### Pre-flight

1. Run `git status` to see current state
2. Run `git checkout <base-branch> && git pull` to sync with base branch

### Create Branch

Run: `git checkout -b <type>/<short-description>`

Branch types: `feature/`, `fix/`, `chore/`

### Stage Only Relevant Files

DO NOT stage:
- `docs/ai/sessions/`
- AI state files
- IDE configs (`.idea/`, `.vscode/`)
- Local environment changes (`phpunit.xml`, `.env`)
- Unrelated changes

Stage only the files relevant to this change:
```bash
git add path/to/file1 path/to/file2
```

### Commit

Run: `git commit -m "concise description of change"`

Message can match branch name or be a short sentence.

### Push & Create MR

Run: `git push -u origin <branch-name>`

Then create merge request using `gh` (GitHub) or `glab` (GitLab). Keep the MR description minimal.
