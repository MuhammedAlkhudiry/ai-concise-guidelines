---
name: ux-ui
description: Interface design, implementation, and review for product flows, screens, and components. Use when planning UX, building or changing UI, or reviewing interface quality.
---

# UX/UI

## Workflow

1. Identify the user's starting context, goal, constraints, expected outcome, next action, and recovery or exit path.
2. Trace the current flow, hierarchy, controls, states, platform conventions, and design-system patterns.
3. Read [references/foundations.md](references/foundations.md), then load the chapters the task needs:
   - [references/interaction-components.md](references/interaction-components.md): controls, forms, navigation, overlays, data-heavy interfaces, gestures, and progress.
   - [references/visual-responsive.md](references/visual-responsive.md): layout, typography, color, icons, imagery, surfaces, responsive behavior, and localization.
   - [references/motion-accessibility.md](references/motion-accessibility.md): motion, direct manipulation, perceived performance, and accessibility.
   - [references/content-systems-review.md](references/content-systems-review.md): UX writing, design systems, implementation, reviews, and completion checks.
4. Read every chapter for broad design, redesign, implementation, or full-interface review.
5. When planning or preparing UI creation or editing, use an available image-generation tool to show a raster visual proposal instead of describing the intended appearance only.
   Keep deterministic UI, simple wireframes, existing vector assets, and design-system elements code-native.
6. Resolve issues in this order: blocked or unsafe flow, lost work or missing recovery, missing states, accessibility, hierarchy and wording, interaction feedback, visual coherence, then delight.
7. Evaluate with realistic content, viewports, inputs, text sizes, accessibility preferences, and interaction speeds.

## Rules

- Treat product behavior, interaction, content, visual design, accessibility, responsiveness, and motion as one system; the interface is done when they work together.
- Prefer the simplest complete experience, not the fewest visible elements.
- Design the common path first, disclose advanced capability progressively, and keep expert use fast.
- Use the existing design system when it serves the intended behavior; extend it only when a needed behavior or visual language is missing.
- Treat accessibility failures as functional defects.
- Distinguish evidence, inference, and aesthetic preference. Explain important choices through their effect on the user experience.
