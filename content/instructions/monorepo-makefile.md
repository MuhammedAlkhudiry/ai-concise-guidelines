# Monorepo Makefile

Set up a root Makefile that forwards arbitrary commands to subproject directories. Eliminates `cd` into subdirectories.

## Pattern

```makefile
# --- Arg capture (one block per target) ---
ifeq (<target>,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
endif

# --- Forwarding targets ---
<target>:
	@cd <subdir> && <tool> $(ARGS)

# --- Error on unknown targets ---
ifneq ($(firstword $(MAKECMDGOALS)),<target>)
%:
	$(error Unknown target '$@'. Use: make <target> <command>)
endif

# --- Silently swallow extra args for valid targets ---
ifeq ($(firstword $(MAKECMDGOALS)),<target>)
%:
	@:
endif
```

- `ARGS` captures everything after the target name
- `%:` catch-all silently swallows extra args for valid forwarding targets
- Unknown targets (e.g., `make foo`) error with usage hint
- One `ifeq` block per forwarding target for both arg capture and catch-all

## Setup

1. **Identify subprojects** — list each subdirectory and its primary CLI tool (bun, npm, pnpm, ddev, docker, cargo, etc.)
2. **Create root Makefile** with one forwarding target per subproject
3. **Update project docs** (AGENTS.md, README) to use `make <target> <command>` syntax

## Example: Bun + DDEV Monorepo

```makefile
ifeq (app,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
endif

ifeq (api,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
endif

app:
	@cd frontend && bun $(ARGS)

api:
	@cd backend && ddev $(ARGS)

# Error on unknown targets
ifneq ($(firstword $(MAKECMDGOALS)),app)
ifneq ($(firstword $(MAKECMDGOALS)),api)
%:
	$(error Unknown target '$@'. Use: make app <command> or make api <command>)
endif
endif

# Silently swallow extra args for valid targets
ifeq ($(firstword $(MAKECMDGOALS)),app)
%:
	@:
endif

ifeq ($(firstword $(MAKECMDGOALS)),api)
%:
	@:
endif
```

Usage:
```bash
make app start              # cd frontend && bun start
make app run lint           # cd frontend && bun run lint
make app run build:preview  # colons in args work fine
make app test               # cd frontend && bun test
make api exec vendor/bin/pest   # cd backend && ddev exec vendor/bin/pest
make api composer dev       # cd backend && ddev composer dev
```

## Other Tool Combinations

```makefile
# npm monorepo
web:
	@cd packages/web && npm $(ARGS)

# Docker Compose
svc:
	@cd services && docker compose $(ARGS)

# Cargo workspace
core:
	@cd crates/core && cargo $(ARGS)

# Python
ml:
	@cd ml-service && python $(ARGS)
```

## Rules

- **One target per subproject** — short names: `app`, `api`, `web`, `svc`
- **`@` prefix** — suppresses Make echoing the command itself
- **Error on unknown targets** — use nested `ifneq` to error, `ifeq` to silently swallow args for valid targets
- **Colons in args work** — `make app run build:ios:dev` forwards correctly
- **Test after creating** — run a harmless command like `make app --version` to verify
- **Update docs** — replace raw `cd subdir && tool` commands with `make <target>` equivalents
