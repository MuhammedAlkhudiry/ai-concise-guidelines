---
name: opencode
description: Use when the user explicitly wants OpenCode CLI to handle a task, especially for non-interactive prompts, editing files in another repo, or forcing a specific provider/model through `opencode run`.
---

# OpenCode

Use the local `opencode` CLI when the user asks to use OpenCode directly instead of doing the work yourself.

## Workflow

1. Confirm the CLI exists with `which opencode`.
2. Check available credentials with `opencode providers list` if model access is relevant.
3. Prefer `opencode run` for one-shot requests.
4. Run the command from the target repo root, or pass `--dir` for another repo.
5. Verify the result yourself with local checks such as `git diff`, `git status --short`, and targeted file reads.

## Commands

- Minimal request:

```bash
opencode run 'Reply with exactly: pong'
```

- Force a specific model:

```bash
opencode run -m provider/model 'Reply with exactly: pong'
```

- Example with an explicit model:

```bash
opencode run -m provider/model 'Reply with exactly: pong'
```

- Edit files in the current repo:

```bash
opencode run -m provider/model 'Edit README.md only. Add one short sentence after the install section. Keep the rest of the file unchanged.'
```

- Run in another repo without changing directories:

```bash
opencode run -m provider/model --dir /absolute/path/to/repo 'Update the requested file only, then stop.'
```

## Prompting Rules

- Scope the change tightly. Name the exact file and say `only` when appropriate.
- State placement clearly, such as `add this sentence after ...`.
- Tell it what must stay unchanged.
- Prefer simple shell quoting. Use single quotes around the prompt when possible.

## Verification Rules

- Do not trust the model summary alone.
- Always inspect the changed file directly.
- Always check the diff after an edit.
- If the request was supposed to be read-only, confirm there is no diff.

## Troubleshooting

- If plain `opencode run` hits provider auth or refresh errors, retry with an explicit model.
- If credentials are missing or expired, use `opencode providers login` or `opencode providers list` to inspect the current state.
