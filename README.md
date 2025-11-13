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

Run the interactive installer that guides you through all options:

```bash
curl -sSL https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh | bash
```

Or download and inspect first:

```bash
curl -O https://raw.githubusercontent.com/MuhammedAlkhudiry/ai-concise-guidelines/main/init.sh
chmod +x init.sh
./init.sh
```

The installer supports:
- **Guidelines**: Multiple files or single merged file
- **Workflows**: With optional Windsurf frontmatter
- **Both**: Guidelines + Workflows in one run
- **Custom paths**: Choose your own destination directories

---

### Manual Install

If you prefer manual installation, you can simply clone/copy any file you need.