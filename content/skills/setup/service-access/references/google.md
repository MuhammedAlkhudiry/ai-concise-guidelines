# Google

## Google Ads

- Source `$SERVICE_CREDENTIALS_HOME/secrets.zsh` and check the presence of `GOOGLE_ADS_*` variables.
- Distinguish the queried customer, manager account, Cloud project, OAuth app and user, and developer-token owner. Choose `login-customer-id` for the current request instead of treating it as a default.
- Verify access with the smallest read-only customer or reporting call. Keep agent-owned helpers read-only even when the OAuth scope permits mutations.
- To repair access, configure the developer token, API, and OAuth client, then write the resulting variables to `secrets.zsh`. Pause for consent, new permissions, or developer-token approval.

## Google Cloud

- Use `gcloud` and derive current commands from its help. Keep its native authentication under `~/.config/gcloud/`.
- Verify access with the smallest read-only project description.
- To repair access, authenticate, select the intended project, and enable only the required API. Pause for OAuth or new IAM grants.

## Google Drive

- Use `rclone`; derive the current authentication and read-only verification commands from `rclone help`.

## Google Play

- Use the Google Play Developer API through $mobile-app-infra; use the console only for API-unsupported blockers.
- Check `GOOGLE_SERVICE_ACCOUNT_KEY` in the selected environment file under `$SERVICE_CREDENTIALS_HOME/environments/`.
- Verify access with the read-only Android store-status command.
- To repair access, store the service-account key under `$SERVICE_CREDENTIALS_HOME/google-play/` and update the environment file. Pause for key creation or Play Console grants.
