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
# is the personal editor contract documented in system-tools.md.
alias zsh="phpstorm ~/.zshrc"
export EDITOR=phpstorm

# --- Android/Java ------------------------------------------------------------
# Exposes the local Android SDK and the Java runtime expected by mobile tooling.
# These are host-level paths, not project-specific or DDEV-managed values.
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"

# --- Local Tools -------------------------------------------------------------
# Adds personal/user-level command locations before project helpers are loaded.
# `fpath` includes local completions shipped by installed command-line tools.
export PATH="$PATH:$HOME/.local/bin"
export PATH="$PATH:$HOME/.composer/vendor/bin"
fpath=("$HOME/.local/share/zsh/site-functions" $fpath)

# --- Laravel/DDEV ------------------------------------------------------------
# Short aliases for the expected Laravel workflow: PHP and Artisan run inside
# DDEV, while host package-manager commands stay outside Docker.
alias a="ddev artisan"
alias ds="ddev start"

# --- Testing -----------------------------------------------------------------
# Fast Laravel test shortcuts. They intentionally use the `a` alias so the DDEV
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
    echo "Run mise run install from ~/PhpstormProjects/my-setup"
    return 1
}

unalias gbr 2>/dev/null
gbr() {
    _run_installed_command gbr "$@"
}

hugeicons() {
    _run_installed_command hugeicons "$@"
}

# --- Tool Initialization -----------------------------------------------------
# Homebrew may be installed outside the default shell PATH. Loading shellenv here
# makes Homebrew-managed tools available before runtime managers and helpers run.
[ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"

# --- Runtime Manager ---------------------------------------------------------
# mise owns global runtime activation for this setup. Keep this lightweight so a
# missing mise binary does not break shell startup on a partially prepared host.
command -v mise >/dev/null && eval "$(mise activate zsh)"

# --- Kubernetes --------------------------------------------------------------
# Adds krew plugins to PATH for kubectl-based helper scripts such as `remote`
# and `remote-info`.
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"

remote() {
    _run_installed_command remote "$@"
}

remote-tinker() {
    _run_installed_command remote-tinker "$@"
}

remote-info() {
    _run_installed_command remote-info "$@"
}

# --- PHP ---------------------------------------------------------------------
# Makes the Homebrew PHP 8.2 binaries available for host-side tooling. Laravel
# project commands still go through DDEV aliases unless explicitly run by hand.
export PATH="/opt/homebrew/opt/php@8.2/bin:$PATH"
export PATH="/opt/homebrew/opt/php@8.2/sbin:$PATH"

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

# --- Hosts -------------------------------------------------------------------
# Delegates host-file management to the installed script, keeping the interactive
# shell config as a thin command surface rather than duplicating script logic.
hosts() {
    _run_installed_command hosts "$@"
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

# --- Local Secrets -----------------------------------------------------------
# Sources machine-local secrets created from config/secrets.default.zsh by the
# installer. The secrets file is intentionally outside the repo.
[ -f "$HOME/.config/my-setup/secrets.zsh" ] && source "$HOME/.config/my-setup/secrets.zsh"

# --- PATH Cleanup ------------------------------------------------------------
# Deduplicates PATH after all sections have contributed their entries.
typeset -U path PATH
