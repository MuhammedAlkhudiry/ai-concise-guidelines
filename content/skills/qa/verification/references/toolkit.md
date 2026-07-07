# Verification Toolkit

Use these Awraq-tested tool categories when establishing verification in a new project. Pick only tools that match the repo's stack.

## Command Orchestration

- `mise`: root task runner for composed gates such as `check`, `format-check`, `lint`, `typecheck`, and per-app commands.
- `CHECKLIST.md`: short runnable index. Keep composition in `mise.toml`, not the checklist.
- `bun` / `bunx`: JavaScript package runner for local tools.
- `herd`: PHP/Laravel runtime wrapper for local apps.

## JavaScript / TypeScript

- `oxfmt`: formatting and `--check` formatting gates.
- `oxlint`: lint and safe lint-fix gates.
- `tsc --noEmit`: web TypeScript checking.
- `tsgo --noEmit`: faster/mobile TypeScript checking where available.
- `knip`: unused files, dependencies, unlisted imports, unresolved imports, binaries, and unused exports.

## Laravel / PHP

- `mago fmt --check`: PHP formatting gate.
- `mago lint`: PHP lint gate.
- `mago analyze --minimum-report-level error`: PHP static analysis gate.
- `pest --parallel`: parallel PHP test suite.
- `pest tests/Arch`: architecture tests.
- `rector process --dry-run`: refactor preview, not a normal lightweight gate.
- `composer-unused`: unused Composer package check.
- `php artisan migrate --force`: prepare test/smoke database state.
- `php artisan db:seed --force`: prepare browser smoke fixtures.

## Web / Browser

- `playwright test --config=playwright.config.ts`: browser smoke and critical flow verification.
- `vite build`: build gate only when the repo explicitly treats build as verification.

## React Native / Expo

- `jest --watchAll=false --passWithNoTests`: mobile unit test gate.
- `maestro test --platform ios|android`: device E2E smoke, auth, billing, and core flows.
- `eas build --local` or remote `eas build`: release/build verification only, not the default lightweight gate.

## Checklist Shape

```text
# project
mise run check

# backend-web
mise run backend-web:format-check
mise run backend-web:lint-check
mise run backend-web:typecheck
mise run backend-web:php-lint-check
mise run backend-web:analyze
mise run backend-web:smoke
mise run backend-web:test
mise run backend-web:arch

# mobile
mise run mobile:format-check
mise run mobile:lint
mise run mobile:typecheck
mise run mobile:test
```

Completion signal: every stable verification tool discovered from repo config is represented by a runnable task, and `CHECKLIST.md` stays short enough for an agent to choose the right gate quickly.
