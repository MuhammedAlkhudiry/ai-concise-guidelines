# Video Recording

Capture browser automation sessions as video for debugging, documentation, or verification.

## Basic Recording

```bash
playwright-cli open
playwright-cli video-start demo.webm
playwright-cli goto https://example.com
playwright-cli snapshot
playwright-cli click e1
playwright-cli video-stop
```

## Best Practices

- Use descriptive filenames.
- Prefer a `run-code` script for polished recordings with pacing and overlays.
- Use videos for demos and traces for debugging.
