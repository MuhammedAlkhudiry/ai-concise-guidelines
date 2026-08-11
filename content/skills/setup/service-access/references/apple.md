# Apple

## App Store Connect

- Use the App Store Connect API through $mobile-app-infra; never use browser automation.
- Derive the required credentials from the selected script's live help and the installed environment template.
- Verify access with the read-only iOS store-status command.
- Keep the API key in agent-managed credential storage. Pause when the user must create or download it.

## Sign in with Apple

- Inspect the existing integration's service or bundle ID, team and key IDs, redirect URLs, and runtime key path.
- Verify that the identifiers and signing identity agree, then complete a non-destructive sign-in.
- Repair incorrect identifiers, keys, or return URLs in the Apple developer account. Keep private keys in runtime secret storage unless local agent
  access requires `$SERVICE_CREDENTIALS_HOME/apple-sign-in/`.
