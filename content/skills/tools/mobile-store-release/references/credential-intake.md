# Credential Intake

Use this when store API credentials are missing and the user says they downloaded files or gives key values.

## Inputs

Ask only for missing values that cannot be discovered locally:

- Google Play service account JSON file downloaded to `~/Downloads`
- App Store Connect `.p8` key file downloaded to `~/Downloads`
- App Store Connect Key ID
- App Store Connect Issuer ID
- Project credential env path

Prefer existing authenticated browser sessions for dashboard-only work. Use local API credentials for repeatable status checks and release operations. Ask the user only for 2FA, missing account access, or values/files that are not discoverable locally.

The project release docs should define the env variable names. Common names are:

```sh
GOOGLE_SERVICE_ACCOUNT_KEY=
ASC_KEY_ID=
ASC_ISSUER_ID=
ASC_KEY_PATH=
```

## File Handling

1. Create durable local credential folders:

```sh
rtk mkdir -p "$HOME/.credentials" "$(dirname "<project-env-path>")"
```

2. List candidate downloads without printing secret contents:

```sh
rtk find "$HOME/Downloads" -maxdepth 1 -type f \( -name "*.json" -o -name "*.p8" \) -print
```

3. Identify the Google Play service account JSON by shape, not filename. It should contain `type: service_account`, `client_email`, and `private_key`.
4. Move the Google JSON to a stable project-specific path under `~/.credentials`.
5. Move the Apple `.p8` key to a Key-ID-based filename under `~/.credentials`.
6. Write the project env file with quoted shell exports and `$HOME` paths.
7. Run `chmod 600` on credential files and the env file.
8. Run the project status command to verify API authentication.

## Safety

- Never print private key contents.
- Never commit credential files or local release env files.
- Do not assume Firebase `google-services.json` is a Google Play service account.
- Do not assume EAS remote credentials are readable by custom store API scripts.
- Apple `.p8` files are usually downloadable only once; keep the downloaded file stable.
- Service account JSON files should be created or rotated from Google Cloud if the old downloaded key is missing.
