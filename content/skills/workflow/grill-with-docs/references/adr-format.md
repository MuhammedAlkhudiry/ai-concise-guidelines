# ADR Format

Use this format when the user asks to capture an architecture decision.

ADRs live in `docs/adr/` unless the repo already has a different ADR location. Number new ADRs by scanning the existing ADR directory and incrementing the highest number.

```md
# {Short Decision Title}

{One to three sentences: the context, the decision, and why it was chosen.}
```

## Optional Sections

Only add these when they carry real value:

- `status: proposed | accepted | deprecated | superseded by ADR-NNNN`
- `## Considered Options`
- `## Consequences`

## When To Offer An ADR

Offer an ADR only when all three are true:

- Hard to reverse: changing direction later would be meaningfully costly.
- Surprising without context: a future reader would wonder why this path was chosen.
- Real trade-off: there were genuine alternatives and one was deliberately rejected.

Good ADR subjects include architectural shape, integration boundaries, lock-in technology choices, scope ownership, deliberate deviations from the obvious path, hidden constraints, and non-obvious rejected alternatives.
