---
name: mobile-app-infra
description: Expo and React Native mobile infrastructure across Metro and local API ports, native social sign-in, in-app purchases and entitlement verification, and EAS/App Store/Google Play releases, credentials, submissions, and status.
---

Load only the references needed for the request:

- `references/dev-ports.md` for Metro, dev-client, automation reload, and local API port failures.
- `references/social-sign-in.md` for Google, Apple, OAuth, provider-console identity, backend token verification, and signed-artifact diagnosis.
- `references/in-app-payments.md` for native purchases, backend verification, entitlements, completion, refunds, and purchase QA.
- `references/store-release.md` for EAS builds, submissions, store readiness, credentials, review state, and release handoff.
- `references/store-credential-intake.md` when store credential files or values are missing.
- `references/store-expo-eas-release.md` for the detailed Expo/EAS release sequence.
- `references/store-status-apis.md` for read-only EAS, Google Play, and App Store Connect status checks.

When branches overlap, load each relevant reference and keep one shared artifact, identity, environment, and release-state map. Use current primary provider documentation before changing unstable APIs, policies, or console behavior.

Run `scripts/mobile-store-status.ts` only for read-only release/status checks. Never print tokens, private keys, service-account JSON, signed purchase payloads, or private account data.
