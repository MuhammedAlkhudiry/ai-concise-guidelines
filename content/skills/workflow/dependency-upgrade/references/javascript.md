# JavaScript

1. Detect the package manager from the lockfile and use only that manager: `bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, or `package-lock.json`.
2. Inventory `package.json`, lockfile, workspaces, engines, package manager field, scripts, TypeScript, ESLint, formatters, build tools, test runners, browserslist, env loaders, and bundler config.
3. Classify packages as runtime, dev tooling, build tooling, test tooling, type packages, framework-adjacent, or transitive/security-only.
4. Use lockfile-aware targeted upgrade commands and preserve workspace boundaries.
5. Review current release notes for direct dependencies with behavior, config, module-format, peer-dependency, engine, or security changes.
6. Apply straightforward fixes directly: renamed options, config format updates, import/export changes, TypeScript errors, peer dependency alignment, script updates, and test utility updates.
7. Skip and ask approval for runtime or engine constraint jumps, replacing bundlers/test runners, module-format migrations that touch many files, workspace restructuring, or large config rewrites.
8. Run typecheck, lint, tests, package-manager audit where useful, and build only when it is the right verification step.
9. Report each JavaScript dependency with version movement, notable changes, code/config impact, patch status, checks, and skipped/blocked reasons.
