---
name: mobile-ai-flavor
description: Add or adjust a mobile app flavor so the normal app and an AI/dev app can be installed side by side. Use when the user asks for two mobile versions, an AI mobile version, app flavor setup, bundle ID suffixes, or simulator/device coexistence.
---

# Mobile AI Flavor

Add a second installable AI/dev app identity without replacing the normal app.

## Workflow

1. Detect the mobile stack: Expo, React Native bare, iOS native, Android native, or mixed.
2. Read mobile docs, app config, native project files, env handling, and install commands.
3. Use the smallest project-native flavor/config that lets both apps coexist.
4. Keep identities distinct where the stack needs them:
   - iOS bundle identifier suffix, usually `.ai`.
   - Android `applicationId` suffix, usually `.ai`.
   - Display name suffix, usually `AI`.
   - Scheme, flavor, variant, or app config name.
5. Check conflicts: URL schemes, deep links, Firebase, push notifications, keychain/shared preferences, storage namespaces, and backend env.
6. Add install/run commands when the repo has a natural place for them.
7. Verify the normal app and AI app can both be installed on the target simulator/device.

## Rules

- This is code-changing work. Do not use it during documentation-only guide writing.
- Prefer project-native flavor mechanisms over ad hoc scripts.
- Do not remove or rename the normal app identity.
- Treat unclear Firebase, push notification, signing, or deep-link setup as a blocker to resolve before editing those surfaces.
