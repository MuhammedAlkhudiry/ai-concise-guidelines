# Deployments And Sites

## Site Selection

List sites on the current server:

```bash
forge site:list
```

Most site commands accept an optional site name. Pass it explicitly when more than one site exists or when running non-interactively.

## Deployments

Trigger a deployment:

```bash
forge deploy
forge deploy example.com
```

The deploy command waits for deployment output and fails when Forge reports a failed deployment.

Review deployment logs:

```bash
forge deploy:logs
forge deploy:logs example.com
```

Use the Forge CLI in CI when deployment output or follow-up CLI actions are needed. CI needs `FORGE_API_TOKEN` and SSH access to the server.

## Environment Files

Pull environment variables:

```bash
forge env:pull
forge env:pull example.com
forge env:pull example.com .env
```

Push environment variables:

```bash
forge env:push
forge env:push example.com
forge env:push example.com .env
```

Treat pulled env files as secrets. If the app uses config caching or queue workers, redeploy or restart the relevant processes so new values are used.

## Logs

View site logs:

```bash
forge site:logs
forge site:logs --follow
forge site:logs example.com
forge site:logs example.com --follow
```

Use `--follow` only when live tailing is needed; it keeps the command running.

## Remote Site Commands

Run a command from the site's root directory:

```bash
forge command
forge command example.com
forge command example.com --command="php artisan inspire"
```

Use `--command` for automation. Commands run remotely and output may contain sensitive application data.

## Tinker

Open a remote Laravel Tinker session:

```bash
forge tinker
forge tinker example.com
```

Use Tinker only when interactive remote evaluation is appropriate. Prefer direct CLI commands for repeatable operations.

## Open Forge Site

Open the Forge dashboard page for a site:

```bash
forge open
forge open example.com
```
