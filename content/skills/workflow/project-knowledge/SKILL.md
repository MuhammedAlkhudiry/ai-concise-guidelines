---
name: project-knowledge
description: Project feature knowledge, functionality documentation, glossary terms, and history.
---

Use project knowledge only for information whose loss would cause a future agent to make the wrong product decision. Run `knowledge --help` for the
live CLI.

## Workflow

1. Run `knowledge find "<query>"` and use its canonical glossary terms so the user and agent share one language. Read the complete glossary only when
   editing language or when the query is insufficient.
2. Read only the one to three returned packs, then inspect the relevant code directly.
3. Treat code, tests, schemas, and runtime evidence as authority for current behavior. Treat active product contracts as authority for intended
   behavior. When they conflict, report an implementation-contract conflict and preserve the promised capability unless the user supersedes it.
4. Do not update knowledge as a routine side effect of code work. Update it only when the user changes project language, a product contract, a scarce
   boundary, or rationale that cannot be recovered elsewhere.

## Creating or Refreshing

1. Inspect local evidence first. Create a missing pack with `knowledge feature "<Feature Name>"`.
2. Put shared vocabulary only in the glossary. Feature packs have no language, glossary, code-map, or evidence section.
3. Express intended, observable capabilities as stable contract IDs with Given/When/Then outcomes. A contract can outlive an implementation and must
   not describe internal mechanics.
4. Keep only durable authority boundaries, compatibility constraints, and rationale whose rejected alternative could realistically recur.
5. Do not list source files. Put the stable contract ID in an acceptance test when useful so agents can find executable coverage by search. Keep an
   external link only when a contract depends on a scarce third-party, platform, or regulatory constraint.
6. Move reproducible bug behavior into regression tests. Keep a learning only for a non-obvious external, platform, or product constraint that a test
   cannot explain.
7. Keep feature packs to Product Contracts, Boundaries, and optional Rationale. Run `knowledge lint` after editing knowledge; it validates structure,
   not truth or freshness.
