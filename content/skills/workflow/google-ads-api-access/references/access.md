# Google Ads API Access

Use this workflow when setting up, debugging, or monitoring Google Ads API access for read-only reporting, campaign diagnostics, or marketing-account checks.

## Contents

- Boundary and account map
- Durable credentials and setup sequence
- Browser and consent safety
- Read-only helper and error ladder
- Manager-account and production-access rules
- Final report

## Boundary

This workflow is for account/API setup, OAuth, developer-token access, read-only reporting helpers, and approval monitoring. It is not for creating, editing, pausing, launching, deleting, or optimizing ads, campaigns, budgets, bids, keywords, audiences, conversion actions, billing, or account settings.

Keep the local code or helper read-only even though Google OAuth exposes the broad Google Ads scope. The scope may say the app can see, edit, create, and delete Google Ads accounts and data; the agent-owned helper must still enforce read-only behavior.

## Account Map

Separate these surfaces before diagnosing errors:

| Surface | What It Controls |
| --- | --- |
| Google Ads customer account | The live ads account being reported on, usually the `customer_id` in API calls. |
| Google Ads manager account | API Center, developer token ownership, and optional `login-customer-id` when linked to a client account. |
| Google Cloud project | OAuth client, enabled Google Ads API service, consent screen, and API metrics. |
| OAuth app | Client ID/secret, test-user access, verification status, and refresh-token generation. |
| OAuth user | The Google account granting access; it must have permission to the target Google Ads customer account. |
| Developer token | Controls whether API calls can access test accounts only or live non-test accounts. |

Do not assume the manager account should always be used as `login-customer-id`. Use it only when the manager account is actually linked to the target customer account. If the OAuth user has direct access to the customer account, direct customer access with a blank `login-customer-id` can be the correct setup.

## Durable Setup

Store durable, non-secret facts in the product setup file when available:

- Google Ads customer ID.
- Google Ads manager account ID.
- Google Cloud project name or ID.
- OAuth app status such as testing, verified, or internal where relevant.
- Developer token access status: Test Account, Explorer, Basic, Standard, pending, rejected, or unknown.
- Read-only helper command.
- Which env names are expected, never their values.
- Known blocker and next setup step.

Keep secret values out of repos and setup docs: developer token, OAuth client secret, refresh token, service-account JSON, private keys, cookies, and authorization headers.

## Recommended Local Env Names

Use names like these, but report only presence/absence:

```text
GOOGLE_ADS_DEVELOPER_TOKEN
GOOGLE_ADS_CUSTOMER_ID
GOOGLE_ADS_CLIENT_ID
GOOGLE_ADS_CLIENT_SECRET
GOOGLE_ADS_REFRESH_TOKEN
GOOGLE_ADS_LOGIN_CUSTOMER_ID
GOOGLE_ADS_API_VERSION
```

Set `GOOGLE_ADS_LOGIN_CUSTOMER_ID` only when the manager account is linked and intended as the API login customer. If a stale manager header causes `USER_PERMISSION_DENIED`, set it blank or remove it and retry direct customer access.

## Setup Sequence

1. Confirm the target customer account and the Google account that has access to it.
2. If API Center is unavailable in the customer account, create or use a manager account because Google Ads API Center lives under manager accounts.
3. Create or inspect the developer token in the manager account API Center.
4. Check the developer token access level. Test Account Access is test-only; Explorer can read production accounts within its limits; apply for Basic or Standard only when the required production use exceeds the current level.
5. In Google Cloud, configure the OAuth consent screen.
6. If the OAuth app is in testing, add the OAuth user as a test user before trying consent.
7. Choose the current supported auth flow for the account model. Use service-account auth when it fits manager-owned accounts; use single-user OAuth as the fallback for a local reporting helper.
8. For single-user OAuth, create a Desktop client, enable 2-step verification on the authorizing Google account, and store the client secret securely.
9. Enable the `googleads.googleapis.com` service in the Google Cloud project.
10. Generate a refresh token through a local loopback OAuth flow with:
    - scope `https://www.googleapis.com/auth/adwords`
    - `access_type=offline`
    - `prompt=consent`
    - a localhost or `127.0.0.1` callback
    - state verification
11. Store the refresh token locally without printing it.
12. Run the read-only helper and classify the blocker or success.
13. Add a monitor if external approval is pending.

