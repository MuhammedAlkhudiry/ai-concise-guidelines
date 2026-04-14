# Browser Session Management

Run multiple isolated browser sessions concurrently with state persistence.

## Named Browser Sessions

Use `-s` to isolate browser contexts:

```bash
playwright-cli -s=auth open https://app.example.com/login
playwright-cli -s=public open https://example.com
playwright-cli -s=auth fill e1 "user@example.com"
playwright-cli -s=public snapshot
```

## Session Commands

```bash
playwright-cli list
playwright-cli close
playwright-cli -s=mysession close
playwright-cli close-all
playwright-cli kill-all
playwright-cli delete-data
playwright-cli -s=mysession delete-data
```

Always close the session when finished. If the session used persistent data, also delete that data unless the user explicitly asked to keep it.
