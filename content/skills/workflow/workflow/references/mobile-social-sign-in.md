# Mobile Social Sign-In

Implement, debug, and release mobile social sign-in across the app, provider console, backend, CI, and store-build boundary.

## When To Use

Use this workflow for native mobile Google, Apple, or similar provider sign-in issues; Expo or React Native social-login changes; provider token exchange bugs; OAuth client, SHA, URL-scheme, capability, or EAS build-profile problems; and release handoffs where social login must be proven on iOS and Android.

## Start Here

1. Inventory the current flow before changing it: platforms, runtime, provider libraries, Expo config/plugins, build profiles, backend endpoints, token verifier, account-linking rules, tests, CI, EAS/GitHub env vars, Sentry/logging, and release path.
2. Read current official docs for the provider and runtime before changing behavior. Include Expo, the provider SDK, Google Identity, Apple Developer, and EAS docs when those surfaces are involved.
3. Choose the auth path by platform. Prefer native provider SDKs on iOS and Android. Use browser OAuth only when the app intentionally supports a web-style flow and the redirect/deep-link contract is explicit.
4. Trace the complete contract: button press, provider SDK configuration, native credential prompt, provider result or cancel, ID token presence, backend exchange, server token verification, account lookup/linking, session creation, persisted auth state, sign-out, deletion, and revoked credentials.
5. Confirm provider-console identity for each platform and signing context before blaming app code.
6. Update the app, backend, config, tests, and docs together when the contract changes.
7. Rebuild any native binary affected by native dependencies, config plugins, bundle or package IDs, URL schemes, entitlements, capabilities, provisioning profiles, signing keys, service files, or build-time env vars.
8. Verify on the signed artifacts users will run. Do not claim end-to-end social sign-in success from CI, Expo Go, a simulator-only check, a browser callback, or one platform working.
9. Hand off release impact clearly: which builds/profiles changed, which provider-console values were checked, which real-device tests passed, what remains manual, and what to monitor after release.

## Source Check

Re-read current primary docs when implementing or debugging:

- Expo Google auth: `https://docs.expo.dev/guides/google-authentication/`
- Expo AuthSession: `https://docs.expo.dev/versions/latest/sdk/auth-session/`
- Expo AppleAuthentication: `https://docs.expo.dev/versions/latest/sdk/apple-authentication/`
- Expo EAS env vars: `https://docs.expo.dev/eas/environment-variables/`
- React Native Google Sign-In config: `https://react-native-google-signin.github.io/docs/setting-up/get-config-file`
- Google backend ID-token verification: `https://developers.google.com/identity/sign-in/web/backend-auth`
- Google ID token claims: `https://developers.google.com/identity/gsi/web/guides/verify-google-id-token`
- Apple capabilities: `https://developer.apple.com/help/account/identifiers/enable-app-capabilities/`
- Apple App Review Guidelines: `https://developer.apple.com/app-store/review/guidelines/`

## Configuration Matrix

| Surface | Verify | Common Failure |
| --- | --- | --- |
| Google Android app | Package/application ID, Android OAuth client, SHA-1, SHA-256 when required, Firebase app, `google-services.json`, build profile | Works in debug but fails in Play/internal build because the signed artifact uses a different fingerprint. |
| Google Android signing | Debug key, EAS/upload key, Play app-signing key, internal-testing artifact source | Agent adds the upload key but tests a Play-delivered build signed by the Play app-signing key. |
| Google iOS app | Bundle ID, iOS OAuth client, reversed client ID URL scheme, `GoogleService-Info.plist`, config plugin | Native SDK opens but redirects fail or iOS crashes because the URL scheme is missing/wrong. |
| Google backend | Web/server client ID, accepted audiences, issuer, expiry, token verification library, HTTPS exchange | Backend validates against the wrong audience or receives an access token/user ID instead of an ID token. |
| Apple iOS app | Bundle ID, team ID, Sign in with Apple capability, entitlement, provisioning profile, Expo `ios.usesAppleSignIn`, plugin | Works in simulator-ish checks but fails in standalone build because capability/profile was not rebuilt. |
| Apple backend | Apple public keys/JWKS, issuer, audience/client ID, expiry, nonce when used, revoked/deleted account handling | Backend trusts email or profile fields instead of validating identity token claims. |
| Expo config | Native plugin list, app config env reads, service-file paths, package/bundle IDs, scheme/deep links | JS changes ship without rebuilding the native binary that actually owns the changed config. |
| EAS/CI env | `eas.json` profile `environment`, EAS env vars, file env vars, GitHub secrets, registry tokens, install logs | Local env works but remote build misses a file/token or uses a drifted variable name. |
| Observability | Provider/platform/build tags, breadcrumbs before and after SDK/backend boundaries, release/dist tags | Failure becomes guesswork because the only visible symptom is "Google button does nothing." |
| QA artifact | Dev client, preview build, TestFlight, Play internal testing, production, signing identity | Agent tests the wrong artifact and reports success for a build users will never run. |

