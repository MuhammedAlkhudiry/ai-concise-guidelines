---
name: create-skill
description: "Guide for creating effective AI agent skills. Use when user wants to create a new skill, update an existing skill, or learn how to write skills that extend agent capabilities with specialized knowledge, workflows, or tool integrations."
---

# Create Skill

Guide for creating effective AI agent skills. Use when users want to create, update, or improve skills that extend agent capabilities.

---

## What Skills Are

Skills are modular packages that extend an AI agent's capabilities with specialized knowledge, workflows, and tools. Think of them as "onboarding guides" — they transform a general-purpose agent into a specialized one equipped with procedural knowledge no model can fully possess.

**Skills provide:**
- Specialized workflows — multi-step procedures for specific domains
- Tool integrations — instructions for file formats, APIs, external services
- Domain expertise — company-specific knowledge, schemas, business logic
- Bundled resources — scripts, references, templates for complex tasks

---

## Core Principles

### Concise is Key

The context window is shared. Skills compete with system prompts, conversation history, other skills' metadata, and user requests.

**Default assumption: the agent is already very smart.** Only add what it doesn't know.

Challenge each piece: "Does this justify its token cost?" Prefer concise examples over verbose explanations.

### Degrees of Freedom

Match specificity to task fragility:

| Freedom | When | Format |
|---------|------|--------|
| **High** | Multiple valid approaches, context-dependent | Text instructions |
| **Medium** | Preferred pattern exists, some variation OK | Pseudocode, parameterized scripts |
| **Low** | Fragile operations, consistency critical | Exact scripts, few parameters |

Think of the agent exploring a path: narrow bridge needs guardrails (low), open field allows many routes (high).

### Progressive Disclosure

Three-level loading to manage context:

1. **Metadata** (name + description) — always loaded (~100 words)
2. **SKILL.md body** — when skill triggers (<5k words ideal)
3. **Bundled resources** — as needed (unlimited)

Keep SKILL.md lean. Move detailed reference material to separate files.

---

## Skill Anatomy

```
skill-name/
├── SKILL.md              (required)
│   ├── YAML frontmatter  (name, description)
│   └── Markdown body     (instructions)
└── Bundled Resources     (optional)
    ├── scripts/          Executable code
    ├── references/       Documentation loaded on demand
    └── assets/           Files used in output (templates, etc.)
```

### Installation Locations

Skills are installed in global agent-compatible locations:

| Scope | Path |
|-------|------|
| **Global (recommended)** | `~/.agents/skills/<name>/SKILL.md` |
| **Project-specific** | `.agents/skills/<name>/SKILL.md` |

Both OpenCode and Claude Code read from `~/.agents/skills/` for global skills.

### SKILL.md Structure

**Frontmatter (YAML):**
```yaml
---
name: skill-name
description: What this skill does and WHEN to use it. Include specific triggers.
---
```

- `name` — lowercase, hyphen-separated, 1-64 chars, matches folder name
- `description` — 1-1024 chars, specific enough for agent to choose correctly

**Body (Markdown):**
- Instructions and guidance
- Only loaded AFTER skill triggers
- Keep under 500 lines

### Bundled Resources

**Scripts (`scripts/`)** — Executable code for deterministic tasks
- When: same code rewritten repeatedly, reliability critical
- Example: `scripts/rotate_pdf.py`

**References (`references/`)** — Documentation loaded on demand
- When: detailed info agent needs while working
- Examples: API docs, schemas, policies, detailed guides
- Keep only essentials in SKILL.md, move details here

**Assets (`assets/`)** — Files used in output, not loaded into context
- When: templates, images, boilerplate needed in final output
- Examples: `logo.png`, `template.pptx`, `frontend-template/`

### What NOT to Include

Skip auxiliary files:
- README.md
- INSTALLATION_GUIDE.md
- CHANGELOG.md
- User-facing documentation

Skills are for agents, not humans.

---

## Creation Process

### Step 1: Understand with Examples

Skip only if usage patterns are crystal clear.

Gather concrete examples:
- "What functionality should this skill support?"
- "Give examples of how this would be used"
- "What would a user say that should trigger this skill?"

Conclude when you clearly understand what the skill handles.

### Step 2: Plan Reusable Contents

For each example, analyze:
1. How to execute from scratch
2. What scripts, references, assets would help when doing this repeatedly

**Example analyses:**

| Skill | Query | Analysis | Resource |
|-------|-------|----------|----------|
| pdf-editor | "Rotate this PDF" | Same rotation code each time | `scripts/rotate_pdf.py` |
| webapp-builder | "Build me a todo app" | Same boilerplate each time | `assets/hello-world/` |
| bigquery | "How many logins today?" | Rediscover schemas each time | `references/schema.md` |

### Step 3: Write SKILL.md

**Frontmatter:**
- `name`: skill name (lowercase, hyphens)
- `description`: **critical** — primary trigger mechanism
  - Include what it does AND when to use it
  - Be comprehensive — body is only loaded after triggering

**Body:**
- Use imperative form ("Do X", not "You should do X")
- Start with quick workflow or core procedure
- Reference bundled resources with clear guidance on when to read them
- Keep under 500 lines — split to references if longer

### Step 4: Organize References

**Pattern: High-level guide with references**
```markdown
## Quick start
[core workflow]

## Advanced
- **Forms**: See [references/forms.md](references/forms.md) for guide
- **API**: See [references/api.md](references/api.md) for methods
```

**Pattern: Domain-specific organization**
```
skill/
├── SKILL.md (overview + navigation)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```
Agent loads only the relevant reference.

**Guidelines:**
- Keep references one level deep from SKILL.md
- For files >100 lines, include table of contents at top
- Avoid duplication — info lives in ONE place

### Step 5: Test and Iterate

Use the skill on real tasks. Notice struggles. Update.

**Iteration triggers:**
- Agent misunderstands when to use skill → refine description
- Agent misses steps → add to workflow
- Agent includes unnecessary info → trim
- Same code rewritten → add script
- Same lookup performed → add reference

---

## Writing Guidelines

### Frontmatter Description

The description is **the** trigger mechanism. Include:
1. What the skill does
2. Specific contexts/triggers for when to use it

**Good:**
```yaml
description: Create, edit, and analyze .docx documents with tracked changes, comments, and formatting. Use when working with professional documents for creating, modifying, or reviewing content.
```

**Bad:**
```yaml
description: A skill for documents.
```

### Body Instructions

- **Imperative form**: "Extract text" not "You should extract text"
- **Show, don't tell**: Examples over explanations
- **Cite resources**: "See [file.md](file.md) for X" with clear when-to-use
- **Progressive depth**: Quick start first, advanced later

### Naming

- Lowercase alphanumeric with hyphens: `pdf-editor`, `git-workflow`
- No consecutive hyphens, no leading/trailing hyphens
- 1-64 characters
- Must match folder name

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Kitchen sink SKILL.md | Context bloat, slow loading | Split to references |
| Vague description | Won't trigger correctly | Be specific about when to use |
| Duplicated info | Maintenance nightmare | Single source of truth |
| Explaining basics | Wasted tokens | Agent already knows |
| "When to Use" in body | Body loads after trigger | Put in description |
| Nested references | Hard to navigate | One level deep |
