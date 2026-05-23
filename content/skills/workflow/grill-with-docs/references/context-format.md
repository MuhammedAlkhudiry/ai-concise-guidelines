# Context Format

Use this format when the user asks to capture domain language.

```md
# {Context Name}

{One or two sentences describing what this context is and why it exists.}

## Language

**{Term}**: {One sentence defining what it is.}
_Avoid_: {ambiguous alias}, {weaker synonym}

## Relationships

- An **{Entity}** belongs to exactly one **{Owner}**
- A **{Process}** produces one or more **{Result}**

## Example Dialogue

> **Dev:** "{Question using the domain terms.}"
> **Domain expert:** "{Answer that clarifies the boundary between terms.}"

## Flagged Ambiguities

- "{ambiguous word}" was used to mean both **{Term A}** and **{Term B}**. Resolution: {final meaning}.
```

## Rules

- Be opinionated. Pick the clearest canonical term.
- Keep definitions to one sentence.
- Define what the term is, not what it does.
- Include only terms specific to this context.
- Exclude general programming concepts.
- Show relationships when they clarify boundaries.
- Group terms under subheadings only when natural clusters emerge.
- Add example dialogue when it clarifies how terms interact.
