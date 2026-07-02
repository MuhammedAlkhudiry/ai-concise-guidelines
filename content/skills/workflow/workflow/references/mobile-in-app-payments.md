# Mobile In-App Payments

Implement, debug, and release native mobile in-app purchases across the app, store consoles, backend verification, entitlement activation, refund handling, QA, and release operations.

## When To Use

Use this workflow for Expo or React Native App Store / Google Play purchases; `expo-iap` or React Native IAP work; product/SKU fetching bugs; purchase verification, consume, acknowledge, or finish bugs; backend payment activation; store-console product/agreement/tax/service-account setup; sandbox or production purchase QA; `already owned` Android errors; post-purchase `422` errors; refunds; and release handoffs where mobile IAP must be proven on iOS and Android.

## Start Here

1. Inventory the full payment contract before changing code: product type, platforms, IAP library, Expo plugins/native dependencies, store product IDs, store-console status, agreements, tax/payment profile, backend endpoints, verifier credentials, entitlement service, idempotency key, completion owner, tests, logs, and release path.
2. Read current primary docs for the runtime and stores before changing behavior. Include Expo/IAP library docs, Apple App Store Server API, App Store Connect IAP/product status docs, Google Play Billing, Google Play Developer API, and store review/payment policy docs when those surfaces are involved.
3. Classify the purchase type first: consumable, non-consumable, subscription, entitlement, credit, or physical-world payment. The completion, refund, restore, and entitlement rules differ.
4. Trace the complete contract: package/product API, client product fetch, purchase request, native purchase result, backend payload, server verification, product/app identity checks, amount or entitlement checks, idempotent activation, consume/acknowledge/finish, latest entitlement refresh, refund/revocation handling, and monitoring.
5. Choose exactly one completion owner for each platform and product type. For example, a backend can own Google Play consumable consume, while an iOS client may finish a consumable only after backend verification succeeds.
6. Keep product catalog, backend mapping, store-console products, and mobile-visible product IDs aligned. Remove stale or unapproved product IDs from the API before asking the client to fetch them.
7. Add stage-specific, redacted observability before the final mystery test.
8. Rebuild any native binary affected by IAP libraries, Expo config plugins, package or bundle IDs, entitlements/capabilities, storekit/play billing configuration, native modules, service files, or build-time env vars.
9. Verify on the signed artifact users will run. Route E2E, simulator checks, CI, Expo Go, and store product fetches are not proof that real money or sandbox money activates the entitlement.
10. Hand off release impact clearly: platforms, product IDs, build profiles, backend env, store-console states, sandbox/production artifacts, purchase proof, refunds/revocations, and remaining manual checks.

## Source Check

Re-read current primary docs when implementing or debugging:

- Expo in-app purchases: `https://docs.expo.dev/guides/in-app-purchases/`
- Expo IAP library docs: `https://hyochan.github.io/expo-iap/`
- Apple App Store Server API: `https://developer.apple.com/documentation/appstoreserverapi`
- Apple Get Transaction Info: `https://developer.apple.com/documentation/appstoreserverapi/get-transaction-info`
- Apple in-app purchase setup: `https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/overview-for-configuring-in-app-purchases`
- Google Play Billing integration: `https://developer.android.com/google/play/billing/integrate`
- Google Play Developer API: `https://developer.android.com/google/play/developer-api`
- Google Play products get: `https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.products/get`
- Google Play products consume: `https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.products/consume`
- Google Play orders/refunds: `https://support.google.com/googleplay/android-developer/answer/2741495`
- Google Play Voided Purchases API: `https://developers.google.com/android-publisher/voided-purchases`
- Google Play voided purchases list endpoint: `https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.voidedpurchases/list`
- App Store Review Guidelines: `https://developer.apple.com/app-store/review/guidelines/`
- Google Play payments policy: `https://support.google.com/googleplay/android-developer/answer/9858738`

## Fresh Project Kickoff

Before coding, produce a one-page IAP contract. It should answer these questions in concrete terms:

| Question | Decision |
| --- | --- |
| What is being sold? | Consumable, non-consumable, subscription, credit pack, quota increase, or entitlement. |
| Is it digital? | If it unlocks digital content/features in the app, App Store / Google Play billing usually applies. Physical-world goods or services may need external payment instead. |
| Who can buy it? | User, team admin, tenant owner, family admin, anonymous user, or guest. |
| What changes after purchase? | Entitlement row, subscription state, credit ledger, quota capacity, feature flag, plan tier, or access period. |
| Can it be bought more than once? | Repeatable consumable versus one-time entitlement. |
| Can it be restored? | Restore purchases for durable entitlements/subscriptions; consumable restore usually means server ledger/history, not store restore. |
| What is the source of truth? | Backend entitlement/payment tables, not mobile local state. |
| What is the idempotency key? | Provider-scoped transaction/order/token key. |
| Who completes the store transaction? | Client or backend by platform/product type. |
| What happens on refund/revocation? | Keep value, remove value, create negative ledger entry, reduce capacity, cancel subscription, or manual support review. |

