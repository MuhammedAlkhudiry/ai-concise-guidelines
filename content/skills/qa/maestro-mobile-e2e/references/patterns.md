# Maestro Mobile E2E Patterns

Use these patterns as a starting point, then adapt names and fixtures to the current repo.

## Suite Shape

```text
.maestro/
├── flows/
│   ├── start-app.yaml
│   ├── login-primary.yaml
│   └── login-secondary.yaml
├── auth/
├── core/
└── smoke.yaml
```

Keep shared setup in `flows/`. Keep executable test files grouped by product purpose, such as `auth`, `core`, `payments`, or `onboarding`.

## Startup Flow

Use one startup subflow for app launch, dev-client prompts, server selection, first-run overlays, and the first stable screen assertion.

```yaml
appId: com.example.app
---
- launchApp
- tapOn:
    text: "Continue"
    optional: true
- tapOn:
    text: "Close"
    optional: true
- extendedWaitUntil:
    visible:
      id: "login-screen|home-screen"
    timeout: 20000
```

Add platform or dev-client steps only when the current app needs them. Keep all such steps in this one file so future fixes are one-file changes.

## Login Flow

Create one subflow per stable auth role or state.

```yaml
appId: com.example.app
---
- extendedWaitUntil:
    visible:
      id: "login-screen"
    timeout: 20000
- tapOn:
    id: "login-primary-button"
- extendedWaitUntil:
    visible:
      id: "home-screen"
    timeout: 20000
```

Name login flows by role or purpose, not by project-specific user names.

## Flow Design

Prefer this:

```yaml
appId: com.example.app
---
- clearState
- runFlow: ../flows/start-app.yaml
- runFlow: ../flows/login-primary.yaml
- tapOn:
    id: "target-entry"
- extendedWaitUntil:
    visible:
      id: "target-screen"
    timeout: 10000
```

Avoid broad journeys that open several unrelated screens, tap back repeatedly, and depend on inherited scroll position. Split those into separate one-way checks.

## Fixture Contract

Document reusable E2E data in the project QA docs:

- App id and target platform.
- Local backend and dev-server targets.
- Fixture reset command.
- Login roles and how each role enters the app.
- Stable identifiers for search, auth, and record lookup.
- Records expected by flows, such as one visible post, document, account item, or request.
- Feature flags or settings that must be enabled.

Do not put project-specific fixture values in this skill.

## Debug Checklist

- Confirm the app is installed and the app id is correct.
- Confirm the backend and dev server are reachable from the simulator or emulator.
- Rerun the most focused failing flow before running the full suite.
- Close dev-client overlays before tapping app controls they may cover.
- Hide the keyboard before tapping a submit button below an input.
- Prefer `scrollUntilVisible` against a stable id, then tap that id.
- If a flow fails after back navigation, split it into one-way route checks.
- If `runFlow` fails to load a subflow, confirm the subflow has a config section and the relative path is correct from the calling file.

## Verification Order

1. One flow that calls the startup subflow.
2. One flow for each login subflow.
3. One core flow that uses scrolling or navigation.
4. The auth group.
5. The core group.
6. The full suite.

## Evidence and Artifacts

For serious QA runs, keep artifacts in a repo-local ignored directory:

```bash
maestro test --test-output-dir=build/maestro-results .maestro
```

Add `--debug-output=build/maestro-debug` when diagnosing failures. Use `--format junit`, `--format html`, or `--format html-detailed` with `--output` only when CI or a human-readable report is useful.
