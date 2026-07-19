# App Store Connect

- **Route:** Use the App Store Connect API through $mobile-app-infra; do not use browser automation.
- **Discover:** Check `ASC_KEY_ID`, `ASC_ISSUER_ID`, and `ASC_KEY_PATH` in the selected env file under `$SERVICE_CREDENTIALS_HOME/environments/`.
- **Verify:** Run the read-only mobile store status command for iOS.
- **Repair:** Create or obtain an API key, store its `.p8` file under `$SERVICE_CREDENTIALS_HOME/app-store-connect/`, update the env file, set modes 700/600, and pause if the user must create or download the key.

