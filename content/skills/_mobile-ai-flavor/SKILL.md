---
name: _mobile-ai-flavor
description: Add or adjust a mobile app flavor so the normal app and an AI/dev app can be installed side by side. Use when the user asks for two mobile versions, an AI mobile version, app flavor setup, bundle ID suffixes, or simulator/device coexistence.
---

# Mobile AI Flavor

Make the mobile app support a second installable AI/dev version without replacing the normal app.

## Workflow

1. Detect the mobile stack: Expo, React Native bare, iOS native, Android native, or mixed.
2. Read the repo's `AGENTS.md`, mobile docs, app config, native project files, env handling, and install commands.
3. Add or adjust the smallest project-native flavor/config that lets both apps coexist.
4. Keep identities distinct:
   - iOS bundle identifier suffix, usually `.ai`.
   - Android `applicationId` suffix, usually `.ai`.
   - Display name suffix, usually `AI`.
   - Scheme, flavor, variant, or app config name where the stack needs one.
5. Check conflict surfaces: URL schemes, deep links, Firebase configs, push notifications, keychain/shared preferences, storage namespaces, and backend URL/env.
6. Add or update install/run commands when the repo convention has a natural place for them.
7. Verify the normal app and AI app can both be installed on the target simulator/device.
8. Update `~/installation-guides/<project>.md` after the repo change if a guide exists.

## Rules

- This is code-changing work. Do not use it during documentation-only guide writing.
- Prefer project-native flavor mechanisms over ad hoc scripts.
- Do not remove or rename the normal app identity.
- If Firebase, push notifications, signing, or deep links are not clear, stop and ask instead of guessing.
