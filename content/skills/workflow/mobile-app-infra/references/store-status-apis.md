# Store Status APIs

Use store APIs for repeatable read-only checks and $service-access for authentication or credential repair.

Run `scripts/mobile-store-status.ts --help` for the current script interface. The script's output and source own its accepted arguments, environment inputs, and returned fields. Use installed `eas` help plus current Google Play and App Store Connect API schemas when additional detail is needed; do not reproduce their command or field catalogs here.

## Evidence Contract

- EAS proves build and upload progress, not store review or availability.
- Google Play and App Store Connect live state prove their respective review and release stages.
- Keep project identity, artifact identity, native version, track, rollout, processing, review, and availability distinct in the report.
- For Android signing-sensitive bugs, compare the identity of the Play-delivered artifact—not only the upload key—with provider configuration.
- Do not create or commit a temporary Google Play edit during a read-only check.
- Do not infer `live` from a successful build, upload, completed API request, or configured rollout alone.

Use browser or computer control only for a non-Apple store blocker that the available API cannot handle, such as interactive authentication, legal/account forms, API-unsupported review UI, or a final confirmation requiring fresh user intent. Never automate App Store Connect through a browser.
