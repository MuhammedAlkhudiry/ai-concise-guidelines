#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Constants
REPO_URL="https://github.com/MuhammedAlkhudiry/ai-concise-guidelines.git"
TMP_DIR="tmp_guidelines_$$"

# Cleanup function
cleanup() {
    if [ -d "$TMP_DIR" ]; then
        rm -rf "$TMP_DIR"
    fi
}

# Set trap for cleanup on exit
trap cleanup EXIT ERR INT TERM

# Print colored messages
print_error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_info() {
    echo -e "${BLUE}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Prompt user for selection
prompt_selection() {
    local prompt="$1"
    local valid_options="$2"
    local default="$3"
    local response
    
    while true; do
        read -p "$prompt [default=$default]: " response
        response="${response:-$default}"
        
        # Check if response is valid
        for option in $valid_options; do
            if [ "$response" = "$option" ]; then
                echo "$response"
                return 0
            fi
        done
        
        print_warning "Invalid option. Valid options are: $valid_options"
    done
}

# Show usage information
show_usage() {
    cat << EOF
${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}
${BLUE}║   AI Concise Guidelines - Installer                      ║${NC}
${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}

Usage: $0 [OPTIONS]

Options:
  --rules-path PATH         Merge guidelines into a single rules file at PATH
  --skills-path PATH        Copy skills to PATH directory
  --agents-path PATH        Copy agents to PATH directory
  --workflows-path PATH     Copy workflows to PATH directory (Windsurf only)
  --zsh-path PATH           Copy ZSH custom config to PATH and source it in ~/.zshrc
  --mcp-path PATH           Copy MCP config to PATH file


  --rules-file-action ACTION
      Action when rules file exists: overwrite, append, or skip (default: prompt)

  --workflows-prefix PREFIX
      Add prefix to workflow filenames (e.g., "MODES: ")

  --install-statusline      Install Claude Code status line

  --platform PLATFORM       Hint for agent format: claude-code, opencode, windsurf
                            (auto-detected from paths if not specified)

  --help, -h                Show this help message

Examples:
  # Windsurf
  $0 --rules-path ~/.windsurf/rules/RULES.md \\
     --workflows-path ~/.windsurf/workflows

  # Claude Code
  $0 --rules-path ~/.claude/CLAUDE.md \\
     --skills-path ~/.claude/skills \\
     --agents-path ~/.claude/agents \\
     --mcp-path ~/.claude/mcp.json \\
     --install-statusline

  # OpenCode
  $0 --rules-path ~/.config/opencode/AGENTS.md \\
     --skills-path ~/.config/opencode/skill \\
     --agents-path ~/.config/opencode/agent \\
     --mcp-path ~/.config/opencode/opencode.json

EOF
    exit 0
}

# Check prerequisites
check_prerequisites() {
    if ! command -v git >/dev/null 2>&1; then
        print_error "git is required but not installed. Please install git first."
        exit 1
    fi
}

# Validate and prepare destination path
validate_destination_path() {
    local path="$1"
    local parent_dir=$(dirname "$path")
    
    # Create parent directory if it doesn't exist
    if [ ! -d "$parent_dir" ]; then
        mkdir -p "$parent_dir" || {
            print_error "Failed to create directory $parent_dir"
            return 1
        }
    fi
    
    # Check write permissions
    if ! touch "$parent_dir/.test_write_$$" 2>/dev/null; then
        print_error "No write permission for $parent_dir"
        return 1
    fi
    rm -f "$parent_dir/.test_write_$$"
    
    return 0
}

# Detect platform from paths
detect_platform() {
    local rules_path="$1"
    local skills_path="$2"
    local agents_path="$3"
    local workflows_path="$4"
    
    # Check for OpenCode indicators
    if [[ "$rules_path" == *"opencode"* ]] || [[ "$skills_path" == *"opencode"* ]] || \
       [[ "$agents_path" == *"opencode"* ]]; then
        echo "opencode"
        return
    fi
    
    # Check for Windsurf indicators
    if [[ "$rules_path" == *"windsurf"* ]] || [[ "$workflows_path" == *"windsurf"* ]] || \
       [[ "$rules_path" == *"codeium"* ]] || [[ "$workflows_path" == *"codeium"* ]]; then
        echo "windsurf"
        return
    fi
    
    # Check for Claude Code indicators
    if [[ "$rules_path" == *".claude"* ]] || [[ "$skills_path" == *".claude"* ]] || \
       [[ "$agents_path" == *".claude"* ]]; then
        echo "claude-code"
        return
    fi
    
    # Default to claude-code
    echo "claude-code"
}

# Clone repository with sparse checkout
clone_repository() {
    local folders="$1"
    
    print_info "Cloning repository..."
    
    git clone --depth=1 --filter=blob:none --sparse "$REPO_URL" "$TMP_DIR" >/dev/null 2>&1 || {
        print_error "Failed to clone repository"
        exit 1
    }
    
    cd "$TMP_DIR"
    
    # Set sparse checkout for all selected folders at once
    # Note: $folders intentionally unquoted to allow word splitting
    git sparse-checkout set --no-cone $folders >/dev/null 2>&1 || {
        print_error "Failed to checkout folders: $folders"
        exit 1
    }
    
    cd - >/dev/null
    
    print_success "Repository cloned successfully"
}

# Copy rules (merged guidelines)
copy_rules() {
    local dest="$1"
    local action="$2"
    
    print_info "Copying rules to $dest..."
    
    if [ ! -d "$TMP_DIR/guidelines" ]; then
        print_error "Guidelines folder not found"
        return 1
    fi
    
    # Check if destination file exists
    if [ -f "$dest" ]; then
        print_warning "File $dest already exists."
        
        # Use provided action or prompt user
        if [ -z "$action" ]; then
            action=$(prompt_selection "Choose action [o=overwrite, a=append, s=skip]" "o a s" "s")
        fi
        
        case $action in
            s|skip)
                print_info "Skipping rules copy"
                return 0
                ;;
            o|overwrite)
                > "$dest"
                ;;
            a|append)
                echo -e "\n\n# --- Appended $(date) ---\n" >> "$dest"
                ;;
            *)
                print_error "Invalid action: $action. Valid options are: overwrite, append, skip"
                return 1
                ;;
        esac
    else
        mkdir -p "$(dirname "$dest")"
        touch "$dest"
    fi
    
    # Merge all markdown files
    find "$TMP_DIR/guidelines" -type f -name "*.md" -print0 | sort -z | while IFS= read -r -d '' file; do
        printf '\n\n' >> "$dest"
        cat "$file" >> "$dest"
    done
    
    print_success "Rules copied to $dest"
}

