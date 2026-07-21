# Social Sign-In

Use current primary documentation for each provider and runtime.

## Workflow

1. Map the provider, platform, auth library, app identifier, build profile, backend exchange, account-linking policy, and exact signed artifact under test.
2. Trace the complete contract from the button through provider result, backend verification, account decision, app session, persistence, sign-out, deletion, and revocation.
3. Match provider-console identity to the artifact users run:
   - Google Android: package plus the installed artifact's signing certificate, including Play app signing.
   - Google iOS: bundle, iOS client, and redirect scheme.
   - Google backend: verified token issuer and server audience.
   - Apple: bundle, team, capability, entitlement, provisioning profile, and verified provider subject.
4. Fix the broken boundary before changing the flow. Rebuild after native dependency, plugin, identifier, capability, entitlement, profile, signing, service-file, or build-time configuration changes.
5. Verify each changed provider on the signed artifacts users receive. Provider UI opening is insufficient; prove backend acceptance, account selection or linking, persisted app session, cancellation, rejection, collision, sign-out, and retry.

## Invariants

- Authenticate with provider-verifiable credentials, never a client-supplied provider user ID.
- Use the verified provider subject as durable identity; do not link accounts by email alone.
- Keep mobile, server, debug, upload, store-signing, and production identities distinct.
- Log stages and safe error codes, never raw credentials or tokens.
