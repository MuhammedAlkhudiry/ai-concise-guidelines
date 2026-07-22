# Other providers

## DigitalOcean

- Use `doctl`; derive the current authentication and read-only verification commands from `doctl help`.

## PostHog

- Use $posthog-cli for operations. Source `$SERVICE_CREDENTIALS_HOME/secrets.zsh` and check `POSTHOG_CLI_API_KEY`, `POSTHOG_CLI_HOST`, `POSTHOG_CLI_ORGANIZATION_ID`, and `POSTHOG_CLI_PROJECT_ID`; run `posthog-cli login` to repair authentication.
