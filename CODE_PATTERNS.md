# CODE_PATTERNS

Project-specific code patterns for `ai-concise-guidelines`.

This file documents how code is written in this repository only. Do not reuse these templates as universal patterns for unrelated projects.

## Core Rules

- Source of truth lives in `content/` and `config/`.
- Generated files in `output/` are never edited directly.
- Keep scripts explicit and deterministic (`src/generate.ts`, `src/init.ts`).
- Coverage is open-ended: add every recurring local file type, not only common examples.

## Markdown Files

### Skill File (`content/skills/<name>/SKILL.md`)

````markdown
---
name: skill-name
description: "When to use this skill."
---

# Skill Title

## Purpose
Short explanation.

## Process
### Step 1: ...
### Step 2: ...

## Rules
- Actionable, concise rule.
````

Notes:
- Always include YAML frontmatter with `name` and `description`.
- Keep instructions procedural, not essay-style.
- Use headings for scanability and deterministic structure.

### Global Rules File (`content/base-rules.md`)

```markdown
## Critical Rules
- Rule with constraint and action.

## Project Documents
| Document | Purpose | What it contains |
|----------|---------|------------------|
```

Notes:
- Rules are short, imperative, and enforceable.
- Keep cross-project conventions here, not project business logic.
- Use tables when structure improves readability.

## TypeScript Files

### Config Module (`config/*.ts`)

```ts
export interface ExampleConfig {
  key: string;
}

export const EXAMPLE_CONFIG: Record<string, ExampleConfig> = {
  item: { key: "value" },
};
```

Notes:
- Keep config typed and exported as constants.
- Prefer single source-of-truth objects over duplicated values.
- Avoid runtime side effects in config modules.

### Script Entrypoint (`src/*.ts`)

```ts
#!/usr/bin/env bun

import { existsSync } from "fs";

async function main() {
  if (!existsSync("content")) {
    throw new Error("content directory not found");
  }
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
```

Notes:
- Use clear sections and helper functions for large scripts.
- Exit non-zero on failures with direct error messages.
- Keep orchestration in `main()` and logic in named functions.

### Utility Module (`src/fs.ts` style)

```ts
export function ensureDirSync(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}
```

Notes:
- Utilities stay focused and reusable.
- Keep sync/async variants explicit when both are needed.
- Use strict types and simple function contracts.

## Shell Files

### Zsh Custom Config (`shell/zsh-custom.zsh`)

```zsh
alias test="a test --parallel --stop-on-failure"

dev() {
    if [[ -f "package.json" ]]; then
        npm run dev
        return 0
    fi
    echo "No package.json found in $(pwd)"
    return 1
}
```

Notes:
- Functions must handle failure paths explicitly.
- Keep aliases/functions practical and workflow-focused.
- Add usage comments only when behavior is non-obvious.

## Generated Output

### Generated Files (`output/**`)

```md
# Managed by ai-concise-guidelines. Do not edit by hand.
```

Notes:
- Treat generated output as build artifacts.
- Make source changes under `content/`, `config/`, `src/`, then run `make install`.
- Keep generated content deterministic from source files.

## Scope Boundary

- This repository does not define app-layer patterns like `Controller`, `Model`, `Resource`, `Service`, `Action`, `Job`, or `page.tsx`.
- Those must be defined per target project in that project’s own `CODE_PATTERNS.md`.