## Browser And Consent Safety

Do not click through Google account-security prompts, unverified-app safety warnings, or final OAuth consent screens on the user's behalf unless the user explicitly asks for that exact action and browser policy allows it. Prefer asking the user to click:

- Passkey or account verification prompts.
- "Google hasn't verified this app" warnings.
- Final consent screens granting Google Ads access.

After the user clicks, continue with the local callback, token exchange, and verification. If the callback listener was stopped while the page advanced, restart the listener only when the OAuth `state` can be matched safely; otherwise restart the OAuth flow.

## Read-Only Helper Pattern

A good helper should:

- Load credentials from local secrets, not repo files.
- Fail with `configured: false` when required env names are missing.
- Never print secret values.
- Never create, edit, pause, delete, launch, or mutate Google Ads resources.
- Query account basics, campaign status, recent delivery, ad policy/review status, and conversion-action status.
- Report structured JSON with `ok`, `configured`, `authMode`, customer IDs, date ranges, data summaries, and query errors.
- Treat partial query failures as diagnostic output instead of hiding them.

## Error Ladder

Use API errors as setup-state signals:

| Error Signal | Meaning | Next Step |
| --- | --- | --- |
| `configured: false` | Local env setup is incomplete. | Add missing local env names without exposing values. |
| `SERVICE_DISABLED` / API has not been used | Google Ads API service is disabled in the Cloud project. | Enable `googleads.googleapis.com`; wait briefly and rerun. |
| Access blocked / app not verified / developer has not given access | OAuth app is in testing and user is not allowlisted. | Add the OAuth user as a test user. |
| Unverified app warning | Test user is allowlisted but OAuth app is not verified. | User manually continues if they trust the app. |
| Broad "see, edit, create, delete" consent text | Normal Google Ads OAuth scope behavior. | Explain broad scope; rely on read-only helper boundaries. |
| `USER_PERMISSION_DENIED` mentioning `login-customer-id` | Manager login customer is wrong or not linked, or OAuth user lacks Ads access. | Retry direct customer access without manager header; if needed, link manager account or grant user access. |
| `DEVELOPER_TOKEN_NOT_APPROVED` | The developer token cannot access the requested production account. | Check its access level; complete signup or apply for the required production level. |
| `TWO_STEP_VERIFICATION_NOT_ENROLLED` | The OAuth user does not meet Google Ads API 2-step-verification requirements. | Enable 2-step verification for that Google account, then retry. |
| Empty or zero campaign data with `ok: true` | API access works but account has no matching delivery/data in range or queries. | Diagnose campaigns normally from helper output and Ads UI. |

## Manager Account Rule

Creating a manager account can be necessary to obtain the developer token, but it does not automatically grant API access to a customer account. To use the manager account as `login-customer-id`, the manager must be linked to the target customer in Google Ads.

If the OAuth user directly owns or can access the customer account, prefer direct customer access until there is a reason to route through the manager account. This avoids false `USER_PERMISSION_DENIED` errors caused by an unlinked manager header.

## Production Access

When the current access level cannot support the production use case:

- Prepare a concise design document that states the API is used for read-only reporting, account health, campaign delivery, ad review status, and conversion-action status.
- State that the helper does not mutate campaigns, budgets, bids, keywords, ads, audiences, conversion actions, billing, or account settings.
- Confirm whether Explorer is sufficient; otherwise submit through the Basic or Standard Access application flow.
- Record the submission date and expected review window as durable setup.
- Until the required level is active, expect unsupported live-account calls to fail with `DEVELOPER_TOKEN_NOT_APPROVED`.

When approval is pending, create a small monitor that reruns the read-only helper and reports:

- `Pending` when `DEVELOPER_TOKEN_NOT_APPROVED` remains.
- `Approved` when the helper can read live account/campaign/conversion data.
- `Blocked` when a different setup error appears.

## Final Report

Include:

- What is configured locally by env name only.
- Which account IDs and Cloud project were used.
- Whether the API service is enabled.
- Whether OAuth refresh-token auth is present.
- The current developer-token level and any pending access request.
- Whether manager login is blank, used, or needs linking.
- The read-only helper result and current blocker.
- Any durable setup updates made.

Never include developer-token values, OAuth secrets, refresh tokens, service-account JSON, cookies, auth headers, or raw private account data.
