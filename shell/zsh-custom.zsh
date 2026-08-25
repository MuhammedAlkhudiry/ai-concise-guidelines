# =============================================================================
# Custom ZSH Configuration
# Synced via: https://github.com/MuhammedAlkhudiry/my-setup
# =============================================================================

# --- Oh My Zsh ---------------------------------------------------------------
# Loads the interactive shell framework and the small plugin set shared across
# local terminals. `fzf` is added only for real TTY sessions so non-interactive
# shell loads do not pay for prompt-oriented behavior.
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="robbyrussell"

plugins=(
git
zsh-autosuggestions
)

[[ -t 0 && -t 1 ]] && plugins+=(fzf)

source "$ZSH/oh-my-zsh.sh"

# --- Editor ------------------------------------------------------------------
# Keeps the default editor and the quick `zsh` alias pointed at PhpStorm, which
# is the personal editor contract declared in src/lib/system-tools.ts.
alias zsh="phpstorm ~/.zshrc"
export EDITOR=phpstorm

# --- Android/Java ------------------------------------------------------------
# Exposes the local Android SDK and the Java runtime expected by mobile tooling.
# These are host-level paths, not project-specific runtime-managed values.
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"

# --- Local Tools -------------------------------------------------------------
# Adds personal/user-level command locations before project helpers are loaded.
# `fpath` includes local completions shipped by installed command-line tools.
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.kimi-code/bin:$PATH"
export PATH="$PATH:$HOME/.composer/vendor/bin"
fpath=("$HOME/.local/share/zsh/site-functions" $fpath)

# --- Laravel/Herd ------------------------------------------------------------
# Short aliases for the expected Laravel workflow: PHP and Artisan run through
# Herd, while host package-manager commands stay on the host.
alias a="herd php artisan"
alias hs="herd open"

# --- Testing -----------------------------------------------------------------
# Fast Laravel test shortcuts. They intentionally use the `a` alias so the Herd
# boundary remains visible in one place.
alias t="a test --parallel --stop-on-failure"
alias coverage="a test --parallel --coverage --stop-on-failure"

# --- Installed Commands ------------------------------------------------------
# This repo installs shell helpers into `~/bin` during `mise run install`.
# The interactive functions below preserve stable command names while giving a
# clear recovery message if the local install has not been run yet.
_run_installed_command() {
    local name="$1"
    local command_path="$HOME/bin/$name"
    shift

    if [[ -x "$command_path" ]]; then
        "$command_path" "$@"
        return
    fi

    echo "$name executable not found at $command_path"
    echo "Run mise run install from my-setup"
    return 1
}

hugeicons() {
    _run_installed_command hugeicons "$@"
}

# --- Tool Initialization -----------------------------------------------------
# Homebrew may be installed outside the default shell PATH. Loading shellenv here
# makes Homebrew-managed tools available before runtime managers and helpers run.
[ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"

# Sentry installs its generated Zsh completions in the user data directory.
fpath=("$HOME/.local/share/zsh/site-functions" $fpath)

# --- Runtime Manager ---------------------------------------------------------
# mise owns global runtime activation for this setup. Keep this lightweight so a
# missing mise binary does not break shell startup on a partially prepared host.
command -v mise >/dev/null && eval "$(mise activate zsh)"

# --- PHP ---------------------------------------------------------------------
# Herd exposes its PHP binary and PHP 8.4 configuration for host-side tools.
export HERD_PHP_84_INI_SCAN_DIR="$HOME/Library/Application Support/Herd/config/php/84/"
export PATH="$HOME/Library/Application Support/Herd/bin/:$PATH"

# --- ZSH Settings ------------------------------------------------------------
# Keeps autosuggestions visible but quiet in dark terminal themes.
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=8"

# --- Project Navigation ------------------------------------------------------
# Shared fuzzy project picker for personal projects under ~/PhpstormProjects.
# `p` changes directory, while `ai` reuses the same picker before launching
# OpenCode. It intentionally lists only top-level project directories.
PROJECTS_DIR="$HOME/PhpstormProjects"

_select_project() {
    local prompt="$1"
    local query="$2"
    local selected

    selected=$(ls -1 "$PROJECTS_DIR" | fzf \
        --height=40% \
        --reverse \
        --border=rounded \
        --prompt="$prompt" \
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

    printf '%s\n' "$PROJECTS_DIR/$selected"
}

p() {
    local target_dir

    target_dir=$(_select_project "Project > " "${1:-}") || return 1
    cd "$target_dir"
}

doctor() {
    _run_installed_command doctor "$@"
}

# --- OpenCode ----------------------------------------------------------------
# Adds OpenCode's own install location and launcher environment, then exposes an
# `ai` helper that can jump to a selected project before starting OpenCode.
export PATH="$HOME/.opencode/bin:$PATH"
[ -f "$HOME/.local/bin/env" ] && . "$HOME/.local/bin/env"

ai() {
    local query="$*"
    local target_dir

    if [[ -n "$query" ]]; then
        target_dir=$(_select_project "AI > " "$query") || return 1
        cd "$target_dir"
    fi

    opencode
}

# --- Bun ---------------------------------------------------------------------
# Loads Bun's completions and binary path for host-side scripts in this repo and
# other JavaScript projects.
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# --- PATH Cleanup ------------------------------------------------------------
# Deduplicates PATH after all sections have contributed their entries.
typeset -U path PATH

# --- Sentry ------------------------------------------------------------------
fpath=("$HOME/.local/share/zsh/site-functions" $fpath)
