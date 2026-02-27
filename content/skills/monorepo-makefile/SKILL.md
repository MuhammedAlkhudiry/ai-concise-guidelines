---
name: monorepo-makefile
description: "Set up a root Makefile that forwards commands to monorepo subprojects. Use when user says 'run from root', 'makefile forwarding', 'monorepo commands', or wants to avoid cd-ing into subdirectories to run commands."
---

# Monorepo Makefile

Set up a root Makefile that forwards full commands to subproject directories.
Avoid calling primary CLIs from the root; pass the entire command in the make target invocation.

## Pattern

```makefile
# --- Arg capture (one block per target) ---
ifeq (<target>,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
endif

# --- Forwarding targets ---
<target>:
	@cd <subdir> && $(ARGS)

# --- Error on unknown targets ---
ifneq ($(firstword $(MAKECMDGOALS)),<target>)
%:
	$(error Unknown target '$@'. Use: make <target> <full-command>)
endif

# --- Silently swallow extra args for valid targets ---
ifeq ($(firstword $(MAKECMDGOALS)),<target>)
%:
	@:
endif
```

- `ARGS` captures everything after the target name.
- The forwarded call is the full command, e.g. `npm run start`.
- Unknown targets should fail with a usage hint.
- Keep one `ifeq` pair per forwarding target.

## Setup

1. **Identify subprojects** — list each subdirectory and the command context.
2. **Create root Makefile** with one forwarding target per subproject using the exact folder name.
3. **Add check targets per repo** — for every subproject target `<repo>`, add tool-specific check commands.
   Examples (not exhaustive): `make <repo>-prettier`, `make <repo>-eslint`, `make <repo>-phpstan`, `make <repo>-test`, and aggregate `make <repo>-check`.
4. **Add root aggregate check target** — add `make check` that depends on all `<repo>-check` targets.
5. **Update docs** (AGENTS.md, README) to use `make <target> <full-command>` and the new check targets.

## Example: Full-command forwarding

```makefile
ifeq (frontend,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
endif

ifeq (backend,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
endif

frontend:
	@cd frontend && $(ARGS)

backend:
	@cd backend && $(ARGS)

# Error on unknown targets
ifneq ($(firstword $(MAKECMDGOALS)),frontend)
ifneq ($(firstword $(MAKECMDGOALS)),backend)
%:
	$(error Unknown target '$@'. Use: make frontend <full-command> or make backend <full-command>)
endif
endif

# Silently swallow extra args for valid targets
ifeq ($(firstword $(MAKECMDGOALS)),frontend)
%:
	@:
endif

ifeq ($(firstword $(MAKECMDGOALS)),backend)
%:
	@:
endif
```

Usage:
```bash
make frontend npm run start          # cd frontend && npm run start
make frontend npm run lint           # cd frontend && npm run lint
make frontend npm run build:prod     # colons in args work
make backend python -m pytest        # cd backend && python -m pytest
make backend ls                      # cd backend && ls
```

## Per-Repo Check Targets

Add explicit check targets per repo so agents run checks without rediscovering project scripts.

```makefile
frontend-eslint:
	@$(MAKE) frontend npm run lint

frontend-prettier:
	@$(MAKE) frontend npm run format:check

frontend-tsc:
	@$(MAKE) frontend npm run typecheck

frontend-test:
	@$(MAKE) frontend npm run test

frontend-check: frontend-eslint frontend-prettier frontend-tsc frontend-test

backend-phpcs:
	@$(MAKE) backend composer run lint

backend-php-cs-fixer:
	@$(MAKE) backend composer run format:check

backend-phpstan:
	@$(MAKE) backend composer run analyse

backend-test:
	@$(MAKE) backend composer run test

backend-check: backend-phpcs backend-php-cs-fixer backend-phpstan backend-test

check: frontend-check backend-check
```

- Target names above are examples, not a fixed list.
- Name targets by tool where possible (`<repo>-prettier`, `<repo>-eslint`, `<repo>-phpstan`, etc.).
- Ensure each repo's target set covers `check-and-fix` categories: typecheck/analysis, lint, format, tests.
- `check` is the root entrypoint that runs all repos.

## Other Folder Examples

```makefile
packages/web:
	@cd packages/web && $(ARGS)

services:
	@cd services && $(ARGS)

crates/core:
	@cd crates/core && $(ARGS)

ml-service:
	@cd ml-service && $(ARGS)
```

## Rules

- **One target per subproject** — target must match the folder path exactly (for example `frontend`, `backend`, `packages/web`).
- **`@` prefix** — suppresses Make echoing commands.
- **Error on unknown targets** — provide `make <target> <full-command>` usage.
- **Colons in args work** — `make frontend npm run build:ios:dev`.
- **Check commands per repo** — add tool-specific targets like `<repo>-prettier`, `<repo>-eslint`, `<repo>-phpstan`, `<repo>-test`, plus `<repo>-check`.
- **Root check command** — add `check` target that depends on all `<repo>-check`.
- **Test after creating** — run `make frontend pwd` or another harmless command.
- **Update docs** — replace `cd <subdir> && <command>` with `make <folder-name> <full-command>`, and document `make check` plus per-repo check targets.
