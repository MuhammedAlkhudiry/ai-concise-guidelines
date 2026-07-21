---
name: service-access
description: Configured service access and credential repair.
---

Load only the matching provider reference. If none exists, stop using this router.

## Workflow

1. Discover connected apps, native authentication, authorized runtimes, and `$SERVICE_CREDENTIALS_HOME` before requesting credentials.
2. Follow the provider reference and prove access with its smallest read-only check.
3. Repair missing access, pausing only for OAuth, 2FA, new permissions, or credentials the user must create.
4. Keep provider-native authentication in its native store. Store agent-managed credentials under `$SERVICE_CREDENTIALS_HOME/<provider>/` with directories at mode 700 and files at mode 600.

Report the selected route, readiness, and credential location without exposing values.
