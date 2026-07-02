#!/usr/bin/env zsh

set -euo pipefail

script="$HOME/.agents/skills/workflow/scripts/analyze-codex-sessions.ts"
MY_SETUP_ROOT="${MY_SETUP_ROOT:-${0:A:h:h}}"

if [[ ! -f "$script" ]]; then
  echo "context-health script not found at $script"
  echo "Run mise run install from $MY_SETUP_ROOT"
  exit 1
fi

exec bun "$script" "$@"