Minimum kickoff artifacts:

- Product matrix with one row per product: internal product ID, product type, entitlement, price, currency, App Store product ID, Play product ID, availability, and current store-console status.
- Backend contract: endpoints, auth/permissions, request shape, response shape, error shape, idempotency behavior, and entitlement mutation.
- Completion contract: iOS finish path, Android consume/acknowledge path, retry path, and partial-failure handling.
- Store-readiness checklist: Apple agreements/tax/banking, Google payments/tax/profile, service accounts/API keys, sandbox/test accounts, and country availability.
- QA plan: route/surface E2E, real sandbox purchase on iOS, real sandbox purchase on Android, retry/owned purchase, refund/revocation, and production smoke.
- Release plan: backend deploy order, mobile build profiles, store submission, feature flag or product visibility strategy, refund sync schedule or manual runbook, monitoring, and rollback/support actions.

## Implementation Recipe

Use this sequence for a new implementation unless the project already has a stronger local pattern:

1. Define product and entitlement tables first.
2. Add store product IDs to the product catalog, with separate iOS and Android columns or a normalized provider-product table.
3. Build read APIs before purchase APIs: current entitlement/limits, mobile-visible products, and latest purchase/receipt if the app needs it.
4. Hide products that are inactive, web-only, not approved, not mapped for the current platform, or unsafe to expose during rollout.
5. Add the purchase verification endpoint with strict validation and redacted stage logs.
6. Implement provider verifiers behind an interface so tests can fake store success/failure without hitting Apple or Google.
7. Implement domain activation in a transaction, including idempotency and account/tenant ownership checks.
8. Implement completion after activation, with a durable completion marker when completion can fail independently.
9. Add client product fetch, purchase request, pending purchase processing, backend verification, and platform-specific finish behavior.
10. Add recoverable client handling for user cancel, pending purchase, Android `already owned`, missing product IDs, backend validation messages, and network retry.
11. Add refund detection and entitlement reversal before real users can buy, or explicitly document why the first release is manual-support only.
12. Add focused backend and mobile tests before attempting real sandbox purchases.
13. Configure store consoles and backend env for sandbox, then prove one real purchase per platform.
14. Switch production backend env and store products only after sandbox proof and release readiness are complete.
15. Capture a support/refund runbook before real users can buy.

Do not start with the native purchase button. A button that opens a store sheet is the easy part; the durable system is product mapping, backend verification, idempotent activation, completion, refunds, and observability.

## System Map

| Surface | Verify | Common Failure |
| --- | --- | --- |
| Product model | Consumable, non-consumable, subscription, credit pack, entitlement, refund/revoke behavior | Treating repeatable consumables like permanent entitlements, or finishing purchases before durable activation. |
| Store catalog | Product IDs, type, price/currency, approval status, country availability, sandbox availability | Client fetches every backend product ID, so a deleted/unapproved SKU appears as missing products or "SKU not found." |
| Store agreements | Apple Paid Apps Agreement, banking/tax, Google payments profile, merchant/tax forms, fee-tier enrollment | Code is healthy but stores will not sell or expose products. |
| Mobile runtime | IAP library, native plugin, build profile, package/bundle ID, dev client support | JS reload is tested against a binary that does not include the native IAP module/config. |
| Client purchase flow | Product fetch, purchase request, pending/available purchases, duplicate taps, user cancel, retry behavior | Store sheet succeeds but the app loses the purchase, retries duplicate prompts, or treats recoverable errors as fatal. |
| Backend request | Platform, product ID, transaction ID, purchase token, optional package/offer ID | Generic `422` hides whether validation, mapping, verifier config, activation, or completion failed. |
| Product resolver | Store product ID maps to an active/mobile-visible product, optional selected package matches | Client-supplied package ID is trusted over store product ID, allowing mismatched activation. |
| App Store verifier | Bundle ID, environment, issuer ID, key ID, `.p8` private key, transaction ID, product ID, revocation | Purchase succeeds in StoreKit, then backend `422`s because App Store Server API env is missing or wrong. |
| Google Play verifier | Package name, service account JSON, Android Publisher API access, product ID, purchase token, purchase state | Purchase succeeds in Play, then backend cannot verify/consume; later attempts show `already owned`. |
| Activation | Idempotency key, amount/entitlement match, tenant/account ownership, transaction boundaries | User is granted twice, wrong tenant gets the entitlement, or a retry is blocked after value was already granted. |
| Completion | iOS finish, Android consume/acknowledge, store completion marker, retry after partial failure | Google consume returns `204 No Content` and is falsely treated as failure; Android remains owned because consume never happened. |
| Refunds/revocations | Store refund path, voided purchases, App Store revocation, entitlement removal policy | Money is refunded but app entitlement remains, or a user loses entitlement without an audit trail. |
| Observability | Stage logs, platform/product/build tags, redacted token presence, invoice/entitlement IDs | Every incident becomes "payment failed" with no clue which boundary failed. |
| QA artifact | Dev client, TestFlight, Play internal, production, sandbox account, signed artifact identity | A route check or simulator pass is reported as IAP success without a real store purchase and backend activation. |

