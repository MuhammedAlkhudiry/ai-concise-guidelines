# Mobile Social Sign-In

Implement, diagnose, and release mobile provider sign-in across the app, provider console, backend, build system, and signed artifacts.

## Contents

- Current sources and workflow
- Provider identity contracts
- Google and Apple details
- Backend, build, and observability boundaries
- Diagnosis and completion proof

## Current Sources

Read the official docs for every affected provider and runtime before changing the contract:

- Expo Google authentication: `https://docs.expo.dev/guides/google-authentication/`
- Expo AuthSession: `https://docs.expo.dev/versions/latest/sdk/auth-session/`
- Expo AppleAuthentication: `https://docs.expo.dev/versions/latest/sdk/apple-authentication/`
- Expo EAS environment variables: `https://docs.expo.dev/eas/environment-variables/`
- Google backend ID-token verification: `https://developers.google.com/identity/sign-in/android/backend-auth`
- Apple authentication: `https://developer.apple.com/documentation/signinwithapple/authenticating-users-with-sign-in-with-apple`
- Apple capabilities: `https://developer.apple.com/help/account/identifiers/enable-app-capabilities/`
- App Store Review Guidelines: `https://developer.apple.com/app-store/review/guidelines/`

## Workflow

1. Inventory platforms, providers, auth libraries, Expo plugins, app IDs, build profiles, backend exchange endpoints, account-linking rules, tests, CI/EAS inputs, observability, and release path.
2. Choose a supported flow per platform. For Google in Expo, compare the current native Credential Manager-capable libraries with the established project library. Use AuthSession only for an intentional browser OAuth flow with an explicit redirect contract.
3. Trace the complete path: button, provider configuration, prompt, cancel/error/result, credential or ID token, backend exchange, server verification, account lookup/linking, app session, persistence, sign-out, deletion, and credential revocation.
4. Identify the exact artifact and signing identity being diagnosed. Local debug, EAS/upload, Play-signed, TestFlight, and production artifacts can have different provider identities.
5. Confirm provider-console configuration before changing code: package/bundle ID, OAuth client, signing fingerprint, URL scheme, capability, service file, web/server audience, and allowed redirect.
6. Fix the broken boundary first. A console-only identity mismatch does not justify rewriting the app flow.
7. Update app, backend, provider config, tests, and documentation together when the contract changes.
8. Add redacted evidence at each opaque boundary before the final device test.
9. Rebuild when native dependencies, config plugins, app IDs, URL schemes, entitlements, capabilities, profiles, signing, service files, or build-time configuration change.
10. Verify every changed provider on the signed iOS and Android artifacts users will run. Provider UI opening is not success; the backend must establish and persist the app session.
11. Report build/provider changes, console values checked by name, artifacts tested, proof collected, manual gaps, and post-release monitoring.

## Identity Contracts

| Surface | Required identity | Typical mismatch |
| --- | --- | --- |
| Google Android | Package ID plus the signing certificate fingerprint for the installed artifact | Debug or upload-key OAuth client is tested against a Play app-signing artifact. |
| Google iOS | Bundle ID, iOS client, and redirect URL scheme or provider config | Native prompt completes but redirect fails. |
| Google backend | Web/server client audience and verified Google ID-token claims | Client sends an access token or backend accepts the wrong audience. |
| Apple app | Bundle ID, team, Sign in with Apple capability, entitlement, and provisioning profile | Capability changed without rebuilding or refreshing the profile. |
| Apple backend | Apple token signature, issuer, audience, expiry, nonce when used, and provider subject | Email or profile fields are trusted as identity. |
| Expo/EAS | Plugin configuration, app IDs, schemes, profile environment, and required service files | Local configuration exists but the remote build receives a different value or file. |

### Google

- Follow the current Expo/provider recommendation rather than assuming the legacy Google Sign-In SDK is the target. Current native options may use Android Credential Manager and require a development build.
- Register every signing context that will run the app. Play-delivered apps use the Play app-signing certificate, not the upload certificate used before Play re-signs the bundle.
- Keep Android, iOS, and web/server OAuth clients distinct. The mobile client proves app identity; the web/server client is commonly the ID-token audience verified by the backend.
- `DEVELOPER_ERROR` or code `10` before a backend request usually points to package, fingerprint, client, or Google-project mismatch.
- Provider config files must match the app IDs, OAuth project, and build profile. Ensure remote builds receive them through the project-approved path.

### Apple

- Confirm the app identifier, team, capability, entitlement, and provisioning profile for the exact bundle ID.
- Capability changes require profile synchronization and a rebuilt binary.
- Use the Apple user identifier as provider identity. Name is normally delivered only on the first authorization; email can be relayed or absent for some managed accounts.
- Verify current App Review requirements when the app offers another third-party login as a primary account path.
- Treat provider credential revocation and local account deletion as separate contracts.

## Backend Contract

- Send verifiable credentials to the backend over HTTPS; never authenticate from a plain provider user ID.
- Verify signature, issuer, audience, expiry, and provider-specific claims with a maintained library.
- Use the verified provider subject as the durable identity key. Do not link by email alone.
- Make account linking explicit:
  - Existing provider identity: sign in that account.
  - Verified email matches an account without this provider: link only under approved product policy.
  - Conflicting identity: return a recoverable collision error.
  - New verified identity: create the account through normal domain rules.
- Store provider access or refresh tokens only when the product needs provider API access.
- Cover valid, expired, wrong-audience, wrong-issuer, missing-token, new-account, returning-account, collision, revoked-account, cancel, and retry behavior.

## Build And Observability Boundary

Client IDs and service configuration embedded in the app are public configuration even when delivered by a secret store. Keep client secrets, raw tokens, authorization codes, private keys, and backend credentials out of client code and logs.

Record safe fields around button, SDK, credential, backend, and session stages:

- Provider and platform.
- Build profile, app version, build number, release, and distribution.
- Stage and status: success, cancel, expected error, or unexpected error.
- Provider-safe error code.
- Presence, never value, of the expected credential.

Separate dependency-install or remote-build failures from provider-auth failures. Fix the build pipeline before diagnosing a flow that never reached a runnable artifact.

## Diagnosis

| Symptom | Check first |
| --- | --- |
| Android fails before backend; iOS works | Installed artifact source, package ID, OAuth client project, and signing fingerprint. |
| Native UI opens; backend rejects | Credential type, audience, issuer, expiry, and backend accepted-client configuration. |
| Debug works; Play build fails | Debug/upload certificate versus Play app-signing certificate and profile-specific config. |
| Local build works; EAS build fails | Build-profile environment, service-file delivery, install logs, and config resolution. |
| iOS redirect fails after Google prompt | Bundle ID, iOS client, URL scheme, and plugin output. |
| Apple unavailable in a signed build | Capability, entitlement, provisioning profile, and rebuilt artifact. |
| Email missing or duplicate accounts appear | Provider subject ownership, first-login-only profile data, relay email, and linking policy. |
| Button appears inert | In-flight state plus breadcrumbs for button, SDK result, credential, and backend exchange. |

## Completion

Do not claim end-to-end success from CI, Expo Go, browser callback, simulator-only checks, or one platform passing. Capture:

- Signed artifact/build ID and signing source.
- Real provider account completing the prompt.
- Backend credential acceptance and account decision.
- Authenticated app screen and persisted session after restart when expected.
- Cancel, provider failure, backend rejection, collision, sign-out, and retry behavior.
- Logs that distinguish SDK, credential, backend, and session failures without exposing secrets.

Load `references/store-release.md` when build, submission, credential, track, or store state matters. Final reporting must separate verified platforms and identities from untested artifacts or unavailable consoles.
