#!/usr/bin/env zsh

set -euo pipefail

setup_runtime_path() {
  export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

  export PATH="${HOME}/.local/share/mise/shims:${PATH}"
  export PATH="${HOME}/.bun/bin:${PATH}"

  typeset -U path PATH
}

setup_runtime_path

readonly CLI_PATH="${AI_ASSISTANT_CLI:-$HOME/PhpstormProjects/ai-concise-guidelines/src/ai-assistant/cli.ts}"

if [[ ! -f "$CLI_PATH" ]]; then
  printf 'error: ai-assistant CLI not found at %s\n' "$CLI_PATH" >&2
  printf 'Run make install from ~/PhpstormProjects/ai-concise-guidelines after updating the repo.\n' >&2
  exit 1
fi

if command -v mise >/dev/null 2>&1; then
  exec mise exec -- bun "$CLI_PATH" "$@"
fi

exec bun "$CLI_PATH" "$@"
