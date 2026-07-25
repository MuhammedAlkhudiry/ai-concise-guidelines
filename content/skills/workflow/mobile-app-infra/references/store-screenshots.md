# Store Screenshots

Use the bundled `scripts/mobile-store-screenshots.ts`, resolved relative to this skill directory rather than the target repository. Run it with
`--help`, then pass explicit project, mobile app, credential environment, screenshot directory, listing locale, and device-set arguments.

- Every command replaces store screenshots and requires `--confirm`. Use `scripts/mobile-store-status.ts` for read-only inspection.
- Generate and visually approve the numbered PNG files through the target project's own screenshot workflow before uploading them.
- `update-google` deletes and replaces one image set inside a temporary Google Play edit, then commits it. A failure deletes the uncommitted edit.
- `update-apple` rejects non-editable versions before deleting the selected set. App Store replacement is not transactional after deletion begins, so
  rerun the exact approved set if an upload is interrupted.
- `update-all` commits Google Play before starting App Store Connect. Treat a later Apple failure as a partial cross-store result and report each
  provider independently.
- Verify final provider state with `scripts/mobile-store-status.ts` and the public listings when version visibility matters.
