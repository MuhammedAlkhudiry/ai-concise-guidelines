# Mobile Store Release

Use this for Expo/EAS releases, submission checks, readiness, and store API credentials.

## Workflow

1. Read release docs, app config, EAS config, package scripts, check commands, and ignored local env files.
2. Confirm the target branch, versioning rule, build command, store apps, package IDs, bundle IDs, and release status vocabulary.
3. Use [store-credential-intake.md](store-credential-intake.md) when store API credentials are missing or the user downloads them.
4. Use [store-expo-eas-release.md](store-expo-eas-release.md) for the release sequence.
5. Use [store-status-apis.md](store-status-apis.md) for Google Play and App Store Connect status checks.
6. Run `scripts/mobile-store-status.ts` for read-only local, EAS, Google Play, and App Store Connect status when project params are known.
7. For releases or incidents involving native social sign-in, verify store signing identity against provider OAuth clients before assuming app-code failure.
8. Never use Chrome, browser automation, or computer control for App Store Connect. Use its API; report API-unsupported actions as manual blockers for the user. Browser access for another store is limited to 2FA, legal agreements, expired sessions, policy forms, and dashboard-only blockers.
9. Pause before final review/live buttons unless the user already explicitly confirmed the full release.
10. Report exact states per platform. Do not call a release live from build or upload output alone.

## Boundaries

- Keep project-specific app IDs, credential paths, package names, release notes, and commands in the project repo or local config.
- Do not make screenshots part of the default release path.
- Prefer existing project scripts for builds and submissions.
- Keep project release-status command wrappers optional; do not require project build/check tools to include release tasks.
- Stop for bundle, signing, versioning, or policy issues that require a rebuild or product decision.
