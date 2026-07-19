# Google Ads

- **Route:** Use current official Google Ads documentation, client configuration, API schemas, and live errors. Keep agent-owned helpers read-only even though the OAuth scope permits mutations.
- **Discover:** Source `$SERVICE_CREDENTIALS_HOME/secrets.zsh` and check only the `GOOGLE_ADS_*` variable names and presence.
- **Context:** Distinguish the queried customer, manager account, Cloud project, OAuth app and user, and developer-token owner. Treat `login-customer-id` as a live routing choice, not a default.
- **Verify:** Run the smallest read-only customer-access or reporting call with the selected login-customer context.
- **Repair:** Configure the developer token, API, and OAuth client; write the resulting variables to `secrets.zsh`, set mode 600, and pause only for consent, new permissions, or developer-token approval.
- **Report:** Return a verified read-only result or an exact blocker with credential-name presence, account surfaces, access state, helper result, and next action. Never expose credential values or private account data.
