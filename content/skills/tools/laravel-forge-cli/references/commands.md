# Command Matrix

Use these commands for the official Laravel Forge CLI. Prefer explicit arguments in scripts and CI so the CLI does not prompt.

## Auth

- `forge login`
- `forge login --token=your-api-token`
- `forge logout`

## Server Context

- `forge server:current`
- `forge server:list`
- `forge server:switch`
- `forge server:switch staging`

Most site and resource commands operate on the current server.

## Sites

- `forge site:list`
- `forge open`
- `forge open example.com`
- `forge deploy`
- `forge deploy example.com`
- `forge deploy:logs`
- `forge deploy:logs example.com`
- `forge site:logs`
- `forge site:logs --follow`
- `forge site:logs example.com`
- `forge site:logs example.com --follow`
- `forge env:pull`
- `forge env:pull example.com`
- `forge env:pull example.com .env`
- `forge env:push`
- `forge env:push example.com`
- `forge env:push example.com .env`
- `forge command`
- `forge command example.com`
- `forge command example.com --command="php artisan inspire"`
- `forge tinker`
- `forge tinker example.com`

## SSH

- `forge ssh`
- `forge ssh server-name`
- `forge ssh server-name --user=ubuntu`
- `forge ssh:test`
- `forge ssh:test --key=/path/to/private/key`
- `forge ssh:configure`
- `forge ssh:configure --key=/path/to/public/key.pub --name=sallys-macbook`
- `forge ssh:configure --key=/path/to/public/key.pub --name=sallys-macbook --user=forge`

## Resources

- `forge daemon:list`
- `forge daemon:status`
- `forge daemon:status daemon-id`
- `forge daemon:logs`
- `forge daemon:logs daemon-id`
- `forge daemon:logs daemon-id --follow`
- `forge daemon:restart`
- `forge daemon:restart daemon-id`
- `forge database:status`
- `forge database:logs`
- `forge database:restart`
- `forge database:shell`
- `forge database:shell database-name`
- `forge database:shell database-name --user=database-user`
- `forge nginx:status`
- `forge nginx:logs`
- `forge nginx:logs access`
- `forge nginx:restart`
- `forge php:status`
- `forge php:status 8.3`
- `forge php:logs`
- `forge php:logs 8.3`
- `forge php:restart`
- `forge php:restart 8.3`

## Source Checks

When command behavior is uncertain, check the current CLI source:

- Official repo: `https://github.com/laravel/forge-cli`
- Live docs: `https://forge.laravel.com/docs/cli`
- Docs index: `https://forge.laravel.com/docs/llms.txt`
