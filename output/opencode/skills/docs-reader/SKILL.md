---
name: docs-reader
description: Thoroughly read and understand documentation. Use when user says 'read the docs', 'understand this library', 'learn about X', or wants comprehensive documentation coverage. Prevents superficial reading — crawls full doc sites, follows links, and optionally stores as local markdown.
---

# Documentation Reader

Thorough documentation reading skill. **Do not skim** — read comprehensively.

## Triggers

- "Read the docs for X"
- "Understand how X works"
- "Learn about this library"
- "What does X documentation say about Y"
- "Store docs for X locally"

## Core Rules

1. **NEVER SKIM** — Read every relevant page, not just the homepage
2. **FOLLOW LINKS** — Documentation has structure; follow it
3. **PRIORITIZE** — Start with getting started/quickstart, then core concepts, then API reference
4. **VERIFY COMPLETENESS** — Before finishing, check if you missed important sections
5. **ASK SCOPE** — If docs are massive (React, AWS), ask user what areas to focus on

## Reading Strategy

### Phase 1: Discovery

1. Fetch the documentation index/homepage
2. Extract the navigation structure (sidebar, table of contents)
3. List all major sections to the user
4. If docs are large (>20 pages), ask: "Which areas should I focus on?"

### Phase 2: Systematic Reading

Read in this order:
1. **Getting Started / Quickstart** — Installation, basic usage
2. **Core Concepts / Fundamentals** — Mental model, key abstractions
3. **Guides / Tutorials** — Common patterns, best practices
4. **API Reference** — For specific areas user cares about
5. **Advanced / Internals** — Only if relevant to user's needs

### Phase 3: Synthesis

After reading, provide:
- **Summary** — What this library/tool does and when to use it
- **Key Concepts** — Core abstractions user must understand
- **Common Patterns** — How it's typically used
- **Gotchas** — Things that trip people up
- **Quick Reference** — Most important APIs/commands

## Storing Documentation Locally

When user wants docs stored (or docs are frequently referenced):

```
docs/libs/<lib-name>/
├── README.md           # Overview, when to use, key concepts
├── getting-started.md  # Installation, setup, quickstart
├── core-concepts.md    # Mental model, key abstractions
├── api-reference.md    # Important APIs (condensed)
├── patterns.md         # Common usage patterns
└── advanced.md         # Advanced topics (if relevant)
```

### Storage Rules

- **Condense, don't copy** — Summarize in your own words, extract what matters
- **Add context** — Note what's relevant to THIS project specifically
- **Include examples** — Code snippets are valuable
- **Link to source** — Always include original doc URLs
- **Version it** — Note the library version docs are for

### README.md Template

```markdown
# <Library Name>

> <One-line description>

**Version:** X.Y.Z  
**Docs:** <URL>  
**Last Updated:** <Date>

## What It Does

<2-3 sentences explaining the library's purpose>

## When to Use

- <Use case 1>
- <Use case 2>

## Key Concepts

### <Concept 1>
<Explanation>

### <Concept 2>
<Explanation>

## Quick Start

\`\`\`<language>
<minimal working example>
\`\`\`

## Project-Specific Notes

<How this library is used in THIS project, if applicable>
```

## Crawling Documentation Sites

### Using WebFetch

```
1. Fetch index page
2. Parse navigation links
3. Fetch each linked page
4. Extract content (ignore nav, footer, ads)
5. Repeat for subpages if needed
```

### Using Playwriter (for JS-heavy docs)

Some doc sites require JavaScript. Use playwriter:

```javascript
// Get page content
await page.goto('https://docs.example.com');
const content = await page.evaluate(() => document.body.innerText);

// Get all doc links
const links = await page.$$eval('nav a', els => els.map(e => e.href));
```

### Common Doc Site Patterns

| Site | Strategy |
|------|----------|
| GitHub README | Single page, read fully |
| GitBook | Follow sidebar links |
| Docusaurus | Follow sidebar, `/docs/` paths |
| ReadTheDocs | Follow sidebar, check versions |
| MDX/Nextra | Follow sidebar structure |
| Single-page | Scroll and read sections |

## Handling Large Documentation

For massive docs (React, AWS, Kubernetes):

1. **Ask scope first** — "What specifically do you want to learn?"
2. **Start narrow** — Read requested section thoroughly
3. **Expand if needed** — "Should I also cover X which is related?"
4. **Summarize coverage** — "I've read sections A, B, C. D, E, F remain."

## Output Format

After reading documentation, always provide:

```
## Summary

<What this is and what it does>

## Key Takeaways

1. <Most important thing>
2. <Second most important>
3. <Third>

## Relevant to Your Task

<If user has a specific task, how the docs apply>

## What I Read

- [Page 1](<url>) — <brief note>
- [Page 2](<url>) — <brief note>
- ...

## What I Skipped (and why)

- <Section> — <reason: not relevant, too advanced, etc.>
```

## Anti-Patterns (DO NOT)

- Read only the homepage and stop
- Summarize without reading the actual content
- Skip code examples
- Ignore "Guides" or "Tutorials" sections
- Miss the "Gotchas" or "Common Mistakes" sections
- Store docs without condensing (copy-paste)
- Forget to note the version

## Examples

### Example 1: "Read the Zustand docs"

1. Fetch https://zustand-demo.pmnd.rs/
2. Identify sections: Introduction, Basic, Recipes, API
3. Read Introduction → understand the mental model
4. Read Basic → core usage patterns
5. Read Recipes → common patterns (persist, devtools, etc.)
6. Read API → key functions
7. Summarize with key concepts, patterns, gotchas

### Example 2: "Store React Query docs locally"

1. Fetch https://tanstack.com/query/latest
2. Map navigation structure
3. Ask: "React Query docs are extensive. Focus areas?"
4. User: "Queries, mutations, and caching"
5. Read those sections thoroughly
6. Create:
   - `docs/libs/react-query/README.md`
   - `docs/libs/react-query/queries.md`
   - `docs/libs/react-query/mutations.md`
   - `docs/libs/react-query/caching.md`
7. Condense content, add examples, note gotchas

### Example 3: "What do the Playwright docs say about network interception?"

1. Go directly to relevant section
2. Read network interception thoroughly
3. Read related: mocking, request handling
4. Provide focused answer with code examples
5. No need to store — answer the question
