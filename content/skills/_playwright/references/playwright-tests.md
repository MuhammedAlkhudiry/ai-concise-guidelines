# Running Playwright Tests

To run Playwright tests, use `npx playwright test` or a package manager script. To avoid opening the interactive HTML report, use `PLAYWRIGHT_HTML_OPEN=never`.

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test
PLAYWRIGHT_HTML_OPEN=never npm run special-test-command
```

# Debugging Playwright Tests

To debug a failing Playwright test, run it with `--debug=cli`. This pauses the test at the start and prints debugging instructions.

Important: run the command in the background and check the output until "Debugging Instructions" is printed.

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test --debug=cli
playwright-cli attach tw-abcdef
```

Every action you perform with `playwright-cli` generates corresponding Playwright TypeScript code. That output can be copied into the test.
