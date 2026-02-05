---
name: cloudflare-tunnel
description: "Set up Cloudflare Tunnel for stable, free public HTTPS URL to local dev server. Use when user says 'setup tunnel', 'expose local', 'cloudflare tunnel', 'public URL', or wants to share local dev environment externally."
---

# Cloudflare Tunnel Setup

Set up a Cloudflare Tunnel to expose a local development server (DDEV, Docker, etc.) via a stable, free, public HTTPS URL using a subdomain on the user's domain.

## Prerequisites

- Cloudflare account with a domain added
- Local dev server running (e.g., DDEV, Docker, localhost)
- macOS (Homebrew) or Linux

## Steps

### 1. Install cloudflared

```bash
# macOS
brew install cloudflared

# Linux (Debian/Ubuntu)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

### 2. Login to Cloudflare

```bash
cloudflared tunnel login
```

Opens browser for authentication. Saves cert to `~/.cloudflared/cert.pem`.

### 3. Create Tunnel

```bash
cloudflared tunnel create <tunnel-name>
```

Saves credentials JSON to `~/.cloudflared/<tunnel-id>.json`.

### 4. Route DNS

Use a **subdomain** to avoid affecting production:

```bash
cloudflared tunnel route dns <tunnel-name> dev.<domain>
```

This creates a CNAME record for the subdomain only. Production is untouched.

### 5. Create Config

Write `~/.cloudflared/config.yml`:

```yaml
tunnel: <tunnel-id>
credentials-file: /path/to/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: dev.<domain>
    service: https://<local-hostname>
    originRequest:
      noTLSVerify: true    # Required for self-signed certs (DDEV, mkcert)
  - service: http_status:404
```

**Note:** `noTLSVerify: true` is needed when the local server uses self-signed TLS (DDEV, mkcert, etc.).

### 6. Run Tunnel

```bash
cloudflared tunnel run <tunnel-name>

# Background:
cloudflared tunnel run <tunnel-name> &>/tmp/cloudflared.log &
```

Verify: `curl -s -o /dev/null -w "%{http_code}" https://dev.<domain>/up`

## Framework-Specific Setup

### DDEV

DDEV's Traefik router only accepts requests for configured hostnames. Add the tunnel hostname:

```bash
ddev config --additional-fqdns=dev.<domain>
# Requires hosts entry:
sudo ddev-hostname dev.<domain> 127.0.0.1
ddev restart
```

### Laravel (Trusted Proxies)

Cloudflare acts as a reverse proxy. Configure Laravel to trust it so `request()->ip()`, `url()`, etc. work correctly:

**Laravel 11+ (bootstrap/app.php):**
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(
        at: ['*'],
        headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR
            | \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST
            | \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT
            | \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO,
    );
})
```

**Laravel 10 and below:** Add Cloudflare IPs to `App\Http\Middleware\TrustProxies::$proxies` or set `$proxies = '*'`.

### Mobile App (React Native / Expo)

Update the development API URL to use the tunnel instead of local hostname:

```json
// app.json or config
{
  "development": {
    "appUrl": "https://dev.<domain>"
  }
}
```

Remove any platform-specific URL hacks (ngrok random URLs, Android-specific overrides, etc.). The tunnel URL works from any device.

## Key Facts

- **Free** — Cloudflare Tunnel is free, stable URL forever
- **Production safe** — Only a subdomain CNAME is created, root domain untouched
- **Both work** — Local URL and tunnel URL work side by side
- **No APP_URL change needed** — For API-only backends, keep APP_URL as the local URL
- **Daily usage** — Just run `cloudflared tunnel run <name>` after starting your dev server

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `cert.pem` not found | Re-run `cloudflared tunnel login` |
| 404 from tunnel | Add hostname to DDEV FQDNs or web server config |
| `Bad gateway` | Local server not running, or wrong service URL in config |
| SSL errors | Add `noTLSVerify: true` to `originRequest` |

## Cleanup

```bash
# Delete tunnel (also removes DNS)
cloudflared tunnel delete <tunnel-name>

# Remove DDEV FQDN
ddev config --additional-fqdns=""
ddev restart
```
