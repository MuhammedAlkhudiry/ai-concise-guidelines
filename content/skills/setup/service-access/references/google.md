# Google

## Google Cloud

- Use `gcloud` and derive current commands from its help. Keep its native authentication under `~/.config/gcloud/`.
- Verify access with the smallest read-only project description.
- To repair access, authenticate, select the intended project, and enable only the required API. Pause for OAuth or new IAM grants.

## Google Drive

- Use `rclone`; derive the current authentication and read-only verification commands from `rclone help`.

## Google Play

- Use the Google Play Developer API through $mobile-app-infra. Never automate Play Console through a browser; reserve it for explicit user-run
  account, policy, legal, payment, or review tasks that the API does not support.
- Check `GOOGLE_SERVICE_ACCOUNT_KEY` in the selected environment file under `$SERVICE_CREDENTIALS_HOME/environments/`.
- Verify access with the read-only Android store-status command.
- To repair access, store the service-account key under `$SERVICE_CREDENTIALS_HOME/google-play/` and update the environment file. Pause for key
  creation or Play Console grants.
