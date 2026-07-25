---
name: mobile-app-infra
description: Expo and React Native ports, native authentication and payments, and EAS or store releases.
---

## Routing

Load only the relevant references:

- [Development ports](references/dev-ports.md) for Metro, dev-client, automation reload, and local API port failures.
- [Social sign-in](references/social-sign-in.md) for Google, Apple, OAuth, backend verification, and signed-artifact identity.
- [In-app payments](references/in-app-payments.md) for purchases, entitlements, completion, refunds, and purchase QA.
- [Store release](references/store-release.md) for EAS builds, submissions, credentials, review, rollout, and release handoff.
- [Store screenshots](references/store-screenshots.md) for App Store Connect or Google Play screenshot replacement.
- [Store status](references/store-status-apis.md) for read-only EAS, Google Play, and App Store Connect checks.

Use $service-access for auth before asking for store or identity-provider credentials.
