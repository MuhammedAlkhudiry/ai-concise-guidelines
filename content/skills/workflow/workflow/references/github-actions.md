# GitHub Actions

## Workflow

1. Map the stack: languages, package managers, test runners, and any generated files that are gitignored.
2. Split jobs by what they need: JS-only checks first, then PHP/backend checks that need services, then E2E as manual or main-only.
3. Push a branch, iterate on failures, and do not merge until all jobs are green.

## Design Rules

- Structure from fastest to slowest: format/lint, then typecheck/build/tests, then service-backed and E2E jobs.
- Set `concurrency` to cancel redundant runs on the same PR or branch.
- Set explicit `permissions: contents: read` at the workflow level.
- Use `timeout-minutes` on every job.
- E2E/smoke jobs should be manual-only with `workflow_dispatch` or main-only, never on every PR push.
- Cache dependencies with the setup action's built-in caching, such as `setup-bun` or `setup-php`.

## Common Fixes

- Private registry auth: move hardcoded tokens into env vars, then set a GitHub secret.
- Gitignored generated files: run the generator in the same job as typecheck/build, especially when backend tooling generates frontend files.
- Transitive-only dependencies: add imported packages directly to the manifest instead of relying on another dependency to pull them in.
- Missing app key in backend tests: copy the test env and generate the framework app key before running tests.
- External API calls in tests: fake the client first, disable the service second, or use dummy credentials only to allow service construction.
- MySQL service containers: set root password, test database, health checks, and matching `DB_HOST`, `DB_USERNAME`, and `DB_PASSWORD`.
- Linter exit codes: check the tool's fail-level setting before adding `|| true`.
- Deployment timing: if production deploys on push to main, either accept that CI is not gating deploys or switch deployment to a CI-gated job.

## Debugging Patterns

- Frozen installs expose missing dependencies. If source imports a package, it belongs in the manifest.
- Generated files bind jobs together. If generation needs PHP, run typecheck/build in the PHP job after generation.
- External API tests need fakes, disable flags, or dummy construction credentials.
- App keys are separate from test config. Many frameworks need one even in testing mode.
- Push-to-deploy does not wait for CI unless deployment is triggered from a CI job.

## Skeleton

Use this shape as a starting point, then trim it to the project:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run test
```
