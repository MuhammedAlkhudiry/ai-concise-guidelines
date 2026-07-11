---
name: laravel-forge-cli
description: Laravel Forge CLI operations for install, auth, server switching, deploys, env sync, logs, remote commands, SSH, and resource checks.
---

## Workflow

1. Check `forge` installation and version when local command behavior matters.
2. For installation guidance, verify the PHP requirement against live docs and `laravel/forge-cli` `composer.json`.
3. Confirm authentication before commands that call Forge: `forge login`, `forge login --token=...`, or `FORGE_API_TOKEN` in CI.
4. Confirm the active server with `forge server:current`; switch with `forge server:switch` before site or resource commands when needed.
5. Prefer site names, server names, and command options over interactive prompts in automation or CI.
6. Treat Forge API tokens, environment files, deployment output, logs, and remote command output as sensitive.
7. Use the direct CLI command before reaching for the Forge API or dashboard.

## References

- **Command matrix**: read [references/commands.md](references/commands.md) when choosing exact commands or options.
- **Auth and server context**: read [references/authentication-and-context.md](references/authentication-and-context.md) for installation, tokens, CI auth, and server switching.
- **Sites and deployments**: read [references/deployments-and-sites.md](references/deployments-and-sites.md) for deploys, logs, env files, site commands, Tinker, and Forge pages.
- **Resources and SSH**: read [references/resources-and-ssh.md](references/resources-and-ssh.md) for SSH, daemon/database/nginx/php status, logs, restarts, and database shells.
