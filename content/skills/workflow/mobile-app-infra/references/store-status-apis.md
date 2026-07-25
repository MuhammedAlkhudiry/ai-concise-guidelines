# Store Status

Use the bundled `scripts/mobile-store-status.ts`, resolved relative to this skill directory rather than the target repository. Run it with `--help`,
then pass the project root, mobile directory, and the provider environment discovered through $service-access.

- EAS proves build and upload progress; store APIs prove review, rollout, and availability.
- Treat the EAS, Google Play, and App Store Connect sections independently. Both store sections must report `ok` before claiming that both stores were
  checked; missing or failed sections make the command exit nonzero.
- Keep project, artifact, signing identity, native version, track, processing, review, rollout, and availability distinct.
- The Google Play status check creates a temporary uncommitted edit to read track state and must delete it afterward; never commit it.
- Never infer `live` from a build, upload, successful API request, or configured rollout.
- Never automate App Store Connect or Google Play Console through a browser. Report API-unsupported store tasks as explicit manual blockers.
