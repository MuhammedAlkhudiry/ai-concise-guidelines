# Store Status APIs

Use store APIs for repeatable status checks, following the store-access rule in [SKILL.md](../SKILL.md).

## Contents

- Skill script and EAS evidence
- Google Play Developer API
- App Store Connect API
- Dashboard fallback

## Skill Script

Run the read-only skill script with project-specific params:

```sh
rtk bun "$HOME/.agents/skills/mobile-app-infra/scripts/mobile-store-status.ts" \
  --project-root /path/to/project \
  --mobile-dir path/to/expo-app \
  --env "$SERVICE_CREDENTIALS_HOME/environments/<name>/mobile-release.env"
```

Useful options:

- `--local-only`
- `--json`
- `--platform android|ios|all`
- `--release-version`
- `--android-package`
- `--google-track`
- `--ios-bundle-id`
- `--asc-app-id`

The script is project-independent and read-only. It must not contain project names, app IDs, package names, or credential paths.

## EAS

EAS owns builds and binary upload. Capture:

- Build ID
- Platform
- Build profile
- App version
- Native build number or version code
- Artifact URL
- Submit ID when available

EAS output proves build/upload progress. It does not prove the release is live.

After sending a build to EAS, wait three minutes before the first status query. Do not poll during this initial processing window.

When submit status commands are missing, inspect EAS CLI help before trying alternatives. If the project uses EAS auto-submit, keep the submit IDs from the original output and query by ID through supported tooling when available.

## Google Play Developer API

Use a service account with Android Publisher access.

Read production status by creating a temporary edit, reading the target track, then deleting the edit without committing it.

Track fields to report:

- Package name
- Track
- Release name
- Version codes
- Status
- Rollout fraction
- Release notes

For Android signing-sensitive bugs, also read the app integrity page in Play Console or query generated APK metadata when available. Capture the Play app-signing SHA-1/SHA-256 and compare it with provider-console configuration. The upload key is not the identity users run after Google Play re-signs an app bundle.

Google Play release `status: completed` means the release entry is configured for completed rollout on that track. It may not fully replace dashboard review wording such as pending review or changes in review.

Google Play may run pre-review quick checks after the final send action. Wait for those checks to clear or surface a concrete issue before calling Android handed off to review.

Data safety/app-content blockers are release blockers when Google detects missing declarations. Fix only the detected data types and preserve existing answers. Common fields to verify are:

- Whether data is collected
- Whether data is shared
- Encryption in transit
- Required versus optional collection
- Purpose such as app functionality, account management, analytics, or developer communications

## App Store Connect API

Use an App Store Connect API key with Key ID, Issuer ID, and `.p8` private key.

Read:

- App Store version for the target platform and version string
- Attached build and build processing state
- Latest review submissions

Useful fields:

- `appStoreState`
- Build `processingState`
- Review submission `state`
- Review submission `submittedDate`

App Store Connect upload success is not the same as App Review submission. Verify the app version state and latest review submission state after adding the build for review.

## Non-Apple Dashboard Fallback

Use browser or computer control for a non-Apple store only for:

- 2FA
- Expired auth
- Legal agreements
- Missing tax, banking, privacy, or policy forms
- Store UI flows not supported by the available API/script
- Review wording that conflicts with API-level rollout state
- Final confirmation modals for review or live release when user intent is not already explicit
