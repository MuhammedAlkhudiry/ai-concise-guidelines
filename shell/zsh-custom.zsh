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

# --- Git Branch & MR Workflow ---
# Usage: gbr <type> <description> [base-branch] [files...]
#        gbr feature add-user-auth main app/Models/User.php
#        gbr fix login-redirect --current  # uses current branch as base
#
# Environment: MR_TITLE (optional) - custom MR title, defaults to commit message
unalias gbr 2>/dev/null
gbr() {
    if [[ -x "$HOME/bin/gbr" ]]; then
        "$HOME/bin/gbr" "$@"
        return $?
    fi

    echo "gbr executable not found at $HOME/bin/gbr"
    echo "Run the installer again: bun src/init.ts --local"
    return 1
}

hugeicons() {
    if [[ -x "$HOME/bin/hugeicons" ]]; then
        "$HOME/bin/hugeicons" "$@"
        return $?
    fi

    echo "hugeicons executable not found at $HOME/bin/hugeicons"
    echo "Run the installer again: bun src/init.ts --local"
    return 1
}

# --- Tool Initialization ---
[ -x /opt/homebrew/bin/brew ] && eval $(/opt/homebrew/bin/brew shellenv)
command -v fzf >/dev/null && eval "$(fzf --zsh)"

# --- NVM ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# --- Kubernetes ---
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"

function remote() {
    if [[ -x "$HOME/bin/remote" ]]; then
        "$HOME/bin/remote" "$@"
        return $?
    fi

    echo "remote executable not found at $HOME/bin/remote"
    echo "Run the installer again: bun src/init.ts --local"
    return 1
}

function remote-tinker() {
    if [[ -x "$HOME/bin/remote-tinker" ]]; then
        "$HOME/bin/remote-tinker" "$@"
        return $?
    fi

    echo "remote-tinker executable not found at $HOME/bin/remote-tinker"
    echo "Run the installer again: bun src/init.ts --local"
    return 1
}

function remote-info() {
    if [[ -x "$HOME/bin/remote-info" ]]; then
        "$HOME/bin/remote-info" "$@"
        return $?
    fi

    echo "remote-info executable not found at $HOME/bin/remote-info"
    echo "Run the installer again: bun src/init.ts --local"
    return 1
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

# --- Hosts ---
# Manage /etc/hosts entries with list, add, and interactive delete
# Usage: hosts list
#        hosts add <domain> [ip]
#        hosts delete
#        hosts backups
#        hosts cleanup [keep]
hosts() {
    if [[ -x "$HOME/bin/hosts" ]]; then
        "$HOME/bin/hosts" "$@"
        return $?
    fi

    echo "hosts executable not found at $HOME/bin/hosts"
    echo "Run the installer again: bun src/init.ts --local"
    return 1
}

doctor() {
    if [[ -x "$HOME/bin/doctor" ]]; then
        "$HOME/bin/doctor" "$@"
        return $?
    fi

    echo "doctor executable not found at $HOME/bin/doctor"
    echo "Run the installer again: bun src/init.ts --local"
    return 1
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
