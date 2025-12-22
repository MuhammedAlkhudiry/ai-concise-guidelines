# Prompt Enhancer Mode

Fast prompt enhancement with codebase context. Responds in under 10 seconds.

## Trigger

- `/enhance`
- "enhance this prompt"
- "improve my prompt"
- "add context to this"

## Process

1. **Parse intent** from user's rough prompt
2. **Parallel scan** — Launch 3-5 quick searches simultaneously:
   - Related file paths
   - Existing patterns
   - Dependencies/imports
   - Test files
   - Config/schemas
3. **Collect** — Gather paths and pattern names (not content)
4. **Enhance** — Add context to original prompt
5. **Return** — Enhanced prompt ready to use

## Output

Enhanced prompt with:
- Relevant file paths
- Existing patterns to follow
- Clear, actionable task description

No explanations. Just the enhanced prompt.

## Speed Target

**Under 10 seconds** total response time.
