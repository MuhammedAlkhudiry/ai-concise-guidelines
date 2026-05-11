---
name: android-ddev-emulator
description: Fix Android emulator access to DDEV-hosted backends in React Native or Expo apps. Use when iOS/web can reach a local DDEV URL but Android emulator cannot, or when the app needs `10.0.2.2` plus a fixed DDEV host port.
---

# Android DDEV Emulator

Fix the Android emulator localhost mismatch for apps that talk to DDEV.

## Default diagnosis

- `*.ddev.site` often resolves to `127.0.0.1` on the host machine.
- On Android emulator, `127.0.0.1` points to the emulator itself, not the host.
- `usesCleartextTraffic` only permits `http`; it does not fix wrong host routing.

## Fix

1. Pin a DDEV host HTTP port in `.ddev/config.yaml`:

   ```yaml
   host_webserver_port: "38080"
   ```

2. Restart DDEV.
3. Point Android emulator config to `http://10.0.2.2:38080`.
4. Keep the working iOS/web URL separate, usually as `appUrl` plus Android-only `androidAppUrl`.

Example:

```json
{
  "development": {
    "appUrl": "http://family-tree.ddev.site",
    "androidAppUrl": "http://10.0.2.2:38080"
  }
}
```

## Verification

1. Verify host DDEV port responds:
   `curl -I http://127.0.0.1:38080`
2. Rebuild or relaunch the Android app so Expo/native config is refreshed.
3. Confirm API requests use `http://10.0.2.2:38080/...` on Android emulator.

## When not to use this

- Physical Android device on Wi‑Fi: use the host LAN IP or a public tunnel instead.
- Need HTTPS from real devices: use a stable tunnel or install the local CA if staying local.

- `ddev share` or public tunnels solve physical-device reachability, not the emulator-localhost issue.
