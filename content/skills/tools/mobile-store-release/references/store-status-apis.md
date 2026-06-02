# Store Status APIs

Use store APIs for repeatable status checks. Use dashboards for auth prompts, agreements, policy forms, and ambiguous review-state wording.

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

## Dashboard Fallback

Use browser or computer control for:

- 2FA
- Expired auth
- Legal agreements
- Missing tax, banking, privacy, or policy forms
- Store UI flows not supported by the available API/script
- Review wording that conflicts with API-level rollout state
- Final confirmation modals for review or live release when user intent is not already explicit