## Store Console Readiness

- Apple:
  - Paid Apps Agreement, banking, tax, bundle ID, in-app products, product type, price tier, localization, review status, sandbox testers, and App Store Server API key.
  - Product IDs must match the app's bundle and backend mapping exactly.
  - Sandbox verification usually needs the backend pointed at sandbox; production must use production.
  - Consumable refund/revocation behavior is not the same as a subscription status flow; decide whether and how the app removes granted value.
- Google Play:
  - Payments profile, tax forms, country availability, app package name, in-app products, active products, license/test accounts, service account, Android Publisher API access, and order/refund access.
  - Service-account JSON must be available to production backend, not only local shells or CI.
  - Consumable products must be consumed after durable grant so the user can buy them again.
  - Refund and access revocation are separate concerns; use Play Console/API plus backend entitlement cleanup.

## Product Catalog Design

Prefer a catalog shape that makes store availability explicit:

| Field | Purpose |
| --- | --- |
| `id` | Internal product/package/plan ID. |
| `type` | `consumable`, `non_consumable`, `subscription`, `credit_pack`, `quota_pack`, etc. |
| `entitlement_key` | What the backend grants. |
| `entitlement_quantity` | Credits, quota units, seats, months, or another unit. |
| `price_minor` / `currency` | Server-side expected amount when amount checks apply. |
| `app_store_product_id` | iOS product ID, nullable when not iOS-available. |
| `play_store_product_id` | Android product ID, nullable when not Android-available. |
| `is_active` | Product can be sold somewhere. |
| `mobile_visible_at` / `store_status` | Optional rollout guard so unapproved products do not leak to clients. |
| `metadata` | Store-specific offer/base-plan IDs only if needed. |

Rules:

- Product IDs must be unique per store provider.
- Store product ID mapping should be updated through migrations/seeders/admin screens, not hard-coded inside mobile components.
- Do not expose products that are missing a product ID for the caller's platform.
- Do not expose discounted, trial, legacy, or web-only products unless the mobile flow explicitly supports them.
- Keep deleted or rejected store products out of API responses immediately. The client usually asks the store for every product ID it receives.
- Keep store display price separate from backend entitlement amount. The native product display price is for UI; backend entitlement comes from the server product row.

## API Shape

Most apps need three read paths and one write path:

| Endpoint | Purpose |
| --- | --- |
| `GET /billing/entitlement` or `/billing/limits` | Current entitlement, usage, limits, plan, credits, or subscription state. |
| `GET /billing/products` | Mobile-visible products for the current user/account/platform. |
| `GET /billing/latest-payment` or `/billing/history` | Optional support/history surface after confirmation. |
| `POST /billing/purchases` | Verify a store purchase and activate the entitlement. |

Suggested purchase payload:

```json
{
  "platform": "ios",
  "product_id": "com.example.product.100",
  "transaction_id": "2000000123456789",
  "purchase_token": null,
  "package_id": 123
}
```

Validation:

- `platform`: required, allow only supported platforms.
- `product_id`: required, string, max length.
- `transaction_id`: required for iOS when using transaction lookup.
- `purchase_token`: required for Android.
- `package_id` / `offer_id`: optional consistency guard; reject if it conflicts with the product resolved by `product_id`.

Response:

- Success should include a stable payment/entitlement ID and the updated entitlement or enough signal for the client to refetch.
- Validation errors should be localized/recoverable when possible.
- Do not return raw provider payloads to the client.

## Data Model

Use separate concepts even if the first implementation stores them in existing tables:

| Concept | Why It Exists |
| --- | --- |
| Product/package | What can be bought. |
| Store product mapping | How a product appears in App Store and Play. |
| Payment/purchase record | External provider transaction/order and accounting trail. |
| Entitlement/ledger record | What the user/account actually received. |
| Completion marker | Whether the store transaction was consumed/acknowledged/finished after grant. |
| Refund/revocation record | How access was removed or support handled a refund. |

Minimum invariants:

- A provider transaction/order/token can grant value at most once.
- A provider transaction cannot be reused across accounts/tenants.
- A retry for the same account returns the same entitlement/payment without re-granting.
- Completion can be retried independently after activation.
- Support can answer: who paid, what store/product, what was granted, whether store completion happened, and whether a refund/revocation happened.
- Refund records must preserve source, reason, provider metadata, reversal status, and admin/support notification state.
- Refund reversal must be idempotent. Running the same sync twice must not remove the entitlement twice.

## Client Contract

