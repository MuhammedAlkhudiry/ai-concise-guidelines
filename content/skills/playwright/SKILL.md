---
name: playwright
description: Automate browser interactions, test web pages, and work with Playwright tests through `playwright-cli`.
---

# Playwright CLI

Use `playwright-cli` for browser automation, page inspection, screenshots when requested, and Playwright test debugging.

## Workflow

1. Open or attach to a browser session.
2. Navigate, snapshot, and interact using snapshot refs first.
3. Use `eval`, storage, network, tracing, video, or custom code only when the task needs it.
4. Close sessions and delete temporary artifacts before finishing.
5. Report any durable artifacts intentionally saved.

## Common Commands

```bash
playwright-cli open
playwright-cli open https://example.com
playwright-cli goto https://example.com
playwright-cli snapshot
playwright-cli click e3
playwright-cli fill e5 "user@example.com" --submit
playwright-cli press Enter
playwright-cli eval "document.title"
playwright-cli eval "el => el.getAttribute('data-testid')" e5
playwright-cli resize 390 844
playwright-cli console
playwright-cli network
playwright-cli close
```

Use `--raw` when piping values:

```bash
playwright-cli --raw eval "document.title"
playwright-cli --raw snapshot > before.yml
```

## Sessions

Use named or persistent sessions only when isolation or persistence is needed.

```bash
playwright-cli -s=auth open https://app.example.com/login --persistent
playwright-cli -s=auth snapshot
playwright-cli -s=auth close
playwright-cli -s=auth delete-data
playwright-cli list
playwright-cli close-all
playwright-cli delete-data
```

## Artifacts

- Treat screenshots, PDFs, videos, traces, storage state, persistent profiles, and `.playwright-cli/` snapshots as temporary unless the user asked to keep them.
- Save durable artifacts with explicit filenames and mention them in the final response.
- Use screenshots only when visual evidence or an image artifact is needed.

## Targeting elements

By default, use refs from the snapshot to interact with page elements.

```bash
# get snapshot with refs
playwright-cli snapshot
# interact using a ref
playwright-cli click e15
```

Use CSS selectors or Playwright locators when refs are insufficient.

```bash
playwright-cli click "#main > button.submit"
playwright-cli click "getByRole('button', { name: 'Submit' })"
playwright-cli click "getByTestId('submit-button')"
```

## Installation

If `playwright-cli` is not available, try a local version first:

```bash
npx --no-install playwright-cli --version
```

When local version works, use `npx playwright-cli`. Otherwise install the official package globally:

```bash
npm install -g @playwright/cli@latest
```

## References

- **Running and Debugging Playwright tests** [references/playwright-tests.md](references/playwright-tests.md)
- **Request mocking** [references/request-mocking.md](references/request-mocking.md)
- **Running Playwright code** [references/running-code.md](references/running-code.md)
- **Browser session management** [references/session-management.md](references/session-management.md)
- **Storage state (cookies, localStorage)** [references/storage-state.md](references/storage-state.md)
- **Test generation** [references/test-generation.md](references/test-generation.md)
- **Tracing** [references/tracing.md](references/tracing.md)
- **Video recording** [references/video-recording.md](references/video-recording.md)
- **Inspecting element attributes** [references/element-attributes.md](references/element-attributes.md)
