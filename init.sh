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
  --guidelines-destination-path PATH
      Copy guidelines as multiple files to PATH directory

  --merge-guidelines-into-single-file=PATH
      Merge all guidelines into a single file at PATH

  --workflows-destination-path PATH
      Copy workflows to PATH directory

  --add-windsurf-header
      Add Windsurf-compatible frontmatter to workflow files

  --help, -h
      Show this help message

Examples:
  # Copy guidelines as multiple files
  $0 --guidelines-destination-path ~/.windsurf/rules

  # Merge guidelines into single file
  $0 --merge-guidelines-into-single-file=~/GUIDELINES.md

  # Copy workflows with Windsurf headers
  $0 --workflows-destination-path ~/.windsurf/workflows --add-windsurf-header

  # Copy everything
  $0 --guidelines-destination-path ~/.windsurf/rules \\
     --workflows-destination-path ~/.windsurf/workflows \\
     --add-windsurf-header

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

# Copy guidelines as multiple files
copy_guidelines_multiple() {
    local dest="$1"
    
    print_info "Copying guidelines as multiple files to $dest..."
    
    if [ ! -d "$TMP_DIR/guidelines" ]; then
        print_error "Guidelines folder not found"
        return 1
    fi
    
    mkdir -p "$dest"
    cp -r "$TMP_DIR/guidelines/"* "$dest/" || {
        print_error "Failed to copy guidelines"
        return 1
    }
    
    local count=$(find "$dest" -type f -name "*.md" | wc -l)
    print_success "Copied $count guideline files to $dest"
}

# Copy guidelines as single merged file
copy_guidelines_merged() {
    local dest="$1"
    
    print_info "Merging guidelines into single file..."
    
    if [ ! -d "$TMP_DIR/guidelines" ]; then
        print_error "Guidelines folder not found"
        return 1
    fi
    
    # Check if destination file exists
    if [ -f "$dest" ]; then
        print_warning "File $dest already exists."
        local action=$(prompt_selection "Choose action [o=overwrite, a=append, s=skip]" "o a s" "s")
        
        case $action in
            s)
                print_info "Skipping guidelines merge"
                return 0
                ;;
            o)
                > "$dest"
                ;;
            a)
                echo -e "\n\n# --- Appended $(date) ---\n" >> "$dest"
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
    
    print_success "Guidelines merged into $dest"
}

