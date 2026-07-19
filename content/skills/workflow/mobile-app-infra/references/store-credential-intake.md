# Credential Intake

Use this when store API credentials are missing and the user says they downloaded files or gives key values.

## Inputs

Ask only for missing values that cannot be discovered locally:

- Google Play service account JSON file downloaded to `~/Downloads`
- App Store Connect `.p8` key file downloaded to `~/Downloads`
- App Store Connect Key ID
- App Store Connect Issuer ID
- Credential environment name

Use local API credentials for repeatable status checks and release operations, following the store-access rule in [SKILL.md](../SKILL.md). Ask the user only for 2FA, missing account access, API-unsupported manual actions, or values/files that are not discoverable locally.

The project release docs should define the env variable names. Common names are:

```sh
GOOGLE_SERVICE_ACCOUNT_KEY=
ASC_KEY_ID=
ASC_ISSUER_ID=
ASC_KEY_PATH=
```

## File Handling

1. Require the centralized credential root and create provider folders:

```sh
: "${SERVICE_CREDENTIALS_HOME:?SERVICE_CREDENTIALS_HOME is not configured}"
rtk mkdir -p \
  "$SERVICE_CREDENTIALS_HOME/google-play" \
  "$SERVICE_CREDENTIALS_HOME/app-store-connect" \
  "$SERVICE_CREDENTIALS_HOME/environments/<name>"
```

2. List candidate downloads without printing secret contents:

```sh
rtk find "$HOME/Downloads" -maxdepth 1 -type f \( -name "*.json" -o -name "*.p8" \) -print
```

3. Identify the Google Play service account JSON by shape, not filename. It should contain `type: service_account`, `client_email`, and `private_key`.
4. Move the Google JSON to `$SERVICE_CREDENTIALS_HOME/google-play/service-account.json`.
5. Move the Apple `.p8` key to `$SERVICE_CREDENTIALS_HOME/app-store-connect/AuthKey_<key-id>.p8`.
6. Write `$SERVICE_CREDENTIALS_HOME/environments/<name>/mobile-release.env` with quoted shell exports whose credential paths start with `$SERVICE_CREDENTIALS_HOME`.
7. Run `chmod 700` on credential directories and `chmod 600` on credential files and the env file.
8. Run the project status command to verify API authentication.

## Safety

- Never print private key contents.
- Never commit credential files or local release env files.
- Do not assume Firebase `google-services.json` is a Google Play service account.
- Do not assume EAS remote credentials are readable by custom store API scripts.
- Apple `.p8` files are usually downloadable only once; keep the downloaded file stable.
- Service account JSON files should be created or rotated from Google Cloud if the old downloaded key is missing.