- Fetch only product IDs the backend says are available for the current platform and user context.
- Keep store product IDs platform-specific even when the current products happen to share a string.
- Treat store product metadata as display/availability data, not the source of entitlement truth.
- Send the backend the exact contract it needs: platform, product ID, iOS transaction ID, Android purchase token, optional package/offer ID only as a consistency guard.
- Do not trust client price, display name, package size, or entitlement amount.
- Add in-flight state so duplicate taps do not launch duplicate purchase prompts or duplicate backend mutations.
- Handle pending purchases and available/owned purchases on startup or screen entry.
- For Android consumables, treat `already owned` as recoverable when the product is intended to be repeatable: refresh available purchases, clear local retry blocks for that product's token, and send the owned token through backend verification/consume.
- For iOS consumables, finish the transaction only after backend verification and activation succeed when the client owns finishing.
- Preserve user-cancel behavior separately from real failures.
- Log breadcrumbs for product fetch, missing products, purchase requested, purchase success, purchase error, backend verification start/failure/success, and finish/consume state.

## Backend Contract

- Verify store purchases server-side before granting value. Check store signature/API response, app identity, product ID, transaction/purchase state, revocation/refund state when available, and expiry for subscriptions.
- Resolve the product by store product ID for the platform. Treat client package IDs or offer IDs as additional consistency checks, not authority.
- Use a stable idempotency key scoped by provider/platform, such as `ios:<transactionId>` or `android:<orderId-or-token>`.
- Activate entitlement in one transaction: lock the account/tenant when needed, create the payment/entitlement record, apply the entitlement, and return the existing record on retry.
- Never grant value when verification, product mapping, amount/entitlement checks, tenant/account ownership, or eligibility checks fail.
- If completion happens after activation, make retry safe:
  - Existing invoice/entitlement for the same account returns without granting again.
  - Completion/consume is retried until marked complete.
  - Completion failures do not hide that value may already have been granted.
- Keep completion semantics platform-specific:
  - Android consumables: consume after durable grant; accept all successful 2xx responses, including `204 No Content`.
  - Android non-consumables: acknowledge after durable grant when applicable.
  - iOS consumables: finish via the chosen client/server path only after durable grant.
  - Subscriptions: do not model like consumables; add status, renewal, expiration, webhook/notification, and restore handling.
- Store raw tokens and signed payloads only when there is a clear need, and mark them sensitive. Never log them.
- Return recoverable validation messages to the client, but keep sensitive provider detail in server logs.

## Provider Verification Details

### iOS App Store

Verify at least:

- Backend has bundle ID, environment, issuer ID, key ID, and private key.
- Transaction lookup hits sandbox or production according to the transaction being tested.
- Transaction ID returned by Apple matches the client transaction ID.
- Product ID matches the resolved backend product.
- Bundle ID matches the app.
- Revoked/refunded transactions do not grant new value.
- For subscriptions, original transaction ID, product ID, expiration, renewal state, grace/billing retry, and notification history are modeled separately.

Common iOS traps:

- `.p8` key is present locally but missing in production.
- Private key newlines are broken in dotenv or secret storage.
- Config cache or workers still hold old env values.
- Sandbox transaction is verified against production or production against sandbox.
- Product is not approved or the Paid Apps Agreement is not active.
- Product ID was deleted in App Store Connect but remains mobile-visible.

### Android Google Play

Verify at least:

- Backend has package name and service-account JSON.
- Service account has Android Publisher API access to the app.
- Purchase token lookup succeeds for the package/product/token.
- `purchaseState` is purchased/complete before grant.
- Product ID matches the resolved backend product.
- For consumables, consume after durable grant.
- For non-consumables, acknowledge after durable grant when required.
- For subscriptions, use the subscription-specific APIs and model expiry/renewal/state separately.

Common Android traps:

- Service-account JSON exists in CI but not production backend.
- Service account exists but lacks Play Console/API permissions.
- App package name differs by flavor/build profile.
- Backend grants value but does not consume, so repeat purchase shows `already owned`.
- Consume returns `204 No Content`; code treats only `200` as success.
- Upload key, app signing, and package identity confusion distracts from backend verifier failures.

## Refund Sync Design

Refund support is part of the payment system, not a later admin cleanup script. Decide how the app detects store refunds, how it reverses entitlement, and how support audits the result.

Recommended model:

| Piece | Purpose |
| --- | --- |
| Refund sync command/job | Pull store refund/revocation signals and apply local reversal. |
| Dry-run mode | Preview affected invoices/accounts before changing entitlements. |
| Platform filter | Run iOS, Android, or all independently during incidents. |
| Invoice/order filter | Re-check a single support case without scanning everything. |
| Lookback/window | Limit Android voided-purchase scans while allowing iOS invoice checks beyond the recent window. |
| Refund fields | Store `refunded_at`, `refund_source`, `refund_reason`, `refund_metadata`, and reversal timestamp/status. |
| Entitlement reversal | Apply a negative ledger entry, reduce quota, cancel access, or mark for manual review. |
| Admin/support notification | Surface every refund reversal or skipped reversal. |

Platform detection:

- Android: use Google Play Voided Purchases for voided/revoked orders. Match by order ID to the provider-scoped idempotency key or stored order reference. Redact purchase tokens before storing or logging metadata. A Play refund that is not revoked may not appear in Voided Purchases, so support must know whether the refund action revoked access.
- iOS: check App Store transaction information for known transactions and treat a `revocationDate` as a refund/revocation signal. Because iOS revocations can appear long after purchase, do not rely only on a short purchase-date window unless App Store Server Notifications are already wired.
- Subscriptions: prefer server notifications/webhooks plus periodic reconciliation; subscription refund and expiration behavior is not the same as consumable reversal.

