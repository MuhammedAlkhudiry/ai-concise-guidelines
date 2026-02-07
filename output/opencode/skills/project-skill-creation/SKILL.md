---
name: project-skill-creation
description: Create or update project-local OpenCode skills for modular domains within a codebase. Use when identifying systems/modules in a project and creating or refreshing specialized skills for each domain to provide contextual guidance to AI agents.
---

# Project Skill Creation

Guide for creating and updating project-local OpenCode skills to modularize domain knowledge.

## Purpose

Project-local skills provide specialized, contextual guidance for specific domains within a codebase. Unlike global skills, they live within the project (`/.agents/skills/`) and are tailored to that project's unique architecture, patterns, and business logic. This skill handles both initial skill creation and ongoing skill maintenance.

## When to Use

Use this skill when you need to create or update project-local skills:
- A codebase has multiple distinct domains/modules
- Different parts of the system require specialized knowledge
- You want AI agents to have contextual awareness per domain
- The project is large enough to benefit from modular guidance
- Existing skill content is outdated after code, architecture, or domain changes

## Process

### Step 1: Identify Domains

Explore the project structure to identify all modules/systems:

**Backend domains to look for:**
- Service directories (e.g., `app/Services/`)
- Model groupings (e.g., `app/Models/`)
- Controller organization
- Configuration files per domain
- Business logic separation

**Frontend domains to look for:**
- Module/feature directories (e.g., `app/modules/`)
- State management (stores, machines)
- Component organization
- Screen/page structure
- API service organization

**Infrastructure domains:**
- Database migrations/schema
- Testing frameworks
- API patterns
- i18n/localization
- Deployment/DevOps

### Step 2: Define Skill Boundaries

Each skill should cover ONE cohesive domain:

**Good boundaries:**
- `experience-system` - XP, levels, momentum (cohesive)
- `focus-timer` - Timer state machine, session management (cohesive)
- `authentication` - Login, tokens, social auth (cohesive)

**Bad boundaries:**
- `backend` - Too broad
- `everything-related-to-user` - Mixes auth, profile, settings

### Step 3: Create or Update Skill Structure

Decide action per domain before writing content:

- If `.agents/skills/<skill-name>/SKILL.md` exists: **update it** (refresh stale content, paths, patterns, tests, and triggers)
- If it does not exist: **create it**

For new skills, use this structure:

```
.agents/skills/<skill-name>/
└── SKILL.md          # Required: frontmatter + instructions
```

**SKILL.md format:**
```yaml
---
name: skill-name
description: When to use this skill. Be specific about triggers and domain.
---

# Skill Title

## Core Concepts

Brief explanation of the domain.

## Key Files

```
app/Services/Domain/
├── ServiceFile.php
└── AnotherService.php

config/domain.php
```

## Patterns

Common patterns for this domain.

## Examples

Code examples showing the pattern in action.

## Testing

How to test this domain.

## Integration Points

How this domain connects to other systems.
```

### Step 4: Write or Refresh Skill Content

**Frontmatter description** - Must include:
- What the skill covers
- When to trigger it (specific contexts)
- Key terms that should activate it

**Body content** - Keep concise but complete:
- Core concepts (2-3 paragraphs)
- File structure overview
- Service patterns with code examples
- Testing guidance
- Integration with other domains
- For updates: keep valid sections, replace outdated guidance, and remove stale file references

## Example: Harium Project

We created 27 skills for a gamified productivity app:

**Backend (10 skills):**
1. `harium-experience-system` - XP calculations, momentum tiers, level progression
2. `harium-focus-sessions` - Focus timer sessions, duration tracking
3. `harium-achievements` - 150+ achievements, evaluation handlers
4. `harium-character-system` - Character creation, customization, equipment
5. `harium-economy-system` - Coins, transactions, rewards
6. `harium-parties-system` - Social parties, group quests, reactions
7. `harium-actions-system` - Tasks with 4 difficulty tiers
8. `harium-authentication` - Social login (Google/Apple), tokens
9. `harium-analytics` - Event tracking, daily statistics
10. `harium-shop-inventory` - Shop items, purchases, streak freeze

**Mobile (12 skills):**
1. `harium-mobile-focus-timer` - XState machine, timer UI
2. `harium-mobile-parties` - Party UI, feed, group quests
3. `harium-mobile-character` - Character display, customization
4. `harium-mobile-shop` - Shop UI, purchases
5. `harium-mobile-achievements` - Achievement gallery
6. `harium-mobile-onboarding` - Setup wizard
7. `harium-mobile-areas-projects` - Areas/projects organization
8. `harium-mobile-journals` - History tracking
9. `harium-mobile-auth` - Login flows
10. `harium-mobile-design-system` - UI components, theme tokens
11. `harium-mobile-navigation` - Scene-based navigation
12. `harium-mobile-state-management` - Zustand, XState, React Query

**Infrastructure (5 skills):**
1. `harium-database-schema` - Migrations, models, relationships
2. `harium-api-responses` - Response format, validation
3. `harium-i18n-localization` - English/Arabic translations
4. `harium-backend-testing` - Pest PHP testing
5. `harium-mobile-testing` - Jest, MSW mocking

## Best Practices

**Naming:**
- Use lowercase with hyphens: `domain-subsystem`
- Prefix with project name if needed: `project-domain`
- Be specific: `focus-timer` not `timer`

**Content Guidelines:**
- Keep under 500 lines
- Use concrete examples from the codebase
- Include file paths for navigation
- Show patterns, not just explanations
- Include testing approach

**Trigger Descriptions:**
- Must be specific enough to activate correctly
- Include key domain terms
- Mention file patterns that indicate the domain

## Commands

```bash
# Ensure skill directory exists
mkdir -p .agents/skills/skill-name

# Create SKILL.md only if missing
[ -f .agents/skills/skill-name/SKILL.md ] || cat > .agents/skills/skill-name/SKILL.md << 'EOF'
---
name: skill-name
description: Description of when to use this skill
---

# Skill Title

Content...
EOF

# Update existing or newly created skill content
${EDITOR:-vi} .agents/skills/skill-name/SKILL.md
```

## Benefits

1. **Modularity** - Each domain has focused guidance
2. **Context Loading** - Only relevant context loaded per task
3. **Maintainability** - Update one domain without affecting others
4. **Consistency** - Patterns documented once, referenced everywhere
5. **Onboarding** - New team members can understand domains independently
