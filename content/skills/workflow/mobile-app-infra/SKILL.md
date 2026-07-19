---
name: mobile-app-infra
description: Expo and React Native mobile infrastructure. Use for Metro or local API port failures, native social sign-in, in-app purchases and entitlements, or EAS/App Store/Google Play releases, credentials, and status.
---

## Routing

Load only the references needed for the request:

- `references/dev-ports.md` for Metro, dev-client, automation reload, and local API port failures.
- `references/social-sign-in.md` for Google, Apple, OAuth, provider-console identity, backend token verification, and signed-artifact diagnosis.
- `references/in-app-payments.md` for native purchases, backend verification, entitlements, completion, refunds, and purchase QA.
- `references/store-release.md` for EAS builds, submissions, store readiness, credentials, review state, and release handoff.
- `references/store-credential-intake.md` when store credential files or values are missing.
- `references/store-expo-eas-release.md` for the detailed Expo/EAS release sequence.
- `references/store-status-apis.md` for read-only EAS, Google Play, and App Store Connect status checks.

When branches overlap, load each relevant reference and keep one shared artifact, identity, environment, and release-state map. Use current primary provider documentation before changing unstable APIs, policies, or console behavior.

Never access App Store Connect through Chrome, browser automation, or computer control. Use App Store Connect API access; report API-unsupported actions as manual blockers for the user.
For other stores, use browser or computer control only for blockers the store API cannot handle; [store-status-apis.md](references/store-status-apis.md) owns the allowed fallback list.

Run `scripts/mobile-store-status.ts` only for read-only release/status checks. Never print tokens, private keys, service-account JSON, signed purchase payloads, or private account data.
Use $service-access to discover, verify, or repair App Store Connect, Google Play, Google Cloud, and Sign in with Apple access before asking the user for credentials.
