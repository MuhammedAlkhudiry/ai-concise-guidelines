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

# Check prerequisites
check_prerequisites() {
    if ! command -v git >/dev/null 2>&1; then
        print_error "git is required but not installed. Please install git first."
        exit 1
    fi
}

# Validate user input
validate_choice() {
    local input="$1"
    local valid_options="$2"
    
    # Use word boundary matching to prevent partial matches
    if echo " $valid_options " | grep -q " $input "; then
        return 0
    else
        return 1
    fi
}

# Prompt user for selection
prompt_selection() {
    local prompt="$1"
    local valid_options="$2"
    local default="$3"
    local response
    
    while true; do
        if [ -n "$default" ]; then
            read -p "$prompt (default: $default): " response
            response=${response:-$default}
        else
            read -p "$prompt: " response
        fi
        
        if validate_choice "$response" "$valid_options"; then
            echo "$response"
            return 0
        else
            print_error "Invalid choice. Please select from: $valid_options"
        fi
    done
}

# Check if path exists and is writable
validate_destination_path() {
    local path="$1"
    local parent_dir=$(dirname "$path")
    
    # Check if parent directory exists and is writable
    if [ ! -d "$parent_dir" ]; then
        print_warning "Parent directory $parent_dir does not exist."
        read -p "Create it? [y/n]: " create
        if [ "$create" = "y" ]; then
            mkdir -p "$parent_dir" || {
                print_error "Failed to create directory $parent_dir"
                return 1
            }
        else
            return 1
        fi
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
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║   AI Concise Guidelines - Interactive Installer          ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_prerequisites
    
    # Step 1: What to copy?
    echo ""
    print_info "Step 1: What would you like to copy?"
    echo "  g - Guidelines only"
    echo "  w - Workflows only"
    echo "  b - Both guidelines and workflows"
    copy_what=$(prompt_selection "Your choice [g/w/b]" "g w b" "b")
    
    # Variables to track selections
    copy_guidelines=false
    copy_workflows=false
    guidelines_format=""
    guidelines_dest=""
    workflows_dest=""
    add_frontmatter=""
    folders=""
    
    # Handle guidelines
    if [ "$copy_what" = "g" ] || [ "$copy_what" = "b" ]; then
        copy_guidelines=true
        folders="guidelines"
        
        echo ""
        print_info "Step 2: Guidelines format?"
        echo "  m - Multiple files (separate .md files)"
        echo "  s - Single merged file (all content in one file)"
        guidelines_format=$(prompt_selection "Your choice [m/s]" "m s" "m")
        
        echo ""
        if [ "$guidelines_format" = "m" ]; then
            print_info "Step 3: Enter destination directory for guidelines"
            echo "  Example: ~/.windsurf/rules or ~/.claude/guidelines"
        else
            print_info "Step 3: Enter destination file path for merged guidelines"
            echo "  Example: ~/.claude/GUIDELINES.md or ~/ai-rules.md"
        fi
        
        while true; do
            read -p "Destination path: " guidelines_dest
            guidelines_dest="${guidelines_dest/#\~/$HOME}"
            
            if [ -z "$guidelines_dest" ]; then
                print_error "Destination path cannot be empty"
                continue
            fi
            
            if validate_destination_path "$guidelines_dest"; then
                break
            fi
        done
    fi
    
    # Handle workflows
    if [ "$copy_what" = "w" ] || [ "$copy_what" = "b" ]; then
        copy_workflows=true
        
        if [ -n "$folders" ]; then
            folders="$folders workflows"
        else
            folders="workflows"
        fi
        
        step_num=2
        [ "$copy_what" = "b" ] && step_num=4
        
        echo ""
        print_info "Step $step_num: Enter destination directory for workflows"
        echo "  Example: ~/.claude/commands or ~/.codeium/global_workflows"
        
        while true; do
            read -p "Destination path: " workflows_dest
            workflows_dest="${workflows_dest/#\~/$HOME}"
            
            if [ -z "$workflows_dest" ]; then
                print_error "Destination path cannot be empty"
                continue
            fi
            
            if validate_destination_path "$workflows_dest"; then
                break
            fi
        done
        
        step_num=$((step_num + 1))
        echo ""
        print_info "Step $step_num: Add Windsurf-compatible frontmatter to workflow files?"
        echo "  (Adds '---\\ndescription: \\n---' at the top of each file)"
        add_frontmatter=$(prompt_selection "Your choice [y/n]" "y n" "n")
    fi
    
    # Summary
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    print_info "Installation Summary:"
    if [ "$copy_guidelines" = true ]; then
        if [ "$guidelines_format" = "m" ]; then
            echo "  • Guidelines: Multiple files → $guidelines_dest"
        else
            echo "  • Guidelines: Single merged file → $guidelines_dest"
        fi
    fi
    if [ "$copy_workflows" = true ]; then
        echo "  • Workflows: Multiple files → $workflows_dest"
        if [ "$add_frontmatter" = "y" ]; then
            echo "    (with Windsurf frontmatter)"
        fi
    fi
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    read -p "Proceed with installation? [y/n]: " confirm
    if [ "$confirm" != "y" ]; then
        print_info "Installation cancelled"
        exit 0
    fi
    
    # Execute installation
    echo ""
    clone_repository "$folders"
    
    if [ "$copy_guidelines" = true ]; then
        if [ "$guidelines_format" = "m" ]; then
            copy_guidelines_multiple "$guidelines_dest"
        else
            copy_guidelines_merged "$guidelines_dest"
        fi
    fi
    
    if [ "$copy_workflows" = true ]; then
        copy_workflows "$workflows_dest" "$add_frontmatter"
    fi
    
    # Success message
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✓ Installation completed successfully!         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    print_info "Next steps:"
    if [ "$copy_guidelines" = true ]; then
        echo "  • Configure your AI tool to load guidelines from: $guidelines_dest"
    fi
    if [ "$copy_workflows" = true ]; then
        echo "  • Restart your IDE/tool to load workflows from: $workflows_dest"
    fi
    echo ""
}

# Run main function
main "$@"
