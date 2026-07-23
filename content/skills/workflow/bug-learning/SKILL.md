---
name: bug-learning
description: Durable learning from complex or misleading bug investigations.
---

## Workflow

1. Capture a learning only when the investigation reveals a reusable cause or invariant that was difficult to discover, such as misleading symptoms or
   cross-system behavior. Skip routine fixes and temporary incidents.
2. Inspect the confirmed fix and supporting evidence, then run `knowledge learning --help` and create the learning.
3. Fill the generated artifact with the impact, causal mechanism, why it was difficult, durable rule, and regression protection—or why protection does
   not apply. Keep only history that explains the cause.
4. Use $project-knowledge to connect related feature packs, terms, and `key_files`, then run `knowledge check`.
