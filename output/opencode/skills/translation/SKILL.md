---
name: translation
description: "Review translations for quality, naturalness, and localization correctness."
---

# Translation Review

Review translations for meaning, tone, context, and technical correctness. Do not stop at literal accuracy.

## State File

For large reviews, keep state in `.docs/ai/<feature-or-file>/translation-review.md` with:

- Files and languages
- Progress
- Issues by severity
- Approved groups or patterns

Read and update that file on every continuation.

## Review Checklist

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

Batch approved groups instead of listing every key one by one.

## Rules

- Provide the improved translation, not just the complaint.
- Preserve intent and brevity.
- Call out repeated patterns once, then reference them.
- For Arabic, rewrite for natural meaning and tone, not word-for-word phrasing.
