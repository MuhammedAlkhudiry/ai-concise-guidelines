# Apple

## App Store Connect

- Use the App Store Connect API through $mobile-app-infra; never use browser automation.
- Check `ASC_KEY_ID`, `ASC_ISSUER_ID`, and `ASC_KEY_PATH` in the selected environment file under `$SERVICE_CREDENTIALS_HOME/environments/`.
- Verify access with the read-only iOS store-status command.
- To repair access, store the API key under `$SERVICE_CREDENTIALS_HOME/app-store-connect/` and update the environment file. Pause when the user must create or download the key.

## Sign in with Apple

- Inspect the existing integration's service or bundle ID, team and key IDs, redirect URLs, and runtime key path.
- Verify that the identifiers and signing identity agree, then complete a non-destructive sign-in.
- Repair incorrect identifiers, keys, or return URLs in the Apple developer account. Keep private keys in runtime secret storage unless local agent access requires `$SERVICE_CREDENTIALS_HOME/apple-sign-in/`.
