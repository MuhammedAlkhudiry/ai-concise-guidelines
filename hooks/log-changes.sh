#!/bin/bash

# Changes logging hook for Claude Code
# Logs Edit and Write operations to the active audit's changes.log
# Requires: .claude/active-audit.txt containing the audit path

set -euo pipefail

# Get active audit path
ACTIVE_AUDIT_FILE="${CLAUDE_PROJECT_DIR}/.claude/active-audit.txt"
if [ ! -f "$ACTIVE_AUDIT_FILE" ]; then
  exit 0  # No active audit, nothing to log
fi

AUDIT_PATH_RAW=$(cat "$ACTIVE_AUDIT_FILE" 2>/dev/null | tr -d '\n')
if [ -z "$AUDIT_PATH_RAW" ]; then
  exit 0
fi

# Make path absolute if relative
if [[ "$AUDIT_PATH_RAW" = /* ]]; then
  AUDIT_PATH="$AUDIT_PATH_RAW"
else
  AUDIT_PATH="${CLAUDE_PROJECT_DIR}/${AUDIT_PATH_RAW}"
fi

CHANGES_LOG="${AUDIT_PATH}/changes.log"

# Ensure audit directory exists
if [ ! -d "$AUDIT_PATH" ]; then
  exit 0  # Audit path doesn't exist, skip
fi

# Read JSON from stdin
INPUT=$(cat)

# Parse JSON using jq if available, otherwise basic parsing
if command -v jq &>/dev/null; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
else
  TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | cut -d'"' -f4)
  FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4)
fi

# Validate required fields
if [ -z "$TOOL_NAME" ] || [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Timestamp (HH:MM format to match existing docs)
TIMESTAMP=$(date +"%H:%M")

# Operation type
OPERATION="write"
if [ "$TOOL_NAME" = "Edit" ]; then
  OPERATION="edit"
fi

# Get relative path from project root
RELATIVE_PATH="${FILE_PATH#$CLAUDE_PROJECT_DIR/}"

# Format: {time} | {edit|write} | {file} | auto-logged
LOG_ENTRY="${TIMESTAMP} | ${OPERATION} | ${RELATIVE_PATH} | auto-logged"

# Append to log file
echo "$LOG_ENTRY" >> "$CHANGES_LOG"

exit 0
