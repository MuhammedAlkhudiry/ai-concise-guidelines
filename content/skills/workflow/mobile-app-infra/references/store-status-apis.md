# Store Status

Run `scripts/mobile-store-status.ts --help` and use its current interface for release and status checks.

- EAS proves build and upload progress; store APIs prove review, rollout, and availability.
- Keep project, artifact, signing identity, native version, track, processing, review, rollout, and availability distinct.
- The Google Play status check creates a temporary uncommitted edit to read track state and must delete it afterward; never commit it.
- Never infer `live` from a build, upload, successful API request, or configured rollout.
- Never automate App Store Connect through a browser. For other stores, use browser control only when an API cannot handle the blocker and fresh user intent is not required.
