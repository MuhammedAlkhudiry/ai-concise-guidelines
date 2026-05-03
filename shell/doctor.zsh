#!/usr/bin/env zsh

set -u

typeset -i required_ok=0
typeset -i required_missing=0
typeset -i optional_ok=0
typeset -i optional_missing=0
GUM_BIN="$(command -v gum 2>/dev/null || true)"

has_gum() {
  [[ -n "$GUM_BIN" ]]
}

print_header() {
  printf '\n'
  if has_gum; then
    "$GUM_BIN" style --bold --foreground 81 "$1"
  else
    printf '%s\n' "$1"
  fi
}

print_ok() {
  if has_gum; then
    printf '  %s %-14s %s\n' \
      "$("$GUM_BIN" style --foreground 42 "[ok]")" \
      "$("$GUM_BIN" style --foreground 252 "$1")" \
      "$("$GUM_BIN" style --foreground 244 "$2")"
  else
    printf '  [ok]   %-14s %s\n' "$1" "$2"
  fi
}

print_missing() {
  if has_gum; then
    local color="214"
    [[ "$1" == "required" ]] && color="196"
    printf '  %s %-14s %s\n' \
      "$("$GUM_BIN" style --foreground "$color" "[$1]")" \
      "$("$GUM_BIN" style --foreground 252 "$2")" \
      "$("$GUM_BIN" style --foreground 244 "$3")"
  else
    printf '  [%s] %-14s %s\n' "$1" "$2" "$3"
  fi
}

print_summary() {
  printf '\n'
  if has_gum; then
    "$GUM_BIN" style --bold --foreground 81 "Summary"
    printf '  %s ok=%d missing=%d\n' "$("$GUM_BIN" style --foreground 252 "required:")" "$required_ok" "$required_missing"
    printf '  %s ok=%d missing=%d\n' "$("$GUM_BIN" style --foreground 252 "optional:")" "$optional_ok" "$optional_missing"
    printf '  %s\n' "$("$GUM_BIN" style --foreground 244 "note: this checks command presence plus the ai-assistant LaunchAgent, not auth, credentials, or full runtime access.")"
  else
    printf 'Summary\n'
    printf '  required: ok=%d missing=%d\n' "$required_ok" "$required_missing"
    printf '  optional: ok=%d missing=%d\n' "$optional_ok" "$optional_missing"
    printf '  note: this checks command presence plus the ai-assistant LaunchAgent, not auth, credentials, or full runtime access.\n'
  fi
}

check_tool() {
  local name="$1"
  local level="$2"
  local note="$3"
  local resolved_path

  resolved_path="$(command -v "$name" 2>/dev/null || true)"

  if [[ -n "$resolved_path" ]]; then
    print_ok "$name" "$resolved_path"
    if [[ "$level" == "required" ]]; then
      (( required_ok++ ))
    else
      (( optional_ok++ ))
    fi
    return 0
  fi

  print_missing "$level" "$name" "$note"
  if [[ "$level" == "required" ]]; then
    (( required_missing++ ))
  else
    (( optional_missing++ ))
  fi
}

check_ai_assistant_launch_agent() {
  local label="com.malkhudhari.ai-assistant.digest"
  local plist_file="$HOME/Library/LaunchAgents/${label}.plist"
  local launch_target="gui/$(id -u)/${label}"
  local note

  if [[ -f "$plist_file" ]] && launchctl print "$launch_target" >/dev/null 2>&1; then
    print_ok "ai-assistant" "LaunchAgent loaded"
    (( required_ok++ ))
    return 0
  fi

  if [[ -f "$plist_file" ]]; then
    note="LaunchAgent plist exists but is not loaded. Run make install."
  else
    note="LaunchAgent plist is missing. Run make install."
  fi

  print_missing required "ai-assistant" "$note"
  (( required_missing++ ))
}

main() {
  print_header "Core repo tools"
  check_tool bun required "Runtime used internally by make install."
  check_tool git required "Needed for remote skill checkout, hooks, and shared git helpers."
  check_tool make required "Needed for the only supported local install workflow."
  check_tool mise required "Needed for global runtime management instead of NVM."
  check_tool zsh required "Needed by all installed shared shell commands."

  print_header "Shell and helper integrations"
  check_tool phpstorm optional "Used by the synced zsh config as the editor command."
  check_tool ddev optional "Used by Laravel aliases in the synced zsh config."
  check_tool obsidian optional "Used by ai-assistant to read and update the personal vault."
  check_tool codex optional "Used by ai-assistant to run inbox digestion."
  check_tool opencode optional "Used by the ai/opencode launcher and OpenCode workflows."
  check_tool fzf optional "Used by project pickers and interactive hosts deletion."

  print_header "Background jobs"
  check_ai_assistant_launch_agent

  print_header "Git and remote workflow helpers"
  check_tool gh optional "Used by gbr to open a GitHub pull request."
  check_tool glab optional "Used by gbr to open a GitLab merge request."
  check_tool kubectl optional "Required by remote and remote-info."
  check_tool gum optional "Optional styling for remote-info output."
  check_tool php optional "Required inside remote-tinker payload execution."

  print_summary

  if (( required_missing > 0 )); then
    return 1
  fi

  return 0
}

main "$@"
