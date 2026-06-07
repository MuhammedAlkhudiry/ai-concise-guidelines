# Resources And SSH

## SSH

Test SSH access:

```bash
forge ssh:test
forge ssh:test --key=/path/to/private/key
```

Configure SSH key authentication:

```bash
forge ssh:configure
forge ssh:configure --key=/path/to/public/key.pub --name=sallys-macbook
forge ssh:configure --key=/path/to/public/key.pub --name=sallys-macbook --user=forge
```

Start an SSH session:

```bash
forge ssh
forge ssh server-name
forge ssh server-name --user=ubuntu
```

Prefer `ssh:test` before diagnosing log, shell, or resource commands that depend on SSH access.

## Daemons

```bash
forge daemon:list
forge daemon:status
forge daemon:status daemon-id
forge daemon:logs
forge daemon:logs daemon-id
forge daemon:logs daemon-id --follow
forge daemon:restart
forge daemon:restart daemon-id
```

Use daemon IDs from `daemon:list` when multiple daemons exist.

## Database

```bash
forge database:status
forge database:logs
forge database:restart
forge database:shell
forge database:shell database-name
forge database:shell database-name --user=database-user
```

`database:shell` opens a local shell connection to the selected remote database. Confirm the current server before opening a shell or restarting the database.

## Nginx

```bash
forge nginx:status
forge nginx:logs
forge nginx:logs access
forge nginx:restart
```

Default Nginx logs are error logs. Pass `access` for access logs.

## PHP

```bash
forge php:status
forge php:status 8.3
forge php:logs
forge php:logs 8.3
forge php:restart
forge php:restart 8.3
```

Omit the version to target the server's default PHP version. Pass a version when diagnosing or restarting a specific installed PHP runtime.
