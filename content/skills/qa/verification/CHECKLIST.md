# Verification Checklist

Repo-root `CHECKLIST.md` is a plain command list:

```text
# app
bun run check

# api
composer verify
```

- Put one stable, runnable project-wide verification command on each line.
- Use `#` comments for useful notes, conditional commands, or monorepo section labels.
- Prefer a tool's built-in parallel form.
- Include every required verification category, not only tests and lint.
- Include builds only when the project treats them as part of its verification gate.
- Replace every example with commands confirmed from the project and installed tool help.
