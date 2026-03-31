---
name: _android-ddev-emulator
description: Fix Android emulator access to DDEV-hosted backends in React Native or Expo apps. Use when iOS/web can reach a local DDEV URL but Android emulator cannot, or when the app needs `10.0.2.2` plus a fixed DDEV host port.
---

# Android DDEV Emulator

Use this when a mobile app works against DDEV on web or iOS but fails on the Android emulator.

## Default diagnosis

- `*.ddev.site` often resolves to `127.0.0.1` on the host machine.
- On Android emulator, `127.0.0.1` points to the emulator itself, not the host.
- `usesCleartextTraffic` only permits `http`; it does not fix wrong host routing.

## Clean fix

### 1. Pin a DDEV host HTTP port

Set a fixed port in project `.ddev/config.yaml`:

```yaml
host_webserver_port: "38080"
```

Restart DDEV after changing it.

### 2. Use Android emulator host alias

For Android emulator, point the app to:

```text
http://10.0.2.2:38080
```

`10.0.2.2` is the emulator alias for the host machine.

### 3. Keep iOS/web config separate

Do not replace the shared dev URL if iOS already works with `family-tree.ddev.site` or another local hostname.

Prefer:
- shared dev URL for iOS/web
- Android-only override for emulator

Example:

```json
{
  "development": {
    "appUrl": "http://family-tree.ddev.site",
    "androidAppUrl": "http://10.0.2.2:38080"
  }
}
```

Then resolve the Android override in app config at runtime.

## Verification

1. Verify host DDEV port responds:
   `curl -I http://127.0.0.1:38080`
2. Rebuild or relaunch the Android app so Expo/native config is refreshed.
3. Confirm API requests use `http://10.0.2.2:38080/...` on Android emulator.

## When not to use this

- Physical Android device on Wi‑Fi: use the host LAN IP or a public tunnel instead.
- Need HTTPS from real devices: use a stable tunnel or install the local CA if staying local.

## Notes

- `ddev share` or Cloudflare tunnels solve device reachability, but are separate from the emulator-localhost issue.
- If Expo config changes are not picked up, rebuild Android to remove ambiguity.