# Copy skills
copy_skills() {
    local dest="$1"
    local platform="$2"

    print_info "Copying skills to $dest..."

    local source_dir="$TMP_DIR/integrations/$platform/skills"
    if [ ! -d "$source_dir" ]; then
        # Fall back to claude-code if platform-specific not found
        source_dir="$TMP_DIR/integrations/claude-code/skills"
    fi
    
    if [ ! -d "$source_dir" ]; then
        print_error "Skills folder not found"
        return 1
    fi

    # Remove existing skills folder to ensure deleted skills are removed
    if [ -d "$dest" ]; then
        rm -rf "$dest"
    fi

    mkdir -p "$dest"
    cp -r "$source_dir/"* "$dest/" || {
        print_error "Failed to copy skills"
        return 1
    }

    local count=$(find "$dest" -type d -mindepth 1 -maxdepth 1 | wc -l)
    print_success "Copied $count skill directories to $dest"
}

# Copy agents
copy_agents() {
    local dest="$1"
    local platform="$2"

    print_info "Copying agents to $dest..."

    local source_dir=""
    if [ "$platform" = "opencode" ]; then
        source_dir="$TMP_DIR/integrations/opencode/agents"
    else
        source_dir="$TMP_DIR/integrations/claude-code/sub-agents"
    fi
    
    if [ ! -d "$source_dir" ]; then
        print_error "Agents folder not found at $source_dir"
        return 1
    fi

    # Remove existing agents folder
    if [ -d "$dest" ]; then
        rm -rf "$dest"
    fi

    mkdir -p "$dest"
    cp -r "$source_dir/"* "$dest/" || {
        print_error "Failed to copy agents"
        return 1
    }

    local count=$(find "$dest" -type f -name "*.md" | wc -l)
    print_success "Copied $count agent files to $dest"
}