Entitlement reversal:

- Reverse exactly what the original purchase granted.
- Use a transaction and lock the payment/entitlement row.
- If the original product/account is missing, mark the invoice refunded but skip automatic entitlement reversal and notify support.
- For quotas, decide whether the new limit can drop below current usage. If yes, document the product behavior; if no, mark manual review.
- For credits, prefer a negative ledger entry over editing old rows.
- For permanent entitlements, revoke access with an audit trail.
- For subscription refunds, update subscription state and access period rather than deleting history.

Operational behavior:

- Output machine-readable per-invoice results such as `would_reverse`, `reversed`, `already_refunded`, `not_refunded`, `invoice_not_found`, and `missing_entitlement_data`.
- Keep dry-run output close to real output so support can compare preview and execution.
- Do not store raw Android `purchaseToken`, Apple signed payloads, service-account JSON, OAuth tokens, or private keys in refund metadata.
- Notify admins/support when value is reversed, when an invoice cannot be matched, and when entitlement data is missing.
- Decide whether the sync runs on a schedule, after manual refund operations, or both. Manual-only sync must be written into the support runbook.

Example refund command shape:

```sh
php artisan store:refunds:sync --platform=all --since="7 days ago" --limit=100 --dry-run
php artisan store:refunds:sync --platform=android --since="30 days ago"
php artisan store:refunds:sync --platform=ios --invoice-id=123
```

Implementation behavior worth copying when it fits:

- Android refunds come from Google Play voided purchases and match `android:<orderId>`; this depends on the refund/void action being visible to the Voided Purchases API.
- iOS refunds are checked by looking up known `ios:<transactionId>` invoices and reading transaction revocation.
- Refunded invoices store source, reason, metadata, and a reversal timestamp/status.
- Quota-package refunds subtract the purchased quantity from the account limit in a transaction.
- Missing account/product data marks the invoice refunded but skips automatic reversal and sends an admin/support notification.
- Dry runs return the same shape without changing invoice or entitlement state.

## Store Setup Runbook

Before declaring store API credentials missing, look for a local project release env such as `$HOME/.config/<project>/mobile-release.env` and pass it to release/status tools with `--env`. Keep this file outside the repo, never commit it, and report credential names/paths only.

### Apple

1. Confirm Apple Developer account, app record, bundle ID, SKU, and team.
2. Accept Paid Apps Agreement and complete banking/tax.
3. Create in-app products with final product IDs and correct product type.
4. Fill price, availability, localization, review notes, and screenshots if required.
5. Create sandbox testers or confirm test accounts.
6. Create App Store Server API key and record issuer ID, key ID, and `.p8` key.
7. Add backend env names and make private key dotenv-safe.
8. Set backend `sandbox` for sandbox QA and `production` for production.
9. Rebuild native app if IAP library/config changed.
10. Prove product fetch, purchase sheet, backend verification, entitlement, finish, and restart persistence.

### Google Play

1. Confirm Play developer account, app package, app signing state, and release track.
2. Complete payments profile, tax, merchant, and country availability requirements.
3. Create in-app products with final product IDs and correct product type.
4. Activate products and assign prices/countries.
5. Add license testers and test track users.
6. Create or choose service account.
7. Grant Play Console permissions and Android Publisher API access.
8. Store service-account JSON in backend production secrets.
9. Configure backend package name and service-account JSON.
10. Rebuild native app if IAP library/config changed.
11. Prove product fetch, purchase sheet, backend verification, entitlement, consume/acknowledge, repeat purchase, and restart persistence.

## Sandbox Purchase Runbook

Before the purchase:

- Confirm the mobile artifact is the intended build profile and app version.
- Confirm backend points to the matching sandbox/production store environment.
- Confirm backend env is loaded after config cache/worker reload.
- Confirm store products are active/approved enough for the test account.
- Confirm the tester account is eligible for sandbox/license testing.
- Confirm logs and Sentry/telemetry are visible.

During the purchase:

1. Open the billing screen from a real user/account with permission to buy.
2. Confirm products and localized display prices load from the store.
3. Start a purchase for one low-risk product.
4. Complete the native store sheet.
5. Watch backend logs for request validation, mapping, verification, activation, and completion.
6. Confirm the app shows the updated entitlement only after backend success.
7. Restart the app and confirm the entitlement persists.
8. For Android consumables, attempt the same SKU again to prove consume worked.
9. Record platform, account, product ID, transaction/order ID, invoice/entitlement ID, build ID, and log links.

After the purchase:

- Clean up sandbox data only through a path that preserves evidence, or record why cleanup was safe.
- If money or sandbox quota was consumed but entitlement failed, decide retry versus refund before manually granting.

## Refund Sync Runbook

Before enabling refunds for real users:

