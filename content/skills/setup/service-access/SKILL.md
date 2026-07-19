---
name: service-access
description: Service API, CLI, connector, and credential access routing. Use when an account or service must be queried or operated, existing access or credential location is unknown, or missing access must be set up or repaired.
---

Load only the reference for the requested service.

1. Discover connected apps, native CLI auth, `$SERVICE_CREDENTIALS_HOME`, and authorized runtime access before asking for credentials.
2. Prefer connected apps for their data, then the provider CLI, then direct API access. Use the provider reference's order when it differs.
3. Run the smallest read-only proof. Existing access is ready only when that proof succeeds.
4. If access is missing, complete the reference's repair steps. Pause only for OAuth/2FA, new permissions, or a credential the user must create.
5. Keep provider-native auth in its native store. Put agent-managed raw files only under `$SERVICE_CREDENTIALS_HOME/<provider>/`; use mode 700 for directories and 600 for files.
6. Report the selected route, readiness, and credential location class without values.

Use only matching files currently present under `references/`. If no reference exists for a service, treat it as outside this router instead of inferring or recreating deleted access guidance.