# Copy workflows (Windsurf)
copy_workflows() {
    local dest="$1"
    local prefix="$2"

    print_info "Copying workflows to $dest..."

    local source_dir="$TMP_DIR/integrations/windsurf/workflows"
    if [ ! -d "$source_dir" ]; then
        print_error "Workflows folder not found"
        return 1
    fi

    # Remove existing workflows folder
    if [ -d "$dest" ]; then
        rm -rf "$dest"
    fi

    mkdir -p "$dest"

    # Copy files, optionally with prefix
    if [ -n "$prefix" ]; then
        for file in "$source_dir/"*; do
            if [ -f "$file" ]; then
                local basename=$(basename "$file")
                cp "$file" "$dest/${prefix}${basename}" || {
                    print_error "Failed to copy workflow: $basename"
                    return 1
                }
            fi
        done
    else
        cp -r "$source_dir/"* "$dest/" || {
            print_error "Failed to copy workflows"
            return 1
        }
    fi

    local count=$(find "$dest" -type f | wc -l)
    print_success "Copied $count workflow files to $dest"
}

# Copy ZSH custom config
copy_zsh() {
    local dest="$1"
    
    print_info "Copying ZSH custom config to $dest..."
    
    if [ ! -f "$TMP_DIR/shell/zsh-custom.zsh" ]; then
        print_error "ZSH custom config not found"
        return 1
    fi
    
    mkdir -p "$(dirname "$dest")"
    cp "$TMP_DIR/shell/zsh-custom.zsh" "$dest" || {
        print_error "Failed to copy ZSH custom config"
        return 1
    }
    
    # Add source line to ~/.zshrc if not present
    local zshrc="$HOME/.zshrc"
    local source_line="[ -f $dest ] && source $dest"
    
    if [ -f "$zshrc" ]; then
        if ! grep -Fxq "$source_line" "$zshrc"; then
            print_info "Adding source line to $zshrc..."
            cp "$zshrc" "${zshrc}.bak"
            echo -e "\n# Synced custom config via ai-concise-guidelines\n$source_line" >> "$zshrc"
            print_success "Source line added to $zshrc (backup created at ${zshrc}.bak)"
        else
            print_info "Source line already exists in $zshrc"
        fi
    else
        print_warning "$zshrc not found. Please manually add: $source_line"
    fi
    
    print_success "ZSH custom config installed to $dest"
}

# Merge MCP servers into existing config
merge_mcp() {
    local dest="$1"
    local platform="$2"

    print_info "Merging MCP servers into $dest..."

    local source_file=""
    if [ "$platform" = "opencode" ]; then
        source_file="$TMP_DIR/integrations/opencode/mcp.json"
    else
        source_file="$TMP_DIR/integrations/claude-code/mcp.json"
    fi

    if [ ! -f "$source_file" ]; then
        print_error "MCP source file not found at $source_file"
        return 1
    fi

    mkdir -p "$(dirname "$dest")"

    if ! command -v jq >/dev/null 2>&1; then
        print_warning "jq not found. Cannot merge MCP config."
        print_info "Install jq and re-run, or manually merge MCP servers."
        return 1
    fi

    if [ "$platform" = "opencode" ]; then
        # OpenCode: merge entire opencode.json (mcp, model, agent, etc.)
        local new_mcps
        new_mcps=$(cat "$source_file")

        # Also get the full opencode.json config (model, agent settings)
        local opencode_config_file="$TMP_DIR/integrations/opencode/opencode.json"

        if [ -f "$dest" ]; then
            # Merge with existing config: deep merge all keys
            local tmp_file="${dest}.tmp"
            if [ -f "$opencode_config_file" ]; then
                # Merge opencode.json config first, then mcp servers
                local full_config
                full_config=$(cat "$opencode_config_file")
                jq --argjson newConfig "$full_config" --argjson newMcp "$new_mcps" \
                    '. * $newConfig | .mcp = (.mcp // {}) + $newMcp' "$dest" > "$tmp_file" && mv "$tmp_file" "$dest"
            else
                jq --argjson newMcp "$new_mcps" '.mcp = (.mcp // {}) + $newMcp' "$dest" > "$tmp_file" && mv "$tmp_file" "$dest"
            fi
        else
            # Create new config from opencode.json + mcp
            if [ -f "$opencode_config_file" ]; then
                local full_config
                full_config=$(cat "$opencode_config_file")
                echo "$full_config" | jq --argjson newMcp "$new_mcps" '. + {"\$schema": "https://opencode.ai/config.json", "mcp": $newMcp}' > "$dest"
            else
                echo "{
  \"\$schema\": \"https://opencode.ai/config.json\",
  \"mcp\": $new_mcps
}" > "$dest"
            fi
        fi
    else
        # Claude Code: merge into mcp.json under "mcpServers" key
        local new_mcps
        new_mcps=$(jq '.mcpServers' "$source_file")

        if [ -f "$dest" ]; then
            # Merge with existing config
            local tmp_file="${dest}.tmp"
            jq --argjson newMcp "$new_mcps" '.mcpServers = (.mcpServers // {}) + $newMcp' "$dest" > "$tmp_file" && mv "$tmp_file" "$dest"
        else
            # Create new config
            cp "$source_file" "$dest"
        fi
    fi

    local count
    if [ "$platform" = "opencode" ]; then
        count=$(jq '.mcp | keys | length' "$dest" 2>/dev/null || echo "?")
    else
        count=$(jq '.mcpServers | keys | length' "$dest" 2>/dev/null || echo "?")
    fi
    print_success "Merged MCP servers (total: $count)"
}

