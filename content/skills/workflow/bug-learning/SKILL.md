---
name: bug-learning
description: Durable learning from complex or misleading bug investigations.
---

## Workflow

1. Capture a learning only when the investigation reveals a reusable cause or invariant that was difficult to discover, such as misleading symptoms or
   cross-system behavior. Skip routine fixes and temporary incidents.
2. Put observable regression behavior in a focused test or an existing product contract. Do not create a learning merely to narrate a fixed bug.
3. When a test cannot explain a non-obvious external, platform, or product constraint, run `knowledge learning --help` and capture only the constraint
   and its durable consequence. Link a primary external authority only when the constraint depends on it; never list source files.
4. Use $project-knowledge to connect the canonical glossary term and related feature pack, then run `knowledge lint`.
