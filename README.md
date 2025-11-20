# Opinionated Guidelines for Daily AI Use

This is a list of opinionated guidelines/prompt files that I use daily with AI. They have been carefully curated based on the following principles:

1. The prompts are designed to be brief, avoiding unnecessary noise that could overload the AI context window.

2. Each guideline targets a particular behavior. Generic instructions (e.g., "be good," "think hard," "follow user prompt") are avoided, as it is assumed that the AI is already equipped with common sense.

3. Assuming that the AI model is already about 80% effective, these prompts are intended to push it further.

4. The prompts are meant to enhance the model's capabilities. The belief is that no amount of instructions can fix a fundamentally weak model.

5. These prompts have been collected through real-world interactions with AI, serving as direct feedback to address AI failures.

## Install 
[Disclaimer: written by AI]

### Quick Install (Recommended)

Download the installer script:

```bash
curl -O https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh
chmod +x init.sh
```

Then run with your desired options:

```bash
# Install guidelines as multiple files
./init.sh --guidelines-destination-path ~/.windsurf/rules

# Install guidelines as a single merged file
./init.sh --merge-guidelines-into-single-file ~/GUIDELINES.md

# Install workflows with Windsurf frontmatter
./init.sh --workflows-destination-path ~/.windsurf/workflows --add-windsurf-header

# Install everything
./init.sh --guidelines-destination-path ~/.windsurf/rules \
          --workflows-destination-path ~/.windsurf/workflows \
          --add-windsurf-header
```

#### Options

- `--guidelines-destination-path PATH` — Copy guidelines as multiple files to PATH directory
- `--merge-guidelines-into-single-file PATH` — Merge all guidelines into a single file at PATH
- `--workflows-destination-path PATH` — Copy workflows to PATH directory
- `--add-windsurf-header` — Add Windsurf-compatible frontmatter to workflow files
- `--help`, `-h` — Show help message

**Note**: `--guidelines-destination-path` and `--merge-guidelines-into-single-file` are mutually exclusive.

---

### Manual Install

If you prefer manual installation, you can simply clone/copy any file you need.


--- 

### Examples

- Windsurf Editor
```bash
./init.sh --merge-guidelines-into-single-file ~/.codeium/windsurf/memories/global_rules.md \
          --workflows-destination-path ~/.codeium/windsurf/global_workflows \
          --add-windsurf-header
```


- Windsurf Jetbrains
```bash
 ./init.sh --merge-guidelines-into-single-file ~/.codeium/memories/global_rules.md \         
          --workflows-destination-path ~/.codeium/global_workflows \         
          --add-windsurf-header
```

### Alias for Quick Refresh

Add this alias to your shell configuration (`.bashrc`, `.zshrc`, etc.) to refresh guidelines with overwrite action:

- Windsurf Editor
```bash
alias refresh-windsurf-editor='(cd /tmp && \
          curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh && \
          chmod +x init.sh && \
          ./init.sh --merge-guidelines-into-single-file ~/.codeium/windsurf/memories/global_rules.md \
                    --workflows-destination-path ~/.codeium/windsurf/global_workflows \
                    --add-windsurf-header \
                    --merge-guidelines-into-single-file-action overwrite && \
          rm init.sh)'
```

- Windsurf Jetbrains
```bash
alias refresh-windsurf-jetbrains='(cd /tmp && \
          curl -sO https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh && \
          chmod +x init.sh && \
          ./init.sh --merge-guidelines-into-single-file ~/.codeium/memories/global_rules.md \
                    --workflows-destination-path ~/.codeium/global_workflows \
                    --add-windsurf-header \
                    --merge-guidelines-into-single-file-action overwrite && \
          rm init.sh)'
```

- Windsurf (both)
```bash
alias refresh-windsurf='refresh-windsurf-editor && refresh-windsurf-jetbrains' 
```

Then simply run:
```bash
refresh-windsurf-guidelines
```