## Google Details

- Mobile Google sign-in should normally use the native Google Sign-In SDK path on iOS and Android. In Expo, `@react-native-google-signin/google-signin` requires a development/custom native build and cannot be proven in Expo Go.
- `expo-auth-session` is browser OAuth. It can be correct for deliberate browser flows, but it is not proof that native mobile Google Sign-In is configured.
- Keep the OAuth clients straight:
  - Android client: package/application ID plus signing certificate fingerprint. Register every real signing context that will run the app, such as debug/local, EAS upload key, and Google Play app-signing key.
  - iOS client: bundle ID plus the correct reversed client ID URL scheme or provider config file.
  - Web client: server/audience client used when requesting an ID token that the backend will verify.
- `DEVELOPER_ERROR`, error code `10`, or a native prompt that fails before any backend request often means Google rejected the Android app identity. Check whether the registered Android OAuth client uses the upload-key SHA-1 while the Play-installed app uses the Play app-signing SHA-1.
- Check SHA-1 and SHA-256 when provider tooling, Firebase, Play Console, or another Google API asks for fingerprints. OAuth setup often emphasizes SHA-1; adjacent Google APIs or Firebase surfaces may display both.
- Know whether the artifact is signed by the debug key, upload key, or Play app-signing key. The same version number can represent different effective identities depending on how it was installed.
- If using Firebase config files, confirm `google-services.json` and `GoogleService-Info.plist` belong to the right app IDs, OAuth client project, and build profile. If the files are gitignored, verify the EAS file env vars that provide them.
- A provider-console fix can be enough when the shipped app already requests the right token and only the Android OAuth client or fingerprint is missing. Do not create code churn for a console-only issue.

## Apple Details

- Apple Sign-In is an iOS/tvOS capability; Android and web need separate auth paths.
- Confirm the exact bundle ID, Apple team, app identifier, Sign in with Apple capability, entitlement, service ID or app ID as applicable, and provisioning profile.
- Capability changes can invalidate existing provisioning profiles. Regenerate profiles or let EAS capability syncing do it, then rebuild the native binary.
- Handle first-login-only name/email, private relay email, missing profile fields, cancellations, revoked credentials, and account deletion without assuming email is stable or always present.
- If the app offers third-party login for a primary account on iOS, re-check current App Store Review rules around Apple Sign-In before release.
- If user deletion is implemented, verify provider-token revocation expectations separately from local account deletion.

## Backend Contract

- Treat provider subject IDs as durable identity keys. Do not link accounts by email alone.
- Verify ID tokens server-side. Check signature, issuer, audience, expiry, and the provider-specific claims the app relies on.
- Keep mobile and backend client IDs compatible. Android/iOS native clients authorize the signed app; the backend often verifies the web/server client audience requested by the mobile SDK.
- Keep auth and authorization separate unless the provider flow explicitly combines them. Do not store provider access tokens unless the app needs provider API access.
- Make account linking explicit:
  - Provider ID match: sign in that user.
  - No provider ID but verified email matches an existing account: link only if product policy allows it.
  - Email collision with different provider/account: return a clear recoverable error.
  - New verified identity: create the user through the same domain rules as other sign-up paths.
- Avoid leaking internal account-linking flags in public API responses unless the client needs them.
- Cover valid, expired, wrong-audience, wrong-issuer, missing-token, missing-claim, existing-account, new-account, email-collision, provider-mismatch, and revoked-account paths.

## Implementation Checklist

