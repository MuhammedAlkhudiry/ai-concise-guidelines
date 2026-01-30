# Git Branch & Merge Request

Execute the Git Branch & Merge Request Workflow for the changes.

## Pre-flight

1. Run `git status` to see current state
2. Run `git checkout <base-branch> && git pull` to sync with base branch

## Create Branch

Run: `git checkout -b <type>/<short-description>`

Branch types: `feature/`, `fix/`, `chore/`

## Stage Only Relevant Files

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

## Commit

Run: `git commit -m "concise description of change"`

Message can match branch name or be a short sentence.

## Push & Create MR

Run: `git push -u origin <branch-name>`

Then create merge request using `gh` (GitHub) or `glab` (GitLab).
