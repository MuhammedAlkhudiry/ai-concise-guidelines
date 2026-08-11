# Store Screenshots

Use the bundled `scripts/mobile-store-screenshots.ts`, resolved relative to this skill directory. Read its live help and treat the script as the
authority for commands, arguments, defaults, and provider behavior.

- Generate and visually approve the numbered PNG files through the target project's own screenshot workflow before uploading them.
- Screenshot replacement is destructive and requires explicit confirmation. App Store replacement is not transactional; rerun the exact approved set
  after interruption. Cross-store replacement can partially succeed, so report each provider independently.
- Verify final provider state with `scripts/mobile-store-status.ts` and the public listings when version visibility matters.
