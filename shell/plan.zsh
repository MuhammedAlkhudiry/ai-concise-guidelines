#!/usr/bin/env zsh

set -euo pipefail

script="$HOME/PhpstormProjects/my-setup/content/skills/workflow/persist-plan/scripts/plan.ts"

if [[ ! -f "$script" ]]; then
  echo "plan script not found at $script"
  echo "Run mise run install from ~/PhpstormProjects/my-setup"
  exit 1
fi

exec bun "$script" "$@"
