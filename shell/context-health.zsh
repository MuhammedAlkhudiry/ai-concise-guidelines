#!/usr/bin/env zsh

set -euo pipefail

script="$HOME/PhpstormProjects/my-setup/content/skills/setup/improve-my-setup/scripts/analyze-codex-sessions.ts"

if [[ ! -f "$script" ]]; then
  echo "context-health script not found at $script"
  echo "Run mise run install from ~/PhpstormProjects/my-setup"
  exit 1
fi

exec bun "$script" "$@"
