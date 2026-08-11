# Store Status

Use the bundled `scripts/mobile-store-status.ts`, resolved relative to this skill directory. Read its live help and treat the script as the authority
for arguments, defaults, provider API behavior, and output.

- EAS proves build and upload progress; store APIs prove review, rollout, and availability.
- Keep project, artifact, signing identity, native version, track, processing, review, rollout, and availability distinct.
- Never infer `live` from a build, upload, successful API request, or configured rollout.
- Never automate App Store Connect or Google Play Console through a browser. Report API-unsupported store tasks as explicit manual blockers.
