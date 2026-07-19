# Google Ads

- **Route:** Use $google-ads-api-access and keep agent-owned helpers read-only.
- **Discover:** Source `$SERVICE_CREDENTIALS_HOME/secrets.zsh` and check only the `GOOGLE_ADS_*` variable names and presence.
- **Verify:** Follow the skill's smallest customer-access or reporting call with the selected login-customer context.
- **Repair:** Complete OAuth/client setup through $google-ads-api-access, write the resulting variables to `secrets.zsh`, set mode 600, and pause only for consent or developer-token approval.

