# Mobile In-App Payments

Implement, diagnose, and release native mobile purchases across the client, store consoles, backend verification, entitlement activation, refunds, QA, and operations.

## Contents

- Current sources and purchase contract
- Implementation workflow and invariants
- Client and backend contracts
- Platform completion and provider checks
- Refunds, diagnosis, evidence, and completion

## Current Sources

Read current primary documentation for every affected surface:

- Expo in-app purchases: `https://docs.expo.dev/guides/in-app-purchases/`
- Expo IAP: `https://hyochan.github.io/expo-iap/`
- Apple App Store Server API: `https://developer.apple.com/documentation/appstoreserverapi`
- Apple purchase setup: `https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/overview-for-configuring-in-app-purchases`
- Google Play Billing: `https://developer.android.com/google/play/billing/integrate`
- Google Play Developer API: `https://developer.android.com/google/play/developer-api`
- Google Play Voided Purchases: `https://developers.google.com/android-publisher/voided-purchases`
- App Store Review Guidelines: `https://developer.apple.com/app-store/review/guidelines/`
- Google Play payments policy: `https://support.google.com/googleplay/android-developer/answer/9858738`

Store APIs, policies, library contracts, and product states change. Re-check them instead of treating this reference as a versioned API specification.

## Purchase Contract

Classify the product before coding:

- Consumable: repeatable value such as credits; must become purchasable again after processing.
- Non-consumable: durable one-time entitlement with restore behavior.
- Subscription: renewable lifecycle with expiry, grace, billing retry, cancellation, and server notifications.
- Physical-world goods or services: may require an external payment path rather than store billing; verify current policy and storefront rules.

Define one concrete contract per product:

| Decision | Required answer |
| --- | --- |
| Product identity | Internal product plus iOS and Android store IDs. |
| Grant | Exact entitlement, quantity, account or tenant, and eligibility rules. |
| Authority | Backend entitlement/ledger state; never mobile local state or client-supplied price. |
| Idempotency | Provider-scoped transaction ID or purchase token that can grant once. |
| Completion owner | One client or backend path for finish, consume, or acknowledge. |
| Restore/reconcile | How missed, pending, durable, and cross-device purchases recover. |
| Refund/revocation | Detection, reversal policy, audit trail, and support fallback. |

## Workflow

1. Inventory platforms, product types, IAP library and native plugins, store IDs and states, agreements, backend endpoints, verifier credentials, entitlement code, completion owner, refund handling, tests, logs, and release path.
2. Trace the entire flow: catalog response, store product fetch, purchase result, backend payload, provider verification, app/product/account checks, idempotent grant, store completion, entitlement refresh, and refund reconciliation.
3. Align the product catalog, store-console products, and mobile-visible IDs. Hide products that are inactive, unmapped for the platform, unavailable for rollout, or unsupported by the client.
4. Build server verification and idempotent activation before treating the purchase button as complete.
5. Add redacted stage evidence before the final sandbox test.
6. Rebuild when IAP libraries, config plugins, app IDs, capabilities, native modules, service files, or build-time configuration change. Expo IAP libraries require a development or store build; Expo Go cannot prove native purchases.
7. Prove one real sandbox purchase per changed platform on the signed artifact users will run, including backend grant, completion, restart persistence, and repeat purchase or restore where applicable.
8. Establish refund/revocation handling before launch, or document the explicit manual-support policy and owner.
9. Hand off store states, product IDs, backend environment, build IDs, purchase evidence, refund coverage, operational commands, and unproven risks.

## Durable Invariants

- A provider transaction or purchase token grants value at most once.
- The same purchase cannot grant across accounts or tenants.
- A retry for the same account returns the existing payment and entitlement without re-granting.
- Entitlement activation and store completion can recover independently.
- Only a provider-verified, completed purchase state can grant value; pending purchases wait.
- Server product mapping determines the entitlement. Client price, label, package ID, or quantity is not authority.
- Payment, entitlement, completion, refund, and reversal history remains auditable.
- Refund reversal is idempotent and never removes value twice.

Keep separate records or concepts for product mapping, provider purchase, entitlement/ledger mutation, completion state, and refund/revocation. A compact schema is fine if it preserves those contracts.

## Client Contract

- Fetch only platform-appropriate IDs returned by the backend, then use store metadata for display and availability.
- Prevent duplicate taps and process pending or owned purchases when the app resumes.
- Send the exact provider evidence required by the backend: platform, store product ID, Apple transaction ID or signed transaction, and Android purchase token. Send internal package or offer IDs only as consistency checks.
- Separate user cancellation from actionable failures.
- Refresh entitlement only after backend activation succeeds.
- Never log raw purchase tokens, signed JWS payloads, credentials, private keys, authorization headers, or full provider responses.

For an Android consumable reported as already owned, query owned purchases and submit the existing token through the normal idempotent backend path. Do not grant manually or start a second completion path.

## Backend Contract

