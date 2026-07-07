# Mobile Dev Ports

Use this when an Expo or React Native dev build, Metro reload, simulator, emulator, or local API flow is broken and ports are involved.

## Core Model

Treat ports as separate contracts:

- Metro process port: the server started by `expo start`, often from `package.json`.
- Native client Metro port: the port compiled or configured into the iOS/Android dev client.
- Automation reload port: the port used by tools such as `agent-device metro reload`.
- Backend API host and port: the URL the app's API client calls.
- Web or proxy ports: Herd, Vite, Laravel, nginx, or tunnel ports.

Do not assume that changing one changes the others. React Native defaults many Metro paths to `8081`; Expo projects often move Metro elsewhere.

## Fast Workflow

1. Identify the exact failing contract: reload, bundle loading, API request, deep link, browser web, simulator, or emulator.
2. Inventory declared ports from docs, `package.json` scripts, app config, Expo config plugins, generated native files, and E2E or automation commands.
3. Confirm the running process port with the project's process manager.
4. Check the native client's Metro port, not only the Metro process:
   - Android reads `reactNativeDevServerPort` and exposes it as `react_native_dev_server_port`.
   - iOS reads `RCT_METRO_PORT`; if it is undefined or empty, React Native falls back to `8081`.
5. Check automation separately. If the tool defaults to `8081`, pass the project port explicitly, for example `agent-device metro reload --metro-port 8082`.
6. Keep API host debugging separate from Metro debugging. A bundle reload failure and an API connection failure can have different correct hosts and ports.
7. Make durable changes in tracked source such as Expo config plugins or docs. Avoid patching ignored/generated `ios/` or `android/` files directly unless the repo tracks native projects.
8. Verify with machine-readable config output, then run the most focused relevant type/lint/format checks.

## Expo Config Verification

Prefer parsing introspection output instead of eyeballing a large one-line JSON blob:

```sh
./node_modules/.bin/expo-internal config --type introspect --json > /tmp/expo-config.json
node -e 'const c=require("/tmp/expo-config.json"); console.log(c._internal.modResults.android.gradleProperties); console.log(c._internal.modResults.ios.podfileProperties);'
```

For iOS, remember that `Podfile.properties.json` alone may not be enough. React Native's `React-Core.podspec` uses `GCC_PREPROCESSOR_DEFINITIONS` with `RCT_METRO_PORT=${RCT_METRO_PORT}`, so the Podfile must set the environment variable from the property before pods/build settings are resolved.

## Example Failure Mode

This example shows the failure mode this workflow is meant to prevent:

- Web app: `http://example-project.test`
- Android emulator API docs target: `http://example-project.test`
- Mobile API client in local dev uses the same `.test` URL as the local web/backend app unless the device cannot resolve that host.
- Mobile Metro: `http://localhost:8082`.
- `example-mobile-app/package.json` starts Expo with `expo start --port 8082`.
- Android dev-client reload was broken because the running Metro server was on `8082` while reload tooling defaulted to `8081`.
- The durable fix belongs in an Expo config plugin, not ignored generated native files:
  - Android: set `reactNativeDevServerPort=8082`.
  - iOS: set `RCT_METRO_PORT=8082` and bridge it into the Podfile environment.

When changing a project's Metro port, update all surfaces together: package scripts, Expo config plugin, QA/docs, automation commands, and any native rebuild instructions. Existing installed dev clients need a native rebuild before they pick up native Metro-port changes.
