---
name: monorepo-makefile
description: "Create a root Makefile that forwards commands to subprojects. Use when the user wants to run repo commands from the monorepo root."
---

# Monorepo Makefile

Add a root Makefile that forwards full commands into subproject directories and exposes predictable check targets.

## Core Pattern

```makefile
ifeq (frontend,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
endif

frontend:
	@cd frontend && $(ARGS)

ifneq ($(firstword $(MAKECMDGOALS)),frontend)
%:
	$(error Unknown target '$@'. Use: make frontend <full-command>)
endif

ifeq ($(firstword $(MAKECMDGOALS)),frontend)
%:
	@:
endif
```

Duplicate the pattern for each subproject target.

## Required Additions

For each repo target `<repo>`:

- Add tool-specific checks such as `<repo>-eslint`, `<repo>-prettier`, `<repo>-phpstan`, `<repo>-test`
- Add `<repo>-check` that runs all of that repo’s checks

At root:

- Add `check` that depends on all `<repo>-check` targets
- Update docs to prefer `make <repo> <full-command>` and `make check`

## Rules

- Match target names to folder names or documented aliases.
- Pass the full command through unchanged.
- Fail unknown targets with a usage hint.
- Test the forwarding with harmless commands before finishing.
