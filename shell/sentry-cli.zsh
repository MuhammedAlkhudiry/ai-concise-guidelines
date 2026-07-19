#!/usr/bin/env zsh

set -u

SENTRY_CLI_NPM_BIN="$HOME/.local/share/mise/installs/node/latest/bin/sentry-cli"

if [[ ! -x "$SENTRY_CLI_NPM_BIN" ]]; then
  echo "sentry-cli executable not found at $SENTRY_CLI_NPM_BIN"
  echo "Run npm install -g @sentry/cli@latest"
  exit 1
fi

exec "$SENTRY_CLI_NPM_BIN" "$@"
