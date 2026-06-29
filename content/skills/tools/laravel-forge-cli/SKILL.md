---
name: laravel-forge-cli
description: Laravel Forge CLI operations for install, auth, server switching, deploys, env pull/push, logs, remote commands, opening Forge sites, SSH, and resource checks.
---

# Laravel Forge CLI

Use the official `forge` command for Laravel Forge operations.

## Workflow

1. Confirm the task is for Laravel Forge, not another tool named Forge.
2. Check `forge` installation and version when local command behavior matters.
3. For installation guidance, verify the current PHP requirement against live docs and `laravel/forge-cli` `composer.json`.
   Do not hardcode stale version requirements.
4. Confirm authentication before commands that call Forge: `forge login`, `forge login --token=...`, or `FORGE_API_TOKEN` in CI.
5. Confirm the active server with `forge server:current`; switch with `forge server:switch` before site or resource commands when needed.
6. Prefer site names, server names, and command options over interactive prompts in automation or CI.
7. Treat Forge API tokens, environment files, deployment output, logs, and remote command output as sensitive.
8. Use the direct CLI command before reaching for the Forge API or dashboard.

## References

- **Command matrix**: read [references/commands.md](references/commands.md) when choosing exact commands or options.
- **Auth and server context**: read [references/authentication-and-context.md](references/authentication-and-context.md) for installation, tokens, CI auth, and server switching.
- **Sites and deployments**: read [references/deployments-and-sites.md](references/deployments-and-sites.md) for deploys, logs, env files, site commands, Tinker, and Forge pages.
- **Resources and SSH**: read [references/resources-and-ssh.md](references/resources-and-ssh.md) for SSH, daemon/database/nginx/php status, logs, restarts, and database shells.
