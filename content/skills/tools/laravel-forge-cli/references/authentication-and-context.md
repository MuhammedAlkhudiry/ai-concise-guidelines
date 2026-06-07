# Authentication And Context

## Installation

The official install command is:

```bash
composer global require laravel/forge-cli
```

Before advising a PHP version requirement, verify the current live docs and the current `laravel/forge-cli` `composer.json`. If they differ, state the mismatch and prefer the package metadata for what Composer will enforce.

## Authentication

Forge CLI needs a Forge API token for API-backed commands.

Use one of:

```bash
forge login
forge login --token=your-api-token
```

For CI, set:

```bash
FORGE_API_TOKEN=your-api-token
```

Do not print, commit, or echo real tokens. In written examples, use placeholders.

## Server Context

Most site and resource commands run against the active server.

Check it first:

```bash
forge server:current
```

List and switch when needed:

```bash
forge server:list
forge server:switch
forge server:switch staging
```

If a command unexpectedly targets the wrong site or resource, verify the active server before debugging the command itself.

## Automation

Use explicit names and options in scripts:

```bash
forge server:switch production
forge deploy example.com
```

Avoid interactive prompts in CI. Prefer `FORGE_API_TOKEN` over `forge login --token=...` in CI logs and workflow files.
