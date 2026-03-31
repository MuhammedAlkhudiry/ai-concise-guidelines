---
name: _init-product
description: "Create or refresh a repo-root PRODUCT.md that gives AI the product context needed for product planning and non-technical feature work. Use when the user asks to initialize product context, deeply understand the product, or generate/update PRODUCT.md."
---

# Init Product

Create one product source-of-truth document for AI. Optimize for product understanding, not technical architecture.

## Workflow

1. Inspect the strongest product sources first: existing `PRODUCT.md`, `README.md`, docs, landing-page copy, user stories, support notes, issues, PRDs, visible product flows, and any authoritative product links the user provided.
2. Read just enough code to confirm current behavior, terminology, workflow boundaries, and what already exists. Do not drift into implementation detail.
3. Separate fact, inference, and unknown. If something matters and cannot be verified, mark it clearly instead of guessing.
4. Create or update repo-root `PRODUCT.md` using the structure below.
5. Keep the document product-only. Include technical constraints only when they directly affect product scope, sequencing, or rollout.
6. End with open questions, missing evidence, and assumptions that should be resolved next.

## What PRODUCT.md Must Cover

- Product summary and current status
- Target users and segments
- Core problems and jobs to be done
- Value proposition and differentiation
- Product principles and decision rules
- Main workflows and user journey
- Core entities, terminology, and mental model
- Scope, non-goals, and boundary lines
- Success metrics and product quality bar
- How to evaluate, scope, and sequence new features
- Risks, assumptions, and open questions
- Sources used

## PRODUCT.md Structure

Use this section order unless the repo already has a stronger established format:

1. `# Product Summary`
2. `## Current Status`
3. `## Target Users`
4. `## Problems To Solve`
5. `## Value Proposition`
6. `## Differentiation`
7. `## Product Principles`
8. `## Core Workflows`
9. `## User Journey`
10. `## Product Mental Model`
11. `## Scope`
12. `## Success Metrics`
13. `## Feature Development Guide`
14. `## Risks And Constraints`
15. `## Open Questions`
16. `## Sources`

## Rules

- Prefer a sharp, opinionated document over a bloated encyclopedia.
- Write for future AI agents: explicit, structured, and easy to scan.
- Preserve user intent, but replace weak wording with clearer product language.
- If `PRODUCT.md` already exists, refine it instead of rewriting blindly.
- Do not include stack, APIs, schema, or file maps unless they materially affect product decisions.
- When sources conflict, call out the conflict and choose the most credible current source.
- If the repo is not enough, use the most authoritative available product sources and cite them.
