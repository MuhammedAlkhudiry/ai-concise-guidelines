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
_run_ai_init() {
    cd /tmp && \
    curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.ts && \
    bun init.ts "$@" && \
    rm init.ts && \
    cd -
}

alias refresh-opencode='_run_ai_init \
    --rules-path ~/.config/opencode/AGENTS.md \
    --skills-path ~/.config/opencode/skill \
    --agents-path ~/.config/opencode/agent \
    --plugin-path ~/.config/opencode/plugin \
    --command-path ~/.config/opencode/command \
    --zsh-path ~/.config/zsh-sync/custom.zsh \
    --rules-file-action overwrite'

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
export PATH="$HOME/.opencode/bin:$PATH"
[ -f "$HOME/.local/bin/env" ] && . "$HOME/.local/bin/env"

# --- Bun ---
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