1. Confirm invoice/payment rows store enough provider identity to match refunds later.
2. Add refund state fields or a refund ledger table.
3. Implement a dry-run mode.
4. Verify Android matching with Google Play voided purchases.
5. Verify iOS matching with transaction revocation or App Store Server Notifications.
6. Prove the entitlement reversal is idempotent.
7. Prove sensitive metadata is redacted.
8. Add admin/support notification for reversed and skipped refunds.
9. Decide schedule versus manual-only operation.
10. Document the support path for failed or partial reversals.

During operations:

1. Run dry-run first for the platform/window/invoice.
2. Compare dry-run output to store order/refund evidence.
3. Run the sync without dry-run.
4. Confirm invoice refund fields were written.
5. Confirm entitlement/ledger changed exactly once.
6. Confirm admin/support notification was sent.
7. Re-run dry-run for the same target and confirm it reports already handled or no-op.

## Debugging Runbooks

### Product Fetch Fails

1. Compare backend product IDs with store-console product IDs character by character.
2. Check product type, active/approved status, country availability, and test-account eligibility.
3. Check app package/bundle ID and build profile.
4. Check whether the client is asking for iOS IDs on Android or Android IDs on iOS.
5. Remove stale product IDs from the backend response before retrying.
6. Add a breadcrumb with requested, returned, and missing product IDs.

### Purchase Succeeds, Backend Returns `422`

1. Check whether request validation passed: platform, product ID, transaction ID, purchase token.
2. Check whether backend product mapping resolved.
3. If mapping resolved, check provider verifier config before changing client code.
4. For iOS, verify `APP_STORE_*` env, environment, bundle ID, transaction ID, and private key formatting.
5. For Android, verify `GOOGLE_PLAY_*` env, service-account JSON, package name, API access, and purchase token.
6. Check whether an entitlement/payment record was created. No record means failure before activation; a record means completion or response handling may have failed.
7. Return a recoverable client error, but do not finish/consume locally unless the contract says to.

### Android `already owned`

1. Treat it as an outstanding unconsumed consumable until proven otherwise.
2. Refresh available purchases.
3. Find the purchase token for the product.
4. Submit the existing token to backend verification/consume.
5. Check whether the backend created an invoice/entitlement already.
6. If consume failed after grant, retry completion without granting again.
7. If no grant exists and verification cannot succeed, use store order details and support/refund policy.

### Value Granted, Store Completion Failed

1. Do not grant manually again.
2. Find the payment/entitlement by provider-scoped idempotency key.
3. Retry consume/acknowledge/finish according to platform.
4. Mark completion only after provider success.
5. Keep the client response honest if completion still fails, but make the retry path safe.

### Refund Or Revocation

1. Find the store order/transaction and internal payment/entitlement.
2. Run the refund sync in dry-run mode for the platform, date window, or invoice/order.
3. Confirm the refund source: Google Play voided purchase, App Store transaction revocation, server notification, provider dashboard, or manual support action.
4. Confirm whether the refund also revokes access.
5. Apply a negative ledger entry, quota reduction, entitlement revocation, or manual-review marker rather than deleting audit records.
6. Ensure the invoice/payment is marked refunded with source, reason, metadata, and reversal status.
7. Notify support/admin if the entitlement cannot be safely reversed automatically.
8. Re-run the sync to confirm the result is idempotent and does not reverse twice.

## Configuration Matrix

| Platform | Required Backend Config | Required Store/Native Config |
| --- | --- | --- |
| iOS App Store | Bundle ID, environment, issuer ID, key ID, `.p8` private key | Bundle ID, IAP products, Paid Apps Agreement, banking/tax, sandbox testers, product approval, native IAP module. |
| Android Google Play | Package name, service-account JSON, Android Publisher API scope/access | Package name, Play app, in-app products, payments/tax profile, license testers, active products, native IAP module. |
| Expo / React Native | API base URL, Sentry/release tags, build-profile env, native plugin config | Dev client or store build with IAP module included; Expo Go is not proof for native IAP. |
| CI / EAS | Build env, file env vars, app version/build number, secrets availability | Rebuild profiles that consume changed native config or env. |

## Observability

Log or breadcrumb every opaque boundary with safe context:

- Product catalog returned by backend.
- Store product fetch requested/returned/missing.
- Purchase button pressed and native request started.
- Native purchase success, pending, cancel, and non-cancel failure.
- Backend verification request sent.
- Request validation failure.
- Package/product resolution failure.
- Store verifier configuration failure.
- Store API verification failure.
- Entitlement activation success/failure.
- Completion/consume/finish success/failure.
- Latest entitlement refreshed.
- Refund/revocation detected or manually applied.

Suggested fields:

| Field | Purpose |
| --- | --- |
| `platform` | Separate iOS, Android, and unsupported surfaces. |
| `product_id` | Find stale or mismapped SKUs quickly. |
| `package_id` / `offer_id` | Catch client selection mismatch without trusting it. |
| `has_transaction_id` | Confirm iOS payload shape without logging the transaction payload. |
| `has_purchase_token` | Confirm Android payload shape without logging the token. |
| `resolved_product_id` | Split mapping failures from verification failures. |
| `invoice_id` / `entitlement_id` | Know whether value was already granted. |
| `external_payment_id` | Idempotency key; avoid raw token if the token is secret. |
| `store_status` | Provider-safe status/code/message. |
| `stage` | request, mapping, verify, activate, complete, refresh, refund. |
| `app_version` / `build_number` | Match failures to artifacts. |
| `release` / `dist` | Link mobile and backend telemetry. |

Never log raw purchase tokens, signed transaction JWS payloads, service-account JSON, `.p8` private keys, OAuth access tokens, authorization headers, customer PII, or full store responses unless explicitly redacted and needed.

## QA Gates

- Automated tests:
  - Product API filters active/mobile-visible products and hides web-only/stale products.
  - Request validation requires iOS transaction ID and Android purchase token.
  - Product resolver maps by platform product ID and rejects mismatched package/offer IDs.
  - Store verifier checks app identity, product ID, transaction/purchase state, revocation/refund state, and config failures.
  - Activation is idempotent and cannot grant to another tenant/account.
  - Completion retry does not double grant.
  - Android consume accepts `204` and all valid 2xx responses.
  - Android `already owned` recovery submits owned purchases instead of showing a fatal error.
  - Client does not finish Android when backend owns consume, and finishes iOS only after backend success when client owns finish.
  - Refund sync dry-run, Android voided purchase reversal, iOS transaction revocation reversal, already-refunded no-op, missing entitlement data, and metadata redaction.
  - Redacted logging excludes raw tokens and secrets.
- Manual / device proof:
  - Real signed iOS artifact with a sandbox or production account.
  - Real signed Android artifact from the signing source being tested.
  - Store products fetch and display prices.
  - One purchase completes through the native sheet.
  - Backend verifies the purchase.
  - Entitlement appears in the app only after backend success.
  - App survives restart with entitlement intact.
  - Repeat purchase works for consumables.
  - Refund/revocation path is understood and tested where possible.
  - Store refund sync has been dry-run and then proven against at least one sandbox/manual refund path where the store allows it.
- Route E2E is useful but insufficient. A Maestro or Detox test that opens the billing screen proves navigation/catalog UI, not store sale, backend verifier config, consume, or entitlement activation.

## Failure Modes

| Symptom | Suspect First | Evidence To Collect |
| --- | --- | --- |
| Store product list is empty or missing one SKU | Product not approved/active/available, stale backend product ID, wrong platform product ID, agreement/tax issue | Backend catalog, requested IDs, returned IDs, store product status, country, sandbox account. |
| iOS product fetch works but backend returns `422` after purchase | Missing/wrong App Store Server API env, wrong environment, bundle mismatch, revoked transaction | `APP_STORE_*` presence by name, environment, transaction ID present, resolved package/product, verifier logs. |
| Android purchase succeeds but backend returns `422` | Missing service-account JSON, package mismatch, API access missing, purchase token invalid, pending purchase | `GOOGLE_PLAY_*` presence by name, token present, resolved package/product, Google status/code, service account permissions. |
| Android says `already owned` for a repeatable consumable | Previous purchase was not consumed because backend verification or consume failed | Available purchases, purchase token, invoice/entitlement status, consume logs, store completion marker. |
| Value granted but API still returns failure | Completion/consume failed after activation | Invoice/entitlement exists, `store_completed_at` missing, consume status, whether retry double grants. |
| Google consume returns `204` and app treats it as failure | Code accepts only `200 OK` | HTTP status, use of `ok()` versus `successful()` or equivalent. |
| Duplicate entitlement after retry | Idempotency key missing/wrong or activation not transactional | External payment ID, unique constraint, account lock, retry logs. |
| Wrong package/amount granted | Client package ID or price trusted | Product resolver, server-side product mapping, price/entitlement checks. |
| Production fails after sandbox passes | Backend environment, store product approval, signing/package identity, production credentials, tax/agreement status | Build ID, track, app version, store status, backend env cache, server logs. |
| Users paid but did not receive value | Verification/activation/completion split failed | Store order/transaction, invoice/entitlement record, logs by stage, refund/retry decision. |
| Refund issued but entitlement remains | Refund sync missing, not scheduled, failed to match invoice, or skipped reversal | Store order/transaction, refund source, invoice refund fields, entitlement/ledger state, sync output. |
| Refund sync reduces entitlement twice | Refund reversal is not idempotent | `refunded_at`, reversal timestamp/status, unique refund source/reference, transaction logs. |
| Refunded invoice has no product/account | Historical data missing or tenant/package deleted | Mark refunded, skip automatic reversal, notify support, record metadata. |

## Field Lessons