# Add Windsurf frontmatter to workflow files
add_windsurf_frontmatter() {
    local dest="$1"
    
    print_info "Adding Windsurf frontmatter to workflow files..."
    
    # Check if any .md files exist to prevent glob expansion errors
    shopt -s nullglob 2>/dev/null || true
    for file in "$dest"/*.md; do
        if [ -f "$file" ]; then
            # Check if frontmatter already exists
            if ! head -n 1 "$file" | grep -q "^---$"; then
                local temp_file="${file}.tmp"
                {
                    echo "---"
                    echo "description: "
                    echo "---"
                    echo ""
                    cat "$file"
                } > "$temp_file"
                mv "$temp_file" "$file"
            fi
        fi
    done
    shopt -u nullglob 2>/dev/null || true
    
    print_success "Frontmatter added to workflow files"
}

# Copy workflows
copy_workflows() {
    local dest="$1"
    local add_frontmatter="$2"
    
    print_info "Copying workflows to $dest..."
    
    if [ ! -d "$TMP_DIR/workflows" ]; then
        print_error "Workflows folder not found"
        return 1
    fi
    
    mkdir -p "$dest"
    cp -r "$TMP_DIR/workflows/"* "$dest/" || {
        print_error "Failed to copy workflows"
        return 1
    }
    
    if [ "$add_frontmatter" = "y" ]; then
        add_windsurf_frontmatter "$dest"
    fi
    
    local count=$(find "$dest" -type f | wc -l)
    print_success "Copied $count workflow files to $dest"
}

# Main function
main() {
    check_prerequisites
    
    # Parse arguments
    local guidelines_dest=""
    local guidelines_merged=""
    local workflows_dest=""
    local add_frontmatter="n"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --guidelines-destination-path)
                guidelines_dest="$2"
                shift 2
                ;;
            --merge-guidelines-into-single-file=*)
                guidelines_merged="${1#*=}"
                shift
                ;;
            --workflows-destination-path)
                workflows_dest="$2"
                shift 2
                ;;
            --add-windsurf-header)
                add_frontmatter="y"
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
    
    # Validate arguments
    if [ -n "$guidelines_dest" ] && [ -n "$guidelines_merged" ]; then
        print_error "Cannot use both --guidelines-destination-path and --merge-guidelines-into-single-file"
        echo "Please choose one option for guidelines."
        exit 1
    fi
    
    if [ -z "$guidelines_dest" ] && [ -z "$guidelines_merged" ] && [ -z "$workflows_dest" ]; then
        print_error "No destination specified. At least one destination is required."
        echo ""
        show_usage
    fi
    
    # Expand tilde in paths
    [ -n "$guidelines_dest" ] && guidelines_dest="${guidelines_dest/#\~/$HOME}"
    [ -n "$guidelines_merged" ] && guidelines_merged="${guidelines_merged/#\~/$HOME}"
    [ -n "$workflows_dest" ] && workflows_dest="${workflows_dest/#\~/$HOME}"
    
    # Validate destination paths
    if [ -n "$guidelines_dest" ]; then
        validate_destination_path "$guidelines_dest" || exit 1
    fi
    if [ -n "$guidelines_merged" ]; then
        validate_destination_path "$guidelines_merged" || exit 1
    fi
    if [ -n "$workflows_dest" ]; then
        validate_destination_path "$workflows_dest" || exit 1
    fi
    
    # Determine what folders to clone
    local folders=""
    local copy_guidelines=false
    local copy_workflows=false
    
    if [ -n "$guidelines_dest" ] || [ -n "$guidelines_merged" ]; then
        copy_guidelines=true
        folders="guidelines"
    fi
    
    if [ -n "$workflows_dest" ]; then
        copy_workflows=true
        [ -n "$folders" ] && folders="$folders workflows" || folders="workflows"
    fi
    
    # Show summary
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║   AI Concise Guidelines - Installer                      ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    print_info "Installation Summary:"
    if [ -n "$guidelines_dest" ]; then
        echo "  • Guidelines: Multiple files → $guidelines_dest"
    fi
    if [ -n "$guidelines_merged" ]; then
        echo "  • Guidelines: Single merged file → $guidelines_merged"
    fi
    if [ -n "$workflows_dest" ]; then
        echo "  • Workflows: Multiple files → $workflows_dest"
        if [ "$add_frontmatter" = "y" ]; then
            echo "    (with Windsurf frontmatter)"
        fi
    fi
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Execute installation
    clone_repository "$folders"
    
    if [ -n "$guidelines_dest" ]; then
        copy_guidelines_multiple "$guidelines_dest"
    fi
    
    if [ -n "$guidelines_merged" ]; then
        copy_guidelines_merged "$guidelines_merged"
    fi
    
    if [ -n "$workflows_dest" ]; then
        copy_workflows "$workflows_dest" "$add_frontmatter"
    fi
    
    # Success message
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✓ Installation completed successfully!         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    print_info "Next steps:"
    if [ -n "$guidelines_dest" ]; then
        echo "  • Configure your AI tool to load guidelines from: $guidelines_dest"
    fi
    if [ -n "$guidelines_merged" ]; then
        echo "  • Configure your AI tool to load guidelines from: $guidelines_merged"
    fi
    if [ -n "$workflows_dest" ]; then
        echo "  • Restart your IDE/tool to load workflows from: $workflows_dest"
    fi
    echo ""
}

# Run main function
main "$@"
