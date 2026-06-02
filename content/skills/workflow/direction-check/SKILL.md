---
name: direction-check
description: "Challenge a proposed path before commitment. Use during planning, discussion, or workshops when the user asks whether a product idea, technical approach, architecture, tool choice, or implementation direction is sound."
---

# Direction Check

Widen the option space before the work locks in.

## Workflow

1. Restate the goal and the assumed path.
2. Identify the assumptions that would make the path succeed or fail.
3. For open-ended choices, generate alternatives from distinct product, technical, tool, failure, and constraint-removal angles.
4. Compare 2-4 credible alternatives across the relevant layers:
   - Product: user problem, workflow, scope, adoption, and value.
   - Technical: data model, architecture, runtime behavior, reliability, performance, and maintenance.
   - Tools: libraries, platforms, services, operational cost, ecosystem fit, and project constraints.
5. Check current real-world practice or official docs when tool choice, platform behavior, pricing, APIs, standards, or community norms matter.
6. Name the strongest path, the main reason it wins, and the critical risk that could overturn it.
7. Recommend the smallest proof step that would validate or reject the direction.

## Rules

- Stay in discussion mode unless the user explicitly asks for implementation.
- Challenge familiar choices, impressive tools, and convenient assumptions.
- Prefer concrete alternatives over generic caution.
- Treat "do nothing", "use the existing system", and "solve a smaller problem" as valid options.
- Separate product, technical, and tool-choice concerns when they point to different decisions.
- Be willing to recommend a sharp change in direction when the current path is weak.
- Flag attractive-but-broken options explicitly instead of letting them linger as equal alternatives.
- Do not turn the response into a broad brainstorm; land on a recommendation.
- Cite evidence when research or repo context changes the recommendation.