- Scope the first IAP release to the exact purchase type being shipped. Do not let web payments, unrelated credits, add-ons, or future subscriptions leak into a consumable-package workflow unless they are part of the release.
- Backend product resolution uses `product_id` as authority. `package_id` is only a consistency guard.
- Android completion can belong to the backend for consumables. In that model, the mobile client does not call Android `finishTransaction`; the backend consumes after activation.
- iOS transactions are finished by the client only after backend verification succeeds.
- A P0 deploy review caught that Android purchases could be granted without consume; the fix made completion idempotent and retryable.
- A production Android `422` plus `already owned` came from missing `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`; verification failed, so consume never ran.
- A later Android `422` came from treating Google Play consume `204 No Content` as failure after value was already granted.
- A production iOS `422` after the App Store sheet succeeded came from missing `APP_STORE_ISSUER_ID`, `APP_STORE_KEY_ID`, and `APP_STORE_PRIVATE_KEY`.
- Deleted or unapproved App Store product IDs must not remain mobile-visible; stale product IDs add noise during iOS debugging.
- The useful diagnostic ladder was redacted logs for request validation, product/package resolution, verification, activation, and completion.
- Store readiness delayed release work: Paid Apps Agreement, IAP approval, Google Play payment/tax setup, service accounts, and backend env need preflight before build day.
- Store refund sync should detect Google Play voided purchases and App Store transaction revocations, mark invoices refunded, reverse entitlement/quota capacity, support dry runs and invoice targeting, redact Android purchase tokens, and notify admins/support.
- A package evaluation should compare a custom backend verifier, framework-specific purchase packages, and external purchase platforms. Keep the custom domain activation/idempotency wrapper when the product rules are simple and domain-specific; choose an external revenue platform when subscriptions, restore flows, webhooks, analytics, experiments, and support tooling are the real product need.

## Tooling And Product Options

- Custom backend verifier is appropriate when the product has simple purchases, strong domain-specific entitlement logic, and the team needs explicit control over idempotency and activation.
- RevenueCat or a similar purchase platform can be the practical answer when subscriptions, cross-platform entitlements, restore flows, webhooks, analytics, experiments, or support tooling would otherwise dominate the project.
- Provider-specific server libraries can reduce low-level JWT/API work, but do not replace product mapping, entitlement activation, idempotency, refunds, or observability.
- For Laravel, use a third-party purchase package only if it matches the chosen client payload, current store APIs, product types, and retry/completion model. Do not adopt it just to avoid writing the domain service.

## Build Decision Matrix

| Change | Usually Needs |
| --- | --- |
| Button copy, error copy, or display-only UI | JS update or normal mobile deploy path. |
| IAP native library, Expo config plugin, package/bundle ID, entitlements/capabilities | Native rebuild and reinstall/store build. |
| Store-console product added/changed | Store product approval/activation, catalog mapping update, product fetch retest. |
| Backend verifier env changed | Backend config cache refresh/deploy, worker reload if needed, sandbox/production retest. |
| Backend accepted bundle/package/product IDs changed | Backend deploy and mobile retest; native rebuild only if app identity/config also changed. |
| Android service-account/API permissions changed | Backend retest against Play Developer API; no mobile rebuild unless app config changed. |
| App Store Server API key changed | Backend retest; ensure `.p8` env is dotenv-safe and config cache refreshed. |
| Completion owner changed | Client and backend coordinated release, regression tests, real-device purchase proof. |
| Refund/revocation behavior changed | Backend policy, admin/support docs, tests, and monitoring update. |
| Refund sync schedule or command changed | Ops runbook, dry-run proof, alerting, and support handoff update. |

## Release Handoff

- State whether the change needs a native rebuild, store submission, backend deploy, config cache refresh, worker reload, store-console update, tax/agreement update, sandbox purchase, production purchase, or JS-only update.
- Name product IDs, bundle/package IDs, build profiles, app versions/build numbers, backend env names, and store tracks by name only. Never expose secret values.
- For store releases, use `/workflow mobile-store-release` when build, submit, credential, or track status matters.
- For manual QA handoff, invoke `qa-handoff`; for focused QA suite design, invoke `qa-test-cases`.
- For React Native or Expo implementation details, invoke `react-native`.
- For Sentry SDK setup or missing mobile observability, invoke the relevant Sentry skill.
- Monitor product fetch failures, backend verification failures, activation failures, completion failures, refund/revocation events, purchase conversion, and platform/build-specific regressions.
- Include the refund sync command, dry-run command, schedule/manual cadence, and support escalation path in the release handoff.

## Final Report

Include:

- Sources read: docs, threads/reports, code paths, official docs, store-console states, and telemetry/logs.
- In scope: product types, platforms, build profiles, backend endpoints, store products, entitlement surfaces, tests, and release artifacts.
- Out of scope: subscriptions, refunds, web payments, unavailable consoles, unqueried telemetry, skipped platforms, or unchanged products.
- Changed files and why.
- Store-console and env values checked by name only, never secret values.
- Verification: automated checks, build IDs, artifact links, route E2E, real-device/account purchase proof, refund dry-run/sync proof, invoices/entitlements, and logs/telemetry.
- Remaining risk: any platform, account type, product ID, store track, signing identity, refund/revocation path, or production artifact not yet proven.
