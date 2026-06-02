---
name: mobile-store-release
description: Run or assess Expo/EAS mobile app releases to Google Play and App Store Connect, including credential intake, store submission status, and dashboard fallback handling.
---

# Mobile Store Release

Use this for Expo/EAS production releases, store submission checks, release readiness, or setting up store API credentials.

## Workflow

1. Read the project's release docs, app config, EAS config, package scripts, check commands, and ignored local env files.
2. Confirm the target branch, versioning rule, build command, store apps, package IDs, bundle IDs, and release status vocabulary.
3. Use [references/credential-intake.md](references/credential-intake.md) when store API credentials are missing or the user downloads them.
4. Use [references/expo-eas-store-release.md](references/expo-eas-store-release.md) for the release sequence.
5. Use [references/store-status-apis.md](references/store-status-apis.md) for Google Play and App Store Connect status checks.
6. Use browser or computer control only for 2FA, legal agreements, expired sessions, policy forms, and dashboard-only blockers.
7. Pause before final review/live buttons unless the user already explicitly confirmed the full release.
8. Report exact states per platform. Do not call a release live from build or upload output alone.

## Boundaries

- Keep project-specific app IDs, credential paths, package names, release notes, and commands in the project repo or local config.
- Do not make screenshots part of the default release path.
- Prefer existing project scripts for builds and submissions.
- Stop for bundle, signing, versioning, or code-policy issues that require a rebuild or product decision.