# Install status line (Claude Code)
install_statusline() {
    print_info "Installing status line..."

    local claude_dir="$HOME/.claude"
    local script_dest="$claude_dir/statusline-command.sh"
    local settings_file="$claude_dir/settings.json"

    mkdir -p "$claude_dir"

    if [ ! -f "$TMP_DIR/statusline/statusline-command.sh" ]; then
        print_error "Status line script not found"
        return 1
    fi

    cp "$TMP_DIR/statusline/statusline-command.sh" "$script_dest" || {
        print_error "Failed to copy status line script"
        return 1
    }
    chmod +x "$script_dest"

    # Update settings.json
    if [ -f "$settings_file" ]; then
        if command -v jq >/dev/null 2>&1; then
            local tmp_settings="${settings_file}.tmp"
            jq --arg cmd "$script_dest" '.statusLine = {"type": "command", "command": $cmd}' "$settings_file" > "$tmp_settings" && mv "$tmp_settings" "$settings_file"
        else
            print_warning "jq not found. Please manually add statusLine to $settings_file"
            print_info "Add: \"statusLine\": {\"type\": \"command\", \"command\": \"$script_dest\"}"
        fi
    else
        echo "{\"statusLine\": {\"type\": \"command\", \"command\": \"$script_dest\"}}" > "$settings_file"
    fi

    print_success "Status line installed at $script_dest"
}

