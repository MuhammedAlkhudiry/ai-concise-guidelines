# In-App Payments

Use current primary documentation for the purchase library, store billing, server APIs, notifications,
and payment policies.

## Contract

Define the product type, platform store IDs, exact grant, owning account or tenant, backend authority,
provider-scoped idempotency key, store-completion owner, restore path, and refund policy before coding.

## Workflow

1. Trace catalog mapping, store product fetch, purchase result, backend verification, app/product/account checks, idempotent grant, store completion, entitlement refresh, restore, and refund reconciliation.
2. Align backend catalog IDs with active store products. The backend mapping—not client price, label, package, or quantity—determines the entitlement.
3. Verify provider evidence on the backend and apply the grant transactionally before completing the store transaction.
4. Persist grant and completion state separately so a completion retry cannot grant twice.
5. Rebuild after changes to native libraries, plugins, app IDs, capabilities, service files, or build-time configuration.
6. Prove a real sandbox purchase on each changed signed platform artifact, including grant, persistence after restart, completion, repeat purchase for consumables, or restore for durable products.
7. Implement refund or revocation reconciliation before launch, or record the explicit manual policy and owner.

## Invariants

- One provider transaction or purchase token grants at most once and cannot grant across accounts or tenants.
- Only a provider-verified completed purchase grants value; pending purchases wait.
- Grant, completion, and refund recovery are independently retryable and idempotent.
- Google consumables are consumed after durable grant; non-consumables and subscriptions are acknowledged when required.
- Apple transactions are finished by the chosen owner after durable backend grant.
- Refund reversal preserves audit history and never removes value twice.
- Never log raw purchase tokens, signed payloads, credentials, authorization headers, or full provider responses.

Report product and store states, signed artifacts tested, safe stage evidence, refund coverage, and every
unproven risk. Navigation or catalog UI does not prove a store sale, backend verification, grant, or completion.
