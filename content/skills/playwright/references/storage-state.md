# Storage Management

Manage cookies, localStorage, sessionStorage, and browser storage state.

## Storage State

```bash
playwright-cli state-save
playwright-cli state-save my-auth-state.json
playwright-cli state-load my-auth-state.json
```

## Cookies

```bash
playwright-cli cookie-list
playwright-cli cookie-list --domain=example.com
playwright-cli cookie-get session_id
playwright-cli cookie-set session abc123
playwright-cli cookie-delete session_id
playwright-cli cookie-clear
```

## Local Storage

```bash
playwright-cli localstorage-list
playwright-cli localstorage-get token
playwright-cli localstorage-set theme dark
playwright-cli localstorage-delete token
playwright-cli localstorage-clear
```

## Session Storage

```bash
playwright-cli sessionstorage-list
playwright-cli sessionstorage-get form_data
playwright-cli sessionstorage-set step 3
playwright-cli sessionstorage-delete step
playwright-cli sessionstorage-clear
```
