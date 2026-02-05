# =============================================================================
# Custom ZSH Configuration
# Synced via: https://github.com/MuhammedAlkhudiry/ai-concise-guidelines
# =============================================================================

# --- Editor ---
alias zsh="phpstorm ~/.zshrc"
export EDITOR=phpstorm

# --- Laravel/DDEV ---
alias a="ddev artisan"
alias dl="ddev launch"
alias retry="a migrate:rollback && a migrate"
alias as="a db:seed"
alias am="a migrate"
alias ci="ddev composer install"
alias cr="ddev composer require"
alias cu="ddev composer update"
alias ds="ddev start"
alias sync="ddev mutagen sync"

# --- Testing ---
alias test="a test --parallel --stop-on-failure"
alias t="a test --parallel --stop-on-failure"
alias test-no-parallel="a test --stop-on-failure"
alias coverage="a test --parallel --coverage --stop-on-failure"

# --- Dev Server ---
# Smart dev server launcher with project navigation and package manager detection
# Fuzzy-finds across projects AND their subdirectories (for monorepos)
# Usage: dev              - runs dev in current directory
#        dev front        - fuzzy match "front" in projects + subdirs (e.g., myapp/frontend)
dev() {
    local query="$*"
    local target_dir
    
    if [[ -n "$query" ]]; then
        # Build list: projects + first-level subdirs (for monorepos like myapp/frontend)
        local selected
        selected=$({
            # List projects
            ls -1 "$PROJECTS_DIR"
            # List project/subdir for dirs containing package.json in subdir
            for proj in "$PROJECTS_DIR"/*/; do
                proj_name=$(basename "$proj")
                for subdir in "$proj"*/; do
                    [[ -d "$subdir" ]] || continue
                    subdir_name=$(basename "$subdir")
                    # Skip hidden dirs and node_modules
                    [[ "$subdir_name" == .* ]] && continue
                    [[ "$subdir_name" == "node_modules" ]] && continue
                    # Only include if it has package.json (it's a JS project)
                    [[ -f "$subdir/package.json" ]] && echo "$proj_name/$subdir_name"
                done
            done
        } | fzf \
            --height=40% \
            --reverse \
            --border=rounded \
            --prompt="Dev > " \
            --header="Select project or subproject" \
            --query="$query" \
            --select-1 \
            --exit-0)
        
        if [[ -z "$selected" ]]; then
            return 1
        fi
        
        target_dir="$PROJECTS_DIR/$selected"
        
        if [[ ! -d "$target_dir" ]]; then
            echo "Directory not found: $target_dir"
            return 1
        fi
        
        cd "$target_dir"
    fi
    
    # Detect package manager and run dev
    if [[ -f "bun.lockb" ]] || [[ -f "bun.lock" ]]; then
        echo "Using bun..."
        bun run dev
    elif [[ -f "pnpm-lock.yaml" ]]; then
        echo "Using pnpm..."
        pnpm run dev
    elif [[ -f "yarn.lock" ]]; then
        echo "Using yarn..."
        yarn dev
    elif [[ -f "package-lock.json" ]] || [[ -f "package.json" ]]; then
        echo "Using npm..."
        npm run dev
    else
        echo "No package.json found in $(pwd)"
        return 1
    fi
}

# --- AI Tools Refresh ---
# Helper function to run init.ts from remote
# --- Tool Initialization ---
[ -x /opt/homebrew/bin/brew ] && eval $(/opt/homebrew/bin/brew shellenv)
command -v fzf >/dev/null && eval "$(fzf --zsh)"
command -v lacy >/dev/null && eval "$(lacy init zsh)"

# --- NVM ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# --- Kubernetes ---
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"

function remote() {
    local namespace=$1
    local shell_type=${2:-bash}

    # Determine context based on namespace suffix
    if [[ $namespace == *-dev ]]; then
        local context="preprod"
    elif [[ $namespace == *-stg ]]; then
        local context="preprod"
    elif [[ $namespace == *-uat ]]; then
        local context="preprod"
    elif [[ $namespace == *-prod ]]; then
        local context="production"
    else
        echo "Invalid namespace suffix. Please use a namespace ending with -dev, -stg, -uat, or -prod."
        return 1
    fi

    # Match laravel-* or ajeer-* pods
    pod_name=$(kubectl get pods -n "$namespace" --context "$context" | grep -E '^(laravel|ajeer)-' | awk '{print $1}' | head -n 1)

    if [ -z "$pod_name" ]; then
        echo "No matching laravel or ajeer pod found."
        return 1
    fi

    if [[ $shell_type != "bash" && $shell_type != "sh" ]]; then
        echo "Invalid shell type. Please specify either 'bash' or 'sh'."
        return 1
    fi

    echo "Attempting to connect to pod '$pod_name' in namespace '$namespace' (context: $context) using shell '$shell_type'."

    kubectl exec -n "$namespace" --context "$context" -it "$pod_name" -- $shell_type
}

