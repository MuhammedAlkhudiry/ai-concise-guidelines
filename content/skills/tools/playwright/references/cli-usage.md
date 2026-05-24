# Playwright CLI Usage

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

```bash
playwright-cli -s=auth open https://app.example.com/login --persistent
playwright-cli -s=auth snapshot
playwright-cli -s=auth close
playwright-cli -s=auth delete-data
playwright-cli list
playwright-cli close-all
playwright-cli delete-data
```

## Targeting Elements

Use refs from snapshots by default:

```bash
playwright-cli snapshot
playwright-cli click e15
```

Use CSS selectors or Playwright locators when refs are insufficient:

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
