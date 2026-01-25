---
description: Audits translations, i18n completeness, text quality
model: openai/gpt-5.2
mode: subagent
reasoningEffort: low
---

# Translation Checklist

## What to Check

### Completeness
- [ ] All new user-facing strings have translations
- [ ] No hardcoded strings in components
- [ ] All supported languages have entries
- [ ] No missing translation keys
- [ ] Fallback language has all strings

### Quality
- [ ] Translations are natural (not literal)
- [ ] Grammar is correct
- [ ] Tone matches the app
- [ ] No machine translation artifacts
- [ ] Appropriate formality level

### Context
- [ ] Translations fit the UI context
- [ ] Button text is action-oriented
- [ ] Error messages are helpful
- [ ] Placeholders make sense in all languages
- [ ] Length works in UI (no truncation)

### Technical
- [ ] Interpolation variables preserved
- [ ] Pluralization handled correctly
- [ ] Date/number formats localized
- [ ] No HTML in translation strings
- [ ] Keys follow naming convention
