# Opinionated Guidelines for Daily AI Use

### Opinionated Guidelines for Daily AI Use

This is a list of opinionated guidelines/prompt files that I use daily with AI. They have been carefully curated based on the following principles:

1. The prompts are designed to be brief, avoiding unnecessary noise that could overload the AI context window.

2. Each guideline targets a particular behavior. Generic instructions (e.g., "be good," "think hard," "follow user prompt") are avoided, as it is assumed that the AI is already equipped with common sense.

3. Assuming that the AI model is already about 80% effective, these prompts are intended to push it further.

4. The prompts are meant to enhance the model's capabilities. The belief is that no amount of instructions can fix a fundamentally weak model.

5. These prompts have been collected through real-world interactions with AI, serving as direct feedback to address AI failures.

## Install

### Copy all .md files into .md files inside your AI tool folder

Run (edit EDIT_THIS_PATH, e.g., ~/.kilocode/rules):
```bash
git clone --depth=1 --filter=blob:none --sparse \
  https://github.com/MuhammedAlkhudiry/ai-concise-guidelines.git tmp_guidelines && \
cd tmp_guidelines && \
git sparse-checkout set guidelines && \
cp -r guidelines EDIT_THIS_PATH && \
cd .. && rm -rf tmp_guidelines
```

### Copy the content of all .md files into a single file (e.g. CLAUDE.md)

```bash
mkdir -p "$HOME/.claude" && touch "$HOME/.claude/CLAUDE.md" && \
git clone --depth=1 --filter=blob:none --sparse \
  https://github.com/MuhammedAlkhudiry/ai-concise-guidelines.git tmp_guidelines && \
cd tmp_guidelines && \
git sparse-checkout set guidelines && \
{ find guidelines -type f -print0 | sort -z | while IFS= read -r -d '' f; do
    printf '\n\n'
    cat "$f"
  done
} >> "$HOME/.claude/CLAUDE.md" && \
cd .. && rm -rf tmp_guidelines
```

### Copy workflows into claude custom commands

```bash
 git clone --depth=1 --filter=blob:none --sparse \
  https://github.com/MuhammedAlkhudiry/ai-concise-guidelines.git tmp_guidelines && \
cd tmp_guidelines && \
git sparse-checkout set workflows && \
cp -r workflows ~/.claude/commands && \ 
cd .. && rm -rf tmp_guidelines
```

### Copy workflows into windsurf workflows

(Note: we are adding 
---
description: 
---
at the top of each file so windsurf can detect it)

```bash
rm -rf tmp_guidelines && \
git clone --depth=1 --filter=blob:none --sparse \
  https://github.com/MuhammedAlkhudiry/ai-concise-guidelines.git tmp_guidelines && \
cd tmp_guidelines && \
git sparse-checkout set workflows && \
for file in workflows/*; do
  if [ -f "$file" ]; then
    # Add front matter at the top of each file
    { echo "---"; echo "description: "; echo "---"; echo ""; cat "$file"; } > "${file}.tmp"
    mv "${file}.tmp" "$file"
  fi
done && \
cp -r workflows ~/.codeium/global_workflows && \
cd .. && \
rm -rf tmp_guidelines

```