1. Validate the request boundary and authenticated account or tenant.
2. Resolve the active product by platform store ID.
3. Verify with Apple or Google using maintained server libraries or the current official API.
4. Confirm app identity, product ID, purchase state, and revocation/expiry data appropriate to the product type.
5. Lock or constrain the provider-scoped idempotency key and account ownership.
6. Create the payment and apply the entitlement in one transaction.
7. Complete the store transaction through the chosen owner.
8. Persist completion separately so a post-grant failure can retry without granting again.
9. Return a stable payment/entitlement identifier and updated state or a clear refetch signal.

### Platform completion

- Google Play consumable: consume after durable grant so it can be purchased again. Treat any documented successful 2xx response, including `204 No Content`, as success.
- Google Play non-consumable or subscription: acknowledge after durable grant when required. Do not acknowledge while pending.
- Apple StoreKit: the client code path that owns the transaction finishes it after durable backend grant. Server API verification and notifications do not replace local transaction handling.
- Subscription: use subscription-specific APIs and notifications; model renewal, expiry, grace, billing retry, cancellation, replacement, and restore instead of reusing consumable logic.

Google recommends secure-backend verification and timely acknowledgement or consumption after granting entitlement. Reconcile purchases when the app starts or resumes and use server notifications when the product needs lifecycle updates while the app is offline.

## Provider Checks

### Apple

- Bundle ID, environment, issuer ID, key ID, and App Store Server API private key are present in the backend environment.
- Apple-signed transaction data matches the transaction, product, and app being granted.
- Sandbox and production calls use the appropriate environment and fallback behavior from current Apple guidance.
- Revoked transactions do not create a new grant.
- App Store Connect agreements, tax/banking, product availability, tester, and review state support the intended test or launch.

### Google Play

- Package name, service-account credentials, Android Publisher API access, and Play Console permissions match the app.
- Purchase-token lookup matches package, product, purchase state, and the server product mapping.
- Pending purchases do not grant.
- The completion owner consumes or acknowledges after the durable grant.
- Play payments profile, product activation, country availability, test track, and license testers support the intended test or launch.

## Refunds And Revocations

Treat refund handling as part of the payment contract.

- Google Play: use current Real-time Developer Notifications, purchase APIs, and Voided Purchases as appropriate to the product and revocation policy.
- Apple: use App Store Server Notifications and signed transaction revocation/refund data, with periodic reconciliation when needed.
- Reverse exactly what the original purchase granted. Prefer compensating ledger entries or explicit revocation state over deleting history.
- Lock the payment/entitlement during reversal and persist source, reason, provider reference, detection time, reversal status, and safe metadata.
- When historical product/account data is insufficient, record the refund, skip unsafe automatic reversal, and notify support.
- Provide dry-run and targeted filters for operational reconciliation when a command or job scans multiple purchases.

Operational results should distinguish `would_reverse`, `reversed`, `already_handled`, `not_refunded`, `unmatched`, and `manual_review`. Run the same target twice to prove idempotency.

## Diagnosis

| Symptom | Check first |
| --- | --- |
| Product missing | Store state, exact platform ID, country/tester availability, app identity, and stale backend catalog entries. |
| Purchase succeeds; backend rejects | Request shape, product mapping, verifier configuration, app identity, environment, and provider purchase state. |
| Android consumable is already owned | Existing purchase token, prior grant, consume result, and persisted completion marker. |
| Value granted but API failed | Existing entitlement plus a completion failure after activation; retry completion only. |
| Duplicate value after retry | Provider-scoped unique key, account ownership, transaction boundary, and retry branch. |
| Wrong product or quantity granted | Client package/price trusted instead of verified store ID and server mapping. |
| Sandbox passes; production fails | Signed artifact identity, store approval, backend environment, credentials, agreements, and rollout state. |
| Refund exists; entitlement remains | Notification/reconciliation coverage, purchase matching, reversal policy, and sync output. |

## Evidence And Completion

Record safe evidence for these stages: catalog, store fetch, purchase request/result, backend validation, mapping, provider verification, activation, completion, entitlement refresh, and refund/reversal. Include platform, store product ID, internal payment/entitlement ID, stage, safe provider status, app version, build number, release, and distribution.

Before saying done, prove:

- Focused contract tests for mapping, provider failure, account ownership, idempotency, pending state, completion retry, and refund reversal.
- A real signed iOS sandbox purchase when iOS changed.
- A real signed Android test purchase when Android changed.
- Entitlement appears only after verification and survives restart.
- Consumables can be purchased again; durable products restore or reconcile as designed.
- Failure and refund paths are observable without exposing secrets.

Route or device automation can prove navigation and catalog UI, but not a store sale, backend verifier, durable grant, or completion. Load `references/store-release.md` for build, submission, credential, track, and store-status work. Compare a custom verifier with a purchase platform such as RevenueCat when subscriptions, cross-platform entitlements, notifications, analytics, experiments, or support tooling would otherwise dominate the system.
