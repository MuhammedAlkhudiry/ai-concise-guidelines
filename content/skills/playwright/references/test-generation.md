# Test Generation

Generate Playwright test code automatically as you interact with the browser.

## How It Works

Every action you perform with `playwright-cli` generates corresponding Playwright TypeScript code that can be copied into test files.

## Example Workflow

```bash
playwright-cli open https://example.com/login
playwright-cli snapshot
playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password123"
playwright-cli click e3
```

## Best Practices

- Prefer semantic locators.
- Explore the page with snapshots before recording actions.
- Add assertions manually after collecting actions.
