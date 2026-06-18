# Expo/EAS Store Release

## Discovery

Before running a release, inspect:

- Project release docs and agent instructions
- `package.json` scripts
- `app.json`, `app.config.js`, or `app.config.ts`
- `eas.json`
- Repo checklists for lint, typecheck, tests, and build verification
- Local ignored env files and credential setup docs
- Store metadata or release-note config such as EAS metadata files

Confirm:

- Target branch
- Current app version and native build numbers
- Version bump rule
- Latest remote EAS app versions and native build numbers
- EAS profile name
- Production build and submit command
- Android package name and Play track
- iOS bundle ID and App Store Connect app ID
- Native social sign-in provider config, especially Android OAuth clients and the signing fingerprints for the artifacts users will install

## Status Words

- `built`: EAS created a binary artifact.
- `submitted`: EAS or a store API uploaded the binary to a store.
- `in review`: the store accepted the release into review.
- `live`: the store explicitly shows the release as available to users.

Do not infer `live` from EAS output alone.

## Versioning

Expo/EAS separates the store-visible app version from native build numbers.

- `expo.version` is the user-facing store version.
- Android `versionCode` and iOS `buildNumber` are native build numbers.
- `appVersionSource: remote` and `autoIncrement` can manage native build numbers.
- EAS does not reliably choose the next user-facing version for the product.

Before bumping, check both local config and the latest EAS builds. If the local version is behind an already-built remote app version, advance to a genuinely new store version instead of rebuilding the same user-facing version.

## Release Sequence

1. Sync to the target branch and inspect local changes.
2. Preserve unrelated branch or PR work before switching release branches.
3. Run the project's relevant checks and report any checks that are skipped, killed, or inconclusive.
4. Bump the app version according to project rules; do not manually bump remote-managed native build numbers.
5. Commit and push the version/config change when the project workflow requires it.
6. Run the existing production build-and-submit script.
7. Capture EAS build IDs, native build numbers, submit IDs, artifact links, and timestamps.
8. Verify EAS submissions with supported commands or internal status queries before touching stores.
9. Verify Android through Google Play status.
10. Verify iOS through App Store Connect status.
11. If native Google Sign-In is in scope, compare Google Play app-signing fingerprints against Android OAuth clients before calling the release healthy.
12. Use browser or computer control for legal agreements, review forms, 2FA, and dashboard-only blockers.
13. Finish with exact per-platform state and any remaining store action.

## EAS Submit Caveats

- Check the installed EAS CLI help before assuming command names like `submit:list`.
- Do not create duplicate submissions just to check status.
- If EAS Android submit has no production track configured, it may upload to an internal track.
- If a version code was already uploaded to one Play track, re-submitting the same artifact to another track can fail with a duplicate-version-code error.
- In that case, promote or attach the already-uploaded bundle through Google Play Console or the Google Play Developer API instead of re-uploading.
- Configure Android production submit explicitly before the next release when the project supports it.

## Store Blockers

Stop and report clearly for:

- Version code/build number conflicts
- Signing or provisioning failures
- Missing required bundle artifacts
- Code-policy rejection
- Product decisions about rollout, compliance, pricing, privacy, or availability

Handle directly when authorized:

- Agreements already approved by the user
- Missing review info
- Release notes or rollout settings
- Data safety or app-content declaration forms
- Waiting for build processing

## App Store Connect Flow

After EAS uploads an iOS build:

1. Wait for Apple build processing to finish.
2. Create the new App Store version when needed.
3. Fill `What's New` or release notes.
4. Attach the processed build.
5. Save once and let App Store Connect reveal missing fields.
6. Fill required review contact, demo account, export compliance, or review notes from project docs.
7. Add the version for review.
8. Submit the review bundle.
9. Verify `Waiting for Review`, `In Review`, approved, or live.

## Google Play Console Flow

When using the dashboard:

1. Open the production track or Publishing overview for the app.
2. Create or edit the production release.
3. Add the already-uploaded app bundle from the artifact library when needed.
4. Add release notes.
5. Preview warnings and confirm they are informational before saving.
6. Save the production change to Publishing overview.
7. Send the pending change for review after final confirmation.
8. Wait for Play quick checks to complete or expose a concrete blocker.
9. Report `Changes in review`, rejected, approved, or live exactly as shown.

## Google Sign-In And Play Signing

Native Android Google Sign-In validates the installed app identity, not just the package name or web client ID.

- Google Play-delivered builds are signed with the Play app-signing key, while EAS/uploaded artifacts are signed with the upload key before Play re-signs them.
- An Android OAuth client registered only with the upload-key SHA-1 can still produce `DEVELOPER_ERROR` or error code `10` for production users because their installed APKs are signed by the Play app-signing key.
- Keep separate Android OAuth clients when needed: one for upload/internal artifacts and one for Play app-signing production artifacts.
- Create or update the Android OAuth client in the Google Cloud project that owns the client IDs embedded in the app, not merely in whichever Firebase project has a `google-services.json` file.
- A provider-console-only OAuth fix can repair an already-shipped binary when the app already opens native Google Sign-In and fails before any backend request. Wait for provider propagation, then retest the same signed artifact and monitor Sentry by release/dist.
