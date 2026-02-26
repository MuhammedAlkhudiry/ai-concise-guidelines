#!/usr/bin/env zsh

# Usage: gbr <type> <description> [base-branch] [files...]
#        gbr feature add-user-auth main app/Models/User.php
#        gbr fix login-redirect --current
#
# Environment: MR_TITLE (optional) - custom MR title, defaults to commit message

set -euo pipefail

branch_type="${1:-}"
description="${2:-}"
base_branch="${3:-main}"

shift_count=2
if [[ "$base_branch" == "--current" ]]; then
  base_branch="$(git branch --show-current)"
  shift_count=3
else
  shift_count=3
fi

if [[ "$#" -ge "$shift_count" ]]; then
  shift "$shift_count"
else
  shift "$#"
fi

files=("$@")
branch_name="${branch_type}/${description}"

if [[ -z "$branch_type" || -z "$description" ]]; then
  echo "Usage: gbr <type> <description> [base-branch] [files...]"
  echo "Types: feature, fix, chore"
  exit 1
fi

if [[ "$branch_type" != "feature" && "$branch_type" != "fix" && "$branch_type" != "chore" ]]; then
  echo "Invalid type. Use: feature, fix, or chore"
  exit 1
fi

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Not a git repository"
  exit 1
fi

echo "→ Checking status..."
if ! git status --short | grep -q "^"; then
  echo "  Working directory clean"
else
  echo "  Uncommitted changes detected (will stash if needed)"
fi

echo "→ Syncing with ${base_branch}..."
git checkout "$base_branch"
git pull

echo "→ Creating branch ${branch_name}..."
git checkout -b "$branch_name"

if [[ ${#files[@]} -gt 0 ]]; then
  echo "→ Staging specified files..."
  git add "${files[@]}"
else
  echo "→ Staging all changes..."
  git add -A
fi

if git diff --cached --quiet; then
  echo "No changes to commit"
  exit 1
fi

commit_msg="${branch_type}: ${description//-/ }"
echo "→ Committing: ${commit_msg}"
git commit -m "$commit_msg"

echo "→ Pushing to origin..."
git push -u origin "$branch_name"

mr_title="${MR_TITLE:-$commit_msg}"
echo "→ Creating MR: ${mr_title}..."

if command -v glab >/dev/null 2>&1; then
  glab mr create --title "$mr_title" --description "" --source-branch "$branch_name" --target-branch "$base_branch"
elif command -v gh >/dev/null 2>&1; then
  gh pr create --title "$mr_title" --body "" --head "$branch_name" --base "$base_branch"
else
  echo "  (No gh/glab found - MR not created)"
fi

echo "✓ Done: ${branch_name}"
