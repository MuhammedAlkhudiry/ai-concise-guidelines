# Google Play

- **Route:** Use the Google Play Developer API through $mobile-app-infra; use the console only for API-unsupported blockers.
- **Discover:** Check `GOOGLE_SERVICE_ACCOUNT_KEY` in the selected env file under `$SERVICE_CREDENTIALS_HOME/environments/`.
- **Verify:** Run the read-only mobile store status command for Android.
- **Repair:** Create or select a service account, grant the minimum Play Console access, store the JSON under `$SERVICE_CREDENTIALS_HOME/google-play/`, update the env file, set modes 700/600, and pause for console grants or key creation.