- Replace web/browser provider code only after mapping all callers and tests that rely on it.
- Configure the provider SDK once at app startup or the project-standard auth boundary.
- Add local in-flight state so repeated taps do not launch duplicate provider prompts or backend mutations.
- Preserve existing button feedback, accessibility labels, loading state, disabled state, and analytics behavior while changing auth internals.
- Send the backend payload the contract needs: provider, ID token, optional nonce/code only when required, and app metadata if the backend uses it.
- Keep backend social login response shape compatible with the existing app session model.
- Update docs for rebuild requirements, provider-console prerequisites, and test artifacts.
- Keep unrelated dependency, registry-token, or CI cleanup in a separate change unless it blocks installation/build.

## Observability

Add breadcrumbs or structured logs around every opaque boundary:

- Provider button pressed.
- SDK configured, including provider and platform tags but not secrets or raw tokens.
- Android Play Services or credential availability check.
- Native provider result, cancel, and non-cancel error.
- Missing ID token or unexpected SDK payload.
- Backend exchange start, success, failure status, and provider tag.
- Backend token verification failure reason at a safe granularity.
- Session persisted and user hydrated.

Suggested fields:

| Field | Purpose |
| --- | --- |
| `provider` | Separate Google, Apple, and future providers. |
| `platform` | Catch iOS-only or Android-only failures. |
| `build_profile` | Separate development, preview, internal, and production. |
| `app_version` / `build_number` | Match reports to artifacts. |
| `release` / `dist` | Link mobile and backend events in Sentry. |
| `stage` | Button, SDK, token, backend, session, or profile hydration. |
| `status` | Success, cancel, expected error, unexpected error. |
| `error_code` | Provider-safe code without raw payloads. |

Capture non-cancel failures with provider, platform, build profile, app version, and release/dist tags. Never log raw ID tokens, access tokens, refresh tokens, client secrets, private keys, authorization codes, or full provider payloads.

## CI, EAS, And Env

- Search all package-manager configs, CI workflows, EAS profiles, local env examples, app config, scripts, and docs before renaming auth or registry env vars.
- Keep EAS `development`, `preview`, and `production` environments aligned with the build profile that consumes them.
- Values embedded in client code or native config are public even if they came from a secret store. Use secret visibility for build-only credentials, not public client IDs.
- File env vars for provider config files must be available to remote EAS builds, not only to local shells.
- If a build fails during dependency install, solve that as a build pipeline issue before debugging provider auth.
- Keep unrelated token or registry fixes separate unless they block the auth build. If they must be touched, prove every consumer uses the same name.

## Build Decision Matrix

| Change | Usually Needs |
| --- | --- |
| JS-only error handling or copy | JS update or normal app deploy path. |
| Provider SDK dependency added/removed | Native rebuild. |
| Expo config plugin, package ID, bundle ID, URL scheme, entitlement, capability, service file path | Native rebuild. |
| Android OAuth client or SHA added in provider console only | No code change if app already requests the right token; retest affected signed artifact. |
| Apple capability/provisioning change | Regenerate/sync profile and rebuild. |
| Backend accepted audience/client IDs changed | Backend deploy and mobile retest; native rebuild only if app config also changed. |
| EAS env or file env changed | Rebuild the profiles that consume it. |
| Store-track or signing identity changed | Test the artifact from that track/signing source. |

## QA Gates

- Test a real iOS device/account and a real Android device/account for every changed provider. One platform passing does not prove the other.
- Use dev-client, preview, TestFlight, Play internal testing, or production builds according to the signing identity being verified.
- Test install/update behavior when signing keys differ; Android may require uninstalling a Play build before installing an EAS APK signed with a different key.
- Cover first sign-in, returning sign-in, cancel, provider error, missing token, backend rejection, account collision, sign-out, and retry.
- Verify both "provider UI opened" and "app session created." Native provider UI is not success.
- Collect the artifact/build ID, app version/build number, platform, device, account type, exact time, visible error, provider screen reached, backend response class, and Sentry/event links for failures.

Proof required before saying done:

- The right signed artifact was installed.
- The provider prompt completed with a real account.
- The backend accepted the token and created/restored the app session.
- The app landed on an authenticated screen and persisted across restart when expected.
- Telemetry or logs can distinguish provider cancel, SDK failure, backend rejection, and session success.

## Failure Modes

