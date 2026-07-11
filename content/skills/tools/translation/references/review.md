# Translation Review

Use this reference for large or systematic translation reviews.

## State File

When the user requests persisted review progress or continuation state, keep it in `.docs/ai/<feature-or-file>/translation-review.md`:

- Files and languages
- Progress
- Issues by severity
- Approved groups or patterns

When that state file exists, read and update it on every continuation.

## Checklist

- Completeness: missing keys, hardcoded strings, fallback gaps
- Quality: natural phrasing, grammar, tone, machine-translation artifacts
- Context: button text, errors, placeholders, UI length
- Technical: interpolation, pluralization, number or date formatting

## Output Format

```text
`translation.key`
Current: "..."
Suggested: "..."
Issue: literal | unnatural | tone | context | technical
Reason: ...
```
