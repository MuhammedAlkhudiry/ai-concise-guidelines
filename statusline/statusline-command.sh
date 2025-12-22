#!/bin/bash

input=$(cat)

# Colors
CYAN=$'\033[36m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
RED=$'\033[31m'
MAGENTA=$'\033[35m'
BLUE=$'\033[34m'
DIM=$'\033[2m'
RESET=$'\033[0m'

# Directory
cwd=$(echo "$input" | jq -r '.workspace.current_dir')
dir_name=$(basename "$cwd")

# Git branch
git_info=""
if git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
    branch=$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ -n "$branch" ]; then
        dirty=""
        if ! git -C "$cwd" --no-optional-locks diff --quiet 2>/dev/null || ! git -C "$cwd" --no-optional-locks diff --cached --quiet 2>/dev/null; then
            dirty=" ${YELLOW}●${RESET}"
        fi
        git_info=" ${BLUE}⎇${RESET} ${GREEN}${branch}${RESET}${dirty}"
    fi
fi

# Model
model_name=$(echo "$input" | jq -r '.model.display_name')
model_short=$(echo "$model_name" | sed 's/Claude //' | sed 's/ /-/g')

# Context: show as percentage bar with color
usage=$(echo "$input" | jq '.context_window.current_usage')
context_bar=""
if [ "$usage" != "null" ]; then
    input_tokens=$(echo "$usage" | jq '.input_tokens // 0')
    cache_creation=$(echo "$usage" | jq '.cache_creation_input_tokens // 0')
    cache_read=$(echo "$usage" | jq '.cache_read_input_tokens // 0')

    current_total=$((input_tokens + cache_creation + cache_read))
    size=$(echo "$input" | jq '.context_window.context_window_size')

    if [ "$size" -gt 0 ] 2>/dev/null; then
        pct=$((current_total * 100 / size))

        # Color based on usage
        if [ "$pct" -ge 80 ]; then
            BAR_COLOR=$RED
        elif [ "$pct" -ge 50 ]; then
            BAR_COLOR=$YELLOW
        else
            BAR_COLOR=$GREEN
        fi

        # Visual bar (10 segments)
        filled=$((pct / 10))
        empty=$((10 - filled))
        bar=""
        for ((i=0; i<filled; i++)); do bar+="█"; done
        for ((i=0; i<empty; i++)); do bar+="░"; done

        context_bar=" ${BAR_COLOR}${bar}${RESET} ${DIM}${pct}%${RESET}"
    fi
fi

# Final output
echo "${CYAN}📁 ${dir_name}${RESET}${git_info} ${DIM}│${RESET} ${MAGENTA}${model_short}${RESET} ${DIM}│${RESET}${context_bar}"