# --- PHP ---
export PATH="/opt/homebrew/opt/php@8.2/bin:$PATH"
export PATH="/opt/homebrew/opt/php@8.2/sbin:$PATH"

# --- ZSH Settings ---
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=8"

# --- Project Navigation ---
# Smart cd into PhpstormProjects with fuzzy matching via fzf
# Usage: p [query]  - no query opens fzf browser, query filters results
PROJECTS_DIR="$HOME/PhpstormProjects"

p() {
    local query="$1"
    local selected
    
    # Use fzf for selection with optional initial query
    selected=$(ls -1 "$PROJECTS_DIR" | fzf \
        --height=40% \
        --reverse \
        --border=rounded \
        --prompt="Project > " \
        --header="Select a project (↑↓ navigate, enter select, esc cancel)" \
        --query="$query" \
        --select-1 \
        --exit-0)
    
    if [[ -n "$selected" ]]; then
        cd "$PROJECTS_DIR/$selected"
    fi
}

# --- OpenCode ---
# Smart project launcher for opencode with fuzzy matching via fzf
# Usage: ai              - runs opencode in current directory
#        ai my-project   - fuzzy match "my-project" then run opencode
ai() {
    local query="$*"
    
    if [[ -n "$query" ]]; then
        local selected
        selected=$(ls -1 "$PROJECTS_DIR" | fzf \
            --height=40% \
            --reverse \
            --border=rounded \
            --prompt="AI > " \
            --header="Select a project" \
            --query="$query" \
            --select-1 \
            --exit-0)
        
        if [[ -z "$selected" ]]; then
            return 1
        fi
        
        if [[ ! -d "$PROJECTS_DIR/$selected" ]]; then
            echo "Directory not found: $PROJECTS_DIR/$selected"
            return 1
        fi
        
        cd "$PROJECTS_DIR/$selected"
    fi
    
    opencode
}

export PATH="$HOME/.opencode/bin:$PATH"
[ -f "$HOME/.local/bin/env" ] && . "$HOME/.local/bin/env"

# --- Bun ---
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# =============================================================================
# Terminal Tab Colors (Kitty)
# =============================================================================

# Set tab color with RGB values (both active and inactive)
_tab_color() {
  [[ -z "$KITTY_PID" ]] && return
  local hex=$(printf "#%02x%02x%02x" $1 $2 $3)
  # Inactive slightly darker (70% brightness)
  local r_dim=$(( $1 * 7 / 10 ))
  local g_dim=$(( $2 * 7 / 10 ))
  local b_dim=$(( $3 * 7 / 10 ))
  local hex_dim=$(printf "#%02x%02x%02x" $r_dim $g_dim $b_dim)
  kitten @ set-tab-color --self active_bg=$hex inactive_bg=$hex_dim active_fg=#1e1e2e inactive_fg=#1e1e2e 2>/dev/null
}

# Reset tab color to default
_tab_reset() {
  [[ -z "$KITTY_PID" ]] && return
  kitten @ set-tab-color --self active_bg=none inactive_bg=none active_fg=none inactive_fg=none 2>/dev/null
}

# Set tab title with marker
_tab_marker() {
  [[ -z "$KITTY_PID" ]] && return
  kitten @ set-tab-title --self "$1 ${PWD##*/}" 2>/dev/null
}

# Reset tab title to default (empty = use template)
_tab_title_reset() {
  [[ -z "$KITTY_PID" ]] && return
  kitten @ set-tab-title --self "" 2>/dev/null
}

# Nice color palette (10 colors)
_colors=(
  "100 180 255"  # blue
  "255 140 100"  # coral
  "140 230 140"  # green
  "255 180 100"  # orange
  "200 150 255"  # purple
  "100 220 220"  # cyan
  "255 130 180"  # pink
  "180 200 100"  # lime
  "255 200 140"  # peach
  "150 180 220"  # slate
)

# Set tab color based on directory name (consistent per directory)
_dir_color() {
  local dir="${PWD##*/}"  # basename only
  local sum=0
  for (( i=0; i<${#dir}; i++ )); do
    sum=$(( sum + $(printf '%d' "'${dir:$i:1}") * (i + 1) ))
  done
  local idx=$(( sum % ${#_colors[@]} + 1 ))
  _tab_color ${=_colors[$idx]}
}

# Hook: circle+yellow for dev, diamond+color for opencode/ai
preexec() {
  if [[ "$1" =~ ^dev ]]; then
    _tab_color 255 220 80  # yellow for dev
    _tab_marker "●"        # circle marker
  elif [[ "$1" =~ ^(opencode|ai) ]]; then
    _dir_color             # dir color for opencode/ai
    _tab_marker "◆"        # diamond marker
  fi
}

# Reset tab color and title when command finishes
precmd() {
  _tab_reset
  _tab_title_reset
}
