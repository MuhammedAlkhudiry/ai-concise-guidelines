# Mobile Store Release

Use this for Expo/EAS releases, submission checks, readiness, and store API credentials.

## Workflow

1. Run the discovery and confirmation pass from [store-expo-eas-release.md](store-expo-eas-release.md).
2. Use $service-access when store access or credentials are missing.
3. Use [store-expo-eas-release.md](store-expo-eas-release.md) for the release sequence.
4. Use [store-status-apis.md](store-status-apis.md) for Google Play and App Store Connect status checks.
5. Run `scripts/mobile-store-status.ts --help` before using the read-only status script.
6. For releases or incidents involving native social sign-in, verify store signing identity against provider OAuth clients before assuming app-code failure.
7. Pause before final review/live actions unless the user already explicitly confirmed the full release.
8. Report exact states per platform. Do not call a release live from build or upload output alone.

## Boundaries

- Keep project-specific app IDs, credential paths, package names, release notes, and commands in the project repo or local config.
- Do not make screenshots part of the default release path.
- Prefer existing project scripts for builds and submissions.
- Keep project release-status command wrappers optional; do not require project build/check tools to include release tasks.
- Stop for bundle, signing, versioning, or policy issues that require a rebuild or product decision.
