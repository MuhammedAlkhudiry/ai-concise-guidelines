# Advertising platforms

Use the user's signed-in Chrome session for every platform. Keep authentication in Chrome and never inspect or export cookies, session storage,
passwords, or tokens. Verify access read-only by opening the platform dashboard and identifying the intended business or ad account. Pause for login,
OAuth, 2FA, CAPTCHA, or missing permissions. Request approval before every account, campaign, creative, audience, budget, billing, or access mutation.

## Google Ads

- Open [Google Ads](https://ads.google.com/) in Chrome and select the exact customer or manager account for the task.
- Verify browser access from the account selector or dashboard and report the selected account name and customer ID.
- Check `$SERVICE_CREDENTIALS_HOME/secrets.zsh` for `GOOGLE_ADS_*` variables and prefer the configured API for reporting and supported operations.
  Verify it read-only by listing accessible customers.
- Distinguish the customer, manager account, Cloud project, OAuth app and user, and developer-token owner. Choose `login-customer-id` for the current
  request instead of treating it as a default.
- Repair API access by configuring the developer token, API, and OAuth client, then updating `secrets.zsh`.

## Apple Ads

- Open [Apple Ads Advanced](https://app-ads.apple.com/cm/app/) in Chrome and select the exact organization or campaign group for the task.
- Verify browser access from the Campaigns dashboard and report the organization name and ID, campaign group, currency, timezone, and user role.
- Prefer the Apple Ads Campaign Management API when `$SERVICE_CREDENTIALS_HOME/apple-ads/oauth.json` and its referenced private key exist. Derive the
  current API version and ACL verification route from official documentation. Request only the least-privileged API Read Only role for reporting
  unless an approved task requires mutations.
- Keep the Apple Account, Apple Ads organization, campaign group, App Store Connect account, promoted app, API user, OAuth client, and AdServices
  attribution integration distinct. Store `clientId`, `teamId`, `keyId`, the private-key path, and any selected `orgId` in the credential file; create
  access tokens at runtime and never persist them.
- Treat Campaign Management API reporting and the AdServices attribution flow as separate routes. Reconcile campaign, ad group, ad, keyword, country
  or region, tap-through, view-through, new-download, and redownload fields without collapsing Apple’s attribution definitions.
- If the account or app is absent, repair the Apple Ads user role or App Store Connect link rather than sharing an Apple Account. Pause when an
  Account Admin must invite an API user, upload a public key, link App Store Connect, accept terms, verify the account, or configure billing.

## Meta Ads

- Open [Meta Ads Manager](https://www.facebook.com/ads/manager) in Chrome.
- Verify access from the campaigns dashboard and report the selected ad account name and ID.
- Prefer the Meta Marketing API for reporting and supported operations when `$SERVICE_CREDENTIALS_HOME/meta-ads/system-user.json` exists. Verify it
  read-only by listing accessible ad accounts and requesting only necessary fields.
- Keep the app, business portfolio, system user, ad account, token scopes, and Graph API version distinct. Confirm the token has only the scopes
  required for the requested operation.
- If the account is absent, repair access through the owning business portfolio or the ad account's roles without requesting or sharing another
  person's login credentials.

## Snapchat Ads

- Open [Snapchat Ads Manager](https://ads.snapchat.com/) in Chrome.
- Verify access from Ads Manager and report the selected organization and ad account name and ID.
- Prefer the Snapchat Marketing API when `$SERVICE_CREDENTIALS_HOME/snapchat-ads/oauth.json` exists. Refresh OAuth tokens through the official token
  endpoint when necessary and verify access by listing the current user's organizations.
- Keep the OAuth app, organization, and ad account identifiers distinct.
- If the account is absent, repair the organization and ad-account role assignment rather than sharing another user's credentials.

## TikTok Ads

- Treat `$SERVICE_CREDENTIALS_HOME/tiktok-ads/oauth.json` as Marketing API access and `tiktok-ads/events-api.json` as Pixel Events API access. Never
  substitute one credential for the other.
- Use only the TikTok Marketing API when `oauth.json` contains an approved app and advertiser authorization. Verify access read-only by listing
  authorized advertisers, then request advertiser information and confirm the intended advertiser is the only selected project account.
- Keep the developer profile, developer app, Business Center, advertiser account, and access token distinct. Until TikTok approves the app and exposes
  its App ID and secret, report API access as pending and stop.
- A Direct Advertiser profile is valid for an app managing its owner's advertiser account. Use Technology Company only for an integration serving
  third-party advertisers.
- If the account is absent, request or assign advertiser-account access through Business Center rather than sharing another user's credentials.
