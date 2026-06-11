# React

1. Detect React, React DOM, renderer/runtime framework, router, query/data libraries, form libraries, state libraries, UI/design systems, animation libraries, test utilities, and SSR/hydration setup.
2. Read official React and package migration notes for major upgrades before changing versions.
3. Upgrade React core separately from React ecosystem packages unless an official compatibility matrix says they must move together.
4. Check render roots, hydration, strict mode, effects, suspense, server components where present, router APIs, query cache APIs, form behavior, state selectors, UI component APIs, and testing-library expectations.
5. Apply small fixes directly: import changes, hook option changes, provider config changes, simple route/query/test updates, type fixes, and component prop renames.
6. Skip and ask approval for broad routing rewrites, state/data-layer migrations, design-system migrations, SSR architecture changes, hydration strategy changes, or many-component API changes.
7. Prefer local component and integration tests before broad suites when the touched surface is narrow.
8. Run React-focused checks: typecheck, lint, component tests, focused E2E/smoke flows, and build when the upgrade affects bundling, SSR, or production output.
9. Report each React dependency with migration notes used, version movement, behavior changes, component/test impact, patch status, checks, and approval-needed skips.