| Symptom | Suspect First | Evidence To Collect |
| --- | --- | --- |
| `invalid_request` on Android after iOS works | Browser OAuth on Android, missing Android OAuth client, wrong package, wrong SHA, wrong signing key | Install source, package ID, signing fingerprint, provider client list, SDK path. |
| `DEVELOPER_ERROR` or code `10` before backend request | Android OAuth client has upload-key SHA-1 but Play users run the Play app-signing key, or the client lives in the wrong Google project | Play app integrity SHA-1/SHA-256, OAuth client project, package ID, Sentry release/dist, `google-services.json` project/client IDs. |
| Native Google UI opens but backend rejects | Wrong ID-token audience, access token sent instead of ID token, backend accepted clients stale | Sanitized token claims, backend verifier config, API response class. |
| Works in debug but not Play/internal | Different signing fingerprint or provider file/env by profile | Debug SHA, upload SHA, Play signing SHA, EAS profile, provider config file source. |
| Works locally but EAS build fails | Missing remote env/file env, registry token drift, install token mismatch | EAS profile environment, `eas env:list`, CI secrets, install logs. |
| iOS crashes or returns after Google prompt | Missing reversed client ID URL scheme or bad plist/plugin config | iOS URL schemes, bundle ID, Google iOS client, native logs. |
| Apple unavailable in standalone build | Capability/profile/entitlement missing | App ID capabilities, provisioning profile entitlements, Expo config, build logs. |
| Email missing or changed | Provider privacy rules, first-login-only profile claims, private relay | Provider payload shape, stored provider subject, account-linking policy. |
| Duplicate users | Linking by email without provider subject invariant | Database identities, unique constraints, social-login service tests. |
| Button appears dead | No breadcrumbs around SDK or backend, duplicate tap race, swallowed cancel/error | Button press log, in-flight state, SDK result/error, backend exchange breadcrumb. |
| CI green but users fail | CI did not exercise real provider account or signed artifact | Manual QA proof, store/internal artifact, platform-specific logs. |

## Incident Lessons

- A mobile app can pass iOS Google Sign-In and still fail Android because Android uses a different native identity: package name plus signing certificate.
- A production Play build can fail with Google `DEVELOPER_ERROR` even when an Android OAuth client exists, if that client is registered to the upload key instead of the Play app-signing key.
- `google-services.json` can be misleading when OAuth client IDs are embedded from a different Google Cloud project. Follow the client IDs actually used by the build and create Android OAuth clients in that project.
- A production Google failure can be a provider-console configuration issue, not a repo-code issue. Check signed artifact identity before patching app logic.
- A preview APK, Play internal build, and production Play install can carry different signing assumptions. Name the artifact and signing source in every handoff.
- Browser OAuth can look close enough to work on one platform while being the wrong abstraction for native Android.
- Rebuild boundaries matter. Native plugins, capabilities, URL schemes, provider files, and build-time env vars are not fixed by a JS reload.
- Env-name drift can block the auth fix before the auth code runs. Treat build-install failures separately from provider-auth failures.
- Observability needs to be added before the final mystery test, not after the user reports "it failed."
- Real-device/account testing is part of the implementation, not a nice-to-have QA footnote.

## Release Handoff

- State whether the change needs a native rebuild, store submission, provider-console update, EAS env update, backend deploy, or JS update only.
- For store releases, invoke `mobile-store-release` when build, submit, credential, or track status matters.
- For manual QA handoff, invoke `qa-handoff`; for proof after implementation, invoke `verification`.
- For React Native or Expo implementation details, invoke `react-native`.
- For Sentry SDK setup or missing mobile observability, invoke the relevant Sentry skill.
- Monitor provider-specific failures, backend token-verification failures, sign-in conversion, and platform/build-specific regressions after release.

## Final Report

Include:

- Sources read: docs, threads/reports, code paths, provider console or store states.
- In scope: platforms, providers, build profiles, backend endpoints, and tests touched.
- Out of scope: live consoles, unavailable devices, unqueried telemetry, skipped providers, or unchanged platforms.
- Changed files and why.
- Provider-console and env values checked by name only, never secret values.
- Verification: automated checks, build IDs, artifact links, real-device/account QA, and logs/telemetry.
- Remaining risk: any platform, signing identity, account type, or store artifact not yet proven.
