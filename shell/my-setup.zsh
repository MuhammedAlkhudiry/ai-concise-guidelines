#!/usr/bin/env zsh

set -euo pipefail

MY_SETUP_ROOT="${MY_SETUP_ROOT:-${0:A:h:h}}"

exec bun "$MY_SETUP_ROOT/src/cli.ts" "$@"
