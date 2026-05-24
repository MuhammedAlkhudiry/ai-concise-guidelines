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
4. Load `references/cli-usage.md` when you need command examples, sessions, artifacts, targeting, or install guidance.
5. Close sessions and delete temporary artifacts before finishing.
6. Report any durable artifacts intentionally saved.

## Defaults

- Use refs from `playwright-cli snapshot` before CSS selectors or Playwright locators.
- Use named or persistent sessions only when isolation or persistence is needed.
- Use screenshots only when visual evidence or an image artifact is needed.
- Treat screenshots, PDFs, videos, traces, storage state, persistent profiles, and `.playwright-cli/` snapshots as temporary unless the user asked to keep them.

## References

- **CLI usage** [references/cli-usage.md](references/cli-usage.md)
- **Running and Debugging Playwright tests** [references/playwright-tests.md](references/playwright-tests.md)
- **Request mocking** [references/request-mocking.md](references/request-mocking.md)
- **Running Playwright code** [references/running-code.md](references/running-code.md)
- **Browser session management** [references/session-management.md](references/session-management.md)
- **Storage state (cookies, localStorage)** [references/storage-state.md](references/storage-state.md)
- **Test generation** [references/test-generation.md](references/test-generation.md)
- **Tracing** [references/tracing.md](references/tracing.md)
- **Video recording** [references/video-recording.md](references/video-recording.md)
- **Inspecting element attributes** [references/element-attributes.md](references/element-attributes.md)
