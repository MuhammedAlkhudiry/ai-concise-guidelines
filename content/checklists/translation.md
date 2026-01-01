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

---

## Severity Levels

| Level | Examples |
|-------|----------|
| **Blocker** | Missing translation (shows key), broken interpolation, offensive mistranslation |
| **Should Fix** | Unnatural phrasing, inconsistent terminology, too long for UI |
| **Minor** | Could be more natural, minor style preference |

---

## Common Issues

### Missing Translation
```typescript
// BAD - hardcoded
<button>Submit</button>

// GOOD - translated
<button>{t('common.submit')}</button>
```

### Broken Interpolation
```json
// BAD - variable name changed
{ "welcome": "Hello {{name}}" }  // en
{ "welcome": "Hola {{nombre}}" } // es - WRONG variable!

// GOOD - same variable
{ "welcome": "Hello {{name}}" }  // en
{ "welcome": "Hola {{name}}" }   // es
```

### Literal Translation
```json
// BAD - literal (awkward)
{ "get_started": "Get started" }      // en
{ "get_started": "Obtenga iniciado" } // es - too literal

// GOOD - natural
{ "get_started": "Get started" }  // en
{ "get_started": "Comenzar" }     // es
```

---

## Rules

1. **Check all languages** — Not just the one you speak
2. **Verify interpolation** — Variables must match exactly
3. **Consider context** — "Save" button vs "Save" noun are different
4. **Check length** — German is often 30% longer than English
5. **No literal translations** — Natural phrasing over word-for-word
