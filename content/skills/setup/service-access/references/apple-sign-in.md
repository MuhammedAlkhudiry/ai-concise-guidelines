# Sign in with Apple

- **Route:** Use the existing native/web Sign in with Apple integration.
- **Discover:** Inspect service/bundle IDs, team/key IDs, redirect URLs, and runtime key-path variables without printing private keys.
- **Verify:** Compare identifiers and signing identity, then complete a non-destructive sign-in.
- **Repair:** Create or correct the identifier, key, and return URLs in the Apple developer account.
  Store private key files under `$SERVICE_CREDENTIALS_HOME/apple-sign-in/` only when local agent access needs them; otherwise keep them in runtime secret storage.