# Main function
main() {
    check_prerequisites
    
    # Parse arguments
    local rules_path=""
    local rules_action=""
    local skills_path=""
    local agents_path=""
    local workflows_path=""
    local workflows_prefix=""
    local zsh_path=""
    local mcp_path=""
    local platform=""
    local do_install_statusline="n"

    while [[ $# -gt 0 ]]; do
        case $1 in
            --rules-path)
                rules_path="$2"
                shift 2
                ;;
            --rules-file-action)
                rules_action="$2"
                shift 2
                ;;
            --skills-path)
                skills_path="$2"
                shift 2
                ;;
            --agents-path)
                agents_path="$2"
                shift 2
                ;;
            --workflows-path)
                workflows_path="$2"
                shift 2
                ;;
            --workflows-prefix)
                workflows_prefix="$2"
                shift 2
                ;;
            --zsh-path)
                zsh_path="$2"
                shift 2
                ;;
            --mcp-path)
                mcp_path="$2"
                shift 2
                ;;
            --platform)
                platform="$2"
                shift 2
                ;;
            --install-statusline)
                do_install_statusline="y"
                shift
                ;;
            --help|-h)
                show_usage
                ;;
            *)
                print_error "Unknown option: $1"
                echo ""
                show_usage
                ;;
        esac
    done
    
    # Validate at least one destination specified
    if [ -z "$rules_path" ] && [ -z "$skills_path" ] && [ -z "$agents_path" ] && \
       [ -z "$workflows_path" ] && [ -z "$zsh_path" ] && [ -z "$mcp_path" ] && [ "$do_install_statusline" = "n" ]; then
        print_error "No destination specified. At least one path is required."
        echo ""
        show_usage
    fi

    # Expand tilde in paths
    [ -n "$rules_path" ] && rules_path="${rules_path/#\~/$HOME}"
    [ -n "$skills_path" ] && skills_path="${skills_path/#\~/$HOME}"
    [ -n "$agents_path" ] && agents_path="${agents_path/#\~/$HOME}"
    [ -n "$workflows_path" ] && workflows_path="${workflows_path/#\~/$HOME}"
    [ -n "$zsh_path" ] && zsh_path="${zsh_path/#\~/$HOME}"
    [ -n "$mcp_path" ] && mcp_path="${mcp_path/#\~/$HOME}"

    # Auto-detect platform if not specified
    if [ -z "$platform" ]; then
        platform=$(detect_platform "$rules_path" "$skills_path" "$agents_path" "$workflows_path")
    fi

    # Validate destination paths
    [ -n "$rules_path" ] && { validate_destination_path "$rules_path" || exit 1; }
    [ -n "$skills_path" ] && { validate_destination_path "$skills_path" || exit 1; }
    [ -n "$agents_path" ] && { validate_destination_path "$agents_path" || exit 1; }
    [ -n "$workflows_path" ] && { validate_destination_path "$workflows_path" || exit 1; }
    [ -n "$zsh_path" ] && { validate_destination_path "$zsh_path" || exit 1; }
    [ -n "$mcp_path" ] && { validate_destination_path "$mcp_path" || exit 1; }
    
    # Determine what folders to clone
    local folders=""

    if [ -n "$rules_path" ]; then
        folders="guidelines"
    fi

    if [ -n "$skills_path" ]; then
        [ -n "$folders" ] && folders="$folders integrations/$platform/skills" || folders="integrations/$platform/skills"
        # Also get claude-code skills as fallback
        if [ "$platform" != "claude-code" ]; then
            folders="$folders integrations/claude-code/skills"
        fi
    fi

    if [ -n "$agents_path" ]; then
        if [ "$platform" = "opencode" ]; then
            [ -n "$folders" ] && folders="$folders integrations/opencode/agents" || folders="integrations/opencode/agents"
        else
            [ -n "$folders" ] && folders="$folders integrations/claude-code/sub-agents" || folders="integrations/claude-code/sub-agents"
        fi
    fi

    if [ -n "$workflows_path" ]; then
        [ -n "$folders" ] && folders="$folders integrations/windsurf/workflows" || folders="integrations/windsurf/workflows"
    fi

    if [ -n "$zsh_path" ]; then
        [ -n "$folders" ] && folders="$folders shell" || folders="shell"
    fi

    if [ -n "$mcp_path" ]; then
        if [ "$platform" = "opencode" ]; then
            [ -n "$folders" ] && folders="$folders integrations/opencode/mcp.json" || folders="integrations/opencode/mcp.json"
        else
            [ -n "$folders" ] && folders="$folders integrations/claude-code/mcp.json" || folders="integrations/claude-code/mcp.json"
        fi
    fi

    if [ "$do_install_statusline" = "y" ]; then
        [ -n "$folders" ] && folders="$folders statusline" || folders="statusline"
    fi
    
    # Show summary
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║   AI Concise Guidelines - Installer                      ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    print_info "Installation Summary (platform: $platform):"
    [ -n "$rules_path" ] && echo "  • Rules: $rules_path"
    [ -n "$skills_path" ] && echo "  • Skills: $skills_path"
    [ -n "$agents_path" ] && echo "  • Agents: $agents_path"
    [ -n "$workflows_path" ] && echo "  • Workflows: $workflows_path"
    [ -n "$zsh_path" ] && echo "  • ZSH Config: $zsh_path"
    [ -n "$mcp_path" ] && echo "  • MCP: $mcp_path"
    [ "$do_install_statusline" = "y" ] && echo "  • Status line: ~/.claude/statusline-command.sh"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Execute installation
    clone_repository "$folders"
    
    [ -n "$rules_path" ] && copy_rules "$rules_path" "$rules_action"
    [ -n "$skills_path" ] && copy_skills "$skills_path" "$platform"
    [ -n "$agents_path" ] && copy_agents "$agents_path" "$platform"
    [ -n "$workflows_path" ] && copy_workflows "$workflows_path" "$workflows_prefix"
    [ -n "$zsh_path" ] && copy_zsh "$zsh_path"
    [ -n "$mcp_path" ] && merge_mcp "$mcp_path" "$platform"
    [ "$do_install_statusline" = "y" ] && install_statusline

    # Success message
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✓ Installation completed successfully!         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Run main function
main "$@"
