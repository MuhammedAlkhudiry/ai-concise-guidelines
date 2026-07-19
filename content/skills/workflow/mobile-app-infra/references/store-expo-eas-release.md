# Expo/EAS Store Release

Use the project as the source of truth for its release contract: agent instructions, release docs, package scripts, Expo config, `eas.json`, verification checklist, and store metadata. Use `eas --help` and the relevant subcommand help for installed CLI syntax. Use current store documentation, API schemas, and live account state for mutable policies, fields, and review flows.

## Discovery

Before changing or submitting anything, establish:

- target branch and local-change state;
- user-facing version, native build numbers, configured version source, and bump rule;
- build/submit profiles and the existing project release command;
- Android package, Play track, iOS bundle ID, and App Store Connect app;
- the artifact and signing identities users will actually receive;
- required project verification and any release notes or metadata.

Use $service-access for missing EAS, Google Play, App Store Connect, Google Cloud, or Sign in with Apple access.

## Release Contract

1. Run the project-owned verification and report skipped or inconclusive checks.
2. Change versions only according to the discovered project strategy. Do not manually change remotely managed native build numbers.
3. Use the existing project build/submission path and capture artifact IDs, native build numbers, submit IDs, links, and timestamps.
4. Verify upload and review state from EAS and each store's live data. Do not create a duplicate submission merely to obtain status.
5. If the artifact already exists in a store, promote or attach it through the supported store path rather than re-uploading the same native build.
6. For signing-sensitive social-login failures, compare the installed artifact's signing fingerprint with the provider client registered for that package.
7. Pause before irreversible review, rollout, or live-release actions unless the user has already authorized that exact scope.

Keep these states distinct:

- `built`: a binary artifact exists;
- `submitted`: the artifact was uploaded to a store;
- `in review`: the store accepted the release into review;
- `live`: the store explicitly reports availability to users.

Stop for rebuild requirements, signing/provisioning failures, version conflicts, policy rejection, or product decisions about rollout, compliance, pricing, privacy, or availability. Hand off the exact manual action when a required store operation is unavailable through authorized APIs.
