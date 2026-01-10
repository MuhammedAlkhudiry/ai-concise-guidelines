# =============================================================================
# User .zshrc Configuration
# Stored for portability - NOT auto-synced (manual reference only)
# =============================================================================

export ZSH="$HOME/.oh-my-zsh"

ZSH_THEME="robbyrussell"

# plugins
plugins=(
git
zsh-autosuggestions
fzf
)

source $ZSH/oh-my-zsh.sh

# --- Android/Java ---
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home

# --- pipx ---
export PATH="$PATH:$HOME/.local/bin"

# --- API Keys ---
# Add your API keys here locally (DO NOT COMMIT):
# export MORPH_API_KEY="your-key-here"

# Synced custom config via ai-concise-guidelines
[ -f "$HOME/.config/zsh-sync/custom.zsh" ] && source "$HOME/.config/zsh-sync/custom.zsh"
